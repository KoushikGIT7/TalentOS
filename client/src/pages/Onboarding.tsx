import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CheckCircle2, UserCircle } from 'lucide-react';

const onboardingSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters long').max(500, 'Bio is too long'),
  skills: z.string().min(2, 'Please add at least one skill'),
  resumeUrl: z.string().url('Please provide a valid URL for your resume').or(z.literal('')),
  portfolio: z.string().url('Please provide a valid URL').or(z.literal('')),
  github: z.string().url('Please provide a valid URL').or(z.literal('')),
  linkedin: z.string().url('Please provide a valid URL').or(z.literal('')),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [score, setScore] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      bio: '',
      skills: '',
      resumeUrl: '',
      portfolio: '',
      github: '',
      linkedin: '',
    }
  });

  const values = watch();

  useEffect(() => {
    // Calculate completion score dynamically based on form fields
    let currentScore = 0;
    if (values.bio?.length > 10) currentScore += 20;
    if (values.skills?.length > 2) currentScore += 20;
    if (values.resumeUrl) currentScore += 20;
    if (values.github) currentScore += 15;
    if (values.linkedin) currentScore += 15;
    if (values.portfolio) currentScore += 10;
    setScore(currentScore);
  }, [values]);

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      const skillsArray = data.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');

      await api.put('/profiles/me', {
        ...data,
        skills: skillsArray,
      });

      // Redirect after success
      if (user?.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/jobs');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <UserCircle size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Complete Your Profile</h1>
        <p className="text-slate-500 mt-2">Hiring managers want to see what makes you stand out.</p>
        
        <div className="mt-6 inline-flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
          <span className="text-sm font-medium text-slate-700">Profile Completion:</span>
          <div className="w-32 bg-slate-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${score === 100 ? 'bg-success' : 'bg-primary'}`} 
              style={{ width: `${score}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold text-primary">{score}%</span>
        </div>
      </div>

      <div className="card">
        {error && (
          <div className="bg-red-50 text-danger p-4 rounded-lg mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">About You</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bio / Headline
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                className="input-field"
                placeholder="I am a passionate software engineer..."
              />
              {errors.bio && <p className="text-danger text-xs mt-1">{errors.bio.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Top Skills (comma separated)
              </label>
              <input
                {...register('skills')}
                type="text"
                className="input-field"
                placeholder="React, Node.js, TypeScript, UI/UX"
              />
              {errors.skills && <p className="text-danger text-xs mt-1">{errors.skills.message}</p>}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Links & Portfolio</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Resume URL (Google Drive / DropBox / Notion)
              </label>
              <input
                {...register('resumeUrl')}
                type="url"
                className="input-field"
                placeholder="https://..."
              />
              {errors.resumeUrl && <p className="text-danger text-xs mt-1">{errors.resumeUrl.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GitHub URL</label>
                <input
                  {...register('github')}
                  type="url"
                  className="input-field"
                  placeholder="https://github.com/..."
                />
                {errors.github && <p className="text-danger text-xs mt-1">{errors.github.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                <input
                  {...register('linkedin')}
                  type="url"
                  className="input-field"
                  placeholder="https://linkedin.com/in/..."
                />
                {errors.linkedin && <p className="text-danger text-xs mt-1">{errors.linkedin.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Personal Portfolio URL (Optional)
              </label>
              <input
                {...register('portfolio')}
                type="url"
                className="input-field"
                placeholder="https://..."
              />
              {errors.portfolio && <p className="text-danger text-xs mt-1">{errors.portfolio.message}</p>}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Complete Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
