'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service');
const logger = new Logger('logs');
const objConstants = require('../../config/constants');

exports.getJoinusDetails = function (logparams, callback) {
    try {
      logger.info("Log in get join us details: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
      const dbo = MongoDB.getDB();
      dbo.collection(MongoDB.JoinusCollectionName).find({statuscode:objConstants.activestatus},{ projection: { _id: 0, joinuscode: 1, joinuswith: 1, link: 1 } }).toArray((err, joinusdetails) => {
            return callback(joinusdetails);
        });
    }
    catch (e) { logger.error("Error in get join us details " + e); }
  }