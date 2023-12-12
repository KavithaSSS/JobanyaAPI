'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getJobRoleFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Job Role Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobroleparams =  {"statuscode": objConstants.activestatus, 'jobrole.languagecode': Number(params.languagecode) };
        var jobroleparams = {$and:[{"statuscode": objConstants.activestatus},{"jobrole.languagecode": Number(params.languagecode) }
        // {$or:[{"jobrole.languagecode": Number(params.languagecode) },{"jobrole.languagecode": objConstants.defaultlanguagecode }]}
    ]};
            dbo.collection(MongoDB.JobRoleCollectionName).aggregate([
            {$unwind: '$jobrole'},
            {
                "$addFields": {
                    "status": false
                }
            },
            { 
                "$lookup": 
                {
                    "from": "tbl_cp_jobfunction",
                    "localField": "jobfunctioncode",
                    "foreignField": "jobfunctioncode",
                    "as": "jobfunctioninfo"
                }
            },
           {$unwind:"$jobfunctioninfo"},
            {$match:jobroleparams},
            {$sort: {'jobrole.jobrolename': 1}},
                  { $project: {
                   _id: 0, jobrolecode:1, jobfunctioncode:1, jobrolename:'$jobrole.jobrolename',languagecode:'$jobrole.languagecode', status: '$status', imageurl: '$jobfunctioninfo.imageurl'
                   } }
                ]).toArray(function(err, jobroleresult) {
            finalresult =jobroleresult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
        });
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Job function Bind: " + e); }
  
  
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
                ////console.log(empresult);
               // //console.log("Entry");
                ////console.log(empresult.length);
                dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                    {$match:{ "employercode": Number(params.employercode), "statuscode":objConstants.activestatus }}, 
                    {$unwind:"$preferences"},
                    { "$lookup": {
                         "from": String((MongoDB.JobRoleCollectionName)),
                         "localField": "preferences.jobrole.jobrolecode",
                         "foreignField": "jobrolecode",
                         "as": "jobroleinfo"
                    }},
                    {$unwind:"$jobroleinfo"},
                    {$unwind:"$jobroleinfo.jobrole"},
                   // {$match:{"jobroleinfo.jobrole.languagecode":Number(params.languagecode)} },
                    { $match: {$and:[{"jobroleinfo.statuscode": objConstants.activestatus},
            {$or:[{"jobroleinfo.jobrole.languagecode": Number(params.languagecode) },{"jobroleinfo.jobrole.languagecode": objConstants.defaultlanguagecode }]}]}},
            
                    {$group: {"_id": {"jobrolecode": '$jobroleinfo.jobrolecode',"jobfunctioncode":'$jobroleinfo.jobfunctioncode', "jobrolename": '$jobroleinfo.jobrole.jobrolename',"languagecode": '$jobroleinfo.jobrole.languagecode'}}},
                    
                    { "$project": {
                       _id: 0,
                         jobfunctioncode: '$_id.jobfunctioncode', jobrolecode: '$_id.jobrolecode', jobrolename: '$_id.jobrolename', languagecode: '$_id.languagecode'}},
                         {$sort: {'jobrolename': 1}}
            ]).toArray(function(err, jobroleresult) {
                finalresult =jobroleresult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
            });
            }            
        });
        
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Profile Job function Bind: " + e); }
  
  
}
exports.getEmployeeJobRoleFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Job Role Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobroleparams =  {"statuscode": objConstants.activestatus, 'jobrole.languagecode': Number(params.languagecode) };
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            {$match: {'statuscode' : objConstants.approvedstatus}},
            {$group : { 
                _id : '$jobfunctioncode',
                dt : {$max: '$createddate'}
                }
            },
            {$sort: {'dt':-1}},
            {$limit:10},
            {$group : { 
                _id :null,
                'objects' : {$push:'$_id'}
                }
            },
            {$project: {_id:0, 'jobfunctioncode':'$objects'}}
          ]).toArray(function(err, jobfunctionresult) {
            // console.log("aaaaaaaaaaa",jobfunctionresult)
            exports.getRecentJobRole(logparams, jobfunctionresult[0].jobfunctioncode, params.languagecode, function (jobroleresult) {
                finalresult =jobroleresult;
                ////console.log("school");
                ////console.log(finalresult);
                return callback(finalresult);
            });
           
          });
        
       
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Job function Bind: " + e); }
  
  
}
exports.getJobpostJobRoleFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Employer Profile Job Role Bind in Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        var empparams =  {"jobcode": Number(params.jobcode) };
        dbo.collection(String(MongoDB.JobPostsCollectionName)).find(empparams, { projection: { _id: 0, jobrolecode: 1 } }).toArray(function (err, empresult) {
            
            if (empresult != null && empresult.length > 0)
            {
                ////console.log(empresult);
               // //console.log("Entry");
                ////console.log(empresult.length);
                dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
                    {$match:empparams}, 
                    
                    { "$lookup": {
                         "from": String((MongoDB.JobRoleCollectionName)),
                         "localField": "jobrolecode",
                         "foreignField": "jobrolecode",
                         "as": "jobroleinfo"
                    }},
                    {$unwind:"$jobroleinfo"},
                    {$unwind:"$jobroleinfo.jobrole"},
                   // {$match:{"jobroleinfo.jobrole.languagecode":Number(params.languagecode)} },
                    { $match: {$and:[{"jobroleinfo.statuscode": objConstants.activestatus},
            {$or:[{"jobroleinfo.jobrole.languagecode": Number(params.languagecode) },{"jobroleinfo.jobrole.languagecode": objConstants.defaultlanguagecode }]}]}},
            
                    {$group: {"_id": {"jobrolecode": '$jobroleinfo.jobrolecode',"jobfunctioncode":'$jobroleinfo.jobfunctioncode', "jobrolename": '$jobroleinfo.jobrole.jobrolename',"languagecode": '$jobroleinfo.jobrole.languagecode'}}},
                    
                    { "$project": {
                       _id: 0,
                         jobfunctioncode: '$_id.jobfunctioncode', jobrolecode: '$_id.jobrolecode', jobrolename: '$_id.jobrolename', languagecode: '$_id.languagecode'}},
                         {$sort: {'jobrolename': 1}}
            ]).toArray(function(err, jobroleresult) {
                finalresult =jobroleresult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
            });
            }            
        });
        
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Profile Job function Bind: " + e); }
  
  
}

