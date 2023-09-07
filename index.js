// Require express and compression, and setup app and port
const express = require('express');
const compression = require('compression');
const app = express();
const port = process.env.PORT || 3000;

// Require axios and cheerio
const axios = require('axios');
const cheerio = require('cheerio');

// Compress all responses and remove x-powered-by header
app.use(compression());
app.disable('x-powered-by');

// Listen to port
app.listen(port, () => console.log(`Now running on ${port}`));

// Serves static files without .html extension
app.use(express.static('public', { extensions: ['html'] }));

// Get request from /data, get ID, scrape information with provided ID, and return article data
app.get('/data', (req, res) => {
  const id = getID(req.query.topic);
  if (!id) {
    res.status(400).json({ error: 'Bad request' });
    return;
  }

  // Run scraper
  requestURL(id).then(
    (data) => {
      res.json(data);
    },
    (failure) => {
      // Log any failures
      console.log(failure);
      res.status(500).json({ error: 'Server error' });
    }
  );
});

// Create topic map where topic is key and id is value
function createTopicMap() {
  topicMap = new Map();
  topicMap.set(
    'General',
    'CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y1RjU0JXVnVMVWRDR2dKRFFTZ0FQAQ'
  );
  topicMap.set('Space', 'CAAqIggKIhxDQkFTRHdvSkwyMHZNREU0TXpOM0VnSmxiaWdBUAE');
  topicMap.set(
    'Technology',
    'CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKRFFTZ0FQAQ'
  );
  topicMap.set(
    'Biology',
    'CAAqJQgKIh9DQkFTRVFvSUwyMHZNREUxTkRBU0JXVnVMVWRDS0FBUAE'
  );
  topicMap.set(
    'Computing',
    'CAAqJQgKIh9DQkFTRVFvSUwyMHZNREZzY0hNU0JXVnVMVWRDS0FBUAE'
  );
  topicMap.set(
    'Physics',
    'CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFZ4YW5RU0JXVnVMVWRDS0FBUAE'
  );
}
createTopicMap();

// Retrieves id from map with topic key and returns it
function getID(topic) {
  return topicMap.get(topic);
}

// Declare article object
class Article {
  constructor() {
    this.title = '';
    this.url = '';
    this.date = '';
    this.image = '';
  }
}

// Gets article data by requesting URL with given ID, scrapes data, and returns the list as a promise
function requestURL(id) {
  return new Promise(async function (resolve, reject) {
    // Load and extract data
    const data = [];
    try {
      const { data: content } = await axios.get(
        `https://news.google.com/topics/${id}`,
        {
          'Accept-Encoding': 'gzip, deflate, br',
        }
      );
      const $ = cheerio.load(
        content,
        {
          // Disable xmlMode to parse HTML with htmlparser2
          xml: {
            xmlMode: false,
          },
        },
        false
      );

      // Go through articles
      const elements = $('article');
      const n = 14;
      let i = 0;
      for (const element of elements) {
        if (i > n) break;

        // Skip article if no major images
        const image = $(element).find('figure > img').attr('srcset');
        if (!image) continue;
        const article = new Article();
        article.title = $(element).find('h4').text();
        article.url = $(element).find('a').attr('href')?.slice(1);
        article.date = $(element).find('time').text();

        // If no site name, use site logo
        const site =
          $(element)
            .find('div > div > div > div > div > div > div')
            .text()
            .split('More')?.[0] ||
          $(element).find('div > div > div > div').text().split('More')?.[0];
        article.site = site;
        const img = image.split(' '); // If there are two links, splits them
        article.image = img[0]; // Use the first link
        data.push(article);
        i++;
      }
    } catch (e) {
      reject(e);
      return;
    }
    resolve(data);
  });
}

// Send 404 page if page not found, has to be last route
app.get('*', (req, res) => {
  res.status(404).sendFile(__dirname + '/404-page.html');
});

// Log server errors
app.on('error', (error) => console.error('Server error: ', error));

module.exports = app;
