export default defineApiHandler(async (event) => {
  delete event.context.session.user;

  return { ok: true };
});
