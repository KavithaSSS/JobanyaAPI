'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.ApplyJobSave = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Apply Job Save on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        dbo.collection(MongoDB.JobPostsCollectionName).find({"jobcode": params.jobcode, "statuscode": objConstants.approvedstatus, $or: [ { repostjobid: {'$exists':true} }, { clonejobid: {'$exists':true} } ]}, { projection: { _id: 0, repostjobid:1, clonejobid:1 } }).toArray(function (err, repostjobresult) {
            ////console.log("Hi");
            //console.log(repostjobresult);
            //logger.info("Log in Apply Job Save on Employee App : hi: "+repostjobresult);
            if (repostjobresult != null && repostjobresult.length > 0)
            {
                //logger.info("Log in Apply Job Save on Employee App : hi: "+repostjobresult[0]);
                var temprepostjobid = 0;
                var type = "";
                if (repostjobresult[0]!=null && repostjobresult[0].repostjobid != null && repostjobresult[0].repostjobid != undefined)
                {
                    temprepostjobid = repostjobresult[0].repostjobid;
                }
                // else if (repostjobresult[0]!=null && repostjobresult[0].clonejobid != null && repostjobresult[0].repostjobid != undefined)
                // {
                //     temprepostjobid = repostjobresult[0].clonejobid;
                // }
                else
                {
                    temprepostjobid = 0
                }
               // console.log("temprepostjobid", temprepostjobid);
                dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({"employeecode": params.employeecode, "jobcode": temprepostjobid == 0? params.jobcode : temprepostjobid}, {  projection: { _id: 0, shortliststatus:1 }  }).toArray(function (err, appcount) //find if a value exists
                {
                    dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({"employeecode": params.employeecode, "jobcode": temprepostjobid}, { projection: { _id: 0, shortliststatus:1 } }).toArray(function (err, invcount) //find if a value exists
                    {
                        dbo.collection(MongoDB.RejectedJobsCollectionName).find({"employeecode": params.employeecode, "jobcode": temprepostjobid}, { projection: { _id: 0, type:1 } }).toArray(function (err, rejcount) //find if a value exists
                        {
                            //console.log("applied", appcount);
                            if (appcount != null && appcount.length > 0)
                            {
                                if (appcount[0].shortliststatus == 8)
                                {
                                    type= "shortlisted"
                                }
                                else if (appcount[0].shortliststatus == 9)
                                {
                                    type= "rejected"
                                }
                                else
                                {
                                    type = temprepostjobid != 0?"applied":"Already Applied";
                                }
                                
                            }
                            else if ( invcount != null && invcount.length > 0)
                            {
                                if (invcount[0].shortliststatus == 8)
                                {
                                    type= "shortlisted"
                                }
                                else if (invcount[0].shortliststatus == 9)
                                {
                                    type= "rejected"
                                }
                                else
                                {
                                    type = temprepostjobid == 0?"invited":"Already Invited";
                                }
                                
                            }
                            else if (rejcount != null && rejcount.length > 0)
                            {
                                type = rejcount[0].type;
                            }
                            if (appcount.length > 0 || invcount.length > 0 || (rejcount != null && rejcount.length > 0))
                            {
                                //console.log("type", type);
                                var insertparams = {"employeecode": params.employeecode, "jobcode": params.jobcode, "type": type};
                                dbo.collection(MongoDB.RejectedJobsCollectionName).find({"employeecode": params.employeecode, "jobcode": params.jobcode}, { projection: { _id: 0, jobcode:1 } }).toArray(function (err, jobrejresult) {
                                    if (jobrejresult != null && jobrejresult.length > 0)
                                    {
                                        finalresult = {
                                            "type":type,
                                            "makerid": ""
                                        }
                                        return callback(finalresult);
                                    }
                                    else
                                    {
                                        dbo.collection(String(MongoDB.RejectedJobsCollectionName)).insertOne(insertparams, function (err, res) {
                                            finalresult = {
                                                "type":type,
                                                "makerid": ""
                                            }
                                            return callback(finalresult);
                                        });
                                    }
                                });
                            }
                            else
                            {
                            logger.info("Log in Apply Job Save on Employee App : else: ");
                            // //console.log("entry")
                            dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({"employeecode": params.employeecode, "jobcode": params.jobcode}, { projection: { _id: 0, statuscode:1 } }).toArray(function (err, jobresult) {
                                if (jobresult != null && jobresult.length > 0)
                                {
                                    finalresult = {
                                        "type":"Already Applied",
                                        "makerid": ""
                                    }
                                    return callback(finalresult);
                                }
                                else
                                {
                                    dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                                        params.makerid = String(logres["ops"][0]["_id"]);
                                        dbo.collection(String(MongoDB.EmployeeAppliedCollectionName)).insertOne(params, function (err, res) {
                                            if (err) throw err;
                                            if (res.insertedCount > 0)
                                            {
                                                finalresult = {
                                                    "type":"Apply",
                                                    "makerid": params.makerid
                                                }
                                            }
                                            else
                                            {
                                                finalresult = {
                                                    "type":"",
                                                    "makerid": ""
                                                }
                                            }
                                            return callback(finalresult);
                                        });
                                    });
                                }
                                //return callback(sortresult);
                            });
                        }
                            
                        });
                        
                    });
                });
            }
            else
            {
                dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({"employeecode": params.employeecode, "jobcode": params.jobcode}, { projection: { _id: 0, statuscode:1 } }).toArray(function (err, jobresult) {
                    if (jobresult != null && jobresult.length > 0)
                    {
                        finalresult = {
                            "type":"Already applied",
                            "makerid": ""
                        }
                        return callback(finalresult);
                    }
                    else
                    {
                        dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                            params.makerid = String(logres["ops"][0]["_id"]);
                            dbo.collection(String(MongoDB.EmployeeAppliedCollectionName)).insertOne(params, function (err, res1) {
                                if (err) throw err;
                                //console.log(res1.insertedCount > 0);
                                if (res1.insertedCount > 0)
                                            {
                                                finalresult = {
                                                    "type":"Apply",
                                                    "makerid": params.makerid
                                                }
                                            }
                                            else
                                            {
                                                finalresult = {
                                                    "type":"",
                                                    "makerid": ""
                                                }
                                            }
                                return callback(finalresult);
                            });
                        });
                    }
                    //return callback(sortresult);
                });
            }
        });
        

    }
    catch (e) { logger.error("Error in Apply Job Save: " + e); }

}
exports.FindEmployerMailID = function (req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        //console.log(Number(req.query.employercode));
        var empparams = { "employercode": Number(req.query.employercode) };
        dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, registered_email: 1 } }).toArray(function (err, result) {
            if (err) throw err;
            //console.log(result);
            return callback(result);
        });
    }
    catch (ex) {
        logger.error(ex.message);
    }
}

