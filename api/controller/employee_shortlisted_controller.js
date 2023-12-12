'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objRecommendedJobList = require('../process/employee_recommended_process_controller')
const objJobApply = require('../process/employee_applied_process_controller');
const objJobList = require('../process/employee_job_list_process_controller');
const objMail = require('../process/send_email_process_controller');
const objProfile = require('../process/employee_profile_view_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const objJobstatus = require('../process/employer_job_profile_status_process_controller')
const objSendNotification = require('../process/send_notification_process_controller');
const objJobView = require('../process/employee_job_view_process_controller')
const logger = new Logger('logs')

exports.getShortlistedJobList = function (req, res) {
  try {
    
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      ////console.log(validemp);
      if (validemp == true) {
        var objLogdetails;

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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Applied Job List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var listparams;
        var sortbyparams;
        if (Number(req.query.sortbycode) == 1)

          sortbyparams = { '_id.validitydate': 1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 2)
          sortbyparams = { '_id.validitydate': -1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 3)
          sortbyparams = { "_id.noofopenings": 1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 4)
          sortbyparams = { "_id.noofopenings": -1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 5)
          sortbyparams = { '_id.salaryrange.max': 1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 6)
          sortbyparams = { '_id.salaryrange.max': -1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 29)
          sortbyparams = { '_id.matchpercentage': 1, '_id.jobcode': -1 };
        else if (Number(req.query.sortbycode) == 30)
          sortbyparams = { '_id.matchpercentage': -1, '_id.jobcode': -1 };
        else
          sortbyparams = { '_id.approveddate': -1, '_id.jobcode': -1 };
        var empparams = { "languagecode": req.query.languagecode, "sortbyparams": sortbyparams, "employeecode": req.query.employeecode };
        ////console.log(req.body);
        if (Object.keys(req.body).length > 0) {
          ////console.log("hi");
          listparams = { "industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode, "skillcode": req.body.skillcode, "locationcode": req.body.locationcode, "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode, "afterschoolcatecode": req.body.afterschoolcatecode, "afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode, "experiencecode": req.body.experiencecode, "employertypecode": req.body.employertypecode, "companytypecode": req.body.companytypecode, "maritalcode": req.body.maritalcode, "gendercode": req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage, "anydegree": req.body.anydegree };
          //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
          objJobList.getAllJobList(logparams, empparams, listparams, 12, function (jobresult) {
            ////console.log(jobfunctionresult);
            if (jobresult != null && jobresult.length > 0) {
              //return res.status(200).json({
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  job_list_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                    job_list: jobresult,
                    jobalertdays:jobresult.jobalertdays

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
            ////console.log(response);
            ////console.log(response.length);


          });
        }
        else {
          ////console.log("hiiiiiiiii");
          //objRecommendedJobList.getAllProfileConditions(logparams, empparams, function(profileresult){
          //listparams = {"industrycode": profileresult.industrycode, "jobfunctioncode": profileresult.jobfunctioncode, "skillcode":profileresult.skillcode, "locationcode":profileresult.locationcode, "jobtypecode":profileresult.jobtypecode,"schoolqualcode":profileresult.schoolqualcode, "afterschoolqualcode":profileresult.afterschoolqualcode, "afterschoolspeccode":profileresult.afterschoolspeccode, "experiencecode":profileresult.experiencecode, "employertypecode":profileresult.employertypecode, "companytypecode":profileresult.companytypecode, "maritalcode":profileresult.maritalcode, "gendercode":profileresult.gendercode};
          //listparams = {"industrycode": profileresult.industrycode, "jobfunctioncode": profileresult.jobfunctioncode, "skillcode":profileresult.skillcode, "locationcode":profileresult.locationcode, "jobtypecode":profileresult.jobtypecode,"schoolqualcode":profileresult.schoolqualcode, "afterschoolqualcode":profileresult.afterschoolqualcode, "afterschoolspeccode":profileresult.afterschoolspeccode, "experiencecode":profileresult.experiencecode, "employertypecode":profileresult.employertypecode, "companytypecode":profileresult.companytypecode, "maritalcode":profileresult.maritalcode, "gendercode":profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom":profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false"};
          listparams = { "industrycode": [], "jobfunctioncode": [], "jobrolecode": [], "skillcode": [], "locationcode": [], "jobtypecode": [], "schoolqualcode": [], "afterschoolcatecode": [],"afterschoolqualcode": [], "afterschoolspeccode": [], "experiencecode": [], "employertypecode": [], "companytypecode": [], "maritalcode": [], "gendercode": [], "differentlyabled": varconstant.defaultdifferentlyabled, "salaryfrom": 0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true", "anydegree": "true" };
          objJobList.getAllJobList(logparams, empparams, listparams, 12, function (jobresult) {
            ////console.log(jobfunctionresult);
            if (jobresult != null && jobresult.length > 0) {
              //return res.status(200).json({
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  job_list_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                    job_list: jobresult,
                    jobalertdays:jobresult.jobalertdays

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
            ////console.log(response);
            ////console.log(response.length);


          });
          //});
        }

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            job_list_json_result: {
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
  catch (e) { logger.error("Error in Applied Job List: " + e); }
}
exports.ApplyJob = function (req, res) {
  try {
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;

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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Apply for the Job', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var listparams;
        var sortbyparams;
        if (Number(req.query.sortbycode) == 1)

          sortbyparams = { '_id.validitydate': 1 };
        else if (Number(req.query.sortbycode) == 2)
          sortbyparams = { '_id.validitydate': -1 };
        else if (Number(req.query.sortbycode) == 3)
          sortbyparams = { '_id.noofopenings': 1 };
        else if (Number(req.query.sortbycode) == 4)
          sortbyparams = { '_id.noofopenings': -1 };
        else if (Number(req.query.sortbycode) == 5)
          sortbyparams = { '_id.salaryrange.max': 1 };
        else if (Number(req.query.sortbycode) == 6)
          sortbyparams = { '_id.salaryrange.max': -1 };
        else if (Number(req.query.sortbycode) == 29)
          sortbyparams = { '_id.matchpercentage': 1};
        else if (Number(req.query.sortbycode) == 30)
          sortbyparams = { '_id.matchpercentage': -1};
        else
          sortbyparams = { '_id.approveddate': -1 };
        var empparams = { "languagecode": req.query.languagecode, "sortbyparams": sortbyparams, "employeecode": req.query.employeecode, "jobcode": req.query.jobcode };
        ////console.log(req.body);
        objJobstatus.DuplicateCheck(logparams, req, function (validdata) {
          if (validdata == 0) {
            objJobApply.AppliedTotalCount(logparams, req, function (jobcount) {
              if (jobcount == 0 || jobcount > 0) {
                objJobApply.AppliedCount(logparams, req, function (employercount) {
                  var totalcount = Number(jobcount - employercount);
                  // //console.log(totalcount);
                  if (totalcount > 0 || jobcount == 0) {
                    objRecommendedJobList.getAllProfileConditions(logparams, empparams, function (profileresult) {
                      if (profileresult.agefrom >= 18) {
                        ///// NOTE : SKILL BASED FILTER WAS REMOVED AS PER REQUIREMENT
                        listparams = { "industrycode": profileresult.industrycode, "jobfunctioncode": profileresult.jobfunctioncode, "jobrolecode": [], "skillcode": [], "locationcode": profileresult.locationcode, "jobtypecode": profileresult.jobtypecode, "schoolqualcode": profileresult.schoolqualcode, "afterschoolcatecode": profileresult.afterschoolcatecode, "afterschoolqualcode": profileresult.afterschoolqualcode, "afterschoolspeccode": profileresult.afterschoolspeccode, "experiencecode": profileresult.experiencecode, "employertypecode": profileresult.employertypecode, "companytypecode": profileresult.companytypecode, "maritalcode": profileresult.maritalcode, "gendercode": profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom": profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false", "anydegree": "false"};
                        //listparams = {"industrycode": [], "jobfunctioncode": [], "skillcode":[], "locationcode":[], "jobtypecode":[],"schoolqualcode":[], "afterschoolqualcode":[], "afterschoolspeccode":[], "experiencecode":[], "employertypecode":[], "companytypecode":[], "maritalcode":[], "gendercode":[], "differentlyabled": 1, "salaryfrom":0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true"};
                        //objJobList.getAllJobList(logparams, empparams, listparams, 6, function (jobresult) {
                          ////console.log("Hi");
                          ////console.log(jobresult);
                          //if (jobresult != null && jobresult.length > 0) {
                            if(1==1){
                            //return res.status(200).json({
                              ////console.log("1");
                              objUtilities.getcurrentmilliseconds(function (currenttime) {
                                ////console.log("2");
                                var saveparams = { "employeecode": Number(req.query.employeecode), "jobcode": Number(req.query.jobcode), "employercode": Number(req.query.employercode), "statuscode": varconstant.appliedstatus, "createddate": currenttime, "shortliststatus": 0 };
            
                                objJobApply.ApplyJobSave(logparams, saveparams, function (jobapply) {
                                  ////console.log("3");
                                  ////console.log(jobapply);
                                  ////console.log("ApplyJobSave",jobapply);
                                  if (jobapply != null ) {
                                    if (jobapply.type == "Apply")
                                    {
                                      ////console.log("ApplyEntry");
                                     
                                        ////console.log("Hello");  
                                        ////console.log(prefresult);
                                        ////console.log("Hi");
                                        objJobApply.FindEmployerMailID(req, function (result) {
                                          ////console.log(result);
                                            var params = { "employercode": Number(req.query.employercode), "jobcode": Number(req.query.jobcode), employeecode: 0, languagecode: varconstant.defaultlanguagecode, statuscode: [0] };
                                          objJobView.getJobViewProcess(logparams, params, function (jobviewresult) {
                                            var empparams = { "employeecode": Number(req.query.employeecode) };
                                            objProfile.getProfileView(logparams, empparams, varconstant.defaultlanguagecode,req, function (employeedetails) {
                                              ////console.log("2");
                                              objUtilities.GetAdminMailId(varconstant.admincode,function(mailid){
                                                ////console.log("3");
                                                var registered_email = result[0].registered_email;
                                                var adminmailid = mailid;
                                                jobresult.makerid = jobapply.makerid
                                                const msgparam = { "messagecode": varconstant.jobappliedcode };
                                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                                ////console.log(logparams);
                                                
                                                    
                                                  return res.status(200).json({
                                                  job_json_result: {
                                                    varstatuscode: varconstant.jobappliedcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: varconstant.successresponsecode,
                                                    //job_list: jobresult
                          
                                                  }
                                                });
                                              
                                                });
                                                objMail.AppliedMail(registered_email,Number(req.query.employercode), logparams, adminmailid, jobviewresult[0], employeedetails, function (validmail) {
                                                  });
                                                  objSendNotification.SendAppliedNotification(logparams,req,jobviewresult[0], employeedetails,function(result){
                                                  });
                                              });
                                            });
                                          });
                                          
                                          
                                        });
                                        
                                      
                                    }
                                    
                                    
                                  //}
                                  else if (jobapply.type == "applied" || jobapply.type == "invited") {
                                    const msgparam = { "messagecode": varconstant.unselectedcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                      ////console.log("Hello");  
                                      ////console.log(prefresult);
                                      ////console.log("Hi");
                                      return res.status(200).json({
                                        job_json_result: {
                                          varstatuscode: varconstant.unselectedcode,
                                          responsestring: msgresult[0].messagetext,
                                          responsekey: msgresult[0].messagekey,
                                          response: varconstant.successresponsecode,
                                          //job_list: jobresult
                
                                        }
                                      });
                                    });
                                  }
                                  else if (jobapply.type == "shortlisted") {
                                    const msgparam = { "messagecode": varconstant.alreadyshortlisted };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                      ////console.log("Hello");  
                                      ////console.log(prefresult);
                                      ////console.log("Hi");
                                      return res.status(200).json({
                                        job_json_result: {
                                          varstatuscode: varconstant.alreadyshortlisted,
                                          responsestring: msgresult[0].messagetext,
                                          responsekey: msgresult[0].messagekey,
                                          response: varconstant.successresponsecode,
                                          //job_list: jobresult
                
                                        }
                                      });
                                    });
                                  }
                                  else {
                                    const msgparam = { "messagecode": varconstant.alreadyrejectedcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                      ////console.log("Hello");  
                                      ////console.log(prefresult);
                                      ////console.log("Hi");
                                      return res.status(200).json({
                                        job_json_result: {
                                          varstatuscode: varconstant.alreadyrejectedcode,
                                          responsestring: msgresult[0].messagetext,
                                          responsekey: msgresult[0].messagekey,
                                          response: varconstant.successresponsecode,
                                          //job_list: jobresult
                
                                        }
                                      });
                                    });
                                  }
                                }
                                });
                              });
                            
                          }
                          else {
                            const msgparam = { "messagecode": varconstant.noteligiblecode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              return res.status(200).json({
                                job_json_result: {
                                  varstatuscode: varconstant.noteligiblecode,
                                  response: varconstant.successresponsecode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                }
            
                              });
                            });
                          }
                          ////console.log(response);
                          ////console.log(response.length);
            
            
                       // });
                      }
                      else {
                        const msgparam = { "messagecode": varconstant.noteligiblecode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                            job_json_result: {
                              varstatuscode: varconstant.noteligiblecode,
                              response: varconstant.successresponsecode,
                              responsestring: msgresult[0].messagetext,
                              responsekey: msgresult[0].messagekey,
                            }
            
                          });
                        });
                      }
                      //listparams = {"industrycode": profileresult.industrycode, "jobfunctioncode": profileresult.jobfunctioncode, "skillcode":profileresult.skillcode, "locationcode":profileresult.locationcode, "jobtypecode":profileresult.jobtypecode,"schoolqualcode":profileresult.schoolqualcode, "afterschoolqualcode":profileresult.afterschoolqualcode, "afterschoolspeccode":profileresult.afterschoolspeccode, "experiencecode":profileresult.experiencecode, "employertypecode":profileresult.employertypecode, "companytypecode":profileresult.companytypecode, "maritalcode":profileresult.maritalcode, "gendercode":profileresult.gendercode};
            
                    });
                  }
                  else {
                    const msgparam = { "messagecode": varconstant.appliedexceedcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                          job_json_result: {
                                varstatuscode: varconstant.appliedexceedcode,
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
                const msgparam = { "messagecode": varconstant.notvalidcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      job_json_result: {
                            varstatuscode: varconstant.notvalidcode,
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
            const msgparam = { "messagecode": varconstant.invitedcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  job_json_result: {
                        varstatuscode: varconstant.invitedcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                    }
                });
            });
        }
        });
        
        ////console.log("hi");
       



      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            job_json_result: {
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
  catch (e) { logger.error("Error in Applied Job List: " + e); }
}
