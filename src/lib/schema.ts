// Additive initial migration, shared by local PostgreSQL and hosted PostgreSQL.
export const migration = `
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, username TEXT UNIQUE,
  password_hash TEXT, role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner','teacher','owner','admin'))
);
CREATE TABLE IF NOT EXISTS organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS memberships (
  user_id TEXT PRIMARY KEY REFERENCES app_users(id), organization_id TEXT NOT NULL REFERENCES organizations(id),
  assigned_teacher_id TEXT REFERENCES app_users(id)
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES app_users(id), expires_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS roadmaps (
  id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES app_users(id), intake JSONB NOT NULL,
  graph JSONB NOT NULL, marks JSONB NOT NULL DEFAULT '{}', version INTEGER NOT NULL DEFAULT 1,
  origin TEXT NOT NULL CHECK (origin IN ('manual','ai')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS roadmaps_owner ON roadmaps(owner_id);
CREATE TABLE IF NOT EXISTS revisions (
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id), version INTEGER NOT NULL,
  snapshot JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(roadmap_id,version)
);
CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY, roadmap_id TEXT NOT NULL REFERENCES roadmaps(id), learner_id TEXT NOT NULL REFERENCES app_users(id),
  milestone_id TEXT NOT NULL, body TEXT NOT NULL, url TEXT, status TEXT NOT NULL DEFAULT 'submitted',
  feedback TEXT, reviewer_id TEXT REFERENCES app_users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES app_users(id), teacher_id TEXT NOT NULL REFERENCES app_users(id),
  title TEXT NOT NULL, instructions TEXT NOT NULL, due_date DATE NOT NULL, completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY, actor_id TEXT REFERENCES app_users(id), action TEXT NOT NULL, resource_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS feature_flags (key TEXT PRIMARY KEY, enabled BOOLEAN NOT NULL);
INSERT INTO feature_flags(key,enabled) VALUES ('roadmap_generation',true),('solo_practice',true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS quotas (key TEXT PRIMARY KEY, count INTEGER NOT NULL, resets_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS advice (
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id), milestone_id TEXT NOT NULL, version INTEGER NOT NULL,
  content JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(roadmap_id,milestone_id,version)
);
CREATE TABLE IF NOT EXISTS advice_locks (
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id),milestone_id TEXT NOT NULL,version INTEGER NOT NULL,
  lease_id TEXT NOT NULL,expires_at TIMESTAMPTZ NOT NULL,PRIMARY KEY(roadmap_id,milestone_id,version)
);
CREATE TABLE IF NOT EXISTS practice_attempts (
  id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES app_users(id), question_ids JSONB NOT NULL,
  answers JSONB, result JSONB, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deadline TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS evidence_learner ON evidence(learner_id);
CREATE INDEX IF NOT EXISTS assignments_learner ON assignments(learner_id);
CREATE INDEX IF NOT EXISTS attempts_learner ON practice_attempts(learner_id);
CREATE TABLE IF NOT EXISTS roadmap_shares (
  token_hash TEXT PRIMARY KEY,roadmap_id TEXT NOT NULL REFERENCES roadmaps(id),owner_id TEXT NOT NULL REFERENCES app_users(id),
  snapshot JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),revoked BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE IF NOT EXISTS error_notebook (
  learner_id TEXT NOT NULL REFERENCES app_users(id),question_id TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',
  reviewed BOOLEAN NOT NULL DEFAULT FALSE,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(learner_id,question_id)
);
CREATE TABLE IF NOT EXISTS quiz_sets (
  id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES app_users(id),organization_id TEXT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,questions JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS quiz_rooms (
  id TEXT PRIMARY KEY,code TEXT NOT NULL UNIQUE,host_id TEXT NOT NULL REFERENCES app_users(id),organization_id TEXT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,questions JSONB NOT NULL,secret TEXT NOT NULL,question_seconds INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',starts_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS quiz_players (
  room_id TEXT NOT NULL REFERENCES quiz_rooms(id),user_id TEXT NOT NULL REFERENCES app_users(id),joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(room_id,user_id)
);
CREATE TABLE IF NOT EXISTS quiz_answers (
  room_id TEXT NOT NULL REFERENCES quiz_rooms(id),user_id TEXT NOT NULL REFERENCES app_users(id),question_index INTEGER NOT NULL,
  selected INTEGER NOT NULL,correct BOOLEAN NOT NULL,points INTEGER NOT NULL,elapsed_ms INTEGER NOT NULL,
  PRIMARY KEY(room_id,user_id,question_index)
);
INSERT INTO feature_flags(key,enabled) VALUES('classroom_quiz',true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,learner_id TEXT NOT NULL REFERENCES app_users(id),topic TEXT NOT NULL,
  participants JSONB NOT NULL,turns JSONB NOT NULL DEFAULT '[]',version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',feedback JSONB,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS discussions_learner ON discussions(learner_id);
INSERT INTO feature_flags(key,enabled) VALUES('discussion_practice',true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS self_quizzes (
  id TEXT PRIMARY KEY,learner_id TEXT NOT NULL REFERENCES app_users(id),roadmap_id TEXT REFERENCES roadmaps(id),
  roadmap_version INTEGER,mode TEXT NOT NULL,title TEXT NOT NULL,instructions TEXT NOT NULL,
  settings JSONB NOT NULL,scope JSONB NOT NULL,questions JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS self_quiz_attempts (
  id TEXT PRIMARY KEY,quiz_id TEXT NOT NULL REFERENCES self_quizzes(id),learner_id TEXT NOT NULL REFERENCES app_users(id),
  status TEXT NOT NULL DEFAULT 'started',version INTEGER NOT NULL DEFAULT 1,answers JSONB NOT NULL DEFAULT '{}',result JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),deadline TIMESTAMPTZ,submitted_at TIMESTAMPTZ,expired BOOLEAN NOT NULL DEFAULT FALSE,
  lease_id TEXT,lease_expires_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS self_quiz_notes (
  learner_id TEXT NOT NULL REFERENCES app_users(id),quiz_id TEXT NOT NULL REFERENCES self_quizzes(id),question_id TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',reviewed BOOLEAN NOT NULL DEFAULT FALSE,flag_reason TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(learner_id,quiz_id,question_id)
);
CREATE INDEX IF NOT EXISTS self_quizzes_learner ON self_quizzes(learner_id,created_at DESC);
CREATE INDEX IF NOT EXISTS self_attempts_learner ON self_quiz_attempts(learner_id,started_at DESC);
INSERT INTO feature_flags(key,enabled) VALUES('personal_quizzes',true) ON CONFLICT DO NOTHING;
`;
