import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

export const getCustomers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/data/get_customers/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch customers');
  }
};

export const getCustomerMetrics = async (customerKey) => {
  try {
    const response = await axios.get(`${BASE_URL}/data/customer_metrics/?customer_key=${customerKey}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch customer metrics');
  }
}; 