'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objRecommendedJobList = require('../process/employee_recommended_process_controller')
const objInvitedList = require('../process/employee_invited_process_controller')
const objJobList = require('../process/employee_job_list_process_controller');
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')
const objMail = require('../process/send_email_process_controller');
const objProfile = require('../process/employee_profile_view_process_controller')
const objSendNotification = require('../process/send_notification_process_controller');
const objJobView = require('../process/employee_job_view_process_controller')
exports.getInvitedJobList = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Invited Job List', "type": logType };
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
          listparams = { "industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode, "skillcode": req.body.skillcode, "locationcode": req.body.locationcode, "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode, "afterschoolcatecode": req.body.afterschoolcatecode,"afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode, "experiencecode": req.body.experiencecode, "employertypecode": req.body.employertypecode, "companytypecode": req.body.companytypecode, "maritalcode": req.body.maritalcode, "gendercode": req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage, "anydegree": req.body.anydegree };
          //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
          objJobList.getAllJobList(logparams, empparams, listparams, 5, function (jobresult) {
            ////console.log(jobresult.jobalertdays);
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
          objJobList.getAllJobList(logparams, empparams, listparams, 5, function (jobresult) {
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
  catch (e) { logger.error("Error in Invited Job List: " + e); }
}
exports.InvitationAccepted = function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Job Invitation Accepted', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        //var empparams ={"languagecode": req.query.languagecode, "employeecode": req.query.employeecode}; 
        ////console.log(req.body);

        var saveparams = { "employeecode": Number(req.query.employeecode), "jobcode": Number(req.query.jobcode) };
        var type = Number(req.query.type);
        objInvitedList.ShortlistTotalCount(logparams, req, 1, function (jobcount) {
         // //console.log(jobcount);
          if (jobcount == 0 || jobcount > 0) {
            objInvitedList.ShortlistCount(logparams, req, 1, function (employercount) {
             // //console.log(employercount);
              var totalcount = Number(jobcount - employercount);
              ////console.log(totalcount);
              if (totalcount > 0 || jobcount == 0) {
                objInvitedList.InvitationAcceptedSave(logparams, saveparams, type, function (jobresult) {
                  ////console.log(jobfunctionresult);
                  if (jobresult != null && jobresult != "") {
                    //return res.status(200).json({
                      if(type==1){
                        var jobdetails = {"makerid": jobresult, "jobid": "JP" + req.query.jobcode};
                        objUtilities.FindEmployerMailID(req.query.employercode, function (result) {
                          var empparams1 = { "employercode": Number(req.query.employercode), "jobcode": req.query.jobcode, employeecode: 0, languagecode: varconstant.defaultlanguagecode, statuscode: [0] };
                          objJobView.getJobViewProcess(logparams, empparams1, function (jobviewresult) {
                            jobviewresult.makerid = jobresult;
                          var empparams = { "employeecode": Number(req.query.employeecode) };
                          objProfile.getProfileView(logparams, empparams, varconstant.defaultlanguagecode,req, function (prefresult) {
                            //objUtilities.GetAdminMailId( varconstant.admincode,function(mailid){
                              var registered_email = result[0].registered_email;
                              //var adminmailid = mailid;
                             
                                const msgparam = { "messagecode": varconstant.invitationacceptedcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          ////console.log("Hello");  
                          ////console.log(prefresult);
                          ////console.log("Hi");
                          return res.status(200).json({
                            job_json_result: {
                              varstatuscode: varconstant.invitationacceptedcode,
                              responsestring: msgresult[0].messagetext,
                              responsekey: msgresult[0].messagekey,
                              response: varconstant.successresponsecode,
                              //job_list: jobresult
            
                            }
                          });                      
    
                        });
                        objUtilities.GetAdminMailId(varconstant.admincode,function(mailid){
                          // //console.log(prefresult.personalinfo.employeefullname);
                          // //console.log(registered_email);
                          // //console.log(req.query.employercode);
                          objMail.InvitedMail(prefresult,req.query.employercode, registered_email, jobviewresult[0], mailid,logparams, function (validmail) {
                          });
                        });
                                objSendNotification.SendInvitationAcceptedNotification(logparams,req,jobviewresult[0],prefresult,function(result){
                                });
                                
                                
                            //});
                          });
                          
                        });
                        
                      });
                        
                      }
                      else{
                        const msgparam = { "messagecode": varconstant.rejectedcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                            job_json_result: {
                              varstatuscode: varconstant.rejectedcode,
                              response: varconstant.successresponsecode,
                              responsestring: msgresult[0].messagetext,
                              responsekey: msgresult[0].messagekey,
                            }
                          });
                        });
                      }                    
                  }
                  else {
                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      return res.status(200).json({
                        job_json_result: {
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
                const msgparam = { "messagecode": varconstant.shortlistexceedcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employer_json_result: {
                            varstatuscode: varconstant.shortlistexceedcode,
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
                    employer_json_result: {
                        varstatuscode: varconstant.notvalidcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                    }
                });
            });
        }
        });
        //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
        
        /* }
        else
        {
          const msgparam = { "messagecode": varconstant.notvalidcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
              job_list_json_result: {
              varstatuscode: varconstant.notvalidcode,
              response: varconstant.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey
            }

          });
        });
        } */

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
  catch (e) { logger.error("Error in Invitation Accepted: " + e); }
}

