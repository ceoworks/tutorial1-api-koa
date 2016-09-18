const MongoClient = require('mongodb').MongoClient;
const config = require('config');
const Model = require('./model');
let db;

class Db {
	async connect() {
		if (!db) {
			db = await MongoClient.connect(config.db.url);
			this.Bird = new Model(db, 'birds');
		}
	}
};

module.exports = new Db();
