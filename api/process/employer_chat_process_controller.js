'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require('../controller/utilities');
var dbcollectionname = MongoDB.EmployerChatCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbChatTypeCollectionName = MongoDB.ChatTypeCollectionName;
exports.getMaxcode = function (logparams, callback) {
  try {
    logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbcollectionname)).find().sort([['chatcode', -1]]).limit(1)
      .toArray((err, docs) => {
        if (docs.length > 0) {
          let maxId = docs[0].chatcode + 1;
          return callback(maxId);
        }
        else {
          return callback(1);
        }
      });
  }
  catch (e) { logger.error("Error in Get Max Code - chat" + e); }
}

exports.InsertChatDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in chat creat by chat Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    exports.getMaxcode(logparams, function (resp) {
      if (resp != null) {
          var varMaxCode = resp;
          params.chatcode=varMaxCode;
          dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            objUtilities.getcurrentmilliseconds(function (currenttime) {
              params.createddate=currenttime;
              dbo.collection(String(dbcollectionname)).insertOne(params, function (err, res) {
                if (err) throw err;
                finalresult = res.insertedCount;
                ////console.log(finalresult);
                return callback(finalresult);
              });
            });
            
          });
      }
    });
    
  }
  catch (e) { logger.error("Error in create - chat" + e); }
}

exports.deleteChatDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in deleteChatDetails: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dbcollectionname)).deleteOne({ "chatcode": parseInt(params.chatcode) }, function (err, res) {
      if (err) throw err;
      finalresult = res.deletedCount;
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in delete - chat" + e); }
}

exports.getChatList = function (logparams, employercode, callback) {
  try {
    logger.info("Log in getChatList by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    
    dbo.collection(String(dbcollectionname)).aggregate([
      { $match: { employercode: Number(employercode)} },
      {
        $lookup:
        {
          from: String(dbChatTypeCollectionName),
          localField: 'chattypecode',
          foreignField: 'chattypecode',
          as: 'chattype'
        }
      },
      { $unwind: '$chattype' },
      {
        $sort: {
          chattime: 1
        }
      },
      { 
        $project: {
          _id: 0, chatcode: 1, chattypecode: 1, chattypename: '$chattype.chattypename',createddate: 1, chattime:1, chatremarks: 1
        }
      }
    ]).toArray(function (err, result) {
      finalresult = result;
      //console.log(finalresult,"finalresult");
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in List - chat" + e); }
}