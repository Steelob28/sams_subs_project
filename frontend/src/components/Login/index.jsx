import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import axios from 'axios';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.get(`http://localhost:8000/api/data/get_customer_by_phone/?phone=${phone}`);
      if (response.data) {
        localStorage.setItem('customerData', JSON.stringify(response.data));
        navigate('/metrics');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Phone number not found. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

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
        maxWidth="sm"
        sx={{ 
          position: 'relative',
          zIndex: 1 
        }}
      >
        <Box sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center'
        }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              width: '100%',
              background: 'white',
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(209, 32, 49, 0.15)',
            }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              align="center" 
              gutterBottom
              sx={{
                color: '#D12031',
                fontWeight: 'bold'
              }}
            >
              Sam's Subs Customer Portal
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                margin="normal"
                placeholder="Enter your phone number"
                required
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                View My Metrics
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login; 