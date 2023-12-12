'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getEmpSearchBind = function (logparams, params, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    logger.info("Log in Search Bind on Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
    //state Collection
    ////console.log(languagecode);
    var noofsearchdays;
    var searchdate = new Date();;
    var recentlocationlist = [];
    var recentjobrolelist = [];
    var recentjobfunctionlist = [];
    dbo.collection(MongoDB.DistrictCollectionName).aggregate([
      { $unwind: "$district" },
      { $match: {$and:[{"statuscode": objConstants.activestatus},
      {$or:[{"district.languagecode": Number(params.languagecode) },{"district.languagecode": objConstants.defaultlanguagecode }]}]}},
      {
        "$project": {
          _id: 0,
          "districtcode": 1,
          "statecode": 1,"languagecode": '$district.languagecode',
          "districtname": '$district.districtname'
        }
      }
    ]).toArray(function (err, locationresult) {
      dbo.collection(MongoDB.JobRoleCollectionName).aggregate([
        { $unwind: "$jobrole" },
        { $match: {$and:[{"statuscode": objConstants.activestatus},
        {$or:[{"jobrole.languagecode": Number(params.languagecode) },{"jobrole.languagecode": objConstants.defaultlanguagecode }]}]}},
        {
          "$project": {
            _id: 0,
            "jobrolecode": 1,"languagecode": '$jobrole.languagecode',
            "jobrolename": '$jobrole.jobrolename'
          }
        }
      ]).toArray(function (err, jobroleresult) {
        dbo.collection(MongoDB.JobFunctionCollectionName).aggregate([
          { $unwind: "$jobfunction" },
          { $match: {$and:[{"statuscode": objConstants.activestatus},
        {$or:[{"jobfunction.languagecode": Number(params.languagecode) },{"jobfunction.languagecode": objConstants.defaultlanguagecode }]}]}},
        {
            "$project": {
              _id: 0,
              "jobfunctioncode": 1,"languagecode": '$jobfunction.languagecode',
              "jobfunctionname": '$jobfunction.jobfunctionname'
            }
          }
        ]).toArray(function (err, jobfunctionresult) {
          dbo.collection(MongoDB.ControlsCollectionName).find({}, { projection: { _id: 0, recentsearchdays: 1 } }).toArray(function (err, searchdays) {
            if (searchdays[0] != null && searchdays.length > 0) {
              noofsearchdays = searchdays[0].recentsearchdays;

              ////console.log(searchdate);
              ////console.log(milliseconds);
            }
            dbo.collection(MongoDB.EmployerRecentSearchCollectionName).aggregate([
              { $match: { "employercode": Number(params.employercode) } },
              { $sort: { searchdate: -1 } },
              { $limit: noofsearchdays },
              { $match: { "type": 1 } },
              {
                "$lookup": {
                  "from": String((MongoDB.DistrictCollectionName)),
                  "localField": "typecode",
                  "foreignField": "districtcode",
                  "as": "recentdistrictinfo"
                }
              },
              { "$unwind": "$recentdistrictinfo" },
              { "$unwind": "$recentdistrictinfo.district" },
              { "$match": {$or:[{"recentdistrictinfo.district.languagecode": Number(params.languagecode) },
            {"recentdistrictinfo.district.languagecode": objConstants.defaultlanguagecode}] } },
              {
                "$project": {
                  _id: 0,
                  "locationcode": '$recentdistrictinfo.districtcode',
                  "locationname": '$recentdistrictinfo.district.districtname',
                  "languagecode": '$recentdistrictinfo.district.languagecode'
                }
              }
            ]).toArray(function (err, recentlocationresult) {
              if (recentlocationresult != null && recentlocationresult.length > 0)
                recentlocationlist = recentlocationresult;
              dbo.collection(MongoDB.EmployerRecentSearchCollectionName).aggregate([
                { $match: { "employercode": Number(params.employercode) } },
                { $sort: { searchdate: -1 } },
                { $limit: noofsearchdays },
                { $match: { "type": 2 } },
                {
                  "$lookup": {
                    "from": String(MongoDB.JobRoleCollectionName),
                    "localField": "typecode",
                    "foreignField": "jobrolecode",
                    "as": "recentjobroleinfo"
                  }
                },
                { "$unwind": "$recentjobroleinfo" },
                { "$unwind": "$recentjobroleinfo.jobrole" },
                { "$match": {$or:[{"recentjobroleinfo.jobrole.languagecode": Number(params.languagecode) },
            {"recentjobroleinfo.jobrole.languagecode": objConstants.defaultlanguagecode}] } },
                {
                  "$project": {
                    _id: 0,
                    "jobrolecode": '$recentjobroleinfo.jobrolecode',
                    "jobrolename": '$recentjobroleinfo.jobrole.jobrolename',
                    "languagecode": '$recentjobroleinfo.jobrole.languagecode'
                  }
                }
              ]).toArray(function (err, recentjobroleresult) {
                if (recentjobroleresult != null && recentjobroleresult.length > 0)
                  recentjobrolelist = recentjobroleresult;
                dbo.collection(MongoDB.EmployerRecentSearchCollectionName).aggregate([
                  { $match: { "employercode": Number(params.employercode) } },
                  { $sort: { searchdate: -1 } },
                  { $limit: noofsearchdays },
                  { $match: { "type": 3 } },
                  {
                    "$lookup": {
                      "from": String(MongoDB.JobFunctionCollectionName),
                      "localField": "typecode",
                      "foreignField": "jobfunctioncode",
                      "as": "recentjobfunctioninfo"
                    }
                  },
                  { "$unwind": "$recentjobfunctioninfo" },
                  { "$unwind": "$recentjobfunctioninfo.jobfunction" },
                  { "$match": {$or:[{"recentjobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) },
            {"recentjobfunctioninfo.jobfunction.languagecode": objConstants.defaultlanguagecode}] } },
                  {
                    "$project": {
                      _id: 0,
                      "jobfunctioncode": '$recentjobfunctioninfo.jobfunctioncode',
                      "jobfunctionname": '$recentjobfunctioninfo.jobfunction.jobfunctionname',
                      "languagecode": '$recentjobfunctioninfo.jobfunction.languagecode'
                    }
                  }
                ]).toArray(function (err, recentjobfunctionresult) {
                  if (recentjobfunctionresult != null && recentjobfunctionresult.length > 0)
                    recentjobfunctionlist = recentjobfunctionresult;
                  finalresult = {
                    locationlist: locationresult,
                    jobrolelist: jobroleresult,
                    jobfunctionlist: jobfunctionresult,
                    recentsearchlist: {
                      recentlocationlist: recentlocationlist,
                      recentjobrolelist: recentjobrolelist,
                      recentjobfunctionlist: recentjobfunctionlist
                    }
                  }
                  ////console.log(finalresult);
                  return callback(finalresult);
                });
              });

            });
          });


        });
      });

      ////console.log("school");
      ////console.log(result);

    });
  }
  catch (e) { logger.error("Error in Employer Search Bind: " + e); }


}

