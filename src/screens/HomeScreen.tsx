import React, { useEffect, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search, ChefHat, Thermometer, Apple, Lightbulb,
  Flame, Beef, Leaf, Clock, ArrowRight, Footprints,
  Droplets, Wheat,
} from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { useMeal } from '../context/MealContext';
import { useJournal } from '../context/JournalContext';
import { MealCard } from '../components/MealCard';
import { FoodImage } from '../components/ui/FoodImage';
import {
  Text, Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Icon,
} from '../components/ui';
import { Meal } from '../types';
import { getSeasonalPicks } from '../data/mockData';
import { estimateProteinG, estimateCarbsG, estimateFiberG, estimateFatG } from '../utils/nutrition';

export function HomeScreen({ navigation }: any) {
  const { userId } = useUser();
  const { recs, loading, error, fetchRecs, setActiveMeal } = useMeal();
  const { todayEntries, weekEntries } = useJournal();

  useEffect(() => {
    if (userId) fetchRecs(userId);
  }, [userId]);

  const handleMealPress = (meal: Meal) => { setActiveMeal(meal); navigation.navigate('MealDetail'); };

  const weather = recs?.weather;
  const primary = recs?.primary;
  const alternatives = recs?.alternatives ?? [];
  const healthTip = recs?.healthTip;
  const seasonalPicks = recs?.seasonalPicks ?? (recs ? getSeasonalPicks() : []);
  const restaurants = recs?.restaurants ?? [];

  const todayCalories = useMemo(() => todayEntries.reduce((s, e) => s + e.calories, 0), [todayEntries]);
  const steps = weather?.daily_steps ?? 0;
  const stepGoal = weather?.step_goal ?? 8000;
  const stepPct = stepGoal > 0 ? Math.min(100, Math.round((steps / stepGoal) * 100)) : 0;

  // Smart reminder cards based on context
  // 7-day nutrition analysis for smarter recommendations
  const weekAnalysis = useMemo(() => {
    if (weekEntries.length === 0) return null;
    const highP = weekEntries.filter(e => e.proteinLevel === 'High').length / weekEntries.length;
    const highF = weekEntries.filter(e => e.fiberLevel === 'High').length / weekEntries.length;
    const tagCounts: Record<string, number> = {};
    weekEntries.forEach(e => {
      const t = (e.proteinTag || 'other').toLowerCase();
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
    const mostRepeated = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      protein: highP > 0.4 ? 'High' : highP > 0.2 ? 'Medium' : 'Low',
      fiber: highF > 0.4 ? 'High' : highF > 0.2 ? 'Medium' : 'Low',
      repeated: mostRepeated ? mostRepeated[1] : 0,
      repeatedTag: mostRepeated ? mostRepeated[0] : '',
      totalMeals: weekEntries.length,
    };
  }, [weekEntries]);

  // Build enriched recommendation reason from weather + history
  const enrichedReason = useMemo(() => {
    if (!primary) return '';
    const mealName = primary.name;
    const proteinTag = primary.protein_tag;
    const cuisine = primary.cuisine_origin;
    const mealType = primary.meal_type;

    const parts: string[] = [];
    if (weather) {
      if (weather.condition === 'heatwave') parts.push('a light meal for this hot day');
      else if (weather.condition === 'cold') parts.push('a warming dish for this cold day');
      else if (weather.condition === 'monsoon') parts.push('perfect for monsoon season');
      else if (weather.season) parts.push(`a great ${weather.season} pick`);
    }
    if (weekAnalysis) {
      if (weekAnalysis.protein === 'Low') parts.push('to boost your protein intake');
      if (weekAnalysis.fiber === 'Low') parts.push('to add more fiber to your diet');
    }
    if (parts.length === 0) parts.push('matched to your preferences');

    return `${mealName} — ${cuisine} ${proteinTag} for ${mealType}. ${parts.join(', ')}.`;
  }, [weather, weekAnalysis, primary]);

  const reminders = useMemo(() => {
    const r: { icon: any; title: string; desc: string; color: string }[] = [];
    if (weather) {
      if (weather.condition === 'heatwave' || weather.temp_c >= 30) {
        r.push({ icon: Droplets, title: 'Stay Hydrated', desc: 'Hot day — drink plenty of water and try fruit juices.', color: 'text-blue-500' });
      }
      if (weather.condition === 'heatwave' || weather.season === 'summer') {
        r.push({ icon: Apple, title: 'Fruit Time', desc: 'Seasonal fruits like mango and watermelon are perfect today.', color: 'text-green-500' });
      }
    }
    if (steps > 0) {
      const pctMsg = stepPct < 50 ? 'You\'re below your step goal. Try a light walk after meals.' : 'Great activity today — protein-rich meals support recovery.';
      r.push({ icon: Footprints, title: stepPct < 50 ? 'Activity Goal' : 'Well Done', desc: pctMsg, color: 'text-orange-500' });
    }
    if (primary && primary.protein_level === 'Low') {
      r.push({ icon: Beef, title: 'Protein Boost', desc: 'Today\'s pick is low in protein. Consider adding eggs or legumes.', color: 'text-primary' });
    }
    if (r.length === 0) {
      r.push({ icon: Lightbulb, title: 'Health Tip', desc: healthTip || 'A balanced meal keeps you energized throughout the day.', color: 'text-primary' });
    }
    return r;
  }, [weather, steps, stepPct, primary, healthTip]);

  const renderHeader = () => (
    <View className='mb-2 flex-row items-center justify-between py-2'>
      <View className='flex-row items-center gap-2'>
        <Icon as={ChefHat} size={22} className='text-primary' />
        <Text variant='h3' className='text-foreground tracking-tight'>MealFit AI</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Search')}>
        <View className='bg-muted size-9 items-center justify-center rounded-full'>
          <Icon as={Search} size={18} className='text-muted-foreground' />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderWeather = () => weather ? (
    <TouchableOpacity
      className='bg-muted/50 mb-3 rounded-xl px-3 py-2.5'
      activeOpacity={0.7}
    >
      <View className='flex-row items-center gap-3'>
        <View className='bg-primary/10 size-9 items-center justify-center rounded-full'>
          <Icon as={Thermometer} size={18} className='text-primary' />
        </View>
        <View className='flex-1'>
          <Text className='text-foreground text-sm font-bold'>{weather.temp_c.toFixed(0)}°C • <Text className='capitalize'>{weather.condition}</Text></Text>
        </View>
        <View className='flex-row items-center gap-1'>
          <Icon as={Footprints} size={14} className='text-muted-foreground' />
          <Text className='text-foreground text-xs font-semibold'>{steps.toLocaleString()} Steps Today</Text>
        </View>
      </View>
    </TouchableOpacity>
  ) : null;

  const renderHero = () => primary ? (
    <Card className='mb-3 overflow-hidden p-0'>
      <TouchableOpacity onPress={() => handleMealPress(primary)} activeOpacity={0.9}>
        <View className='aspect-square w-full'>
          <FoodImage uri={primary.image_url} className='size-full' />
        </View>
        <View className='absolute left-2 top-2'>
          <Badge><Text className='text-primary-foreground text-xs font-medium'>AI Pick Today</Text></Badge>
        </View>
        <View className='absolute bottom-0 left-0 right-0 bg-black/60 px-4 pb-4 pt-8'>
          <Text className='text-white text-xl font-bold'>{primary.name}</Text>
          <Text className='text-white/80 text-sm mt-1 leading-5'>{enrichedReason}</Text>
        </View>
      </TouchableOpacity>
      <View className='gap-2 px-3 pb-3 pt-2'>
        <View className='flex-row items-center gap-2'>
          <Text className='bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-bold'>{primary.cuisine_origin}</Text>
          <View className='bg-muted-foreground/20 size-1 rounded-full' />
          <Icon as={Clock} size={11} className='text-muted-foreground' />
          <Text className='text-muted-foreground text-xs'>{primary.prep_time || '20 min'}</Text>
        </View>
        <View className='flex-row flex-wrap gap-1'>
          <HomeNutBox icon={Flame} value={`${primary.calories}`} label='Cal' sub='kcal' color='text-red-500' />
          <HomeNutBox icon={Beef} value={`${estimateProteinG(primary)}`} label='Protein' sub='g' color='text-primary' />
          <HomeNutBox icon={Wheat} value={`${estimateCarbsG(primary)}`} label='Carbs' sub='g' color='text-amber-500' />
          <HomeNutBox icon={Leaf} value={`${estimateFiberG(primary)}`} label='Fiber' sub='g' color='text-green-500' />
        </View>
        <Button onPress={() => handleMealPress(primary)} variant='default' className='w-full'>
          <Text>View Recipe</Text>
          <Icon as={ArrowRight} size={14} className='text-primary-foreground' />
        </Button>
      </View>
    </Card>
  ) : null;

  const renderSimilar = () => alternatives.length > 0 ? (
    <View className='mb-3'>
      <Text variant='h4' className='mb-2'>Similar Recipes</Text>
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
        data={alternatives.slice(0, 6)}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <MealCard meal={item} onPress={handleMealPress} />}
      />
    </View>
  ) : null;

  const renderSeasonalPicks = () => seasonalPicks.length > 0 ? (
    <View className='mb-3'>
      <View className='mb-2 flex-row items-center gap-2'>
        <Icon as={Apple} size={16} className='text-muted-foreground' />
        <Text variant='h4'>Seasonal Picks</Text>
      </View>
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
        data={seasonalPicks}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <View className='w-28 gap-1.5'>
            <View className='aspect-square w-full overflow-hidden rounded-xl'>
              <FoodImage uri={item.image_url} className='size-full' />
            </View>
            <Text className='text-foreground text-xs font-semibold text-center'>{item.name}</Text>
            <Text variant='muted' className='text-xs text-center leading-3'>{item.benefit}</Text>
          </View>
        )}
      />
    </View>
  ) : null;

  const renderReminders = () => (
    <View className='mb-3 gap-2'>
      {reminders.slice(0, 3).map((r, i) => (
        <View key={i} className='bg-muted/40 flex-row items-center gap-2.5 rounded-xl px-3 py-2.5'>
          <Icon as={r.icon} size={16} className={r.color} />
          <View className='flex-1'>
            <Text className='text-foreground text-xs font-semibold'>{r.title}</Text>
            <Text className='text-muted-foreground text-xs leading-4'>{r.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSection = (key: string, content: React.ReactNode) => content ? <View key={key}>{content}</View> : null;

  const sections = [];

  // loading
  sections.push(
    { key: 'loading', content: loading && !primary ? (
      <View className='items-center justify-center py-16'>
        <ActivityIndicator size='large' className='text-primary' />
        <Text variant='muted' className='mt-4'>Finding the perfect meal for you...</Text>
      </View>
    ) : null }
  );

  // error
  sections.push(
    { key: 'error', content: error ? (
      <Card className='mb-3 border-destructive/30'>
        <CardContent className='py-3'>
          <Text className='text-destructive text-center text-sm'>{error}</Text>
        </CardContent>
      </Card>
    ) : null }
  );

  // empty
  sections.push(
    { key: 'empty', content: !loading && !primary && !error ? (
      <Card className='mb-3 items-center py-8'>
        <Icon as={ChefHat} size={40} className='text-muted-foreground mb-3' />
        <Text variant='h4' className='mb-2'>What should I eat?</Text>
        <Button onPress={() => userId && fetchRecs(userId)}>
          <Text>Get AI Recommendation</Text>
        </Button>
      </Card>
    ) : null }
  );

  // weather
  sections.push({ key: 'weather', content: renderWeather() });
  // hero AI card
  sections.push({ key: 'hero', content: renderHero() });
  // reminders
  sections.push({ key: 'reminders', content: renderReminders() });
  // similar recipes
  sections.push({ key: 'similar', content: renderSimilar() });
  // seasonal picks
  sections.push({ key: 'seasonal', content: renderSeasonalPicks() });

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top']}>
      <FlatList
        data={[]}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        contentContainerClassName='px-4 pb-6'
        ListHeaderComponent={
          <>
            {renderHeader()}
            {sections.map(s => s.content ? <View key={s.key}>{s.content}</View> : null)}
          </>
        }
        renderItem={() => null}
        ListFooterComponent={<View className='h-4' />}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => userId && fetchRecs(userId)}
            tintColor='#1D9E75'
            colors={['#1D9E75']}
          />
        }
      />
    </SafeAreaView>
  );
}

/** Nutrition box matching MealDetailScreen's DetailNutBox style */
function HomeNutBox({ icon, value, label, sub, color }: { icon: any; value: string; label: string; sub: string; color: string }) {
  return (
    <View className='bg-muted/50 min-w-[22%] flex-1 items-center rounded-lg p-1.5'>
      <Icon as={icon} size={13} className={`mb-0.5 ${color}`} />
      <Text className={`text-foreground text-sm font-bold ${color}`}>{value}</Text>
      <Text className='text-muted-foreground text-xs'>{sub}</Text>
      <Text className='text-muted-foreground text-[10px] font-medium'>{label}</Text>
    </View>
  );
}
