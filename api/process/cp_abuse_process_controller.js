'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
var objConstants = require('../../config/constants');
exports.AbuseList = function (logparams, req, callback) {
    try {
        logger.info("Log in abuse List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        if (parseInt(req.query.statuscode) == 0) { var condition = {};}// { "statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { statuscode: parseInt(req.query.statuscode) }; }
        ////console.log(condition);
        dbo.collection(MongoDB.AbuseEmployerCollectionName).aggregate([
            { $match: condition },
            {
                $lookup: {
                    from: String(MongoDB.AppTypeCollectionName),
                    localField: 'apptypecode',
                    foreignField: 'apptypecode',
                    as: 'appinfo'
                }
            },
            { $unwind: "$appinfo" },
            {
                $lookup: {
                    from: String(MongoDB.EmployeeCollectionName),
                    localField: 'employeecode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: '$employeeinfo' },
            { $unwind: "$appinfo" },
            {
                $lookup: {
                    from: String(MongoDB.JobPostsCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'jobinfo'
                }
            },
            // { $unwind: '$jobinfo' },
            { $unwind: { path: '$jobinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employeeinfo.contactinfo.statecode', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employeeinfo.contactinfo.districtcode', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employeeinfo.contactinfo.talukcode', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: '$employerinfo' },
            { $unwind: { path: '$employerinfo.contactinfo.statecode', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employerinfo.contactinfo.districtcode', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$employerinfo.contactinfo.talukcode', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: String(MongoDB.StatusCollectionName),
                    localField: 'statuscode',
                    foreignField: 'statuscode',
                    as: 'statusinfo'
                }
            },
            { $unwind: "$statusinfo" },
            {
                $lookup: {
                    from: String(MongoDB.TalukCollectionName),
                    localField: 'employeeinfo.contactinfo.talukcode',
                    foreignField: 'talukcode',
                    as: 'talukinfo'
                }
            },
            { $unwind: { path: '$talukinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$talukinfo.taluk', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "talukinfo.taluk.languagecode": { $exists: false } }, { "talukinfo.taluk.languagecode": "" }, { "talukinfo.taluk.languagecode": 2 }] } },
            {
                $lookup: {
                    from: String(MongoDB.TalukCollectionName),
                    localField: 'employerinfo.contactinfo.talukcode',
                    foreignField: 'talukcode',
                    as: 'talukinfo1'
                }
            },
            { $unwind: { path: '$talukinfo1', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$talukinfo1.taluk', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "talukinfo1.taluk.languagecode": { $exists: false } }, { "talukinfo1.taluk.languagecode": "" }, { "talukinfo1.taluk.languagecode": 2 }] } },
            {
                $lookup: {
                    from: String(MongoDB.DistrictCollectionName),
                    localField: 'talukinfo.districtcode',
                    foreignField: 'districtcode',
                    as: 'districtinfo'
                }
            },
            { $unwind: { path: '$districtinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$districtinfo.district', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "districtinfo.district.languagecode": { $exists: false } }, { "districtinfo.district.languagecode": "" }, { "districtinfo.district.languagecode": 2 }] } },
            {
                $lookup: {
                    from: String(MongoDB.DistrictCollectionName),
                    localField: 'talukinfo1.districtcode',
                    foreignField: 'districtcode',
                    as: 'districtinfo1'
                }
            },
            { $unwind: { path: '$districtinfo1', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$districtinfo1.district', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "districtinfo1.district.languagecode": { $exists: false } }, { "districtinfo1.district.languagecode": "" }, { "districtinfo1.district.languagecode": 2 }] } },
            {
                $lookup: {
                    from: String(MongoDB.StateCollectionName),
                    localField: 'districtinfo.statecode',
                    foreignField: 'statecode',
                    as: 'stateinfo'
                }
            },
            { $unwind: { path: '$stateinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$stateinfo.state', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "stateinfo.state.languagecode": { $exists: false } }, { "stateinfo.state.languagecode": "" }, { "stateinfo.state.languagecode": 2 }] } },
            {
                $lookup: {
                    from: String(MongoDB.StateCollectionName),
                    localField: 'districtinfo1.statecode',
                    foreignField: 'statecode',
                    as: 'stateinfo1'
                }
            },
            { $unwind: { path: '$stateinfo1', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$stateinfo1.state', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "stateinfo1.state.languagecode": { $exists: false } }, { "stateinfo1.state.languagecode": "" }, { "stateinfo1.state.languagecode": 2 }] } },
            {
                $group:
                {
                    _id: {
                        createddate: "$createddate", employeename: '$employeeinfo.employeename', employercode: "$employercode", jobcode: "$jobcode",jobid:"$jobinfo.jobid",
                        apptypecode: "$apptypecode", abusecode: "$abusecode", employeecode: "$employeecode", registeredname: "$employerinfo.registeredname",
                        updateddate: "$updateddate", remarks:"$remarks", statusname: '$statusinfo.statusname', statuscode: "$statuscode", reportedby: '$appinfo.reportedby', reportedon: '$appinfo.reportedon'
                    },

                    employeecontactinfo: {
                        $addToSet: {
                            cityname: "$employeeinfo.contactinfo.cityname",
                            statename: "$stateinfo.state.statename",
                            statecode: "$stateinfo.statecode",
                            districtcode: "$districtinfo.districtcode",
                            districtname: "$districtinfo.district.districtname"
                        }
                    },
                    employercontactinfo: {
                        $addToSet: {
                            cityname: "$employerinfo.contactinfo.cityname",
                            statename: "$stateinfo1.state.statename",
                            statecode: "$stateinfo1.statecode",
                            districtcode: "$districtinfo1.districtcode",
                            districtname: "$districtinfo1.district.districtname"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0, apptypecode: "$_id.apptypecode", abusecode: "$_id.abusecode", employeecode: "$_id.employeecode", jobcode: "$_id.jobcode",jobid: "$_id.jobid", createddate: "$_id.createddate", reportedby: "$_id.reportedby", reportedon: "$_id.reportedon",
                    updateddate: "$_id.updateddate",remarks: "$_id.remarks", employeename: "$_id.employeename", statuscode: "$_id.statuscode", registeredname: "$_id.registeredname",
                    employercode: "$_id.employercode", statusname: '$_id.statusname', employeecontactinfo: "$employeecontactinfo", employercontactinfo: "$employercontactinfo"
                }
            }]).toArray(function (err, result) {
                finalresult = result;
                //console.log(finalresult);
                return callback(finalresult);
            });
    }
    catch (e) {
        logger.error("Error in Abuse reporting list- Abuse " + e);
    }
}
exports.UpdateStatuscode = function (logparams, params, req, callback) {
    try {
        var date = new Date();
        var milliseconds = date.getTime();
        logger.info("Log in Update Remarks : " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // //console.log(params);
        dbo.collection(MongoDB.AbuseEmployerCollectionName).findOneAndUpdate(params, { $set: { "statuscode": Number(req.body.statuscode), "updateddate": milliseconds, "remarks": req.body.remarks } }, function (err, res) {
            if (err) {
                return callback(false);
            }
            else {
                return callback(res.lastErrorObject.updatedExisting);
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Remarks - Abuse " + e);
    }
}
exports.UpdateStatuscodeInEmployee = function (logparams, employeeparams, statuscode, callback) {
    try {
        var date = new Date();
        var milliseconds = date.getTime();
        logger.info("Log in Update Statuscode In employee: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.EmployeeCollectionName).findOneAndUpdate(employeeparams, { $set: { "statuscode": Number(statuscode), "updatedate": milliseconds } }, function (err, res) {
            if (err) {
                return callback(false);
            }
            else {
                return callback(res.lastErrorObject.updatedExisting);
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Statuscode - employee " + e);
    }
}
exports.UpdateStatuscodeInEmployer = function (logparams, employerparams, statuscode, callback) {
    try {
        var date = new Date();
        var milliseconds = date.getTime();
        logger.info("Log in Update Statuscode In employee: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        ////console.log(employerparams);
        dbo.collection(MongoDB.EmployerCollectionName).findOneAndUpdate(employerparams, { $set: { "statuscode": Number(statuscode), "updatedate": milliseconds } }, function (err, res) {
            if (err) {
                return callback(false);
            }
            else {
                return callback(res.lastErrorObject.updatedExisting);
            }
        });
    }
    catch (e) {
        logger.error("Error in Update Statuscode - employer " + e);
    }
}