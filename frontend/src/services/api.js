import axiosInstance from '../api/axios';

export const fetchProducts = () => axiosInstance.get('/api/products/');
export const fetchSales = () => axiosInstance.get('/api/sales/');
export const fetchAnomalies = () => axiosInstance.get('/api/anomalies/');
export const fetchAlerts = () => axiosInstance.get('/api/alerts/');

export default axiosInstance;