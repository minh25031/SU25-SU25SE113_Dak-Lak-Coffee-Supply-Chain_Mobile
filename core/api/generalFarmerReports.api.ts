import axiosClient from './axiosClient';

// =====================
// TYPE DEFINITIONS
// =====================

export type GeneralFarmerReportViewAllDto = {
  reportId: string;
  reportType: string;
  severityLevel?: number;
  title: string;
  description: string;
  reportedAt: string;
  isResolved: boolean;
  cropProgressId?: string;
  processingProgressId?: string;
  cropSeasonName?: string;
  cropSeasonDetailName?: string;
  processingBatchCode?: string;
  photoFiles?: string[];
  videoFiles?: string[];
};

export type GeneralFarmerReportCreateDto = {
  reportType: string;
  severityLevel: number;
  title: string;
  description: string;
  cropProgressId?: string;
  processingProgressId?: string;
  photoFiles: File[];
  videoFiles: File[];
};

export type GeneralFarmerReportUpdateDto = {
  reportId: string;
  title?: string;
  description?: string;
  severityLevel?: number;
  photoFiles?: File[];
  videoFiles?: File[];
};

export type ProcessingBatchProgressForReport = {
  processingProgressId: string;
  processingBatchCode: string;
  processingStageName: string;
  status: string;
};

// =====================
// API FUNCTIONS
// =====================

// Lấy tất cả báo cáo của farmer hiện tại
export async function getAllFarmerReports(): Promise<GeneralFarmerReportViewAllDto[]> {
  try {
    console.log('🔍 Getting all farmer reports...');
    const res = await axiosClient.get('/GeneralFarmerReports');
    
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.log('📡 No reports found or invalid format');
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting farmer reports:', error);
    throw error;
  }
}

// Lấy báo cáo theo ID
export async function getFarmerReportById(reportId: string): Promise<GeneralFarmerReportViewAllDto> {
  try {
    console.log('🔍 Getting farmer report by ID:', reportId);
    const res = await axiosClient.get(`/GeneralFarmerReports/${reportId}`);
    
    if (res.data && res.data.data) {
      return res.data.data;
    } else if (res.data) {
      return res.data;
    } else {
      throw new Error('Report not found');
    }
  } catch (error) {
    console.error('❌ Error getting farmer report:', error);
    throw error;
  }
}

// Tạo báo cáo mới
export async function createFarmerReport(data: GeneralFarmerReportCreateDto): Promise<any> {
  try {
    console.log('📝 Creating farmer report...');
    
    // Tạo FormData để gửi files
    const formData = new FormData();
    formData.append('reportType', data.reportType);
    formData.append('severityLevel', data.severityLevel.toString());
    formData.append('title', data.title);
    formData.append('description', data.description);
    
    if (data.cropProgressId) {
      formData.append('cropProgressId', data.cropProgressId);
    }
    
    if (data.processingProgressId) {
      formData.append('processingProgressId', data.processingProgressId);
    }
    
    // Thêm photo files
    if (data.photoFiles && data.photoFiles.length > 0) {
      data.photoFiles.forEach((file, index) => {
        formData.append('photoFiles', file);
      });
    }
    
    // Thêm video files
    if (data.videoFiles && data.videoFiles.length > 0) {
      data.videoFiles.forEach((file, index) => {
        formData.append('videoFiles', file);
      });
    }
    
    const res = await axiosClient.post('/GeneralFarmerReports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Report created successfully');
    return res.data;
  } catch (error) {
    console.error('❌ Error creating farmer report:', error);
    throw error;
  }
}

// Cập nhật báo cáo
export async function updateFarmerReport(reportId: string, data: GeneralFarmerReportUpdateDto): Promise<any> {
  try {
    console.log('📝 Updating farmer report:', reportId);
    
    // Kiểm tra nếu có files thì dùng FormData, nếu không thì dùng JSON
    const hasFiles = (data.photoFiles && data.photoFiles.length > 0) || 
                     (data.videoFiles && data.videoFiles.length > 0);
    
    if (hasFiles) {
      // Tạo FormData để gửi files
      const formData = new FormData();
      
      // Thêm reportId vào FormData
      formData.append('reportId', reportId);
      
      if (data.title) {
        formData.append('title', data.title);
      }
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.severityLevel !== undefined) {
        formData.append('severityLevel', data.severityLevel.toString());
      }
      
      // Thêm photo files
      if (data.photoFiles && data.photoFiles.length > 0) {
        data.photoFiles.forEach((file, index) => {
          formData.append('photoFiles', file);
        });
      }
      
      // Thêm video files
      if (data.videoFiles && data.videoFiles.length > 0) {
        data.videoFiles.forEach((file, index) => {
          formData.append('videoFiles', file);
        });
      }
      
      const res = await axiosClient.put(`/GeneralFarmerReports/${reportId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Report updated successfully with files');
      return res.data;
    } else {
      // Gửi JSON cho text fields - phải có reportId
      const jsonData = {
        reportId: reportId,
        title: data.title,
        description: data.description,
        severityLevel: data.severityLevel,
      };
      
      const res = await axiosClient.put(`/GeneralFarmerReports/${reportId}`, jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Report updated successfully with JSON');
      return res.data;
    }
  } catch (error) {
    console.error('❌ Error updating farmer report:', error);
    throw error;
  }
}

// Xóa báo cáo
export async function deleteFarmerReport(reportId: string): Promise<any> {
  try {
    console.log('🗑️ Deleting farmer report:', reportId);
    const res = await axiosClient.delete(`/GeneralFarmerReports/${reportId}`);
    
    console.log('✅ Report deleted successfully');
    return res.data;
  } catch (error) {
    console.error('❌ Error deleting farmer report:', error);
    throw error;
  }
}

// Lấy danh sách crop progress cho farmer hiện tại
export async function getCropProgressesForCurrentFarmer(): Promise<any[]> {
  try {
    console.log('🔍 Getting crop progresses for current farmer...');
    const res = await axiosClient.get('/CropProgresses');
    
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.log('📡 No crop progresses found');
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting crop progresses:', error);
    return [];
  }
}

// Lấy danh sách processing batch progress cho farmer hiện tại
export async function getProcessingBatchProgressesForCurrentFarmer(): Promise<ProcessingBatchProgressForReport[]> {
  try {
    console.log('🔍 Getting processing batch progresses for current farmer...');
    const res = await axiosClient.get('/ProcessingBatchsProgress');
    
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    } else {
      console.log('📡 No processing batch progresses found');
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting processing batch progresses:', error);
    return [];
  }
}
