'use strict';

const mongoose = require('mongoose')

const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
var dblogcollectionname = MongoDB.LogCollectionName;
//const {objConstants.gnJobsCount,objConstants.JobPackageCount,objConstants.gnOrganisationcount,objConstants.newseventscount,objConstants.splashcount,objConstants.facilitycount, objConstants.userrolecount,objConstants.activestatus,objConstants.objConstants.inactivestatus,objConstants.usercount,objConstants.objConstants.objConstants.statecount,objConstants.designationcount,objConstants.distcount,objConstants.specializationcount,objConstants.qualificationcount,objConstants.citycount,objConstants.industrycount,objConstants.jobfunctioncount,objConstants.jobrolecount,objConstants.skillscount } = require('../../config/constants');
var dbcontrolscollectionname = MongoDB.ControlsCollectionName;
const objUtilities = require('./utilities');
const crypto = require('crypto');
var algorithms = 'aes256'; // or any other algorithm supported by OpenSSL

//logger = new Logger('log')

exports.encryptpassword = function (logparams, passwordtext, callback) {
  try {
    logger.info("Log in get password encryption: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbcontrolscollectionname)).find().toArray(function (err, result) {
      if (result.length > 0) {
        var keys = result[0].passwordkey;
        var cipher = crypto.createCipher(algorithms, keys);
        var encrypted = cipher.update(String(passwordtext), 'utf8', 'hex') + cipher.final('hex');
        return callback(encrypted);
      }
      else {
        return callback(0);
      }
    });
  }
  catch (e) { logger.error("Error in password encryption: " + e); }
}
exports.decryptpassword = function (logparams, passwordtext, callback) {
  try {
    logger.info("Log in get password Decryption: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbcontrolscollectionname)).find().toArray(function (err, result) {
      if (result.length > 0) {
        var keys = result[0].passwordkey;
        var decipher = crypto.createDecipher(algorithms, keys);
        var decrypted = decipher.update(passwordtext, 'hex', 'utf8') + decipher.final('utf8');
        // //console.log(decrypted);
        return callback(decrypted);
      }
      else {
        return callback(0);
      }
    });
  }
  catch (e) { logger.error("Error in password decryption:  " + e); }
}

exports.getMessageDetails = function (params, callback) {
  try {

    const dbo = MongoDB.getDB();
    var msgresult;
    var dbcollectionname = MongoDB.MessageCollectionName;
    dbo.collection(String(dbcollectionname)).find(params, { projection: { _id: 0, messagetext: 1 } }).toArray(function (err, result) {
      msgresult = result[0].messagetext;
      return callback(msgresult);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {

  }
}
exports.getMessageDetailWithkeys = function (params, callback) {
  try {

    const dbo = MongoDB.getDB();
    var dbcollectionname = MongoDB.MessageCollectionName;
    dbo.collection(String(dbcollectionname)).find(params, { projection: { _id: 0, messagetext: 1, messagekey: 1 } }).toArray(function (err, result) {
      return callback(result);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {

  }
}

exports.checkvalidemployee = function (params, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    var dbcollectionname = MongoDB.EmployeeCollectionName;
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    var empparams = { statuscode: objConstants.activestatus, employeecode: Number(params) };
    dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, result) {
      if (result.length > 0) {
        //dbo.collection(String(dbcollectionname)).updateOne(empparams, { $set: { "lastlogindate": milliseconds } }, function (err, updateres) {
        if (err)
          res = false;
        else
          res = true;
        //res=result[0].employeecode;  
        ////console.log("employee", result);
        return callback(res);
        //});
      }
      else {
        dbo.collection(MongoDB.LeadCollectionName).find(empparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, result) {
          if (result.length > 0) {
            //dbo.collection(String(dbcollectionname)).updateOne(empparams, { $set: { "lastlogindate": milliseconds } }, function (err, updateres) {
            if (err)
              res = false;
            else
              res = true;
            //res=result[0].employeecode;  
            ////console.log("employee", result);
            return callback(res);
            //});
          }
          else {
            res = false;
            return callback(res);
          }
    
        });
      }

    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}

exports.checkemployee = function (params, isleadtype, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    var dbcollectionname = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
    // //console.log(params);
    var empparams = { employeecode: Number(params) };
    dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, result) {

      if (result.length > 0)
        res = true;
      else
        res = false;
      //res=result[0].employeecode;  
      ////console.log(res);
      return callback(res);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}


exports.validateEmployee = function (req, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    //var dbcollectionname = MongoDB.EmployeeCollectionName;
    if (req.query.isleadtype == null) {
      req.query.isleadtype = 0
    }
    var dbcollectionname = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
    var empparams = {
      $or: [{ employeecode: Number(req.query.employeecode) },
      { username: req.query.username },
      { mobileno: req.query.mobileno }]
    };
    dbo.collection(String(dbcollectionname)).aggregate([
      { $unwind: { path: '$personalinfo', preserveNullAndEmptyArrays: true } },
      { $match: empparams },
      { $project: { _id: 0, employeecode: 1, mobileno: 1, statuscode: 1, imageurl: 1, gendercode: { $ifNull: ['$personalinfo.gender', '0'] } } }
    ]).toArray(function (err, result) {
      //dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employeecode: 1, mobileno: 1, statuscode: 1 } }).toArray(function (err, result) {

      if (result.length > 0){
        res = result;
      }        
      else{
        res = 0;
      }            
        return callback(res);
      
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}


exports.validateEmployeeorLead = function (req, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    //var dbcollectionname = MongoDB.EmployeeCollectionName;
    if (req.query.isleadtype == null) {
      req.query.isleadtype = 0
    }
    var dbcollectionname = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
    var empparams = {
      $or: [{ employeecode: Number(req.query.employeecode) },
      { username: req.query.username },
      { mobileno: req.query.mobileno }]
    };
    dbo.collection(String(MongoDB.EmployeeCollectionName)).aggregate([
      { $unwind: { path: '$personalinfo', preserveNullAndEmptyArrays: true } },
      { $match: empparams },
      { $project: { _id: 0, employeecode: 1, mobileno: 1, statuscode: 1, imageurl: 1, gendercode: { $ifNull: ['$personalinfo.gender', '0'] } } }
    ]).toArray(function (err, result) {
      //dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employeecode: 1, mobileno: 1, statuscode: 1 } }).toArray(function (err, result) {

      if (result.length > 0){
        res = result;
        return callback(res);
      }        
      else{
       // res = 0;
       dbo.collection(String(MongoDB.LeadCollectionName)).aggregate([
        { $unwind: { path: '$personalinfo', preserveNullAndEmptyArrays: true } },
        { $match: empparams },
        { $project: { _id: 0, employeecode: 1, mobileno: 1, statuscode: 1, imageurl: 1, gendercode: { $ifNull: ['$personalinfo.gender', '0'] } } }
      ]).toArray(function (err, result) {
        //dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employeecode: 1, mobileno: 1, statuscode: 1 } }).toArray(function (err, result) {
        console.log(result, "kkkkkkk");
        if (result.length > 0){
          res = result;
        }        
        else{
          res = 0;
        }            
          return callback(res);
        
      });
      }            
      
      
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}


exports.validateEmployer = function (req, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    var dbcollectionname = MongoDB.EmployerCollectionName;
    var empparams = {
      $or: [{ employercode: Number(req.query.employercode) },
      { registered_email: req.query.registered_email }]
    };
    dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employercode: 1, registered_email: 1, statuscode: 1, preferences: 1 } }).toArray(function (err, result) {

      if (result.length > 0)
        res = result;
      else
        res = 0;
      //res=result[0].employeecode;  
      ////console.log(res);
      return callback(res);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}
exports.Checkvalidfilteraccessuser = function (req, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    var dbcollectionname = MongoDB.EmployerCollectionName;
    if (req.query.appcode == 1 || req.query.appcode == 2) {
      var empparams = { statuscode: objConstants.activestatus, employercode: Number(req.query.employercode) };
      dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employercode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        ////console.log(res);
        return callback(res);
      });
    }
    else if (req.query.usercode != null && req.query.usercode != 0) {
      var dbcollectionname = MongoDB.UserCollectionName;
      var userparams = { statuscode: objConstants.activestatus, usercode: Number(req.query.usercode) };
      dbo.collection(String(dbcollectionname)).find(userparams, { projection: { _id: 0, usercode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        ////console.log(res);
        return callback(res);
      });
    }
    else if (req.query.appcode == null || req.query.appcode == 0) {
      var dbcollectionname = MongoDB.EmployeeCollectionName;
      var empparams = { statuscode: objConstants.activestatus, employeecode: Number(req.query.employeecode) };
      dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employeecode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        ////console.log(res);
        return callback(res);
      });
    }
  }
  catch (ex) {
    logger.error(ex.message);
  }
}
exports.CheckValidUserOrEmployeeOrEmployer = function (req, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    var dbcollectionname = MongoDB.EmployeeCollectionName;
    if (req.query.isleadtype == null) {
      req.query.isleadtype = 0
    }
    if (req.query.usercode != null) {
      objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (validuser) {
        ////console.log(validuser);
        if (validuser == true) {
          // if (req.query.employeecode != null && req.query.employeecode != 0) {
          //   var empparams = { statuscode: objConstants.activestatus, employeecode: Number(req.query.employeecode) };
          //   dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employeecode: 1, statuscode: 1 } }).toArray(function (err, result) {
          //     if (result.length > 0)
          //       res = true;
          //     else
          //       res = false;
          //     //res=result[0].employeecode;  
          //     // //console.log(res);
          //     return callback(res);
          //   });
          // }
          // else {
          //   return callback(validuser);
          // }
          return callback(validuser);

        }
        else {
          return callback(false);
        }
      });
    }
    else if (req.query.employeecode != null && req.query.isleadtype != null && req.query.isleadtype == 1) {
      var empparams = { statuscode: objConstants.activestatus, employeecode: Number(req.query.employeecode) };
      dbo.collection(MongoDB.LeadCollectionName).find(empparams, { projection: { _id: 0, employeecode: 1, statuscode: 1 } }).toArray(function (err, leadresult) {

        if (leadresult.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        // //console.log(res);
        return callback(res);
      });
    }
    else if (req.query.employeecode != null) {
      var empparams = { statuscode: objConstants.activestatus, employeecode: Number(req.query.employeecode) };
      dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employeecode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0){
          res = true; 
        }          
        else{
          res = false;
        }         
        return callback(res);
      });       
    }
    else if (req.query.employercode != null) {
      var empparams = { statuscode: objConstants.activestatus, employercode: Number(req.query.employercode) };
      dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, employercode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        // //console.log(res);
        return callback(res);
      });
    }
  }
  catch (ex) {
    logger.error(ex.message);
  }
}
exports.checkvaliduser = function (params, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    var dbcollectionname = MongoDB.UserCollectionName;

    dbo.collection(String(dbcollectionname)).find(params, { projection: { _id: 0, usercode: 1 } }).toArray(function (err, result) {

      if (result.length > 0)
        res = true;
      else
        res = false;
      //res=result[0].employeecode;  
      // //console.log(result);
      return callback(res);
    });

  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}

