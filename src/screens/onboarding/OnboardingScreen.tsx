import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Modal, FlatList, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Apple, ChevronDown, Check, X } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { COUNTRIES, FOOD_PREFERENCES, HEALTH_GOALS } from '../../constants';
import { Text, Icon, Input, Button, Card, CardContent, Separator } from '../../components/ui';

const ALLERGY_OPTIONS = [
  'Dairy', 'Eggs', 'Gluten', 'Peanuts', 'Tree Nuts', 'Soy',
  'Fish', 'Shellfish', 'Sesame', 'Sulfites',
];

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function OnboardingScreen() {
  const { saveProfile } = useUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [foodPreference, setFoodPreference] = useState('');
  const [healthGoal, setHealthGoal] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const countryLabel = COUNTRIES.find(c => c.code === country)?.name || 'Select your country';
  const foodLabel = FOOD_PREFERENCES.find(p => p.value === foodPreference)?.label || 'Select food preference';
  const goalLabel = HEALTH_GOALS.find(g => g.value === healthGoal)?.label || 'Select health goal (optional)';

  const toggleAllergy = (item: string) => {
    setAllergies(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      Alert.alert('Valid email required', 'Please enter a valid email address.');
      return;
    }
    if (!country) {
      Alert.alert('Country required', 'Please select your country.');
      return;
    }
    if (!foodPreference) {
      Alert.alert('Food preference required', 'Please select your food preference.');
      return;
    }

    setSaving(true);
    try {
      await saveProfile({
        id: '',
        name: trimmedName,
        email: trimmedEmail,
        country,
        diet_preference: foodPreference,
        allergies,
        activity_level: 'moderate',
        health_goal: healthGoal || 'general_health',
        units: 'metric',
      });
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName='pb-10'
          keyboardShouldPersistTaps='handled'
        >
          {/* Hero */}
          <View className='items-center px-6 pt-8 pb-6'>
            <View className='bg-primary/10 size-20 items-center justify-center rounded-full mb-4'>
              <Icon as={Apple} size={36} className='text-primary' />
            </View>
            <Text variant='h1' className='mb-1'>MealFit</Text>
            <Text variant='lead' className='text-center'>
              Your personal AI nutrition companion
            </Text>
          </View>

          <View className='px-4 gap-4'>
            {/* Name */}
            <View>
              <Text className='text-sm font-semibold text-foreground mb-1.5'>
                Full Name <Text className='text-error'>*</Text>
              </Text>
              <Input
                placeholder='Enter your full name'
                value={name}
                onChangeText={setName}
                autoCapitalize='words'
                autoCorrect={false}
              />
            </View>

            {/* Email */}
            <View>
              <Text className='text-sm font-semibold text-foreground mb-1.5'>
                Email <Text className='text-error'>*</Text>
              </Text>
              <Input
                placeholder='Enter your email'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
              />
            </View>

            {/* Country Picker */}
            <View>
              <Text className='text-sm font-semibold text-foreground mb-1.5'>
                Country <Text className='text-error'>*</Text>
              </Text>
              <TouchableOpacity
                className='border-border bg-background flex h-10 w-full flex-row items-center rounded-md border px-3'
                onPress={() => setShowCountryPicker(true)}
              >
                <Text className={`flex-1 text-base ${country ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {countryLabel}
                </Text>
                <Icon as={ChevronDown} size={16} className='text-muted-foreground' />
              </TouchableOpacity>
            </View>

            {/* Food Preference */}
            <View>
              <Text className='text-sm font-semibold text-foreground mb-1.5'>
                Food Preference <Text className='text-error'>*</Text>
              </Text>
              <TouchableOpacity
                className='border-border bg-background flex h-10 w-full flex-row items-center rounded-md border px-3'
                onPress={() => setShowFoodPicker(true)}
              >
                <Text className={`flex-1 text-base ${foodPreference ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {foodLabel}
                </Text>
                <Icon as={ChevronDown} size={16} className='text-muted-foreground' />
              </TouchableOpacity>
            </View>

            {/* Health Goal (optional) */}
            <View>
              <Text className='text-sm font-semibold text-foreground mb-1.5'>
                Health Goal <Text className='text-muted-foreground text-xs'>(optional)</Text>
              </Text>
              <TouchableOpacity
                className='border-border bg-background flex h-10 w-full flex-row items-center rounded-md border px-3'
                onPress={() => setShowGoalPicker(true)}
              >
                <Text className={`flex-1 text-base ${healthGoal ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {goalLabel}
                </Text>
                <Icon as={ChevronDown} size={16} className='text-muted-foreground' />
              </TouchableOpacity>
            </View>

            {/* Allergies (optional) */}
            <View>
              <Text className='text-sm font-semibold text-foreground mb-2'>
                Allergies <Text className='text-muted-foreground text-xs'>(optional)</Text>
              </Text>
              <View className='flex-row flex-wrap gap-2'>
                {ALLERGY_OPTIONS.map(item => {
                  const selected = allergies.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-2 ${
                        selected ? 'bg-error/10 border border-error/30' : 'bg-muted border border-border'
                      }`}
                      onPress={() => toggleAllergy(item)}
                    >
                      <Text className={`text-sm ${selected ? 'text-error font-medium' : 'text-foreground'}`}>
                        {item}
                      </Text>
                      {selected && <Icon as={X} size={12} className='text-error' />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save Button */}
            <Button
              className='w-full mt-4'
              size='lg'
              disabled={saving}
              onPress={handleSave}
            >
              <Text className='text-primary-foreground font-semibold text-base'>
                {saving ? 'Saving...' : 'Get Started'}
              </Text>
            </Button>

            <Text variant='muted' className='text-center text-xs mt-1'>
              You can update these anytime in your Profile settings.
            </Text>
          </View>
        </ScrollView>

        {/* Country Picker Modal */}
        <Modal visible={showCountryPicker} animationType='slide' transparent>
          <View className='flex-1 justify-end bg-black/40'>
            <View className='bg-background rounded-t-2xl max-h-[60%]'>
              <View className='flex-row items-center justify-between px-4 py-3 border-b border-border'>
                <Text variant='h4'>Select Country</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                  <Icon as={X} size={20} className='text-muted-foreground' />
                </TouchableOpacity>
              </View>
              <FlatList
                data={COUNTRIES}
                keyExtractor={c => c.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`flex-row items-center gap-3 px-4 py-3.5 ${
                      country === item.code ? 'bg-primary/5' : ''
                    }`}
                    onPress={() => {
                      setCountry(item.code);
                      setShowCountryPicker(false);
                    }}
                  >
                    <Text className={`flex-1 text-base ${country === item.code ? 'text-primary font-medium' : 'text-foreground'}`}>
                      {item.name}
                    </Text>
                    {country === item.code && (
                      <Icon as={Check} size={18} className='text-primary' />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Food Preference Picker Modal */}
        <Modal visible={showFoodPicker} animationType='slide' transparent>
          <View className='flex-1 justify-end bg-black/40'>
            <View className='bg-background rounded-t-2xl max-h-[60%]'>
              <View className='flex-row items-center justify-between px-4 py-3 border-b border-border'>
                <Text variant='h4'>Food Preference</Text>
                <TouchableOpacity onPress={() => setShowFoodPicker(false)}>
                  <Icon as={X} size={20} className='text-muted-foreground' />
                </TouchableOpacity>
              </View>
              <FlatList
                data={FOOD_PREFERENCES as unknown as { value: string; label: string }[]}
                keyExtractor={p => p.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`flex-row items-center gap-3 px-4 py-3.5 ${
                      foodPreference === item.value ? 'bg-primary/5' : ''
                    }`}
                    onPress={() => {
                      setFoodPreference(item.value);
                      setShowFoodPicker(false);
                    }}
                  >
                    <Text className={`flex-1 text-base ${foodPreference === item.value ? 'text-primary font-medium' : 'text-foreground'}`}>
                      {item.label}
                    </Text>
                    {foodPreference === item.value && (
                      <Icon as={Check} size={18} className='text-primary' />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Health Goal Picker Modal */}
        <Modal visible={showGoalPicker} animationType='slide' transparent>
          <View className='flex-1 justify-end bg-black/40'>
            <View className='bg-background rounded-t-2xl max-h-[60%]'>
              <View className='flex-row items-center justify-between px-4 py-3 border-b border-border'>
                <Text variant='h4'>Health Goal</Text>
                <TouchableOpacity onPress={() => setShowGoalPicker(false)}>
                  <Icon as={X} size={20} className='text-muted-foreground' />
                </TouchableOpacity>
              </View>
              <FlatList
                data={[...HEALTH_GOALS, { value: '', label: 'Skip — not sure yet' }] as { value: string; label: string }[]}
                keyExtractor={g => g.value || 'skip'}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`flex-row items-center gap-3 px-4 py-3.5 ${
                      healthGoal === item.value ? 'bg-primary/5' : ''
                    }`}
                    onPress={() => {
                      setHealthGoal(item.value);
                      setShowGoalPicker(false);
                    }}
                  >
                    <Text className={`flex-1 text-base ${healthGoal === item.value ? 'text-primary font-medium' : 'text-foreground'}`}>
                      {item.label}
                    </Text>
                    {healthGoal === item.value && (
                      <Icon as={Check} size={18} className='text-primary' />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
