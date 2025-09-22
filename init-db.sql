-- Initialize the database with required tables and indexes
-- This script will run automatically when the PostgreSQL container starts

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_mode ON hackathons(mode);
CREATE INDEX IF NOT EXISTS idx_hackathons_created_at ON hackathons(created_at);
CREATE INDEX IF NOT EXISTS idx_hackathons_organizer_id ON hackathons(organizer_id);

CREATE INDEX IF NOT EXISTS idx_teams_hackathon_id ON teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at);

CREATE INDEX IF NOT EXISTS idx_submissions_hackathon_id ON submissions(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_hackathon_id ON activity_logs(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_hackathons_title_search ON hackathons USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_hackathons_problem_statement_search ON hackathons USING gin(to_tsvector('english', problem_statement));
CREATE INDEX IF NOT EXISTS idx_teams_name_search ON teams USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_submissions_title_search ON submissions USING gin(to_tsvector('english', title));

-- Insert initial data if needed
-- Note: This will only run on first initialization
DO $$
BEGIN
    -- You can add initial data here if needed
    -- For example, default admin users, hackathon templates, etc.
    RAISE NOTICE 'Database initialization completed successfully';
END $$;