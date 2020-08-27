// Require express and compression, and setup app and port
const express = require('express');
const compression = require('compression');
var app = express();
var port = process.env.PORT || 8000;

// Require request and cheerio
const request = require('request');
const cheerio = require('cheerio');

// Compress all responses and remove x-powered-by header
app.use(compression());
app.disable('x-powered-by');

// Redirect to secure if request is not secure and not localhost
if(port == process.env.PORT){
	// Enable reverse proxy support
	app.enable('trust proxy');
	app.use((req,res,next) => {
		if(req.secure) next();
		else res.redirect(301,'https://'+req.headers.host+req.url);
	});
}

// Serves static files without .html extension
app.use(express.static('public', { extensions: ['html'] } ));

// Listen to port
app.listen(port);

// Use string parser with 1mb limit
app.use(express.text( { limit: '1mb' } ));

// Get post request from /data, scrape information, and return article data
app.post('/data',(req,res) => {
	requestURL(req.body).then((data) => {
		res.json(data);
	},(failure) => { // Log any failures
		console.log(failure);
	});
});

// Declare article object
function Article(){
	this.title = '';
	this.url = '';
	this.date = '';
	this.site = '';
	this.image = '';
}

// Gets article data by requesting URL with given ID, scrapes data, and returns the list as a promise
function requestURL(id){
	return new Promise(function(resolve,reject){
		request('https://news.google.com/topics/'+id,(error,response,body) => {
			// Check for errors after requesting url
			if(!error && response.statusCode == 200){
				// Search n items for title, link, date, site, and image, and store it in an object which is pushed to a list
				const $ = cheerio.load(body);
				let i = 0;
				let n = 14;
				var data = [];
				$('div.NiLAwe.y6IFtc.R7GTQ.keNKEd.j7vNaf.nID9nc').each(function () {
					if(i > n) return false;
					let article = new Article();
					article.title = $(this).find('a.DY5T1d').text();
					article.url = $(this).find('a.DY5T1d').attr('href');
					article.date = $(this).find('time').text();
					article.site = $(this).find('a.wEwyrc.AVN2gc.uQIVzc.Sksgp').text();
					const img = $(this).find('img').attr('srcset').split(' '); // If there are two links, splits them
					article.image = img[0]; // Use the first link
					data.push(article);
					i++;
				});
				// Send list (success)
				resolve(data);
			}else{
				reject(error || response.statusCode); // Send error (failure)
			}
		});
	});
}

// Send 404 page if page not found, has to be last route
app.get('*',(req,res) => {
  res.status(404).sendFile(__dirname+'/404-page.html');
});