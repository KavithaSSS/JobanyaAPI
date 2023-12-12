'use strict';
var objRecentSearch = require('../process/employee_search_process_controller');
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
//const {objConstants.notvalidcode,objConstants.objConstants.createcode,objConstants.listcode, objConstants.existcode,objConstants.updatecode,objConstants.deletecode, objConstants.recordnotfoundcode, objConstants.successresponsecode,objConstants.usernotfoundcode } = require('../../config/constants');

const Logger = require('../services/logger_service');
const logger = new Logger('logs')

exports.getSearchBindLoad = function (req, res) {
  try {
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true || Number(req.query.employeecode) == -1) {
        var objLogdetails;

        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = objConstants.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = objConstants.employeeLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Job Search Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;

        var empparams = { "languagecode": req.query.languagecode, "employeecode": req.query.employeecode };
        objRecentSearch.getSearchBind(logparams, empparams, function (searchlist) {
          if (searchlist != null) {
            const msgparam = { "messagecode": objConstants.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
              return res.status(200).json({
                search_json_result: {
                  varstatuscode: objConstants.listcode,
                  response: objConstants.successresponsecode,
                  responsestring: msgtext[0].messagetext,
                  responsekey: msgtext[0].messagekey,
                  locationlist: searchlist.locationlist,
                  industrylist: searchlist.industrylist,
                  jobfunctionlist: searchlist.jobfunctionlist,
                  jobrolelist:searchlist.jobrolelist,
                  recentsearch: searchlist.recentsearchlist
                }

              });
            });
          }
          else {
            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
              return res.status(200).json({
                search_json_result: {
                  varstatuscode: objConstants.recordnotfoundcode,
                  response: objConstants.successresponsecode,
                  responsestring: msgtext[0].messagetext,
                  responsekey: msgtext[0].messagekey
                }

              });
            });
          }
        });

      }
      else {
        const msgparam = { "messagecode": objConstants.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
          return res.status(200).json({
            search_json_result: {
              varstatuscode: objConstants.usernotfoundcode,
              response: objConstants.successresponsecode,
              responsestring: msgtext[0].messagetext,
              responsekey: msgtext[0].messagekey
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Job Search Bind: " + e); }
}

exports.searchDelete = function (req, res) {
  try {
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var deleteflag;
        //var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.usercode != null) {
          logUserCode = req.query.usercode;
          logType = objConstants.portalLogType;
        }
        else {
          logUserCode = req.query.employeecode;
          logType = objConstants.employeeLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Search Delete', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;

        var prefparams = { "employeecode": req.query.employeecode, "type": req.query.searchtypecode, "typecode": req.query.deletecode };
        ////console.log("hi");
        ////console.log(prefparams);
        objRecentSearch.deleteSearchDetails(logparams, prefparams, function (deleteresult) {
          ////console.log(empsinglepref);

          ////console.log("initiate");
          // //console.log(empprofile[0].referenceinfo);
          if (deleteresult != null && deleteresult > 0) {
            ////console.log("Entry");
            const msgparam = { "messagecode": objConstants.deletecode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              ////console.log("Hello");  
              ////console.log(prefresult);
              ////console.log("Hi");
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: objConstants.deletecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: objConstants.successresponsecode,
                }
              });
            });
          }

          else {
            const msgparam = { "messagecode": objConstants.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: objConstants.recordnotfoundcode,
                  response: objConstants.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                }

              });
            });
          }
        });
      }
      else {
        const msgparam = { "messagecode": objConstants.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employee_json_result: {
              varstatuscode: objConstants.usernotfoundcode,
              response: objConstants.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Search Delete: " + e); }
}