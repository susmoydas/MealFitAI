-- Remove UNIQUE constraint from auth.email to allow duplicate leads
ALTER TABLE auth RENAME TO auth_old;

CREATE TABLE IF NOT EXISTS auth (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO auth (user_id, email, password_hash, created_at)
  SELECT user_id, email, password_hash, created_at FROM auth_old;

DROP TABLE auth_old;

CREATE INDEX IF NOT EXISTS idx_auth_email ON auth(email);
