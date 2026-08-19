import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminDashboard } from '../api/adminApi.js';

export function useAdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getAdminDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401 || requestError.response?.status === 403) {
          navigate('/admin/login?next=/admin', { replace: true });
        } else {
          setError(requestError.response?.data?.message || 'Unable to load dashboard');
        }
      });
    return () => { active = false; };
  }, [navigate]);

  return { dashboard, error };
}
