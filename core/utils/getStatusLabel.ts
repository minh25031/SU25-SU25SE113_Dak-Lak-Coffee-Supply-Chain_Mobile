import { CropSeasonStatus, CropSeasonStatusLabels } from '@/core/enums/CropSeasonStatus';

export const getStatusLabel = (status: string): string => {
  return CropSeasonStatusLabels[status as CropSeasonStatus] || status;
};
