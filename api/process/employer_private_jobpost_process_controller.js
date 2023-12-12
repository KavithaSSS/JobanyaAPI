'use strict';
const objUtilities = require("../controller/utilities");
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objconstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
var date = new Date();
exports.PostedTotalCount = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Find Posted total count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).find({ "usercode": Number(req.query.usercode), "subscriptioncode": Number(req.query.subscriptioncode), "statuscode": { $ne: objconstants.rejectedstatus } }).toArray(function (err, totalcount) {
            if (err)
                throw err;
            // //console.log(totalcount[0].allowedposts);
            if (totalcount != 0 && totalcount.length > 0) {
                // //console.log(totalcount[0].allowedposts);
                return callback(totalcount[0].allowedposts);
            }
            else {
                return callback(0);
            }
        });
    }
    catch (e) {
        logger.error("Error in Posted Total count: " + e);
    }
}
exports.PostedCount = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Find Posted count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
            { $match: { "usercode": Number(req.query.usercode), "subscriptioncode": Number(req.query.subscriptioncode) } },
            {
                "$project": {
                    _id: 0, jobcode: 1
                }
            }
        ]).toArray(function (err, finalcount) {
            // //console.log(finalcount[0].subscriptioncode);
            if (finalcount != 0 && finalcount.length > 0) {
                // //console.log(finalcount[0].subscriptioncode);
                return callback(finalcount.length);
            }
            else {
                return callback(0);
            }


        });
    }
    catch (e) {
        logger.error("Error in Posted count: " + e);
    }
}
exports.FormLoad = function (logparams, req, callback) {
    try {
        var finalresult;
        const dbo = MongoDB.getDB();
        logger.info("Log in job Post Form Load : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var langparams = objconstants.defaultlanguagecode;
        var params = { statuscode: parseInt(objconstants.activestatus) }
        objUtilities.getLanguageDetails(logparams, function (languageresult) {

            var langresult = [];
            var knowntypeadd = [
                { "knownto": "read", "status": objconstants.defaultdisablecode },
                { "knownto": "write", "status": objconstants.defaultdisablecode },
                { "knownto": "speak", "status": objconstants.defaultdisablecode }
            ];
            for (var i = 0; i <= languageresult.length - 1; i++) {
                langresult[i] = {
                    "languagecode": languageresult[i].languagecode,
                    "languagename": languageresult[i].languagename,
                    "displayname": languageresult[i].language,
                    "status": objconstants.defaultdisablecode,
                    "knowntype": knowntypeadd
                }
            }
            var statuscondition = { "statuscode": { $in: [objconstants.pendingstatus, objconstants.approvedstatus] } }
            dbo.collection(MongoDB.StatusCollectionName).aggregate([
                { $match: statuscondition },
                // { $unwind: '$statuslist' },
                // { $match: { 'statuslist.statuscode': { $in: [objconstants.pendingstatus, objconstants.approvedstatus] } } },
                // {
                //     $sort: {
                //         'statuslist.statusname': 1
                //     }
                // },
                {
                    $project: {
                        _id: 0, statuscode: 1, statusname: 1
                    }
                }
            ]).toArray(function (err, statuscodelist) {
                dbo.collection(MongoDB.JobFunctionCollectionName).aggregate([
                    { $unwind: '$jobfunction' },
                    { $match: { 'jobfunction.languagecode': langparams, statuscode: parseInt(objconstants.activestatus) } },
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
                ]).toArray(function (err, resultfunction) {
                    dbo.collection(MongoDB.JobRoleCollectionName).aggregate([
                        { $unwind: '$jobrole' },
                        { $match: { 'jobrole.languagecode': langparams, statuscode: parseInt(objconstants.activestatus) } },
                        {
                            $sort: {
                                'jobrole.jobrolename': 1
                            }
                        },
                        {
                            $project: {
                                _id: 0, jobrolecode: 1, jobfunctioncode: 1, jobrolename: '$jobrole.jobrolename'
                            }
                        }
                    ]).toArray(function (err, roleresult) {
                        dbo.collection(MongoDB.ExperienceCollectionName).aggregate([
                            { $match: params },
                            {
                                $sort: {
                                    experiencename: 1
                                }
                            },
                            {
                                $project: {
                                    _id: 0, experiencecode: 1, value: 1, experiencename: 1
                                }
                            }
                        ]).toArray(function (err, experienceresult) {
                            dbo.collection(MongoDB.StateCollectionName).aggregate([
                                { $unwind: '$state' },
                                { $match: { 'state.languagecode': langparams, statuscode: parseInt(objconstants.activestatus) } },
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
                                dbo.collection(MongoDB.DistrictCollectionName).aggregate([
                                    { $unwind: '$district' },
                                    { $match: { 'district.languagecode': langparams, statuscode: parseInt(objconstants.activestatus) } },
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
                                ]).toArray(function (err, distrctresult) {
                                    var talukparams = { statuscode: objconstants.activestatus, 'taluk.languagecode': langparams };
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
                                                _id: 0, talukcode: 1, talukname: '$taluk.talukname', statecode: 1, districtcode: 1
                                            }
                                        }
                                    ]).toArray(function (err, talukresult) {
                                        finalresult = {
                                            statuscodelist: statuscodelist,
                                            languagelist: langresult,
                                            jobfunction: resultfunction,
                                            jobrole: roleresult,
                                            experience: experienceresult,
                                            statelist: stateresult,
                                            districtlist: distrctresult,
                                            taluklist: talukresult,
                                        }
                                        return callback(finalresult);
                                    });
                                });
                            });
                        });
                    });
                });
            })
        });
    }
    catch (e) {
        logger.error("Error in Job post FormLoad: " + e);
    }
}
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).find().sort([['jobcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].jobcode + 1;

                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - jobpost " + e); }
}

exports.generateJobId = function (logparams, prefix, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).find({ "jobprefix": prefix }).sort([['jobserialno', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].jobserialno + 1;

                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - jobpost " + e); }
}
exports.InsertJobpost = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Insert jobpost : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).insertOne(params, function (err, result) {
            if (err)
                throw err;
            ////console.log(result.insertedCount);
            return callback(result.insertedCount);
        });
    }
    catch (e) {
        logger.error("Error in Insert jobpost: " + e);
    }

}
exports.FindJobpostcodeExists = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Find jobcode  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        // //console.log(req.query.jobcode);
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).find({ "jobcode": Number(req.query.jobcode) }).count(function (err, result) {
            if (err)
                throw err;
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) {
        logger.error("Error in Find jobcode  : " + e);
    }
}
exports.UpdateJobpostDetails = function (logparams, req, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Update jobpost : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(params);
        ////console.log(objconstants.pendingstatus);
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), "statuscode": { $in: [objconstants.pendingstatus, objconstants.draftstatus] } }, { $set: params }, function (err, result) {
            if (err)
                throw err;
            ////console.log(result.modifiedCount);
            return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
        });
    }
    catch (e) {
        logger.error("Error in Update jobpost: " + e);
    }

}
exports.EditLoadByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in Edit load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            // if (Number(req.query.typecode) == 1) {
            var condition = {
                $and: [{ "jobcode": Number(req.query.jobcode) }]
            };
            // }
            // else if (Number(req.query.typecode) == 2) { var condition = { "jobcode": Number(req.query.jobcode), "validitydate": { $gte: currenttime } } }
            // else { var condition = { "jobcode": Number(req.query.jobcode) }; }
            // //console.log(condition);
            dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                // { $unwind: "$subscriptiondetails" },
                { $match: condition },
                {
                    $project: {
                        _id: 0, jobcode: 1, jobid: 1, usercode: 1, statuscode: 1, branchcode: 1, jobfunctioncode: 1, jobrolecode: 1, industrycode: 1, skills: 1, repostjobid: 1, clonejobid: 1, jobdescription: 1, schooling: 1, afterschooling: 1,
                        experience: 1, jobtypes: 1, noofopenings: 1, worktiming: 1, shifttiming: 1, facilityoffered: 1, validitydate: 1, preferences: 1, maritalstatus: 1, gender: 1, agecriteria: 1, differentlyabled: 1, salaryrange: 1, preferredlocation: 1, preferredjoblocation: 1, languagesknown: 1, contactdetails: 1, subscriptiondetails: 1,
                        latitude: 1, longitude: 1, issendnotification: 1, isbestsalary: 1
                        // editedsalaryrange:1,editedexperience:1,editedschooling:1,editedafterschooling:1,editedstatuscode:1 
                    }
                }
            ]).toArray(function (err, result) {
                finalresult = result;
                console.log(finalresult);
                return callback(finalresult);
            });
        });

    }
    catch (e) { logger.error("Error in Edit load List - Jobpost" + e); }
}
exports.DeleteJobpostDetails = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Delete jobpost : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).deleteOne({
            $and: [{ "jobcode": Number(req.query.jobcode) }]
        }, function (err, result) {
            if (err)
                throw err;
            ////console.log(result.deletedCount);
            return callback(result.deletedCount);
        });
    }
    catch (e) {
        logger.error("Error in Delete jobpost: " + e);
    }
}
exports.UpdateApprovedStatuscodeInjobpost = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            logger.info("Log in Update Active Statuscode : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
            objUtilities.InsertLog(logparams, function (validlog) {
                if (validlog != null && validlog != 0) {
                    dbo.collection(MongoDB.PrivateJobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), statuscode: { $ne: objconstants.approvedstatus } }, { $set: { "statuscode": Number(req.query.statuscode), updateddate: currenttime, checkerid: validlog, approveddate: currenttime } }, function (err, result) {
                        if (err)
                            throw err;
                        // //console.log(result.modifiedCount);
                        return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
                    });
                }

            });
        });


    }
    catch (e) {
        logger.error("Error in Update Active Statuscode in Jobpost :  " + e);
    }

}
exports.UpdateInactiveStatuscodeInjobpost = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            logger.info("Log in Update Inactive Statuscode : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
            objUtilities.InsertLog(logparams, function (validlog) {
                if (validlog != null && validlog != 0) {
                    dbo.collection(MongoDB.PrivateJobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), statuscode: { $ne: objconstants.inactivestatus } }, { $set: { "statuscode": Number(req.query.statuscode), updateddate: currenttime, checkerid: validlog } }, function (err, result) {
                        if (err)
                            throw err;
                        // //console.log(result.modifiedCount);
                        return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
                    });
                }
            });
        });

    }
    catch (e) {
        logger.error("Error in Update Inactive Statuscode in Jobpost :  " + e);
    }

}

