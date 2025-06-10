export const useUser = async () => {
  const { data } = await useAsyncData(async () => {
    const event = useRequestEvent();
    const currentUser = await event?.context.context.user();

    return currentUser;
  });

  return { user: data };
};
