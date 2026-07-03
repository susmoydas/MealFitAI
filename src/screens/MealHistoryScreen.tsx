import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  History, Camera, Search, Plus, TrendingUp, Flame, Beef,
  Apple, Wheat, Droplets, Lightbulb, ChevronRight, Clock,
  BrainCircuit,
} from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { useJournal, JournalEntry } from '../context/JournalContext';
import { MOCK_MEALS } from '../data/mockData';
import { Meal } from '../types';
import {
  Text, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Badge, Icon, Button,
} from '../components/ui';
import { WeeklyInsightBanner } from '../components/WeeklyInsightBanner';

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MEAL_TYPE_ICONS: Record<string, any> = {
  breakfast: 'Egg',
  lunch: 'Sun',
  dinner: 'Moon',
  snack: 'Coffee',
};

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

const RANGE_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
] as const;

type TimeRange = 'today' | '7d' | '30d';

function getDayName(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function getDayNumber(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function computeAnalysis(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return {
      protein: '--' as string, fiber: '--', water: '--', veggies: '--', fruit: '--',
      repeated: 0, repeatedTag: '', repeatedMeals: [] as string[], lowFiber: false, lowProtein: false,
    };
  }

  const highProtein = entries.filter(e => e.proteinLevel === 'High').length / entries.length;
  const highFiber = entries.filter(e => e.fiberLevel === 'High').length / entries.length;
  const lowFiberCount = entries.filter(e => e.fiberLevel === 'Low').length;

  const tagCounts: Record<string, { count: number; names: string[] }> = {};
  entries.forEach(e => {
    const tag = (e.proteinTag || 'other').toLowerCase();
    if (!tagCounts[tag]) tagCounts[tag] = { count: 0, names: [] };
    tagCounts[tag].count++;
    if (!tagCounts[tag].names.includes(e.mealName)) tagCounts[tag].names.push(e.mealName);
  });

  const mostRepeated = Object.entries(tagCounts).sort((a, b) => b[1].count - a[1].count)[0];
  const repeatedMeals = mostRepeated ? mostRepeated[1].names : [];
  const repeatedCount = mostRepeated ? mostRepeated[1].count : 0;
  const repeatedTag = mostRepeated ? mostRepeated[0] : '';

  const veggieKeywords = ['salad', 'vegetable', 'green', 'leafy', 'spinach', 'broccoli', 'dal', 'lentil'];
  const fruitKeywords = ['fruit', 'mango', 'apple', 'berry', 'orange', 'banana', 'lassi'];
  const veggieMeals = entries.filter(e => veggieKeywords.some(k => e.mealName.toLowerCase().includes(k))).length;
  const fruitMeals = entries.filter(e => fruitKeywords.some(k => e.mealName.toLowerCase().includes(k))).length;

  const protein = highProtein > 0.4 ? 'High' : highProtein > 0.2 ? 'Medium' : 'Low';
  const fiber = highFiber > 0.4 ? 'High' : highFiber > 0.2 ? 'Medium' : 'Low';
  const water = 'Good';
  const veggies = veggieMeals >= 3 ? 'High' : veggieMeals >= 1 ? 'Moderate' : 'Low';
  const fruit = fruitMeals >= 3 ? 'High' : fruitMeals >= 1 ? 'Moderate' : 'Low';

  return {
    protein, fiber, water, veggies, fruit,
    repeated: repeatedCount,
    repeatedTag,
    repeatedMeals,
    lowFiber: lowFiberCount > entries.length * 0.5,
    lowProtein: highProtein < 0.2,
  };
}

function buildRecommendationText(analysis: ReturnType<typeof computeAnalysis>, days: number): string {
  const parts: string[] = [];
  const periodLabel = days === 30 ? 'this month' : 'this week';

  if (analysis.repeated >= 3 && analysis.repeatedTag) {
    parts.push(`You had ${analysis.repeatedTag} ${analysis.repeated} times ${periodLabel}`);
    if (analysis.lowFiber) parts.push('with very little fiber');
    parts.push('. Try a high-fiber vegetable meal today for better balance.');
    return parts.join(' ');
  }

  if (analysis.lowFiber) {
    parts.push(`Your fiber intake has been low ${periodLabel}`);
    if (analysis.lowProtein) parts.push('and protein could also use a boost');
    parts.push('. Try a lentil or chickpea-based meal with plenty of greens.');
    return parts.join(' ');
  }

  if (analysis.lowProtein) {
    parts.push(`Your protein intake needs attention ${periodLabel}.`);
    parts.push('Add eggs, fish, or tofu to your meals for better nutrition balance.');
    return parts.join(' ');
  }

  if (analysis.veggies === 'Low') {
    parts.push(`Try adding more vegetables to your meals ${periodLabel}.`);
    parts.push('A fresh salad or stir-fry would pair well with your current diet.');
    return parts.join(' ');
  }

  parts.push(`Great variety ${periodLabel}! Keep up the balanced eating habits.`);
  return parts.join(' ');
}

function MealEntryRow({ label, icon, entries, onAdd, onScan, onSearch }: {
  label: string; icon: string; entries: JournalEntry[];
  onAdd: () => void; onScan: () => void; onSearch: () => void;
}) {
  return (
    <Card className='mb-2 overflow-hidden'>
      <CardHeader className='pb-1'>
        <View className='flex-row items-center gap-2'>
          <Text className='text-base'>{icon}</Text>
          <CardTitle>{label}</CardTitle>
          {entries.length > 0 && (
            <Badge variant='secondary'><Text className='text-secondary-foreground text-xs font-medium'>{entries.reduce((s, e) => s + e.calories, 0)} cal</Text></Badge>
          )}
        </View>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? entries.map(e => (
          <View key={e.id} className='flex-row items-center gap-2 border-b border-border/20 py-2'>
            <Text className='text-foreground flex-1 text-sm'>{e.mealName}</Text>
            <Text variant='muted' className='text-xs'>{e.calories} cal</Text>
            <Badge variant='outline'><Text className='text-foreground text-xs'>{e.source}</Text></Badge>
          </View>
        )) : (
          <Text className='text-muted-foreground text-sm py-1'>No meal logged</Text>
        )}
        <View className='flex-row gap-2 pt-2'>
          <TouchableOpacity className='bg-primary flex-row items-center gap-1 rounded-lg px-3 py-1.5' onPress={onAdd} activeOpacity={0.8}>
            <Icon as={Plus} size={12} className='text-primary-foreground' />
            <Text className='text-primary-foreground text-xs font-medium'>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity className='bg-muted flex-row items-center gap-1 rounded-lg px-3 py-1.5' onPress={onScan} activeOpacity={0.7}>
            <Icon as={Camera} size={12} className='text-muted-foreground' />
            <Text className='text-foreground text-xs'>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity className='bg-muted flex-row items-center gap-1 rounded-lg px-3 py-1.5' onPress={onSearch} activeOpacity={0.7}>
            <Icon as={Search} size={12} className='text-muted-foreground' />
            <Text className='text-foreground text-xs'>Search</Text>
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  );
}

