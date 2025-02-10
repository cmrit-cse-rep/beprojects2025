/*
  # Add workout name column to workout history

  1. Changes
    - Add `workout_name` column to `workout_history` table
    - Make it required (NOT NULL)
    - Add it after the `workout_id` column for logical ordering
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workout_history' AND column_name = 'workout_name'
  ) THEN
    ALTER TABLE workout_history ADD COLUMN workout_name text NOT NULL;
  END IF;
END $$;