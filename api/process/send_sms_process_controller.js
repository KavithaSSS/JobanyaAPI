const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const varconstant = require('../../config/constants');
const varsmsconstant = require('../../config/sms_constants');
const objUtilities = require("../controller/utilities");
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const https = require('https');
exports.SendOTP = function (logparams, mobileno, otptypecode, employeename, callback) {
    try {
        logger.info("Log in Checking Send OTP: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);


        objUtilities.GenerateRandamNo(function (validotp) {
            // //console.log(validotp);        
            var templateid;
            var messagecontent = "";
            if (otptypecode == varconstant.forgetpwdtypecode) {
                messagecontent = varsmsconstant.employee_forgot_pwd.replace(varsmsconstant.employee_replace_name, employeename).replace(
                    varsmsconstant.employee_replace_otp, validotp);
                templateid = varsmsconstant.employee_forgot_pwd_template;
            }
            else if (otptypecode == varconstant.changemobiletypecode) {
                messagecontent = varsmsconstant.employee_change_mb_number.replace(varsmsconstant.employee_replace_name, employeename).replace(
                    varsmsconstant.employee_replace_otp, validotp);
                templateid = varsmsconstant.employee_change_mobile_template;
            }
            else if (otptypecode == varconstant.invisiblemodetypecode) {
                messagecontent = varsmsconstant.employee_activate.replace(varsmsconstant.employee_replace_name, employeename).replace(
                    varsmsconstant.employee_replace_otp, validotp);
                templateid = varsmsconstant.employee_activate_template;
            }
            else if (otptypecode == varconstant.verify_employee_mobile_search_typecode) {
                messagecontent = varsmsconstant.employee_new_registration.replace(varsmsconstant.employee_replace_name, employeename).replace(
                    varsmsconstant.employee_replace_otp, validotp);
                templateid = varsmsconstant.employee_reg_template;
            }
            else {
                messagecontent = varsmsconstant.employee_new_registration.replace(varsmsconstant.employee_replace_name, employeename).replace(
                    varsmsconstant.employee_replace_otp, validotp);
                templateid = varsmsconstant.employee_reg_template;
            }

            exports.SendSMS(logparams, messagecontent, mobileno, templateid, function (response) {
                // console.log('response SendSMS '+response)
                if (response != null && response != 0) {
                    return callback(validotp);
                }
                else {
                    return callback(0);
                }
            });
        });

    }
    catch (e) {
        logger.error("Error in Send OTP : Employer" + e);
    }
    // Load the AWS SDK for Node.js
}

exports.CheckValidMobileNoExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employee Mobile Number : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        // dbo.collection(MongoDB.EmployeeCollectionName).find({ "mobileno": req.query.mobileno }, { projection: { _id: 0, employeename: 1, employeecode: 1, preferredlanguagecode: { $ifNull: ['$preferredlanguagecode', varconstant.defaultlanguagecode] } } }).toArray(function (err, employeeres) //find if a value exists
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([{$match: { "mobileno": "9965551058" }}, { $project: { _id: 0, employeename: 1, employeecode: 1, preferredlanguagecode: { $ifNull: ['$preferredlanguagecode', 2] } } }]).toArray(function (err, employeeres) //find if a value exists
        {
            ////console.log(employeeres);
            return callback(employeeres);

        });
    }
    catch (e) { logger.error("Error in Employee Mobile Number: " + e); }
}

exports.CheckMobileNumberExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in CheckMobileNumberExists : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "mobileno": req.query.mobileno, "statuscode": varconstant.activestatus }, { projection: { _id: 0, employeename: 1 } }).toArray(function (err, employeeres) //find if a value exists
        {
            ////console.log(employeeres);
            if (employeeres != null && employeeres.length>0)
            {
                return callback(employeeres);
            }
           else
           {
            dbo.collection(MongoDB.LeadCollectionName).find({ "mobileno": req.query.mobileno, "statuscode": varconstant.activestatus }, { projection: { _id: 0, employeename: 1 } }).toArray(function (err, leadres) //find if a value exists
             {
            ////console.log(employeeres);
            return callback(leadres);
        });
           }

        });
    }
    catch (e) { logger.error("Error in CheckMobileNumberExists: " + e); }
}

exports.CheckOldMobileNoExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in CheckOldMobileNoExists : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "mobileno": req.query.oldmobileno, "statuscode": varconstant.activestatus }, { projection: { _id: 0, employeename: 1 } }).toArray(function (err, employeeres) //find if a value exists
        {
            ////console.log(employeeres);
            return callback(employeeres);

        });
    }
    catch (e) { logger.error("Error in CheckOldMobileNoExists: " + e); }
}