exports.getLanguageDetails = function (params, callback) {
  const dbo = MongoDB.getDB();
  try {


    var finalresult;
    ////console.log(String(MongoDB.getLanguageCollectionName()));
    // var logcollectionname = dbo.collection(MongoDB.LogCollectionName);


    // logcollectionname.insertOne(params);

    var langparams = { "statuscode": objConstants.activestatus }


    dbo.collection(String(MongoDB.LanguageCollectionName)).aggregate([
      { $match: langparams },
      {
        $sort: {
          languagecode: 1
        }
      },
      {
        $project: { _id: 0, languagecode: 1, languagename: 1, shorttype: 1, language: 1 }
      }
    ]).toArray(function (err, result) {



      finalresult = result;
      //MongoDB.disconnectDB();
      return callback(finalresult);

    });

  }
  catch (ex) {
    ////console.log(ex);
    logger.error(ex.message);
  }
  finally {
    //MongoDB.disconnectDB();
  }
}

exports.getPortalLanguageDetails = function (params, callback) {
  const dbo = MongoDB.getDB();
  try {


    var finalresult;
    // ////console.log(String(MongoDB.getLanguageCollectionName()));
    // var logcollectionname = dbo.collection(MongoDB.LogCollectionName);


    // logcollectionname.insertOne(params);

    var dbcollectionname = dbo.collection(MongoDB.LanguageCollectionName);
    var langparams = { "statuscode": objConstants.activestatus, isportalsupport: 1 }

    dbcollectionname.find(langparams, { projection: { _id: 0, languagecode: 1, languagename: 1, shorttype: 1, language: 1 } }).toArray(function (err, result) {



      finalresult = result;
      //MongoDB.disconnectDB();
      return callback(finalresult);

    });

  }
  catch (ex) {
    ////console.log(ex);
    logger.error(ex.message);
  }
  finally {
    //MongoDB.disconnectDB();
  }
}



exports.getAppLanguageDetails = function (params, callback) {
  const dbo = MongoDB.getDB();
  try {


    var finalresult;
    // ////console.log(String(MongoDB.getLanguageCollectionName()));
    // var logcollectionname = dbo.collection(MongoDB.LogCollectionName);


    // logcollectionname.insertOne(params);

    var dbcollectionname = dbo.collection(MongoDB.LanguageCollectionName);
    var langparams = { "statuscode": objConstants.activestatus, isappsupport: 1 }


    dbo.collection(String(MongoDB.LanguageCollectionName)).aggregate([
      { $match: langparams },
      {
        $sort: {
          languagecode: 1
        }
      },
      {
        $project: { _id: 0, languagecode: 1, languagename: 1, shorttype: 1, language: 1 }
      }
    ]).toArray(function (err, result) {



      finalresult = result;
      //MongoDB.disconnectDB();
      return callback(finalresult);

    });

  }
  catch (ex) {
    ////console.log(ex);
    logger.error(ex.message);
  }
  finally {
    //MongoDB.disconnectDB();
  }
}

exports.getLogDetails = function (params, callback) {
  try {

    //var finalresult;
    ////console.log(String(MongoDB.getLanguageCollectionName()));

    var objLogDetails;
    objLogDetails = {
      "usercode": params.usercode,
      "ipaddress": params.ipaddress,
      "orginator": params.orginator,
      "logdate": Date.now(),
      "type": params.type
    }


    //finalresult = result;

    return callback(objLogDetails);


  }
  catch (ex) {
    logger.error(ex.message);
  }

}
exports.InsertLog = function (logparams, callback) {
  try {
    logger.info("Log in Insert log: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    var makerid;
    dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
      makerid = String(logres["ops"][0]["_id"]);
      return callback(makerid);
    });
  }
  catch (e) { logger.error("Error in insert - Log" + e); }
}



