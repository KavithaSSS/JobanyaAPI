'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const objEmployerManagement = require('../process/employer_management_process_controller');
var objEmployerProfile = require('../process/employer_profile_view_process_controller');
var objEmployeeProfile = require('../process/employee_profile_process_controller');
var objMail = require('../process/send_email_process_controller');
const objNotification = require('../process/employer_notification_process_controller');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
exports.EmployerView = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }

        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                objUtilities.checkemployer(req.query.employercode, function (validemp) {
                    if (validemp == true) {
                        var objLogdetails;
                        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employer View', logdate: new Date(), type: 'Employee' }
                        objUtilities.getLogDetails(logvalues, function (logresponse) {
                            objLogdetails = logresponse;
                        });
                        var logparams = objLogdetails;
                        var employercode = { "employercode": req.query.employercode };
                        objEmployerProfile.getProfileView(logparams, employercode, objconstants.defaultlanguagecode, function (employerresult) {
                            if (employerresult != null && employerresult != "") {
                                const msgparam = { "messagecode": objconstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            varstatuscode: objconstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            "profileinfo": employerresult.profileinfo,
                                            "contactinfo": employerresult.contactinfo,
                                            "companyinfo": employerresult.companyinfo,
                                            "preferences": employerresult.preferences,
                                            "govtidentification": employerresult.govtidentification,
                                            "branchlist": employerresult.branchlist,
                                        }
                                    });
                                });

                            }
                            else {
                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            varstatuscode: objconstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employermanagement_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }
                });

            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employermanagement_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Employer View - Employer Management " + e);
    }
}
exports.UpdateStatuscode = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                objUtilities.checkemployer(req.query.employercode, function (validemp) {
                    if (validemp == true) {
                        var objLogdetails;
                        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update remarks', logdate: new Date(), type: 'Employee' }
                        objUtilities.getLogDetails(logvalues, function (logresponse) {
                            objLogdetails = logresponse;
                        });
                        var logparams = objLogdetails;
                        objEmployerManagement.UpdateStatuscodeInEmployer(logparams, req, function (updateresult) {
                            if (updateresult != null && updateresult > 0) {
                                var statuscode = Number(req.body.statuscode);
                                if (statuscode == objconstants.activestatus) {
                                    //Get employer details
                                    objEmployerManagement.GetEmployerDetails(req, function (empresult) {
                                        if (empresult) {
                                            const insertparams = {
                                                contact_name: empresult[0].registeredname,
                                                company_name: empresult[0].registeredname,
                                                website: empresult[0].website, email: empresult[0].registered_email,
                                                phone: empresult[0].telephoneno, mobileno: empresult[0].mobileno,
                                                first_name: empresult[0].registeredname, zohocode: req.body.zohocode
                                            };
                                            //Add Customer and contact information in zoho book customer
                                            // console.log(req.body.zohocode,'req.body.zohocode')
                                            objEmployerManagement.createzohobookcustomercontact(insertparams, function (zohoresponse) {
                                                // console.log(zohoresponse,'zohoresponse a')
                                                if (zohoresponse) {
                                                    if (zohoresponse.data.contact) {
                                                        //  console.log(zohoresponse.data.contact,'zohoresponse.data.contact')
                                                        //     console.log(zohoresponse.data.contact.contact_persons,'zohoresponse.data.contact_persons')
                                                        //       console.log(zohoresponse.data.contact.contact_persons[0].contact_person_id,'zohoresponse.data.contact_persons.contact_person_id')
                                                        if (zohoresponse.data.contact.contact_id) {
                                                            var contactpersonid = "";
                                                            var contactid = zohoresponse.data.contact.contact_id;
                                                            if (zohoresponse.data.contact.contact_persons) {
                                                                if (zohoresponse.data.contact.contact_persons[0].contact_person_id) {
                                                                    contactpersonid = zohoresponse.data.contact.contact_persons[0].contact_person_id;
                                                                }
                                                            }
                                                            objEmployerManagement.UpdateEmployerZohoContactID(parseInt(req.query.employercode),
                                                                contactid, contactpersonid, function (updateresponse) {
                                                                    console.log(updateresponse, 'employer insert result');
                                                                });
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    });


                                    const msgparam = { "messagecode": objconstants.employerapprovedcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employermanagement_json_result: {
                                                varstatuscode: objconstants.employerapprovedcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objconstants.successresponsecode,
                                            }
                                        });
                                    });
                                    objEmployerManagement.FindEmployerMailID(req, function (result) {
                                        var registered_email = result[0].registered_email;
                                        // //console.log(registered_email);
                                        objUtilities.GetAdminMailId(objconstants.admincode, function (mailid) {
                                            objMail.EmployerApprovedMail(registered_email, mailid, req.query.employercode, logparams, function (validmail) {
                                            });
                                        });
                                    });
                                    // objNotification.GetMaxcode(logparams, function (notificationresponse) {
                                    //     var data = {"employercode": response,"notificationcode": notificationresponse,"notificationtypecode": 1,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now()}
                                    //     objNotification.NotificationDetailsInsert(logparams, data, function (validcode) {
                                    //       var data1 = {"employercode": response,"notificationcode": notificationresponse+1,"notificationtypecode": 2,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now()}
                                    //       objNotification.NotificationDetailsInsert(logparams, data1, function (validcode) {
                                    //         var data2 = {"employercode": response,"notificationcode": notificationresponse+2,"notificationtypecode": 3,"notificationtypestatus": objconstants.defaultstatuscode,"statuscode": Number(objconstants.activestatus),"createddate": Date.now()}
                                    //         objNotification.NotificationDetailsInsert(logparams, data2, function (validcode) {                            
                                    //         });
                                    //       });
                                    //     });
                                    //   });
                                }
                                else if (statuscode == objconstants.rejectedstatus) {
                                    const msgparam = { "messagecode": objconstants.employerejectedcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employermanagement_json_result: {
                                                varstatuscode: objconstants.employerejectedcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objconstants.successresponsecode,
                                            }
                                        });
                                    });
                                    objEmployerManagement.FindEmployerMailID(req, function (result) {
                                        var registered_email = result[0].registered_email;
                                        objUtilities.GetAdminMailId(objconstants.admincode, function (mailid) {
                                            objMail.EmployerRejectedMail(registered_email, mailid, req.query.employercode, logparams, function (validamail) {
                                            });
                                        });
                                    });
                                }
                                else {
                                    const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                        return res.status(200).json({
                                            employermanagement_json_result: {
                                                varstatuscode: objconstants.recordnotfoundcode,
                                                responsestring: msgresult[0].messagetext,
                                                responsekey: msgresult[0].messagekey,
                                                response: objconstants.successresponsecode,
                                            }
                                        });
                                    });
                                }
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.verificationpendingcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            varstatuscode: objconstants.verificationpendingcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employermanagement_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }
                });

            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employermanagement_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Remarks- Employer Management " + e);
    }
}

