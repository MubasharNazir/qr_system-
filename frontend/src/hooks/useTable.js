/**
 * Custom hook for extracting and validating table ID from URL.
 */
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Extract and validate table ID from URL query parameter.
 * @returns {{ tableId: number | null, loading: boolean, error: string | null }}
 */
export const useTable = () => {
  const [searchParams] = useSearchParams();
  const [tableId, setTableId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tableParam = searchParams.get('table');
    
    if (!tableParam) {
      setError('Table number is required');
      setLoading(false);
      return;
    }

    const parsedTableId = parseInt(tableParam, 10);
    
    if (isNaN(parsedTableId) || parsedTableId <= 0) {
      setError('Invalid table number');
      setLoading(false);
      return;
    }

    // Validate table exists by fetching menu
    const validateTable = async () => {
      try {
        setLoading(true);
        setError(null);
        await api.get('/api/menu', {
          params: { table: parsedTableId },
        });
        setTableId(parsedTableId);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Table not found or inactive');
        } else {
          setError('Failed to validate table');
        }
      } finally {
        setLoading(false);
      }
    };

    validateTable();
  }, [searchParams]);

  return { tableId, loading, error };
};
