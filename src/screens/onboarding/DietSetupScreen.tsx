import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DIET_OPTIONS } from '../../constants';
import { useUser } from '../../context/UserContext';
import { Text, Button } from '../../components/ui';

const EMOJI: Record<string, string> = {
  omnivore: '\uD83C\uDF56',
  vegetarian: '\uD83E\uDD66',
  vegan: '\uD83C\uDF31',
  pescatarian: '\uD83D\uDC1F',
};

export function DietSetupScreen({ route }: any) {
  const { country } = route.params;
  const { setupUser, markOnboarded } = useUser();
  const [selected, setSelected] = useState('omnivore');
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    setLoading(true);
    await setupUser({
      country,
      diet_preference: selected,
      allergies: [],
      activity_level: 'medium',
      health_goal: 'balanced',
      units: 'metric',
    });
    await markOnboarded();
  };

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top', 'bottom']}>
      <View className='px-8 pb-3 pt-4'>
        <Text variant='h1' className='mb-0.5'>Your diet preference?</Text>
        <Text variant='p' className='text-muted-foreground'>
          This helps us filter out unsuitable meals.
        </Text>
      </View>

      <View className='flex-1 px-3'>
        {DIET_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            className={`flex-row items-center gap-4 p-4 rounded-xl border-2 mb-3 ${
              selected === opt
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card'
            }`}
            onPress={() => setSelected(opt)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 24 }}>{EMOJI[opt]}</Text>
            <Text
              className={`font-medium ${
                selected === opt ? 'text-primary font-bold' : 'text-foreground'
              }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className='px-3 pb-8'>
        <Button onPress={finish} disabled={loading}>
          {loading ? (
            <ActivityIndicator size='small' color='hsl(var(--primary-foreground))' />
          ) : (
            <Text>Start eating smart</Text>
          )}
        </Button>
      </View>
    </SafeAreaView>
  );
}
