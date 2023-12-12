'use strict';
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
const objsendsms = require('../process/send_sms_process_controller')
const varsmsconstant = require('../../config/sms_constants');
var admin = require('firebase-admin');

//var serviceAccount = require("../services/best-jobs-b4686-4731340ec0c1.json");
var serviceAccount = require("../services/bestjobs-c03c7-04f456dd2918.json");
const job_post = '##POST##';
const name = '##NAME##';
exports.PushNotification = function (notificationObj) {

    const dbo = MongoDB.getDB();
    dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
        if (err) throw err;
        ////console.log("push",notificationObj);
        if (result != null && result.length > 0) {
            var AWS = require('aws-sdk');

            AWS.config.update({
                accessKeyId: result[0].accessKeyId,
                secretAccessKey: result[0].secretAccessKey,
                region: "us-east-1"
            });
            // token id
            const sns = new AWS.SNS();
            var endpointArn = notificationObj.endpointarn;
            ////console.log(endpointArn);
            //logger.error("SendNewsEventsNotification::  "+endpointArn);
            var payload = {
                "GCM": "{ \"notification\": { \"title\": \"" + notificationObj.notificationmessage + "\" },\"data\":{\"notificationtypeid\":" + notificationObj.notificationtypeid + ",\"notificationtypecode\":" + notificationObj.notificationtypecode + "} }"
            }
            // first have to stringify the inner APNS object...
            // payload.APNS = JSON.stringify(payload.APNS);
            // then have to stringify the entire message payload
            payload = JSON.stringify(payload);

            ////console.log(payload);
            sns.publish({
                Message: payload,
                MessageStructure: 'json',
                TargetArn: endpointArn
            }, function (err, data) {
                if (err) {
                    ////console.log(err.stack);
                    logger.error("Log in PushNotification: UserId: " + notificationObj.usercode + ", endpointArn: " + endpointArn + ", Error: " + err.stack);
                    return;
                }
                //logger.error("push sent  ");
                ////console.log('push sent');
                ////console.log(data);
            });
        }
    });
}

exports.FirebaseEmployeePushNotification = function (notificationObj) {
    ////console.log("4",notificationObj);
    console.log(notificationObj.devicetoken,'notificationObj.devicetoken')

    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://bestjobs-c03c7-default-rtdb.firebaseio.com/"
            
        });
    }

    var ans = Array.isArray(notificationObj.devicetoken)
    if(ans ==  true)
        var registrationToken = notificationObj.devicetoken;
    else
        var registrationToken = [notificationObj.devicetoken];
    // ////console.log("employee",registrationToken);
    // //"GCM": "{ \"notification\": { \"title\": \""+notificationObj.notificationmessage+"\" },
    // //\"data\":{\"notificationtypeid\":"+ notificationObj.notificationtypeid +",
    // //\"notificationtypecode\":"+ notificationObj.notificationtypecode +"} }"
    var body = '';
    if (notificationObj.isshowreviewpopup && notificationObj.isshowreviewpopup != null && notificationObj.isshowreviewpopup != undefined && notificationObj.isshowreviewpopup != '') {
        body = notificationObj.notificationtypeid + "~" + notificationObj.notificationtypecode + "~" + notificationObj.notificationsubtypecode + "~" + notificationObj.notificationsubtypeid + "~" + notificationObj.isshowreviewpopup;
    } else {
        body = notificationObj.notificationtypeid + "~" + notificationObj.notificationtypecode + "~" + notificationObj.notificationsubtypecode + "~" + notificationObj.notificationsubtypeid;
    }
    console.log(notificationObj,'notificationObj')
    var payload = {

        "data": {
            "title": notificationObj.notificationtitle,
            "body": body,
           // "sound": "txtmsg.mp3",
          //  "android_channel_id": "notificationchannel",
            "icon": "ic_launcher"//,
          
        },
        "notification": {
            "title": notificationObj.notificationtitle,
            "body": notificationObj.notificationmessage,
          //  "sound": "txtmsg.mp3",
          //  "android_channel_id": "notificationchannel",
          //  "icon": "ic_launcher"///,
         

        },
        tokens: registrationToken  };

    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };


    // const registrationTokens = [
    //     'YOUR_REGISTRATION_TOKEN_1',
    //     // …
    //     'YOUR_REGISTRATION_TOKEN_N',
    //   ];
      
    //   const message = {
    //     data: {score: '850', time: '2:45'},
    //     tokens: registrationTokens,
    //   };
      
      admin.messaging().sendMulticast(payload)
        .then((response) => {
            console.log(response,'response');
          if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(registrationToken[idx]);
              }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
          }
        });
      
    // admin.messaging().sendToDevice(registrationToken, payload, options)
    //     .then(function (response) {
    //         // //console.log("Employee",response);
    //         // //console.log("Employee",registrationToken.length);
    //         // //console.log("Employee - Successfully sent message:", response.failureCount);
    //     })
    //     .catch(function (error) {
    //         // //console.log("Employee",error);
    //         // //console.log("Employee - Error sending message:", error);
    //     });
}

exports.FirebaseEmployerPushNotification = function (notificationObj) {
console.log(notificationObj,'notificationObj')
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://bestjobs-c03c7-default-rtdb.firebaseio.com/"
        });
    }

    var ans = Array.isArray(notificationObj.devicetoken)
    if(ans ==  true)
        var registrationToken = notificationObj.devicetoken;
    else
        var registrationToken = [notificationObj.devicetoken];
    //"GCM": "{ \"notification\": { \"title\": \""+notificationObj.notificationmessage+"\" },\"data\":{\"notificationtypeid\":"+ notificationObj.notificationtypeid +",\"notificationtypecode\":"+ notificationObj.notificationtypecode +"} }"
    var payload = {

        "data": {
            "title": notificationObj.notificationtitle,
            "body": body,
           // "sound": "txtmsg.mp3",
          //  "android_channel_id": "notificationchannel",
            "icon": "ic_launcher"//,
          
        },
        "notification": {
            "title": notificationObj.notificationtitle,
            "body": notificationObj.notificationmessage,
          //  "sound": "txtmsg.mp3",
          //  "android_channel_id": "notificationchannel",
          //  "icon": "ic_launcher"///,
         

        },
        tokens: registrationToken  };

    var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    };

    admin.messaging().sendMulticast(payload)
    .then((response) => {
        console.log(response,'response');
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationToken[idx]);
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
      }
    });

    // admin.messaging().sendToDevice(registrationToken, payload, options)
    //     .then(function (response) {
    //         ////console.log("employer",registrationToken.length);
    //         //console.log("Employer - Successfully sent message:", response.failureCount);
    //     })
    //     .catch(function (error) {
    //         //console.log("Employer - Error sending message:", error);
    //     });
}

exports.CreateEndPointARN = function (logparams, req, callback) {
    try {
        logger.info("Log in CreateEndPointARN: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, result) {
            if (err) throw err;
            if (result != null && result.length > 0) {
                var accessKeyId = result[0].accessKeyId;
                var secretAccessKey = result[0].secretAccessKey;
                var platformApplicationArn = "";
                if (Number(req.query.apptypecode) == 1)
                    platformApplicationArn = result[0].applicationarn_employee;
                else
                    platformApplicationArn = result[0].applicationarn_employer;

                var AWS = require('aws-sdk');
                AWS.config.update({
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey,
                    region: "us-east-1"
                });

                ////console.log(platformApplicationArn);
                // token id
                const sns = new AWS.SNS();
                var params = {
                    "PlatformApplicationArn": platformApplicationArn,/* required */
                    "Token": req.body.devicetoken
                };
                sns.createPlatformEndpoint(params, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    //else     //console.log(data);           // successful response
                });
                sns.createPlatformEndpoint({
                    PlatformApplicationArn: params.PlatformApplicationArn,
                    Token: params.Token
                }, function (err, data) {
                    if (err) {
                        //console.log(err.stack);
                        return;
                    }
                    var endpointArn = data.EndpointArn;
                    ////console.log(endpointArn);
                    return callback(endpointArn);
                });

            }
        });

    }
    catch (e) {
        logger.error("Error in CreateEndPointARN : " + e);
    }
}

