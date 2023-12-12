'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
const objUtilities = require('../controller/utilities');
exports.NewsBind = function (logparams, req, callback) {
    try {
        logger.info("Binding News field : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            const dbo = MongoDB.getDB();
        var finalresult;
        var dbcollectionname = dbo.collection(MongoDB.newseventsCollectionName);
        var langparams = { "newstypecode": Number(objConstants.newstypecode),$or:[{"categorycode": Number(objConstants.EmployerCategorycode)},{"categorycode": Number(objConstants.BothCategorycode)}], "newsevents.languagecode": Number(req.query.languagecode), statuscode: parseInt(objConstants.approvedstatus),'expirydate': {$gte: currenttime } };
        dbcollectionname.aggregate([
            { $unwind: '$newsevents' },
            { $match: langparams },
            {
                $project: {
                    _id: 0, title: '$newsevents.title', venue: '$newsevents.venue', description: '$newsevents.description', "newscode": 1,"newstypecode":1, "imageurl": 1, "link": 1, "startdate": 1, "enddate": 1, "expirydate": 1
                }
            }
        ]).toArray(function (err, result) {

            ////console.log(result);
            return callback(result);
        });
        });
        
    }
    catch (ex) {
        logger.error("Error in Binding news field - News Events " + e);
    }
}

exports.NewsDetails = function (logparams, req, callback) {
    try {
        logger.info("View News field : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            const dbo = MongoDB.getDB();
        var finalresult;
        var dbcollectionname = dbo.collection(MongoDB.newseventsCollectionName);
        var langparams = { "newscode": Number(req.query.newscode), "newstypecode": Number(objConstants.newstypecode), "categorycode": Number(objConstants.EmployerCategorycode), "newsevents.languagecode": Number(req.query.languagecode), statuscode: parseInt(objConstants.approvedstatus) ,'expirydate': {$gte: currenttime }};
        dbcollectionname.aggregate([
            { $unwind: '$newsevents' },
            { $match: langparams },
            {
                $project: {
                    _id: 0, title: '$newsevents.title', venue: '$newsevents.venue', description: '$newsevents.description', "newscode": 1, "imageurl": 1, "link": 1, "startdate": 1, "enddate": 1, "expirydate": 1
                }
            }
        ]).toArray(function (err, result) {

            ////console.log(result);
            return callback(result);
        });
        });
        
    }
    catch (ex) {
        logger.error("Error in View news field - News Events " + e);
    }
}

exports.EventsBind = function (logparams, req, callback) {
    try {
        logger.info("Binding events field : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            const dbo = MongoDB.getDB();
            var dbcollectionname = dbo.collection(MongoDB.newseventsCollectionName);
            var langparams = { "newstypecode": Number(objConstants.eventstypecode), $or:[{"categorycode": Number(objConstants.EmployerCategorycode)},{"categorycode": Number(objConstants.BothCategorycode)}], "newsevents.languagecode": Number(req.query.languagecode),'expirydate': {$gte: currenttime }, statuscode: parseInt(objConstants.approvedstatus) };
            dbcollectionname.aggregate([
                { $unwind: '$newsevents' },
                { $match: langparams },
                {
                    $project: {
                        _id: 0, title: '$newsevents.title', venue: '$newsevents.venue', description: '$newsevents.description', "newscode": 1, "newstypecode":1, "imageurl": 1, "link": 1, "startdate": 1, "enddate": 1, "expirydate": 1
                    }
                }
            ]).toArray(function (err, result) {

                ////console.log(result);
                return callback(result);
            });
        });
        
    }
    catch (ex) {
        logger.error("Error in Binding events field - News Events " + e);
    }
}

exports.EventsDetails = function (logparams, req, callback) {
    try {
        logger.info("View events field : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            const dbo = MongoDB.getDB();
        var dbcollectionname = dbo.collection(MongoDB.newseventsCollectionName);
        var langparams = { "newscode": Number(req.query.eventcode), "newstypecode": Number(objConstants.eventstypecode), "categorycode": Number(objConstants.EmployerCategorycode), "newsevents.languagecode": Number(req.query.languagecode), statuscode: parseInt(objConstants.approvedstatus) ,'expirydate': {$gte: currenttime }};
        dbcollectionname.aggregate([
            { $unwind: '$newsevents' },
            { $match: langparams },
            {
                $project: {
                    _id: 0, title: '$newsevents.title', venue: '$newsevents.venue', description: '$newsevents.description', "newscode": 1, "imageurl": 1, "link": 1, "startdate": 1, "enddate": 1, "expirydate": 1
                }
            }
        ]).toArray(function (err, result) {

            ////console.log(result);
            return callback(result);
        });
        });
        
    }
    catch (ex) {
        logger.error("Error in View events field - News Events " + e);
    }
}