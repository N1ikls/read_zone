export default defineApiHandler(async (event: any) => {
  const user = await event.context.context.user();

  if (!user) {
    return null;
  }

  // Возвращаем информацию о пользователе
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
});
