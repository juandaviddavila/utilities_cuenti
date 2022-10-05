const AWS = require('aws-sdk');
const { DocumentClient } = require('aws-sdk').DynamoDB;
const ObjectId = require('mongodb').ObjectID;
const getDocumentClient = () => {
	AWS.config.update({ region: 'us-west-2' });
	return new DocumentClient();
};

const saveItem = async (tableName, item) => {
	const dynamoDC = getDocumentClient();
	await dynamoDC
		.put({
			TableName: tableName,
			Item: item,
		})
		.promise();
};

const send = async (params) => {
	const dynamoDC = getDocumentClient();
	await dynamoDC
		.send(new ExecuteStatementCommand(params))
		.promise();
};

const findScan = async (tableName, select, filter, attributes, values) => {
	const dynamoDC = getDocumentClient();
	const object = {};
	if (filter) {
		object.FilterExpression = filter;
	}
	if (attributes) {
		object.ExpressionAttributeNames = attributes;
	}
	if (values) {
		object.ExpressionAttributeValues = values;
	}
	return await dynamoDC
		.scan({
			TableName: tableName,
			ProjectionExpression: select,
			...object
		})
		.promise();
};

const findQuery = async (tableName, select, filter, attributes, values) => {
	const dynamoDC = getDocumentClient();
	return await dynamoDC
		.query({
			TableName: tableName,
			ProjectionExpression: select,
			KeyConditionExpression: filter,
			ExpressionAttributeNames: attributes,
			ExpressionAttributeValues: values
		})
		.promise();
};

const updateItem = async (tableName, key, update, values, attributes) => {
	const dynamoDC = getDocumentClient();
	return await dynamoDC
		.update({
			TableName: tableName,
			Key: key,
			UpdateExpression: update,
			ExpressionAttributeValues: values,
			ExpressionAttributeNames: attributes,
			ReturnValues: 'UPDATED_NEW'
		})
		.promise();
};

const deleteItem = async (tableName, key, conditionExpression, values) => {
	const dynamoDC = new AWS.DynamoDB(
		{ apiVersion: "2012-08-10", region: "us-west-2" });
	return await dynamoDC
		.deleteItem({
			TableName: tableName,
			Key: key,
			ConditionExpression: conditionExpression,
			ExpressionAttributeValues: values
		})
		.promise();
};

var configMongBd = function (nameMongo, conetion_str_mongo, callback) {
	global.mongodb = require('mongodb');
	global.mongodb.MongoClient.connect(`${conetion_str_mongo}`, {}, function (err, database) {
		if (err) {
			throw err;
		}
		global.db = database.db(nameMongo);
		if (callback !== undefined) {
			callback(global.db);
		}
	});
};
var getMongoDocumentFind = async function (name_collection, data) {
	try {
		for (const property in data) {
			if (property === '_id') {
				data[property] = ObjectId(data[property]);
			}
		}
		const database = global.db;
		const collection = database.collection(name_collection);
		const result = await collection.find(data);
		return result;
	} catch (error) {
		console.error(error);
		return null;
	}
};
var getMongoDocument = async function (name_collection, data) {
	try {
		for (const property in data) {
			if (property === '_id') {
				data[property] = ObjectId(data[property]);
			}
		}
		const database = global.db;
		const collection = database.collection(name_collection);
		const result = await collection.findOne(data);
		return result;
	} catch (error) {
		console.error(error);
		return null;
	}
};
var getMongoDocumentArray = async function (name_collection, data) {
	try {
		for (const property in data) {
			if (property === '_id') {
				data[property] = ObjectId(data[property]);
			}
		}
		const database = global.db;
		const collection = database.collection(name_collection);
		const result = await collection.find(data).toArray();
		return result;
	} catch (error) {
		console.error(error);
		return null;
	}
};
const saveItemMongoOne = async function (name_collection, data) {
	try {
		for (const property in data) {
			if (property === '_id') {
				data[property] = ObjectId(data[property]);
			}
		}
		const database = global.db;
		const collection = database.collection(name_collection);
		const result = await collection.insertOne(data);
		return result;
	} catch (error) {
		console.error(error);
		return null;
	}
};
const saveItemMongoMany = async function (name_collection, data) {
	try {
		const database = global.db;
		const collection = database.collection(name_collection);
		const result = await collection.insertMany(data);
		return result;
	} catch (error) {
		console.error(error);
		return null;
	}
};
const updateItemMongoOne = async function (name_collection, key, data) {
	try {
		for (const property in data) {
			if (property === '_id') {
				data[property] = ObjectId(data[property]);
			}
		}
		const database = global.db;
		const collection = database.collection(name_collection);
		const result = await collection.updateOne(key, { $set: data });
		return result;
	} catch (error) {
		console.error(error);
		return null;
	}
};
const getConnectionMongoBd = function (name_collection) {
	try {
		const database = global.db;
		const collection = database.collection(name_collection);
		return collection;
	} catch (error) {
		console.error(error);
		return null;
	}
};


module.exports = {
	configMongBd,getMongoDocumentFind,
	send, saveItem, findScan, findQuery, updateItem, deleteItem,
	getMongoDocument, getMongoDocumentArray, saveItemMongoOne, updateItemMongoOne, saveItemMongoMany, getConnectionMongoBd
};
