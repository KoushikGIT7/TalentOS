import axios from 'axios';

async function test() {
  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search-v2', {
      params: {
        query: 'backend', // Let's try the exact query that failed
        page: '1',
        num_pages: '1'
      },
      headers: {
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': '3cd90941abmshfa66e3963cd7d42p1bc5c2jsneb0615e3c847'
      }
    });
    console.log("data property type:", typeof response.data.data);
    console.log("Is Array?", Array.isArray(response.data.data));
    console.log("data value:", response.data.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
