import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  patients: [],
  incidents: [],
  loading: false,
  error: null,
};

const mockData = {
  users: [
    { id: "1", role: "Admin", email: "admin@entnt.in", password: "admin123", name: "Dr. Smith" },
    { id: "2", role: "Patient", email: "john@entnt.in", password: "patient123", patientId: "p1", name: "John Doe" },
    { id: "3", role: "Patient", email: "jane@entnt.in", password: "patient123", patientId: "p2", name: "Jane Smith" }
  ],
  patients: [
    {
      id: "p1",
      name: "John Doe",
      dob: "1990-05-10",
      contact: "1234567890",
      email: "john@entnt.in",
      address: "123 Main St, City",
      healthInfo: "No known allergies. Previous dental work includes fillings."
    },
    {
      id: "p2",
      name: "Jane Smith",
      dob: "1985-03-15",
      contact: "0987654321",
      email: "jane@entnt.in",
      address: "456 Oak Ave, City",
      healthInfo: "Allergic to latex. History of gum disease."
    },
    {
      id: "p3",
      name: "Mike Johnson",
      dob: "1995-08-22",
      contact: "5551234567",
      email: "mike@entnt.in",
      address: "789 Pine St, City",
      healthInfo: "No allergies. Regular cleanings."
    }
  ],
  incidents: [
    {
      id: "i1",
      patientId: "p1",
      title: "Toothache Treatment",
      description: "Upper molar pain requiring root canal",
      comments: "Patient reports sensitivity to cold and hot liquids",
      appointmentDate: "2025-07-01T10:00:00",
      cost: 450,
      treatment: "Root canal therapy on tooth #14",
      status: "Completed",
      nextDate: "2025-08-01T10:00:00",
      files: [
        { id: "f1", name: "invoice.pdf", url: "data:application/pdf;base64,sample", type: "application/pdf" },
        { id: "f2", name: "xray.png", url: "data:image/png;base64,sample", type: "image/png" }
      ]
    },
    {
      id: "i2",
      patientId: "p1",
      title: "Regular Cleaning",
      description: "6-month routine cleaning and checkup",
      comments: "Good oral hygiene maintained",
      appointmentDate: "2025-07-15T14:00:00",
      cost: 120,
      treatment: "Professional cleaning and fluoride treatment",
      status: "Scheduled",
      nextDate: "2026-01-15T14:00:00",
      files: []
    },
    {
      id: "i3",
      patientId: "p2",
      title: "Crown Replacement",
      description: "Replace old crown on molar",
      comments: "Crown showing signs of wear",
      appointmentDate: "2025-07-08T09:00:00",
      cost: 800,
      treatment: "Ceramic crown replacement",
      status: "In Progress",
      nextDate: "2025-07-22T09:00:00",
      files: []
    },
    {
      id: "i4",
      patientId: "p3",
      title: "Wisdom Tooth Extraction",
      description: "Remove impacted wisdom tooth",
      comments: "Local anesthesia required",
      appointmentDate: "2025-07-12T11:00:00",
      cost: 300,
      treatment: "Surgical extraction",
      status: "Scheduled",
      nextDate: null,
      files: []
    }
  ]
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'SET_PATIENTS':
      return { ...state, patients: action.payload };
    case 'ADD_PATIENT':
      return { ...state, patients: [...state.patients, action.payload] };
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    case 'DELETE_PATIENT':
      return {
        ...state,
        patients: state.patients.filter(p => p.id !== action.payload),
        incidents: state.incidents.filter(i => i.patientId !== action.payload)
      };
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload };
    case 'ADD_INCIDENT':
      return { ...state, incidents: [...state.incidents, action.payload] };
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(i => 
          i.id === action.payload.id ? action.payload : i
        )
      };
    case 'DELETE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.filter(i => i.id !== action.payload)
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    initializeData();
    loadUserFromStorage();
  }, []);

  const initializeData = () => {
    if (!localStorage.getItem('dentalApp_patients')) {
      localStorage.setItem('dentalApp_patients', JSON.stringify(mockData.patients));
      localStorage.setItem('dentalApp_incidents', JSON.stringify(mockData.incidents));
      localStorage.setItem('dentalApp_users', JSON.stringify(mockData.users));
    }
    
    const patients = JSON.parse(localStorage.getItem('dentalApp_patients') || '[]');
    const incidents = JSON.parse(localStorage.getItem('dentalApp_incidents') || '[]');
    
    dispatch({ type: 'SET_PATIENTS', payload: patients });
    dispatch({ type: 'SET_INCIDENTS', payload: incidents });
  };

  const loadUserFromStorage = () => {
    const userData = localStorage.getItem('dentalApp_user');
    if (userData) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(userData) });
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const users = JSON.parse(localStorage.getItem('dentalApp_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const userData = { ...user };
        delete userData.password;
        localStorage.setItem('dentalApp_user', JSON.stringify(userData));
        dispatch({ type: 'SET_USER', payload: userData });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('dentalApp_user');
    dispatch({ type: 'LOGOUT' });
  };

  const addPatient = (patient) => {
    const newPatient = { ...patient, id: `p${Date.now()}` };
    const updatedPatients = [...state.patients, newPatient];
    localStorage.setItem('dentalApp_patients', JSON.stringify(updatedPatients));
    dispatch({ type: 'ADD_PATIENT', payload: newPatient });
  };

  const updatePatient = (patient) => {
    const updatedPatients = state.patients.map(p => p.id === patient.id ? patient : p);
    localStorage.setItem('dentalApp_patients', JSON.stringify(updatedPatients));
    dispatch({ type: 'UPDATE_PATIENT', payload: patient });
  };

  const deletePatient = (patientId) => {
    const updatedPatients = state.patients.filter(p => p.id !== patientId);
    const updatedIncidents = state.incidents.filter(i => i.patientId !== patientId);
    localStorage.setItem('dentalApp_patients', JSON.stringify(updatedPatients));
    localStorage.setItem('dentalApp_incidents', JSON.stringify(updatedIncidents));
    dispatch({ type: 'DELETE_PATIENT', payload: patientId });
  };

  const addIncident = (incident) => {
    const newIncident = { ...incident, id: `i${Date.now()}`, files: [] };
    const updatedIncidents = [...state.incidents, newIncident];
    localStorage.setItem('dentalApp_incidents', JSON.stringify(updatedIncidents));
    dispatch({ type: 'ADD_INCIDENT', payload: newIncident });
  };

  const updateIncident = (incident) => {
    const updatedIncidents = state.incidents.map(i => i.id === incident.id ? incident : i);
    localStorage.setItem('dentalApp_incidents', JSON.stringify(updatedIncidents));
    dispatch({ type: 'UPDATE_INCIDENT', payload: incident });
  };

  const deleteIncident = (incidentId) => {
    const updatedIncidents = state.incidents.filter(i => i.id !== incidentId);
    localStorage.setItem('dentalApp_incidents', JSON.stringify(updatedIncidents));
    dispatch({ type: 'DELETE_INCIDENT', payload: incidentId });
  };

  const value = {
    ...state,
    login,
    logout,
    addPatient,
    updatePatient,
    deletePatient,
    addIncident,
    updateIncident,
    deleteIncident,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};