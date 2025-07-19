import { makeAutoObservable } from 'mobx';
import { User } from '../services/authService';

class AuthStore {
  user: User | null = null;
  isAuthenticated = false;
  isLoading = false;
  error: string | null = null;
  unconfirmedUser: User | null = null; // User waiting for email confirmation
  isWaitingForConfirmation = false;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: User | null) {
    this.user = user;
    this.isAuthenticated = !!user;
    
    // If setting a real user, clear unconfirmed state
    if (user) {
      this.unconfirmedUser = null;
      this.isWaitingForConfirmation = false;
    }
  }

  setUnconfirmedUser(user: User | null) {
    this.unconfirmedUser = user;
    this.isWaitingForConfirmation = !!user;
    
    // Don't set as main user until confirmed
    this.user = null;
    this.isAuthenticated = false;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  signOut() {
    this.user = null;
    this.isAuthenticated = false;
    this.unconfirmedUser = null;
    this.isWaitingForConfirmation = false;
    this.error = null;
  }

  clearError() {
    this.error = null;
  }

  // Clear all user state (for fresh signup)
  clearAllUserData() {
    console.log('🧹 AuthStore: Clearing all user data');
    this.user = null;
    this.isAuthenticated = false;
    this.unconfirmedUser = null;
    this.isWaitingForConfirmation = false;
    this.error = null;
  }

  // Helper to get current user (confirmed or unconfirmed)
  getCurrentUser(): User | null {
    const currentUser = this.user || this.unconfirmedUser;
    console.log('🔍 AuthStore.getCurrentUser():', currentUser ? `${currentUser.id} (${currentUser.email})` : 'null');
    return currentUser;
  }
}

export const authStore = new AuthStore(); 