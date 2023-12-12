'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objJobFunctionCount = require('../process/employee_jobfunction_list_process_controller')
const objJobRoleCount = require('../process/employee_location_list_process_controller')
const objIndustryCount = require('../process/employee_industry_list_process_controller')
const objJobTypeCount = require('../process/employee_jobtype_list_process_controller')
const objGovtJobsCount = require('../process/govtjobs_list_process_controller')
const objSortList = require('../process/employee_sort_process_controller');
const objJobList = require('../process/employee_job_list_process_controller');
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')

exports.getJobList = async function (req, res) {
  try {
    if(Number(req.query.employeecode) != -1){
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
  }
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true || req.query.employeecode == -1) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Job List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
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
        var empparams = { "languagecode": req.query.languagecode, "typecode": req.query.typecode, "type": req.query.type, "sortbyparams": sortbyparams, "employeecode": req.query.employeecode, "skip": req.query.skip, "limit": req.query.limit ,"searchtypecode":Number(req.query.searchtypecode)};
        var listparams = { "industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode, "skillcode": req.body.skillcode, "locationcode": req.body.locationcode, "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode, "afterschoolcatecode": req.body.afterschoolcatecode, "afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode, "experiencecode": req.body.experiencecode, "employertypecode": req.body.employertypecode, "companytypecode": req.body.companytypecode, "maritalcode": req.body.maritalcode, "gendercode": req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom == "" ? 0 : req.body.agefrom, "ageto": req.body.ageto == "" ? 0 : req.body.ageto, "anyage": req.body.agefrom == "" ? "true" : req.body.anyage, "anydegree": req.body.anydegree };
        if (Number(req.query.type) == 4) {
          // //console.log("Entry");
          objJobList.getAllJobListTotal(logparams, empparams, listparams, 1, function (jobfunctionresulttotal) {
          objJobList.getAllJobList(logparams, empparams, listparams, 1, function (jobfunctionresult) {
            ////console.log(jobfunctionresult);
            if (jobfunctionresult != null && jobfunctionresult.length > 0) {
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
                    job_list_count: jobfunctionresult,
                    jobalertdays: jobfunctionresult.jobalertdays,
                    job_list_total: jobfunctionresulttotal
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
        });
        }
        else if (Number(req.query.type) == 2) //Location
        {
          // //console.log("Entry");
          objJobList.getAllJobListTotal(logparams, empparams, listparams, 1, function (jobroleresulttotal) {
          objJobList.getAllJobList(logparams, empparams, listparams, 1, function (jobroleresult) {
            ////console.log(jobfunctionresult);
            if (jobroleresult != null && jobroleresult.length > 0) {
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
                    job_list_count: jobroleresult,
                    jobalertdays: jobroleresult.jobalertdays,
                    job_list_total: jobroleresulttotal

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
        });
        }
        else if (Number(req.query.type) == 1)//Job Type 
        {
          // //console.log("Entry");
          objJobList.getAllJobListTotal(logparams, empparams, listparams, 1, function (jobtyperesulttotal) {
          objJobList.getAllJobList(logparams, empparams, listparams, 1, function (jobtyperesult) {
            ////console.log(jobfunctionresult);
            if (jobtyperesult != null && jobtyperesult.length > 0) {
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
                    job_list_count: jobtyperesult,
                    jobalertdays: jobtyperesult.jobalertdays,
                    job_list_total: jobtyperesulttotal

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
                    responsekey: msgresult[0].messagekey
                  }

                });
              });
            }
            ////console.log(response);
            ////console.log(response.length);


          });
        });
        }
        else if (Number(req.query.type) == 3) //Industry
        {
          // //console.log("Entry");
          objJobList.getAllJobListTotal(logparams, empparams, listparams, 1, function (industryresulttotal) {
          objJobList.getAllJobList(logparams, empparams, listparams, 1, function (industryresult) {
            ////console.log(industryresult);
            if (industryresult != null && industryresult.length > 0) {
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
                    job_list_count: industryresult,
                    jobalertdays: industryresult.jobalertdays,
                    job_list_total: industryresulttotal

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
                    responsekey: msgresult[0].messagekey
                  }

                });
              });
            }
            ////console.log(response);
            ////console.log(response.length);


          });
        });
        }
        else if (Number(req.query.type) == 5) // Govt Jobs
        {
          // //console.log("Entry");
          var gnparams = { "languagecode": req.query.languagecode, "gnorganisationcode": req.query.typecode };
          objGovtJobsCount.GovtJobsList(logparams, gnparams, function (govtjobsresult) {
            ////console.log(jobfunctionresult);
            if (govtjobsresult != null && govtjobsresult.length > 0) {
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
                    job_list_count: govtjobsresult,
                    jobalertdays: govtjobsresult.jobalertdays

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
                    responsekey: msgresult[0].messagekey
                  }

                });
              });
            }
            ////console.log(response);
            ////console.log(response.length);


          });
        }
        else if (Number(req.query.type) == 6) // Recent Search
        {
          // //console.log("Entry");
          var date = new Date(); // some mock date
          var milliseconds = date.getTime();
          const dbo = MongoDB.getDB();
          var typecode;
          if (Number(req.query.searchtypecode) == 1)
            typecode = Number(req.body.locationcode[0]);
          else if (Number(req.query.searchtypecode) == 2)
            typecode = Number(req.body.jobrolecode[0]);
          else if (Number(req.query.searchtypecode) == 3)
            typecode = Number(req.body.jobfunctioncode[0]);
          else
            typecode = Number(req.body.industrycode[0]);
          var recentparams = { "employeecode": Number(req.query.employeecode), "type": Number(req.query.searchtypecode), "typecode": typecode, "searchdate": milliseconds };
          // //console.log(recentparams);
          objJobList.RecentSearchUpdate(logparams, recentparams, function (recentresult) {
            //});
            //dbo.collection(String(MongoDB.RecentSearchCollectionName)).insertOne(recentparams, function (err, recentresult) {
              objJobList.getAllJobListTotal(logparams, empparams, listparams, 1, function (searchresulttotal) {
            objJobList.getAllJobList(logparams, empparams, listparams, 1, function (searchresult) {
              objJobList.getAllJobListTotal(logparams, empparams, listparams, 8, function (flashjobresulttotal) {
              objJobList.getAllJobList(logparams, empparams, listparams, 8, function (flashjobresult) {
                ////console.log(jobfunctionresult);
                var totaljobcount = searchresulttotal + flashjobresulttotal
                if ((searchresult != null && searchresult.length > 0) || (flashjobresult != null && flashjobresult.length > 0)) {
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
                        job_list: searchresult,
                        flash_job_list: flashjobresult,
                        jobalertdays: searchresult.jobalertdays,
                        job_list_total: totaljobcount
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
            });
            });
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
  catch (e) { logger.error("Error in Job List: " + e); }
}

exports.getSortListLoad = async function (req, res) {
  try {
    const decoded = await objUtilities.validateToken(req);
    if (!decoded) {
      return res.status(200).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var langparams = req.query.languagecode;
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Sort List Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var languagecode = varconstant.defaultlanguagecode;
        if (req.query.languagecode != null) {
          languagecode = req.query.languagecode
        }
        objSortList.getSortLoad(logparams, languagecode, function (sortresult) {
          ////console.log(response);
          ////console.log(response.length);
          if (sortresult != null) {
            //return res.status(200).json({
            const msgparam = { "messagecode": varconstant.listcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              ////console.log("Hello");  
              ////console.log(prefresult);
              ////console.log("Hi");
              return res.status(200).json({
                employee_json_result: {
                  varstatuscode: varconstant.listcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode,
                  sortlist: sortresult,

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
            employee_json_result: {
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
  catch (e) { logger.error("Error in Sort List Load: " + e); }
}  