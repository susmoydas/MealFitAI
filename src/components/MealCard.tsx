import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { Meal } from '../types';
import { FoodImage } from './ui/FoodImage';
import { Text, Icon } from './ui';
import { estimateCookTime } from '../utils/nutrition';

interface Props {
  meal: Meal;
  onPress: (meal: Meal) => void;
  compact?: boolean;
  score?: number;
}

function getTag(meal: Meal): string | null {
  if (meal.protein_level === 'High') return 'High Protein';
  if (meal.season_tags.includes('summer') && meal.protein_level !== 'Low') return 'Summer Special';
  if (meal.season_tags.includes('winter')) return 'Winter Special';
  if (meal.season_tags.includes('monsoon')) return 'Monsoon Special';
  if (meal.calories <= 300) return 'Light Meal';
  return null;
}

const CUISINE_COLORS: Record<string, string> = {
  Indian: 'bg-orange-100 text-orange-700',
  Bangladeshi: 'bg-green-100 text-green-700',
  Japanese: 'bg-red-100 text-red-700',
  Korean: 'bg-yellow-100 text-yellow-700',
  Chinese: 'bg-red-100 text-red-700',
  Mexican: 'bg-green-100 text-green-700',
  Italian: 'bg-blue-100 text-blue-700',
  Mediterranean: 'bg-teal-100 text-teal-700',
  Thai: 'bg-purple-100 text-purple-700',
  American: 'bg-blue-100 text-blue-700',
  French: 'bg-indigo-100 text-indigo-700',
};

export function MealCard({ meal, onPress, compact, score }: Props) {
  const cals = meal.calories;
  const cook = meal.prep_time || estimateCookTime(meal.recipe_text);
  const cuisineStyle = CUISINE_COLORS[meal.cuisine_origin] || 'bg-muted text-muted-foreground';
  const tag = getTag(meal);

  if (compact) {
    return (
      <TouchableOpacity
        className='bg-card border-border w-full rounded-xl border shadow-sm shadow-black/5'
        onPress={() => onPress(meal)}
        activeOpacity={0.85}
      >
        <View className='aspect-square w-full overflow-hidden rounded-t-xl'>
          <FoodImage uri={meal.image_url} className='size-full' />
        </View>
        {tag && (
          <View className='absolute left-2 top-2'>
            <View className='rounded-full bg-white px-2 py-0.5'>
              <Text className='text-black text-xs font-medium'>{tag}</Text>
            </View>
          </View>
        )}
        <View className='absolute right-2 top-2'>
          <View className='flex-row items-center gap-1 rounded-full bg-black/50 px-2 py-0.5'>
            <Icon as={Clock} size={10} className='text-white' />
            <Text className='text-white text-xs'>{cook}</Text>
          </View>
        </View>
        <View className='gap-1 p-3'>
          <Text className='text-foreground text-sm font-semibold' numberOfLines={1}>{meal.name}</Text>
          <View className='flex-row items-center gap-1.5'>
            <Text className={`rounded px-1.5 py-0.5 text-xs font-bold ${cuisineStyle}`}>
              {meal.cuisine_origin}
            </Text>
            <Text className='text-muted-foreground text-xs'>{cals} cal</Text>
          </View>
          <View className='mt-1 flex-row gap-3'>
            <NutPill label='P' value={meal.protein_level} />
            <NutPill label='C' value={meal.carbs_level} />
            <NutPill label='F' value={meal.fiber_level} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className='bg-card border-border w-48 rounded-xl border shadow-sm shadow-black/5'
      onPress={() => onPress(meal)}
      activeOpacity={0.85}
    >
      <View className='h-48 w-full overflow-hidden rounded-t-xl'>
        <FoodImage uri={meal.image_url} className='size-full' />
      </View>
      {tag && (
        <View className='absolute left-2 top-2'>
          <View className='rounded-full bg-white px-2 py-0.5'>
            <Text className='text-black text-xs font-medium'>{tag}</Text>
          </View>
        </View>
      )}
      <View className='absolute right-2 top-2'>
        <View className='flex-row items-center gap-1 rounded-full bg-black/50 px-2 py-0.5'>
          <Icon as={Clock} size={10} className='text-white' />
          <Text className='text-white text-xs'>{cook}</Text>
        </View>
      </View>
      <View className='gap-1.5 p-3'>
        <Text className='text-foreground text-sm font-semibold' numberOfLines={1}>{meal.name}</Text>
        <Text className={`rounded self-start px-1.5 py-0.5 text-xs font-bold ${cuisineStyle}`}>
          {meal.cuisine_origin}
        </Text>
        <View className='mt-1 flex-row gap-1.5'>
          <NutPill label='P' value={meal.protein_level} />
          <NutPill label='C' value={meal.carbs_level} />
          <NutPill label='F' value={meal.fiber_level} />
        </View>
        {score !== undefined && (
          <View className='flex-row items-center gap-1'>
            <Text className='text-xs text-amber-500'>★ AI Match</Text>
            <Text className='text-muted-foreground text-xs'>{score}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const PILL_STYLES: Record<string, string> = {
  High: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-slate-200 text-slate-700',
};

function NutPill({ label, value }: { label: string; value: string }) {
  const style = PILL_STYLES[value] || PILL_STYLES.Medium;
  return (
    <Text className={`rounded px-1.5 py-0.5 text-xs font-bold ${style}`}>{label}</Text>
  );
}
