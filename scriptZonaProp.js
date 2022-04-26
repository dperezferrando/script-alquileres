const axios = require("axios");
const Promise = require("bluebird");
const _ = require("lodash");
const fs = Promise.promisifyAll(require("fs"))
const { Table } = require('console-table-printer');
const cheerio = require("cheerio");
let lastResults

const FILENAME = `./zonaPropResults.js`;

try {
	lastResults = require(FILENAME)
}
catch(e){
	lastResults = []
}

console.log("BUSCANDO EN ZONA PROP.................")

const falopaToNumber = falopa => parseInt(_.filter(falopa, it => _.isFinite(parseInt(it))).join("")) || 0

const table = new Table({
 columns: [{ name: "title", alignment: "left" }, { name: "m2" }, { name: "rooms" }, { name: "expensas" }, { name: "price" }, { name: "total"}, { name: "location", alignment: "left" }, { name: "permalink", alignment: "left", maxLen: 10}],
 sort: (r1, r2) => r2.rooms - r1.rooms || r1.total - r2.total || r2.m2 - r1.m2
});

Promise.map([1,2,3,4], page => fs.readFileAsync(`./htmls/zonapro${page}.html`))
.map(data => cheerio.load(data))
.map($ => {
	return { 
		results: $('.postingCard').get().map(it => {
			const price = falopaToNumber($(it).find(".firstPrice").text());
			const expensas = falopaToNumber($(it).find(".postingCardExpenses").text());
			return {
				price,
				expensas,
				rooms: falopaToNumber($(it).find("li").filter((i, el) => new RegExp(/amb/, "gi").test($(el).text())).first().text()),
				m2: falopaToNumber($(it).find("li").filter((i, el) => new RegExp(/[0-9]+ m/, "gi").test($(el).text())).first().text()),
				total: price + expensas,
				location: _.truncate(_.trim($(it).find(".postingCardLocationTitle").text().replace(/\r?\n|\r/g, " ")), { length: 20 }),
				permalink: `https://www.zonaprop.com.ar${$(it).attr("data-to-posting")}`,
				id: $(it).attr("data-id"),
				title: _.truncate(_.trim($(it).find(".postingCardTitle").text().replace(/\r?\n|\r/g, " ")), { length: 15 })
			}
		}),
		count: parseInt(_.take(_.trim($('.list-result-title').text()), 2).join(""))

	}
})
.reduce((a,b) => ({ results: a.results.concat(b.results), count: a.count }))
.tap(({ results, count }) => console.log("Encontre", results.length, "Deberia haber", count))
.get("results")
.tap(results => { 
	const newResults = _.uniqBy(lastResults.concat(results), "id");
	return fs.writeFileAsync(FILENAME, `module.exports=${JSON.stringify(newResults)}`) 
 })
.filter(result => !_.some(lastResults, it => it.id == result.id))
.tap(results => console.log("Solo ", results.length, "son nuevos"))
.tap(() => console.log("------------------------------------------------------------------------------------------------------------------------------------------"))
.tap(results => { table.addRows(results); table.printTable()})
.tap(() => console.log("FIN TABLA ZONA PROP............."))

