import { StatusColors, Colors } from '../constants/colors';
import { StatusLabels, StatusIcons } from '../constants/statusLabels';

// Generic status utility functions
export const getStatusColor = (status: string, type: 'processing' | 'cropSeason' | 'warehouse' | 'general' = 'general'): string => {
  const statusKey = status.toLowerCase();
  
  switch (type) {
    case 'processing':
      return StatusColors[`processing.${statusKey}` as keyof typeof StatusColors] || Colors.gray[500];
    case 'cropSeason':
      return StatusColors[`cropSeason.${statusKey}` as keyof typeof StatusColors] || Colors.gray[500];
    case 'warehouse':
      return StatusColors[`warehouse.${statusKey}` as keyof typeof StatusColors] || Colors.gray[500];
    default:
      return StatusColors[statusKey as keyof typeof StatusColors] || Colors.gray[500];
  }
};

export const getStatusText = (status: string, type: 'processing' | 'cropSeason' | 'warehouse' | 'general' = 'general'): string => {
  const statusKey = status.toLowerCase();
  
  switch (type) {
    case 'processing':
      return StatusLabels.processing[statusKey as keyof typeof StatusLabels.processing] || 'Không xác định';
    case 'cropSeason':
      return StatusLabels.cropSeason[statusKey as keyof typeof StatusLabels.cropSeason] || 'Không xác định';
    case 'warehouse':
      return StatusLabels.warehouse[statusKey as keyof typeof StatusLabels.warehouse] || 'Không xác định';
    default:
      return StatusLabels.general[statusKey as keyof typeof StatusLabels.general] || 'Không xác định';
  }
};

export const getStatusIcon = (status: string, type: 'processing' | 'cropSeason' | 'warehouse' = 'processing'): string => {
  const statusKey = status.toLowerCase();
  
  switch (type) {
    case 'processing':
      return StatusIcons.processing[statusKey as keyof typeof StatusIcons.processing] || 'help-circle';
    case 'cropSeason':
      return StatusIcons.cropSeason[statusKey as keyof typeof StatusIcons.cropSeason] || 'help-circle';
    case 'warehouse':
      return StatusIcons.warehouse[statusKey as keyof typeof StatusIcons.warehouse] || 'help-circle';
    default:
      return 'help-circle';
  }
};

// Specific utility functions for each type
export const getProcessingStatusColor = (status: string) => getStatusColor(status, 'processing');
export const getProcessingStatusText = (status: string) => getStatusText(status, 'processing');
export const getProcessingStatusIcon = (status: string) => getStatusIcon(status, 'processing');

export const getCropSeasonStatusColor = (status: string) => getStatusColor(status, 'cropSeason');
export const getCropSeasonStatusText = (status: string) => getStatusText(status, 'cropSeason');
export const getCropSeasonStatusIcon = (status: string) => getStatusIcon(status, 'cropSeason');

export const getWarehouseStatusColor = (status: string) => getStatusColor(status, 'warehouse');
export const getWarehouseStatusText = (status: string) => getStatusText(status, 'warehouse');
export const getWarehouseStatusIcon = (status: string) => getStatusIcon(status, 'warehouse');
