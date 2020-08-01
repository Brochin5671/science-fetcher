const fetch = require('fetch');

// Displays article names and links
function displayArticles(){
	// Prevent adding more rows
	if(document.getElementsByTagName("tr").length > 1){
		alert("Fetched already");
		return;
	}
	
	// Get table and object array
	let table = document.getElementById("table");
	var articleData = fetchArticles();
	
	
	// Create and add row with article and link n times
	for(let i=0;i<10;i++){
		let row = document.createElement("tr");
		let article = document.createElement("td");
		let link = document.createElement("a");
		link.href = articleData[i].link;
		link.appendChild(document.createTextNode(articleData[i].article));
		table.appendChild(row);
		row.append(article);
		article.append(link);
	}
}