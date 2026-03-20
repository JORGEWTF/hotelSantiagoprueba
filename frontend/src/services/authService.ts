import axiosInstance from '../api/axios';
import type { LoginResponse, RegisterData, User } from '../types/auth';
export type { LoginResponse, RegisterData, User } from '../types/auth';
// No necesitamos la URL base aquí porque ya está en axiosInstance

export const loginAdmin = async (carnet: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', {
      carnet,
      password
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Error en las credenciales';
  }
};

export const registerAdmin = async (userData: RegisterData) => {
  try {
    const response = await axiosInstance.post('/auth/register-admin', userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Error al registrar administrador';
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const getCurrentUser = (): User | null => {
  // Ahora derivamos el usuario del token en el AuthContext, 
  // pero mantengo la función por compatibilidad si es necesario
  // aunque ya no usaremos 'user' en localStorage
  return null;
}