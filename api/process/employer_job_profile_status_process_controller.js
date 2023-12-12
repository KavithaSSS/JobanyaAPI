'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");

exports.WishListCreate = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Wish List Save on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(String(MongoDB.EmployerWishListCollectionName)).insertOne(params, function (err, res) {
            if (err) throw err;
            return callback(res.insertedCount);

        });
    }
    catch (e) { logger.error("Error in Wish List Save: " + e); }

}
exports.FindSingleRecord = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Employer Wishlist single record : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployerWishListCollectionName).find({ "employercode": params.employercode, "jobcode": params.jobcode,"employeecode": params.employeecode }, { projection: { _id: 0, statuscode: 1 } }).toArray(function (err, wishresult) {
            if (err) throw err;
            return callback(wishresult);
        });
    }
    catch (e) {
        logger.error("Error in Employer Wishlist single record : " + e);
    }
}
exports.UpdateRecord = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Employer Wishlist Updated record : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        // //console.log(params);
        dbo.collection(MongoDB.EmployerWishListCollectionName).updateOne({ "employercode": Number(req.query.employercode), "jobcode": Number(req.body.jobcode),"employeecode": Number(req.body.employeecode)  }, { $set: { statuscode: Number(req.body.statuscode), updateddate: milliseconds, remarks: req.body.remarks } }, function (err, res) {
            if (err) throw err;
            ////console.log(res);
            return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in Employer Wishlist Update: " + e);

    }
}
exports.InvitedTotalCount = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Find Invited total count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: { "jobcode": Number(req.query.jobcode) } },
            { $unwind: '$subscriptiondetails' },
            {
                "$project": {
                    _id: 0, totalcount: '$subscriptiondetails.profileinvited'
                }
            }
        ]).toArray(function (err, finalcount) {
            if (finalcount != 0 && finalcount.length > 0) {
                ////console.log(finalcount[0].totalcount);
                return callback(finalcount[0].totalcount);
            }
            return callback(0);

        });
    }
    catch (e) {
        logger.error("Error in Invited Total count: " + e);
    }

}
exports.InvitedCount = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Find Invited count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "employercode": Number(req.query.employercode), "jobcode": Number(req.query.jobcode) }).count(function (err, employercount) {
            if (err)
                throw err;
            ////console.log(employercount);
            return callback(employercount);
        });
    }
    catch (e) {
        logger.error("Error in Invited count: " + e);
    }
}
exports.DuplicateCheck=function(logparams,req,callback){
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in duplicate check : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "employercode": Number(req.query.employercode), "jobcode": Number(req.query.jobcode), "employeecode": Number(req.query.employeecode) }).count(function (err, employercount) {
            if (err)
                throw err;
            ////console.log(employercount);
            return callback(employercount);
        });
    }
    catch (e) {
        logger.error("Error in duplicate check: " + e);
    }
}

exports.appliedchecking=function(logparams,req,callback){
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in duplicate check : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "jobcode": Number(req.query.jobcode), "employeecode": Number(req.query.employeecode) }).count(function (err, employeecount) {
            if (err)
                throw err;
            ////console.log(employercount);
            return callback(employeecount);
        });
    }
    catch (e) {
        logger.error("Error in appliedchecking: " + e);
    }
}

exports.checkInvitedStatus=function(logparams,req,callback){
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in duplicate check : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "employercode": Number(req.query.employercode), "jobcode": Number(req.query.jobcode), "employeecode": Number(req.query.employeecode) },{ projection: { _id: 0, shortliststatus: 1 } }).toArray(function (err, shortliststatus) {
            if (err)
                throw err;
            ////console.log(employercount);
            return callback(shortliststatus);
        });
    }
    catch (e) {
        logger.error("Error in duplicate check: " + e);
    }
}

exports.checkAppliedStatus=function(logparams,req,callback){
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in duplicate check : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "jobcode": Number(req.body.jobcode), "employeecode": Number(req.body.employeecode) },{ projection: { _id: 0, shortliststatus: 1 } }).toArray(function (err, shortliststatus) {
            if (err)
                throw err;
            ////console.log(shortliststatus);
            return callback(shortliststatus[0].shortliststatus);
        });
    }
    catch (e) {
        logger.error("Error in appliedchecking: " + e);
    }
}

