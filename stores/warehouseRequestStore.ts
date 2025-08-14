import { WarehouseInboundRequestListItem } from '@/core/api/warehouseRequest.api';
import { create } from 'zustand';

interface WarehouseInboundRequestState {
  requests: WarehouseInboundRequestListItem[];
  loading: boolean;
  setRequests: (requests: WarehouseInboundRequestListItem[]) => void;
  addRequest: (request: WarehouseInboundRequestListItem) => void;
  updateRequest: (requestId: string, updates: Partial<WarehouseInboundRequestListItem>) => void;
  removeRequest: (requestId: string) => void;
  setLoading: (loading: boolean) => void;
  clearRequests: () => void;
}

export const useWarehouseInboundRequestStore = create<WarehouseInboundRequestState>((set) => ({
  requests: [],
  loading: false,
  
  setRequests: (requests) => set({ requests }),
  
  addRequest: (request) => set((state) => ({
    requests: [request, ...state.requests],
  })),
  
  updateRequest: (requestId, updates) => set((state) => ({
    requests: state.requests.map((request) =>
      request.id === requestId ? { ...request, ...updates } : request
    ),
  })),
  
  removeRequest: (requestId) => set((state) => ({
    requests: state.requests.filter((request) => request.id !== requestId),
  })),
  
  setLoading: (loading) => set({ loading }),
  
  clearRequests: () => set({ requests: [] }),
}));
