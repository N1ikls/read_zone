export default async function (text, existingTags = []) {
  try {
    const ids = existingTags.map(tag => tag.id)
    const {tags} = await useApi(`/autocomplete/tags?text=${text}&exclude_ids=${ids.join(',')}`)

    if (tags) {
      return tags.map(tag => {
        return {
          id: tag.id,
          name: tag.name,
          value: {
            id: tag.id,
            name: tag.name,
          }
        }
      })
    }
  } catch(e) {console.error(e)}
}
