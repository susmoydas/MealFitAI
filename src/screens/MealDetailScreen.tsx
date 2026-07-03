import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, Linking, Alert, Dimensions, Image, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import {
  ArrowLeft, Flame, Beef, Wheat, Leaf, Droplet, Candy, Clock, Target,
  Check, Play, Lightbulb, ChefHat, MapPin, Navigation, Star,
  WifiOff, Youtube, Maximize2, ChevronLeft, ChevronRight,
} from 'lucide-react-native';
import { useMeal } from '../context/MealContext';
import { useUser } from '../context/UserContext';
import { useJournal } from '../context/JournalContext';
import { MealCard } from '../components/MealCard';
import {
  Text, Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge, Icon, Separator, Skeleton,
} from '../components/ui';
import { FoodImage } from '../components/ui/FoodImage';
import { Meal, Restaurant } from '../types';
import { dataService } from '../services/dataService';
import { estimateCookTime, estimateProteinG, estimateCarbsG, estimateFiberG, estimateFatG, estimateSugarG, estimateSodiumMg } from '../utils/nutrition';
import { MOCK_RESTAURANTS } from '../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function parseSteps(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const steps = lines.filter(l => /^\d+[\.\)]/.test(l) || /^(step|instruction)/i.test(l));
  if (steps.length >= 3) return steps;
  if (lines.length >= 3) return lines;
  return [text];
}

function searchYouTube(recipeName: string) {
  const query = encodeURIComponent(`${recipeName} Recipe`);
  const url = `https://www.youtube.com/results?search_query=${query}`;
  Linking.openURL(url).catch(() => {});
}