exports.AppliedTotalCount = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Find Applied total count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: { "jobcode": Number(req.query.jobcode) } },
            { $unwind: '$subscriptiondetails' },
            {
                "$project": {
                    _id: 0, totalcount: '$subscriptiondetails.profileapplied'
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
        logger.error("Error in Applied Total count: " + e);
    }

}

exports.AppliedCount = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Find applied count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "employercode": Number(req.query.employercode), "jobcode": Number(req.query.jobcode) }).count(function (err, employercount) {
            if (err)
                throw err;
            ////console.log(employercount);
            return callback(employercount);
        });
    }
    catch (e) {
        logger.error("Error in applied count: " + e);
    }
}


exports.AppliedCallCount = function (logparams, empparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        // console.log(empparams)
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in applied call count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeAppliedCollectionName).findOneAndUpdate(empparams, {
            $set: { 'lastcalldate': milliseconds}, 
            $inc: { 'callcount': 1 } 
        }, function (err, result) {
            //console.log("Entry5")
            if (err)
                throw err;
            ////console.log(employercount);
            console.log(JSON.stringify(result, null, " "))
            return callback(result.lastErrorObject.updatedExisting);
        });
    }
    catch (e) {
        logger.error("Error in applied count: " + e);
    }
}


exports.InvitedCallCount = function (logparams, empparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        // console.log(empparams)
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Invited call count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeInvitedCollectionName).findOneAndUpdate(empparams, {
            $set: { 'lastcalldate': milliseconds}, 
            $inc: { 'callcount': 1 } 
        }, function (err, result) {
            //console.log("Entry5")
            if (err)
                throw err;
            ////console.log(employercount);
            //console.log(JSON.stringify(result, null, " "))
            return callback(result.lastErrorObject.updatedExisting);
        });
    }
    catch (e) {
        logger.error("Error in applied count: " + e);
    }
}