function getNotificationTitle(languagecode, notificationtypecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "notificationtypecode": Number(notificationtypecode) };
        ////console.log(languagecode)
        dbo.collection(MongoDB.NotificationTitleCollectionName).aggregate([
            { $match: params },
            { $unwind: "$details" },
            { $match: { "details.languagecode": languagecode } },
            {
                $project: {
                    _id: 0, notificationtitle: "$details.notificationtitle", content: "$details.content"
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in getNotificationTitle " + e);
    }
}

exports.NewsEventsNotification = function (newseventrecord, matchparam, notifydetails, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        console.log(newseventrecord[0],'newseventrecord');
        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                .toArray((err, docs) => {
                    let maxId = 1;
                    if (docs.length > 0) {
                        maxId = docs[0].notificationcode + 1;
                    }
                    var notificationtitle = notifydetails[0].notificationtitle;

                    dbo.collection(MongoDB.DeviceTokenCollectionName).aggregate([
                        { "$match": matchparam },
                        {
                            $group:
                            {
                                _id: { usercode: '$usercode' },
                                devicetoken: { $addToSet: "$devicetoken" }
                            }
                        },
                        {
                            $group:
                            {
                                _id: 0, user: { $push: { usercode: '$_id.usercode', devicetoken: '$devicetoken' } }
                            }
                        },
                        { $unwind: { path: '$user', includeArrayIndex: 'rownum' } },
                        {
                            $addFields: {
                                'notificationtypeid': newseventrecord[0].newscode,
                                'createddate': currenttime,
                                'notificationtypecode': newseventrecord[0].newstypecode,
                                'notificationstatuscode': objConstants.newstatus,
                                'makerid': newseventrecord[0].makerid,
                                'viewedstatuscode': 0,
                                'notificationtitle': notificationtitle,
                                'notificationmessage': newseventrecord[0].title,
                                'apptypecode': newseventrecord[0].apptypecode,
                                'expirydate': newseventrecord[0].expirydate
                            }
                        },
                        {
                            $set: {
                                notificationcode: { $add: ["$rownum", maxId] }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                usercode: '$user.usercode',
                                devicetoken: '$user.devicetoken',
                                apptypecode: 1,
                                notificationcode: 1,
                                notificationtypecode: 1,
                                notificationtypeid: 1,
                                notificationstatuscode: 1,
                                createddate: 1,
                                makerid: 1,
                                viewedstatuscode: 1,
                                notificationtitle: 1,
                                notificationmessage: 1,
                                expirydate: 1
                            }
                        }
                    ]).toArray(function (err, result) {
                        //console.log("notifi",result);
                        if (result != null && result.length > 0) {
                            //logger.error("SendNewsEventsNotification:: 1111 ");
                            dbo.collection(MongoDB.NotificationDetailsCollectionName).insertMany(result, function (err, res) {
                                ////console.log("notifi DB",res);
                                if (res != null && res.insertedCount > 0) {
                                    exports.sendNotificationList(result, true, function (response) {
                                        if (response != null) {
                                            return callback(response);
                                        }
                                        else {
                                            return callback(0);
                                        }
                                    });
                                }
                            });
                        }

                    });

                });

        });
    }
    catch (e) {
        logger.error("Error in SendNewsEventsNotification:  " + e);
    }
}

exports.SendNewsEventsNotification = function (newseventrecord, req, callback) {
    try {
        objUtilities.getPortalLanguageDetails(req, function (languageslist) {
            ////console.log("langresponse",langresponse.length);
            ////console.log("category",newseventrecord[0].categorycode);
            if (languageslist != null && languageslist.length > 0) {
                SendNewsEventsNotificationToUser(languageslist, newseventrecord, req, function (err, notificationcount) {
                    if (err) {
                        return;
                    }
                    return callback(notificationcount);
                });
            }
        });


    }
    catch (e) { logger.error("Error in SendNewsEventsNotification" + e); }
}
var async = require('async');
function SendNewsEventsNotificationToUser(languageslist, newseventrecord, req, callback) {
    try {
        var returnval;
        var iteratorFcn = function (language, done) {
            ////console.log(language);
            if (language == null) {
                done();
                return;
            }

            exports.SendNewsEventsNotification_User(language.languagecode, newseventrecord, req, function (response) {
                returnval = response;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(languageslist, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in SendNewsEventsNotificationToUser" + e); }
}

exports.SendNewsEventsNotification_User = function (languagecode, newseventrecord, req, callback) {
    try {

        var matchparam = {};

        if (newseventrecord[0].categorycode == 2 || newseventrecord[0].categorycode == 0) {
            objUtilities.FindAllActiveEmployee(languagecode, function (employeedetails) {
                ////console.log("employeedetails",employeedetails.length);
                if (employeedetails != null && employeedetails.length > 0) {

                    var tempempcode = [];
                    var defNewsEvents = [];
                    var langNewsEvent = [];
                    var content = "";
                    for (var j = 0; j <= employeedetails.length - 1; j++) {
                        tempempcode.push(employeedetails[j].employeecode);
                    }
                    if (newseventrecord != null && newseventrecord.length > 0) {
                        for (var n = 0; n <= newseventrecord.length - 1; n++) {
                            ////console.log(newseventrecord[n]);
                            if (newseventrecord[n].languagecode == languagecode) {
                                langNewsEvent.push(newseventrecord[n]);
                                content = newseventrecord[n].title;
                                //console.log("langNewsEvent",langNewsEvent);
                                break;
                            }
                            if (newseventrecord[n].languagecode == objConstants.defaultlanguagecode) {
                                defNewsEvents.push(newseventrecord[n]);
                                content = newseventrecord[n].title;
                                //console.log("defNewsEvents",defNewsEvents);
                            }
                        }
                    }
                    if (langNewsEvent == null || langNewsEvent.length == 0) {
                        langNewsEvent = defNewsEvents;
                    }

                    if (langNewsEvent != null && langNewsEvent.length > 0) {
                        var newstypecode;
                        if (langNewsEvent[0].newstypecode == objConstants.newstypecode)
                            newstypecode = 1;
                        else
                            newstypecode = 2;
                        langNewsEvent[0].apptypecode = 1;
                        getNotificationTitle(languagecode, newstypecode, function (notifylist) {
                            ////console.log("employeedetails",notifylist.length);
                            if (notifylist != null && notifylist.length > 0) {
                                                               
                                matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 1 } }, { "usercode": { $in: tempempcode } }] };
                                exports.NewsEventsNotification(langNewsEvent, matchparam, notifylist, function (notifylist) {
                                });
                            }
                        });
                    }
                }
            });
        }
        else if (newseventrecord[0].categorycode == 1 || newseventrecord[0].categorycode == 0) {
            objUtilities.FindAllActiveEmployer(languagecode, function (employeedetails) {
             
                if (employeedetails != null && employeedetails.length > 0) {
                    var tempempcode = [];
                    var defNewsEvents = [];
                    var langNewsEvent = [];
                    var content = "";
                    for (var j = 0; j <= employeedetails.length - 1; j++) {
                        tempempcode.push(employeedetails[j].employercode);
                        // if(employeedetails[j].employeecode  != undefined)
                        // console.log(employeedetails[j].employeecode,'employeecode')
                    }
                    
                    if (newseventrecord != null && newseventrecord.length > 0) {
                        for (var n = 0; n <= newseventrecord.length - 1; n++) {
                            if (newseventrecord[n].languagecode == languagecode) {
                                langNewsEvent.push(newseventrecord[n]);
                                content = newseventrecord[n].title;
                                break;
                            }
                            if (newseventrecord[n].languagecode == objConstants.defaultlanguagecode) {
                                defNewsEvents.push(newseventrecord[n]);
                                content = newseventrecord[n].title;
                            }
                        }
                    }
                    ////console.log("langNewsEvent",langNewsEvent);
                    if (langNewsEvent == null || langNewsEvent.length == 0) {
                        langNewsEvent = defNewsEvents;
                    }
                    if (langNewsEvent != null && langNewsEvent.length > 0) {
                        var newstypecode;
                        if (langNewsEvent[0].newstypecode == objConstants.newstypecode)
                            newstypecode = 1;
                        else
                            newstypecode = 2;
                    langNewsEvent[0].apptypecode = 2;
                        getNotificationTitle(languagecode, newstypecode, function (notifylist) {
                            ////console.log("notifylist",notifylist);
                            if (notifylist != null && notifylist.length > 0) {
                                matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 2 } }, { "usercode": { $in: tempempcode } }] };
                                exports.NewsEventsNotification(langNewsEvent, matchparam, notifylist, function (notifylist) {
                                });
                            }
                        });
                    }
                }
            });
        }

    }
    catch (e) {
        logger.error("Error in SendNewsEventsNotification:  " + e);
    }
}

