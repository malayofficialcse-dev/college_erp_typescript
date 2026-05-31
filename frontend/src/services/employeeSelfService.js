import api from './api';

const pickFirstEmployee = (data) => {
  if (Array.isArray(data)) return data[0] || null;
  if (data?.content) return data.content[0] || null;
  return data || null;
};

export const fetchMyEmployee = async (user) => {
  if (!user?.id) return null;

  try {
    const res = await api.get(`/users/${user.id}/employee`);
    return res.data || null;
  } catch (err) {
    if (err.response?.status !== 404) {
      throw err;
    }
  }

  const keyword = user.username || user.email;
  if (!keyword) return null;

  const searchRes = await api.get('/employees', { params: { keyword, size: 1 } });
  return pickFirstEmployee(searchRes.data);
};

export const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.content) return data.content;
  return data ? [data] : [];
};
