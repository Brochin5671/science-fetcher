// Require express and compression, and setup app and port
const express = require('express');
const compression = require('compression');
const app = express();
const port = process.env.PORT || 3000;

// Require chromium and playwright
const chromium = require('chrome-aws-lambda');
const playwright = require('playwright-core');

// Compress all responses and remove x-powered-by header
app.use(compression());
app.disable('x-powered-by');

// Listen to port
app.listen(port, () => console.log(`Now running on ${port}`));

// Serves static files without .html extension
app.use(express.static(__dirname + '/public', { extensions: ['html'] }));

// Get post request from /data, get ID, scrape information with provided ID, and return article data
app.get('/data', (req, res) => {
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
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
  topicMap.set(
    'Space',
    'CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y1RjU0JXVnVMVWRDR2dKRFFTZ0FQAQ/sections/CAQiTENCQVNNd29JTDIwdk1EWnRjVGNTQldWdUxVZENHZ0pEUVNJUENBUWFDd29KTDIwdk1ERTRNek4zS2dzU0NTOXRMekF4T0RNemR5Z0EqLggAKioICiIkQ0JBU0ZRb0lMMjB2TURadGNUY1NCV1Z1TFVkQ0dnSkRRU2dBUAFQAQ'
  );
  topicMap.set(
    'Technology',
    'CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKRFFTZ0FQAQ'
  );
  topicMap.set(
    'Biology',
    'CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y1RjU0JXVnVMVWRDR2dKRFFTZ0FQAQ/sections/CAQiSkNCQVNNUW9JTDIwdk1EWnRjVGNTQldWdUxVZENHZ0pEUVNJT0NBUWFDZ29JTDIwdk1ETTJYeklxQ2hJSUwyMHZNRE0yWHpJb0FBKi4IACoqCAoiJENCQVNGUW9JTDIwdk1EWnRjVGNTQldWdUxVZENHZ0pEUVNnQVABUAE'
  );
  topicMap.set(
    'Computing',
    'CAAqJQgKIh9DQkFTRVFvSUwyMHZNREZzY0hNU0JXVnVMVWRDS0FBUAE'
  );
  topicMap.set(
    'Physics',
    'CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y1RjU0JXVnVMVWRDR2dKRFFTZ0FQAQ/sections/CAQiSkNCQVNNUW9JTDIwdk1EWnRjVGNTQldWdUxVZENHZ0pEUVNJT0NBUWFDZ29JTDIwdk1EVnhhblFxQ2hJSUwyMHZNRFZ4YW5Rb0FBKi4IACoqCAoiJENCQVNGUW9JTDIwdk1EWnRjVGNTQldWdUxVZENHZ0pEUVNnQVABUAE'
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

// Helper for getting ElementHandle property
async function getProperty(element, property) {
  return (await element?.getProperty(property))?.jsonValue();
}

// Gets article data by requesting URL with given ID, scrapes data, and returns the list as a promise
function requestURL(id) {
  return new Promise(async function (resolve, reject) {
    // Launch playwright
    const browser = await playwright.chromium.launch({
      args: [...chromium.args, '--font-render-hinting=none'],
      headless: true,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Go to page
    const url = 'https://news.google.com/topics/' + id;
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
    });

    // Reject if page not found
    if (response.status() !== 200) {
      await browser.close();
      reject(`${url} responded with a ${response.status()}`);
      return;
    }

    // Load and extract data
    const elements = await page.$$('article');
    const data = [];
    const n = 14;
    let i = 0;
    for (const element of elements) {
      if (i > n) break;

      // Skip article if no major images
      const image = await getProperty(
        await element.$('figure > img'),
        'srcset'
      );
      if (!image) continue;
      let article = new Article();
      article.title = await getProperty(await element.$('h4'), 'innerText');
      article.url = await getProperty(await element.$('a'), 'href');
      article.date = await getProperty(await element.$('time'), 'innerText');

      // If no site name, use site logo
      const site =
        (await getProperty(
          await element.$('div > div > div > div > div > div > div'),
          'innerText'
        )) ??
        (await getProperty(
          await element.$('div > div > div > div'),
          'innerText'
        ));
      article.site = site;
      const img = image.split(' '); // If there are two links, splits them
      article.image = img[0]; // Use the first link
      data.push(article);
      i++;
    }
    await browser.close();
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
