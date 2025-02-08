import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

export function History() {
  const { workoutHistory } = useAppStore();
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  // Group workouts by date
  const groupedWorkouts = workoutHistory.reduce((groups: Record<string, typeof workoutHistory>, workout) => {
    const date = new Date(workout.completed_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Workout History</h1>

      {Object.entries(groupedWorkouts).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No workout history</h3>
          <p className="mt-1 text-sm text-gray-500">
            Complete your first workout to start tracking your progress
          </p>
        </div>
      ) : (
        Object.entries(groupedWorkouts)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([date, workouts]) => (
            <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {formatDate(date)}
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/workout/${workout.workout_id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {workout.workout_name}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(workout.duration_seconds)}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}