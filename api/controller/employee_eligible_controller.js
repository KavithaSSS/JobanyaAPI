'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objRecommendedJobList = require('../process/employee_recommended_process_controller')

const objJobList = require('../process/employee_job_list_process_controller');
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')

exports.getEligibleJobList = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Recommended Job List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var listparams;
        var sortbyparams;
        if (Number(req.query.sortbycode) == 1)
          sortbyparams = { '_id.validitydate': 1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 2)
          sortbyparams = { '_id.validitydate': -1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 3)
          sortbyparams = { "_id.noofopenings": 1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 4)
          sortbyparams = { "_id.noofopenings": -1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 5)
          sortbyparams = { '_id.salaryrange.max': 1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 6)
          sortbyparams = { '_id.salaryrange.max': -1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 29)
          sortbyparams = { '_id.matchpercentage': 1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 30)
          sortbyparams = { '_id.matchpercentage': -1, '_id.jobcode': -1 };
        else
          sortbyparams = { '_id.approveddate': -1, '_id.jobcode': -1 };
        var empparams = { "languagecode": req.query.languagecode,"type":3, "sortbyparams": sortbyparams, "employeecode": req.query.employeecode };
        if (Object.keys(req.body).length > 0) {
          objRecommendedJobList.getAllProfileConditions(logparams, empparams, function (profileresult) {
            listparams = {
              "industrycode": (req.body.industrycode.length > 0 ? req.body.industrycode : profileresult.industrycode),
              "jobfunctioncode": (req.body.jobfunctioncode.length > 0 ? req.body.jobfunctioncode : profileresult.jobfunctioncode),
              "jobrolecode": (req.body.jobrolecode.length > 0 ? req.body.jobrolecode : []),
              "skillcode": (req.body.skillcode.length > 0 ? req.body.skillcode : []),
              "locationcode": (req.body.locationcode.length > 0 ? req.body.locationcode : profileresult.locationcode),
              "jobtypecode": (req.body.jobtypecode.length > 0 ? req.body.jobtypecode : profileresult.jobtypecode),
              "schoolqualcode": (req.body.schoolqualcode.length > 0 ? req.body.schoolqualcode : profileresult.schoolqualcode),
              "afterschoolcatecode": (req.body.afterschoolcatecode.length > 0 ? req.body.afterschoolcatecode : profileresult.afterschoolcatecode),
              "afterschoolqualcode": (req.body.afterschoolqualcode.length > 0 ? req.body.afterschoolqualcode : profileresult.afterschoolqualcode),
              "afterschoolspeccode": (req.body.afterschoolspeccode.length > 0 ? req.body.afterschoolspeccode : profileresult.afterschoolspeccode),
              "experiencecode": (req.body.experiencecode.length > 0 ? req.body.experiencecode : profileresult.experiencecode),
              "employertypecode": (req.body.employertypecode.length > 0 ? req.body.employertypecode : profileresult.employertypecode),
              "companytypecode": (req.body.companytypecode.length > 0 ? req.body.companytypecode : profileresult.companytypecode),
              "maritalcode": (req.body.maritalcode.length > 0 ? req.body.maritalcode : profileresult.maritalcode),
              "gendercode": (req.body.gendercode.length > 0 ? req.body.gendercode : profileresult.gendercode),
              "differentlyabled": profileresult.differentlyabled,
              "salaryfrom": profileresult.salaryfrom,
              "salaryto": profileresult.salaryto,
              "agefrom": profileresult.agefrom,
              "ageto": profileresult.ageto,
              "anyage": "false", "anydegree": "false", "anyqualification": "false", "anyspec": "false"
            };
            objJobList.getAllJobListTotal(logparams, empparams, listparams, 7, function (jobresulttotal) {
            objJobList.getAllJobList(logparams, empparams, listparams, 7, function (jobresult) {
              if (jobresult != null && jobresult.length > 0) {
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    job_list_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      job_list: jobresult,
                      jobalertdays: jobresult.jobalertdays,
                      job_list_total: jobresulttotal
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    job_list_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                    }

                  });
                });
              }
            });
          });
          });
        }
        else {
          objRecommendedJobList.getAllProfileConditions(logparams, empparams, function (profileresult) {
            listparams = { "industrycode": profileresult.industrycode, "jobrolecode": [], "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": profileresult.locationcode, "jobtypecode": profileresult.jobtypecode, 
            "schoolqualcode": profileresult.schoolqualcode, 
            "afterschoolcatecode": profileresult.afterschoolcatecode, 
            "afterschoolqualcode": profileresult.afterschoolqualcode,
             "afterschoolspeccode": profileresult.afterschoolspeccode,
              "experiencecode": profileresult.experiencecode, "employertypecode": profileresult.employertypecode, "companytypecode": profileresult.companytypecode, "maritalcode": profileresult.maritalcode, "gendercode": profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom": profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false", 
              "anydegree":  "false", "anyqualification": "false", "anyspec": "false" };
           // console.log(listparams)
           objJobList.getAllJobListTotal(logparams, empparams, listparams, 7, function (jobresulttotal) {
            objJobList.getAllJobList(logparams, empparams, listparams, 7, function (jobresult) {
              //console.log(jobresult);
              if (jobresult != null && jobresult.length > 0) {
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    job_list_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      job_list: jobresult,
                      jobalertdays: jobresult.jobalertdays,
                      job_list_total: jobresulttotal

                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    job_list_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                    }

                  });
                });
              }
            });
          });
          });
        }
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            job_list_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              response: varconstant.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey
            }
          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Recommended Job List: " + e); }
}