'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service');
const logger = new Logger('logs');
const objConstants = require('../../config/constants');

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