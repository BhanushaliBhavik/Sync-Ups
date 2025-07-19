import { makeAutoObservable } from 'mobx';
import { User } from '../services/authService';

class AuthStore {
  user: User | null = null;
  isAuthenticated = false;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: User | null) {
    this.user = user;
    this.isAuthenticated = !!user;
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
    this.error = null;
  }

  clearError() {
    this.error = null;
  }
}

export const authStore = new AuthStore(); 