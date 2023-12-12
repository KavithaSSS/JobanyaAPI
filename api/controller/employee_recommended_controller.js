'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objRecommendedJobList = require('../process/employee_recommended_process_controller')

const objJobList = require('../process/employee_job_list_process_controller');
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')

exports.getRecommendedJobList = function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Recommended Job List', "type": logType };
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
        var empparams = { "languagecode": req.query.languagecode, "sortbyparams": sortbyparams, "employeecode": req.query.employeecode, "skip": req.query.skip, "limit": req.query.limit, "type": req.query.type };
        // console.log("Kavitha Recommended");
        // console.log(empparams);
        if (Object.keys(req.body).length > 0) {
          // console.log("hi");
          listparams = {
            "isanystate": { $ifNull: [req.body.isanystate, 'false'] },
            "isanydistrict": { $ifNull: [req.body.isanydistrict, 'false'] },
            "isanytaluk": { $ifNull: [req.body.isanytaluk, 'false'] },
            "industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode, "skillcode": req.body.skillcode, "locationcode": req.body.locationcode, "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode, "afterschoolcatecode": req.body.afterschoolcatecode, "afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode, "experiencecode": req.body.experiencecode, "employertypecode": req.body.employertypecode, "companytypecode": req.body.companytypecode, "maritalcode": req.body.maritalcode, "gendercode": req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage, "anydegree": req.body.anydegree
          };
          //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
          objJobList.getAllJobListTotal(logparams, empparams, listparams, 1, function (joblisttotal) {
          
          objJobList.getAllJobList(logparams, empparams, listparams, 1, function (jobresult) {
            listparams = { "industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode, "skillcode": req.body.skillcode, "locationcode": req.body.locationcode, "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode, "afterschoolcatecode": req.body.afterschoolcatecode, "afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode, "experiencecode": req.body.experiencecode, "employertypecode": req.body.employertypecode, "companytypecode": req.body.companytypecode, "maritalcode": req.body.maritalcode, "gendercode": req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage, "anydegree": req.body.anydegree };
           // objJobList.getAllJobList(logparams, empparams, listparams, 8, function (flashjobresult) {
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
                      // flash_job_list: flashjobresult,
                      jobalertdays: jobresult.jobalertdays,
                      job_list_total: joblisttotal
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

            //});


          });
        });
        }
        else {
          // console.log("hiiiiiiiii");
          objRecommendedJobList.getAllProfileConditions(logparams, empparams, function (profileresult) {
            //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
            console.log(profileresult.jobrolecode);
            ///// NOTE : SKILL BASED FILTER WAS REMOVED AS PER REQUIREMENT
            var isanystate = 'true'
            var isanydistrict = profileresult.isanydistrict != null ? profileresult.isanydistrict : 'false'
            var isanytaluk = 'true'
            // listparams = {
            //   "industrycode": profileresult.industrycode, "jobrolecode": [], "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": isanydistrict == 'true' ? [] : profileresult.locationcode, "jobtypecode": profileresult.jobtypecode, "schoolqualcode": profileresult.schoolqualcode, "afterschoolcatecode": profileresult.afterschoolcatecode, "afterschoolqualcode": profileresult.afterschoolqualcode, "afterschoolspeccode": profileresult.afterschoolspeccode, "experiencecode": profileresult.experiencecode, "employertypecode": profileresult.employertypecode, "companytypecode": profileresult.companytypecode, "maritalcode": profileresult.maritalcode, "gendercode": profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom": profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false",
            //   "anydegree": "true", "anyqualification": "true", "anyspec": "true"
            // };
            listparams = {
              "industrycode": [], "jobrolecode": profileresult.jobrolecode, "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": [], "jobtypecode": [], "schoolqualcode": [], "afterschoolcatecode": [], "afterschoolqualcode": [], "afterschoolspeccode": [], "experiencecode": [], "employertypecode": [], "companytypecode": [], "maritalcode": [], "gendercode": profileresult.gendercode, "differentlyabled": [], "salaryfrom": 0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true",
              "anydegree": "true", "anyqualification": "true", "anyspec": "true"
            };
            objJobList.getAllJobListTotal(logparams, empparams, listparams, 1, function (joblisttotal) {
            objJobList.getAllJobList(logparams, empparams, listparams, 1, function (jobresult) {
              // listparams = {
              //   "industrycode": profileresult.industrycode, "jobrolecode": [], "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": [], "jobtypecode": profileresult.jobtypecode, "schoolqualcode": profileresult.schoolqualcode, "afterschoolcatecode": profileresult.afterschoolcatecode, "afterschoolqualcode": profileresult.afterschoolqualcode, "afterschoolspeccode": profileresult.afterschoolspeccode, "experiencecode": profileresult.experiencecode, "employertypecode": profileresult.employertypecode, "companytypecode": profileresult.companytypecode, "maritalcode": profileresult.maritalcode, "gendercode": profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom": profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false",
              //   "anydegree": "true", "anyqualification": "true", "anyspec": "true"
              // };
              listparams = {
                "industrycode": [], "jobrolecode": profileresult.jobrolecode, "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": isanydistrict == 'true' ? [] : profileresult.locationcode, "jobtypecode": [], "schoolqualcode": [], "afterschoolcatecode": [], "afterschoolqualcode": [], "afterschoolspeccode": [], "experiencecode": [], "employertypecode": [], "companytypecode": [], "maritalcode": [], "gendercode": profileresult.gendercode, "differentlyabled": [], "salaryfrom": 0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true",
                "anydegree": "true", "anyqualification": "true", "anyspec": "true"
              };
              //objJobList.getAllJobList(logparams, empparams, listparams, 8, function (flashjobresult) {
                // console.log(jobresult.length);
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
                        // flash_job_list: flashjobresult,
                        jobalertdays: jobresult.jobalertdays,
                        job_list_total: joblisttotal
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

              //});


            });
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
  catch (e) { logger.error("Error in Recommended Job List: " + e); }
}

