'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objProfile = require('../process/employer_branch_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const logger = new Logger('logs')

exports.getBranchinfoLoad = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Branch Info Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getBranchInfoLoad(logparams, langparams, function (response) {
          ////console.log(response);
          ////console.log(response.length);
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
                statelist: response.statelist,
                districtlist: response.districtlist,
                taluklist:response.taluklist

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
  catch (e) { logger.error("Error in Employer Contact Info Load: " + e); }
}




exports.getBranchtypeLoad = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Branch type Bind', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objProfile.getBranchTypeLoad(logparams, langparams, function (response) {
          ////console.log(response);
          ////console.log(response.length);
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
                branchtypelist: response, 

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
  catch (e) { logger.error("Error in Employer Contact Info Load: " + e); }
}

exports.BranchSave = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Branch Info Save', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { employercode: Number(req.query.employercode) };
        ////console.log("hi");
        ////console.log(prefparams);
        if (req.body.branchname != null) {
          objProfile.getBranchInfo(logparams, prefparams, function (empprofile) {
            ////console.log(empsinglepref);
            var empbranchlist = [];
            ////console.log("initiate");
            // //console.log(empprofile[0].referenceinfo);
            if (empprofile[0].branch != null) {
              ////console.log("Entry");
              empbranchlist = empprofile[0].branch;
            }
            objProfile.getBranchMaxcode(logparams, req.query.employercode, function (maxrefcode) {
              req.body.branchcode = maxrefcode;
              ////console.log("hello");
              ////console.log(maxrefcode);
              ////console.log(req.body);
              ////console.log(empreferencelist);
              empbranchlist.push(req.body);

              objProfile.branchsave(empbranchlist, req.query.employercode, logparams, function (profileresult) {

                if (profileresult != null && profileresult > 0) {
                  const msgparam = { "messagecode": varconstant.createcode };
                  objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    ////console.log("Hello");  
                    ////console.log(prefresult);
                    ////console.log("Hi");
                    return res.status(200).json({
                      employer_json_result: {
                        varstatuscode: varconstant.createcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: varconstant.successresponsecode,
                      }
                    });
                  });
                }



              });
            });

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
                responsekey: msgresult[0].messagekey,
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
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Branch Save: " + e); }
}

exports.BranchUpdate = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Branch Info Update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { employercode: Number(req.query.employercode) };
        if (req.body.branchname != null) {
          var updateflag = 0;
          objProfile.getBranchInfo(logparams, prefparams, function (empprofile) {
            ////console.log(empsinglepref);
            var empbranchlist = [];

            ////console.log("initiate");
            // //console.log(empprofile[0].referenceinfo);
            if (empprofile[0].branch != null) {
              ////console.log("Entry");
              empbranchlist = empprofile[0].branch;
            }
            for (var i = 0; i <= empbranchlist.length - 1; i++) {
              if (empbranchlist[i].branchcode == Number(req.query.branchcode)) {
                req.body.branchcode = Number(req.query.branchcode);
                empbranchlist[i] = req.body;
                updateflag = 0;
                break;
              }
              else {
                updateflag = 1;
              }
            }
            if (updateflag == 1) {

              const msgparam = { "messagecode": varconstant.recordnotfoundcode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employer_json_result: {
                    varstatuscode: varconstant.recordnotfoundcode,
                    response: varconstant.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
                  }

                });
              });
            }
            else {
              objProfile.branchsave(empbranchlist, req.query.employercode, logparams, function (profileresult) {

                if (profileresult == true) {
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
                responsekey: msgresult[0].messagekey,
              }

            });
          });
        }
        ////console.log("hi");
        ////console.log(prefparams);

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employer_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              response: varconstant.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Branch Update: " + e); }
}

