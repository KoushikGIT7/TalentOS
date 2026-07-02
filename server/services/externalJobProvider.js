import { scrapeJobs } from 'jobspy-node';

const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes to avoid freezing the frontend

/**
 * Normalizes a job object from JobSpy to our internal schema
 */
const normalizeJob = (job) => {
  return {
    _id: `ext_${job.id}`,
    title: job.title || 'Untitled Job',
    company: job.company || 'Unknown Company',
    location: job.location || 'India',
    description: job.description || 'View LinkedIn for full job description.',
    salary: job.compensation ? String(job.compensation) : 'Not disclosed',
    type: job.jobType || 'Full-time',
    isExternal: true,
    externalUrl: job.jobUrl,
    createdAt: job.datePosted || new Date().toISOString(),
    experienceLevel: job.jobLevel || 'Entry',
    requirements: ['LinkedIn Listing'],
  };
};

/**
 * Basic local keyword filtering for safety
 */
const filterJobs = (jobs, keyword) => {
  if (!keyword || keyword.trim() === '') return jobs;
  
  const kw = keyword.toLowerCase().trim();
  return jobs.filter(job => 
    job.title.toLowerCase().includes(kw) ||
    job.company.toLowerCase().includes(kw) ||
    job.location.toLowerCase().includes(kw)
  );
};

/**
 * Fetches external jobs using a live scraper (JobSpy), applies caching per keyword, and gracefully handles failures.
 */
export const getExternalJobs = async (keyword = '') => {
  const kw = keyword.toLowerCase().trim();
  const now = Date.now();

  // If no keyword, return empty (LinkedIn needs a search term)
  if (!kw) return [];

  // 1. Check Cache for this specific keyword
  if (cache.has(kw)) {
    const cachedData = cache.get(kw);
    if ((now - cachedData.timestamp) < CACHE_TTL) {
      return cachedData.jobs;
    }
  }

  // 2. Perform a Live Real-Time Scrape
  try {
    console.log(`[ExternalJobProvider] Starting live scrape for "${kw}" in India...`);
    
    const results = await scrapeJobs({
      site_name: ["linkedin"],
      searchTerm: kw,
      location: "India",
      results_wanted: 20, // Keep small for faster scraping
    });
    
    if (results.jobs && results.jobs.length > 0) {
      const normalizedJobs = results.jobs.map(normalizeJob);
      
      // Update cache
      cache.set(kw, {
        timestamp: now,
        jobs: normalizedJobs
      });

      console.log(`[ExternalJobProvider] Live scrape complete! Found ${normalizedJobs.length} jobs.`);
      return normalizedJobs;
    }
    
    return []; 
  } catch (error) {
    console.error(`[ExternalJobProvider] Failed to scrape external jobs for "${kw}":`, error.message);
    
    // Graceful degradation: return stale cache if we have one
    if (cache.has(kw)) {
      console.warn(`[ExternalJobProvider] Serving stale cache for "${kw}" due to scrape failure.`);
      return cache.get(kw).jobs;
    }
    return []; // Fail silently so internal jobs still load
  }
};
