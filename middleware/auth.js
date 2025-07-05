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
// export default defineNuxtRouteMiddleware((to, from) => {
//   // isAuthenticated() is an example method verifying if a user is authenticated
//   if (false === false) {
//     return navigateTo('/test')
//   }
// })