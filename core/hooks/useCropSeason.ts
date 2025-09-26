import { useState, useEffect, useCallback } from 'react';
import { getCropSeasonsForCurrentUser, CropSeasonListItem } from '../api/cropSeason.api';

export const useCropSeason = () => {
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCropSeasons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCropSeasonsForCurrentUser();
      setCropSeasons(data);
    } catch (err) {
      console.error('Error fetching crop seasons:', err);
      setError('Không thể tải danh sách mùa vụ');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCropSeasons();
    setRefreshing(false);
  }, [fetchCropSeasons]);

  useEffect(() => {
    fetchCropSeasons();
  }, [fetchCropSeasons]);

  return {
    cropSeasons,
    loading,
    refreshing,
    error,
    onRefresh,
    refetch: fetchCropSeasons,
  };
};

