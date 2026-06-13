-- ===========================
-- SignLang VC — Database Schema
-- ===========================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    user_type       VARCHAR(20) CHECK (user_type IN ('deaf', 'hearing', 'both')) DEFAULT 'both',
    preferred_lang  VARCHAR(10) DEFAULT 'en',
    sign_language   VARCHAR(10) DEFAULT 'ISL',
    is_verified     BOOLEAN DEFAULT FALSE,
    oauth_provider  VARCHAR(50),
    oauth_id        VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    caption_size    VARCHAR(10) DEFAULT 'medium',
    caption_font    VARCHAR(50) DEFAULT 'Inter',
    caption_position VARCHAR(20) DEFAULT 'bottom',
    dark_mode       BOOLEAN DEFAULT TRUE,
    tts_voice       VARCHAR(50) DEFAULT 'default',
    tts_speed       DECIMAL(3,2) DEFAULT 1.0,
    auto_record     BOOLEAN DEFAULT FALSE,
    emergency_mode  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nickname        VARCHAR(100),
    is_favorite     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, contact_user_id)
);

-- Calls
CREATE TABLE IF NOT EXISTS calls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         VARCHAR(100) UNIQUE NOT NULL,
    call_type       VARCHAR(10) CHECK (call_type IN ('one_on_one', 'group')) DEFAULT 'one_on_one',
    status          VARCHAR(20) CHECK (status IN ('ringing', 'active', 'ended', 'missed', 'declined')) DEFAULT 'ringing',
    initiated_by    UUID REFERENCES users(id),
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    duration_secs   INTEGER,
    recording_url   TEXT,
    recording_size  BIGINT,
    is_encrypted    BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Call Participants
CREATE TABLE IF NOT EXISTS call_participants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id         UUID REFERENCES calls(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    role            VARCHAR(20) CHECK (role IN ('host', 'participant')) DEFAULT 'participant',
    joined_at       TIMESTAMPTZ,
    left_at         TIMESTAMPTZ,
    is_muted        BOOLEAN DEFAULT FALSE,
    is_video_on     BOOLEAN DEFAULT TRUE,
    UNIQUE(call_id, user_id)
);

-- Captions
CREATE TABLE IF NOT EXISTS captions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id         UUID REFERENCES calls(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id),
    source_type     VARCHAR(20) CHECK (source_type IN ('sign_language', 'speech')) NOT NULL,
    raw_text        TEXT NOT NULL,
    corrected_text  TEXT,
    confidence      DECIMAL(5,4),
    language        VARCHAR(10) DEFAULT 'en',
    timestamp_ms    BIGINT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_captions_call_time ON captions(call_id, timestamp_ms);

-- Chat Messages
CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id         UUID REFERENCES calls(id) ON DELETE CASCADE,
    sender_id       UUID REFERENCES users(id),
    content         TEXT NOT NULL,
    message_type    VARCHAR(20) CHECK (message_type IN ('text', 'emoji', 'file', 'system')) DEFAULT 'text',
    file_url        TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting Summaries
CREATE TABLE IF NOT EXISTS meeting_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id         UUID REFERENCES calls(id) ON DELETE CASCADE,
    summary_text    TEXT NOT NULL,
    key_points      JSONB,
    action_items    JSONB,
    generated_by    VARCHAR(20) DEFAULT 'ai',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Sign Language Models
CREATE TABLE IF NOT EXISTS sign_models (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language        VARCHAR(10) NOT NULL,
    version         VARCHAR(20) NOT NULL,
    model_path      TEXT NOT NULL,
    accuracy        DECIMAL(5,2),
    vocab_size      INTEGER,
    is_active       BOOLEAN DEFAULT FALSE,
    trained_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(language, version)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_calls_room ON calls(room_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_messages_call ON messages(call_id, created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_call ON call_participants(call_id);
