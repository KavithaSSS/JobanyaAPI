'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service');
const logger = new Logger('logs');
const objConstants = require('../../config/constants');
const axios = require('axios');

exports.getBucketDetails = function (logparams, callback) {
    try {
      logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
      const dbo = MongoDB.getDB();
      dbo.collection(MongoDB.AWSBucketCollectionName).find({statuscode:objConstants.activestatus},{ projection: { _id: 0, bucketcode: 1, bucketname: 1, foldername: 1 } }).toArray((err, awsdetails) => {
            return callback(awsdetails);
        });
    }
    catch (e) { logger.error("Error in Get Max Code - Splash " + e); }
  }

  exports.callLamdaUrl = function (awslamdaReq, callback) {
    try {

      const lamdaUrl = "https://gu98zm4vyg.execute-api.us-east-2.amazonaws.com/S3Upload/getPreSignedURL";

      var data = JSON.stringify({
               "bucketName":awslamdaReq.bucketName,
               "fileName":awslamdaReq.fileName
             });

var config = {
  method: 'post',
  url: 'https://dw3p0uyy7i.execute-api.ap-south-1.amazonaws.com/default/getImageUploadURL',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
  return callback(response.data);
})
.catch(function (error) {
  console.log(error);
});

    }
    catch (e) { logger.error("Error in Get Lamda code " + e); }
  }