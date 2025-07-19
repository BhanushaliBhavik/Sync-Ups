import { supabase } from './supabase';

/**
 * Test utility to verify Supabase connection and table setup
 * Call this function to debug connection issues
 */
export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Connection...');

  try {
    // Test 1: Check if Supabase client is initialized
    if (!supabase) {
      throw new Error('❌ Supabase client not initialized');
    }
    console.log('✅ Supabase client initialized');

    // Test 2: Check authentication status
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('⚠️ No user authenticated:', userError.message);
      return {
        success: false,
        error: 'No user authenticated. Please sign in first.',
        details: userError
      };
    }
    
    if (!user) {
      console.log('⚠️ No user found');
      return {
        success: false,
        error: 'No authenticated user found. Please sign in first.',
      };
    }
    
    console.log('✅ User authenticated:', user.id);

    // Test 3: Check if user_preferences table exists and is accessible
    const { data, error: tableError } = await supabase
      .from('user_preferences')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.code === '42P01') {
        console.log('❌ user_preferences table does not exist');
        return {
          success: false,
          error: 'Database table missing. Please run the SQL schema from supabase-schema.sql',
          details: tableError
        };
      }
      throw tableError;
    }
    
    console.log('✅ user_preferences table exists and is accessible');

    // Test 4: Test a simple read operation for current user
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (prefsError && prefsError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" which is normal for new users
      throw prefsError;
    }

    if (userPrefs) {
      console.log('✅ User has existing preferences:', userPrefs);
    } else {
      console.log('ℹ️ User has no existing preferences (normal for new users)');
    }

    console.log('🎉 Supabase connection test PASSED');
    return {
      success: true,
      user: user,
      hasExistingPrefs: !!userPrefs,
      message: 'Supabase is properly configured and ready to use!'
    };

  } catch (error: any) {
    console.error('❌ Supabase connection test FAILED:', error.message);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

/**
 * Quick test to insert and read a test preference
 * This verifies that RLS policies are working correctly
 */
export const testPreferenceOperations = async () => {
  console.log('🧪 Testing preference operations...');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No user authenticated');
    }

    // Test insert
    const testData = {
      user_id: user.id,
      preferred_location: 'Test Location',
      location_type: ['Test'],
      home_types: ['Test House'],
      min_price: 100000,
      max_price: 500000,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['Test Amenity'],
    };

    const { data: insertData, error: insertError } = await supabase
      .from('user_preferences')
      .upsert(testData)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ Test preference inserted successfully');

    // Test read
    const { data: readData, error: readError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (readError) {
      throw readError;
    }

    console.log('✅ Test preference read successfully');
    console.log('🎉 Preference operations test PASSED');

    return {
      success: true,
      data: readData,
      message: 'All preference operations working correctly!'
    };

  } catch (error: any) {
    console.error('❌ Preference operations test FAILED:', error.message);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}; 