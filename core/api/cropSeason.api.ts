import api from "../api/axiosClient";

export const getAllCropSeasons = async () => {
  const response = await api.get("/CropSeasons");
  return response.data;
};

export const getCropSeasonById = async (id: string) => {
  const res = await api.get(`/CropSeasons/${id}`);
  return res.data;
};