function FindAllActiveEmployee(callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "statuscode": Number(objconstants.activestatus) };
        ////console.log(params)
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: params },
            {
                $project: {
                    _id: 0, employeecode: 1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Find all employee- sendsms " + e);
    }
}

exports.JobpostListPortal = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Jobpost List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var finalresult;
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            var fromdate = parseFloat(req.body.fromdate);
            var todate = parseFloat(req.body.todate);
            var condition = {}
            if (Number(req.body.statuscode) == 0) {
                condition = { "$and": [{ "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
            } else {
                condition = { "$and": [{ "statuscode": Number(req.body.statuscode) }, { "createddate": { $gte: fromdate } }, { "createddate": { $lte: todate } }] };
            }
            // FindAllActiveEmployee(function (emplist) {
            dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
                { $match: condition },
                {
                    "$lookup":
                    {
                        "from": String(MongoDB.JobFunctionCollectionName),
                        "localField": "jobfunctioncode",
                        "foreignField": "jobfunctioncode",
                        "as": "jobfunctioninfo"
                    }
                },
                {
                    "$lookup":
                    {
                        "from": String(MongoDB.JobRoleCollectionName),
                        "localField": "jobrolecode",
                        "foreignField": "jobrolecode",
                        "as": "jobroleinfo"
                    }
                },

                {
                    "$lookup":
                    {
                        "from": String(MongoDB.DistrictCollectionName),
                        "localField": "preferredjoblocation.locationlist.locationcode",
                        "foreignField": "districtcode",
                        "as": "joblocationinfo"
                    }
                },
                { $unwind: "$jobfunctioninfo" },
                { $unwind: "$jobfunctioninfo.jobfunction" },
                { $match: { "jobfunctioninfo.jobfunction.languagecode": Number(req.query.languagecode) } },
                { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
                { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(req.query.languagecode) }] } },
                { $unwind: { path: '$locationinfo', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$locationinfo.district', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$joblocationinfo', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$joblocationinfo.district', preserveNullAndEmptyArrays: true } },
                // { $unwind: { path: '$wishedinfo', preserveNullAndEmptyArrays: true } },
                // { $unwind: { path: '$appliedinfo', preserveNullAndEmptyArrays: true } },
                // { $unwind: { path: '$invitedinfo', preserveNullAndEmptyArrays: true } },
                // { $unwind: { path: '$appshortlistinfo', preserveNullAndEmptyArrays: true } },
                // { $unwind: { path: '$invshortlistinfo', preserveNullAndEmptyArrays: true } },
                { $match: { $or: [{ "locationinfo.district.languagecode": { $exists: false } }, { "locationinfo.district.languagecode": "" }, { "locationinfo.district.languagecode": Number(req.query.languagecode) }] } },
                { $match: { $or: [{ "joblocationinfo.district.languagecode": { $exists: false } }, { "joblocationinfo.district.languagecode": "" }, { "joblocationinfo.district.languagecode": Number(req.query.languagecode) }] } },
                // { $unwind: { path: '$preferredtalukinfo', preserveNullAndEmptyArrays: true } },
                // { $unwind: { path: '$preferredtalukinfo.taluk', preserveNullAndEmptyArrays: true } },
                // { $match: { $or: [{ "preferredtalukinfo.taluk.languagecode": { $exists: false } }, { "preferredtalukinfo.taluk.languagecode": "" }, { "preferredtalukinfo.taluk.languagecode": Number(req.query.languagecode) }] } },
                // { $unwind: { path: '$preferredjobtalukinfo', preserveNullAndEmptyArrays: true } },
                // { $unwind: { path: '$preferredjobtalukinfo.taluk', preserveNullAndEmptyArrays: true } },
                // { $match: { $or: [{ "preferredjobtalukinfo.taluk.languagecode": { $exists: false } }, { "preferredjobtalukinfo.taluk.languagecode": "" }, { "preferredjobtalukinfo.taluk.languagecode": Number(req.query.languagecode) }] } },
                {
                    "$group":
                    {
                        "_id": {
                            isbestsalary: { $ifNull: ['$isbestsalary', 0] },
                            viewedcount: { $ifNull: ['$viewedcount', 0] }, dialedcount: { $ifNull: ['$dialedcount', 0] }, pushedcount: { $ifNull: ['$pushedcount', 0] },
                            usercode: "$usercode", "contactdetails": "$contactdetails", "contactdetails": "$contactdetails", "statuscode": '$statuscode', "jobfunctioncode": '$jobfunctioncode', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname', "jobcode": '$jobcode',
                            "jobrolecode": '$jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename', "imageurl": '$jobfunctioninfo.imageurl',
                            "jobid": '$jobid', "salaryrange": '$salaryrange', "experience": '$experience', "locationisany": '$preferredlocation.isany', "validitydate": '$validitydate', "createddate": '$createddate',"updateddate": '$updateddate',
                        },
                        // "locationcode": { $addToSet: "$preferredlocation.locationlist.locationcode" }, "locationname": { $addToSet: "$locationinfo.district.districtname" },
                        "joblocationcode": { $addToSet: "$preferredjoblocation.locationlist.locationcode" }, "joblocationname": { $addToSet: "$joblocationinfo.district.districtname" }, "wishcount": { $addToSet: "$wishedinfo.employeecode" },
                        // "appcount": { $addToSet: "$appliedinfo.employeecode" }, "invcount": { $addToSet: "$invitedinfo.employeecode" },
                        // "appshortcount": { $addToSet: "$appshortlistinfo.employeecode" }, "invshortcount": { $addToSet: "$invshortlistinfo.employeecode" },
                        // "talukcode": { $addToSet: "$preferredlocation.taluklist.talukcode" },
                        // "talukname": { $addToSet: "$preferredtalukinfo.taluk.talukname" },
                        // "jobtalukcode": { $addToSet: "$preferredjoblocation.taluklist.talukcode" },
                        // "jobtalukname": { $addToSet: "$preferredjobtalukinfo.taluk.talukname" },
                    }
                },

                {
                    "$project":
                    {
                        "isbestsalary": "$_id.isbestsalary",
                        "viewedcount": "$_id.viewedcount", "dialedcount": "$_id.dialedcount", "pushedcount": "$_id.pushedcount",
                        "_id": 0, usercode: "$_id.usercode", "contactdetails": "$_id.contactdetails", "statuscode": "$_id.statuscode", "jobfunctioncode": '$_id.jobfunctioncode', "jobfunctionname": '$_id.jobfunctionname', "jobrolecode": '$_id.jobrolecode',
                        "jobrolename": '$_id.jobrolename', "imageurl": '$_id.imageurl', "validitydate": '$_id.validitydate', "createddate": '$_id.createddate', "updateddate": '$_id.updateddate',
                        "jobcode": '$_id.jobcode', "jobid": '$_id.jobid', "salaryrange": '$_id.salaryrange', "experience": '$_id.experience', "locationisany": '$_id.locationisany',
                        "locationcode": '$locationcode', "locationname": '$locationname', "joblocationcode": '$joblocationcode', "joblocationname": '$joblocationname',
                        "talukcode": '$talukcode', "talukname": '$talukname',
                        "jobtalukcode": '$jobtalukcode', "jobtalukname": '$jobtalukname'
                    }
                },
                { $sort: { 'createddate': -1 } }
            ]).toArray(function (err, result) {
                finalresult = result;
                // console.log(finalresult);
                return callback(finalresult);
            });
            // });
        });

    }
    catch (e) {
        logger.error("Error in Jobpost List :  " + e);
    }
}
exports.JobfunctionList = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Job function list In Jobpost : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
            { $match: { "usercode": Number(req.query.usercode) } },
            {
                $lookup: {
                    from: String(MongoDB.JobFunctionCollectionName),
                    let: {
                        jobfuncode: "$jobfunctioncode"
                    },
                    pipeline: [{ $unwind: '$jobfunction' },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            "$jobfunctioncode",
                                            "$$jobfuncode"
                                        ]
                                    },
                                    {
                                        $eq: [
                                            "$jobfunction.languagecode",
                                            objconstants.defaultlanguagecode
                                        ]
                                    },
                                    {
                                        $eq: [
                                            "$statuscode",
                                            objconstants.activestatus
                                        ]
                                    }

                                ]
                            }
                        }
                    }
                    ],
                    as: "result"
                }
            },
            { $unwind: '$result' },
            { $group: { _id: { jobfunctioncode: '$jobfunctioncode', jobfunctionname: '$result.jobfunction.jobfunctionname' }, "jobcount": { "$sum": 1 } } },
            {
                "$project": {
                    _id: 0,
                    "jobfunctioncode": '$_id.jobfunctioncode', jobfunctionname: '$_id.jobfunctionname', "jobfunctioncount": '$jobcount'
                }
            }
        ]).toArray(function (err, result) {
            // //console.log(result);
            return callback(result);
        });
    }
    catch (e) {
        logger.error("Error in Job function list in Jobpost :  " + e);
    }
}
exports.JobRoleList = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Job Role list In Jobpost : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
            { $match: { "usercode": Number(req.query.usercode) } },
            {
                $lookup: {
                    from: String(MongoDB.JobRoleCollectionName),
                    let: {
                        jobcode: "$jobrolecode"
                    },
                    pipeline: [{ $unwind: '$jobrole' },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            "$jobrolecode",
                                            "$$jobcode"
                                        ]
                                    },
                                    {
                                        $eq: [
                                            "$jobrole.languagecode",
                                            objconstants.defaultlanguagecode
                                        ]
                                    },
                                    {
                                        $eq: [
                                            "$statuscode",
                                            objconstants.activestatus
                                        ]
                                    }

                                ]
                            }
                        }
                    }
                    ],
                    as: "result"
                }
            },
            { $unwind: '$result' },
            { $group: { _id: { jobrolecode: '$jobrolecode', jobrolename: '$result.jobrole.jobrolename' }, "jobrolecount": { "$sum": 1 } } },
            {
                "$project": {
                    _id: 0,
                    "jobrolecode": '$_id.jobrolecode', jobrolename: '$_id.jobrolename', "jobrolecount": '$jobrolecount'
                }
            }
        ]).toArray(function (err, result) {
            // //console.log(result);
            return callback(result);
        });
    }
    catch (e) {
        logger.error("Error in Job Role list in Jobpost :  " + e);
    }
}
exports.UpdateValidate = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            logger.info("Log in Update validitydate: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
            dbo.collection(MongoDB.PrivateJobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), statuscode: objconstants.approvedstatus }, { $set: { "validitydate": currenttime, updateddate: currenttime } }, function (err, result) {
                if (err)
                    throw err;
                // //console.log(result.modifiedCount);
                return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
            });
        });

    }
    catch (e) {
        logger.error("Error in Update validitydate in Jobpost :  " + e);
    }
}

