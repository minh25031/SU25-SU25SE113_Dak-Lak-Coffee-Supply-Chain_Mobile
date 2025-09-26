import { useState, useEffect, useCallback } from 'react';
import { processingAPI, ProcessingBatchDetail } from '../api/processing.api';

export const useProcessingBatch = (id: string | undefined) => {
  const [batchDetail, setBatchDetail] = useState<ProcessingBatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatchDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await processingAPI.getBatchById(id);
      setBatchDetail(data);
    } catch (err) {
      console.error('Error fetching batch detail:', err);
      setError('Không thể tải thông tin lô sơ chế');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBatchDetail();
    setRefreshing(false);
  }, [fetchBatchDetail]);

  const deleteBatch = useCallback(async () => {
    if (!id) return;
    
    try {
      await processingAPI.deleteBatch(id);
      return true;
    } catch (err) {
      console.error('Error deleting batch:', err);
      throw new Error('Không thể xóa lô sơ chế');
    }
  }, [id]);

  useEffect(() => {
    fetchBatchDetail();
  }, [fetchBatchDetail]);

  return {
    batchDetail,
    loading,
    refreshing,
    error,
    onRefresh,
    deleteBatch,
    refetch: fetchBatchDetail,
  };
};

