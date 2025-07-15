export const DATA = {
  labels: ['Главы', 'Донаты', 'Подписки'],
  datasets: [
    {
      backgroundColor: ['#EF9B15', '#18BDDA', '#129558'],
      data: [70, 16, 14],
      borderRadius: 0,
      borderWidth: 0,
      radius: '85%',
      offset: 0,
      cutout: '75%',
      spacing: 0,
    },
  ],
};

export const DATA_EXPENSES = {
  labels: ['Реклама'],
  datasets: [
    {
      backgroundColor: ['#E75023'],
      data: [70],
      borderRadius: 0,
      borderWidth: 0,
      radius: '85%',
      offset: 0,
      cutout: '75%',
      spacing: 0,
    },
  ],
};

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