exports.findCount = function (params, callback) {
  try {
    const dbo = MongoDB.getDB();
    var activecount = 0;
    var inactivecount = 0;
    var totalcount = 0;
    //var finalresult[];
    var activeparams = { "statuscode": objConstants.activestatus }
    var inactiveparams = { "statuscode": objConstants.inactivestatus }
    var switchname = params;
    switch (switchname) {
      case objConstants.skillscount:
        var dbcollectionname = MongoDB.SkillCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, skillcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, skillcode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.gnOrganisationcount:
        var dbcollectionname = MongoDB.gnOrganisationCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, gnorganisationcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, gnorganisationcode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.SmsTemplateCount:
        var dbcollectionname = MongoDB.smstemplateCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, templatecode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, templatecode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.usercount:
        var dbcollectionname = MongoDB.UserCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, usercode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, usercode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.designationcount:
        var dbcollectionname = MongoDB.DesignationCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, designationcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, designationcode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.userrolecount:
        var dbcollectionname = MongoDB.UserRoleCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, userrolecode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, userrolecode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.statecount:
        var dbcollectionname = MongoDB.StateCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, statecode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, statecode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.notificationcount:
        var dbcollectionname = MongoDB.pushnotificationCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, notificationcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          var sentparams = { "statuscode": objConstants.sentstatus };
          dbo.collection(String(dbcollectionname)).find(sentparams, { projection: { _id: 0, notificationcode: 1 } }).toArray(function (err, resultnext) {
            var sentcount = resultnext.length;
            totalcount = activecount + sentcount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(sentcount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.Employeecount:
        var dbcollectionname = MongoDB.EmployeeCollectionName;
        var blockcount;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            var blockparams = { "statuscode": objConstants.blockstatus };
            dbo.collection(String(dbcollectionname)).find(blockparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, resultblock) {
              blockcount = resultblock.length;
              var pendingparams = { "statuscode": objConstants.pendingstatus };
              dbo.collection(String(dbcollectionname)).find(pendingparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, resultpending) {
                pendingcount = resultpending.length;
                totalcount = activecount + inactivecount + blockcount + pendingcount;
                var finalresult = [];
                finalresult.push(activecount);
                finalresult.push(inactivecount);
                finalresult.push(blockcount);
                finalresult.push(pendingcount);
                finalresult.push(totalcount);
                ////console.log(finalresult);
                return callback(finalresult);
              });
            });
          });
        });
        break;
      case objConstants.EmployerCount:
        var dbcollectionname = MongoDB.EmployerCollectionName;
        var blockcount, pendingcount, rejectedcount;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            var blockparams = { "statuscode": objConstants.blockstatus };
            dbo.collection(String(dbcollectionname)).find(blockparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultblock) {
              blockcount = resultblock.length;
              var pendingparams = { "statuscode": objConstants.pendingstatus };
              dbo.collection(String(dbcollectionname)).find(pendingparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultpending) {
                pendingcount = resultpending.length;
                var rejectedparams = { "statuscode": objConstants.rejectedstatus };
                dbo.collection(String(dbcollectionname)).find(rejectedparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultrejected) {
                  rejectedcount = resultrejected.length;
                  totalcount = activecount + inactivecount + blockcount + pendingcount + rejectedcount;
                  var finalresult = [];
                  finalresult.push(activecount);
                  finalresult.push(inactivecount);
                  finalresult.push(blockcount);
                  finalresult.push(pendingcount);
                  finalresult.push(rejectedcount);
                  finalresult.push(totalcount);
                  ////console.log(finalresult);
                  return callback(finalresult);
                });
              });
            });
          });
        });
        break;
      /* case objConstants.jobcount:
      var dbcollectionname = MongoDB.JobPostsCollectionName;
      var blockcount, pendingcount, rejectedcount;
      dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, result) {
        activecount = result.length;
        dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultnext) {
          inactivecount = resultnext.length;
          var blockparams = {"statuscode": objConstants.blockstatus};
          dbo.collection(String(dbcollectionname)).find(blockparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultblock) {
          blockcount = resultblock.length;
          var pendingparams = {"statuscode": objConstants.pendingstatus};
          dbo.collection(String(dbcollectionname)).find(pendingparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultpending) {
            pendingcount = resultpending.length;
            var rejectedparams = {"statuscode": objConstants.rejectedstatus};
          dbo.collection(String(dbcollectionname)).find(rejectedparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultrejected) {
            rejectedcount = resultrejected.length;
          totalcount = activecount + inactivecount + blockcount+ pendingcount + rejectedcount;
          var finalresult = [];
          finalresult.push(activecount);
          finalresult.push(inactivecount);
          finalresult.push(blockcount);
          finalresult.push(pendingcount);
          finalresult.push(rejectedcount);
          finalresult.push(totalcount);
          ////console.log(finalresult);
          return callback(finalresult);
          });
          });
        });
      });
    });
      break; */
      case objConstants.distcount:
        var dbcollectionname = MongoDB.DistrictCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, districtcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          ////console.log(result.length);
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, districtcode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            ////console.log(finalresult);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.citycount:
        var dbcollectionname = MongoDB.CityCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, citycode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, citycode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.talukcount:
        var dbcollectionname = MongoDB.TalukCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, talukcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, talukcode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.qualificationcount:
        var dbcollectionname = MongoDB.QualificationCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, qualificationcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, qualificationcode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.specializationcount:
        var dbcollectionname = MongoDB.SpecializationCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, specializationcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, specializationcode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.industrycount:
        var dbcollectionname = MongoDB.IndustryCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, industrycode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, industrycode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.splashcount:
        var dbcollectionname = MongoDB.SplashCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, splashcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, splashcode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.facilitycount:
        var dbcollectionname = MongoDB.FacilityCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, facilitycode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, facilitycode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.jobfunctioncount:
        var dbcollectionname = MongoDB.JobFunctionCollectionName;
        ////console.log("Count Entry IUtilities");
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, jobfunctioncode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, jobfunctioncode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            ////console.log("Count");
            ////console.log(finalresult);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.jobrolecount:
        var dbcollectionname = MongoDB.JobRoleCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, jobrolecode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, jobrolecode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.newseventscount:
        var dbcollectionname = MongoDB.newseventsCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, newscode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, newscode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.gnJobsCount:
        var dbcollectionname = MongoDB.GnJobsCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, gnjobcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
        });
        dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, gnjobcode: 1 } }).toArray(function (err, result) {
          inactivecount = result.length;
        });
        totalcount = activecount + inactivecount;
        break;
      case objConstants.JobPackageCount:
        var dbcollectionname = MongoDB.JobPackageCollectionName;
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, packagecode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, packagecode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            totalcount = activecount + inactivecount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(totalcount);
            return callback(finalresult);
          });
        });
        break;
      case objConstants.abusecount:
        var blockcount, pendingcount, unblockcount;
        var dbcollectionname = MongoDB.AbuseEmployerCollectionName;
        dbo.collection(String(dbcollectionname)).find({ "statuscode": objConstants.pendingstatus }, { projection: { _id: 0, abusecode: 1 } }).toArray(function (err, pendingresult) {
          pendingcount = pendingresult.length;
          dbo.collection(String(dbcollectionname)).find({ "statuscode": objConstants.unblockstatus }, { projection: { _id: 0, abusecode: 1 } }).toArray(function (err, unblockcountresult) {
            unblockcount = unblockcountresult.length;
            dbo.collection(String(dbcollectionname)).find({ "statuscode": objConstants.blockstatus }, { projection: { _id: 0, abusecode: 1 } }).toArray(function (err, blockcountresult) {
              blockcount = blockcountresult.length;
              totalcount = pendingcount + unblockcount + blockcount;
              var finalresult = [];
              finalresult.push(pendingcount);
              finalresult.push(unblockcount);
              finalresult.push(blockcount);
              finalresult.push(totalcount);
              return callback(finalresult);
            });

          });
        });
        break;
    }
    // return callback(activecount, inactivecount,totalcount);
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}

