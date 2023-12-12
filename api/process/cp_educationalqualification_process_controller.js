'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
// const { defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.QualificationCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbeducatcollectionname = MongoDB.EduCategoryCollectionName;
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['qualificationcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].qualificationcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code -Qualification " + e); }
}

exports.checkQualificationCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking qualification code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "qualificationcode": parseInt(req.query.qualificationcode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking qualification code - qualification" + e); }
}
exports.checkQualificationNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking qualification name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        //var regex = new RegExp("^" + req.body.qualificationname.toLowerCase(), "i");
        dbo.collection(String(dbcollectionname)).find({ "qualificationname": {$regex:"^"+req.body.qualificationname.toLowerCase()+"$",$options:'i'}, "educationcategorycode": parseInt(req.body.educationcategorycode), "qualificationcode": { $ne: parseInt(req.query.qualificationcode) } }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking qualification name by code - qualification" + e); }
}
exports.InsertQualificationDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in qualification create by qualification Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).insertOne(params, function (err, res) {
                if (err) throw err;
                finalresult = res.insertedCount;
                ////console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in create - qualification" + e); }
}
exports.updateQualificationDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in qualification update by qualification Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).replaceOne({ "qualificationcode": parseInt(params.qualificationcode) }, params, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - qualification" + e); }
}
exports.checkQualificationCodeExistsInMapping = function (logparams, params, callback) {
    try {
        logger.info("Log in checking Qulaification Code in mapping: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.Quali_Spec_MappingCollectionName).find({ "qualificationcode": parseInt(params.qualificationcode) }, { $exists: true }).count(function (err, qualificationcount) //find if a value exists
        {
            return callback(qualificationcount);
        });
    }
    catch (e) { logger.error("Error in checking Qualification Code in mapping - educationqualification" + e); }
}
exports.deleteQualificationDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in qualification Delete by qualification Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "qualificationcode": parseInt(params.qualificationcode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - qualification" + e); }
}
exports.getQualificationSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in qualification List by qualification Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "qualificationcode": parseInt(params.query.qualificationcode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - qualification" + e); }
}
exports.getQualificationSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in qualification List by qualification Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "qualificationcode": parseInt(params.qualificationcode) }, { projection: { _id: 0, educationcategorycode: 1, qualificationcode: 1, qualificationname: 1, statuscode: 1 } }).toArray(function (err, result) {
            finalresult = result;
            // //console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - qualification" + e); }
}
exports.getQualificationFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        /* dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
            { $match: { statuscode: parseInt(objConstants.activestatus) } },
            {
                $sort: {
                    ordervalue: 1
                }
            },
            {
                $project: { _id: 0, educationcategorycode: 1, educationcategoryname: 1, typecode: 1 , ordervalue:1}
            }
        ]) */
        dbo.collection(MongoDB.EduCategoryCollectionName).aggregate([
			{ $unwind: '$educationcategory'},
            { $match: { "statuscode": parseInt(objConstants.activestatus), "educationcategory.languagecode": parseInt(objConstants.defaultlanguagecode) } },
            {
                $sort: {
                    ordervalue: 1
                }
            },
            {
                $project: { _id: 0, educationcategorycode: 1, educationcategoryname: '$educationcategory.educationcategoryname', typecode: 1 , ordervalue:1}
            }
        ]).toArray(function (err, result) {
            return callback(result);
        });
    }
    catch (e) { logger.error("Error in form load list - qualification " + e); }
}

