'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs');
const objUtilities = require("../controller/utilities");
// const objConstants = require('../../config/constants');
// const {defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.settingsCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
exports.updateSettingsDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in settings update by settings Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).replaceOne({ "settingcode": parseInt(params.settingcode) }, params, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount==0?res.matchedCount:res.modifiedCount;
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - settings" + e); }
}
exports.getSettingsSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in settings List by settings Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "settingcode": parseInt(params.settingcode) }, { projection: { _id: 0, settingcode: 1, notifications: 1, generalsettings: 1, employeecheckout: 1 } }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - settings" + e); }
}

exports.getSettingsSingleRecordDetails = function (logparams, req, callback) {
    try {
        logger.info("Log in settings List by settings Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "settingcode": parseInt(req.query.settingcode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - settings" + e); }
}
exports.checksettingcodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking Setting code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ settingcode: parseInt(req.query.settingcode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking setting code - settings" + e); }
}
exports.CheckDecryptPassword = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        logger.info("Check decrypt Password: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.UserCollectionName).find({ "usercode": Number(req.query.usercode) }, { projection: { _id: 0, password: 1 } }).toArray(function (err, result) {
            objUtilities.decryptpassword(logparams, result[0].password, function (decryptpassword) {
                // //console.log(decryptpassword);
                // //console.log(req.query.oldpassword);
                if (req.query.oldpassword == decryptpassword)
                    res = true;
                else
                    res = false;
                return callback(res);
            });
        })
    }
    catch (ex) {
        logger.error("Error in Check decrypt Password : " + e);
    }
}
exports.ChangeNewpassword = function (logparams, req, callback) {
    try {
        logger.info("Change New Password : UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.UserCollectionName).find({ "usercode": Number(req.query.usercode) }).toArray(function (err, doc) {
            if (doc.length > 0) {
                objUtilities.encryptpassword(logparams, req.query.newpassword, function (encryptpassword) {
                    dbo.collection(MongoDB.UserCollectionName).findOneAndUpdate({ "usercode": Number(req.query.usercode) }, { $set: { "password": encryptpassword } }, function (err, res) {
                        if (err) {
                            throw err;
                        }
                        else {
                            if(res.lastErrorObject.updatedExisting)
                                return callback(1);
                            else
                                return callback(0);
                        }
                    });
                });
            }
            else {
                return callback(0);
            }

        });
    }
    catch (e) {
        { logger.error("Error in Change New password: " + e); }
    }
}