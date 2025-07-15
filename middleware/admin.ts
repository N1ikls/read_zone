export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) {
    const event = useRequestEvent();

    const user = await event?.context.context.user?.();

    if (!user) {
      return navigateTo('/');
    }

    if (user.role !== 'admin') {
      return navigateTo('/');
    }
  }
});
