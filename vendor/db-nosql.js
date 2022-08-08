const AWS = require('aws-sdk');
// import { ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
// const { ExecuteStatementCommand } = require('aws-sdk').DynamoDB;
const { DocumentClient } = require('aws-sdk').DynamoDB;
//const { ExecuteStatementCommand } =require( "@aws-sdk/client-dynamodb");
// import { ddbDocClient } from "../libs/ddbDocClient.js";

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
//	const dynamoDC = getDocumentClient();
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
        const collection = database.collection("documents");
        const  result = await collection.findOne({'UUID': data.UUID});
        return result;
    } catch (error) {
        console.error(error);
        return null;
    } 
};

module.exports = { send, saveItem, findScan, findQuery, updateItem, deleteItem, getMongoDocument };
