import { useState, useCallback } from 'react';
import apiClient from '../services/api';

export interface SyncStatus {
  gmailConnected: boolean;
  lastSync?: string;
}

export const useGmail = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const getOAuthUrl = useCallback(async () => {
    setError(null);
    try {
      const response = await apiClient.get('/gmail/oauth-url');
      return response.data.authUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get OAuth URL';
      setError(message);
      throw err;
    }
  }, []);

  const handleOAuthCallback = useCallback(async (code: string) => {
    setError(null);
    setLoading(true);
    try {
      await apiClient.post('/gmail/callback', { code });
      await fetchSyncStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect Gmail';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    setError(null);
    try {
      const response = await apiClient.get('/gmail/sync-status');
      setSyncStatus(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sync status';
      setError(message);
    }
  }, []);

  const syncEmails = useCallback(async () => {
    setError(null);
    setIsSyncing(true);
    try {
      await apiClient.post('/gmail/sync');
      // Refetch status after a short delay
      setTimeout(() => fetchSyncStatus(), 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync emails';
      setError(message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [fetchSyncStatus]);

  return {
    syncStatus,
    loading,
    error,
    isSyncing,
    getOAuthUrl,
    handleOAuthCallback,
    fetchSyncStatus,
    syncEmails,
  };
};
