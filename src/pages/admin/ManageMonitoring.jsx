import React, { useState, useEffect, useCallback } from 'react';
import { monitoringService } from '../../services/monitoringService';
import {
  Monitor,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  RefreshCw,
  Search
} from 'lucide-react';

export const ManageMonitoring = () => {
  const [sessions, setSessions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');

  const loadMonitoringData = useCallback(async () => {
    try {
      setLoading(true);
      const [sessData, logData] = await Promise.all([
        monitoringService.getActiveSessions(),
        monitoringService.getViolationAuditLog()
      ]);
      setSessions(sessData);
      setAuditLogs(logData);
    } catch (err) {
      console.error('Failed to load monitoring data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 10000);
    return () => clearInterval(interval);
  }, [loadMonitoringData]);

  const handleTerminate = async (sessionId, studentName) => {
    if (window.confirm(`Are you sure you want to force-submit / disqualify session for ${studentName}?`)) {
      try {
        await monitoringService.terminateSession(sessionId, 'COE Administrative Disqualification');
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        alert(`Session for ${studentName} has been administratively terminated.`);
      } catch (err) {
        console.error('Failed to terminate session:', err);
        alert('Failed to terminate session');
      }
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.examTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterSeverity === 'Flagged' && s.violations === 0) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#06264A] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
            <span>Office of the Controller of Examinations</span>
          </div>
          <h1 className="text-2xl font-black text-[#06264A] tracking-tight">
            Live Examination Proctoring & Workstation Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry, active candidate sessions, and proctoring strike tracking
          </p>
        </div>

        <button
          onClick={loadMonitoringData}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Candidates</span>
            <div className="text-2xl font-black text-[#06264A] mt-1">{sessions.length}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Live heartbeat verified</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#06264A] flex items-center justify-center">
            <Monitor className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Warning Strikes (1-2)</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {sessions.filter(s => s.violations > 0).length}
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Workstations alerted</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Proctoring Rules</span>
            <div className="text-2xl font-black text-[#06264A] mt-1">3 Strikes</div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Auto-submit limit</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Incidents</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{auditLogs.length}</div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Recorded in session</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, roll number, or paper..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#06264A]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-semibold">Filter:</span>
          <button
            onClick={() => setFilterSeverity('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterSeverity === 'All'
                ? 'bg-[#06264A] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Workstations ({sessions.length})
          </button>
          <button
            onClick={() => setFilterSeverity('Flagged')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterSeverity === 'Flagged'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Flagged Strikes ({sessions.filter(s => s.violations > 0).length})
          </button>
        </div>
      </div>

      {/* Active Workstations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-academic overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="font-bold text-sm text-[#06264A]">Active Workstation Sessions</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Telemetry polling: 10s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Candidate & Roll No.</th>
                <th className="py-3.5 px-6">Exam & Active Section</th>
                <th className="py-3.5 px-6 text-center">Section Time</th>
                <th className="py-3.5 px-6 text-center">Proctoring Strikes</th>
                <th className="py-3.5 px-6">Terminal IP / Lab</th>
                <th className="py-3.5 px-6 text-right">Controller Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No active candidate sessions matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((sess) => {
                  const mins = Math.floor(sess.remainingSeconds / 60);
                  const secs = sess.remainingSeconds % 60;
                  return (
                    <tr key={sess.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block">{sess.studentName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-500">{sess.rollNumber}</span>
                          <span className="text-[10px] text-slate-400">• {sess.department}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-800 block">{sess.examTitle}</span>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                          {sess.currentSection} ({sess.activeSectionIndex}/{sess.totalSections})
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-bold text-slate-800">
                        {mins}:{secs.toString().padStart(2, '0')}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {sess.violations === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            0/3 (Clean)
                          </span>
                        ) : sess.violations === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-300">
                            1/3 (Warning 1)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 text-[10px] font-bold border border-red-300 animate-pulse">
                            2/3 (Final Warning)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-700 font-mono text-[11px] block">{sess.workstationIp}</span>
                        <span className="text-[10px] text-slate-400">Ping: {sess.lastHeartbeat}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleTerminate(sess.id, sess.studentName)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-600 hover:text-white font-bold text-[11px] transition-colors border border-red-200 shadow-xs"
                        >
                          Force Submit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Incident Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#06264A]" />
            <h2 className="font-bold text-sm text-[#06264A]">Recent Security Breach Stream (Audit Log)</h2>
          </div>
          <span className="text-[11px] text-slate-400">Tamper-proof event journal</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-800">{log.studentName} ({log.rollNumber})</span>
                <span className="text-slate-500 text-[11px] block sm:inline sm:ml-2">
                  • {log.examTitle} • {log.sectionTitle}
                </span>
                <p className="text-amber-900 font-medium text-[11px] mt-0.5">
                  Violation Event: {log.type}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                  Strike {log.strikeNumber}/3
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageMonitoring;
