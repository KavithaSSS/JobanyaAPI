const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const varconstant = require('../../config/constants');
const varemailconstant = require('../../config/email_constants');
const varsmsconstant = require('../../config/sms_constants');
const objsendsms = require('../process/send_sms_process_controller')
const objUtilities = require("../controller/utilities");
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const nodemailer = require("nodemailer");

exports.SendOTP = function (logparams, registeredName, adminmailid, req, callback) {
    try {
        logger.info("Log in Checking Send OTP: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.GenerateRandamNo(function (validotp) {
            var messagecontent = "";
            if (req.query.typecode == varconstant.forgetpwdtypecode) {
                messagecontent = 'We have received a request for Forgot Password.'+validotp+
                ' is your OTP for your Forgot Password Request.';
            }
            else if (req.query.typecode == varconstant.changeemailtypecode) {
                messagecontent = 'We have received a request to change the registered Email Id. '+validotp+
                ' is the OTP to change your Email Id.';                
            }
            else if (req.query.typecode == varconstant.invisiblemodetypecode) {
                messagecontent = 'We have received a request to activate your bestjob account. '+validotp+
                ' is the OTP to activate your account.';  
            }
            else if (req.query.typecode == varconstant.verify_employer_email_typecode) {
                messagecontent = 'We have received a request for registration with Jobanya. '+validotp+
                ' is the OTP to register your account.';  
            }
            //  //console.log("adminmailid",adminmailid);
            //  //console.log("registered_email",req.query.registered_email);
            dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                if (err) throw err;
                AWS.config.update({
                    accessKeyId: result[0].accessKeyId,
                    secretAccessKey: result[0].secretAccessKey,
                    region: result[0].region
                });
                const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                var params = {
                    Destination: { /* required */
                        ToAddresses: [
                            String(req.query.registered_email)
                            //'malashri@shivasoftwares.com'
                            /* more items */
                        ]
                    },
                    Message: { /* required */
                        Body: { /* required */
                            Html: {
                                Charset: "UTF-8",
                                Data: '<html>' +
                                    '<head>' +
                                    '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                    '</head>' +
                                    '<body bgcolor="white" style="display: inline-block;color:black">' +
                                    '<div style="text-align: center;padding: 20px;">' +
                                    '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                    '<label style="font-size: 18px;"><font Style="color:black;">' +
                                    'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Dear ' + registeredName + '</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    messagecontent +
                                    '</div>' +
                                    '<br>'+
                                     '<center>'+
                                     '<img style="height: 250px;" src="'+varemailconstant.forgot_password+'"/>&nbsp;&nbsp;&nbsp;' +
                                    //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                    '<br><br>' +
                                    '<label style="font-size: 12px;"><font Style="color:black;">' +
                                    'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                    '</font></label>' +                                                                                       
                                    '<br><br>' +
                                    '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                    // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                    // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                    '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                    '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                    '</center>' +
                                    '<br>' +
                                    '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                    '</p>' +
                                    '</div>' +
                                    '</center>' +
                                    '</body>' +
                                    '</html>'
                            }
                        },
                        Subject: {
                            Charset: 'UTF-8',
                            Data: 'OTP Verification'
                        }
                    },
                    Source: String(adminmailid) /* required */
                };
                // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                const sendEmail = ses.sendEmail(params).promise();
                sendEmail
                    .then(data => {
                        //console.log("email submitted to SES", data);
                        return callback(validotp);
    
                    })
                    .catch(error => {
                        logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                    });
            });                

        });

    }
    catch (e) {
        logger.error("Error in Send OTP : Employer" + e);
    }
    // Load the AWS SDK for Node.js
}
exports.CheckValidMailNameExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employer Email Id : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "registered_email":{ $regex: "^" +  req.query.registered_email + "$", $options: 'i' }}, { projection: { _id: 0, registeredname: 1 } }).toArray(function (err, employerres) //find if a value exists
        {
            ////console.log(employerres);
            return callback(employerres);

        });
    }
    catch (e) { logger.error("Error in checking Employer Email Id: " + e); }
}

exports.CheckMailNameExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employer Email Id : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "registered_email":{ $regex: "^" +  req.query.registered_email + "$", $options: 'i' }, "statuscode": varconstant.activestatus }, { projection: { _id: 0, registeredname: 1 } }).toArray(function (err, employerres) //find if a value exists
        {
            ////console.log(employerres);
            return callback(employerres);

        });
    }
    catch (e) { logger.error("Error in checking Employer Email Id: " + e); }
}

