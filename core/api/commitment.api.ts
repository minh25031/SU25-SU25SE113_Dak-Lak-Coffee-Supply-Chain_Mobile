import api from './axiosClient';

// ========== TYPES ==========

export interface Commitment {
  id: string;
  name: string;
  code: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: CommitmentStatus;
  farmerId: string;
  farmerName: string;
  totalArea: number;
  totalQuantity: number;
  coffeeType: string;
  qualityGrade: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentListItem {
  id: string;
  name: string;
  code: string;
  status: CommitmentStatus;
  startDate: string;
  endDate: string;
  totalArea: number;
  totalQuantity: number;
  coffeeType: string;
  qualityGrade: string;
  price: number;
}

export enum CommitmentStatus {
  Active = 'Active',
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Expired = 'Expired'
}

export const CommitmentStatusLabels: Record<CommitmentStatus, string> = {
  [CommitmentStatus.Active]: 'Đang hoạt động',
  [CommitmentStatus.Pending]: 'Chờ xử lý',
  [CommitmentStatus.Completed]: 'Hoàn thành',
  [CommitmentStatus.Cancelled]: 'Đã hủy',
  [CommitmentStatus.Expired]: 'Hết hạn'
};

// ========== API FUNCTIONS ==========

/**
 * Lấy danh sách tất cả commitment của farmer hiện tại
 */
export async function getFarmerCommitments(): Promise<CommitmentListItem[]> {
  try {
    const response = await api.get('/FarmingCommitment/Farmer');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching farmer commitments:', error);
    throw error;
  }
}

/**
 * Lấy commitment theo ID
 */
export async function getCommitmentById(id: string): Promise<Commitment | null> {
  try {
    const response = await api.get(`/FarmingCommitment/${id}`);
    return response.data || null;
  } catch (error) {
    console.error('❌ Error fetching commitment by ID:', error);
    throw error;
  }
}

/**
 * Lấy commitment đang hoạt động của farmer
 */
export async function getActiveFarmerCommitments(): Promise<CommitmentListItem[]> {
  try {
    const response = await api.get('/FarmingCommitment/Farmer/Active');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching active farmer commitments:', error);
    throw error;
  }
}

/**
 * Lấy commitment theo trạng thái
 */
export async function getCommitmentsByStatus(status: CommitmentStatus): Promise<CommitmentListItem[]> {
  try {
    const response = await api.get(`/FarmingCommitment/Farmer/Status/${status}`);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching commitments by status:', error);
    throw error;
  }
}

/**
 * Tìm kiếm commitment theo tên hoặc mã
 */
export async function searchCommitments(query: string): Promise<CommitmentListItem[]> {
  try {
    const response = await api.get(`/FarmingCommitment/Farmer/Search?q=${encodeURIComponent(query)}`);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error searching commitments:', error);
    throw error;
  }
}

/**
 * Lấy commitment theo loại cà phê
 */
export async function getCommitmentsByCoffeeType(coffeeType: string): Promise<CommitmentListItem[]> {
  try {
    const response = await api.get(`/FarmingCommitment/Farmer/CoffeeType/${encodeURIComponent(coffeeType)}`);
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching commitments by coffee type:', error);
    throw error;
  }
}

/**
 * Lấy thống kê commitment của farmer
 */
export async function getFarmerCommitmentStats(): Promise<{
  total: number;
  active: number;
  pending: number;
  completed: number;
  cancelled: number;
  expired: number;
  totalArea: number;
  totalQuantity: number;
}> {
  try {
    const response = await api.get('/FarmingCommitment/Farmer/Stats');
    return response.data || {
      total: 0,
      active: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      expired: 0,
      totalArea: 0,
      totalQuantity: 0
    };
  } catch (error) {
    console.error('❌ Error fetching commitment stats:', error);
    throw error;
  }
}
