import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Building, MapPin, Globe, Briefcase, ExternalLink, Zap } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';

export default function CompanyProfile() {
  const { companyName } = useParams<{ companyName: string }>();
  const decodedName = decodeURIComponent(companyName || '');

  // For the MVP, we derive the company profile from the jobs that match this company name.
  // We search for jobs with this keyword, and filter exactly to this company.
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['company-jobs', decodedName],
    queryFn: async () => {
      const res = await api.get(`/jobs?keyword=${encodeURIComponent(decodedName)}`);
      // Filter exactly to this company name (case insensitive)
      return res.data.filter((j: any) => j.company.toLowerCase() === decodedName.toLowerCase());
    }
  });

  const openPositions = jobs?.length || 0;
  
  // Extract a location from the first job if available
  const location = jobs?.[0]?.location || 'Global / Remote';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Company Header */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm relative">
        <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800"></div>
        <div className="px-8 pb-8 pt-16 relative">
          <div className="absolute -top-12 left-8 w-24 h-24 bg-white rounded-xl border-4 border-white shadow-md flex items-center justify-center text-4xl font-bold text-slate-800">
            {decodedName.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{decodedName}</h1>
              <div className="flex items-center gap-4 mt-2 text-slate-600 text-sm font-medium">
                <span className="flex items-center gap-1"><MapPin size={16} className="text-slate-400" /> {location}</span>
                <span className="flex items-center gap-1"><Building size={16} className="text-slate-400" /> Technology Company</span>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(decodedName)}+website`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <Globe size={16} /> Website
                </a>
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 font-medium text-sm flex items-center gap-2">
              <Briefcase size={16} />
              {openPositions} Open Position{openPositions !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">About {decodedName}</h3>
            <p className="text-slate-600 leading-relaxed max-w-3xl">
              {decodedName} is a leading technology company building innovative solutions. We are currently actively hiring for {openPositions} roles across various departments. Explore our open positions below to find your next career opportunity.
            </p>
          </div>
        </div>
      </div>

      {/* Open Positions List */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          Open Roles at {decodedName}
        </h2>

        {isLoading ? (
          <LoadingAnimation message={`Loading roles for ${decodedName}...`} />
        ) : error ? (
          <div className="text-danger">Failed to load open positions.</div>
        ) : jobs?.length === 0 ? (
          <div className="text-slate-500">No open positions found.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {jobs?.map((job: any) => (
              <div key={job._id} className="card hover:border-primary/30 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900">{job.title}</h3>
                    {job.isExternal && (
                      <span className="bg-amber-100 text-warning text-xs px-2 py-1 rounded flex items-center gap-1 font-medium">
                        <Zap size={12} /> External
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type || 'Full-time'}</span>
                  </div>
                </div>
                
                <Link 
                  to="/jobs" // In a real app this would go to a job detail page, but we only have the main jobs board
                  className="btn-secondary w-full text-center mt-2 flex items-center justify-center gap-2 text-sm"
                >
                  View on Job Board <ExternalLink size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
