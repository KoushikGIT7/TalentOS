import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Search, MapPin, Building, Clock, Briefcase, ExternalLink, Zap, Heart, CheckCircle2, Sparkles, Loader2, XCircle } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import LoadingAnimation from '../components/LoadingAnimation';

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { user, isAuthenticated } = useAuth();
  
  const [applyModalJob, setApplyModalJob] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  const queryClient = useQueryClient();

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs', debouncedSearch],
    queryFn: async () => {
      const res = await api.get(`/jobs?keyword=${debouncedSearch}`);
      return res.data;
    }
  });

  const { data: myApplications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const res = await api.get('/applications/my');
      return res.data;
    },
    enabled: isAuthenticated && user?.role === 'STUDENT'
  });

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const res = await api.get('/profiles/me');
      return res.data;
    },
    enabled: isAuthenticated && user?.role === 'STUDENT'
  });

  const { data: savedJobs } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const res = await api.get('/auth/saved-jobs');
      return res.data;
    },
    enabled: isAuthenticated
  });

  const applyMutation = useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: string, coverLetter: string }) => {
      return await api.post(`/applications/${jobId}`, { coverLetter });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      setApplyModalJob(null);
      setCoverLetter('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to apply');
    }
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: string, isSaved: boolean }) => {
      if (isSaved) {
        return await api.delete(`/auth/saved-jobs/${jobId}`);
      } else {
        return await api.post(`/auth/saved-jobs/${jobId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    }
  });

  const handleApplyClick = (job: any) => {
    if (!isAuthenticated) {
      alert('Please login to apply');
      return;
    }
    if (user?.role !== 'STUDENT') {
      alert('Only students can apply to jobs');
      return;
    }

    // Require complete profile before applying
    if (!profile || !profile.skills || profile.skills.length === 0 || !profile.resumeUrl) {
      alert('Please complete your profile details (including skills and resume) before applying to any jobs.');
      window.location.href = '/onboarding';
      return;
    }

    if (job.isExternal && job.externalUrl) {
      window.open(job.externalUrl, '_blank');
      return;
    }

    setApplyModalJob(job);
    setCoverLetter('');
  };

  const submitApplication = () => {
    if (!applyModalJob) return;
    applyMutation.mutate({ jobId: applyModalJob._id, coverLetter });
  };

  const generateCoverLetter = async () => {
    if (!profile) {
      alert("Please complete your profile in the dashboard first so the AI knows about you!");
      return;
    }
    try {
      setIsGeneratingCover(true);
      const res = await api.post('/ai/generate-cover-letter', {
        profile,
        jobTitle: applyModalJob.title,
        jobDescription: applyModalJob.description,
        company: applyModalJob.company
      });
      setCoverLetter(res.data.coverLetter);
    } catch (err: any) {
      alert("Failed to generate cover letter.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleToggleSave = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login to save jobs');
      return;
    }
    const isSaved = savedJobs?.includes(jobId);
    toggleSaveMutation.mutate({ jobId, isSaved });
  };

  const hasApplied = (jobId: string) => {
    return myApplications?.some((app: any) => app.job._id === jobId);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900">Explore Opportunities</h1>
        <p className="text-slate-500">Find your next role from our curated internal postings and global remote aggregators.</p>
        
        <div className="relative max-w-xl mx-auto mt-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-base transition-all shadow-sm"
            placeholder="Search jobs, companies, skills, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingAnimation message="Fetching latest opportunities..." />
      ) : error ? (
        <div className="text-center text-danger p-8 bg-red-50 rounded-xl">
          Failed to load jobs. Please try again later.
        </div>
      ) : jobs?.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-slate-200">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job: any) => {
            const applied = hasApplied(job._id);
            const isSaved = savedJobs?.includes(job._id);

            return (
              <div key={job._id} className="card flex flex-col hover:border-primary/30 transition-colors relative group">
                <button 
                  onClick={(e) => handleToggleSave(job._id, e)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                    isSaved ? 'text-red-500 bg-red-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>

                <div className="flex justify-between items-start mb-4 pr-10">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{job.title}</h3>
                </div>
                
                <div className="space-y-2 mb-6 flex-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Building size={16} className="text-slate-400" />
                    <Link to={`/company/${encodeURIComponent(job.company)}`} className="font-medium">{job.company}</Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-slate-400" />
                    <span>{job.type || 'Full-time'}</span>
                  </div>
                  {job.isExternal && (
                    <div className="mt-2 inline-flex">
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded flex items-center gap-1 font-medium">
                        <Zap size={12} /> External Listing
                      </span>
                    </div>
                  )}
                </div>

                {applied ? (
                  <button disabled className="w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 size={18} /> Already Applied
                  </button>
                ) : (
                  <button
                    onClick={() => handleApplyClick(job)}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-150 ${
                      job.isExternal 
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                        : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                    }`}
                  >
                    {job.isExternal ? (
                      <>Apply Externally <ExternalLink size={16} /></>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {applyModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Apply for {applyModalJob.title}</h3>
                <p className="text-sm text-slate-500">{applyModalJob.company}</p>
              </div>
              <button onClick={() => setApplyModalJob(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500"/> AI Cover Letter Writer
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Stand out by generating a highly tailored cover letter based on your profile and this job description.
                </p>
                <button
                  onClick={generateCoverLetter}
                  disabled={isGeneratingCover}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingCover && <Loader2 size={14} className="animate-spin" />}
                  {isGeneratingCover ? 'Writing Cover Letter...' : 'Generate with AI'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cover Letter (Optional)</label>
                <textarea 
                  className="input-field min-h-[250px]"
                  placeholder="Write your cover letter here..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setApplyModalJob(null)} className="btn-secondary">Cancel</button>
              <button 
                onClick={submitApplication}
                disabled={applyMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {applyMutation.isPending ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16} />}
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
