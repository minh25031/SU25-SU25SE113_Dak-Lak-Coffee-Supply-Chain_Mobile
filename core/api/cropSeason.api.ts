import api from "../api/axiosClient"; // axios instance đã có baseURL & token

export const getAllCropSeasons = async () => {
  const response = await api.get("/CropSeasons"); // gọi http://10.0.2.2:5077/api/CropSeasons
  return response.data;
};
