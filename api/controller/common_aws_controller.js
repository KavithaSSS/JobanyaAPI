'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
//const {notvalidcode,alreadyinusecode, createcode,listcode, existcode,updatecode,deletecode, recordnotfoundcode, successresponsecode,usernotfoundcode } = require('../../config/constants');
const objConstants = require('../../config/constants');
const objAWSDetails = require('../process/common_aws_process_controller')
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
exports.AWSDetails = function (req, res) {
    try {
        var d = new Date(1605503177866),
                    month = ('' + (d.getMonth() + 1)).padStart(2, "0"),
                    day = ('' + d.getDate()).padStart(2, "0"),
                    hour = ('' + d.getMinutes()),
                    year = ('' + d.getFullYear()).substring(2,4);
                    

                    return res.status(200).json({
                        splash_json_result: {
                            month: month,
                            day: day,
                            year: year,
                            hour: hour,
                            prefix: year+month+day
                        }
                    });
        /*objUtilities.CheckValidUserOrEmployeeOrEmployer(req, function (validemp) {
            if (validemp == true) {
                var objLogdetails;
                const logvalues = { ipaddress: req.query.ipaddress, usercode: req.query.usercode, orginator: 'Splash form load', logdate: new Date(), type: 'Employee' }
                objUtilities.getLogDetails(logvalues, function (logresponse) {
                    objLogdetails = logresponse;
                });
                var logparams = objLogdetails;
                objAWSDetails.getBucketDetails(logparams, function (response) {
                    if (response != null) {
                        const msgparam = { "messagecode": objConstants.listcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                aws_json_result: {
                                    response: objConstants.successresponsecode,
                                    varstatuscode: objConstants.listcode,
                                    responsestring: msgtext,
                                    bucketlist: response
                                }
                            });

                        });
                    }
                    else {
                        const msgparam = { "messagecode": objConstants.recordnotfoundcode };
                        objUtilities.getMessageDetails(msgparam, function (msgtext) {
                            return res.status(200).json({
                                splash_json_result: {
                                    varstatuscode: objConstants.recordnotfoundcode,
                                    response: objConstants.successresponsecode,
                                    responsestring: msgtext
                                }
                            });
                        });
                    }
                });
            }
            else {
                const msgparam = { "messagecode": objConstants.usernotfoundcode };
                objUtilities.getMessageDetails(msgparam, function (msgtext) {
                    return res.status(200).json({
                        splash_json_result: {
                            varstatuscode: objConstants.usernotfoundcode,
                            response: objConstants.successresponsecode,
                            responsestring: msgtext
                        }
                    });
                });
            }
        });*/
    }
    catch (e) {
        logger.error("Error in AWSDetails: " + e);
    }
}

exports.FirebasePushNotification = function (notificationObj) {

    var admin = require("firebase-admin");

    var serviceAccount = require("");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://bestjobs-employee-c4a2c-default-rtdb.firebaseio.com/"
    });

    var registrationToken = "";

    var payload = {

        "data": {
            "title": "background check",
            "body": "background check",
            "sound": "txtmsg.mp3",
            "android_channel_id": "reminder"
        },
        "notification": {
            "title": "background check",
            "body": "background check",
            "sound": "txtmsg.mp3",
            "android_channel_id": "reminder"
        }
    };

    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };

    admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function (response) {
            //console.log("Successfully sent message:", response);
        })
        .catch(function (error) {
            //console.log("Error sending message:", error);
        });
}

exports.getLamdaUrl = async function (req, res) {
    try {
        // const decoded = await objUtilities.validateToken(req);
        // if (!decoded) {
        //   return res.status(200).json({
        //     status: 401,
        //     message: "Unauthorized",
        //   });
        // }
        objAWSDetails.callLamdaUrl({ bucketName: req.body.bucketName, fileName:req.body.fileName }, function (urlresponse) {
            if(urlresponse){ 
                return res.status(200).json({urlresponse});
                return callback(urlresponse);
            } 
            else {
                res.status(200).json({});
            }
        });
    }
    catch (e) {
        logger.error("Error in ShortList - report " + e);
    }
}