'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/govtjobs_list_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')


exports.GovtJobsList = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true || Number(req.query.employeecode) == -1) {
        var objLogdetails;
        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employeecode, "orginator": 'Government Jobs List', "type": 'Employee' };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var params = { "languagecode": Number(req.query.languagecode), "gnorganisationcode": Number(req.query.gnorganisationcode) };
        objProfile.GovtJobsList(logparams, params, function (validbind) {
          if (validbind != null && validbind.length > 0) {
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetails(msgparam, function (msgtext) {
              return res.status(200).json({
                gnOrganisation_list_json_result: {
                  varstatuscode: varconstant.listcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgtext,
                  govtjobs: validbind
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetails(msgparam, function (msgtext) {
              return res.status(200).json({
                gnOrganisation_list_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgtext
                }
              });
            });
          }
        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetails(msgparam, function (msgtext) {
          return res.status(200).json({
            gnOrganisation_list_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              response: varconstant.successresponsecode,
              responsestring: msgtext,
            }
          });
        });
      }
    });

  }
  catch (e) {
    { logger.error("Error in Goverment jobs list: " + e); }
  }
}

exports.GovtJobsListbyCount = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employeecode, "orginator": 'Government Jobs Count', "type": 'Employee' };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var langparams = req.query.languagecode;
        objProfile.GovtJobsListbyCount(logparams, langparams, function (govtjobsresult) {
          ////console.log(govtjobsresult);
          if (govtjobsresult != null && govtjobsresult.length > 0) {
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetails(msgparam, function (msgtext) {
              return res.status(200).json({
                gnOrganisation_list_json_result: {
                  varstatuscode: varconstant.listcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgtext,
                  govtjobs: govtjobsresult
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                gnOrganisation_list_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                }

              });
            });
          }
        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetails(msgparam, function (msgtext) {
          return res.status(200).json({
            employee_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              response: varconstant.successresponsecode,
              responsestring: msgtext,
            }
          });
        });
      }
    });

  }
  catch (e) {
    { logger.error("Error in Goverment jobs list by Count: " + e); }
  }
}

exports.GovtJobsDetails = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
  
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true || Number(req.query.employeecode) == -1) {
        var objLogdetails;
        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employeecode, "orginator": 'Government Jobs List', "type": 'Employee' };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var params = { "languagecode": Number(req.query.languagecode), "gnorganisationcode": Number(req.query.gnorganisationcode), "gnjobcode": Number(req.query.gnjobcode) };
        objProfile.GovtJobsDetails(logparams, params, function (validbind) {
          if (validbind != null && validbind.length > 0) {
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetails(msgparam, function (msgtext) {
              return res.status(200).json({
                gnOrganisation_list_json_result: {
                  varstatuscode: varconstant.listcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgtext,
                  govtjobs: validbind
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetails(msgparam, function (msgtext) {
              return res.status(200).json({
                gnOrganisation_list_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgtext
                }
              });
            });
          }
        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetails(msgparam, function (msgtext) {
          return res.status(200).json({
            gnOrganisation_list_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              response: varconstant.successresponsecode,
              responsestring: msgtext,
            }
          });
        });
      }
    });

  }
  catch (e) {
    { logger.error("Error in Goverment jobs Details: " + e); }
  }
}