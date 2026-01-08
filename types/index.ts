export interface UserProfile {
  id?: number;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  created_at?: string;
}

export interface WorkoutPlan {
  id?: number;
  user_id: number;
  name: string;
  duration_weeks: number;
  created_at?: string;
}

export interface ExerciseLog {
  id?: number;
  user_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number; // in kg
  duration: number; // in minutes
  date: string;
  source: 'manual' | 'api';
}

export interface ActivityLog {
  id?: number;
  user_id: number;
  steps: number;
  distance: number; // in km
  calories_burned: number;
  active_minutes: number;
  date: string;
  source: 'manual' | 'api';
}

export interface FoodItem {
  id?: number;
  name: string;
  calories_per_100g: number;
  protein: number; // grams per 100g
  carbs: number; // grams per 100g
  fats: number; // grams per 100g
}

export interface FoodLog {
  id?: number;
  user_id: number;
  food_item_id: number;
  quantity: number; // in grams
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

export interface Streak {
  id?: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
}

export interface DailySummary {
  date: string;
  steps: number;
  calories_consumed: number;
  calories_burned: number;
  calories_goal: number;
  workouts_count: number;
  active_minutes: number;
}