exports.InsertInvite=function(logparams,params,callback){
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Insert invite employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(params);
        dbo.collection(MongoDB.JobPostsCollectionName).find({"jobcode": params.jobcode, "statuscode": objConstants.approvedstatus}, { projection: { _id: 0, repostjobid:1, clonejobid:1 } }).toArray(function (err, repostjobresult) {
            ////console.log("Hi");
            ////console.log(repostjobresult);
            if (repostjobresult != null && repostjobresult.length > 0)
            {
                var temprepostjobid = 0;
                var type = "";
                if (repostjobresult[0].repostjobid != null)
                {
                    temprepostjobid = repostjobresult[0].repostjobid;
                }
                else if (repostjobresult[0].clonejobid != null)
                {
                    temprepostjobid = repostjobresult[0].clonejobid;
                }
                else
                {
                    temprepostjobid = 0
                }
                dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({"employeecode": params.employeecode, "jobcode": temprepostjobid, "shortliststatus": objConstants.rejectedstatus}, { $exists: true }).toArray(function (err, appcount) //find if a value exists
                {
                    dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({"employeecode": params.employeecode, "jobcode": temprepostjobid, "shortliststatus": objConstants.rejectedstatus}, { $exists: true }).toArray(function (err, invcount) //find if a value exists
                    {
                        dbo.collection(MongoDB.RejectedJobsCollectionName).find({"employeecode": params.employeecode, "jobcode": temprepostjobid}, { projection: { _id: 0, type:1 } }).toArray(function (err, rejcount) //find if a value exists
                        {
                            ////console.log("applied", appcount);
                            if (appcount.length > 0)
                            {
                                type = "applied";
                            }
                            else if (invcount.length > 0)
                            {
                                type = "invited";
                            }
                            else if (rejcount != null && rejcount.length > 0)
                            {
                                type = rejcount[0].type;
                            }
                            if (appcount.length > 0 || invcount.length > 0 || (rejcount != null && rejcount.length > 0))
                            {
                                ////console.log("type", type);
                                var insertparams = {"employeecode": params.employeecode, "jobcode": params.jobcode, "type": type};
                                dbo.collection(MongoDB.RejectedJobsCollectionName).find({"employeecode": params.employeecode, "jobcode": params.jobcode}, { projection: { _id: 0, jobcode:1 } }).toArray(function (err, jobrejresult) {
                                    if (jobrejresult != null && jobrejresult.length > 0)
                                    {
                                        finalresult = type;
                                        return callback(finalresult);
                                    }
                                    else
                                    {
                                        dbo.collection(String(MongoDB.RejectedJobsCollectionName)).insertOne(insertparams, function (err, res) {
                                            finalresult = type;
                                            return callback(finalresult);
                                        });
                                    }
                                });
                            }
                            else
                            {
                                dbo.collection(String(MongoDB.EmployeeInvitedCollectionName)).insertOne(params, function (err, res) {
                                    if (err) throw err;
                                    return callback("invite");
                        
                                });
                            }
                            
                        });
                        
                    });
                });
            }
            else
            {
                dbo.collection(String(MongoDB.EmployeeInvitedCollectionName)).insertOne(params, function (err, res) {
                    if (err) throw err;
                    return callback("invite");
        
                });
            }
        });

    }
    catch (e) { logger.error("Error in Insert invite : " + e); }
}
exports.UpdateShortList = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Update Shorliststatus : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        // //console.log(params);
        dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
             var makerid = String(logres["ops"][0]["_id"]);
        dbo.collection(MongoDB.EmployeeAppliedCollectionName).updateOne({ "employercode": Number(req.query.employercode), "jobcode": Number(req.body.jobcode),"employeecode": Number(req.body.employeecode) }, { $set: { shortliststatus: Number(req.body.shortliststatus), updateddate: milliseconds, makerid: makerid } }, function (err, res) {
            if (err) throw err;
            //console.log(res.modifiedCount);
            //console.log(makerid);
            if (res.modifiedCount > 0)
                return callback(makerid);
            else
                return callback("");
        });
    });
    }
    catch (e) {
        logger.error("Error in Update Shorliststatus  : " + e);

    }
}