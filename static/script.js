// Create topic map where topic is key and id is value
function createTopicMap(){
	topicMap = new Map();
	topicMap.set('gen','CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y1RjU0JXVnVMVWRDR2dKRFFTZ0FQAQ');
	topicMap.set('space','CAAqIggKIhxDQkFTRHdvSkwyMHZNREU0TXpOM0VnSmxiaWdBUAE');
	topicMap.set('tech','CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKRFFTZ0FQAQ');
	topicMap.set('bio','CAAqJQgKIh9DQkFTRVFvSUwyMHZNREUxTkRBU0JXVnVMVWRDS0FBUAE');
	topicMap.set('comp','CAAqIQgKIhtDQkFTRGdvSUwyMHZNREZzY0hNU0FtVnVLQUFQAQ');
	topicMap.set('phys','CAAqIQgKIhtDQkFTRGdvSUwyMHZNRFZ4YW5RU0FtVnVLQUFQAQ');
}

// Retrieves id from map with topic key and returns it
function getTopic(topic){
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
		// Disable link and add loading text
		articleList[i].querySelector('a').removeAttribute('href');
		articleList[i].querySelector('a').innerHTML = ' Fetching...';
		articleList[i].querySelector('p').innerHTML = 'N/A';
	}
	
	// Store session item for button selected
	if(sessionStorage.getItem('btnPressed') === null){ // Beginning of session check
		sessionStorage.setItem('btnPressed','gen');
	}else{
		sessionStorage.setItem('btnPressed',topic);
	}
	topic = sessionStorage.getItem('btnPressed');
	
	// Toggle button (test for now)
	toggleButtonFromDropdown(topic);
	
	// Fetch id of topic and fetch article data
	const id = getTopic(topic);
	const data = fetchArticles(id);
	// Update links, titles, and dates once async function has finished
	data.then((data) => {
		// Update links, titles, and dates
		for(let i=0;i<articleList.length;i++){
			// Remove spinner if exists
			if(articleList[i].querySelector('span') != null){
				articleList[i].querySelector('span').remove();
			}
			// Update link, title, and date with data
			articleList[i].querySelector('a').href = data[i].url;
			articleList[i].querySelector('a').innerHTML = data[i].title;
			articleList[i].querySelector('p').innerHTML = data[i].date;
		}
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

// Find and toggle button based on session item value (come fix this sometime)
function toggleButtonSession(topic){
	// Change to default if beginning of session
	if(topic === null){
		topic = 'gen';
	}
	$('label').each(function(){
		if($(this).find('input')[0].defaultValue == topic){
			$(this).button('toggle');
		}
	});
}

// Toggle buttons in button group incase user is using dropdown and switches back to button group
function toggleButtonFromDropdown(topic){
	$('label').each(function(){
		if($(this).find('input')[0].defaultValue == topic){
			$(this).button('toggle');
		}
	});
}

// Run scripts when page loads
function onLoadScripts(){
	checkFirstVisit();
	createTopicMap();
	toggleButtonSession(sessionStorage.getItem('btnPressed'));
	displayArticles(sessionStorage.getItem('btnPressed')); // Use last selected button's value
}