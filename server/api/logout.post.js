import error from '~/errors.js'

export default defineApiHandler(async event => {
  delete event.context.session.user

  setResponseStatus(event, 401)

  return {ok: true}
})
