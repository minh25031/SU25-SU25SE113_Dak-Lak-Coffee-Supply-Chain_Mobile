import { useState, useEffect, useCallback } from 'react';
import { getWarehouseInboundRequestsForCurrentUser, WarehouseInboundRequestListItem } from '../api/warehouseRequest.api';

export const useWarehouseRequest = () => {
  const [requests, setRequests] = useState<WarehouseInboundRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWarehouseInboundRequestsForCurrentUser();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching warehouse requests:', err);
      setError('Không thể tải danh sách yêu cầu nhập kho');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, [fetchRequests]);

  const cancelRequest = useCallback(async (requestId: string) => {
    try {
      console.log('Cancelling request:', requestId);
      // Note: Cancel request API endpoint not yet implemented in backend
      // await warehouseRequestAPI.cancelRequest(requestId);
      await fetchRequests(); // Refresh data
    } catch (err) {
      console.error('Error cancelling request:', err);
      throw new Error('Không thể hủy yêu cầu');
    }
  }, [fetchRequests]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    refreshing,
    error,
    onRefresh,
    cancelRequest,
    refetch: fetchRequests,
  };
};
