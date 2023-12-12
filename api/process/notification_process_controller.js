'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service');
const objUtilities = require("../controller/utilities");
const logger = new Logger('logs');
exports.NewNotificationCount = function (logparams, req, callback) {
    try {
        exports.UpdateDismissStatusForExpiry(logparams, req, function (response) {
            const dbo = MongoDB.getDB();
            var finalresult;
            ////console.log(objConstants.newstatus );
            var matchparams = {};
            if(Number(req.query.apptypecode)==3){
                matchparams = { "apptypecode": Number(req.query.apptypecode), "notificationstatuscode": objConstants.newstatus };
            }
            else{
                matchparams = { "usercode": Number(req.query.usercode), "apptypecode": Number(req.query.apptypecode), "notificationstatuscode": objConstants.newstatus };
            }
            logger.info("Log in New Notification Count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
            dbo.collection(MongoDB.NotificationDetailsCollectionName).find(matchparams).count(function (err, newcount) {
                ////console.log(newcount);
                return callback(newcount);
            });
        });
        
    }
    catch (e) {
        logger.error("Error in New Nodification Count " + e);
    }
}
exports.InvitedNotificationCount = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparams = {};
        if(Number(req.query.apptypecode)==3){
            matchparams = { "apptypecode": Number(req.query.apptypecode), "notificationtypecode": objConstants.defaultNotificationjobcode, "shortlistnotificationstatus": objConstants.newstatus, "shortliststatus": objConstants.shortlistedstatus };
        }
        else{
            matchparams = { "usercode": Number(req.query.usercode), "apptypecode": Number(req.query.apptypecode), "notificationtypecode": objConstants.defaultNotificationjobcode, "shortlistnotificationstatus": objConstants.newstatus, "shortliststatus": objConstants.shortlistedstatus };
        }
        logger.info("Log in Invited Notification Count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.NotificationDetailsCollectionName).find(matchparams, { $exists: true }).count(function (err, newcount) {
            return callback(newcount)
        })
    }
    catch (e) {
        logger.error("Error in Invited Notification Count" + e);
    }
}
exports.UpdateOverallStatus = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Update Over all status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(objConstants.oldstatus);
        
        // dbo.collection(MongoDB.NotificationDetailsCollectionName).updateMany ({ "usercode":6, "apptypecode": 1,"notificationstatuscode":16}, { $set: {notificationstatuscode: 17 } },function(err,result){
        //    // //console.log(result);
           
        // });
        var matchparams = {};
        if(Number(req.query.apptypecode)==3){
            matchparams = { "apptypecode":Number(req.query.apptypecode),"notificationstatuscode":objConstants.newstatus };
        }
        else{
            matchparams = { "usercode":Number(req.query.usercode), "apptypecode":Number(req.query.apptypecode),"notificationstatuscode":objConstants.newstatus };
        }
        dbo.collection(MongoDB.NotificationDetailsCollectionName).updateMany(matchparams, { $set: {"notificationstatuscode": objConstants.oldstatus} }, function (err, result) {
            ////console.log(result.modifiedCount);
            return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
        })
    }
    catch (e) {
        logger.error("Error in Update Over all status" + e);
    }
}
exports.UpdateShortliststatus = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparams = {};
        if(Number(req.query.apptypecode)==3){
            matchparams = {  "apptypecode": Number(req.query.apptypecode), "shortliststatus": objConstants.shortlistedstatus };
        }
        else{
            matchparams = { "usercode": Number(req.query.usercode), "apptypecode": Number(req.query.apptypecode), "shortliststatus": objConstants.shortlistedstatus };
        }
        logger.info("Log in Update Shortlist status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.NotificationDetailsCollectionName).updateMany(matchparams, { $set: { "shortlistnotificationstatus": objConstants.oldstatus } }, function (err, result) {
            return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
        })
    }
    catch (e) {
        logger.error("Error in Update Shortlist status " + e);
    }
}
exports.NotificationtypeCount = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparams = {};
        if(Number(req.query.apptypecode)==3){
            matchparams = { "apptypecode": Number(req.query.apptypecode), "viewedstatuscode": objConstants.defaultviewedcode };
        }
        else{
            matchparams = { "usercode": Number(req.query.usercode), "apptypecode": Number(req.query.apptypecode), "viewedstatuscode": objConstants.defaultviewedcode };
        }
        logger.info("Log in Notificationtype count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.NotificationDetailsCollectionName).aggregate([
            { $match: matchparams },
            {
                $group: {
                    _id: { notificationtypecode: "$notificationtypecode" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0, notificationtypecode: "$_id.notificationtypecode", totalcount: "$count"
                }
            }]).toArray(function (err, result) {
               // //console.log(result);
                return callback(result);
            });
    }
    catch (e) {
        logger.error("Error in Notificationtype count " + e);
    }
}
exports.UpdateDismissStatus = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparams = {};
        if(Number(req.query.apptypecode)==3){
            matchparams = {  "apptypecode": Number(req.query.apptypecode), "notificationtypecode": {$in:req.body.notificationtypecode}, "notificationcode": Number(req.query.notificationcode) };
        }
        else{
            matchparams = { "usercode": Number(req.query.usercode), "apptypecode": Number(req.query.apptypecode), "notificationtypecode": {$in:req.body.notificationtypecode}, "notificationcode": Number(req.query.notificationcode) };
        }
        logger.info("Log in Update dismiss status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.NotificationDetailsCollectionName).updateMany(matchparams, { $set: { "notificationstatuscode": objConstants.dismissstatus,"viewedstatuscode": objConstants.viewedstatus } }, function (err, result) {
            return callback(result.result.modifiedCount==0?result.matchedCount:result.modifiedCount);
        })
    }
    catch (e) {
        logger.error("Error in Update dismiss status" + e);
    }
}

