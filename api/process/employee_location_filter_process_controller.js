'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getLocationFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Location Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);

        //var stateparams = { statuscode: objConstants.activestatus, 'state.languagecode': Number(params.languagecode) };
        var stateparams = {
            $and: [{ "statuscode": objConstants.activestatus },
            { $or: [{ "state.languagecode": Number(params.languagecode) }] }]
        };
        dbo.collection(MongoDB.StateCollectionName).aggregate([
            { $unwind: '$state' },
            { $match: stateparams },
            {
                $sort: {
                    'state.statename': 1
                }
            },
            {
                $project: {
                    _id: 0, statecode: 1, statename: '$state.statename', languagecode: '$state.languagecode'
                }
            }
        ]).toArray(function (err, stateresult) {
            //District Collection
            //var distparams = { statuscode: objConstants.activestatus, 'district.languagecode': Number(params.languagecode) };
            var distparams = {
                $and: [{ "statuscode": objConstants.activestatus },
                { $or: [{ "district.languagecode": Number(params.languagecode) }] }]
            };
            dbo.collection(MongoDB.DistrictCollectionName).aggregate([
                { $unwind: '$district' },
                { $match: distparams },
                { $sort: { 'district.districtname': 1 } },
                {
                    $project: {
                        _id: 0, districtcode: 1, districtname: '$district.districtname', languagecode: '$district.languagecode', statecode: 1
                    }
                }
            ]).toArray(function (err, districtresult) {
                var talukparams = { statuscode: objConstants.activestatus, 'taluk.languagecode': Number(params.languagecode) };
                dbo.collection(MongoDB.TalukCollectionName).aggregate([
                    { $unwind: '$taluk' },
                    { $match: talukparams },
                    {
                        $sort: {
                            'taluk.talukname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, talukcode: 1, talukname: '$taluk.talukname',
                            districtcode: 1
                        }
                    }
                ]).toArray(function (err, talukresult) {
                    finalresult = {
                        "statelist": stateresult,
                        "districtlist": districtresult,
                        "taluklist": talukresult
                    };
                    ////console.log("school");
                    ////console.log(finalresult);
                    return callback(finalresult);
                });
            });
        });



    }
    catch (e) { logger.error("Error in Filter - Location Bind: " + e); }


}

