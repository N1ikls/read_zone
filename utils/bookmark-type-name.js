const names = {
  process: 'Читаю',
  discarded: 'Брошено',
  favorite: 'Любимое',
  planned: 'Буду читать',
}

export default function(type) {
  return names?.[type]
}
