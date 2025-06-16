import { defineStore } from 'pinia';

export interface IUser {
  avatar: string | null;
  books_count: number | null;
  chapters_in_month: number | null;
  id: string;
  email: string;
  likers_count: number | null;
  name: string | null;
  subscribers_count: number | null;
}
export const useAuth = defineStore('auth', () => {
  const user = ref<Partial<IUser> | null>(null);
  const isShow = ref<boolean>(false);

  const showModal = () => {
    isShow.value = !isShow.value;
  };

  const setUser = (value: IUser | null) => {
    user.value = value;
  };

  return { isShow, user, showModal, setUser };
});
