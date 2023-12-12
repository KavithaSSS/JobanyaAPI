'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');

// const Logger = require('../services/logger_service_portal');
// const { Console } = require('winston/lib/winston/transports');
// const logger = new Logger('logsportal')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const LoggerPortal = require('../services/logger_service_portal')
const loggerportal = new LoggerPortal('logsPortal')
const LoggerEmployee = require('../services/logger_service_employee')
const loggeremployee = new LoggerEmployee('logsEmployee')
const LoggerEmployerApp = require('../services/logger_service_employer_app')
const loggeremployerapp= new LoggerEmployerApp('logsEmployerApp')
const LoggerEmployerPortal = require('../services/logger_service_employer_portal')
const loggeremployerportal = new LoggerEmployerPortal('logsEmployerPortal')

exports.ErrorWriting = function (req, res) {
    try {
     /*  objUtilities.checkvaliduser(req.query.usercode, function (validemp) {
        if (validemp == true) {
          var objLogdetails;
          var params = { "ipaddress": req.query.deviceip, "usercode": req.query.usercode, "orginator": 'Error Writing', "type": 'Employee' };
          objUtilities.getLogDetails(params, function (logresponse) {
            objLogdetails = logresponse;
          });
          var logparams = objLogdetails;
          
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
      }); */
      if (Object.keys(req.body).length > 0) 
      {
        if (Number(req.query.typecode) == 1)//Admin Portal
      {
        loggerportal.error("Error in Admin Portal: UserId: " + req.body.usercode + ", Version: " + req.body.version + ", Classname: " + req.body.classname + ", Functionname: " + req.body.functionname + ", Lineno: " + req.body.lineno + ", Error: " + req.body.error + ", Logdate: " + Date.now());
      }
      else if (Number(req.query.typecode) == 2)//Employee
      {
        loggeremployee.error("Error in Employee App: UserId: " + req.body.usercode + ", Version: " + req.body.version + ", Classname: " + req.body.classname + ", Functionname: " + req.body.functionname + ", Lineno: " + req.body.lineno + ", Error: " + req.body.error + ", Logdate: " + Date.now());
      }
      else if (Number(req.query.typecode) == 3)// Employer App
      {
        loggeremployerapp.error("Error in Employer App: UserId: " + req.body.usercode + ", Version: " + req.body.version + ", Classname: " + req.body.classname + ", Functionname: " + req.body.functionname + ", Lineno: " + req.body.lineno + ", Error: " + req.body.error + ", Logdate: " + Date.now());
      }
      else if (Number(req.query.typecode) == 4)// Employer Portal
      {
        loggeremployerportal.error("Error in Employer Portal: UserId: " + req.body.usercode + ", Version: " + req.body.version + ", Classname: " + req.body.classname + ", Functionname: " + req.body.functionname + ", Lineno: " + req.body.lineno + ", Error: " + req.body.error + ", Logdate: " + Date.now());
      }
      else 
      {
        logger.error("Error in Error Controller without type code: UserId: " + req.body.usercode + ", Version: " + req.body.version + ", Classname: " + req.body.classname + ", Functionname: " + req.body.functionname + ", Lineno: " + req.body.lineno + ", Error: " + req.body.error + ", Logdate: " + Date.now());
      }
      const msgparam = { "messagecode": varconstant.savedcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  error_json_result: {
                    varstatuscode: varconstant.savedcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                  }

                });
              });
      }
      else
      {
        const msgparam = { "messagecode": varconstant.notvalidcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  error_json_result: {
                    varstatuscode: varconstant.notvalidcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                  }

                });
              });
      }
      
    }
    catch (e) {
      { logger.error("Error in Error Writing: " + e); }
    }
}