exports.BranchDelete = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Branch Info Update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { employercode: Number(req.query.employercode) };
        if (req.query.branchcode != null) {
          var updateflag = 0;
          objProfile.getBranchInfo(logparams, prefparams, function (empprofile) {
            ////console.log(empsinglepref);
            var empbranchlist = [];

            ////console.log("initiate");
            // //console.log(empprofile[0].referenceinfo);
            if (empprofile[0].branch != null) {
              ////console.log("Entry");
              empbranchlist = empprofile[0].branch;
            }
            var branchdetails =[];
            if(empbranchlist.length>1){
              for (var i = 0; i <= empbranchlist.length - 1; i++) {
                if (empbranchlist[i].branchcode == Number(req.query.branchcode)) {
                  updateflag = 1;
                }
                else {
                  branchdetails.push(empbranchlist[i]);
                }
              }
              ////console.log(branchdetails);
              if (updateflag == 0) {
  
                const msgparam = { "messagecode": varconstant.recordnotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                  return res.status(200).json({
                    employer_json_result: {
                      varstatuscode: varconstant.recordnotfoundcode,
                      response: varconstant.successresponsecode,
                      responsestring: msgresult[0].messagetext,
                      responsekey: msgresult[0].messagekey,
                    }
  
                  });
                });
              }
              else {
                objProfile.branchsave(branchdetails, req.query.employercode, logparams, function (profileresult) {
  
                  if (profileresult == true) {
                    const msgparam = { "messagecode": varconstant.deletecode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                      ////console.log("Hello");  
                      ////console.log(prefresult);
                      ////console.log("Hi");
                      return res.status(200).json({
                        employer_json_result: {
                          varstatuscode: varconstant.deletecode,
                          responsestring: msgresult[0].messagetext,
                          responsekey: msgresult[0].messagekey,
                          response: varconstant.successresponsecode,
                        }
                      });
                    });
                  }
                });
              }
              
            }
            else {
              const msgparam = { "messagecode": varconstant.branchdeletecode };
              objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                  employer_json_result: {
                    varstatuscode: varconstant.branchdeletecode,
                    response: varconstant.successresponsecode,
                    responsestring: msgresult[0].messagetext,
                    responsekey: msgresult[0].messagekey,
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
                responsekey: msgresult[0].messagekey,
              }

            });
          });
        }
        ////console.log("hi");
        ////console.log(prefparams);

      }
      else {
        const msgparam = { "messagecode": varconstant.usernotfoundcode };
        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
          return res.status(200).json({
            employer_json_result: {
              varstatuscode: varconstant.usernotfoundcode,
              response: varconstant.successresponsecode,
              responsestring: msgresult[0].messagetext,
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Branch Update: " + e); }
}

exports.BranchList = async function (req, res) {
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
        var params = { "ipaddress": req.query.deviceip, "usercode": logUserCode, "orginator": 'Employer Branch Info Update', "type": logType };
        objUtilities.getLogDetails(params, function (logresponse) {
          objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        var prefparams = { "employercode": Number(req.query.employercode), "languagecode": Number(req.query.languagecode) };
        ////console.log("hi");
        ////console.log(prefparams);
        objProfile.getBranchList(logparams, prefparams, function (empprofile) {
          ////console.log(empsinglepref);

          ////console.log("initiate");
          // //console.log(empprofile[0].referenceinfo);
          if (empprofile.length > 0) {
            ////console.log("Entry");
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
                  branch: empprofile
                }
              });
            });
          }
          else {
            const msgparam = { "messagecode": varconstant.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
              ////console.log("Hello");  
              ////console.log(prefresult);
              ////console.log("Hi");
              return res.status(200).json({
                employer_json_result: {
                  varstatuscode: varconstant.recordnotfoundcode,
                  responsestring: msgresult[0].messagetext,
                  responsekey: msgresult[0].messagekey,
                  response: varconstant.successresponsecode

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
              responsekey: msgresult[0].messagekey,
            }

          });
        });
      }
    });

  }
  catch (e) { logger.error("Error in Branch List: " + e); }
}