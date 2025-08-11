import { create } from 'zustand';

const useAppStore = create((set) => ({
  activeMutation: null,
  setActiveMutation: (mutation) => set({ activeMutation: mutation }),
  clearActiveMutation: () => set({ activeMutation: null }),
}));

export default useAppStore; 