exports.SendGNJobPostNotification = function (gnjobrecord, req, callback) {
    try {
        objUtilities.getPortalLanguageDetails(req, function (languageslist) {
            if (languageslist != null && languageslist.length > 0) {
                SendGNJobPostNotificationToEmployee(languageslist, gnjobrecord, req, function (err, notificationcount) {
                    if (err) {
                        return;
                    }
                    return callback(notificationcount);
                });
            }
        });


    }
    catch (e) { logger.error("Error in SendGNJobPostNotification" + e); }
}
var async = require('async');
function SendGNJobPostNotificationToEmployee(languageslist, gnjobrecord, req, callback) {
    try {
        var returnval;
        var iteratorFcn = function (language, done) {
            ////console.log(language);
            if (language == null) {
                done();
                return;
            }

            exports.SendGNJobPostNotification_Employee(language.languagecode, gnjobrecord, req, function (response) {
                returnval = response;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(languageslist, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in SendGNJobPostNotificationToEmployee" + e); }
}

exports.SendGNJobPostNotification_Employee = function (languagecode, gnjobrecord, req, callback) {
    try {

        var matchparam = {};

        objUtilities.FindAllActiveEmployee(languagecode, function (employeedetails) {
            if (employeedetails != null && employeedetails.length > 0) {
                var tempempcode = [];
                var defGNPost = [];
                var langGNPost = [];
                var content = "";
                for (var j = 0; j <= employeedetails.length - 1; j++) {
                    tempempcode.push(employeedetails[j].employeecode);
                }
                ////console.log("tempempcode",tempempcode)
                if (gnjobrecord != null && gnjobrecord.length > 0) {
                    for (var n = 0; n <= gnjobrecord.length - 1; n++) {
                        ////console.log("gnjobrecord",gnjobrecord[n])
                        if (gnjobrecord[n].languagecode == languagecode) {
                            langGNPost.push(gnjobrecord[n]);
                            content = gnjobrecord[n].title;
                            break;
                        }
                        else if (gnjobrecord[n].languagecode == objConstants.defaultlanguagecode) {
                            defGNPost.push(gnjobrecord[n]);
                            content = gnjobrecord[n].title;
                        }
                    }
                }
                if (langGNPost == null || langGNPost.length == 0) {
                    langGNPost = defGNPost;
                }
                ////console.log("langGNPost",langGNPost);
                if (langGNPost != null && langGNPost.length > 0) {
                    getNotificationTitle(languagecode, 3, function (notifylist) {
                        if (notifylist != null && notifylist.length > 0) {
                            matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 1 } }, { "usercode": { $in: tempempcode } }] };
                            const dbo = MongoDB.getDB();
                            var notificationtypecode = langGNPost[0].governmenttypecode == 1 ? 10 : 9;
                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                                    .toArray((err, docs) => {
                                        let maxId = 1;
                                        if (docs.length > 0) {
                                            maxId = docs[0].notificationcode + 1;
                                        }
                                        dbo.collection(MongoDB.DeviceTokenCollectionName).aggregate([
                                            { "$match": matchparam },
                                            {
                                                $group:
                                                {
                                                    _id: { usercode: '$usercode', apptypecode: '$apptypecode' },
                                                    devicetoken: { $addToSet: "$devicetoken" }
                                                }
                                            },
                                            {
                                                $group:
                                                {
                                                    _id: 0, user: { $push: { usercode: '$_id.usercode', devicetoken: '$devicetoken', apptypecode: '$_id.apptypecode' } }
                                                }
                                            },
                                            { $unwind: { path: '$user', includeArrayIndex: 'rownum' } },
                                            {
                                                $addFields: {
                                                    'notificationtypeid': langGNPost[0].gnjobcode,
                                                    'createddate': currenttime,
                                                    'notificationtypecode': notificationtypecode,
                                                    'notificationsubtypecode': 2,
                                                    'notificationstatuscode': objConstants.newstatus,
                                                    'makerid': langGNPost[0].makerid,
                                                    'viewedstatuscode': 0,
                                                    'notificationtitle': notifylist[0].notificationtitle,
                                                    'notificationmessage': langGNPost[0].gnorganisationname + "\n" + langGNPost[0].title,
                                                    'expirydate': langGNPost[0].expirydate
                                                }
                                            },
                                            {
                                                $set: {
                                                    notificationcode: { $add: ["$rownum", maxId] }
                                                }
                                            },
                                            {
                                                $project: {
                                                    _id: 0,
                                                    usercode: '$user.usercode',
                                                    devicetoken: '$user.devicetoken',
                                                    apptypecode: '$user.apptypecode',
                                                    notificationcode: 1,
                                                    notificationtypecode: 1,
                                                    notificationsubtypecode: 2,
                                                    notificationtypeid: 1,
                                                    notificationstatuscode: 1,
                                                    createddate: 1,
                                                    makerid: 1,
                                                    viewedstatuscode: 1,
                                                    notificationtitle: 1,
                                                    notificationmessage: 1,
                                                    expirydate: 1
                                                }
                                            }
                                        ]).toArray(function (err, result) {
                                            ////console.log("1");
                                            ////console.log(result);
                                            if (result != null && result.length > 0) {
                                                dbo.collection(MongoDB.NotificationDetailsCollectionName).insertMany(result, function (err, res) {
                                                    ////console.log("2");
                                                    ////console.log(res);
                                                    if (res != null && res.insertedCount > 0) {
                                                        exports.sendNotificationList(result, true, function (response) {
                                                            if (response != null) {
                                                                return callback(response);
                                                            }
                                                            else {
                                                                return callback(0);
                                                            }
                                                        });
                                                    }
                                                });
                                            }

                                        });

                                    });

                            });
                        }
                    });
                }
            }
        });

    }
    catch (e) {
        logger.error("Error in SendGNJobPostNotification_Employee:  " + e);
    }
}

exports.SendAppliedNotification = function (logparams, req, jobdetails, employeedetails, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        ////console.log(newseventrecord);
        const dbo = MongoDB.getDB();
        objUtilities.FindEmployerPreferredlanguagecode(req.query.employercode, function (employerdetails) {
            objUtilities.getEmployerName(req.query.employercode, function (employerinfo) {
                if (employerdetails != null && employerdetails.length > 0) {
                    var languagecode = employerdetails[0].preferredlanguagecode;
                    getNotificationTitle(languagecode, 4, function (notifylist) {
                        if (notifylist != null && notifylist.length > 0) {
                            var notificationtitle = notifylist[0].notificationtitle;
                            var content = notifylist[0].content;
                            var registeredName = employerinfo[0].registeredname;
                            var mobileno = employerinfo[0].contactinfo.mobileno;
                            var teamval = 'Team';
                            objUtilities.getcurrentmilliseconds(function (currenttime) {
                                dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                                    .toArray((err, docs) => {
                                        let maxId = 1;
                                        if (docs.length > 0) {
                                            maxId = docs[0].notificationcode + 1;
                                        }
                                        var jobTitle = "";
                                        if (jobdetails.jobrolename != null && jobdetails.jobrolename != "")
                                            jobTitle = jobdetails.jobrolename;
                                        else
                                            jobTitle = jobdetails.jobfunctionname;

                                        // jobTitle = jobTitle + ' - ' + jobdetails.jobid;
                                        jobTitle = jobTitle;
                                        content = content.replace(name, employeedetails.personalinfo.employeefullname).replace(job_post, jobTitle)
                                        var matchparam = {};
                                        matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 2 } }, { "usercode": Number(req.query.employercode) }] };
                                        // dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                                        // var makerid = String(logres["ops"][0]["_id"]);
                                        dbo.collection(MongoDB.DeviceTokenCollectionName).aggregate([
                                            { "$match": matchparam },
                                            {
                                                $group: {
                                                    _id: 1, user: { $push: { usercode: '$usercode', devicetoken: '$devicetoken', apptypecode: '$apptypecode' } }
                                                }
                                            },
                                            { $unwind: { path: '$user', includeArrayIndex: 'rownum' } },
                                            {
                                                $addFields: {
                                                    'notificationtypeid': Number(req.query.employeecode),
                                                    'notificationsubtypeid': Number(req.query.jobcode),
                                                    'createddate': currenttime,
                                                    'notificationtypecode': 3,
                                                    'notificationstatuscode': objConstants.newstatus,
                                                    'makerid': jobdetails.makerid,
                                                    'viewedstatuscode': 0,
                                                    'notificationtitle': notificationtitle,
                                                    'notificationmessage': content,
                                                    'expirydate': jobdetails.validitydate
                                                }
                                            },
                                            {
                                                $set: {
                                                    notificationcode: { $add: ["$rownum", maxId] }
                                                }
                                            },
                                            {
                                                $project: {
                                                    _id: 0,
                                                    usercode: '$user.usercode',
                                                    devicetoken: '$user.devicetoken',
                                                    apptypecode: '$user.apptypecode',
                                                    notificationcode: 1,
                                                    notificationtypecode: 1,
                                                    notificationsubtypeid: 1,
                                                    notificationtypeid: 1,
                                                    notificationstatuscode: 1,
                                                    createddate: 1,
                                                    makerid: 1,
                                                    viewedstatuscode: 1,
                                                    notificationmessage: 1,
                                                    notificationtitle: 1,
                                                    expirydate: 1
                                                }
                                            }
                                        ]).toArray(function (err, result) {
                                            ////console.log(result);
                                            if (result != null && result.length > 0) {
                                                //logger.error("SendNewsEventsNotification:: 1111 ");
                                                dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result[0], function (err, res) {
                                                    ////console.log(res);
                                                    if (res != null && res.insertedCount > 0) {
                                                        exports.sendNotificationList(result, true, function (response) {
                                                            if (response != null) {
                                                                return callback(response);
                                                            }
                                                            else {
                                                                return callback(0);
                                                            }
                                                        });
                                                    }
                                                });
                                            }

                                        });

                                        objsendsms.GetSMSCount(logparams, function (smscount) {
                                            if (smscount != null && smscount.length > 1) {
                                                if (Number(smscount[1] > 0)) {
                                                    var messagecontent = varsmsconstant.employee_applied.replace(varsmsconstant.employee_replace_name, employeedetails.personalinfo.employeefullname).replace(
                                                        varsmsconstant.job_post, jobTitle).replace(varsmsconstant.employer, registeredName).replace(varsmsconstant.team,teamval);
                                                    objsendsms.SendCommonSMS(logparams, messagecontent, mobileno, varsmsconstant.employee_applied_template, function (smsresponse) {
                                                    });
                                                }
                                            }
                                        });
                                        //});


                                    });

                            });//
                        }
                    });
                }
            });
        });

    }
    catch (e) {
        logger.error("Error in Applied Notification:  " + e);
    }
}

