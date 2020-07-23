// Fetches article names and links
function fetchArticles(){
	// Create and add table
	var table = document.getElementById("table");
	var tableBody = document.createElement("table");
	table.appendChild(tableBody);
	
	// Create and add column headers
	var headers = document.createElement("tr");
	var aHeader = document.createElement("th");
	var lHeader = document.createElement("th");
	aHeader.appendChild(document.createTextNode("Articles"));
	lHeader.appendChild(document.createTextNode("Links"));
	tableBody.appendChild(headers);
	headers.appendChild(aHeader);
	headers.appendChild(lHeader);
	
	// Create and add row with article and link n times
	for(i=0;i<10;i++){
		var row = document.createElement("tr");
		var article = document.createElement("td");
		var link = document.createElement("td");
		article.appendChild(document.createTextNode("Article "+(i+1)));
		link.appendChild(document.createTextNode("Link "+(i+1)));
		tableBody.appendChild(row);
		row.append(article);
		row.append(link);
	}
}