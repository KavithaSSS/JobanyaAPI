'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objJobFunctionCount = require('../process/employee_jobfunction_list_process_controller')
const objLocationCount = require('../process/employee_location_list_process_controller')
const objIndustryCount = require('../process/employee_industry_list_process_controller')
const objJobTypeCount = require('../process/employee_jobtype_list_process_controller')
const objGovtJobsCount = require('../process/govtjobs_list_process_controller')
const objRecommendedJobList = require('../process/employee_recommended_process_controller')
const objJobList = require('../process/employee_job_list_process_controller');
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')



exports.getJobListCount = function (req, res) {
  try {
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if ((validemp == true) || (Number(req.query.employeecode) == -1)) {
        var objLogdetails;
        var langparams = req.query.languagecode;
        var employeecode = Number(req.query.employeecode);
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Job List Count', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        //Job Function
        if (Number(req.query.type) == 4) {
          // //console.log("Entry");
          objJobFunctionCount.getJobFunctionCount(logparams, langparams, employeecode, function (jobfunctionresult) {
            ////console.log(jobfunctionresult);
            if (jobfunctionresult != null && jobfunctionresult.length > 0) {
              //return res.status(200).json({
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgtext,
                    response: varconstant.successresponsecode,
                    job_list_count: jobfunctionresult

                  }
                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgtext,
                  }

                });
              });
            }
            ////console.log(response);
            ////console.log(response.length);


          });
        }
        else if (Number(req.query.type) == 2) //Location
        {
          // //console.log("Entry");
          objLocationCount.getLocationCount(logparams, langparams, employeecode, function (locationresult) {
            ////console.log(jobfunctionresult);
            if (locationresult != null && locationresult.length > 0) {
              //return res.status(200).json({
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgtext,
                    response: varconstant.successresponsecode,
                    job_list_count: locationresult

                  }
                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgtext,
                  }

                });
              });
            }
            ////console.log(response);
            ////console.log(response.length);


          });
        }
        else if (Number(req.query.type) == 6) //eligible Location
        {
          var sortbyparams = { '_id.approveddate': -1, '_id.jobcode': -1 };
          var empparams = { "languagecode": req.query.languagecode, "sortbyparams": sortbyparams, "employeecode": req.query.employeecode };
          objRecommendedJobList.getAllProfileConditions(logparams, empparams, function (profileresult) {
            console.log(JSON.stringify(profileresult), null, " ")
            var listparams = { "industrycode": profileresult.industrycode, "jobrolecode": [], "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": profileresult.locationcode, "jobtypecode": profileresult.jobtypecode, "schoolqualcode": profileresult.schoolqualcode, "afterschoolcatecode": profileresult.afterschoolcatecode, "afterschoolqualcode": profileresult.afterschoolqualcode, "afterschoolspeccode": profileresult.afterschoolspeccode, "experiencecode": profileresult.experiencecode, "employertypecode": profileresult.employertypecode, "companytypecode": profileresult.companytypecode, "maritalcode": profileresult.maritalcode, "gendercode": profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom": profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false", "anydegree": "false", "anyqualification": "false", "anyspec": "false" };
            objJobList.getAllJobList(logparams, empparams, listparams, 7, function (jobresult) {
              if (jobresult != null && jobresult.length > 0) {
                var locationresult = [];
                const group = jobresult.reduce((acc, item) => {
                  acc[item.joblocationcode] = acc[item.joblocationcode] || [];
                  acc[item.joblocationcode].push(item);
                  return acc;
                }, {});
                Object.keys(group).forEach(k => {
                  var val = group[k]
                  var districtname = '';
                  var districtcode = 0;
                  var jobcount = val.length;
                  if (val && val.length > 0)
                    if (val[0].joblocationname && val[0].joblocationname.length > 0) {
                      districtname = val[0].joblocationname[0];
                      districtcode = val[0].joblocationcode[0];
                    }
                  locationresult.push({ districtcode: districtcode, districtname: districtname, jobcount: jobcount })
                });
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    job_list_count_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      job_list_count: locationresult,
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    job_list_count_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                    }

                  });
                });
              }
            });
          });
        }
        else if (Number(req.query.type) == 7) //Flash Jobs Location Count
        {
          var sortbyparams = { '_id.approveddate': -1, '_id.jobcode': -1 };
          var empparams = { "languagecode": req.query.languagecode, "sortbyparams": sortbyparams, "employeecode": req.query.employeecode };
          objRecommendedJobList.getAllProfileConditions(logparams, empparams, function (profileresult) {
            var listparams = { "industrycode": profileresult.industrycode, "jobrolecode": [], "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": [], "jobtypecode": profileresult.jobtypecode, "schoolqualcode": profileresult.schoolqualcode, "afterschoolcatecode": profileresult.afterschoolcatecode, "afterschoolqualcode": profileresult.afterschoolqualcode, "afterschoolspeccode": profileresult.afterschoolspeccode, "experiencecode": profileresult.experiencecode, "employertypecode": profileresult.employertypecode, "companytypecode": profileresult.companytypecode, "maritalcode": profileresult.maritalcode, "gendercode": profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom": profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false", "anydegree": "false", "anyqualification": "false", "anyspec": "false" };
            objJobList.getAllJobList(logparams, empparams, listparams, 8, function (jobresult) {
              console.log(JSON.stringify(jobresult), null, " ")
              if (jobresult != null && jobresult.length > 0) {
                var locationresult = [];
                const group = jobresult.reduce((acc, item) => {
                  acc[item.joblocationcode] = acc[item.joblocationcode] || [];
                  acc[item.joblocationcode].push(item);
                  return acc;
                }, {});
                Object.keys(group).forEach(k => {
                  var val = group[k]
                  var districtname = '';
                  var jobcount = val.length;
                  if (val && val.length > 0)
                    if (val[0].joblocationname && val[0].joblocationname.length > 0)
                      districtname = val[0].joblocationname[0];
                  locationresult.push({ districtcode: Number(k), districtname: districtname, jobcount: jobcount })
                });
                locationresult.sort(GetSortOrder("districtname"));
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    job_list_count_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      job_list_count: locationresult,
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    job_list_count_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                    }

                  });
                });
              }
            });
          });
        }
        else if (Number(req.query.type) == 1)//Job Type 
        {
          // //console.log("Entry");
          objJobTypeCount.getJobTypeCount(logparams, langparams, function (jobtyperesult) {
            ////console.log(jobfunctionresult);
            if (jobtyperesult != null && jobtyperesult.length > 0) {
              //return res.status(200).json({
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgtext,
                    response: varconstant.successresponsecode,
                    job_list_count: jobtyperesult

                  }
                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgtext,
                  }

                });
              });
            }
            ////console.log(response);
            ////console.log(response.length);


          });
        }
        else if (Number(req.query.type) == 3) //Industry
        {
          // //console.log("Entry");
          objIndustryCount.getIndustryCount(logparams, langparams, function (industryresult) {
            ////console.log(jobfunctionresult);
            if (industryresult != null && industryresult.length > 0) {
              //return res.status(200).json({
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgtext,
                    response: varconstant.successresponsecode,
                    job_list_count: industryresult

                  }
                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgtext,
                  }

                });
              });
            }
            ////console.log(response);
            ////console.log(response.length);


          });
        }
        else if (Number(req.query.type) == 5) // Govt Jobs
        {
          // //console.log("Entry");
          objGovtJobsCount.GovtJobsListbyCount(logparams, langparams, function (govtjobsresult) {
            ////console.log(jobfunctionresult);
            if (govtjobsresult != null && govtjobsresult.length > 0) {
              //return res.status(200).json({
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.listcode,
                    responsestring: msgtext,
                    response: varconstant.successresponsecode,
                    job_list_count: govtjobsresult

                  }
                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetails(msgparam, function (msgtext) {
                return res.status(200).json({
                  job_list_count_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgtext,
                  }

                });
              });
            }
            ////console.log(response);
            ////console.log(response.length);


          });
        }
        else {
          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
          objUtilities.getMessageDetails(msgparam, function (msgtext) {
            return res.status(200).json({
              job_list_count_json_result: {
                varstatuscode: varconstant.recordnotfoundcode,
                response: varconstant.successresponsecode,
                responsestring: msgtext,
              }

            });
          });
        }
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetails(msgparam, function (msgtext) {
          return res.status(200).json({
            job_list_count_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              response: varconstant.successresponsecode,
              responsestring: msgtext,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Job List Count: " + e); }
}
exports.getOverallJobListCount = function (req, res) {
  try {
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if ((validemp == true) || (Number(req.query.employeecode) == -1)) {
        var objLogdetails;
        var langparams = req.query.languagecode;
        var employeecode = Number(req.query.employeecode);
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Job List Count', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        let TotalGNJobs = 0, TotalFlashJobs = 0, EligibleJobs = 0, AppliedJobs = 0, TotalPrivateJobs = 0, TotalPartTimeJobs = []
        //GOVERNMENT JOBS COUNT
        objGovtJobsCount.GovtJobsListbyCount(logparams, langparams, function (govtjobsresult) {
          if (govtjobsresult && govtjobsresult.length >= 0) {
            govtjobsresult.forEach(element => {
              TotalGNJobs = TotalGNJobs + element.jobcount;
            });
          }
          var sortbyparams = { '_id.approveddate': -1, '_id.jobcode': -1 };
          var empparams = { "languagecode": req.query.languagecode, "sortbyparams": sortbyparams, "employeecode": req.query.employeecode };
          objRecommendedJobList.getAllProfileConditions(logparams, empparams, function (profileresult) {
            var listparams = { "industrycode": profileresult.industrycode, "jobrolecode": [], "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": profileresult.locationcode, "jobtypecode": profileresult.jobtypecode, "schoolqualcode": profileresult.schoolqualcode, "afterschoolcatecode": profileresult.afterschoolcatecode, "afterschoolqualcode": profileresult.afterschoolqualcode, "afterschoolspeccode": profileresult.afterschoolspeccode, "experiencecode": profileresult.experiencecode, "employertypecode": profileresult.employertypecode, "companytypecode": profileresult.companytypecode, "maritalcode": profileresult.maritalcode, "gendercode": profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom": profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false", "anydegree": "false", "anyqualification": "false", "anyspec": "false" };
            //ELIGIBLE JOBS COUNT
            objJobList.getAllJobList(logparams, empparams, listparams, 7, function (jobresult) {
              var jobids = [];
              if (jobresult && jobresult.length >= 0) {
                EligibleJobs = jobresult.length;
                jobids = jobresult.map(e => { return e.jobcode });
              }
              let appliedlistparams = { "jobids": jobids, "industrycode": [], "jobfunctioncode": [], "jobrolecode": [], "skillcode": [], "locationcode": [], "jobtypecode": [], "schoolqualcode": [], "afterschoolcatecode": [], "afterschoolqualcode": [], "afterschoolspeccode": [], "experiencecode": [], "employertypecode": [], "companytypecode": [], "maritalcode": [], "gendercode": [], "differentlyabled": varconstant.defaultdifferentlyabled, "salaryfrom": 0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true", "anydegree": "true" };
              //APPLIED JOBS COUNT
              objJobList.getAllJobList(logparams, empparams, appliedlistparams, 11, function (AppliedResult) {
                if (AppliedResult && AppliedResult.length >= 0) {
                  AppliedJobs = AppliedResult.length;
                }
                //FLASH JOBS COUNT
                objJobList.getAllJobList(logparams, empparams, listparams, 9, function (Flashjobresult) {
                  if (Flashjobresult && Flashjobresult.length >= 0) {
                    TotalFlashJobs = Flashjobresult.length;
                  }
                  //PRIVATE JOBS COUNT
                  objJobList.getAllJobList(logparams, empparams, listparams, 10, function (Privatejobresult) {
                    if (Privatejobresult && Privatejobresult.length >= 0) {
                      TotalPrivateJobs = Privatejobresult.length;
                    }
                    //part
                    objJobList.getAllJobList(logparams, empparams, listparams, 13, function (Parttimejobresult) {
                      // if (Parttimejobresult && Parttimejobresult.length >= 0) {
                      //   TotalPartTimeJobs = Parttimejobresult.length;
                      // }
                      const msgparam = { "messagecode": varconstant.listcode };
                      objUtilities.getMessageDetails(msgparam, function (msgtext) {
                        return res.status(200).json({
                          job_list_count_json_result: {
                            varstatuscode: varconstant.listcode,
                            responsestring: msgtext,
                            response: varconstant.successresponsecode,
                            TotalFlashJobs: TotalFlashJobs,
                            TotalPrivateJobs: TotalPrivateJobs,
                            TotalGNJobs: TotalGNJobs,
                            EligibleJobs: EligibleJobs,
                            AppliedJobs: AppliedJobs,
                            TotalPartTimeJobs: Parttimejobresult
                          }
                        });
                      });
                    });
                  });
                });
              });
            });
          })
        });
      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetails(msgparam, function (msgtext) {
          return res.status(200).json({
            job_list_count_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              response: varconstant.successresponsecode,
              responsestring: msgtext,
            }
          });
        });
      }
    });
  }
  catch (e) { logger.error("Error in Overall Job List Count: " + e); }
}
function GetSortOrder(prop) {
  try {
    return function (a, b) {
      if (a[prop] > b[prop]) {
        return 1;
      } else if (a[prop] < b[prop]) {
        return -1;
      }
      return 0;
    }
  }
  catch (error) {

  }
}