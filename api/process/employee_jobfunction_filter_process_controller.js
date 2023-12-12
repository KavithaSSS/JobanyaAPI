'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getJobFunctionFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Job Function Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };
        var jobfuncparams = {$and:[{"statuscode": objConstants.activestatus},
        {$or:[{"jobfunction.languagecode": Number(params.languagecode) }]}]};
        dbo.collection(MongoDB.JobFunctionCollectionName).aggregate([
            {$unwind: '$jobfunction'},
            {$match:jobfuncparams},
            {$sort: {'jobfunction.jobfunctionname': 1}},
                  { $project: {
                   _id: 0, jobfunctioncode:1, jobfunctionname:'$jobfunction.jobfunctionname',languagecode:'$jobfunction.languagecode'
                   } }
                ]).toArray(function(err, jobfunctionresult) {
            finalresult =jobfunctionresult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
        });
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Job function Bind: " + e); }
  
  
}

exports.getProfileJobFunctionFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Job Function Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        var empparams =  {"statuscode": objConstants.activestatus, "employeecode": Number(params.employeecode) };
        dbo.collection(String(MongoDB.EmployeeCollectionName)).find(empparams, { projection: { _id: 0, skills: 1 } }).toArray(function (err, empresult) {
            if (empresult[0].skills != null && empresult[0].skills.length > 0)
            {
                ////console.log("Entry");
                ////console.log(empresult.length);
                dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                    {$match:{ "employeecode": Number(params.employeecode), "statuscode":objConstants.activestatus }}, 
                    {$unwind:"$skills"},
                    { "$lookup": {
                         "from": String((MongoDB.JobFunctionCollectionName)),
                         "localField": "skills.jobfunctioncode",
                         "foreignField": "jobfunctioncode",
                         "as": "jobfunctioninfo"
                    }},
                    {$unwind:"$jobfunctioninfo"},
                    {$unwind:"$jobfunctioninfo.jobfunction"},
                    //{$match:{"jobfunctioninfo.jobfunction.languagecode":Number(params.languagecode)} },
                    { $match: {$and:[{"jobfunctioninfo.statuscode": objConstants.activestatus},
            {$or:[{"jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }]}]}},
            {$group: {"_id": {"jobfunctioncode": '$skills.jobfunctioncode', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname', "languagecode": '$jobfunctioninfo.jobfunction.languagecode'}}},
                    
                    { "$project": {
                       _id: 0,
                         jobfunctioncode: '$_id.jobfunctioncode', jobfunctionname: '$_id.jobfunctionname',languagecode: '$_id.languagecode'}},
                         {$sort: {'jobfunctionname': 1}}
            ]).toArray(function(err, jobfunctionresult) {
                finalresult =jobfunctionresult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
            });
            }
            else
            {
                dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                    {$match:{ "employeecode": Number(params.employeecode), "statuscode":objConstants.activestatus }}, 
                    {$unwind:"$preferences"},
                    {$unwind:"$preferences.jobfunction"},
                    { "$lookup": {
                         "from":  String((MongoDB.JobFunctionCollectionName)),
                         "localField": "preferences.jobfunction.jobfunctioncode",
                         "foreignField": "jobfunctioncode",
                         "as": "jobfunctioninfo"
                    }},
                    {$unwind:"$jobfunctioninfo"},
                    {$unwind:"$jobfunctioninfo.jobfunction"},
                    //{$match:{"jobfunctioninfo.jobfunction.languagecode":Number(params.languagecode)} },
                    { $match: {$and:[{"jobfunctioninfo.statuscode": objConstants.activestatus},
                    {$or:[{"jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }]}]}},
                    
                    { "$project": {
                       _id: 0,
                         jobfunctioncode: '$jobfunctioninfo.jobfunctioncode', jobfunctionname:'$jobfunctioninfo.jobfunction.jobfunctionname',languagecode:'$jobfunctioninfo.jobfunction.languagecode'}},
                         {$sort: {'jobfunctionname': 1}}
            ]).toArray(function(err, jobfunctionresult) {
                    finalresult =jobfunctionresult;
                    ////console.log("school");
                    ////console.log(finalresult);
                    return callback(finalresult);
                });
            }
        });
        
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Profile Job function Bind: " + e); }
  
  
}

exports.getEmployerJobFunctionFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Employer Profile Job Function Bind in Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        var empparams =  {"statuscode": objConstants.activestatus, "employercode": Number(params.employercode) };
        dbo.collection(String(MongoDB.EmployerCollectionName)).find(empparams, { projection: { _id: 0, preferences: 1 } }).toArray(function (err, empresult) {
            
            if (empresult != null && empresult.length > 0)
            {
               
                dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                    {$match:{ "employercode": Number(params.employercode), "statuscode":objConstants.activestatus }}, 
                    {$unwind:"$preferences"},
                    {$unwind:"$preferences.jobfunction"},
                    { "$lookup": {
                         "from": String((MongoDB.JobFunctionCollectionName)),
                         "localField": "preferences.jobfunction.jobfunctioncode",
                         "foreignField": "jobfunctioncode",
                         "as": "jobfunctioninfo"
                    }},
                    {$unwind:"$jobfunctioninfo"},
                    {$unwind:"$jobfunctioninfo.jobfunction"},
                    //{$match:{"jobfunctioninfo.jobfunction.languagecode":Number(params.languagecode)} },
                    { $match: {$and:[{"jobfunctioninfo.statuscode": objConstants.activestatus},
            {$or:[{"jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }]}]}},
            
                    {$group: {"_id": {"jobfunctioncode": '$preferences.jobfunction.jobfunctioncode', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname',"languagecode": '$jobfunctioninfo.jobfunction.languagecode'}}},
                    
                    { "$project": {
                       _id: 0,
                         jobfunctioncode: '$_id.jobfunctioncode', jobfunctionname: '$_id.jobfunctionname', languagecode: '$_id.languagecode'}},
                         {$sort: {'jobfunctionname': 1}}
            ]).toArray(function(err, jobfunctionresult) {
                finalresult =jobfunctionresult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
            });
            }
            
        });
        
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Profile Job function Bind: " + e); }
  
  
}

exports.getEmployerJobRoleFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Employer Profile Job Role Bind in Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        var empparams =  {"statuscode": objConstants.activestatus, "employercode": Number(params.employercode) };
        dbo.collection(String(MongoDB.EmployerCollectionName)).find(empparams, { projection: { _id: 0, preferences: 1 } }).toArray(function (err, empresult) {
            
            if (empresult != null && empresult.length > 0)
            {
               
                dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                    {$match:{ "employercode": Number(params.employercode), "statuscode":objConstants.activestatus }}, 
                    {$unwind:"$preferences"},
                    {$unwind:"$preferences.jobrole"},
                    { "$lookup": {
                         "from": String((MongoDB.JobRoleCollectionName)),
                         "localField": "preferences.jobrole.jobrolecode",
                         "foreignField": "jobrolecode",
                         "as": "jobroleinfo"
                    }},
                    { $unwind: {path:'$jobroleinfo',preserveNullAndEmptyArrays: true }  },
                    { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
                    //{ $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(params.languagecode) }] } },
                    { $match: {$and:[{"jobroleinfo.statuscode": objConstants.activestatus},
            {$or:[{"jobroleinfo.jobrole.languagecode": Number(params.languagecode) }]}]}},
            
                    {$group: {"_id": {"jobrolecode": '$preferences.jobrole.jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename', "languagecode": '$jobroleinfo.jobrole.languagecode'}}},
                    
                    { "$project": {
                       _id: 0,
                       jobrolecode: '$_id.jobrolecode', jobrolename: '$_id.jobrolename',languagecode: '$_id.languagecode'}},
                       {$sort: {'$_id.jobrolename': 1}}
            ]).toArray(function(err, jobfunctionresult) {
                finalresult =jobfunctionresult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
            });
            }
            else
            {
                dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                    {$match:{ "employeecode": Number(params.employeecode), "statuscode":objConstants.activestatus }}, 
                    {$unwind:"$preferences"},
                    {$unwind:"$preferences.jobfunction"},
                    { "$lookup": {
                         "from":  String((MongoDB.JobFunctionCollectionName)),
                         "localField": "preferences.jobfunction.jobfunctioncode",
                         "foreignField": "jobfunctioncode",
                         "as": "jobfunctioninfo"
                    }},
                    {$unwind:"$jobfunctioninfo"},
                    {$unwind:"$jobfunctioninfo.jobfunction"},
                    //{$match:{"jobfunctioninfo.jobfunction.languagecode":Number(params.languagecode)} },
                    { $match: {$and:[{"jobfunctioninfo.statuscode": objConstants.activestatus},
            {$or:[{"jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }]}]}},
            
                    { "$project": {
                       _id: 0,
                         jobfunctioncode: '$jobfunctioninfo.jobfunctioncode', jobfunctionname:'$jobfunctioninfo.jobfunction.jobfunctionname',languagecode:'$jobfunctioninfo.jobfunction.languagecode'}}
            ]).toArray(function(err, jobfunctionresult) {
                    finalresult =jobfunctionresult;
                    ////console.log("school");
                    ////console.log(finalresult);
                    return callback(finalresult);
                });
            }
        });
        
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Profile Job function Bind: " + e); }
  
  
}

exports.getJobpostJobFunctionFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Employer Profile Job Function Bind in Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        var empparams =  {"jobcode": Number(params.jobcode) };
       
               
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            {$match:{ "jobcode": Number(params.jobcode)}}, 
            
            { "$lookup": {
                 "from": String((MongoDB.JobFunctionCollectionName)),
                 "localField": "jobfunctioncode",
                 "foreignField": "jobfunctioncode",
                 "as": "jobfunctioninfo"
            }},
            {$unwind:"$jobfunctioninfo"},
            {$unwind:"$jobfunctioninfo.jobfunction"},
            //{$match:{"jobfunctioninfo.jobfunction.languagecode":Number(params.languagecode)} },
            { $match: {$and:[{"jobfunctioninfo.statuscode": objConstants.activestatus},
    {$or:[{"jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }]}]}},
    
            {$group: {"_id": {"jobfunctioncode": '$jobfunctioncode', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname',"languagecode": '$jobfunctioninfo.jobfunction.languagecode'}}},
            
            { "$project": {
               _id: 0,
                 jobfunctioncode: '$_id.jobfunctioncode', jobfunctionname: '$_id.jobfunctionname', languagecode: '$_id.languagecode'}},
                 {$sort: {'jobfunctionname': 1}}
    ]).toArray(function(err, jobfunctionresult) {
        finalresult =jobfunctionresult;
    ////console.log("school");
    ////console.log(finalresult);
    return callback(finalresult);
    });
        
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Profile Job function Bind: " + e); }
  
  
}