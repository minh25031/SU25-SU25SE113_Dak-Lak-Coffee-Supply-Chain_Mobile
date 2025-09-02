import api from './axiosClient';
import { getCropSeasonsForCurrentUser } from './cropSeason.api';
import { getWarehouseInboundRequestsForCurrentUser } from './warehouseRequest.api';

export interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
  roles: string[];
}

export interface DashboardStats {
  icon: string;
  number: string;
  label: string;
}

export interface ActivityItem {
  icon: string;
  title: string;
  time: string;
}

export interface DashboardData {
  menuItems: MenuItem[];
  stats: DashboardStats[];
  activities: ActivityItem[];
}

export const dashboardAPI = {
  // Lấy menu items và stats theo role - sử dụng API có sẵn
  getDashboardData: async (role: string): Promise<DashboardData> => {
    try {
      // Lấy stats thực tế từ API
      const stats = await dashboardAPI.getStatsByRole(role);
      
      return {
        menuItems: getFallbackDashboardData(role).menuItems,
        stats: stats,
        activities: getFallbackActivities(role),
      };
    } catch (error) {
      console.error('❌ Error getting dashboard data:', error);
      return getFallbackDashboardData(role);
    }
  },

  // Lấy hoạt động gần đây theo role
  getActivitiesByRole: async (role: string): Promise<ActivityItem[]> => {
    try {
      if (role === 'DeliveryStaff') {
        return [
          { icon: '🚚', title: 'Đơn hàng mới được giao', time: '2 giờ trước' },
          { icon: '✅', title: 'Giao hàng thành công', time: '5 giờ trước' },
          { icon: '📱', title: 'Cập nhật trạng thái giao hàng', time: '1 ngày trước' },
        ];
      } else if (role === 'Farmer') {
        return [
          { icon: '🌱', title: 'Mùa vụ mới được tạo', time: '2 giờ trước' },
          { icon: '📦', title: 'Lô hàng đã được nhập kho', time: '5 giờ trước' },
          { icon: '📊', title: 'Cập nhật tiến độ sản xuất', time: '1 ngày trước' },
        ];
      } else {
        // Manager/Staff
        return [
          { icon: '🌱', title: 'Mùa vụ mới được tạo', time: '2 giờ trước' },
          { icon: '📦', title: 'Lô hàng đã được nhập kho', time: '5 giờ trước' },
          { icon: '🚚', title: 'Đơn hàng giao mới', time: '1 ngày trước' },
        ];
      }
    } catch (error) {
      console.error('❌ Error getting activities by role:', error);
      return getFallbackActivities(role);
    }
  },

  // Lấy stats theo role - sử dụng API có sẵn
  getStatsByRole: async (role: string): Promise<DashboardStats[]> => {
    try {
      if (role === 'Farmer') {
        // Sử dụng API có sẵn để lấy stats thực tế
        const [cropSeasons, warehouseRequests] = await Promise.all([
          getCropSeasonsForCurrentUser().catch(() => []),
          getWarehouseInboundRequestsForCurrentUser().catch(() => [])
        ]);

        // Tính tiến độ dựa trên số mùa vụ đã hoàn thành
        const completedSeasons = cropSeasons.filter(season => season.status === 'Completed');
        const progressPercentage = cropSeasons.length > 0 
          ? Math.round((completedSeasons.length / cropSeasons.length) * 100)
          : 0;

        return [
          { icon: '🌱', number: cropSeasons.length.toString(), label: 'Mùa vụ' },
          { icon: '📦', number: warehouseRequests.length.toString(), label: 'Lô hàng' },
          { icon: '📊', number: `${progressPercentage}%`, label: 'Tiến độ' },
        ];
      } else if (role === 'DeliveryStaff') {
        // TODO: Thay thế bằng API thật khi có
        return [
          { icon: '🚚', number: '8', label: 'Đơn giao mới' },
          { icon: '✅', number: '5', label: 'Đã giao hôm nay' },
          { icon: '⏳', number: '3', label: 'Đang giao' },
        ];
      } else {
        // Manager/Staff - TODO: Thay thế bằng API thật khi có
        return [
          { icon: '🌱', number: '15', label: 'Mùa vụ' },
          { icon: '📦', number: '48', label: 'Lô hàng' },
          { icon: '📊', number: '92%', label: 'Tiến độ' },
        ];
      }
    } catch (error) {
      console.error('❌ Error getting stats by role:', error);
      return getFallbackStats(role);
    }
  },
};

