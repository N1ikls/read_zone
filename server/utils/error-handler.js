import errors from '~/errors.js'

export const defineApiHandler = handler => defineEventHandler(async event => {
  try {
    return await handler(event)
  } catch(exception) {
    appendResponseHeader(event, 'content-type', 'application/json')

    if (exception instanceof errors.HttpError) {
      setResponseStatus(event, exception.code)
      return JSON.stringify({$errors: [{message: exception.message}]})
    } else if (exception instanceof errors.DBValidation) {
      setResponseStatus(event, 400)
      return JSON.stringify({$errors: exception.errors})
    } else {
      console.error(exception)
      setResponseStatus(500)
      return JSON.stringify({$errors: [{message: 'Ошибка сервера'}]})
    }
  }
})