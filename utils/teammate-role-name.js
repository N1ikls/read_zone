const roleNames = {
  admin: 'Админ',
  creator: 'Создатель',
  '': 'Участник'
}

export default function(role) {
  return roleNames?.[role] || 'Читатель'
}
