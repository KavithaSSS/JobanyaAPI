'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
exports.SubscriptionList = function (logparams, req, callback) {
    try {
        logger.info("Log in Subscription List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { $match: { "employercode": Number(req.query.employercode) } },
            {
                $lookup: {
                    from: String(MongoDB.JobPackageSubscriptionCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'subscriptioninfo'
                }
            },
            { $unwind: "$subscriptioninfo" },
            { $match: { $and: [{ "subscriptioninfo.createddate": { $gte: Number(req.query.fromdate) } }, { "subscriptioninfo.createddate": { $lte: Number(req.query.todate) } }, {"subscriptioninfo.statuscode": objConstants.activestatus}] } },
            {
                $lookup: {
                    from: String(MongoDB.JobPackageCollectionName),
                    localField: 'subscriptioninfo.packagecode',
                    foreignField: 'packagecode',
                    as: 'packageinfo'
                }
            },
            { $unwind: "$packageinfo" },
            { $unwind: "$packageinfo.package" },
            { $match: { "packageinfo.package.languagecode": objConstants.defaultlanguagecode } },

            {
                "$project": {
                    _id: 0, employercode: 1, registeredname: 1, companytypecode: 1, employertypecode: 1, industrycode: 1, registered_email: 1, contactinfo: 1, website: 1, knowabouttypecode: 1, gstn: 1, gstnurl: 1, pan: 1,
                    panurl: 1, aadhaarno: 1, aadhaarnourl: 1, documentdetails:1, facilities_offered: 1, preferences: 1, aboutcompany: 1, preferences: 1, turnoverslabcode: 1, noofemployees: 1, gallery: 1, statuscode: 1, profileurl: 1, password: 1,
                    remarks: 1, packagecode: "$subscriptioninfo.packagecode", packagename: "$packageinfo.package.packagename"
                }
            }
        ]).toArray(function (err, result) {
            if (err) throw err;
            ////console.log(result);
            return callback(result);
        })
    }
    catch (e) {
        logger.error("Error in Subscription List - report " + e);
    }
}