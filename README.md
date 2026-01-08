# Fitness Tracker App

A comprehensive mobile-first fitness tracking application built with React Native and Expo.

## Features

- **User Profile & Onboarding**: Personalized setup based on fitness level and goals
- **Exercise Tracking**: Log workouts with sets, reps, weight, and duration
- **Food & Calorie Tracking**: Track meals and monitor daily calorie intake
- **Step & Activity Tracking**: Monitor steps, distance, and active minutes (manual entry, API integration coming soon)
- **Gym Streak Tracking**: Track consecutive workout days
- **Progress Dashboard**: View daily summaries and progress charts
- **Customized Plans**: Generate workout and diet plans (coming soon)

## Tech Stack

- **React Native** with **Expo** (~51.0.0)
- **Expo Router** for navigation
- **SQLite** (expo-sqlite) for local data storage
- **React Native Paper** for UI components
- **TypeScript** for type safety
- **React Native Chart Kit** for progress visualization

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- iOS Simulator (for Mac) or Android Emulator
- Expo Go app on your phone (for physical device testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
# or
npx expo start
```

3. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone
- Press `w` to open in web browser

### First Run

On first launch, you'll be guided through an onboarding process where you'll:
1. Enter your personal information (name, age, gender)
2. Set your body measurements (height, weight)
3. Select your fitness level and activity level
4. Choose your fitness goal

After onboarding, you can start tracking your fitness journey!

## Project Structure

```
Health/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── dashboard.tsx  # Main dashboard
│   │   ├── exercises.tsx  # Exercise logging
│   │   ├── food.tsx      # Food logging
│   │   └── progress.tsx  # Progress charts
│   ├── _layout.tsx       # Root layout
│   ├── index.tsx         # Entry point
│   └── onboarding.tsx    # User onboarding
├── components/            # Reusable components
├── services/
│   └── database/         # SQLite database service
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── constants/            # App constants
```

## Database Schema

The app uses SQLite with the following main tables:
- `users` - User profiles
- `exercise_logs` - Exercise tracking
- `activity_logs` - Steps and activity
- `food_logs` - Food consumption
- `food_items` - Food database
- `workout_plans` - Custom workout plans
- `streaks` - Gym streak tracking

## Future Enhancements

- Health API integration (HealthKit/Google Fit)
- Cloud sync functionality
- Workout plan generator
- Diet plan templates
- Barcode scanner for food
- Social features
- Push notifications

## Development Status

Currently implementing Phase 1-2 of the development plan:
- ✅ Foundation setup
- ✅ Database schema
- ✅ User onboarding
- ✅ Exercise tracking
- ✅ Food tracking
- ✅ Basic dashboard
- ⏳ Health API integration (Phase 4)
- ⏳ Cloud sync (Phase 6)

## License

MIT

