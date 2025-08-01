export const useUser = async () => {
  const { data } = await useAsyncData('user', async () => {
    const event = useRequestEvent();
    const currentUser = await event?.context.context.user();

    return currentUser || null;
  });

  return { user: data };
};
