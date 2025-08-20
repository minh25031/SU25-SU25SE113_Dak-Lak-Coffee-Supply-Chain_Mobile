import { create } from 'zustand';
import { Shipment, DeliveryStatistics } from '@/core/api/delivery.api';

interface DeliveryState {
  // Shipments
  shipments: Shipment[];
  currentShipment: Shipment | null;
  loading: boolean;
  refreshing: boolean;
  
  // Statistics
  statistics: DeliveryStatistics | null;
  
  // Actions
  setShipments: (shipments: Shipment[]) => void;
  setCurrentShipment: (shipment: Shipment | null) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setStatistics: (statistics: DeliveryStatistics | null) => void;
  
  // Update shipment in list
  updateShipmentInList: (shipmentId: string, updatedShipment: Partial<Shipment>) => void;
  
  // Clear data
  clearDeliveryData: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  // Initial state
  shipments: [],
  currentShipment: null,
  loading: false,
  refreshing: false,
  statistics: null,
  
  // Actions
  setShipments: (shipments) => set({ shipments }),
  
  setCurrentShipment: (shipment) => set({ currentShipment: shipment }),
  
  setLoading: (loading) => set({ loading }),
  
  setRefreshing: (refreshing) => set({ refreshing }),
  
  setStatistics: (statistics) => set({ statistics }),
  
  updateShipmentInList: (shipmentId, updatedShipment) => {
    const { shipments } = get();
    const updatedShipments = shipments.map(shipment => 
      shipment.shipmentId === shipmentId 
        ? { ...shipment, ...updatedShipment }
        : shipment
    );
    set({ shipments: updatedShipments });
  },
  
  clearDeliveryData: () => set({
    shipments: [],
    currentShipment: null,
    statistics: null,
  }),
}));
