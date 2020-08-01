// Get express
const express = require('express');
var app = express();

// Use templates
app.use(express.static(__dirname));
var port = process.env.PORT || 8000;
app.listen(port);