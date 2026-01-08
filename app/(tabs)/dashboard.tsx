import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, ProgressBar, Dialog, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../services/database/db';
import { UserProfile, DailySummary } from '../../types';
import { calculateCalorieGoal } from '../../utils/calculations';
import { format } from 'date-fns';

export default function DashboardScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState<{ current_streak: number; longest_streak: number } | null>(null);
  const [activityDialogVisible, setActivityDialogVisible] = useState(false);
  const [stepsInput, setStepsInput] = useState('');
  const [activeMinutesInput, setActiveMinutesInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await db.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const today = format(new Date(), 'yyyy-MM-dd');
        const dailySummary = await db.getDailySummary(currentUser.id!, today);
        const calorieGoal = calculateCalorieGoal(currentUser);
        setSummary({
          ...dailySummary,
          date: today,
          calories_goal: calorieGoal,
        });
        
        const userStreak = await db.getStreak(currentUser.id!);
        if (userStreak) {
          setStreak({
            current_streak: userStreak.current_streak,
            longest_streak: userStreak.longest_streak,
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogActivity = async () => {
    if (!user) return;
    
    const steps = parseInt(stepsInput) || summary?.steps || 0;
    const activeMinutes = parseInt(activeMinutesInput) || summary?.active_minutes || 0;
    const distance = steps * 0.0008; // Approximate: 1 step ≈ 0.8 meters
    const caloriesBurned = activeMinutes * 5; // Rough estimate: 5 calories per minute of activity

    try {
      await db.logActivity({
        user_id: user.id!,
        steps,
        distance,
        calories_burned: caloriesBurned,
        active_minutes: activeMinutes,
        date: format(new Date(), 'yyyy-MM-dd'),
        source: 'manual',
      });
      
      setActivityDialogVisible(false);
      setStepsInput('');
      setActiveMinutesInput('');
      loadData();
    } catch (error) {
      console.error('Error logging activity:', error);
      alert('Failed to log activity');
    }
  };

  if (!user || !summary) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const calorieProgress = summary.calories_goal > 0 
    ? Math.min(summary.calories_consumed / summary.calories_goal, 1) 
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        {/* Welcome Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">Welcome back, {user.name}!</Text>
            <Text variant="bodyMedium" style={styles.greeting}>
              {format(new Date(), 'EEEE, MMMM d')}
            </Text>
          </Card.Content>
        </Card>

        {/* Streak Card */}
        {streak && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.streakContainer}>
                <MaterialCommunityIcons name="fire" size={40} color="#ff6b35" />
                <View style={styles.streakInfo}>
                  <Text variant="headlineMedium">{streak.current_streak}</Text>
                  <Text variant="bodySmall">Day Streak</Text>
                  <Text variant="bodySmall" style={styles.longestStreak}>
                    Best: {streak.longest_streak} days
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Today's Stats */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Today's Stats</Text>
            
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="walk" size={24} color="#6200ee" />
              <View style={styles.statInfo}>
                <Text variant="headlineSmall">{summary.steps.toLocaleString()}</Text>
                <Text variant="bodySmall">Steps</Text>
              </View>
              <Button
                mode="outlined"
                compact
                onPress={() => {
                  setStepsInput(summary.steps.toString());
                  setActiveMinutesInput(summary.active_minutes.toString());
                  setActivityDialogVisible(true);
                }}
              >
                Update
              </Button>
            </View>

            <View style={styles.statRow}>
              <MaterialCommunityIcons name="dumbbell" size={24} color="#6200ee" />
              <View style={styles.statInfo}>
                <Text variant="headlineSmall">{summary.workouts_count}</Text>
                <Text variant="bodySmall">Workouts</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <MaterialCommunityIcons name="timer" size={24} color="#6200ee" />
              <View style={styles.statInfo}>
                <Text variant="headlineSmall">{summary.active_minutes}</Text>
                <Text variant="bodySmall">Active Minutes</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Calories Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Calories</Text>
            
            <View style={styles.calorieRow}>
              <View style={styles.calorieItem}>
                <Text variant="headlineSmall">{Math.round(summary.calories_consumed)}</Text>
                <Text variant="bodySmall">Consumed</Text>
              </View>
              <View style={styles.calorieItem}>
                <Text variant="headlineSmall">{Math.round(summary.calories_burned)}</Text>
                <Text variant="bodySmall">Burned</Text>
              </View>
              <View style={styles.calorieItem}>
                <Text variant="headlineSmall">{summary.calories_goal}</Text>
                <Text variant="bodySmall">Goal</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <ProgressBar progress={calorieProgress} color="#6200ee" style={styles.progressBar} />
              <Text variant="bodySmall" style={styles.progressText}>
                {Math.round(calorieProgress * 100)}% of daily goal
              </Text>
            </View>

            <Text variant="bodySmall" style={styles.netCalories}>
              Net: {Math.round(summary.calories_consumed - summary.calories_burned)} kcal
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Portal>
        <Dialog visible={activityDialogVisible} onDismiss={() => setActivityDialogVisible(false)}>
          <Dialog.Title>Log Activity</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Steps"
              value={stepsInput}
              onChangeText={setStepsInput}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Active Minutes"
              value={activeMinutesInput}
              onChangeText={setActiveMinutesInput}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setActivityDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogActivity}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  greeting: {
    color: '#666',
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  streakInfo: {
    marginLeft: 16,
    alignItems: 'center',
  },
  longestStreak: {
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statInfo: {
    marginLeft: 16,
    flex: 1,
  },
  input: {
    marginBottom: 12,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  calorieItem: {
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
  },
  netCalories: {
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
  },
});

