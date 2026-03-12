import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAvailableDoctors = async () => {
  const response = await apiClient.get('/doctors');
  return response.data;
};

export const bookAppointment = async (appointmentData) => {
  const response = await apiClient.post('/appointments', appointmentData);
  return response.data;
};

export const getPatientAppointments = async (patientId) => {
  const response = await apiClient.get(`/appointments/patient/${patientId}`);
  return response.data;
};

export const submitVoiceRecording = async (patientId, audioFile) => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  const response = await apiClient.post(`/voice-recording/${patientId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default apiClient;
