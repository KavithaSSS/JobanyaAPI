'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getCompanyTypeFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Filter - Company Type Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };

        dbo.collection(MongoDB.CompanyTypeCollectionName).aggregate([
            { $unwind: "$companytype" },
            //{ $match: { "statuscode": objConstants.activestatus, "companytype.languagecode": Number(params.languagecode) } },
            { $match: {$and:[{"statuscode": objConstants.activestatus},
            {$or:[{"companytype.languagecode": Number(params.languagecode) } ]}]}},
            { $sort: { 'ordervalue': 1 } },
            {
                "$project": {
                    _id: 0, companytypecode: 1, companytypename: '$companytype.companytypename',languagecode:'$companytype.languagecode', ordervalue:1
                }
            }
        ]).toArray(function (err, companytyperesult) {

            finalresult = companytyperesult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);

        });




    }
    catch (e) { logger.error("Error in Filter - Company Type Bind: " + e); }


}