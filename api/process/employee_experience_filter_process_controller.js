'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getExperienceFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Experience Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };
        // dbo.collection(MongoDB.ExperienceCollectionName).find({"statuscode": objConstants.activestatus, "value": {$gte: 0}},
        //  { projection: { _id: 0, experiencecode:1, experiencename: 1, value:1 } }, 
        //  {
        //     $sort: {
        //         experiencecode: -1
        //     }
        //   }).toArray(function(err, experienceresult) {
        dbo.collection(MongoDB.ExperienceCollectionName).aggregate([
            {$match: {"statuscode": objConstants.activestatus, "value": {$gte: 0}}},
             { $project: { _id: 0, experiencecode:1, experiencename: 1, value:1 } }, 
             {
                    $sort: {
                        value: -1
                    }
                  }
        ]).toArray(function(err, experienceresult) {


            finalresult =experienceresult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
        });
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Experience Bind: " + e); }
  
  
}

exports.getProfileExperienceFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Experience Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };
        //dbo.collection(MongoDB.ExperienceCollectionName).find({"statuscode": objConstants.activestatus}, { projection: { _id: 0, experiencecode:1, experiencename: 1, value:1 } }).toArray(function(err, experienceresult) {
            dbo.collection(MongoDB.EmployeeCollectionName).find({"employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus}, { projection: {_id: 0, "totalexperience": 1, "fresherstatus": 1}}).toArray(function(err, empresult) {
                if (empresult != null && empresult.length > 0)
                {
                    dbo.collection(MongoDB.ExperienceCollectionName).find({value: {"$lte": empresult[0].totalexperience}},{ projection: {_id: 0, "experiencecode": 1, "experiencename": 1, value:1}}).toArray(function(err, experienceresult) {
                        finalresult =experienceresult;
                        return callback(finalresult);
                    });
                }
                else
                {
                    return callback(finalresult);
                }            
            });
        }
    catch (e) { logger.error("Error in Filter - Profile Experience Bind: " + e); } 
}


exports.getJobpostExperienceFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Experience Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };
        //dbo.collection(MongoDB.ExperienceCollectionName).find({"statuscode": objConstants.activestatus}, { projection: { _id: 0, experiencecode:1, experiencename: 1, value:1 } }).toArray(function(err, experienceresult) {
            dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
                {"$match": { "jobcode": 1968 } }, 
                {$unwind: "$experience"},
                {"$project": { "_id" : 0, fresherstatus: '$experience.isfresher', expfrom: '$experience.from', expto: '$experience.to'} }
            ]).toArray(function(err, empresult) {
                if (empresult != null && empresult.length > 0)
                {
                    finalresult =empresult;
                    return callback(finalresult);
                }
                else
                {
                    return callback(finalresult);
                }            
            });
        }
    catch (e) { logger.error("Error in Filter - Profile Experience Bind: " + e); } 
}