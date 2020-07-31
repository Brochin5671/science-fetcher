// Fetches article names and links
function fetchArticles(){
	
	// Prevent adding more rows
	if(document.getElementsByTagName("tr").length > 1){
		alert("Fetched already");
		return;
	}
	
	// Get table
	var table = document.getElementById("table");
	
	// Create and add row with article and link n times
	for(i=0;i<10;i++){
		var row = document.createElement("tr");
		var article = document.createElement("td");
		var link = document.createElement("a");
		link.href = "about.html";
		link.appendChild(document.createTextNode("Article "+(i+1)));
		table.appendChild(row);
		row.append(article);
		article.append(link);
	}
}