exports.CheckOldMailNameExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employer Email Id : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "registered_email": { $regex: "^" +  req.query.oldmail + "$", $options: 'i' }, "statuscode": varconstant.activestatus }, { projection: { _id: 0, registeredname: 1 } }).toArray(function (err, employerres) //find if a value exists
        {
            ////console.log(employerres);
            return callback(employerres);

        });
    }
    catch (e) { logger.error("Error in checking Employer Email Id: " + e); }
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
exports.RegistrationMail = function (logparams, registered_email, adminmailid,employercode, callback) {
    try {
        logger.info("Log in Registration Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                        '<head>' +
                                        '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                        '</head>' +
                                        '<body bgcolor="white" style="display: inline-block;color:black">' +
                                        '<div style="text-align: center;padding: 20px;">' +
                                        '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                        '<label style="font-size: 25px;"><font Style="color:black;">' +
                                        'Welcome to JOBANYA !</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Dear ' + registeredName + '</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                        '<br><br>' +
                                        '<label style="font-size: 22px;"><font Style="color:black;">' +
                                        '<a href='+ varemailconstant.Employer_portal_link+'>Login Now</a> and Set Your My Employee Preferences' +
                                        '<br><br>' +
                                        '</div>' +                                
                                        '<center>'+
                                        '<img style="height: 40px; width:200px" src="'+varemailconstant.welcome_mail+'"/>&nbsp;&nbsp;&nbsp;' +
                                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                        '<br><br>' +
                                        '<label style="font-size: 12px;"><font Style="color:black;">' +
                                        'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                        '</font></label>' +                                                                                       
                                        '<br><br>' +
                                        '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                        // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                        // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                        '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                        '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                        '</center>' +
                                        '<br>' +
                                        '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                        '</p>' +
                                        '</div>' +
                                        '</center>' +
                                        '</body>' +
                                        '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Thank you for registering with us'
                            }
                        },
                        Source: String(adminmailid)/* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
            }
        });
        

    }
    catch (e) {
        logger.error("Error in Registration Mail : Employer" + e);
    }
}
exports.EmployerApprovedMail = function (registered_email,adminmailid,employercode, logparams, callback) {
    try {
        logger.info("Log in Approved Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                        '<head>' +
                                        '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                        '</head>' +
                                        '<body bgcolor="white" style="display: inline-block;color:black">' +
                                        '<div style="text-align: center;padding: 20px;">' +
                                        '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                        '<label style="font-size: 18px;"><font Style="color:black;">' +
                                        'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Dear ' + registeredName + '</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Your JOBANYA Application has been approved.</font></label>' +
                                        '</div>' +
                                        '<br>'+
                                        '<center>'+
                                        '<img style="height: 250px;" src="'+varemailconstant.approve_employer+'"/>&nbsp;&nbsp;&nbsp;' +
                                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                        '<br><br>' +
                                        '<label style="font-size: 22px;"><font Style="color:black;">' +
                                        '<a href='+ varemailconstant.Employer_portal_link+'>Login Now</a> and Set Your Preferences' +
                                        '<br><br>' +
                                        '<label style="font-size: 12px;"><font Style="color:black;">' +
                                        'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                        '</font></label>' +                                                                                       
                                        '<br><br>' +
                                        '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                        // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                        // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                        '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                        '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                        '</center>' +
                                        '<br>' +
                                        '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                        '</p>' +
                                        '</div>' +
                                        '</center>' +
                                        '</body>' +
                                        '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Your JOBANYA Application has been approved'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});
        

    }
    catch (e) {
        logger.error("Error in Approved Mail : Employer" + e);
    }
}
exports.EmployerRejectedMail = function (registered_email, adminmailid,employercode, logparams, callback) {
    try {
        logger.info("Log in Rejected Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                        '<head>' +
                                        '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                        '</head>' +
                                        '<body bgcolor="white" style="display: inline-block;color:black">' +
                                        '<div style="text-align: center;padding: 20px;">' +
                                        '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                        '<label style="font-size: 18px;"><font Style="color:black;">' +
                                        'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Dear ' + registeredName + '</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Your JOBANYA Application has been rejected.</font></label>' +
                                        '</div>' +
                                        '<br>'+
                                        '<center>'+
                                        '<img style="height: 250px;" src="'+varemailconstant.reject_employer+'"/>&nbsp;&nbsp;&nbsp;' +
                                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                        '<br><br>' +
                                        '<label style="font-size: 12px;"><font Style="color:black;">' +
                                        'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                        '</font></label>' +                                                                                       
                                        '<br><br>' +
                                        '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                        // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                        // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                        '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                        '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                        '</center>' +
                                        '<br>' +
                                        '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                        '</p>' +
                                        '</div>' +
                                        '</center>' +
                                        '</body>' +
                                        '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Your JOBANYA Application has been rejected.'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Rejected Mail : Employer" + e);
    }
}
exports.AppliedMail = function (registered_email,employercode,logparams, adminmailid, jobdetails, employeedetails, callback) {
    try {
        logger.info("Log in Applied Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                var jobTitle = "";
                if(jobdetails.jobrolename !=null && jobdetails.jobrolename!="")
                    jobTitle = jobdetails.jobrolename;
                else
                    jobTitle = jobdetails.jobfunctionname;
                
                jobTitle = jobTitle+' - '+jobdetails.jobid;
                // //console.log(jobTitle);
                // //console.log(employeedetails);
                // //console.log(employeedetails.personalinfo.employeefullname);
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                                '<head>' +
                                                '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                                '</head>' +
                                                '<body bgcolor="white" style="display: inline-block;color:black">' +
                                                '<div style="text-align: center;padding: 20px;">' +
                                                '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                                '<label style="font-size: 18px;"><font Style="color:black;">' +
                                                'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                                '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                                'Dear ' + registeredName + '</font></label>' +
                                                '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                                'You have received an application for <b> '+jobTitle+'</b> from <b>'+employeedetails.personalinfo.employeefullname+'</b>.</font></label>' +
                                                '</div>' +
                                                '<br>'+
                                                '<center>'+
                                                '<img style="height: 250px;" src="'+varemailconstant.apply_job+'"/>&nbsp;&nbsp;&nbsp;' +
                                                //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                                '<br><br>' +
                                                '<label style="font-size: 12px;"><font Style="color:black;">' +
                                                'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                                '</font></label>' +                                                                                       
                                                '<br><br>' +
                                                '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                                '<br>' +
                                                '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                                '</p>' +
                                                '</div>' +
                                                '</center>' +
                                                '</body>' +
                                                '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'New Application received'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                         ////console.log("email submitted to SES", data);
                            return callback(data);

                        })
                        .catch(error => {
                         ////console.log(error);
                                    logger.error("Error in Verification Mail : Employer" + error);
                                    return callback(0);
                        });
                });
            }
        });
        

    }
    catch (e) {
        logger.error("Error in Applied Mail : Employer" + e);
    }
}
exports.InvitedMail = function (employeedetails,employercode, registered_email, jobdetails,adminmailid,logparams, callback) {
    try {
        logger.info("Log in Invited Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                var jobTitle = "";
                ////console.log(jobdetails);
                if(jobdetails.jobrolename !=null && jobdetails.jobrolename!="")
                    jobTitle = jobdetails.jobrolename;
                else
                    jobTitle = jobdetails.jobfunctionname;
                
                jobTitle = jobTitle+' - '+jobdetails.jobid;
                ////console.log(jobTitle);
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                                '<head>' +
                                                '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                                '</head>' +
                                                '<body bgcolor="white" style="display: inline-block;color:black">' +
                                                '<div style="text-align: center;padding: 20px;">' +
                                                '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                                '<label style="font-size: 18px;"><font Style="color:black;">' +
                                                'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                                '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                                'Dear ' + registeredName + '</font></label>' +
                                                '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                                'Your invitation to <b> '+employeedetails.personalinfo.employeefullname+'</b> for  <b>'+jobTitle+'</b> has been accepted by the employee.</font></label>' +
                                                '</div>' +
                                                '<br>'+
                                                '<center>'+
                                                '<img style="height: 250px;" src="'+varemailconstant.accept_employee+'"/>&nbsp;&nbsp;&nbsp;' +
                                                //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                                '<br><br>' +
                                                '<label style="font-size: 12px;"><font Style="color:black;">' +
                                                'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                                '</font></label>' +                                                                                       
                                                '<br><br>' +
                                                '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                                '<br>' +
                                                '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                                '</p>' +
                                                '</div>' +
                                                '</center>' +
                                                '</body>' +
                                                '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Invitation accepted'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                         //console.log("email submitted to SES", data);
                            return callback(data);

                        })
                        .catch(error => {
                         //console.log(error);
                                    logger.error("Error in Verification Mail : Employer" + error);
                                    return callback(0);
                        });

                    objsendsms.GetSMSCount(logparams,function (smscount) {
                        if(smscount!=null && smscount.length>1){
                            if(Number(smscount[1]>0)){
                                var messagecontent = varsmsconstant.employee_shortlisted.replace(varsmsconstant.employee_replace_name,employeedetails.personalinfo.employeefullname).replace(
                                    varsmsconstant.job_post,jobTitle).replace(varsmsconstant.employer,registeredName);
                                    ////console.log("messagecontent", messagecontent);
                                    objsendsms.SendCommonSMS(logparams,messagecontent,employeedetails.contactinfo.mobileno,varsmsconstant.employee_shortlisted_template,function(smsresponse){
                                });
                            }
                        }
                    });
                });
            }
        });

    }
    catch (e) {
        logger.error("Error in Invited Mail : Employer" + e);
    }
}

exports.VerificationMail = function (logparams, registered_email,adminmailid,employercode,typecode,callback) {
    try {
        logger.info("Log in Verification Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    objUtilities.encryptemployerdetails(logparams, employercode+"~"+registered_email, function (employerdetailsencrypt) {
                        var $generatepath=result[0].verification_link+"?typecode="+typecode+"&employercode="+employerdetailsencrypt;
                        var params = {
                            Destination: { /* required */
                                ToAddresses: [
                                    String(registered_email)
                                    // 'suriya@shivasoftwares.com'
                                    /* more items */
                                ]
                            },
                            Message: { /* required */
                                Body: { /* required */
                                    Html: {
                                        Charset: "UTF-8",
                                        Data: '<html>' +
                                            '<head>' +
                                            '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                            '</head>' +
                                            '<body bgcolor="white" style="display: inline-block;color:black">' +
                                            '<div style="text-align: center;padding: 20px;">' +
                                            '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                            '<label style="font-size: 18px;"><font Style="color:black;">' +
                                            'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                            '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                            'Dear ' + registeredName + '</font></label>' +
                                            '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                            'Thank you for registering with us.</font></label>' +
                                            '</div>' +
                                            '<center>' +
                                            '<div style="width: 100%;height: 100px;align-items: center;text-align:justify;justify-content: center;font-family: "Salsa",sans-serif;color:black !important">' +
                                            '<p style="text-align: center; font-size: 18px; !important">' +
                                            '<font color="black">' +
                                            'Please confirm your email address to get full access to www.jobanya.com' +
                                            '</font>' +
                                            '<br>'+
                                            '<center>'+
                                            '<div> Please click below link</div>'+
                                            '<div><a href='+ $generatepath+' target="_blank">'+ $generatepath+'</a></div>'+
                                            '<br/>'+
                                            // '<a href='+ $generatepath+' target="_blank"><img style="height: 250px;" src="'+varemailconstant.verification_mail+'"/></a>&nbsp;&nbsp;&nbsp;' +
					                        '<a href="'+$generatepath+'" target="_blank" style="border-color: #F59722!important; border-radius:8px; background: #F59722!important;color: #00141f;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px; font-weight:bold">Agree & Confirm your email</a>'+
				                            '<br><br>' +
                                            '<label style="font-size: 12px;"><font Style="color:black;">' +
                                            'You are receiving this email because you (or someone using this email) created an account on www.jobanya.com using this address.' +
                                            '</font></label>' +
                                            '<br>' +
                                            '<br><br>' +
                                            '<label style="font-size: 12px;"><font Style="color:black;">' +
                                            'Did Not Register @ JOBANYA ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                            '</font></label>' +                                                                                       
                                            '<br><br>' +
                                            '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                            '<br>' +
                                            '<center><label style="font-size: 10px;"><font Style="color:black;">Copyright &#9400; 2023 JOBANYA. All rights reserved.</font></label></center>' +
                                            '</p>' +
                                            '</div>' +
                                            '</center>' +
                                            '</body>' +
                                            '</html>'
                                    }
                                },
                                Subject: {
                                    Charset: 'UTF-8',
                                    Data: 'Verification email'
                                }
                            },
                            Source: String(adminmailid) /* required */
                        };
                        // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                        ////console.log("email submitted to SES");
                        const sendEmail = ses.sendEmail(params).promise();
                        sendEmail
                            .then(data => {
                                // console.log("email submitted to SES", data);
                                //logger.error("Data in Verification Mail : Employer" + data);
                                return callback(data);
            
                            })
                            .catch(error => {
                                // console.log("Error in Verification Mail : Employe ", error);
                                logger.error("Error in Verification Mail : Employer" + error);
                                return callback(0);
                            });
                    });
                    
                });
            }
        });
        

    }
    catch (e) {
        logger.error("Error in Registration Mail : Employer" + e);
    }
}

