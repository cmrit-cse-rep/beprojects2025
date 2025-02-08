/*
  # Populate Exercise Database

  1. Changes
    - Add initial set of exercises for each muscle group
    - Each exercise includes name, muscle group, description, and required equipment

  2. Exercise Categories
    - Chest
    - Back
    - Shoulders
    - Legs
    - Arms
    - Core
*/

-- Chest Exercises
INSERT INTO exercises (name, muscle_group, description, equipment_needed) VALUES
('Barbell Bench Press', 'Chest', 'Classic compound movement targeting the chest, front deltoids, and triceps', ARRAY['Barbell', 'Bench']),
('Dumbbell Flyes', 'Chest', 'Isolation exercise focusing on chest stretch and contraction', ARRAY['Dumbbells', 'Bench']),
('Push-Ups', 'Chest', 'Bodyweight exercise engaging the entire chest, shoulders, and core', ARRAY['Bodyweight']),
('Incline Dumbbell Press', 'Chest', 'Upper chest focused pressing movement', ARRAY['Dumbbells', 'Bench']),
('Cable Flyes', 'Chest', 'Constant tension exercise for chest development', ARRAY['Cable Machine']),
('Decline Bench Press', 'Chest', 'Lower chest focused pressing movement', ARRAY['Barbell', 'Bench']),
('Landmine Press', 'Chest', 'Unique pressing angle for chest development', ARRAY['Barbell']),
('Machine Chest Press', 'Chest', 'Guided movement for chest activation', ARRAY['Machine']),
('Dips', 'Chest', 'Compound bodyweight exercise for lower chest and triceps', ARRAY['Dip Station']),
('Smith Machine Bench Press', 'Chest', 'Guided barbell press for chest development', ARRAY['Smith Machine']);

-- Back Exercises
INSERT INTO exercises (name, muscle_group, description, equipment_needed) VALUES
('Pull-Ups', 'Back', 'Compound upper body pull focusing on latissimus dorsi', ARRAY['Pull-up Bar']),
('Barbell Rows', 'Back', 'Horizontal pulling movement for back thickness', ARRAY['Barbell']),
('Lat Pulldowns', 'Back', 'Vertical pulling movement targeting the lats', ARRAY['Cable Machine']),
('Seated Cable Rows', 'Back', 'Controlled rowing movement for back development', ARRAY['Cable Machine']),
('Single-Arm Dumbbell Rows', 'Back', 'Unilateral back exercise for muscle balance', ARRAY['Dumbbells', 'Bench']),
('Face Pulls', 'Back', 'Upper back and rear deltoid focused pull', ARRAY['Cable Machine']),
('Meadows Rows', 'Back', 'Unilateral barbell row variation', ARRAY['Barbell']),
('Straight-Arm Pulldowns', 'Back', 'Isolation movement for lat development', ARRAY['Cable Machine']),
('T-Bar Rows', 'Back', 'Compound rowing movement for back thickness', ARRAY['T-Bar Row Machine']),
('Rack Pulls', 'Back', 'Partial deadlift for upper back development', ARRAY['Barbell', 'Power Rack']);

-- Shoulder Exercises
INSERT INTO exercises (name, muscle_group, description, equipment_needed) VALUES
('Overhead Press', 'Shoulders', 'Compound pressing movement for shoulder development', ARRAY['Barbell']),
('Lateral Raises', 'Shoulders', 'Isolation exercise for lateral deltoids', ARRAY['Dumbbells']),
('Front Raises', 'Shoulders', 'Anterior deltoid focused movement', ARRAY['Dumbbells', 'Plate']),
('Reverse Flyes', 'Shoulders', 'Posterior deltoid isolation exercise', ARRAY['Dumbbells', 'Bench']),
('Arnold Press', 'Shoulders', 'Rotational pressing movement for full deltoid development', ARRAY['Dumbbells']),
('Military Press', 'Shoulders', 'Strict overhead press for shoulder strength', ARRAY['Barbell']),
('Cable Lateral Raises', 'Shoulders', 'Constant tension lateral raise variation', ARRAY['Cable Machine']),
('Upright Rows', 'Shoulders', 'Vertical pull for shoulder width', ARRAY['Barbell', 'Cable Machine']),
('Push Press', 'Shoulders', 'Explosive overhead press variation', ARRAY['Barbell']),
('Plate Raises', 'Shoulders', 'Front deltoid isolation using a weight plate', ARRAY['Plate']);

