export function getRandomFileName({length = 32, ext = ''}) {
  let result = ''

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length

  while (result.length < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  if (ext) result += ext

  return result
}