exports.VerificationMail_NewEmail = function (logparams, registered_email,adminmailid,employercode,typecode,callback) {
    try {
        logger.info("Log in Verification Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                var previous_mail = employerdetails[0].registered_email;
                
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    objUtilities.encryptemployerdetails(logparams, employercode+"~"+registered_email, function (employerdetailsencrypt) {
                        var $generatepath=result[0].verification_link+"?typecode="+typecode+"&employercode="+employerdetailsencrypt;
                        var params = {
                            Destination: { /* required */
                                ToAddresses: [
                                    String(registered_email)
                                    //'malashri@shivasoftwares.com'
                                    /* more items */
                                ]
                            },
                            Message: { /* required */
                                Body: { /* required */
                                    Html: {
                                        Charset: "UTF-8",
                                        Data: '<html>' +
                                            '<head>' +
                                            '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                            '</head>' +
                                            '<body bgcolor="white" style="display: inline-block;color:black">' +
                                            '<div style="text-align: center;padding: 20px;">' +
                                            '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                            '<label style="font-size: 18px;"><font Style="color:black;">' +
                                            'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                            '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                            'Dear ' + registeredName + '</font></label>' +
                                            '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                            'We have received a request to change your email address on JOBANYA.</font></label>' +
                                            '</div>' +
                                            '<div style="text-align: left;padding: 20px;">' +
                                            '<label style="font-size: 15px;"><font Style="color:black;">' +
                                            'Previous email address : '+previous_mail+'</font></label>' +
                                            '<br><br><label style="font-size: 15px;"><font Style="color:black;">' +
                                            'New email address : '+registered_email+'</font></label>' +
                                            '</div>' +
                                            '<center>' +
                                            '<div style="width: 60%;height: 100px;align-items: center;text-align:justify;justify-content: center;font-family: "Salsa",sans-serif;color:black !important">' +
                                            '<p style="text-align: justify;font-size: 18px; !important">' +
                                            '<font color="black">' +
                                            'Please confirm the change in email address by clicking the button below.' +
                                            '</font>' +
                                            '<br>'+
                                            '<a href='+ $generatepath+' target="_blank"><img style="height: 250px;" src="'+varemailconstant.verification_mail+'"/></a>&nbsp;&nbsp;&nbsp;' +
					                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
				                            '<br><br>' +
                                            '<label style="font-size: 12px;"><font Style="color:black;">' +
                                            'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                            '</font></label>' +                                                                                       
                                            '<br><br>' +
                                            '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                            '<br>' +
                                            '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                            '</p>' +
                                            '</div>' +
                                            '</center>' +
                                            '</body>' +
                                            '</html>'
                                    }
                                },
                                Subject: {
                                    Charset: 'UTF-8',
                                    Data: 'Verification email'
                                }
                            },
                            Source: String(adminmailid) /* required */
                        };
                        // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                        ////console.log("email submitted to SES");
                        const sendEmail = ses.sendEmail(params).promise();
                        sendEmail
                            .then(data => {
                                ////console.log("email submitted to SES", data);
                                //logger.error("Data in Verification Mail : Employer" + data);
                                return callback(data);
            
                            })
                            .catch(error => {
                                logger.error("Error in Verification Mail : Employer" + error);
                                return callback(0);
                            });
                    });
                    
                });
            }
        });
        

    }
    catch (e) {
        logger.error("Error in Registration Mail : Employer" + e);
    }
}

