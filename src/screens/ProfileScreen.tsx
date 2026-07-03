import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Switch, Modal, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, Globe, ChefHat, Target, Activity,
  AlertTriangle, ChevronRight, Droplets, Apple, Heart,
  Bell, UtensilsCrossed, Wine, Salad, Footprints, Sun,
  X, Check,
} from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { COUNTRIES, FOOD_PREFERENCES, HEALTH_GOALS } from '../constants';
import { Text, Card, CardContent, Icon, Badge, Separator } from '../components/ui';

export function ProfileScreen() {
  const { userId, profile, updateProfile } = useUser();
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState({
    meal: true, water: true, nutrition: true, walking: false, weather: true, fruit: false,
  });

  // Edit modals
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [editCountry, setEditCountry] = useState(false);
  const [editFood, setEditFood] = useState(false);

  const countryLabel = COUNTRIES.find(c => c.code === profile.country)?.name || profile.country || 'Not set';
  const foodLabel = FOOD_PREFERENCES.find(p => p.value === profile.diet_preference)?.label || profile.diet_preference || 'Not set';
  const goalLabel = HEALTH_GOALS.find(g => g.value === profile.health_goal)?.label || profile.health_goal || 'Not set';

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { Alert.alert('Error', 'Name cannot be empty.'); return; }
    setSaving(true);
    await updateProfile({ name: trimmed });
    setSaving(false);
    setEditName(false);
  };

  const saveField = async (field: string, value: string) => {
    setSaving(true);
    await updateProfile({ [field]: value });
    setSaving(false);
  };

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
              <TouchableOpacity onPress={() => { setNameInput(profile.name || ''); setEditName(true); }}>
                <Text variant='h4' className='text-foreground'>{profile.name || 'Tap to set name'}</Text>
              </TouchableOpacity>
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
              <TouchableOpacity
                onPress={() => setEditCountry(true)}
                className='flex-row items-center gap-3 px-4 py-3.5 border-b border-border/50'
              >
                <View className='bg-muted size-8 items-center justify-center rounded-lg'>
                  <Icon as={Globe} size={16} className='text-foreground' />
                </View>
                <Text className='text-foreground flex-1'>Region</Text>
                <Text variant='muted' className='text-sm mr-1'>{countryLabel}</Text>
                <Icon as={ChevronRight} size={14} className='text-muted-foreground' />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditFood(true)}
                className='flex-row items-center gap-3 px-4 py-3.5'
              >
                <View className='bg-muted size-8 items-center justify-center rounded-lg'>
                  <Icon as={ChefHat} size={16} className='text-foreground' />
                </View>
                <Text className='text-foreground flex-1'>Food Preference</Text>
                <Text variant='muted' className='text-sm mr-1'>{foodLabel}</Text>
                <Icon as={ChevronRight} size={14} className='text-muted-foreground' />
              </TouchableOpacity>
            </CardContent>
          </Card>

          <Text className='text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3'>Health & Fitness</Text>

          <Card className='mb-3'>
            <CardContent className='p-0'>
              <View className='flex-row items-center gap-3 px-4 py-3.5 border-b border-border/50'>
                <View className='bg-muted size-8 items-center justify-center rounded-lg'>
                  <Icon as={Target} size={16} className='text-foreground' />
                </View>
                <Text className='text-foreground flex-1'>Health Goal</Text>
                <Text variant='muted' className='text-sm mr-1'>{goalLabel}</Text>
              </View>
              <View className='flex-row items-center gap-3 px-4 py-3.5 border-b border-border/50'>
                <View className='bg-muted size-8 items-center justify-center rounded-lg'>
                  <Icon as={Activity} size={16} className='text-foreground' />
                </View>
                <Text className='text-foreground flex-1'>Activity Level</Text>
                <Text variant='muted' className='text-sm mr-1'>
                  {profile.activity_level ? profile.activity_level.charAt(0).toUpperCase() + profile.activity_level.slice(1).replace('_', ' ') : 'Moderate'}
                </Text>
              </View>
              <View className='flex-row items-center gap-3 px-4 py-3.5'>
                <View className='bg-muted size-8 items-center justify-center rounded-lg'>
                  <Icon as={Droplets} size={16} className='text-foreground' />
                </View>
                <Text className='text-foreground flex-1'>Units</Text>
                <Text variant='muted' className='text-sm mr-1'>
                  {profile.units === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lb, ft)'}
                </Text>
              </View>
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

      {/* Edit Name Modal */}
      <Modal visible={editName} animationType='fade' transparent>
        <View className='flex-1 items-center justify-center bg-black/40 px-6'>
          <View className='bg-background rounded-2xl w-full p-6'>
            <Text variant='h4' className='mb-4'>Edit Name</Text>
            <TextInput
              className='border-border bg-background text-foreground h-10 w-full rounded-md border px-3 text-base'
              value={nameInput}
              onChangeText={setNameInput}
              placeholder='Enter your name'
              autoFocus
            />
            <View className='flex-row gap-3 mt-4 justify-end'>
              <TouchableOpacity className='px-4 py-2' onPress={() => setEditName(false)}>
                <Text className='text-muted-foreground'>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className='bg-primary px-4 py-2 rounded-md'
                onPress={saveName}
              >
                <Text className='text-primary-foreground font-medium'>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Country Modal */}
      <Modal visible={editCountry} animationType='slide' transparent>
        <View className='flex-1 justify-end bg-black/40'>
          <View className='bg-background rounded-t-2xl max-h-[60%]'>
            <View className='flex-row items-center justify-between px-4 py-3 border-b border-border'>
              <Text variant='h4'>Select Country</Text>
              <TouchableOpacity onPress={() => setEditCountry(false)}>
                <Icon as={X} size={20} className='text-muted-foreground' />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={c => c.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center gap-3 px-4 py-3.5 ${profile.country === item.code ? 'bg-primary/5' : ''}`}
                  onPress={() => {
                    saveField('country', item.code);
                    setEditCountry(false);
                  }}
                >
                  <Text className={`flex-1 text-base ${profile.country === item.code ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {item.name}
                  </Text>
                  {profile.country === item.code && (
                    <Icon as={Check} size={18} className='text-primary' />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Edit Food Preference Modal */}
      <Modal visible={editFood} animationType='slide' transparent>
        <View className='flex-1 justify-end bg-black/40'>
          <View className='bg-background rounded-t-2xl max-h-[60%]'>
            <View className='flex-row items-center justify-between px-4 py-3 border-b border-border'>
              <Text variant='h4'>Food Preference</Text>
              <TouchableOpacity onPress={() => setEditFood(false)}>
                <Icon as={X} size={20} className='text-muted-foreground' />
              </TouchableOpacity>
            </View>
            <FlatList
              data={FOOD_PREFERENCES as unknown as { value: string; label: string }[]}
              keyExtractor={p => p.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center gap-3 px-4 py-3.5 ${profile.diet_preference === item.value ? 'bg-primary/5' : ''}`}
                  onPress={() => {
                    saveField('diet_preference', item.value);
                    setEditFood(false);
                  }}
                >
                  <Text className={`flex-1 text-base ${profile.diet_preference === item.value ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {item.label}
                  </Text>
                  {profile.diet_preference === item.value && (
                    <Icon as={Check} size={18} className='text-primary' />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
