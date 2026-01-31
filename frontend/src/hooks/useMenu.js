/**
 * Custom hook for fetching menu data.
 */
import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * @typedef {Object} MenuItem
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} image_url
 * @property {boolean} is_available
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {MenuItem[]} items
 */

/**
 * @typedef {Object} MenuData
 * @property {number} table_number
 * @property {Category[]} categories
 */

/**
 * Fetch menu for a specific table.
 * @param {number} tableId - Table number
 * @returns {{ data: MenuData | null, loading: boolean, error: string | null }}
 */
export const useMenu = (tableId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tableId) {
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/menu`, {
          params: { table: tableId },
        });
        setData(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.message ||
            'Failed to load menu'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [tableId]);

  return { data, loading, error };
};