exports.findCountByFilter = function (params, req, callback) {
  try {
    const dbo = MongoDB.getDB();
    var activecount = 0;
    var inactivecount = 0;
    var totalcount = 0;
    //var finalresult[];
    var activeparams = { "statuscode": objConstants.activestatus }
    var inactiveparams = { "statuscode": objConstants.inactivestatus }
    var switchname = params;
    var date = new Date();
    switch (switchname) {
      case objConstants.Employeecount:
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {};

        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = {};

        if (listparams.inactivedays > 0) {
          date.setDate(date.getDate() - listparams.inactivedays);
          var milliseconds = date.getTime();
          inactivedays = { lastlogindate: { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
          date.setDate(date.getDate() - listparams.activedays);
          var milliseconds = date.getTime();
          activedays = { lastlogindate: { $gte: milliseconds } };
          ////console.log(activedays);
        }
        if (listparams.searchbymobileno != "") {
          searchbymobileno = { $or: [{ 'mobileno': listparams.searchbymobileno }, { 'contactinfo.altmobileno': listparams.searchbymobileno }] };
        }
        if (listparams.searchbyname != "") {
          //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
          //var regex = new RegExp("^" + listparams.searchbyname, "i");
          //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
          //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
          searchbyname = { 'employeename': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        // if (explist.length > 0) {
        //     for (var i = 0; i <= explist.length - 1; i++) {
        //         if (i == 0) {
        //             exp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
        //             //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
        //             // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
        //             ////console.log(exp);
        //         }
        //         else {
        //             var exp1 = [];
        //             exp1 = exp;
        //             var temp = [];
        //             temp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });

        //             exp = exp1.concat(temp);
        //             ////console.log(exp);
        //         }
        //     }
        // }
        // else {
        //     exp = [{}];
        // }

        var fresherinfo, experienceinfo;
        if (explist.length > 0) {
          if (Number(explist[0]) == 0) {
            fresherinfo = { 'fresherstatus': 1 };
            if (explist[1] && explist[2]) {
              if (Number(explist[2]) != 0) {
                experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[2]) } }, { 'totalexperience': { '$gte': Number(explist[1]) } }] };
              }
            } else {
              if (Number(explist[2]) != 0) {
                experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[2]) } }, { 'totalexperience': { '$gte': Number(explist[1]) } }] };
              }
            }
            if (experienceinfo && fresherinfo) {
              exp = { $or: [fresherinfo, experienceinfo] };
            } else if (experienceinfo) {
              exp = experienceinfo;
            } else {
              exp = fresherinfo;
            }

          } else {
            if (explist[0] && explist[1]) {
              experienceinfo = { $and: [{ 'totalexperience': { '$lte': Number(explist[1]) } }, { 'totalexperience': { '$gte': Number(explist[0]) } }] };
            }
            exp = experienceinfo;
          }
        }
        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
        if (listparams.jobfunctioncode.length > 0)// job function==
          jobfunctioncode = { $or: [{ 'skills.jobfunctioncode': { $in: listparams.jobfunctioncode } }] };
        if (listparams.jobrolecode.length > 0)// job Role==
          jobrolecode = { $or: [{ 'skills.jobrolecode': { $in: listparams.jobrolecode } }] };
        if (listparams.skillcode.length > 0)// Skill--
          skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
        if (listparams.locationcode.length > 0)// Location--
          locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0)// JobType==
          jobtypecode = { $or: [{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } }, { 'preferences.employementtype.employementtypecode': 9 }] };
        if (listparams.schoolqualcode.length > 0)// school qual code==
          schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
          afterschoolqualcode = { 'afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
          afterschoolspeccode = { 'afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
          //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
          maritalcode = { 'personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
          //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
          gendercode = { 'personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
          differentlyabledcode = { 'personalinfo.differentlyabled': listparams.differentlyabled };
        var searchvalue = {};
        if (listparams.searchvalue != null && listparams.searchvalue != "") {
          searchvalue = {
            $or: [{ registeredname: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
            { gstn: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
            { pan: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
            { aadhaarno: { $regex: '^' + listparams.searchvalue, $options: 'i' } }]
          };
        }
        var activecondition = { $and: [{ statuscode: objConstants.activestatus }, { registervia: { $ne: 1 } }] }
        // var activematchparams = {
        //     $and: [locationcode,searchvalue, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
        //         maritalcode, activecondition, searchbymobileno, searchbyname, inactivedays, activedays, { $or: exp }, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        // };
        var profilestatus = {};
        if ((listparams.profilestatus) != 0) {
          if ((listparams.profilestatus) == 2) {
            profilestatus = { $or: [{ 'profilestatus': { $exists: false } }, { 'profilestatus': parseInt(listparams.profilestatus) }] };
          } else {
            profilestatus = { 'profilestatus': parseInt(listparams.profilestatus) };
          }
        }
        var activematchparams = {
          $and: [profilestatus, locationcode, searchvalue, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
            maritalcode, activecondition, searchbymobileno, searchbyname, inactivedays, activedays, exp, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
        var inactivecondition = { statuscode: objConstants.inactivestatus }
        var inactivematchparams = {
          $and: [profilestatus, locationcode, searchvalue, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
            maritalcode, inactivecondition, searchbymobileno, searchbyname, inactivedays, activedays, exp, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };

        var blockcondition = { statuscode: objConstants.blockstatus }
        var blockmatchparams = {
          $and: [profilestatus, locationcode, searchvalue, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
            maritalcode, blockcondition, searchbymobileno, searchbyname, inactivedays, activedays, exp, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };

        var pendingcondition = { registervia: 1 }
        var pendingmatchparams = {
          $and: [profilestatus, locationcode, searchvalue, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
            maritalcode, pendingcondition, searchbymobileno, searchbyname, inactivedays, activedays, exp, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };

        var dbcollectionname = MongoDB.EmployeeCollectionName;
        var blockcount;
        dbo.collection(String(dbcollectionname)).find(activematchparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, result) {
          ////console.log(result);
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactivematchparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, resultnext) {
            ////console.log(resultnext);
            inactivecount = resultnext.length;
            dbo.collection(String(dbcollectionname)).find(blockmatchparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, resultblock) {
              blockcount = resultblock.length;
              dbo.collection(String(dbcollectionname)).find(pendingmatchparams, { projection: { _id: 0, employeecode: 1 } }).toArray(function (err, resultpending) {
                pendingcount = resultpending.length;
                totalcount = activecount + inactivecount + blockcount + pendingcount;
                var finalresult = [];
                finalresult.push(activecount);
                finalresult.push(inactivecount);
                finalresult.push(blockcount);
                finalresult.push(pendingcount);
                finalresult.push(totalcount);
                ////console.log(finalresult);
                return callback(finalresult);
              });
            });
          });
        });
        break;
      case objConstants.EmployerCount:
        var listparams = req.body;
        var subscription = {}, subcreateddate = {}, empcreateddate = {}, finalresult, companytypecode = {}, inactivedays = {}, activedays = {}, employertypecode = {}, locationcode = {}, jobfunctioncode = {}, industrycode = {}, statecode = {}, knowabouttypecode = {}, usercode = {}, packagecode = {};
        if (listparams.issubscription == 0)
          subscription = { subscriptioncount: { $gte: 0 } };
        else
          subscription = { subscriptioncount: { $gte: 1 } };
        if (listparams.reportcode == 3 && listparams.fromdate != 0 && listparams.todate != 0) {
          subcreateddate = {
            "$and": [{ "$gte": ["$$subsinfo.createddate", listparams.fromdate] },
            { "$lte": ["$$subsinfo.createddate", listparams.todate] }]

          }
          // subcreateddate = { $and: [{ "$$subsinfo.createddate": { $gte: listparams.fromdate } }, { "$$subsinfo.createddate": { $lte: listparams.todate } }] }
          // //console.log(subcreateddate)
        }
        else if (listparams.fromdate != 0 && listparams.todate != 0) {
          empcreateddate = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
          ////console.log(empcreateddate)
        }
        if (listparams.inactivedays > 0) {
          date.setDate(date.getDate() - listparams.inactivedays);
          var milliseconds = date.getTime();
          inactivedays = { lastlogindate: { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
          date.setDate(date.getDate() - listparams.activedays);
          var milliseconds = date.getTime();
          activedays = { lastlogindate: { $gte: milliseconds } };
          ////console.log(activedays);
        }
        if (listparams.employertypecode.length > 0)
          employertypecode = { 'employertypecode': { $in: listparams.employertypecode } };
        if (listparams.knowabouttypecode.length > 0)
          knowabouttypecode = { 'knowabouttypecode': { $in: listparams.knowabouttypecode } };
        if (listparams.usercode.length > 0)
          usercode = { 'usercode': { $in: listparams.usercode } };
        if (listparams.companytypecode.length > 0)
          companytypecode = { 'companytypecode': { $in: listparams.companytypecode } };
        if (listparams.industrycode.length > 0)
          industrycode = { 'industrycode': { $in: listparams.industrycode } };
        if (listparams.locationcode.length > 0)
          locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        if (listparams.jobfunctioncode.length > 0)
          jobfunctioncode = { 'preferences.jobfunction.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.statecode.length > 0)
          statecode = { 'contactinfo.statecode': { $in: listparams.statecode } };
        if (listparams.packagecode.length > 0) {
          packagecode = { 'subscriptioninfo.packagecode': { $in: listparams.packagecode } };
          // //console.log(packagecode)
        }
        var profilestatus = {};
        if ((listparams.profilestatus) != 0) {
          if ((listparams.profilestatus) == 2) {
            profilestatus = { $or: [{ 'profilestatus': { $exists: false } }, { 'profilestatus': parseInt(listparams.profilestatus) }] };
          } else {
            profilestatus = { 'profilestatus': parseInt(listparams.profilestatus) };
          }
        }
        ////console.log(matchparams)
        var activecondition = { statuscode: objConstants.activestatus }
        var activematchparams = {
          $and: [profilestatus, inactivedays, employertypecode, industrycode, companytypecode, activecondition, activedays, locationcode, jobfunctioncode, statecode, knowabouttypecode, usercode, empcreateddate]
        };

        var inactivecondition = { statuscode: objConstants.inactivestatus }
        var inactivematchparams = {
          $and: [profilestatus, inactivedays, employertypecode, industrycode, companytypecode, inactivecondition, activedays, locationcode, jobfunctioncode, statecode, knowabouttypecode, usercode, empcreateddate]
        };

        var blockcondition = { statuscode: objConstants.blockstatus }
        var blockmatchparams = {
          $and: [profilestatus, inactivedays, employertypecode, industrycode, companytypecode, blockcondition, activedays, locationcode, jobfunctioncode, statecode, knowabouttypecode, usercode, empcreateddate]
        };

        var pendingcondition = { statuscode: objConstants.pendingstatus }
        var pendingmatchparams = {
          $and: [profilestatus, inactivedays, employertypecode, industrycode, companytypecode, pendingcondition, activedays, locationcode, jobfunctioncode, statecode, knowabouttypecode, usercode, empcreateddate]
        };

        var rejectedcondition = { statuscode: objConstants.rejectedstatus }
        var rejectedmatchparams = {
          $and: [profilestatus, inactivedays, employertypecode, industrycode, companytypecode, rejectedcondition, activedays, locationcode, jobfunctioncode, statecode, knowabouttypecode, usercode, empcreateddate]
        };
        var dbcollectionname = MongoDB.EmployerCollectionName;
        var blockcount, pendingcount, rejectedcount;
        var regviaapp, regviaportal, statuscodecondition;
        if ((req.body.statuscode) == 0) { statuscodecondition = { 'statuscode': { $ne: objConstants.deletestatus } }; }
        else if ((req.body.statuscode) == -1) { statuscodecondition = { $or: [{ 'statuscode': objConstants.pendingstatus }, { 'statuscode': objConstants.rejectedstatus }] }; }
        else if ((req.body.statuscode) == -2) { statuscodecondition = { 'statuscode': { $nin: [objConstants.pendingstatus, objConstants.rejectedstatus, objConstants.deletestatus] } }; }
        else { statuscodecondition = { 'statuscode': parseInt(req.body.statuscode) }; }
        var regviaappmatchparams = {
          $and: [{ 'registervia': 1 }, statuscodecondition, profilestatus, inactivedays, employertypecode, industrycode, companytypecode, activedays, locationcode, jobfunctioncode, statecode, knowabouttypecode, usercode, empcreateddate]
        };
        var regviaportalmatchparams = {
          $and: [{ 'registervia': 2 }, statuscodecondition, profilestatus, inactivedays, employertypecode, industrycode, companytypecode, activedays, locationcode, jobfunctioncode, statecode, knowabouttypecode, usercode, empcreateddate]
        };
        dbo.collection(String(dbcollectionname)).find(activematchparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(regviaappmatchparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, result) {
            regviaapp = result.length;
            dbo.collection(String(dbcollectionname)).find(regviaportalmatchparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, result) {
              regviaportal = result.length;
              dbo.collection(String(dbcollectionname)).find(inactivematchparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultnext) {
                inactivecount = resultnext.length;
                var blockparams = { "statuscode": objConstants.blockstatus };
                dbo.collection(String(dbcollectionname)).find(blockmatchparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultblock) {
                  blockcount = resultblock.length;
                  var pendingparams = { "statuscode": objConstants.pendingstatus };
                  dbo.collection(String(dbcollectionname)).find(pendingmatchparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultpending) {
                    pendingcount = resultpending.length;
                    var rejectedparams = { "statuscode": objConstants.rejectedstatus };
                    dbo.collection(String(dbcollectionname)).find(rejectedmatchparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, resultrejected) {
                      rejectedcount = resultrejected.length;
                      totalcount = activecount + inactivecount + blockcount + pendingcount + rejectedcount;
                      var finalresult = [];
                      finalresult.push(activecount);
                      finalresult.push(inactivecount);
                      finalresult.push(blockcount);
                      finalresult.push(pendingcount);
                      finalresult.push(rejectedcount);
                      finalresult.push(totalcount);
                      finalresult.push(regviaapp);
                      finalresult.push(regviaportal);
                      ////console.log(finalresult);
                      return callback(finalresult);
                    });
                  });
                });
              });
            });
          });
        });
        break;

    }
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}
exports.checkvalidemployer = function (params, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    var dbcollectionname = MongoDB.EmployerCollectionName;
    // //console.log(params);
    var empparams = { statuscode: objConstants.activestatus, employercode: Number(params) };
    dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, result) {

      if (result.length > 0)
        res = true;
      else
        res = false;
      //res=result[0].employeecode;  
      ////console.log(result);
      return callback(res);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}

exports.checkemployer = function (params, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    var dbcollectionname = MongoDB.EmployerCollectionName;
    // //console.log(params);
    var empparams = { employercode: Number(params) };
    dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, result) {

      if (result.length > 0)
        res = true;
      else
        res = false;
      //res=result[0].employeecode;  
      ////console.log(res);
      return callback(res);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}

exports.CheckvalidEmployee_View = function (req, logtype, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    //var dbcollectionname = MongoDB.EmployerCollectionName;
    if (req.query.isleadtype == null) {
      req.query.isleadtype = 0
    }
    if (logtype == objConstants.portalLogType) {
      var empparams = { statuscode: objConstants.activestatus, usercode: Number(req.query.usercode) };
      dbo.collection(String(MongoDB.UserCollectionName)).find(empparams, { projection: { _id: 0, usercode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        ////console.log(res);
        return callback(res);
      });
    }
    else {
      //var dbcollectionname = MongoDB.EmployeeCollectionName;
      var dbCollectionName = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
      var empparams = { statuscode: objConstants.activestatus, employeecode: Number(req.query.employeecode) };
      dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, employeecode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        ////console.log(res);
        return callback(res);
      });
    }
  }
  catch (ex) {
    logger.error(ex.message);
  }
}

