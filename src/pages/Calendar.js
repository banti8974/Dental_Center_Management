import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';

function Calendar() {
  const { patients, incidents } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewType, setViewType] = useState('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const appointmentsByDate = useMemo(() => {
    const grouped = {};
    incidents.forEach(incident => {
      const date = format(new Date(incident.appointmentDate), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(incident);
    });
    return grouped;
  }, [incidents]);

  const getAppointmentsForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return appointmentsByDate[dateKey] || [];
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success-500';
      case 'scheduled':
        return 'bg-warning-500';
      case 'in progress':
        return 'bg-primary-500';
      case 'cancelled':
        return 'bg-danger-500';
      default:
        return 'bg-gray-500';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const WeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-1 bg-gray-200 border border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 p-2 font-medium text-sm text-gray-600 text-center">
            {day}
          </div>
        ))}
        {weekDays.map(day => {
          const appointments = getAppointmentsForDate(day);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`bg-white min-h-32 p-2 border-r border-b border-gray-200 ${
                isCurrentDay ? 'bg-primary-50' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${
                isCurrentDay ? 'text-primary-600' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {appointments.slice(0, 3).map(appointment => (
                  <div
                    key={appointment.id}
                    className="text-xs p-1 rounded bg-primary-100 text-primary-800 cursor-pointer hover:bg-primary-200"
                    onClick={() => setSelectedDate(day)}
                  >
                    {format(new Date(appointment.appointmentDate), 'HH:mm')} - {appointment.title}
                  </div>
                ))}
                {appointments.length > 3 && (
                  <div className="text-xs text-gray-500">+{appointments.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">Manage appointments and schedule</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewType === 'month' 
                  ? 'bg-white text-gray-900 shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewType === 'week' 
                  ? 'bg-white text-gray-900 shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {viewType === 'week' ? (
              <WeekView />
            ) : (
              <div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDays.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="calendar-grid">
                  {calendarDays.map(day => {
                    const appointments = getAppointmentsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`calendar-cell cursor-pointer ${
                          !isCurrentMonth ? 'other-month' : ''
                        } ${isCurrentDay ? 'today' : ''} ${
                          isSelected ? 'ring-2 ring-primary-500' : ''
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="font-medium text-sm mb-1">
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {appointments.slice(0, 2).map(appointment => (
                            <div
                              key={appointment.id}
                              className="flex items-center text-xs"
                            >
                              <div
                                className={`appointment-dot ${appointment.status.toLowerCase().replace(' ', '')}`}
                              />
                              <span className="truncate">
                                {format(new Date(appointment.appointmentDate), 'HH:mm')} {appointment.title}
                              </span>
                            </div>
                          ))}
                          {appointments.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{appointments.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="appointment-dot scheduled mr-2" />
                  <span className="text-sm text-gray-600">Scheduled</span>
                </div>
                <div className="flex items-center">
                  <div className="appointment-dot progress mr-2" />
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center">
                  <div className="appointment-dot completed mr-2" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
              </div>
            </div>

            {selectedDate && (
              <div className="card p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </h3>
                <div className="space-y-3">
                  {getAppointmentsForDate(selectedDate).length > 0 ? (
                    getAppointmentsForDate(selectedDate).map(appointment => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                          <div className={`status-badge status-${appointment.status.toLowerCase().replace(' ', '')}`}>
                            {appointment.status}
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(appointment.appointmentDate), 'h:mm a')}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {getPatientName(appointment.patientId)}
                          </div>
                          <p className="text-gray-600">{appointment.description}</p>
                          {appointment.cost && (
                            <p className="font-medium text-gray-900">${appointment.cost}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No appointments scheduled</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="card p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Appointments</span>
                  <span className="text-sm font-medium text-gray-900">{incidents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-medium text-gray-900">
                    {incidents.filter(i => {
                      const appointmentDate = new Date(i.appointmentDate);
                      return appointmentDate.getMonth() === currentDate.getMonth() &&
                             appointmentDate.getFullYear() === currentDate.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-success-600">
                    {incidents.filter(i => i.status === 'Completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-warning-600">
                    {incidents.filter(i => i.status !== 'Completed' && i.status !== 'Cancelled').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;