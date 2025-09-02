import api from './axiosClient';

// ========== TYPES ==========

export interface CropStage {
  stageId: number;
  stageName: string;
  stageCode: string;
  description?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ========== API FUNCTIONS ==========

/**
 * Lấy tất cả crop stages
 */
export async function getCropStages(): Promise<CropStage[]> {
  try {
    const response = await api.get<CropStage[]>('/CropStages');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching crop stages:', error);
    throw error;
  }
}

/**
 * Lấy crop stage theo ID
 */
export async function getCropStageById(id: number): Promise<CropStage | null> {
  try {
    const response = await api.get<CropStage>(`/CropStages/${id}`);
    return response.data || null;
  } catch (error) {
    console.error('❌ Error fetching crop stage by ID:', error);
    throw error;
  }
}

/**
 * Lấy crop stage theo mã
 */
export async function getCropStageByCode(code: string): Promise<CropStage | null> {
  try {
    const response = await api.get<CropStage[]>(`/CropStages/code/${code}`);
    return response.data?.[0] || null;
  } catch (error) {
    console.error('❌ Error fetching crop stage by code:', error);
    throw error;
  }
}

/**
 * Lấy crop stages đang hoạt động
 */
export async function getActiveCropStages(): Promise<CropStage[]> {
  try {
    const response = await api.get<CropStage[]>('/CropStages/active');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching active crop stages:', error);
    throw error;
  }
}

/**
 * Lấy crop stages theo thứ tự
 */
export async function getCropStagesByOrder(): Promise<CropStage[]> {
  try {
    const response = await api.get<CropStage[]>('/CropStages/ordered');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching ordered crop stages:', error);
    throw error;
  }
}
