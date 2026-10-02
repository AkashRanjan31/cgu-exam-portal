import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UNIVERSITY_INFO } from '../utils/constants';
import {
  GraduationCap,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  ShieldCheck
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar = () => {} }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Emblem & Name */}
          <div className="flex items-center gap-3">
            {/* Sidebar toggle for dashboard screens */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#06264A] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:bg-[#0A3B72] transition-colors">
                <GraduationCap className="w-6 h-6 text-[#F5A623]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#06264A] text-base sm:text-lg tracking-tight leading-none">
                    {UNIVERSITY_INFO.shortName}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#06264A]/10 text-[#06264A] uppercase">
                    Exam Portal
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 hidden sm:block leading-tight mt-0.5">
                  {UNIVERSITY_INFO.name}, {UNIVERSITY_INFO.location}
                </p>
              </div>
            </Link>
          </div>

          {/* Right Navigation & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <>
                {/* Role Badge */}
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span className="capitalize">{user.role} Portal</span>
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-slate-600 hover:text-[#06264A] hover:bg-slate-100 rounded-xl transition-colors relative"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5A623] rounded-full ring-2 ring-white"></span>
                  </button>

                  {/* Dropdown Notification Box */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-xs text-[#06264A] uppercase tracking-wider">Exam Alerts</span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">2 New</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs mt-2 max-h-60 overflow-y-auto">
                        <div className="py-2.5">
                          <p className="font-semibold text-slate-800">Mid-Semester Exam Active</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">Data Structures (CS301) is available for attempt.</p>
                        </div>
                        <div className="py-2.5">
                          <p className="font-semibold text-slate-800">Exam Window Notice</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">Maintain stable connection & ensure fullscreen permissions.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#06264A] text-white font-bold text-xs flex items-center justify-center shadow-inner">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-none">
                        {user.rollNumber || user.email.split('@')[0]}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      {role === 'student' ? (
                        <>
                          <Link
                            to="/student/profile"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            <span>Student Profile</span>
                          </Link>
                          <Link
                            to="/student/my-exams"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <GraduationCap className="w-4 h-4 text-slate-500" />
                            <span>My Examinations</span>
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/admin"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-slate-500" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#06264A] hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#06264A] text-white hover:bg-[#0A3B72] transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
