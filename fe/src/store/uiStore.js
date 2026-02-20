import { create } from 'zustand';

const useUiStore = create((set) => ({
  isNewMessageModalOpen: false,
  filePreview: { isOpen: false, url: null, type: null, name: null },
  activeView: 'messages', // 'messages' | 'opportunities'
  opportunityMessageModal: { isOpen: false, opportunityId: null, opportunityName: null },

  openNewMessageModal: () => set({ isNewMessageModalOpen: true }),
  closeNewMessageModal: () => set({ isNewMessageModalOpen: false }),

  openFilePreview: (url, type, name) =>
    set({ filePreview: { isOpen: true, url, type, name } }),
  closeFilePreview: () =>
    set({ filePreview: { isOpen: false, url: null, type: null, name: null } }),

  setActiveView: (view) => set({ activeView: view }),

  openOpportunityMessageModal: (opportunityId, opportunityName) =>
    set({ opportunityMessageModal: { isOpen: true, opportunityId, opportunityName } }),
  closeOpportunityMessageModal: () =>
    set({ opportunityMessageModal: { isOpen: false, opportunityId: null, opportunityName: null } }),
}));

export default useUiStore;
