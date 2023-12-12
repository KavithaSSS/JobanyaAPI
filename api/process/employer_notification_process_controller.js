'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");

exports.Notification = function (logparams, req, callback) {
    try {
        logger.info("Notification Load: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.notificationtypeCollectionName).aggregate([
            { $unwind: '$notification' },
            { $match: {$and:[{ "notification.languagecode": Number(req.query.languagecode) },{ "statuscode": Number(objConstants.activestatus) },{ "apptypecode": {$in:[2,3]} }]} },
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

            dbo.collection(MongoDB.EmployerNotificationCollectionName).find({ "employercode": Number(req.query.employercode) }, { projection: { _id: 0, employercode: 1, notificationtypecode: 1, notificationtypestatus: 1 } }).toArray(function (err, result) {
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
        { logger.error("Error in employer Notification load: " + e); }
    }
}
// exports.FindNotificationTypeCode = function (logparams, req, callback) {
//     try {
//         logger.info("Find NotificationType Code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
//         const dbo = MongoDB.getDB();
//         dbo.collection(MongoDB.EmployerNotificationCollectionName).find({ "employercode": Number(req.query.employercode), "notificationtypecode": Number(req.query.notificationtypecode) }).toArray(function (err, result) {
//             // //console.log(result);
//             if (result[0] == null) {
//                 return callback(false);
//             }
//             else {
//                 return callback(true);
//             }
//         })
//     }
//     catch (e) {
//         logger.error("Error in Find employer Notification type code: " + e);
//     }
// }
exports.UpdateNotificationStatus = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Update Notification status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerNotificationCollectionName).findOneAndUpdate({ "employercode": Number(req.query.employercode), "notificationtypecode": Number(req.query.notificationtypecode) }, { $set: { "notificationtypestatus": Number(req.query.notificationtypestatus), "updateddate": milliseconds } }, function (err, result) {
            if (err) throw (err);
            ////console.log(result.modifiedCount);
            return callback(result.lastErrorObject.updatedExisting);
        });
    }
    catch (e) {
        logger.error("Error in Updating employer Notification Status: " + e);
    }
}
exports.GetMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in Notification getting max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(String(MongoDB.EmployerNotificationCollectionName)).find().sort([['notificationcode', -1]]).limit(1)
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
exports.NotificationDetailsInsert = function (logparams, data, callback) {
    try {

        logger.info("Saving employee Notification Status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerNotificationCollectionName).insertOne(data, function (err, result) {
            ////console.log(data);
            if (err) throw err;
            return callback(result.insertedCount);
        });
    }
    catch (e) {
        { logger.error("Error in Saving employee Notification Status: " + e); }
    }
}