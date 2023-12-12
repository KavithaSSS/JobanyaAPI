'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objPreference = require('../process/employer_preference_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
exports.PreferenceLoad = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var logType = "";
        if (req.query.appcode == 1)
          logType = varconstant.portalEmployerLogType;
        else
          logType = varconstant.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Preference Load', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        // //console.log(logparams);
        if (req.query.appcode == 1 || req.query.appcode == 2) {
          var langparams = Number(req.query.languagecode);
          objPreference.GetPreferenceLoad(logparams, langparams, function (response) {
            if (response != null) {
              var prefparams = { employercode: Number(req.query.employercode) };
              objPreference.GetSinglePreferenceDetails(logparams, prefparams, function (prefresult) { 
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) { 
                  return res.status(200).json({
                    preference_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      jointype: varconstant.defjointype,
                      statelist: response.statelist,
                      districtlist: response.districtlist,
                      taluklist:response.taluklist,
                      jobfunctionlist: response.jobfunctionlist,
                      jobrolelist: response.jobrolelist,
                      employementtypelist: response.employementtypelist,
                      locationcount: response.locationcount,
                      jobfunctioncount: response.jobfunctioncount,
                      jobrolecount: response.jobrolecount,
                      preferences: prefresult
                    }
                  });
                });


              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  preference_json_result: {
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

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            preference_json_result: {
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
  catch (e) { logger.error("Error in Preference Load: " + e); }
}
exports.PreferenceSave = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var logType = "";
        if (req.query.appcode == 1)
          logType = varconstant.portalEmployerLogType;
        else
          logType = varconstant.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Preference Insert', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        // //console.log(logparams);
        if (req.body.jobfunction != null) {
          if (req.query.appcode == 1 || req.query.appcode == 2) {
            var prefparams = { employercode: Number(req.query.employercode) };
            objPreference.GetSinglePreferenceDetails(logparams, prefparams, function (prefresult) {
              objPreference.getSettings(logparams, function(settingres){
                if (settingres!= null && (settingres.employer_jobfunction_count == 0 || req.body.jobfunction.length <= settingres.employer_jobfunction_count)
                 && (settingres.employer_location_count == 0 || req.body.location.length <= settingres.employer_location_count))
                {
                  var params = req.body;
                  objPreference.preferenceinsert(logparams, params, req, function (response) {
                  if (response != null && response > 0) {
                  const msgparam = { "messagecode": varconstant.savedcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      preference_json_result: {
                        varstatuscode: varconstant.savedcode,
                        response: varconstant.successresponsecode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey
                      }
                    });
                  });
                }
              });
                }
              else if (req.body.location.length <= settingres.employer_location_count && req.body.jobfunction.length <= settingres.employer_jobfunction_count)
                {
                  var params = req.body;
              objPreference.preferenceinsert(logparams, params, req, function (response) {
                if (response != null && response > 0) {
                  const msgparam = { "messagecode": varconstant.savedcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      preference_json_result: {
                        varstatuscode: varconstant.savedcode,
                        response: varconstant.successresponsecode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey
                      }
                    });
                  });
                }
              });
                }
                else if (req.body.location.length > settingres.employer_location_count)
              {
              const msgparam = { "messagecode": varconstant.locationcountexceeds };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    ////console.log("Hello");  
                    ////console.log(prefresult);
                    ////console.log("Hi");
                    return res.status(200).json({
                      preference_json_result: {
                        varstatuscode: varconstant.locationcountexceeds,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                      }
                    });
                  });
            }
            else 
            {
            const msgparam = { "messagecode": varconstant.jobfunctioncountexceeds };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    preference_json_result: {
                      varstatuscode: varconstant.jobfunctioncountexceeds,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                    }
                  });
                });
          }
              });
              
            });
          }
        }
        else {
          const msgparam = { "messagecode": varconstant.notvalidcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              preference_json_result: {
                varstatuscode: varconstant.notvalidcode,
                response: varconstant.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }

            });
          });
        }

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            preference_json_result: {
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
  catch (e) { logger.error("Error in Preference Insert: " + e); }
}