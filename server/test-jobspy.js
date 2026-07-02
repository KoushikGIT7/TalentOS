import { scrapeJobs } from 'jobspy-node';

async function test() {
  try {
    const jobs = await scrapeJobs({
      site_name: ["linkedin"],
      searchTerm: "frontend developer",
      location: "India",
      results_wanted: 10,
    });
    
    console.log(JSON.stringify(jobs, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
