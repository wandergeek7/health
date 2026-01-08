import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput, Text, RadioButton, Card } from 'react-native-paper';
import { db } from '../services/database/db';
import { UserProfile } from '../types';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 0,
    gender: 'male',
    height: 0,
    weight: 0,
    fitness_level: 'beginner',
    goal: 'maintenance',
    activity_level: 'sedentary',
  });

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.age || !formData.height || !formData.weight) {
        alert('Please fill in all required fields');
        return;
      }
      await db.createUser(formData as Omit<UserProfile, 'id' | 'created_at'>);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create profile. Please try again.');
    }
  };

  const renderStep1 = () => (
    <View>
      <Text variant="headlineMedium" style={styles.title}>Welcome!</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>Let's set up your fitness profile</Text>
      <TextInput
        label="Name"
        value={formData.name}
        onChangeText={(text) => updateField('name', text)}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Age"
        value={formData.age?.toString() || ''}
        onChangeText={(text) => updateField('age', parseInt(text) || 0)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />
      <Text variant="labelLarge" style={styles.label}>Gender</Text>
      <RadioButton.Group
        onValueChange={(value) => updateField('gender', value)}
        value={formData.gender || 'male'}
      >
        <RadioButton.Item label="Male" value="male" />
        <RadioButton.Item label="Female" value="female" />
        <RadioButton.Item label="Other" value="other" />
      </RadioButton.Group>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text variant="headlineMedium" style={styles.title}>Body Measurements</Text>
      <TextInput
        label="Height (cm)"
        value={formData.height?.toString() || ''}
        onChangeText={(text) => updateField('height', parseFloat(text) || 0)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Weight (kg)"
        value={formData.weight?.toString() || ''}
        onChangeText={(text) => updateField('weight', parseFloat(text) || 0)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text variant="headlineMedium" style={styles.title}>Fitness Level</Text>
      <Text variant="labelLarge" style={styles.label}>What's your current fitness level?</Text>
      <RadioButton.Group
        onValueChange={(value) => updateField('fitness_level', value)}
        value={formData.fitness_level || 'beginner'}
      >
        <RadioButton.Item label="Beginner" value="beginner" />
        <RadioButton.Item label="Intermediate" value="intermediate" />
        <RadioButton.Item label="Advanced" value="advanced" />
      </RadioButton.Group>
      <Text variant="labelLarge" style={[styles.label, { marginTop: 20 }]}>Activity Level</Text>
      <RadioButton.Group
        onValueChange={(value) => updateField('activity_level', value)}
        value={formData.activity_level || 'sedentary'}
      >
        <RadioButton.Item label="Sedentary" value="sedentary" />
        <RadioButton.Item label="Lightly Active" value="lightly_active" />
        <RadioButton.Item label="Moderately Active" value="moderately_active" />
        <RadioButton.Item label="Very Active" value="very_active" />
      </RadioButton.Group>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text variant="headlineMedium" style={styles.title}>Your Goal</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>What do you want to achieve?</Text>
      <RadioButton.Group
        onValueChange={(value) => updateField('goal', value)}
        value={formData.goal || 'maintenance'}
      >
        <RadioButton.Item label="Weight Loss" value="weight_loss" />
        <RadioButton.Item label="Muscle Gain" value="muscle_gain" />
        <RadioButton.Item label="Maintenance" value="maintenance" />
        <RadioButton.Item label="Endurance" value="endurance" />
      </RadioButton.Group>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            
            <View style={styles.buttonContainer}>
              {step > 1 && (
                <Button
                  mode="outlined"
                  onPress={() => setStep(step - 1)}
                  style={styles.button}
                >
                  Back
                </Button>
              )}
              <Button
                mode="contained"
                onPress={handleNext}
                style={[styles.button, { flex: 1, marginLeft: step > 1 ? 10 : 0 }]}
              >
                {step === 4 ? 'Complete' : 'Next'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    marginVertical: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  label: {
    marginTop: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  button: {
    minWidth: 100,
  },
});

