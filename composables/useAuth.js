import { navigateTo } from '#app';

export const useAuth = () => {
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

  const syncWithLocalStorage = () => {
    if (process.client) {
      token.value = localStorage.getItem('token') || null;
      user.value = JSON.parse(localStorage.getItem('user') || 'null');
    }
  };

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
        user.value = response.data.userData;
        token.value = response.data.token;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.userData));
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