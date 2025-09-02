import api from './axiosClient';

export interface CoffeeType {
  coffeeTypeId: string;
  typeCode: string;
  typeName: string;
  botanicalName?: string;
  description?: string;
  typicalRegion?: string;
  specialtyLevel?: string;
}

export interface QualityOption {
  label: string;
  value: string;
}

/**
 * Lấy tất cả loại cà phê
 */
export async function getCoffeeTypes(): Promise<CoffeeType[]> {
  try {
    const response = await api.get<CoffeeType[]>('/CoffeeType');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching coffee types:', error);
    throw error;
  }
}

/**
 * Lấy danh sách chất lượng theo loại cà phê (giống web app)
 */
export function getQualitySuggestions(coffeeType?: string): QualityOption[] {
  if (!coffeeType) {
    return [
      { label: "Đặc sản (Premium)", value: "Premium" },
      { label: "Chất lượng cao (High)", value: "High" },
      { label: "Chất lượng trung bình (Medium)", value: "Medium" },
      { label: "Tiêu chuẩn cơ bản (Standard)", value: "Standard" },
    ];
  }

  const type = coffeeType.toLowerCase();

  if (type.includes('arabica')) {
    return [
      { label: "Cà phê đặc sản (SCA 90+)", value: "SCA 90+" },
      { label: "Cà phê đặc sản (SCA 85+)", value: "SCA 85+" },
      { label: "Cà phê đặc sản (SCA 80+)", value: "SCA 80+" },
      { label: "Premium Arabica", value: "Premium Arabica" },
      { label: "Standard Arabica", value: "Standard Arabica" },
    ];
  } else if (type.includes('robusta')) {
    return [
      { label: "Fine Robusta Premium", value: "Fine Robusta Premium" },
      { label: "Fine Robusta", value: "Fine Robusta" },
      { label: "Premium Robusta", value: "Premium Robusta" },
      { label: "Standard Robusta", value: "Standard Robusta" },
    ];
  } else if (type.includes('chồn') || type.includes('weasel')) {
    return [
      { label: "Cà phê Chồn Premium", value: "Cà phê Chồn Premium" },
      { label: "Cà phê Chồn Standard", value: "Cà phê Chồn Standard" },
      { label: "Cà phê Chồn Đặc biệt", value: "Cà phê Chồn Đặc biệt" },
    ];
  } else {
    // Các loại cà phê khác
    return [
      { label: "Đặc sản (Premium)", value: "Premium" },
      { label: "Chất lượng cao (High)", value: "High" },
      { label: "Chất lượng trung bình (Medium)", value: "Medium" },
      { label: "Tiêu chuẩn cơ bản (Standard)", value: "Standard" },
    ];
  }
}

/**
 * Chất lượng chung cho tất cả loại cà phê (giống web app)
 */
export const COMMON_QUALITY_OPTIONS: QualityOption[] = [
  { label: "Hữu cơ (Organic)", value: "Organic" },
  { label: "Fair Trade", value: "Fair Trade" },
  { label: "Rainforest Alliance", value: "Rainforest Alliance" },
  { label: "UTZ Certified", value: "UTZ Certified" },
  { label: "4C Certified", value: "4C Certified" },
];

/**
 * Lấy tất cả options chất lượng (bao gồm cả chung và theo loại)
 */
export function getAllQualityOptions(coffeeType?: string): QualityOption[] {
  const typeSpecific = getQualitySuggestions(coffeeType);
  const common = COMMON_QUALITY_OPTIONS;
  
  // Kết hợp và loại bỏ trùng lặp
  const allOptions = [...typeSpecific, ...common];
  const uniqueOptions = allOptions.filter((option, index, self) => 
    index === self.findIndex(o => o.value === option.value)
  );
  
  return uniqueOptions;
}
