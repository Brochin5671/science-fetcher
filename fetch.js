// Require puppeteer
const puppeteer = require('puppeteer');

// Returns object array containing article title and link
async function fetchArticles(url) {
	// Launch browser and go to URL
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'networkidle2' });

	// Gets and returns article title and link as object
	async function articleSelect(i){
		let data = await page.evaluate((i) =>{
			let article = document.querySelector("#folder" + (i + 3) + " > div.opened > div:nth-child(1) > span:nth-child(2)").innerText;
			let link = document.querySelector("#folder" + (i + 3) + " > div.opened > div:nth-child(2) > span:nth-child(2)").innerText;
			return { article, link };
		},i);
		return data;
	}

	// Store objects in array and return it
	let articleData = [];
	for (let i = 0; i < 10; i++) {
		articleData.push(await articleSelect(i));
		console.log(articles[i]);
    }
	await browser.close();
	return articleData;
}

fetchArticles('https://news.google.com/rss/search?hl=en-CA&gl=CA&ceid=CA:en&q=science+news&tbm=nws');