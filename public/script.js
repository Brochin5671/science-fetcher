// Sends post request to fetch articles with given topic and returns article data
async function fetchArticles(topic){
	const options = {
		method: 'POST',
		headers:{
			'Content-Type': 'text/plain'
		},
		body: topic
	};
	const res = await fetch('/data',options);
	const data = await res.json();
	return data;
}

// Updates list with article information and link
function displayArticles(topic){
	
	// Get list element and display loading text
	let articleList = document.querySelectorAll('.media');
	for(let i=0;i<articleList.length;i++){
		// Disable link and display loading labels
		articleList[i].querySelector('a').removeAttribute('href');
		articleList[i].querySelector('a').innerHTML = ' Fetching...';
		articleList[i].querySelector('p').innerHTML = '';
		articleList[i].querySelector('img').src = 'favicon-32x32.png';
		articleList[i].querySelector('img').alt = "Fetching image";
		articleList[i].querySelector('img').className = 'd-flex spinner-grow m-2';
	}
	
	// Store session item for button selected
	if(sessionStorage.getItem('btnPressed') === null){ // Beginning of session check
		sessionStorage.setItem('btnPressed','General');
		topic = sessionStorage.getItem('btnPressed');
	}else{
		sessionStorage.setItem('btnPressed',topic);
	}
	
	// Toggle selected topic only and disable buttons while fetching
	let btnList = document.querySelectorAll('.topic');
	for(let i=0;i<btnList.length;i++){
		btnList[i].className = 'nav-link topic disabled';
		btnList[i].setAttribute('tabindex',-1);
	}
	document.querySelector('#'+topic).className += ' active';
	
	// Fetch article data
	const data = fetchArticles(topic);
	// Update links, titles, and dates once async function has finished
	data.then((data) => {
		for(let i=0;i<articleList.length;i++){
			// Remove spinner, and update links, titles, sites & dates, images with data
			articleList[i].querySelector('img').className = 'd-flex img-thumbnail m-2';
			try{
				articleList[i].querySelector('a').href = 'https://news.google.com'+data[i].url;
				articleList[i].querySelector('a').innerHTML = data[i].title;
				articleList[i].querySelector('p').innerHTML = data[i].site+" - "+data[i].date;
				articleList[i].querySelector('img').src = data[i].image;
				articleList[i].querySelector('img').alt = data[i].title;
			}catch(e){ // Return server error message if missing data
				articleList[i].querySelector('a').innerHTML = 'Failed to fetch article - Server Error (try again)';
				articleList[i].querySelector('img').alt = "No image found";
			}
		}
		// Enable buttons and keyboard focusing
		for(let i=0;i<btnList.length;i++){
			btnList[i].className = 'nav-link topic';
			btnList[i].removeAttribute('tabindex');
		}
		document.querySelector('#'+topic).className += ' active';
	}, (failure) => { // Return connection error message if promise was rejected
		for(let i=0;i<articleList.length;i++){
			// Remove spinner and add failure text
			articleList[i].querySelector('img').className = 'd-flex img-thumbnail m-2';
			articleList[i].querySelector('a').innerHTML = 'Failed to fetch article - Connection Error (try again)';
			articleList[i].querySelector('img').alt = "No image found";
		}
		// Enable buttons and keyboard focusing
		for(let i=0;i<btnList.length;i++){
			btnList[i].className = 'nav-link topic';
			btnList[i].removeAttribute('tabindex');
		}
		document.querySelector('#'+topic).className += ' active';
	});
}

// After first visit don't display how-to text
function checkFirstVisit(){
	if(localStorage.getItem('firstVisit') === null){
		localStorage.setItem('firstVisit','true');
	}else{
		document.querySelector('.firstvisit').remove();
	}
}

// Run scripts when page loads
function onLoadScripts(){
	checkFirstVisit();
	displayArticles(sessionStorage.getItem('btnPressed')); // Use last selected button's value
}