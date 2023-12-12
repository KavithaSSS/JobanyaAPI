'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');

const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
// const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
var dbcollectionname = MongoDB.FacilityCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['facilitycode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].facilitycode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - facility " + e); }
}
exports.checkFacilityNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking facility name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({facility: req.body.facility[0].facilityname}, {$exists: true}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkFacilityName(req.body.facility, function (err, facilitycount) {
            if (err) {
                return;
            }
            return callback(facilitycount);
        });
    }
    catch (e) { logger.error("Error in checking facility name - facility" + e); }
}
exports.checkFacilityCodeExists = function (logparams, req, callback) {
    try {
        // //console.log("facility code " + req.query.facilitycode);
        logger.info("Log in checking facility code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "facilitycode": parseInt(req.query.facilitycode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking facility code - facility" + e); }
}
exports.checkFacilityNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking facility name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({facility: req.body.facility[0].facilityname,facilitycode:{$ne:req.query.facilitycode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkFacilityNameByCode(req.body.facility, req.query.facilitycode, function (err, facilitycount) {
            if (err) {
                return;
            }
            return callback(facilitycount);
        });
    }
    catch (e) { logger.error("Error in checking facility name by code - facility" + e); }
}
var async = require('async');
function checkFacilityName(FacilityListObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (facilityObj, done) {
            if (!facilityObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + facilityObj.facilityname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ facility: { $elemMatch: { languagecode: facilityObj.languagecode, facilityname: {$regex:"^"+facilityObj.facilityname.toLowerCase()+"$",$options:'i'} } } }).count(function (err, res) {
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
        async.forEach(FacilityListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking facility name - facility" + e); }
}
function checkFacilityNameByCode(FacilityListObj, facilitycodeObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (facilityObj, done) {
            if (!facilityObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + facilityObj.facilityname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ facility: { $elemMatch: { languagecode: facilityObj.languagecode, facilityname: {$regex:"^"+facilityObj.facilityname.toLowerCase()+"$",$options:'i'} } }, facilitycode: { $ne: parseInt(facilitycodeObj) } }).count(function (err, res) {
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
        async.forEach(FacilityListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking facility name by code - facility" + e); }
}
exports.InsertFacilityDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in facility create by facility Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - facility" + e); }
}
exports.updateFacilityDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in facility update by facility Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).replaceOne({ "facilitycode": parseInt(params.facilitycode) }, params, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                return callback(finalresult);
            });
        });
    }
    catch (e) { logger.error("Error in update - facility" + e); }
}
exports.checkFacilityCodeExistsInEmployer = function (logparams, params, callback) {
    try {
        logger.info("Log in checking facility code in employer: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).find({ "facilities_offered.facilitycode": parseInt(params.facilitycode) }, { $exists: true }).count(function (err, facilitycount) //find if a value exists
        {
            // //console.log(doc.length);
            return callback(facilitycount);
        });
    }
    catch (e) { logger.error("Error in checking facility code in employer  - facility" + e); }
}
exports.checkFacilityCodeExistsInJobpost = function (logparams, params, callback) {
    try {
        logger.info("Log in checking facility code in jobpost : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.JobPostsCollectionName).find({ "facilityoffered.facilitycode": parseInt(params.facilitycode) }, { $exists: true }).count(function (err, facilitycount) //find if a value exists
        {
            return callback(facilitycount);
        });
    }
    catch (e) { logger.error("Error in checking facility code in jobpost - facility" + e); }
}
exports.deleteFacilityDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in facility Delete by facility Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "facilitycode": parseInt(params.facilitycode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - facility" + e); }
}
exports.getFacilitySingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in facility List by facility Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "facilitycode": parseInt(params.query.facilitycode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - facility" + e); }
}
exports.getFacilitySingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in facility List by facility Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // //console.log(params);
        dbo.collection(String(dbcollectionname)).find({ "facilitycode": parseInt(params.facilitycode) }, { projection: { _id: 0, facilitycode: 1, facility: 1, statuscode: 1 } }).toArray(function (err, result) {
            finalresult = result;
            // //console.log(result);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - facility" + e); }
}
exports.getFacilityFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            return callback(languageresult);
        });
    }
    catch (e) { logger.error("Error in form List - facility " + e); }
}
exports.getFacilityList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in facility List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // if (parseInt(params.statuscode) == 0) { var condition = { 'facility.languagecode': objConstants.defaultlanguagecode, statuscode: { $ne: objConstants.deletestatus } }; }
        // else { var condition = { 'facility.languagecode': objConstants.defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstants.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"facility.languagecode": parseInt(params.languagecode) };
        }
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selected_language_count: {
                        $size: "$facility"
                    },
                    language_count_status: { $toInt: { $eq: [{ $size: "$facility" }, langcount] } },
                }
            },
            { $unwind: '$facility' },
            { $match: {$and:[statuscondition,languagecondition]} },
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
                    _id: 0, facilitycode: 1, facilityname: '$facility.facilityname',languagecode: '$facility.languagecode',  statuscode: 1, statusname: '$status.statusname', language_count_status: 1, selected_language_count: 1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - facility " + e); }
}