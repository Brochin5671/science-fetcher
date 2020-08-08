// Require express, and setup app and port
const express = require('express');
var app = express();
var port = process.env.PORT || 8000;

// Redirect to secure if request is not secure and not localhost
if(port != 8000){
	// Enable reverse proxy support
	app.enable('trust proxy');
	app.use((req,res,next) => {
		if(req.secure) next();
		else res.redirect('https://'+req.headers.host+req.url);
	});
}

// Serves static files without .html extension and redirect to home if page not found
app.use(express.static(__dirname, {
	extensions: ['html']
}),(req,res) => {
	res.redirect('/');
});

// Listen to port
app.listen(port);