exports.JobPostSubmission = function (logparams, employercode, jobdetails, adminmailid, callback) {
    try {
        logger.info("Log in Job Post Approval : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                var jobTitle = "";
        if(jobdetails.jobrolename !=null && jobdetails.jobrolename!="")
            jobTitle = jobdetails.jobrolename;
        else
            jobTitle = jobdetails.jobfunctionname;
        
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            if (err) throw err;
            AWS.config.update({
                accessKeyId: result[0].accessKeyId,
                secretAccessKey: result[0].secretAccessKey,
                region: result[0].region
            });
            const ses = new AWS.SES({ apiVersion: "2010-12-01" });
            var params = {
                Destination: { /* required */
                    ToAddresses: [
                        String(adminmailid)
                        /* more items */
                    ]
                },
                Message: { /* required */
                    Body: { /* required */
                        Html: {
                            Charset: "UTF-8",
                            Data: '<html>' +
                                        '<head>' +
                                        '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                        '</head>' +
                                        '<body bgcolor="white" style="display: inline-block;color:black">' +
                                        '<div style="text-align: center;padding: 20px;">' +
                                        '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                        '<label style="font-size: 18px;"><font Style="color:black;">' +
                                        'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Dear ' + registeredName + '</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Your job post <b> '+jobTitle+'</b> has been successfully submitted for approval.</font></label>' +
                                        '</div>' +
                                        '<br>'+
                                        '<center>'+
                                        '<img style="height: 250px;" src="'+varemailconstant.save_jobpost+'"/>&nbsp;&nbsp;&nbsp;' +
                                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                        '<br><br>' +
                                        '<label style="font-size: 12px;"><font Style="color:black;">' +
                                        'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                        '</font></label>' +                                                                                       
                                        '<br><br>' +
                                        '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                        '<br>' +
                                        '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                        '</p>' +
                                        '</div>' +
                                        '</center>' +
                                        '</body>' +
                                        '</html>'
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: 'Job post is submitted successfully.'
                    }
                },
                Source: String(employerdetails.registered_email) /* required */
            };
            // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
            const sendEmail = ses.sendEmail(params).promise();
            sendEmail
                .then(data => {
                    ////console.log("email submitted to SES", data);
                    return callback(data);

                })
                .catch(error => {
                    ////console.log(error);
                    logger.error("Error in Verification Mail : Employer" + error);
                    return callback(0);
                });
        });
            }
        });
        

    }
    catch (e) {
        logger.error("Error in Registration Mail : Employer" + e);
    }
}

