import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// USER ENDPOINTS
export const userAPI = {
  login: (email, password, role) => 
    api.post('/users/login', { email, password, role }),
  
  register: (userData) => 
    api.post('/users/register', userData),
  
  getAllUsers: (role, status) => 
    api.get('/users/all', { params: { role, status } }),
  
  getUserById: (id) => 
    api.get(`/users/${id}`),
  
  getPendingUsers: () => 
    api.get('/users/pending'),
  
  getApprovedUsers: () => 
    api.get('/users/approved'),
  
  approveUser: (id) => 
    api.patch(`/users/${id}/approve`),
  
  rejectUser: (id) => 
    api.patch(`/users/${id}/reject`),
  
  deleteUser: (id) => 
    api.delete(`/users/${id}`)
};

// APPOINTMENT ENDPOINTS
export const appointmentAPI = {
  createAppointment: (data) => 
    api.post('/appointments', data),
  
  getAllAppointments: (filters) => 
    api.get('/appointments', { params: filters }),
  
  getAppointmentById: (id) => 
    api.get(`/appointments/${id}`),
  
  updateAppointment: (id, data) => 
    api.put(`/appointments/${id}`, data),
  
  cancelAppointment: (id) => 
    api.patch(`/appointments/${id}/cancel`),
  
  completeAppointment: (id, notes) => 
    api.patch(`/appointments/${id}/complete`, { notes }),
  
  deleteAppointment: (id) => 
    api.delete(`/appointments/${id}`)
};

// PRESCRIPTION ENDPOINTS
export const prescriptionAPI = {
  createPrescription: (data) => 
    api.post('/prescriptions', data),
  
  getAllPrescriptions: (filters) => 
    api.get('/prescriptions', { params: filters }),
  
  getPrescriptionById: (id) => 
    api.get(`/prescriptions/${id}`),
  
  updatePrescription: (id, data) => 
    api.put(`/prescriptions/${id}`, data),
  
  sendPrescriptionEmail: (id) => 
    api.post(`/prescriptions/${id}/send`),
  
  deletePrescription: (id) => 
    api.delete(`/prescriptions/${id}`)
};

// VOICE RECORDING ENDPOINTS
export const voiceAPI = {
  createVoiceRecording: (data) => 
    api.post('/voice', data),
  
  getAllVoiceRecordings: (filters) => 
    api.get('/voice', { params: filters }),
  
  getVoiceRecordingById: (id) => 
    api.get(`/voice/${id}`),
  
  getLatestVoiceRecording: (patientId) => 
    api.get(`/voice/patient/${patientId}/latest`),
  
  updateVoiceRecording: (id, data) => 
    api.put(`/voice/${id}`, data),
  
  deleteVoiceRecording: (id) => 
    api.delete(`/voice/${id}`)
};

// Legacy compatibility exports
export const getAppointments = async (doctorId) => {
  const response = await appointmentAPI.getAllAppointments({ doctor_id: doctorId });
  return response.data;
};

export const getPatientSummary = async (patientId) => {
  const response = await voiceAPI.getLatestVoiceRecording(patientId);
  return response.data;
};

export const savePrescription = async (appointmentId, prescriptionData) => {
  const response = await prescriptionAPI.createPrescription({
    appointment_id: appointmentId,
    ...prescriptionData
  });
  return response.data;
};

export default api;
