import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Alert
} from '@mui/material';

const CustomerMetrics = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log('Fetching customers...');
        const response = await axios.get('http://localhost:8000/api/data/get_customers/');
        console.log('Customers response:', response.data);
        setCustomers(response.data.results || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError('Failed to load customers');
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerChange = async (event) => {
    const customerKey = event.target.value;
    setSelectedCustomer(customerKey);
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching metrics for customer:', customerKey);
      const response = await axios.get(`http://localhost:8000/api/data/customer_metrics/?customer_key=${customerKey}`);
      console.log('Metrics response:', response.data);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Select Customer</InputLabel>
          <Select
            value={selectedCustomer}
            onChange={handleCustomerChange}
            label="Select Customer"
          >
            {customers.map((customer) => (
              <MenuItem 
                key={customer.CUSTOMER_KEY} 
                value={customer.CUSTOMER_KEY}
              >
                {`${customer.CUSTOMERFNAME} ${customer.CUSTOMERLNAME}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Typography>Loading metrics...</Typography>
      )}

      {metrics && !loading && (
        <Grid container spacing={3}>
          {/* Favorite Sandwich */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Favorite Sandwich
                </Typography>
                <Typography variant="h5" component="div">
                  {metrics.favorite_sandwich?.SANDWICH || 'N/A'}
                </Typography>
                <Typography color="textSecondary">
                  Ordered {metrics.favorite_sandwich?.SANDWICH_COUNT || 0} times
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Favorite Side */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Favorite Side
                </Typography>
                <Typography variant="h5" component="div">
                  {metrics.favorite_side?.SIDE || 'N/A'}
                </Typography>
                <Typography color="textSecondary">
                  Ordered {metrics.favorite_side?.SIDE_COUNT || 0} times
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Inches */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Inches of Sandwich
                </Typography>
                <Typography variant="h5" component="div">
                  {metrics.total_inches?.INCHES_OF_SANDWICH || 0} inches
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Most Visited Store */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Most Visited Store
                </Typography>
                <Typography variant="h5" component="div">
                  {metrics.most_visited_store?.MOST_VISITED_COUNT || 0} visits
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Favorite Month */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Favorite Month
                </Typography>
                <Typography variant="h5" component="div">
                  {metrics.favorite_month?.MONTH || 'N/A'}
                </Typography>
                <Typography color="textSecondary">
                  {metrics.favorite_month?.NUMOFVISITS || 0} visits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CustomerMetrics; 