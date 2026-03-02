import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    timeout: 60000, // 60 seconds to allow for Render cold starts
});

// Response interceptor for clear feedback on cold starts
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            error.message = 'The server is still waking up (Render Free Tier). Please try again in 10 seconds.';
        }
        return Promise.reject(error);
    }
);

// Attach JWT token to every request if logged in
API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('ntk_user') || 'null');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// ---- Auth ----
export const login          = (data) => API.post('/api/auth/login', data);
export const register       = (data) => API.post('/api/auth/register', data);
export const getMyProfile   = ()     => API.get('/api/auth/profile');
export const updateUser     = (formData) => API.put('/api/auth/profile', formData);


// ---- JobSeeker ----
export const getJobSeekerProfile  = ()     => API.get('/api/jobseekers/profile');
export const updateJobSeekerProfile = (data) => API.put('/api/jobseekers/profile', data);
export const uploadDocument        = (formData) => API.post('/api/jobseekers/upload', formData);
export const getPendingRequests   = ()     => API.get('/api/jobseekers/requests');
export const approveAccessRequest = (data) => API.post('/api/jobseekers/approve-request', data);
export const rejectAccessRequest  = (data) => API.post('/api/jobseekers/reject-request', data);

// ---- Employer ----
export const searchTalent      = (params) => API.get('/api/employers/search', { params });
export const requestAccess      = (data)  => API.post('/api/employers/request-access', data);
export const getMyAccessRequests= ()      => API.get('/api/employers/requests');
export const getAvailableTitles = ()      => API.get('/api/employers/available-titles');

// ---- Admin ----
export const getAdminStats              = ()      => API.get('/api/admin/stats');
export const getPendingDocuments        = ()      => API.get('/api/admin/documents');
export const verifyDocument             = (id, data) => API.put(`/api/admin/documents/${id}`, data);
export const getAllJobSeekers           = ()      => API.get('/api/admin/jobseekers');
export const toggleJobSeekerVerification = (id)  => API.put(`/api/admin/jobseekers/${id}/verify`);
export const getAllEmployers            = ()      => API.get('/api/admin/employers');
export const getAllUsers                = ()      => API.get('/api/admin/users');
export const updateAnyUser             = (id, data) => API.put(`/api/admin/users/${id}`, data);
export const deleteUser                = (id)    => API.delete(`/api/admin/users/${id}`);

export default API;
