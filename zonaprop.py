# import cloudscraper

# scraper = cloudscraper.create_scraper()  # returns a CloudScraper instance

import cloudscraper 

scraper = cloudscraper.create_scraper(delay=10, browser="chrome") 

print("DESCARGANDO HTMLS DE ZONAPROP....................")

def getPage(page):
	print(f'Descargando pagina {page}')
	f = open(f'htmls/zonapro{page}.html', "w", encoding="utf-8")
	f.write(scraper.get(f'https://url-con-filtro-{page}.html').text)
	f.close()

for page in []: #paginas 1,2,3
	getPage(page)

print("PAGINAS DESCARGADAS.............")