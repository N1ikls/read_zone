// Удалены заглушки DATA и DATA_EXPENSES - теперь используются реальные данные из API

export const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true, // Включить легенду
      position: 'left',
      align: 'start',
      labels: {
        boxWidth: 12,
        padding: 20,
        usePointStyle: true,
        color: '#050505',
        fontWeight: 300,
        pointStyle: 'circle',
      },
    },
  },
};

enum ComplaintStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  ALL = 'all',
}

export const statusLabels = {
  [ComplaintStatus.PENDING]: 'Ожидает',
  [ComplaintStatus.IN_PROGRESS]: 'В работе',
  [ComplaintStatus.RESOLVED]: 'Решена',
  [ComplaintStatus.REJECTED]: 'Отклонена',
  [ComplaintStatus.ALL]: 'Все',
} as const;

export const STATUS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'pending', label: 'Ожидает' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'resolved', label: 'Решена' },
  { value: 'rejected', label: 'Отклонена' },
];
