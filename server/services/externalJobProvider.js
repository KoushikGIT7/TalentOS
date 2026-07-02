import axios from 'axios';

const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 mins to avoid hitting RapidAPI rate limits

const normalizeJob = (job) => {
  const locationStr = [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'India';
  const salaryStr = (job.job_min_salary && job.job_max_salary) 
    ? `$${job.job_min_salary} - $${job.job_max_salary} / ${job.job_salary_period}` 
    : 'Not disclosed';

  const jobId = job.job_id || `fallback_${Math.random().toString(36).substr(2, 9)}`;

  return {
    _id: `ext_${jobId}`,
    title: job.job_title || 'Untitled Job',
    company: job.employer_name || 'Unknown Company',
    location: locationStr,
    description: job.job_description || 'View original listing for full job description.',
    salary: salaryStr,
    type: job.job_employment_type || 'Full-time',
    isExternal: true,
    externalUrl: job.job_apply_link || job.job_google_link,
    createdAt: job.job_posted_at_datetime_utc || new Date().toISOString(),
    experienceLevel: job.job_required_experience?.required_experience_in_months 
                     ? `${Math.floor(job.job_required_experience.required_experience_in_months / 12)} yrs` 
                     : 'Entry/Mid',
    requirements: ['External ATS Listing'],
  };
};

export const getExternalJobs = async (keyword = '') => {
  const kw = keyword.toLowerCase().trim();
  const now = Date.now();

  if (!kw) return [];

  // 1. Check Cache
  if (cache.has(kw)) {
    const cachedData = cache.get(kw);
    if ((now - cachedData.timestamp) < CACHE_TTL) {
      return cachedData.jobs;
    }
  }

  // 2. Perform JSearch API Request
  try {
    console.log(`[ExternalJobProvider] Fetching JSearch jobs for "${kw}"...`);
    
    // We add "in India" to strictly scope the jobs if the keyword doesn't specify a location.
    const searchQuery = kw.includes('india') ? kw : `${kw} in India`;

    const response = await axios.get('https://jsearch.p.rapidapi.com/search-v2', {
      params: {
        query: searchQuery,
        page: '1',
        num_pages: '1'
      },
      headers: {
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': '3cd90941abmshfa66e3963cd7d42p1bc5c2jsneb0615e3c847'
      }
    });

    if (response.data && response.data.data) {
      const rawJobArray = Array.isArray(response.data.data) ? response.data.data : Object.values(response.data.data);
      const jobArray = rawJobArray.flat(Infinity);
      
      if (jobArray.length > 0) {
        console.log("[ExternalJobProvider] First raw job:", JSON.stringify(jobArray[0]).substring(0, 200));
        const normalizedJobs = jobArray.map(job => {
          try {
            return normalizeJob(job);
          } catch (e) {
            console.error('[ExternalJobProvider] Failed to normalize job:', e.message);
            return null;
          }
        }).filter(Boolean).filter(j => j.title && j.title !== 'Untitled Job');
        
        // Update cache
        cache.set(kw, {
          timestamp: now,
          jobs: normalizedJobs
        });

        console.log(`[ExternalJobProvider] JSearch complete! Found ${normalizedJobs.length} jobs.`);
        return normalizedJobs;
      }
    }
    
    console.log(`[ExternalJobProvider] JSearch complete! Found 0 jobs.`);
    
    return []; 
  } catch (error) {
    console.error(`[ExternalJobProvider] Failed to fetch external jobs:`, error.message);
    
    // Graceful degradation
    if (cache.has(kw)) {
      console.warn(`[ExternalJobProvider] Serving stale cache due to failure.`);
      return cache.get(kw).jobs;
    }
    return [];
  }
};
