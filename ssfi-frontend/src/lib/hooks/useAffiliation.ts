import { useState, useCallback } from 'react';
import apiClient from '../api/client';
import type {
  RegistrationStatus,
  AllRegistrationStatuses,
  RegistrationType,
  StateSecretaryFormData,
  DistrictSecretaryFormData,
  ClubFormData,
  StateSecretary,
  DistrictSecretary,
  Club,
  RegistrationWindow,
} from '@/types/affiliation';

const AFFILIATIONS_API = '/affiliations';

// ============================================
// REGISTRATION STATUS HOOKS
// ============================================

/**
 * Hook for fetching all registration statuses
 */
export const useRegistrationStatuses = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AllRegistrationStatuses | null>(null);

  const fetchStatuses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ data: AllRegistrationStatuses }>(
        `${AFFILIATIONS_API}/status`
      );
      setData(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch registration statuses';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchStatuses, data, isLoading, error };
};

/**
 * Hook for fetching single registration status
 */
export const useRegistrationStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RegistrationStatus | null>(null);

  const fetchStatus = useCallback(async (type: RegistrationType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ data: RegistrationStatus }>(
        `${AFFILIATIONS_API}/status/${type}`
      );
      setData(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch registration status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchStatus, data, isLoading, error };
};

// ============================================
// REGISTRATION HOOKS
// ============================================

/**
 * Hook for State Secretary registration
 */
export const useStateSecretaryRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (data: StateSecretaryFormData): Promise<{ uid: string; name: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = createFormData(data, ['identityProof', 'profilePhoto']);

      const response = await apiClient.post<{ data: { uid: string; name: string } }>(
        `${AFFILIATIONS_API}/state-secretary`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { register, isLoading, error };
};

/**
 * Hook for District Secretary registration
 */
export const useDistrictSecretaryRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (data: DistrictSecretaryFormData): Promise<{ uid: string; name: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = createFormData(data, ['identityProof', 'profilePhoto']);

      const response = await apiClient.post<{ data: { uid: string; name: string } }>(
        `${AFFILIATIONS_API}/district-secretary`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { register, isLoading, error };
};

/**
 * Hook for Club registration
 */
export const useClubRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (data: ClubFormData): Promise<{ uid: string; name: string; code: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = createFormData(data, ['clubLogo']);

      const response = await apiClient.post<{ data: { uid: string; name: string; code: string } }>(
        `${AFFILIATIONS_API}/club`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { register, isLoading, error };
};

// ============================================
// ADMIN HOOKS
// ============================================

/**
 * Hook for managing registration windows
 */
export const useRegistrationWindows = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RegistrationWindow[]>([]);

  const fetchWindows = useCallback(async (params?: { type?: RegistrationType; isActive?: boolean; includeExpired?: boolean }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ data: RegistrationWindow[] }>(
        `${AFFILIATIONS_API}/windows`,
        { params }
      );
      setData(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch registration windows';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWindow = useCallback(async (windowData: Partial<RegistrationWindow>): Promise<RegistrationWindow> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ data: RegistrationWindow }>(
        `${AFFILIATIONS_API}/windows`,
        windowData
      );
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create registration window';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateWindow = useCallback(async (windowId: string, windowData: Partial<RegistrationWindow>): Promise<RegistrationWindow> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.put<{ data: RegistrationWindow }>(
        `${AFFILIATIONS_API}/windows/${windowId}`,
        windowData
      );
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update registration window';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteWindow = useCallback(async (windowId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`${AFFILIATIONS_API}/windows/${windowId}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete registration window';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchWindows, createWindow, updateWindow, deleteWindow, data, isLoading, error };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create FormData from object, handling file fields
 */
const createFormData = (data: any, fileFields: string[]): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'termsAccepted') return;

    if (fileFields.includes(key) && typeof value === 'string' && value.startsWith('data:')) {
      // Convert base64 to blob
      const byteString = atob(value.split(',')[1]);
      const mimeString = value.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      formData.append(key, blob, `${key}.${mimeString.split('/')[1]}`);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};