exports.DeleteEmployer = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                objUtilities.checkemployer(req.body.employercode, function (validemp) {
                    if (validemp == true) {
                        var objLogdetails;
                        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update remarks', logdate: new Date(), type: 'Employee' }
                        objUtilities.getLogDetails(logvalues, function (logresponse) {
                            objLogdetails = logresponse;
                        });
                        var logparams = objLogdetails;
                        objEmployerManagement.DeleteEmployer(logparams, req, function (updateresult) {
                            if (updateresult != null && updateresult > 0) {
                                const msgparam = { "messagecode": objconstants.deletecode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            varstatuscode: objconstants.deletecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            varstatuscode: objconstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else {
                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employermanagement_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }
                });

            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employermanagement_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Delete Employer- Employer Management " + e);
    }
}

exports.UpdateEmailIdInEmployer = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                objUtilities.checkemployer(req.body.employercode, function (validemp) {
                    if (validemp == true) {
                        var objLogdetails;
                        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update email id', logdate: new Date(), type: 'Employee' }
                        objUtilities.getLogDetails(logvalues, function (logresponse) {
                            objLogdetails = logresponse;
                        });
                        var logparams = objLogdetails;
                        objUtilities.checkEmailIdExists(logparams, req.body.registered_email, function (validmail) {
                            if (validmail == null || validmail == 0) {

                                objEmployerManagement.UpdateEmailIdInEmployer(logparams, req, function (updateresult) {
                                    if (updateresult != null && updateresult > 0) {
                                        //console.log(updateresult);
                                        const msgparam = { "messagecode": objconstants.updatecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                employermanagement_json_result: {
                                                    varstatuscode: objconstants.updatecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objconstants.successresponsecode,
                                                }
                                            });
                                        });

                                        objUtilities.GetAdminMailId(objconstants.admincode, function (mailid) {
                                            objMail.VerificationMail_NewEmail(logparams, registered_email, mailid, req.body.employercode, 2, function (validmail) {
                                            });
                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                employermanagement_json_result: {
                                                    varstatuscode: objconstants.recordnotfoundcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objconstants.successresponsecode,
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.existcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            varstatuscode: objconstants.existcode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
                                        }

                                    });
                                });
                            }
                        });

                    }
                    else {
                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employermanagement_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }
                });

            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employermanagement_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Remarks- Employer Management " + e);
    }
}

