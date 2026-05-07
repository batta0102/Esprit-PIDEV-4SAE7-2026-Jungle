CREATE TABLE IF NOT EXISTS recommendation_request_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    request_json LONGTEXT NOT NULL,
    user_id BIGINT NULL,
    course_ids_csv VARCHAR(1000) NULL,
    top_k INT NULL,
    prior_score DOUBLE NULL,
    time_spent_min INT NULL,
    completion_rate_pct DOUBLE NULL,
    resources_consulted_count INT NULL,
    explicit_rating INT NULL,
    difficulty_level VARCHAR(100) NULL,
    learning_style VARCHAR(100) NULL,
    subject_name VARCHAR(150) NULL,
    response_json LONGTEXT NULL,
    http_status INT NULL,
    success BIT(1) NOT NULL,
    error_message VARCHAR(1000) NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS user_id BIGINT NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS course_ids_csv VARCHAR(1000) NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS top_k INT NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS prior_score DOUBLE NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS time_spent_min INT NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS completion_rate_pct DOUBLE NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS resources_consulted_count INT NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS explicit_rating INT NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(100) NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS learning_style VARCHAR(100) NULL;
ALTER TABLE recommendation_request_log ADD COLUMN IF NOT EXISTS subject_name VARCHAR(150) NULL;
