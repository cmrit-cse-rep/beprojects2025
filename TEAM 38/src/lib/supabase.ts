import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type UserProfile = {
  id: string;
  age: number;
  weight: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  equipment: string[];
  custom_equipment: string[];
  workout_frequency: number;
  injury_history: string;
  created_at: string;
};