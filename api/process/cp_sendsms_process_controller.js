'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstant = require('../../config/constants');
const objUtilities = require("../controller/utilities");
const objSendSMS = require("../process/send_sms_process_controller");
var date = new Date(); // some mock date
var milliseconds = date.getTime();
exports.getFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { statuscode: parseInt(objConstant.activestatus) }
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            dbo.collection(MongoDB.smstypeCollectionName).aggregate([
                { $match: params },
                {
                    $sort: {
                        smstypename: 1
                    }
                },
                {
                    $project: { _id: 0, smstypecode: 1, smstypename: 1, smscharcount: 1 }
                }
            ]).toArray(function (err, smsresult) {
                dbo.collection(MongoDB.smstemplateCollectionName).aggregate([
                    { $match: params },
                    {
                        $sort: {
                            templatename: 1
                        }
                    },
                    {
                        $project: { _id: 0, templatecode: 1, templatename: 1, smscount: 1 }
                    }
                ]).toArray(function (err, templateresult) {
                    dbo.collection(MongoDB.RecipientCriteriaCollectionName).aggregate([
                        { $match: params },
                        {
                            $sort: {
                                criterianame: 1
                            }
                        },
                        {
                            $project: { _id: 0, criteriacode: 1, criterianame: 1 }
                        }
                    ]).toArray(function (err, criteriaresult) {  
                        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, controlsresult) {
                            objSendSMS.GetSMSCount(logparams,function (smscount) {
                                ////console.log(smscount);     
                                if(smscount!=null && smscount.length>1){
                                    finalresult = {
                                        "languagelist": languageresult,
                                        "smstypelist": smsresult,
                                        "templatelist": templateresult,
                                        "criterialist": criteriaresult,
                                        "smscount":Number(smscount[1]),
                                        "characterscount":controlsresult[0].smscount,
                                        "unicodecharacterscount":controlsresult[0].unicodecount
                                    }
                                    return callback(finalresult);
                                }                            
                            });
                        });  
                    });
                });
            });
        });
    }
    catch (e) { logger.error("Error in Form load -sendsms " + e); }
}
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.SendSMSCollectionName).find().sort([['smscode', -1]]).limit(1)
            .toArray((err, docs) => {
               
                if (docs.length > 0) {
                    let maxId = docs[0].smscode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - sendsms " + e); }
}
exports.Insertsendsms = function (logparams, params, callback) {
    try {
        logger.info("Log in Insert sendsms: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.SendSMSCollectionName).insertOne(params, function (err, res) {
            if (err) throw err;
            finalresult = res.insertedCount;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in insert - sendsms " + e);
    }
}
exports.FindAllEmployee = function (logparams, req, callback) {
    try {
        logger.info("Log in Find all employee: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // var days = date - req.query.inactivedays;
        date.setDate(date.getDate() - req.query.inactivedays);
        var milliseconds= date.getTime();
        var params = { "statuscode": Number(objConstant.activestatus), lastlogindate: { $lte: milliseconds } };
        // //console.log(params)
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: params },
            {
                $project: {
                    _id: 0, employeecode: 1, mobileno: '$contactinfo.mobileno'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Find all employee- sendsms " + e);
    }
}
exports.FindEmployeeInactive = function (logparams, callback) {
    try {
        logger.info("Log in Employee Inactive: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "statuscode": Number(objConstant.inactivestatus) };
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: params },
            {
                $project: {
                    _id: 0, employeecode: 1, mobileno: '$contactinfo.mobileno'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Find all Employee Inactive- sendsms " + e);
    }
}
exports.FindAllEmployer = function (logparams, callback) {
    try {
        logger.info("Log in Find all employer: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "statuscode": Number(objConstant.activestatus) };
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            //{ $unwind: '$address' },
            { $match: params },
            {
                $project: {
                    _id: 0, employercode: 1, mobileno: '$contactinfo.mobileno'
                }
            }
        ]).toArray(function (err, result) {
            ////console.log(result);
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Find all employer- sendsms " + e);
    }
}
exports.FindEmployerInactive = function (logparams, callback) {
    try {
        logger.info("Log in Employer Inactive: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "statuscode": Number(objConstant.inactivestatus) };
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { $match: params },
            {
                $project: {
                    _id: 0, employercode: 1, mobileno: '$contactinfo.mobileno'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Find all Employer Inactive- sendsms " + e);
    }
}
exports.updateSendsms = function (logparams, req, params, callback) {
    try {
        logger.info("Log in update Sendsms: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.SendSMSCollectionName).updateOne({ "smscode": Number(req.query.smscode) }, { $set: params }, function (err, res) {
            if (err)  throw err
               finalresult = res.modifiedCount
            //    //console.log(finalresult)
            return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in update - Sendsms " + e);
    }
}
exports.GetSendsmsSingleDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in Sendsms Single Record: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.SendSMSCollectionName).find(params).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - Sendsms" + e); }
}
exports.SendSmseditload = function (logparams, req, callback) {
    try {
        logger.info("Log in Edit load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.SendSMSCollectionName).find({ "smscode": Number(req.query.smscode) }, { projection: { _id: 0, smscode: 1, criteriacode: 1, inactivedays: 1, statuscode: 1, smstypecode: 1, languagecode: 1, message: 1, recipients: 1, singlesmscount: 1, totalsmscount: 1 } }).toArray(function (err, result) {
            finalresult = result;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Edit load List - Sendsms" + e); }
}
exports.Sendsmstotallist = function (logparams, req, callback) {
    try {
        logger.info("Log in Sendsms List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparams = {};
        if(Number(req.query.statuscode)!=0)
            matchparams={ "statuscode": Number(req.query.statuscode) } ;
        dbo.collection(MongoDB.SendSMSCollectionName).aggregate([
            {
                $addFields: {
                    Recipients_count: {
                        $size: "$recipients"
                    }
                }
            },
            { $match: matchparams },
            {
                $sort: {
                    createddate: -1
                }
            },
            {
                $project: {
                    _id: 0, smscode:1,criteriacode: 1, message: 1, createddate: 1, totalsmscount: 1, Recipients_count: 1, statuscode: 1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in List - Sendsms" + e);
    }
}