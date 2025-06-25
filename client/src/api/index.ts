import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function getMyScores() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const res = await api.get('/score/my', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
} 