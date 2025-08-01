import { useAuth } from '@/entities/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
  const { setUser } = useAuth();

  const { data } = await useAsyncData('user-plugin', async () => {
    const event = useRequestEvent();
    const currentUser = await event?.context.context.user();

    return currentUser || null;
  });

  if (!data.value) return;

  setUser(data.value);
});
