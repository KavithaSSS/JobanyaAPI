'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');

const objProfileList = require('../process/employer_profile_list_process_controller');
const objSearchUpdate = require('../process/employer_search_process_controller');
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')

exports.getSearchProfileList = async function (req, res) {
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
        if (req.query.appcode == 1)
          logType = varconstant.portalEmployerLogType;
        else
          logType = varconstant.AppEmployerLogType;
        
          var params = { "ipaddress": req.query.deviceip, "usercode": req.query.employercode, "orginator": 'Search Profile List', "type": logType };
          objUtilities.getLogDetails(params, function (logresponse) {
            objLogdetails = logresponse;
          });
          var logparams = objLogdetails;
          var listparams;
          //var sortbyparams;
          
            var langparams ={"languagecode": req.query.languagecode}; 
          ////console.log(req.body);
          if(Object.keys(req.body).length > 0)
          {
              ////console.log("hi");
            //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
            //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode};
            var date = new Date(); // some mock date
            var milliseconds = date.getTime();
             const dbo = MongoDB.getDB();
             var typecode;
             if (Number(req.query.searchtypecode) ==  1)
              typecode = Number(req.body.locationcode[0]);
             else if (Number(req.query.searchtypecode) == 2)
              typecode = Number(req.body.jobrolecode[0]); 
             else
              typecode = Number(req.body.jobfunctioncode[0]); 
              ////console.log("typecode", typecode);
             var recentparams = {"employercode": Number(req.query.employercode), "type": Number(req.query.searchtypecode), "typecode": typecode, "searchdate": milliseconds};
             ////console.log(recentparams);
             objSearchUpdate.EmployerRecentSearchUpdate(logparams, recentparams, function(recentresult){
                listparams = {"jobfunctioncode": req.body.jobfunctioncode,"jobrolecode":req.body.jobrolecode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolcatecode":req.body.afterschoolcatecode,"afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": Number(req.body.differentlyabled), "salaryfrom":Number(req.body.salaryfrom), "salaryto": Number(req.body.salaryto), "agefrom": Number(req.body.agefrom), "ageto": Number(req.body.ageto), "anyage": req.body.anyage,"skip":req.query.skip,"limit":req.query.limit};
                objProfileList.getAllProfiles(logparams, langparams, listparams, 1, req.query.sortbycode, 1, function (profilelistresult) {
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
                              profile_list: profilelistresult
          
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
         else
         {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              return res.status(200).json({
                  profile_list_json_result: {
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