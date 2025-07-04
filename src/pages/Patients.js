import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  User,
  X,
  Save,
  FileText
} from 'lucide-react';

function Patients() {
  const { patients, incidents, addPatient, updatePatient, deletePatient, addIncident, updateIncident, deleteIncident } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingIncident, setEditingIncident] = useState(null);
  const [patientForm, setPatientForm] = useState({
    name: '',
    dob: '',
    contact: '',
    email: '',
    address: '',
    healthInfo: ''
  });
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    comments: '',
    appointmentDate: '',
    cost: '',
    treatment: '',
    status: 'Scheduled',
    nextDate: ''
  });

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    if (editingPatient) {
      updatePatient({ ...patientForm, id: editingPatient.id });
    } else {
      addPatient(patientForm);
    }
    resetPatientForm();
  };

  const handleIncidentSubmit = (e) => {
    e.preventDefault();
    const incidentData = {
      ...incidentForm,
      patientId: selectedPatient.id,
      cost: parseFloat(incidentForm.cost) || 0
    };
    
    if (editingIncident) {
      updateIncident({ ...incidentData, id: editingIncident.id });
    } else {
      addIncident(incidentData);
    }
    resetIncidentForm();
  };

  const resetPatientForm = () => {
    setPatientForm({
      name: '',
      dob: '',
      contact: '',
      email: '',
      address: '',
      healthInfo: ''
    });
    setEditingPatient(null);
    setShowPatientModal(false);
  };

  const resetIncidentForm = () => {
    setIncidentForm({
      title: '',
      description: '',
      comments: '',
      appointmentDate: '',
      cost: '',
      treatment: '',
      status: 'Scheduled',
      nextDate: ''
    });
    setEditingIncident(null);
    setShowIncidentModal(false);
  };

  const openPatientModal = (patient = null) => {
    if (patient) {
      setPatientForm(patient);
      setEditingPatient(patient);
    }
    setShowPatientModal(true);
  };

  const openIncidentModal = (incident = null) => {
    if (incident) {
      setIncidentForm({
        ...incident,
        appointmentDate: incident.appointmentDate ? incident.appointmentDate.slice(0, 16) : '',
        nextDate: incident.nextDate ? incident.nextDate.slice(0, 16) : '',
        cost: incident.cost?.toString() || ''
      });
      setEditingIncident(incident);
    }
    setShowIncidentModal(true);
  };

  const handleDeletePatient = (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This will also delete all their appointments.')) {
      deletePatient(patientId);
      if (selectedPatient?.id === patientId) {
        setSelectedPatient(null);
      }
    }
  };

  const handleDeleteIncident = (incidentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteIncident(incidentId);
    }
  };

  const getPatientIncidents = (patientId) => {
    return incidents.filter(incident => incident.patientId === patientId)
      .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage patients and their appointments</p>
        </div>
        <button
          onClick={() => openPatientModal()}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Patients</h3>
              <span className="text-sm text-gray-500">{filteredPatients.length} total</span>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedPatient?.id === patient.id
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{patient.name}</h4>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPatientModal(patient);
                        }}
                        className="p-1 text-gray-400 hover:text-primary-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient.id);
                        }}
                        className="p-1 text-gray-400 hover:text-danger-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-3 rounded-full mr-4">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h3>
                      <p className="text-sm text-gray-500">Patient Details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openIncidentModal()}
                    className="btn btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Appointment
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                        <p className="text-sm text-gray-600">{format(new Date(selectedPatient.dob), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Contact</p>
                        <p className="text-sm text-gray-600">{selectedPatient.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Address</p>
                      <p className="text-sm text-gray-600">{selectedPatient.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Health Information</p>
                      <p className="text-sm text-gray-600">{selectedPatient.healthInfo}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Appointments History</h4>
                <div className="space-y-3">
                  {getPatientIncidents(selectedPatient.id).map((incident) => (
                    <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <h5 className="font-medium text-gray-900">{incident.title}</h5>
                          <div className={`ml-3 status-badge status-${incident.status.toLowerCase().replace(' ', '')}`}>
                            {incident.status}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openIncidentModal(incident)}
                            className="p-1 text-gray-400 hover:text-primary-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIncident(incident.id)}
                            className="p-1 text-gray-400 hover:text-danger-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Date:</span> {format(new Date(incident.appointmentDate), 'MMM dd, yyyy - h:mm a')}
                          </p>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Cost:</span> ${incident.cost}
                          </p>
                          {incident.nextDate && (
                            <p className="text-gray-600">
                              <span className="font-medium">Next Visit:</span> {format(new Date(incident.nextDate), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Description:</span> {incident.description}
                          </p>
                          {incident.treatment && (
                            <p className="text-gray-600 mb-1">
                              <span className="font-medium">Treatment:</span> {incident.treatment}
                            </p>
                          )}
                          {incident.comments && (
                            <p className="text-gray-600">
                              <span className="font-medium">Comments:</span> {incident.comments}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {incident.files && incident.files.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-900 mb-2">Attachments:</p>
                          <div className="flex flex-wrap gap-2">
                            {incident.files.map((file, index) => (
                              <div key={index} className="flex items-center px-2 py-1 bg-gray-100 rounded text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {file.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {getPatientIncidents(selectedPatient.id).length === 0 && (
                    <div className="text-center py-6">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No appointments found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-500">Choose a patient from the list to view their details and appointments</p>
            </div>
          )}
        </div>
      </div>

      {showPatientModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetPatientForm} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handlePatientSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                    </h3>
                    <button
                      type="button"
                      onClick={resetPatientForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={patientForm.name}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          required
                          className="form-input"
                          value={patientForm.dob}
                          onChange={(e) => setPatientForm(prev => ({ ...prev, dob: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                        <input
                          type="tel"
                          required
                          className="form-input"
                          value={patientForm.contact}
                          onChange={(e) => setPatientForm(prev => ({ ...prev, contact: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        className="form-input"
                        value={patientForm.email}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        className="form-input"
                        value={patientForm.address}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Health Information</label>
                      <textarea
                        rows="3"
                        className="form-textarea"
                        placeholder="Allergies, medical history, etc."
                        value={patientForm.healthInfo}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, healthInfo: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary sm:ml-3">
                    <Save className="h-4 w-4 mr-2" />
                    {editingPatient ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={resetPatientForm}
                    className="btn btn-secondary mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showIncidentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetIncidentForm} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleIncidentSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingIncident ? 'Edit Appointment' : 'Add New Appointment'}
                    </h3>
                    <button
                      type="button"
                      onClick={resetIncidentForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={incidentForm.title}
                        onChange={(e) => setIncidentForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows="3"
                        required
                        className="form-textarea"
                        value={incidentForm.description}
                        onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          className="form-input"
                          value={incidentForm.appointmentDate}
                          onChange={(e) => setIncidentForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          className="form-select"
                          value={incidentForm.status}
                          onChange={(e) => setIncidentForm(prev => ({ ...prev, status: e.target.value }))}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-input"
                          value={incidentForm.cost}
                          onChange={(e) => setIncidentForm(prev => ({ ...prev, cost: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Appointment</label>
                        <input
                          type="datetime-local"
                          className="form-input"
                          value={incidentForm.nextDate}
                          onChange={(e) => setIncidentForm(prev => ({ ...prev, nextDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
                      <input
                        type="text"
                        className="form-input"
                        value={incidentForm.treatment}
                        onChange={(e) => setIncidentForm(prev => ({ ...prev, treatment: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                      <textarea
                        rows="3"
                        className="form-textarea"
                        value={incidentForm.comments}
                        onChange={(e) => setIncidentForm(prev => ({ ...prev, comments: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn btn-primary sm:ml-3">
                    <Save className="h-4 w-4 mr-2" />
                    {editingIncident ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={resetIncidentForm}
                    className="btn btn-secondary mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;