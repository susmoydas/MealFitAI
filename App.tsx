import './global.css';
import React, { useEffect } from 'react';
import { StatusBar, Appearance } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider, useUser } from './src/context/UserContext';
import { MealProvider } from './src/context/MealContext';
import { WeatherProvider } from './src/context/WeatherContext';
import { JournalProvider, useJournal } from './src/context/JournalContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function AppContent() {
  const { userId } = useUser();
  const { ensureSeeded } = useJournal();

  useEffect(() => {
    if (userId) ensureSeeded(userId);
  }, [userId]);

  return <AppNavigator />;
}

export default function App() {
  useEffect(() => {
    Appearance.setColorScheme('light');
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor('#FFFFFF');
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle='dark-content' backgroundColor='#FFFFFF' />
      <UserProvider>
        <WeatherProvider>
          <MealProvider>
            <JournalProvider>
              <AppContent />
            </JournalProvider>
          </MealProvider>
        </WeatherProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
