const typeNames = {
  original: 'Авторское',
  translation: 'Перевод',
  orig_fanfic: 'Авторский фанфик',
  trans_fanfic: 'Перевод фанфика',
}

export default function(type) {
  return typeNames?.[type]
}