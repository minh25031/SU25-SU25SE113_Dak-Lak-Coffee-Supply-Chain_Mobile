import { useState, useEffect, useCallback } from 'react';
import { getAllFarmerReports, GeneralFarmerReportViewAllDto } from '../api/generalFarmerReports.api';

export const useFarmerReport = () => {
  const [reports, setReports] = useState<GeneralFarmerReportViewAllDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllFarmerReports();
      // Sort by date (newest first)
      const sortedData = data.sort((a, b) =>
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
      );
      setReports(sortedData);
    } catch (err) {
      console.error('Error fetching farmer reports:', err);
      setError('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }, [fetchReports]);

  const createReport = useCallback(async (reportData: any) => {
    try {
      // Implement create report API call
      console.log('Creating report:', reportData);
      // await farmerReportAPI.createReport(reportData);
      await fetchReports(); // Refresh data
    } catch (err) {
      console.error('Error creating report:', err);
      throw new Error('Không thể tạo báo cáo');
    }
  }, [fetchReports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    refreshing,
    error,
    onRefresh,
    createReport,
    refetch: fetchReports,
  };
};

