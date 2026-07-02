import { Link } from 'react-router-dom';
import { ArrowRight, Search, Zap, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-12">
      <div className="text-center space-y-6 max-w-3xl">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-100">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span>The Modern Recruitment OS</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Find top talent. <br className="hidden md:block" />
          <span className="text-primary">Discover great jobs.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          TalentOS is the premium platform connecting ambitious students with forward-thinking companies. 
          <br className="hidden md:block" />
          <span className="font-medium text-slate-800 mt-2 block">
            Designed with workflows inspired by modern Applicant Tracking Systems (ATS) used by growing technology companies.
          </span>
        </p>
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Link to="/jobs" className="btn-primary px-8 py-3 text-lg flex items-center space-x-2">
            <Search size={20} />
            <span>Explore Jobs</span>
          </Link>
          <Link to="/register" className="btn-secondary px-8 py-3 text-lg flex items-center space-x-2 group">
            <span>Get Started</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="card text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="mx-auto bg-blue-100 text-primary w-12 h-12 rounded-full flex items-center justify-center">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Lightning Fast</h3>
          <p className="text-slate-600">Built on modern tech stack for instantaneous job searches and seamless applications.</p>
        </div>
        <div className="card text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="mx-auto bg-green-100 text-success w-12 h-12 rounded-full flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">AI Enhanced</h3>
          <p className="text-slate-600">Smart features for hiring managers to write better descriptions and match the best talent.</p>
        </div>
        <div className="card text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="mx-auto bg-amber-100 text-warning w-12 h-12 rounded-full flex items-center justify-center">
            <Search size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Global Reach</h3>
          <p className="text-slate-600">Access not only internal postings but thousands of aggregated remote opportunities.</p>
        </div>
      </div>
    </div>
  );
}
