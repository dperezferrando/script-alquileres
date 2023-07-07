import cloudscraper

scraper = cloudscraper.create_scraper()  # returns a CloudScraper instance

print("DESCARGANDO HTMLS DE ARGENPROP....................")

def getPage(page):
	print(f'Descargando pagina {page}')
	f = open(f'htmls/argenprop{page}.html', "w")
	f.write(scraper.get(f'https://www.argenprop.com/departamento-y-ph-alquiler-sub-barrio-monte-castro-barrio-villa-devoto-barrio-villa-pueyrredon-barrio-villa-real-2-ambientes-y-3-ambientes-pagina-{page}').text)
	f.close()

for page in [1,2,3,4,5,6,7,8]:
	getPage(page)

print("PAGINAS DESCARGADAS.............")