function DayTimelineCard({ date, label, meals, totalCal }: {
  date: string; label: string; meals: JournalEntry[]; totalCal: number;
}) {
  return (
    <Card className='mb-2 overflow-hidden'>
      <CardHeader className='pb-1'>
        <View className='flex-row items-center justify-between'>
          <View className='flex-row items-center gap-2'>
            <Text className='text-foreground text-sm font-bold'>{label}</Text>
            <Text variant='muted' className='text-xs'>{getDayNumber(date)}</Text>
          </View>
          <Badge variant='secondary'><Text className='text-secondary-foreground text-xs font-medium'>{totalCal} cal</Text></Badge>
        </View>
      </CardHeader>
      <CardContent className='gap-0.5'>
        {meals.length > 0 ? MEAL_ORDER.map(type => {
          const entry = meals.find(m => m.mealType === type);
          return entry ? (
            <View key={type} className='flex-row items-center gap-2 py-1'>
              <Text className='text-xs'>{MEAL_TYPE_ICONS[type]}</Text>
              <Text className='text-foreground flex-1 text-sm'>{entry.mealName}</Text>
              <Text variant='muted' className='text-xs'>{entry.calories} cal</Text>
            </View>
          ) : null;
        }) : (
          <Text variant='muted' className='text-sm py-1'>No meals logged</Text>
        )}
      </CardContent>
    </Card>
  );
}

function NutritionBar({ label, value, color }: { label: string; value: string; color: string }) {
  const pct = value === 'High' ? 85 : value === 'Moderate' || value === 'Medium' ? 55 : value === 'Low' ? 25 : value === 'Good' ? 80 : 0;
  const barColor = value === 'High' || value === 'Good' ? 'bg-green-500' : value === 'Medium' || value === 'Moderate' ? 'bg-amber-400' : 'bg-red-400';
  return (
    <View className='flex-row items-center gap-2'>
      <Text className='text-foreground w-20 text-xs'>{label}</Text>
      <View className='bg-muted flex-1 rounded-full' style={{ height: 8 }}>
        <View className={`rounded-full ${barColor}`} style={{ width: `${pct}%`, height: 8 }} />
      </View>
      <Text className={`text-xs font-semibold ${color}`}>{value}</Text>
    </View>
  );
}

