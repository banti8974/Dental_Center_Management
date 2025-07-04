import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';

function Dashboard() {
  const { user, patients, incidents } = useApp();

  const dashboardData = useMemo(() => {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const upcomingAppointments = incidents
      .filter(incident => {
        const appointmentDate = new Date(incident.appointmentDate);
        return isAfter(appointmentDate, now) && isBefore(appointmentDate, nextWeek);
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 10);

    const completedTreatments = incidents.filter(i => i.status === 'Completed').length;
    const pendingTreatments = incidents.filter(i => i.status !== 'Completed').length;
    
    const monthlyRevenue = incidents
      .filter(incident => {
        const appointmentDate = new Date(incident.appointmentDate);
        return appointmentDate >= thisMonth && appointmentDate < nextMonth && incident.status === 'Completed';
      })
      .reduce((sum, incident) => sum + (incident.cost || 0), 0);

    const patientStats = patients.map(patient => {
      const patientIncidents = incidents.filter(i => i.patientId === patient.id);
      const totalSpent = patientIncidents
        .filter(i => i.status === 'Completed')
        .reduce((sum, i) => sum + (i.cost || 0), 0);
      
      return {
        ...patient,
        totalIncidents: patientIncidents.length,
        totalSpent,
        lastVisit: patientIncidents
          .filter(i => i.status === 'Completed')
          .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0]?.appointmentDate
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

    return {
      totalPatients: patients.length,
      upcomingAppointments,
      completedTreatments,
      pendingTreatments,
      monthlyRevenue,
      topPatients: patientStats
    };
  }, [patients, incidents]);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 ${trend === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className="bg-primary-50 p-3 rounded-full">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
    </div>
  );

  if (user?.role === 'Patient') {
    const patientIncidents = incidents.filter(i => i.patientId === user.patientId);
    const upcomingPatientAppointments = patientIncidents
      .filter(i => isAfter(new Date(i.appointmentDate), new Date()))
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    
    const completedPatientTreatments = patientIncidents.filter(i => i.status === 'Completed');
    const totalSpent = completedPatientTreatments.reduce((sum, i) => sum + (i.cost || 0), 0);

    return (
      <div className="space-y-6 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="mt-1 text-sm text-gray-500">Here's your dental care overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Upcoming Appointments"
            value={upcomingPatientAppointments.length}
            icon={Calendar}
          />
          <StatCard
            title="Completed Treatments"
            value={completedPatientTreatments.length}
            icon={CheckCircle}
          />
          <StatCard
            title="Total Spent"
            value={`$${totalSpent.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Health Score"
            value="Good"
            icon={Activity}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
            {upcomingPatientAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingPatientAppointments.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{incident.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(incident.appointmentDate), 'MMM dd, yyyy - h:mm a')}
                      </p>
                    </div>
                    <div className={`status-badge status-${incident.status.toLowerCase().replace(' ', '')}`}>
                      {incident.status}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Treatments</h3>
            {completedPatientTreatments.length > 0 ? (
              <div className="space-y-3">
                {completedPatientTreatments.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{incident.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(incident.appointmentDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${incident.cost}</p>
                      <div className="status-badge status-completed">Completed</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No completed treatments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, Dr. {user?.name}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={dashboardData.totalPatients}
          icon={Users}
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Pending Treatments"
          value={dashboardData.pendingTreatments}
          icon={AlertCircle}
        />
        <StatCard
          title="Completed This Month"
          value={dashboardData.completedTreatments}
          icon={CheckCircle}
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${dashboardData.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          trendValue="+15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Next 10 Appointments</h3>
          {dashboardData.upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingAppointments.map((incident) => {
                const patient = patients.find(p => p.id === incident.patientId);
                return (
                  <div key={incident.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{patient?.name}</p>
                      <p className="text-xs text-gray-500">{incident.title}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(incident.appointmentDate), 'MMM dd, h:mm a')}
                      </p>
                    </div>
                    <div className={`status-badge status-${incident.status.toLowerCase().replace(' ', '')}`}>
                      {incident.status}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Patients</h3>
          {dashboardData.topPatients.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.topPatients.map((patient, index) => (
                <div key={patient.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-500">{patient.totalIncidents} treatments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${patient.totalSpent.toLocaleString()}</p>
                    {patient.lastVisit && (
                      <p className="text-xs text-gray-500">
                        Last: {format(new Date(patient.lastVisit), 'MMM dd')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No patient data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;