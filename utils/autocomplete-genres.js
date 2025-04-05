export default async function genresAutocomplete(text, existingGenres = []) {
  try {
    const ids = existingGenres.map(genre => genre.id)
    const {genres} = await useApi(`/autocomplete/genres?text=${text}&exclude_ids=${ids.join(',')}`)

    if (genres) {
      return genres.map(genre => {
        return {
          id: genre.id,
          name: genre.name,
          value: {
            id: genre.id,
            name: genre.name,
          }
        }
      })
    }
  } catch(e) {console.error(e)}
}