export function MealHistoryScreen({ navigation: nav }: any) {
  const safeNav = nav || { navigate: () => {}, goBack: () => {}, canGoBack: () => false };
  const { userId } = useUser();
  const { todayEntries, weekEntries, allEntries, daySummaries, insights, loading, ensureSeeded } = useJournal();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  // Compute filtered entries based on selected range
  const rangeEntries = useMemo(() => {
    if (timeRange === 'today') return todayEntries;
    if (timeRange === '7d') return weekEntries;
    const daysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return allEntries.filter(e => new Date(e.eatenAt) >= daysAgo);
  }, [timeRange, todayEntries, weekEntries, allEntries]);

  const analysis = useMemo(() => computeAnalysis(rangeEntries), [rangeEntries]);
  const rangeDays = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
  const recommendation = useMemo(() => buildRecommendationText(analysis, rangeDays), [analysis, rangeDays]);

  // Build day-range timeline (generic for any number of days)
  const dayRange = useMemo(() => {
    const numDays = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
    const days: { date: string; label: string; meals: JournalEntry[]; totalCal: number }[] = [];

    if (timeRange === 'today') {
      const today = new Date().toDateString();
      const summary = daySummaries.find(s => s.date === today);
      days.push({
        date: today,
        label: 'Today',
        meals: summary ? summary.meals : todayEntries,
        totalCal: summary ? summary.totalCalories : todayEntries.reduce((s, e) => s + e.calories, 0),
      });
      return days;
    }

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toDateString();
      const dayMeals = allEntries.filter(e => new Date(e.eatenAt).toDateString() === dateKey);
      days.push({
        date: dateKey,
        label: getDayName(dateKey),
        meals: dayMeals,
        totalCal: dayMeals.reduce((s, e) => s + e.calories, 0),
      });
    }
    return days;
  }, [timeRange, allEntries, daySummaries, todayEntries]);

  // Quick suggestions based on time of day
  const quickSuggestions = useMemo(() => {
    const hour = new Date().getHours();
    let preferredType: string;
    if (hour < 11) preferredType = 'breakfast';
    else if (hour < 15) preferredType = 'lunch';
    else if (hour < 20) preferredType = 'dinner';
    else preferredType = 'snack';
    return MOCK_MEALS.filter(m => m.meal_type === preferredType).slice(0, 4);
  }, []);

  // Recent unique meals (from all entries, not just range)
  const recentMeals = useMemo(() => {
    const seen = new Set<string>();
    return allEntries.filter(e => {
      if (seen.has(e.mealName)) return false;
      seen.add(e.mealName);
      return true;
    }).slice(0, 5);
  }, [allEntries]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (userId) await ensureSeeded(userId);
    setRefreshing(false);
  };

  const navigateAddMeal = (type?: string) => {
    safeNav.navigate('ManualEntry');
  };

  const navigateSearch = (type?: string) => {
    safeNav.navigate('Home', { screen: 'Search', params: { mealType: type } });
  };

  const navigateScanner = () => {
    safeNav.navigate('Scanner');
  };

  const mealEntriesByType = useMemo(() => {
    const map: Record<string, JournalEntry[]> = {
      breakfast: [], lunch: [], dinner: [], snack: [],
    };
    todayEntries.forEach(e => {
      if (map[e.mealType]) map[e.mealType].push(e);
    });
    return map;
  }, [todayEntries]);

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName='px-4 pb-8'
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={handleRefresh} tintColor='#1D9E75' colors={['#1D9E75']} />}
      >
        {/* Header */}
        <View className='mb-2 flex-row items-center gap-2 pt-2'>
          <Icon as={BrainCircuit} size={22} className='text-primary' />
          <Text variant='h3' className='text-foreground tracking-tight'>Meal History</Text>
        </View>

        {/* Weekly Nutrition Insight */}
        <WeeklyInsightBanner
          onSuggestionPress={(mealId) => safeNav.navigate('Search', { query: mealId })}
        />

        {/* Time Range Filter */}
        <View className='bg-muted mb-4 flex-row rounded-xl p-1.5 shadow-sm'>
          {RANGE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              className={`flex-1 items-center rounded-lg py-3 ${timeRange === opt.key ? 'bg-white shadow-md' : ''}`}
              onPress={() => setTimeRange(opt.key as TimeRange)}
              activeOpacity={0.7}
            >
              <Text className={`text-base font-semibold ${timeRange === opt.key ? 'text-foreground' : 'text-muted-foreground'}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Nutrition Analysis (7d or 30d) */}
        {timeRange !== 'today' && (
          <Card className='mb-3 border border-primary/20'>
            <CardHeader className='pb-1'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Lightbulb} size={16} className='text-primary' />
                <CardTitle>{timeRange === '30d' ? 'Last 30-Day Summary' : 'Last 7-Day Summary'}</CardTitle>
              </View>
            </CardHeader>
            <CardContent className='gap-2'>
              <NutritionBar label='Protein' value={analysis.protein} color={analysis.protein === 'High' ? 'text-green-600' : analysis.protein === 'Medium' ? 'text-amber-600' : 'text-red-600'} />
              <NutritionBar label='Fiber' value={analysis.fiber} color={analysis.fiber === 'High' ? 'text-green-600' : analysis.fiber === 'Medium' ? 'text-amber-600' : 'text-red-600'} />
              <NutritionBar label='Water Intake' value={analysis.water} color='text-green-600' />
              <NutritionBar label='Vegetables' value={analysis.veggies} color={analysis.veggies === 'High' ? 'text-green-600' : analysis.veggies === 'Moderate' ? 'text-amber-600' : 'text-red-600'} />
              <NutritionBar label='Fruit Intake' value={analysis.fruit} color={analysis.fruit === 'High' ? 'text-green-600' : analysis.fruit === 'Moderate' ? 'text-amber-600' : 'text-red-600'} />
              <View className='border-border mt-1 border-t pt-2'>
                <Text className='text-foreground text-xs'>Meals Repeated: <Text className='font-bold'>{analysis.repeated}x</Text> {analysis.repeatedTag ? `(${analysis.repeatedTag})` : ''}</Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Today's Recommendation */}
        <Card className='mb-4 bg-primary/5 border-primary/20'>
          <CardHeader className='pb-1'>
            <View className='flex-row items-center gap-2'>
              <Icon as={BrainCircuit} size={16} className='text-primary' />
              <CardTitle>Today's Recommendation</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            <Text className='text-foreground text-sm leading-5'>{recommendation}</Text>
          </CardContent>
        </Card>

        {/* Today's Meals */}
        <View className='mb-3'>
          <View className='mb-2 flex-row items-center gap-2'>
            <Icon as={TrendingUp} size={16} className='text-foreground' />
            <Text variant='h4'>Today</Text>
            <Badge variant='secondary'><Text className='text-secondary-foreground text-xs font-medium'>{todayEntries.reduce((s, e) => s + e.calories, 0)} cal</Text></Badge>
          </View>

          {MEAL_ORDER.map(type => (
            <MealEntryRow
              key={type}
              label={MEAL_TYPE_LABELS[type]}
              icon={MEAL_TYPE_ICONS[type]}
              entries={mealEntriesByType[type]}
              onAdd={() => navigateAddMeal(type)}
              onScan={() => navigateScanner()}
              onSearch={() => navigateSearch(type)}
            />
          ))}
        </View>

        {/* Quick Add — Recent & Suggestions */}
        <View className='mb-3'>
          <Text variant='h4' className='mb-2'>Quick Add</Text>

          {/* Manual Entry Button */}
          <TouchableOpacity
            className='bg-primary/10 border border-primary/20 mb-2 flex-row items-center gap-2 rounded-lg px-3 py-2.5'
            onPress={() => safeNav.navigate('ManualEntry')}
            activeOpacity={0.7}
          >
            <Icon as={Plus} size={16} className='text-primary' />
            <Text className='text-primary text-sm font-medium'>Manual Entry</Text>
            <Text className='text-muted-foreground text-xs ml-auto'>Any dish</Text>
          </TouchableOpacity>

          {recentMeals.length > 0 && (
            <View className='mb-2'>
              <Text className='text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5'>Recent</Text>
              <View className='flex-row flex-wrap gap-1.5'>
                {recentMeals.map((e, i) => (
                  <TouchableOpacity key={i} className='bg-muted rounded-full px-3 py-1.5' onPress={() => safeNav.navigate('Search', { query: e.mealName })} activeOpacity={0.7}>
                    <Text className='text-foreground text-xs'>{e.mealName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {quickSuggestions.length > 0 && (
            <View>
              <Text className='text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5'>Quick Suggestions</Text>
              <View className='flex-row flex-wrap gap-1.5'>
                {quickSuggestions.map(meal => (
                  <TouchableOpacity key={meal.id} className='bg-primary/10 rounded-full px-3 py-1.5' onPress={() => safeNav.navigate('Search', { query: meal.name })} activeOpacity={0.7}>
                    <Text className='text-primary text-xs font-medium'>{meal.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Timeline */}
        <View className='mb-2'>
          <View className='mb-2 flex-row items-center gap-2'>
            <Icon as={Clock} size={16} className='text-foreground' />
            <Text variant='h4'>{timeRange === '30d' ? '30-Day Timeline' : timeRange === '7d' ? '7-Day Timeline' : 'Today'}</Text>
          </View>
          {dayRange.map(day => (
            <DayTimelineCard key={day.date} date={day.date} label={day.label} meals={day.meals} totalCal={day.totalCal} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
