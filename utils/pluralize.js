export default function(number, words) {
  number %= 100

  if (number >= 11 && number <= 19) return words[2]
  else if (number == 1) return words[0]
  else if (number >= 2 && number <= 5) return words[1]
  else return words[2]
}
