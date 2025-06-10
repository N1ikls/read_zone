import { useAuth } from '@/entities/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
  const { setUser } = useAuth();

  const { data } = await useAsyncData(async () => {
    const event = useRequestEvent();
    const currentUser = await event?.context.context.user();

    return currentUser;
  });

  if (!data.value) return;

  setUser(data.value);
});
