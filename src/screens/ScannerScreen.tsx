import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator, TextInput, FlatList, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Check, X, Image as ImageIcon, Zap, ZapOff, RefreshCw, ChevronLeft, UtensilsCrossed, Flame, Beef, Wheat, Droplet, Leaf, Search, Plus, AlertTriangle, ChefHat } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { useJournal } from '../context/JournalContext';
import { useMeal } from '../context/MealContext';
import { visionProvider } from '../services/visionProvider';
import { usda } from '../services/usda';
import FOODS from '../data/foods.json';
import { Text, Card, CardContent, CardHeader, CardTitle, Button, Icon, Badge, Input, Separator } from '../components/ui';
import { ScanResult, FoodItem, NutritionLevel, Meal } from '../types';

type ScannerMode = 'barcode' | 'capture' | 'search';

function calcLevel(val: number, high: number, mid: number, invertHighLow = false): NutritionLevel {
  if (invertHighLow) {
    if (val <= mid) return 'Low';
    if (val <= high) return 'Medium';
    return 'High';
  }
  if (val >= high) return 'High';
  if (val >= mid) return 'Medium';
  return 'Low';
}

function gramsToLevel(grams: number): NutritionLevel {
  if (grams >= 20) return 'High';
  if (grams >= 10) return 'Medium';
  return 'Low';
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack',
};
const FLASH_MODES = ['off', 'on', 'auto'] as const;

interface LocalFood {
  name: string; kw: string[]; cat: string;
  kcal: number; p: number; c: number; f: number; fib: number; sug: number;
  serving: string; g: number;
}

function NutritionRow({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <View className='flex-row items-center gap-2 py-0.5'>
      <Icon as={icon} size={13} className={color} />
      <Text className='text-foreground flex-1 text-xs'>{label}</Text>
      <Text className={`text-xs font-bold ${color}`}>{value}</Text>
    </View>
  );
}

