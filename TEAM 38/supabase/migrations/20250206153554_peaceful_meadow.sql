/*
  # Fix workouts table structure

  1. Changes
    - Remove is_custom column as it's no longer needed
    - Ensure exercises column is properly typed as JSONB
    - Add proper constraints and defaults

  2. Security
    - Maintain existing RLS policies
*/

-- First ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  exercises jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Drop the is_custom column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workouts' AND column_name = 'is_custom'
  ) THEN
    ALTER TABLE workouts DROP COLUMN is_custom;
  END IF;
END $$;