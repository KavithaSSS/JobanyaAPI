'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.DistrictCollectionName;
var dbstatecollectionname = MongoDB.StateCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbtalukcollectionname = MongoDB.TalukCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
var objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['districtcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].districtcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - district " + e); }
}
exports.checkDistricteNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking district name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({districtname: req.body.district[0].districtname,statecode:req.body.statecode}, {$exists: true}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkDistrictName(req.body.district, req.body.statecode, function (err, districtcount) {
            if (err) {
                return;
            }
            return callback(districtcount);
        });
    }
    catch (e) { logger.error("Error in checking district name - district" + e); }
}
var async = require('async');
function checkDistrictName(districtListObj, statecodeobj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (districtObj, done) {
            if (!districtObj.languagecode) {
                done();
                return;
            }

            //var regex = new RegExp("^" + districtObj.districtname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ district: { $elemMatch: { languagecode: districtObj.languagecode, districtname: { $regex: "^" + districtObj.districtname.toLowerCase() + "$", $options: 'i' } } }, statecode: parseInt(statecodeobj) }).count(function (err, res) {

                if (err) {
                    done(err);
                    return;
                }
                totalcount = totalcount + res;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, totalcount);
        };
        async.forEach(districtListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking district name - district" + e); }
}
function checkDistrictNameByCode(districtListObj, districtcodeobj, statecodeobj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (districtObj, done) {
            if (!districtObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + districtObj.districtname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ district: { $elemMatch: { languagecode: districtObj.languagecode, districtname: { $regex: "^" + districtObj.districtname.toLowerCase() + "$", $options: 'i' } } }, statecode: parseInt(statecodeobj), districtcode: { $ne: parseInt(districtcodeobj) } }).count(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                totalcount = totalcount + res;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, totalcount);
        };
        async.forEach(districtListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking district name by code - district" + e); }
}
exports.checkDistrictCodeExists = function (logparams, req, callback) {
    try {
        // //console.log("district code " + req.query.districtcode);
        logger.info("Log in checking district code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "districtcode": parseInt(req.query.districtcode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking district code - district" + e); }
}
exports.checkDistrictNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking district name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({districtname: req.body.district[0].districtname,statecode:req.body.statecode,districtcode:{$ne:req.query.districtcode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkDistrictNameByCode(req.body.district, req.query.districtcode, req.body.statecode, function (err, districtCount) {
            if (err) {
                return;
            }
            return callback(districtCount);
        });
    }
    catch (e) { logger.error("Error in checking district name by code - district" + e); }
}
exports.checkDistrictCodeExistsInOthers = function (logparams, params, callback) {
    try {
        logger.info("Log in checking district in other tables: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbtalukcollectionname)).find({ "districtcode": parseInt(params.districtcode) }, { $exists: true }).toArray(function (err, doc) //find if a value exists
        {
            // //console.log(doc.length);
            dbo.collection(String(MongoDB.JobPostsCollectionName)).find({ "preferredlocation.locationlist.locationcode": parseInt(params.districtcode) }, { $exists: true }).toArray(function (err, doc1) //find if a value exists
            {
                // //console.log(doc.length);
                return callback(doc.length + doc1.length);
            });
            //return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking district in other tables - district" + e); }
}
exports.checkDistrictCodeExistsInEmployer = function (logparams, req, callback) {
    try {
        logger.info("Log in checking district code in employer: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { $unwind: "$branch" },
            { $match: { "contactinfo.districtcode": Number(req.query.districtcode), "branch.districtcode": Number(req.query.districtcode) } },
            {
                $group: {
                    _id: 0, totalcount: { $sum: 1 }
                }
            }
        ]).toArray(function (err, result) {
            // //console.log(result);
            return callback(result);
        });

    }
    catch (e) { logger.error("Error in checking district code in employer  - district" + e); }
}
exports.checkDistrictCodeExistsInEmployee = function (logparams, params, callback) {
    try {
        logger.info("Log in checking taluk code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployeeCollectionName).find({ "contactinfo.districtcode": parseInt(params.districtcode) }, { $exists: true }).count(function (err, districtcount) //find if a value exists
        {
            return callback(districtcount);
        });
    }
    catch (e) { logger.error("Error in checking district code in employee - district" + e); }
}
exports.checkStateCodeExistsInDistrict = function (logparams, params, callback) {
    try {
        logger.info("Log in checking district code in employee: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.DistrictCollectionName).find({ "districtcode": parseInt(params.districtcode) }, { projection: { _id: 0, statecode: 1 } }).toArray(function (err, result) //find if a value exists
        {
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) { logger.error("Error in checking state code in district" + e); }
}
exports.InsertDistrictDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in district create by district Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - district" + e); }
}
exports.updateDistrictDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in district update by district Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).replaceOne({ "districtcode": parseInt(params.districtcode) }, params, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - district" + e); }
}
exports.deleteDistrictDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in district Delete by district Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "districtcode": parseInt(params.districtcode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - district" + e); }
}
exports.getDistrictSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in district List by district Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "districtcode": parseInt(params.query.districtcode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - district" + e); }
}
exports.getDistrictSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in district List by district Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "districtcode": parseInt(params.districtcode) }, { projection: { _id: 0, statecode: 1, districtcode: 1, district: 1, statuscode: 1, isshowwebsite: 1, imageurl: 1 } }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - district" + e); }
}
exports.getDistrictFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            dbo.collection(String(dbstatecollectionname)).aggregate([
                { $unwind: '$state' },
                { $match: { 'state.languagecode': parseInt(defaultlanguagecode), statuscode: parseInt(objConstants.activestatus) } },
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
            ]).toArray(function (err, resultnext) {
                finalresult.push(languageresult);
                finalresult.push(resultnext);
                // //console.log(finalresult);
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in Form load - district " + e); }
}
exports.getDistrictList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in district List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // if (parseInt(params.statuscode) == 0) { var condition = { 'district.languagecode': defaultlanguagecode, "statuscode": { $ne: objConstants.deletestatus } }; }
        // else { var condition = { 'district.languagecode': defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = { "statuscode": { $ne: objConstants.deletestatus } };
        }
        else {
            statuscondition = { "statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode != null && parseInt(params.languagecode) != 0) {
            languagecondition = { "district.languagecode": parseInt(params.languagecode) };
        }
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selectedcount: {
                        $size: "$district"
                    },
                    langstatus: { $toInt: { $eq: [{ $size: "$district" }, langcount] } },
                }
            },
            { $unwind: '$district' },
            { $match: { $and: [statuscondition, languagecondition] } },
            {
                $lookup:
                {
                    from: String(dbstatecollectionname),
                    let: { statecode: "$statecode" },
                    pipeline: [{ $unwind: '$state' },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$statecode", "$$statecode"] },
                                    { $eq: ["$state.languagecode", defaultlanguagecode] }
                                ]
                            }
                        }
                    }],
                    as: 'state'
                }
            },
            { $unwind: '$state' },
            {
                $lookup:
                {
                    from: String(dbtalukcollectionname),
                    localField: 'districtcode',
                    foreignField: 'districtcode',
                    as: 'taluk'
                }
            },
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
            //{ $group: { _id: { statename: "$state.state.statename", statecode: "$statecode", districtcode: "$districtcode", statuscode: "$statuscode", statusname: '$status.statusname', districtname: '$district.districtname', language_count_status: "$langstatus", selected_language_count: "$selectedcount" }, 'citycount': { $sum: 1 } } }
            //, { $project: { statecode: "$_id.statecode", statename: "$_id.statename", districtcode: "$_id.districtcode", districtname: "$_id.districtname", statuscode: "$_id.statuscode", statusname: "$_id.statusname", "citycount": 1, language_count_status: "$_id.language_count_status", selected_language_count: "$_id.selected_language_count", _id: 0 } }
            { $project: { logourl: '$imageurl', statename: "$state.state.statename", statecode: 1, districtcode: 1, statuscode: 1, isshowwebsite: 1, statusname: '$status.statusname', languagecode: '$district.languagecode', districtname: '$district.districtname', language_count_status: "$langstatus", selected_language_count: "$selectedcount", "talukcount": { "$size": "$taluk" }, _id: 0 } }
        ]).toArray(function (err, result) {
            finalresult = result;
            console.log('result',finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - District " + e); }
}