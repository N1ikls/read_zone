import { isEmpty } from 'es-toolkit/compat';
import { useAuth } from '~/entities/auth';

export const useAuthToast = () => {
  const toast = useToast();
  const { user } = storeToRefs(useAuth());

  const isAuth = () => {
    if (!isEmpty(user.value)) return true;

    toast.add({ title: 'Пожалуйста, авторизуйтесь', color: 'error' });

    return false;
  };

  return { isAuth };
};
