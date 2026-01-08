import { UserProfile } from '../types';

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 */
export function calculateBMR(user: UserProfile): number {
  const { weight, height, age, gender } = user;
  
  // Mifflin-St Jeor Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  
  return Math.round(bmr);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(user: UserProfile): number {
  const bmr = calculateBMR(user);
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };
  
  const multiplier = activityMultipliers[user.activity_level];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily calorie goal based on user's goal
 */
export function calculateCalorieGoal(user: UserProfile): number {
  const tdee = calculateTDEE(user);
  
  const goalAdjustments = {
    weight_loss: -500, // 500 calorie deficit
    muscle_gain: 300,  // 300 calorie surplus
    maintenance: 0,
    endurance: 200,    // Slight surplus for endurance
  };
  
  return Math.round(tdee + goalAdjustments[user.goal]);
}

/**
 * Calculate BMI
 */
export function calculateBMI(weight: number, height: number): number {
  // BMI = weight (kg) / height (m)²
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate protein goal (grams per day)
 */
export function calculateProteinGoal(user: UserProfile): number {
  // General recommendation: 1.6-2.2g per kg of body weight for active individuals
  const proteinPerKg = user.goal === 'muscle_gain' ? 2.0 : 1.6;
  return Math.round(user.weight * proteinPerKg);
}

/**
 * Calculate calories burned from exercise
 */
export function estimateCaloriesBurned(
  weight: number,
  duration: number, // minutes
  exerciseType: string
): number {
  // MET values (Metabolic Equivalent of Task) for common exercises
  const metValues: Record<string, number> = {
    'running': 11.5,
    'cycling': 8.0,
    'swimming': 8.0,
    'weightlifting': 6.0,
    'walking': 3.5,
    'yoga': 3.0,
    'general': 5.0, // default
  };
  
  const met = metValues[exerciseType.toLowerCase()] || metValues['general'];
  // Calories = MET × weight (kg) × duration (hours)
  return Math.round(met * weight * (duration / 60));
}

