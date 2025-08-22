import api from './axiosClient';

// ========== TYPES ==========
export interface CropSeasonDetail {
  detailId: string;
  cropSeasonId: string;
  coffeeTypeId: string;
  typeName: string;
  areaAllocated: number;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  actualYield: number | null;
  plannedQuality: string;
  qualityGrade: string;
  status: string;
  farmerId: string;
  farmerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CropSeasonDetailCreatePayload {
  cropSeasonId: string;
  coffeeTypeId: string;
  areaAllocated: number;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  plannedQuality: string;
}

export interface CropSeasonDetailUpdatePayload {
  detailId: string;
  areaAllocated?: number;
  expectedHarvestStart?: string;
  expectedHarvestEnd?: string;
  estimatedYield?: number;
  actualYield?: number;
  plannedQuality?: string;
  qualityGrade?: string;
  status?: string;
}

export interface CropSeasonDetailListItem {
  detailId: string;
  coffeeTypeId: string;
  typeName: string;
  areaAllocated: number;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  actualYield: number | null;
  plannedQuality: string;
  qualityGrade: string;
  status: string;
}

export interface ServiceResult<T = any> {
  code: number | string;
  message: string;
  data: T | null;
}

// ========== API FUNCTIONS ==========

// Lấy danh sách chi tiết mùa vụ
export async function getCropSeasonDetails(
  cropSeasonId: string
): Promise<ServiceResult<CropSeasonDetailListItem[]>> {
  try {
    const res = await api.get(`/CropSeasonDetails/season/${cropSeasonId}`);
    return { code: 200, message: "Thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể tải chi tiết mùa vụ", data: null };
  }
}

// Lấy chi tiết theo ID
export async function getCropSeasonDetailById(
  detailId: string
): Promise<ServiceResult<CropSeasonDetail>> {
  try {
    const res = await api.get(`/CropSeasonDetails/${detailId}`);
    return { code: 200, message: "Thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể tải chi tiết mùa vụ", data: null };
  }
}

// Tạo chi tiết mùa vụ mới
export async function createCropSeasonDetail(
  payload: CropSeasonDetailCreatePayload
): Promise<ServiceResult<CropSeasonDetail>> {
  try {
    const res = await api.post('/CropSeasonDetails', payload);
    return { code: 200, message: "Tạo chi tiết mùa vụ thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể tạo chi tiết mùa vụ", data: null };
  }
}

// Cập nhật chi tiết mùa vụ
export async function updateCropSeasonDetail(
  payload: CropSeasonDetailUpdatePayload
): Promise<ServiceResult<CropSeasonDetail>> {
  try {
    const res = await api.put(`/CropSeasonDetails/${payload.detailId}`, payload);
    return { code: 200, message: "Cập nhật chi tiết mùa vụ thành công", data: res.data };
  } catch (err) {
    return { code: 400, message: "Không thể cập nhật chi tiết mùa vụ", data: null };
  }
}

// Xóa chi tiết mùa vụ
export async function deleteCropSeasonDetail(
  detailId: string
): Promise<ServiceResult<boolean>> {
  try {
    const res = await api.delete(`/CropSeasonDetails/${detailId}`);
    return { code: 200, message: "Xóa chi tiết mùa vụ thành công", data: true };
  } catch (err) {
    return { code: 400, message: "Không thể xóa chi tiết mùa vụ", data: null };
  }
}
