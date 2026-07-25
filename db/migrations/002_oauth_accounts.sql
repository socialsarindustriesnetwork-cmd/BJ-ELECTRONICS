ALTER TABLE auth_users
  ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE auth_users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS auth_accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  provider VARCHAR(24) NOT NULL CHECK (provider IN ('GOOGLE', 'FACEBOOK')),
  provider_account_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(254),
  provider_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS auth_accounts_user_id_idx
  ON auth_accounts(user_id);

CREATE INDEX IF NOT EXISTS auth_accounts_provider_email_idx
  ON auth_accounts(provider, LOWER(provider_email));

CREATE INDEX IF NOT EXISTS auth_users_email_verified_idx
  ON auth_users(email_verified_at)
  WHERE email_verified_at IS NOT NULL;
