'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getSearchBind = function (logparams, params, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    logger.info("Log in Search Bind on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
    //state Collection
    ////console.log(languagecode);
    var noofsearchdays;
    var searchdate = new Date();;
    var recentlocationlist = [];
    var recentindustrylist = [];
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
      dbo.collection(MongoDB.IndustryCollectionName).aggregate([
        { $unwind: "$industry" },
        { $match: {$and:[{"statuscode": objConstants.activestatus},
        {$or:[{"industry.languagecode": Number(params.languagecode) },{"industry.languagecode": objConstants.defaultlanguagecode }]}]}},
        {
          "$project": {
            _id: 0,
            "industrycode": 1,"languagecode": '$industry.languagecode',
            "industryname": '$industry.industryname'
          }
        }
      ]).toArray(function (err, industryresult) {
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
          
          dbo.collection(MongoDB.ControlsCollectionName).find({}, { projection: { _id: 0, recentsearchdays: 1 } }).toArray(function (err, searchdays) {
            if (searchdays[0] != null && searchdays.length > 0) {
              noofsearchdays = searchdays[0].recentsearchdays;

              ////console.log(searchdate);
              ////console.log(milliseconds);
            }
            dbo.collection(MongoDB.RecentSearchCollectionName).aggregate([
              { $match: { "employeecode": Number(params.employeecode) } },
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
              dbo.collection(MongoDB.RecentSearchCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode) } },
                { $sort: { searchdate: -1 } },
                { $limit: noofsearchdays },
                { $match: { "type": 4 } },
                {
                  "$lookup": {
                    "from": String(MongoDB.IndustryCollectionName),
                    "localField": "typecode",
                    "foreignField": "industrycode",
                    "as": "recentindustryinfo"
                  }
                },
                { "$unwind": "$recentindustryinfo" },
                { "$unwind": "$recentindustryinfo.industry" },
                { "$match": {$or:[{"recentindustryinfo.industry.languagecode": Number(params.languagecode) },
            {"recentindustryinfo.industry.languagecode": objConstants.defaultlanguagecode}] } },
            {
                  "$project": {
                    _id: 0,
                    "industrycode": '$recentindustryinfo.industrycode',
                    "industryname": '$recentindustryinfo.industry.industryname',
                    "languagecode": '$recentindustryinfo.industry.languagecode'
                  }
                }
              ]).toArray(function (err, recentindustryresult) {
                if (recentindustryresult != null && recentindustryresult.length > 0)
                  recentindustrylist = recentindustryresult;
                dbo.collection(MongoDB.RecentSearchCollectionName).aggregate([
                  { $match: { "employeecode": Number(params.employeecode) } },
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
                  dbo.collection(MongoDB.RecentSearchCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode) } },
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
                   
                  finalresult = {
                    locationlist: locationresult,
                    industrylist: industryresult,
                    jobfunctionlist: jobfunctionresult,
                    jobrolelist:jobroleresult,
                    recentsearchlist: {
                      recentlocationlist: recentlocationlist,
                      recentindustrylist: recentindustrylist,
                      recentjobfunctionlist: recentjobfunctionlist,
                      recentjobrolelist:recentjobroleresult
                    }
                  }
                  // //console.log(finalresult);
                  return callback(finalresult);
                  });
                 
                });
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
  catch (e) { logger.error("Error in Search Bind: " + e); }


}

exports.deleteSearchDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in Search Delete : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(MongoDB.RecentSearchCollectionName)).deleteOne({ "employeecode": Number(params.employeecode), "type": Number(params.type), "typecode": Number(params.typecode) }, function (err, res) {
      if (err) throw err;
      finalresult = res.deletedCount;
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in delete - Recent Search" + e); }
}
