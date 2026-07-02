import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { Plus, Trash2, Users, Sparkles, Loader2, Briefcase, ChevronLeft, Search, FileText, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';

type JobForm = {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
};

export default function HiringDashboard() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'create'>('jobs');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null); // For ATS view
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  
  // AI Match Score state
  const [matchScores, setMatchScores] = useState<Record<string, { score: number, reason: string }>>({});
  const [scoringApps, setScoringApps] = useState<Record<string, boolean>>({});

  const queryClient = useQueryClient();

  // Fetch Jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return res.data.filter(
        (j: any) => !j.isExternal && (j.creator?._id === user._id || j.creator === user._id)
      );
    },
  });

  // Fetch Applications for Selected Job
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['job-applications', selectedJob?._id],
    queryFn: async () => {
      const res = await api.get(`/applications/job/${selectedJob._id}`);
      return res.data;
    },
    enabled: !!selectedJob,
  });

  // Mutations
  const { register, handleSubmit, setValue, getValues, reset } = useForm<JobForm>({
    defaultValues: { type: 'Full-time' },
  });

  const createMutation = useMutation({
    mutationFn: async (data: JobForm) => api.post('/jobs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      setActiveTab('jobs');
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/jobs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-jobs'] }),
  });

  const updateAppMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string, status?: string, notes?: string }) => {
      return api.put(`/applications/${id}`, { status, notes });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['job-applications', selectedJob?._id] }),
  });

  const enhanceDescription = async () => {
    const currentDesc = getValues('description');
    const title = getValues('title');
    if (!currentDesc?.trim()) {
      alert('Please enter a basic description first to enhance it.');
      return;
    }
    try {
      setIsEnhancing(true);
      const res = await api.post('/ai/enhance-job', { 
        title: title || 'tech professional', 
        description: currentDesc 
      });
      setValue('description', res.data.enhancedDescription, { shouldDirty: true });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to enhance description.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const calculateMatchScore = async (appId: string, profile: any) => {
    if (!profile) {
      alert("Candidate has not completed their profile yet.");
      return;
    }
    try {
      setScoringApps(prev => ({ ...prev, [appId]: true }));
      const res = await api.post('/ai/match-score', { 
        profile, 
        jobDescription: selectedJob.description 
      });
      setMatchScores(prev => ({ ...prev, [appId]: res.data }));
    } catch (error) {
      alert("Failed to calculate match score.");
    } finally {
      setScoringApps(prev => ({ ...prev, [appId]: false }));
    }
  };

  const onSubmit = (data: JobForm) => createMutation.mutate(data);

  // Stats
  const totalJobs = jobs?.length || 0;
  const totalApps = applications?.length || 0;

  // Render ATS View
  if (selectedJob) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* ATS Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h1>
            <p className="text-slate-500 text-sm">Reviewing {totalApps} applicants for this role.</p>
          </div>
        </div>

        {appsLoading ? (
          <LoadingAnimation message="Loading candidates..." />
        ) : applications?.length === 0 ? (
          <div className="text-center py-12 card">No applications received yet.</div>
        ) : (
          <div className="space-y-6">
            {applications.map((app: any) => (
              <div key={app._id} className="card p-0 overflow-hidden flex flex-col md:flex-row">
                
                {/* Candidate Info */}
                <div className="p-6 md:w-1/3 bg-slate-50 border-r border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {app.applicant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{app.applicant.name}</h3>
                      <a href={`mailto:${app.applicant.email}`} className="text-sm text-primary hover:underline">{app.applicant.email}</a>
                    </div>
                  </div>
                  
                  {app.profile ? (
                    <div className="space-y-3 mt-4 text-sm">
                      {app.profile.bio && <p className="text-slate-600 italic">"{app.profile.bio}"</p>}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {app.profile.skills?.map((s: string, i: number) => (
                          <span key={i} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs">{s}</span>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200">
                        {app.coverLetter && (
                          <div className="mb-2">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Cover Letter</h4>
                            <p className="text-xs text-slate-700 bg-white p-2 rounded border border-slate-100 max-h-32 overflow-y-auto whitespace-pre-wrap">
                              {app.coverLetter}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                          <h4 className="text-xs font-semibold text-indigo-800 flex items-center gap-1 mb-2">
                            <Sparkles size={12} /> AI Fit Analysis
                          </h4>
                          
                          {matchScores[app._id] ? (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-2xl font-bold text-indigo-900">{matchScores[app._id].score}%</div>
                                <div className="text-xs text-indigo-700 font-medium leading-tight">Match<br/>Score</div>
                              </div>
                              <p className="text-xs text-indigo-700 mt-2 italic">{matchScores[app._id].reason}</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => calculateMatchScore(app._id, app.profile)}
                              disabled={scoringApps[app._id]}
                              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              {scoringApps[app._id] && <Loader2 size={12} className="animate-spin" />}
                              Calculate Match Score
                            </button>
                          )}
                        </div>

                        <div className="mt-2 flex flex-col gap-2">
                          {app.profile.resumeUrl && (
                            <button onClick={() => setResumePreview(app.profile.resumeUrl)} className="text-left text-sm font-medium text-emerald-600 hover:underline flex items-center gap-1">
                              <FileText size={14} /> View Resume
                            </button>
                          )}
                          {app.profile.linkedin && (
                            <a href={app.profile.linkedin} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-700 hover:underline flex items-center gap-1">
                              <ExternalLink size={14} /> LinkedIn
                            </a>
                          )}
                          {app.profile.github && (
                            <a href={app.profile.github} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-700 hover:underline flex items-center gap-1">
                              <ExternalLink size={14} /> GitHub
                            </a>
                          )}
                          {app.profile.portfolio && (
                            <a href={app.profile.portfolio} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-700 hover:underline flex items-center gap-1">
                              <ExternalLink size={14} /> Portfolio
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic mt-4">Profile not completed.</p>
                  )}
                </div>

                {/* Candidate Action Workflow */}
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-slate-800">Application Status</h4>
                      <span className="text-xs text-slate-400">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Status Pipeline Buttons */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {['APPLIED', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED'].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateAppMutation.mutate({ id: app._id, status: s })}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            app.status === s 
                              ? s === 'OFFERED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 border'
                              : s === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200 border'
                              : 'bg-primary text-white border-primary border'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-transparent'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Recruiter Notes (Internal)</label>
                      <textarea
                        className="input-field text-sm"
                        rows={3}
                        placeholder="Add notes about this candidate..."
                        defaultValue={app.notes || ''}
                        onBlur={(e) => updateAppMutation.mutate({ id: app._id, notes: e.target.value })}
                      />
                      <p className="text-xs text-slate-400">Notes are auto-saved when you click away.</p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Resume Preview Modal */}
        {resumePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2"><FileText size={18}/> Resume Preview</h3>
                <button onClick={() => setResumePreview(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="flex-1 bg-slate-100 relative">
                <iframe src={resumePreview} className="absolute inset-0 w-full h-full border-0" title="Resume Preview" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Main Dashboard
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hiring Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your active jobs and review incoming candidates.</p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card flex items-center gap-4 border-t-4 border-t-primary">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{totalJobs}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 border-t-4 border-t-emerald-500">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Applicants (All Time)</p>
            <p className="text-2xl font-bold text-slate-900">Track inside jobs</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {activeTab === 'create' ? (
          <div className="p-6 md:p-8">
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase size={20} className="text-slate-400" /> Create Job Posting
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                    <input {...register('title', { required: true })} className="input-field" placeholder="e.g. Senior Frontend Engineer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                    <input {...register('company', { required: true })} className="input-field" placeholder="e.g. Acme Corp" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                    <input {...register('location', { required: true })} className="input-field" placeholder="e.g. Remote / New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                    <select {...register('type')} className="input-field">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">Description *</label>
                    <button type="button" onClick={enhanceDescription} disabled={isEnhancing} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 flex items-center gap-1.5 transition-colors font-medium">
                      {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                    </button>
                  </div>
                  <textarea {...register('description', { required: true })} rows={6} className="input-field resize-none" placeholder="Write a brief job description..." />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => { reset(); setActiveTab('jobs'); }} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="btn-primary flex items-center gap-2">
                    {createMutation.isPending && <Loader2 size={16} className="animate-spin" />} Publish Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">My Job Postings</h2>
            </div>
            {jobsLoading ? (
              <LoadingAnimation message="Loading your jobs..." />
            ) : jobs?.length === 0 ? (
              <div className="p-12 text-center">
                <h3 className="text-lg font-medium text-slate-900">No jobs posted yet</h3>
                <p className="text-slate-500 mt-1">Create your first job to start accepting applications.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {jobs?.map((job: any) => (
                  <div key={job._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.type}</span>
                        <span>•</span>
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="btn-secondary flex items-center gap-2 group-hover:border-primary group-hover:text-primary transition-colors"
                      >
                        <Users size={16} /> Review Applicants
                      </button>
                      <button
                        onClick={() => { if (window.confirm('Delete job?')) deleteMutation.mutate(job._id); }}
                        className="text-slate-400 hover:text-danger p-2 bg-white rounded-lg border border-slate-200 hover:border-danger transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
