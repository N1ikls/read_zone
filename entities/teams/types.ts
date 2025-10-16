export interface FormApplyType {
  reason?: string;
  comment?: string;
}

export interface FormApplyTypeWithGuid extends FormApplyType {
  id: string;
}

interface User {
  user_id: string;
  role: 'admin' | 'member' | 'moderator';
  user_name: string;
  user_email: string;
  user_avatar: string | null;
}

interface Creator {
  id: string;
  name: string;
  email: string;
  role: 'creator';
  is_creator: true;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Stats {
  total: number;
  admins: number;
  members: number;
}

interface MembersData {
  members: User[];
  creator: Creator;
  pagination: Pagination;
  stats: Stats;
}

export interface MembersResponse {
  success: boolean;
  data: MembersData;
}

// ENUM для лучшей типобезопасности
enum UserRole {
  CREATOR = 'creator',
  ADMIN = 'admin',
  MEMBER = 'member',
  MODERATOR = 'moderator',
}

// Утилитарные типы
type TeamMember = User | Creator;

type RoleFilter = 'all' | 'admin' | 'member' | 'creator' | 'moderator';

// Функции для работы с типами
const isCreator = (member: TeamMember): member is Creator => {
  return 'is_creator' in member && member.is_creator === true;
};

const getUserRoleLabel = (role: string): string => {
  const roleLabels = {
    [UserRole.CREATOR]: 'Создатель',
    [UserRole.ADMIN]: 'Администратор',
    [UserRole.MEMBER]: 'Участник',
    [UserRole.MODERATOR]: 'Модератор',
  };

  return roleLabels[role as UserRole] || role;
};

export interface Application {
  id: string;
  user_id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
}

export interface ApplicationsData {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
}

// Полный ответ API
export interface ApplicationsResponse {
  success: boolean;
  data: ApplicationsData;
}

enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export const statusLabels = {
  [ApplicationStatus.PENDING]: 'Ожидает',
  [ApplicationStatus.APPROVED]: 'В команде',
  [ApplicationStatus.REJECTED]: 'Отклонен',
  [ApplicationStatus.CANCELLED]: 'Отменена',
} as const;
