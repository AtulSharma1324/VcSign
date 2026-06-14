import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import { query } from "../../../shared/src/database/connection";
import {
  generateTokens,
  verifyRefreshToken,
} from "../../../shared/src/middleware/auth";
import { asyncHandler } from "../../../shared/src/middleware/errorHandler";
import { redis, cacheSet, cacheDel } from "../../../shared/src/redis/client";

// ===========================
// Auth Controller
// ===========================

function getOAuth2Client(req: Request): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const host = req.get("host");
  
  // We explicitly ignore process.env.GOOGLE_CALLBACK_URL to prevent
  // accidental misconfiguration where the frontend URL is provided instead.
  const redirectUri = `${proto}://${host}/api/auth/oauth/google/callback`;

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  displayName: Joi.string().min(1).max(100).required(),
  userType: Joi.string()
    .valid("deaf", "hearing", "both")
    .default("both"),
}).options({ stripUnknown: true });

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).options({ stripUnknown: true });

export class AuthController {
  /** POST /api/auth/register */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const { email, password, displayName, userType } = value;

    // Check if user exists
    const existing = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await query<{
      id: string;
      email: string;
      display_name: string;
      avatar_url: string | null;
      user_type: string;
      preferred_lang: string;
      sign_language: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
    }>(
      `INSERT INTO users (email, password_hash, display_name, user_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, display_name, avatar_url, user_type,
                 preferred_lang, sign_language, is_verified, created_at, updated_at`,
      [email, passwordHash, displayName, userType]
    );

    const user = result.rows[0];

    // Create default preferences
    await query(
      "INSERT INTO user_preferences (user_id) VALUES ($1)",
      [user.id]
    );

    // Generate tokens
    const tokens = generateTokens({ userId: user.id, email: user.email });

    // Store refresh token in Redis (whitelist)
    await cacheSet(`refresh:${user.id}`, tokens.refreshToken, 7 * 24 * 3600);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        userType: user.user_type,
        preferredLang: user.preferred_lang,
        signLanguage: user.sign_language,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  });

  /** POST /api/auth/login */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const { email, password } = value;

    const result = await query<{
      id: string;
      email: string;
      password_hash: string;
      display_name: string;
      avatar_url: string | null;
      user_type: string;
      preferred_lang: string;
      sign_language: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, email, password_hash, display_name, avatar_url, user_type,
              preferred_lang, sign_language, is_verified, created_at, updated_at
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const tokens = generateTokens({ userId: user.id, email: user.email });
    await cacheSet(`refresh:${user.id}`, tokens.refreshToken, 7 * 24 * 3600);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        userType: user.user_type,
        preferredLang: user.preferred_lang,
        signLanguage: user.sign_language,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  });

  /** POST /api/auth/refresh */
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken);

      // Check if this refresh token is still valid (whitelist check)
      const stored = await redis.get(`refresh:${payload.userId}`);
      if (stored !== refreshToken) {
        res.status(401).json({ message: "Refresh token has been revoked" });
        return;
      }

      const tokens = generateTokens({
        userId: payload.userId,
        email: payload.email,
      });

      await cacheSet(
        `refresh:${payload.userId}`,
        tokens.refreshToken,
        7 * 24 * 3600
      );

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch {
      res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  });

  /** POST /api/auth/logout */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await cacheDel(`refresh:${payload.userId}`);
      } catch {
        // Token already invalid, which is fine
      }
    }
    res.json({ message: "Logged out successfully" });
  });

  /** GET /api/auth/oauth/google */
  googleAuthRedirect = asyncHandler(async (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const frontendUrl = process.env.APP_URL || "http://localhost:3000";

    if (!clientId || !clientSecret) {
      console.error("[Auth Service] Google OAuth credentials are not configured in environment variables!");
      res.redirect(`${frontendUrl}/login?error=GoogleNotConfigured`);
      return;
    }

    const client = getOAuth2Client(req);
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "profile"],
      prompt: "consent",
    });
    res.redirect(url);
  });

  /** GET /api/auth/oauth/google/callback */
  googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const frontendUrl = process.env.APP_URL || "http://localhost:3000";

    if (!code) {
      res.redirect(`${frontendUrl}/login?error=OAuthFailed`);
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("[Auth Service] Google OAuth credentials are not configured in environment variables!");
      res.redirect(`${frontendUrl}/login?error=GoogleNotConfigured`);
      return;
    }

    try {
      const client = getOAuth2Client(req);
      const { tokens: googleTokens } = await client.getToken(code);
      client.setCredentials(googleTokens);

      const ticket = await client.verifyIdToken({
        idToken: googleTokens.id_token!,
        audience: clientId,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new Error("Invalid Google payload");
      }

      const email = payload.email;
      const displayName = payload.name || "Google User";
      const avatarUrl = payload.picture || null;
      const oauthId = payload.sub;

      // Check if user exists
      const existing = await query(
        `SELECT id, email, display_name, avatar_url, user_type,
                preferred_lang, sign_language, is_verified, oauth_provider, oauth_id, created_at, updated_at
         FROM users WHERE email = $1`,
        [email]
      );

      let user;

      if (existing.rows.length > 0) {
        user = existing.rows[0];
        // If they already exist but have no oauth_provider, we could link them, but we'll just log them in
        if (!user.oauth_provider) {
          await query("UPDATE users SET oauth_provider = 'google', oauth_id = $1 WHERE id = $2", [oauthId, user.id]);
        }
      } else {
        // Create new user with default type "both"
        const result = await query(
          `INSERT INTO users (email, display_name, avatar_url, oauth_provider, oauth_id, user_type, is_verified)
           VALUES ($1, $2, $3, 'google', $4, 'both', true)
           RETURNING id, email, display_name, avatar_url, user_type,
                     preferred_lang, sign_language, is_verified, created_at, updated_at`,
          [email, displayName, avatarUrl, oauthId]
        );
        user = result.rows[0];

        // Create default preferences
        await query("INSERT INTO user_preferences (user_id) VALUES ($1)", [user.id]);
      }

      // Generate our JWT tokens
      const appTokens = generateTokens({ userId: user.id, email: user.email });
      await cacheSet(`refresh:${user.id}`, appTokens.refreshToken, 7 * 24 * 3600);

      // Redirect to frontend with tokens in URL
      
      // Pass the user object as a URL-encoded string so frontend can hydrate state instantly
      const userStr = encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        userType: user.user_type,
        preferredLang: user.preferred_lang,
        signLanguage: user.sign_language,
        isVerified: user.is_verified,
      }));

      res.redirect(
        `${frontendUrl}/oauth-callback?accessToken=${appTokens.accessToken}&refreshToken=${appTokens.refreshToken}&user=${userStr}`
      );
    } catch (error) {
      console.error("Google OAuth Error:", error);
      res.redirect(`${frontendUrl}/login?error=OAuthFailed`);
    }
  });
}
