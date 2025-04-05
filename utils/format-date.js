export default function(date) {
  if (!date) return
  if (typeof(date) === 'string') date = new Date(date)

  let day = date.getDate()
  if (day < 10) day = `0${day}`

  let month = date.getMonth()
  if (month < 10) month = `0${month}`

  return `${day}.${month}.${date.getFullYear()}`
}