exports.CheckvalidEmployer_View = function (req, logtype, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    //var dbcollectionname = MongoDB.EmployerCollectionName;
    if (logtype == objConstants.portalLogType) {
      var empparams = { statuscode: objConstants.activestatus, usercode: Number(req.query.usercode) };
      dbo.collection(String(MongoDB.UserCollectionName)).find(empparams, { projection: { _id: 0, usercode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        ////console.log(res);
        return callback(res);
      });
    }
    else {
      //var dbcollectionname = MongoDB.EmployeeCollectionName;
      var empparams = { statuscode: objConstants.activestatus, employercode: Number(req.query.employercode) };
      dbo.collection(String(MongoDB.EmployerCollectionName)).find(empparams, { projection: { _id: 0, employercode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        ////console.log(res);
        return callback(res);
      });
    }
  }
  catch (ex) {
    logger.error(ex.message);
  }
}

exports.CheckvalidJob_View = function (req, logtype, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    //var dbcollectionname = MongoDB.EmployerCollectionName;
    if (logtype == objConstants.portalLogType) {
      var empparams = { statuscode: objConstants.activestatus, usercode: Number(req.query.usercode) };
      dbo.collection(String(MongoDB.UserCollectionName)).find(empparams, { projection: { _id: 0, usercode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        ////console.log(res);
        return callback(res);
      });
    }
    else if (logtype == objConstants.employeeLogType) {
      //var dbcollectionname = MongoDB.EmployeeCollectionName;
      var empparams = { statuscode: objConstants.activestatus, employeecode: Number(req.query.employeecode) };
      dbo.collection(String(MongoDB.EmployeeCollectionName)).find(empparams, { projection: { _id: 0, employeecode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        // //console.log(res);
        return callback(res);
      });
    }
    else {
      //var dbcollectionname = MongoDB.EmployeeCollectionName;
      var empparams = { statuscode: objConstants.activestatus, employercode: Number(req.query.employercode) };
      dbo.collection(String(MongoDB.EmployerCollectionName)).find(empparams, { projection: { _id: 0, employercode: 1, statuscode: 1 } }).toArray(function (err, result) {

        if (result.length > 0)
          res = true;
        else
          res = false;
        //res=result[0].employeecode;  
        ////console.log(res);
        return callback(res);
      });
    }
  }
  catch (ex) {
    logger.error(ex.message);
  }
}
exports.GenerateRandamNo = function (callback) {
  try {
    var val = Math.floor(100000 + Math.random() * 900000);
    // //console.log(val);
    return callback(val);
  }
  catch (ex) {
    logger.error(ex.message);
  }
}
exports.CheckOTPValue = function (logparams, req, typecode, callback) {
  try {
    logger.info("Log in Check Valid Otp: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(MongoDB.OTPDetailsCollectionName).find({ "otpvalue": Number(req.query.otpvalue), "typecode": Number(typecode), "emailid": req.query.registered_email }).limit(1).toArray(function (err, result) {
      if (err) throw err;
      ////console.log(result);
      return callback(result)
    });
  }
  catch (e) { logger.error("Error in Check valid Otp " + e); }
}

exports.CheckOTPValueForSMS = function (logparams, req, typecode, callback) {
  try {
    logger.info("Log in Check Valid Otp: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(MongoDB.OTPDetailsCollectionName).find({ "otpvalue": Number(req.query.otpvalue), "typecode": Number(typecode), "mobileno": req.query.mobileno }).limit(1).toArray(function (err, result) {
      if (err) throw err;
      ////console.log(result);
      return callback(result)
    });
  }
  catch (e) { logger.error("Error in Check valid Otp " + e); }
}