/* exports.getJobCount = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Log in Getting Job Count : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var dbcollectionname = MongoDB.PrivateJobPostsCollectionName;
        var blockcount, pendingcount, rejectedcount;
        var activeparams = { "statuscode": objConstants.approvedstatus }
        var inactiveparams = { "statuscode": objConstants.inactivestatus }
        dbo.collection(String(dbcollectionname)).find(activeparams, { projection: { _id: 0, jobcode: 1 } }).toArray(function (err, result) {
          activecount = result.length;
          dbo.collection(String(dbcollectionname)).find(inactiveparams, { projection: { _id: 0, jobcode: 1 } }).toArray(function (err, resultnext) {
            inactivecount = resultnext.length;
            var blockparams = {"statuscode": objConstants.blockstatus};
            dbo.collection(String(dbcollectionname)).find(blockparams, { projection: { _id: 0, jobcode: 1 } }).toArray(function (err, resultblock) {
            blockcount = resultblock.length;
            var pendingparams = {"statuscode": objConstants.pendingstatus};
            dbo.collection(String(dbcollectionname)).find(pendingparams, { projection: { _id: 0, jobcode: 1 } }).toArray(function (err, resultpending) {
              pendingcount = resultpending.length;
              var rejectedparams = {"statuscode": objConstants.rejectedstatus};
            dbo.collection(String(dbcollectionname)).find(rejectedparams, { projection: { _id: 0, jobcode: 1 } }).toArray(function (err, resultrejected) {
              rejectedcount = resultrejected.length;
            totalcount = activecount + inactivecount + blockcount+ pendingcount + rejectedcount;
            var finalresult = [];
            finalresult.push(activecount);
            finalresult.push(inactivecount);
            finalresult.push(blockcount);
            finalresult.push(pendingcount);
            finalresult.push(rejectedcount);
            finalresult.push(totalcount);
            ////console.log(finalresult);
            return callback(finalresult);
            });
            });
          });
        });
      });
    }
    catch (e) {
        logger.error("Error in Getting Job Count :  " + e);
    }
} */

