import React, { useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { Flame, Dumbbell, Battery } from 'lucide-react';

export function Stats() {
  const { workoutHistory } = useAppStore();

  const stats = useMemo(() => {
    // Calculate current streak
    const sortedWorkouts = [...workoutHistory].sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.completed_at);
      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    // Find strongest lift
    let strongestLift = {
      exercise: '',
      weight: 0,
      date: null as Date | null
    };

    workoutHistory.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.weight) {
          const weightKg = exercise.weight * 0.453592; // Convert lbs to kg
          if (weightKg > strongestLift.weight) {
            strongestLift = {
              exercise: exercise.name,
              weight: weightKg,
              date: new Date(workout.completed_at)
            };
          }
        }
      });
    });

    // Calculate energy level (0-100)
    let energyLevel = 50; // Default neutral level
    
    if (sortedWorkouts.length >= 2) {
      const recentWorkouts = sortedWorkouts.slice(0, Math.min(5, sortedWorkouts.length));
      let progressionCount = 0;

      recentWorkouts.forEach((workout, index) => {
        if (index === 0) return;
        
        const currentWorkout = workout;
        const previousWorkout = recentWorkouts[index - 1];
        
        // Compare weights and completion times
        const currentTotalWeight = currentWorkout.exercises.reduce((sum, ex) => 
          sum + (ex.weight || 0), 0);
        const previousTotalWeight = previousWorkout.exercises.reduce((sum, ex) => 
          sum + (ex.weight || 0), 0);
        
        if (currentTotalWeight > previousTotalWeight) {
          progressionCount++;
        }
        
        // Check if workout duration is consistent or improving
        const currentDuration = currentWorkout.duration_seconds;
        const previousDuration = previousWorkout.duration_seconds;
        if (currentDuration <= previousDuration * 1.1) { // Allow 10% variance
          progressionCount++;
        }
      });

      // Adjust energy level based on progression
      const progressionRate = progressionCount / (recentWorkouts.length * 2);
      if (progressionRate > 0.7) {
        energyLevel = 90; // High energy
      } else if (progressionRate > 0.5) {
        energyLevel = 75; // Good energy
      } else if (progressionRate > 0.3) {
        energyLevel = 50; // Moderate energy
      } else {
        energyLevel = 25; // Low energy - might need rest
      }
    }

    return {
      streak,
      strongestLift,
      energyLevel
    };
  }, [workoutHistory]);

  const getEnergyLevelColor = (level: number) => {
    if (level >= 75) return 'text-green-500';
    if (level >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getEnergyLevelMessage = (level: number) => {
    if (level >= 75) return 'Great energy! Keep pushing!';
    if (level >= 50) return 'Maintaining steady progress';
    return 'Consider taking a rest day';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Workout Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Streak</h2>
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.streak} {stats.streak === 1 ? 'day' : 'days'}
          </div>
          <p className="text-sm text-gray-600">
            Keep the momentum going!
          </p>
        </div>

        {/* Strongest Lift Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Strongest Lift</h2>
            <Dumbbell className="w-6 h-6 text-blue-500" />
          </div>
          {stats.strongestLift.exercise ? (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {Math.round(stats.strongestLift.weight)}kg
              </div>
              <p className="text-sm text-gray-600">
                {stats.strongestLift.exercise}
                {stats.strongestLift.date && (
                  <span className="block text-xs text-gray-500">
                    {stats.strongestLift.date.toLocaleDateString()}
                  </span>
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">
              No lifts recorded yet
            </p>
          )}
        </div>

        {/* Energy Level Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Energy Level</h2>
            <Battery className={`w-6 h-6 ${getEnergyLevelColor(stats.energyLevel)}`} />
          </div>
          <div className="mb-2">
            <div className="h-4 bg-gray-200 rounded-full">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${getEnergyLevelColor(stats.energyLevel)}`}
                style={{ width: `${stats.energyLevel}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {getEnergyLevelMessage(stats.energyLevel)}
          </p>
        </div>
      </div>
    </div>
  );
}