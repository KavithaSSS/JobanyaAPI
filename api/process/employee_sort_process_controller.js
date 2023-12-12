'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');


exports.getSortLoad = function (logparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Sort Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
       
        dbo.collection(MongoDB.SortListCollectionName).aggregate([
            { $unwind: '$sortname'},
            { $match: { "statuscode": objConstants.activestatus, "sortname.languagecode": parseInt(languagecode) ,"typecode":1} },
            {
                $sort: {
                    sortcode: 1
                }
            },
            {
                $project:
                    { _id: 0, sortcode: 1, sorttext: '$sortname.sorttext' }
            }
        ]).toArray(function (err, sortresult) {
            finalresult = sortresult;
            return callback(sortresult);
        });

    }
    catch (e) { logger.error("Error in Sort List Load: " + e); }

}


exports.getEmployerSortLoad = function (logparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employer Sort Load on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
       ////console.log(languagecode);
        //dbo.collection(MongoDB.SortListCollectionName).find({"statuscode": objConstants.activestatus, "typecode":2}, { projection: { _id: 0, sortcode: 1, sorttext: 1 } })
        dbo.collection(MongoDB.SortListCollectionName).aggregate([
            { $unwind: '$sortname'},
            { $match: { "statuscode": objConstants.activestatus, "sortname.languagecode": parseInt(languagecode) ,"typecode":2} },
            {
                $sort: {
                    sortcode: 1
                }
            },
            {
                $project:
                    { _id: 0, sortcode: 1, sorttext: '$sortname.sorttext' }
            }
        ]).toArray(function (err, sortresult) {
            ////console.log(sortresult);
            finalresult = sortresult;
            return callback(sortresult);
        });

    }
    catch (e) { logger.error("Error in Employer Sort List Load: " + e); }

}
exports.getAdminEmployerSortLoad = function (logparams, languagecode,typecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employer Sort Load on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
       ////console.log(languagecode);
        //dbo.collection(MongoDB.SortListCollectionName).find({"statuscode": objConstants.activestatus, "typecode":2}, { projection: { _id: 0, sortcode: 1, sorttext: 1 } })
        dbo.collection(MongoDB.SortListCollectionName).aggregate([
            { $unwind: '$sortname'},
            { $match: { "statuscode": objConstants.activestatus, "sortname.languagecode": parseInt(languagecode) ,"typecode":parseInt(typecode)} },
            {
                $sort: {
                    sortcode: 1
                }
            },
            {
                $project:
                    { _id: 0, sortcode: 1, sorttext: '$sortname.sorttext' }
            }
        ]).toArray(function (err, sortresult) {
            ////console.log(sortresult);
            finalresult = sortresult;
            return callback(sortresult);
        });

    }
    catch (e) { logger.error("Error in Employer Sort List Load: " + e); }

}