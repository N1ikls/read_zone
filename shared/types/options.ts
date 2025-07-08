export interface ButtonsOptionsFabric<T> {
  key: T;
  icon?: string;
  size?: string;
  text?: string;
  class?: string;
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'neutral'
    | undefined;
  disabled?: boolean;
}