exports.checkEmailIdExists = function (logparams, registered_email, callback) {
  try {
    logger.info("Log in checking emailid: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(MongoDB.EmployerCollectionName).find({ "registered_email": { $regex: "^" + registered_email + "$", $options: 'i' } }, { $exists: true }).count(function (err, totalcount) //find if a value exists
    {
      ////console.log(totalcount)
      return callback(totalcount);
    });
  }
  catch (e) { logger.error("Error in checking emailid - employer" + e); }
}

exports.checkGSTINExists = function (logparams, gstin,employercode, callback) {
  try {
    logger.info("Log in checking GSTIN: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    if (gstin.trim() != '') {
      const dbo = MongoDB.getDB();
      var matchparams = {$and:[{employercode:{$ne:Number(employercode)}},{ "gstn": { $regex: "^" + gstin + "$", $options: 'i' } }]};
      //console.log(JSON.stringify(matchparams))
      dbo.collection(MongoDB.EmployerCollectionName).find(matchparams).toArray(function (err, totalcount) //find if a value exists
      {
        //console.log(totalcount)
        return callback(totalcount);
      });
    } else {
      return callback(0);
    }

  }
  catch (e) { logger.error("Error in checking gstin - employer" + e); }
}

exports.checkPANExists = function (logparams, panno,employercode, callback) {
  try {
    logger.info("Log in checking PAN: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    if (panno.trim() != '') {
      const dbo = MongoDB.getDB();
      var matchparams = {$and:[{employercode:{$ne:Number(employercode)}},{ "pan": { $regex: "^" + panno + "$", $options: 'i' } }]};
      //console.log(JSON.stringify(matchparams))
      dbo.collection(MongoDB.EmployerCollectionName).find(matchparams).toArray(function (err, totalcount) //find if a value exists
      {
        //console.log(totalcount)
        return callback(totalcount);
      });
    } else {
      return callback(0);
    }

  }
  catch (e) { logger.error("Error in checking PAN - employer" + e); }
}

exports.checkAadharExists = function (logparams, aadhaarno,employercode, callback) {
  try {
    logger.info("Log in checking Aadhar: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    if (aadhaarno.trim() != '') {
      const dbo = MongoDB.getDB();
      var matchparams = {$and:[{employercode:{$ne:Number(employercode)}},{ "aadhaarno": { $regex: "^" + aadhaarno + "$", $options: 'i' } }]};
      //console.log(JSON.stringify(matchparams))
      dbo.collection(MongoDB.EmployerCollectionName).find(matchparams).toArray(function (err, totalcount) //find if a value exists
      {
        //console.log(totalcount)
        return callback(totalcount);
      });
    } else {
      return callback(0);
    }

  }
  catch (e) { logger.error("Error in checking Aadhar - employer" + e); }
}

exports.checkVerifyEmailIdExists = function (logparams, registered_email, callback) {
  try {
    logger.info("Log in checking emailid: UserId: " + logparams.usercode + ",Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(MongoDB.EmployerCollectionName).find(
      {
        $and: [{
          $or: [{
            "registered_email":
              { $regex: "^" + registered_email + "$", $options: 'i' }
          },
          { "changed_email": { $regex: "^" + registered_email + "$", $options: 'i' } }]
        },
        { "verificationstatus": objConstants.verificationstatus }]
      }).count(function (err, totalcount) //find if a value exists
      {
        ////console.log(totalcount);
        return callback(totalcount);
      });
  }
  catch (e) { logger.error("Error in checking emailid - employer" + e); }
}

