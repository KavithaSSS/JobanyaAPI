'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objProfileList= require('../process/employer_profile_list_process_controller');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
exports.AppliedList = function (req, res) {
    try {
        ////console.log(req.query.employercode);
        objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
            if (validemp == true) {
                var logType = "";
                if (req.query.appcode == 1)
                    logType = objconstants.portalEmployerLogType;
                else
                    logType = objconstants.AppEmployerLogType;
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Applied List', logdate: new Date(), type: logType }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var listparams;
                var langparams ={"languagecode": req.query.languagecode, "jobcode": req.query.jobcode}; 
                if(Object.keys(req.body).length > 0)
                {
                  
                      const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                          profile_list_json_result: {
                            varstatuscode: objconstants.recordnotfoundcode,
                            response: objconstants.successresponsecode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                          }
              
                        });
                      });
                    
                }
                else
                {
                  ////console.log("hiiiiiiiii");
                  //var empparams = {"jobcode": req.query.jobcode};
                      //objRecommended.getJobProfileConditions(logparams, empparams, function(profileresult){
                    ////console.log("job", langparams);
                      //listparams = {"jobfunctioncode": profileresult[0].jobfunctioncode,"jobrolecode":profileresult[0].jobrolecode, "skillcode":[], "locationcode":profileresult[0].locationcode, "jobtypecode":[],"schoolqualcode":[], "afterschoolqualcode":[], "afterschoolspeccode":[], "experiencecode":[], "maritalcode":[], "gendercode":[], "differentlyabled": 0, "salaryfrom":0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true"};
                      listparams = {"jobfunctioncode": [],"jobrolecode":[], "skillcode":[], "locationcode":[], "jobtypecode":[],"schoolqualcode":[], "afterschoolcatecode":[],"afterschoolqualcode":[], "afterschoolspeccode":[], "experiencecode":[], "maritalcode":[], "gendercode":[], "differentlyabled": objconstants.defaultdifferentlyabled, "salaryfrom":0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true","skip":req.query.skip,"limit":req.query.limit};
                      //console.log(listparams);
                      objProfileList.getAllProfiles(logparams, langparams, listparams,3, 0, 1, function (profilelistresult) {
                          ////console.log(profilelistresult);
                            if (profilelistresult != null && profilelistresult.length > 0) {
                              //return res.status(200).json({
                              const msgparam = { "messagecode": objconstants.listcode };
                              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                ////console.log("Hello");  
                                ////console.log(prefresult);
                                ////console.log("Hi");
                                return res.status(200).json({
                                  profile_list_json_result: {
                                    varstatuscode: objconstants.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                    profile_list: profilelistresult
                
                                  }
                                });
                              });
                            }
                            else {
                              const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                  profile_list_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    response: objconstants.successresponsecode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                  }
                      
                                });
                              });
                            }
                          ////console.log(response);
                          ////console.log(response.length);
                
                
                        });
                      //});
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        Applied_list_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Applied list in employer : " + e);
    }
}