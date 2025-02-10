import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';

export function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile, profile } = useAppStore();
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    fitness_level: 'beginner',
    goals: [] as string[],
    equipment: [] as string[],
    custom_equipment: [] as string[],
    workout_frequency: '3',
    injury_history: '',
  });

  const [customEquipment, setCustomEquipment] = useState('');
  const [showCustomEquipment, setShowCustomEquipment] = useState(false);

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age.toString(),
        weight: (profile.weight / 2.20462).toFixed(1), // Convert lbs to kg
        fitness_level: profile.fitness_level,
        goals: profile.goals,
        equipment: profile.equipment,
        custom_equipment: profile.custom_equipment || [],
        workout_frequency: profile.workout_frequency.toString(),
        injury_history: profile.injury_history || '',
      });
      setShowCustomEquipment(profile.custom_equipment?.length > 0);
    }
  }, [profile]);

  const fitnessLevels = ['beginner', 'intermediate', 'advanced'];
  const commonGoals = ['Build Muscle', 'Lose Weight', 'Improve Strength', 'Increase Endurance'];
  const equipmentOptions = [
    'Basic Gym',
    'Advanced Gym',
    'Home Only',
    'Dumbbells',
    'Custom'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile({
      ...formData,
      age: parseInt(formData.age, 10),
      weight: parseFloat(formData.weight) * 2.20462, // Convert kg to lbs for storage
      workout_frequency: parseInt(formData.workout_frequency, 10),
    });
    navigate('/');
  };

  const handleCustomEquipmentAdd = () => {
    if (customEquipment.trim()) {
      setFormData(prev => ({
        ...prev,
        custom_equipment: [...prev.custom_equipment, customEquipment.trim()]
      }));
      setCustomEquipment('');
    }
  };

  const removeCustomEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      custom_equipment: prev.custom_equipment.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Update Your Profile</h1>
          <p className="mt-2 text-gray-600">Modify your fitness preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                min="13"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fitness Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {fitnessLevels.map((level) => (
                <label
                  key={level}
                  className={`
                    flex items-center justify-center px-4 py-2 rounded-lg border cursor-pointer
                    ${formData.fitness_level === level
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <input
                    type="radio"
                    value={level}
                    checked={formData.fitness_level === level}
                    onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value as any })}
                    className="sr-only"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fitness Goals
            </label>
            <div className="grid grid-cols-2 gap-3">
              {commonGoals.map((goal) => (
                <label
                  key={goal}
                  className={`
                    flex items-center p-3 rounded-lg border cursor-pointer
                    ${formData.goals.includes(goal)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(goal)}
                    onChange={(e) => {
                      const goals = e.target.checked
                        ? [...formData.goals, goal]
                        : formData.goals.filter((g) => g !== goal);
                      setFormData({ ...formData, goals });
                    }}
                    className="sr-only"
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Equipment
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {equipmentOptions.map((equipment) => (
                <label
                  key={equipment}
                  className={`
                    flex items-center p-3 rounded-lg border cursor-pointer
                    ${equipment === 'Custom' && showCustomEquipment ? 'bg-blue-50 border-blue-500 text-blue-700' :
                    formData.equipment.includes(equipment) ? 'bg-blue-50 border-blue-500 text-blue-700' :
                    'border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={equipment === 'Custom' ? showCustomEquipment : formData.equipment.includes(equipment)}
                    onChange={(e) => {
                      if (equipment === 'Custom') {
                        setShowCustomEquipment(e.target.checked);
                      } else {
                        const equipment_list = e.target.checked
                          ? [...formData.equipment, equipment]
                          : formData.equipment.filter((eq) => eq !== equipment);
                        setFormData({ ...formData, equipment: equipment_list });
                      }
                    }}
                    className="sr-only"
                  />
                  <span>{equipment}</span>
                </label>
              ))}
            </div>

            {showCustomEquipment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={customEquipment}
                    onChange={(e) => setCustomEquipment(e.target.value)}
                    placeholder="Enter custom equipment..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleCustomEquipmentAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add
                  </button>
                </div>
                {formData.custom_equipment.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.custom_equipment.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeCustomEquipment(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workout Frequency (days per week): {formData.workout_frequency}
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={formData.workout_frequency}
              onChange={(e) => setFormData({ ...formData, workout_frequency: e.target.value })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Injury History or Limitations (Optional)
            </label>
            <textarea
              value={formData.injury_history}
              onChange={(e) => setFormData({ ...formData, injury_history: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Describe any injuries or physical limitations..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}