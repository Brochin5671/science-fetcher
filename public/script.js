// Create topic map where topic is key and id is value
function createTopicMap(){
	topicMap = new Map();
	topicMap.set('General','CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y1RjU0JXVnVMVWRDR2dKRFFTZ0FQAQ');
	topicMap.set('Space','CAAqIggKIhxDQkFTRHdvSkwyMHZNREU0TXpOM0VnSmxiaWdBUAE');
	topicMap.set('Technology','CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKRFFTZ0FQAQ');
	topicMap.set('Biology','CAAqJQgKIh9DQkFTRVFvSUwyMHZNREUxTkRBU0JXVnVMVWRDS0FBUAE');
	topicMap.set('Computing','CAAqIQgKIhtDQkFTRGdvSUwyMHZNREZzY0hNU0FtVnVLQUFQAQ');
	topicMap.set('Physics','CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFZ4YW5RU0FtVnVLQUFQAQ');
}

// Retrieves id from map with topic key and returns it
function getID(topic){
	return topicMap.get(topic);
}

// Sends post request to fetch articles with given id and returns article data
async function fetchArticles(id){
	const options = {
		method: 'POST',
		headers:{
			'Content-Type': 'text/plain',
		},
		body: id
	};
	const res = await fetch('/data',options);
	const data = await res.json();
	return data;
}

// Updates list with article information and link
function displayArticles(topic){
	
	// Get list element and display loading text
	let articleList = document.querySelectorAll('.article');
	for(let i=0;i<articleList.length;i++){
		// Add spinner
		if(articleList[i].querySelector('span') === null){
			let spinner = document.createElement('span');
			spinner.className = 'spinner-border spinner-border-sm ml-auto';
			articleList[i].insertBefore(spinner,articleList[i].querySelector('a'));
		}
		// Disable link and display loading labels
		articleList[i].querySelector('a').removeAttribute('href');
		articleList[i].querySelector('a').innerHTML = ' Fetching...';
		articleList[i].querySelector('p').innerHTML = '';
		articleList[i].querySelector('img').src = 'favicon-32x32.png';
		articleList[i].querySelector('img').alt = "Fetching image";
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
	}
	document.querySelector('#'+topic).className += ' active';
	
	// Fetch id of topic and fetch article data
	const id = getID(topic);
	const data = fetchArticles(id);
	// Update links, titles, and dates once async function has finished
	data.then((data) => {
		for(let i=0;i<articleList.length;i++){
			// Update links, titles, site & dates, and images with data, and remove spinner
			articleList[i].querySelector('.spinner-border').remove();
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
		// Enable buttons
		for(let i=0;i<btnList.length;i++){
			btnList[i].className = 'nav-link topic';
		}
		document.querySelector('#'+topic).className += ' active';
	}, (failure) => { // Return connection error message if promise was rejected
		for(let i=0;i<articleList.length;i++){
			// Remove spinner and add failure text
			articleList[i].querySelector('.spinner-border').remove();
			articleList[i].querySelector('a').innerHTML = 'Failed to fetch article - Connection Error (try again)';
			articleList[i].querySelector('img').alt = "No image found";
		}
		// Enable buttons
		for(let i=0;i<btnList.length;i++){
			btnList[i].className = 'nav-link topic';
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
	createTopicMap();
	displayArticles(sessionStorage.getItem('btnPressed')); // Use last selected button's value
}