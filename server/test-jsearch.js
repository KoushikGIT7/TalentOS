import axios from 'axios';

async function test() {
  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/search',
    params: {
      query: 'frontend developer in india',
      page: '1',
      num_pages: '1'
    },
    headers: {
      'X-RapidAPI-Key': '3cd90941abmshfa66e3963cd7d42p1bc5c2jsneb0615e3c847',
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    console.log(response.data.data.slice(0, 1));
  } catch (error) {
    console.error(error.message);
    if(error.response) console.error(error.response.status, error.response.data);
  }
}
test();
