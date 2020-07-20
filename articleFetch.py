#libraries
import bs4
from bs4 import BeautifulSoup as soup
from urllib.request import urlopen
import pandas as pd

#get xml page
news_url="https://news.google.com/rss/search?hl=en-CA&gl=CA&ceid=CA:en&q=science+news&tbm=nws"
Client=urlopen(news_url)
xml_page=Client.read()
Client.close()
articles=[] #list to store article names
links=[] #list to store article links

#extract data from xml page
soup_page=soup(xml_page,"xml")
news_list=soup_page.findAll("item")
for news in news_list:
    article=news.title.text
    link=news.link.text
    articles.append(article)
    links.append(link)

#store data to csv file
df = pd.DataFrame({'Articles':articles,'Links':links})
df.to_csv('articles.csv',index=False,encoding='utf-8-sig')
