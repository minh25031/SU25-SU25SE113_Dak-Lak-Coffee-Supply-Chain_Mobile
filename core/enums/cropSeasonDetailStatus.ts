// ENUM CROP SEASON STATUS (MÙA VỤ)
export enum CropSeasonStatus {
  Active = 'Active',
  Paused = 'Paused',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export const CropSeasonStatusLabels: Record<CropSeasonStatus, string> = {
  [CropSeasonStatus.Active]: 'Đang hoạt động',
  [CropSeasonStatus.Paused]: 'Tạm dừng',
  [CropSeasonStatus.Completed]: 'Hoàn thành',
  [CropSeasonStatus.Cancelled]: 'Đã hủy',
};

// ENUM CROP SEASON DETAIL STATUS (VÙNG TRỒNG)
export type CropSeasonDetailStatusValue = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';

export enum CropSeasonDetailStatusEnum {
  Planned = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export const CropSeasonDetailStatusLabels: Record<CropSeasonDetailStatusValue, string> = {
  Planned: 'Đã lên kế hoạch',
  InProgress: 'Đang canh tác',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Đã huỷ',
};

export const CropSeasonDetailStatusColors: Record<CropSeasonDetailStatusValue, string> = {
  Planned: '#6B7280',    // gray
  InProgress: '#F59E0B', // yellow
  Completed: '#10B981',  // green
  Cancelled: '#EF4444',  // red
};

export const CropSeasonDetailStatusNumberToValue: Record<number, CropSeasonDetailStatusValue> = {
  0: 'Planned',
  1: 'InProgress',
  2: 'Completed',
  3: 'Cancelled',
};

export const CropSeasonDetailStatusValueToNumber: Record<CropSeasonDetailStatusValue, number> = {
  Planned: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
};

// 🏷️ HÀM LẤY LABEL CHO MÙA VỤ
export const getCropSeasonStatusLabel = (status: string): string => {
  return CropSeasonStatusLabels[status as CropSeasonStatus] || status;
};

// 🏷️ HÀM LẤY LABEL CHO VÙNG TRỒNG
export const getCropSeasonDetailStatusLabel = (status: string): string => {
  return CropSeasonDetailStatusLabels[status as CropSeasonDetailStatusValue] || status;
};

// 🎨 HÀM LẤY MÀU CHO VÙNG TRỒNG
export const getCropSeasonDetailStatusColor = (status: string): string => {
  const color = CropSeasonDetailStatusColors[status as CropSeasonDetailStatusValue];
  return color || '#374151'; // fallback gray-700
};
