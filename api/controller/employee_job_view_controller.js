'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objJobView = require('../process/employee_job_view_process_controller')
const { Console } = require('winston/lib/winston/transports');
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
const objRecommendedJobList = require('../process/employee_recommended_process_controller')
const objJobList = require('../process/employee_job_list_process_controller');
const objRecommended = require('../process/employer_recommended_process_controller');
const objProfileList = require('../process/employer_profile_list_process_controller');
exports.getJobView = function (req, res) {
  try {
    var objLogdetails;

    ////console.log(langparams);
    var logUserCode = "";
    var logType = "";
    var apptypecodedata = 0;
    if (req.query.usercode != null) {
      apptypecodedata = 3;
      logUserCode = req.query.usercode;
      logType = varconstant.portalLogType;
    }
    else if (req.query.employeecode != null) {
      apptypecodedata = 1;
      logUserCode = req.query.employeecode;
      logType = varconstant.employeeLogType;
    }
    else if (req.query.appcode == 1) {
      apptypecodedata = 1;
      logUserCode = req.query.employercode;
      logType = varconstant.portalEmployerLogType;
    }
    else {
      logUserCode = req.query.employercode;
      logType = varconstant.AppEmployerLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Job View', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    var listparams;
    objUtilities.CheckvalidJob_View(req, logType, function (validemp) {
      if (validemp == true || Number(req.query.employeecode) == -1) {

        ////console.log("Entry");
        var sortbyparams = { '_id.approveddate': -1 };
        var empparams = { "languagecode": req.query.languagecode, "jobcode": req.query.jobcode, "employeecode": req.query.employeecode, "statuscode": [varconstant.approvedstatus] };
        objJobView.getJobViewProcess(logparams, empparams, function (jobviewresult) {
          //  console.log(jobviewresult,'jobviewresult');
          if (jobviewresult != null && jobviewresult.length > 0) {
            var employercodedata = 0, employeecodedata = 0, jobcodedata = 0;
            if (jobviewresult) {
              if (jobviewresult[0].employerdetails) {
                employercodedata = jobviewresult[0].employerdetails.employercode;
              }
            }
            if (req.query.employeecode) {
              employeecodedata = req.query.employeecode;
            }
            if (req.query.jobcode) {
              jobcodedata = req.query.jobcode;
            }
            if (apptypecodedata == 1) {
              objJobView.insertJobPostViewed(logparams, employercodedata, employeecodedata, jobcodedata, function (insertresult) {

              });
            }

            //return res.status(200).json({
            if (req.query.employeecode != null && Number(req.query.employeecode) != 0) {
              var jobparams = { "languagecode": req.query.languagecode, "jobcode": req.query.jobcode, "employeecode": req.query.employeecode, "sortbyparams": sortbyparams };
              objRecommendedJobList.getAllProfileConditions(logparams, jobparams, function (profileresult) {
                // if (profileresult.agefrom >= 18) {

                // }
                // else
                //   {
                //     const msgparam = { "messagecode": varconstant.listcode };
                //     objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {

                //    return res.status(200).json({
                //       job_view_json_result: {
                //         varstatuscode: varconstant.listcode,
                //         responsestring: msgresult[0].messagetext,
                //         responsekey: msgresult[0].messagekey,
                //         response: varconstant.successresponsecode,
                //         job_details: jobviewresult,
                //         eligiblestatus: false
                //       }
                //     });
                //   });
                //   }
                ////console.log("age");
                ////console.log(profileresult);
                listparams = { "industrycode": profileresult.industrycode, "jobfunctioncode": profileresult.jobfunctioncode, "jobrolecode": [], "skillcode": [], "locationcode": profileresult.locationcode, "jobtypecode": profileresult.jobtypecode, "schoolqualcode": profileresult.schoolqualcode, "afterschoolcatecode": profileresult.afterschoolcatecode, "afterschoolqualcode": profileresult.afterschoolqualcode, "afterschoolspeccode": profileresult.afterschoolspeccode, "experiencecode": profileresult.experiencecode, "employertypecode": profileresult.employertypecode, "companytypecode": profileresult.companytypecode, "maritalcode": profileresult.maritalcode, "gendercode": profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom": profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false", "anydegree": "false", "anyqualification": "false", "anyspec": "false" };
                //listparams = {"industrycode": [], "jobfunctioncode": [], "skillcode":[], "locationcode":[], "jobtypecode":[],"schoolqualcode":[], "afterschoolqualcode":[], "afterschoolspeccode":[], "experiencecode":[], "employertypecode":[], "companytypecode":[], "maritalcode":[], "gendercode":[], "differentlyabled": 1, "salaryfrom":0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true"};
                var eligiblestatus = false;

                if ((profileresult.schoolqualcode != null && profileresult.schoolqualcode.length > 0) || (profileresult.afterschoolcatecode != null && profileresult.afterschoolcatecode.length > 0)) {
                  objJobList.getAllJobList(logparams, jobparams, listparams, 6, function (jobresult) {
                    ////console.log("eligible");
                    ////console.log(jobresult);

                    if (jobresult != null && jobresult.length > 0) {
                      eligiblestatus = true;
                      ////console.log("eligibleTrue");
                    }
                    const msgparam = { "messagecode": varconstant.listcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {

                      return res.status(200).json({
                        job_view_json_result: {
                          varstatuscode: varconstant.listcode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: varconstant.successresponsecode,
                          job_details: jobviewresult,
                          eligiblestatus: eligiblestatus
                        }
                      });
                    });
                  });
                }
                else {
                  const msgparam = { "messagecode": varconstant.listcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {

                    return res.status(200).json({
                      job_view_json_result: {
                        varstatuscode: varconstant.listcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                        job_details: jobviewresult,
                        eligiblestatus: eligiblestatus
                      }
                    });
                  });
                }
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {

                return res.status(200).json({
                  job_view_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                    job_details: jobviewresult
                  }
                });
              });
            }

          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                job_view_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey
                }

              });
            });
          }
          ////console.log(response);
          ////console.log(response.length);


        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            job_view_json_result: {
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
  catch (e) { logger.error("Error in Job View: " + e); }
}

exports.FlashJobDescriptionView = function (req, res) {
  try {
    var objLogdetails;
    var logUserCode = "";
    var logType = "";
    logUserCode = req.query.employeecode;
    logType = varconstant.employeeLogType;
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Job View', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    var listparams;
    objUtilities.CheckvalidJob_View(req, logType, function (validemp) {
      if (validemp == true || Number(req.query.employeecode) == -1) {
        var empparams = { "languagecode": req.query.languagecode, "jobcode": Number(req.query.jobcode), "employeecode": req.query.employeecode, "statuscode": [varconstant.approvedstatus] };
        objJobView.GetFlashJobsView(logparams, empparams, function (jobresult) {
          // console.log(jobresult)
          if (jobresult != null && jobresult.length > 0) {
            var employercodedata = 0, employeecodedata = 0, jobcodedata = 0;
            if (req.query.employeecode) {
              employeecodedata = req.query.employeecode;
            }
            if (req.query.jobcode) {
              jobcodedata = req.query.jobcode;
            }
            objJobView.insertFlashJobPostViewed(logparams, employercodedata, employeecodedata, jobcodedata, function (insertresult) {
            });
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                job_list_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  job_details: jobresult,
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
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            job_view_json_result: {
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
  catch (e) { logger.error("Error in Job View: " + e); }
}

exports.FlashJobDialCount = function (req, res) {
  try {
    var objLogdetails;
    var logUserCode = "";
    var logType = "";
    logUserCode = req.query.employeecode;
    logType = varconstant.employeeLogType;
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Flash Job Dial Count', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    var listparams;
    objUtilities.CheckvalidJob_View(req, logType, function (validemp) {
      if (validemp == true) {
        var employercodedata = 0, employeecodedata = 0, jobcodedata = 0;
        if (req.query.employeecode) {
          employeecodedata = req.query.employeecode;
        }
        if (req.query.jobcode) {
          jobcodedata = req.query.jobcode;
        }
        objJobView.insertFlashJobPostDialed(logparams, employercodedata, employeecodedata, jobcodedata, function (insertresult) {
          console.log(insertresult)
          const msgparam = { "messagecode": varconstant.updatecode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              job_list_json_result: {
                varstatuscode: varconstant.listcode,
                responsestring: msgresult[0].messagetext,
                responsekey: msgresult[0].messagekey,
                response: varconstant.successresponsecode,
              }
            });
          });
        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            job_view_json_result: {
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
  catch (e) { logger.error("Error in Job View: " + e); }
}




exports.getJobCount = function (req, res) {
  try {
    var objLogdetails;

    ////console.log(langparams);
    var logUserCode = "";
    var logType = "";
    var apptypecodedata = 0;
    if (req.query.usercode != null) {
      apptypecodedata = 3;
      logUserCode = req.query.usercode;
      logType = varconstant.portalLogType;
    }
    else if (req.query.employeecode != null) {
      apptypecodedata = 1;
      logUserCode = req.query.employeecode;
      logType = varconstant.employeeLogType;
    }
    else if (req.query.appcode == 1) {
      apptypecodedata = 1;
      logUserCode = req.query.employercode;
      logType = varconstant.portalEmployerLogType;
    }
    else {
      logUserCode = req.query.employercode;
      logType = varconstant.AppEmployerLogType;
    }
    var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Job View', "type": logType };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    var listparams;
    objUtilities.CheckvalidJob_View(req, logType, function (validemp) {
      if (validemp == true) {
        var empparams = { "jobcode": req.query.jobcode };
        var langparams = { "languagecode": req.query.languagecode, "jobcode": req.query.jobcode };
        objRecommended.getJobProfileConditions(logparams, empparams, function (profileresult) {
          // Get active employee
          ///// NOTE : SKILL BASED FILTER WAS REMOVED AS PER REQUIREMENT
          listparams = { "jobfunctioncode": profileresult[0].jobfunctioncode, "jobrolecode": [], "skillcode": [], "locationcode": profileresult[0].locationcode, "jobtypecode": profileresult[0].jobtypecode, "schoolqualcode": profileresult[0].schoolqualcode, "afterschoolcatecode": profileresult[0].afterschoolcatecode, "afterschoolqualcode": profileresult[0].afterschoolqualcode, "afterschoolspeccode": profileresult[0].afterschoolspeccode, "experiencecode": profileresult[0].experiencecode, "maritalcode": profileresult[0].maritalcode, "gendercode": profileresult[0].gendercode, "differentlyabled": profileresult[0].differentlyabled, "salaryfrom": profileresult[0].salaryfrom, "salaryto": profileresult[0].salaryto, "agefrom": profileresult[0].agefrom, "ageto": profileresult[0].ageto, "anyage": profileresult[0].anyage, "skip": 0, "limit": 100000 };
          objProfileList.getAllProfiles(logparams, langparams, listparams, 1, 0, 0, function (profilelistresult) {
            //console.log("FR", profilelistresult);
            //Insert Matching profile count
            var profilecount = 0;
            if (profilelistresult != null) {
              profilecount = profilelistresult.length;
            }
            objUtilities.InsertJobCounts(parseInt(req.query.jobcode), varconstant.matchingprofile, profilecount, function (err, result) {
              objJobView.getJobCounts(logparams, req.query.jobcode, function (jobviewresult) {
                if (jobviewresult && jobviewresult.length > 0) {
                  const msgparam = { "messagecode": varconstant.listcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      job_view_json_result: {
                        varstatuscode: varconstant.listcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                        job_details_count: jobviewresult[0]
                      }
                    });
                  });
                }
              });
            });
          });
        });

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            job_view_json_result: {
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
  catch (e) { logger.error("Error in Job View: " + e); }
}