exports.getProfileLocationFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Profile Location Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);

        //var stateparams = { statuscode: objConstants.activestatus, 'state.languagecode': Number(params.languagecode) };
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
            { $unwind: "$preferences" },
            { $unwind: "$preferences.location" },
            {
                "$lookup": {
                    "from": String(MongoDB.DistrictCollectionName),
                    "localField": "preferences.location.locationcode",
                    "foreignField": "districtcode",
                    "as": "districtinfo"
                }
            },
            { $unwind: "$districtinfo" },
            { $unwind: "$districtinfo.district" },
            //{ $match: { "districtinfo.district.languagecode": Number(params.languagecode) } },
            {
                $match: {
                    $and: [{ "districtinfo.statuscode": objConstants.activestatus },
                    { $or: [{ "districtinfo.district.languagecode": Number(params.languagecode) }] }]
                }
            },

            {
                "$lookup": {
                    "from": String(MongoDB.StateCollectionName),
                    "localField": "districtinfo.statecode",
                    "foreignField": "statecode",
                    "as": "stateinfo"
                }
            },
            { $unwind: "$stateinfo" },
            { $unwind: "$stateinfo.state" },
            //{ $match: { "stateinfo.state.languagecode": Number(params.languagecode) } },
            {
                $match: {
                    $and: [{ "stateinfo.statuscode": objConstants.activestatus },
                    {"stateinfo.state.languagecode": Number(params.languagecode) }] 
                }
            },
            { $group: { "_id": { "statecode": '$districtinfo.statecode', statename: '$stateinfo.state.statename', languagecode: '$stateinfo.state.languagecode' } } },
            {
                "$project": {
                    _id: 0,
                    statecode: '$_id.statecode', statename: '$_id.statename', languagecode: '$_id.languagecode'
                }
            }
        ]).toArray(function (err, stateresult) {
            //District Collection
            //var distparams = { statuscode: objConstants.activestatus, 'district.languagecode': Number(params.languagecode) };
            ////console.log(stateresult);
            dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                {
                    $match: {
                        "employeecode": Number(params.employeecode),
                        "statuscode": objConstants.activestatus
                    }
                },
                { $unwind: "$preferences" },
                { $unwind: "$preferences.location" },
                {
                    "$lookup": {
                        "from": String(MongoDB.DistrictCollectionName),
                        "localField": "preferences.location.locationcode",
                        "foreignField": "districtcode",
                        "as": "districtinfo"
                    }
                },
                { $unwind: "$districtinfo" },
                { $unwind: "$districtinfo.district" },
                //{ $match: { "districtinfo.district.languagecode": Number(params.languagecode) } },
                {
                    $match: {
                        $and: [{ "districtinfo.statuscode": objConstants.activestatus },
                        { "districtinfo.district.languagecode": Number(params.languagecode) }
                        ]
                    }
                },
                {
                    "$project": {
                        _id: 0,
                        districtcode: '$districtinfo.districtcode', districtname: '$districtinfo.district.districtname', languagecode: '$districtinfo.district.languagecode', statecode: '$districtinfo.statecode'
                    }
                }
            ]).toArray(function (err, districtresult) {
                //District Collection
                //var distparams = { statuscode: objConstants.activestatus, 'district.languagecode': Number(params.languagecode) };
                ////console.log(stateresult);
                dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                    {
                        $match: {
                            "employeecode": Number(params.employeecode),
                            "statuscode": objConstants.activestatus
                        }
                    },
                    { $unwind: "$preferences" },
                    { $unwind: "$preferences.taluk" },
                    {
                        "$lookup": {
                            "from": String(MongoDB.TalukCollectionName),
                            "localField": "preferences.taluk.talukcode",
                            "foreignField": "talukcode",
                            "as": "talukinfo"
                        }
                    },
                    { $unwind: { path: '$talukinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$talukinfo.taluk', preserveNullAndEmptyArrays: true } },
                    {
                        $match: {
                            $or: [{ "talukinfo.taluk.languagecode": { $exists: false } }, { "talukinfo.taluk.languagecode": Number(params.languagecode) }]
                        }
                    },
                    {
                        "$project": {
                            talukcode: { $ifNull: ['$talukinfo.talukcode', 0] },
                            talukname: { $ifNull: ['$talukinfo.taluk.talukname', ''] },
                            languagecode: { $ifNull: ['$talukinfo.taluk.languagecode', '2'] }
                        }
                    }
                ]).toArray(function (err, talukresult) {
                    if(stateresult && stateresult.length > 0){
                        finalresult = {
                            "statelist": stateresult,
                            "districtlist": districtresult,
                            "taluklist": talukresult
                        };
                        return callback(finalresult);
                    }
                    else{
                        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                            { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
                            { $unwind: "$preferences" },
                            {
                                "$lookup": {
                                    "from": String(MongoDB.StateCollectionName),
                                    "localField": "preferences.statecode",
                                    "foreignField": "statecode",
                                    "as": "stateinfo"
                                }
                            },
                            { $unwind: "$stateinfo" },
                            { $unwind: "$stateinfo.state" },
                            //{ $match: { "stateinfo.state.languagecode": Number(params.languagecode) } },
                            {
                                $match: {
                                    $and: [{ "stateinfo.statuscode": objConstants.activestatus },
                                    { "stateinfo.state.languagecode": Number(params.languagecode) }]
                                }
                            },
                            { $group: { "_id": { "statecode": '$preferences.statecode', statename: '$stateinfo.state.statename', languagecode: '$stateinfo.state.languagecode' } } },
                            {
                                "$project": {
                                    _id: 0,
                                    statecode: '$_id.statecode', statename: '$_id.statename', languagecode: '$_id.languagecode'
                                }
                            }
                        ]).toArray(function (err, stateresults) {
                            finalresult = {
                                "statelist": stateresults,
                                "districtlist": districtresult,
                                "taluklist": talukresult
                            };
                            return callback(finalresult);
                        });
                    }
                });
            });
        });



    }
    catch (e) { logger.error("Error in Filter - Profile Location Bind: " + e); }


}

