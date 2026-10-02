import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UNIVERSITY_INFO } from '../utils/constants';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  User,
  LogOut,
  Users,
  FileQuestion,
  GraduationCap,
  X,
  Award,
  ShieldCheck,
  Layers,
  Monitor
} from 'lucide-react';

export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Exams', path: '/student/my-exams', icon: BookOpen },
    { name: 'Results & History', path: '/student/results', icon: FileCheck2 },
    { name: 'Student Profile', path: '/student/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Examinations', path: '/admin/exams', icon: BookOpen },
    { name: 'Exam Sections', path: '/admin/sections', icon: Layers },
    { name: 'Questions Bank', path: '/admin/questions', icon: FileQuestion },
    { name: 'Exam Results', path: '/admin/results', icon: Award },
    { name: 'Retest Authority', path: '/admin/retests', icon: ShieldCheck },
    { name: 'Live Monitoring', path: '/admin/monitoring', icon: Monitor },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#06264A] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#F5A623]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wide block leading-none">
                  {UNIVERSITY_INFO.shortName}
                </span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider mt-0.5 block">
                  {role === 'admin' ? 'Admin Controller' : 'Student Portal'}
                </span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge Preview */}
          <div className="px-6 py-4 mx-3 my-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Logged User'}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              {user?.rollNumber || user?.email}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#F5A623]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse"></span>
              <span className="capitalize">{user?.department || 'Department Verified'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/admin' || link.path === '/student/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#F5A623] text-[#031A33] shadow-md font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-300 hover:text-white hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out Session</span>
          </button>
          <div className="mt-3 text-[10px] text-slate-400 text-center">
            CVRGU Examination System v2.4
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
