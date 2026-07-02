import axios from 'axios';

async function test() {
  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search-v2', {
      params: {
        query: 'backend in India',
        page: '1',
        num_pages: '1'
      },
      headers: {
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': '3cd90941abmshfa66e3963cd7d42p1bc5c2jsneb0615e3c847'
      }
    });
    console.log("Keys in response.data:", Object.keys(response.data));
    const normalizeJob = (job) => {
  const locationStr = [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'India';
  const salaryStr = (job.job_min_salary && job.job_max_salary) 
    ? `$${job.job_min_salary} - $${job.job_max_salary} / ${job.job_salary_period}` 
    : 'Not disclosed';

  return {
    _id: `ext_${job.job_id}`,
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
    const mapped = response.data.data.map(normalizeJob);
    console.log("Mapped successfully:", mapped.length);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
