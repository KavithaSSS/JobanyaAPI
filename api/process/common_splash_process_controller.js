'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
const { param } = require('../controller');
const Logger = require('../services/logger_service');
const logger = new Logger('logs');
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
var dbcollectionname = MongoDB.SplashCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
exports.getMaxcode = function (logparams, callback) {
  try {
    logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbcollectionname)).find().sort([['splashcode', -1]]).limit(1)
      .toArray((err, docs) => {
        if (docs.length > 0) {
          let maxId = docs[0].splashcode + 1;
          return callback(maxId);
        }
        else {
          return callback(1);
        }
      });
  }
  catch (e) { logger.error("Error in Get Max Code - Splash " + e); }
}
var async = require('async');
function checkSplashContent(splashListObj, callback) {
  try {
    var totalcount = 0;
    const dbo = MongoDB.getDB();
    var iteratorFcn = function (splashObj, done) {
      if (!splashObj.languagecode) {
        done();
        return;
      }
      dbo.collection(String(dbcollectionname)).find({ splash: { $elemMatch: { languagecode: splashObj.languagecode, content: splashObj.content } } }).count(function (err, res) {
        if (err) {
          done(err);
          return;
        }
        totalcount = totalcount + res;
        done();
        return;
      });
    };
    var doneIteratingFcn = function (err) {
      callback(err, totalcount);
    };
    async.forEach(splashListObj, iteratorFcn, doneIteratingFcn);
  }
  catch (e) { logger.error("Error in checking splash content - splash" + e); }
}
function checkSplashContentByCode(splashListObj, splashcodeObj, callback) {
  try {
    var totalcount = 0;
    const dbo = MongoDB.getDB();
    var iteratorFcn = function (splashObj, done) {
      if (!splashObj.languagecode) {
        done();
        return;
      }
      dbo.collection(String(dbcollectionname)).find({ splash: { $elemMatch: { languagecode: splashObj.languagecode, content: splashObj.content } }, splashcode: { $ne: parseInt(splashcodeObj) } }).count(function (err, res) {
        if (err) {
          done(err);
          return;
        }
        totalcount = totalcount + res;
        done();
        return;
      });
    };
    var doneIteratingFcn = function (err) {
      callback(err, totalcount);
    };
    async.forEach(splashListObj, iteratorFcn, doneIteratingFcn);
  }
  catch (e) { logger.error("Error in checking splash content - splash" + e); }
}
exports.checkSplashExists = function (logparams, req, callback) {
  try {
    logger.info("Log in checking splash name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    checkSplashContent(req.body.splash, function (err, stateCount) {
      if (err) {
        return;
      }
      return callback(stateCount);
    });
  }
  catch (e) { logger.error("Error in checking splash name - splash" + e); }
}
exports.checkSplashExistsByCode = function (logparams, req, callback) {
  try {
    logger.info("Log in checking splash name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    checkSplashContentByCode(req.body.splash, req.query.splashcode, function (err, stateCount) {
      if (err) {
        return;
      }
      return callback(stateCount);
    });
  }
  catch (e) { logger.error("Error in checking splash name by code - splash" + e); }
}
exports.checkSplashCodeExists = function (logparams, req, callback) {
  try {
    logger.info("Log in checking splash code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbcollectionname)).find({ splashcode: parseInt(req.query.splashcode) }).toArray(function (err, doc) //find if a value exists
    {
      return callback(doc.length);
    });
  }
  catch (e) { logger.error("Error in checking splash name - splash" + e); }
}
exports.InsertSplashDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in Splash create by Splash Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
      params.makerid = String(logres["ops"][0]["_id"]);
      dbo.collection(String(dbcollectionname)).insertOne(params, function (err, res) {
        if (err) throw err;
        finalresult = res.insertedCount;
        return callback(finalresult);
      });
    });
  }
  catch (e) { logger.error("Error in create - Splash" + e); }
}
exports.updateSplashDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in splash update by Splash Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
      params.makerid = String(logres["ops"][0]["_id"]);
      dbo.collection(String(dbcollectionname)).replaceOne({ "splashcode": parseInt(params.splashcode) }, params, function (err, res) {
        if (err) throw err;
        finalresult = res.modifiedCount;
        return callback(finalresult);
      });
    });
  }
  catch (e) { logger.error("Error in update - Splash" + e); }
}
exports.deleteSplashDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in Splash Delete by Splash Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dbcollectionname)).deleteOne({ "splashcode": parseInt(params.splashcode) }, function (err, res) {
      if (err) throw err;
      finalresult = res.deletedCount;
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in delete - Splash" + e); }
}
exports.getSplashSingleRecordDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in Get Splash single record: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dbcollectionname)).find({ "splashcode": parseInt(params.query.splashcode) }).toArray(function (err, result) {
      finalresult = result;
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in single record details - Splash" + e); }
}
exports.getSplashSingleRecordDetails_Edit = function (logparams, params, callback) {
  try {
    logger.info("Log in Get splash single record edit: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dbcollectionname)).find({ "splashcode": parseInt(params.splashcode) }, { projection: { _id: 0, categorycode: 1, splashcode: 1, splash: 1, imageurl: 1, statuscode: 1 } }).toArray(function (err, result) {
      finalresult = result;
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in single record details for edit - splash" + e); }
}
exports.getSplashFormLoadList = function (logparams, callback) {
  try {
    logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var params = { statuscode: parseInt(objConstants.activestatus) }
    objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
      dbo.collection(MongoDB.CategoryTypeCollectionName).aggregate([
        { $match: params },
        {
          $sort: {
            categoryname: 1
          }
        },
        {
          $project: { _id: 0, categorycode: 1, categoryname: 1 }
        }
      ]).toArray(function (err, categoryresult) {
        var finalresult = {
          languagelist: languageresult,
          categorylist: categoryresult
        };
        return callback(finalresult);
      });
    });
  }
  catch (e) { logger.error("Error in Form load - Splash " + e); }
}
exports.getSplashList_web = function (logparams, params, langcount, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    logger.info("Log in Splash List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    // if (parseInt(params.statuscode) == 0) { var condition = { 'splash.languagecode': defaultlanguagecode, statuscode: { $ne: objConstants.deletestatus } }; }
    // else { var condition = { 'splash.languagecode': defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
    var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstants.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"splash.languagecode": parseInt(params.languagecode) };
        }
    dbo.collection(String(dbcollectionname)).aggregate([
      {
        $addFields: {
          selected_language_count: {
            $size: "$splash"
          },
          language_count_status: { $toInt: { $eq: [{ $size: "$splash" }, langcount] } },
        }
      },
      { $unwind: '$splash' },
      { $match: {$and:[statuscondition,languagecondition]} },
      {
        $lookup:
        {
          from: String(MongoDB.CategoryTypeCollectionName),
          localField: 'categorycode',
          foreignField: 'categorycode',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $lookup:
        {
          from: String(dbstatuscollectionname),
          localField: 'statuscode',
          foreignField: 'statuscode',
          as: 'statusname'
        }
      },
      { $unwind: '$statusname' },
      {
        $sort: {
          createddate: -1
        }
      },
      {
        $project: {
          _id: 0, splashcode: 1,languagecode: '$splash.languagecode', categorycode: 1, categoryname: "$category.categoryname", splashcontent: '$splash.content', statuscode: 1, imageurl: '$splash.imageurl', statusname: '$statusname.statusname', language_count_status: 1, selected_language_count: 1
        }
      }
    ]).toArray(function (err, result) {
      finalresult = result;
      // //console.log(result);
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in Splash List: " + e); }

}
exports.getSplashList = function (logparams, langparams, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    logger.info("Log in Splash List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
    dbcollectionname.aggregate([
      { $unwind: '$splash' },
      { $match: langparams },
      {
        $lookup:
        {
          from: String(MongoDB.CategoryTypeCollectionName),
          localField: 'categorycode',
          foreignField: 'categorycode',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $lookup:
        {
          from: String(dbstatuscollectionname),
          localField: 'statuscode',
          foreignField: 'statuscode',
          as: 'statusname'
        }
      },
      { $unwind: '$statusname' },
      {
        $sort: {
          createddate: -1
        }
      },
      {
        $project: {
          _id: 0, splashcode: 1, categorycode: 1, categoryname: "$category.categoryname", statuscode: 1, imageurl:'$splash.imageurl', statusname: '$statusname.statusname'
        }
      }
    ]).toArray(function (err, result) {
      finalresult = result;
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in Employee Splash List: " + e); }

}

exports.getWelcomeScreenURL = function (logparams, callback) {
  try {
    logger.info("Log in Welcome Screen form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    
    dbo.collection(MongoDB.WelcomeScreenCollectionName).find({},{ projection: { _id: 0, employeescreenurl: 1, employerscreenurl: 1, commonscreenurl:1 } }).toArray(function (err, result) {
      
      return callback(result);
  });
  }
  catch (e) { logger.error("Error in Form load - Splash " + e); }
}

exports.UpdateScreenImageurl = function (logparams, req, callback) {
  try {
      logger.info("Updating Welcome Screen Image URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
      const dbo = MongoDB.getDB();
      var finalresult;
      dbo.collection(MongoDB.WelcomeScreenCollectionName).updateOne({}, { $set: { "employeescreenurl": req.body.employeescreenurl,"employerscreenurl": req.body.employerscreenurl,"commonscreenurl" : req.body.commonscreenurl } }, function (err, res) {
          if (err) throw err;
          finalresult = res.modifiedCount;
          ////console.log(finalresult);
          return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
      });

  }
  catch (e) { logger.error("Error in Updating Image URL: " + e); }
}

exports.InsertScreenImageurl = function (logparams, params, callback) {
  try {
      logger.info("Insert Welcome Screen Image URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
      const dbo = MongoDB.getDB();
      var finalresult;
      dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
        params.makerid = String(logres["ops"][0]["_id"]);
        dbo.collection(MongoDB.WelcomeScreenCollectionName).insertOne(params, function (err, res) {
          if (err) throw err;
          finalresult = res.insertedCount;
          return callback(finalresult);
        });
      });

  }
  catch (e) { logger.error("Error in Insert Image URL: " + e); }
}