package tn.esprit.jungle.gestioncours.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecommendationLogSchemaInitializer {

    private static final String TABLE = "recommendation_request_log";

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    void ensureSchema() {
        createTableIfMissing();
        ensureColumn("user_id", "BIGINT NULL");
        ensureColumn("course_ids_csv", "VARCHAR(1000) NULL");
        ensureColumn("top_k", "INT NULL");
        ensureColumn("prior_score", "DOUBLE NULL");
        ensureColumn("time_spent_min", "INT NULL");
        ensureColumn("completion_rate_pct", "DOUBLE NULL");
        ensureColumn("resources_consulted_count", "INT NULL");
        ensureColumn("explicit_rating", "INT NULL");
        ensureColumn("difficulty_level", "VARCHAR(100) NULL");
        ensureColumn("learning_style", "VARCHAR(100) NULL");
        ensureColumn("subject_name", "VARCHAR(150) NULL");
        log.info("Recommendation log schema ready: {}", TABLE);
    }

    private void createTableIfMissing() {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS recommendation_request_log (
                    id BIGINT NOT NULL AUTO_INCREMENT,
                    request_json LONGTEXT NOT NULL,
                    response_json LONGTEXT NULL,
                    http_status INT NULL,
                    success BIT(1) NOT NULL,
                    error_message VARCHAR(1000) NULL,
                    created_at DATETIME(6) NOT NULL,
                    PRIMARY KEY (id)
                )
                """);
    }

    private void ensureColumn(String columnName, String ddlType) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                  AND column_name = ?
                """,
                Integer.class,
                TABLE,
                columnName
        );

        if (count != null && count == 0) {
            jdbcTemplate.execute("ALTER TABLE " + TABLE + " ADD COLUMN " + columnName + " " + ddlType);
            log.info("Added missing column {}.{}", TABLE, columnName);
        }
    }
}