exports.getEmployerLocationFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Employer Profile Location Bind in Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);

        //var stateparams = { statuscode: objConstants.activestatus, 'state.languagecode': Number(params.languagecode) };
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { $match: { "employercode": Number(params.employercode), "statuscode": objConstants.activestatus } },
            { $unwind: "$preferences" },
            {
                "$lookup": {
                    "from": String(MongoDB.StateCollectionName),
                    "localField": "preferences.statecode",
                    "foreignField": "statecode",
                    "as": "stateinfo"
                }
            },
            { $unwind: "$stateinfo" },
            { $unwind: "$stateinfo.state" },
            //{ $match: { "stateinfo.state.languagecode": Number(params.languagecode) } },
            {
                $match: {
                    $and: [{ "stateinfo.statuscode": objConstants.activestatus },
                    { $or: [{ "stateinfo.state.languagecode": Number(params.languagecode) }] }]
                }
            },
            { $group: { "_id": { "statecode": '$stateinfo.statecode', statename: '$stateinfo.state.statename', languagecode: '$stateinfo.state.languagecode' } } },
            {
                "$project": {
                    _id: 0,
                    statecode: '$_id.statecode', statename: '$_id.statename', languagecode: '$_id.languagecode'
                }
            }
        ]).toArray(function (err, stateresult) {
            //District Collection
            //var distparams = { statuscode: objConstants.activestatus, 'district.languagecode': Number(params.languagecode) };
            ////console.log(stateresult);
            dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                { $match: { "employercode": Number(params.employercode), "statuscode": objConstants.activestatus } },
                { $unwind: "$preferences" },
                { $unwind: "$preferences.location" },
                {
                    "$lookup": {
                        "from": String(MongoDB.DistrictCollectionName),
                        "localField": "preferences.location.locationcode",
                        "foreignField": "districtcode",
                        "as": "districtinfo"
                    }
                },
                { $unwind: "$districtinfo" },
                { $unwind: "$districtinfo.district" },
                {
                    $match: {
                        $and: [{ "districtinfo.statuscode": objConstants.activestatus },
                        { $or: [{ "districtinfo.district.languagecode": Number(params.languagecode) }] }]
                    }
                },
                {
                    "$project": {
                        _id: 0,
                        districtcode: '$districtinfo.districtcode', districtname: '$districtinfo.district.districtname', languagecode: '$districtinfo.district.languagecode', statecode: '$districtinfo.statecode'
                    }
                }
            ]).toArray(function (err, districtresult) {
                var talukparams = { statuscode: objConstants.activestatus, 'taluk.languagecode': Number(params.languagecode) };
                dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                    // { $unwind: '$taluk' },
                    // { $match: talukparams },
                    // {
                    //     $sort: {
                    //         'taluk.talukname': 1
                    //     }
                    // },
                    // {
                    //     $project: {
                    //         _id: 0, talukcode: 1, talukname: '$taluk.talukname',
                    //         districtcode: 1
                    //     }
                    // }
                    { $match: { "employercode": Number(params.employercode), "statuscode": objConstants.activestatus } },
                    { $unwind: "$preferences" },
                    { $unwind: "$preferences.taluk" },
                    {
                        "$lookup": {
                            "from": String(MongoDB.TalukCollectionName),
                            "localField": "preferences.taluk.talukcode",
                            "foreignField": "talukcode",
                            "as": "talukinfo"
                        }
                    },
                    { $unwind: "$talukinfo" },
                    { $unwind: "$talukinfo.taluk" },
                    {
                        $match: {
                            $and: [{ "talukinfo.statuscode": objConstants.activestatus },
                            { $or: [{ "talukinfo.taluk.languagecode": Number(params.languagecode) }] }]
                        }
                    },
                    {
                        "$project": {
                            _id: 0,
                            districtcode: '$talukinfo.districtcode', talukcode: '$talukinfo.talukcode', talukname: '$talukinfo.taluk.talukname', languagecode: '$talukinfo.taluk.languagecode', statecode: '$talukinfo.statecode'
                        }
                    }
                ]).toArray(function (err, talukresult) {
                    finalresult = {
                        "statelist": stateresult,
                        "districtlist": districtresult,
                        "taluklist": talukresult
                    };
                    return callback(finalresult);
                });
            });
        });



    }
    catch (e) { logger.error("Error in Filter - Profile Location Bind: " + e); }


}
exports.getEmployerSpecificTalukFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Employer Profile Location Bind in Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        // dbo.collection(MongoDB.TalukCollectionName).aggregate([
        //     { $unwind: '$taluk' },
        //     { $match: { statuscode: objConstants.activestatus, 'taluk.languagecode': Number(params.languagecode) } },
        //     {
        //         $sort: {
        //             'taluk.talukname': 1
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0, talukcode: 1, talukname: '$taluk.talukname',
        //             districtcode: 1
        //         }
        //     }

        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { $match: { "employercode": Number(params.employercode), "statuscode": objConstants.activestatus } },
            { $unwind: "$preferences" },
            { $unwind: "$preferences.location" },
            {
                "$lookup": {
                    "from": String(MongoDB.DistrictCollectionName),
                    "localField": "preferences.location.locationcode",
                    "foreignField": "districtcode",
                    "as": "districtinfo"
                }
            },
            { $unwind: "$districtinfo" },
            { $unwind: "$districtinfo.district" },
            {
                $match: {
                    $and: [{ "districtinfo.statuscode": objConstants.activestatus },
                    { $or: [{ "districtinfo.district.languagecode": Number(params.languagecode) }] }]
                }
            },
            {
                "$lookup": {
                    "from": String(MongoDB.TalukCollectionName),
                    "localField": "districtinfo.districtcode",
                    "foreignField": "districtcode",
                    "as": "talukinfo"
                }
            },

            { $unwind: "$talukinfo" },
            { $unwind: "$talukinfo.taluk" },
            {
                $match: {
                    $and: [{ "talukinfo.statuscode": objConstants.activestatus },
                    //  { "talukinfo.districtcode": { $in: '$districtinfo.districtcode' } },
                    { $or: [{ "talukinfo.taluk.languagecode": Number(params.languagecode) }] }]
                }
            },
            {
                "$project": {
                    _id: 0,
                    districtcode: '$talukinfo.districtcode', talukcode: '$talukinfo.talukcode', talukname: '$talukinfo.taluk.talukname', languagecode: '$talukinfo.taluk.languagecode', statecode: '$talukinfo.statecode'
                }
            }
        ]).toArray(function (err, talukresult) {
           
            finalresult = {
                "taluklist": talukresult
            };
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Filter - Profile Location Bind: " + e); }
}

exports.getEmployeeSpecificTalukFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Employee Profile Location Bind in Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        

        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.activestatus } },
            { $unwind: "$preferences" },
            { $unwind: "$preferences.location" },
            {
                "$lookup": {
                    "from": String(MongoDB.DistrictCollectionName),
                    "localField": "preferences.location.locationcode",
                    "foreignField": "districtcode",
                    "as": "districtinfo"
                }
            },
            { $unwind: "$districtinfo" },
            { $unwind: "$districtinfo.district" },
            {
                $match: {
                    $and: [{ "districtinfo.statuscode": objConstants.activestatus },
                    { "districtinfo.district.languagecode": Number(params.languagecode) }]
                }
            },
            {
                "$lookup": {
                    "from": String(MongoDB.TalukCollectionName),
                    "localField": "districtinfo.districtcode",
                    "foreignField": "districtcode",
                    "as": "talukinfo"
                }
            },

            { $unwind: "$talukinfo" },
            { $unwind: "$talukinfo.taluk" },
            {
                $match: {
                    $and: [{ "talukinfo.statuscode": objConstants.activestatus },
                    //  { "talukinfo.districtcode": { $in: '$districtinfo.districtcode' } },
                    { "talukinfo.taluk.languagecode": Number(params.languagecode) }]
                }
            },
            {
                "$project": {
                    _id: 0,
                    districtcode: '$talukinfo.districtcode', talukcode: '$talukinfo.talukcode', talukname: '$talukinfo.taluk.talukname', languagecode: '$talukinfo.taluk.languagecode', statecode: '$talukinfo.statecode'
                }
            }
        ]).toArray(function (err, talukresult) {
            
            finalresult = {
                "taluklist": talukresult
            };
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Filter - Profile Location Bind: " + e); }
}

exports.getJobLocationFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Job Location Bind in Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        ////console.log(languagecode);

        //var stateparams = { statuscode: objConstants.activestatus, 'state.languagecode': Number(params.languagecode) };
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: { "jobcode": Number(params.jobcode)} },
            {
                "$lookup": {
                    "from": String(MongoDB.StateCollectionName),
                    "localField": "preferredlocation.statecode",
                    "foreignField": "statecode",
                    "as": "stateinfo"
                }
            },
            { $unwind: "$stateinfo" },
            { $unwind: "$stateinfo.state" },
            {
                $match: {
                    $and: [{ "stateinfo.statuscode": objConstants.activestatus },
                    { $or: [{ "stateinfo.state.languagecode": Number(params.languagecode) }] }]
                }
            },
            {
                "$addFields": {
                  "statename": "$stateinfo.state.statename"
                }
              },
            {
                "$project": {
                    _id: 0, preferredlocation: {
                        isany: '$preferredlocation.isany',
                        statecode: '$preferredlocation.statecode',
                        statename: '$statename',
                        locationlist: '$preferredlocation.locationlist',
                        taluklist: '$preferredlocation.taluklist',
                        isanytaluk: '$preferredlocation.isanytaluk',
                    }
                }
            }
        ]).toArray(function (err, stateresult) {
            return callback(stateresult);
        });



    }
    catch (e) { logger.error("Error in Filter - Profile Location Bind: " + e); }


}

