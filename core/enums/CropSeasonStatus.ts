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
