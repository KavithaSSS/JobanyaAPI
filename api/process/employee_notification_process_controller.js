'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");

exports.Notification = function (logparams, req, callback) {
    try {
        logger.info("Change Notification status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.notificationtypeCollectionName).aggregate([
            { $unwind: '$notification' },
            { $match: {$and:[{ "notification.languagecode": Number(req.query.languagecode) },{ "statuscode": Number(objConstants.activestatus) },{ "apptypecode": {$in:[1,3]} }]} },
            {
                $sort: {
                    notificationtypecode: 1
                }
            },
            {
                $project:
                    { _id: 0, notificationtypecode: 1, notificationtypename: '$notification.notificationtypename' }
            }
        ]).toArray(function (err, res) {

            dbo.collection(MongoDB.notificationCollectionName).find({ "employeecode": Number(req.query.employeecode) }, { projection: { _id: 0, employeecode: 1, notificationtypecode: 1, notificationtypestatus: 1 } }).toArray(function (err, result) {
                finalresult = {
                    "notificationtype": res,
                    "notification": result
                }
                // //console.log(finalresult);
                return callback(finalresult);
            });

        });
    }
    catch (e) {
        { logger.error("Error in Updating employee Notification Status: " + e); }
    }
}
exports.NotificationMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in Notification getting max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(String(MongoDB.notificationCollectionName)).find().sort([['notificationcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].notificationcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Notification Max Code - Notification " + e); }
}
exports.NotificationSave = function (logparams, data, callback) {
    try {

        logger.info("Saving employee Notification Status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var res;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            // //console.log(logres["ops"][0]["_id"]);
            data.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(MongoDB.notificationCollectionName).insertOne(data, function (err, result) {
                // //console.log(data);
                if (err) throw err;
                return callback(result.insertedCount);
            });
        });
    }
    catch (e) {
        { logger.error("Error in Saving employee Notification Status: " + e); }
    }
}


exports.NotificationSaveInEmployee = function (logparams, data, callback) {
    try {
        logger.info("Saving employee Notification Status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.notificationCollectionName).insertOne(data, function (err, result) {
            // //console.log(data);
            if (err) throw err;
            return callback(result.insertedCount);
        });
    }
    catch (e) {
        { logger.error("Error in Saving employee Notification Status: " + e); }
    }
}

exports.FindNotificationStatus = function (req, callback) {
    try {
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.notificationCollectionName).find({ "employeecode": Number(req.query.employeecode), "notificationtypecode": Number(req.query.notificationtypecode) }).toArray(function (err, result) {

            ////console.log(result);
            if (result[0] == null) {
                return callback(false);
            }
            else {
                return callback(true);
            }
        })
    }
    catch (ex) {
        logger.error(ex.message);
    }
    finally {
    }
}
exports.UpdateNotificationStatus = function (req, callback) {
    try {
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.notificationCollectionName).updateOne({ "employeecode": Number(req.query.employeecode), "notificationtypecode": Number(req.query.notificationtypecode) }, { $set: { "notificationtypestatus": Number(req.query.notificationtypestatus) } }, function (err, res) {
            if(err) throw err;
            // //console.log(res.modifiedCount);
            return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
        });
    }
    catch (ex) {
        logger.error(ex.message);
    }
    finally {
    }
}
