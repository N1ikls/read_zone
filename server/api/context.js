export default defineEventHandler(async (event) => {
  return {
    context: await event.context.context.getExportData()
  }
})
