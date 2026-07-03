import React, { useState, useRef, useMemo } from 'react';
import { View, TextInput, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Check, ChevronLeft, Flame, Beef, Wheat, Droplet, Leaf, ChefHat } from 'lucide-react-native';
import { Text, Card, CardContent, CardHeader, CardTitle, Button, Icon, Input, Separator } from '../components/ui';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { useJournal } from '../context/JournalContext';
import { useMeal } from '../context/MealContext';
import { NutritionLevel, FoodItem, Meal } from '../types';
import FOODS from '../data/foods.json';

interface LocalFood {
  name: string; kw: string[]; cat: string;
  kcal: number; p: number; c: number; f: number; fib: number; sug: number;
  serving: string; g: number;
}

interface AutocompleteItem {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  portion: string;
  source: 'recent' | 'local' | 'api';
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack',
};

function gramsToLevel(grams: number): NutritionLevel {
  if (grams >= 20) return 'High';
  if (grams >= 10) return 'Medium';
  return 'Low';
}

export function ManualEntryScreen({ navigation: nav }: any) {
  const safeNav = nav || { goBack: () => {}, navigate: () => {} };
  const { userId } = useUser();
  const { addEntryLocal, allEntries } = useJournal();
  const { logMeal } = useMeal();

  const [dishName, setDishName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState<typeof MEAL_TYPES[number]>('lunch');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [fiberG, setFiberG] = useState('');
  const [sugarG, setSugarG] = useState('');
  const [sodiumMg, setSodiumMg] = useState('');

  const nameInputRef = useRef<TextInput>(null);
  const localFoods = FOODS as LocalFood[];

  const recentMeals = useMemo(() => {
    const seen = new Set<string>();
    return allEntries
      .filter(e => {
        if (seen.has(e.mealName)) return false;
        seen.add(e.mealName);
        return true;
      })
      .slice(0, 8)
      .map(e => ({
        name: e.mealName,
        calories: e.calories,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
        portion: '1 serving',
        source: 'recent' as const,
      }));
  }, [allEntries]);

  const searchResults = useMemo(() => {
    if (!dishName.trim()) return [];
    const q = dishName.toLowerCase().trim();
    if (q.length < 2) return [];
    const local = localFoods
      .filter(f => f.name.toLowerCase().includes(q) || f.kw.some(k => k.toLowerCase().includes(q)))
      .slice(0, 8)
      .map(f => ({
        name: f.name,
        calories: f.kcal,
        protein_g: f.p,
        carbs_g: f.c,
        fat_g: f.f,
        fiber_g: f.fib,
        sugar_g: f.sug,
        sodium_mg: 0,
        portion: f.serving,
        source: 'local' as const,
      }));
    return local;
  }, [dishName]);

  const suggestions = useMemo(() => {
    if (dishName.trim().length < 2) return recentMeals;
    const combined = [...searchResults];
    const seen = new Set<string>();
    return combined.filter(item => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    }).slice(0, 8);
  }, [dishName, searchResults, recentMeals]);

  const handleSelectSuggestion = (item: AutocompleteItem) => {
    setDishName(item.name);
    setCalories(String(item.calories));
    setProteinG(String(item.protein_g));
    setCarbsG(String(item.carbs_g));
    setFatG(String(item.fat_g));
    setFiberG(String(item.fiber_g));
    setSugarG(String(item.sugar_g));
    setSodiumMg(String(item.sodium_mg));
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleSave = async () => {
    if (!dishName.trim() || !userId) return;
    setSaving(true);
    try {
      const cal = Number(calories) || 0;
      const p = Number(proteinG) || 0;
      const c = Number(carbsG) || 0;
      const f = Number(fatG) || 0;
      const fib = Number(fiberG) || 0;
      const sug = Number(sugarG) || 0;
      const na = Number(sodiumMg) || 0;

      const meal: Meal = {
        id: `manual-${Date.now()}`,
        name: dishName.trim(),
        cuisine_origin: 'Manual',
        meal_type: selectedType as any,
        protein_tag: 'manual',
        season_tags: [],
        availability_countries: [],
        ingredients: [{
          name: dishName.trim(),
          amount: '1 serving',
          available_locally: true,
        }],
        replacements: [],
        recipe_text: '',
        video_query: '',
        protein_level: gramsToLevel(p),
        carbs_level: gramsToLevel(c),
        fiber_level: gramsToLevel(fib),
        fat_level: gramsToLevel(f),
        sugar_level: gramsToLevel(sug),
        calories: cal,
        prep_time: 'N/A',
        image_url: '',
      };

      await logMeal(userId, meal, 'manual');
      await addEntryLocal(meal, selectedType as any, 'manual', userId);
      safeNav.goBack();
    } catch {
      setErrorMsg('Could not save this meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasValues = calories !== '' || proteinG !== '' || carbsG !== '' || fatG !== '' || fiberG !== '' || sugarG !== '' || sodiumMg !== '';

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName='px-4 pb-8'
        keyboardShouldPersistTaps='always'
      >
        <View className='mb-4 flex-row items-center gap-2 pt-2'>
          <TouchableOpacity onPress={() => safeNav.goBack()} className='mr-2'>
            <Icon as={ChevronLeft} size={22} className='text-foreground' />
          </TouchableOpacity>
          <Text variant='h3' className='text-foreground tracking-tight'>Manual Entry</Text>
        </View>

        <Card className='mb-3'>
          <CardContent className='py-3 gap-2'>
            <Text className='text-muted-foreground text-xs font-semibold uppercase'>Dish Name</Text>
            <TextInput
              ref={nameInputRef}
              value={dishName}
              onChangeText={(v) => { setDishName(v); setShowSuggestions(true); }}
              onFocus={handleFocus}
              placeholder='e.g. Bhuna Khichuri with egg'
              placeholderTextColor='#9CA3AF'
              className='border-border rounded-lg border px-3 py-2.5 text-foreground text-sm'
            />

            {showSuggestions && suggestions.length > 0 && dishName.trim().length < 2 && (
              <View className='bg-card border-border rounded-lg border mt-1'>
                <Text className='text-muted-foreground text-xs px-3 pt-2 pb-1'>Recent meals</Text>
                {suggestions.map((item, i) => (
                  <TouchableOpacity
                    key={`recent-${i}`}
                    onPress={() => handleSelectSuggestion(item)}
                    className='px-3 py-2 active:bg-muted'
                  >
                    <Text className='text-foreground text-sm'>{item.name}</Text>
                    <Text className='text-muted-foreground text-xs'>{item.calories} kcal</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showSuggestions && suggestions.length > 0 && dishName.trim().length >= 2 && (
              <View className='bg-card border-border rounded-lg border mt-1'>
                {suggestions.map((item, i) => (
                  <TouchableOpacity
                    key={`search-${i}`}
                    onPress={() => handleSelectSuggestion(item)}
                    className='flex-row items-center justify-between px-3 py-2 active:bg-muted'
                  >
                    <View className='flex-1'>
                      <Text className='text-foreground text-sm font-medium'>{item.name}</Text>
                      <Text className='text-muted-foreground text-xs'>{item.portion} · {item.calories} kcal</Text>
                    </View>
                    <Text className='text-muted-foreground text-xs'>{item.source === 'local' ? 'Library' : 'Recent'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        <Card className='mb-3'>
          <CardHeader className='pb-1'>
            <View className='flex-row items-center gap-2'>
              <Icon as={Flame} size={14} className='text-orange-500' />
              <CardTitle>Nutrition (per serving)</CardTitle>
            </View>
          </CardHeader>
          <CardContent className='gap-3'>
            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Flame} size={14} className='text-red-500' />
                <Text className='text-foreground text-sm'>Calories</Text>
              </View>
              <View className='flex-row items-center gap-1'>
                <Input
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType='numeric'
                  placeholder='0'
                  className='w-20 text-right text-sm'
                />
                <Text className='text-muted-foreground text-xs'>kcal</Text>
              </View>
            </View>

            <Separator />

            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Beef} size={14} className='text-green-600' />
                <Text className='text-foreground text-sm'>Protein</Text>
              </View>
              <View className='flex-row items-center gap-1'>
                <Input
                  value={proteinG}
                  onChangeText={setProteinG}
                  keyboardType='numeric'
                  placeholder='0'
                  className='w-20 text-right text-sm'
                />
                <Text className='text-muted-foreground text-xs'>g</Text>
              </View>
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Wheat} size={14} className='text-amber-600' />
                <Text className='text-foreground text-sm'>Carbs</Text>
              </View>
              <View className='flex-row items-center gap-1'>
                <Input
                  value={carbsG}
                  onChangeText={setCarbsG}
                  keyboardType='numeric'
                  placeholder='0'
                  className='w-20 text-right text-sm'
                />
                <Text className='text-muted-foreground text-xs'>g</Text>
              </View>
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Droplet} size={14} className='text-purple-500' />
                <Text className='text-foreground text-sm'>Fat</Text>
              </View>
              <View className='flex-row items-center gap-1'>
                <Input
                  value={fatG}
                  onChangeText={setFatG}
                  keyboardType='numeric'
                  placeholder='0'
                  className='w-20 text-right text-sm'
                />
                <Text className='text-muted-foreground text-xs'>g</Text>
              </View>
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Leaf} size={14} className='text-green-600' />
                <Text className='text-foreground text-sm'>Fiber</Text>
              </View>
              <View className='flex-row items-center gap-1'>
                <Input
                  value={fiberG}
                  onChangeText={setFiberG}
                  keyboardType='numeric'
                  placeholder='0'
                  className='w-20 text-right text-sm'
                />
                <Text className='text-muted-foreground text-xs'>g</Text>
              </View>
            </View>

            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center gap-2'>
                <Icon as={ChefHat} size={14} className='text-pink-500' />
                <Text className='text-foreground text-sm'>Sugar</Text>
              </View>
              <View className='flex-row items-center gap-1'>
                <Input
                  value={sugarG}
                  onChangeText={setSugarG}
                  keyboardType='numeric'
                  placeholder='0'
                  className='w-20 text-right text-sm'
                />
                <Text className='text-muted-foreground text-xs'>g</Text>
              </View>
            </View>

            <Separator />

            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Droplet} size={14} className='text-blue-500' />
                <Text className='text-foreground text-sm'>Sodium</Text>
              </View>
              <View className='flex-row items-center gap-1'>
                <Input
                  value={sodiumMg}
                  onChangeText={setSodiumMg}
                  keyboardType='numeric'
                  placeholder='0'
                  className='w-20 text-right text-sm'
                />
                <Text className='text-muted-foreground text-xs'>mg</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card className='mb-3'>
          <CardHeader className='pb-1'>
            <CardTitle>Log as</CardTitle>
          </CardHeader>
          <CardContent className='flex-row flex-wrap gap-2.5'>
            {MEAL_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                className={`rounded-lg px-5 py-2.5 ${selectedType === type ? 'bg-primary shadow-sm' : 'bg-muted border border-border/40'}`}
              >
                <Text className={selectedType === type ? 'text-primary-foreground text-base font-semibold' : 'text-foreground text-sm font-medium'}>
                  {MEAL_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </CardContent>
        </Card>

        {errorMsg && (
          <View className='bg-red-50 border border-red-200 rounded-lg p-3 mb-3'>
            <Text className='text-red-600 text-xs'>{errorMsg}</Text>
          </View>
        )}

        <Button onPress={handleSave} disabled={saving || !dishName.trim()} className='mt-2'>
          {saving ? (
            <ActivityIndicator size='small' className='text-primary-foreground' />
          ) : (
            <>
              <Icon as={Check} size={16} className='text-primary-foreground' />
              <Text className='text-primary-foreground'>Save Meal</Text>
            </>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
