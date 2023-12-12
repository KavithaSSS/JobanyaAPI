'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/employer_profile_view_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')

exports.EmployerProfileView = function (req, res) {
  try {
    var objLogdetails;
    var langparams = req.query.languagecode;
    var logUserCode = "";
    var logType = "";
    if (req.query.usercode != null) {
      logUserCode = req.query.usercode;
      logType = varconstant.portalLogType;
    }
    else if (req.query.appcode == 1) {
      logUserCode = req.query.employercode;
      logType = varconstant.portalEmployerLogType;
    }
    else {
      logUserCode = req.query.employercode;
      logType = varconstant.AppEmployerLogType;
    }
    ////console.log(langparams);
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Contact Info Bind', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    objUtilities.CheckvalidEmployer_View(req, logType, function (validemp) {
      if (validemp == true) {

        var empparams = { "employercode": req.query.employercode };
        ////console.log(empparams);
        objProfile.getProfileView(logparams, empparams, Number(req.query.languagecode), function (empviewres) {
          const msgparam = { "messagecode": varconstant.listcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            ////console.log("Hello");  
            ////console.log(prefresult);
            ////console.log("Hi");
            return res.status(200).json({
              employer_json_result: {
                varstatuscode: varconstant.listcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                "profileinfo": empviewres.profileinfo,
                "contactinfo": empviewres.contactinfo,
                "companyinfo": empviewres.companyinfo,
                "preferences": empviewres.preferences,
                "govtidentification": empviewres.govtidentification,
                "branchlist": empviewres.branchlist
              }
            });
          });


        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employer_json_result: {
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
  catch (e) { logger.error("Error in Profile View: " + e); }
}

exports.getEmployerProfileImage = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else {
          logUserCode = req.query.employercode;
          logType = varconstant.employeeLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Preference Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getEmployerProfileImage(logparams, req, function (response) {
          ////console.log(response);
          ////console.log(response.length);
          if (response != null && response.length>0) {
            const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  employer_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                    imageurl: response[0].profileurl
                  }
                });
              });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employer_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey
                }

              });
            });
          }
        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employer_json_result: {
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
  catch (e) { logger.error("Error in getEmployeeProfileImage: " + e); }
}