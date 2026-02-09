-- D1 schema for MakotoClub (stores/surveys)

DROP TABLE IF EXISTS store_stats;
DROP TABLE IF EXISTS survey_drafts;
DROP TABLE IF EXISTS surveys;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS page_view_counts;
DROP TABLE IF EXISTS page_view_counts_daily;
DROP TABLE IF EXISTS survey_helpful_votes;
DROP TABLE IF EXISTS survey_comments;

CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  branch_name TEXT,
  prefecture TEXT NOT NULL,
  area TEXT,
  industry TEXT NOT NULL,
  genre TEXT,
  cast_back TEXT,
  phone_number TEXT,
  email TEXT,
  line_url TEXT,
  twitter_url TEXT,
  bsky_url TEXT,
  women_recruitment_page_missing INTEGER NOT NULL DEFAULT 0,
  recruitment_urls TEXT,
  business_hours_open TEXT,
  business_hours_close TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE surveys (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_branch TEXT,
  store_prefecture TEXT NOT NULL,
  store_area TEXT,
  store_industry TEXT NOT NULL,
  industry_other TEXT,
  store_genre TEXT,
  visited_period TEXT NOT NULL,
  work_type TEXT NOT NULL,
  work_type_other TEXT,
  age INTEGER NOT NULL,
  spec_score REAL NOT NULL,
  wait_time_hours REAL NOT NULL,
  average_earning REAL NOT NULL,
  rating REAL NOT NULL,
  customer_comment TEXT,
  staff_comment TEXT,
  work_environment_comment TEXT,
  etc_comment TEXT,
  cast_back TEXT,
  email_address TEXT,
  image_urls TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE INDEX idx_surveys_store_id ON surveys(store_id);
CREATE INDEX idx_surveys_created_at ON surveys(created_at);

CREATE TABLE store_stats (
  store_id TEXT PRIMARY KEY,
  survey_count INTEGER NOT NULL,
  min_spec REAL NOT NULL,
  max_spec REAL NOT NULL,
  median_spec REAL NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  median_age REAL NOT NULL,
  avg_earning REAL NOT NULL,
  avg_rating REAL NOT NULL,
  avg_wait REAL NOT NULL,
  helpful_count INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE INDEX idx_store_stats_updated_at ON store_stats(updated_at);
CREATE TABLE survey_drafts (
  id TEXT PRIMARY KEY,
  store_id TEXT,
  store_name TEXT NOT NULL,
  store_branch TEXT,
  store_prefecture TEXT NOT NULL,
  store_area TEXT,
  store_industry TEXT NOT NULL,
  store_genre TEXT,
  visited_period TEXT NOT NULL,
  work_type TEXT NOT NULL,
  age INTEGER NOT NULL,
  spec_score REAL NOT NULL,
  wait_time_hours REAL NOT NULL,
  average_earning REAL NOT NULL,
  rating REAL NOT NULL,
  customer_comment TEXT,
  staff_comment TEXT,
  work_environment_comment TEXT,
  etc_comment TEXT,
  cast_back TEXT,
  email_address TEXT,
  image_urls TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_survey_drafts_created_at ON survey_drafts(created_at);

CREATE TABLE access_logs (
  id TEXT PRIMARY KEY,
  ip TEXT,
  user_agent TEXT,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  status INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_access_logs_created_at ON access_logs(created_at);

CREATE TABLE page_view_counts (
  path TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE page_view_counts_daily (
  path TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (path, date)
);

CREATE TABLE survey_helpful_votes (
  survey_id TEXT NOT NULL,
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (survey_id, voter_hash)
);

CREATE INDEX idx_survey_helpful_votes_created_at ON survey_helpful_votes(created_at);

CREATE TABLE survey_comments (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  parent_id TEXT,
  author_name TEXT,
  body TEXT NOT NULL,
  good_count INTEGER DEFAULT 0,
  bad_count INTEGER DEFAULT 0,
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX idx_survey_comments_survey_id ON survey_comments(survey_id);
CREATE INDEX idx_survey_comments_parent_id ON survey_comments(parent_id);
CREATE INDEX idx_survey_comments_created_at ON survey_comments(created_at);

CREATE TABLE survey_comment_votes (
  comment_id TEXT NOT NULL,
  voter_hash TEXT NOT NULL,
  vote_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (comment_id, voter_hash)
);

CREATE INDEX idx_survey_comment_votes_created_at ON survey_comment_votes(created_at);
