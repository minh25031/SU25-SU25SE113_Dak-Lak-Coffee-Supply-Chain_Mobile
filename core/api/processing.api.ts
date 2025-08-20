
import axiosClient from "./axiosClient";

export interface ProcessingBatch {
  id: string;
  batchCode: string;
  typeName: string;
  cropSeasonName: string;
  totalInputQuantity: number;
  totalOutputQuantity: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  currentStage: string;
  progress: number;
  description?: string;
}

export interface ProcessingBatchDetail extends ProcessingBatch {
  stages: ProcessingStage[];
  parameters: ProcessingParameter[];
}

export interface ProcessingStage {
  id: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedAt?: string;
  startedAt?: string;
  outputQuantity?: number;
  notes?: string;
}

export interface ProcessingParameter {
  name: string;
  value: string;
  unit: string;
}

export interface CreateProcessingBatchRequest {
  typeId: string;
  cropSeasonId: string;
  totalInputQuantity: number;
  description?: string;
}

export interface UpdateProcessingBatchRequest {
  id: string;
  totalInputQuantity?: number;
  description?: string;
}

export interface ProcessingBatchProgressRequest {
  batchId: string;
  progressDate: string;
  outputQuantity: number;
  outputUnit: string;
  photoUrl?: string;
  videoUrl?: string;
  parameters?: ProcessingParameter[];
  stageId?: string;
  currentStageId?: string;
  stageDescription?: string;
}

class ProcessingAPI {
  // Lấy danh sách tất cả lô sơ chế của farmer
  async getAllBatches(): Promise<ProcessingBatch[]> {
    try {
      const response = await axiosClient.get('/processingbatch');
      return response.data;
    } catch (error) {
      console.error('Error fetching processing batches:', error);
      throw error;
    }
  }

  // Lấy chi tiết một lô sơ chế
  async getBatchById(batchId: string): Promise<ProcessingBatchDetail> {
    try {
      const response = await axiosClient.get(`/processingbatch/${batchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batch detail:', error);
      throw error;
    }
  }

  // Tạo lô sơ chế mới
  async createBatch(data: CreateProcessingBatchRequest): Promise<ProcessingBatch> {
    try {
      const response = await axiosClient.post('/processingbatch', data);
      return response.data;
    } catch (error) {
      console.error('Error creating processing batch:', error);
      throw error;
    }
  }

  // Cập nhật lô sơ chế
  async updateBatch(data: UpdateProcessingBatchRequest): Promise<ProcessingBatch> {
    try {
      const response = await axiosClient.put('/processingbatch', data);
      return response.data;
    } catch (error) {
      console.error('Error updating processing batch:', error);
      throw error;
    }
  }

  // Xóa lô sơ chế
  async deleteBatch(batchId: string): Promise<void> {
    try {
      await axiosClient.delete(`/processingbatch/${batchId}`);
    } catch (error) {
      console.error('Error deleting processing batch:', error);
      throw error;
    }
  }

  // Cập nhật tiến độ xử lý
  async updateProgress(data: ProcessingBatchProgressRequest): Promise<void> {
    try {
      await axiosClient.post('/processingbatchsprogress', data);
    } catch (error) {
      console.error('Error updating processing progress:', error);
      throw error;
    }
  }

  // Lấy danh sách các giai đoạn xử lý
  async getProcessingStages(): Promise<any[]> {
    try {
      const response = await axiosClient.get('/processingstages');
      return response.data;
    } catch (error) {
      console.error('Error fetching processing stages:', error);
      throw error;
    }
  }

  // Lấy tiến độ xử lý của một lô
  async getBatchProgress(batchId: string): Promise<any[]> {
    try {
      const response = await axiosClient.get(`/processingbatchsprogress/${batchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batch progress:', error);
      throw error;
    }
  }

  // Tải lên hình ảnh/video
  async uploadMedia(file: any, type: 'photo' | 'video'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await axiosClient.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }
}

export const processingAPI = new ProcessingAPI();
