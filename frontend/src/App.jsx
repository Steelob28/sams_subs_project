import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './components/Login';
import CustomerDashboard from './components/CustomerDashboard';

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
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
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