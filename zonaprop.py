# import cloudscraper

# scraper = cloudscraper.create_scraper()  # returns a CloudScraper instance

import cloudscraper 

scraper = cloudscraper.create_scraper(delay=10, browser="chrome") 

print("DESCARGANDO HTMLS DE ZONAPROP....................")

def getPage(page):
	print(f'Descargando pagina {page}')
	f = open(f'htmls/zonapro{page}.html', "w", encoding="utf-8")
	f.write(scraper.get(f'https://www.zonaprop.com.ar/departamentos-ph-venta-villa-devoto-villa-real-villa-pueyrredon-monte-castro-desde-2-hasta-3-ambientes-menos-80000-dolar-pagina-{page}.html').text)
	f.close()

for page in [1,2,3,4,5,6,7,8]:
	getPage(page)

print("PAGINAS DESCARGADAS.............")