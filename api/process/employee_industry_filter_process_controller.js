'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getIndustryFilterBind= function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Industry Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var industryparams =  {"statuscode": objConstants.activestatus, 'industry.languagecode': Number(params.languagecode) };
        var industryparams = {$and:[{"statuscode": objConstants.activestatus},
        {$or:[{"industry.languagecode": Number(params.languagecode) } ]}]};
        dbo.collection(MongoDB.IndustryCollectionName).aggregate([
            {$unwind: '$industry'},
            {$match:industryparams},
            {$sort: {'industry.industryname': 1}},
                  { $project: {
                   _id: 0, industrycode:1, industryname:'$industry.industryname', languagecode:'$industry.languagecode'
                   } }
                ]).toArray(function(err, industryresult) {
            finalresult =industryresult;
            ////console.log("school");
            ////console.log(finalresult);
            return callback(finalresult);
        });
    
           
            
        
    }
    catch (e) { logger.error("Error in Filter - Industry Bind: " + e); }
  
  
  }