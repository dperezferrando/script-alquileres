const axios = require("axios");
const Promise = require("bluebird");
const _ = require("lodash");
const fs = Promise.promisifyAll(require("fs"))
const { Table } = require('console-table-printer');
let lastResults

const FILENAME = `./meliLastResults.js`;

try {
	lastResults = require(FILENAME)
}
catch(e){
	lastResults = []
}

console.log("BUSANDO EN MELI.....................")

const table = new Table({
 columns: [{ name: "title", alignment: "left" }, { name: "m2" }, { name: "rooms" }, { name: "expensas" }, { name: "price" }, { name: "total"}, { name: "location", alignment: "left" }, { name: "permalink", alignment: "left", maxLen: 10}],
 sort: (r1, r2) => r2.rooms - r1.rooms || r1.total - r2.total || r2.m2 - r1.m2
});

// Devoto, Monte Castro, Villa Real
const neighborhoods = ["TUxBQlZJTDYzNzZa", "TUxBQk1PTjE2OTBa", "TUxBQlZJTDM3Mzda"]

Promise.map(neighborhoods, neighborhood => axios.get(`https://api.mercadolibre.com/sites/MLA/search?category=MLA1459&state=TUxBUENBUGw3M2E1&neighborhood=${neighborhood}&operation=242073&rooms=[2-3]&since=today`))
.map(it => it.data.results)
.then(_.flatten)
.tap(results => console.log("Encontre", results.length))
.tap(results => fs.writeFileAsync(FILENAME, `module.exports=${JSON.stringify(results)}`))
.filter(result => !_.some(lastResults, it => it.permalink == result.permalink))
.tap(results => console.log("Solo ", results.length, "son nuevos"))
.map(search => Promise.props({ listing: axios.get(`https://api.mercadolibre.com/items/${search.id}`).then(it => it.data), search }))
.tap(() => console.log("------------------------------------------------------------------------------------------------------------------------------------------"))
.map(({ search: { location: { address_line }, permalink, price, title, attributes }, listing: { attributes: listingAttributes } }) =>{
	const m2 = _.get(_.find(attributes, { id: "COVERED_AREA"}), "value_struct.number", 0)
	const rooms = _.get(_.find(attributes, { id: "ROOMS"}), "value_name", "0")
	const expensas = _.get(_.find(listingAttributes, { id: "MAINTENANCE_FEE" }), "value_struct.number", 0)
    return { title: _.truncate(title, { length: 15 }), m2, rooms: parseInt(rooms), expensas, price: parseInt(price), total: parseInt(expensas + price), location: _.truncate(address_line, { length: 20 }), permalink: _.trim(permalink) }
})
.then(results => _.orderBy(results, ["rooms", "m2", "total"], ["desc", "desc", "asc"]))
.tap(results => { table.addRows(results); table.printTable()})
.tap(() => console.log("FIN TABLA MELI............."))