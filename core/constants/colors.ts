// Color constants for the app
export const Colors = {
  // Primary colors
  primary: '#FD7622',
  primaryDark: '#D74F0F',
  primaryLight: '#FF8A4C',
  
  // Gradient colors
  gradients: {
    primary: ['#FD7622', '#FF8A4C', '#FFB366'],
    success: ['#10B981', '#34D399', '#6EE7B7'],
    warning: ['#F59E0B', '#FBBF24', '#FCD34D'],
    error: ['#EF4444', '#F87171', '#FCA5A5'],
    info: ['#3B82F6', '#60A5FA', '#93C5FD'],
    sunset: ['#FF6B6B', '#FF8E53', '#FF6B9D'],
    ocean: ['#667eea', '#764ba2', '#f093fb'],
    forest: ['#134E5E', '#71B280', '#A8E6CF'],
  },
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Neutral colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Background colors
  background: '#FEFAF4',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  
  // Text colors
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
} as const;

// Status color mapping
export const StatusColors = {
  // Processing batch status
  'processing.completed': Colors.success,
  'processing.processing': Colors.warning,
  'processing.pending': Colors.gray[500],
  'processing.failed': Colors.error,
  
  // Crop season status
  'cropSeason.active': Colors.success,
  'cropSeason.paused': Colors.warning,
  'cropSeason.completed': Colors.success,
  'cropSeason.cancelled': Colors.error,
  
  // Warehouse request status
  'warehouse.pending': Colors.warning,
  'warehouse.approved': Colors.success,
  'warehouse.rejected': Colors.error,
  'warehouse.cancelled': Colors.gray[500],
  'warehouse.completed': Colors.success,
  
  // General status
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
  info: Colors.info,
} as const;
