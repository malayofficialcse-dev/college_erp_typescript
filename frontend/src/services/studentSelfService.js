import api from "./api";

export const fetchMyStudentProfile = async (user) => {
  if (!user?.id) return null;

  try {
    const res = await api.get(`/users/${user.id}/student`);
    return res.data || null;
  } catch (err) {
    if (err.response?.status !== 404) {
      throw err;
    }
  }

  return null;
};
