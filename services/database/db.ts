import * as SQLite from 'expo-sqlite';
import {
  UserProfile,
  ExerciseLog,
  ActivityLog,
  FoodLog,
  FoodItem,
  WorkoutPlan,
  Streak,
} from '../../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('fitness_tracker.db');
      await this.createTables();
      await this.seedFoodDatabase();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Users table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        fitness_level TEXT NOT NULL,
        goal TEXT NOT NULL,
        activity_level TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Workout Plans table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        duration_weeks INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Exercise Logs table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercise_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        exercise_name TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight REAL NOT NULL,
        duration INTEGER NOT NULL,
        date DATETIME NOT NULL,
        source TEXT NOT NULL DEFAULT 'manual',
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Activity Logs table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        steps INTEGER NOT NULL DEFAULT 0,
        distance REAL NOT NULL DEFAULT 0,
        calories_burned REAL NOT NULL DEFAULT 0,
        active_minutes INTEGER NOT NULL DEFAULT 0,
        date DATE NOT NULL,
        source TEXT NOT NULL DEFAULT 'manual',
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, date)
      );
    `);

    // Food Items table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        calories_per_100g REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fats REAL NOT NULL
      );
    `);

    // Food Logs table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS food_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_item_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        meal_type TEXT NOT NULL,
        date DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (food_item_id) REFERENCES food_items(id)
      );
    `);

    // Streaks table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        last_workout_date DATE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  }

  private async seedFoodDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const commonFoods: Omit<FoodItem, 'id'>[] = [
      { name: 'Chicken Breast', calories_per_100g: 165, protein: 31, carbs: 0, fats: 3.6 },
      { name: 'Brown Rice', calories_per_100g: 111, protein: 2.6, carbs: 23, fats: 0.9 },
      { name: 'Salmon', calories_per_100g: 208, protein: 20, carbs: 0, fats: 13 },
      { name: 'Eggs', calories_per_100g: 155, protein: 13, carbs: 1.1, fats: 11 },
      { name: 'Banana', calories_per_100g: 89, protein: 1.1, carbs: 23, fats: 0.3 },
      { name: 'Oatmeal', calories_per_100g: 68, protein: 2.4, carbs: 12, fats: 1.4 },
      { name: 'Greek Yogurt', calories_per_100g: 59, protein: 10, carbs: 3.6, fats: 0.4 },
      { name: 'Broccoli', calories_per_100g: 34, protein: 2.8, carbs: 7, fats: 0.4 },
      { name: 'Sweet Potato', calories_per_100g: 86, protein: 1.6, carbs: 20, fats: 0.1 },
      { name: 'Almonds', calories_per_100g: 579, protein: 21, carbs: 22, fats: 50 },
      { name: 'Apple', calories_per_100g: 52, protein: 0.3, carbs: 14, fats: 0.2 },
      { name: 'Whole Wheat Bread', calories_per_100g: 247, protein: 13, carbs: 41, fats: 4.2 },
    ];

    for (const food of commonFoods) {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO food_items (name, calories_per_100g, protein, carbs, fats) 
         VALUES (?, ?, ?, ?, ?)`,
        [food.name, food.calories_per_100g, food.protein, food.carbs, food.fats]
      );
    }
  }

  // User operations
  async createUser(user: Omit<UserProfile, 'id' | 'created_at'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.runAsync(
      `INSERT INTO users (name, age, gender, height, weight, fitness_level, goal, activity_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.name, user.age, user.gender, user.height, user.weight, user.fitness_level, user.goal, user.activity_level]
    );
    // Initialize streak for user
    await this.db.runAsync(
      `INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)`,
      [result.lastInsertRowId]
    );
    return result.lastInsertRowId;
  }

  async getUser(userId: number): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.getFirstAsync<UserProfile>(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );
    return result || null;
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.getFirstAsync<UserProfile>(
      `SELECT * FROM users ORDER BY created_at DESC LIMIT 1`
    );
    return result || null;
  }

  async updateUser(userId: number, updates: Partial<UserProfile>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
    const values = fields.map(field => updates[field as keyof UserProfile]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    await this.db.runAsync(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...values, userId]
    );
  }

  // Exercise operations
  async logExercise(exercise: Omit<ExerciseLog, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.runAsync(
      `INSERT INTO exercise_logs (user_id, exercise_name, sets, reps, weight, duration, date, source) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [exercise.user_id, exercise.exercise_name, exercise.sets, exercise.reps, exercise.weight, exercise.duration, exercise.date, exercise.source]
    );
    await this.updateStreak(exercise.user_id, exercise.date);
    return result.lastInsertRowId;
  }

  async getExerciseLogs(userId: number, startDate?: string, endDate?: string): Promise<ExerciseLog[]> {
    if (!this.db) throw new Error('Database not initialized');
    let query = `SELECT * FROM exercise_logs WHERE user_id = ?`;
    const params: any[] = [userId];
    
    if (startDate && endDate) {
      query += ` AND date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }
    
    query += ` ORDER BY date DESC`;
    return await this.db.getAllAsync<ExerciseLog>(query, params);
  }

  // Activity operations
  async logActivity(activity: Omit<ActivityLog, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.runAsync(
      `INSERT OR REPLACE INTO activity_logs (user_id, steps, distance, calories_burned, active_minutes, date, source) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [activity.user_id, activity.steps, activity.distance, activity.calories_burned, activity.active_minutes, activity.date, activity.source]
    );
    return result.lastInsertRowId;
  }

  async getActivityLog(userId: number, date: string): Promise<ActivityLog | null> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.getFirstAsync<ActivityLog>(
      `SELECT * FROM activity_logs WHERE user_id = ? AND date = ?`,
      [userId, date]
    );
    return result || null;
  }

  async getActivityLogs(userId: number, startDate?: string, endDate?: string): Promise<ActivityLog[]> {
    if (!this.db) throw new Error('Database not initialized');
    let query = `SELECT * FROM activity_logs WHERE user_id = ?`;
    const params: any[] = [userId];
    
    if (startDate && endDate) {
      query += ` AND date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }
    
    query += ` ORDER BY date DESC`;
    return await this.db.getAllAsync<ActivityLog>(query, params);
  }

  // Food operations
  async searchFoodItems(query: string): Promise<FoodItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<FoodItem>(
      `SELECT * FROM food_items WHERE name LIKE ? LIMIT 20`,
      [`%${query}%`]
    );
  }

  async getAllFoodItems(): Promise<FoodItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<FoodItem>(`SELECT * FROM food_items ORDER BY name`);
  }

  async logFood(foodLog: Omit<FoodLog, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.runAsync(
      `INSERT INTO food_logs (user_id, food_item_id, quantity, meal_type, date) 
       VALUES (?, ?, ?, ?, ?)`,
      [foodLog.user_id, foodLog.food_item_id, foodLog.quantity, foodLog.meal_type, foodLog.date]
    );
    return result.lastInsertRowId;
  }

  async getFoodLogs(userId: number, date: string): Promise<(FoodLog & { food_name: string; calories: number; protein: number; carbs: number; fats: number })[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync(
      `SELECT fl.*, fi.name as food_name, 
              (fi.calories_per_100g * fl.quantity / 100) as calories,
              (fi.protein * fl.quantity / 100) as protein,
              (fi.carbs * fl.quantity / 100) as carbs,
              (fi.fats * fl.quantity / 100) as fats
       FROM food_logs fl
       JOIN food_items fi ON fl.food_item_id = fi.id
       WHERE fl.user_id = ? AND DATE(fl.date) = DATE(?)
       ORDER BY fl.date DESC`,
      [userId, date]
    );
  }

  // Streak operations
  async getStreak(userId: number): Promise<Streak | null> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.getFirstAsync<Streak>(
      `SELECT * FROM streaks WHERE user_id = ?`,
      [userId]
    );
    return result || null;
  }

  private async updateStreak(userId: number, workoutDate: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const streak = await this.getStreak(userId);
    if (!streak) return;

    const workoutDateObj = new Date(workoutDate);
    const lastWorkoutDate = streak.last_workout_date ? new Date(streak.last_workout_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    workoutDateObj.setHours(0, 0, 0, 0);

    let newStreak = streak.current_streak;
    let newLongestStreak = streak.longest_streak;

    if (!lastWorkoutDate) {
      // First workout
      newStreak = 1;
    } else {
      const daysDiff = Math.floor((workoutDateObj.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 0) {
        // Same day, don't change streak
        return;
      } else if (daysDiff === 1) {
        // Consecutive day
        newStreak = streak.current_streak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    if (newStreak > newLongestStreak) {
      newLongestStreak = newStreak;
    }

    await this.db.runAsync(
      `UPDATE streaks SET current_streak = ?, longest_streak = ?, last_workout_date = ? WHERE user_id = ?`,
      [newStreak, newLongestStreak, workoutDate, userId]
    );
  }

  // Daily summary
  async getDailySummary(userId: number, date: string): Promise<{
    steps: number;
    calories_consumed: number;
    calories_burned: number;
    workouts_count: number;
    active_minutes: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');
    
    const activity = await this.getActivityLog(userId, date);
    const foodLogs = await this.getFoodLogs(userId, date);
    const exercises = await this.db.getAllAsync<ExerciseLog>(
      `SELECT * FROM exercise_logs WHERE user_id = ? AND DATE(date) = DATE(?)`,
      [userId, date]
    );

    const calories_consumed = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
    const calories_burned = activity?.calories_burned || 0;
    const steps = activity?.steps || 0;
    const active_minutes = activity?.active_minutes || 0;
    const workouts_count = exercises.length;

    return {
      steps,
      calories_consumed,
      calories_burned,
      workouts_count,
      active_minutes,
    };
  }
}

export const db = new DatabaseService();