exports.SendInvitationAcceptedNotification = function (logparams, req, jobdetails, employeedetails, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        ////console.log(newseventrecord);
        const dbo = MongoDB.getDB();
        objUtilities.FindEmployerPreferredlanguagecode(req.query.employercode, function (employerdetails) {
            if (employerdetails != null && employerdetails.length > 0) {
                var languagecode = employerdetails[0].preferredlanguagecode;
                getNotificationTitle(languagecode, 5, function (notifylist) {
                    if (notifylist != null && notifylist.length > 0) {
                        var notificationtitle = notifylist[0].notificationtitle;
                        var content = notifylist[0].content;
                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                            dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                                .toArray((err, docs) => {
                                    let maxId = 1;
                                    if (docs.length > 0) {
                                        maxId = docs[0].notificationcode + 1;
                                    }
                                    var jobTitle = "";
                                    ////console.log(jobdetails);
                                    if (jobdetails.jobrolename != null && jobdetails.jobrolename != "")
                                        jobTitle = jobdetails.jobrolename;
                                    else
                                        jobTitle = jobdetails.jobfunctionname;

                                    jobTitle = jobTitle + ' - ' + jobdetails.jobid;
                                    content = content.replace(name, employeedetails.personalinfo.employeefullname).replace(job_post, jobTitle)
                                    var matchparam = {};
                                    matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 2 } }, { "usercode": Number(req.query.employercode) }] };
                                    //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                                    //var makerid = String(logres["ops"][0]["_id"]);
                                    dbo.collection(MongoDB.DeviceTokenCollectionName).aggregate([
                                        { "$match": matchparam },
                                        {
                                            $group: {
                                                _id: 1, user: { $push: { usercode: '$usercode', devicetoken: '$devicetoken', apptypecode: '$apptypecode' } }
                                            }
                                        },
                                        { $unwind: { path: '$user', includeArrayIndex: 'rownum' } },
                                        {
                                            $addFields: {
                                                'notificationtypeid': Number(req.query.employeecode),
                                                'notificationsubtypeid': Number(req.query.jobcode),
                                                'createddate': currenttime,
                                                'notificationtypecode': 3,
                                                'notificationstatuscode': objConstants.newstatus,
                                                'makerid': jobdetails.makerid,
                                                'viewedstatuscode': 0,
                                                'notificationtitle': notificationtitle,
                                                'notificationmessage': content,
                                                'expirydate': jobdetails.validitydate,
                                                'isshowreviewpopup': 1,
                                            }
                                        },
                                        {
                                            $set: {
                                                notificationcode: { $add: ["$rownum", maxId] }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 0,
                                                usercode: '$user.usercode',
                                                devicetoken: '$user.devicetoken',
                                                apptypecode: '$user.apptypecode',
                                                notificationcode: 1,
                                                notificationsubtypeid: 1,
                                                notificationtypecode: 1,
                                                notificationtypeid: 1,
                                                notificationstatuscode: 1,
                                                createddate: 1,
                                                makerid: 1,
                                                viewedstatuscode: 1,
                                                notificationmessage: 1,
                                                notificationtitle: 1,
                                                expirydate: 1,
                                                isshowreviewpopup: 1
                                            }
                                        }
                                    ]).toArray(function (err, result) {
                                        ////console.log(result);
                                        if (result != null && result.length > 0) {
                                            //logger.error("SendNewsEventsNotification:: 1111 ");
                                            dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result[0], function (err, res) {
                                                ////console.log(res);
                                                if (res != null && res.insertedCount > 0) {
                                                    exports.sendNotificationList(result, true, function (response) {
                                                        if (response != null) {
                                                            return callback(response);
                                                        }
                                                        else {
                                                            return callback(0);
                                                        }
                                                    });
                                                }
                                            });
                                        }

                                    });
                                    //});


                                });

                        });
                    }
                });
            }
        });

    }
    catch (e) {
        logger.error("Error in Invited Notification:  " + e);
    }
}

exports.SendAppliedAcceptedNotification = function (employeedetails, logparams, employercode, req, jobdetails, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        //console.log(employeedetails);
        const dbo = MongoDB.getDB();
        objUtilities.FindEmployeePreferredlanguagecode(req.query.employeecode, function (employee) {
            if (employee != null && employee.length > 0) {
                var languagecode = employee[0].preferredlanguagecode;
                getNotificationTitle(languagecode, 6, function (notifylist) {
                    if (notifylist != null && notifylist.length > 0) {
                        var notificationtitle = notifylist[0].notificationtitle;
                        var content = notifylist[0].content;
                        ////console.log(notificationtitle);
                        objUtilities.getEmployerName(employercode, function (employerdetails) {
                            if (employerdetails != null && employerdetails.length > 0) {
                                var registeredName = employerdetails[0].registeredname;
                                var jobTitle = "";
                                ////console.log(jobdetails);
                                if (jobdetails.jobrolename != null && jobdetails.jobrolename != "")
                                    jobTitle = jobdetails.jobrolename;
                                else
                                    jobTitle = jobdetails.jobfunctionname;

                                jobTitle = jobTitle + ' - ' + jobdetails.jobid;
                                content = content.replace(name, registeredName).replace(job_post, jobTitle)
                                ////console.log(content);
                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                    dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                                        .toArray((err, docs) => {
                                            let maxId = 1;
                                            if (docs.length > 0) {
                                                maxId = docs[0].notificationcode + 1;
                                            }
                                            var matchparam = {};
                                            matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 1 } }, { "usercode": Number(req.body.employeecode) }] };
                                            //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                                            // var makerid = String(logres["ops"][0]["_id"]);
                                            dbo.collection(MongoDB.DeviceTokenCollectionName).aggregate([
                                                { "$match": matchparam },
                                                {
                                                    $group:
                                                    {
                                                        _id: { usercode: '$usercode', apptypecode: '$apptypecode' },
                                                        devicetoken: { $addToSet: "$devicetoken" }
                                                    }
                                                },
                                                {
                                                    $group:
                                                    {
                                                        _id: 0, user: { $push: { usercode: '$_id.usercode', devicetoken: '$devicetoken', apptypecode: '$_id.apptypecode' } }
                                                    }
                                                },
                                                { $unwind: { path: '$user', includeArrayIndex: 'rownum' } },
                                                {
                                                    $addFields: {
                                                        'notificationtypeid': Number(req.body.jobcode),
                                                        'createddate': currenttime,
                                                        'notificationtypecode': 8,
                                                        'notificationstatuscode': objConstants.newstatus,
                                                        'makerid': jobdetails.makerid,
                                                        'viewedstatuscode': 0,
                                                        'notificationtitle': notificationtitle,
                                                        'notificationmessage': content,
                                                        'expirydate': jobdetails.validitydate,
                                                        'isshowreviewpopup': 1,
                                                    }
                                                },
                                                {
                                                    $set: {
                                                        notificationcode: { $add: ["$rownum", maxId] }
                                                    }
                                                },
                                                {
                                                    $project: {
                                                        _id: 0,
                                                        usercode: '$user.usercode',
                                                        devicetoken: '$user.devicetoken',
                                                        apptypecode: '$user.apptypecode',
                                                        notificationcode: 1,
                                                        notificationtypecode: 1,
                                                        notificationtypeid: 1,
                                                        notificationstatuscode: 1,
                                                        createddate: 1,
                                                        makerid: 1,
                                                        viewedstatuscode: 1,
                                                        notificationmessage: 1,
                                                        notificationtitle: 1,
                                                        expirydate: 1,
                                                        isshowreviewpopup: 1
                                                    }
                                                }
                                            ]).toArray(function (err, result) {
                                                // //console.log("1");
                                                ////console.log("notify",result);
                                                if (result != null && result.length > 0) {
                                                    //logger.error("SendNewsEventsNotification:: 1111 ");
                                                    dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result[0], function (err, res) {
                                                        ////console.log("2");
                                                        ////console.log(res);
                                                        if (res != null && res.insertedCount > 0) {
                                                            exports.sendNotificationList(result, true, function (response) {
                                                                if (response != null) {
                                                                    return callback(response);
                                                                }
                                                                else {
                                                                    return callback(0);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }

                                                objsendsms.GetSMSCount(logparams, function (smscount) {
                                                    if (smscount != null && smscount.length > 1) {
                                                        if (Number(smscount[1] > 0)) {
                                                            var messagecontent = varsmsconstant.employee_shortlisted.replace(varsmsconstant.employee_replace_name, employeedetails.personalinfo.employeefullname).replace(
                                                                varsmsconstant.job_post, jobTitle).replace(varsmsconstant.employer, registeredName);
                                                            objsendsms.SendCommonSMS(logparams, messagecontent, employeedetails.contactinfo.mobileno, varsmsconstant.employee_shortlisted_template, function (smsresponse) {
                                                            });
                                                        }
                                                    }
                                                });

                                            });
                                            //});


                                        });

                                });
                            }

                        });
                    }
                });
            }
        });


    }
    catch (e) {
        logger.error("Error in Applied Accepted Notification:  " + e);
    }
}

