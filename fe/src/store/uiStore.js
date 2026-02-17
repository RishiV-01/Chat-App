import { create } from 'zustand';

const useUiStore = create((set) => ({
  isNewMessageModalOpen: false,
  filePreview: { isOpen: false, url: null, type: null, name: null },

  openNewMessageModal: () => set({ isNewMessageModalOpen: true }),
  closeNewMessageModal: () => set({ isNewMessageModalOpen: false }),

  openFilePreview: (url, type, name) =>
    set({ filePreview: { isOpen: true, url, type, name } }),
  closeFilePreview: () =>
    set({ filePreview: { isOpen: false, url: null, type: null, name: null } }),
}));

export default useUiStore;
