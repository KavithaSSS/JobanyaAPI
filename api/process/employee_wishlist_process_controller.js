'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.WishListCreate = function (logparams, params, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Wish List Save on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection

        dbo.collection(MongoDB.EmployeeWishListCollectionName).find({ "employeecode": params.employeecode, "jobcode": params.jobcode }, { projection: { _id: 0, statuscode: 1 } }).toArray(function (err, wishresult) {
            if (wishresult != null && wishresult.length > 0) {
                dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                    params.makerid = String(logres["ops"][0]["_id"]);
                    dbo.collection(MongoDB.EmployeeWishListCollectionName).updateOne({ "employeecode": params.employeecode, "jobcode": params.jobcode }, { $set: { "updateddate": milliseconds, "statuscode": params.statuscode } }, function (err, res) {
                        if (err) throw err;
                        finalresult = res.modifiedCount;
                        ////console.log(finalresult);
                        return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
                    });
                });
            }
            else {
                dbo.collection(String(MongoDB.LogCollectionName)).insertOne(logparams, function (err, logres) {
                    params.makerid = String(logres["ops"][0]["_id"]);
                    dbo.collection(String(MongoDB.EmployeeWishListCollectionName)).insertOne(params, function (err, res) {
                        if (err) throw err;
                        finalresult = res.insertedCount;
                        ////console.log(finalresult);
                        return callback(finalresult);
                    });
                });
            }
            //return callback(sortresult);
        });

    }
    catch (e) { logger.error("Error in Wish List Save: " + e); }

}