exports.SendInvitedNotification = function (logparams, req, employercode, jobdetails, employeedetails, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        ////console.log(newseventrecord);
        const dbo = MongoDB.getDB();
        objUtilities.FindEmployeePreferredlanguagecode(req.query.employeecode, function (employee) {
            if (employee != null && employee.length > 0) {
                var languagecode = employee[0].preferredlanguagecode;
                getNotificationTitle(languagecode, 7, function (notifylist) {
                    if (notifylist != null && notifylist.length > 0) {
                        var notificationtitle = notifylist[0].notificationtitle;
                        var content = notifylist[0].content;
                        objUtilities.getEmployerName(employercode, function (employerdetails) {
                            if (employerdetails != null && employerdetails.length > 0) {
                                var registeredName = employerdetails[0].registeredname;
                                var jobTitle = "";
                                ////console.log(jobdetails);
                                if (jobdetails.jobrolename != null && jobdetails.jobrolename != "")
                                    jobTitle = jobdetails.jobrolename;
                                else
                                    jobTitle = jobdetails.jobfunctionname;

                                jobTitle = jobTitle + ' - ' + jobdetails.jobid;
                                content = content.replace(name, registeredName).replace(job_post, jobTitle)
                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                    dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                                        .toArray((err, docs) => {
                                            let maxId = 1;
                                            if (docs.length > 0) {
                                                maxId = docs[0].notificationcode + 1;
                                            }
                                            var matchparam = {};
                                            matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 1 } }, { "usercode": Number(req.query.employeecode) }] };
                                            //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                                            //  var makerid = String(logres["ops"][0]["_id"]);
                                            dbo.collection(MongoDB.DeviceTokenCollectionName).aggregate([
                                                { "$match": matchparam },
                                                {
                                                    $group: {
                                                        _id: 1, user: { $push: { usercode: '$usercode', devicetoken: '$devicetoken', apptypecode: '$apptypecode' } }
                                                    }
                                                },
                                                { $unwind: { path: '$user', includeArrayIndex: 'rownum' } },
                                                {
                                                    $addFields: {
                                                        'notificationtypeid': Number(jobdetails.jobcode),
                                                        'createddate': currenttime,
                                                        'notificationtypecode': 8,
                                                        'notificationstatuscode': objConstants.newstatus,
                                                        'makerid': jobdetails.makerid,
                                                        'viewedstatuscode': 0,
                                                        'notificationtitle': notificationtitle,
                                                        'notificationmessage': content,
                                                        'expirydate': jobdetails.validitydate
                                                    }
                                                },
                                                {
                                                    $set: {
                                                        notificationcode: { $add: ["$rownum", maxId] }
                                                    }
                                                },
                                                {
                                                    $project: {
                                                        _id: 0,
                                                        usercode: '$user.usercode',
                                                        devicetoken: '$user.devicetoken',
                                                        apptypecode: '$user.apptypecode',
                                                        notificationcode: 1,
                                                        notificationtypecode: 1,
                                                        notificationtypeid: 1,
                                                        notificationstatuscode: 1,
                                                        createddate: 1,
                                                        makerid: 1,
                                                        viewedstatuscode: 1,
                                                        notificationmessage: 1,
                                                        notificationtitle: 1,
                                                        expirydate: 1
                                                    }
                                                }
                                            ]).toArray(function (err, result) {
                                                ////console.log(result);
                                                if (result != null && result.length > 0) {
                                                    //logger.error("SendNewsEventsNotification:: 1111 ");
                                                    dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result[0], function (err, res) {
                                                        ////console.log(res);
                                                        if (res != null && res.insertedCount > 0) {
                                                            exports.sendNotificationList(result, true, function (response) {
                                                                if (response != null) {
                                                                    return callback(response);
                                                                }
                                                                else {
                                                                    return callback(0);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }

                                            });
                                            objsendsms.GetSMSCount(logparams, function (smscount) {
                                                if (smscount != null && smscount.length > 1) {
                                                    if (Number(smscount[1] > 0)) {
                                                        var messagecontent = varsmsconstant.employer_invited.replace(varsmsconstant.employee_replace_name, employeedetails.personalinfo.employeefullname).replace(
                                                            varsmsconstant.job_post, jobTitle).replace(varsmsconstant.employer, registeredName);
                                                        objsendsms.SendCommonSMS(logparams, messagecontent, employeedetails.contactinfo.mobileno, varsmsconstant.employer_invited_template, function (smsresponse) {
                                                        });
                                                    }
                                                }
                                            });

                                            //});


                                        });

                                });
                            }
                        });
                    }
                });
            }
        });


    }
    catch (e) {
        logger.error("Error in Invitation Accepted Notification:  " + e);
    }
}

exports.SendNewPrivateJobNotification = function (logparams, employeedetails, usercode, jobdetails, makerid, req, callback) {
    try {

        SendNewPrivateJobNotificationToEmployee(employeedetails, usercode, jobdetails, makerid, req, function (err, notificationcount) {
            if (err) {
                return;
            }
            return callback(notificationcount);
        });
    }
    catch (e) { logger.error("Error in SendNewPrivateJobNotificationToEmployee" + e); }
}
function SendNewPrivateJobNotificationToEmployee(employeedetails, usercode, jobdetails, makerid, req, callback) {
    try {
        var returnval;
        console.log(employee, usercode, jobdetails, makerid, req,'employee changes')
        var iteratorFcn = function (employee, done) {
            // console.log(employee);
            if (employee == null) {
                done();
                return;
            }
            console.log('iteration')
            exports.SendNewJPrivateobNotification_Employee(employee, usercode, jobdetails, makerid, req, function (response) {
                returnval = response;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(employeedetails, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking specialization name - specialization" + e); }
}
exports.SendNewJPrivateobNotification_Employee = function (employeecode, employercode, jobdetails, makerid, req, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        // //console.log("employeecode",employeecode);
        console.log(employeecode,'employeecode')
        const dbo = MongoDB.getDB();
        objUtilities.FindEmployeePreferredlanguagecode(employeecode, function (employee) {
            if (employee != null && employee.length > 0) {
                var languagecode = employee[0].preferredlanguagecode;
                ////console.log("languagecode",languagecode);
                getNotificationTitle(languagecode, 9, function (notifylist) {
                    if (notifylist != null && notifylist.length > 0) {
                        // console.log("notifylist",notifylist);
                        var notificationtitle = notifylist[0].notificationtitle;
                        var content = notifylist[0].content;
                        // objUtilities.getEmployerName(employercode, function (employerdetails) {
                        //     if (employerdetails != null && employerdetails.length > 0) {
                        var registeredName = jobdetails.contactdetails.companyname;
                        var jobTitle = "";
                        ////console.log(jobdetails);
                        if (jobdetails.jobrolename != null && jobdetails.jobrolename != "")
                            jobTitle = jobdetails.jobrolename;
                        else
                            jobTitle = jobdetails.jobfunctionname;
                        content = content.replace(name, registeredName).replace(job_post, jobTitle)
                        ////console.log("content",content);
                        objUtilities.getcurrentmilliseconds(function (currenttime) {
                            dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                                .toArray((err, docs) => {
                                    let maxId = 1;
                                    if (docs.length > 0) {
                                        maxId = docs[0].notificationcode + 1;
                                    }
                                    ////console.log("maxId",maxId);
                                    var matchparam = {};

                                    matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 1 } }, { "usercode": employeecode }] };
                                    //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                                    // var makerid = String(logres["ops"][0]["_id"]);
                                    //});
                                    // console.log("matchparam",matchparam);
                                    dbo.collection(MongoDB.DeviceTokenCollectionName).aggregate([
                                        { "$match": matchparam },
                                        {
                                            $group:
                                            {
                                                _id: { usercode: '$usercode', apptypecode: '$apptypecode' },
                                                devicetoken: { $addToSet: "$devicetoken" }
                                            }
                                        },
                                        {
                                            $group:
                                            {
                                                _id: 0, user: { $push: { usercode: '$_id.usercode', devicetoken: '$devicetoken', apptypecode: '$_id.apptypecode' } }
                                            }
                                        },
                                        { $unwind: { path: '$user', includeArrayIndex: 'rownum' } },
                                        {
                                            $addFields: {
                                                'notificationtypeid': Number(req.query.jobcode),
                                                'createddate': currenttime,
                                                'notificationtypecode': 11,
                                                'notificationsubtypecode': 4,
                                                'notificationstatuscode': objConstants.newstatus,
                                                'makerid': makerid,
                                                'viewedstatuscode': 0,
                                                'notificationtitle': notificationtitle,
                                                'notificationmessage': content,
                                                'expirydate': jobdetails.validitydate
                                            }
                                        },
                                        {
                                            $set: {
                                                notificationcode: { $add: ["$rownum", maxId] }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 0,
                                                usercode: '$user.usercode',
                                                devicetoken: '$user.devicetoken',
                                                apptypecode: '$user.apptypecode',
                                                notificationcode: 1,
                                                notificationtypecode: 1,
                                                notificationtypeid: 1,
                                                notificationstatuscode: 1,
                                                notificationsubtypecode: 4,
                                                createddate: 1,
                                                makerid: 1,
                                                viewedstatuscode: 1,
                                                notificationtitle: 1,
                                                notificationmessage: 1,
                                                expirydate: 1
                                            }
                                        }
                                    ]).toArray(function (err, result) {
                                        // console.log("notifi",result);
                                        if (result != null && result.length > 0) {
                                            //logger.error("SendNewsEventsNotification:: 1111 ");
                                            dbo.collection(MongoDB.NotificationDetailsCollectionName).insertMany(result, function (err, res) {
                                                //console.log("notifi DB",res);
                                                if (res != null && res.insertedCount > 0) {
                                                    exports.sendNotificationList(result, false, function (response) {
                                                        if (response != null) {
                                                            return callback(response);
                                                        }
                                                        else {
                                                            return callback(0);
                                                        }
                                                    });
                                                }
                                            });
                                        }

                                    });
                                    //});
                                });

                        });

                    }
                });
            }
        });


    }
    catch (e) {
        logger.error("Error in Job Approved Notification:  " + e);
    }
}
exports.SendNewJobNotification = function (logparams, employeedetails, employercode, jobdetails, makerid, req, callback) {
    try {

        SendNewJobNotificationToEmployee(employeedetails, employercode, jobdetails, makerid, req, function (err, notificationcount) {
            if (err) {
                return;
            }
            return callback(notificationcount);
        });
    }
    catch (e) { logger.error("Error in SendNewJobNotificationToEmployee" + e); }
}


