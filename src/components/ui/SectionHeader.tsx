import React from 'react';
import { View } from 'react-native';
import { Text, Icon } from '../rnr';
import type { LucideIcon } from 'lucide-react-native';

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, subtitle, icon, action }: Props) {
  return (
    <View className='mb-3 mt-4 flex-row items-center justify-between'>
      <View className='flex-1 flex-row items-center gap-2'>
        {icon && <Icon as={icon} size={18} className='text-muted-foreground' />}
        <View>
          <Text variant='h4' className='text-foreground'>{title}</Text>
          {subtitle && <Text variant='muted'>{subtitle}</Text>}
        </View>
      </View>
      {action && (
        <Text className='text-primary font-semibold' onPress={action.onPress}>{action.label}</Text>
      )}
    </View>
  );
}
