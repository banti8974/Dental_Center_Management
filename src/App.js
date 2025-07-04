import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Calendar from './pages/Calendar';
import PatientView from './pages/PatientView';
import Layout from './components/Layout';
import './App.css';

function AppRoutes() {
  const { user } = useApp();

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {user.role === 'Admin' && (
          <>
            <Route path="/patients" element={<Patients />} />
            <Route path="/calendar" element={<Calendar />} />
          </>
        )}
        {user.role === 'Patient' && (
          <Route path="/my-appointments" element={<PatientView />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <div className="App">
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </div>
  );
}

export default App;