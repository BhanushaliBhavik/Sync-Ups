import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppleSignIn, useAuthStore, useGoogleSignIn, useSignIn } from '../../hooks/useAuth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const signInMutation = useSignIn();
  const googleSignInMutation = useGoogleSignIn();
  const appleSignInMutation = useAppleSignIn();
  const authStore = useAuthStore();

  const onSignInPress = async () => {
    authStore.clearError(); // Clear any previous errors
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signInMutation.mutateAsync({ email, password });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback
      console.log('Sign in completed with error');
    }
  };

  const onGoogleSignIn = async () => {
    authStore.clearError(); // Clear any previous errors
    
    try {
      await googleSignInMutation.mutateAsync();
      // Success will be handled by auth state change
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback
      console.log('Google sign in completed with error');
    }
  };

  const onAppleSignIn = async () => {
    authStore.clearError(); // Clear any previous errors
    
    try {
      await appleSignInMutation.mutateAsync();
      // Success will be handled by auth state change
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback
      console.log('Apple sign in completed with error');
    }
  };

  const isLoading = signInMutation.isPending || googleSignInMutation.isPending || appleSignInMutation.isPending;

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
          <View className="flex-1 px-6 py-6 justify-center">
            {/* Debug Info for Android Keyboard - Dev Mode */}
            {__DEV__ && Platform.OS === 'android' && (
              <View className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Text className="text-yellow-800 text-xs text-center">
                  🤖 Android Debug: KeyboardAvoidingView enabled with 'height' behavior
                </Text>
                <Text className="text-yellow-600 text-xs text-center mt-1">
                  WindowSoftInputMode: adjustResize | If keyboard still covers inputs, restart app
                </Text>
              </View>
            )}
            
            {/* iOS Debug Info - Dev Mode */}
            {__DEV__ && Platform.OS === 'ios' && (
              <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Text className="text-blue-800 text-xs text-center">
                  🍎 iOS Debug: Using 'padding' behavior + automaticallyAdjustKeyboardInsets
                </Text>
              </View>
            )}
            
            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-text-primary mb-2">
                Welcome Back
              </Text>
              <Text className="text-text-secondary text-lg">
                Sign in to your account
              </Text>
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
            {/* <View className="mb-6"> */}
              {/* Google Sign In - Disabled */}
              {/* <TouchableOpacity
                className="w-full p-4 mb-3 border border-border rounded-xl flex-row justify-center items-center bg-gray-100 shadow-sm opacity-50"
                activeOpacity={0.8}
                disabled={true}
              >
                <Ionicons name="logo-google" size={20} color="#6B7280" />
                <Text className="text-text-secondary font-semibold text-base ml-3">
                  Google Sign-In (Setup Required)
                </Text>
              </TouchableOpacity> */}

              {/* Apple Sign In - Disabled */}
              {/* <TouchableOpacity
                className="w-full p-4 border border-border rounded-xl flex-row justify-center items-center bg-gray-100 shadow-sm opacity-50"
                activeOpacity={0.8}
                disabled={true}
              >
                <Ionicons name="logo-apple" size={20} color="#6B7280" />
                <Text className="text-text-secondary font-semibold text-base ml-3">
                  Apple Sign-In (Setup Required)
                </Text>
              </TouchableOpacity>
            </View> */}

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-text-secondary font-medium">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Email/Password Form */}
            <View className="mb-8">
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
                    if (authStore.error) authStore.clearError(); // Clear error when user starts typing
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={false}
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
                    placeholder="Enter your password"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (authStore.error) authStore.clearError(); // Clear error when user starts typing
                    }}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    returnKeyType="go"
                    onSubmitEditing={() => {
                      if (!isLoading && email.trim() && password.trim()) {
                        onSignInPress();
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

              {/* Sign In Button */}
              <TouchableOpacity
                className={`w-full p-4 bg-primary rounded-xl shadow-sm ${isLoading ? 'opacity-50' : ''}`}
                onPress={onSignInPress}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text className="text-surface text-center font-bold text-lg">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center py-4">
              <Text className="text-text-secondary">Don't have an account? </Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className="text-primary font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 