var async = require('async');
function SendNewJobNotificationToEmployee(employeedetails, employercode, jobdetails, makerid, req, callback) {
    try {
        var returnval;
        var iteratorFcn = function (employee, done) {
            ////console.log(employee);
            if (employee == null) {
                done();
                return;
            }

            exports.SendNewJobNotification_Employee(employee, employercode, jobdetails, makerid, req, function (response) {
                returnval = response;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(employeedetails, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking specialization name - specialization" + e); }
}

exports.SendNewJobNotification_Employee = function (employeecode, employercode, jobdetails, makerid, req, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        // //console.log("employeecode",employeecode);
        const dbo = MongoDB.getDB();
        objUtilities.FindEmployeePreferredlanguagecode(employeecode, function (employee) {
            if (employee != null && employee.length > 0) {
                var languagecode = employee[0].preferredlanguagecode;
                ////console.log("languagecode",languagecode);
                getNotificationTitle(languagecode, 8, function (notifylist) {
                    if (notifylist != null && notifylist.length > 0) {
                        ////console.log("notifylist",notifylist);
                        var notificationtitle = notifylist[0].notificationtitle;
                        var content = notifylist[0].content;
                        objUtilities.getEmployerName(employercode, function (employerdetails) {
                            if (employerdetails != null && employerdetails.length > 0) {
                                var registeredName = employerdetails[0].registeredname;
                                var jobTitle = "";
                                ////console.log(jobdetails);
                                if (jobdetails.jobrolename != null && jobdetails.jobrolename != "")
                                    jobTitle = jobdetails.jobrolename;
                                else
                                    jobTitle = jobdetails.jobfunctionname;
                                content = content.replace(name, registeredName).replace(job_post, jobTitle)
                                ////console.log("content",content);
                                objUtilities.getcurrentmilliseconds(function (currenttime) {
                                    dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                                        .toArray((err, docs) => {
                                            let maxId = 1;
                                            if (docs.length > 0) {
                                                maxId = docs[0].notificationcode + 1;
                                            }
                                            ////console.log("maxId",maxId);
                                            var matchparam = {};

                                            matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 1 } }, { "usercode": employeecode }] };
                                            //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                                            // var makerid = String(logres["ops"][0]["_id"]);
                                            //});
                                            // //console.log("matchparam",matchparam);
                                            dbo.collection(MongoDB.DeviceTokenCollectionName).aggregate([
                                                { "$match": matchparam },
                                                {
                                                    $group:
                                                    {
                                                        _id: { usercode: '$usercode', apptypecode: '$apptypecode' },
                                                        devicetoken: { $addToSet: "$devicetoken" }
                                                    }
                                                },
                                                {
                                                    $group:
                                                    {
                                                        _id: 0, user: { $push: { usercode: '$_id.usercode', devicetoken: '$devicetoken', apptypecode: '$_id.apptypecode' } }
                                                    }
                                                },
                                                { $unwind: { path: '$user', includeArrayIndex: 'rownum' } },
                                                {
                                                    $addFields: {
                                                        'notificationtypeid': Number(req.body.jobcode),
                                                        'createddate': currenttime,
                                                        'notificationtypecode': 8,
                                                        'notificationstatuscode': objConstants.newstatus,
                                                        'makerid': makerid,
                                                        'viewedstatuscode': 0,
                                                        'notificationtitle': notificationtitle,
                                                        'notificationmessage': content,
                                                        'expirydate': jobdetails.validitydate
                                                    }
                                                },
                                                {
                                                    $set: {
                                                        notificationcode: { $add: ["$rownum", maxId] }
                                                    }
                                                },
                                                {
                                                    $project: {
                                                        _id: 0,
                                                        usercode: '$user.usercode',
                                                        devicetoken: '$user.devicetoken',
                                                        apptypecode: '$user.apptypecode',
                                                        notificationcode: 1,
                                                        notificationtypecode: 1,
                                                        notificationtypeid: 1,
                                                        notificationstatuscode: 1,
                                                        createddate: 1,
                                                        makerid: 1,
                                                        viewedstatuscode: 1,
                                                        notificationtitle: 1,
                                                        notificationmessage: 1,
                                                        expirydate: 1
                                                    }
                                                }
                                            ]).toArray(function (err, result) {
                                                ////console.log("notifi",result);
                                                if (result != null && result.length > 0) {
                                                    //logger.error("SendNewsEventsNotification:: 1111 ");
                                                    dbo.collection(MongoDB.NotificationDetailsCollectionName).insertMany(result, function (err, res) {
                                                        ////console.log("notifi DB",res);
                                                        if (res != null && res.insertedCount > 0) {
                                                            exports.sendNotificationList(result, true, function (response) {
                                                                if (response != null) {
                                                                    return callback(response);
                                                                }
                                                                else {
                                                                    return callback(0);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }

                                            });
                                            //});
                                        });

                                });
                            }
                        });
                    }
                });
            }
        });


    }
    catch (e) {
        logger.error("Error in Job Approved Notification:  " + e);
    }
}

exports.SendContactUsForEmployeeNotification = function (logparams, employeedetails, contactresult, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        ////console.log(newseventrecord);
        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
            // var makerid = String(logres["ops"][0]["_id"]);
            // });
            dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                .toArray((err, docs) => {
                    let maxId = 1;
                    if (docs.length > 0) {
                        maxId = docs[0].notificationcode + 1;
                    }
                    /*   'notificationtypeid': req.body.jobcode,
                      'createddate':currenttime,
                      'notificationtypecode':3,
                      'notificationstatuscode':objConstants.newstatus,
                      'makerid':makerid,
                      'viewedstatuscode':0,
                      'notificationtitle':'Job',
                      'notificationmessage':'You have One New Job. Apply Now!' */
                    var result = {
                        usercode: contactresult[0].usercode,
                        devicetoken: '',
                        notificationcode: maxId,
                        notificationtypecode: 6,
                        notificationtypeid: contactresult[0].contactuscode,
                        notificationstatuscode: objConstants.newstatus,
                        createddate: currenttime,
                        makerid: contactresult[0].makerid,
                        viewedstatuscode: 0,
                        notificationtitle: 'Contact You',
                        apptypecode: 3,
                        notificationmessage: employeedetails.personalinfo.employeefullname + " contact you for " + contactresult[0].subjectname,
                        notificationdetails: {
                            contactuscode: contactresult[0].contactuscode,
                            usercode: contactresult[0].usercode,
                            apptypecode: contactresult[0].apptypecode
                        }
                    }
                    ////console.log(result);
                    if (result != null) {
                        //logger.error("SendNewsEventsNotification:: 1111 ");
                        dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result, function (err, res) {
                            ////console.log(res);
                            if (res != null && res.insertedCount > 0) {
                                /*exports.sendNotificationList(result, function (response) {
                                    if(response!=null){
                                        return callback(response);
                                    }
                                    else{
                                        return callback(0);
                                    }
                                });*/
                            }
                        });
                    }

                });
            //});

        });
    }
    catch (e) {
        logger.error("Error in Contact Us Notification:  " + e);
    }
}

exports.SendContactUsForEmployerNotification = function (logparams, employercode, contactresult, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        ////console.log(newseventrecord);
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if (employerdetails != null && employerdetails.length > 0) {
                var registeredName = employerdetails[0].registeredname;
                objUtilities.getcurrentmilliseconds(function (currenttime) {
                    //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                    // var makerid = String(logres["ops"][0]["_id"]);
                    // });
                    dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                        .toArray((err, docs) => {
                            let maxId = 1;
                            if (docs.length > 0) {
                                maxId = docs[0].notificationcode + 1;
                            }
                            /*   'notificationtypeid': req.body.jobcode,
                              'createddate':currenttime,
                              'notificationtypecode':3,
                              'notificationstatuscode':objConstants.newstatus,
                              'makerid':makerid,
                              'viewedstatuscode':0,
                              'notificationtitle':'Job',
                              'notificationmessage':'You have One New Job. Apply Now!' */
                            var result = {
                                usercode: contactresult[0].usercode,
                                devicetoken: '',
                                notificationcode: maxId,
                                notificationtypecode: 6,
                                notificationtypeid: contactresult[0].contactuscode,
                                notificationstatuscode: objConstants.newstatus,
                                createddate: currenttime,
                                makerid: contactresult[0].makerid,
                                viewedstatuscode: 0,
                                notificationtitle: 'Contact You',
                                apptypecode: 3,
                                notificationmessage: registeredName + " contact you for " + contactresult[0].subjectname,
                                notificationdetails: {
                                    contactuscode: contactresult[0].contactuscode,
                                    usercode: contactresult[0].usercode,
                                    apptypecode: contactresult[0].apptypecode
                                }
                            }
                            ////console.log(result);
                            if (result != null) {
                                //logger.error("SendNewsEventsNotification:: 1111 ");
                                dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result, function (err, res) {
                                    ////console.log(res);
                                    if (res != null && res.insertedCount > 0) {
                                        /*exports.sendNotificationList(result, function (response) {
                                            if(response!=null){
                                                return callback(response);
                                            }
                                            else{
                                                return callback(0);
                                            }
                                        });*/
                                    }
                                });
                            }

                        });
                    //});

                });
            }
        });

    }
    catch (e) {
        logger.error("Error in Contact Us Notification:  " + e);
    }
}

exports.SendSubscriptionContactUsNotification = function (logparams, employercode, contactresult, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        ////console.log(newseventrecord);
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if (employerdetails != null && employerdetails.length > 0) {
                var registeredName = employerdetails[0].registeredname;
                objUtilities.getcurrentmilliseconds(function (currenttime) {
                    //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                    // var makerid = String(logres["ops"][0]["_id"]);
                    // });
                    dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                        .toArray((err, docs) => {
                            let maxId = 1;
                            if (docs.length > 0) {
                                maxId = docs[0].notificationcode + 1;
                            }
                            /*   'notificationtypeid': req.body.jobcode,
                              'createddate':currenttime,
                              'notificationtypecode':3,
                              'notificationstatuscode':objConstants.newstatus,
                              'makerid':makerid,
                              'viewedstatuscode':0,
                              'notificationtitle':'Job',
                              'notificationmessage':'You have One New Job. Apply Now!' */
                            var result = {
                                usercode: Number(employercode),
                                devicetoken: '',
                                notificationcode: maxId,
                                notificationtypecode: 6,
                                notificationtypeid: contactresult.contactcode,
                                notificationstatuscode: objConstants.newstatus,
                                createddate: currenttime,
                                makerid: contactresult.makerid,
                                viewedstatuscode: 0,
                                notificationtitle: 'Contact You',
                                apptypecode: 3,
                                notificationmessage: registeredName + " contact you for new job package request.",
                                notificationdetails: {
                                    contactuscode: contactresult.contactcode,
                                    usercode: Number(employercode),
                                    apptypecode: 2,
                                    noofposts: contactresult.noofposts,
                                    noofprofile: contactresult.noofprofile,
                                    noofvacancies: contactresult.noofvacancies,
                                    description: contactresult.description
                                }
                            }
                            ////console.log(result);
                            if (result != null) {
                                //logger.error("SendNewsEventsNotification:: 1111 ");
                                dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result, function (err, res) {
                                    ////console.log(res);
                                    if (res != null && res.insertedCount > 0) {
                                        /*exports.sendNotificationList(result, function (response) {
                                            if(response!=null){
                                                return callback(response);
                                            }
                                            else{
                                                return callback(0);
                                            }
                                        });*/
                                    }
                                });
                            }

                        });
                    //});

                });
            }
        });

    }
    catch (e) {
        logger.error("Error in Contact Us Notification:  " + e);
    }
}