exports.DeleteNewEmailIdInEmployer = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                objUtilities.checkemployer(req.body.employercode, function (validemp) {
                    if (validemp == true) {
                        var objLogdetails;
                        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update email id', logdate: new Date(), type: 'Employee' }
                        objUtilities.getLogDetails(logvalues, function (logresponse) {
                            objLogdetails = logresponse;
                        });
                        var logparams = objLogdetails;
                        objUtilities.checkEmailIdExists(logparams, req.body.registered_email, function (validmail) {
                            if (validmail == null || validmail == 0) {

                                objEmployerManagement.DeleteNewEmailIdInEmployer(logparams, req, function (updateresult) {
                                    if (updateresult != null && updateresult > 0) {
                                        //console.log(updateresult);
                                        const msgparam = { "messagecode": objconstants.deletecode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                employermanagement_json_result: {
                                                    varstatuscode: objconstants.deletecode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objconstants.successresponsecode,
                                                }
                                            });
                                        });

                                        objUtilities.GetAdminMailId(objconstants.admincode, function (mailid) {
                                            objMail.VerificationMail_NewEmail(logparams, registered_email, mailid, req.body.employercode, 2, function (validmail) {
                                            });
                                        });
                                    }
                                    else {
                                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                            return res.status(200).json({
                                                employermanagement_json_result: {
                                                    varstatuscode: objconstants.recordnotfoundcode,
                                                    responsestring: msgresult[0].messagetext,
                                                    responsekey: msgresult[0].messagekey,
                                                    response: objconstants.successresponsecode,
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.existcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            varstatuscode: objconstants.existcode,
                                            response: objconstants.successresponsecode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey
                                        }

                                    });
                                });
                            }
                        });

                    }
                    else {
                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employermanagement_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }
                });

            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employermanagement_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Remarks- Employer Management " + e);
    }
}

