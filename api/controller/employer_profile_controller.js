'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/employer_profile_process_controller')
const objProfileView = require('../process/employer_profile_view_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')

exports.getContactinfoLoad = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1) {
          logUserCode = req.query.employercode;
          logType = varconstant.portalEmployerLogType;
        }
        else {
          logUserCode = req.query.employercode;
          logType = varconstant.AppEmployerLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Contact Info Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getContactInfoLoad(logparams, langparams, function (response) {
          ////console.log(response);
          ////console.log(response.length);
          if (response != null) {
            //return res.status(200).json({
            var prefparams = { employercode: Number(req.query.employercode) };
            objProfileView.getContactinfo(prefparams, req.query.languagecode, function (contactinforesult) {
              const msgparam = { "messagecode": varconstant.listcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                if (contactinforesult != null && contactinforesult.length>0) {
                  return res.status(200).json({
                    employer_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      statelist: response.statelist,
                      districtlist: response.districtlist,
                      taluklist: response.taluklist,
                      address: contactinforesult[0],
                      registered_email: contactinforesult[0].registered_email,
                      website: contactinforesult[0].website
                    }
                  });
                }
                else{
                  return res.status(200).json({
                    employer_json_result: {
                      varstatuscode: varconstant.listcode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                      response: varconstant.successresponsecode,
                      statelist: response.statelist,
                      districtlist: response.districtlist,
                      taluklist: response.taluklist
                    }
                  });
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
  catch (e) { logger.error("Error in Employer Contact Info Load: " + e); }
}

exports.contactinfoupdate = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1) {
          logUserCode = req.query.employercode;
          logType = varconstant.portalEmployerLogType;
        }
        else {
          logUserCode = req.query.employercode;
          logType = varconstant.AppEmployerLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Contact Info Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.body.contactinfo != null) {
          var prefsaveparams = req.body;
          objProfile.contactinfosave(prefsaveparams, req.query.employercode, logparams, function (profileresult) {
            if (profileresult != null && profileresult > 0) {
              const msgparam = { "messagecode": varconstant.updatecode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  employer_json_result: {
                    varstatuscode: varconstant.updatecode,
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
  catch (e) { logger.error("Error in Employer Contact Info Save / Update: " + e); }
}

exports.getCompanyinfoLoad = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1) {
          logUserCode = req.query.employercode;
          logType = varconstant.portalEmployerLogType;
        }
        else {
          logUserCode = req.query.employercode;
          logType = varconstant.AppEmployerLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Company Info Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getCompanyInfoLoad(logparams, langparams, function (response) {
          ////console.log(response);
          ////console.log(response.length);
          if (response != null) {
            //return res.status(200).json({
            var prefparams = { employercode: Number(req.query.employercode) };
            objProfile.getEmpCompanyInfo(logparams, prefparams, function (profileresult) {
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
                    facilitylist: response.facility,
                    turnoverslabresult: response.turnoverslabresult,
                    companyinfo: profileresult

                  }
                });
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
  catch (e) { logger.error("Error in Employer Company Info Load: " + e); }
}

exports.companyinfoupdate = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1) {
          logUserCode = req.query.employercode;
          logType = varconstant.portalEmployerLogType;
        }
        else {
          logUserCode = req.query.employercode;
          logType = varconstant.AppEmployerLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Company Info Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { "employercode": req.query.employercode };
        ////console.log("hi");
        ////console.log(prefparams);
        if (req.body.facilities_offered != null) {
          var prefsaveparams = req.body;
          objProfile.companyinfosave(prefsaveparams, req.query.employercode, logparams, function (profileresult) {

            if (profileresult != null && profileresult > 0) {
              const msgparam = { "messagecode": varconstant.updatecode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                ////console.log("Hello");  
                ////console.log(prefresult);
                ////console.log("Hi");
                return res.status(200).json({
                  employer_json_result: {
                    varstatuscode: varconstant.updatecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                    response: varconstant.successresponsecode,
                  }
                });
              });
            }
            else {
              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employer_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey
                  }

                });
              });
            }
          });
          objProfile.UpdateProfileStatus(req.query.employercode, function (profileresult) {
          });
        }
        else {
          const msgparam = { "messagecode": varconstant.notvalidcode };
          objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
            return res.status(200).json({
              employer_json_result: {
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
  catch (e) { logger.error("Error in Employer Contact Info Save / Update: " + e); }
}

exports.getgovtidentificationLoad = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var langparams = req.query.languagecode;
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1) {
          logUserCode = req.query.employercode;
          logType = varconstant.portalEmployerLogType;
        }
        else {
          logUserCode = req.query.employercode;
          logType = varconstant.AppEmployerLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Company Info Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { employercode: Number(req.query.employercode) };
        objProfile.getGovtInfo(logparams, prefparams, function (profileresult) {
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
                governmentidentification: profileresult

              }
            });
          });


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
  catch (e) { logger.error("Error in Employer Company Info Load: " + e); }
}

exports.getProfileinfoLoad = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        var langparams = Number(req.query.languagecode);
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1) {
          logUserCode = req.query.employercode;
          logType = varconstant.portalEmployerLogType;
        }
        else {
          logUserCode = req.query.employercode;
          logType = varconstant.AppEmployerLogType;
        }
        ////console.log(langparams);
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Profile Info Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getProfileInfoLoad(logparams, langparams, function (response) {
          ////console.log(response);
          ////console.log(response.length);
          if (response != null) {
            //return res.status(200).json({
            var prefparams = { employercode: Number(req.query.employercode) };
            objProfile.getEmpProfileInfo(logparams, prefparams, function (inforesult) {
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
                    companytypelist: response.companytypelist,
                    employertypelist: response.employertypelist,
                    industrylist: response.industrylist,
                    activitytypelist: response.activitytypelist,
                    documenttypelist: response.documenttypelist,
                    profilelist: inforesult
                    
                  }
                });
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
  catch (e) { logger.error("Error in Employer Profile Info Load: " + e); }
}

exports.profileinfoupdate = function (req, res) {
  try {
    objUtilities.checkvalidemployer(req.query.employercode, function (validemp) {
      if (validemp == true) {
        var objLogdetails;
        //var langparams = req.query.languagecode;
        ////console.log(langparams);
        var logUserCode = "";
        var logType = "";
        if (req.query.appcode == 1) {
          logUserCode = req.query.employercode;
          logType = varconstant.portalEmployerLogType;
        }
        else {
          logUserCode = req.query.employercode;
          logType = varconstant.AppEmployerLogType;
        }
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Profile Info Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        //var prefparams = { "employercode":req.query.employercode};
        ////console.log("hi");
        ////console.log(prefparams);
        var prefparams = req.body;
        objProfile.profileinfosave(prefparams, req.query.employercode, logparams, function (profileresult) {

          if (profileresult != null && profileresult > 0) {
            const msgparam = { "messagecode": varconstant.updatecode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              ////console.log("Hello");  
              ////console.log(prefresult);
              ////console.log("Hi");
              return res.status(200).json({
                employer_json_result: {
                  varstatuscode: varconstant.updatecode,
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
  catch (e) { logger.error("Error in Employer Contact Info Save / Update: " + e); }
}