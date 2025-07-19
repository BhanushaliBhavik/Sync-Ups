import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppleSignIn, useAuthStore, useGoogleSignIn, useSignIn } from '../../hooks/useAuth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      router.replace('/(tabs)/search');
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
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-8">
            {/* Header */}
            <View className="mb-8 mt-4">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </Text>
              <Text className="text-gray-600 text-lg">
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
            <View className="mb-8">
              {/* Google Sign In - Disabled */}
              <TouchableOpacity
                className="w-full p-4 mb-4 border border-gray-300 rounded-xl flex-row justify-center items-center bg-gray-100 shadow-sm opacity-50"
                activeOpacity={0.8}
                disabled={true}
              >
                <Ionicons name="logo-google" size={20} color="#9CA3AF" />
                <Text className="text-gray-500 font-semibold text-base ml-3">
                  Google Sign-In (Setup Required)
                </Text>
              </TouchableOpacity>

              {/* Apple Sign In - Disabled */}
              <TouchableOpacity
                className="w-full p-4 border border-gray-300 rounded-xl flex-row justify-center items-center bg-gray-100 shadow-sm opacity-50"
                activeOpacity={0.8}
                disabled={true}
              >
                <Ionicons name="logo-apple" size={20} color="#9CA3AF" />
                <Text className="text-gray-500 font-semibold text-base ml-3">
                  Apple Sign-In (Setup Required)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="flex-row items-center mb-8">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 font-medium">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Email/Password Form */}
            <View className="mb-8">
              {/* Email */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-3">Email Address</Text>
                <TextInput
                  className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
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
                />
              </View>

              {/* Password */}
              <View className="mb-8">
                <Text className="text-gray-700 font-semibold mb-3">Password</Text>
                <TextInput
                  className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (authStore.error) authStore.clearError(); // Clear error when user starts typing
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                className={`w-full p-4 bg-blue-600 rounded-xl shadow-sm ${isLoading ? 'opacity-50' : ''}`}
                onPress={onSignInPress}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center py-4">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Link href="/auth/signup" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className="text-blue-600 font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Debug Link - Remove after setup */}
            <View className="flex-row justify-center items-center py-2">
              <Link href="/debug-auth" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className="text-gray-500 font-medium text-sm">Debug OAuth Issues</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 