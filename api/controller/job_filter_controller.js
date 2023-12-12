'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objSkillFilter = require('../process/employee_skill_filter_process_controller');
const objLocationFilter = require('../process/employee_location_filter_process_controller');
const objJobFunctionFilter = require('../process/employee_jobfunction_filter_process_controller');
const objJobtypeFilter = require('../process/employee_jobtype_filter_process_controller');
const objEducationFilter = require('../process/employee_education_filter_process_controller');
const objExperienceFilter = require('../process/employee_experience_filter_process_controller');
const objIndustryFilter = require('../process/employee_industry_filter_process_controller');
const objEmployerTypeFilter = require('../process/employee_employertype_filter_process_controller');
const objCompanyTypeFilter = require('../process/employee_companytype_filter_process_controller');
const objJobGroupFilter = require('../process/employee_jobgroup_filter_process_controller');
const objJobRoleFilter = require('../process/employer_jobrole_filter_process_controller');
const Logger = require('../services/logger_service');

const logger = new Logger('logs')


exports.getJobFilterBind = async function (req, res) {
    try {
      const decoded = await objUtilities.validateToken(req);
      if (!decoded) {
        return res.status(200).json({
          status: 401,
          message: "Unauthorized",
        });
      }
      objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
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
            logUserCode = req.query.employercode;
            logType = varconstant.portalEmployerLogType;
          }
          var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Profile Job Filter Bind', "type": logType };
          objUtilities.getLogDetails(params, function (logresponse) {
            objLogdetails = logresponse;
          });
          var logparams = objLogdetails;
  
          var empparams = { "languagecode": req.query.languagecode, "jobcode": req.query.jobcode };
          if (Number(req.query.type) == 0) {
            objSkillFilter.getJobSkillFilterBind(logparams, empparams, function (skillresult) {
              if (skillresult != null && skillresult.length > 0) {
                ////console.log(skillresult)
                objLocationFilter.getJobLocationFilterBind(logparams, empparams, function (locationresult) {
                  if (locationresult != null) {
                    // //console.log(locationresult)
                    objJobFunctionFilter.getJobpostJobFunctionFilterBind(logparams, empparams, function (jobfunctionresult) {
                      if (jobfunctionresult != null) {
                            // //console.log(jobfunctionresult)
                        objJobtypeFilter.getJobpostJobTypeFilterBind(logparams, empparams, function (jobtyperesult) {
                          if (jobtyperesult != null ) {
                            // //console.log(jobtyperesult)
                            objEducationFilter.getJobpostEducationFilterBind(logparams, empparams, function (educationresult) {
                              if (educationresult != null) {
                                // //console.log(educationresult)
                                objExperienceFilter.getJobpostExperienceFilterBind(logparams, empparams, function (experienceresult) {
                                  if (experienceresult != null) {
                                    // //console.log(experienceresult)
                                    objIndustryFilter.getIndustryFilterBind(logparams, empparams, function (industryresult) {
                                      if (industryresult != null) {
                                        // //console.log(industryresult)
                                        objEmployerTypeFilter.getEmpTypeFilterBind(logparams, empparams, function (emptyperesult) {
                                          if (emptyperesult != null ) {
                                            objCompanyTypeFilter.getCompanyTypeFilterBind(logparams, empparams, function (companytyperesult) {
                                              if (companytyperesult != null ) {
                                                objJobGroupFilter.getJobpostJobGroupFilterBind(logparams, empparams, function (jobgroupresult) {
                                                  if (jobgroupresult != null) {
                                                    // //console.log(jobgroupresult)
                                                    objJobRoleFilter.getJobpostJobRoleFilterBind(logparams, empparams, function (jobroleresult) {
                                                      ////console.log(jobfunctionresult);
                                                      if (jobroleresult != null) {
                                                        const msgparam = { "messagecode": varconstant.listcode };
                                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                                                          return res.status(200).json({
                                                            filter_json_result: {
                                                              varstatuscode: varconstant.listcode,
                                                              responsestring: msgtext[0].messagetext,
                                                              responsekey: msgtext[0].messagekey,
                                                              response: varconstant.successresponsecode,
                                                              skill_list: skillresult,
                                                              locationlist: locationresult,
                                                              jobfunctionlist: jobfunctionresult,
                                                              jobtypelist: jobtyperesult,
                                                              educationlist: educationresult,
                                                              experiencelist: experienceresult,
                                                              industrylist: industryresult,
                                                              employertypelist: emptyperesult,
                                                              companytypelist: companytyperesult,
                                                              maritalstatuslist: jobgroupresult[0].maritalstatus,
                                                              genderlist: jobgroupresult[0].genderstatus,
                                                              differentlyabled: jobgroupresult[0].differentlyabled,
                                                              jobrolelist: jobroleresult
                                                            }
                                                          });
                                                        });
                                                      }
                                                    });                                                  
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
          //Skills
          else if (Number(req.query.type) == 1) {
            // //console.log("Entry");
            objSkillFilter.getJobSkillFilterBind(logparams, empparams, function (skillresult) {
              ////console.log(jobfunctionresult);
              if (skillresult != null && skillresult.length > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    skill_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      skill_list: skillresult
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    skill_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
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
            objLocationFilter.getJobLocationFilterBind(logparams, empparams, function (locationresult) {
              ////console.log(jobfunctionresult);
              if (locationresult != null) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    location_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      locationlist: locationresult,
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    location_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
                    }
  
                  });
                });
              }
              ////console.log(response);
              ////console.log(response.length);
  
  
            });
          }
          else if (Number(req.query.type) == 3) //Job Function
          {
            // //console.log("Entry");
            objJobFunctionFilter.getJobpostJobFunctionFilterBind(logparams, empparams, function (jobfunctionresult) {
              ////console.log(jobfunctionresult);
              if (jobfunctionresult != null && jobfunctionresult.length > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    jobfunction_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      jobfunctionlist: jobfunctionresult
  
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    jobfunction_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
                    }
  
                  });
                });
              }
              ////console.log(response);
              ////console.log(response.length);
  
  
            });
          }
          else if (Number(req.query.type) == 4) //Job Type
          {
            // //console.log("Entry");
            objJobtypeFilter.getJobpostJobTypeFilterBind(logparams, empparams, function (jobtyperesult) {
              ////console.log(jobfunctionresult);
              if (jobtyperesult != null && jobtyperesult.length > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    jobtype_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      jobtypelist: jobtyperesult
  
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    jobtype_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
                    }
  
                  });
                });
              }
              ////console.log(response);
              ////console.log(response.length);
  
  
            });
          }
          else if (Number(req.query.type) == 5) //Education
          {
            // //console.log("Entry");
            objEducationFilter.getJobpostEducationFilterBind(logparams, empparams, function (educationresult) {
              ////console.log(jobfunctionresult);
              if (educationresult != null) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    education_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      educationlist: educationresult
  
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    education_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
                    }
  
                  });
                });
              }
              ////console.log(response);
              ////console.log(response.length);
  
  
            });
          }
          else if (Number(req.query.type) == 6) //Experience
          {
            // //console.log("Entry");
            objExperienceFilter.getJobpostExperienceFilterBind(logparams, empparams, function (experienceresult) {
              ////console.log(jobfunctionresult);
              if (experienceresult != null) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");getProfileExperienceFilterBind
                  return res.status(200).json({
                    experience_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      experiencelist: experienceresult
  
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    experience_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
                    }
  
                  });
                });
              }
              ////console.log(response);
              ////console.log(response.length);
  
  
            });
          }
          else if (Number(req.query.type) == 7) //Industry
          {
            // //console.log("Entry");
            objIndustryFilter.getIndustryFilterBind(logparams, empparams, function (industryresult) {
              ////console.log(jobfunctionresult);
              if (industryresult != null && industryresult.length > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    industry_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      industrylist: industryresult
  
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    industry_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
                    }
  
                  });
                });
              }
              ////console.log(response);
              ////console.log(response.length);
  
  
            });
          }
          else if (Number(req.query.type) == 8) //Employer Type
          {
            // //console.log("Entry");
            objEmployerTypeFilter.getEmpTypeFilterBind(logparams, empparams, function (emptyperesult) {
              ////console.log(jobfunctionresult);
              if (emptyperesult != null && emptyperesult.length > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    employertype_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      employertypelist: emptyperesult
  
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    employertype_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
                    }
  
                  });
                });
              }
              ////console.log(response);
              ////console.log(response.length);
  
  
            });
          }
          else if (Number(req.query.type) == 9) //Company Type
          {
            // //console.log("Entry");
            objCompanyTypeFilter.getCompanyTypeFilterBind(logparams, empparams, function (companytyperesult) {
              ////console.log(jobfunctionresult);
              if (companytyperesult != null && companytyperesult.length > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    companytype_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      companytypelist: companytyperesult
  
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    companytype_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
                    }
  
                  });
                });
              }
              ////console.log(response);
              ////console.log(response.length);
  
  
            });
          }
          else if (Number(req.query.type) == 10) //Job Group
          {
            // //console.log("Entry");
            objJobGroupFilter.getJobpostJobGroupFilterBind(logparams, empparams, function (jobgroupresult) {
              ////console.log(jobfunctionresult);
              if (jobgroupresult != null) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    jobgroup_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      maritalstatuslist: jobgroupresult[0].maritalstatus,
                      genderlist: jobgroupresult[0].genderstatus,
                      differentlyabled: jobgroupresult[0].differentlyabled
  
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    jobgroup_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
                    }
  
                  });
                });
              }
              ////console.log(response);
              ////console.log(response.length);
  
  
            });
          }
          else if (Number(req.query.type) == 11) //Job Role
          {
            // //console.log("Entry");
            objJobRoleFilter.getJobpostJobRoleFilterBind(logparams, empparams, function (jobroleresult) {
              ////console.log(jobfunctionresult);
              if (jobroleresult != null) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    jobrole_filter_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey,
                      response: varconstant.successresponsecode,
                      jobrolelist: jobroleresult
  
  
                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
                  return res.status(200).json({
                    jobrole_filter_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgtext[0].messagetext,
                      responsekey: msgtext[0].messagekey
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
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
              return res.status(200).json({
                filter_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  response: varconstant.successresponsecode,
                  responsestring: msgtext[0].messagetext,
                  responsekey: msgtext[0].messagekey
                }
  
              });
            });
          }
        }
        else {
          const msgparam = { "messagecode": varconstant.usernotfoundcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgtext) {
            return res.status(200).json({
              filter_json_result: {
                varstatuscode: varconstant.usernotfoundcode,
                response: varconstant.successresponsecode,
                responsestring: msgtext[0].messagetext,
                responsekey: msgtext[0].messagekey
              }
  
            });
          });
        }
      });
  
    }
    catch (e) { logger.error("Error in Filter Bind: " + e); }
  }