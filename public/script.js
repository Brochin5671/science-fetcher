// Sends GET request to fetch articles with given topic and returns article data
async function fetchArticles(topic) {
  const url = new URL('/data', window.location.href)
  url.searchParams.append('topic', topic)
  const options = {
    method: 'GET',
  }
  const res = await fetch(url, options)
  const data = await res.json()
  return data
}

// Updates list with article information and link
function displayArticles(topic) {
  // Get list element and display loading text
  let articleList = document.querySelectorAll('.media')
  for (let i = 0; i < articleList.length; i++) {
    // Disable link and display loading labels
    const aEle = articleList[i].querySelector('a')
    aEle.removeAttribute('href')
    aEle.innerText = ' Fetching...'
    articleList[i].querySelector('p').innerText = ''
    const img = articleList[i].querySelector('img')
    img.src = 'favicon-32x32.png'
    img.alt = 'Fetching image'
    img.className = 'd-flex spinner-grow m-2'
  }

  // Store session item for button selected
  if (sessionStorage.getItem('btnPressed') === null) {
    // Beginning of session check
    sessionStorage.setItem('btnPressed', 'General')
    topic = sessionStorage.getItem('btnPressed')
  } else {
    sessionStorage.setItem('btnPressed', topic)
  }

  // Toggle selected topic only and disable buttons while fetching
  let btnList = document.querySelectorAll('.topic')
  for (let i = 0; i < btnList.length; i++) {
    btnList[i].className = 'nav-link topic disabled'
    btnList[i].setAttribute('tabindex', -1)
  }
  document.querySelector('#' + topic).className += ' active'

  // Fetch article data
  const data = fetchArticles(topic)
  // Update links, titles, and dates once async function has finished
  data.then(
    (data) => {
      for (let i = 0; i < articleList.length; i++) {
        // Remove spinner, and update links, titles, sites & dates, images with data
        const img = articleList[i].querySelector('img')
        img.className = 'd-flex img-thumbnail m-2'
        const aEle = articleList[i].querySelector('a')
        if (data?.[i]) {
          aEle.href = data[i].url
            ? `https://news.google.com${data[i].url}`
            : null
          aEle.innerText = data[i].title
          articleList[i].querySelector('p').innerText =
            data[i].site + ' - ' + data[i].date
          img.src = `data:${data[i].imageType};base64,${data[i].image}`
          img.alt = data[i].title
        } else {
          // Return server error message if missing data
          aEle.innerText = `Failed to fetch article - ${
            data.error ?? 'No more items'
          } (try again)`
          img.alt = 'No image found'
        }
      }
      // Enable buttons and keyboard focusing
      for (let i = 0; i < btnList.length; i++) {
        btnList[i].className = 'nav-link topic'
        btnList[i].removeAttribute('tabindex')
      }
      document.querySelector('#' + topic).className += ' active'
    },
    (failure) => {
      // Return connection error message if promise was rejected
      for (let i = 0; i < articleList.length; i++) {
        // Remove spinner and add failure text
        articleList[i].querySelector('img').className =
          'd-flex img-thumbnail m-2'
        articleList[i].querySelector('a').innerText =
          'Failed to fetch article - Connection Error (try again)'
        articleList[i].querySelector('img').alt = 'No image found'
      }
      // Enable buttons and keyboard focusing
      for (let i = 0; i < btnList.length; i++) {
        btnList[i].className = 'nav-link topic'
        btnList[i].removeAttribute('tabindex')
      }
      document.querySelector('#' + topic).className += ' active'
    }
  )
}

// After first visit don't display how-to text
function checkFirstVisit() {
  if (localStorage.getItem('firstVisit') === null) {
    localStorage.setItem('firstVisit', 'true')
  } else {
    document.querySelector('.firstvisit').remove()
  }
}

// Creates list items on load
function createListItem() {
  const item = document.createElement('li')
  item.className = 'media position-relative pt-2 pb-2 border-bottom'
  item.innerHTML =
    '<img class="d-flex spinner-grow m-2" src="favicon-32x32.png" alt="Fetching image" width="110" height="110"><div class="media-body mt-2"><a href="" class="d-flex mr-3 stretched-link" target="_blank" rel="noreferrer"></a><p class="mt-1 mr-3 small"></p></div>'
  document.getElementById('articles').appendChild(item)
}

// Run scripts when page loads
function onLoadScripts() {
  for (let i = 0; i < 15; i++) {
    createListItem()
  }
  checkFirstVisit()
  displayArticles(sessionStorage.getItem('btnPressed')) // Use last selected button's value
}
