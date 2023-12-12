'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getIndustryCount = function (logparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Job List Count by Industry Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        objUtilities.FindAllDeletedEmployer(function(emplist){
          var empcondition = {};
                var tempempcode = [];
                if(emplist != null && emplist.length>0){
                    for (var i = 0; i <= emplist.length - 1; i++) {	
                        tempempcode.push(emplist[i].employeecode);	
                    }	
                    empcondition = {"jobslist.employercode":{$nin:tempempcode}};
                }
                dbo.collection(MongoDB.IndustryCollectionName).aggregate([
                  {$unwind:"$industry"},
                   {$match:{"statuscode":objConstants.activestatus}},    
                   { "$lookup": {
                      "from": String(MongoDB.JobPostsCollectionName),
                      "localField": "industrycode",
                      "foreignField": "industrycode",
                      "as": "jobslist"
                    }},
                    {$match:empcondition },
                    {
                      "$addFields": {
                          "jobslist": {
                      "$filter": {
                        "input": "$jobslist",
                        "as": "filterjoblist",
                        "cond": { "$and": [{"$gte": [ "$$filterjoblist.validitydate", milliseconds ]},
                                       //   {"$gte": [ "$$filterjoblist.subscriptiondetails.expirydate", milliseconds ]},
                                          {"$eq": [ "$$filterjoblist.statuscode",objConstants.approvedstatus]}]
                          
                        }
                      }
                          }
                      }
                  },
                    {$match:{"industry.languagecode":Number(languagecode)} },
                    { "$project": {
                    _id: 0,
                      "industrycode": 1,
                    "industryname":'$industry.industryname',
                    "imageurl":1,
                    "jobcount": { "$size": "$jobslist" }	
                    }},
                    {$sort:{'industryname':1}},
                    {
                          "$match": {
                              "jobcount": { "$gt": 0 }
                           }
                      }
                  ]).toArray(function (err, result) {
                  finalresult = result;
                  ////console.log("school");
                  ////console.log(result);
                  return callback(finalresult);
              });
        });
        
    }
    catch (e) { logger.error("Error in Getting Job List Count by Industry: " + e); }


}

exports.getJobListbyIndustry = function (logparams, params, callback) {
  try {
      const dbo = MongoDB.getDB();
      var finalresult;
      var date = new Date(); // some mock date
      var milliseconds = date.getTime();
      logger.info("Log in Job List by Industry Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
      //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
      //state Collection
      ////console.log(languagecode);
      dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
        {$match:{  $and: [{'validitydate': {$gte: milliseconds }},{'industrycode': {$eq: Number(params.typecode)}},{'statuscode': {$eq: objConstants.approvedstatus }}]}},
         { "$lookup": {
           "from":  String(MongoDB.JobRoleCollectionName),
           "localField": "jobrolecode",
           "foreignField": "jobrolecode",
           "as": "jobroleinfo"
         }},
         { "$lookup": {
           "from":  String(MongoDB.EmployerCollectionName),
           "localField": "employercode",
           "foreignField": "employercode",
           "as": "employerinfo"
         }},
         {$match:{"employerinfo.statuscode":objConstants.activestatus} },
         { "$lookup": {
           "from":  String(MongoDB.DistrictCollectionName),
           "localField": "preferredlocation.locationlist.locationcode",
           "foreignField": "districtcode",
           "as": "districtinfo"
         }},
         
         {$unwind:"$employerinfo"},
         {$unwind:"$districtinfo"},
         {$unwind:"$districtinfo.district"},
         { $unwind: {path:'$jobroleinfo',preserveNullAndEmptyArrays: true }  },
         { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
         { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(params.languagecode) }] } },
         {$match:{"districtinfo.district.languagecode":Number(params.languagecode)} },
          {$group: {"_id":{"jobid": "$jobid", "jobcode": '$jobcode',"jobrolecode":'$jobrolecode', "jobrolename":'$jobroleinfo.jobrole.jobrolename',
                 "employercode": '$employercode', "employername": '$employerinfo.registeredname', "experience":'$experience', "salaryrange":'$salaryrange', 
                 "subscriptiondetails":'$subscriptiondetails', "approveddate": '$approveddate', "validitydate": {$toDate: '$validitydate'}, "daysleft": {
             $ceil: { "$divide": [
               { "$subtract": ["$validitydate", milliseconds] },
               60 * 1000 * 60 * 24
             ]
           }}}, "location": { 
                   "$push": { 
                       "locationcode": "$districtinfo.districtcode",
               "locationname": "$districtinfo.district.districtname"
                   },
               },
              }},
              {$sort: params.sortbyparams},
        { "$project": {
         _id: 0,
           "jobid": '$_id.jobid', "jobcode":'$_id.jobcode', "jobrolecode":'$_id.jobrolecode', "jobrolename":'$_id.jobrolename', employercode:'$_id.employercode', 
         employername: '$_id.employername',
         "experience":'$_id.experience', "salaryrange":'$_id.salaryrange', "subscriptiondetails":'$_id.subscriptiondetails', "validitydate": '$_id.validitydate',
         "daysleft" :'$_id.daysleft',
         "locationcode": '$location.locationcode', "locationname": '$location.locationname'}}
       ]).toArray(function (err, result) {
          finalresult = result;
          ////console.log("school");
          ////console.log(result);
          return callback(finalresult);
      });
  }
  catch (e) { logger.error("Error in Getting Job List by Industry: " + e); }


}