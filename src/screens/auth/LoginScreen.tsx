import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mail, LogIn } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Text, Input, Button, Icon } from '../../components/ui';

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await login(email);
    } catch (error: any) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <View className='flex-1 px-6 pt-8'>
          <View className='mb-8'>
            <Text variant='h2' className='text-foreground mb-2'>Welcome Back</Text>
            <Text variant='muted' className='text-muted-foreground'>
              Enter your email to continue
            </Text>
          </View>

          <View className='gap-4'>
            <View>
              <Text className='text-foreground font-medium mb-2'>Email</Text>
              <View className='relative'>
                <Icon as={Mail} size={18} className='text-muted-foreground absolute left-3 top-3.5 z-10' />
                <Input
                  placeholder='Enter your email'
                  value={email}
                  onChangeText={setEmail}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                  className='pl-10'
                />
              </View>
            </View>
          </View>

          <Button 
            onPress={handleLogin} 
            className='mt-6 w-full'
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size='small' className='text-primary-foreground' />
            ) : (
              <>
                <Icon as={LogIn} size={18} />
                <Text>Continue</Text>
              </>
            )}
          </Button>

          <View className='flex-row items-center justify-center mt-6 gap-1'>
            <Text className='text-muted-foreground'>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text className='text-primary font-semibold'>Create One</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