exports.ViewJob = function (logparams, jobcode, callback) {
    try {
        //logger.info("Log in Edit load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var condition = { "jobcode": Number(jobcode) };
        // //console.log(condition);
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
            { $unwind: "$subscriptiondetails" },
            { $match: condition },
            {
                $project: {
                    _id: 0, jobcode: 1, jobid: 1, usercode: 1, statuscode: 1, oldstatuscode: 1, branchcode: 1, jobfunctioncode: 1, jobrolecode: 1, industrycode: 1, skills: 1, repostjobid: 1, clonejobid: 1, jobdescription: 1, schooling: 1, afterschooling: 1,
                    experience: 1, jobtypecode: 1, noofopenings: 1, worktiming: 1, shifttiming: 1, facilityoffered: 1, validitydate: 1, preferences: 1, maritalstatus: 1, gender: 1, agecriteria: 1, differentlyabled: 1, salaryrange: 1, preferredlocation: 1, languagesknown: 1, contactdetails: 1, subscriptiondetails: 1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in View Job - Jobpost" + e); }
}


exports.UpdatejobpostAfterApproval = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            logger.info("Log in Update Job Post After Approval : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
            objUtilities.InsertLog(logparams, function (validlog) {
                if (validlog != null && validlog != 0) {

                    // dbo.collection(MongoDB.PrivateJobPostsCollectionName).updateOne({ "jobcode":
                    //  Number(req.query.jobcode), statuscode: { $eq: objconstants.approvedstatus } }, 
                    //  { $set: { updateddate: currenttime, checkerid: validlog, 
                    //     jobdescription: req.body.jobdescription, 
                    //     contactdetails: req.body.contactdetails,editedsalaryrange: req.body.editedsalaryrange,
                    //     editedexperience: req.body.editedexperience,editedschooling: req.body.editedschooling,
                    //     editedafterschooling: req.body.editedafterschooling,editedstatuscode: req.body.editedstatuscode } }, function (err, result) {
                    dbo.collection(MongoDB.PrivateJobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), statuscode: { $eq: objconstants.approvedstatus } }, { $set: { updateddate: currenttime, checkerid: validlog, jobdescription: req.body.jobdescription, contactdetails: req.body.contactdetails } }, function (err, result) {
                        if (err)
                            throw err;
                        // console.log(result.modifiedCount);

                        if (err)
                            throw err;
                        // console.log(result.modifiedCount);
                        return callback(result.modifiedCount == 0 ? result.matchedCount : result.modifiedCount);
                    });
                }

            });
        });


    }
    catch (e) {
        logger.error("Error in Update job post after approval :  " + e);
    }

}
