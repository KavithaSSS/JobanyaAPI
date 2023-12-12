'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objRecommendedJobList = require('../process/employee_recommended_process_controller')
const objWishList = require('../process/employee_wishlist_process_controller');
const objJobList = require('../process/employee_job_list_process_controller');
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')

exports.getWishListJobList = function (req, res) {
    try {
      objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
        if (validemp == true) {
          var objLogdetails;
          
          ////console.log(langparams);
          var logUserCode = "";
        var logType = "";
        if(req.query.usercode != null){
          logUserCode = req.query.usercode;
          logType = varconstant.portalLogType;
        }
        else{
          logUserCode = req.query.employeecode;
          logType = varconstant.employeeLogType;
        }
          var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Wish Listed Job List', "type": logType };
          objUtilities.getLogDetails(params, function (logresponse) {
            objLogdetails = logresponse;
          });
          var logparams = objLogdetails;
          var listparams;
          var sortbyparams;
            if (Number(req.query.sortbycode) == 1)

              sortbyparams = {'_id.validitydate': 1, '_id.jobcode':-1};
            else if (Number(req.query.sortbycode) == 2)
              sortbyparams = {'_id.validitydate': -1, '_id.jobcode':-1};  
            else if (Number(req.query.sortbycode) == 3)
              sortbyparams = {"_id.noofopenings": 1, '_id.jobcode':-1};  
            else if (Number(req.query.sortbycode) == 4)
              sortbyparams = {"_id.noofopenings": -1, '_id.jobcode':-1};
            else if (Number(req.query.sortbycode) == 5)
              sortbyparams = {'_id.salaryrange.max': 1, '_id.jobcode':-1};
            else if (Number(req.query.sortbycode) == 6)
              sortbyparams = {'_id.salaryrange.max': -1, '_id.jobcode':-1};   
            else
              sortbyparams = {'_id.approveddate': -1, '_id.jobcode':-1};  
              ////console.log(sortbyparams)
            var empparams ={"languagecode": req.query.languagecode, "sortbyparams": sortbyparams, "employeecode": req.query.employeecode, "skip": req.query.skip, "limit": req.query.limit}; 
          ////console.log(req.body);
          if(Object.keys(req.body).length > 0)
          {
             // //console.log("hi");
             listparams = {"industrycode": req.body.industrycode, "jobrolecode": req.body.jobrolecode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolcatecode":req.body.afterschoolcatecode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage, "anydegree": req.body.anydegree};
            //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
            objJobList.getAllJobList(logparams, empparams, listparams, 3, function (jobresult) {
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
          else
          {
            ////console.log("hiiiiiiiii");
            //objRecommendedJobList.getAllProfileConditions(logparams, empparams, function(profileresult){
              ////console.log(profileresult);
                //listparams = {"industrycode": profileresult.industrycode, "jobfunctioncode": profileresult.jobfunctioncode, "skillcode":profileresult.skillcode, "locationcode":profileresult.locationcode, "jobtypecode":profileresult.jobtypecode,"schoolqualcode":profileresult.schoolqualcode, "afterschoolqualcode":profileresult.afterschoolqualcode, "afterschoolspeccode":profileresult.afterschoolspeccode, "experiencecode":profileresult.experiencecode, "employertypecode":profileresult.employertypecode, "companytypecode":profileresult.companytypecode, "maritalcode":profileresult.maritalcode, "gendercode":profileresult.gendercode};
                //listparams = {"industrycode": [profileresult.industrycode], "jobfunctioncode": profileresult.jobfunctioncode, "skillcode":profileresult.skillcode, "locationcode":profileresult.locationcode, "jobtypecode":profileresult.jobtypecode,"schoolqualcode":profileresult.schoolqualcode, "afterschoolqualcode":profileresult.afterschoolqualcode, "afterschoolspeccode":profileresult.afterschoolspeccode, "experiencecode":profileresult.experiencecode, "employertypecode":profileresult.employertypecode, "companytypecode":profileresult.companytypecode, "maritalcode":profileresult.maritalcode, "gendercode":profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom":profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false"};
                listparams = {"industrycode": [], "jobfunctioncode": [], "jobrolecode": [], "skillcode":[], "locationcode":[], "jobtypecode":[],"schoolqualcode":[], "afterschoolcatecode":[], "afterschoolqualcode":[], "afterschoolspeccode":[], "experiencecode":[], "employertypecode":[], "companytypecode":[], "maritalcode":[], "gendercode":[], "differentlyabled": varconstant.defaultdifferentlyabled, "salaryfrom":0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true", "anydegree": "true"};
                ////console.log(listparams);
                objJobList.getAllJobList(logparams, empparams, listparams, 3, function (jobresult) {
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
    catch (e) { logger.error("Error in Wish Listed Job List: " + e); }
}

exports.WishListSave = function (req, res) {
  try {
    objUtilities.checkvalidemployee(req.query.employeecode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        
        ////console.log(langparams);
        var logUserCode = "";
      var logType = "";
      if(req.query.usercode != null){
        logUserCode = req.query.usercode;
        logType = varconstant.portalLogType;
      }
      else{
        logUserCode = req.query.employeecode;
        logType = varconstant.employeeLogType;
      }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Wish List Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails; 
        var empparams ={"languagecode": req.query.languagecode, "employeecode": req.query.employeecode}; 
        ////console.log(req.body);
        if(Object.keys(req.body).length > 0)
        {
            ////console.log("hi");
            var date = new Date(); // some mock date
          var milliseconds = date.getTime();
          var saveparams = {"employeecode": Number(req.body.employeecode), "jobcode": Number(req.body.jobcode), "employercode": Number(req.body.employercode), "statuscode": Number(req.body.statuscode), "createddate": milliseconds};
          //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
          objWishList.WishListCreate(logparams, saveparams, function (jobresult) {
             //Insert Wishlist count
             objUtilities.InsertJobCounts( Number(req.body.jobcode),varconstant.wishlists,Number(req.body.statuscode),function(err, result) {
                                                        
            });
              ////console.log(jobfunctionresult);
                if (Number(req.body.statuscode) == varconstant.wishlistedstatus) {
                  //return res.status(200).json({
                  const msgparam = { "messagecode": varconstant.jobwishedcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    ////console.log("Hello");  
                    ////console.log(prefresult);
                    ////console.log("Hi");
                    return res.status(200).json({
                      job_json_result: {
                        varstatuscode: varconstant.jobwishedcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                        //job_list: jobresult
    
                      }
                    });
                  });
                }
                else {
                  const msgparam = { "messagecode": varconstant.jobunwishedcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      job_json_result: {
                        varstatuscode: varconstant.jobunwishedcode,
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
        else
        {
          const msgparam = { "messagecode": varconstant.notvalidcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
              job_json_result: {
              varstatuscode: varconstant.notvalidcode,
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
  catch (e) { logger.error("Error in Wish List save: " + e); }
}