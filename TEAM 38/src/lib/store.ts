import { create } from 'zustand';
import { OpenAI } from 'openai';
import { supabase } from './supabase';
import type { UserProfile } from './supabase';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  created_at: string;
  is_custom: boolean;
}

interface DatabaseExercise {
  id: string;
  name: string;
  muscle_group: string;
  description: string;
  equipment_needed: string[];
}

interface WorkoutHistory {
  id: string;
  workout_id: string;
  workout_name: string;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  exercises: any[];
  created_at: string;
}

interface AppState {
  user: any;
  profile: UserProfile | null;
  workouts: Workout[];
  exercises: DatabaseExercise[];
  messages: ChatMessage[];
  isLoading: boolean;
  isAuthenticated: boolean;
  workoutHistory: WorkoutHistory[];
  
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (profile: Omit<UserProfile, 'id' | 'created_at'>) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  sendMessage: (content: string) => Promise<void>;
  generateWorkouts: () => Promise<void>;
  saveWorkout: (workout: { name: string; exercises: Exercise[]; is_custom?: boolean }) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  deleteAllWorkouts: () => Promise<void>;
  fetchWorkouts: () => Promise<void>;
  completeWorkout: (workout: Workout, startTime: Date, completedSets: Record<string, boolean>) => Promise<void>;
  fetchWorkoutHistory: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  profile: null,
  workouts: [],
  exercises: [],
  messages: [],
  isLoading: false,
  isAuthenticated: false,
  workoutHistory: [],

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user, isAuthenticated: true });
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user, isAuthenticated: true });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, profile: null });
  },

  saveProfile: async (profileData) => {
    const { user } = get();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profileData,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
    set({ profile: { id: user.id, ...profileData, created_at: new Date().toISOString() } });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  sendMessage: async (content) => {
    set({ isLoading: true });
    
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    try {
      const { messages, workouts, profile } = get();
      get().addMessage({ role: 'user', content });

      // Get recent context
      const recentMessages = messages.slice(-5);
      const lastWorkout = workouts[0];

      // Create context string
      const workoutContext = lastWorkout 
        ? `Your last generated workout was: ${JSON.stringify(lastWorkout, null, 2)}`
        : 'No workouts have been generated yet.';

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a knowledgeable fitness trainer. Provide concise, accurate workout advice.
            The user's profile is: ${JSON.stringify(profile, null, 2)}
            ${workoutContext}
            
            Consider this context when providing advice. If the user mentions injuries or limitations,
            remember them for future workout generations.`
          },
          ...recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        ],
      });

      const assistantMessage = response.choices[0]?.message?.content;
      if (assistantMessage) {
        get().addMessage({ role: 'assistant', content: assistantMessage });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAllWorkouts: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // Only delete non-custom workouts
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('is_custom', false);

      if (error) throw error;

      // Update the workouts state to remove only non-custom workouts
      set((state) => ({
        workouts: state.workouts.filter(w => w.is_custom)
      }));
    } catch (error) {
      console.error('Error deleting workouts:', error);
      throw error;
    }
  },

  generateWorkouts: async () => {
    const { profile, messages, workouts } = get();
    if (!profile) return;

    set({ isLoading: true });
    
    try {
      await get().deleteAllWorkouts();

      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      // Get recent context from chat
      const recentMessages = messages.slice(-5);
      const recentWorkouts = workouts.slice(0, 3);

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional fitness trainer API that generates personalized workout plans.
            Consider the user's profile, chat history (especially any mentioned injuries/limitations),
            and previous workouts when creating new plans.
            
            Return ONLY a JSON array of workout objects with this format:
            [
              {
                "name": "string",
                "exercises": [
                  {
                    "name": "string",
                    "sets": number,
                    "reps": number,
                    "weight": number (optional)
                  }
                ]
              }
            ]`
          },
          ...recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: JSON.stringify({
              profile: {
                fitness_level: profile.fitness_level,
                goals: profile.goals,
                equipment: [...profile.equipment, ...(profile.custom_equipment || [])],
                workout_frequency: profile.workout_frequency,
                injury_history: profile.injury_history
              },
              chatContext: recentMessages.map(m => m.content).join('\n'),
              previousWorkouts: recentWorkouts
            })
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      let workoutPlan;
      try {
        const trimmedContent = content.trim();
        workoutPlan = JSON.parse(trimmedContent);
        if (!Array.isArray(workoutPlan)) {
          throw new Error('Response is not an array of workouts');
        }
      } catch (error) {
        console.error('Failed to parse workout plan:', error);
        throw new Error('Failed to generate valid workout plan');
      }

      // Save workouts sequentially to maintain order
      for (const workout of workoutPlan) {
        await get().saveWorkout({
          name: workout.name,
          exercises: workout.exercises,
          is_custom: false // Explicitly mark as not custom
        });
      }

      // Fetch updated workouts
      await get().fetchWorkouts();
    } catch (error) {
      console.error('Error generating workouts:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWorkouts: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ workouts: data });
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  },

  saveWorkout: async (workout) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workout.name,
          exercises: workout.exercises,
          is_custom: workout.is_custom ?? false
        });

      if (error) throw error;
      await get().fetchWorkouts();
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  },

  deleteWorkout: async (id) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },

  completeWorkout: async (workout, startTime, completedSets) => {
    const { user } = get();
    if (!user) return;

    const completedAt = new Date();
    const durationSeconds = Math.floor((completedAt.getTime() - startTime.getTime()) / 1000);

    try {
      const { error } = await supabase
        .from('workout_history')
        .insert({
          user_id: user.id,
          workout_id: workout.id,
          workout_name: workout.name,
          started_at: startTime.toISOString(),
          completed_at: completedAt.toISOString(),
          duration_seconds: durationSeconds,
          exercises: workout.exercises.map((exercise, exerciseIndex) => ({
            ...exercise,
            sets: exercise.setDetails?.map((set, setIndex) => ({
              ...set,
              completed: completedSets[`${exerciseIndex}-${setIndex}`] || false
            })) || Array(exercise.sets).fill(null).map((_, setIndex) => ({
              reps: exercise.reps,
              weight: exercise.weight,
              completed: completedSets[`${exerciseIndex}-${setIndex}`] || false
            }))
          }))
        });

      if (error) throw error;
      
      // Refresh workout history
      await get().fetchWorkoutHistory();
    } catch (error) {
      console.error('Error saving workout history:', error);
      throw error;
    }
  },

  fetchWorkoutHistory: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      set({ workoutHistory: data });
    } catch (error) {
      console.error('Error fetching workout history:', error);
      throw error;
    }
  },
}));