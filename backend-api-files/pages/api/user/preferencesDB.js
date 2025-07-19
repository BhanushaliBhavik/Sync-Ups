// Shared preferences database - replace with your actual database implementation
class PreferencesDB {
  constructor() {
    this.store = new Map();
  }

  // Get preferences for a user
  get(userId) {
    return this.store.get(userId) || null;
  }

  // Save preferences for a user
  set(userId, preferences) {
    this.store.set(userId, preferences);
    return preferences;
  }

  // Check if preferences exist for a user
  exists(userId) {
    return this.store.has(userId);
  }

  // Delete preferences for a user
  delete(userId) {
    return this.store.delete(userId);
  }

  // Get all user IDs with preferences
  getUserIds() {
    return Array.from(this.store.keys());
  }

  // Get statistics
  getStats() {
    return {
      totalUsers: this.store.size,
      userIds: this.getUserIds()
    };
  }
}

// Export singleton instance
export const preferencesDB = new PreferencesDB();

// Export class for testing
export { PreferencesDB };