function openGoogleMaps(restaurant: Restaurant) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lon}&travelmode=driving`;
  Linking.openURL(url).catch(() => {});
}

function pickRestaurantsForMeal(meal: Meal): Restaurant[] {
  const cuisineMatch = MOCK_RESTAURANTS.filter(r =>
    r.cuisine.toLowerCase() === meal.cuisine_origin.toLowerCase() ||
    meal.cuisine_origin === 'Bangladeshi' && r.cuisine === 'Indian' ||
    meal.cuisine_origin === 'Indian' && ['Indian', 'Bangladeshi'].includes(r.cuisine)
  );
  return cuisineMatch.slice(0, 4).map(r => ({
    ...r, lat: r.lat, lon: r.lon,
    travel_walking_min: Math.round(r.distance_km * 12),
    travel_cycling_min: Math.round(r.distance_km * 4),
  }));
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <View className='bg-card border-border mb-3 rounded-xl border p-3 shadow-sm shadow-black/5'>
      <View className='flex-row items-start gap-3'>
        <View className='bg-primary/10 size-10 items-center justify-center rounded-full shrink-0'>
          <Icon as={MapPin} size={18} className='text-primary' />
        </View>
        <View className='flex-1 gap-0.5'>
          <Text className='text-foreground text-sm font-bold' numberOfLines={1}>{restaurant.name}</Text>
          <Text className='text-muted-foreground text-xs' numberOfLines={1}>{restaurant.cuisine} · {restaurant.distance_km.toFixed(1)} km</Text>
          <Text className='text-muted-foreground/60 text-xs' numberOfLines={1}>{restaurant.address}</Text>
          {restaurant.rating > 0 && (
            <View className='flex-row items-center gap-1 mt-0.5'>
              <Icon as={Star} size={10} className='text-amber-500' />
              <Text className='text-amber-600 text-xs font-semibold'>{restaurant.rating.toFixed(1)}</Text>
              <Text className='text-muted-foreground/60 text-xs'>({restaurant.reviews})</Text>
            </View>
          )}
        </View>
        <Button size='sm' variant='outline' onPress={() => openGoogleMaps(restaurant)} className='shrink-0'>
          <Icon as={Navigation} size={12} className='text-primary' />
          <Text className='text-xs'>Maps</Text>
        </Button>
      </View>
    </View>
  );
}

function SkeletonBlock({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <View className={`gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 w-full rounded ${i === lines - 1 ? 'w-3/4' : ''}`} />
      ))}
    </View>
  );
}

export function MealDetailScreen({ navigation }: any) {
  const { recs, activeMeal, setActiveMeal, logMeal } = useMeal();
  const { userId } = useUser();
  const { addEntry } = useJournal();
  const [logging, setLogging] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [imageIndex, setImageIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const heroScrollRef = useRef<ScrollView>(null);
  const fullscreenScrollRef = useRef<ScrollView>(null);

  const screenW = Dimensions.get('window').width;

  const onImageScroll = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenW);
    setImageIndex(idx);
  }, [screenW]);

  const meal = activeMeal;

  useEffect(() => {
    let cancelled = false;

    async function fetchRestaurants() {
      if (!meal) return;
      setRestaurantsLoading(true);

      const netState = await NetInfo.fetch();
      if (cancelled) return;

      if (!netState.isConnected) {
        setIsOffline(true);
        setRestaurantsLoading(false);
        return;
      }
      setIsOffline(false);

      const recsRestaurants = recs?.restaurants ?? [];
      if (recsRestaurants.length > 0) {
        setRestaurants(recsRestaurants);
        setRestaurantsLoading(false);
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let lat = 23.8, lon = 90.4;
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
        }

        const apiRestaurants = await dataService.nearbyRestaurants(lat, lon, meal.name, meal.cuisine_origin);
        if (cancelled) return;

        if (apiRestaurants.length > 0) {
          setRestaurants(apiRestaurants);
        } else {
          setRestaurants(pickRestaurantsForMeal(meal));
        }
      } catch {
        if (!cancelled) setRestaurants(pickRestaurantsForMeal(meal));
      } finally {
        if (!cancelled) setRestaurantsLoading(false);
      }
    }

    fetchRestaurants();
    return () => { cancelled = true; };
  }, [meal?.id]);

  const openFullscreen = (idx: number) => {
    setFullscreenIndex(idx);
    setFullscreenVisible(true);
  };

  const allImages = useMemo(() => {
    const imgs = meal?.images ?? (meal?.image_url ? [meal.image_url] : []);
    const seen = new Set<string>();
    return imgs.filter((u): u is string => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [meal]);

  if (!meal) {
    return (
      <SafeAreaView className='bg-background flex-1' edges={['top', 'bottom']}>
        <View className='flex-1 items-center justify-center gap-3 p-6'>
          <Text variant='muted'>No meal selected.</Text>
          <Button variant='ghost' onPress={() => navigation.goBack()}>
            <Icon as={ArrowLeft} size={16} className='text-primary' />
            <Text>Go back</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const cooking = useMemo(() => ({
    time: meal.prep_time || estimateCookTime(meal.recipe_text),
    difficulty: meal.recipe_text.split(/\s+/).length > 120 ? 'Medium' : 'Easy',
  }), [meal]);
  const cals = useMemo(() => meal.calories, [meal]);
  const alternatives = recs?.alternatives?.filter(m => m.id !== meal.id) ?? [];
  const steps = useMemo(() => parseSteps(meal.recipe_text), [meal.recipe_text]);
  const checkedCount = Object.values(checkedSteps).filter(Boolean).length;
  const allDone = checkedCount === steps.length && steps.length > 0;
  const checkedIngCount = Object.values(checkedIngredients).filter(Boolean).length;
  const allIngredientsChecked = checkedIngCount === meal.ingredients.length && meal.ingredients.length > 0;

  const handleLog = async () => {
    if (!userId) return;
    setLogging(true);
    try {
      const source = recs?.primary?.id === meal.id ? 'primary' : 'alternative';
      await logMeal(userId, meal, source);
      await addEntry(meal, meal.meal_type as any, source, userId);
      Alert.alert('Logged!', `${meal.name} added to your history.`);
    } catch {
      Alert.alert('Error', 'Could not log this meal.');
    } finally {
      setLogging(false);
    }
  };

  const toggleIngredient = (idx: number) => setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  const hasVideoId = !!meal.video_id;

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName='pb-12'>
        {/* 1. Hero Food Image Gallery */}
        <View className='aspect-square w-full'>
          <ScrollView
            ref={heroScrollRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            className='flex-1'
            onScroll={onImageScroll}
            scrollEventThrottle={16}
          >
            {allImages.map((uri, i) => (
              <TouchableOpacity key={i} activeOpacity={0.95} onPress={() => openFullscreen(i)} style={{ width: screenW, aspectRatio: 1 }}>
                <FoodImage uri={uri} className='size-full' />
                <View className='absolute right-3 top-3 bg-black/40 size-8 items-center justify-center rounded-full'>
                  <Icon as={Maximize2} size={14} className='text-white' />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className='absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5'>
            {allImages.map((_, i) => (
              <View key={i} className={`size-2 rounded-full ${i === imageIndex ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </View>
          <View className='absolute left-4 top-4'>
            <TouchableOpacity onPress={() => navigation.goBack()} className='bg-black/40 size-9 items-center justify-center rounded-full'>
              <Icon as={ArrowLeft} size={20} className='text-white' />
            </TouchableOpacity>
          </View>
        </View>

        {/* Thumbnail gallery */}
        {allImages.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className='px-4 py-2' contentContainerStyle={{ gap: 8 }}>
            {allImages.map((uri, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setImageIndex(i);
                  heroScrollRef.current?.scrollTo({ x: i * screenW, animated: true });
                }}
                activeOpacity={0.8}
              >
                <FoodImage
                  uri={uri}
                  className={`size-16 rounded-lg border-2 ${i === imageIndex ? 'border-primary' : 'border-transparent'}`}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View className='px-4'>
          {/* 2. Cooking Time */}
          <View className='bg-primary/10 mt-2 flex-row items-center gap-2 self-start rounded-full px-3 py-1.5'>
            <Icon as={Clock} size={14} className='text-primary' />
            <Text className='text-primary text-sm font-bold'>{cooking.difficulty} · {cooking.time}</Text>
          </View>

          {/* 3. Recipe Title + Cuisine */}
          <Text variant='h3' className='text-foreground mt-3 tracking-tight'>{meal.name}</Text>
          <Text className='bg-primary/10 text-primary mt-1.5 self-start rounded px-2 py-0.5 text-xs font-bold'>{meal.cuisine_origin}</Text>

          {meal.season_tags.length > 0 && (
            <View className='mt-2 flex-row flex-wrap gap-1.5'>
              {meal.season_tags.map(tag => (
                <Badge key={tag} variant='outline'>
                  <Text className='text-xs capitalize'>{tag === 'monsoon' ? 'Monsoon Special' : `Best in ${tag}`}</Text>
                </Badge>
              ))}
            </View>
          )}

          {meal.availability_countries.length > 0 && (
            <Text className='text-muted-foreground mt-1.5 text-xs'>
              Popular in {meal.availability_countries.join(', ')}
            </Text>
          )}

          {/* 4. AI Recommendation */}
          <View className='bg-primary/10 mb-4 mt-4 rounded-xl border border-primary/20 p-3'>
            <View className='flex-row items-start gap-2'>
              <Icon as={Lightbulb} size={14} className='text-primary mt-0.5' />
              <View className='flex-1'>
                <Text className='text-primary/80 text-xs font-bold uppercase tracking-wide'>AI Recommendation</Text>
                <Text className='text-foreground mt-1 text-sm leading-5'>{meal.reason || 'Perfectly matched to your preferences and the current weather.'}</Text>
              </View>
            </View>
          </View>

          {/* 5. Nutrition Summary */}
          <Card className='mb-4'>
            <CardHeader className='pb-2'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Flame} size={16} className='text-red-500' />
                <CardTitle>Nutrition</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <View className='flex-row flex-wrap gap-1.5 pb-2'>
                <DetailNutBox icon={Flame} value={`${cals}`} label='Cal' sub='kcal' color='text-red-500' />
                <DetailNutBox icon={Beef} value={`${estimateProteinG(meal)}`} label='Protein' sub='g' color='text-primary' />
                <DetailNutBox icon={Wheat} value={`${estimateCarbsG(meal)}`} label='Carbs' sub='g' color='text-amber-500' />
                <DetailNutBox icon={Leaf} value={`${estimateFiberG(meal)}`} label='Fiber' sub='g' color='text-green-500' />
                <DetailNutBox icon={Droplet} value={`${estimateFatG(meal)}`} label='Fat' sub='g' color='text-purple-500' />
                <DetailNutBox icon={Candy} value={`${estimateSugarG(meal)}`} label='Sugar' sub='g' color='text-pink-500' />
                <DetailNutBox icon={ChefHat} value={`${estimateSodiumMg(meal)}`} label='Sodium' sub='mg' color='text-blue-500' />
              </View>
            </CardContent>
          </Card>

          {/* 6. Ingredients Checklist */}
          <View className='mb-3 flex-row items-center gap-2'>
            <Icon as={Target} size={16} className='text-muted-foreground' />
            <Text variant='h4'>Ingredients</Text>
            {allIngredientsChecked && <Badge variant='default'><Text className='text-primary-foreground text-xs font-medium'>All ready</Text></Badge>}
          </View>
          <Card className='mb-4'>
            <CardContent className='gap-0 py-2'>
              {meal.ingredients.map((ing, idx) => {
                const checked = !!checkedIngredients[idx];
                return (
                  <TouchableOpacity
                    key={idx}
                    className={`flex-row items-center gap-3 border-b border-border/30 py-3 ${checked ? 'opacity-60' : ''}`}
                    onPress={() => toggleIngredient(idx)}
                    activeOpacity={0.7}
                  >
                    <View className={`size-5 items-center justify-center rounded ${checked ? 'bg-green-500' : 'border-muted-foreground/40 border-2'}`}>
                      {checked && <Icon as={Check} size={12} className='text-white' />}
                    </View>
                    <Text className={`flex-1 text-sm ${checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{ing.name}</Text>
                    <Text variant='muted' className='text-xs'>{ing.amount}</Text>
                  </TouchableOpacity>
                );
              })}
            </CardContent>
          </Card>

          {/* 6b. Ingredient Substitutions */}
          {meal.replacements.length > 0 && (
            <>
              <Text variant='h4' className='mb-3'>Substitutions</Text>
              <Card className='mb-4'>
                <CardContent className='gap-3 py-3'>
                  {meal.replacements.map((rep, idx) => (
                    <View key={idx} className='border-b border-border/30 pb-2 last:border-0 last:pb-0'>
                      <Text className='text-foreground text-sm font-semibold'>Missing {rep.if_missing}?</Text>
                      <Text className='text-muted-foreground mt-1 text-sm'>
                        Replace with {rep.replace_with.join(', ')}
                      </Text>
                      <Text className='text-muted-foreground/60 mt-0.5 text-xs italic'>{rep.why}</Text>
                    </View>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* 7. Cooking Instructions */}
          <View className='mb-3 flex-row items-center justify-between'>
            <Text variant='h4'>Instructions</Text>
            {allDone && <Badge variant='default' className='flex-row items-center gap-1'><Icon as={Check} size={10} className='text-primary-foreground' /><Text className='text-primary-foreground text-xs font-medium'>All done</Text></Badge>}
          </View>
          <Card className='mb-4 overflow-hidden'>
            {steps.length === 1 ? (
              <CardContent className='py-4'>
                <Text className='leading-6 text-sm'>{meal.recipe_text}</Text>
              </CardContent>
            ) : (
              steps.map((step, idx) => {
                const checked = !!checkedSteps[idx];
                return (
                  <TouchableOpacity
                    key={idx}
                    className={`flex-row items-start gap-3 border-b border-border/30 p-3.5 ${checked ? 'opacity-60' : ''}`}
                    onPress={() => setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    activeOpacity={0.7}
                  >
                    <View className={`size-6 items-center justify-center rounded-full ${checked ? 'bg-green-500' : 'bg-primary/10'}`}>
                      <Text className={`text-xs font-bold ${checked ? 'text-white' : 'text-primary'}`}>{checked ? '✓' : idx + 1}</Text>
                    </View>
                    <Text className={`flex-1 text-sm leading-6 ${checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{step}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </Card>

          {/* 8. Nearby Restaurants */}
          <View className='mb-3 flex-row items-center gap-2'>
            <Icon as={MapPin} size={16} className='text-muted-foreground' />
            <Text variant='h4'>Available Near You</Text>
          </View>

          {isOffline ? (
            <Card className='mb-4'>
              <CardContent className='py-6 items-center gap-2'>
                <Icon as={WifiOff} size={24} className='text-muted-foreground/50' />
                <Text className='text-muted-foreground text-sm text-center'>
                  Restaurant and video recommendations require an internet connection.
                </Text>
              </CardContent>
            </Card>
          ) : restaurantsLoading ? (
            <Card className='mb-4'>
              <CardContent className='py-4 gap-3'>
                <SkeletonBlock lines={2} />
                <SkeletonBlock lines={2} />
                <SkeletonBlock lines={2} />
              </CardContent>
            </Card>
          ) : restaurants.length > 0 ? (
            <View className='mb-4'>
              {restaurants.map(r => <RestaurantCard key={r.place_id || r.id} restaurant={r} />)}
            </View>
          ) : (
            <Card className='mb-4'>
              <CardContent className='py-6 items-center gap-2'>
                <Icon as={MapPin} size={24} className='text-muted-foreground/50' />
                <Text className='text-muted-foreground text-sm text-center'>
                  No nearby restaurants found for this cuisine. Try exploring other options.
                </Text>
              </CardContent>
            </Card>
          )}

          {/* 9. Watch Recipe Video */}
          <Card className='mb-4'>
            <CardContent className='py-4'>
              <View className='mb-3 flex-row items-center gap-2'>
                <Icon as={Youtube} size={18} className='text-red-500' />
                <Text variant='h4'>Watch Recipe Video</Text>
              </View>
              <TouchableOpacity
                className='bg-muted/50 overflow-hidden rounded-lg'
                onPress={() => searchYouTube(meal.name)}
                activeOpacity={0.85}
              >
                {hasVideoId ? (
                  <View className='relative'>
                    <Image
                      source={{ uri: `https://img.youtube.com/vi/${meal.video_id}/maxresdefault.jpg` }}
                      className='h-48 w-full'
                      resizeMode='cover'
                    />
                    <View className='absolute inset-0 items-center justify-center bg-black/20'>
                      <View className='bg-red-500/90 size-14 items-center justify-center rounded-full shadow-lg'>
                        <Icon as={Play} size={24} className='text-white ml-0.5' />
                      </View>
                    </View>
                    <View className='absolute bottom-2 left-2 bg-black/60 rounded px-2 py-0.5'>
                      <Text className='text-white text-xs font-medium' numberOfLines={1}>
                        {meal.name} Recipe
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View className='items-center justify-center py-8'>
                    <View className='bg-red-500 mb-3 size-14 items-center justify-center rounded-full shadow-sm'>
                      <Icon as={Youtube} size={24} className='text-white' />
                    </View>
                    <Text className='text-foreground text-sm font-bold'>Watch on YouTube</Text>
                    <Text className='text-muted-foreground text-xs mt-1'>
                      {meal.name} Recipe
                    </Text>
                    <View className='bg-red-500/10 mt-3 rounded-full px-4 py-1.5'>
                      <Text className='text-red-600 text-xs font-semibold'>Tap to search YouTube</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </CardContent>
          </Card>

          {/* 10. Similar Recipes */}
          {alternatives.length > 0 && (
            <>
              <Text variant='h4' className='mb-3'>Similar Recipes</Text>
              <FlatList
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 24, marginBottom: 16 }}
                data={alternatives}
                keyExtractor={m => m.id}
                renderItem={({ item }) => <MealCard meal={item} onPress={m => setActiveMeal(m)} />}
              />
            </>
          )}

          {/* Log Button */}
          <Button onPress={handleLog} className='mb-4 mt-2 w-full' disabled={logging}>
            <Icon as={Check} size={16} className='text-primary-foreground' />
            <Text>{logging ? 'Logging...' : 'I ate this'}</Text>
          </Button>
        </View>
      </ScrollView>

      {/* Full-Screen Image Viewer Modal */}
      <Modal visible={fullscreenVisible} transparent animationType='fade' onRequestClose={() => setFullscreenVisible(false)}>
        <View className='flex-1 bg-black'>
          <View className='absolute top-14 left-0 right-0 z-20 flex-row items-center justify-between px-4'>
            <TouchableOpacity onPress={() => setFullscreenVisible(false)} className='bg-white/20 size-9 items-center justify-center rounded-full'>
              <Icon as={ArrowLeft} size={20} className='text-white' />
            </TouchableOpacity>
            <Text className='text-white text-sm font-medium'>{fullscreenIndex + 1} / {allImages.length}</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            ref={fullscreenScrollRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            className='flex-1'
            contentContainerStyle={{ alignItems: 'center' }}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setFullscreenIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {allImages.map((uri, i) => (
              <Pressable key={i} onPress={() => setFullscreenVisible(false)} style={{ width: SCREEN_WIDTH, height: '100%' }}>
                <Image
                  source={{ uri }}
                  className='size-full'
                  resizeMode='contain'
                />
              </Pressable>
            ))}
          </ScrollView>

          {allImages.length > 1 && (
            <>
              <TouchableOpacity
                className='absolute left-3 top-1/2 -translate-y-5 z-10 bg-white/20 size-10 items-center justify-center rounded-full'
                onPress={() => {
                  const next = Math.max(0, fullscreenIndex - 1);
                  fullscreenScrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
                  setFullscreenIndex(next);
                }}
              >
                <Icon as={ChevronLeft} size={22} className='text-white' />
              </TouchableOpacity>
              <TouchableOpacity
                className='absolute right-3 top-1/2 -translate-y-5 z-10 bg-white/20 size-10 items-center justify-center rounded-full'
                onPress={() => {
                  const next = Math.min(allImages.length - 1, fullscreenIndex + 1);
                  fullscreenScrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
                  setFullscreenIndex(next);
                }}
              >
                <Icon as={ChevronRight} size={22} className='text-white' />
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailNutBox({ icon, value, label, sub, color }: { icon: any; value: string; label: string; sub: string; color: string }) {
  return (
    <View className='bg-muted/50 min-w-[22%] flex-1 items-center rounded-lg p-2'>
      <Icon as={icon} size={14} className={`mb-0.5 ${color}`} />
      <Text className={`text-foreground text-sm font-bold ${color}`}>{value}</Text>
      <Text className='text-muted-foreground text-[9px]'>{sub}</Text>
      <Text className='text-muted-foreground text-[8px]'>{label}</Text>
    </View>
  );
}
