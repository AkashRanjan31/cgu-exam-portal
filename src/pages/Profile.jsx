import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UNIVERSITY_INFO } from '../utils/constants';
import {
  User,
  Mail,
  Hash,
  School,
  MapPin,
  Building,
  Lock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#06264A]">Student Academic Identity</h1>
        <p className="text-xs text-slate-500 mt-1">
          Verified university enrollment credentials recorded with CVRGU Academic Council
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-academic overflow-hidden">
        
        {/* Banner */}
        <div className="bg-[#06264A] p-6 sm:p-8 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-white font-black text-2xl flex items-center justify-center border-2 border-[#F5A623] shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name || 'Student Name'}</h2>
              <p className="text-xs text-[#F5A623] font-semibold mt-0.5">
                Roll No: {user?.rollNumber || 'XXX XXXXXXX'}
              </p>
              <p className="text-[11px] text-slate-300">
                {user?.department || 'Computer Science & Engineering'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Student</span>
          </div>
        </div>

        {/* Read-only Credentials Form (Section 24 requirement) */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#06264A] flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#06264A] shrink-0" />
            <span>
              Your university email and registration number are cryptographically tied to your student ledger and cannot be altered.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800 flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>{user?.name || 'Student Name'}</span>
              </div>
            </div>

            {/* University Email (Read-Only) */}
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                University Email (Read-Only)
              </label>
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 font-mono font-semibold text-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{user?.email || 'student@cgu-odisha.ac.in'}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" title="Locked by administration" />
              </div>
            </div>

            {/* Roll Number */}
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                Roll Number / Student ID
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800 flex items-center gap-2.5">
                <Hash className="w-4 h-4 text-slate-400" />
                <span>{user?.rollNumber || 'XXX XXXXXXX'}</span>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                Department
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800 flex items-center gap-2.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{user?.department || 'Computer Science & Engineering'}</span>
              </div>
            </div>

            {/* University */}
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                University
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800 flex items-center gap-2.5">
                <School className="w-4 h-4 text-slate-400" />
                <span>{UNIVERSITY_INFO.name}</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                Location
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800 flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{UNIVERSITY_INFO.location}</span>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Account Security Status: Fully Verified</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Eligible for All Scheduled Exams
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
