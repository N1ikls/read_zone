export default defineNuxtRouteMiddleware(async (to, from) => {
  // if (import.meta.client) return
  // const event = useRequestEvent()
  // const user = await event.context.context.user()
  // if (!user) return navigateTo('/login')

  return to;
});