exports.encryptemployerdetails = function (logparams, employerdetails, callback) {
  try {
    logger.info("Log in get employer code encryption: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbcontrolscollectionname)).find().toArray(function (err, result) {
      if (result.length > 0) {
        var keys = result[0].passwordkey;
        var cipher = crypto.createCipher(algorithms, keys);
        var encrypted = cipher.update(String(employerdetails), 'utf8', 'hex') + cipher.final('hex');
        return callback(encrypted);
      }
      else {
        return callback(0);
      }
    });
  }
  catch (e) { logger.error("Error in password encryption: " + e); }
}
exports.decryptemployerdetails = function (logparams, employerdetails, callback) {
  try {
    logger.info("Log in get employer code Decryption: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
    const dbo = MongoDB.getDB();
    dbo.collection(String(dbcontrolscollectionname)).find().toArray(function (err, result) {
      if (result.length > 0) {
        var keys = result[0].passwordkey;
        var decipher = crypto.createDecipher(algorithms, keys);
        var decrypted = decipher.update(employerdetails, 'hex', 'utf8') + decipher.final('utf8');
        // //console.log(decrypted);
        return callback(decrypted);
      }
      else {
        return callback(0);
      }
    });
  }
  catch (e) { logger.error("Error in password decryption:  " + e); }
}

exports.GetAdminMailId = function (varcode, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res = '';
    var dbcollectionname = MongoDB.MailIdCollectionName;
    // //console.log(params);
    var empparams = { code: varcode };
    dbo.collection(String(dbcollectionname)).find(empparams, { projection: { _id: 0, mailid: 1 } }).toArray(function (err, result) {

      if (result.length > 0)
        res = result[0].mailid;

      //res=result[0].employeecode;  
      ////console.log(res);
      return callback(res);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}

exports.FindEmployerMailID = function (employercode, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res;
    var empparams = { employercode: Number(employercode) };
    dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, registered_email: 1 } }).toArray(function (err, result) {
      if (err) throw err;
      // //console.log(result);
      return callback(result);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
}

exports.FindEmployeeMailID = function (employeecode, callback) {
  try {
    const dbo = MongoDB.getDB();
    var res = '';
    var empparams = { employeecode: Number(employeecode) };
    dbo.collection(MongoDB.EmployeeCollectionName).find(empparams, { projection: { _id: 0, contactinfo: 1 } }).toArray(function (err, result) {
      if (err) throw err;
      // //console.log(result);
      if (result[0].contactinfo.emailid != null)
        res = result[0].contactinfo.emailid

      return callback(res);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
}

exports.getcurrentmilliseconds = function (callback) {
  try {
    var currentdate = new Date(); // some mock date
    var currentmilliseconds = currentdate.getTime();
    return callback(currentmilliseconds);
  }
  catch (ex) {
    logger.error(ex.message);
  }
}

exports.getEmployerName = function (employercode, callback) {
  try {
    const dbo = MongoDB.getDB();
    //var dbcollectionname = MongoDB.EmployerCollectionName;
    var empparams = { employercode: Number(employercode) };
    dbo.collection(String(MongoDB.EmployerCollectionName)).find(empparams, { projection: { _id: 0, registeredname: 1, registered_email: 1, statuscode: 1, 'contactinfo.mobileno': 1 } }).toArray(function (err, result) {
      ////console.log(res);
      return callback(result);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
}

exports.FindAllActiveEmployee = function (languagecode, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var params = { "statuscode": Number(objConstants.activestatus) };
    ////console.log(params)
    dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
      { $match: params },
      {
        $project: {
          _id: 0, employeecode: 1, preferredlanguagecode: { $ifNull: ['$preferredlanguagecode', objConstants.defaultlanguagecode] }
        }
      },
      { $match: { preferredlanguagecode: languagecode } }
    ]).toArray(function (err, result) {
      finalresult = result;
      ////console.log(finalresult);
      return callback(finalresult);
    });
  }
  catch (e) {
    logger.error("Error in Find all employee- sendsms " + e);
  }
}

exports.FindAllActiveEmployer = function (languagecode, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var params = { "statuscode": Number(objConstants.activestatus) };
    ////console.log(params)
    dbo.collection(MongoDB.EmployerCollectionName).aggregate([
      { $match: params },
      {
        $project: {
          _id: 0, employercode: 1, preferredlanguagecode: { $ifNull: ['$preferredlanguagecode', objConstants.defaultlanguagecode] }
        }
      },
      { $match: { preferredlanguagecode: languagecode } }
    ]).toArray(function (err, result) {
      finalresult = result;
      ////console.log(finalresult);
      return callback(finalresult);
    });
  }
  catch (e) {
    logger.error("Error in Find all employee- sendsms " + e);
  }
}

exports.FindAllDeletedEmployer = function (callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var params = { "statuscode": { $in: [Number(objConstants.deletestatus), Number(objConstants.inactivestatus), Number(objConstants.abusedstatus), Number(objConstants.rejectedstatus)] } };
    ////console.log(params)
    dbo.collection(MongoDB.EmployerCollectionName).aggregate([
      { $match: params },
      {
        $project: {
          _id: 0, employercode: 1, preferredlanguagecode: { $ifNull: ['$preferredlanguagecode', objConstants.defaultlanguagecode] }
        }
      }
    ]).toArray(function (err, result) {
      finalresult = result;
      ////console.log(finalresult);
      return callback(finalresult);
    });
  }
  catch (e) {
    logger.error("Error in FindAllDeletedEmployer " + e);
  }
}

exports.FindEmployeePreferredlanguagecode = function (employeecode, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var params = { "employeecode": Number(employeecode) };
    ////console.log(params)
    dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
      { $match: params },
      {
        $project: {
          _id: 0, employeecode: 1, preferredlanguagecode: { $ifNull: ['$preferredlanguagecode', objConstants.defaultlanguagecode] }
        }
      }
    ]).toArray(function (err, result) {
      finalresult = result;
      ////console.log("result",result);
      return callback(finalresult);
    });
  }
  catch (e) {
    logger.error("Error in Find all employee- sendsms " + e);
  }
}

exports.FindEmployerPreferredlanguagecode = function (employercode, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var params = { "employercode": Number(employercode) };
    ////console.log(params)
    dbo.collection(MongoDB.EmployerCollectionName).aggregate([
      { $match: params },
      {
        $project: {
          _id: 0, employercode: 1, preferredlanguagecode: { $ifNull: ['$preferredlanguagecode', objConstants.defaultlanguagecode] }
        }
      }
    ]).toArray(function (err, result) {
      finalresult = result;
      ////console.log(finalresult);
      return callback(finalresult);
    });
  }
  catch (e) {
    logger.error("Error in Find all employee- sendsms " + e);
  }
}

//Insert view , matching profile and wishlist count
exports.InsertJobCounts1 = function (jobcode, typevalue, statuscode, callback) {
  try {
    const dbo = MongoDB.getDB();
    //Update viewed count in job posts
    dbo.collection(MongoDB.JobPostsCollectionName).find({ "jobcode": parseInt(jobcode) }).
      forEach(function (vals) {
        // console.log(vals)
        var viewedcountval = 0;
        var matchingprofilecountval = 0;
        var wishlistcountval = 0;
        var updateparams = {};
        if (vals) {
          if (typevalue == objConstants.viewed) {
            if (vals.viewedcount) {

              if (typevalue == objConstants.viewed) {
                viewedcountval = vals.viewedcount + 1;
              } else {
                viewedcountval = vals.viewedcount;
              }
            } else {
              viewedcountval = 1;
            }
            updateparams = { viewedcount: viewedcountval };
          }
          if (typevalue == objConstants.matchingprofile) {
            if (vals.matchingprofilecount) {
              if (typevalue == objConstants.matchingprofile) {
                matchingprofilecountval = statuscode;
              } else {
                matchingprofilecountval = vals.matchingprofilecount;
              }
            } else {
              matchingprofilecountval = statuscode;
            }
            updateparams = { matchingprofilecount: matchingprofilecountval };
          }
          if (typevalue == objConstants.wishlists) {
            if (vals.wishlistcount) {
              if (statuscode == objConstants.wishlistedstatus) {
                wishlistcountval = vals.wishlistcount + 1;
              } else {
                wishlistcountval = vals.wishlistcount - 1;
              }

            } else {
              wishlistcountval = 1;
            }
            updateparams = { wishlistcount: wishlistcountval };
          }
        }
        dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode": parseInt(jobcode) },
          { $set: updateparams }, function (err, logres) {
            if (err)
              throw err;
            return callback(logres);
          });

      });
  }
  catch (e) {
    console.log(e, 'vals.columnvalue')
    logger.error("Error in Find all employee- sendsms " + e);
  }
}

