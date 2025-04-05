export default async function(text, existingFandoms = []) {
    try {
      const ids = existingFandoms.map(fandom => fandom.id)
      const {fandoms} = await useApi(`/autocomplete/fandoms?text=${text}&exclude_ids=${ids.join(',')}`)

      if (fandoms) {
        return fandoms.map(fandom => {
          return {
            id: fandom.id,
            name: fandom.name,
            value: {
              id: fandom.id,
              name: fandom.name,
            }
          }
        })
      }
    } catch(e) {console.error(e)}
  }
