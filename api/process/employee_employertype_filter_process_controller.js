'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getEmpTypeFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Filter - Employer Type Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };

        dbo.collection(MongoDB.EmployerTypeCollectionName).aggregate([
            { $unwind: "$employertype" },
            //{ $match: { "statuscode": objConstants.activestatus, "employertype.languagecode": Number(params.languagecode) } },
            { $match: {$and:[{"statuscode": objConstants.activestatus},
            {$or:[{"employertype.languagecode": Number(params.languagecode) } ]}]}},
            { $sort: { 'employertype.employertypename': 1 } },
            {
                "$project": {
                    _id: 0,languagecode:'$employertype.languagecode', employertypecode: 1, employertypename: '$employertype.employertypename'
                }
            }
        ]).toArray(function (err, employertyperesult) {

            finalresult = employertyperesult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);

        });




    }
    catch (e) { logger.error("Error in Filter - Employer Type Bind: " + e); }


}