const ObjectId = require('mongodb').ObjectID;

class Model {
	constructor(db, collectionName) {
		this.name = collectionName;
		this.db = db;
	}
	async insertOne(data) {
		const operation = await this.db.collection(this.name).insertOne(data);
		if (operation.result.ok !== 1 || operation.ops.length !== 1) {
			throw new Error('Db insertOne error');
		}
		return operation.ops[0];
	}
	async findOneById(id) {
		let query = {
			_id: ObjectId(id)
		}
		const result = await this.db.collection(this.name).findOne(query);
		if (!result) {
			throw new Error('Db findOneById error');
		}
		return result;
	}
	async findOneAndUpdate(id, data) {
		const query = {_id: ObjectId(id)};
		const modifier = {$set: data};
		const options = {returnOriginal: false};
		const operation = await this.db
			.collection(this.name)
			.findOneAndUpdate(query, modifier, options);

		if (!operation.value) {
			throw new Error('Db findOneAndUpdate error');
		}
		return operation.value;
	}
	async removeOne(id) {
		const query = {_id: ObjectId(id)};
		const operation = await this.db.collection(this.name).remove(query);
		if (operation.result.n !== 1) {
			throw new Error('Db remove error');
		}
		return {success: true};
	}
}

module.exports = Model;
