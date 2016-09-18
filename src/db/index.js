const MongoClient = require('mongodb').MongoClient;
const config = require('config');
let db;

module.exports = {
	connect: async () => {
		if (!db) {
			db = await MongoClient.connect(config.db.url);
		}
	}
};
