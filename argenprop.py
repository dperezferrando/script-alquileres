import cloudscraper

scraper = cloudscraper.create_scraper()  # returns a CloudScraper instance

print("DESCARGANDO HTMLS DE ARGENPROP....................")

def getPage(page):
	print(f'Descargando pagina {page}')
	f = open(f'htmls/argenprop{page}.html', "w")
	f.write(scraper.get(f'https://url-con-filtro?pagina-{page}').text)
	f.close()

for page in []: #paginas 1,2,3
	getPage(page)

print("PAGINAS DESCARGADAS.............")