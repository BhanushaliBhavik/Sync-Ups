import { Link } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-white">
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo/Brand Section */}
        <View className="mb-16 items-center">
          <View className="w-20 h-20 bg-blue-600 rounded-2xl mb-6 items-center justify-center shadow-lg">
            <Text className="text-white text-3xl font-bold">RE</Text>
          </View>
          <Text className="text-4xl font-bold text-gray-900 text-center mb-3">
            RealEstate
          </Text>
          <Text className="text-lg text-gray-600 text-center max-w-xs">
            Find your perfect home with ease
          </Text>
        </View>

        {/* Auth Buttons */}
        <View className="w-full max-w-sm">
          <Link href="/auth/signin" asChild>
            <TouchableOpacity 
              className="w-full p-4 bg-blue-600 rounded-xl mb-4 shadow-sm"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-bold text-lg">
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/auth/signup" asChild>
            <TouchableOpacity 
              className="w-full p-4 border-2 border-blue-600 rounded-xl shadow-sm bg-white"
              activeOpacity={0.8}
            >
              <Text className="text-blue-600 text-center font-bold text-lg">
                Create Account
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Features */}
        <View className="mt-16 w-full max-w-sm">
          <Text className="text-center text-gray-500 mb-6">
            Why choose RealEstate?
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
              <Text className="text-gray-600">Advanced property search</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
              <Text className="text-gray-600">Real-time market data</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
              <Text className="text-gray-600">Connect with top agents</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
              <Text className="text-gray-600">Virtual property tours</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}