-- Legs Exercises
INSERT INTO exercises (name, muscle_group, description, equipment_needed) VALUES
('Barbell Squats', 'Legs', 'Compound movement for overall leg development', ARRAY['Barbell', 'Squat Rack']),
('Romanian Deadlifts', 'Legs', 'Hip-hinge movement targeting hamstrings', ARRAY['Barbell']),
('Leg Press', 'Legs', 'Machine-based compound leg exercise', ARRAY['Leg Press Machine']),
('Walking Lunges', 'Legs', 'Dynamic movement for leg strength and stability', ARRAY['Dumbbells']),
('Leg Extensions', 'Legs', 'Isolation exercise for quadriceps', ARRAY['Leg Extension Machine']),
('Leg Curls', 'Legs', 'Isolation exercise for hamstrings', ARRAY['Leg Curl Machine']),
('Bulgarian Split Squats', 'Legs', 'Unilateral leg exercise for balance and strength', ARRAY['Dumbbells', 'Bench']),
('Calf Raises', 'Legs', 'Isolation exercise for calf development', ARRAY['Smith Machine', 'Leg Press Machine']),
('Hip Thrusts', 'Legs', 'Glute-focused exercise', ARRAY['Barbell', 'Bench']),
('Goblet Squats', 'Legs', 'Dumbbell squat variation for leg development', ARRAY['Dumbbells']);

-- Arms Exercises
INSERT INTO exercises (name, muscle_group, description, equipment_needed) VALUES
('Barbell Curls', 'Arms', 'Compound movement for biceps development', ARRAY['Barbell']),
('Tricep Pushdowns', 'Arms', 'Isolation exercise for triceps', ARRAY['Cable Machine']),
('Hammer Curls', 'Arms', 'Neutral grip curl for bicep and forearm development', ARRAY['Dumbbells']),
('Skull Crushers', 'Arms', 'Lying tricep extension exercise', ARRAY['Barbell', 'Bench']),
('Preacher Curls', 'Arms', 'Supported bicep curl variation', ARRAY['Preacher Bench', 'Dumbbells']),
('Rope Pushdowns', 'Arms', 'Tricep isolation with rope attachment', ARRAY['Cable Machine']),
('Concentration Curls', 'Arms', 'Seated isolation exercise for peak bicep contraction', ARRAY['Dumbbells']),
('Diamond Push-Ups', 'Arms', 'Bodyweight tricep focused exercise', ARRAY['Bodyweight']),
('EZ Bar Curls', 'Arms', 'Bicep curl variation with angled grip', ARRAY['EZ Bar']),
('Overhead Tricep Extensions', 'Arms', 'Single-arm tricep isolation exercise', ARRAY['Dumbbells']);

-- Core Exercises
INSERT INTO exercises (name, muscle_group, description, equipment_needed) VALUES
('Planks', 'Core', 'Isometric hold for core stability', ARRAY['Bodyweight']),
('Cable Woodchoppers', 'Core', 'Rotational movement for obliques', ARRAY['Cable Machine']),
('Hanging Leg Raises', 'Core', 'Advanced movement for lower abs', ARRAY['Pull-up Bar']),
('Russian Twists', 'Core', 'Seated rotational exercise for obliques', ARRAY['Plate', 'Dumbbells']),
('Ab Wheel Rollouts', 'Core', 'Dynamic movement for full core engagement', ARRAY['Ab Wheel']),
('Cable Crunches', 'Core', 'Weighted crunch variation for upper abs', ARRAY['Cable Machine']),
('Dead Bug', 'Core', 'Stabilization exercise for deep core muscles', ARRAY['Bodyweight']),
('Side Planks', 'Core', 'Lateral core and oblique exercise', ARRAY['Bodyweight']),
('Medicine Ball Slams', 'Core', 'Explosive core exercise', ARRAY['Medicine Ball']),
('Pallof Press', 'Core', 'Anti-rotation exercise for core stability', ARRAY['Cable Machine']);