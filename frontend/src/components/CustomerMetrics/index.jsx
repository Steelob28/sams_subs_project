import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress
} from '@mui/material';
import { getCustomers, getCustomerMetrics } from '../../services/api';

const MetricCard = ({ title, value, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div">
        {value}
      </Typography>
      {subtitle && (
        <Typography color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const CustomerMetrics = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data.results);
      } catch (error) {
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
      const data = await getCustomerMetrics(customerKey);
      setMetrics(data);
    } catch (error) {
      setError('Failed to load customer metrics');
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
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {metrics && !loading && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <MetricCard
              title="Favorite Sandwich"
              value={metrics.favorite_sandwich?.SANDWICH || 'N/A'}
              subtitle={`Ordered ${metrics.favorite_sandwich?.SANDWICH_COUNT || 0} times`}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <MetricCard
              title="Favorite Side"
              value={metrics.favorite_side?.SIDE || 'N/A'}
              subtitle={`Ordered ${metrics.favorite_side?.SIDE_COUNT || 0} times`}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <MetricCard
              title="Total Inches of Sandwich"
              value={`${metrics.total_inches?.INCHES_OF_SANDWICH || 0} inches`}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <MetricCard
              title="Most Visited Store"
              value={`${metrics.most_visited_store?.MOST_VISITED_COUNT || 0} visits`}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <MetricCard
              title="Favorite Month"
              value={metrics.favorite_month?.MONTH || 'N/A'}
              subtitle={`${metrics.favorite_month?.NUMOFVISITS || 0} visits`}
            />
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CustomerMetrics; 