/*
  # Update workout history to remove workout dependency

  1. Changes
    - Remove foreign key constraint from workout_history to workouts
    - Add exercises column to store workout snapshot
    
  This allows deleting workouts without affecting history records
*/

-- First drop the foreign key constraint
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_history_workout_id_fkey'
    AND table_name = 'workout_history'
  ) THEN
    ALTER TABLE workout_history DROP CONSTRAINT workout_history_workout_id_fkey;
  END IF;
END $$;

-- Make workout_id nullable since it might not exist anymore
ALTER TABLE workout_history ALTER COLUMN workout_id DROP NOT NULL;