exports.getJobSpecificTalukFilterBind = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Filter - Job Profile Location Bind in Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        

        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: { "jobcode": Number(params.jobcode)} },
            { $unwind: "$preferredlocation" },
            { $unwind: "$preferredlocation.locationlist" },
            {
                "$lookup": {
                    "from": String(MongoDB.DistrictCollectionName),
                    "localField": "preferences.locationlist.locationcode",
                    "foreignField": "districtcode",
                    "as": "districtinfo"
                }
            },
            { $unwind: "$districtinfo" },
            { $unwind: "$districtinfo.district" },
            {
                $match: {
                    $and: [{ "districtinfo.statuscode": objConstants.activestatus },
                    { $or: [{ "districtinfo.district.languagecode": Number(params.languagecode) }] }]
                }
            },
            {
                "$lookup": {
                    "from": String(MongoDB.TalukCollectionName),
                    "localField": "districtinfo.districtcode",
                    "foreignField": "districtcode",
                    "as": "talukinfo"
                }
            },

            { $unwind: "$talukinfo" },
            { $unwind: "$talukinfo.taluk" },
            {
                $match: {
                    $and: [{ "talukinfo.statuscode": objConstants.activestatus },
                    //  { "talukinfo.districtcode": { $in: '$districtinfo.districtcode' } },
                    { $or: [{ "talukinfo.taluk.languagecode": Number(params.languagecode) }] }]
                }
            },
            {
                "$project": {
                    _id: 0,
                    districtcode: '$talukinfo.districtcode', talukcode: '$talukinfo.talukcode', talukname: '$talukinfo.taluk.talukname', languagecode: '$talukinfo.taluk.languagecode', statecode: '$talukinfo.statecode'
                }
            }
        ]).toArray(function (err, talukresult) {
            
            finalresult = {
                "taluklist": talukresult
            };
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Filter - Profile Location Bind: " + e); }
}