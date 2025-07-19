import { makeRedirectUri } from 'expo-auth-session';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      redirectUrl: makeRedirectUri({
        scheme: 'realestate',
        path: '/auth/callback',
      }),
      nativeRedirectUrl: makeRedirectUri({
        native: 'realestate://auth/callback'
      }),
    };
    setDebugInfo(info);
  }, []);

  const testGoogleOAuth = async () => {
    try {
      console.log('Testing Google OAuth...');
      
      const redirectUrl = makeRedirectUri({
        scheme: 'realestate',
        path: '/auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      console.log('OAuth test result:', { data, error });
      
      Alert.alert('OAuth Test Result', 
        JSON.stringify({ 
          hasUrl: !!data?.url, 
          error: error?.message 
        }, null, 2)
      );
    } catch (error) {
      console.error('OAuth test error:', error);
      Alert.alert('OAuth Test Error', String(error));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Auth Debug Information
        </Text>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Environment Configuration:
          </Text>
          
          <View className="space-y-2">
            <Text className="text-gray-700">
              <Text className="font-medium">Supabase URL:</Text> {debugInfo.supabaseUrl || 'Missing'}
            </Text>
            <Text className="text-gray-700">
              <Text className="font-medium">Supabase Key:</Text> {debugInfo.supabaseKey}
            </Text>
            <Text className="text-gray-700">
              <Text className="font-medium">Redirect URL:</Text> {debugInfo.redirectUrl}
            </Text>
            <Text className="text-gray-700">
              <Text className="font-medium">Native Redirect:</Text> {debugInfo.nativeRedirectUrl}
            </Text>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Common Issues & Solutions:
          </Text>
          
          <View className="space-y-4">
            <View className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text className="font-medium text-red-900 mb-2">400 Error in Browser?</Text>
              <Text className="text-red-800 text-sm">
                This usually means Google OAuth is not configured in your Supabase dashboard.
              </Text>
            </View>

            <View className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Text className="font-medium text-yellow-900 mb-2">Setup Required:</Text>
              <Text className="text-yellow-800 text-sm">
                1. Go to Supabase Dashboard → Authentication → Providers{'\n'}
                2. Enable Google provider{'\n'}
                3. Add Client ID and Client Secret from Google Cloud Console{'\n'}
                4. Add redirect URL: {debugInfo.redirectUrl}
              </Text>
            </View>

            <View className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Text className="font-medium text-blue-900 mb-2">Environment Variables:</Text>
              <Text className="text-blue-800 text-sm">
                Create .env file with:{'\n'}
                EXPO_PUBLIC_SUPABASE_URL=your_url{'\n'}
                EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="w-full p-4 bg-blue-600 rounded-xl shadow-sm mb-4"
          onPress={testGoogleOAuth}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-lg">
            Test Google OAuth Configuration
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-600 text-sm text-center">
          Check the console logs for detailed debugging information
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
} 