import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mail, User, UserPlus } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { Text, Input, Button, Icon } from '../../components/ui';

export function SignupScreen() {
  const navigation = useNavigation<any>();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please enter your name and email');
      return;
    }

    setLoading(true);
    try {
      await signup(email, name);
    } catch (error: any) {
      Alert.alert('Error', 'Signup failed. Please try again.');
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
            <Text variant='h2' className='text-foreground mb-2'>Get Started</Text>
            <Text variant='muted' className='text-muted-foreground'>
              Enter your name and email to continue
            </Text>
          </View>

          <View className='gap-4'>
            <View>
              <Text className='text-foreground font-medium mb-2'>Name</Text>
              <View className='relative'>
                <Icon as={User} size={18} className='text-muted-foreground absolute left-3 top-3.5 z-10' />
                <Input
                  placeholder='Enter your name'
                  value={name}
                  onChangeText={setName}
                  autoCapitalize='words'
                  className='pl-10'
                />
              </View>
            </View>

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
            onPress={handleSignup} 
            className='mt-6 w-full'
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size='small' className='text-primary-foreground' />
            ) : (
              <>
                <Icon as={UserPlus} size={18} />
                <Text>Continue</Text>
              </>
            )}
          </Button>

          <View className='flex-row items-center justify-center mt-6 gap-1'>
            <Text className='text-muted-foreground'>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className='text-primary font-semibold'>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
