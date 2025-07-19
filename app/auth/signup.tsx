import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppleSignIn, useAuthStore, useGoogleSignIn, useSignUp } from '../../hooks/useAuth';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const user = await signUpMutation.mutateAsync({ 
        email, 
        password, 
        firstName, 
        lastName 
      });
      
      console.log('Sign up successful, user:', user);
      
      Alert.alert(
        'Account Created Successfully!', 
        'Welcome to RealEstate! You can now sign in to your account.',
        [
          { 
            text: 'Sign In Now', 
            onPress: () => router.replace('/auth/signin')
          }
        ]
      );
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback
      console.log('Sign up completed with error:', error);
    }
  };

  const onGoogleSignUp = async () => {
    authStore.clearError(); // Clear any previous errors
    
    try {
      await googleSignInMutation.mutateAsync();
      // Success will be handled by auth state change
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback
      console.log('Google sign up completed with error');
    }
  };

  const onAppleSignUp = async () => {
    authStore.clearError(); // Clear any previous errors
    
    try {
      await appleSignInMutation.mutateAsync();
      // Success will be handled by auth state change
    } catch (error: any) {
      // Error is already handled by the mutation's onError callback
      console.log('Apple sign up completed with error');
    }
  };

  const isLoading = signUpMutation.isPending || googleSignInMutation.isPending || appleSignInMutation.isPending;

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
                Create Account
              </Text>
              <Text className="text-gray-600 text-lg">
                Sign up to get started
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
              {/* Google Sign Up - Disabled */}
              <TouchableOpacity
                className="w-full p-4 mb-4 border border-gray-300 rounded-xl flex-row justify-center items-center bg-gray-100 shadow-sm opacity-50"
                activeOpacity={0.8}
                disabled={true}
              >
                <Ionicons name="logo-google" size={20} color="#9CA3AF" />
                <Text className="text-gray-500 font-semibold text-base ml-3">
                  Google Sign-Up (Setup Required)
                </Text>
              </TouchableOpacity>

              {/* Apple Sign Up - Disabled */}
              <TouchableOpacity
                className="w-full p-4 border border-gray-300 rounded-xl flex-row justify-center items-center bg-gray-100 shadow-sm opacity-50"
                activeOpacity={0.8}
                disabled={true}
              >
                <Ionicons name="logo-apple" size={20} color="#9CA3AF" />
                <Text className="text-gray-500 font-semibold text-base ml-3">
                  Apple Sign-Up (Setup Required)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="flex-row items-center mb-8">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 font-medium">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Form */}
            <View className="mb-8">
              {/* First Name & Last Name */}
              <View className="flex-row mb-6 space-x-4">
                <View className="flex-1">
                  <Text className="text-gray-700 font-semibold mb-3">First Name</Text>
                  <TextInput
                    className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (authStore.error) authStore.clearError(); // Clear error when user starts typing
                    }}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 font-semibold mb-3">Last Name</Text>
                  <TextInput
                    className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (authStore.error) authStore.clearError(); // Clear error when user starts typing
                    }}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

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
                  editable={!isLoading}
                />
              </View>

              {/* Password */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-3">Password</Text>
                <TextInput
                  className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                  placeholder="Create a password"
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

              {/* Confirm Password */}
              <View className="mb-8">
                <Text className="text-gray-700 font-semibold mb-3">Confirm Password</Text>
                <TextInput
                  className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (authStore.error) authStore.clearError(); // Clear error when user starts typing
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                className={`w-full p-4 bg-blue-600 rounded-xl shadow-sm ${isLoading ? 'opacity-50' : ''}`}
                onPress={onSignUpPress}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center py-4">
              <Text className="text-gray-600">Already have an account? </Text>
              <Link href="/auth/signin" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className="text-blue-600 font-semibold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 