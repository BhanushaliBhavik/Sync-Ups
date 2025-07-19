import AsyncStorage from '@react-native-async-storage/async-storage';

interface NavigationState {
  currentScreen: string;
  isOnPreferencesScreen: boolean;
  userId?: string;
  hasCompletedPreferences: boolean;
  preferencesSkipped: boolean; // New field to track if preferences were skipped
  timestamp: number;
}

class NavigationService {
  private readonly STORAGE_KEY = 'navigation_state';
  private readonly STATE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  async setPreferencesScreenActive(userId: string): Promise<void> {
    try {
      console.log('📍 NavigationService: Setting preferences screen active for user:', userId);
      
      const state: NavigationState = {
        currentScreen: 'property-preferences',
        isOnPreferencesScreen: true,
        userId,
        hasCompletedPreferences: false,
        preferencesSkipped: false,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      console.log('✅ NavigationService: Preferences screen state saved');
    } catch (error) {
      console.error('❌ NavigationService: Error saving navigation state:', error);
    }
  }

  async setPreferencesCompleted(userId: string, skipped: boolean = false): Promise<void> {
    try {
      console.log('🎯 NavigationService: Setting preferences completed for user:', userId, 'skipped:', skipped);
      
      const state: NavigationState = {
        currentScreen: 'search',
        isOnPreferencesScreen: false,
        userId,
        hasCompletedPreferences: true,
        preferencesSkipped: skipped,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      console.log('✅ NavigationService: Preferences completion state saved');
    } catch (error) {
      console.error('❌ NavigationService: Error updating navigation state:', error);
    }
  }

  async shouldRedirectToPreferences(userId?: string): Promise<boolean> {
    try {
      if (!userId) {
        console.log('🔍 NavigationService: No user ID provided');
        return false;
      }

      const stateStr = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!stateStr) {
        console.log('🔍 NavigationService: No navigation state found');
        return false;
      }

      const state: NavigationState = JSON.parse(stateStr);
      console.log('🔍 NavigationService: Current state:', state);
      
      // Check if state is expired
      if (Date.now() - state.timestamp > this.STATE_EXPIRY) {
        console.log('⏰ NavigationService: State expired, clearing');
        await this.clearNavigationState();
        return false;
      }

      // Don't redirect if user previously skipped preferences
      if (state.preferencesSkipped) {
        console.log('⏭️ NavigationService: User previously skipped preferences');
        return false;
      }

      // Check if user was on preferences screen and hasn't completed them
      const shouldRedirect = (
        state.userId === userId && 
        state.isOnPreferencesScreen && 
        !state.hasCompletedPreferences
      );

      console.log('🎯 NavigationService: Should redirect to preferences:', shouldRedirect);
      return shouldRedirect;
    } catch (error) {
      console.error('❌ NavigationService: Error checking navigation state:', error);
      return false;
    }
  }

  async clearNavigationState(): Promise<void> {
    try {
      console.log('🧹 NavigationService: Clearing navigation state');
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('❌ NavigationService: Error clearing navigation state:', error);
    }
  }

  async getNavigationState(): Promise<NavigationState | null> {
    try {
      const stateStr = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!stateStr) return null;

      const state: NavigationState = JSON.parse(stateStr);
      
      // Check if state is expired
      if (Date.now() - state.timestamp > this.STATE_EXPIRY) {
        await this.clearNavigationState();
        return null;
      }

      return state;
    } catch (error) {
      console.error('❌ NavigationService: Error getting navigation state:', error);
      return null;
    }
  }

  // Debug method to see current state
  async debugNavigationState(): Promise<void> {
    try {
      const state = await this.getNavigationState();
      console.log('🔍 NavigationService Debug State:', JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('❌ NavigationService: Error debugging state:', error);
    }
  }
}

export const navigationService = new NavigationService(); 