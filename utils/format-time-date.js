export default function(date) {
  if (!date) return
  if (typeof(date) === 'string') date = new Date(date)

  let hour = date.getHours()
  if (hour < 10) hour = `0${hour}`

  let minute = date.getMinutes()
  if (minute < 10) minute = `0${minute}`

  let second = date.getSeconds()
  if (second < 10) second = `0${second}`

  let day = date.getDate()
  if (day < 10) day = `0${day}`

  let month = date.getMonth()
  if (month < 10) month = `0${month}`

  return `${hour}:${minute}:${second} ${day}.${month}.${date.getFullYear()}`
}