exports.UpdateDismissStatusForExpiry = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparams = {};
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            if(Number(req.query.apptypecode)==3){
                matchparams = { $and:[{ "apptypecode": Number(req.query.apptypecode)},
                {"expirydate":{ $lt: currenttime }} ]};
            }
            else{
                matchparams = { $and:[{ "usercode": Number(req.query.usercode)}, 
                {"apptypecode": Number(req.query.apptypecode) },
                {"expirydate":{ $lt: currenttime }} ]};
            }
            logger.info("Log in Update dismiss status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
            dbo.collection(MongoDB.NotificationDetailsCollectionName).updateMany(matchparams, { $set: { "notificationstatuscode": objConstants.dismissstatus,"viewedstatuscode": objConstants.viewedstatus } }, function (err, result) {
                return callback(result.result.modifiedCount==0?result.matchedCount:result.modifiedCount);
            });
        });
        
    }
    catch (e) {
        logger.error("Error in Update dismiss status" + e);
    }
}
exports.UpdateViewedNotificationStatus = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparams = {};
        if(Number(req.query.apptypecode)==3){
            matchparams = { "apptypecode": Number(req.query.apptypecode), "notificationtypecode": {$in:req.body.notificationtypecode}, "notificationcode":Number(req.query.notificationcode)};
        }
        else{
            matchparams = { "usercode":Number( req.query.usercode), "apptypecode": Number(req.query.apptypecode), "notificationtypecode": {$in:req.body.notificationtypecode}, "notificationcode":Number(req.query.notificationcode)};
        }
        logger.info("Log in Update Viewed status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.NotificationDetailsCollectionName).findOneAndUpdate(matchparams, { $set: { "viewedstatuscode": objConstants.viewedstatus } }, function (err, result) {
        //    console.log(result);
        //    console.log(err);
           return callback(result.lastErrorObject.updatedExisting);
        });
    }
    catch (e) {
        logger.error("Error in Update Viewed status" + e);
    }
}
exports.UpdateDismissAllStatus = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparams = {};
        if(Number(req.query.apptypecode)==3){
            matchparams = { "apptypecode": Number(req.query.apptypecode) };
        }
        else{
            matchparams = { "usercode": Number(req.query.usercode), "apptypecode": Number(req.query.apptypecode) };
        }
        logger.info("Log in Update dismiss all status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.NotificationDetailsCollectionName).updateMany(matchparams, { $set: { "notificationstatuscode": objConstants.dismissstatus,"viewedstatuscode": objConstants.viewedstatus } }, function (err, result) {
            return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
        })
    }
    catch (e) {
        logger.error("Error in Update dismiss all status " + e);
    }
}
exports.NodificationList = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
     ////console.log(req);
        logger.info("Log in Notification List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var params = {};
        var langparams = {};
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            if(Number(req.query.apptypecode)==3){
                langparams = {"notificationtypeinfo.notification.languagecode": objConstants.defaultlanguagecode};
                //{$or:[{"statelist.state.languagecode":{ $exists: false }},{"statelist.state.languagecode":""},{"statelist.state.languagecode":Number(params.languagecode)}]}
                if(Number(req.query.typecode)==0){
                    //params={ "apptypecode": Number(req.query.apptypecode), "expirydate": { $gte: currenttime } };
                    params={$and: [{ "apptypecode": Number(req.query.apptypecode)} ]};
                }
                else{
                    params={$and: [{ "apptypecode": Number(req.query.apptypecode)},{ "notificationtypecode": {$in:req.body.notificationtypecode}}, {"notificationstatuscode": { $ne: objConstants.dismissstatus }}  ] };
                }
                
            }
            else{
                langparams = {"notificationtypeinfo.notification.languagecode": Number(req.query.languagecode)};
                if(Number(req.query.typecode)==0){
                    params={$and: [{"usercode": Number(req.query.usercode)}, {"apptypecode": Number(req.query.apptypecode)}, {"notificationstatuscode": { $ne: objConstants.dismissstatus }} ]};
                }
                else{
                    params={$and: [{"usercode": Number(req.query.usercode)}, {"apptypecode": Number(req.query.apptypecode)}, {"notificationtypecode": {$in:req.body.notificationtypecode}}, {"notificationstatuscode": { $ne: objConstants.dismissstatus }} ]};
                }
                
            }
        });
        
        
        dbo.collection(MongoDB.NotificationDetailsCollectionName).aggregate([
            { $match: params },
            {
                "$lookup":
                {
                    "from": String(MongoDB.notificationtypeCollectionName),
                    "localField": "notificationtypecode",
                    "foreignField": "notificationtypecode",
                    "as": "notificationtypeinfo"
                }
            },
			{ $unwind: "$notificationtypeinfo" },
            { $unwind: "$notificationtypeinfo.notification" },
            {$match:langparams},
            {
                $project: {
                    _id: 0, usercode: 1, notificationcode: 1, notificationtypecode: 1, notificationsubtypecode: 1, notificationtypeid: 1,notificationsubtypeid: 1, notificationdetails:1,
                    viewedstatuscode: 1, notificationmessage: 1, employeecode : 1, notificationtime: "$createddate",notificationtypename : "$notificationtypeinfo.notificationtypename",statuscode:1,remarks:1
                }
            },
            {$sort:{notificationcode:-1}}
        ]).toArray(function (err, result) {
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) {
        logger.error("Error in Notification List" + e);
    }
}
exports.InsertDeviceDetails = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Insert Device Token details : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.DeviceTokenCollectionName).insertOne(params, function (err, result) {
            if (err) throw err;
            return callback(result.insertedCount);
        })
    }
    catch (e) {
        logger.error("Error in Insert Device Token details" + e);
    }
}
exports.DisableDevice = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Update disable Statuscode : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.DeviceTokenCollectionName).updateMany({ "usercode": Number(req.query.usercode), "apptypecode": Number(req.query.apptypecode), "deviceid": req.query.deviceid }, { $set: { "statuscode": objConstants.inactivestatus } }, function (err, result) {
            if (err) throw err;
            return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
        })
    }
    catch (e) {
        logger.error("Error in DisableDevice" + e);
    }
}
exports.DeviceTokenDisable = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Update disable Statuscode : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.DeviceTokenCollectionName).updateMany({ "usercode": Number(req.query.usercode), "apptypecode": Number(req.query.apptypecode), "deviceid": req.query.deviceid }, { $set: { "statuscode": objConstants.inactivestatus } }, function (err, result) {
            if (err) throw err;
            return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
        })
    }
    catch (e) {
        logger.error("Error in Update dismiss Statuscode" + e);
    }
}

