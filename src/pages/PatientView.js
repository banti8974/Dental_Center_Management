import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Download, 
  CheckCircle,
  AlertCircle,
  Activity,
  User,
  Phone,
  Mail
} from 'lucide-react';

function PatientView() {
  const { user, patients, incidents } = useApp();

  const patientData = useMemo(() => {
    const patient = patients.find(p => p.id === user.patientId);
    if (!patient) return null;

    const patientIncidents = incidents.filter(i => i.patientId === user.patientId);
    
    const now = new Date();
    const nextWeek = addDays(now, 7);
    
    const upcomingAppointments = patientIncidents
      .filter(incident => {
        const appointmentDate = new Date(incident.appointmentDate);
        return isAfter(appointmentDate, now);
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    const pastAppointments = patientIncidents
      .filter(incident => {
        const appointmentDate = new Date(incident.appointmentDate);
        return isBefore(appointmentDate, now) || incident.status === 'Completed';
      })
      .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    const totalSpent = patientIncidents
      .filter(i => i.status === 'Completed')
      .reduce((sum, i) => sum + (i.cost || 0), 0);

    const nextAppointment = upcomingAppointments[0];

    return {
      patient,
      allIncidents: patientIncidents,
      upcomingAppointments,
      pastAppointments,
      totalSpent,
      nextAppointment,
      totalTreatments: patientIncidents.length,
      completedTreatments: patientIncidents.filter(i => i.status === 'Completed').length
    };
  }, [user.patientId, patients, incidents]);

  const handleFileDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!patientData || !patientData.patient) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Data Not Found</h3>
          <p className="text-gray-500">Unable to load your patient information.</p>
        </div>
      </div>
    );
  }

  const { patient, upcomingAppointments, pastAppointments, totalSpent, nextAppointment, totalTreatments, completedTreatments } = patientData;

  const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`bg-${color}-50 p-3 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dental Care</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {patient.name}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Patient since {format(new Date(patient.dob), 'yyyy')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Next Appointment"
          value={nextAppointment ? format(new Date(nextAppointment.appointmentDate), 'MMM dd') : 'None'}
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Total Treatments"
          value={totalTreatments}
          icon={Activity}
          color="success"
        />
        <StatCard
          title="Completed"
          value={completedTreatments}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Total Spent"
          value={`$${totalSpent.toLocaleString()}`}
          icon={DollarSign}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {nextAppointment && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Appointment</h3>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-primary-900">{nextAppointment.title}</h4>
                    <p className="text-sm text-primary-700 mt-1">{nextAppointment.description}</p>
                    <div className="flex items-center mt-3 space-x-4">
                      <div className="flex items-center text-sm text-primary-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(nextAppointment.appointmentDate), 'EEEE, MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-sm text-primary-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(nextAppointment.appointmentDate), 'h:mm a')}
                      </div>
                    </div>
                    {nextAppointment.comments && (
                      <p className="text-sm text-primary-600 mt-2">
                        <span className="font-medium">Note:</span> {nextAppointment.comments}
                      </p>
                    )}
                  </div>
                  <div className={`status-badge status-${nextAppointment.status.toLowerCase().replace(' ', '')}`}>
                    {nextAppointment.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(appointment.appointmentDate), 'h:mm a')}
                          </div>
                        </div>
                        {appointment.cost && appointment.cost > 0 && (
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${appointment.cost}
                          </div>
                        )}
                      </div>
                      <div className={`status-badge status-${appointment.status.toLowerCase().replace(' ', '')}`}>
                        {appointment.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment History</h3>
            {pastAppointments.length > 0 ? (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                        <p className="text-sm text-gray-600">{appointment.description}</p>
                      </div>
                      <div className={`status-badge status-${appointment.status.toLowerCase().replace(' ', '')}`}>
                        {appointment.status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center text-gray-500 mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy - h:mm a')}
                        </div>
                        {appointment.cost && appointment.cost > 0 && (
                          <div className="flex items-center text-gray-500">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${appointment.cost}
                          </div>
                        )}
                      </div>
                      <div>
                        {appointment.treatment && (
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Treatment:</span> {appointment.treatment}
                          </p>
                        )}
                        {appointment.nextDate && (
                          <p className="text-gray-600">
                            <span className="font-medium">Next Visit:</span> {format(new Date(appointment.nextDate), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {appointment.comments && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Comments:</span> {appointment.comments}
                        </p>
                      </div>
                    )}
                    
                    {appointment.files && appointment.files.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-900 mb-2">Documents:</p>
                        <div className="space-y-2">
                          {appointment.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-700">{file.name}</span>
                              </div>
                              <button
                                onClick={() => handleFileDownload(file)}
                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No treatment history available</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Full Name</p>
                    <p className="text-sm text-gray-600">{patient.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                    <p className="text-sm text-gray-600">{format(new Date(patient.dob), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{patient.contact}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{patient.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{patient.healthInfo}</p>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Visits</span>
                  <span className="text-sm font-medium text-gray-900">{totalTreatments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-success-600">{completedTreatments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <span className="text-sm font-medium text-warning-600">{upcomingAppointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="text-sm font-medium text-gray-900">${totalSpent.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {upcomingAppointments.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Reminders</h3>
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((appointment) => {
                    const appointmentDate = new Date(appointment.appointmentDate);
                    const now = new Date();
                    const daysUntil = Math.ceil((appointmentDate - now) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={appointment.id} className="flex items-center p-3 bg-warning-50 border border-warning-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-warning-600 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-warning-900">{appointment.title}</p>
                          <p className="text-xs text-warning-700">
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientView;