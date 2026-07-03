import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight } from 'lucide-react-native';
import { COUNTRIES } from '../../constants';
import { Text, Icon } from '../../components/ui';

export function CountrySetupScreen({ navigation }: any) {
  const [q, setQ] = useState('');
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top', 'bottom']}>
      <View className='px-8 pb-2 pt-4'>
        <Text variant='h1' className='mb-0.5'>Where are you?</Text>
        <Text variant='p' className='text-muted-foreground'>
          We use this to suggest meals you can actually cook locally.
        </Text>
      </View>
      <View className='relative mx-3 mb-3'>
        <Icon as={Search} size={18} className='text-muted-foreground absolute left-3 top-3 z-10' />
        <TextInput
          className='h-10 rounded-md border border-border bg-background pl-9 pr-3 text-foreground placeholder:text-muted-foreground'
          placeholder='Search country...'
          placeholderTextColor='hsl(var(--muted-foreground))'
          value={q}
          onChangeText={setQ}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={c => c.code}
        contentContainerClassName='px-3 pb-16'
        renderItem={({ item }) => (
          <TouchableOpacity
            className='flex-row items-center justify-between py-4 border-b border-border'
            onPress={() => navigation.navigate('DietSetup', { country: item.code })}
            activeOpacity={0.7}
          >
            <Text className='text-foreground'>{item.name}</Text>
            <Icon as={ChevronRight} size={20} className='text-muted-foreground' />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text variant='muted' className='text-center pt-16'>No countries match your search.</Text>
        }
      />
    </SafeAreaView>
  );
}
