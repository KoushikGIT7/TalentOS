import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle2, Clock, XCircle, Building, MapPin, Briefcase, Bookmark, UserCircle, Edit3 } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';

export default function StudentDashboard() {
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/my');
      return res.data;
    }
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await api.get('/profiles/me');
      return res.data;
    }
  });

  const { data: savedJobs, isLoading: savedLoading } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const res = await api.get('/auth/saved-jobs');
      return res.data;
    }
  });

  // Calculate profile completion score
  const getProfileScore = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.bio?.length > 10) score += 20;
    if (profile.skills?.length > 0) score += 20;
    if (profile.resumeUrl) score += 20;
    if (profile.github) score += 15;
    if (profile.linkedin) score += 15;
    if (profile.portfolio) score += 10;
    return score;
  };

  const profileScore = getProfileScore();
  const isLoading = appsLoading || profileLoading || savedLoading;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OFFERED':
      case 'Accepted':
        return <span className="badge-green"><CheckCircle2 size={14} /> Offered</span>;
      case 'REJECTED':
      case 'Rejected':
        return <span className="badge-red"><XCircle size={14} /> Rejected</span>;
      case 'INTERVIEW':
        return <span className="badge-amber"><Clock size={14} /> Interviewing</span>;
      case 'REVIEWING':
        return <span className="badge-blue"><Clock size={14} /> Reviewing</span>;
      default:
        return <span className="badge-slate"><Clock size={14} /> Applied</span>;
    }
  };

  if (isLoading) {
    return <LoadingAnimation message="Loading your dashboard..." fullScreen />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
          <p className="text-slate-500 mt-1">Track your applications and manage your career profile.</p>
        </div>
        <Link to="/onboarding" className="btn-secondary flex items-center gap-2">
          <Edit3 size={16} /> Edit Profile
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Jobs Applied</p>
            <p className="text-2xl font-bold text-slate-900">{applications?.length || 0}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bookmark size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Saved Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{savedJobs?.length || 0}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <UserCircle size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">Profile Score</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-slate-900">{profileScore}%</p>
              <div className="flex-1 h-2 bg-slate-100 rounded-full">
                <div 
                  className={`h-2 rounded-full ${profileScore === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                  style={{ width: `${profileScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Application History (Timeline)</h2>
        </div>

        {applications?.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900">No applications yet</h3>
            <p className="text-slate-500 mt-1">Start applying to jobs to see your timeline here.</p>
            <Link to="/jobs" className="btn-primary mt-4 inline-block">Browse Jobs</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications?.map((app: any) => (
              <div key={app._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{app.job.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Building size={16} className="text-slate-400" /> {app.job.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={16} className="text-slate-400" /> {app.job.location}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusBadge(app.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
