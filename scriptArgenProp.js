const axios = require("axios");
const Promise = require("bluebird");
const _ = require("lodash");
const fs = Promise.promisifyAll(require("fs"))
const { Table } = require('console-table-printer');
const cheerio = require("cheerio");
let lastResults

const FILENAME = `./argenPropResults.js`;

try {
	lastResults = require(FILENAME)
}
catch (e) {
	lastResults = []
}

console.log("BUSCANDO EN ARGEN PROP.................")

const falopaToNumber = falopa => parseInt(_(falopa).filter(it => _.isFinite(parseInt(it))).take(6).join("")) || 0

const table = new Table({
	columns: [{ name: "title", alignment: "left" }, { name: "m2" }, { name: "rooms" }, { name: "expensas" }, { name: "price" }, { name: "total" }, { name: "location", alignment: "left" }, { name: "permalink", alignment: "left", maxLen: 10 }],
	sort: (r1, r2) => r2.rooms - r1.rooms || r1.price - r2.price || r2.m2 - r1.m2 
});

Promise.map([1, 2, 3, 4, 5, 6, 7, 8,9,10,11], page => fs.readFileAsync(`./htmls/argenprop${page}.html`))
	.map(data => cheerio.load(data))
	.map($ => {
		return {
			results: $('.listing__item').get().map(it => {
				const price = falopaToNumber($(it).find(".card__price").text());
				const expensas = falopaToNumber($(it).find(".card__expenses").text());
				return {
					price,
					expensas,
					rooms: falopaToNumber($(it).find("li").filter((i, el) => new RegExp(/dorm/, "gi").test($(el).text())).first().text()) + 1,
					m2: _($(it).find("span"))
						.map(it => $(it).text()).filter(it => new RegExp(/m²/, "gi").test(it))
						.map(falopaToNumber)
						.take(1)
						.value(),
					total: price + expensas,
					location: _.truncate(_.trim($(it).find(".card__address").text().replace(/\r?\n|\r/g, " ")), { length: 20 }),
					permalink: `https://www.argenprop.com${$(it).find("a").first().attr("href")}`,
					id: $(it).find("a").first().attr("data-item-card"),
					title: _.truncate(_.trim($(it).find(".card__title--primary").text().replace(/\r?\n|\r/g, " ")), { length: 15 })
				}
			}),
			count: parseInt(_.replace(_.trim($('.listing-header__results').text()), /\D+/, ""))

		}
	})
	.reduce((a, b) => ({ results: a.results.concat(b.results), count: a.count }))
	.tap(({ results, count }) => console.log("Encontre", results.length, "Deberia haber", count))
	.get("results")
	.tap(results => {
		const newResults = _.uniqBy(lastResults.concat(results), "id");
		return fs.writeFileAsync(FILENAME, `module.exports=${JSON.stringify(newResults)}`)
	})
	.filter(result => !_.some(lastResults, it => it.id == result.id))
	.tap(results => console.log("Solo ", results.length, "son nuevos"))
	.tap(() => console.log("------------------------------------------------------------------------------------------------------------------------------------------"))
	.tap(results => { table.addRows(results); table.printTable() })
	.tap(() => console.log("FIN TABLA ARGEN PROP............."))

