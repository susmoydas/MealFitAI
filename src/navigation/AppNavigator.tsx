import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  Home, BookOpen, Camera, Clock, User,
} from 'lucide-react-native';
import { Icon, Text } from '../components/ui';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { CountrySetupScreen } from '../screens/onboarding/CountrySetupScreen';
import { DietSetupScreen } from '../screens/onboarding/DietSetupScreen';

import { HomeScreen } from '../screens/HomeScreen';
import { MealDetailScreen } from '../screens/MealDetailScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { MealHistoryScreen } from '../screens/MealHistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { RecipeLibraryScreen } from '../screens/RecipeLibraryScreen';
import { ManualEntryScreen } from '../screens/ManualEntryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, any> = {
  Home: Home,
  Recipes: BookOpen,
  Scanner: Camera,
  History: Clock,
  Profile: User,
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Recipes: 'Recipes',
  Scanner: 'Scan',
  History: 'History',
  Profile: 'Profile',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const LucideIcon = TAB_ICONS[name];
  if (!LucideIcon) return null;
  return (
    <View className={`items-center justify-center rounded-xl px-3 py-1.5 ${focused ? 'bg-primary/10' : ''}`}>
      <Icon as={LucideIcon} size={22} className={focused ? 'text-primary' : 'text-muted-foreground'} />
      <Text className={`text-xs font-semibold mt-0.5 ${focused ? 'text-primary' : 'text-muted-foreground'}`}>
        {TAB_LABELS[name]}
      </Text>
    </View>
  );
}

function HomeTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopColor: '#E4E6EB',
          borderTopWidth: 1,
          backgroundColor: '#FFFFFF',
          paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 6,
          paddingTop: 6,
          height: 64 + (insets.bottom > 0 ? insets.bottom - 4 : 6),
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
      backBehavior='initialRoute'
    >
      <Tab.Screen name='Home' component={HomeStack} />
      <Tab.Screen name='Recipes' component={RecipesStack} />
      <Tab.Screen name='Scanner' component={ScannerScreen} />
      <Tab.Screen name='History' component={MealHistoryScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='HomeMain' component={HomeScreen} />
      <Stack.Screen name='MealDetail' component={MealDetailScreen} />
      <Stack.Screen name='Search' component={SearchScreen} />
      <Stack.Screen name='ManualEntry' component={ManualEntryScreen} />
    </Stack.Navigator>
  );
}

function RecipesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='RecipesMain' component={RecipeLibraryScreen} />
      <Stack.Screen name='MealDetail' component={MealDetailScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login' component={LoginScreen} />
      <Stack.Screen name='Signup' component={SignupScreen} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Welcome' component={WelcomeScreen} />
      <Stack.Screen name='CountrySetup' component={CountrySetupScreen} />
      <Stack.Screen name='DietSetup' component={DietSetupScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const [onboarded, setOnboarded] = React.useState(false);
  const [onboardingChecked, setOnboardingChecked] = React.useState(false);

  React.useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const { isOnboarded } = await import('../services/storage');
        const result = await isOnboarded();
        setOnboarded(result);
      } catch {
        setOnboarded(false);
      } finally {
        setOnboardingChecked(true);
      }
    };
    checkOnboarding();
  }, []);

  if (authLoading || !onboardingChecked) {
    return (
      <View className='flex-1 items-center justify-center bg-background'>
        <ActivityIndicator size='large' className='text-primary' />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name='Auth' component={AuthStack} />
        ) : !onboarded ? (
          <Stack.Screen name='Onboarding' component={OnboardingStack} />
        ) : (
          <Stack.Screen name='Main' component={HomeTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
