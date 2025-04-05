export default defineEventHandler(async event => {
  const timeout = getRouterParam(event, 'timeout')

  await new Promise(resolve => setTimeout(resolve, timeout))

  return {timeout}
})