exports.EmployerMasterList =async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employer MasterList', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                var languagecode = req.query.languagecode;
                objEmployeeProfile.EmpListLoad(logparams, languagecode, function (employeeresult) {
                    if (employeeresult != null) {
                        objEmployerManagement.EmployerFormLoad(logparams, languagecode, function (validresult) {
                            if (validresult != null) {
                                const msgparam = { "messagecode": objconstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            response: objconstants.successresponsecode,
                                            varstatuscode: objconstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            masterslist: employeeresult,
                                            facilitylist: validresult.facility,
                                            industrylist: validresult.industry,
                                            companylist: validresult.companylist,
                                            employertypelist: validresult.employertypelist,
                                            packagelist: validresult.packagelist,
                                            userlist: validresult.userlist,
                                            activitylist: validresult.activitylist,
                                            knownlist: validresult.knownlist,
                                            chattyperesult: validresult.chattyperesult,
                                            documenttypelist: validresult.documenttypelist,
                                        }
                                    });

                                });
                            }
                            else {
                                const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            varstatuscode: objconstants.recordnotfoundcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            response: objconstants.successresponsecode,
                                        }
                                    });
                                });
                            }
                        })

                    }
                    else {
                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employermanagement_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }
                })
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employermanagement_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in  MasterList - Employer Management " + e);
    }
}
exports.EmployerList = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (employerresponse) {
            if (employerresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employer List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body.statuscode != null) {
                    var params = req.body;
                    objEmployerManagement.EmployerList(logparams, params, function (validresult) {
                        if (validresult != null && validresult.length > 0) {
                            
                            objEmployerManagement.EmployerListFilter(logparams, params, function (employercount) {
                                const msgparam = { "messagecode": objconstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            response: objconstants.successresponsecode,
                                            varstatuscode: objconstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            employerlist: validresult,
                                            activecount: employercount[0],
                                            inactivecount: employercount[1],
                                            blockcount: employercount[2],
                                            pendingcount: employercount[3],
                                            rejectedount: employercount[4],
                                            totcount: employercount[5],
                                            regviaapp: employercount[6],
                                            regviaportal: employercount[7]
                                        }
                                    });
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employermanagement_json_result: {
                                        varstatuscode: objconstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                    }
                                });
                            });
                        }
                    })

                }
                else {
                    const msgparam = { "messagecode": objconstants.notvalidcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employermanagement_json_result: {
                                varstatuscode: objconstants.notvalidcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: objconstants.successresponsecode,
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employermanagement_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Employer List - Employer Management " + e);
    }
}
exports.EmailEmployerList = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (employerresponse) {
            if (employerresponse == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employer List', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                if (req.body.statuscode != null) {
                    var params = req.body;
                    objEmployerManagement.EmailEmployerList(logparams, params, function (validresult) {
                        if (validresult != null && validresult.length > 0) {
                            objUtilities.findCountByFilter(objconstants.EmployerCount, req, function (employercount) {
                                const msgparam = { "messagecode": objconstants.listcode };
                                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                    return res.status(200).json({
                                        employermanagement_json_result: {
                                            response: objconstants.successresponsecode,
                                            varstatuscode: objconstants.listcode,
                                            responsestring: msgresult[0].messagetext,
                                            responsekey: msgresult[0].messagekey,
                                            employerlist: validresult,
                                            activecount: employercount[0],
                                            inactivecount: employercount[1],
                                            blockcount: employercount[2],
                                            pendingcount: employercount[3],
                                            rejectedount: employercount[4],
                                            totcount: employercount[5],
                                            regviaapp: employercount[6],
                                            regviaportal: employercount[7]
                                        }
                                    });
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employermanagement_json_result: {
                                        varstatuscode: objconstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                    }
                                });
                            });
                        }
                    })

                }
                else {
                    const msgparam = { "messagecode": objconstants.notvalidcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employermanagement_json_result: {
                                varstatuscode: objconstants.notvalidcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                                response: objconstants.successresponsecode,
                            }
                        });
                    });
                }
            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employermanagement_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Employer List - Employer Management " + e);
    }
}
exports.SendEmailEmployerList = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Employer List', logdate: new Date(), type: 'Employee' }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        if (req.body && req.body.Subject != '' && req.body.Content != '' && req.body.Email.length != 0) {
            objUtilities.GetAdminMailId(objconstants.admincode, function (mailid) {
                objMail.EmailToEmployer(logparams, req.body.Subject, req.body.Content, req.body.Email, mailid, function (mailresponse) {
                    console.log('mailresponse' + mailresponse)
                    const msgparam = { "messagecode": objconstants.listcode };
                    objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                        return res.status(200).json({
                            employermanagement_json_result: {
                                response: objconstants.successresponsecode,
                                varstatuscode: objconstants.listcode,
                                responsestring: msgresult[0].messagetext,
                                responsekey: msgresult[0].messagekey,
                            }
                        });
                    });
                });
            });
        }
        else {
            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                return res.status(200).json({
                    employermanagement_json_result: {
                        varstatuscode: objconstants.recordnotfoundcode,
                        responsestring: msgresult[0].messagetext,
                        responsekey: msgresult[0].messagekey,
                        response: objconstants.successresponsecode,
                    }
                });
            });
        }

    }
    catch (e) {
        logger.error("Error in Employer List - Employer Management " + e);
    }
}


