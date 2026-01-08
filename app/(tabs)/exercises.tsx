import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { FAB, Card, Text, Button, TextInput, Dialog, Portal, SegmentedButtons } from 'react-native-paper';
import { db } from '../../services/database/db';
import { ExerciseLog, UserProfile } from '../../types';
import { format } from 'date-fns';

export default function ExercisesScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await db.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const exerciseLogs = await db.getExerciseLogs(currentUser.id!);
        setLogs(exerciseLogs);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const handleAddExercise = async () => {
    if (!user || !exerciseName || !sets || !reps) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await db.logExercise({
        user_id: user.id!,
        exercise_name: exerciseName,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight) || 0,
        duration: parseInt(duration) || 0,
        date: new Date().toISOString(),
        source: 'manual',
      });
      
      setDialogVisible(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error logging exercise:', error);
      alert('Failed to log exercise');
    }
  };

  const resetForm = () => {
    setExerciseName('');
    setSets('');
    setReps('');
    setWeight('');
    setDuration('');
  };

  const renderExerciseLog = ({ item }: { item: ExerciseLog }) => (
    <Card style={styles.logCard}>
      <Card.Content>
        <View style={styles.logHeader}>
          <Text variant="titleMedium">{item.exercise_name}</Text>
          <Text variant="bodySmall" style={styles.date}>
            {format(new Date(item.date), 'MMM d, yyyy')}
          </Text>
        </View>
        <View style={styles.logDetails}>
          <Text variant="bodyMedium">Sets: {item.sets}</Text>
          <Text variant="bodyMedium">Reps: {item.reps}</Text>
          {item.weight > 0 && <Text variant="bodyMedium">Weight: {item.weight} kg</Text>}
          {item.duration > 0 && <Text variant="bodyMedium">Duration: {item.duration} min</Text>}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyText}>No exercises logged yet</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Tap the + button to log your first workout
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderExerciseLog}
          keyExtractor={(item) => item.id?.toString() || ''}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Log Exercise</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Exercise Name"
              value={exerciseName}
              onChangeText={setExerciseName}
              mode="outlined"
              style={styles.input}
            />
            <View style={styles.row}>
              <TextInput
                label="Sets"
                value={sets}
                onChangeText={setSets}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Reps"
                value={reps}
                onChangeText={setReps}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                label="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Duration (min)"
                value={duration}
                onChangeText={setDuration}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddExercise}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  logCard: {
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    color: '#666',
  },
  logDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
});

