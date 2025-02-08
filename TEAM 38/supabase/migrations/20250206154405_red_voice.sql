/*
  # Enhance profiles table with additional fields

  1. Changes
    - Add age column
    - Add weight column
    - Modify equipment field to handle custom input
*/

DO $$ 
BEGIN
  -- Add age column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'age'
  ) THEN
    ALTER TABLE profiles ADD COLUMN age integer CHECK (age >= 13 AND age <= 120);
  END IF;

  -- Add weight column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'weight'
  ) THEN
    ALTER TABLE profiles ADD COLUMN weight numeric(5,2) CHECK (weight > 0);
  END IF;

  -- Add custom_equipment column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'custom_equipment'
  ) THEN
    ALTER TABLE profiles ADD COLUMN custom_equipment text[];
  END IF;
END $$;