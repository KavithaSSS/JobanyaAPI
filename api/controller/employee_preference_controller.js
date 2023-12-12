'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objPreference = require('../process/employee_preference_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objGeneratePDF = require('../process/generate_employee_profile_pdf_process_controller')
const objProfileView = require('../process/employee_profile_view_process_controller')
exports.getPreferenceLoad = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
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
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Preference Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        objPreference.getPreferenceLoad(logparams, langparams, function (response) {
          ////console.log(response);
          ////console.log(response.length);
          if (response != null) {
            //return res.status(200).json({
            var prefparams = { employeecode: Number(req.query.employeecode) };
            objPreference.getEmpPreference(logparams, prefparams, Number(req.query.isleadtype),function (prefresult) {
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  preference_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                    jointype: varconstant.defjointype,
                    statelist: response.statelist,
                    districtlist: response.districtlist,
                    taluklist: response.taluklist,
                    jobfunctionlist: response.jobfunctionlist,
                    jobrolelist: response.jobrolelist,
                    locationcount: response.locationcount,
                    jobfunctioncount: response.jobfunctioncount,
                    jobrolecount: response.jobrolecount,
                    employementtypelist: response.employementtypelist,
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
exports.preferenceupdate = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        ////console.log(langparams);
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Preference Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { employeecode: Number(req.query.employeecode) };
        if (req.query.isleadtype == null) {
          req.query.isleadtype = 0
        }
        ////console.log("hi");
        ////console.log(prefparams);
        objPreference.getSingleRecord(logparams, prefparams,Number(req.query.isleadtype), function (empsinglepref) {
          // //console.log(empsinglepref);
          //const emppref = empsinglepref;
          objPreference.getSettings(logparams, function (settingres) {
            if (settingres != null && (settingres.employee_location_count == 0 ||
              req.body.location.length <= settingres.employee_location_count) &&
              (settingres.employee_jobfunction_count == 0 || req.body.jobfunction.length <= settingres.employee_jobfunction_count)) {
              var prefsaveparams = req.body;
              objUtilities.getcurrentmilliseconds(function (currenttime) {
                prefsaveparams.updateddate = currenttime;
                objPreference.preferencesave(prefsaveparams, req.query.employeecode, logparams,Number(req.query.isleadtype), function (prefresult) {
                  if (prefresult != null && prefresult > 0) {
                    if (Number(req.query.isleadtype) == 0)
                    {
                      var empparams = {"employeecode": Number(req.query.employeecode)};
                      objProfileView.getEmployeeProfileView(logparams, empparams, varconstant.defaultlanguagecode, req, function(empdetails){
                      });
                    }
                    const msgparam = { "messagecode": varconstant.savedcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      ////console.log("Hello");  
                      ////console.log(prefresult);
                      ////console.log("Hi");
                      return res.status(200).json({
                        preference_json_result: {
                          varstatuscode: varconstant.savedcode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: varconstant.successresponsecode,
                        }
                      });
                    });
                    if(Number(req.query.isleadtype)==0){
                      objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
                        ////console.log(profileurl);     
                        if (profileurl != null && profileurl != 0 && profileurl != "") {
                          logger.info("Updating generated Resume URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
                          const dbo = MongoDB.getDB();
                          dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "generatedresumeurl": profileurl } }, function (err, res) {
  
                          });
                        }
                      });
                    }
                    
                  }
                });
              });
            }
            // else if (req.body.location.length <= settingres.employee_location_count && req.body.jobfunction.length <= settingres.employee_jobfunction_count) {
            //   var prefsaveparams = req.body;
            //   objPreference.preferencesave(prefsaveparams, req.query.employeecode, logparams, function (prefresult) {
            //     if (prefresult != null && prefresult > 0) {
            //       const msgparam = { "messagecode": varconstant.savedcode };
            //       objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            //         ////console.log("Hello");  
            //         ////console.log(prefresult);
            //         ////console.log("Hi");
            //         return res.status(200).json({
            //           preference_json_result: {
            //             varstatuscode: varconstant.savedcode,
            //             responsestring: msgresult[0].messagetext,
            //             responsekey: msgresult[0].messagekey,
            //             response: varconstant.successresponsecode,
            //           }
            //         });
            //       });
            //     }
            //   });
            // }
            else if (req.body.location.length > settingres.employee_location_count) {
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
            else {
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

          /* if (emppref.length == 0)
          {
              ////console.log(req.body);
              var prefsaveparams = req.body;
              objPreference.getprefMaxcode(logparams, function(prefmaxcode){

                  prefsaveparams.statuscode = varconstant.activestatus;
                  prefsaveparams.createddate = Date.now();
                  prefsaveparams.preferencecode = prefmaxcode;
              
              });
              
          } */
          /* else
          {
            ////console.log("Body values check");
           ////console.log(req.body);
              var prefupdateparams = {"jobfunction": req.body.jobfunction, "jobrole": req.body.jobrole, "employeecode": req.body.employeecode, "location": req.body.location, "employementtypecode": req.body.employementtypecode, "statecode":req.body.statecode, "timeforjoiningcode": req.body.timeforjoiningcode, "joiningdays": req.body.joiningdays, "minsalary": req.body.minsalary, "maxsalary": req.body.maxsalary};
              //prefupdateparams.updateddate = Date.now();
              ////console.log(logparams);
              ////console.log(req.body.employeecode);
              ////console.log(prefupdateparams);
              objPreference.preferencesave(prefupdateparams, logparams, function(prefresult){
                  if (prefresult == true)
                  {
                      const msgparam = {"messagecode": varconstant.updatecode }; 
                      objUtilities.getMessageDetails(msgparam, function(msgtext){
                       ////console.log("Hello");  
                       ////console.log(prefresult);
                         ////console.log("Hi");
                           return res.status(200).json({
                               preference_json_result: {
                               varstatuscode: varconstant.updatecode,
                               responsestring: msgtext,
                               response: varconstant.successresponsecode,
                               }
                             });
                        });
                  }
                  
                    
                    
                  });
          } */
        });
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
  catch (e) { logger.error("Error in Preference Save / Update: " + e); }
} 