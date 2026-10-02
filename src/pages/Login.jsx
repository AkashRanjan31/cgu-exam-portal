import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UNIVERSITY_INFO, DEMO_CREDENTIALS } from '../utils/constants';
import { validateLoginForm } from '../utils/validation';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickDemoLogin, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email domain restriction validation on submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    // Strict validation
    const { isValid, errors } = validateLoginForm(email, password);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      // Redirect based on role
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        const destination = location.state?.from?.pathname || '/student/dashboard';
        navigate(destination);
      }
    } catch (err) {
      console.error('Login error:', err);
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role) => {
    if (!quickDemoLogin) return;
    setAuthError(null);
    setFormErrors({});
    setIsSubmitting(true);
    try {
      const user = await quickDemoLogin(role);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Top University Brand Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-14 h-14 rounded-2xl bg-[#06264A] text-white flex items-center justify-center font-bold shadow-lg group-hover:bg-[#0A3B72] transition-colors">
            <GraduationCap className="w-8 h-8 text-[#F5A623]" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-[#06264A] tracking-tight">
          {UNIVERSITY_INFO.name}
        </h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
          {UNIVERSITY_INFO.portalName}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-academic border border-slate-200">
          
          {/* Email restriction advisory banner */}
          <div className="mb-6 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-[#06264A] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Login is strictly restricted to official <strong>@cgu-odisha.ac.in</strong> email accounts.
            </p>
          </div>

          {/* Form error or auth error display */}
          {(authError || formErrors.email || formErrors.password) && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-red-900">Authentication Alert</p>
                <p>{authError || formErrors.email || formErrors.password}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* University Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                University Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors({ ...formErrors, email: null });
                  }}
                  placeholder="e.g. XXX@cgu-odisha.ac.in"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-hidden transition-all ${
                    formErrors.email
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 focus:border-[#06264A] focus:ring-2 focus:ring-blue-100'
                  }`}
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must end with <span className="font-mono text-slate-600">@cgu-odisha.ac.in</span>
              </p>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Please contact the university IT helpdesk to reset your examination portal password.')}
                  className="text-xs text-[#06264A] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: null });
                  }}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#06264A] focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#06264A] focus:ring-[#06264A]"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#06264A] hover:bg-[#0A3B72] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Examination Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login — DEV only, stripped from production builds */}
          {DEMO_CREDENTIALS && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Dev Demo Accounts (One-Click)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student')}
                  disabled={isSubmitting}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-[#06264A] bg-slate-50 hover:bg-blue-50/50 text-left transition-all group"
                >
                  <span className="block text-xs font-bold text-[#06264A] group-hover:text-[#0A3B72]">Demo Student</span>
                  <span className="block text-[10px] text-slate-500 truncate font-mono">{DEMO_CREDENTIALS.student.email}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  disabled={isSubmitting}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-[#06264A] bg-slate-50 hover:bg-blue-50/50 text-left transition-all group"
                >
                  <span className="block text-xs font-bold text-[#06264A] group-hover:text-[#0A3B72]">Demo Admin</span>
                  <span className="block text-[10px] text-slate-500 truncate font-mono">{DEMO_CREDENTIALS.admin.email}</span>
                </button>
              </div>
            </div>
          )}

          {/* Registration link */}
          <div className="mt-6 text-center text-xs text-slate-600">
            <span>Don't have an exam account? </span>
            <Link to="/register" className="font-bold text-[#06264A] hover:underline">
              Register Student ID
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

export default Login;
