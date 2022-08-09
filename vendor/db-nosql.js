const AWS = require('aws-sdk');
const { DocumentClient } = require('aws-sdk').DynamoDB;

const getDocumentClient = () => {
	AWS.config.update({region:'us-west-2'});
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
	{ apiVersion: "2012-08-10",region: "us-west-2"  });
	return await dynamoDC
		.deleteItem({
			TableName: tableName,
			Key: key,
			ConditionExpression: conditionExpression,
			ExpressionAttributeValues: values
		})
		.promise();
};

var getMongoDocument = async function (data) {
    try {
        const database = global.db;
        const collection = database.collection(data.bdName);
        const  result = await collection.findOne({'UUID': data.UUID});
        return result;
    } catch (error) {
        console.error(error);
        return null;
    } 
};

const saveItemMongo = async function (data) {
    try {
        const database = global.db;
        const collection = database.collection(data.bdName);
        const  result = await collection.insertOne(data);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    } 
};

const updateItemMongo = async function (data) {
    try {
        const database = global.db;
        const collection = database.collection(data.bdName);
        const  result = await collection.updateOne({'UUID': data.UUID}, {$set: data});
        return result;
    } catch (error) {
        console.error(error);
        return null;
    } 
};

module.exports = { send, saveItem, findScan, findQuery, updateItem, deleteItem, getMongoDocument, saveItemMongo, updateItemMongo };
