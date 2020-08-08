// Require express
const express = require('express');
var app = express();

// Serves static files without .html extension
app.use(express.static(__dirname, {
	extensions: ['html']
}));

// Setup port
var port = process.env.PORT || 8000;
app.listen(port);