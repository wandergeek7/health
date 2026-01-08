export interface Exercise {
  name: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'sports';
  muscle_groups: string[];
  equipment: 'none' | 'dumbbells' | 'barbell' | 'machine' | 'bodyweight' | 'cardio_machine';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const EXERCISES: Exercise[] = [
  // Cardio
  { name: 'Running', category: 'cardio', muscle_groups: ['legs', 'core'], equipment: 'none', difficulty: 'beginner' },
  { name: 'Walking', category: 'cardio', muscle_groups: ['legs'], equipment: 'none', difficulty: 'beginner' },
  { name: 'Cycling', category: 'cardio', muscle_groups: ['legs'], equipment: 'cardio_machine', difficulty: 'beginner' },
  { name: 'Swimming', category: 'cardio', muscle_groups: ['full_body'], equipment: 'none', difficulty: 'intermediate' },
  { name: 'Jump Rope', category: 'cardio', muscle_groups: ['legs', 'calves'], equipment: 'none', difficulty: 'intermediate' },
  
  // Strength - Bodyweight
  { name: 'Push-ups', category: 'strength', muscle_groups: ['chest', 'shoulders', 'triceps'], equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Pull-ups', category: 'strength', muscle_groups: ['back', 'biceps'], equipment: 'bodyweight', difficulty: 'intermediate' },
  { name: 'Squats', category: 'strength', muscle_groups: ['legs', 'glutes'], equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Lunges', category: 'strength', muscle_groups: ['legs', 'glutes'], equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Plank', category: 'strength', muscle_groups: ['core'], equipment: 'bodyweight', difficulty: 'beginner' },
  { name: 'Burpees', category: 'strength', muscle_groups: ['full_body'], equipment: 'bodyweight', difficulty: 'intermediate' },
  
  // Strength - Dumbbells
  { name: 'Dumbbell Press', category: 'strength', muscle_groups: ['chest', 'shoulders', 'triceps'], equipment: 'dumbbells', difficulty: 'beginner' },
  { name: 'Dumbbell Rows', category: 'strength', muscle_groups: ['back', 'biceps'], equipment: 'dumbbells', difficulty: 'beginner' },
  { name: 'Dumbbell Curls', category: 'strength', muscle_groups: ['biceps'], equipment: 'dumbbells', difficulty: 'beginner' },
  { name: 'Dumbbell Shoulder Press', category: 'strength', muscle_groups: ['shoulders', 'triceps'], equipment: 'dumbbells', difficulty: 'beginner' },
  { name: 'Dumbbell Squats', category: 'strength', muscle_groups: ['legs', 'glutes'], equipment: 'dumbbells', difficulty: 'beginner' },
  
  // Strength - Barbell
  { name: 'Barbell Bench Press', category: 'strength', muscle_groups: ['chest', 'shoulders', 'triceps'], equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Barbell Squat', category: 'strength', muscle_groups: ['legs', 'glutes'], equipment: 'barbell', difficulty: 'intermediate' },
  { name: 'Barbell Deadlift', category: 'strength', muscle_groups: ['back', 'legs', 'glutes'], equipment: 'barbell', difficulty: 'advanced' },
  { name: 'Barbell Rows', category: 'strength', muscle_groups: ['back', 'biceps'], equipment: 'barbell', difficulty: 'intermediate' },
  
  // Flexibility
  { name: 'Yoga', category: 'flexibility', muscle_groups: ['full_body'], equipment: 'none', difficulty: 'beginner' },
  { name: 'Stretching', category: 'flexibility', muscle_groups: ['full_body'], equipment: 'none', difficulty: 'beginner' },
];

export function getExercisesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Exercise[] {
  return EXERCISES.filter(ex => ex.difficulty === level);
}

export function getExercisesByEquipment(equipment: Exercise['equipment']): Exercise[] {
  if (equipment === 'none') {
    return EXERCISES.filter(ex => ex.equipment === 'none' || ex.equipment === 'bodyweight');
  }
  return EXERCISES.filter(ex => ex.equipment === equipment);
}

export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return EXERCISES.filter(ex => ex.category === category);
}

