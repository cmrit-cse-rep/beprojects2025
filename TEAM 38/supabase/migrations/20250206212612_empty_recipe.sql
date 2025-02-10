/*
  # Add Workout History

  1. New Tables
    - `workout_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `workout_id` (uuid, references workouts)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `duration_seconds` (integer)
      - `exercises` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `workout_history` table
    - Add policies for authenticated users to manage their own history
*/

-- Create workout history table
CREATE TABLE IF NOT EXISTS workout_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  workout_id uuid REFERENCES workouts(id) NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL,
  duration_seconds integer NOT NULL,
  exercises jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can read own workout history"
  ON workout_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout history"
  ON workout_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout history"
  ON workout_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout history"
  ON workout_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);