import requests
from bs4 import BeautifulSoup

response = requests.get(
    "https://wuo-wuo.com/")
article_url = 'https://wuo-wuo.com'
soup = BeautifulSoup(response.text, "html.parser")
data = soup.select("h3.article-title a")
date = soup.select("time")

for da in date:
    for d in data:
        contentUrl = article_url + d['href']
        r = requests.get(contentUrl)
        
        soupN = BeautifulSoup(r.text, "html.parser")
        name = soupN.select("dl.article-info span")[0]
        for n in name:
            prt = n.text, d.text[5:], da.text[6:10]
            print(prt)
        