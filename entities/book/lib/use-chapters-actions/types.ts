import type { Reactive } from 'vue';

export interface UseChaptersActions {
  refresh: () => Promise<void>;
}
