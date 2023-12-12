'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objProfileList = require('../process/employer_profile_list_process_controller');
const objRecommended = require('../process/employer_recommended_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
exports.getOverallProfileListCount = function (req, res) {
  try {
    var async = require('async');
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var logType = "";
        logType = objconstants.AppEmployerLogType;
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Invited List', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var logparams = objLogdetails;
        var listparams;
        var langparams = { "languagecode": req.query.languagecode, "jobcode": req.query.jobcode };
        let InvitedProfiles = 0, AppliedProfiles = 0, MatchingProfiles = 0, EligibleProfiles = 0, ActivePostedJobs = 0
        let matchparams = { "employercode": req.query.employercode }
        objProfileList.GetAllActiveJobs(matchparams, function (activejobcode) {
          if (activejobcode && activejobcode.length >= 0)
            ActivePostedJobs = activejobcode.length
          listparams = { "employercode": req.query.employercode, "activejobcode": activejobcode, "jobfunctioncode": [], "jobrolecode": [], "skillcode": [], "locationcode": [], "jobtypecode": [], "schoolqualcode": [], "afterschoolcatecode": [], "afterschoolqualcode": [], "afterschoolspeccode": [], "experiencecode": [], "maritalcode": [], "gendercode": [], "differentlyabled": objconstants.defaultdifferentlyabled, "salaryfrom": 0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true", "skip": objconstants.skipvalue, "limit": objconstants.limitvalue };
          // INVITED PROFILES LIST
          objProfileList.getAllProfiles(logparams, langparams, listparams, 8, 0, 1, function (Invitedprofilelistresult) {
            if (Invitedprofilelistresult != null && Invitedprofilelistresult.length > 0) {
              InvitedProfiles = Invitedprofilelistresult.length
            }
            // APPLIED PROFILES LIST
            objProfileList.getAllProfiles(logparams, langparams, listparams, 9, 0, 1, function (Appliedprofilelistresult) {
              if (Appliedprofilelistresult != null && Appliedprofilelistresult.length > 0) {
                AppliedProfiles =Appliedprofilelistresult.length
              }
              
              //MATCHING PROFILES LIST
              var empparams = { "employercode": req.query.employercode };
              objRecommended.getEmployerProfileConditions(logparams, empparams, function (empprofileresult) {
                var isanydistrict = empprofileresult[0].isanydistrict != null ? empprofileresult[0].isanydistrict : 'false'
                listparams = { "jobfunctioncode": empprofileresult[0].jobfunctioncode, "jobrolecode": [], "skillcode": [], "locationcode": isanydistrict == 'true' ? [] : empprofileresult[0].locationcode, "jobtypecode": [], "schoolqualcode": [], "afterschoolcatecode": [], "afterschoolqualcode": [], "afterschoolspeccode": [], "experiencecode": [], "maritalcode": [], "gendercode": [], "differentlyabled": objconstants.differentlyablecode, "salaryfrom": 0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true", "skip": objconstants.skipvalue, "limit": objconstants.limitvalue };
                objProfileList.getAllProfiles(logparams, langparams, listparams, 10, 0, 1, function (Matchingprofilelistresult) {
                  if (Matchingprofilelistresult != null && Matchingprofilelistresult.length > 0) {
                    MatchingProfiles = Matchingprofilelistresult.length
                  }
                  
                  // ELIGIBLE PROFILES LIST
                  var iteratorFcn = function (jobcode, done) {
                    if (jobcode == null) {
                      done();
                      return;
                    }
                    var empparams = { "jobcode": jobcode };
                    objRecommended.getJobProfileConditions(logparams, empparams, function (profileresult) {
                      if (profileresult != null && profileresult.length > 0) {
                        ///// NOTE : SKILL BASED FILTER WAS REMOVED AS PER REQUIREMENT
                        listparams = { "jobfunctioncode": profileresult[0].jobfunctioncode, "jobrolecode": [], "skillcode": [], "locationcode": profileresult[0].locationcode, "jobtypecode": profileresult[0].jobtypecode, "schoolqualcode": profileresult[0].schoolqualcode, "afterschoolcatecode": profileresult[0].afterschoolcatecode, "afterschoolqualcode": profileresult[0].afterschoolqualcode, "afterschoolspeccode": profileresult[0].afterschoolspeccode, "experiencecode": profileresult[0].experiencecode, "maritalcode": profileresult[0].maritalcode, "gendercode": profileresult[0].gendercode, "differentlyabled": profileresult[0].differentlyabled, "salaryfrom": profileresult[0].salaryfrom, "salaryto": profileresult[0].salaryto, "agefrom": profileresult[0].agefrom, "ageto": profileresult[0].ageto, "anyage": profileresult[0].anyage, "skip": objconstants.skipvalue, "limit": objconstants.limitvalue };
                        objProfileList.getAllProfiles(logparams, langparams, listparams, 10, 0, 0, function (Eligibleprofilelistresult) {
                          if (Eligibleprofilelistresult != null && Eligibleprofilelistresult.length > 0) {
                            EligibleProfiles = EligibleProfiles + Eligibleprofilelistresult.length
                          }
                          done();
                          return;
                        })
                      }
                    });
                  };
                  var doneIteratingFcn = function (err) {
                    const msgparam = { "messagecode": objconstants.listcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      return res.status(200).json({
                        profile_list_json_result: {
                          varstatuscode: objconstants.listcode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: objconstants.successresponsecode,
                          InvitedProfiles: InvitedProfiles,
                          AppliedProfiles: AppliedProfiles,
                          MatchingProfiles: MatchingProfiles,
                          EligibleProfiles: EligibleProfiles,
                          ActivePostedJobs: ActivePostedJobs
                        }
                      });
                    });
                  };
                  async.forEach(activejobcode, iteratorFcn, doneIteratingFcn);
                });
              });
            });
          });
        })
      }
      else {
        const msgparam = { "messagecode": objconstants.usernotfoundcode };
        objUtilities.getMessageDetails(msgparam, function (msgtext) {
          return res.status(200).json({
            job_list_count_json_result: {
              varstatuscode: objconstants.usernotfoundcode,
              response: objconstants.successresponsecode,
              responsestring: msgtext,
            }
          });
        });
      }
    });
  }
  catch (e) { logger.error("Error in Overall Job List Count: " + e); }
}
exports.InvitedList = function (req, res) {
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
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.employercode, orginator: 'Invited List', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var logparams = objLogdetails;
        var listparams;
        var langparams = { "languagecode": req.query.languagecode, "jobcode": req.query.jobcode };
        if (Object.keys(req.body).length > 0) {

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
        else {
          ////console.log("hiiiiiiiii");
          //var empparams = {"jobcode": req.query.jobcode};
          //objRecommended.getJobProfileConditions(logparams, empparams, function(profileresult){
          ////console.log("job", langparams);
          //listparams = {"jobfunctioncode": profileresult[0].jobfunctioncode,"jobrolecode":profileresult[0].jobrolecode, "skillcode":[], "locationcode":profileresult[0].locationcode, "jobtypecode":[],"schoolqualcode":[], "afterschoolqualcode":[], "afterschoolspeccode":[], "experiencecode":[], "maritalcode":[], "gendercode":[], "differentlyabled": 0, "salaryfrom":0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true"};
          listparams = { "jobfunctioncode": [], "jobrolecode": [], "skillcode": [], "locationcode": [], "jobtypecode": [], "schoolqualcode": [], "afterschoolcatecode": [], "afterschoolqualcode": [], "afterschoolspeccode": [], "experiencecode": [], "maritalcode": [], "gendercode": [], "differentlyabled": objconstants.defaultdifferentlyabled, "salaryfrom": 0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true", "skip": req.query.skip, "limit": req.query.limit };
          objProfileList.getAllProfiles(logparams, langparams, listparams, 4, 0, 1, function (profilelistresult) {
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
            profile_list_json_result: {
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
    logger.error("Error in Invited list in employer : " + e);
  }
}