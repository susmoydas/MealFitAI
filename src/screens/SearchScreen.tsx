import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Search as SearchIcon, ChefHat } from 'lucide-react-native';
import { useMeal } from '../context/MealContext';
import { MealCard } from '../components/MealCard';
import { Text, Input, Icon } from '../components/ui';
import { Meal } from '../types';
import { MOCK_MEALS } from '../data/mockData';
import { recipeApi } from '../services/recipeApi';

const CACHE_KEY = 'recipe_library_cache';

function getSearchableText(meal: Meal): string {
  const parts = [
    meal.name,
    meal.cuisine_origin,
    meal.meal_type,
    meal.protein_tag || '',
    ...meal.ingredients.map(i => i.name),
    ...meal.season_tags,
  ];
  return parts.join(' ').toLowerCase();
}

export function SearchScreen({ navigation }: any) {
  const { setActiveMeal } = useMeal();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [allRecipes, setAllRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQ(q);
    }, 250);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [q]);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const { data } = JSON.parse(raw);
        if (data && data.length > 0) {
          setAllRecipes(data);
          setLoading(false);
          return;
        }
      }

      const apiRecipes = await recipeApi.getRandomRecipes(50).catch(() => [] as Meal[]);
      const combined = [...apiRecipes, ...MOCK_MEALS];
      const seen = new Set<string>();
      const deduped = combined.filter(m => {
        const key = m.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setAllRecipes(deduped);
    } catch {
      setAllRecipes(MOCK_MEALS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const results = useMemo(() => {
    if (!debouncedQ) return [];
    const term = debouncedQ.toLowerCase();
    return allRecipes.filter(meal => getSearchableText(meal).includes(term));
  }, [allRecipes, debouncedQ]);

  const handlePress = (meal: Meal) => {
    setActiveMeal(meal);
    navigation.navigate('MealDetail');
  };

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top', 'bottom']}>
      <View className='flex-row items-center gap-3 px-4 pb-3 pt-2'>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon as={ArrowLeft} size={22} className='text-primary' />
        </TouchableOpacity>
        <View className='relative flex-1'>
          <Icon as={SearchIcon} size={18} className='text-muted-foreground absolute left-3 top-2.5 z-10' />
          <Input
            placeholder='Search recipes, ingredients, cuisine, tags...'
            className='bg-card pl-10'
            value={q}
            onChangeText={setQ}
            autoFocus
          />
        </View>
      </View>

      {loading ? (
        <View className='flex-1 items-center justify-center gap-3'>
          <ActivityIndicator size='large' className='text-primary' />
          <Text variant='muted'>Loading recipes...</Text>
        </View>
      ) : !debouncedQ ? (
        <View className='flex-1 items-center justify-center px-4'>
          <Icon as={SearchIcon} size={48} className='text-muted-foreground mb-3' />
          <Text variant='h4'>Search Meals</Text>
          <Text variant='muted' className='text-center mt-1'>
            Type a meal name, cuisine, ingredient, or tag above.
          </Text>
          <Text variant='muted' className='text-center mt-1'>
            Try 'chicken', 'italian', 'salad', 'high protein', or 'summer'
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View className='flex-1 items-center justify-center px-4'>
          <Icon as={ChefHat} size={48} className='text-muted-foreground mb-3' />
          <Text variant='h4'>No meals found for "{debouncedQ}"</Text>
          <Text variant='muted' className='text-center mt-1'>Try a different search term.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={m => m.id}
          contentContainerClassName='px-4 pb-8'
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          renderItem={({ item }) => (
            <View className='mb-3'>
              <MealCard meal={item} onPress={handlePress} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
