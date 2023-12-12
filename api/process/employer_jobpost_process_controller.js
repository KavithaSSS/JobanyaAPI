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
        dbo.collection(MongoDB.JobPackageSubscriptionCollectionName).find({ "employercode": Number(req.query.employercode), "subscriptioncode": Number(req.query.subscriptioncode), "statuscode": { $ne: objconstants.rejectedstatus } }).toArray(function (err, totalcount) {
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
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: { "employercode": Number(req.query.employercode), "subscriptioncode": Number(req.query.subscriptioncode) } },
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
        var langparams = Number(req.query.languagecode);
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
            dbo.collection(MongoDB.GenderCollectionName).aggregate([
                { $unwind: '$gender' },
                { $match: { 'gender.languagecode': langparams, statuscode: parseInt(objconstants.activestatus) } },
                {
                    $sort: {
                        gendercode: 1
                    }
                },
                {
                    $project: { _id: 0, gendercode: 1, gendername: '$gender.gendername' }
                }
            ]).toArray(function (err, genderresult) {
                dbo.collection(MongoDB.MaritalStatusCollectionName).aggregate([
                    { $unwind: '$marital' },
                    { $match: { 'marital.languagecode': langparams, statuscode: parseInt(objconstants.activestatus) } },
                    {
                        $sort: {
                            maritalcode: 1
                        }
                    },
                    {
                        $project: { _id: 0, maritalcode: 1, maritalname: '$marital.maritalname' }
                    }
                ]).toArray(function (err, maritalresult) {
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
                            dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
                                { $unwind: '$educationcategory' },
                                { $match: { "statuscode": parseInt(objconstants.activestatus), "educationcategory.languagecode": parseInt(objconstants.defaultlanguagecode) } },
                                {
                                    $sort: {
                                        ordervalue: 1
                                    }
                                },
                                {
                                    $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1, ordervalue: 1 }
                                }
                            ]).toArray(function (err, educationresult) {
                                dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                                    { $match: { "employercode": Number(req.query.employercode) } },
                                    {
                                        "$project": {
                                            _id: 0, branch: 1, industrycode: 1
                                        }
                                    }
                                ]).toArray(function (err, branchresult) {
                                    dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                                        { $unwind: '$facilities_offered' },
                                        { $match: { "employercode": Number(req.query.employercode) } },
                                        {
                                            "$lookup":
                                            {
                                                "from": String(MongoDB.FacilityCollectionName),
                                                "localField": "facilities_offered.facilitycode",
                                                "foreignField": "facilitycode",
                                                "as": "facilityinfo"
                                            }
                                        },
                                        { $unwind: '$facilityinfo' },
                                        { $unwind: '$facilityinfo.facility' },
                                        { $match: { 'facilityinfo.facility.languagecode': langparams, 'facilityinfo.statuscode': objconstants.activestatus } },
                                        {
                                            "$project": {
                                                _id: 0, facilitycode: '$facilities_offered.facilitycode', facilityname: '$facilityinfo.facility.facilityname'
                                            }
                                        }
                                    ]).toArray(function (err, facilityresult) {
                                        dbo.collection(MongoDB.SpecializationCollectionName).aggregate([
                                            { $unwind: '$specialization' },
                                            { $match: { 'specialization.languagecode': langparams, statuscode: parseInt(objconstants.activestatus) } },
                                            {
                                                $lookup:
                                                {
                                                    from: String(MongoDB.Quali_Spec_MappingCollectionName),
                                                    localField: 'specializationcode',
                                                    foreignField: 'specializationcode',
                                                    as: 'specinfo'
                                                }
                                            },
                                            { $unwind: '$specinfo' },
                                            {
                                                $sort: {
                                                    'specialization.specializationname': 1
                                                }
                                            },
                                            {
                                                $project: {
                                                    _id: 0, specializationcode: 1, educationcategorycode: '$specinfo.educationcategorycode', specializationname: '$specialization.specializationname', qualificationcode: '$specinfo.qualificationcode'
                                                }
                                            }
                                        ]).toArray(function (err, specializationresult) {
                                            dbo.collection(MongoDB.QualificationCollectionName).aggregate([
                                                { $match: params },
                                                {
                                                    $sort: {
                                                        qualificationname: 1
                                                    }
                                                },
                                                {
                                                    $project: {
                                                        _id: 0, qualificationcode: 1, educationcategorycode: 1, qualificationname: 1
                                                    }
                                                }
                                            ]).toArray(function (err, qualificationresult) {
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
                                                    dbo.collection(MongoDB.JobTypeCollectionName).aggregate([
                                                        { $unwind: '$jobtype' },
                                                        { $match: { 'jobtype.languagecode': langparams, statuscode: parseInt(objconstants.activestatus) } },
                                                        {
                                                            $sort: {
                                                                'jobtype.jobtypename': 1
                                                            }
                                                        },
                                                        {
                                                            $project: {
                                                                _id: 0, jobtypecode: 1, value: 1, jobtypename: '$jobtype.jobtypename'
                                                            }
                                                        }
                                                    ]).toArray(function (err, jobresult) {
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
                                                                    dbo.collection(String(MongoDB.SkillsMappingCollectionName)).aggregate([
                                                                        {
                                                                            $lookup:
                                                                            {
                                                                                from: String(MongoDB.SkillCollectionName),
                                                                                localField: 'skillcode',
                                                                                foreignField: 'skillcode',
                                                                                as: 'skillinfo'
                                                                            }
                                                                        },
                                                                        { $unwind: '$skillinfo' },
                                                                        { $unwind: '$skillinfo.skill' },
                                                                        { $match: { "skillinfo.statuscode": objconstants.activestatus, "skillinfo.skill.languagecode": langparams } },
                                                                        {
                                                                            $sort: {
                                                                                'skillinfo.skill.skillname': 1
                                                                            }
                                                                        },
                                                                        {
                                                                            $project: {
                                                                                _id: 0, skillcode: 1, skillname: '$skillinfo.skill.skillname', jobfunctioncode: 1, jobrolecode: 1
                                                                            }
                                                                        }

                                                                    ]).toArray(function (err, skillresult) {
                                                                        dbo.collection(MongoDB.ShiftTimingCollectionName).aggregate([
                                                                            { $unwind: '$shift' },
                                                                            { $match: { 'shift.languagecode': langparams, statuscode: parseInt(objconstants.activestatus) } },
                                                                            {
                                                                                $sort: {
                                                                                    shiftcode: 1
                                                                                }
                                                                            },
                                                                            {
                                                                                $project: { _id: 0, shiftcode: 1, shiftname: '$shift.shiftname' }
                                                                            }
                                                                        ]).toArray(function (err, shiftresult) {
                                                                            dbo.collection(MongoDB.settingsCollectionName).aggregate([
                                                                                { $unwind: { path: '$generalsettings', preserveNullAndEmptyArrays: true } },
                                                                                {
                                                                                    $project: {
                                                                                        _id: 0, employee_skill_count: { $ifNull: ['$generalsettings.employee_skill_count', 0] },
                                                                                    }
                                                                                }
                                                                            ]).toArray(function (err, settingsresult) {
                                                                            finalresult = {
                                                                                languagelist: langresult,
                                                                                genderlist: genderresult,
                                                                                shiftlist: shiftresult,
                                                                                maritallist: maritalresult,
                                                                                jobfunction: resultfunction,
                                                                                jobrole: roleresult,
                                                                                educationcategory: educationresult,
                                                                                branch: branchresult[0].branch,
                                                                                facility: facilityresult,
                                                                                specialization: specializationresult,
                                                                                qualification: qualificationresult,
                                                                                experience: experienceresult,
                                                                                skill: skillresult,
                                                                                jobtype: jobresult,
                                                                                statelist: stateresult,
                                                                                districtlist: distrctresult,
                                                                                taluklist: talukresult,
                                                                                industrycode: branchresult[0].industrycode,
                                                                                settingsresult: settingsresult
                                                                            }
                                                                            // //console.log(finalresult);
                                                                            return callback(finalresult);
                                                                        });
                                                                        })
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });

                    });
                });
            });

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
        dbo.collection(MongoDB.JobPostsCollectionName).find().sort([['jobcode', -1]]).limit(1)
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
        dbo.collection(MongoDB.JobPostsCollectionName).find({ "jobprefix": prefix }).sort([['jobserialno', -1]]).limit(1)
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
        dbo.collection(MongoDB.JobPostsCollectionName).insertOne(params, function (err, result) {
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
        dbo.collection(MongoDB.JobPostsCollectionName).find({ "jobcode": Number(req.query.jobcode) }).count(function (err, result) {
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
        dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), "statuscode": { $in: [objconstants.pendingstatus, objconstants.draftstatus] } }, { $set: params }, function (err, result) {
            if (err)
                throw err;
            console.log('modifiedCount')
            console.log(result.modifiedCount);
            console.log('matchedCount')
            console.log(result.matchedCount);
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
            if (Number(req.query.typecode) == 1) {
                var condition = {
                    $and: [{ "jobcode": Number(req.query.jobcode) },
                    { $or: [{ "statuscode": objconstants.pendingstatus }, { "statuscode": objconstants.draftstatus }] }]
                };
            }
            else if (Number(req.query.typecode) == 2) { var condition = { "jobcode": Number(req.query.jobcode), "validitydate": { $gte: currenttime } } }
            else { var condition = { "jobcode": Number(req.query.jobcode) }; }
            // //console.log(condition);
            dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
                { $unwind: "$subscriptiondetails" },
                { $match: condition },
                {
                    $project: {
                        _id: 0, jobcode: 1, jobid: 1, employercode: 1, statuscode: 1, branchcode: 1, jobfunctioncode: 1, jobrolecode: 1, industrycode: 1, skills: 1, repostjobid: 1, clonejobid: 1, jobdescription: 1, schooling: 1, afterschooling: 1,
                        experience: 1, jobtypes: 1, noofopenings: 1, worktiming: 1, shifttiming: 1, facilityoffered: 1, validitydate: 1, preferences: 1, maritalstatus: 1, gender: 1, agecriteria: 1, differentlyabled: 1, salaryrange: 1, preferredlocation: 1, preferredjoblocation: 1, languagesknown: 1, contactdetails: 1, subscriptiondetails: 1,
                        latitude: 1, longitude: 1
                        // editedsalaryrange:1,editedexperience:1,editedschooling:1,editedafterschooling:1,editedstatuscode:1 
                    }
                }
            ]).toArray(function (err, result) {
                finalresult = result;
                // //console.log(finalresult);
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
        dbo.collection(MongoDB.JobPostsCollectionName).deleteOne({
            $and: [{ "jobcode": Number(req.query.jobcode) },
            { $or: [{ "statuscode": objconstants.pendingstatus }, { "statuscode": objconstants.draftstatus }] }]
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
                    dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), statuscode: { $ne: objconstants.approvedstatus } }, { $set: { "statuscode": Number(req.query.statuscode), updateddate: currenttime, checkerid: validlog, approveddate: currenttime } }, function (err, result) {
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
                    dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), statuscode: { $ne: objconstants.inactivestatus } }, { $set: { "statuscode": Number(req.query.statuscode), updateddate: currenttime, checkerid: validlog } }, function (err, result) {
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
            var milliseconds = date.getTime();
            var newdate = new Date();
            newdate.setHours(0,0,0,0)
            var jobpostexpirydate = newdate.getTime();
            if (Number(req.query.typecode) == 1) { var condition = { "employercode": Number(req.query.employercode), "statuscode": { $in: [objconstants.pendingstatus, objconstants.draftstatus] }, 'validitydate': { $lte: currenttime } }; }
            else if (Number(req.query.typecode) == 2) { var condition = { "employercode": Number(req.query.employercode), "statuscode": objconstants.approvedstatus, 'validitydate': { $lte: currenttime } }; }
            else if (Number(req.query.typecode) == 3) { var condition = { "employercode": Number(req.query.employercode), 'validitydate': { $gte: currenttime } }; }
            else if (Number(req.query.typecode) == 4) { var condition = { "employercode": Number(req.query.employercode), 'validitydate': { $lte: currenttime } }; }
            else { var condition = { "employercode": Number(req.query.employercode) }; }
            ////console.log(condition);
            FindAllActiveEmployee(function (emplist) {
                var empcondition = {};
                var tempempcode = [];
                if (emplist != null && emplist.length > 0) {
                    for (var i = 0; i <= emplist.length - 1; i++) {
                        tempempcode.push(emplist[i].employeecode);
                    }
                    empcondition = { "$in": ["$employeecode", tempempcode] };
                }

                dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
                    { $match: condition },
                    { $unwind: "$preferredlocation" },
                    { $unwind: { path: '$preferredlocation.locationlist', preserveNullAndEmptyArrays: true } },
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
                            "localField": "preferredlocation.locationlist.locationcode",
                            "foreignField": "districtcode",
                            "as": "locationinfo"
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
                    {
                        "$lookup":
                        {
                            "from": String(MongoDB.TalukCollectionName),
                            "localField": "preferredlocation.taluklist.talukcode",
                            "foreignField": "talukcode",
                            "as": "preferredtalukinfo"
                        }
                    },
                    {
                        "$lookup":
                        {
                            "from": String(MongoDB.TalukCollectionName),
                            "localField": "preferredjoblocation.taluklist.talukcode",
                            "foreignField": "talukcode",
                            "as": "preferredjobtalukinfo"
                        }
                    },
                    // {
                    //     "$lookup": {
                    //         "from": String(MongoDB.EmployerWishListCollectionName),
                    //         "let": { "jobcode": "$jobcode" },
                    //         "pipeline": [
                    //             { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$statuscode", objconstants.wishlistedstatus] }, empcondition] } } },
                    //         ],
                    //         "as": "wishedinfo"
                    //     }
                    // },
                    // {
                    //     "$lookup":
                    //     {
                    //         "from": String(MongoDB.EmployerWishListCollectionName),
                    //         "localField": "jobcode",
                    //         "foreignField": "jobcode",
                    //         "as": "wishedinfo"
                    //     }
                    // },
                    // {
                    //     "$lookup":
                    //     {
                    //         "from": String(MongoDB.EmployeeInvitedCollectionName),
                    //         "localField": "jobcode",
                    //         "foreignField": "jobcode",
                    //         "as": "invitedinfo"
                    //     }
                    // },
                    // {
                    //     "$lookup":
                    //     {
                    //         "from": String(MongoDB.EmployeeAppliedCollectionName),
                    //         "localField": "jobcode",
                    //         "foreignField": "jobcode",
                    //         "as": "appliedinfo"
                    //     }
                    // },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployerWishListCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$statuscode", objconstants.wishlistedstatus] }, empcondition] } } },
                            ],
                            "as": "wishedinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeInvitedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, empcondition] } } },
                            ],
                            "as": "invitedinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeAppliedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, empcondition] } } },
                            ],
                            "as": "appliedinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeAppliedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$shortliststatus", 8] }, empcondition] } } },
                            ],
                            "as": "appshortlistinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeInvitedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$shortliststatus", 8] }, empcondition] } } },
                            ],
                            "as": "invshortlistinfo"
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
                    { $unwind: { path: '$wishedinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$appliedinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$invitedinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$appshortlistinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$invshortlistinfo', preserveNullAndEmptyArrays: true } },
                    { $match: { $or: [{ "locationinfo.district.languagecode": { $exists: false } }, { "locationinfo.district.languagecode": "" }, { "locationinfo.district.languagecode": Number(req.query.languagecode) }] } },
                    { $match: { $or: [{ "joblocationinfo.district.languagecode": { $exists: false } }, { "joblocationinfo.district.languagecode": "" }, { "joblocationinfo.district.languagecode": Number(req.query.languagecode) }] } },
                    { $unwind: { path: '$preferredtalukinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$preferredtalukinfo.taluk', preserveNullAndEmptyArrays: true } },
                    { $match: { $or: [{ "preferredtalukinfo.taluk.languagecode": { $exists: false } }, { "preferredtalukinfo.taluk.languagecode": "" }, { "preferredtalukinfo.taluk.languagecode": Number(req.query.languagecode) }] } },
                    { $unwind: { path: '$preferredjobtalukinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$preferredjobtalukinfo.taluk', preserveNullAndEmptyArrays: true } },
                    { $match: { $or: [{ "preferredjobtalukinfo.taluk.languagecode": { $exists: false } }, { "preferredjobtalukinfo.taluk.languagecode": "" }, { "preferredjobtalukinfo.taluk.languagecode": Number(req.query.languagecode) }] } },
                    {
                        "$group":
                        {
                            "_id": {
                                employercode: "$employercode", "statuscode": '$statuscode', "jobfunctioncode": '$jobfunctioncode', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname', "jobcode": '$jobcode',
                                "jobrolecode": '$jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename', "imageurl": '$jobfunctioninfo.imageurl',
                                "jobid": '$jobid', "salaryrange": '$salaryrange', "experience": '$experience', "locationisany": '$preferredlocation.isany', "repostjobid": "$repostjobid", "clonejobid": "$clonejobid", "validitydate": '$validitydate', "createddate": '$createddate', "subscriptiondetails": '$subscriptiondetails',
                                "matchingprofilecount": '$matchingprofilecount', "wishlistcount": '$wishlistcount', "viewedcount": '$viewedcount', "daysleft": {
                                 $ceil: {
                                        "$divide": [
                                            { "$subtract": ["$validitydate", jobpostexpirydate] },
                                            60 * 1000 * 60 * 24
                                        ]
                                    }
                                },
                               

                            },
                            "locationcode": { $addToSet: "$preferredlocation.locationlist.locationcode" }, "locationname": { $addToSet: "$locationinfo.district.districtname" },
                            "joblocationcode": { $addToSet: "$preferredjoblocation.locationlist.locationcode" }, "joblocationname": { $addToSet: "$joblocationinfo.district.districtname" }, "wishcount": { $addToSet: "$wishedinfo.employeecode" },
                            "appcount": { $addToSet: "$appliedinfo.employeecode" }, "invcount": { $addToSet: "$invitedinfo.employeecode" },
                            "appshortcount": { $addToSet: "$appshortlistinfo.employeecode" }, "invshortcount": { $addToSet: "$invshortlistinfo.employeecode" },
                            "talukcode": { $addToSet: "$preferredlocation.taluklist.talukcode" },
                            "talukname": { $addToSet: "$preferredtalukinfo.taluk.talukname" },
                            "jobtalukcode": { $addToSet: "$preferredjoblocation.taluklist.talukcode" },
                            "jobtalukname": { $addToSet: "$preferredjobtalukinfo.taluk.talukname" },
                            "appcallcount": { "$addToSet": "$appliedinfo.callcount" },
                            "invcallcount": { "$addToSet": "$invitedinfo.callcount" },
                        }
                    },

                    {
                        "$project":
                        {
                            "_id": 0, employercode: "$_id.employercode", "statuscode": "$_id.statuscode", "jobfunctioncode": '$_id.jobfunctioncode', "jobfunctionname": '$_id.jobfunctionname', "jobrolecode": '$_id.jobrolecode',
                            "jobrolename": '$_id.jobrolename', "imageurl": '$_id.imageurl', "repostjobid": '$_id.repostjobid', "clonejobid": '$_id.clonejobid', "validitydate": '$_id.validitydate', "createddate": '$_id.createddate', "subscriptiondetails": '$_id.subscriptiondetails',
                            "jobcode": '$_id.jobcode', "jobid": '$_id.jobid', "salaryrange": '$_id.salaryrange', "experience": '$_id.experience', "locationisany": '$_id.locationisany',
                            "locationcode": '$locationcode', "locationname": '$locationname', "joblocationcode": '$joblocationcode', "joblocationname": '$joblocationname', "appliedcount": { "$size": "$appcount" }, "invitedcount": { "$size": "$invcount" }, "wishedcount": { "$size": "$wishcount" },
                            "appshortlistcount": { "$size": "$appshortcount" },
                            "invshortlistcount": { "$size": "$invshortcount" }, "matchingprofilecount": { $ifNull: ['$_id.matchingprofilecount', 0] }
                            , "wishlistcount": { $ifNull: ['$_id.wishlistcount', 0] },
                            "viewedcount": { $ifNull: ['$_id.viewedcount', 0] }, "daysleft": { $ifNull: ['$_id.daysleft', 0] },
                            "talukcode": '$talukcode', "talukname": '$talukname',
                            "jobtalukcode": '$jobtalukcode', "jobtalukname": '$jobtalukname',
                            "appcallcount": { $ifNull: [ { "$sum": "$appcallcount" }, 0] },
                            "invcallcount": { $ifNull: [ { "$sum": "$invcallcount" }, 0] },
                        }
                    },
                    { $sort: { 'createddate': -1 } }
                ]).toArray(function (err, result) {
                    finalresult = result;
                    ////console.log(finalresult);
                    return callback(finalresult);
                });
            });

        });

    }
    catch (e) {
        logger.error("Error in Jobpost List :  " + e);
    }
}
exports.JobpostListInApp = function (logparams, req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var milliseconds = date.getTime();
        var newdate = new Date();
        newdate.setHours(0,0,0,0)
        var jobpostexpirydate = newdate.getTime();
        logger.info("Log in Jobpost List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var finalresult;
        objUtilities.getcurrentmilliseconds(function (currenttime) {
            if (req.query.typecode == 1) {
                if (Number(req.query.jobfunctioncode) != 0 && Number(req.query.jobrolecode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobfunctioncode": Number(req.query.jobfunctioncode),
                        "jobrolecode": Number(req.query.jobrolecode), "statuscode": { $in: [objconstants.pendingstatus, objconstants.draftstatus] }
                    };
                }
                else if (Number(req.query.jobfunctioncode) == 0 && Number(req.query.jobrolecode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobrolecode": Number(req.query.jobrolecode), "statuscode": { $in: [objconstants.pendingstatus, objconstants.draftstatus] }
                    };
                }
                else if (Number(req.query.jobrolecode) == 0 && Number(req.query.jobfunctioncode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobfunctioncode": Number(req.query.jobfunctioncode), "statuscode": { $in: [objconstants.pendingstatus, objconstants.draftstatus] }
                    };
                }
                else {
                    var condition = {
                        "employercode": Number(req.query.employercode), "statuscode": { $in: [objconstants.pendingstatus, objconstants.draftstatus] }
                    };
                }
            }
            else if (req.query.typecode == 2) {
                if (Number(req.query.jobfunctioncode) != 0 && Number(req.query.jobrolecode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobfunctioncode": Number(req.query.jobfunctioncode),
                        "jobrolecode": Number(req.query.jobrolecode), "statuscode": objconstants.approvedstatus
                    };
                }
                else if (Number(req.query.jobfunctioncode) == 0 && Number(req.query.jobrolecode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobrolecode": Number(req.query.jobrolecode), "statuscode": objconstants.approvedstatus
                    };
                }
                else if (Number(req.query.jobrolecode) == 0 && Number(req.query.jobfunctioncode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobfunctioncode": Number(req.query.jobfunctioncode), "statuscode": objconstants.approvedstatus
                    };
                }
                else {
                    var condition = {
                        "employercode": Number(req.query.employercode), "statuscode": objconstants.approvedstatus
                    };
                }
            }
            else if (req.query.typecode == 3) {
                if (Number(req.query.jobfunctioncode) != 0 && Number(req.query.jobrolecode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobfunctioncode": Number(req.query.jobfunctioncode),
                        "jobrolecode": Number(req.query.jobrolecode), 'validitydate': { $gte: currenttime }
                    };
                }
                else if (Number(req.query.jobfunctioncode) == 0 && Number(req.query.jobrolecode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobrolecode": Number(req.query.jobrolecode), 'validitydate': { $gte: currenttime }
                    };
                }
                else if (Number(req.query.jobrolecode) == 0 && Number(req.query.jobfunctioncode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobfunctioncode": Number(req.query.jobfunctioncode), 'validitydate': { $gte: currenttime }
                    };
                }
                else {
                    var condition = {
                        "employercode": Number(req.query.employercode), 'validitydate': { $gte: currenttime }
                    };
                }
            }
            else {
                if (Number(req.query.jobfunctioncode) != 0 && Number(req.query.jobrolecode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobfunctioncode": Number(req.query.jobfunctioncode),
                        "jobrolecode": Number(req.query.jobrolecode)
                    };
                }
                else if (Number(req.query.jobfunctioncode) == 0 && Number(req.query.jobrolecode) != 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobrolecode": Number(req.query.jobrolecode)
                    };
                }
                else if (Number(req.query.jobfunctioncode) != 0 && Number(req.query.jobrolecode) == 0) {
                    var condition = {
                        "employercode": Number(req.query.employercode),
                        "jobfunctioncode": Number(req.query.jobfunctioncode)
                    };
                }
                else {
                    var condition = {
                        "employercode": Number(req.query.employercode)
                    };
                }
            }
            ////console.log(condition);
            FindAllActiveEmployee(function (emplist) {
                ////console.log(emplist);
                var empcondition = {};
                var tempempcode = [];
                if (emplist != null && emplist.length > 0) {
                    for (var i = 0; i <= emplist.length - 1; i++) {
                        tempempcode.push(emplist[i].employeecode);
                    }
                    empcondition = { "$in": ["$employeecode", tempempcode] }
                }

                dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
                    { $match: condition },
                    { $unwind: "$preferredlocation" },
                    { $unwind: { path: '$preferredlocation.locationlist', preserveNullAndEmptyArrays: true } },
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
                            "localField": "preferredlocation.locationlist.locationcode",
                            "foreignField": "districtcode",
                            "as": "locationinfo"
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
                    {
                        "$lookup":
                        {
                            "from": String(MongoDB.TalukCollectionName),
                            "localField": "preferredlocation.taluklist.talukcode",
                            "foreignField": "talukcode",
                            "as": "preferredtalukinfo"
                        }
                    },
                    {
                        "$lookup":
                        {
                            "from": String(MongoDB.TalukCollectionName),
                            "localField": "preferredjoblocation.taluklist.talukcode",
                            "foreignField": "talukcode",
                            "as": "preferredjobtalukinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployerWishListCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$statuscode", objconstants.wishlistedstatus] }, empcondition] } } },
                            ],
                            "as": "wishedinfo"
                        }
                    },
                    // {
                    //     "$lookup":
                    //     {
                    //         "from": String(MongoDB.EmployerWishListCollectionName),
                    //         "localField": "jobcode",
                    //         "foreignField": "jobcode",
                    //         "as": "wishedinfo"
                    //     }
                    // },
                    // {
                    //     "$lookup":
                    //     {
                    //         "from": String(MongoDB.EmployeeInvitedCollectionName),
                    //         "localField": "jobcode",
                    //         "foreignField": "jobcode",
                    //         "as": "invitedinfo"
                    //     }
                    // },
                    // {
                    //     "$lookup":
                    //     {
                    //         "from": String(MongoDB.EmployeeAppliedCollectionName),
                    //         "localField": "jobcode",
                    //         "foreignField": "jobcode",
                    //         "as": "appliedinfo"
                    //     }
                    // },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployerWishListCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$statuscode", objconstants.wishlistedstatus] }, empcondition] } } },
                            ],
                            "as": "wishedinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeInvitedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, empcondition] } } },
                            ],
                            "as": "invitedinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeAppliedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, empcondition] } } },
                            ],
                            "as": "appliedinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeAppliedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$shortliststatus", 8] }, empcondition] } } },
                            ],
                            "as": "appshortlistinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeInvitedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$shortliststatus", 8] }, empcondition] } } },
                            ],
                            "as": "invshortlistinfo"
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
                    { $unwind: { path: '$wishedinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$appliedinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$invitedinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$appshortlistinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$invshortlistinfo', preserveNullAndEmptyArrays: true } },
                    { $match: { $or: [{ "locationinfo.district.languagecode": { $exists: false } }, { "locationinfo.district.languagecode": "" }, { "locationinfo.district.languagecode": Number(req.query.languagecode) }] } },
                    { $match: { $or: [{ "joblocationinfo.district.languagecode": { $exists: false } }, { "joblocationinfo.district.languagecode": "" }, { "joblocationinfo.district.languagecode": Number(req.query.languagecode) }] } },
                    { $unwind: { path: '$preferredtalukinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$preferredtalukinfo.taluk', preserveNullAndEmptyArrays: true } },
                    { $match: { $or: [{ "preferredtalukinfo.taluk.languagecode": { $exists: false } }, { "preferredtalukinfo.taluk.languagecode": "" }, { "preferredtalukinfo.taluk.languagecode": Number(req.query.languagecode) }] } },
                    { $unwind: { path: '$preferredjobtalukinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$preferredjobtalukinfo.taluk', preserveNullAndEmptyArrays: true } },
                    { $match: { $or: [{ "preferredjobtalukinfo.taluk.languagecode": { $exists: false } }, { "preferredjobtalukinfo.taluk.languagecode": "" }, { "preferredjobtalukinfo.taluk.languagecode": Number(req.query.languagecode) }] } },
                    {
                        "$group":
                        {
                            "_id": {
                                employercode: "$employercode", "statuscode": '$statuscode', "jobfunctioncode": '$jobfunctioncode', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname', "jobcode": '$jobcode',
                                "jobrolecode": '$jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename', "imageurl": '$jobfunctioninfo.imageurl',
                                "jobid": '$jobid', "salaryrange": '$salaryrange', "experience": '$experience', "locationisany": '$preferredlocation.isany', "repostjobid": "$repostjobid", "clonejobid": "$clonejobid", "validitydate": '$validitydate', "createddate": '$createddate', "subscriptiondetails": '$subscriptiondetails',
                                "matchingprofilecount": '$matchingprofilecount', "wishlistcount": '$wishlistcount', "viewedcount": '$viewedcount', "daysleft": {
                                    $ceil: {
                                        "$divide": [
                                            { "$subtract": ["$validitydate", jobpostexpirydate] },
                                            60 * 1000 * 60 * 24
                                        ]
                                    }
                                },
                                

                            },
                            "locationcode": { $addToSet: "$preferredlocation.locationlist.locationcode" }, "locationname": { $addToSet: "$locationinfo.district.districtname" },
                            "joblocationcode": { $addToSet: "$preferredjoblocation.locationlist.locationcode" }, "joblocationname": { $addToSet: "$joblocationinfo.district.districtname" }, "wishcount": { $addToSet: "$wishedinfo.employeecode" },
                            "appcount": { $addToSet: "$appliedinfo.employeecode" }, "invcount": { $addToSet: "$invitedinfo.employeecode" },
                            "appshortcount": { $addToSet: "$appshortlistinfo.employeecode" }, "invshortcount": { $addToSet: "$invshortlistinfo.employeecode" },
                            "talukcode": { $addToSet: "$preferredlocation.taluklist.talukcode" },
                            "talukname": { $addToSet: "$preferredtalukinfo.taluk.talukname" },
                            "jobtalukcode": { $addToSet: "$preferredjoblocation.taluklist.talukcode" },
                            "jobtalukname": { $addToSet: "$preferredjobtalukinfo.taluk.talukname" },
                            "appcallcount": { "$sum": "$appliedinfo.callcount" },
                            "invcallcount": { "$sum": "$invitedinfo.callcount" },
                        }
                    },

                    {
                        "$project":
                        {
                            "_id": 0, employercode: "$_id.employercode", "statuscode": "$_id.statuscode", "jobfunctioncode": '$_id.jobfunctioncode', "jobfunctionname": '$_id.jobfunctionname', "jobrolecode": '$_id.jobrolecode',
                            "jobrolename": '$_id.jobrolename', "imageurl": '$_id.imageurl', "repostjobid": '$_id.repostjobid', "clonejobid": '$_id.clonejobid', "validitydate": '$_id.validitydate', "createddate": '$_id.createddate', "subscriptiondetails": '$_id.subscriptiondetails',
                            "jobcode": '$_id.jobcode', "jobid": '$_id.jobid', "salaryrange": '$_id.salaryrange', "experience": '$_id.experience', "locationisany": '$_id.locationisany',
                            "locationcode": '$locationcode', "locationname": '$locationname', "joblocationcode": '$joblocationcode', "joblocationname": '$joblocationname', "appliedcount": { "$size": "$appcount" }, "invitedcount": { "$size": "$invcount" }, "wishedcount": { "$size": "$wishcount" },
                            "appshortlistcount": { "$size": "$appshortcount" },
                            "invshortlistcount": { "$size": "$invshortcount" }, "matchingprofilecount": { $ifNull: ['$_id.matchingprofilecount', 0] }
                            , "wishlistcount": { $ifNull: ['$_id.wishlistcount', 0] },
                            "viewedcount": { $ifNull: ['$_id.viewedcount', 0] },
                            "talukcode": '$talukcode', "talukname": '$talukname', "daysleft": { $ifNull: ['$_id.daysleft', 0] },
                            "jobtalukcode": '$jobtalukcode', "jobtalukname": '$jobtalukname',"appcallcount": { $ifNull: ['$appcallcount', 0] },
                            "invcallcount": { $ifNull: ['$invcallcount', 0] }
                        }
                    },
                    { $sort: { 'createddate': -1 } }
                ]).toArray(function (err, result) {
                    finalresult = result;
                    ////console.log(finalresult);
                    return callback(finalresult);
                });
            });

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
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: { "employercode": Number(req.query.employercode) } },
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
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: { "employercode": Number(req.query.employercode) } },
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
            dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), statuscode: objconstants.approvedstatus }, { $set: { "validitydate": currenttime, updateddate: currenttime } }, function (err, result) {
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
        var dbcollectionname = MongoDB.JobPostsCollectionName;
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
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $unwind: "$subscriptiondetails" },
            { $match: condition },
            {
                $project: {
                    _id: 0, jobcode: 1, jobid: 1, employercode: 1, statuscode: 1, oldstatuscode: 1, branchcode: 1, jobfunctioncode: 1, jobrolecode: 1, industrycode: 1, skills: 1, repostjobid: 1, clonejobid: 1, jobdescription: 1, schooling: 1, afterschooling: 1,
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

                    // dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode":
                    //  Number(req.query.jobcode), statuscode: { $eq: objconstants.approvedstatus } }, 
                    //  { $set: { updateddate: currenttime, checkerid: validlog, 
                    //     jobdescription: req.body.jobdescription, 
                    //     contactdetails: req.body.contactdetails,editedsalaryrange: req.body.editedsalaryrange,
                    //     editedexperience: req.body.editedexperience,editedschooling: req.body.editedschooling,
                    //     editedafterschooling: req.body.editedafterschooling,editedstatuscode: req.body.editedstatuscode } }, function (err, result) {
                    dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode": Number(req.query.jobcode), statuscode: { $eq: objconstants.approvedstatus } }, { $set: { updateddate: currenttime, checkerid: validlog, jobdescription: req.body.jobdescription, contactdetails: req.body.contactdetails } }, function (err, result) {
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
