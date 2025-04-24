import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  CircularProgress,
  Stack,
  useTheme
} from '@mui/material';

const MetricCard = ({ title, value, subtitle }) => {
  return (
    <Card 
      sx={{ 
        width: '100%',
        background: 'white',
        borderLeft: '6px solid #D12031',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: '0 8px 24px rgba(209, 32, 49, 0.15)',
        },
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: '#D12031',
            mb: 2 
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 1, 
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: '#666666'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  // Subtract 1 since array is 0-based and our months are 1-based
  return months[parseInt(monthNumber) - 1] || 'N/A';
};

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const storedData = localStorage.getItem('customerData');
    if (!storedData) {
      navigate('/');
      return;
    }

    const customer = JSON.parse(storedData);
    setCustomerData(customer);
    fetchMetrics(customer.CUSTOMER_KEY);
  }, [navigate]);

  const fetchMetrics = async (customerKey) => {
    try {
      console.log('Fetching metrics for customer:', customerKey); // Debug log
      const response = await axios.get(`http://localhost:8000/api/data/customer_metrics/?customer_key=${customerKey}`);
      console.log('Metrics response:', response.data); // Debug log
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error); // Debug log
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerData');
    navigate('/');
  };

  if (loading) {
    return (
      <Container sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `
          repeating-conic-gradient(
            #FFFFFF 0% 25%,
            #FFE5E5 25% 50%,
            #FFFFFF 50% 75%,
            #FFD6D6 75% 100%
          ) 50% / 50px 50px
        `,
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.3)',
          zIndex: 0
        }
      }}
    >
      <Container 
        maxWidth="md" 
        sx={{ 
          position: 'relative',
          zIndex: 1 
        }}
      >
        {/* Header Card */}
        <Card 
          sx={{ 
            mb: 4, 
            background: '#D12031',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(209, 32, 49, 0.2)',
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative'
            }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'white',
                  mb: 2
                }}
              >
                HEY {customerData?.CUSTOMERFNAME}!
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.4,
                  mb: 2
                }}
              >
                2023 WAS STACKED.
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: 1.6,
                  fontWeight: 'normal'
                }}
              >
                Thanks for eating your way through Sam's Subs this year. Let's take a tasty trip down memory lane!
              </Typography>
              <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
                <Button 
                  variant="contained" 
                  onClick={handleLogout}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: 'white',
                    color: '#D12031',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Metrics Stack */}
        <Stack spacing={3}>
          <MetricCard
            title="Favorite Sandwich"
            value={metrics?.favorite_sandwich?.SANDWICH || 'N/A'}
            subtitle={`Ordered ${metrics?.favorite_sandwich?.SANDWICH_COUNT || 0} times`}
          />
          <MetricCard
            title="Favorite Side"
            value={metrics?.favorite_side?.SIDE || 'N/A'}
            subtitle={`Ordered ${metrics?.favorite_side?.SIDE_COUNT || 0} times`}
          />
          <MetricCard
            title="Total Inches of Sandwich"
            value={`${metrics?.total_inches?.INCHES_OF_SANDWICH || 0} inches`}
          />
          <MetricCard
            title="Most Visited Store"
            value={metrics?.most_visited_store?.CITY || 'N/A'}
            subtitle={`Your go-to spot with ${metrics?.most_visited_store?.MOST_VISITED_COUNT || 0} visits`}
          />
          <MetricCard
            title="Favorite Month"
            value={getMonthName(metrics?.favorite_month?.MONTH) || 'N/A'}
            subtitle={`You visited ${metrics?.favorite_month?.NUMOFVISITS || 0} times`}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default CustomerDashboard; 