'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getSkillFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Skill Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        /*dbo.collection(String(MongoDB.SkillsMappingCollectionName)).aggregate([     
            {
                $lookup:
                {
                    from: String(MongoDB.SkillCollectionName),
                    localField: 'skillcode',
                    foreignField: 'skillcode',
                    as: 'skillinfo'
                }
            },
            { $unwind: '$skillinfo' },
            { $unwind: '$skillinfo.skill' },
            {$match:{"skillinfo.statuscode": objConstants.activestatus,"skillinfo.skill.languagecode":Number(params.languagecode)}},            
            { "$lookup": {
                "from": String(MongoDB.JobFunctionCollectionName),
                "localField": "jobfunctioncode",
                "foreignField": "jobfunctioncode",
                "as": "jobfunctioninfo"
              }},
             {$unwind:"$jobfunctioninfo"},   
             {$sort: {'skillinfo.skill.skillname': 1}},
             { $project: {
                        "_id": 0, "skillcode":1, "skillname": '$skillinfo.skill.skillname',
                         "jobfunctioncode":'$jobfunctioninfo.jobfunctioncode',"jobrolecode":1
                        
                     } 
                     }])*/
                     dbo.collection(String(MongoDB.SkillsMappingCollectionName)).aggregate([ 
                        {
                           $lookup:
                           {
                               from: String(MongoDB.SkillCollectionName),
                               localField: 'skillcode',
                               foreignField: 'skillcode',
                               as: 'skillinfo'
                           }
                       },
                       { $unwind: '$skillinfo' },
                       { $unwind: '$skillinfo.skill' },
                       //{$match:{"skillinfo.statuscode": objConstants.activestatus,"skillinfo.skill.languagecode":Number(params.languagecode)}},           
                       { $match: {$and:[{"skillinfo.statuscode": objConstants.activestatus},
            {$or:[{"skillinfo.skill.languagecode": Number(params.languagecode) }]}]}},
            
                        
               {$group:{_id:{jobfunctioncode:'$jobfunctioncode',jobrolecode:'$jobrolecode',skillcode:'$skillcode', skillname:'$skillinfo.skill.skillname',languagecode:'$skillinfo.skill.languagecode'}, numberOfcodes:{$sum:1}}}, 
            //    {$group:{_id:'$_id.skillcode',languagecode:'$_id.languagecode',  skillname:{$first:'$_id.skillname'}, 
            //              numberOfcodes:{$first:'$numberOfcodes'}}},
            //              {$sort: {'skillname': 1}},
                        // {$project:{_id:0,"skillcode":'$_id',"skillname":'$skillname',"languagecode":'$languagecode'}}
                        {$project:{_id:0,"jobfunctioncode":'$_id.jobfunctioncode',"jobrolecode":'$_id.jobrolecode',"skillcode":'$_id.skillcode',"skillname":'$_id.skillname',"languagecode":'$_id.languagecode'}}
           ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log("school");
            ////console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Filter - Skill Bind: " + e); }
}

exports.getProfileSkillFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Skill Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            {$match:{ "employeecode": Number(params.employeecode), "statuscode":objConstants.activestatus }}, 
            {$unwind:"$skills"},
            { "$lookup": {
                 "from":  String(MongoDB.SkillCollectionName),
                 "localField": "skills.skillcode",
                 "foreignField": "skillcode",
                 "as": "skillinfo"
            }},
            {$unwind:"$skillinfo"},
            {$unwind:"$skillinfo.skill"},
            //{$match:{"skillinfo.skill.languagecode":Number(params.languagecode)} },
            { $match: {$and:[{"skillinfo.statuscode": objConstants.activestatus},
            {$or:[{"skillinfo.skill.languagecode": Number(params.languagecode) }]}]}},
            { "$project": {
               _id: 0, jobfunctioncode: '$skillinfo.jobfunctioncode',
                 skillcode: '$skillinfo.skillcode', skillname: '$skillinfo.skill.skillname',languagecode:'$skillinfo.skill.languagecode'}}
            ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log("school");
            //  console.log(result);

            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Filter - Profile Skill Bind: " + e); }
  
  
  }


  exports.getJobSkillFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Skill Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            {$match:{ "jobcode": Number(params.jobcode)}}, 
            {$unwind:"$skills"},
            { "$lookup": {
                 "from":  String(MongoDB.SkillCollectionName),
                 "localField": "skills.skillcode",
                 "foreignField": "skillcode",
                 "as": "skillinfo"
            }},
            {$unwind:"$skillinfo"},
            {$unwind:"$skillinfo.skill"},
            //{$match:{"skillinfo.skill.languagecode":Number(params.languagecode)} },
            { $match: {$and:[{"skillinfo.statuscode": objConstants.activestatus},
            {$or:[{"skillinfo.skill.languagecode": Number(params.languagecode) }]}]}},
            { "$project": {
               _id: 0, jobfunctioncode: '$skillinfo.jobfunctioncode',
                 skillcode: '$skillinfo.skillcode', skillname: '$skillinfo.skill.skillname',languagecode:'$skillinfo.skill.languagecode'}}
            ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log("school");
            //  console.log(result);

            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Filter - Job Skill Bind: " + e); }
  
  
  }