exports.getQualificationList = function (logparams, params, callback) {
    try {
        logger.info("Log in user List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        if (params.statuscode == 0) {
            dbo.collection(String(dbcollectionname)).aggregate([
                { $match: { statuscode: parseInt(params.statuscode), statuscode: { $ne: objConstants.deletestatus } } },
                {
                    $lookup:
                    {
                        from: String(dbeducatcollectionname),
                        localField: 'educationcategorycode',
                        foreignField: 'educationcategorycode',
                        as: 'category'
                    }

                },
                { $unwind: '$category' },
                { $unwind: '$category.educationcategory' },
                { $match: { "category.statuscode": parseInt(objConstants.activestatus), "category.educationcategory.languagecode": parseInt(objConstants.defaultlanguagecode) } },
                {
                    $lookup:
                    {
                        from: String(dbstatuscollectionname),
                        localField: 'statuscode',
                        foreignField: 'statuscode',
                        as: 'status'
                    }
                },
                { $unwind: '$status' },
                {
                    $sort: {
                        createddate: -1
                    }
                },
                {
                    $project: {
                        _id: 0, qualificationcode: 1, educationcategorycode: 1, educationcategoryname: '$category.educationcategory.educationcategoryname', qualificationname: 1, statuscode: 1, statusname: '$status.statusname'
                    }
                }
            ]).toArray(function (err, result) {
                finalresult = result;
                return callback(finalresult);
            });
        }
        else {
            dbo.collection(String(dbcollectionname)).aggregate([
                { $match: { statuscode: parseInt(params.statuscode) } },
                {
                    $lookup:
                    {
                        from: String(dbeducatcollectionname),
                        localField: 'educationcategorycode',
                        foreignField: 'educationcategorycode',
                        as: 'category'
                    }
                },
                { $unwind: '$category' },
                {
                    $lookup:
                    {
                        from: String(dbstatuscollectionname),
                        localField: 'statuscode',
                        foreignField: 'statuscode',
                        as: 'status'
                    }
                },
                { $unwind: '$status' },
                {
                    $project: {
                        _id: 0, qualificationcode: 1, educationcategorycode: 1, educationcategoryname: '$category.educationcategoryname', qualificationname: 1, statuscode: 1, status: '$status.statusname'
                    }
                }
            ]).toArray(function (err, result) {
                finalresult = result;
                return callback(finalresult);
            });
        }
    }
    catch (e) { logger.error("Error in List - qualification" + e); }
}
exports.DulicateCheckQualification = function (logparams, ArrayObj, params, callback) {
    try {
        logger.info("Log in checking single qualification : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        QualificationSaveIteration(ArrayObj, params, function (err, totalcount) {
            if (err) {
                return;
            }
            return callback(totalcount);
        });
    }
    catch (e) { logger.error("Error in checking qulification - qulification" + e); }
}
var async = require('async');
function QualificationSaveIteration(QualiArrayObj, req, callback) {
    try {
        var names = [];
        var Qualificationame;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (Singlename, done) {
            if (Singlename == null || Singlename == "") {
                done(error);
                return;
            }
            //var regex = new RegExp("^" + Singlename.toLowerCase(), "i");
            // //console.log(Singlename);
            dbo.collection(String(dbcollectionname)).find({ "qualificationname": {$regex:"^"+Singlename.toLowerCase()+"$",$options:'i'}, "educationcategorycode": parseInt(req.body.educationcategorycode) }).count(function (err, doc) {
                if (err) {
                    done();
                    return;
                }
                if (doc == 0) {
                    Qualificationame = Singlename;
                    names.push(Qualificationame);
                    // //console.log(names);
                }
                done();
                return;
            });

        };
        var doneIteratingFcn = function (err) {
            // //console.log(names);
            callback(err, names);

        };
        async.forEach(QualiArrayObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking Duplicate - Qulification" + e); }
}
exports.SaveSingleQualification = function (logparams, qualification, callback) {
    try {
        logger.info("Log in checking single qualification : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        var finalresult;
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).insertMany(qualification, function (err, res) {
            // //console.log(res);
            if (err) throw err;
                finalresult = res.insertedCount;
                ////console.log(finalresult);
                return callback(finalresult);
        });
    }
    catch (e) {
        { logger.error("Error in checking Duplicate - savequlification" + e); }
    }
}
exports.InsertQualificationLog = function (logparams, callback) {
    try {
        logger.info("Log in Insert log: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var makerid;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            makerid = String(logres["ops"][0]["_id"]);
            return callback(makerid);
        });
    }
    catch (e) { logger.error("Error in insert - qualification Log" + e); }
}