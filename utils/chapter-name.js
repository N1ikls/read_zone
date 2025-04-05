export default function(chapter) {
  return `Глава ${chapter.number}. ${chapter.name || 'Без названия'}`
}