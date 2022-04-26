import cloudscraper

scraper = cloudscraper.create_scraper()  # returns a CloudScraper instance


def getPage(page):
	print(page)
	f = open(f'zonapro{page}.html', "w")
	f.write(scraper.get(f'https://www.zonaprop.com.ar/departamentos-ph-alquiler-monte-castro-villa-devoto-villa-real-desde-2-hasta-3-ambientes-pagina-{page}.html').text)
	f.close()

for page in [1,2,3,4]:
	getPage(page)