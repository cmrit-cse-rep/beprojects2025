import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { Plus, Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ExerciseDatabase() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    muscle_group: '',
    description: '',
    equipment_needed: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const muscleGroups = [
    'All',
    'Chest',
    'Back',
    'Shoulders',
    'Legs',
    'Arms',
    'Core',
  ];

  const equipmentOptions = [
    'Bodyweight',
    'Dumbbells',
    'Barbell',
    'Kettlebell',
    'Resistance Bands',
    'Cable Machine',
    'Pull-up Bar',
    'Bench',
    'Smith Machine',
    'Machine',
    'Plates',
  ];

  useEffect(() => {
    fetchExercises();
  }, [selectedMuscleGroup, searchTerm]);

  const fetchExercises = async () => {
    let query = supabase.from('exercises').select('*');
    
    if (selectedMuscleGroup !== 'All') {
      query = query.eq('muscle_group', selectedMuscleGroup);
    }
    
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error } = await query.order('muscle_group');
    if (error) {
      console.error('Error fetching exercises:', error);
    } else {
      setExercises(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Exercise name is required');
      }
      if (!formData.muscle_group) {
        throw new Error('Muscle group is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (formData.equipment_needed.length === 0) {
        throw new Error('At least one piece of equipment is required');
      }

      const { error: insertError } = await supabase
        .from('exercises')
        .insert([{
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim(),
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (insertError) throw insertError;

      // Reset form and close dialog
      setFormData({
        name: '',
        muscle_group: '',
        description: '',
        equipment_needed: [],
      });
      setShowAddForm(false);
      
      // Refresh exercise list
      await fetchExercises();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExercises = exercises.filter((exercise: any) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Exercise Database</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={selectedMuscleGroup}
          onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          className="rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {muscleGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Add New Exercise</h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Muscle Group
                </label>
                <select
                  value={formData.muscle_group}
                  onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a muscle group</option>
                  {muscleGroups.filter(group => group !== 'All').map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Needed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {equipmentOptions.map((equipment) => (
                    <label key={equipment} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.equipment_needed.includes(equipment)}
                        onChange={(e) => {
                          const equipment_needed = e.target.checked
                            ? [...formData.equipment_needed, equipment]
                            : formData.equipment_needed.filter((eq) => eq !== equipment);
                          setFormData({ ...formData, equipment_needed });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">{equipment}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setError(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Exercise'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise: any) => (
          <div key={exercise.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{exercise.name}</h3>
                <p className="mt-1 text-sm text-blue-600">{exercise.muscle_group}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{exercise.description}</p>
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Equipment</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {exercise.equipment_needed.map((equipment: string) => (
                  <span
                    key={equipment}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {equipment}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}