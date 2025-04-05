const statusNames = {
  discarded: 'Заброшен',
  done: 'Завершён',
  frozen: 'Заморожен',
  progress: 'Переводится',
}

export default function(status) {
  return statusNames?.[status]
}
