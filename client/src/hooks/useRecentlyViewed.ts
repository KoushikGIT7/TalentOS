import { useState, useEffect } from 'react';

// Defines the structure of a viewed job
export interface ViewedJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  viewedAt: number;
}

const STORAGE_KEY = 'talentos_recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [viewedJobs, setViewedJobs] = useState<ViewedJob[]>([]);

  // Load on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setViewedJobs(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to parse recently viewed jobs:', error);
    }
  }, []);

  // Add a job to the recently viewed list
  const addViewedJob = (job: Omit<ViewedJob, 'viewedAt'>) => {
    setViewedJobs((prev) => {
      // Remove it if it already exists so we can move it to the front
      const filtered = prev.filter((j) => j._id !== job._id);
      
      const newJobs = [
        { ...job, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_ITEMS); // Keep only the latest 10
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newJobs));
      return newJobs;
    });
  };

  // Clear history
  const clearViewedJobs = () => {
    localStorage.removeItem(STORAGE_KEY);
    setViewedJobs([]);
  };

  return { viewedJobs, addViewedJob, clearViewedJobs };
}
