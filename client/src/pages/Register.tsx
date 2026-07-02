import { useState } from 'react';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'HIRING_MANAGER']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useRHForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT'
    }
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.post('/auth/register', data);
      login(response.data);
      
      if (response.data.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/manager/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="card">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Create an account</h2>
          <p className="text-slate-500 mt-2">Join TalentOS to find or hire top talent</p>
        </div>

        {error && (
          <div className="bg-red-50 text-danger p-3 rounded-md mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              {...register('name')} 
              type="text" 
              className={`input-field ${errors.name ? 'border-danger focus:ring-danger' : ''}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              {...register('email')} 
              type="email" 
              className={`input-field ${errors.email ? 'border-danger focus:ring-danger' : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              {...register('password')} 
              type="password" 
              className={`input-field ${errors.password ? 'border-danger focus:ring-danger' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-md cursor-pointer flex-1">
                <input type="radio" value="STUDENT" {...register('role')} className="text-primary focus:ring-primary h-4 w-4" />
                <span className="text-sm font-medium text-slate-700">Student</span>
              </label>
              <label className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-md cursor-pointer flex-1">
                <input type="radio" value="HIRING_MANAGER" {...register('role')} className="text-primary focus:ring-primary h-4 w-4" />
                <span className="text-sm font-medium text-slate-700">Hiring Manager</span>
              </label>
            </div>
            {errors.role && <p className="text-danger text-xs mt-1">{errors.role.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center h-10 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
