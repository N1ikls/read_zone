export default function(list) {
  if (!list.length) return ''

  const numbers = list.map(number => parseInt(number))
  const first = numbers.shift()
  let last = first
  let range = [first]
  const ranges = []

  for (const item of numbers) {
    if (item == last + 1) {
      range[1] = item
    } else {
      ranges.push(range)
      range = [item]
    }

    last = item
  }

  ranges.push(range)

  return ranges.map(range => range.join('-')).join(', ')
}
