export default defineNuxtRouteMiddleware((to, from) => {
  const { token } = useAuth();

  if (process.client) {
    const publicPages = ['/login', '/register'];
    const isPublicPage = publicPages.includes(to.path);

    if (!token.value && !isPublicPage) {
      return navigateTo('/login');
    }
    if (token.value && isPublicPage) {
      return navigateTo('/dashboard');
    }
  }
});
