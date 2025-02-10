/*
  # Add is_custom column to workouts table

  1. Changes
    - Add `is_custom` column to `workouts` table with default value of false
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workouts' AND column_name = 'is_custom'
  ) THEN
    ALTER TABLE workouts ADD COLUMN is_custom boolean DEFAULT false;
  END IF;
END $$;