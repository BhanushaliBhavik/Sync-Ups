import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppleSignIn, useAuthStore, useGoogleSignIn, useSignUp } from '../../hooks/useAuth';
import { navigationService } from '../../services/navigationService';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const signUpMutation = useSignUp();
  const googleSignInMutation = useGoogleSignIn();
  const appleSignInMutation = useAppleSignIn();
  const authStore = useAuthStore();

  const onSignUpPress = async () => {
    authStore.clearError(); // Clear any previous errors
    
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const result = await signUpMutation.mutateAsync({ 
        email, 
        password, 
        firstName, 
        lastName 
      });
      
      console.log('✅ Signup mutation successful');
      
      // Wait a moment for auth state to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUser = authStore.getCurrentUser();
      
      console.log('🔍 Auth state after signup:', {
        hasUser: !!currentUser,
        userId: currentUser?.id,
        isConfirmed: !!authStore.user,
        isWaitingForConfirmation: authStore.isWaitingForConfirmation
      });
      
      if (authStore.user) {
        // User is confirmed and signed in
        console.log('🎯 User is confirmed and signed in, setting up preferences flow');
        await navigationService.setPreferencesScreenActive(authStore.user.id);
        router.push('/property-preferences' as any);
        
      } else if (authStore.unconfirmedUser) {
        // User needs email confirmation
        console.log('📧 User needs email confirmation');
        
        // Set navigation state for when they confirm
        await navigationService.setPreferencesScreenActive(authStore.unconfirmedUser.id);
        
        Alert.alert(
          'Check Your Email! 📧',
          `We've sent a confirmation link to ${email}. Please check your email and click the link to complete your account setup.`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                console.log('👤 User needs to confirm email, staying on signup');
                // Stay on signup screen so they can see the confirmation message
              }
            }
          ]
        );
        
      } else {
        console.warn('⚠️ No user found after signup');
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
      
    } catch (error: any) {
      console.error('❌ Signup error:', error);
    }
  };

  const onGoogleSignIn = async () => {
    authStore.clearError(); // Clear any previous errors
    
    try {
      await googleSignInMutation.mutateAsync();
      
      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUser = authStore.getCurrentUser();
      
      // Set navigation state for preferences screen if user is successful
      if (currentUser?.id) {
        console.log('🎯 Google signup successful, setting up preferences flow');
        await navigationService.setPreferencesScreenActive(currentUser.id);
        
        if (authStore.user) {
          // User is confirmed and signed in
          router.push('/property-preferences' as any);
        } else if (authStore.unconfirmedUser) {
          // User needs confirmation (unlikely with OAuth but handle it)
          console.log('📧 Google user needs confirmation');
        }
      }
      
      // Success will be handled by auth state change or manual redirect
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback
      console.log('Google sign in completed with error');
    }
  };

  const onAppleSignIn = async () => {
    authStore.clearError(); // Clear any previous errors
    
    try {
      await appleSignInMutation.mutateAsync();
      
      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUser = authStore.getCurrentUser();
      
      // Set navigation state for preferences screen if user is successful
      if (currentUser?.id) {
        console.log('🎯 Apple signup successful, setting up preferences flow');
        await navigationService.setPreferencesScreenActive(currentUser.id);
        
        if (authStore.user) {
          // User is confirmed and signed in
          router.push('/property-preferences' as any);
        } else if (authStore.unconfirmedUser) {
          // User needs confirmation (unlikely with OAuth but handle it)
          console.log('📧 Apple user needs confirmation');
        }
      }
      
      // Success will be handled by auth state change or manual redirect
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback
      console.log('Apple sign in completed with error');
    }
  };

  const isLoading = signUpMutation.isPending || googleSignInMutation.isPending || appleSignInMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        enabled={true}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: Platform.OS === 'ios' ? 0 : 20
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled={Platform.OS === 'android'}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View className="flex-1 px-6 py-6">
            {/* Debug Info for Platform-specific Keyboard - Dev Mode */}
            {__DEV__ && (
              <View className={`mb-4 p-3 rounded-lg border ${Platform.OS === 'ios' ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <Text className={`text-xs text-center font-semibold ${Platform.OS === 'ios' ? 'text-blue-800' : 'text-yellow-800'}`}>
                  {Platform.OS === 'ios' ? '🍎 iOS: padding + automaticallyAdjustKeyboardInsets' : '🤖 Android: height + adjustResize'}
                </Text>
              </View>
            )}
            
            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-text-primary mb-2">
                Create Account
              </Text>
              <Text className="text-text-secondary text-lg">
                Join us to find your perfect home
              </Text>
              
              {/* Email Confirmation Waiting Status */}
              {authStore.isWaitingForConfirmation && (
                <View className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <View className="flex-row items-center justify-center mb-2">
                    <Ionicons name="mail" size={20} color="#2563EB" />
                    <Text className="text-blue-800 font-semibold ml-2">
                      Check Your Email! 📧
                    </Text>
                  </View>
                  <Text className="text-blue-700 text-sm text-center">
                    We've sent a confirmation link to your email. Please click the link to complete your registration.
                  </Text>
                  <Text className="text-blue-600 text-xs text-center mt-2">
                    {authStore.unconfirmedUser?.email}
                  </Text>
                </View>
              )}
            </View>

            {/* Error Message */}
            {authStore.error && (
              <View className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Text className="text-red-800 text-center font-medium">
                  {authStore.error}
                </Text>
              </View>
            )}

            {/* OAuth Buttons - Temporarily disabled until configured */}
            <View className="mb-6">
              {/* Google Sign In - Disabled */}
              <TouchableOpacity
                className="w-full p-4 mb-3 border border-border rounded-xl flex-row justify-center items-center bg-gray-100 shadow-sm opacity-50"
                activeOpacity={0.8}
                disabled={true}
              >
                <Ionicons name="logo-google" size={20} color="#6B7280" />
                <Text className="text-text-secondary font-semibold text-base ml-3">
                  Google Sign-Up (Setup Required)
                </Text>
              </TouchableOpacity>

              {/* Apple Sign In - Disabled */}
              <TouchableOpacity
                className="w-full p-4 border border-border rounded-xl flex-row justify-center items-center bg-gray-100 shadow-sm opacity-50"
                activeOpacity={0.8}
                disabled={true}
              >
                <Ionicons name="logo-apple" size={20} color="#6B7280" />
                <Text className="text-text-secondary font-semibold text-base ml-3">
                  Apple Sign-Up (Setup Required)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-text-secondary font-medium">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Email/Password Form */}
            <View className="mb-6">
              {/* Name Fields */}
              <View className="flex-row gap-4 mb-5">
                <View className="flex-1">
                  <Text className="text-text-primary font-semibold mb-3">First Name</Text>
                  <TextInput
                    className="w-full p-4 border border-border rounded-xl bg-surface text-text-primary text-base"
                    placeholder="First name"
                    placeholderTextColor="#6B7280"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (authStore.error) authStore.clearError();
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary font-semibold mb-3">Last Name</Text>
                  <TextInput
                    className="w-full p-4 border border-border rounded-xl bg-surface text-text-primary text-base"
                    placeholder="Last name"
                    placeholderTextColor="#6B7280"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (authStore.error) authStore.clearError();
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Email */}
              <View className="mb-5">
                <Text className="text-text-primary font-semibold mb-3">Email Address</Text>
                <TextInput
                  className="w-full p-4 border border-border rounded-xl bg-surface text-text-primary text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (authStore.error) authStore.clearError();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View className="mb-6">
                <Text className="text-text-primary font-semibold mb-3">Password</Text>
                <View className="relative">
                  <TextInput
                    className="w-full p-4 pr-14 border border-border rounded-xl bg-surface text-text-primary text-base"
                    placeholder="Create a password"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (authStore.error) authStore.clearError();
                    }}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    returnKeyType="go"
                    onSubmitEditing={() => {
                      if (!isLoading && email.trim() && password.trim() && firstName.trim() && lastName.trim()) {
                        onSignUpPress();
                      }
                    }}
                  />
                  {/* Password Visibility Toggle */}
                  <TouchableOpacity
                    className="absolute right-4 top-4"
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                className={`w-full p-4 bg-primary rounded-xl shadow-sm ${isLoading ? 'opacity-50' : ''}`}
                onPress={onSignUpPress}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text className="text-surface text-center font-bold text-lg">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center py-4">
              <Text className="text-text-secondary">Already have an account? </Text>
              <Link href="/auth/signin" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className="text-primary font-semibold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Auth State Debug - Dev Mode */}
            {__DEV__ && (
              <View className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Text className="text-blue-800 text-xs text-center">
                  🔍 Auth State: {(() => {
                    const currentUser = authStore.getCurrentUser();
                    if (authStore.user) return `Confirmed (${authStore.user.email})`;
                    if (authStore.unconfirmedUser) return `Unconfirmed (${authStore.unconfirmedUser.email})`;
                    return 'Not signed in';
                  })()}
                </Text>
                <Text className="text-blue-600 text-xs text-center mt-1">
                  Loading: {authStore.isLoading ? 'Yes' : 'No'} | Waiting for confirmation: {authStore.isWaitingForConfirmation ? 'Yes' : 'No'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 