export enum WarehouseInboundRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'Pending':
      return 'Chờ xử lý';
    case 'Approved':
      return 'Đã duyệt';
    case 'Rejected':
      return 'Từ chối';
    case 'Completed':
      return 'Hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
}

export const getWarehouseInboundRequestStatusLabel = (status: string | number): string => {
  // Convert to string for comparison
  const statusStr = String(status).toUpperCase();
  
  switch (statusStr) {
    case 'PENDING':
    case '0':
      return 'Chờ xử lý';
    case 'APPROVED':
    case '1':
      return 'Đã duyệt';
    case 'REJECTED':
    case '2':
      return 'Từ chối';
    case 'CANCELLED':
    case '3':
      return 'Đã hủy';
    case 'COMPLETED':
    case '4':
      return 'Hoàn thành';
    default:
      return 'Chờ xử lý';
  }
};

export const getWarehouseInboundRequestStatusColor = (status: string | number): string => {
  // Convert to string for comparison
  const statusStr = String(status).toUpperCase();
  
  switch (statusStr) {
    case 'PENDING':
    case '0':
      return '#F59E0B'; // Yellow
    case 'APPROVED':
    case '1':
      return '#10B981'; // Green
    case 'REJECTED':
    case '2':
      return '#EF4444'; // Red
    case 'CANCELLED':
    case '3':
      return '#6B7280'; // Gray
    case 'COMPLETED':
    case '4':
      return '#3B82F6'; // Blue
    default:
      return '#F59E0B'; // Default to yellow (pending)
  }
};
