import {
  format,
  formatDistanceToNow,
  parseISO,
  isToday,
  isThisYear,
} from 'date-fns';
import { ru } from 'date-fns/locale';

export const useFormatDate = () => {
  const smartFormat = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const now = new Date();

      if (isToday(date)) {
        // Сегодня - только время
        return format(date, 'HH:mm');
      } else if (isThisYear(date)) {
        // В этом году - дата и время
        return format(date, 'dd MMM в HH:mm', { locale: ru });
      } else {
        // В другом году - полная дата
        return format(date, 'dd.MM.yyyy');
      }
    } catch (error) {
      return dateString;
    }
  };

  const formatForList = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy в HH:mm', { locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  return {
    smartFormat,
    formatForList,
  };
};