function FoodCard({ food, index, onUpdate, onRemove }: {
  food: FoodItem;
  index: number;
  onUpdate: (index: number, updated: FoodItem) => void;
  onRemove: (index: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editName, setEditName] = useState(food.name);
  const [editPortion, setEditPortion] = useState(food.portion);
  const [editCal, setEditCal] = useState(String(food.calories));
  const [editP, setEditP] = useState(String(food.protein_g));
  const [editC, setEditC] = useState(String(food.carbs_g));
  const [editF, setEditF] = useState(String(food.fat_g));
  const [editFib, setEditFib] = useState(String(food.fiber_g));
  const [editSug, setEditSug] = useState(String(food.sugar_g));
  const [editNa, setEditNa] = useState(String(food.sodium_mg));

  const lowConfidence = food.confidence > 0 && food.confidence < 70;

  const handleSave = () => {
    onUpdate(index, {
      ...food,
      name: editName.trim() || food.name,
      portion: editPortion.trim() || food.portion,
      calories: Number(editCal) || 0,
      protein_g: Number(editP) || 0,
      carbs_g: Number(editC) || 0,
      fat_g: Number(editF) || 0,
      fiber_g: Number(editFib) || 0,
      sugar_g: Number(editSug) || 0,
      sodium_mg: Number(editNa) || 0,
    });
    setExpanded(false);
  };

  return (
    <Card className='mb-2'>
      <CardContent className='py-3'>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
          <View className='flex-row items-center justify-between'>
            <View className='flex-1'>
              <View className='flex-row items-center gap-2'>
                <Text className='text-foreground font-semibold text-sm'>{food.name}</Text>
                {lowConfidence && (
                  <Icon as={AlertTriangle} size={14} className='text-amber-500' />
                )}
              </View>
              <Text className='text-muted-foreground text-xs mt-0.5'>{food.portion}</Text>
            </View>
            <View className='items-end'>
              <Text className='text-foreground font-bold text-sm'>{food.calories} kcal</Text>
              <Text className='text-muted-foreground text-xs'>
                P:{food.protein_g}g C:{food.carbs_g}g F:{food.fat_g}g
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {expanded && (
          <View className='mt-3 border-t border-border pt-3'>
            <View className='flex-row gap-2 mb-2'>
              <View className='flex-1'>
                <Text className='text-muted-foreground text-xs mb-1'>Name</Text>
                <Input value={editName} onChangeText={setEditName} className='text-sm' />
              </View>
              <View className='w-24'>
                <Text className='text-muted-foreground text-xs mb-1'>Portion</Text>
                <Input value={editPortion} onChangeText={setEditPortion} className='text-sm' />
              </View>
            </View>
            <View className='flex-row flex-wrap gap-2 mb-2'>
              <View className='w-[30%]'>
                <Text className='text-muted-foreground text-xs mb-1'>Calories</Text>
                <Input value={editCal} onChangeText={setEditCal} keyboardType='numeric' className='text-sm' />
              </View>
              <View className='w-[30%]'>
                <Text className='text-muted-foreground text-xs mb-1'>Protein (g)</Text>
                <Input value={editP} onChangeText={setEditP} keyboardType='numeric' className='text-sm' />
              </View>
              <View className='w-[30%]'>
                <Text className='text-muted-foreground text-xs mb-1'>Carbs (g)</Text>
                <Input value={editC} onChangeText={setEditC} keyboardType='numeric' className='text-sm' />
              </View>
              <View className='w-[30%]'>
                <Text className='text-muted-foreground text-xs mb-1'>Fat (g)</Text>
                <Input value={editF} onChangeText={setEditF} keyboardType='numeric' className='text-sm' />
              </View>
              <View className='w-[30%]'>
                <Text className='text-muted-foreground text-xs mb-1'>Fiber (g)</Text>
                <Input value={editFib} onChangeText={setEditFib} keyboardType='numeric' className='text-sm' />
              </View>
              <View className='w-[30%]'>
                <Text className='text-muted-foreground text-xs mb-1'>Sugar (g)</Text>
                <Input value={editSug} onChangeText={setEditSug} keyboardType='numeric' className='text-sm' />
              </View>
              <View className='w-[30%]'>
                <Text className='text-muted-foreground text-xs mb-1'>Sodium (mg)</Text>
                <Input value={editNa} onChangeText={setEditNa} keyboardType='numeric' className='text-sm' />
              </View>
            </View>
            <View className='flex-row gap-2'>
              <Button variant='default' size='sm' onPress={handleSave} className='flex-1'>
                <Text>Save Changes</Text>
              </Button>
              <Button variant='destructive' size='sm' onPress={() => onRemove(index)}>
                <Text>Remove</Text>
              </Button>
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

function AddMissingFoodForm({ onAdd }: { onAdd: (food: FoodItem) => void }) {
  const [name, setName] = useState('');
  const [portion, setPortion] = useState('1 serving');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      confidence: 100,
      portion: portion.trim(),
      calories: Number(calories) || 0,
      protein_g: Number(protein) || 0,
      carbs_g: Number(carbs) || 0,
      fat_g: Number(fat) || 0,
      fiber_g: Number(fiber) || 0,
      sugar_g: Number(sugar) || 0,
      sodium_mg: Number(sodium) || 0,
    });
    setName('');
    setPortion('1 serving');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setFiber('');
    setSugar('');
    setSodium('');
  };

  return (
    <Card className='mb-2'>
      <CardHeader className='pb-2'>
        <CardTitle>Add Missing Food</CardTitle>
      </CardHeader>
      <CardContent>
        <View className='gap-2'>
          <Input placeholder='Food name' value={name} onChangeText={setName} className='text-sm' />
          <View className='flex-row gap-2'>
            <View className='flex-1'>
              <Input placeholder='Portion' value={portion} onChangeText={setPortion} className='text-sm' />
            </View>
            <View className='w-24'>
              <Input placeholder='Calories' value={calories} onChangeText={setCalories} keyboardType='numeric' className='text-sm' />
            </View>
          </View>
          <View className='flex-row flex-wrap gap-2'>
            <View className='w-[30%]'>
              <Input placeholder='Protein (g)' value={protein} onChangeText={setProtein} keyboardType='numeric' className='text-sm' />
            </View>
            <View className='w-[30%]'>
              <Input placeholder='Carbs (g)' value={carbs} onChangeText={setCarbs} keyboardType='numeric' className='text-sm' />
            </View>
            <View className='w-[30%]'>
              <Input placeholder='Fat (g)' value={fat} onChangeText={setFat} keyboardType='numeric' className='text-sm' />
            </View>
            <View className='w-[30%]'>
              <Input placeholder='Fiber (g)' value={fiber} onChangeText={setFiber} keyboardType='numeric' className='text-sm' />
            </View>
            <View className='w-[30%]'>
              <Input placeholder='Sugar (g)' value={sugar} onChangeText={setSugar} keyboardType='numeric' className='text-sm' />
            </View>
            <View className='w-[30%]'>
              <Input placeholder='Sodium (mg)' value={sodium} onChangeText={setSodium} keyboardType='numeric' className='text-sm' />
            </View>
          </View>
          <Button variant='outline' size='sm' onPress={handleAdd} disabled={!name.trim()}>
            <Icon as={Plus} size={14} />
            <Text>Add to Meal</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}

function EnhancedScannerResult({
  result,
  initialMealType,
  onSave,
  onDiscard,
  onSearchFood,
}: {
  result: ScanResult;
  initialMealType: string;
  onSave: (updatedResult: ScanResult, mealType: string) => void;
  onDiscard: () => void;
  onSearchFood: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(result.name);
  const [selectedType, setSelectedType] = useState(initialMealType);
  const [saving, setSaving] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>(result.foods || []);
  const [addingFood, setAddingFood] = useState(false);

  useEffect(() => {
    setFoods(result.foods || []);
    setEditName(result.name);
    setSaving(false);
    setSelectedType(initialMealType);
  }, [result]);

  const recalcTotal = useCallback((currentFoods: FoodItem[]) => {
    return {
      calories: currentFoods.reduce((s, f) => s + f.calories, 0),
      protein_g: currentFoods.reduce((s, f) => s + f.protein_g, 0),
      carbs_g: currentFoods.reduce((s, f) => s + f.carbs_g, 0),
      fat_g: currentFoods.reduce((s, f) => s + f.fat_g, 0),
      fiber_g: currentFoods.reduce((s, f) => s + f.fiber_g, 0),
      sugar_g: currentFoods.reduce((s, f) => s + f.sugar_g, 0),
      sodium_mg: currentFoods.reduce((s, f) => s + f.sodium_mg, 0),
    };
  }, []);

  const handleFoodUpdate = (index: number, updated: FoodItem) => {
    const next = [...foods];
    next[index] = updated;
    setFoods(next);
  };

  const handleFoodRemove = (index: number) => {
    if (foods.length <= 1) return;
    const next = foods.filter((_, i) => i !== index);
    setFoods(next);
  };

  const handleAddFood = (food: FoodItem) => {
    setFoods(prev => [...prev, food]);
    setAddingFood(false);
  };

  const total = useMemo(() => recalcTotal(foods), [foods, recalcTotal]);

  const lowestConfidence = foods.length > 0
    ? Math.min(...foods.map(f => f.confidence))
    : result.confidence || 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...result,
        name: editName,
        foods,
        total_nutrition: total,
      }, selectedType);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className='bg-background max-h-[85%] rounded-t-3xl shadow-2xl'>
      <View className='items-center py-2'>
        <View className='bg-muted h-1 w-10 rounded-full' />
      </View>

      <View className='px-5 pb-8'>
        <View className='mb-3 flex-row items-center justify-between'>
          <View className='flex-row items-center gap-2'>
            <Icon as={ImageIcon} size={18} className='text-foreground' />
            <Text variant='h4'>Scan Result</Text>
          </View>
          {result.confidence && (
            <Badge variant={lowestConfidence >= 70 ? 'default' : lowestConfidence >= 50 ? 'secondary' : 'destructive'}>
              <Text className='text-xs font-bold'>
                {lowestConfidence}% Match
              </Text>
            </Badge>
          )}
        </View>

        {lowestConfidence > 0 && lowestConfidence < 70 && (
          <View className='bg-amber-50 border-amber-200 mb-3 rounded-lg border p-3'>
            <View className='flex-row items-start gap-2'>
              <Icon as={AlertTriangle} size={16} className='text-amber-600' />
              <Text className='text-amber-800 text-xs flex-1'>
                Low confidence detection. Please verify the foods listed below and edit if needed.
              </Text>
            </View>
          </View>
        )}

        <ScrollView className='max-h-[55%]' showsVerticalScrollIndicator>
          {foods.length === 0 ? (
            <FoodCard
              food={{
                name: result.name,
                confidence: result.confidence || 0,
                portion: result.serving_size || '1 serving',
                calories: result.calories || 0,
                protein_g: 0,
                carbs_g: 0,
                fat_g: 0,
                fiber_g: 0,
                sugar_g: 0,
                sodium_mg: 0,
              }}
              index={0}
              onUpdate={(_, f) => setFoods([f])}
              onRemove={() => {}}
            />
          ) : (
            foods.map((food, i) => (
              <FoodCard
                key={`${food.name}-${i}`}
                food={food}
                index={i}
                onUpdate={handleFoodUpdate}
                onRemove={handleFoodRemove}
              />
            ))
          )}

          {addingFood && (
            <AddMissingFoodForm onAdd={handleAddFood} />
          )}

          <View className='flex-row gap-2 mb-3'>
            <Button variant='outline' size='sm' className='flex-1' onPress={() => setAddingFood(!addingFood)}>
              <Icon as={Plus} size={14} />
              <Text>Add Missing Food</Text>
            </Button>
            <Button variant='outline' size='sm' className='flex-1' onPress={onSearchFood}>
              <Icon as={Search} size={14} />
              <Text>Search Food</Text>
            </Button>
          </View>

          <Card className='mb-3'>
            <CardHeader className='pb-1'>
              <View className='flex-row items-center gap-2'>
                <Icon as={Flame} size={14} className='text-orange-500' />
                <CardTitle>Total Nutrition</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <NutritionRow icon={Flame} label='Calories' value={`${total.calories} kcal`} color='text-red-500' />
              <NutritionRow icon={Beef} label='Protein' value={`${total.protein_g}g`} color={total.protein_g >= 20 ? 'text-green-600' : total.protein_g >= 10 ? 'text-amber-600' : 'text-red-600'} />
              <NutritionRow icon={Wheat} label='Carbs' value={`${total.carbs_g}g`} color={total.carbs_g >= 40 ? 'text-amber-600' : total.carbs_g >= 20 ? 'text-amber-600' : 'text-green-600'} />
              <NutritionRow icon={Droplet} label='Fat' value={`${total.fat_g}g`} color='text-purple-500' />
              <NutritionRow icon={Leaf} label='Fiber' value={`${total.fiber_g}g`} color={total.fiber_g >= 8 ? 'text-green-600' : total.fiber_g >= 4 ? 'text-amber-600' : 'text-red-600'} />
              <NutritionRow icon={ChefHat} label='Sugar' value={`${total.sugar_g}g`} color='text-pink-500' />
              <NutritionRow icon={Droplet} label='Sodium' value={`${total.sodium_mg}mg`} color='text-blue-500' />
            </CardContent>
          </Card>

          <Card className='mb-4'>
            <CardHeader>
              <CardTitle>Log as</CardTitle>
            </CardHeader>
            <CardContent className='flex-row flex-wrap gap-2'>
              {MEAL_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  className={`rounded-full px-4 py-2 ${selectedType === type ? 'bg-primary' : 'bg-muted'}`}
                  onPress={() => setSelectedType(type)}
                >
                  <Text className={selectedType === type ? 'text-primary-foreground text-sm font-medium' : 'text-foreground text-sm'}>
                    {MEAL_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </CardContent>
          </Card>

          <View className='flex-row gap-3'>
            <Button variant='outline' onPress={onDiscard} className='flex-1' disabled={saving}>
              <Icon as={X} size={16} />
              <Text>Discard</Text>
            </Button>
            <Button onPress={handleSave} className='flex-1' disabled={saving || lowestConfidence > 0 && lowestConfidence < 50}>
              {saving ? (
                <ActivityIndicator size='small' className='text-primary-foreground' />
              ) : (
                <>
                  <Icon as={Check} size={16} />
                  <Text>Save Meal</Text>
                </>
              )}
            </Button>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export function ScannerScreen({ navigation: nav }: any) {
  const navFallback = nav || { goBack: () => {}, canGoBack: () => false, navigate: () => {} };
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScannerMode>('capture');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selectedType, setSelectedType] = useState(() => {
    const h = new Date().getHours();
    if (h < 11) return 'breakfast';
    if (h < 15) return 'lunch';
    if (h < 20) return 'dinner';
    return 'snack';
  });
  const [capturing, setCapturing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState(0);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [cameraReady, setCameraReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeDetected, setBarcodeDetected] = useState('');
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const { userId } = useUser();
  const { addEntryLocal } = useJournal();
  const { logMeal } = useMeal();
  const cameraRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const barcodeTimeout = useRef<any>(null);
  const pendingAppendRef = useRef<ScanResult | null>(null);

  const localFoods = FOODS as LocalFood[];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return localFoods
      .filter(f => f.name.toLowerCase().includes(q) || f.kw.some(k => k.toLowerCase().includes(q)))
      .slice(0, 20);
  }, [searchQuery]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (barcodeScanning || scanning || capturing || result) return;
    setBarcodeScanning(true);
    setBarcodeDetected(data);

    try {
      const food = await usda.lookupBarcode(data);
      if (!food) {
        setErrorMsg('Product not found. Try searching by name below.');
        setScanning(false);
        return;
      }

      const scanResult: ScanResult = {
        name: food.name,
        calories: Math.round(food.calories),
        protein_level: calcLevel(food.protein, 20, 10),
        carbs_level: calcLevel(food.carbs, 40, 20),
        fiber_level: calcLevel(food.fiber, 8, 4),
        fat_level: calcLevel(food.fat, 20, 10),
        sugar_level: calcLevel(food.sugar, 15, 5, true),
        confidence: 90,
        guidance: `Barcode scan from USDA. ${food.brand ? `Brand: ${food.brand}.` : ''} Edit if needed.`,
        serving_size: food.servingSize,
        food_category: food.category,
        foods: [{
          name: food.name,
          confidence: 90,
          portion: food.servingSize || '1 serving',
          calories: Math.round(food.calories),
          protein_g: food.protein || 0,
          carbs_g: food.carbs || 0,
          fat_g: food.fat || 0,
          fiber_g: food.fiber || 0,
          sugar_g: food.sugar || 0,
          sodium_mg: 0,
        }],
        total_nutrition: {
          calories: Math.round(food.calories),
          protein_g: food.protein || 0,
          carbs_g: food.carbs || 0,
          fat_g: food.fat || 0,
          fiber_g: food.fiber || 0,
          sugar_g: food.sugar || 0,
          sodium_mg: 0,
        },
      };
      setResult(scanResult);
    } catch {
      setErrorMsg('Could not look up barcode. Try searching by name.');
    } finally {
      setBarcodeScanning(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !cameraReady || capturing || scanning) return;
    setErrorMsg(null);
    setCapturing(true);
    setScanning(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (!photo || !photo.base64) {
        setCapturing(false);
        setScanning(false);
        setErrorMsg('Could not capture image. Please try again.');
        return;
      }

      if (!userId) {
        setCapturing(false);
        setScanning(false);
        setErrorMsg('Please sign in to use the scanner.');
        return;
      }

      const recognition = await visionProvider.identify(photo.base64, userId);
      const foods = recognition.foods;
      const primary = foods[0];
      const total = recognition.totalNutrition;

      const scanResult: ScanResult = {
        name: primary.name,
        protein_level: gramsToLevel(total.protein_g),
        carbs_level: gramsToLevel(total.carbs_g),
        fiber_level: gramsToLevel(total.fiber_g),
        fat_level: gramsToLevel(total.fat_g),
        sugar_level: gramsToLevel(total.sugar_g),
        calories: total.calories,
        confidence: Math.round(Math.min(...foods.map(f => f.confidence))),
        guidance: `Detected ${foods.length} food item(s). Edit if needed.`,
        serving_size: foods.map(f => f.portion).join(' + '),
        food_category: 'Detected Meal',
        foods,
        total_nutrition: total,
      };
      setResult(scanResult);
    } catch {
      setErrorMsg('AI scan unavailable. Try searching by name or use barcode.');
      setScanning(false);
      setCapturing(false);
      setMode('search');
    } finally {
      setScanning(false);
      setCapturing(false);
    }
  };

  const handleGalleryPick = async () => {
    try {
      const pickResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });
      if (pickResult.canceled || !pickResult.assets?.[0]) return;
      if (!userId) {
        setScanning(false);
        setErrorMsg('Please sign in first.');
        return;
      }
      setErrorMsg(null);
      setScanning(true);
      const base64 = pickResult.assets[0].base64 || '';

      try {
        const recognition = await visionProvider.identify(base64, userId);
        const foods = recognition.foods;
        const primary = foods[0];
        const total = recognition.totalNutrition;

        setResult({
          name: primary.name,
          protein_level: gramsToLevel(total.protein_g),
          carbs_level: gramsToLevel(total.carbs_g),
          fiber_level: gramsToLevel(total.fiber_g),
          fat_level: gramsToLevel(total.fat_g),
          sugar_level: gramsToLevel(total.sugar_g),
          calories: total.calories,
          confidence: Math.round(Math.min(...foods.map(f => f.confidence))),
          guidance: `Detected ${foods.length} food item(s). Edit if needed.`,
          serving_size: foods.map(f => f.portion).join(' + '),
          food_category: 'Detected Meal',
          foods,
          total_nutrition: total,
        });
      } catch {
        setErrorMsg('Could not analyze. Try searching by name.');
        setMode('search');
      }
    } catch {
      setErrorMsg('Could not process the selected image.');
    } finally {
      setScanning(false);
    }
  };

  const handleSearchSelect = (food: LocalFood) => {
    const perGram = food.g > 0 ? 1 : 1;
    const scale = 100 / food.g;
    const cal = Math.round(food.kcal * scale);
    const p = Math.round(food.p * scale * 10) / 10;
    const c = Math.round(food.c * scale * 10) / 10;
    const fat = Math.round(food.f * scale * 10) / 10;
    const fib = Math.round(food.fib * scale * 10) / 10;

    const newFoodItem: FoodItem = {
      name: food.name,
      confidence: 85,
      portion: food.serving,
      calories: cal,
      protein_g: p,
      carbs_g: c,
      fat_g: fat,
      fiber_g: fib,
      sugar_g: food.sug || 0,
      sodium_mg: 0,
    };

    if (pendingAppendRef.current) {
      const current = pendingAppendRef.current;
      const existingFoods = current.foods || [];
      const updatedFoods = [...existingFoods, newFoodItem];
      const total = {
        calories: updatedFoods.reduce((s, f) => s + f.calories, 0),
        protein_g: updatedFoods.reduce((s, f) => s + f.protein_g, 0),
        carbs_g: updatedFoods.reduce((s, f) => s + f.carbs_g, 0),
        fat_g: updatedFoods.reduce((s, f) => s + f.fat_g, 0),
        fiber_g: updatedFoods.reduce((s, f) => s + f.fiber_g, 0),
        sugar_g: updatedFoods.reduce((s, f) => s + f.sugar_g, 0),
        sodium_mg: updatedFoods.reduce((s, f) => s + f.sodium_mg, 0),
      };
      setResult({
        ...current,
        name: current.foods ? current.foods[0]?.name || food.name : food.name,
        foods: updatedFoods,
        total_nutrition: total,
        calories: total.calories,
        protein_level: gramsToLevel(total.protein_g),
        carbs_level: gramsToLevel(total.carbs_g),
        fiber_level: gramsToLevel(total.fiber_g),
        fat_level: gramsToLevel(total.fat_g),
        sugar_level: gramsToLevel(total.sugar_g),
        confidence: Math.round(Math.min(...updatedFoods.map(f => f.confidence))),
        guidance: `Meal with ${updatedFoods.length} food item(s). Edit if needed.`,
      });
      pendingAppendRef.current = null;
    } else {
      const scanResult: ScanResult = {
        name: food.name,
        protein_level: gramsToLevel(p),
        carbs_level: gramsToLevel(c),
        fiber_level: gramsToLevel(fib),
        fat_level: gramsToLevel(fat),
        sugar_level: gramsToLevel(food.sug || 0),
        calories: cal,
        confidence: 85,
        guidance: `From local food database. Serving: ${food.serving}. Edit values if needed.`,
        serving_size: food.serving,
        food_category: food.cat,
        foods: [newFoodItem],
        total_nutrition: {
          calories: cal,
          protein_g: p,
          carbs_g: c,
          fat_g: fat,
          fiber_g: fib,
          sugar_g: food.sug || 0,
          sodium_mg: 0,
        },
      };
      setResult(scanResult);
    }
    setSearchQuery('');
  };

  const handleSaveMeal = async (updatedResult: ScanResult, mealType: string) => {
    const resultToSave = updatedResult || result;
    if (!resultToSave || !userId) return;
    try {
      const meal: Meal = {
        id: `scanned-${Date.now()}`,
        name: resultToSave.name,
        cuisine_origin: 'Scanned',
        meal_type: mealType as any,
        protein_tag: 'scanned',
        season_tags: [],
        availability_countries: [],
        ingredients: (resultToSave.foods || []).map(f => ({
          name: f.name,
          amount: f.portion,
          available_locally: true,
        })),
        replacements: [],
        recipe_text: '',
        video_query: '',
        protein_level: resultToSave.protein_level,
        carbs_level: resultToSave.carbs_level,
        fiber_level: resultToSave.fiber_level,
        fat_level: resultToSave.fat_level || 'Medium',
        sugar_level: resultToSave.sugar_level || 'Medium',
        calories: resultToSave.calories || 0,
        prep_time: 'N/A',
        image_url: '',
      };
      await logMeal(userId, meal, 'scanner');
      await addEntryLocal(meal, mealType as any, 'scanner', userId);
      setResult(null);
      setSelectedType('breakfast');
    } catch {
      Alert.alert('Error', 'Could not save this meal. Please try again.');
    }
  };

  const handleSearchFromResult = () => {
    if (result) {
      pendingAppendRef.current = result;
      setResult(null);
      setMode('search');
    }
  };

  const handleBackFromSearch = () => {
    if (pendingAppendRef.current) {
      setResult(pendingAppendRef.current);
      pendingAppendRef.current = null;
      setMode('barcode');
    } else {
      setMode('barcode');
    }
    setSearchQuery('');
  };

  const toggleFlash = () => setFlashMode(p => (p + 1) % FLASH_MODES.length);
  const toggleFacing = () => setFacing(p => (p === 'back' ? 'front' : 'back'));

  const showResult = result !== null;

  if (!permission) {
    return (
      <View className='flex-1 items-center justify-center bg-black p-6'>
        <ActivityIndicator size='large' className='text-white' />
        <Text className='text-white/70 mt-4'>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className='flex-1 items-center justify-center bg-white p-6'>
        <View className='bg-muted mb-4 size-16 items-center justify-center rounded-full'>
          <Icon as={Camera} size={32} className='text-muted-foreground' />
        </View>
        <Text variant='h4' className='mb-2'>Camera Access Needed</Text>
        <Text variant='muted' className='text-center mb-6 leading-5'>
          MealFit AI needs camera access to scan barcodes and food.
        </Text>
        <Button onPress={requestPermission} className='mb-3 w-full'>
          <Text>Grant Camera Access</Text>
        </Button>
        <TouchableOpacity onPress={() => navFallback.goBack()} activeOpacity={0.7}>
          <Text className='text-primary text-sm font-medium'>Not now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-black'>
      {!cameraReady && !scanning && !capturing && mode !== 'search' && (
        <View className='absolute inset-0 items-center justify-center bg-black z-10'>
          <ActivityIndicator size='large' color='#FFFFFF' />
          <Text className='text-white/70 mt-4'>Starting camera...</Text>
        </View>
      )}

      {mode !== 'search' && (
        <View className='flex-1'>
          <CameraView
            ref={cameraRef}
            className='flex-1'
            style={{ flex: 1 }}
            facing={facing}
            flash={FLASH_MODES[flashMode]}
            autofocus='off'
            {...(mode === 'barcode' ? {
              barcodeScannerEnabled: true,
              barcodeScannerSettings: {
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'codabar', 'itf14', 'qr'],
              },
              onBarcodeScanned: handleBarcodeScanned,
            } : {})}
            onCameraReady={() => setCameraReady(true)}
            onMountError={() => {
              setErrorMsg('Camera failed to load. Please restart the app.');
            }}
          />

          {(scanning || capturing || barcodeScanning) && (
            <View className='absolute inset-0 items-center justify-center bg-black/60 z-10'>
              <ActivityIndicator size='large' color='#FFFFFF' />
              <Text className='text-white mt-4 text-base font-bold'>{barcodeScanning ? 'Looking up barcode...' : 'Processing...'}</Text>
            </View>
          )}

          {errorMsg && !scanning && !capturing && !showResult && !barcodeScanning && (
            <View className='absolute left-4 right-4 rounded-xl bg-red-600 px-4 py-3 shadow-lg z-10' style={{ top: insets.top + 8 }}>
              <View className='flex-row items-start gap-2'>
                <Text className='text-white text-lg'>!</Text>
                <View className='flex-1'>
                  <Text className='text-white text-sm font-bold'>Scan Failed</Text>
                  <Text className='text-white/80 text-xs mt-0.5'>{errorMsg}</Text>
                </View>
                <TouchableOpacity onPress={() => setErrorMsg(null)}>
                  <Icon as={X} size={16} className='text-white/70' />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mode === 'barcode' && !showResult && !scanning && !capturing && !barcodeScanning && (
            <View className='absolute z-10' style={{ top: 0, left: 0, right: 0, bottom: 200 }}>
              <View className='flex-1 items-center justify-center px-6'>
                <View className='border-green-400/70 size-64 rounded-2xl border-2'>
                  <View className='absolute -left-0.5 -top-0.5 size-4 border-l-2 border-t-2 border-green-400 rounded-tl' />
                  <View className='absolute -right-0.5 -top-0.5 size-4 border-r-2 border-t-2 border-green-400 rounded-tr' />
                  <View className='absolute -bottom-0.5 -left-0.5 size-4 border-l-2 border-b-2 border-green-400 rounded-bl' />
                  <View className='absolute -bottom-0.5 -right-0.5 size-4 border-r-2 border-b-2 border-green-400 rounded-br' />
                </View>
                <Text className='text-green-300 mt-4 text-center text-sm font-medium'>
                  Point at barcode to scan
                </Text>
                <Text className='text-green-200/50 mt-2 text-center text-xs max-w-xs'>
                  Works on packaged foods. For fresh food, switch to Search or Capture mode.
                </Text>
              </View>
            </View>
          )}

          {mode === 'capture' && !showResult && !scanning && !capturing && (
            <View className='absolute z-10' style={{ top: 0, left: 0, right: 0, bottom: 200 }}>
              <View className='flex-1 items-center justify-center px-6'>
                <View className='border-white/50 size-64 rounded-2xl border-2' />
                <Text className='text-white/70 mt-4 text-center text-sm font-medium'>
                  Place your meal inside the frame
                </Text>
                <Text className='text-white/40 mt-2 text-center text-xs max-w-xs'>
                  Capture for AI analysis, or use Barcode/Search mode
                </Text>
              </View>
            </View>
          )}

          {!showResult && (
            <View className='absolute left-0 right-0 flex-row items-center justify-between px-4 z-10' style={{ top: insets.top + 4 }}>
              <TouchableOpacity onPress={() => navFallback.goBack()} className='bg-black/30 size-9 items-center justify-center rounded-full' activeOpacity={0.7}>
                <Icon as={ChevronLeft} size={22} className='text-white' />
              </TouchableOpacity>
              <Text className='text-white text-base font-bold'>
                {mode === 'barcode' ? 'Scan Barcode' : mode === 'capture' ? 'Scan Food' : ''}
              </Text>
              <TouchableOpacity onPress={toggleFlash} className='bg-black/30 size-9 items-center justify-center rounded-full' activeOpacity={0.7}>
                <Icon as={flashMode === 0 ? ZapOff : Zap} size={18} className='text-white' />
              </TouchableOpacity>
            </View>
          )}

          {!showResult && !scanning && !capturing && (
            <View className='absolute bottom-0 left-0 right-0 bg-black/30 px-6 pb-8 pt-4 z-10' style={{ paddingBottom: insets.bottom + 20 }}>
              <View className='flex-row items-center justify-center gap-3 mb-3'>
                <TouchableOpacity
                  onPress={() => { setMode('barcode'); setErrorMsg(null); }}
                  className={`rounded-full px-4 py-1.5 ${mode === 'barcode' ? 'bg-green-500' : 'bg-white/20'}`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-xs font-bold ${mode === 'barcode' ? 'text-white' : 'text-white/70'}`}>Barcode</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setMode('capture'); setErrorMsg(null); }}
                  className={`rounded-full px-4 py-1.5 ${mode === 'capture' ? 'bg-white' : 'bg-white/20'}`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-xs font-bold ${mode === 'capture' ? 'text-black' : 'text-white/70'}`}>Capture</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setMode('search'); setErrorMsg(null); }}
                  className={`rounded-full px-4 py-1.5 bg-white/20`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-xs font-bold text-white/70`}>Search</Text>
                </TouchableOpacity>
              </View>

              <View className='flex-row items-center justify-center gap-8'>
                <TouchableOpacity onPress={handleGalleryPick} className='items-center justify-center' activeOpacity={0.7}>
                  <View className='bg-white/20 size-12 items-center justify-center rounded-full'>
                    <Icon as={ImageIcon} size={20} className='text-white' />
                  </View>
                  <Text className='text-white/70 text-xs mt-1'>Gallery</Text>
                </TouchableOpacity>

                {mode === 'capture' && (
                  <TouchableOpacity className={`size-20 items-center justify-center rounded-full border-4 ${cameraReady ? 'border-white' : 'border-white/30'}`} onPress={handleCapture} activeOpacity={0.8} disabled={!cameraReady}>
                    <View className={`size-16 rounded-full ${cameraReady ? 'bg-white' : 'bg-white/30'}`} />
                  </TouchableOpacity>
                )}

                {mode === 'barcode' && (
                  <View className='size-20 items-center justify-center'>
                    <View className='bg-green-500/30 size-16 items-center justify-center rounded-full'>
                      <Icon as={UtensilsCrossed} size={28} className='text-green-300' />
                    </View>
                  </View>
                )}

                <TouchableOpacity onPress={toggleFacing} className='items-center justify-center' activeOpacity={0.7}>
                  <View className='bg-white/20 size-12 items-center justify-center rounded-full'>
                    <Icon as={RefreshCw} size={20} className='text-white' />
                  </View>
                  <Text className='text-white/70 text-xs mt-1'>Flip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {mode === 'search' && !showResult && (
        <View className='flex-1 bg-background' style={{ paddingTop: insets.top }}>
          <View className='flex-row items-center justify-between px-4 py-3'>
            <TouchableOpacity onPress={handleBackFromSearch} className='bg-muted size-9 items-center justify-center rounded-full' activeOpacity={0.7}>
              <Icon as={ChevronLeft} size={22} className='text-foreground' />
            </TouchableOpacity>
            <Text className='text-foreground text-base font-bold'>Search Food</Text>
            <View className='size-9' />
          </View>

          <View className='px-4 mb-3'>
            <View className='relative'>
              <Icon as={Search} size={18} className='text-muted-foreground absolute left-3 top-3.5 z-10' />
              <TextInput
                placeholder='Type a food name...'
                value={searchQuery}
                onChangeText={setSearchQuery}
                className='bg-muted text-foreground border-border rounded-xl border px-10 py-3 text-base'
                autoFocus
                autoCapitalize='words'
              />
            </View>
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={(item, i) => `${item.name}-${i}`}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSearchSelect(item)}
                className='bg-card border-border mb-2 rounded-xl border p-4'
                activeOpacity={0.7}
              >
                <View className='flex-row items-center justify-between'>
                  <View className='flex-1'>
                    <Text className='text-foreground font-semibold'>{item.name}</Text>
                    <Text className='text-muted-foreground text-xs mt-0.5'>{item.cat} · {item.serving}</Text>
                  </View>
                  <View className='items-end'>
                    <Text className='text-foreground font-bold'>{item.kcal} kcal</Text>
                    <Text className='text-muted-foreground text-xs'>
                      P:{item.p}g C:{item.c}g F:{item.f}g
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              searchQuery.trim() ? (
                <View className='items-center py-8'>
                  <Text className='text-muted-foreground'>No food found. Try a different name.</Text>
                </View>
              ) : (
                <View className='items-center py-8'>
                  <Icon as={Search} size={40} className='text-muted-foreground/30' />
                  <Text className='text-muted-foreground mt-4 text-center'>
                    Search {localFoods.length} foods in our database
                  </Text>
                </View>
              )
            }
          />
        </View>
      )}

      {showResult && result && (
        <EnhancedScannerResult
          result={result}
          initialMealType={selectedType}
          onSave={handleSaveMeal}
          onDiscard={() => setResult(null)}
          onSearchFood={handleSearchFromResult}
        />
      )}
    </View>
  );
}
