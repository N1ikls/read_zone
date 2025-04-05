const typeNames = {
  chapters: 'По отдельным главам',
}

export default function(type) {
  return typeNames?.[type]
}
