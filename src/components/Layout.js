import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  Users, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Stethoscope,
  Clock
} from 'lucide-react';

function Layout({ children }) {
  const { user, logout } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = user?.role === 'Admin' ? [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ] : [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'My Appointments', href: '/my-appointments', icon: Clock },
  ];

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:flex">
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-6 bg-primary-600">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-semibold text-white">DentalCare</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-8">
            <div className="px-6 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="absolute bottom-0 w-full p-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 lg:pl-0">
          <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
            <div className="flex items-center justify-between h-16 px-4">
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <Stethoscope className="h-6 w-6 text-primary-600" />
                <span className="ml-2 text-lg font-semibold text-gray-900">DentalCare</span>
              </div>
              <div className="w-6"></div>
            </div>
          </header>

          <main className="flex-1">
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;