exports.InsertJobCounts = function (jobcode, typevalue, profilecount, callback) {
  try {
    const dbo = MongoDB.getDB();
    var viewedcountval = 0;
    var matchingprofilecountval = 0;
    var wishlistcountval = 0;
    //Update viewed count in job posts
    dbo.collection(MongoDB.EmployerWishListCollectionName).find({ $and: [{ "jobcode": parseInt(jobcode) }, { "statuscode": objConstants.wishlistedstatus }] }).count(function (err, wishcount) //find if a value exists
    {

      wishlistcountval = wishcount;
      dbo.collection(MongoDB.JobPostViewedHistory).find({ "jobcode": parseInt(jobcode) }).count(function (err, viewcount) //find if a value exists
      {
        ////console.log(totalcount)
        viewedcountval = viewcount;
        dbo.collection(MongoDB.JobPostsCollectionName).find({ "jobcode": parseInt(jobcode) }).
          forEach(function (vals) {


            var updateparams = {};

            if (vals) {
              if (vals.matchingprofilecount) {
                if (typevalue == objConstants.matchingprofile) {
                  matchingprofilecountval = profilecount;
                } else {
                  matchingprofilecountval = vals.matchingprofilecount;
                }
              } else {
                matchingprofilecountval = profilecount;
              }
              updateparams = { viewedcount: viewedcountval, matchingprofilecount: matchingprofilecountval, wishlistcount: wishlistcountval };
              //console.log(updateparams)
              dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode": parseInt(jobcode) },
                { $set: updateparams }, function (err, logres) {
                  if (err)
                    throw err;
                  return callback(logres);
                });
            }
          });
      });
    });

  }
  catch (e) {
    console.log(e, 'vals.columnvalue')
    logger.error("Error in Find all employee- sendsms " + e);
  }
}
exports.InsertFlashJobViewCounts = function (jobcode, typevalue, profilecount, callback) {
  try {
    const dbo = MongoDB.getDB();
    var viewedcountval = 0;
    //Update viewed count in job posts
    dbo.collection(MongoDB.FlashJobViewCount).find({ $and: [{ "jobcode": parseInt(jobcode) }, { "typecode": 1 }] }).count(function (err, viewcount) //find if a value exists
    {
      viewedcountval = viewcount;
      dbo.collection(MongoDB.PrivateJobPostsCollectionName).find({ "jobcode": parseInt(jobcode) }).
        forEach(function (vals) {
          var updateparams = {};
          if (vals) {
            updateparams = { viewedcount: viewedcountval };
            dbo.collection(MongoDB.PrivateJobPostsCollectionName).updateOne({ "jobcode": parseInt(jobcode) },
              { $set: updateparams }, function (err, logres) {
                if (err)
                  throw err;
                return callback(logres);
              });
          }
        });
    });
  }
  catch (e) {
    console.log(e, 'vals.columnvalue')
    logger.error("Error in Find all employee- sendsms " + e);
  }
}
exports.InsertFlashJobDialCounts = function (jobcode, typevalue, profilecount, callback) {
  try {
    const dbo = MongoDB.getDB();
    var viewedcountval = 0;
    //Update viewed count in job posts
    dbo.collection(MongoDB.FlashJobViewCount).find({ $and: [{ "jobcode": parseInt(jobcode) }, { "typecode": 2 }] }).count(function (err, viewcount) //find if a value exists
    {
      viewedcountval = viewcount;
      dbo.collection(MongoDB.PrivateJobPostsCollectionName).find({ "jobcode": parseInt(jobcode) }).
        forEach(function (vals) {
          var updateparams = {};
          if (vals) {
            updateparams = { dialedcount: viewedcountval };
            dbo.collection(MongoDB.PrivateJobPostsCollectionName).updateOne({ "jobcode": parseInt(jobcode) },
              { $set: updateparams }, function (err, logres) {
                if (err)
                  throw err;
                return callback(logres);
              });
          }
        });
    });
  }
  catch (e) {
    console.log(e, 'vals.columnvalue')
    logger.error("Error in Find all employee- sendsms " + e);
  }
}
exports.InsertFlashJobPushNotificationCounts = function (jobcode, pushedcount, callback) {
  try {
    const dbo = MongoDB.getDB();
    // dbo.collection(MongoDB.FlashJobViewCount).find({$and:[{ "jobcode": parseInt(jobcode) }, { "typecode": 2 }]}).count(function (err, viewcount) //find if a value exists
    // {
    dbo.collection(MongoDB.PrivateJobPostsCollectionName).find({ "jobcode": parseInt(jobcode) }).
      forEach(function (vals) {
        var updateparams = {};
        if (vals) {
          updateparams = { pushedcount: pushedcount };
          dbo.collection(MongoDB.PrivateJobPostsCollectionName).updateOne({ "jobcode": parseInt(jobcode) },
            { $set: updateparams }, function (err, logres) {
              if (err)
                throw err;
              return callback(logres);
            });
        }
      });
    // });
  }
  catch (e) {
    console.log(e, 'vals.columnvalue')
    logger.error("Error in Find all employee- sendsms " + e);
  }
}


exports.GetProfilePercentage = function (callback) {
  try {
    const dbo = MongoDB.getDB();
    dbo.collection(MongoDB.ProfilePercentageCollectionName).aggregate([
      {
        $sort: {
          profilecode: 1
        }
      },
      {
        $project: { _id: 0, profilecode: 1, profilename: 1, profilepercentage: 1 }
      }
    ]).toArray(function (err, profilepercentage) {
      return callback(profilepercentage);
    });
  }
  catch (e) {
    logger.error("Error in GetProfilePercentage " + e);
  }
}

exports.getemployeedetails = function (employeecode, callback) {
  try {
    const dbo = MongoDB.getDB(); 
    var empparams = { employeecode: Number(employeecode) };
    dbo.collection(MongoDB.EmployeeCollectionName).find(empparams).toArray(function (err, result) {
      return callback(result);
    });
  }
  catch (ex) {
    logger.error(ex.message);
  }
  finally {
    //dbo.disconnect();
  }
}

exports.GetAllActiveJobs = function (req, callback) {
  try {
      const dbo = MongoDB.getDB();
      var finalresult;
      var date = new Date(); // some mock date
      var milliseconds = date.getTime();
      dbo.collection(String(MongoDB.JobPostsCollectionName)).aggregate([
          { $match: { "$and": [{ "statuscode": objConstants.approvedstatus }, { "validitydate": { $gte: milliseconds } }] } },
          {$project:{_id: 0,jobcode:1}},
          { $sort: { "jobcode": 1 } },
          { $skip: Number(req.query.skipvalue) },
          { $limit: Number(req.query.limitvalue) }
      ]).toArray(function (err, activejobsresult) { 
          return callback(activejobsresult);
      });
  }
  catch (e) { logger.error("Error in Getting All Employees: " + e); }
}

exports.FindAllActiveEmployeeWithLimit = function (req, languagecode, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var params = { "statuscode": Number(objConstants.activestatus) };
    ////console.log(params)
    dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
      { $match: params },
      {
        $project: {
          _id: 0, employeecode: 1, preferredlanguagecode: { $ifNull: ['$preferredlanguagecode', objConstants.defaultlanguagecode] }
        }
      },
      { $match: { preferredlanguagecode: languagecode } },
      { $skip: Number(req.query.empskipvalue) },
      { $limit: Number(req.query.emplimitvalue) }
    ]).toArray(function (err, result) {
      finalresult = result;
      ////console.log(finalresult);
      return callback(finalresult);
    });
  }
  catch (e) {
    logger.error("Error in Find all employee- sendsms " + e);
  }
}


exports.FindAllCurrentActiveEmployeeWithLimit = function (req, languagecode, callback) {
  try {
    const dbo = MongoDB.getDB();
    var finalresult;
    var date = new Date();
    date.setDate(date.getDate() - objConstants.defaultinactivedays);
    var milliseconds = date.getTime();
    //inactivedays = { lastlogindate: { $lte: milliseconds } };
    //var params = { "statuscode": Number(objConstants.activestatus) };
    var params =  { "$and": [{ "statuscode": Number(objConstants.activestatus) }, { lastlogindate: { $gte: milliseconds } }] }
    ////console.log(params)
    dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
      { $match: params },
      {
        $project: {
          _id: 0, employeecode: 1, preferredlanguagecode: { $ifNull: ['$preferredlanguagecode', objConstants.defaultlanguagecode] }
        }
      },
      { $match: { preferredlanguagecode: languagecode } },
      { $skip: Number(req.query.empskipvalue) },
      { $limit: Number(req.query.emplimitvalue) }
    ]).toArray(function (err, result) {
      finalresult = result;
      ////console.log(finalresult);
      return callback(finalresult);
    });
  }
  catch (e) {
    logger.error("Error in Find all Current active employee- sendsms " + e);
  }
}

exports.GetJobPercentage = function (callback) {
  try {
    const dbo = MongoDB.getDB();
    dbo.collection(MongoDB.JobPercentageCollectionName).aggregate([
      {
        $sort: {
          code: 1
        }
      },
      {
        $project: { _id: 0, code: 1, name: 1, percentage: 1 }
      }
    ]).toArray(function (err, jobpercentage) {
      return callback(jobpercentage);
    });
  }
  catch (e) {
    logger.error("Error in GetJobPercentage " + e);
  }
}