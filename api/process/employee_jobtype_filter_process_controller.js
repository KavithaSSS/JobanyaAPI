'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getJobTypeFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Job Type Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };
        dbo.collection(MongoDB.JobTypeCollectionName).aggregate([
            {$unwind:"$jobtype"},  
             //{$match: {"statuscode":objConstants.activestatus, "jobtype.languagecode":Number(params.languagecode)}},
             { $match: {$and:[{"statuscode": objConstants.activestatus},
            {$or:[{"jobtype.languagecode": Number(params.languagecode) }]}]}},
             {$sort: {'jobtype.jobtypename': 1}},
             { $project: {
                        "_id": 0, "jobtypecode":1, "jobtypename": '$jobtype.jobtypename',"languagecode": '$jobtype.languagecode'
                     } 
                     }]).toArray(function(err, jobtyperesult) {
            finalresult =jobtyperesult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
        });
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Job Type Bind: " + e); }
  
  
}

exports.getProfileJobTypeFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Job Type Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            {$unwind:"$preferences"},  
			 {$unwind:"$preferences.employementtype"},
             {$match: {"statuscode":objConstants.activestatus, "employeecode":Number(params.employeecode)}},
             { "$lookup": {
                "from":  String(MongoDB.JobTypeCollectionName),
                "localField": "preferences.employementtype.employementtypecode",
                "foreignField": "jobtypecode",
                "as": "jobtype"
           }},
           {$unwind:"$jobtype"},
           {$unwind:"$jobtype.jobtype"},
           //{ $match: { 'jobtype.languagecode': params.languagecode, statuscode: parseInt(objconstants.activestatus) } },
           { $match: {$and:[{"statuscode": objConstants.activestatus},
            {$or:[{"jobtype.jobtype.languagecode": Number(params.languagecode) }]}]}},
             { $project: {
                        "_id": 0, "jobtypecode":1, "jobtypename": '$jobtype.jobtype.jobtypename',"languagecode": '$jobtype.jobtype.languagecode'
                     } 
                     }]).toArray(function(err, jobtyperesult) {
            finalresult =jobtyperesult;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Filter - Profile Job Type Bind: " + e); } 
}


exports.getJobpostJobTypeFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Job Type Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
             {$match: { "jobcode":Number(params.jobcode)}},
            
             { $project: {
                        "_id": 0, "jobtypes": '$jobtypes'
                     } 
                     }]).toArray(function(err, jobtyperesult) {
            finalresult =jobtyperesult;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Filter - Profile Job Type Bind: " + e); } 
}