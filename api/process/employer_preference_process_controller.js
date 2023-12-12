'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");

exports.GetPreferenceLoad = function (logparams, langparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Preference Load on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var stateparams = { statuscode: objConstants.activestatus, 'state.languagecode': Number(langparams) };
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
                    _id: 0, statecode: 1, statename: '$state.statename'
                }
            }
        ]).toArray(function (err, stateresult) {
            //District Collection
            var distparams = { statuscode: objConstants.activestatus, 'district.languagecode': Number(langparams) };
            dbo.collection(MongoDB.DistrictCollectionName).aggregate([
                { $unwind: '$district' },
                { $match: distparams },
                {
                    $sort: {
                        'district.districtname': 1
                    }
                },
                {
                    $project: {
                        _id: 0, districtcode: 1, districtname: '$district.districtname', statecode: 1
                    }
                }
            ]).toArray(function (err, districtresult) {
                //Taluk Collection
                var talukparams = { statuscode: objConstants.activestatus, 'taluk.languagecode': Number(langparams) };
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
                            statecode: 1, districtcode: 1
                        }
                    }
                ]).toArray(function (err, talukresult) {
                //Job Function Collection
                var jobfuncparams = { statuscode: objConstants.activestatus, 'jobfunction.languagecode': Number(langparams) };
                dbo.collection(MongoDB.JobFunctionCollectionName).aggregate([
                    { $unwind: '$jobfunction' },
                    { $match: jobfuncparams },
                    {
                        $sort: {
                            'jobfunction.jobfunctionname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, jobfunctioncode: 1, jobfunctionname: '$jobfunction.jobfunctionname'
                        }
                    }
                ]).toArray(function (err, jobfunctionresult) {
                    //Job Role Collection
                    var jobroleparams = { statuscode: objConstants.activestatus, 'jobrole.languagecode': Number(langparams) };
                    dbo.collection(MongoDB.JobRoleCollectionName).aggregate([
                        { $unwind: '$jobrole' },
                        { $match: jobroleparams },
                        {
                            $sort: {
                                'jobrole.jobrolename': 1
                            }
                        },
                        {
                            $project: {
                                _id: 0, jobrolecode: 1, jobrolename: '$jobrole.jobrolename', jobfunctioncode: 1
                            }
                        }
                    ]).toArray(function (err, jobroleresult) {
                        //Employement Type Collection
                        var emptypeparams = { 'jobtype.languagecode': Number(langparams), statuscode: objConstants.activestatus };
                        dbo.collection(MongoDB.JobTypeCollectionName).aggregate([
                            { $unwind: '$jobtype' },
                            { $match: emptypeparams },
                            {
                                $sort: {
                                    'jobtype.jobtypename': 1
                                }
                            },
                            {
                                $project:
                                    { _id: 0, employementtypecode: '$jobtypecode', employementtypename: '$jobtype.jobtypename' }
                            }
                        ]).toArray(function (err, emptyperesult) {
                            dbo.collection(MongoDB.settingsCollectionName).aggregate([
                                {$unwind: {path:'$generalsettings',preserveNullAndEmptyArrays: true }  },
                                {$project: {_id:0, employer_location_count: {$ifNull:[ '$generalsettings.employer_location_count',0]},
                                employer_jobfunction_count: {$ifNull:[ '$generalsettings.employer_jobfunction_count',0]},
                                employer_jobrole_count: {$ifNull:[ '$generalsettings.employer_jobrole_count',0]}}}
                                ]).toArray(function(err, settingsresult) {
                                    finalresult = {
                                        "statelist": stateresult,
                                        "districtlist": districtresult,
                                        "jobfunctionlist": jobfunctionresult,
                                        "jobrolelist": jobroleresult,
                                        "taluklist":talukresult,
                                        "employementtypelist": emptyperesult,
                                        "locationcount": settingsresult[0].employer_location_count,
                                        "jobfunctioncount": settingsresult[0].employer_jobfunction_count,
                                        "jobrolecount": settingsresult[0].employer_jobrole_count
                                    }
                                    return callback(finalresult);
                                });
                        });
                        });
                    });
                });
            });
        });
    }
    catch (e) {
        logger.error("Error in Preference Load: " + e);
    }
}
exports.GetSinglePreferenceDetails = function (logparams, emptypeparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Preference single List on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.EmployerCollectionName).find(emptypeparams, { projection: { _id: 0, preferences: 1 } }).toArray(function (err, prefresult) {
            if (prefresult.length > 0) {
                finalresult = prefresult[0].preferences;
            }
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Employer Single Perference Details " + e);
    }
}
exports.getSettings = function(logparams, callback) {
    const dbo = MongoDB.getDB();
       var finalresult = 0;
       
       logger.info("Log in Preference Getting Single Record on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate+ ", Type: " + logparams.type);     
       ////console.log(emptypeparams);
       
dbo.collection(MongoDB.settingsCollectionName).aggregate([
    {$unwind: '$generalsettings'},
    {$project: {_id:0, employer_location_count: '$generalsettings.employer_location_count', employer_jobfunction_count: '$generalsettings.employer_jobfunction_count',
    employer_jobrole_count: '$generalsettings.employer_jobrole_count'}}
    ]).toArray(function(err, settingsresult) {
        ////console.log(prefresult);
        if (err) throw err;
        if (settingsresult != null && settingsresult.length > 0)
        {
            finalresult = {
                employer_location_count: settingsresult[0].employer_location_count,
                employer_jobfunction_count: settingsresult[0].employer_jobfunction_count,
                employer_jobrole_count: settingsresult[0].employer_jobrole_count
            }
        }
        return callback(finalresult);
    });
}

exports.preferenceinsert = function (logparams, params, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Preference Save : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.query.employercode) }, { $set: { "preferences": params } }, function (err, res) {
                if (err)
                    throw err;
                    return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employee Preference Save: " + e); }
}