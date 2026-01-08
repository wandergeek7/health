import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, SegmentedButtons } from 'react-native-paper';
import { db } from '../../services/database/db';
import { UserProfile, ExerciseLog, ActivityLog } from '../../types';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      const currentUser = await db.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        
        const endDate = new Date();
        const startDate = timeRange === 'week' 
          ? subDays(endDate, 7)
          : subDays(endDate, 30);
        
        const exercises = await db.getExerciseLogs(
          currentUser.id!,
          startDate.toISOString(),
          endDate.toISOString()
        );
        setExerciseLogs(exercises);
        
        const activities = await db.getActivityLogs(
          currentUser.id!,
          startDate.toISOString(),
          endDate.toISOString()
        );
        setActivityLogs(activities);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const prepareStepsData = () => {
    const days = timeRange === 'week' ? 7 : 30;
    const data: number[] = [];
    const labels: string[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const activity = activityLogs.find(a => a.date === dateStr);
      data.push(activity?.steps || 0);
      labels.push(format(date, timeRange === 'week' ? 'EEE' : 'MMM d'));
    }
    
    return { labels, data };
  };

  const prepareWorkoutData = () => {
    const days = timeRange === 'week' ? 7 : 30;
    const data: number[] = [];
    const labels: string[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = exerciseLogs.filter(e => 
        format(new Date(e.date), 'yyyy-MM-dd') === dateStr
      ).length;
      data.push(count);
      labels.push(format(date, timeRange === 'week' ? 'EEE' : 'MMM d'));
    }
    
    return { labels, data };
  };

  const calculateStats = () => {
    const totalWorkouts = exerciseLogs.length;
    const totalSteps = activityLogs.reduce((sum, a) => sum + a.steps, 0);
    const avgSteps = activityLogs.length > 0 ? Math.round(totalSteps / activityLogs.length) : 0;
    const totalActiveMinutes = activityLogs.reduce((sum, a) => sum + a.active_minutes, 0);
    
    return {
      totalWorkouts,
      totalSteps,
      avgSteps,
      totalActiveMinutes,
    };
  };

  const stepsData = prepareStepsData();
  const workoutData = prepareWorkoutData();
  const stats = calculateStats();

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#6200ee',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Time Range</Text>
            <SegmentedButtons
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as 'week' | 'month')}
              buttons={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
              ]}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">{stats.totalWorkouts}</Text>
                <Text variant="bodySmall">Total Workouts</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">{stats.totalSteps.toLocaleString()}</Text>
                <Text variant="bodySmall">Total Steps</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">{stats.avgSteps.toLocaleString()}</Text>
                <Text variant="bodySmall">Avg Steps/Day</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">{stats.totalActiveMinutes}</Text>
                <Text variant="bodySmall">Active Minutes</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {stepsData.data.some(d => d > 0) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>Steps</Text>
              <LineChart
                data={{
                  labels: stepsData.labels,
                  datasets: [
                    {
                      data: stepsData.data,
                    },
                  ],
                }}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}

        {workoutData.data.some(d => d > 0) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>Workouts</Text>
              <LineChart
                data={{
                  labels: workoutData.labels,
                  datasets: [
                    {
                      data: workoutData.data,
                    },
                  ],
                }}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}

        {exerciseLogs.length === 0 && activityLogs.length === 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No progress data available yet. Start logging exercises and activities to see your progress!
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
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
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

