'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.AbuseEmployerCreate = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Abuse Employer Create on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployerCollectionName).find({ "employercode": params.employercode, "statuscode": objConstants.activestatus }).toArray(function (err, employerresult) {
            if (employerresult != null && employerresult.length > 0) {
                dbo.collection(MongoDB.AbuseEmployerCollectionName).insertOne(params, function (err, res) {
                    if(err) throw err;
                    finalresult = res.insertedCount;
                    ////console.log(finalresult);
                    return callback(finalresult);
                });
            }
            else {
                finalresult = "Not Found";
                return callback(finalresult);
            }
        });


    }
    catch (e) { logger.error("Error in Abuse Employer Create Accepted: " + e); }

}
exports.AbuseEmployeeCreate = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Abuse Employee Create on Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "employeecode": params.employeecode, "statuscode": objConstants.activestatus }).toArray(function (err, employeeresult) {
            if (employeeresult != null && employeeresult.length > 0) {
                dbo.collection(MongoDB.AbuseEmployerCollectionName).insertOne(params, function (err, res) {
                    if(err) throw err;
                    finalresult = res.insertedCount;
                    ////console.log(finalresult);
                    return callback(finalresult);
                });
            }
            else {
                finalresult = "Not Found";
                return callback(finalresult);
            }
        });


    }
    catch (e) { logger.error("Error in Abuse Employee Create Accepted: " + e); }

}
exports.CheckAbuseDetails = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Check Abuse Employer Into  Employee  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.AbuseEmployerCollectionName).find({ "apptypecode":Number(req.query.apptypecode), "employercode":Number(req.query.employercode), "employeecode": Number(req.query.employeecode) }).count(function (err, totalcount) {
            if (err) throw err;
           // //console.log(totalcount);
            return callback(totalcount);
        })
    }
    catch (e) { logger.error("Error in Check Abuse Employer: " + e); }


}
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.AbuseEmployerCollectionName).find().sort([['abusecode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].abusecode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - Abuse " + e); }
}