-- Add group_name column to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS group_name TEXT;
