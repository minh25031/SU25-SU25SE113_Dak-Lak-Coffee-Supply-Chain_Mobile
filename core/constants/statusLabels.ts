// Status labels in Vietnamese
export const StatusLabels = {
  // Processing batch status
  processing: {
    completed: 'Hoàn thành',
    processing: 'Đang xử lý',
    pending: 'Chờ xử lý',
    failed: 'Thất bại',
  },
  
  // Crop season status
  cropSeason: {
    active: 'Đang hoạt động',
    paused: 'Tạm dừng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  },
  
  // Warehouse request status
  warehouse: {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành',
  },
  
  // General status
  general: {
    success: 'Thành công',
    warning: 'Cảnh báo',
    error: 'Lỗi',
    info: 'Thông tin',
  },
} as const;

// Status icons mapping
export const StatusIcons = {
  // Processing batch icons
  processing: {
    completed: 'check-circle',
    processing: 'progress-clock',
    pending: 'clock-outline',
    failed: 'alert-circle',
  },
  
  // Crop season icons
  cropSeason: {
    active: 'play-circle',
    paused: 'pause-circle',
    completed: 'check-circle',
    cancelled: 'close-circle',
  },
  
  // Warehouse request icons
  warehouse: {
    pending: 'clock-outline',
    approved: 'check-circle',
    rejected: 'close-circle',
    cancelled: 'cancel',
    completed: 'check-circle',
  },
} as const;

