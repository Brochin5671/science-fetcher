// Require express and compression, and setup app and port
const express = require('express');
const compression = require('compression');
var app = express();
var port = process.env.PORT || 8000;

// Require request and cheerio
const request = require('request');
const cheerio = require('cheerio');

// Compress all responses
app.use(compression());

// Redirect to secure if request is not secure and not localhost
if(port == process.env.PORT){
	// Enable reverse proxy support
	app.enable('trust proxy');
	app.use((req,res,next) => {
		if(req.secure) next();
		else res.redirect(301,'https://'+req.headers.host+req.url);
	});
}

// Serves static files from static without .html extension and root
app.use(express.static('static', { extensions: ['html'] } ));
app.use(express.static(__dirname));

// Listen to port
app.listen(port);

// Use string parser with 1mb limit
app.use(express.text( { limit: '1mb' } ));

// Get post request from /data, scrape information, and return article data
app.post('/data',(req,res) => {
	// Open url and load html
	var data = [];
	request('https://news.google.com/rss/topics/'+req.body,(error,response,body) => {
		// Check for errors after requesting url
		if(!error && response.statusCode == 200){
			// Search the first n items for title, link, and date, and store it in list
			const $ = cheerio.load(body);
			let i = 0;
			$('item').each(function () {
				if(i > 14) return false;
				const title = $(this).find('title').text();
				const url = $(this).find('link')[0].next.data;
				const date = $(this).find('pubDate').text().substring(5,16);
				data.push({title,url,date});
				i++;
			});
			// Send back data in response
			res.json(data);
		}
	});
});

// Error 404 page, has to be last route
app.get('*',(req,res) => {
  res.status(404).send('<h1 style="font-family: Verdana; margin-bottom: 0; text-align: center;">Error 404</h1><p style="font-family: Verdana; text-align: center;">Page not found</p>');
});