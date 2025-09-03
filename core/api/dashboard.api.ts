import api from './axiosClient';
import { getCropSeasonsForCurrentUser } from './cropSeason.api';
import { getWarehouseInboundRequestsForCurrentUser } from './warehouseRequest.api';

// Helper function để format thời gian
const formatTimeAgo = (dateString: string): string => {
  const timeDiff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} ngày trước`;
  } else if (hours > 0) {
    return `${hours} giờ trước`;
  } else {
    return 'Vừa xong';
  }
};

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
      console.log('🎯 Getting dashboard data for role:', role);
      
      // Lấy stats và activities thực tế từ API
      const [stats, activities] = await Promise.all([
        dashboardAPI.getStatsByRole(role),
        dashboardAPI.getActivitiesByRole(role)
      ]);
      
      console.log('📊 Stats from API:', stats);
      console.log('🎭 Activities from API:', activities);
      
      const result = {
        menuItems: getFallbackDashboardData(role).menuItems,
        stats: stats,
        activities: activities,
      };
      
      console.log('🎯 Final dashboard data:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting dashboard data:', error);
      return getFallbackDashboardData(role);
    }
  },

  // Lấy hoạt động gần đây theo role
  getActivitiesByRole: async (role: string): Promise<ActivityItem[]> => {
    try {
      if (role === 'DeliveryStaff') {
        // Lấy hoạt động thực tế từ API delivery
        const { getMyShipments } = await import('./delivery.api');
        
        try {
          console.log('🚚 Getting delivery staff activities...');
          const shipments = await getMyShipments();
          console.log('📦 Shipments for activities:', shipments);
          
          const recentShipments = shipments
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 3);

          const activities = recentShipments.map(shipment => {
            const timeDiff = Date.now() - new Date(shipment.updatedAt).getTime();
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);
            
            let timeText = '';
            if (days > 0) {
              timeText = `${days} ngày trước`;
            } else if (hours > 0) {
              timeText = `${hours} giờ trước`;
            } else {
              timeText = 'Vừa xong';
            }

            return {
              icon: shipment.deliveryStatus === 'Delivered' ? '✅' : 
                    shipment.deliveryStatus === 'InTransit' ? '🚚' : '📱',
              title: `Cập nhật trạng thái: ${shipment.shipmentCode}`,
              time: timeText
            };
          });
          
          console.log('🎯 Final delivery staff activities:', activities);
          return activities;
        } catch (error) {
          console.error('❌ Error getting delivery activities:', error);
          return getFallbackActivities(role);
        }
      } else if (role === 'Farmer') {
        // Lấy hoạt động thực tế từ API farmer
        try {
          console.log('🌱 Getting farmer activities...');
          const [cropSeasons, warehouseRequests] = await Promise.all([
            getCropSeasonsForCurrentUser().catch(() => []),
            getWarehouseInboundRequestsForCurrentUser().catch(() => [])
          ]);
          
          console.log('📊 Crop seasons data:', cropSeasons);
          console.log('📦 Warehouse requests data:', warehouseRequests);

          const allActivities = [
            ...cropSeasons.map(season => ({
              icon: '🌱',
              title: `Mùa vụ: ${season.name || season.cropSeasonCode || season.seasonName || 'Không có tên'}`,
              time: formatTimeAgo(season.updatedAt || season.createdAt || new Date().toISOString())
            })),
            ...warehouseRequests.map(request => ({
              icon: '📦',
              title: `Lô hàng: ${request.batchName || request.requestCode || 'Không có tên'}`,
              time: formatTimeAgo(request.updatedAt || request.createdAt || new Date().toISOString())
            }))
          ];

          console.log('🎯 Final activities:', allActivities);

          return allActivities
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 3);
        } catch (error) {
          console.error('❌ Error getting farmer activities:', error);
          return getFallbackActivities(role);
        }
      } else {
        // Manager/Staff - Lấy hoạt động tổng hợp
        try {
          console.log('👔 Getting manager/staff activities...');
          const [cropSeasons, warehouseRequests] = await Promise.all([
            getCropSeasonsForCurrentUser().catch(() => []),
            getWarehouseInboundRequestsForCurrentUser().catch(() => [])
          ]);
          
          console.log('📊 Crop seasons data:', cropSeasons);
          console.log('📦 Warehouse requests data:', warehouseRequests);

          const allActivities = [
            ...cropSeasons.map(season => ({
              icon: '🌱',
              title: `Mùa vụ: ${season.name || season.cropSeasonCode || season.seasonName || 'Không có tên'}`,
              time: formatTimeAgo(season.updatedAt || season.createdAt || new Date().toISOString())
            })),
            ...warehouseRequests.map(request => ({
              icon: '📦',
              title: `Lô hàng: ${request.batchName || request.requestCode || 'Không có tên'}`,
              time: formatTimeAgo(request.updatedAt || request.createdAt || new Date().toISOString())
            }))
          ];

          console.log('🎯 Final activities:', allActivities);

          return allActivities
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 3);
        } catch (error) {
          console.error('❌ Error getting manager activities:', error);
          return getFallbackActivities(role);
        }
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
        try {
          console.log('🌱 Getting farmer stats...');
          const [cropSeasons, warehouseRequests] = await Promise.all([
            getCropSeasonsForCurrentUser().catch(() => []),
            getWarehouseInboundRequestsForCurrentUser().catch(() => [])
          ]);
          
          console.log('📊 Crop seasons for stats:', cropSeasons);
          console.log('📦 Warehouse requests for stats:', warehouseRequests);

          // Tính tiến độ dựa trên số mùa vụ đã hoàn thành
          const completedSeasons = cropSeasons.filter(season => season.status === 'Completed');
          const progressPercentage = cropSeasons.length > 0 
            ? Math.round((completedSeasons.length / cropSeasons.length) * 100)
            : 0;

          const stats = [
            { icon: '🌱', number: cropSeasons.length.toString(), label: 'Mùa vụ' },
            { icon: '📦', number: warehouseRequests.length.toString(), label: 'Lô hàng' },
            { icon: '📊', number: `${progressPercentage}%`, label: 'Tiến độ' },
          ];
          
          console.log('🎯 Final farmer stats:', stats);
          return stats;
        } catch (error) {
          console.error('❌ Error getting farmer stats:', error);
          return getFallbackStats(role);
        }
      } else if (role === 'DeliveryStaff') {
        // Lấy stats thực tế từ API delivery
        const { getMyShipments, getDeliveryStatistics } = await import('./delivery.api');
        
        try {
          console.log('🚚 Getting delivery staff stats...');
          const [shipments, statistics] = await Promise.all([
            getMyShipments().catch(() => []),
            getDeliveryStatistics().catch(() => null)
          ]);
          
          console.log('📦 Shipments for stats:', shipments);
          console.log('📊 Statistics for stats:', statistics);

          const today = new Date();
          const todayDeliveries = shipments.filter(s => {
            const shippedDate = new Date(s.shippedAt);
            return shippedDate.toDateString() === today.toDateString();
          }).length;

          const stats = [
            { icon: '🚚', number: shipments.length.toString(), label: 'Tổng đơn giao' },
            { icon: '✅', number: todayDeliveries.toString(), label: 'Giao hôm nay' },
            { icon: '⏳', number: (shipments.filter(s => s.deliveryStatus === 'InTransit').length).toString(), label: 'Đang giao' },
          ];
          
          console.log('🎯 Final delivery staff stats:', stats);
          return stats;
        } catch (error) {
          console.error('❌ Error getting delivery stats:', error);
          // Fallback nếu API lỗi
          return [
            { icon: '🚚', number: '0', label: 'Tổng đơn giao' },
            { icon: '✅', number: '0', label: 'Giao hôm nay' },
            { icon: '⏳', number: '0', label: 'Đang giao' },
          ];
        }
      } else {
        // Manager/Staff - Lấy stats tổng hợp
        try {
          console.log('👔 Getting manager/staff stats...');
          const [cropSeasons, warehouseRequests, shipments] = await Promise.all([
            getCropSeasonsForCurrentUser().catch(() => []),
            getWarehouseInboundRequestsForCurrentUser().catch(() => []),
            // TODO: Thêm API lấy shipments cho Manager/Staff khi có
            Promise.resolve([])
          ]);
          
          console.log('📊 Crop seasons for stats:', cropSeasons);
          console.log('📦 Warehouse requests for stats:', warehouseRequests);

          // Tính tiến độ tổng thể
          const totalItems = cropSeasons.length + warehouseRequests.length;
          const completedItems = cropSeasons.filter(s => s.status === 'Completed').length + 
                               warehouseRequests.filter(r => r.status === 'COMPLETED').length;
          const progressPercentage = totalItems > 0 
            ? Math.round((completedItems / totalItems) * 100)
            : 0;

          const stats = [
            { icon: '🌱', number: cropSeasons.length.toString(), label: 'Mùa vụ' },
            { icon: '📦', number: warehouseRequests.length.toString(), label: 'Lô hàng' },
            { icon: '📊', number: `${progressPercentage}%`, label: 'Tiến độ' },
          ];
          
          console.log('🎯 Final manager/staff stats:', stats);
          return stats;
        } catch (error) {
          console.error('❌ Error getting manager stats:', error);
          // Fallback nếu API lỗi
          return [
            { icon: '🌱', number: '0', label: 'Mùa vụ' },
            { icon: '📦', number: '0', label: 'Lô hàng' },
            { icon: '📊', number: '0%', label: 'Tiến độ' },
          ];
        }
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
