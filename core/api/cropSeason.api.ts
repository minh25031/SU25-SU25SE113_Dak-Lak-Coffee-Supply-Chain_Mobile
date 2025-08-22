import api from './axiosClient';

// ========== TYPES ==========
export interface CropSeasonDetail {
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
  farmerId: string;
  farmerName: string;
}

export interface CropSeason {
  cropSeasonId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  area: number;
  note: string;
  status: string;
  farmerId: string;
  farmerName: string;
  commitmentId: string;
  commitmentName: string;
  registrationId: string;
  registrationCode: string;
  details: CropSeasonDetail[];
}

export interface CropSeasonListItem {
  cropSeasonId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  area: number;
  farmerId: string;
  farmerName: string;
  status: string;
}

export interface CropSeasonUpdatePayload {
  cropSeasonId: string;
  commitmentId: string;
  seasonName: string;
  area?: number | null;
  startDate: string;
  endDate: string;
  note?: string | null;
  status: number;
}

export interface ServiceResult<T = any> {
  code: number | string;
  message: string;
  data: T | null;
}

// ========== API FUNCTIONS ==========

// Lấy danh sách mùa vụ (cho Admin/Manager)
export async function getAllCropSeasons(): Promise<ServiceResult<CropSeasonListItem[]>> {
  try {
    console.log('🔍 Calling API: /CropSeasons');
    const res = await api.get("/CropSeasons");
    console.log('📡 Raw API Response:', res);
    console.log('📡 Response status:', res.status);
    console.log('📡 Response data:', res.data);
    
    // Kiểm tra cấu trúc response
    if (res.data && res.data.data) {
      // Nếu response có cấu trúc { data: [...], message: "...", status: ... }
      return { code: 200, message: "Thành công", data: res.data.data };
    } else if (res.data && Array.isArray(res.data)) {
      // Nếu response trực tiếp là array
      return { code: 200, message: "Thành công", data: res.data };
    } else {
      console.log('⚠️ Unexpected response structure:', res.data);
      return { code: 200, message: "Thành công", data: [] };
    }
  } catch (err) {
    console.error("getAllCropSeasons:", err);
    return { code: 400, message: "Không thể tải danh sách mùa vụ", data: null };
  }
}

// Lấy danh sách mùa vụ của user hiện tại (Farmer)
export async function getCropSeasonsForCurrentUser(params?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<ServiceResult<CropSeasonListItem[]>> {
  try {
    // Thử endpoint chính trước
    console.log('🔍 Calling API: /CropSeasons (for current user)');
    try {
      const res = await api.get("/CropSeasons", {
        params: {
          search: params?.search,
          status: params?.status,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
          // Thêm tham số để lấy mùa vụ của farmer hiện tại
          currentUser: true,
        },
      });
      console.log('📡 Farmer API Response:', res);
      
      // Kiểm tra cấu trúc response
      if (res.data && res.data.data) {
        return { code: 200, message: "Thành công", data: res.data.data };
      } else if (res.data && Array.isArray(res.data)) {
        return { code: 200, message: "Thành công", data: res.data };
      } else {
        console.log('⚠️ Unexpected farmer response structure:', res.data);
        return { code: 200, message: "Thành công", data: [] };
      }
    } catch (firstError) {
      console.log('⚠️ First endpoint failed, trying alternative...');
      
      // Thử endpoint khác nếu endpoint đầu tiên thất bại
      const res = await api.get("/CropSeasons");
      console.log('📡 Alternative API Response:', res);
      
      if (res.data && res.data.data) {
        return { code: 200, message: "Thành công", data: res.data.data };
      } else if (res.data && Array.isArray(res.data)) {
        return { code: 200, message: "Thành công", data: res.data };
      } else {
        console.log('⚠️ Alternative endpoint also failed');
        return { code: 200, message: "Thành công", data: [] };
      }
    }
  } catch (err) {
    console.error("getCropSeasonsForCurrentUser:", err);
    return { code: 400, message: "Không thể tải dữ liệu", data: null };
  }
}

// Lấy chi tiết mùa vụ theo ID
export async function getCropSeasonById(id: string): Promise<ServiceResult<CropSeason>> {
  try {
    const res = await api.get(`/CropSeasons/${id}`);
    return { code: 200, message: "Thành công", data: res.data };
  } catch (err) {
    console.error("getCropSeasonById:", err);
    return { code: 400, message: "Không tìm thấy mùa vụ", data: null };
  }
}

// Tạo mới mùa vụ
export async function createCropSeason(data: Partial<CropSeason>): Promise<ServiceResult> {
  try {
    const res = await api.post("/CropSeasons", data);
    return res.data;
  } catch (err: any) {
    console.error("createCropSeason:", err);
    const message = err?.response?.data?.message || err.message || "Tạo mùa vụ thất bại.";
    return { code: 400, message, data: null };
  }
}

// Cập nhật mùa vụ
export async function updateCropSeason(
  id: string,
  data: Partial<CropSeasonUpdatePayload>
): Promise<ServiceResult> {
  try {
    const res = await api.put(`/CropSeasons/${id}`, data);
    return { code: 200, message: "Cập nhật thành công", data: null };
  } catch (err: any) {
    console.error("updateCropSeason:", err);
    const message = err?.response?.data?.message || err.message || "Cập nhật thất bại.";
    return { code: 400, message, data: null };
  }
}

// Xoá mềm mùa vụ
export async function deleteCropSeasonById(id: string): Promise<ServiceResult> {
  try {
    const res = await api.patch(`/CropSeasons/soft-delete/${id}`);
    return { code: 200, message: res.data || "Đã xoá mùa vụ", data: null };
  } catch (err: any) {
    const message = err?.response?.data || err?.message || "Xoá mùa vụ thất bại.";
    return { code: 400, message, data: null };
  }
}
