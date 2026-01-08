import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Text, Button, TextInput, Dialog, Portal, Searchbar, SegmentedButtons } from 'react-native-paper';
import { db } from '../../services/database/db';
import { FoodItem, FoodLog, UserProfile } from '../../types';
import { format } from 'date-fns';

export default function FoodScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await db.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const today = format(new Date(), 'yyyy-MM-dd');
        const logs = await db.getFoodLogs(currentUser.id!, today);
        setFoodLogs(logs);
      }
    } catch (error) {
      console.error('Error loading food logs:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await db.searchFoodItems(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setSearchResults([]);
  };

  const handleAddFood = async () => {
    if (!user || !selectedFood || !quantity) {
      alert('Please select a food and enter quantity');
      return;
    }

    try {
      await db.logFood({
        user_id: user.id!,
        food_item_id: selectedFood.id!,
        quantity: parseFloat(quantity),
        meal_type: mealType,
        date: new Date().toISOString(),
      });
      
      setDialogVisible(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error logging food:', error);
      alert('Failed to log food');
    }
  };

  const resetForm = () => {
    setSelectedFood(null);
    setSearchQuery('');
    setQuantity('');
    setMealType('breakfast');
    setSearchResults([]);
  };

  const getMealTypeLogs = (type: string) => {
    return foodLogs.filter(log => log.meal_type === type);
  };

  const calculateMealTotal = (logs: any[]) => {
    return logs.reduce((sum, log) => sum + (log.calories || 0), 0);
  };

  const renderFoodLog = ({ item }: { item: any }) => (
    <Card style={styles.foodCard}>
      <Card.Content>
        <View style={styles.foodRow}>
          <Text variant="bodyLarge">{item.food_name}</Text>
          <Text variant="bodyMedium">{Math.round(item.calories || 0)} kcal</Text>
        </View>
        <Text variant="bodySmall" style={styles.quantity}>
          {item.quantity}g • P: {Math.round(item.protein || 0)}g • C: {Math.round(item.carbs || 0)}g • F: {Math.round(item.fats || 0)}g
        </Text>
      </Card.Content>
    </Card>
  );

  const renderMealSection = (type: string, label: string) => {
    const mealLogs = getMealTypeLogs(type);
    const total = calculateMealTotal(mealLogs);
    
    return (
      <View style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text variant="titleMedium">{label}</Text>
          <Text variant="bodyLarge">{Math.round(total)} kcal</Text>
        </View>
        {mealLogs.length > 0 ? (
          <FlatList
            data={mealLogs}
            renderItem={renderFoodLog}
            keyExtractor={(item) => item.id?.toString() || ''}
            scrollEnabled={false}
          />
        ) : (
          <Text variant="bodySmall" style={styles.emptyMeal}>No items logged</Text>
        )}
      </View>
    );
  };

  const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text variant="headlineSmall">Today's Calories</Text>
        <Text variant="headlineMedium" style={styles.totalCalories}>
          {Math.round(totalCalories)} kcal
        </Text>
      </View>

      <FlatList
        data={['breakfast', 'lunch', 'dinner', 'snack']}
        renderItem={({ item }) => {
          const labels: Record<string, string> = {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snacks',
          };
          return renderMealSection(item, labels[item]);
        }}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title>Log Food</Dialog.Title>
          <Dialog.Content>
            <Searchbar
              placeholder="Search food..."
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchbar}
            />
            {searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                renderItem={({ item }) => (
                  <Button
                    onPress={() => handleSelectFood(item)}
                    style={styles.foodOption}
                  >
                    {item.name} ({item.calories_per_100g} kcal/100g)
                  </Button>
                )}
                keyExtractor={(item) => item.id?.toString() || ''}
                style={styles.searchResults}
              />
            )}
            {selectedFood && (
              <>
                <Text variant="bodyMedium" style={styles.selectedFood}>
                  Selected: {selectedFood.name}
                </Text>
                <TextInput
                  label="Quantity (grams)"
                  value={quantity}
                  onChangeText={setQuantity}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Text variant="labelLarge" style={styles.label}>Meal Type</Text>
                <SegmentedButtons
                  value={mealType}
                  onValueChange={(value) => setMealType(value as any)}
                  buttons={[
                    { value: 'breakfast', label: 'Breakfast' },
                    { value: 'lunch', label: 'Lunch' },
                    { value: 'dinner', label: 'Dinner' },
                    { value: 'snack', label: 'Snack' },
                  ]}
                />
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setDialogVisible(false);
              resetForm();
            }}>Cancel</Button>
            <Button onPress={handleAddFood} disabled={!selectedFood || !quantity}>Add</Button>
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
  summaryCard: {
    backgroundColor: '#6200ee',
    padding: 20,
    alignItems: 'center',
  },
  totalCalories: {
    color: '#fff',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  mealSection: {
    marginBottom: 24,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodCard: {
    marginBottom: 8,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quantity: {
    color: '#666',
  },
  emptyMeal: {
    color: '#999',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  dialog: {
    maxHeight: '80%',
  },
  searchbar: {
    marginBottom: 12,
  },
  searchResults: {
    maxHeight: 200,
    marginBottom: 12,
  },
  foodOption: {
    marginBottom: 4,
  },
  selectedFood: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginTop: 8,
    marginBottom: 8,
  },
});