exports.SendEmployerRegistrationNotification = function (logparams, employerdetails, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");

        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
            //var makerid = String(logres["ops"][0]["_id"]);
            //});
            dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                .toArray((err, docs) => {
                    let maxId = 1;
                    if (docs.length > 0) {
                        maxId = docs[0].notificationcode + 1;
                    }
                    /*   'notificationtypeid': req.body.jobcode,
                      'createddate':currenttime,
                      'notificationtypecode':3,
                      'notificationstatuscode':objConstants.newstatus,
                      'makerid':makerid,
                      'viewedstatuscode':0,
                      'notificationtitle':'Job',
                      'notificationmessage':'You have One New Job. Apply Now!' */
                    var result = {
                        usercode: 0,
                        devicetoken: '',
                        apptypecode: 3,
                        notificationcode: maxId,
                        notificationtypecode: 5,
                        notificationtypeid: Number(employerdetails.employercode),
                        notificationstatuscode: objConstants.newstatus,
                        createddate: currenttime,
                        makerid: employerdetails.makerid,
                        viewedstatuscode: 0,
                        notificationtitle: 'Employer Registration',
                        notificationmessage: 'New registration from ' + employerdetails.registeredname + ' for approval.'
                    }
                    if (result != null) {
                        //logger.error("SendNewsEventsNotification:: 1111 ");
                        dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result, function (err, res) {
                            ////console.log(res);
                            if (res != null && res.insertedCount > 0) {
                                /*exports.sendNotificationList(result, function (response) {
                                    if(response!=null){
                                        return callback(response);
                                    }
                                    else{
                                        return callback(0);
                                    }
                                });*/
                            }
                        });
                    }

                });
            //});

        });
    }
    catch (e) {
        logger.error("Error in Employer Notification:  " + e);
    }
}

exports.SendJobApprovalNotification = function (logparams, employercode, jobdetails, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        ////console.log(newseventrecord);
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if (employerdetails != null && employerdetails.length > 0) {
                var registeredName = employerdetails[0].registeredname;
                var jobTitle = "";
                if (jobdetails.jobrolename != null && jobdetails.jobrolename != "")
                    jobTitle = jobdetails.jobrolename;
                else
                    jobTitle = jobdetails.jobfunctionname;
                objUtilities.getcurrentmilliseconds(function (currenttime) {
                    //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                    //  var makerid = String(logres["ops"][0]["_id"]);
                    //});
                    dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                        .toArray((err, docs) => {
                            let maxId = 1;
                            if (docs.length > 0) {
                                maxId = docs[0].notificationcode + 1;
                            }
                            /*   'notificationtypeid': req.body.jobcode,
                              'createddate':currenttime,
                              'notificationtypecode':3,
                              'notificationstatuscode':objConstants.newstatus,
                              'makerid':makerid,
                              'viewedstatuscode':0,
                              'notificationtitle':'Job',
                              'notificationmessage':'You have One New Job. Apply Now!' */
                            var result = {
                                usercode: 0,
                                devicetoken: '',
                                apptypecode: 3,
                                notificationcode: maxId,
                                notificationtypecode: 3,
                                notificationtypeid: jobdetails.jobcode,
                                notificationstatuscode: objConstants.newstatus,
                                createddate: currenttime,
                                makerid: jobdetails.makerid,
                                viewedstatuscode: 0,
                                notificationtitle: 'New Job Post',
                                notificationmessage: registeredName + ' has submitted new job post ' + jobTitle,
                                expirydate: jobdetails.validitydate
                            }
                            if (result != null) {
                                //logger.error("SendNewsEventsNotification:: 1111 ");
                                dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result, function (err, res) {
                                    ////console.log(res);
                                    if (res != null && res.insertedCount > 0) {
                                        /*exports.sendNotificationList(result, function (response) {
                                            if(response!=null){
                                                return callback(response);
                                            }
                                            else{
                                                return callback(0);
                                            }
                                        });*/
                                    }
                                });
                            }

                        });
                    // });

                });
            }
        });

    }
    catch (e) {
        logger.error("Error in Job Post Notification:  " + e);
    }
}

exports.SendAbuseEmployeeNotification = function (logparams, employercode, jobdetails, employeedetails, abusedetails, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        // //console.log(employercode);
        // //console.log(jobdetails);
        // //console.log(employeedetails);
        // //console.log(abusedetails);
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if (employerdetails != null && employerdetails.length > 0) {
                var registeredName = employerdetails[0].registeredname;
                var jobTitle = "";
                if (jobdetails.jobrolename != null && jobdetails.jobrolename != "")
                    jobTitle = jobdetails.jobrolename;
                else
                    jobTitle = jobdetails.jobfunctionname;

                jobTitle = jobTitle + ' - ' + jobdetails.jobid;
                objUtilities.getcurrentmilliseconds(function (currenttime) {
                    //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                    // var makerid = String(logres["ops"][0]["_id"]);
                    //});
                    dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                        .toArray((err, docs) => {
                            let maxId = 1;
                            if (docs.length > 0) {
                                maxId = docs[0].notificationcode + 1;
                            }
                            /*   'notificationtypeid': req.body.jobcode,
                              'createddate':currenttime,
                              'notificationtypecode':3,
                              'notificationstatuscode':objConstants.newstatus,
                              'makerid':makerid,
                              'viewedstatuscode':0,
                              'notificationtitle':'Job',
                              'notificationmessage':'You have One New Job. Apply Now!' */
                            var result = {
                                usercode: 0,
                                devicetoken: '',
                                apptypecode: 3,
                                notificationcode: maxId,
                                notificationtypecode: 4,
                                notificationtypeid: abusedetails.abusecode,
                                notificationstatuscode: objConstants.newstatus,
                                createddate: currenttime,
                                makerid: abusedetails.makerid,
                                viewedstatuscode: 0,
                                notificationtitle: 'Abuse Reporting',
                                notificationmessage: employeedetails.personalinfo.employeefullname + ' has reported abuse on ' + jobTitle + ' with ' + registeredName + '.',
                                notificationdetails: {
                                    abusecode: abusedetails.abusecode,
                                    employeecode: abusedetails.employeecode,
                                    employercode: abusedetails.employercode,
                                    jobcode: abusedetails.jobcode,
                                    apptypecode: abusedetails.apptypecode
                                }
                            }
                            if (result != null) {
                                //logger.error("SendNewsEventsNotification:: 1111 ");
                                dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result, function (err, res) {
                                    ////console.log(res);
                                    if (res != null && res.insertedCount > 0) {
                                        /*exports.sendNotificationList(result, function (response) {
                                            if(response!=null){
                                                return callback(response);
                                            }
                                            else{
                                                return callback(0);
                                            }
                                        });*/
                                    }
                                });
                            }

                        });
                    //});

                });
            }
        });

    }
    catch (e) {
        logger.error("Error in Abuse Notification:  " + e);
    }
}

exports.SendAbuseEmployerNotification = function (logparams, employercode, employeedetails, abusedetails, callback) {
    try {
        ////logger.error("SendNewsEventsNotification::  ");
        ////console.log(newseventrecord);
        const dbo = MongoDB.getDB();
        objUtilities.getEmployerName(employercode, function (employerdetails) {
            if (employerdetails != null && employerdetails.length > 0) {
                var registeredName = employerdetails[0].registeredname;

                objUtilities.getcurrentmilliseconds(function (currenttime) {
                    //dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                    // var makerid = String(logres["ops"][0]["_id"]);
                    //});
                    dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                        .toArray((err, docs) => {
                            let maxId = 1;
                            if (docs.length > 0) {
                                maxId = docs[0].notificationcode + 1;
                            }
                            /*   'notificationtypeid': req.body.jobcode,
                              'createddate':currenttime,
                              'notificationtypecode':3,
                              'notificationstatuscode':objConstants.newstatus,
                              'makerid':makerid,
                              'viewedstatuscode':0,
                              'notificationtitle':'Job',
                              'notificationmessage':'You have One New Job. Apply Now!' */
                            var result = {
                                usercode: 0,
                                devicetoken: '',
                                apptypecode: 3,
                                notificationcode: maxId,
                                notificationtypecode: 4,
                                notificationtypeid: abusedetails.abusecode,
                                notificationstatuscode: objConstants.newstatus,
                                createddate: currenttime,
                                makerid: abusedetails.makerid,
                                viewedstatuscode: 0,
                                notificationtitle: 'Abuse Reporting',
                                notificationmessage: registeredName + ' has reported abuse on ' + employeedetails.personalinfo.employeefullname + '.',
                                notificationdetails: {
                                    abusecode: abusedetails.abusecode,
                                    employeecode: abusedetails.employeecode,
                                    employercode: abusedetails.employercode,
                                    jobcode: abusedetails.jobcode,
                                    apptypecode: abusedetails.apptypecode
                                }
                            }
                            if (result != null) {
                                //logger.error("SendNewsEventsNotification:: 1111 ");
                                dbo.collection(MongoDB.NotificationDetailsCollectionName).insertOne(result, function (err, res) {
                                    ////console.log(res);
                                    if (res != null && res.insertedCount > 0) {
                                        /*exports.sendNotificationList(result, function (response) {
                                            if(response!=null){
                                                return callback(response);
                                            }
                                            else{
                                                return callback(0);
                                            }
                                        });*/
                                    }
                                });
                            }

                        });
                    //});

                });
            }
        });

    }
    catch (e) {
        logger.error("Error in Abuse Notification:  " + e);
    }
}

