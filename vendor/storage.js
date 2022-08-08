const { S3 } = require('aws-sdk');

const generateUrlS3 = async function (bucketName, key, expiration) {
	return await new Promise((resolve, reject) => {
		new S3({
			signatureVersion: 'v4'
		}).getSignedUrl('getObject', {
			Bucket: bucketName,
			Key: key,
			Expires: expiration
		}, (err, url) => {
			if (err) reject(err);
			resolve(url);
		});
	});
};

const uploadFileToStorage = function (bucketName, file, key, contentType,
	 isPublic = true, storageClass) {
	return new S3().upload({
		ACL: isPublic ? 'public-read' : null,
		ContentType: contentType,
		Bucket: bucketName,
		Key: key,
		Body: file,
        StorageClass: storageClass
	}).promise();
};
const uploadFileToStorageBase64 = function (bucketName, file, key, contentType,
	isPublic = true, storageClass) {
   return new S3().upload({
	   ACL: isPublic ? 'public-read' : null,
	   ContentType: "application/octet-binary",
	   Bucket: bucketName,
	   Key: key,
	   Body: file,
	   ContentEncoding: "base64",
	   StorageClass: 'STANDARD_IA',
	   ContentEncoding: 'base64',
   }).promise();
};
const listObjectsFromRepository = function (bucketName) {
	const bucketParams = {
		Bucket : bucketName,
	};
	const list = new S3().listObjects(bucketParams);
	return list.promise();
};

const deleteObjects = function (bucketName, fileKey) {	
	const bucketParams = {
		Bucket : bucketName,
		Key: fileKey
	};
	const deleteObject = new S3().deleteObject(bucketParams);	
	return deleteObject.promise();
};

const downloadFile = function (bucketName, key) {
	const download = new S3().getObject({
		Bucket: bucketName,
		Key: key
	});
	return download.promise();
};

const generateFileKey = (idNumber, base64String, nameKey, allowedExtensions) => {
	const data = base64String.split(',');
	const extension = data[0].split(';')[0].split('/')[1];
	if (!allowedExtensions.includes(extension)) {
		throw new Error(`El archivo ${nameKey} no es válido. Extensión ${extension} no permitida`);
	}
	return {
		fileKey: `${idNumber}/${nameKey}.${extension}`,
		base64FileBody: data[1],
		contentType: data[0].split(';')[0].split(':')[1],
	};
};

const generateUrl = (fileKey) => {
	return {
		label: fileKey.label,
		key: fileKey.fileKey,
		namekey: fileKey.nameKey,
	};
};

module.exports = { uploadFileToStorageBase64,uploadFileToStorage, deleteObjects, listObjectsFromRepository, downloadFile, generateFileKey, generateUrl, generateUrlS3 };
