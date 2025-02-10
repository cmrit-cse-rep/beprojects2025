import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Play, X, CheckCircle2, Timer } from 'lucide-react';

export function WorkoutDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const workouts = useAppStore((state) => state.workouts);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const workout = workouts.find((w) => w.id === id);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutStarted && workoutStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutStarted, workoutStartTime]);

  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Workout not found</h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleStartWorkout = () => {
    setIsWorkoutStarted(true);
    setWorkoutStartTime(new Date());
  };

  const handleFinishWorkout = async () => {
    if (!workoutStartTime) return;
    
    if (window.confirm('Are you sure you want to finish this workout?')) {
      try {
        await useAppStore.getState().completeWorkout(workout, workoutStartTime, completedSets);
        navigate('/history');
      } catch (error) {
        console.error('Error completing workout:', error);
        alert('Failed to save workout completion. Please try again.');
      }
    }
  };

  const handleCancelWorkout = () => {
    if (isWorkoutStarted && !window.confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      return;
    }
    navigate('/');
  };

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const key = `${exerciseIndex}-${setIndex}`;
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${remainingSeconds}s`;
  };

  const calculateProgress = () => {
    const totalSets = workout.exercises.reduce((total, exercise) => {
      return total + (exercise.setDetails?.length || exercise.sets);
    }, 0);
    const completedSetsCount = Object.values(completedSets).filter(Boolean).length;
    return (completedSetsCount / totalSets) * 100;
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workout.name}</h1>
              {isWorkoutStarted && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Timer className="w-4 h-4 mr-1" />
                  {formatTime(elapsedTime)}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {isWorkoutStarted ? (
                <button
                  onClick={handleFinishWorkout}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Finish Workout
                </button>
              ) : (
                <button
                  onClick={handleStartWorkout}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Workout
                </button>
              )}
              <button
                onClick={handleCancelWorkout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>

          {isWorkoutStarted && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {workout.exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="mb-8 last:mb-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{exercise.name}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {isWorkoutStarted && <th scope="col" className="w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Set
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reps
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(exercise.setDetails || Array.from({ length: exercise.sets })).map((set, setIndex) => (
                      <tr key={setIndex} className={completedSets[`${exerciseIndex}-${setIndex}`] ? 'bg-green-50' : ''}>
                        {isWorkoutStarted && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={completedSets[`${exerciseIndex}-${setIndex}`] || false}
                              onChange={() => toggleSetCompletion(exerciseIndex, setIndex)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {setIndex + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {set?.weight ? 
                            `${Math.round(set.weight * 0.453592)}kg` : 
                            exercise.weight ? 
                              `${Math.round(exercise.weight * 0.453592)}kg` : 
                              'Bodyweight'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {set?.reps || exercise.reps}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}