exports.getRecentJobRole = function (logparams, jobfunctionresult, languagecode, callback) {
    try {
        //console.log("EntryLevel1")
        functiongetRecentJobRole(logparams, jobfunctionresult, languagecode, function (err, jobrolelist) {
           // console.log("EntryLevel1.1")
            if (err) {
                return;
            }
            return callback(jobrolelist);
        });
    }
    catch (e) { logger.error("Error in UpdateMatchingPercentage" + e); }
}

var async = require('async');
function functiongetRecentJobRole(logparams, jobfunctionresult, languagecode, callback) {
    try {
        // console.log("EntryLevel2")
        var returnval = [];
        var iteratorFcn = function (jobfunctioncode, done) {
            if (jobfunctioncode == null) {
                done();
                return;
            }

            exports.getEmpJobRoleFilterBind(logparams, jobfunctioncode, languagecode, function (response) {
                // console.log(response);
                returnval = returnval.concat(response)
               // returnval = response;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(jobfunctionresult, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in UpdateMatchingPercentageToEmployee" + e); }
}


exports.getEmpJobRoleFilterBind= function (logparams, jobfunctioncode, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Job Role Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        //  console.log(jobfunctioncode);
        //var jobroleparams =  {"statuscode": objConstants.activestatus, 'jobrole.languagecode': Number(params.languagecode) };
        //var jobroleparams = {$and:[{"statuscode": objConstants.activestatus},
        //{$or:[{"jobrole.languagecode": Number(params.languagecode) },{"jobrole.languagecode": objConstants.defaultlanguagecode }]}]};
            dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
                {$match: {'statuscode' : objConstants.approvedstatus, 'jobfunctioncode': jobfunctioncode}},
                {$group : { 
                    _id : '$jobrolecode',
                    dt : {$max: '$createddate'}
                    }
                },
                {$sort: {'dt':-1}},
                {$limit:5},
                {$group : { 
                    _id :null,
                    'objects' : {$push:'$_id'}
                    }
                },
                { "$lookup": {
                                       "from": "tbl_cp_jobrole",
                                       "localField": "objects",
                                       "foreignField": "jobrolecode",
                                       "as": "jobroleinfo"
                                  }},
                                   { "$lookup": {
                                       "from": "tbl_cp_jobfunction",
                                       "localField": "jobroleinfo.jobfunctioncode",
                                       "foreignField": "jobfunctioncode",
                                       "as": "jobfunctioninfo"
                                  }},
                                  {$unwind:"$jobfunctioninfo"},
                                  {$unwind:"$jobroleinfo"},
                                   {$unwind:"$jobroleinfo.jobrole"},
                                  { $match: {$and:[{"jobroleinfo.statuscode": 1},
                          {$or:[{"jobroleinfo.jobrole.languagecode": 2 },{"jobroleinfo.jobrole.languagecode": 2 }]}]}},
{$group: {"_id": {"jobrolecode": '$jobroleinfo.jobrolecode',"jobfunctioncode":'$jobroleinfo.jobfunctioncode', "jobrolename": '$jobroleinfo.jobrole.jobrolename',"languagecode": '$jobroleinfo.jobrole.languagecode', "imageurl" : '$jobfunctioninfo.imageurl'}}},
                           {"$project": {
                                     _id: 0,
                                       jobfunctioncode: '$_id.jobfunctioncode', jobrolecode: '$_id.jobrolecode', jobrolename: '$_id.jobrolename', languagecode: '$_id.languagecode', imageurl: '$_id.imageurl'}},
              ]).toArray(function(err, jobroleresult) {
            finalresult =jobroleresult;
            // console.log("school");
            // console.log(finalresult);
            return callback(finalresult);
        });
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Job function Bind: " + e); }
  
  
}