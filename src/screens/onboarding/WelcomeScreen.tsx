import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../../components/ui';

export function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView className='bg-background flex-1'>
      <View className='flex-1 justify-between px-8 pb-8'>
        <View className='flex-1 justify-center items-center'>
          <Text style={{ fontSize: 80 }} className='mb-4'>{'\uD83E\uDD57'}</Text>
          <Text variant='h1' className='text-center mb-3'>MealFit AI</Text>
          <Text variant='lead' className='text-center leading-6 mb-2'>
            Smart meal suggestions based on your location, the weather today, and what you already ate.
          </Text>
          <Text variant='muted' className='text-center'>
            Free. No login. No calorie counting.
          </Text>
        </View>
        <Button onPress={() => navigation.navigate('CountrySetup')}>
          <Text>Get Started</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
