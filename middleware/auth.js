export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const { token } = useAuth();
    
    const publicPages = ['/login', '/register'];
    const isPublicPage = publicPages.includes(to.path);
    
    if (to.path === '/') {
      if (token.value) {
        window.location.href = '/dashboard';
        return;
      } else {
        window.location.href = '/login';
        return;
      }
    }
    
    if (token.value && isPublicPage) {
      window.location.href = '/dashboard';
      return;
    }
    
    if (!token.value && !isPublicPage) {
      window.location.href = '/login';
      return;
    }
  }
});