// Fallback data khi API không khả dụng
const getFallbackDashboardData = (role: string): DashboardData => {
  const baseMenuItems: MenuItem[] = [
    {
      id: 'cropseason',
      title: 'Mùa vụ',
      subtitle: 'Quản lý mùa vụ cà phê',
      icon: '🌱',
      color: '#10B981',
      route: '/cropseason',
      roles: ['Farmer', 'Manager'],
    },
    {
      id: 'warehouse',
      title: 'Kho hàng',
      subtitle: 'Quản lý nhập xuất kho',
      icon: '🏭',
      color: '#3B82F6',
      route: '/warehouse',
      roles: ['Farmer', 'Manager', 'Staff'],
    },
    {
      id: 'delivery',
      title: 'Giao hàng',
      subtitle: 'Quản lý đơn hàng giao',
      icon: '🚚',
      color: '#F59E0B',
      route: '/delivery',
      roles: ['DeliveryStaff', 'Manager'],
    },
    {
      id: 'orders',
      title: 'Đơn hàng',
      subtitle: 'Theo dõi trạng thái đơn hàng',
      icon: '📋',
      color: '#8B5CF6',
      route: '/orders',
      roles: ['DeliveryStaff', 'Manager'],
    },

    {
      id: 'reports',
      title: 'Báo cáo',
      subtitle: 'Xem báo cáo tổng hợp',
      icon: '📈',
      color: '#8B5CF6',
      route: '/reports',
      roles: ['Farmer', 'Manager', 'DeliveryStaff'],
    },

  ];

  const filteredMenuItems = baseMenuItems.filter(item =>
    item.roles.includes(role)
  );

  return {
    menuItems: filteredMenuItems,
    stats: getFallbackStats(role),
    activities: getFallbackActivities(role),
  };
};

const getFallbackStats = (role: string): DashboardStats[] => {
  if (role === 'DeliveryStaff') {
    return [
      { icon: '🚚', number: '8', label: 'Đơn giao' },
      { icon: '✅', number: '5', label: 'Đã giao' },
      { icon: '⏳', number: '3', label: 'Đang giao' },
    ];
  } else if (role === 'Farmer') {
    return [
      { icon: '🌱', number: '4', label: 'Mùa vụ' },
      { icon: '📦', number: '12', label: 'Lô hàng' },
      { icon: '📊', number: '85%', label: 'Tiến độ' },
    ];
  } else {
    // Manager/Staff
    return [
      { icon: '🌱', number: '15', label: 'Mùa vụ' },
      { icon: '📦', number: '48', label: 'Lô hàng' },
      { icon: '📊', number: '92%', label: 'Tiến độ' },
    ];
  }
};

const getFallbackActivities = (role: string): ActivityItem[] => {
  if (role === 'DeliveryStaff') {
    return [
      { icon: '🚚', title: 'Đơn hàng mới được giao', time: '2 giờ trước' },
      { icon: '✅', title: 'Giao hàng thành công', time: '5 giờ trước' },
      { icon: '📱', title: 'Cập nhật trạng thái giao hàng', time: '1 ngày trước' },
    ];
  } else if (role === 'Farmer') {
    return [
      { icon: '🌱', title: 'Mùa vụ mới được tạo', time: '2 giờ trước' },
      { icon: '📦', title: 'Lô hàng đã được nhập kho', time: '5 giờ trước' },
      { icon: '📊', title: 'Cập nhật tiến độ sản xuất', time: '1 ngày trước' },
    ];
  } else {
    // Manager/Staff
    return [
      { icon: '🌱', title: 'Mùa vụ mới được tạo', time: '2 giờ trước' },
      { icon: '📦', title: 'Lô hàng đã được nhập kho', time: '5 giờ trước' },
      { icon: '🚚', title: 'Đơn hàng giao mới', time: '1 ngày trước' },
    ];
  }
};
