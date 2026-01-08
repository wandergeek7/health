import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { db } from '../services/database/db';

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserAndNavigate();
  }, []);

  async function checkUserAndNavigate() {
    try {
      const user = await db.getCurrentUser();
      if (user) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

