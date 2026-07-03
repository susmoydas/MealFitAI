import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { TrendingUp, X, Sparkles } from 'lucide-react-native';
import { Text, Card, CardContent, Icon } from '../components/ui';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import { WeeklyInsight } from '../types';

export function WeeklyInsightBanner({ onSuggestionPress }: { onSuggestionPress?: (mealId: string) => void }) {
  const { userId } = useUser();
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!userId || dismissed) return;
    api.getWeeklyInsight(userId)
      .then((data: any) => setInsight(data as WeeklyInsight))
      .catch(() => setInsight(null));
  }, [userId, dismissed]);

  if (!insight || dismissed) return null;

  return (
    <Card className='mb-3 border-primary/20 bg-primary/5'>
      <CardContent className='py-3'>
        <View className='flex-row items-start gap-2'>
          <Icon
            as={insight.hasGap ? TrendingUp : Sparkles}
            size={16}
            className='text-primary mt-0.5'
          />
          <View className='flex-1'>
            <Text className='text-foreground text-sm leading-5'>{insight.message}</Text>
            {insight.hasGap && insight.suggestedMealId && (
              <TouchableOpacity
                onPress={() => onSuggestionPress?.(insight.suggestedMealId!)}
                className='mt-2 self-start rounded-full bg-primary px-3 py-1'
                activeOpacity={0.7}
              >
                <Text className='text-primary-foreground text-xs font-bold'>View suggestion</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => setDismissed(true)} hitSlop={8}>
            <Icon as={X} size={14} className='text-muted-foreground' />
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  );
}
