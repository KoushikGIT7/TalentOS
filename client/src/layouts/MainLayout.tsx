import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, User as UserIcon } from 'lucide-react';

export default function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
                <div className="bg-primary text-white p-1.5 rounded-lg">
                  <Briefcase size={24} />
                </div>
                <span>TalentOS</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/jobs" className="text-text hover:text-primary transition-colors font-medium">Jobs</Link>
              {isAuthenticated && user?.role === 'STUDENT' && (
                <Link to="/student/dashboard" className="text-text hover:text-primary transition-colors font-medium">Dashboard</Link>
              )}
              {isAuthenticated && user?.role === 'HIRING_MANAGER' && (
                <Link to="/manager/dashboard" className="text-text hover:text-primary transition-colors font-medium">Dashboard</Link>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                    <UserIcon size={16} />
                    <span>{user?.name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-slate-500 hover:text-danger transition-colors p-2 rounded-full hover:bg-slate-100">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-primary font-medium transition-colors">Log in</Link>
                  <Link to="/register" className="btn-primary">Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>© 2026 TalentOS. Prepared for Kalpana Software Solution Pvt. Ltd. – SDE-1 Assessment.</p>
        </div>
      </footer>
    </div>
  );
}
