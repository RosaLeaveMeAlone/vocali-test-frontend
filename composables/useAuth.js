import { navigateTo } from '#app';

export const useAuth = () => {
  // Use useState with client-side initialization
  const user = useState('user', () => {
    if (process.client) {
      return JSON.parse(localStorage.getItem('user') || 'null');
    }
    return null;
  });
  const token = useState('token', () => {
    if (process.client) {
      return localStorage.getItem('token') || null;
    }
    return null;
  });

  // Sync with localStorage only on client
  const syncWithLocalStorage = () => {
    if (process.client) {
      token.value = localStorage.getItem('token') || null;
      user.value = JSON.parse(localStorage.getItem('user') || 'null');
    }
  };

  // Call sync on client mount
  if (process.client) {
    syncWithLocalStorage();
  }

  const login = async (email, password) => {
    try {
      const { $api } = useNuxtApp();
      console.log('Logging in with:', { email, password });
      const response = await $api('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Login response:', response);
      if (process.client) {
        user.value = response.userData;
        token.value = response.token;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.userData));
      }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (email, password, confirmPassword) => {
    try {
      const { $api } = useNuxtApp();
      const response = await $api('/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, confirmPassword }),
        headers: { 'Content-Type': 'application/json' },
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    if (process.client) {
      user.value = null;
      token.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    await navigateTo('/login');
  };

  return { user, token, login, register, logout };
};