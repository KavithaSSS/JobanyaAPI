'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objRecommended = require('../process/employer_recommended_process_controller')
const objSortList = require('../process/employee_sort_process_controller');
const objProfileList = require('../process/employer_profile_list_process_controller');
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const objSearchUpdate = require('../process/employer_search_process_controller');
const logger = new Logger('logs')
exports.getRecommendedProfileList = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;

        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1)
          logType = varconstant.portalEmployerLogType;
        else
          logType = varconstant.AppEmployerLogType;

        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employercode, "orginator": 'Recommended Profile List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var listparams;
        //var sortbyparams;

        var langparams = { "languagecode": req.query.languagecode };

        if (Object.keys(req.body).length > 0)// Filter
        {
          //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
          //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
          var date = new Date(); // some mock date
          var milliseconds = date.getTime();
          const dbo = MongoDB.getDB();

          ////console.log("typecode", typecode);
          //var recentparams = {"employercode": Number(req.query.employercode), "type": Number(req.query.searchtypecode), "typecode": typecode, "searchdate": milliseconds};
          //objSearchUpdate.EmployerRecentSearchUpdate(logparams, recentparams, function(recentresult){
          var empparams = { "employercode": req.query.employercode };
          //objRecommended.getEmployerProfileConditions(logparams, empparams, function(profileresult){
          //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
          /* if (Number(req.query.searchtypecode) ==  1 && req.body.locationcode.length > 0)
          profileresult[0].locationcode.push(Number(req.body.locationcode[0]));
       else if (Number(req.query.searchtypecode) == 2 && req.body.jobrolecode.length > 0)
          profileresult[0].jobrolecode.push(Number(req.body.jobrolecode[0]));
       else if (req.body.jobfunctioncode.length > 0)
          profileresult[0].jobfunctioncode.push(Number(req.body.jobfunctioncode[0])); */
          ////console.log("res", profileresult);
          var typecode;

          if (Number(req.query.searchtypecode) == 1)
            typecode = Number(req.body.locationcode[0]);
          else if (Number(req.query.searchtypecode) == 2)
            typecode = Number(req.body.jobrolecode[0]);
          else
            typecode = Number(req.body.jobfunctioncode[0]);
          ////console.log("typecode", typecode);
          var recentparams = { "employercode": Number(req.query.employercode), "type": Number(req.query.searchtypecode), typecode, "searchdate": milliseconds };
          objSearchUpdate.EmployerRecentSearchUpdate(logparams, recentparams, function (recentresult) {
            var empparams = { "jobcode": req.query.jobcode };
            var searchcode = {};
            if (Number(req.query.searchtypecode) == 1 && req.body.locationcode.length > 0)
              //profileresult[0].locationcode.push(Number(req.body.locationcode[0]));
              searchcode = { 'preferences.location.locationcode': { $in: req.body.locationcode } }
            else if (Number(req.query.searchtypecode) == 2 && req.body.jobrolecode.length > 0) {
              //profileresult[0].jobrolecode.push(Number(req.body.jobrolecode[0]));
              searchcode = { 'skills.jobrolecode': { $in: req.body.jobrolecode } };
              req.body.jobrolecode = [];
            }

            else if (req.body.jobfunctioncode.length > 0) {
              searchcode = { 'skills.jobfunctioncode': { $in: req.body.jobfunctioncode } };
              req.body.jobfunctioncode = [];
            }
            listparams = { "searchcode": searchcode, "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode, "skillcode": req.body.skillcode, "locationcode": req.body.locationcode, "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode, "afterschoolcatecode": req.body.afterschoolcatecode, "afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode, "experiencecode": req.body.experiencecode, "maritalcode": req.body.maritalcode, "gendercode": req.body.gendercode, "differentlyabled": Number(req.body.differentlyabled), "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage, "skip": req.query.skip, "limit": req.query.limit };
            ////console.log(listparams);  
            objProfileList.getAllProfilesTotal(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (TotalEmployeeCount) {               
            objProfileList.getAllProfiles(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (profilelistresult) {
              ////console.log(jobfunctionresult);
              if (profilelistresult != null && profilelistresult.length > 0) {
                //return res.status(200).json({
                const msgparam = { "messagecode": varconstant.listcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  ////console.log("Hello");  
                  ////console.log(prefresult);
                  ////console.log("Hi");
                  return res.status(200).json({
                    profile_list_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      profile_list: profilelistresult,
                      TotalEmployeeCount:TotalEmployeeCount

                    }
                  });
                });
              }
              else {
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    profile_list_json_result: {
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
          });

          //});
          //});
          ////console.log(recentparams);
          //listparams = {"jobfunctioncode": req.body.jobfunctioncode,"jobrolecode":req.body.jobrolecode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": Number(req.body.differentlyabled), "salaryfrom":Number(req.body.salaryfrom), "salaryto": Number(req.body.salaryto), "agefrom": Number(req.body.agefrom), "ageto": Number(req.body.ageto), "anyage": req.body.anyage};

        }
        else {
          var empparams = { "employercode": req.query.employercode };
          objRecommended.getEmployerProfileConditions(logparams, empparams, function (profileresult) {
            // console.log(profileresult[0])
            var isanystate = profileresult[0].isanystate != null ? profileresult[0].isanystate : 'false'
            var isanydistrict = profileresult[0].isanydistrict != null ? profileresult[0].isanydistrict : 'false'
            var isanytaluk = profileresult[0].isanytaluk != null ? profileresult[0].isanytaluk : 'false'
            //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
            listparams = { "jobfunctioncode": profileresult[0].jobfunctioncode, "jobrolecode": [], "skillcode": [], "locationcode": isanydistrict == 'true' ? [] : profileresult[0].locationcode, "jobtypecode": [], "schoolqualcode": [], "afterschoolcatecode": [], "afterschoolqualcode": [], "afterschoolspeccode": [], "experiencecode": [], "maritalcode": [], "gendercode": [], "differentlyabled": varconstant.differentlyablecode, "salaryfrom": 0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true", "skip": req.query.skip, "limit": req.query.limit };
            // console.log(listparams)

            if ((profileresult[0].jobfunctioncode != null && profileresult[0].jobfunctioncode.length > 0) ||
              (profileresult[0].jobrolecode != null && profileresult[0].jobrolecode.length > 0) ||
              (profileresult[0].locationcode != null && profileresult[0].locationcode.length > 0)) {
              ////console.log(profileresult[0]);
              objProfileList.getAllProfilesTotal(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (TotalEmployeeCount) {
              objProfileList.getAllProfiles(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (profilelistresult) {
                ////console.log(jobfunctionresult);
                if (profilelistresult != null && profilelistresult.length > 0) {
                  //return res.status(200).json({
                  const msgparam = { "messagecode": varconstant.listcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    ////console.log("Hello");  
                    ////console.log(prefresult);
                    ////console.log("Hi");
                    return res.status(200).json({
                      profile_list_json_result: {
                        varstatuscode: varconstant.listcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                        profile_list: profilelistresult,
                        TotalEmployeeCount:TotalEmployeeCount

                      }
                    });
                  });
                }
                else {
                  const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                      profile_list_json_result: {
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
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  profile_list_json_result: {
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

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            profile_list_json_result: {
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
  catch (e) { logger.error("Error in Recommended Profile List: " + e); }
}


exports.getEmpSortListLoad = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;

        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1)
          logType = varconstant.portalEmployerLogType;
        else
          logType = varconstant.AppEmployerLogType;

        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employercode, "orginator": 'Employer Sort List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var languagecode = varconstant.defaultlanguagecode;
        if (req.query.languagecode != null) {
          languagecode = req.query.languagecode
        }
        objSortList.getEmployerSortLoad(logparams, languagecode, function (sortresult) {
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
                employer_json_result: {
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
            employer_json_result: {
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
  catch (e) { logger.error("Error in Employer Sort List Load: " + e); }
}
exports.getAdminEmpSortListLoad = function (req, res) {
  try {
    objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
      if (validemp == true) {
        var objLogdetails;

        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        var typecode = "3";//Default value for sorting
        if (req.query.appcode == 1)
          logType = varconstant.portalEmployerLogType;
        else
          logType = varconstant.AppEmployerLogType;

        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employercode, "orginator": 'Employer Sort List', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var languagecode = varconstant.defaultlanguagecode;
        if (req.query.languagecode != null) {
          languagecode = req.query.languagecode
        }
        if (req.query.typecode != null) {
          typecode = req.query.typecode
        }
        objSortList.getAdminEmployerSortLoad(logparams, languagecode, typecode, function (sortresult) {
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
                employer_json_result: {
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
            employer_json_result: {
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
  catch (e) { logger.error("Error in Employer Sort List Load: " + e); }
}

exports.getRecommendedProfileList_jobcode = function (req, res) {
  try {
    var date = new Date(); // some mock date
    var milliseconds = date.getTime();
    //console.log("Entry1")
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      //console.log("Entry2")
      if (validemp == true) {
        var objLogdetails;

        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1)
          logType = varconstant.portalEmployerLogType;
        else
          logType = varconstant.AppEmployerLogType;

        var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employercode, "orginator": 'Recommended Profile List by Job Code', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var listparams;
        //var sortbyparams;

        var langparams = { "languagecode": req.query.languagecode, "jobcode": req.query.jobcode, employeecode: [] };
        ////console.log(req.body);
        if (req.query.ismatchingprofiles != null && req.query.ismatchingprofiles != undefined && Number(req.query.ismatchingprofiles) == 1)
            {
              // console.log("Enrey1")
              objProfileList.getwishlistemployees(logparams, langparams, function(wishedresult){
                // console.log(wishedresult, "wishedresult")
                langparams = {"languagecode": req.query.languagecode, "jobcode": req.query.jobcode, employeecode: wishedresult};

                if (Object.keys(req.body).length > 0) {
                  ////console.log("hi");
                  //console.log("Entry3")
                  //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
                  //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
                  var typecode;
        
                  if (Number(req.query.searchtypecode) == 1)
                    typecode = Number(req.body.locationcode[0]);
                  else if (Number(req.query.searchtypecode) == 2)
                    typecode = Number(req.body.jobrolecode[0]);
                  else
                    typecode = Number(req.body.jobfunctioncode[0]);
                  ////console.log("typecode", typecode);
                  var recentparams = { "employercode": Number(req.query.employercode), "type": Number(req.query.searchtypecode), typecode, "searchdate": milliseconds };
                  objSearchUpdate.EmployerRecentSearchUpdate(logparams, recentparams, function (recentresult) {
                    var empparams = { "jobcode": req.query.jobcode };
                    var searchcode = {};
                    
                    if (req.query.issimilarsearch != null && req.query.issimilarsearch == 1) {
                      //console.log("Entry4")
                      if (Number(req.query.searchtypecode) == 1 && req.body.locationcode.length > 0)
                        //profileresult[0].locationcode.push(Number(req.body.locationcode[0]));
                        searchcode = { 'preferences.location.locationcode': { $in: req.body.locationcode } }
                      else if (Number(req.query.searchtypecode) == 2 && req.body.jobrolecode.length > 0) {
                        //profileresult[0].jobrolecode.push(Number(req.body.jobrolecode[0]));
                        searchcode = { 'skills.jobrolecode': { $in: req.body.jobrolecode } };
                        req.body.jobrolecode = [];
                      }
        
                      else if (req.body.jobfunctioncode.length > 0) {
                        searchcode = { 'skills.jobfunctioncode': { $in: req.body.jobfunctioncode } };
                        req.body.jobfunctioncode = [];
                      }
                      listparams = { "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode, "skillcode": req.body.skillcode, "locationcode": req.body.locationcode, "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode, "afterschoolcatecode": req.body.afterschoolcatecode, "afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode, "experiencecode": req.body.experiencecode, "maritalcode": req.body.maritalcode, "gendercode": req.body.gendercode, "differentlyabled": Number(req.body.differentlyabled), "salaryfrom": Number(req.body.salaryfrom), "salaryto": Number(req.body.salaryto), "agefrom": Number(req.body.agefrom), "ageto": Number(req.body.ageto), "anyage": req.body.anyage, "skip": req.query.skip, "limit": req.query.limit };
                      objProfileList.getAllProfilesTotal(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (TotalEmployeeCount) {
                        objProfileList.getAllProfiles(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (profilelistresult) {
                          ////console.log(jobfunctionresult);
                          if (profilelistresult != null && profilelistresult.length > 0) {
                            //return res.status(200).json({
                            const msgparam = { "messagecode": varconstant.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              ////console.log("Hello");  
                              ////console.log(prefresult);
                              ////console.log("Hi");
                              return res.status(200).json({
                                profile_list_json_result: {
                                  varstatuscode: varconstant.listcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: varconstant.successresponsecode,
                                  profile_list: profilelistresult,
                                  TotalEmployeeCount: TotalEmployeeCount
                                }
                              });
                            });
                          }
                          else {
                            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              return res.status(200).json({
                                profile_list_json_result: {
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
                    else {
                      //console.log("Entry1.1")
                      objRecommended.getJobProfileConditions(logparams, empparams, function (profileresult) {
                        ////console.log(profileresult);
                        if (profileresult != null && profileresult.length > 0) {
                          ////console.log(profileresult);
                          if (Number(req.query.searchtypecode) == 1 && req.body.locationcode.length > 0)
                            //profileresult[0].locationcode.push(Number(req.body.locationcode[0]));
                            searchcode = { 'preferences.location.locationcode': { $in: req.body.locationcode } }
                          else if (Number(req.query.searchtypecode) == 2 && req.body.jobrolecode.length > 0) {
                            //profileresult[0].jobrolecode.push(Number(req.body.jobrolecode[0]));
                            searchcode = { 'skills.jobrolecode': { $in: req.body.jobrolecode } };
                            req.body.jobrolecode = [];
                          }
        
                          else if (req.body.jobfunctioncode.length > 0) {
                            searchcode = { 'skills.jobfunctioncode': { $in: req.body.jobfunctioncode } };
                            req.body.jobfunctioncode = [];
                          }
        
                          //profileresult[0].jobfunctioncode.push(Number(req.body.jobfunctioncode[0]));
                          //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
                          // listparams = {"jobfunctioncode": profileresult[0].jobfunctioncode,
                          // "jobrolecode":profileresult[0].jobrolecode, "skillcode":profileresult[0].skillcode, 
                          // "locationcode":profileresult[0].locationcode, "jobtypecode":profileresult[0].jobtypecode,
                          // "schoolqualcode":profileresult[0].schoolqualcode, "afterschoolqualcode":profileresult[0].afterschoolqualcode, 
                          // "afterschoolspeccode":profileresult[0].afterschoolspeccode, "experiencecode":profileresult[0].experiencecode, 
                          // "maritalcode":profileresult[0].maritalcode, "gendercode":profileresult[0].gendercode, 
                          // "differentlyabled": profileresult[0].differentlyabled, "salaryfrom":profileresult[0].salaryfrom, 
                          // "salaryto": profileresult[0].salaryto, "agefrom": profileresult[0].agefrom, 
                          // "ageto": profileresult[0].ageto, "anyage": profileresult[0].anyage, "searchcode": searchcode};
        
                          //profileresult[0].jobfunctioncode.push(Number(req.body.jobfunctioncode));
        
                          for (var i = 0; i <= profileresult[0].jobfunctioncode.length - 1; i++) {
                            req.body.jobfunctioncode.push(profileresult[0].jobfunctioncode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].jobrolecode.length - 1; i++) {
                            req.body.jobrolecode.push(profileresult[0].jobrolecode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].skillcode.length - 1; i++) {
                            req.body.skillcode.push(profileresult[0].skillcode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].locationcode.length - 1; i++) {
                            req.body.locationcode.push(profileresult[0].locationcode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].jobtypecode.length - 1; i++) {
                            req.body.jobtypecode.push(profileresult[0].jobtypecode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].schoolqualcode.length - 1; i++) {
                            req.body.schoolqualcode.push(profileresult[0].schoolqualcode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].afterschoolqualcode.length - 1; i++) {
                            req.body.afterschoolqualcode.push(profileresult[0].afterschoolqualcode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].afterschoolspeccode.length - 1; i++) {
                            req.body.afterschoolspeccode.push(profileresult[0].afterschoolspeccode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].afterschoolcatecode.length - 1; i++) {
                            req.body.afterschoolcatecode.push(profileresult[0].afterschoolcatecode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].experiencecode.length - 1; i++) {
                            req.body.experiencecode.push(profileresult[0].experiencecode[i]);
                          }
                          for (var i = 0; i <= profileresult[0].maritalcode.length - 1; i++) {
                            req.body.maritalcode.push(profileresult[0].maritalcode[i]);
                          }
        
                          for (var i = 0; i <= profileresult[0].gendercode.length - 1; i++) {
                            req.body.gendercode.push(profileresult[0].gendercode[i]);
                          }
        
                          listparams = {
                            "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode,
                            "skillcode": req.body.skillcode, "locationcode": req.body.locationcode,
                            "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode,
                            "afterschoolcatecode": req.body.afterschoolcatecode, "afterschoolcatecode": req.body.afterschoolcatecode,
                            "afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode,
                            "experiencecode": req.body.experiencecode, "maritalcode": req.body.maritalcode,
                            "gendercode": req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": profileresult[0].salaryfrom,
                            "salaryto": profileresult[0].salaryto, "agefrom": profileresult[0].agefrom,
                            "ageto": profileresult[0].ageto, "anyage": profileresult[0].anyage, "searchcode": searchcode, "skip": req.query.skip, "limit": req.query.limit
                          };
                          ////console.log(listparams);
                          objProfileList.getAllProfilesTotal(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (TotalEmployeeCount) {
                            objProfileList.getAllProfiles(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (profilelistresult) {
                              ////console.log(jobfunctionresult);
                              if (profilelistresult != null && profilelistresult.length > 0) {
                                //return res.status(200).json({
                                const msgparam = { "messagecode": varconstant.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                  ////console.log("Hello");  
                                  ////console.log(prefresult);
                                  ////console.log("Hi");
                                  return res.status(200).json({
                                    profile_list_json_result: {
                                      varstatuscode: varconstant.listcode,
                                      responsestring: msgresult[0].messagetext,
                                      responsekey: msgresult[0].messagekey,
                                      response: varconstant.successresponsecode,
                                      profile_list: profilelistresult,
                                      TotalEmployeeCount: TotalEmployeeCount
        
                                    }
                                  });
                                });
                              }
                              else {
                                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                  return res.status(200).json({
                                    profile_list_json_result: {
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
                        else {
                          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                              profile_list_json_result: {
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
        
                  });
        
                  //listparams = {"jobfunctioncode": req.body.jobfunctioncode,"jobrolecode":req.body.jobrolecode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": Number(req.body.differentlyabled), "salaryfrom":Number(req.body.salaryfrom), "salaryto": Number(req.body.salaryto), "agefrom": Number(req.body.agefrom), "ageto": Number(req.body.ageto), "anyage": req.body.anyage};
        
                }
                else {
                 // console.log("hiiiiiiiii");
                  var empparams = { "jobcode": req.query.jobcode };
                  objRecommended.getJobProfileConditions(logparams, empparams, function (profileresult) {
                   // console.log("hi 3");
                    // console.log(profileresult);
                    //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
                    /* var afterschoolspeccode;
                    var afterschoolqualcode, schoolqualcode;
                  if (profileresult[0].afterschoolspeccode != null)
                    afterschoolspeccode = profileresult[0].afterschoolspeccode;
                    if (profileresult[0].afterschoolqualcode != null)
                    afterschoolqualcode = profileresult[0].afterschoolqualcode
                    if (profileresult[0].schoolqualcode != null)
                    afterschoolspeccode = profileresult[0].afterschoolspeccode */
                    // console.log(JSON.stringify(langparams.employeecode), "employeecodearray")
                    if (profileresult != null && profileresult.length > 0) {
                      //console.log("hi 4");
                      ///// NOTE : SKILL BASED FILTER WAS REMOVED AS PER REQUIREMENT
                      listparams = { "jobfunctioncode": profileresult[0].jobfunctioncode, "jobrolecode": [], "skillcode": [], "locationcode": profileresult[0].locationcode, "jobtypecode": profileresult[0].jobtypecode, "schoolqualcode": profileresult[0].schoolqualcode, "afterschoolcatecode": profileresult[0].afterschoolcatecode, "afterschoolqualcode": profileresult[0].afterschoolqualcode, "afterschoolspeccode": profileresult[0].afterschoolspeccode, "experiencecode": profileresult[0].experiencecode, "maritalcode": profileresult[0].maritalcode, "gendercode": profileresult[0].gendercode, "differentlyabled": profileresult[0].differentlyabled, "salaryfrom": profileresult[0].salaryfrom, "salaryto": profileresult[0].salaryto, "agefrom": profileresult[0].agefrom, "ageto": profileresult[0].ageto, "anyage": profileresult[0].anyage, "skip": req.query.skip, "limit": req.query.limit };
                      objProfileList.getAllProfilesTotal(logparams, langparams, listparams, 1, 0, 0, function (TotalEmployeeCount) {
                        //console.log(TotalEmployeeCount);
                        objProfileList.getAllProfiles(logparams, langparams, listparams, 1, 0, 0, function (profilelistresult) {
                          ////console.log(jobfunctionresult);
                          if (profilelistresult != null && profilelistresult.length > 0) {
                            //return res.status(200).json({
                              //console.log(profilelistresult.length);
                            const msgparam = { "messagecode": varconstant.listcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              ////console.log("Hello");  
                              ////console.log(prefresult);
                              ////console.log("Hi");
                              return res.status(200).json({
                                profile_list_json_result: {
                                  varstatuscode: varconstant.listcode,
                                  responsestring: msgresult[0].messagetext,
                                  responsekey: msgresult[0].messagekey,
                                  response: varconstant.successresponsecode,
                                  profile_list: profilelistresult,
                                  TotalEmployeeCount: TotalEmployeeCount
        
                                }
                              });
                            });
                          }
                          else {
                            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                              return res.status(200).json({
                                profile_list_json_result: {
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
                    else {
                      const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                      objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                          profile_list_json_result: {
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

              });
              //langparams = {}
            }
            else
            {
             // console.log("Enrey2")
              langparams = {"languagecode": req.query.languagecode, "jobcode": req.query.jobcode, employeecode: []};

              if (Object.keys(req.body).length > 0) {
                ////console.log("hi");
                //console.log("Entry3")
                //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
                //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
                var typecode;
      
                if (Number(req.query.searchtypecode) == 1)
                  typecode = Number(req.body.locationcode[0]);
                else if (Number(req.query.searchtypecode) == 2)
                  typecode = Number(req.body.jobrolecode[0]);
                else
                  typecode = Number(req.body.jobfunctioncode[0]);
                ////console.log("typecode", typecode);
                var recentparams = { "employercode": Number(req.query.employercode), "type": Number(req.query.searchtypecode), typecode, "searchdate": milliseconds };
                objSearchUpdate.EmployerRecentSearchUpdate(logparams, recentparams, function (recentresult) {
                  var empparams = { "jobcode": req.query.jobcode };
                  var searchcode = {};
                  
                  if (req.query.issimilarsearch != null && req.query.issimilarsearch == 1) {
                    //console.log("Entry4")
                    if (Number(req.query.searchtypecode) == 1 && req.body.locationcode.length > 0)
                      //profileresult[0].locationcode.push(Number(req.body.locationcode[0]));
                      searchcode = { 'preferences.location.locationcode': { $in: req.body.locationcode } }
                    else if (Number(req.query.searchtypecode) == 2 && req.body.jobrolecode.length > 0) {
                      //profileresult[0].jobrolecode.push(Number(req.body.jobrolecode[0]));
                      searchcode = { 'skills.jobrolecode': { $in: req.body.jobrolecode } };
                      req.body.jobrolecode = [];
                    }
      
                    else if (req.body.jobfunctioncode.length > 0) {
                      searchcode = { 'skills.jobfunctioncode': { $in: req.body.jobfunctioncode } };
                      req.body.jobfunctioncode = [];
                    }
                    listparams = { "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode, "skillcode": req.body.skillcode, "locationcode": req.body.locationcode, "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode, "afterschoolcatecode": req.body.afterschoolcatecode, "afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode, "experiencecode": req.body.experiencecode, "maritalcode": req.body.maritalcode, "gendercode": req.body.gendercode, "differentlyabled": Number(req.body.differentlyabled), "salaryfrom": Number(req.body.salaryfrom), "salaryto": Number(req.body.salaryto), "agefrom": Number(req.body.agefrom), "ageto": Number(req.body.ageto), "anyage": req.body.anyage, "skip": req.query.skip, "limit": req.query.limit };
                    objProfileList.getAllProfilesTotal(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (TotalEmployeeCount) {
                      objProfileList.getAllProfiles(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (profilelistresult) {
                        ////console.log(jobfunctionresult);
                        if (profilelistresult != null && profilelistresult.length > 0) {
                          //return res.status(200).json({
                          const msgparam = { "messagecode": varconstant.listcode };
                          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            ////console.log("Hello");  
                            ////console.log(prefresult);
                            ////console.log("Hi");
                            return res.status(200).json({
                              profile_list_json_result: {
                                varstatuscode: varconstant.listcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: varconstant.successresponsecode,
                                profile_list: profilelistresult,
                                TotalEmployeeCount: TotalEmployeeCount
                              }
                            });
                          });
                        }
                        else {
                          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                              profile_list_json_result: {
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
                  else {
                    //console.log("Entry1.1")
                    objRecommended.getJobProfileConditions(logparams, empparams, function (profileresult) {
                      ////console.log(profileresult);
                      if (profileresult != null && profileresult.length > 0) {
                        ////console.log(profileresult);
                        if (Number(req.query.searchtypecode) == 1 && req.body.locationcode.length > 0)
                          //profileresult[0].locationcode.push(Number(req.body.locationcode[0]));
                          searchcode = { 'preferences.location.locationcode': { $in: req.body.locationcode } }
                        else if (Number(req.query.searchtypecode) == 2 && req.body.jobrolecode.length > 0) {
                          //profileresult[0].jobrolecode.push(Number(req.body.jobrolecode[0]));
                          searchcode = { 'skills.jobrolecode': { $in: req.body.jobrolecode } };
                          req.body.jobrolecode = [];
                        }
      
                        else if (req.body.jobfunctioncode.length > 0) {
                          searchcode = { 'skills.jobfunctioncode': { $in: req.body.jobfunctioncode } };
                          req.body.jobfunctioncode = [];
                        }
      
                        //profileresult[0].jobfunctioncode.push(Number(req.body.jobfunctioncode[0]));
                        //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
                        // listparams = {"jobfunctioncode": profileresult[0].jobfunctioncode,
                        // "jobrolecode":profileresult[0].jobrolecode, "skillcode":profileresult[0].skillcode, 
                        // "locationcode":profileresult[0].locationcode, "jobtypecode":profileresult[0].jobtypecode,
                        // "schoolqualcode":profileresult[0].schoolqualcode, "afterschoolqualcode":profileresult[0].afterschoolqualcode, 
                        // "afterschoolspeccode":profileresult[0].afterschoolspeccode, "experiencecode":profileresult[0].experiencecode, 
                        // "maritalcode":profileresult[0].maritalcode, "gendercode":profileresult[0].gendercode, 
                        // "differentlyabled": profileresult[0].differentlyabled, "salaryfrom":profileresult[0].salaryfrom, 
                        // "salaryto": profileresult[0].salaryto, "agefrom": profileresult[0].agefrom, 
                        // "ageto": profileresult[0].ageto, "anyage": profileresult[0].anyage, "searchcode": searchcode};
      
                        //profileresult[0].jobfunctioncode.push(Number(req.body.jobfunctioncode));
      
                        for (var i = 0; i <= profileresult[0].jobfunctioncode.length - 1; i++) {
                          req.body.jobfunctioncode.push(profileresult[0].jobfunctioncode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].jobrolecode.length - 1; i++) {
                          req.body.jobrolecode.push(profileresult[0].jobrolecode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].skillcode.length - 1; i++) {
                          req.body.skillcode.push(profileresult[0].skillcode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].locationcode.length - 1; i++) {
                          req.body.locationcode.push(profileresult[0].locationcode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].jobtypecode.length - 1; i++) {
                          req.body.jobtypecode.push(profileresult[0].jobtypecode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].schoolqualcode.length - 1; i++) {
                          req.body.schoolqualcode.push(profileresult[0].schoolqualcode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].afterschoolqualcode.length - 1; i++) {
                          req.body.afterschoolqualcode.push(profileresult[0].afterschoolqualcode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].afterschoolspeccode.length - 1; i++) {
                          req.body.afterschoolspeccode.push(profileresult[0].afterschoolspeccode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].afterschoolcatecode.length - 1; i++) {
                          req.body.afterschoolcatecode.push(profileresult[0].afterschoolcatecode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].experiencecode.length - 1; i++) {
                          req.body.experiencecode.push(profileresult[0].experiencecode[i]);
                        }
                        for (var i = 0; i <= profileresult[0].maritalcode.length - 1; i++) {
                          req.body.maritalcode.push(profileresult[0].maritalcode[i]);
                        }
      
                        for (var i = 0; i <= profileresult[0].gendercode.length - 1; i++) {
                          req.body.gendercode.push(profileresult[0].gendercode[i]);
                        }
      
                        listparams = {
                          "jobfunctioncode": req.body.jobfunctioncode, "jobrolecode": req.body.jobrolecode,
                          "skillcode": req.body.skillcode, "locationcode": req.body.locationcode,
                          "jobtypecode": req.body.jobtypecode, "schoolqualcode": req.body.schoolqualcode,
                          "afterschoolcatecode": req.body.afterschoolcatecode, "afterschoolcatecode": req.body.afterschoolcatecode,
                          "afterschoolqualcode": req.body.afterschoolqualcode, "afterschoolspeccode": req.body.afterschoolspeccode,
                          "experiencecode": req.body.experiencecode, "maritalcode": req.body.maritalcode,
                          "gendercode": req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": profileresult[0].salaryfrom,
                          "salaryto": profileresult[0].salaryto, "agefrom": profileresult[0].agefrom,
                          "ageto": profileresult[0].ageto, "anyage": profileresult[0].anyage, "searchcode": searchcode, "skip": req.query.skip, "limit": req.query.limit
                        };
                        ////console.log(listparams);
                        objProfileList.getAllProfilesTotal(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (TotalEmployeeCount) {
                          objProfileList.getAllProfiles(logparams, langparams, listparams, 1, req.query.sortbycode, 0, function (profilelistresult) {
                            ////console.log(jobfunctionresult);
                            if (profilelistresult != null && profilelistresult.length > 0) {
                              //return res.status(200).json({
                              const msgparam = { "messagecode": varconstant.listcode };
                              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                ////console.log("Hello");  
                                ////console.log(prefresult);
                                ////console.log("Hi");
                                return res.status(200).json({
                                  profile_list_json_result: {
                                    varstatuscode: varconstant.listcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: varconstant.successresponsecode,
                                    profile_list: profilelistresult,
                                    TotalEmployeeCount: TotalEmployeeCount
      
                                  }
                                });
                              });
                            }
                            else {
                              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                  profile_list_json_result: {
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
                      else {
                        const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                          return res.status(200).json({
                            profile_list_json_result: {
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
      
                });
      
                //listparams = {"jobfunctioncode": req.body.jobfunctioncode,"jobrolecode":req.body.jobrolecode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": Number(req.body.differentlyabled), "salaryfrom":Number(req.body.salaryfrom), "salaryto": Number(req.body.salaryto), "agefrom": Number(req.body.agefrom), "ageto": Number(req.body.ageto), "anyage": req.body.anyage};
      
              }
              else {
               // console.log("hiiiiiiiii");
                var empparams = { "jobcode": req.query.jobcode };
                objRecommended.getJobProfileConditions(logparams, empparams, function (profileresult) {
                 // console.log("hi 3");
                  // console.log(profileresult);
                  //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
                  /* var afterschoolspeccode;
                  var afterschoolqualcode, schoolqualcode;
                if (profileresult[0].afterschoolspeccode != null)
                  afterschoolspeccode = profileresult[0].afterschoolspeccode;
                  if (profileresult[0].afterschoolqualcode != null)
                  afterschoolqualcode = profileresult[0].afterschoolqualcode
                  if (profileresult[0].schoolqualcode != null)
                  afterschoolspeccode = profileresult[0].afterschoolspeccode */
                  // console.log(JSON.stringify(langparams.employeecode), "employeecodearray")
                  if (profileresult != null && profileresult.length > 0) {
                    //console.log("hi 4");
                    ///// NOTE : SKILL BASED FILTER WAS REMOVED AS PER REQUIREMENT
                    listparams = { "jobfunctioncode": profileresult[0].jobfunctioncode, "jobrolecode": [], "skillcode": [], "locationcode": profileresult[0].locationcode, "jobtypecode": profileresult[0].jobtypecode, "schoolqualcode": profileresult[0].schoolqualcode, "afterschoolcatecode": profileresult[0].afterschoolcatecode, "afterschoolqualcode": profileresult[0].afterschoolqualcode, "afterschoolspeccode": profileresult[0].afterschoolspeccode, "experiencecode": profileresult[0].experiencecode, "maritalcode": profileresult[0].maritalcode, "gendercode": profileresult[0].gendercode, "differentlyabled": profileresult[0].differentlyabled, "salaryfrom": profileresult[0].salaryfrom, "salaryto": profileresult[0].salaryto, "agefrom": profileresult[0].agefrom, "ageto": profileresult[0].ageto, "anyage": profileresult[0].anyage, "skip": req.query.skip, "limit": req.query.limit };
                    objProfileList.getAllProfilesTotal(logparams, langparams, listparams, 1, 0, 0, function (TotalEmployeeCount) {
                      //console.log(TotalEmployeeCount);
                      objProfileList.getAllProfiles(logparams, langparams, listparams, 1, 0, 0, function (profilelistresult) {
                        ////console.log(jobfunctionresult);
                        if (profilelistresult != null && profilelistresult.length > 0) {
                          //return res.status(200).json({
                            //console.log(profilelistresult.length);
                          const msgparam = { "messagecode": varconstant.listcode };
                          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            ////console.log("Hello");  
                            ////console.log(prefresult);
                            ////console.log("Hi");
                            return res.status(200).json({
                              profile_list_json_result: {
                                varstatuscode: varconstant.listcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: varconstant.successresponsecode,
                                profile_list: profilelistresult,
                                TotalEmployeeCount: TotalEmployeeCount
      
                              }
                            });
                          });
                        }
                        else {
                          const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                              profile_list_json_result: {
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
                  else {
                    const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      return res.status(200).json({
                        profile_list_json_result: {
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
            }
           
        

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            profile_list_json_result: {
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
  catch (e) { logger.error("Error in Recommended Profile List: " + e); }
}