exports.JobPostApproval = function (logparams, employercode, jobdetails, adminmailid, callback) {
    try {
        logger.info("Log in Job Post Submission : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                var registered_email = employerdetails[0].registered_email;
                var jobTitle = "";
                if(jobdetails.jobrolename !=null && jobdetails.jobrolename!="")
                    jobTitle = jobdetails.jobrolename;
                else
                    jobTitle = jobdetails.jobfunctionname;
                    //console.log(jobTitle);
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    //console.log("aws keys");
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                        '<head>' +
                                        '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                        '</head>' +
                                        '<body bgcolor="white" style="display: inline-block;color:black">' +
                                        '<div style="text-align: center;padding: 20px;">' +
                                        '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                        '<label style="font-size: 18px;"><font Style="color:black;">' +
                                        'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Dear ' + registeredName + '</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Your job post <b> '+jobTitle+'</b> with <b>'+ jobdetails.jobid +'</b> is approved and live now.</font></label>' +
                                        '</div>' +
                                        '<br>'+
                                        '<center>'+
                                        '<img style="height: 250px;" src="'+varemailconstant.approve_jobpost+'"/>&nbsp;&nbsp;&nbsp;' +
                                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                        '<br><br>' +
                                        '<label style="font-size: 12px;"><font Style="color:black;">' +
                                        'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                        '</font></label>' +                                                                                       
                                        '<br><br>' +
                                        '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                        '<br>' +
                                        '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                        '</p>' +
                                        '</div>' +
                                        '</center>' +
                                        '</body>' +
                                        '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Your Job Post has been approved.'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            //console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            //console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                                return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Job Post Approval Mail : Employer" + e);
    }
}

exports.JobPostRejected = function (logparams, employercode, jobdetails, adminmailid, callback) {
    try {
        logger.info("Log in Job Post Rejected : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                var registered_email = employerdetails[0].registered_email;
                var jobTitle = "";
                if(jobdetails.jobrolename !=null && jobdetails.jobrolename!="")
                    jobTitle = jobdetails.jobrolename;
                else
                    jobTitle = jobdetails.jobfunctionname;
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                        '<head>' +
                                        '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                        '</head>' +
                                        '<body bgcolor="white" style="display: inline-block;color:black">' +
                                        '<div style="text-align: center;padding: 20px;">' +
                                        '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                        '<label style="font-size: 18px;"><font Style="color:black;">' +
                                        'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Dear ' + registeredName + '</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Your job post '+ jobTitle +' has been rejected and has not been posted.</font></label>' +
                                        '</div>' +
                                        '<br>'+
                                        '<center>'+
                                        '<img style="height: 250px;" src="'+varemailconstant.reject_jobpost+'"/>&nbsp;&nbsp;&nbsp;' +
                                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                        '<br><br>' +
                                        '<label style="font-size: 12px;"><font Style="color:black;">' +
                                        'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                        '</font></label>' +                                                                                       
                                        '<br><br>' +
                                        '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                        '<br>' +
                                        '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                        '</p>' +
                                        '</div>' +
                                        '</center>' +
                                        '</body>' +
                                        '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Your Job Post has been rejected.'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                                return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Job Post Rejected" + e);
    }
}

exports.SubscriptionSuccess = function (logparams,  employermailid, adminmailid, employercode,subscriptiondetails, callback) {
    try {
        logger.info("Log in Job Package Subscription : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(employermailid)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                        '<head>' +
                                        '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                        '</head>' +
                                        '<body bgcolor="white" style="display: inline-block;color:black">' +
                                        '<div style="text-align: center;padding: 20px;">' +
                                        '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                        '<label style="font-size: 18px;"><font Style="color:black;">' +
                                        'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Dear ' + registeredName + '</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Your subscription for '+subscriptiondetails.packagename+' of Rs.'+subscriptiondetails.price+' is Successful.</font></label>' +
                                        '<br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'The reference number is '+subscriptiondetails.razorpay_order_id+'. </font></label>' +
                                        '<br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Thank you for subscribing !</font></label>' +
                                        '</div>' +
                                        '<br>'+
                                        '<center>'+
                                        '<img style="height: 250px;" src="'+varemailconstant.success_subscription+'"/>&nbsp;&nbsp;&nbsp;' +
                                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                        '<br><br>' +
                                        '<label style="font-size: 12px;"><font Style="color:black;">' +
                                        'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                        '</font></label>' +                                                                                       
                                        '<br><br>' +
                                        '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                        '<br>' +
                                        '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                        '</p>' +
                                        '</div>' +
                                        '</center>' +
                                        '</body>' +
                                        '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Your Subscription is successful'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Job Package Subscription" + e);
    }
}

exports.SubscriptionFailure = function (logparams, employermailid, adminmailid,  employercode, subscriptiondetails,callback) {
    try {
        logger.info("Log in SubscriptionFailure : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(employermailid)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                        '<head>' +
                                        '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                        '</head>' +
                                        '<body bgcolor="white" style="display: inline-block;color:black">' +
                                        '<div style="text-align: center;padding: 20px;">' +
                                        '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                        '<label style="font-size: 18px;"><font Style="color:black;">' +
                                        'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Dear ' + registeredName + '</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Your subscription for '+subscriptiondetails.packagename+' of Rs.'+subscriptiondetails.price+' is not Successful.</font></label>' +
                                        '<br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'The reference number is '+subscriptiondetails.razorpay_order_id+'. </font></label>' +
                                        '<br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Thank you for subscribing !</font></label>' +
                                        '</div>' +
                                        '<br>'+
                                        '<center>'+
                                        '<img style="height: 250px;" src="'+varemailconstant.reject_employer+'"/>&nbsp;&nbsp;&nbsp;' +
                                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                        '<br><br>' +
                                        '<label style="font-size: 12px;"><font Style="color:black;">' +
                                        'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                        '</font></label>' +                                                                                       
                                        '<br><br>' +
                                        '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                        '<br>' +
                                        '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                        '</p>' +
                                        '</div>' +
                                        '</center>' +
                                        '</body>' +
                                        '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Your Subscription has failed'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            //console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            //console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in SubscriptionFailure" + e);
    }
}
exports.SubscriptionExpired = function (logparams, subscriptiondetails, adminmailid, employercode,  callback) {
    try {
        logger.info("Log in Job Package Expired : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(employermailid)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                        '<head>' +
                                        '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                        '</head>' +
                                        '<body bgcolor="white" style="display: inline-block;color:black">' +
                                        '<div style="text-align: center;padding: 20px;">' +
                                        '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                        '<label style="font-size: 18px;"><font Style="color:black;">' +
                                        'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Dear ' + registeredName + '</font></label>' +
                                        '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Your Subscription is about to expire shortly.</font></label>' +
                                        '<br><label style="font-size: 22px;"><font Style="color:black;">' +
                                        'Kindly renew your subscription.</font></label>' +
                                        '</div>' +
                                        '<br>'+
                                        '<center>'+
                                        '<img style="height: 250px;" src="'+varemailconstant.expiring_subscription+'"/>&nbsp;&nbsp;&nbsp;' +
                                        //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                        '<br><br>' +
                                        '<label style="font-size: 12px;"><font Style="color:black;">' +
                                        'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                        '</font></label>' +                                                                                       
                                        '<br><br>' +
                                        '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                        '<br>' +
                                        '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                        '</p>' +
                                        '</div>' +
                                        '</center>' +
                                        '</body>' +
                                        '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Job Post Approved'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Job Post Rejected" + e);
    }
}

exports.AbuseEmployee = function (tomailid,employercode,logparams, adminmailid, jobdetails, employeedetails, callback) {
    try {
        logger.info("Log in Abuse Employee : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                var jobTitle = "";
                if(jobdetails.jobrolename !=null && jobdetails.jobrolename!="")
                    jobTitle = jobdetails.jobrolename;
                else
                    jobTitle = jobdetails.jobfunctionname;
                
                jobTitle = jobTitle+' - '+jobdetails.jobid;
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(tomailid)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                    '<head>' +
                                    '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                    '</head>' +
                                    '<body bgcolor="white" style="display: inline-block;color:black">' +
                                    '<div style="text-align: center;padding: 20px;">' +
                                    '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                    '<label style="font-size: 18px;"><font Style="color:black;">' +
                                    'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Dear Admin,</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    '<b>'+employeedetails.personalinfo.employeefullname+'</b> has reported abuse on '+jobTitle+' with '+registeredName+'. Please take necessary action.</font></label>' +
                                    '</div>' +
                                    '<br>'+
                                    '<center>'+
                                    '<img style="height: 250px;" src="'+varemailconstant.abuse_employee+'"/>&nbsp;&nbsp;&nbsp;' +
                                    //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                    '<br><br>' +
                                    '<label style="font-size: 12px;"><font Style="color:black;">' +
                                    'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                    '</font></label>' +                                                                                       
                                    '<br><br>' +
                                    '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emp_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +'</center>' +
                                    '<br>' +
                                    '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                    '</p>' +
                                    '</div>' +
                                    '</center>' +
                                    '</body>' +
                                    '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Abuse reporting'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Abuse Employee" + e);
    }
}

exports.AbuseEmployer = function (tomailid,employercode,logparams, adminmailid,  employeedetails, callback) {
    try {
        logger.info("Log in Abuse Employee : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(tomailid)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                    '<head>' +
                                    '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                    '</head>' +
                                    '<body bgcolor="white" style="display: inline-block;color:black">' +
                                    '<div style="text-align: center;padding: 20px;">' +
                                    '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                    '<label style="font-size: 18px;"><font Style="color:black;">' +
                                    'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Dear Admin,</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    '<b>'+registeredName+'</b> has reported abuse on '+employeedetails.personalinfo.employeefullname+'. Please take necessary action.</font></label>' +
                                    '</div>' +
                                    '<br>'+
                                    '<center>'+
                                    '<img style="height: 250px;" src="'+varemailconstant.abuse_employer+'"/>&nbsp;&nbsp;&nbsp;' +
                                    //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                    '<br><br>' +
                                    '<label style="font-size: 12px;"><font Style="color:black;">' +
                                    'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                    '</font></label>' +                                                                                       
                                    '<br><br>' +
                                    '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                    '<br>' +
                                    '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                    '</p>' +
                                    '</div>' +
                                    '</center>' +
                                    '</body>' +
                                    '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Abuse reporting'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Abuse Employee" + e);
    }
}

exports.AbuseEmployerReply = function (employercode,logparams, adminmailid,  employeedetails, callback) {
    try {
        logger.info("Log in Abuse Employee : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(employerdetails[0].registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                    '<head>' +
                                    '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                    '</head>' +
                                    '<body bgcolor="white" style="display: inline-block;color:black">' +
                                    '<div style="text-align: center;padding: 20px;">' +
                                    '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                    '<label style="font-size: 18px;"><font Style="color:black;">' +
                                    'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Dear '+registeredName+',</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Thanks for reporting abuse on '+employeedetails.personalinfo.employeefullname+'. We will take necessary action.</font></label>' +
                                    '</div>' +
                                    '<br>'+
                                    '<center>'+
                                    '<img style="height: 250px;" src="'+varemailconstant.abuse_employer+'"/>&nbsp;&nbsp;&nbsp;' +
                                    //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                    '<br><br>' +
                                    '<label style="font-size: 12px;"><font Style="color:black;">' +
                                    'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                    '</font></label>' +                                                                                       
                                    '<br><br>' +
                                    '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                    '<br>' +
                                    '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                    '</p>' +
                                    '</div>' +
                                    '</center>' +
                                    '</body>' +
                                    '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Abuse reporting'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Abuse Employee" + e);
    }
}

exports.ContactUsEmployee = function (logparams, employeemailid, adminmailid,employeedetails, callback) {
    try {
        logger.info("Log in ContactUsEmployee : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        // console.log("adminmailid",adminmailid);
        // console.log("employeemailid",employeemailid);
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            if (err) throw err;
            AWS.config.update({
                accessKeyId: result[0].accessKeyId,
                secretAccessKey: result[0].secretAccessKey,
                region: result[0].region
            });
            const ses = new AWS.SES({ apiVersion: "2010-12-01" });
            var params = {
                Destination: { /* required */
                    ToAddresses: [
                        String(employeemailid)
                        //'malashri@shivasoftwares.com'
                        /* more items */
                    ]
                },
                Message: { /* required */
                    Body: { /* required */
                        Html: {
                            Charset: "UTF-8",
                            Data: '<html>' +
                            '<head>' +
                            '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                            '</head>' +
                            '<body bgcolor="white" style="display: inline-block;color:black">' +
                            '<div style="text-align: center;padding: 20px;">' +
                            '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                            '<label style="font-size: 18px;"><font Style="color:black;">' +
                            'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                            '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                            'Dear '+employeedetails.personalinfo.employeefullname+',</font></label>' +
                            '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                            'Thanks for your valuable feedback and remarks. We will get back to you shortly.</font></label>' +
                            '</div>' +
                            '<br>'+
                            '<center>'+
                            '<img style="height: 250px;" src="'+varemailconstant.employee_feedback+'"/>&nbsp;&nbsp;&nbsp;' +
                            //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                            '<br><br>' +
                            '<label style="font-size: 12px;"><font Style="color:black;">' +
                            'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                            '</font></label>' +                                                                                       
                            '<br><br>' +
                            '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emp_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                            '<br>' +
                            '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                            '</p>' +
                            '</div>' +
                            '</center>' +
                            '</body>' +
                            '</html>'
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: 'Thanks for your valuable feedback and remarks'
                    }
                },
                Source: String(adminmailid) /* required */
            };
            // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
            const sendEmail = ses.sendEmail(params).promise();
            sendEmail
                .then(data => {
                    ////console.log("email submitted to SES", data);
                    return callback(data);

                })
                .catch(error => {
                    ////console.log(error);
                    logger.error("Error in Verification Mail : Employer" + error);
                    return callback(0);
                });
        });

    }
    catch (e) {
        logger.error("Error in Abuse Employer" + e);
    }
}

exports.ContactUsEmployer = function (logparams, employercode, adminmailid, callback) {
    try {
        logger.info("Log in Abuse Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                //console.log(employerdetails[0].registered_email);
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(employerdetails[0].registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                    '<head>' +
                                    '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                    '</head>' +
                                    '<body bgcolor="white" style="display: inline-block;color:black">' +
                                    '<div style="text-align: center;padding: 20px;">' +
                                    '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                    '<label style="font-size: 18px;"><font Style="color:black;">' +
                                    'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Dear '+registeredName+',</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Thanks for your valuable feedback and remarks. We will get back to you shortly.</font></label>' +
                                    '</div>' +
                                    '<br>'+
                                    '<center>'+
                                    '<img style="height: 250px;" src="'+varemailconstant.employer_feedback+'"/>&nbsp;&nbsp;&nbsp;' +
                                    //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                    '<br><br>' +
                                    '<label style="font-size: 12px;"><font Style="color:black;">' +
                                    'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                    '</font></label>' +                                                                                       
                                    '<br><br>' +
                                    '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                    '<br>' +
                                    '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                    '</p>' +
                                    '</div>' +
                                    '</center>' +
                                    '</body>' +
                                    '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Thanks for your valuable feedback and remarks'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            ////console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            ////console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Contact Us Employer" + e);
    }
}

exports.SubscriptionContactusMail = function (employercode, registered_email, supportmailid, adminmailid, contactusparams,  logparams, callback) {
    try {
        logger.info("Log in Approved Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                ////console.log(registeredName);
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(adminmailid)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                    '<head>' +
                                    '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                    '</head>' +
                                    '<body bgcolor="white" style="display: inline-block;color:black">' +
                                    '<div style="text-align: center;padding: 20px;">' +
                                    '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                    '<label style="font-size: 18px;"><font Style="color:black;">' +
                                    'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Dear Admin,</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    '<b>'+registeredName+'</b> contact you for new job package request. <br><br> '+
                                    'No. of posts: ' +  contactusparams.noofposts + '<br>No. of profile: ' + contactusparams.noofprofile + '<br>No. of vacancies: ' + contactusparams.noofvacancies + '<br>Description: ' + contactusparams.description + '<br><br></font></label>' +
                                    '</div>' +
                                    '<br>'+
                                    '<center>'+
                                    '<img style="height: 250px;" src="'+varemailconstant.employer_feedback+'"/>&nbsp;&nbsp;&nbsp;' +
                                    //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                    '<br><br>' +
                                    '<label style="font-size: 12px;"><font Style="color:black;">' +
                                    'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                    '</font></label>' +                                                                                       
                                    '<br><br>' +
                                    '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                    '<br>' +
                                    '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                    '</p>' +
                                    '</div>' +
                                    '</center>' +
                                    '</body>' +
                                    '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'New job package request'
                            }
                        },
                        Source: String(supportmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            //console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            //console.log(error);
                            logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in Approved Mail : Employer" + e);
    }
}

exports.DeactivateEmployee = function (logparams, employeemailid, adminmailid,employeedetails, callback) {
    try {
        logger.info("Log in ContactUsEmployee : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            if (err) throw err;
            AWS.config.update({
                accessKeyId: result[0].accessKeyId,
                secretAccessKey: result[0].secretAccessKey,
                region: result[0].region
            });
            const ses = new AWS.SES({ apiVersion: "2010-12-01" });
            var params = {
                Destination: { /* required */
                    ToAddresses: [
                        String(employeemailid)
                        //'malashri@shivasoftwares.com'
                        /* more items */
                    ]
                },
                Message: { /* required */
                    Body: { /* required */
                        Html: {
                            Charset: "UTF-8",
                            Data: '<html>' +
                            '<head>' +
                            '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                            '</head>' +
                            '<body bgcolor="white" style="display: inline-block;color:black">' +
                            '<div style="text-align: center;padding: 20px;">' +
                            '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                            '<label style="font-size: 18px;"><font Style="color:black;">' +
                            'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                            '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                            'Dear '+employeedetails.personalinfo.employeefullname+',</font></label>' +
                            '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                            'Your account is deactivated.</font></label>' +
                            '</div>' +
                            '<br>'+
                            '<center>'+
                            '<img style="height: 250px;" src="'+varemailconstant.employee_feedback+'"/>&nbsp;&nbsp;&nbsp;' +
                            //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                            '<br><br>' +
                            '<label style="font-size: 12px;"><font Style="color:black;">' +
                            'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                            '</font></label>' +                                                                                       
                            '<br><br>' +
                            '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emp_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                            '<br>' +
                            '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                            '</p>' +
                            '</div>' +
                            '</center>' +
                            '</body>' +
                            '</html>'
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: 'Account deactivated'
                    }
                },
                Source: String(adminmailid) /* required */
            };
            // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
            const sendEmail = ses.sendEmail(params).promise();
            sendEmail
                .then(data => {
                    ////console.log("email submitted to SES", data);
                    return callback(data);

                })
                .catch(error => {
                    ////console.log(error);
                    logger.error("Error in employee deactivated Mail : Employee" + error);
                    return callback(0);
                });
        });

    }
    catch (e) {
        logger.error("Error in deactivate employee" + e);
    }
}


exports.DeactivateEmployer = function (employercode,registered_email,adminmailid, logparams, callback) {
    try {
        logger.info("Log in Approved Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if(employerdetails !=null && employerdetails.length>0){
                var registeredName = employerdetails[0].registeredname;
                ////console.log(registeredName);
                dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                    if (err) throw err;
                    AWS.config.update({
                        accessKeyId: result[0].accessKeyId,
                        secretAccessKey: result[0].secretAccessKey,
                        region: result[0].region
                    });
                    const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                    var params = {
                        Destination: { /* required */
                            ToAddresses: [
                                String(registered_email)
                                //'malashri@shivasoftwares.com'
                                /* more items */
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Html: {
                                    Charset: "UTF-8",
                                    Data: '<html>' +
                                    '<head>' +
                                    '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                    '</head>' +
                                    '<body bgcolor="white" style="display: inline-block;color:black">' +
                                    '<div style="text-align: center;padding: 20px;">' +
                                    '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                    '<label style="font-size: 18px;"><font Style="color:black;">' +
                                    'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Dear <b>'+registeredName+'</b></font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Your account is deactivated.<br><br> '+
                                    '<br><br></label>' +
                                    '</div>' +
                                    '<br>'+
                                    '<center>'+
                                    '<img style="height: 250px;" src="'+varemailconstant.employer_feedback+'"/>&nbsp;&nbsp;&nbsp;' +
                                    //'<a href="'+$generatepath+'" target="_blank" style="cursor:pointer;"><button style="border-color: #ffa500!important;background: #ffa500!important;color: white;padding: 7px 23px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;">Agree & Confirm your email</button></a>'+
                                    '<br><br>' +
                                    '<label style="font-size: 12px;"><font Style="color:black;">' +
                                    'Do you have a question ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                    '</font></label>' +                                                                                       
                                    '<br><br>' +
                                    '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                                // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                                '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                                '</center>' +
                                    '<br>' +
                                    '<center><label style="font-size: 10px;"><font Style="color:black;">&#9400; JOBANYA. All rights reserved</font></label></center>' +
                                    '</p>' +
                                    '</div>' +
                                    '</center>' +
                                    '</body>' +
                                    '</html>'
                                }
                            },
                            Subject: {
                                Charset: 'UTF-8',
                                Data: 'Account Deactivated'
                            }
                        },
                        Source: String(adminmailid) /* required */
                    };
                    // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                    const sendEmail = ses.sendEmail(params).promise();
                    sendEmail
                        .then(data => {
                            //console.log("email submitted to SES", data);
                            return callback(data);
        
                        })
                        .catch(error => {
                            //console.log(error);
                            logger.error("Error in account deactivation : Employer" + error);
                            return callback(0);
                        });
                });
			}
		});

    }
    catch (e) {
        logger.error("Error in account deactivation: Employer" + e);
    }
}

exports.EmailToEmployer = function (logparams, Subject, Content, registered_email, adminmailid, callback) {
    try {
        logger.info("Log in Registration Mail : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            if (err) throw err;
            AWS.config.update({
                accessKeyId: result[0].accessKeyId,
                secretAccessKey: result[0].secretAccessKey,
                region: result[0].region
            });
            const ses = new AWS.SES({ apiVersion: "2010-12-01" });
            var params = {
                Destination: { /* required */
                    ToAddresses: registered_email
                },
                Message: { /* required */
                    Body: { /* required */
                        Html: {
                            Charset: "UTF-8",
                            Data: '<html>' +
                                Content +
                                '</html>'
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: Subject
                    }
                },
                Source: String(adminmailid)/* required */
            };
            // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
            const sendEmail = ses.sendEmail(params).promise();
            sendEmail
                .then(data => {
                    console.log("email submitted to SES", data);
                    return callback(data);

                })
                .catch(error => {
                    console.log(error);
                    logger.error("Error in Verification Mail : Employer" + error);
                    return callback(0);
                });
        });
    }
    catch (e) {
        logger.error("Error in Registration Mail : Employer" + e);
    }
}

exports.EmployeeEmailVerificationWithOTP = function (logparams, registeredName, adminmailid, req, callback) {
    try {
        logger.info("Log in Checking Send OTP: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var AWS = require('aws-sdk');
        const dbo = MongoDB.getDB();
        objUtilities.GenerateRandamNo(function (validotp) {
           
            dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
                if (err) throw err;
                AWS.config.update({
                    accessKeyId: result[0].accessKeyId,
                    secretAccessKey: result[0].secretAccessKey,
                    region: result[0].region
                });
                const ses = new AWS.SES({ apiVersion: "2010-12-01" });
                var params = {
                    Destination: { /* required */
                        ToAddresses: [
                            String(req.query.registered_email)
                            //'malashri@shivasoftwares.com'
                            /* more items */
                        ]
                    },
                    Message: { /* required */
                        Body: { /* required */
                            Html: {
                                Charset: "UTF-8",
                                Data: '<html>' +
                                    '<head>' +
                                    '<link href="http://fonts.googleapis.com/css?family=Salsa" rel="stylesheet" type="text/css">' +
                                    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">' +
                                    '</head>' +
                                    '<body bgcolor="white" style="display: inline-block;color:black">' +
                                    '<div style="text-align: center;padding: 20px;">' +
                                    '<img src="'+varemailconstant.bestjobs_logo+'"/><br><br>' +
                                    '<label style="font-size: 18px;"><font Style="color:black;">' +
                                    'Welcome to a whole new world of Hiring ! Hire effortlessly !</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Dear ' + registeredName + '</font></label>' +
                                    '<br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    'Thank you for registering with us.</font></label>' +
                                    '</div>' +
                                    '<center>' +
                                    '<div style="width: 100%;height: 100px;align-items: center;text-align:justify;justify-content: center;font-family: "Salsa",sans-serif;color:black !important">' +
                                    '<p style="text-align: center; font-size: 18px; !important">' +
                                    '<font color="black">' +
                                    'Please confirm your email address to get full access to www.jobanya.com' +
                                    '</font>' +
                                    '<br>'+
                                    '<center>'+
                                    '<div> Please verify your email with below OTP</div>'+
                                    '<div><br><br><label style="font-size: 22px;"><font Style="color:black;">' +
                                    validotp +'</div>'+
                                    '<br/>'+
                                    // '<a href='+ $generatepath+' target="_blank"><img style="height: 250px;" src="'+varemailconstant.verification_mail+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                    '<br>' +
                                    '<label style="font-size: 12px;"><font Style="color:black;">' +
                                    'You are receiving this email because you (or someone using this email) created an account on www.jobanya.com using this address.' +
                                    '</font></label>' +
                                    '<br>' +
                                    '<br><br>' +
                                    '<label style="font-size: 12px;"><font Style="color:black;">' +
                                    'Did Not Register @ JOBANYA ? Contact <a href='+ varemailconstant.bestjobs_link+'>JOBANYA Support</a> Team' +
                                    '</font></label>' +                                                                                       
                                    '<br><br>' +
                                    '<a href='+ varemailconstant.fb_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.fb_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                        // '<a href='+ varemailconstant.insta_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.insta_logo+'"/></a> &nbsp;&nbsp;&nbsp;' +
                                        // '<a href='+ varemailconstant.linkedin_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.linkedin_logo+'"/></span></a>&nbsp;&nbsp;&nbsp;' +
                                        '<a href='+ varemailconstant.youtube_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.youtube_logo+'"/></a>&nbsp;&nbsp;&nbsp;' +
                                        '<a href='+ varemailconstant.telegram_emplr_link+' target="_blank"><img style="height: 30px;" src="'+varemailconstant.telegram_logo+'"/></a>' +
                                        '</center>' +
                                    '<br>' +
                                    '<center><label style="font-size: 10px;"><font Style="color:black;">Copyright &#9400; 2023 JOBANYA. All rights reserved.</font></label></center>' +
                                    '</p>' +
                                    '</div>' +
                                    '</center>' +
                                    '</body>' +
                                    '</html>'
                            }
                        },
                        Subject: {
                            Charset: 'UTF-8',
                            Data: 'Verification email'
                        }
                    },
                    Source: String(adminmailid) /* required */
                };
                // var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
                const sendEmail = ses.sendEmail(params).promise();
                sendEmail
                    .then(data => {
                        //console.log("email submitted to SES", data);
                        return callback(validotp);
    
                    })
                    .catch(error => {
                        ////console.log(error);
                        logger.error("Error in Verification Mail : Employer" + error);
                            return callback(0);
                    });
            });                

        });

    }
    catch (e) {
        logger.error("Error in Send OTP : Employer" + e);
    }
    // Load the AWS SDK for Node.js
}


exports.CheckEmployeeMailNameExists = function (logparams, req, callback) {
    try {
        var finalresult;
        logger.info("Log in Checking Employer Email Id : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var dbCollectionName = Number(req.query.isleadtype) == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $match: {"employeecode":Number(req.query.employeecode)} },
            {$unwind: {path:'$personalinfo',preserveNullAndEmptyArrays: true }},
            {
                $project: {
                    "_id": 0,
                    "employeefullname": '$personalinfo.employeefullname'
                }
            }
        ]).toArray(function (err, empresult) {
            //console.log(empresult);
            if (err) throw err;

            return callback(empresult[0]);
        });
        
        // dbo.collection(String(dbCollectionName)).find({ "registered_email":{ $regex: "^" +  req.query.registered_email + "$", $options: 'i' }, "statuscode": varconstant.activestatus }, { projection: { _id: 0, registeredname: 1 } }).toArray(function (err, employerres) //find if a value exists
        // {
        //     ////console.log(employerres);
        //     return callback(employerres);

        // });
    }
    catch (e) { logger.error("Error in checking Employer Email Id: " + e); }
}


exports.SendSMTPOTP = function (logparams, registeredName, adminmailid, req, callback) {
    try {
        logger.info("Log in Checking Send OTP: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var configurationSet = "ConfigSet";
        const smtpEndpoint = "smtp.zoho.com";
        const port = 587;
        const smtpUsername = "noreply@jobanya.com";
        const smtpPassword = "1kiZ59qi4FG3";
        let transporter = nodemailer.createTransport({
            host: smtpEndpoint,
            port: port,
            secure: false, // true for 465, false for other ports
            auth: {
              user: smtpUsername,
              pass: smtpPassword
            }
          });
          var subject = "Amazon SES test (Nodemailer)";
          var tag0 = "key0=value0";
          var tag1 = "key1=value1";
// The email body for recipients with non-HTML email clients.
        var body_text = 'Amazon SES Test (Nodemailer)---------------------------------This email was sent through the Amazon SES SMTP interface using Nodemailer.';
        var body_html = '<html><head></head><body><h1>Amazon SES Test (Nodemailer)</h1><p>This email was sent with <a href=https://aws.amazon.com/ses/>Amazon SES</a>using <a href=https://nodemailer.com>Nodemailer</a> for Node.js.</p></body></html>';
        const dbo = MongoDB.getDB();
        objUtilities.GenerateRandamNo(function (validotp) {
            var messagecontent = "";
            if (req.query.typecode == varconstant.forgetpwdtypecode) {
                messagecontent = 'We have received a request for Forgot Password.'+validotp+
                ' is your OTP for your Forgot Password Request.';
            }
            else if (req.query.typecode == varconstant.changeemailtypecode) {
                messagecontent = 'We have received a request to change the registered Email Id. '+validotp+
                ' is the OTP to change your Email Id.';                
            }
            else if (req.query.typecode == varconstant.invisiblemodetypecode) {
                messagecontent = 'We have received a request to activate your bestjob account. '+validotp+
                ' is the OTP to activate your account.';  
            }
            else if (req.query.typecode == varconstant.verify_employer_email_typecode) {
                messagecontent = 'We have received a request for registration with Jobanya. '+validotp+
                ' is the OTP to register your account.';  
            }
            // console.log("adminmailid",adminmailid);
            //  //console.log("registered_email",req.query.registered_email);
            dbo.collection(MongoDB.ControlsCollectionName).find().toArray(async function (err, result) {
                if (err) throw err;
                let mailOptions = {
                    from: "noreply@jobanya.com",
                    to: String(req.query.registered_email),
                    subject: subject,
                    text: body_text,
                    html: body_html,
                    // Custom headers for configuration set and message tags.
                    headers: {
                      'X-SES-CONFIGURATION-SET': configurationSet,
                      'X-SES-MESSAGE-TAGS': tag0,
                      'X-SES-MESSAGE-TAGS': tag1
                    }
                  };
                  let info = await transporter.sendMail(mailOptions)
                 
                  console.log("Message sent! Message ID: ", info.messageId);
                  return callback(validotp);
            });                

        });

    }
    catch (e) {
        console.log(e)
        // logger.error("Error in Send OTP : Employer" + e);
    }
    // Load the AWS SDK for Node.js
}