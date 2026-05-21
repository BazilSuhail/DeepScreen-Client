import { create } from 'zustand';
import { api } from '@/utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth on app load
  initializeAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('access_token');
          set({ user: null, loading: false, error: null });
          window.location.href = '/auth/login';
          return;
        }
      } catch {}

      try {
        const profileData = await api.get('/accounts/profiles/me/');
        set({
          user: {
            ...profileData.user,
            profile: {
              profile_id: profileData.profile_id,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              avatar_url: profileData.avatar_url,
              phone: profileData.phone,
              bio: profileData.bio,
            },
          },
          loading: false,
          error: null,
        });
      } catch {
        localStorage.removeItem('access_token');
        set({ user: null, loading: false, error: null });
        window.location.href = '/auth/login';
      }
    } else {
      set({ user: null, loading: false, error: null });
    }
  },

  // Request verification code for registration
  requestCode: async (email) => {
    try {
      const response = await api.post('/accounts/auth/request_code/', { email });
      set({ error: null });
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Request verification code for staff
  requestStaffCode: async (email) => {
    try {
      const response = await api.post('/accounts/auth/staff/request_code/', { email });
      set({ error: null });
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const data = await api.post('/accounts/auth/register/', userData);
      localStorage.setItem('access_token', data.access_token);
      set({ user: data.user, error: null });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Register staff user
  registerStaff: async (userData) => {
    try {
      const data = await api.post('/accounts/auth/staff/register/', userData);
      localStorage.setItem('access_token', data.access_token);
      set({ user: data.user, error: null });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const data = await api.post('/accounts/auth/login/', credentials);
      localStorage.setItem('access_token', data.access_token);
      set({ user: data.user, error: null });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Login with Google: exchange the popup's ID token for our own JWT
  loginWithGoogle: async (credential) => {
    try {
      const data = await api.post('/accounts/google/verify/', { credential });
      localStorage.setItem('access_token', data.access_token);
      set({ user: data.user, error: null });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (code, email) => {
    try {
      const data = await api.post('/accounts/auth/verify/', { code, email });
      set({ error: null });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, error: null });
  },

  // Set user (for manual updates)
  setUser: (user) => set({ user }),

  // Clear error
  clearError: () => set({ error: null }),
}));

// Export a hook for backward compatibility with old context code
export const useAuth = () => {
  const { user, loading, requestCode, requestStaffCode, register, registerStaff, login, loginWithGoogle, logout, verifyEmail, error } = useAuthStore();
  return {
    user,
    loading,
    requestCode,
    requestStaffCode,
    register,
    registerStaff,
    login,
    loginWithGoogle,
    logout,
    verifyEmail,
    error,
  };
};
