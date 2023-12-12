'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");

exports.getMaxcode = function (logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Get Max Code on Contact Us : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployerContactUsCollectionName).find().sort([['contactcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].contactcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in subscription Contact Us Getting Max Code: " + e); }
}
exports.ContactUsSave = function (logparams, params, callback) {
    try {
        logger.info("Log in Save Contactus : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerContactUsCollectionName).insertOne(params, function (err, res) {
            if (err)
                throw err;
            return callback(res.insertedCount);
        });
    }
    catch (e) { logger.error("Error in Save Contactus - subscription" + e); }
}




exports.ContactList = function (logparams, listparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Admin Contact List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

        //var empcreateddate = { $and: [{ "createddate": { $gte: req.query.fromdate } }, { "createddate": { $lte: req.query.todate } }] }
        // console.log(req.query.fromdate);
        // console.log(req.query.todate);
        var apptypecode = {}, empcreateddate = {},subjectcode={};
            empcreateddate = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
      

        //var matchparams = { $and: [empcreateddate,apptypecode,subjectcode]};
        dbo.collection(MongoDB.EmployerContactUsCollectionName).aggregate([

            { $match: empcreateddate},
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: { path: '$employerinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employerinfo.contactinfo', preserveNullAndEmptyArrays: true } },
            {
                "$project":
                {
                    "_id": 0, contactcode: 1, usercode: '$employercode', noofposts:1, noofprofile:1, noofvacancies:1, description:1, statuscode:1,createddate:1,remarks: 1, "registeredname": "$employerinfo.registeredname", "mobileno": "$employerinfo.contactinfo.mobileno", "emailid": "$employerinfo.registered_email"
                }
            }
        ]).toArray(function (err, result) {
            //console.log(result);
            return callback(result);
        });
    }
    catch (e) { logger.error("Error in Trans Contact Us List: " + e); }
}

exports.UpdateContactUs = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            logger.info("Log in Update Contact US: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
            objUtilities.InsertLog(logparams, function (validlog) {
                if (validlog != null && validlog != 0) {
                    dbo.collection(MongoDB.EmployerContactUsCollectionName).updateOne({ "contactcode": Number(req.query.contactuscode) }, { $set: { updateddate: currenttime, checkerid: validlog, remarks: req.body.remarks, statuscode: req.body.statuscode } }, function (err, result) {
                        if (err)
                            throw err;
                        // console.log(result.modifiedCount);
                        return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
                    });
                }

            });
        });
        

    }
    catch (e) {
        logger.error("Error in Update Subscription Contact Us :  " + e);
    }

}


exports.UpdateTransContactUs = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            logger.info("Log in Update Trans Contact US: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
            objUtilities.InsertLog(logparams, function (validlog) {
                if (validlog != null && validlog != 0) {
                    dbo.collection(MongoDB.TransContactsCollectionName).updateOne({ "contactuscode": Number(req.query.contactuscode)}, { $set: { updateddate: currenttime, checkerid: validlog, remarks: req.body.remarks, statuscode: req.body.statuscode } }, function (err, result) {
                        if (err)
                            throw err;
                        // console.log(result.modifiedCount);
                        return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
                    });
                }

            });
        });
        

    }
    catch (e) {
        logger.error("Error in Update Trans Contact Us :  " + e);
    }

}