//Insert customer and contact details
exports.InsertZohoCustomerContactDetails = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        objUtilities.checkvaliduser({ usercode: parseInt(req.query.usercode) }, function (userresponse) {
            if (userresponse == true) {
                objUtilities.checkemployer(req.query.employercode, function (validemp) {
                    if (validemp == true) {
                        var objLogdetails;
                        const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Update remarks', logdate: new Date(), type: 'Employee' }
                        objUtilities.getLogDetails(logvalues, function (logresponse) {
                            objLogdetails = logresponse;
                        });
                        var logparams = objLogdetails;
                        var statuscode = Number(req.body.statuscode);
                        if (statuscode == objconstants.activestatus) {
                            //Get employer details
                            objEmployerManagement.GetEmployerDetails(req, function (empresult) {
                                if (empresult) {
                                    const insertparams = {
                                        contact_name: empresult[0].registeredname,
                                        company_name: empresult[0].registeredname,
                                        website: empresult[0].website, email: empresult[0].registered_email,
                                        phone: empresult[0].telephoneno, mobileno: empresult[0].mobileno,
                                        first_name: empresult[0].registeredname, zohocode: req.body.zohocode
                                    };
                                    //Add Customer and contact information in zoho book customer
                                    objEmployerManagement.createzohobookcustomercontact(insertparams, function (zohoresponse) {
                                        if (zohoresponse) {
                                            if (zohoresponse.data.contact) {
                                                // console.log(zohoresponse.data.contact.contact_id,'zohoresponse.data.contact.contact_id')
                                                if (zohoresponse.data.contact.contact_id) {
                                                    var contactpersonid = "";
                                                    var contactid = zohoresponse.data.contact.contact_id;
                                                    if (zohoresponse.data.contact.contact_persons) {
                                                        if (zohoresponse.data.contact.contact_persons[0].contact_person_id) {
                                                            contactpersonid = zohoresponse.data.contact.contact_persons[0].contact_person_id;
                                                        }
                                                    }
                                                    objEmployerManagement.UpdateEmployerZohoContactID(parseInt(req.query.employercode),
                                                        contactid, contactpersonid, function (updateresponse) {
                                                            // console.log(updateresponse,'jobpackage insert result');
                                                        });
                                                }
                                            }
                                        }
                                    });
                                }
                            });


                            const msgparam = { "messagecode": objconstants.employerapprovedcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employermanagement_json_result: {
                                        varstatuscode: objconstants.employerapprovedcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                    }
                                });
                            });

                        }
                        else if (statuscode == objconstants.rejectedstatus) {
                            const msgparam = { "messagecode": objconstants.employerejectedcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employermanagement_json_result: {
                                        varstatuscode: objconstants.employerejectedcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                    }
                                });
                            });
                            objEmployerManagement.FindEmployerMailID(req, function (result) {
                                var registered_email = result[0].registered_email;
                                objUtilities.GetAdminMailId(objconstants.admincode, function (mailid) {
                                    objMail.EmployerRejectedMail(registered_email, mailid, req.query.employercode, logparams, function (validamail) {
                                    });
                                });
                            });
                        }
                        else {
                            const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                            objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                                return res.status(200).json({
                                    employermanagement_json_result: {
                                        varstatuscode: objconstants.recordnotfoundcode,
                                        responsestring: msgresult[0].messagetext,
                                        responsekey: msgresult[0].messagekey,
                                        response: objconstants.successresponsecode,
                                    }
                                });
                            });
                        }


                    }
                    else {
                        const msgparam = { "messagecode": objconstants.recordnotfoundcode };
                        objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                            return res.status(200).json({
                                employermanagement_json_result: {
                                    varstatuscode: objconstants.recordnotfoundcode,
                                    responsestring: msgresult[0].messagetext,
                                    responsekey: msgresult[0].messagekey,
                                    response: objconstants.successresponsecode,
                                }
                            });
                        });
                    }
                });

            }
            else {
                const msgparam = { "messagecode": objconstants.usernotfoundcode };
                objUtilities.getMessageDetailWithkeys(msgparam, function (msgresult) {
                    return res.status(200).json({
                        employermanagement_json_result: {
                            varstatuscode: objconstants.usernotfoundcode,
                            responsestring: msgresult[0].messagetext,
                            responsekey: msgresult[0].messagekey,
                            response: objconstants.successresponsecode,
                        }
                    });
                });
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Remarks- Employer Management " + e);
    }
}