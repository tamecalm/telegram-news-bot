import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const fetchNews = async () => {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      throw new Error('API key is missing. Please check your .env file.');
    }

    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
    const data = await response.json();

    if (data.status !== 'ok') {
      console.error('Error fetching news:', data.message);
      return [];  // Return an empty array if the API response is not okay
    }

    if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
      return data.articles.map(article => ({
        title: article.title || 'No title',
        content: article.content || 'No additional content available.'
      }));  // Return only the necessary fields
    } else {
      console.warn('No news available in the fetched data.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];  // Return an empty array in case of error
  }
};

export default fetchNews;
