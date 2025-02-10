import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Dumbbell, RotateCcw, Trash2, Plus, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ExerciseSet {
  weight?: number;
  reps: number;
}

interface Exercise {
  name: string;
  sets: ExerciseSet[];
  muscleGroup?: string;
}

interface CustomWorkoutForm {
  name: string;
  exercises: Exercise[];
}

export function Dashboard() {
  const { workouts, generateWorkouts, deleteWorkout, isLoading, saveWorkout } = useAppStore();
  const navigate = useNavigate();
  const [showCustomWorkoutForm, setShowCustomWorkoutForm] = useState(false);
  const [customWorkoutForm, setCustomWorkoutForm] = useState<CustomWorkoutForm>({
    name: '',
    exercises: [{ 
      name: '', 
      sets: Array(3).fill({ reps: 10 })
    }],
  });
  const [exerciseFilters, setExerciseFilters] = useState<Record<number, string>>({
    0: 'All'
  });
  const [availableExercises, setAvailableExercises] = useState<Record<number, any[]>>({});

  const muscleGroups = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Legs',
    'Arms',
    'Core',
  ];

  React.useEffect(() => {
    // Fetch exercises for each exercise row based on its filter
    Object.entries(exerciseFilters).forEach(([index, muscleGroup]) => {
      fetchExercises(parseInt(index), muscleGroup);
    });
  }, [exerciseFilters]);

  const fetchExercises = async (index: number, muscleGroup: string) => {
    let query = supabase.from('exercises').select('*');
    
    if (muscleGroup !== 'All') {
      query = query.eq('muscle_group', muscleGroup);
    }

    const { data, error } = await query.order('muscle_group');
    if (error) {
      console.error('Error fetching exercises:', error);
    } else {
      setAvailableExercises(prev => ({
        ...prev,
        [index]: data
      }));
    }
  };

  const handleAddExercise = () => {
    const newIndex = customWorkoutForm.exercises.length;
    setExerciseFilters(prev => ({
      ...prev,
      [newIndex]: 'All'
    }));
    setCustomWorkoutForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { 
        name: '', 
        sets: Array(3).fill({ reps: 10 })
      }],
    }));
  };

  const handleRemoveExercise = (index: number) => {
    setCustomWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
    setExerciseFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[index];
      return newFilters;
    });
  };

  const handleExerciseChange = (exerciseIndex: number, field: keyof Exercise, value: any) => {
    setCustomWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? { ...exercise, [field]: value }
          : exercise
      ),
    }));
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => {
    setCustomWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? {
              ...exercise,
              sets: exercise.sets.map((set, j) =>
                j === setIndex
                  ? { ...set, [field]: value }
                  : set
              )
            }
          : exercise
      ),
    }));
  };

  const handleAddSet = (exerciseIndex: number) => {
    setCustomWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? {
              ...exercise,
              sets: [...exercise.sets, { reps: 10 }]
            }
          : exercise
      ),
    }));
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setCustomWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === exerciseIndex 
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, j) => j !== setIndex)
            }
          : exercise
      ),
    }));
  };

  // Split workouts into generated and custom
  const generatedWorkouts = workouts.filter(w => !w.is_custom);
  const customWorkouts = workouts.filter(w => w.is_custom);

  const handleSubmitCustomWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customWorkoutForm.exercises.some(e => !e.name)) {
      alert('Please select exercises for all entries');
      return;
    }

    // Transform the form data to match the expected format
    const formattedWorkout = {
      name: customWorkoutForm.name,
      exercises: customWorkoutForm.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets.length,
        reps: exercise.sets[0].reps, // Use the first set's reps as the base
        weight: exercise.sets[0].weight, // Use the first set's weight as the base
        setDetails: exercise.sets // Store detailed set information
      })),
      is_custom: true
    };

    await saveWorkout(formattedWorkout);
    setShowCustomWorkoutForm(false);
    setCustomWorkoutForm({
      name: '',
      exercises: [{ name: '', sets: Array(3).fill({ reps: 10 }) }]
    });
  };

  const handleSaveToCustom = async (workout: any) => {
    // Create a new workout object with is_custom set to true
    const customWorkout = {
      name: `${workout.name} (Custom)`,
      exercises: workout.exercises,
      is_custom: true
    };

    try {
      await saveWorkout(customWorkout);
    } catch (error) {
      console.error('Error saving to custom workouts:', error);
      alert('Failed to save workout to custom workouts');
    }
  };

  const renderWorkoutGrid = (workoutList: typeof workouts, isGenerated: boolean = false) => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {workoutList.map((workout) => (
        <div
          key={workout.id}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => navigate(`/workout/${workout.id}`)}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">{workout.name}</h3>
            <div className="flex gap-2">
              {isGenerated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveToCustom(workout);
                  }}
                  className="text-gray-400 hover:text-blue-500"
                  title="Save to Custom Workouts"
                >
                  <Save className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWorkout(workout.id);
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {workout.exercises.map((exercise, index) => (
              <li key={index} className="text-sm text-gray-600">
                {exercise.name} - {exercise.sets} x {exercise.reps}
                {exercise.weight && ` @ ${Math.round(exercise.weight * 0.453592)}kg`}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Generated Workouts Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Generated Workouts</h1>
          <button
            onClick={generateWorkouts}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Generate New Workouts
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Dumbbell className="w-12 h-12 mx-auto text-gray-400 animate-bounce" />
            <p className="mt-4 text-gray-600">Generating your personalized workouts...</p>
          </div>
        ) : generatedWorkouts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Dumbbell className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No generated workouts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by generating your first workout plan
            </p>
          </div>
        ) : (
          renderWorkoutGrid(generatedWorkouts, true)
        )}
      </div>

      {/* Custom Workouts Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Custom Workouts</h2>
          <button
            onClick={() => setShowCustomWorkoutForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Workout
          </button>
        </div>

        {customWorkouts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Plus className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No custom workouts</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your own workout plan using our exercise database
            </p>
          </div>
        ) : (
          renderWorkoutGrid(customWorkouts)
        )}

        {showCustomWorkoutForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Create Custom Workout</h3>
                <button
                  onClick={() => setShowCustomWorkoutForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitCustomWorkout} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Workout Name
                  </label>
                  <input
                    type="text"
                    value={customWorkoutForm.name}
                    onChange={(e) => setCustomWorkoutForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-6">
                  {customWorkoutForm.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-1/4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Muscle Group
                          </label>
                          <select
                            value={exerciseFilters[exerciseIndex]}
                            onChange={(e) => {
                              setExerciseFilters(prev => ({
                                ...prev,
                                [exerciseIndex]: e.target.value
                              }));
                            }}
                            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {muscleGroups.map((group) => (
                              <option key={group} value={group}>
                                {group}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exercise
                          </label>
                          <select
                            value={exercise.name}
                            onChange={(e) => handleExerciseChange(exerciseIndex, 'name', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select an exercise</option>
                            {availableExercises[exerciseIndex]?.map((ex) => (
                              <option key={ex.id} value={ex.name}>
                                {ex.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exerciseIndex)}
                          className="text-red-600 hover:text-red-700 mt-7"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-700">Sets</h4>
                          <button
                            type="button"
                            onClick={() => handleAddSet(exerciseIndex)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Set
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-[auto,1fr,1fr,auto] gap-2 items-center">
                          <div className="font-medium text-gray-500 text-sm px-2">Set</div>
                          <div className="font-medium text-gray-500 text-sm">Weight (kg)</div>
                          <div className="font-medium text-gray-500 text-sm">Reps</div>
                          <div></div>
                          
                          {exercise.sets.map((set, setIndex) => (
                            <React.Fragment key={setIndex}>
                              <div className="text-sm text-gray-600 px-2">{setIndex + 1}</div>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={set.weight ? Math.round(set.weight * 0.453592) : ''}
                                onChange={(e) => handleSetChange(
                                  exerciseIndex,
                                  setIndex,
                                  'weight',
                                  e.target.value ? parseFloat(e.target.value) / 0.453592 : undefined
                                )}
                                className="block w-full rounded-md border border-gray-300 py-1 px-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                placeholder="0"
                              />
                              <input
                                type="number"
                                min="1"
                                value={set.reps}
                                onChange={(e) => handleSetChange(
                                  exerciseIndex,
                                  setIndex,
                                  'reps',
                                  parseInt(e.target.value)
                                )}
                                className="block w-full rounded-md border border-gray-300 py-1 px-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                                className="text-red-600 hover:text-red-700"
                                disabled={exercise.sets.length <= 1}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </button>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomWorkoutForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Workout
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}