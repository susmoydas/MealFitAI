import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, Search, ChefHat, Filter, X, Check, RefreshCw } from 'lucide-react-native';
import { useMeal } from '../context/MealContext';
import { MealCard } from '../components/MealCard';
import { Text, Input, Icon, Badge, Button } from '../components/ui';
import { Meal } from '../types';
import { MOCK_MEALS } from '../data/mockData';
import { recipeApi } from '../services/recipeApi';

const CATEGORIES = ['All', 'dessert', 'breakfast', 'seafood', 'vegetarian', 'chicken', 'beef', 'pasta', 'salad', 'soup', 'smoothie', 'bread'];
const CUISINES = ['Indian', 'Japanese', 'Korean', 'Chinese', 'Mexican', 'Italian', 'American', 'French', 'Thai', 'Mediterranean', 'Bangladeshi', 'Pakistani', 'Turkish', 'Greek', 'Middle Eastern'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIET_TAGS = ['Vegetarian', 'Vegan', 'High Protein', 'Low Carb', 'Chicken', 'Fish', 'Beef'];
const COOK_TIMES = ['Under 15 min', 'Under 30 min', 'Under 1 hour'];

const CACHE_KEY = 'recipe_library_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

function matchCookTime(prepTime: string, filter: string): boolean {
  const min = parseInt(prepTime, 10);
  if (isNaN(min)) return true;
  if (filter === 'Under 15 min') return min <= 15;
  if (filter === 'Under 30 min') return min <= 30;
  if (filter === 'Under 1 hour') return min <= 60;
  return true;
}

function deduplicateByName(meals: Meal[]): Meal[] {
  const seen = new Set<string>();
  return meals.filter(m => {
    const key = m.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

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

export function RecipeLibraryScreen({ navigation }: any) {
  const { setActiveMeal } = useMeal();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedCookTime, setSelectedCookTime] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [allRecipes, setAllRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineCacheReady, setOfflineCacheReady] = useState(false);
  const mountedRef = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadFromCache = useCallback(async (): Promise<Meal[] | null> => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > CACHE_EXPIRY_MS) return null;
      return data as Meal[];
    } catch {
      return null;
    }
  }, []);

  const saveToCache = useCallback(async (meals: Meal[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        data: meals,
        timestamp: Date.now(),
      }));
    } catch {}
  }, []);

  const fetchAllRecipes = useCallback(async (): Promise<Meal[]> => {
    const results: Meal[][] = [];

    const randomPromise = recipeApi.getRandomRecipes(50).catch(() => [] as Meal[]);

    const cuisinePromises = CUISINES.map(c =>
      recipeApi.getRecipesByCuisine(c).catch(() => [] as Meal[])
    );

    const settled = await Promise.allSettled([randomPromise, ...cuisinePromises]);
    settled.forEach(r => {
      if (r.status === 'fulfilled' && r.value.length > 0) {
        results.push(r.value);
      }
    });

    const merged = deduplicateByName(results.flat());
    return merged;
  }, []);

  const initialLoad = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const cached = await loadFromCache();
      if (!forceRefresh && cached && cached.length >= 80) {
        setAllRecipes(cached);
        setOfflineCacheReady(true);
        setLoading(false);
        return;
      }

      const apiRecipes = await fetchAllRecipes();
      const combined = deduplicateByName([...apiRecipes, ...MOCK_MEALS]);
      setAllRecipes(combined);
      setOfflineCacheReady(true);
      saveToCache(combined);
    } catch {
      const cached = await loadFromCache();
      if (cached && cached.length > 0) {
        setAllRecipes(cached);
        setOfflineCacheReady(true);
      } else {
        setAllRecipes(MOCK_MEALS);
        setOfflineCacheReady(true);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAllRecipes, loadFromCache, saveToCache]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    await initialLoad(true);
    setRefreshing(false);
  }, [initialLoad]);

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore || isOffline) return;
    setLoadingMore(true);
    try {
      const more = await recipeApi.getRandomRecipes(30);
      if (more.length === 0) {
        setHasMore(false);
      } else {
        setAllRecipes(prev => {
          const updated = deduplicateByName([...prev, ...more]);
          saveToCache(updated);
          return updated;
        });
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, isOffline, saveToCache]);

  useEffect(() => {
    mountedRef.current = true;
    initialLoad();
    return () => { mountedRef.current = false; };
  }, [initialLoad]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const searchableMeals = useMemo(() => {
    return allRecipes.map(m => ({ meal: m, searchable: getSearchableText(m) }));
  }, [allRecipes]);

  const filtered = useMemo(() => {
    let m = allRecipes;

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      m = m.filter(meal => getSearchableText(meal).includes(q));
    }

    if (selectedCategory !== 'All') {
      m = m.filter(meal =>
        meal.meal_type === selectedCategory ||
        meal.protein_tag === selectedCategory ||
        meal.cuisine_origin.toLowerCase() === selectedCategory
      );
    }

    if (selectedCuisines.length > 0) {
      m = m.filter(meal => selectedCuisines.includes(meal.cuisine_origin));
    }
    if (selectedTypes.length > 0) {
      const typeMap: Record<string, string> = { Breakfast: 'breakfast', Lunch: 'lunch', Dinner: 'dinner', Snack: 'snack' };
      const types = selectedTypes.map(t => typeMap[t]).filter(Boolean);
      m = m.filter(meal => types.includes(meal.meal_type));
    }
    if (selectedDiets.length > 0) {
      m = m.filter(meal =>
        selectedDiets.some(d => {
          if (d === 'Vegetarian') return ['paneer', 'tofu', 'lentil', 'chickpea', 'cheese', 'oat', 'rice', 'vegetable', 'egg', 'noodle', 'pasta'].includes(meal.protein_tag);
          if (d === 'Vegan') return ['tofu', 'lentil', 'chickpea', 'oat', 'rice', 'vegetable', 'noodle', 'pasta'].includes(meal.protein_tag);
          if (d === 'High Protein') return meal.protein_level === 'High';
          if (d === 'Low Carb') return meal.carbs_level === 'Low';
          return meal.protein_tag === d.toLowerCase();
        })
      );
    }
    if (selectedCookTime) {
      m = m.filter(meal => matchCookTime(meal.prep_time || '20 min', selectedCookTime));
    }
    return m;
  }, [allRecipes, debouncedQuery, selectedCategory, selectedCuisines, selectedTypes, selectedDiets, selectedCookTime]);

  const handleMealPress = (meal: Meal) => {
    setActiveMeal(meal);
    navigation.navigate('MealDetail');
  };

  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const activeFilterCount = selectedCuisines.length + selectedTypes.length + selectedDiets.length + (selectedCookTime ? 1 : 0);

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top']}>
      <View className='px-4 pb-2 pt-2'>
        {/* HEADER: icon + title + count on same row, count right-aligned */}
        <View className='mb-3 flex-row items-center justify-between'>
          <View className='flex-row items-center gap-2'>
            <Icon as={Book} size={22} className='text-foreground' />
            <Text variant='h4'>Recipe Library</Text>
          </View>
          <View className='flex-row items-center gap-3'>
            {allRecipes.length > 0 && (
              <Text className='text-foreground text-sm font-semibold'>{allRecipes.length} Recipes</Text>
            )}
            <TouchableOpacity
              className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${activeFilterCount > 0 ? 'bg-primary' : 'bg-muted'}`}
              onPress={() => setShowFilter(true)}
            >
              <Icon as={Filter} size={16} className={activeFilterCount > 0 ? 'text-primary-foreground' : 'text-muted-foreground'} />
              <Text className={activeFilterCount > 0 ? 'text-primary-foreground text-sm font-semibold' : 'text-muted-foreground text-sm'}>
                Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mb-3'>
          <View className='flex-row gap-2'>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                className={`px-4 py-2 rounded-full ${selectedCategory === category ? 'bg-primary' : 'bg-muted'}`}
                onPress={() => setSelectedCategory(category)}
              >
                <Text className={selectedCategory === category ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
                  {category === 'All' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Search input */}
        <View className='relative mb-3'>
          <Icon as={Search} size={18} className='text-muted-foreground absolute left-3 top-2.5 z-10' />
          <Input
            placeholder='Search recipes, ingredients, cuisine, tags...'
            className='bg-card pl-10 pr-10'
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity className='absolute right-3 top-2.5' onPress={() => setQuery('')}>
              <Icon as={X} size={18} className='text-muted-foreground' />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className='flex-1 items-center justify-center px-4'>
          <ActivityIndicator size='large' className='text-primary mb-4' />
          <Text variant='h4' className='text-center'>Loading recipes...</Text>
          <Text variant='muted' className='text-center mt-1'>Building your international recipe library.</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View className='flex-1 items-center justify-center px-4 pb-16'>
          <Icon as={ChefHat} size={48} className='text-muted-foreground mb-4' />
          <Text variant='h4' className='text-center'>No recipes found</Text>
          <Text variant='muted' className='text-center mt-1'>
            {debouncedQuery
              ? `No results for "${debouncedQuery}". Try a different search term or browse categories above.`
              : 'Try adjusting the filters to see more recipes.'}
          </Text>
          {debouncedQuery && (
            <View className='mt-4 gap-2'>
              <Text className='text-muted-foreground text-sm text-center'>Suggestions:</Text>
              {[
                'Try a cuisine name (e.g., Italian, Thai)',
                'Try an ingredient (e.g., chicken, tofu)',
                'Try a meal type (e.g., breakfast, dinner)',
                'Try a tag (e.g., High Protein, Vegan)',
              ].map((s, i) => (
                <Text key={i} className='text-muted-foreground text-xs text-center'>• {s}</Text>
              ))}
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={m => m.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerClassName='px-4 pb-8'
          columnWrapperClassName='gap-3'
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          renderItem={({ item }) => (
            <View className='flex-1 mb-3'>
              <MealCard meal={item} onPress={handleMealPress} compact />
            </View>
          )}
          onEndReached={() => {
            if (!debouncedQuery && selectedCategory === 'All' && filtered.length >= allRecipes.length - 5) {
              fetchMore();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            loadingMore ? (
              <View className='py-4 items-center'>
                <ActivityIndicator size='small' className='text-primary' />
                <Text className='text-muted-foreground text-xs mt-2'>Loading more recipes...</Text>
              </View>
            ) : !hasMore && !debouncedQuery ? (
              <View className='py-4 items-center'>
                <Text className='text-muted-foreground text-xs'>All recipes loaded.</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType='slide' transparent>
        <View className='flex-1 bg-black/40 justify-end'>
          <View className='bg-background rounded-t-2xl max-h-[80%]'>
            <View className='flex-row items-center justify-between px-4 py-4 border-b border-border'>
              <Text variant='h4'>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Icon as={X} size={22} className='text-muted-foreground' />
              </TouchableOpacity>
            </View>
            <ScrollView className='px-4 pb-8'>
              <FilterSection title='Cuisine'>
                <View className='flex-row flex-wrap gap-2'>
                  {CUISINES.map(c => (
                    <FilterPill key={c} label={c} selected={selectedCuisines.includes(c)} onPress={() => setSelectedCuisines(prev => toggleArray(prev, c))} />
                  ))}
                </View>
              </FilterSection>
              <FilterSection title='Meal Type'>
                <View className='flex-row flex-wrap gap-2'>
                  {MEAL_TYPES.map(t => (
                    <FilterPill key={t} label={t} selected={selectedTypes.includes(t)} onPress={() => setSelectedTypes(prev => toggleArray(prev, t))} />
                  ))}
                </View>
              </FilterSection>
              <FilterSection title='Diet & Preference'>
                <View className='flex-row flex-wrap gap-2'>
                  {DIET_TAGS.map(d => (
                    <FilterPill key={d} label={d} selected={selectedDiets.includes(d)} onPress={() => setSelectedDiets(prev => toggleArray(prev, d))} />
                  ))}
                </View>
              </FilterSection>
              <FilterSection title='Cooking Time'>
                <View className='flex-row flex-wrap gap-2'>
                  {COOK_TIMES.map(t => (
                    <FilterPill key={t} label={t} selected={selectedCookTime === t} onPress={() => setSelectedCookTime(selectedCookTime === t ? null : t)} />
                  ))}
                </View>
              </FilterSection>
              <View className='flex-row gap-3 mt-6'>
                <Button variant='outline' onPress={() => { setSelectedCuisines([]); setSelectedTypes([]); setSelectedDiets([]); setSelectedCookTime(null); }} className='flex-1'>
                  <Text>Clear All</Text>
                </Button>
                <Button onPress={() => setShowFilter(false)} className='flex-1'>
                  <Text>Done</Text>
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className='mb-5'>
      <Text className='text-foreground font-semibold mb-2'>{title}</Text>
      {children}
    </View>
  );
}

function FilterPill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-2 ${selected ? 'bg-primary' : 'bg-muted'}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className={selected ? 'text-primary-foreground text-sm font-semibold' : 'text-foreground text-sm'}>
        {label}
      </Text>
      {selected && <Icon as={Check} size={14} className='text-primary-foreground' />}
    </TouchableOpacity>
  );
}
