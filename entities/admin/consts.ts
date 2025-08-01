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