exports.sendNotificationList = function (notificationList, ischeckaccess, callback) {
    //logger.error("SendNewsEventsNotification:: 2222 ");
    sendNotification(notificationList, ischeckaccess, function (err, tokenlist) {
        ////console.log("5");
        ////console.log(tokenlist);
        if (err) {
            return;
        }
        ////console.log(tokenlist)
        //return callback(notificationcount);
    });
}
var async = require('async');
const { response } = require('express');
function sendNotification(notificationListObj, isaccessneeded, callback) {
    try {
        var finalresult = [];
        console.log(notificationListObj);
        var iteratorFcn = function (notificationObj, done) {
            //console.log("notificationObj",notificationObj);
            if (notificationObj.devicetoken != null && notificationObj.devicetoken != "") {
                //logger.error("SendNewsEventsNotification:: 3333 ");
                if (isaccessneeded) {
                  
                    // exports.FirebaseEmployeePushNotification(notificationObj, function () {
                    //     // done();
                    //     // return;
                    // });
                    exports.CheckForPushNotification(notificationObj, function (result) {
                        ////console.log("3");
                        ////console.log(result);
                        ////console.log(notificationObj.devicetoken);
                        ////console.log("result",result);
                        //logger.error("SendNewsEventsNotification:: 444 ");
                        ////console.log(result);
                        if (result != null && result > 0) {
                            //logger.error("CheckForPushNotification - Mapping" + result);
                            // if( notificationObj.apptypecode == 1 ){
                            //     exports.FirebaseEmployeePushNotification(notificationObj,function(){                                
                            //         // done();
                            //         // return;
                            //     });   
                            // }
                            // else{
                            //     exports.FirebaseEmployerPushNotification(notificationObj,function(){
                            //         // done();
                            //         // return;
                            //     });   
                            // }
                            exports.FirebaseEmployeePushNotification(notificationObj, function () {
                                // done();
                                // return;
                            });

                            //  finalresult.push(notificationObj.devicetoken);
                            //  ////console.log(finalresult);
                            //  done();
                            // return;
                        }
                    });
                }
                else {
                    console.log(notificationListObj,'else');

                    exports.FirebaseEmployeePushNotification(notificationObj, function () {
                        // done();
                        // return;
                    });
                }
            }
        }
        var doneIteratingFcn = function (err) {
            // //console.log(finalresult)
            callback(err, finalresult);

        };
        async.forEach(notificationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) {
        logger.error("Error in sendNotification" + e);
    }
}

exports.CheckForPushNotification = function (notificationObj, callback) {
    try {
        // console.log(notificationObj,'CheckForPushNotification')
        //logger.info("Log in CheckForPushNotification: UserId: " + notificationObj.usercode + ", Originator: Push Notification");
        const dbo = MongoDB.getDB();
        if (notificationObj.apptypecode == 1) {
            dbo.collection(MongoDB.notificationCollectionName).find({ $and: [{ "employeecode": notificationObj.usercode }, { "notificationtypecode": notificationObj.notificationtypecode }, { "notificationtypestatus": objConstants.defaultstatuscode }] }).count(function (err, employeecount) //find if a value exists
            {
                ////console.log(employeecount);
                return callback(employeecount);

            });
        }
        else {
            console.log(notificationObj.usercode,'notificationObj.usercode')
            dbo.collection(MongoDB.EmployerNotificationCollectionName).find({ $and: [{ "employercode": notificationObj.usercode }, { "notificationtypecode": notificationObj.notificationtypecode }, { "notificationtypestatus": objConstants.defaultstatuscode }] }).count(function (err, employercount) //find if a value exists
            {
                ////console.log(employercount);
                return callback(employercount);

            });
        }

    }
    catch (e) {
        logger.error("Error in CheckForPushNotification : " + e);
    }
}

exports.SendPushNotification = function (notificationrecord, employeelist, callback) {
    try {
        // console.log("notificationrecord",notificationrecord.length)
        // console.log("employeelist",employeelist.length)
        objUtilities.getPortalLanguageDetails(notificationrecord, function (languageslist) {
            if (languageslist != null && languageslist.length > 0) {
                SendPushNotificationToEmployee(languageslist, notificationrecord, employeelist, function (err, notificationcount) {
                    if (err) {
                        return;
                    }
                    return callback(notificationcount);
                });
            }
        });


    }
    catch (e) { logger.error("Error in SendGNJobPostNotification" + e); }
}
var async = require('async');
function SendPushNotificationToEmployee(languageslist, notificationrecord, employeelist, callback) {
    try {
        var returnval;
        var iteratorFcn = function (language, done) {
            //console.log(language);
            if (language == null) {
                done();
                return;
            }

            exports.SendPushNotification_Employee(language.languagecode, notificationrecord, employeelist, function (response) {
                returnval = response;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(languageslist, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in SendGNJobPostNotificationToEmployee" + e); }
}

exports.SendPushNotification_Employee = function (languagecode, notificationrecord, employeedetails, callback) {
    try {

        var matchparam = {};

        if (employeedetails != null && employeedetails.length > 0) {
            var tempempcode = [];
            var defPN = [];
            var langPN = [];
            var content = "";
            for (var j = 0; j <= employeedetails.length - 1; j++) {
                tempempcode.push(employeedetails[j].employeecode);
            }
            ////console.log("tempempcode",tempempcode)
            if (notificationrecord != null && notificationrecord.length > 0) {
                for (var n = 0; n <= notificationrecord.length - 1; n++) {
                    //console.log("notificationrecord",notificationrecord[n])
                    if (notificationrecord[n].languagecode == languagecode) {
                        langPN.push(notificationrecord[n]);
                        content = notificationrecord[n].title;
                        break;
                    }
                    else if (notificationrecord[n].languagecode == objConstants.defaultlanguagecode) {
                        defPN.push(notificationrecord[n]);
                        content = notificationrecord[n].title;
                    }
                }
            }
            if (langPN == null || langPN.length == 0) {
                langPN = defPN;
            }
            //console.log("langPN",langPN);
            if (langPN != null && langPN.length > 0) {
                getNotificationTitle(languagecode, 3, function (notifylist) {
                    matchparam = { $and: [{ "statuscode": objConstants.activestatus }, { "apptypecode": { $eq: 1 } }, { "usercode": { $in: tempempcode } }] };
                    const dbo = MongoDB.getDB();
                    var notificationtypecode = 12;
                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                        dbo.collection(MongoDB.NotificationDetailsCollectionName).find().sort([['notificationcode', -1]]).limit(1)
                            .toArray((err, docs) => {
                                let maxId = 1;
                                if (docs.length > 0) {
                                    maxId = docs[0].notificationcode + 1;
                                }
                                dbo.collection(MongoDB.DeviceTokenCollectionName).aggregate([
                                    { "$match": matchparam },
                                    {
                                        $group:
                                        {
                                            _id: { usercode: '$usercode', apptypecode: '$apptypecode' },
                                            devicetoken: { $addToSet: "$devicetoken" }
                                        }
                                    },
                                    {
                                        $group:
                                        {
                                            _id: 0, user: { $push: { usercode: '$_id.usercode', devicetoken: '$devicetoken', apptypecode: '$_id.apptypecode' } }
                                        }
                                    },
                                    { $unwind: { path: '$user', includeArrayIndex: 'rownum' } },
                                    {
                                        $addFields: {
                                            'notificationtypeid': langPN[0].notificationcode,
                                            'createddate': currenttime,
                                            'notificationtypecode': notificationtypecode,
                                            'notificationsubtypecode': 0,
                                            'notificationstatuscode': objConstants.newstatus,
                                            'makerid': langPN[0].makerid,
                                            'viewedstatuscode': 0,
                                            'notificationtitle': langPN[0].notificationtitle,
                                            'notificationmessage': langPN[0].messagecontent
                                        }
                                    },
                                    {
                                        $set: {
                                            notificationcode: { $add: ["$rownum", maxId] }
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 0,
                                            usercode: '$user.usercode',
                                            devicetoken: '$user.devicetoken',
                                            apptypecode: '$user.apptypecode',
                                            notificationcode: 1,
                                            notificationtypecode: 1,
                                            notificationsubtypecode: 2,
                                            notificationtypeid: 1,
                                            notificationstatuscode: 1,
                                            createddate: 1,
                                            makerid: 1,
                                            viewedstatuscode: 1,
                                            notificationtitle: 1,
                                            notificationmessage: 1
                                        }
                                    }
                                ]).toArray(function (err, result) {
                                    ////console.log("1");
                                    //console.log("result 111",result.length);
                                    if (result != null && result.length > 0) {
                                        dbo.collection(MongoDB.NotificationDetailsCollectionName).insertMany(result, function (err, res) {
                                            ////console.log("2");
                                            ////console.log(res);
                                            if (res != null && res.insertedCount > 0) {
                                                exports.sendNotificationList(result, false, function (response) {
                                                    if (response != null) {
                                                        return callback(response);
                                                    }
                                                    else {
                                                        return callback(0);
                                                    }
                                                });
                                            }
                                        });
                                    }

                                });

                            });

                    });
                });
            }
        }
    }
    catch (e) {
        logger.error("Error in SendGNJobPostNotification_Employee:  " + e);
    }
}