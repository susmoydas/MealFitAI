import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { cn } from '../../lib/utils';
import { Skeleton } from '../rnr';

interface Props {
  uri?: string;
  fallback?: string;
  className?: string;
}

const FALLBACK_URI = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=1200&fit=crop';

export function FoodImage({ uri, fallback, className }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const source = { uri: failed || !uri ? (fallback || FALLBACK_URI) : uri };

  return (
    <View className={cn('bg-muted overflow-hidden', className)}>
      {!loaded && <Skeleton className='absolute inset-0 size-full' />}
      <Image
        source={source}
        className='size-full'
        resizeMode='cover'
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </View>
  );
}
