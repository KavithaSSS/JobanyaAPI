'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.InvitationAcceptedSave = function (logparams, params, type, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Job Invitation Accepted on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection

        dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "employeecode": params.employeecode, "jobcode": params.jobcode }, { projection: { _id: 0, statuscode: 1, shortliststatus: 1 } }).toArray(function (err, invitedresult) {
            if (invitedresult != null && invitedresult.length > 0) {
                if (invitedresult[0].shortliststatus == 0 && type == 1) {
                    dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                        params.makerid = String(logres["ops"][0]["_id"]);
                        dbo.collection(MongoDB.EmployeeInvitedCollectionName).updateOne({ "employeecode": params.employeecode, "jobcode": params.jobcode }, { $set: { "updateddate": milliseconds, "shortliststatus": objConstants.shortlistedstatus, "makerid": params.makerid } }, function (err, res) {
                            if (err) throw err;
                            finalresult = res.modifiedCount;
                            ////console.log(finalresult);
                            if (finalresult > 0)
                                return callback(params.makerid)
                            else
                                return callback("");
                        });
                    });
                }
                else if (invitedresult[0].shortliststatus == 0 && type == 2) {
                    dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                        params.makerid = String(logres["ops"][0]["_id"]);
                        dbo.collection(MongoDB.EmployeeInvitedCollectionName).updateOne({ "employeecode": params.employeecode, "jobcode": params.jobcode }, { $set: { "updateddate": milliseconds, "shortliststatus": objConstants.rejectedstatus, "makerid": params.makerid } }, function (err, res) {
                            if (err) throw err;
                            finalresult = res.modifiedCount;
                            ////console.log(finalresult);
                            if (finalresult > 0)
                                return callback(params.makerid);
                            else
                                return callback("");
                        });
                    });
                }
                else {
                    finalresult = "";
                    return callback(finalresult);
                }
            }
            else {
                finalresult = "";
                return callback(finalresult);
            }
            //return callback(sortresult);
        });
    }
    catch (e) { logger.error("Error in Job Invitation Accepted: " + e); }

}
exports.FindEmployerMailID = function (req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        var empparams = { employercode: Number(req.query.employercode) };
        dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, registered_email: 1 } }).toArray(function (err, result) {
            if (err) throw err;
            // //console.log(result);
            return callback(result);
        });
    }
    catch (ex) {
        logger.error(ex.message);
    }
}
exports.ShortlistTotalCount = function (logparams, req, type, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Find Applied total count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var jobcode;
        if (type == 1)
            jobcode = Number(req.query.jobcode);
        else
            jobcode = Number(req.body.jobcode);
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: { "jobcode": jobcode } },
            { $unwind: '$subscriptiondetails' },
            {
                "$project": {
                    _id: 0, totalcount: '$subscriptiondetails.profileshortlisted'
                }
            }
        ]).toArray(function (err, finalcount) {
            ////console.log(finalcount);
            if (finalcount != null && finalcount.length > 0) {
                ////console.log(finalcount[0].totalcount);
                return callback(finalcount[0].totalcount);
            }
            else
            {
                return callback(0);
            }
            //return callback(0);

        });
    }
    catch (e) {
        logger.error("Error in Shortlist Total count: " + e);
    }

}

exports.ShortlistCount = function (logparams, req, type, callback) {
    try {
        const dbo = MongoDB.getDB();
        var jobcode;
        if (type == 1)
            jobcode = Number(req.query.jobcode);
        else
            jobcode = Number(req.body.jobcode);
        logger.info("Log in Find applied count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "employercode": Number(req.query.employercode), "jobcode": jobcode,"shortliststatus": objConstants.shortlistedstatus}).count(function (err, employercount) {
             dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "employercode": Number(req.query.employercode), "jobcode": jobcode,"shortliststatus": objConstants.shortlistedstatus}).count(function (err, empcount) {
                if (err)
                throw err;
            ////console.log(employercount);
            return callback(employercount + empcount); 
            });
           
        });
    }
    catch (e) {
        logger.error("Error in Shortlist count: " + e);
    }
}
