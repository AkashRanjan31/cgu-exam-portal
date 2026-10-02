import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UNIVERSITY_INFO, DEPARTMENTS } from '../utils/constants';
import { validateRegistrationForm, isValidUniversityEmail } from '../utils/validation';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Hash,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register, authError, setAuthError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    year: '3rd Year',
    semester: '5th Semester',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid =
    formData.name.trim().length >= 2 &&
    isValidUniversityEmail(formData.email) &&
    formData.rollNumber.trim().length >= 3 &&
    Boolean(formData.department) &&
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(formData.password) &&
    formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    // Validate registration form with strict domain checking
    const { isValid, errors } = validateRegistrationForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* University Emblem Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-14 h-14 rounded-2xl bg-[#06264A] text-white flex items-center justify-center font-bold shadow-lg group-hover:bg-[#0A3B72] transition-colors">
            <GraduationCap className="w-8 h-8 text-[#F5A623]" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#06264A] tracking-tight">
          Student Examination Registration
        </h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
          {UNIVERSITY_INFO.name}, {UNIVERSITY_INFO.location}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-academic border border-slate-200 space-y-6">
          
          {/* Important Information Card */}
          <div className="p-4 rounded-2xl bg-[#06264A] text-white space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-[#F5A623]">
              <ShieldCheck className="w-5 h-5" />
              <span>🔒 CVRGU Student Access</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Registration is restricted to official university email addresses ending in <strong>@cgu-odisha.ac.in</strong>.
            </p>
            <p className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-md inline-block text-slate-300">
              Valid Example: XXX@cgu-odisha.ac.in
            </p>
          </div>

          {/* Form / Auth Error Alert */}
          {(authError || Object.keys(formErrors).length > 0) && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Please correct the following:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {authError && <li>{authError}</li>}
                {Object.values(formErrors).filter(Boolean).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Legal Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                FULL LEGAL NAME <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. XXX XXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#06264A] focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            {/* University Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                UNIVERSITY EMAIL ADDRESS <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. XXX@cgu-odisha.ac.in"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-hidden ${
                    formErrors.email
                      ? 'border-red-400 bg-red-50/40 focus:border-red-500'
                      : 'border-slate-300 focus:border-[#06264A] focus:ring-2 focus:ring-blue-100'
                  }`}
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Must end with <code className="font-mono font-bold text-[#06264A]">@cgu-odisha.ac.in</code>
              </p>
            </div>

            {/* Roll Number & Department in two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ROLL / REG. NUMBER <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. XXX XXXXXXX"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#06264A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  DEPARTMENT <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-[#06264A] bg-white truncate"
                    required
                  >
                    <option value="" disabled>Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars, A-Z, 0-9, symbol"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#06264A]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Min 8 chars · 1 uppercase · 1 number · 1 special character</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CONFIRM PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#06264A]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-3">
              {!isFormValid && formData.password.length > 0 && (
                <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                  <p className="font-bold">Password requirements:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li className={formData.password.length >= 8 ? 'text-emerald-700' : ''}>At least 8 characters</li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-emerald-700' : ''}>At least 1 uppercase letter</li>
                    <li className={/\d/.test(formData.password) ? 'text-emerald-700' : ''}>At least 1 number</li>
                    <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-700' : ''}>At least 1 special character (e.g. @, #, !)</li>
                    <li className={formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 ? 'text-emerald-700' : ''}>Passwords match</li>
                  </ul>
                </div>
              )}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Student Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete University Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login prompt */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            <span>Already registered your CVRGU email? </span>
            <Link to="/login" className="font-bold text-[#06264A] hover:underline">
              Sign In here
            </Link>
          </div>

        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        <Link to="/" className="hover:text-slate-600 transition-colors">
          ← Return to University Homepage
        </Link>
      </div>

    </div>
  );
};

export default Register;
