'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');


exports.getJobGroupFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Job Group Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };

        //var genderparams = { statuscode: objConstants.activestatus, 'gender.languagecode': Number(params.languagecode) };
        var genderparams = {$and:[{"statuscode": objConstants.activestatus},
        {$or:[{"gender.languagecode": Number(params.languagecode) } ]}]};
            dbo.collection(MongoDB.GenderCollectionName).aggregate([
            { $unwind: '$gender' },
            { $match: genderparams },
            { $sort: { gendercode: 1 } },
            {
                $project: {
                    _id: 0, gendercode: 1, gendername: '$gender.gendername',languagecode: '$gender.languagecode'
                }
            }
        ]).toArray(function (err, genderresult) {
            //District Collection
            //var maritalparams = { statuscode: objConstants.activestatus, 'marital.languagecode': Number(params.languagecode) };
            var maritalparams = {$and:[{"statuscode": objConstants.activestatus},
        {$or:[{"marital.languagecode": Number(params.languagecode) } ]}]};
            dbo.collection(MongoDB.MaritalStatusCollectionName).aggregate([
                { $unwind: '$marital' },
                { $match: maritalparams },
                {
                    $sort: {
                        maritalcode: 1
                    }
                },
                {
                    $project: {
                        _id: 0, maritalcode: 1, maritalname: '$marital.maritalname',languagecode: '$marital.languagecode'
                    }
                }
            ]).toArray(function (err, maritalresult) {

                finalresult = {
                    maritalstatuslist: maritalresult,
                    genderlist: genderresult
                };
                ////console.log("school");
                ////console.log(finalresult);
                return callback(finalresult);

            });
        });



    }
    catch (e) { logger.error("Error in Filter - Job Group Bind: " + e); }


}

exports.getProfileJobGroupFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult =[];
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Job Group Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };

        //var genderparams = { statuscode: objConstants.activestatus, 'gender.languagecode': Number(params.languagecode) };
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
            { $unwind: "$personalinfo" },
            {
                "$lookup": {
                    "from": String(MongoDB.GenderCollectionName),
                    "localField": "personalinfo.gender",
                    "foreignField": "gendercode",
                    "as": "genderinfo"
                }
            },
            { $unwind: "$genderinfo" },
            { $unwind: "$genderinfo.gender" },
            //{ $match: { "genderinfo.gender.languagecode": Number(params.languagecode) } },
            { $match: {$and:[{"genderinfo.statuscode": objConstants.activestatus},
            {$or:[{"genderinfo.gender.languagecode": Number(params.languagecode) } ]}]}},
            {
                "$lookup": {
                    "from": String(MongoDB.MaritalStatusCollectionName),
                    "localField": "personalinfo.maritalstatus",
                    "foreignField": "maritalcode",
                    "as": "maritalinfo"
                }
            },
            { $unwind: "$maritalinfo" },
            { $unwind: "$maritalinfo.marital" },
            //{ $match: { "maritalinfo.marital.languagecode": Number(params.languagecode) } },
            { $match: {$and:[{"maritalinfo.statuscode": objConstants.activestatus},
            {$or:[{"maritalinfo.marital.languagecode": Number(params.languagecode) } ]}]}},
            {
                "$project": {
                    _id: 0,
                    maritalstatus: { maritalcode: { $ifNull: ['$maritalinfo.maritalcode', 0] }, maritalname: { $ifNull: ['$maritalinfo.marital.maritalname', ''] },languagecode: { $ifNull: ['$maritalinfo.marital.languagecode', Number(params.languagecode)] } },
                    genderstatus: { gendercode: { $ifNull: ['$genderinfo.gendercode', 0] }, gendername: { $ifNull: ['$genderinfo.gender.gendername', ''] },languagecode: { $ifNull: ['$genderinfo.gender.languagecode',  Number(params.languagecode)] } }
                }
            }
        ]).toArray(function (err, groupresult) {

           
            if (groupresult != null && groupresult.length > 0)
            {
                finalresult = groupresult;
            }
            else
            {
                var resu = {
                    maritalstatus: {
                        maritalcode: 0,
                        maritalname: '',
                        languagecode: Number(params.languagecode)
                    },
                    genderstatus: {
                        gendercode: 0,
                        gendername: '',
                        languagecode: Number(params.languagecode)
                    }
                }
                // console.log(resu);
                finalresult.push(resu);
            }
        //    console.log(finalresult)
            return callback(finalresult);
        });



    }
    catch (e) { logger.error("Error in Filter - Profile Job Group Bind: " + e); }


}

exports.getJobpostJobGroupFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult =[];
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Job Group Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);
        //var jobfuncparams =  {"statuscode": objConstants.activestatus, 'jobfunction.languagecode': Number(params.languagecode) };

        //var genderparams = { statuscode: objConstants.activestatus, 'gender.languagecode': Number(params.languagecode) };
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: { "jobcode": Number(params.jobcode)} },
            {
                "$project": {
                    _id: 0,
                    maritalstatus: '$maritalstatus',
                    genderstatus: '$gender',
                    differentlyabled: 1
                }
            }
        ]).toArray(function (err, groupresult) {

           
            if (groupresult != null && groupresult.length > 0)
            {
                finalresult = groupresult;
            }
            else
            {
                var resu = {
                    maritalstatus: {
                        isany: "true"
                    },
                    genderstatus: {
                       isany: "true"
                    },
                    differentlyabled: 0
                }
                // console.log(resu);
                finalresult.push(resu);
            }
        //  console.log(JSON.stringify(finalresult, null, " "))
            return callback(finalresult);
        });



    }
    catch (e) { logger.error("Error in Filter - Profile Job Group Bind: " + e); }


}