exports.InsertOTPDetails = function (logparams, params, callback) {
    try {
        var finalresult;
        logger.info("Log in Insert OTP Details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.OTPDetailsCollectionName).insertOne(params, function (err, result) {
            if (err) throw err;
            return callback(result.insertedCount);
        });
    }

    catch (e) { logger.error("Error in Insert OTP Details: " + e); }
}

exports.SendSMSForNewRegistration = function (logparams, mobileno, password, employeename, callback) {
    try {
        logger.info("Log in SendSMSForNewRegistration: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

        //var messagecontent="Login credentials for BestJobs :\n Username : "+mobileno+"\n Password : "+password;    
        var messagecontent = varsmsconstant.employee_admin_registration.replace(varsmsconstant.employee_replace_name, employeename).replace(
            varsmsconstant.employee_replace_username, mobileno).replace(varsmsconstant.employee_replace_pwd, password)
            .replace(varsmsconstant.replace_url, varsmsconstant.app_url);
        ////console.log(messagecontent);
        exports.SendSMS(logparams, messagecontent, mobileno, varsmsconstant.employee_reg_admin_template, function (response) {
            if (response != null) {
                return callback(response);
            }
            else {
                return callback(0);
            }
        });

    }
    catch (e) {
        logger.error("Error in SendSMSForNewRegistration : Employee" + e);
    }
    // Load the AWS SDK for Node.js
}

exports.SendCommonSMS = function (logparams, messagecontent, mobileno, templateid, callback) {
    try {
        logger.info("Log in SendCommonSMS: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //console.log(mobileno+"-"+templateid);
        exports.SendSMS(logparams, messagecontent, mobileno, templateid, function (response) {
            // console.log('response '+response)

            if (response != null) {
                return callback(response);
            }
            else {
                return callback(0);
            }
        });

    }
    catch (e) {
        logger.error("Error in SendCommonSMS : Employer" + e);
    }
    // Load the AWS SDK for Node.js
}

exports.SendSMS = function (logparams, messagecontent, numberlist, templateid, callback) {
    try {
        logger.info("Log in send sms: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            if (err) throw err;
            if (result != null && result.length > 0) {
                var senderId = result[0].smssenderid;
                var smsapitoken = result[0].smsapitoken;
                // console.log(messagecontent);
                // console.log('https://pay4sms.in/sendsms/?token=' + smsapitoken + '&credit=2&sender=' + senderId)
                // console.log('&message=' + messagecontent + '&number=' + numberlist + '&templateid=' + templateid);
                // console.log('&number=' + numberlist + '&templateid=' + templateid)
                https.get('https://pay4sms.in/sendsms/?token=' + smsapitoken + '&credit=2&sender=' + senderId +
                    '&message=' + messagecontent + '&number=' + numberlist + '&templateid=' + templateid, (resp) => {
                        let data = '';
                        // console.log(resp)
                        if (resp != null) {
                            // A chunk of data has been recieved.
                            resp.on('data', (chunk) => {
                                data += chunk;
                            });
                            // The whole response has been received. Print out the result.
                            resp.on('end', () => {
                                //console.log("data: " + JSON.parse(data));   
                                // logger.error("data : " + JSON.parse(data));
                                try{
                                    if (JSON.parse(data)) {
                                        return callback(JSON.parse(data));
                                    } else {
                                        return callback(0);
                                    }
                                }catch(e){
                                    // console.log('catch '+e)
                                    return callback(0);
                                }
                            });
                        } else {
                            return callback(JSON.parse([]));
                        }
                    }).on("error", (err) => {
                        logger.error("Error in Send SMS : " + err.message);
                        ////console.log("Error: " + err.message);
                    });

            }
        });

    }
    catch (e) {
        // console.log(e)
        logger.error("Error in Send SMS : " + e);
    }
    // Load the AWS SDK for Node.js
}

exports.GetSMSCount = function (logparams, callback) {
    try {
        logger.info("Log in get sms count: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            if (err) throw err;
            if (result != null && result.length > 0) {
                var smsapitoken = result[0].smsapitoken;
                https.get('https://pay4sms.in/Credit-Balance/?token=' + smsapitoken + '&credit=2', (resp) => {
                    let data = '';

                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });

                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        return callback(JSON.parse(data));
                    });

                }).on("error", (err) => {
                    logger.error("Error in Send SMS : " + err.message);
                    ////console.log("Error: " + err.message);
                });

            }
        });

    }
    catch (e) {
        logger.error("Error in GetSMSCount : " + e);
    }
    // Load the AWS SDK for Node.js
}