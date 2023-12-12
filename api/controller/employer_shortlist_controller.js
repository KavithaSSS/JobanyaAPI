'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objProfileList= require('../process/employer_profile_list_process_controller');
const objRecommended = require('../process/employer_recommended_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
var date = new Date(); // some mock date
var milliseconds = date.getTime();

exports.getShortlistedProfileList = async function (req, res) {
    try {
      const decoded = await objUtilities.validateToken(req);
      if (!decoded) {
        return res.status(200).json({
          status: 401,
          message: "Unauthorized",
        });
      }
      objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
        if (validemp == true) {
          var objLogdetails;
          
          ////console.log(langparams);
          var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1)
          logType = objconstants.portalEmployerLogType;
        else
          logType = objconstants.AppEmployerLogType;
        
          var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employercode, "orginator": 'Shortlist Profile List', "type": logType };
          objUtilities.getLogDetails(params, function (logresponse) {
            objLogdetails = logresponse;
          });
          var logparams = objLogdetails;
          var listparams;
          //var sortbyparams;
          
            var langparams ={"languagecode": req.query.languagecode, "jobcode": req.query.jobcode}; 
          ////console.log(req.body);
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
              
              ////console.log("hi");
            //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
            //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
            /* var date = new Date(); // some mock date
            var milliseconds = date.getTime();
             const dbo = MongoDB.getDB();
             var typecode;
             
             //var recentparams = {"employercode": Number(req.query.employercode), "type": Number(req.query.searchtypecode), "typecode": typecode, "searchdate": milliseconds};
             //objSearchUpdate.EmployerRecentSearchUpdate(logparams, recentparams, function(recentresult){
                var empparams = {"jobcode": req.query.jobcode};
                objRecommended.getJobProfileConditions(logparams, empparams, function(profileresult){
                //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
              
                  listparams = {"jobfunctioncode": profileresult[0].jobfunctioncode,"jobrolecode":profileresult[0].jobrolecode, "skillcode":[], "locationcode":profileresult[0].locationcode, "jobtypecode":[],"schoolqualcode":[], "afterschoolqualcode":[], "afterschoolspeccode":[], "experiencecode":[], "maritalcode":[], "gendercode":[], "differentlyabled": 0, "salaryfrom":0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true"};
                  objProfileList.getAllProfiles(logparams, langparams, listparams, 2, req.query.sortbycode, function (profilelistresult) {
                    ////console.log(jobfunctionresult);
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
              }); */
             //});
             ////console.log(recentparams);
            //listparams = {"jobfunctioncode": req.body.jobfunctioncode,"jobrolecode":req.body.jobrolecode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": Number(req.body.differentlyabled), "salaryfrom":Number(req.body.salaryfrom), "salaryto": Number(req.body.salaryto), "agefrom": Number(req.body.agefrom), "ageto": Number(req.body.ageto), "anyage": req.body.anyage};
            
          }
          else
          {
            ////console.log("hiiiiiiiii");
            var empparams = {"jobcode": req.query.jobcode};
                //objRecommended.getJobProfileConditions(logparams, empparams, function(profileresult){
              ////console.log("job", langparams);
                //listparams = {"jobfunctioncode": profileresult[0].jobfunctioncode,"jobrolecode":profileresult[0].jobrolecode, "skillcode":[], "locationcode":profileresult[0].locationcode, "jobtypecode":[],"schoolqualcode":[], "afterschoolqualcode":[], "afterschoolspeccode":[], "experiencecode":[], "maritalcode":[], "gendercode":[], "differentlyabled": 0, "salaryfrom":0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true"};
                listparams = {"jobfunctioncode": [],"jobrolecode":[], "skillcode":[], "locationcode":[], "jobtypecode":[],"schoolqualcode":[], "afterschoolcatecode":[], "afterschoolqualcode":[], "afterschoolspeccode":[], "experiencecode":[], "maritalcode":[], "gendercode":[], "differentlyabled": objconstants.defaultdifferentlyabled, "salaryfrom":0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true","skip":req.query.skip,"limit":req.query.limit};
                objProfileList.getAllProfiles(logparams, langparams, listparams,2, 0, 1, function (profilelistresult) {
                   // //console.log(profilelistresult);
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
                profile_list_json_result: {
                varstatuscode: objconstants.usernotfoundcode,
                response: objconstants.successresponsecode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey
              }
  
            });
          });
        }
      });
  
    }
    catch (e) { logger.error("Error in Recommended Profile List: " + e); }
}