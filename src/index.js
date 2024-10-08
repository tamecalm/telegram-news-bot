import { Telegraf } from 'telegraf';
import { config } from 'dotenv';
import fetchNews from './fetchNews.mjs';

config();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const channelId = '@YOUR_CHANNEL_USERNAME'; 
const userId = 'YOUR_USEE_ID'; // Your user ID

// Function to send a message in chunks without breaking words
const sendMessageInChunks = async (chatId, message) => {
  const chunkSize = 4096; // Maximum size of each chunk
  let startIndex = 0;

  while (startIndex < message.length) {
    let endIndex = startIndex + chunkSize;
    
    // Check if the endIndex exceeds the message length
    if (endIndex >= message.length) {
      endIndex = message.length; // Set to message length if beyond
    } else {
      // Find the last space within the chunk size limit
      endIndex = message.lastIndexOf(' ', endIndex);
      if (endIndex === -1) {
        endIndex = startIndex + chunkSize; // If no space is found, use chunkSize
      }
    }
    
    const chunk = message.substring(startIndex, endIndex).trim();
    await bot.telegram.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
    startIndex = endIndex + 1; // Move start index to the next character after space
  }
};

// Format the news article into a single string with headline and description only
const formatNews = (article) => {
  const title = article.title ? `*${article.title}*` : 'No title';

  // Use the description directly if available, or fall back to the content
  const description = article.description 
    ? article.description.replace(/[\r\n]+/g, ' ') 
    : article.content 
      ? article.content.replace(/[\r\n]+/g, ' ') 
      : 'No additional information available.';

  // Combine title and description into a single message with a paragraph break
  return `${title}\n\n${description}`;
};

// Fetch and send news function
const fetchAndSendNews = async () => {
  const newsList = await fetchNews();

  // Ensure newsList is an array and has elements
  if (Array.isArray(newsList) && newsList.length > 0) {
    // Select a random article
    const randomIndex = Math.floor(Math.random() * newsList.length);
    const selectedArticle = newsList[randomIndex];

    // Format the selected article
    const formattedNews = formatNews(selectedArticle);
    await sendMessageInChunks(channelId, formattedNews); // Send to channel only
  } else {
    const noNewsMessage = 'No news available at the moment.';
    await sendMessageInChunks(channelId, noNewsMessage); // Send to channel only
  }
};

// Command for testing news fetch
bot.command('testnews', async (ctx) => {
  if (ctx.from.id.toString() === userId) {
    const newsList = await fetchNews();

    // Ensure newsList is an array and has elements
    if (Array.isArray(newsList) && newsList.length > 0) {
      // Select a random article for testing
      const randomIndex = Math.floor(Math.random() * newsList.length);
      const selectedArticle = newsList[randomIndex];

      const formattedNews = formatNews(selectedArticle);
      await sendMessageInChunks(userId, formattedNews); // Send to private chat for testing
      ctx.reply('Test news sent to your private chat.');
    } else {
      ctx.reply('No news available for testing.');
    }
  } else {
    ctx.reply('You do not have permission to use this command.');
  }
});

// Set an interval to fetch news every hour (3600000 ms)
setInterval(fetchAndSendNews, 3600000);

// Initial call to send news immediately
fetchAndSendNews();

bot.launch();
