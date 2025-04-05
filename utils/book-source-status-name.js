const statusNames = {
  discarded: 'Заброшен',
  done: 'Завершён',
  frozen: 'Заморожен',
  progress: 'В процессе',
}

export default function(status) {
  return statusNames?.[status]
}