exports.UpdatePreferredLanguage = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Update languagecode : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        if(req.query.apptypecode == 1){
            dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.usercode)}, { $set: { "preferredlanguagecode": Number(req.body.languagecode) } }, function (err, result) {
                if (err) throw err;
                return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
            })
        }
        else{
            dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.usercode)}, { $set: { "preferredlanguagecode": Number(req.body.languagecode) } }, function (err, result) {
                if (err) throw err;
                return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
            })
        }
        
    }
    catch (e) {
        logger.error("Error in Update dismiss Statuscode" + e);
    }
}


exports.UpdateRemarksstatus = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var matchparams = {};
        //if(Number(req.query.apptypecode)==3){
            matchparams = {  "apptypecode": Number(req.query.apptypecode), "notificationcode": req.body.notificationcode };
        /* }
        else{
            matchparams = { "usercode": Number(req.query.usercode), "apptypecode": Number(req.query.apptypecode), "shortliststatus": objConstants.shortlistedstatus };
        } */
        logger.info("Log in Update Remarks status : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.NotificationDetailsCollectionName).updateOne(matchparams, { $set: { "statuscode": req.body.statuscode, "remarks": req.body.remarks } }, function (err, result) {
            return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
        })
    }
    catch (e) {
        logger.error("Error in Update Remarks status " + e);
    }
}