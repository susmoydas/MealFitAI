import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, Settings, Globe, ChefHat, Target, Activity,
  AlertTriangle, ChevronRight, Droplets, Apple, Heart,
  Bell, UtensilsCrossed, Wine, Salad, Footprints, Sun,
} from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { COUNTRIES, DIET_OPTIONS } from '../constants';
import { Text, Card, CardContent, Icon, Avatar, AvatarFallback, Separator, Badge } from '../components/ui';

export function ProfileScreen() {
  const { userId, profile, updateProfile } = useUser();
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState({
    meal: true, water: true, nutrition: true, walking: false, weather: true, fruit: false,
  });

  if (!profile) {
    return (
      <SafeAreaView className='bg-background flex-1' edges={['top', 'bottom']}>
        <View className='flex-1 items-center justify-center p-6'>
          <Icon as={User} size={48} className='text-muted-foreground mb-4' />
          <Text variant='h4'>No profile loaded</Text>
        </View>
      </SafeAreaView>
    );
  }

  const updateField = async (field: string, value: string) => {
    setSaving(true);
    try {
      await updateProfile({ ...profile, [field]: value });
    } catch {
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const countryLabel = COUNTRIES.find(c => c.code === profile.country)?.name || profile.country;

  return (
    <SafeAreaView className='bg-background flex-1' edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName='pb-8'>
        <View className='px-4 pt-4 pb-2'>
          <View className='flex-row items-center gap-3'>
            <View className='bg-primary/10 size-16 items-center justify-center rounded-full'>
              <Text className='text-primary text-2xl font-bold'>
                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View className='flex-1'>
              <Text variant='h4' className='text-foreground'>{profile.name || 'User'}</Text>
              <Text variant='muted' className='text-sm'>ID: {userId?.slice(0, 8)}...</Text>
              <Badge variant='outline' className='self-start mt-1'>
                <Text className='text-xs'>{profile.units === 'metric' ? 'Metric' : 'Imperial'}</Text>
              </Badge>
            </View>
            <Icon as={ChevronRight} size={20} className='text-muted-foreground' />
          </View>
        </View>

        <View className='px-4 pt-4'>
          <Text className='text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3'>Preferences</Text>

          <Card className='mb-3'>
            <CardContent className='p-0'>
              <SettingsRow icon={Globe} label='Region' value={countryLabel} />
              <SettingsRow icon={ChefHat} label='Diet Preference' value={profile.diet_preference ? profile.diet_preference.charAt(0).toUpperCase() + profile.diet_preference.slice(1) : 'Omnivore'} last />
            </CardContent>
          </Card>

          <Text className='text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3'>Health & Fitness</Text>

          <Card className='mb-3'>
            <CardContent className='p-0'>
              <SettingsRow icon={Target} label='Health Goal' value={profile.health_goal ? profile.health_goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General Health'} />
              <SettingsRow icon={Activity} label='Activity Level' value={profile.activity_level ? profile.activity_level.charAt(0).toUpperCase() + profile.activity_level.slice(1).replace('_', ' ') : 'Moderate'} />
              <SettingsRow icon={Droplets} label='Units' value={profile.units === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lb, ft)'} last />
            </CardContent>
          </Card>

          {profile.allergies && profile.allergies.length > 0 && (
            <>
              <Text className='text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3'>Allergies & Restrictions</Text>
              <Card className='mb-3'>
                <CardContent className='p-4'>
                  <View className='flex-row flex-wrap gap-2'>
                    {profile.allergies.map(a => (
                      <View key={a} className='flex-row items-center gap-1.5 bg-red-50 rounded-full px-3 py-1.5'>
                        <Icon as={AlertTriangle} size={12} className='text-red-500' />
                        <Text className='text-red-600 text-sm font-medium'>{a}</Text>
                      </View>
                    ))}
                  </View>
                </CardContent>
              </Card>
            </>
          )}

          <Text className='text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3'>Preferences</Text>

          <Card className='mb-6'>
            <CardContent className='p-0'>
              <SettingsRow icon={Heart} label='Dietary Options' value={`${DIET_OPTIONS.length} available`} last />
            </CardContent>
          </Card>

          <Text className='text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3'>Notification Settings</Text>

          <Card className='mb-6'>
            <CardContent className='p-0'>
              <NotifRow icon={UtensilsCrossed} label='Meal Reminder' value={notif.meal} onToggle={() => setNotif(p => ({ ...p, meal: !p.meal }))} />
              <NotifRow icon={Wine} label='Drink Water' value={notif.water} onToggle={() => setNotif(p => ({ ...p, water: !p.water }))} />
              <NotifRow icon={Salad} label='Daily Nutrition' value={notif.nutrition} onToggle={() => setNotif(p => ({ ...p, nutrition: !p.nutrition }))} />
              <NotifRow icon={Footprints} label='Walking' value={notif.walking} onToggle={() => setNotif(p => ({ ...p, walking: !p.walking }))} />
              <NotifRow icon={Sun} label='Weather-based' value={notif.weather} onToggle={() => setNotif(p => ({ ...p, weather: !p.weather }))} />
              <NotifRow icon={Apple} label='Seasonal Fruit' value={notif.fruit} onToggle={() => setNotif(p => ({ ...p, fruit: !p.fruit }))} last />
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({ icon, label, value, last }: { icon: any; label: string; value: string; last?: boolean }) {
  return (
    <TouchableOpacity className={`flex-row items-center gap-3 px-4 py-3.5 ${!last ? 'border-b border-border/50' : ''}`}>
      <View className='bg-muted size-8 items-center justify-center rounded-lg'>
        <Icon as={icon} size={16} className='text-foreground' />
      </View>
      <Text className='text-foreground flex-1'>{label}</Text>
      <Text variant='muted' className='text-sm mr-1'>{value}</Text>
      <Icon as={ChevronRight} size={14} className='text-muted-foreground' />
    </TouchableOpacity>
  );
}

function NotifRow({ icon, label, value, onToggle, last }: { icon: any; label: string; value: boolean; onToggle: () => void; last?: boolean }) {
  return (
    <View className={`flex-row items-center gap-3 px-4 py-3.5 ${!last ? 'border-b border-border/50' : ''}`}>
      <View className='bg-muted size-8 items-center justify-center rounded-lg'>
        <Icon as={icon} size={16} className='text-foreground' />
      </View>
      <Text className='text-foreground flex-1'>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e2e8f0', true: '#1D9E7540' }}
        thumbColor={value ? '#1D9E75' : '#cbd5e1'}
      />
    </View>
  );
}
