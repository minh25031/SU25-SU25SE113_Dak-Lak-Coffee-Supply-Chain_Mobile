import api from "./axiosClient";

export interface FarmingCommitmentItem {
  commitmentId: string;
  commitmentCode: string;
  commitmentName: string;
  farmerName: string;
  confirmedPrice: number;
  committedQuantity: number;
  estimatedDeliveryStart: string;
  estimatedDeliveryEnd: string;
  status: number;
}

export async function getAvailableCommitments(): Promise<FarmingCommitmentItem[]> {
  const data = await getAvailableCommitments();
console.log("Cam kết khả dụng:", data);

  try {
    const res = await api.get<FarmingCommitmentItem[]>(
      "/FarmingCommitment/Farmer/AvailableForCropSeason"
    );
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách cam kết khả dụng:", err);
    return [];
  }
}
