'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
var dbcollectionname = MongoDB.DesignationCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbuserlist = MongoDB.UserCollectionName;
exports.getMaxcode = function (logparams, callback) {
  try {
    logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbcollectionname)).find().sort([['designationcode', -1]]).limit(1)
      .toArray((err, docs) => {
        if (docs.length > 0) {
          let maxId = docs[0].designationcode + 1;
          return callback(maxId);
        }
        else {
          return callback(1);
        }
      });
  }
  catch (e) { logger.error("Error in Get Max Code - Designation" + e); }
}
exports.checkDesignationNameExists = function (logparams, req, callback) {
  try {
    logger.info("Log in checking designation name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    //var regex = new RegExp("^" + req.body.designationname.toLowerCase(), "i");
    dbo.collection(String(dbcollectionname)).find({ "designationname": {$regex:"^"+req.body.designationname+"$",$options:'i'}}, { $exists: true }).toArray(function (err, doc) //find if a value exists
    {
      return callback(doc.length);
    });
  }
  catch (e) { logger.error("Error in checking designation name - Designation" + e); }
}
exports.checkDesignationCodeExists = function (logparams, req, callback) {
  try {
    logger.info("Log in checking designation code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbcollectionname)).find({ "designationcode": parseInt(req.query.designationcode) }).toArray(function (err, doc) //find if a value exists
    {
      return callback(doc.length);
    });
  }
  catch (e) { logger.error("Error in checking designation code - Designation" + e); }
}
exports.checkDesignationNameExistsByCode = function (logparams, req, callback) {
  try {
    logger.info("Log in checking designation name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    //var regex = new RegExp("^" + req.body.designationname.toLowerCase(), "i");
    dbo.collection(String(dbcollectionname)).find({ "designationname": {$regex:"^"+req.body.designationname+"$",$options:'i'}, designationcode: { $ne: parseInt(req.query.designationcode) } }).toArray(function (err, doc) //find if a value exists
    {
      return callback(doc.length);
    });
  }
  catch (e) { logger.error("Error in checking designation name by code - Designation" + e); }
}
exports.InsertDesignationDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in Designation creat by desination Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
      params.makerid = String(logres["ops"][0]["_id"]);
      dbo.collection(String(dbcollectionname)).insertOne(params, function (err, res) {
        if (err) throw err;
        finalresult = res.insertedCount;
        ////console.log(finalresult);
        return callback(finalresult);
      });
    });
  }
  catch (e) { logger.error("Error in create - Designation" + e); }
}
exports.updateDesignationDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in Designation update by desination Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
      params.makerid = String(logres["ops"][0]["_id"]);
      dbo.collection(String(dbcollectionname)).replaceOne({ "designationcode": parseInt(params.designationcode) }, params, function (err, res) {
        if (err) throw err;
        finalresult = res.modifiedCount;
        return callback(finalresult);
      });
    });
  }
  catch (e) { logger.error("Error in update - Designation" + e); }
}
exports.deleteDesignationDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in Designation Delete by desination Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dbcollectionname)).deleteOne({ "designationcode": parseInt(params.designationcode) }, function (err, res) {
      if (err) throw err;
      finalresult = res.deletedCount;
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in delete - Designation" + e); }
}
exports.checkDesignationCodeExistsInOthers = function (logparams, req, callback) {
  try {
    logger.info("Log in checking designation in other tables: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbuserlist)).find({ "designationcode": parseInt(req.query.designationcode) }, { $exists: true }).toArray(function (err, doc) //find if a value exists
    {
      // //console.log(doc.length);
      return callback(doc.length);
    });
  }
  catch (e) { logger.error("Error in checking designation in other tables - designation" + e); }
}
exports.getDesignationSingleRecordDetails = function (logparams, params, callback) {
  try {
    logger.info("Log in Designation List by desination Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dbcollectionname)).find({ "designationcode": parseInt(params.query.designationcode) }).toArray(function (err, result) {
      finalresult = result;
      return callback(finalresult);
    });
  }
  catch (e) { logger.error("Error in single record details - Designation" + e); }
}
exports.getDesignationSingleRecordDetails_Edit = function (logparams, params, callback) {
  try {
    logger.info("Log in Designation List by desination Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    dbo.collection(String(dbcollectionname)).aggregate([
      { $match: { "designationcode": parseInt(params.designationcode) } },
      {
        $lookup:
        {
          from: String(dbstatuscollectionname),
          localField: 'statuscode',
          foreignField: 'statuscode',
          as: 'status'
        }
      },
      { $unwind: '$status' },
      {
        $project: {
          _id: 0, designationcode: 1, designationname: 1, statuscode: 1, statusname: '$status.statusname'
        }
      }]).toArray(function (err, result) {
        finalresult = result;
        return callback(finalresult);
      });
  }
  catch (e) { logger.error("Error in single record details for edit - Designation" + e); }
}
exports.getDesignationList = function (logparams, params, callback) {
  try {
    logger.info("Log in Designation List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var finalresult;
    if (params.statuscode == 0) {
      dbo.collection(String(dbcollectionname)).aggregate([
        { $match: { statuscode: parseInt(params.statuscode), statuscode: { $ne: objConstants.deletestatus } } },
        {
          $lookup:
          {
            from: String(dbstatuscollectionname),
            localField: 'statuscode',
            foreignField: 'statuscode',
            as: 'status'
          }
        },
        { $unwind: '$status' },
        {
          $project: {
            _id: 0, designationcode: 1, designationname: 1, statuscode: 1, statusname: '$status.statusname'
          }
        }
      ]).toArray(function (err, result) {
        finalresult = result;
        return callback(finalresult);
      });
    }
    else {
      dbo.collection(String(dbcollectionname)).aggregate([
        { $match: { statuscode: parseInt(params.statuscode) } },
        {
          $lookup:
          {
            from: String(dbstatuscollectionname),
            localField: 'statuscode',
            foreignField: 'statuscode',
            as: 'status'
          }
        },
        { $unwind: '$status' },
        {
          $sort: {
            createddate: -1
          }
        },
        {
          $project: {
            _id: 0, designationcode: 1, designationname: 1, statuscode: 1, status: '$status.statusname'
          }
        }
      ]).toArray(function (err, result) {
        finalresult = result;
        return callback(finalresult);
      });
    }
  }
  catch (e) { logger.error("Error in List - Designation" + e); }
}