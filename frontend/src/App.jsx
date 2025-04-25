import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './components/Login';
import CustomerDashboard from './components/CustomerDashboard';

// First, we'll need to add this font link to your public/index.html:
// <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

const theme = createTheme({
  palette: {
    primary: {
      main: '#D12031', // Sam's Subs red
      light: '#FF3D4D',
      dark: '#A91826',
    },
    secondary: {
      main: '#FFFFFF', // White
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
    h3: {
      fontWeight: 700,
      fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
    },
    h5: {
      fontWeight: 600,
      fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
    },
    h6: {
      fontWeight: 600,
      fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
    },
    subtitle1: {
      fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/metrics" element={<CustomerDashboard />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App; 