exports.deleteEmployerSearchDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in Search Delete : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(MongoDB.EmployerRecentSearchCollectionName)).deleteOne({ "employercode": Number(params.employercode), "type": Number(params.type), "typecode": Number(params.typecode) }, function (err, res) {
      if (err) throw(err);
      return callback(res.deletedCount);
    });
  }
  catch (e) { logger.error("Error in delete - Employer Recent Search" + e); }
}

exports.EmployerRecentSearchUpdate = function (logparams, params, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    logger.info("Log in Job List on Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    ////console.log(params);
    dbo.collection(String(MongoDB.EmployerRecentSearchCollectionName)).find({ "employercode": params.employercode, "type": params.type, "typecode": params.typecode }, { $exists: true }).count(function (err, totalcount) {
      ////console.log(totalcount);
      if (totalcount == 0) {
        dbo.collection(String(MongoDB.EmployerRecentSearchCollectionName)).insertOne(params, function (err, recentresult) {
          if(err) throw err;
          finalresult = recentresult.insertedCount; 
          return callback(finalresult);
        });
      }
      else {
        dbo.collection(String(MongoDB.EmployerRecentSearchCollectionName)).updateOne({ "employercode": params.employercode, "type": params.type, "typecode": params.typecode }, { $set: { "searchdate": milliseconds } }, function (err, res) {
          if(err) throw err;
          finalresult = res.modifiedCount;
          return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
        });
      }
    });

  }
  catch (e) { logger.error("Error in Employer Recent Search Update: " + e); }
} 