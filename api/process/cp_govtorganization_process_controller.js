'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
//const { defaultlanguagecode, defaultstatuscode } = require('../../config/constants');
const objConstants = require('../../config/constants');
var dbcollectionname = MongoDB.gnOrganisationCollectionName;
var dbgovttypecollectionname = MongoDB.govttypeCollectionName;
var dbstatecollectionname = MongoDB.StateCollectionName;
var dblogcollectionname = MongoDB.LogCollectionName;
var dbstatuscollectionname = MongoDB.StatusCollectionName;
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find().sort([['gnorganisationcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].gnorganisationcode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - gnorganisation " + e); }
}
exports.checkgnorganisationNameExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking gnorganisation name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({gnorganisation: req.body.gnorganisation[0].gnorganisation}, {$exists: true}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkgnOrganisationName(req.body.gnorganisation, function (err, gnorganisationcount) {
            if (err) {
                return;
            }
            return callback(gnorganisationcount);
        });
    }
    catch (e) { logger.error("Error in checking gnorganisation name - gnorganisation" + e); }
}
exports.checkgnorganisationCodeExists = function (logparams, req, callback) {
    try {
        logger.info("Log in checking gnorganisation code : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(String(dbcollectionname)).find({ "gnorganisationcode": parseInt(req.query.gnorganisationcode) }).toArray(function (err, doc) //find if a value exists
        {
            return callback(doc.length);
        });
    }
    catch (e) { logger.error("Error in checking gnorganisation code - gnorganisation" + e); }
}
exports.checkgnorganisationNameExistsByCode = function (logparams, req, callback) {
    try {
        logger.info("Log in checking gnorganisation name by Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        // const dbo = MongoDB.getDB();
        // dbo.collection(String(dbcollectionname)).find({gnorganisation: req.body.gnorganisation[0].gnorganisationname,gnorganisationcode:{$ne:req.query.gnorganisationcode}}).toArray(function(err, doc) //find if a value exists
        // {  
        //     return callback(doc.length);
        // });
        checkgnOrganisationNameByCode(req.body.gnorganisation, req.query.gnorganisationcode, function (err, gnorganisationcount) {
            if (err) {
                return;
            }
            return callback(gnorganisationcount);
        });
    }
    catch (e) { logger.error("Error in checking gnorganisation name by code - gnorganisation" + e); }
}

var async = require('async');
function checkgnOrganisationName(gnOrganisationListObj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (gnorganisationObj, done) {
            if (!gnorganisationObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + gnorganisationObj.gnorganisationname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ gnorganisation: { $elemMatch: { languagecode: gnorganisationObj.languagecode, gnorganisationname: {$regex:"^"+gnorganisationObj.gnorganisationname.toLowerCase()+"$",$options:'i'} } } }).count(function (err, res) {
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
        async.forEach(gnOrganisationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking gnOrganisation name - gnOrganisation" + e); }
}
function checkgnOrganisationNameByCode(gnOrganisationListObj, gnorganisationcodeobj, callback) {
    try {
        var totalcount = 0;
        const dbo = MongoDB.getDB();
        var iteratorFcn = function (gnorganisationObj, done) {
            if (!gnorganisationObj.languagecode) {
                done();
                return;
            }
            //var regex = new RegExp("^" + gnorganisationObj.gnorganisationname.toLowerCase(), "i");
            dbo.collection(String(dbcollectionname)).find({ gnorganisation: { $elemMatch: { languagecode: gnorganisationObj.languagecode, gnorganisationname: {$regex:"^"+gnorganisationObj.gnorganisationname.toLowerCase()+"$",$options:'i'} } }, gnorganisationcode: { $ne: parseInt(gnorganisationcodeobj) } }).count(function (err, res) {
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
        async.forEach(gnOrganisationListObj, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in checking gnOrganisation name by code - gnOrganisation" + e); }
}
exports.InsertgnorganisationDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in gnorganisation create by gnorganisation Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
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
    catch (e) { logger.error("Error in create - gnorganisation" + e); }
}
exports.updategnorganisationDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in gnorganisation update by gnorganisation Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dblogcollectionname)).insertOne(logparams, function (err, logres) {
            params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(String(dbcollectionname)).findOneAndUpdate({ "gnorganisationcode": parseInt(params.gnorganisationcode) },{ $set: params}, function (err, res) {
                if (err) throw err;
               // //console.log(res.lastErrorObject.updatedExisting);
                return callback(res.lastErrorObject.updatedExisting);
            });
        });
    }
    catch (e) { logger.error("Error in update - gnorganisation" + e); }
}
exports.checkGnorganisationExistsInGnpost = function (logparams, params, callback) {
    try {
        logger.info("Log in checking gnorganisation code in gnpost: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.GnJobsCollectionName).find({ "gnorganisationcode": parseInt(params.gnorganisationcode) }, { $exists: true }).count(function (err, gnorganisationcount) //find if a value exists
        {
            // //console.log(doc.length);
            return callback(gnorganisationcount);
        });
    }
    catch (e) { logger.error("Error in checking gnorganisation code in gnpost - gnorganisation" + e); }
}
exports.deletegnorganisationDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in gnorganisation Delete by gnorganisation Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).deleteOne({ "gnorganisationcode": parseInt(params.gnorganisationcode) }, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
           // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in delete - gnorganisation" + e); }
}
exports.getgnorganisationSingleRecordDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in Get single record by gnorganisation Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "gnorganisationcode": parseInt(params.query.gnorganisationcode) }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - gnorganisation" + e); }
}
exports.getgnorganisationSingleRecordDetails_Edit = function (logparams, params, callback) {
    try {
        logger.info("Log in gnorganisation single record details by gnorganisation Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(String(dbcollectionname)).find({ "gnorganisationcode": parseInt(params.gnorganisationcode) }, { projection: { _id: 0, gnorganisationcode: 1, gnorganisation: 1, logourl: 1, statecode: 1, governmenttypecode: 1, statuscode: 1, gnorganisation: 1 } }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details for edit - Industry" + e); }
}
exports.getgnorganisationFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        // var langparams = { 'state.languagecode': objConstants.defaultlanguagecode };
        objUtilities.getPortalLanguageDetails(logparams, function (result) {
            dbo.collection(String(dbstatecollectionname)).aggregate([
                { $unwind: '$state' },
                { $match: { 'state.languagecode': objConstants.defaultlanguagecode, statuscode: parseInt(objConstants.activestatus) } },
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
                dbo.collection(MongoDB.govttypeCollectionName).aggregate([
                    { $match: { statuscode: parseInt(objConstants.activestatus) } },
                    {
                        $sort: {
                            governmenttypename: 1
                        }
                    },

                    {
                        $project: { _id: 0, governmenttypecode: 1, governmenttypename: 1 }
                    }
                ]).toArray(function (err, resulttype) {
                    finalresult.push(result);
                    finalresult.push(stateresult);
                    finalresult.push(resulttype);
                    return callback(finalresult);
                });
            });
        });
        
    }
    catch (e) { logger.error("Error in form List - gnorganisation " + e); }
}

exports.getgnorganisationList = function (logparams, params, langcount, callback) {
    try {
        logger.info("Log in gnorganisation List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var condition;
        // if (parseInt(params.statuscode) == 0) { var condition = { 'gnorganisation.languagecode': objConstants.defaultlanguagecode, "statuscode": { $ne: objConstants.deletestatus } }; }
        // else { var condition = { 'gnorganisation.languagecode': objConstants.defaultlanguagecode, statuscode: parseInt(params.statuscode) }; }
        var statuscondition = {};
        var languagecondition = {};
        if (parseInt(params.statuscode) == 0) {
            statuscondition = {"statuscode": { $ne: objConstants.deletestatus } };
        }
        else{
            statuscondition = {"statuscode": parseInt(params.statuscode) };
        }
        if (params.languagecode!=null && parseInt(params.languagecode) != 0) {
            languagecondition = {"gnorganisation.languagecode": parseInt(params.languagecode) };
        }
        dbo.collection(String(dbcollectionname)).aggregate([
            {
                $addFields: {
                    selected_language_count: {
                        $size: "$gnorganisation"
                    },
                    language_count_status: { $toInt: { $eq: [{ $size: "$gnorganisation" }, langcount] } },
                }
            },
            { $unwind: '$gnorganisation' },
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
                $lookup:
                {
                    from: String(dbgovttypecollectionname),
                    localField: 'governmenttypecode',
                    foreignField: 'governmenttypecode',
                    as: 'govttype'
                }
            },
            { $unwind: '$govttype' },
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
                                    { $eq: ["$state.languagecode", objConstants.defaultlanguagecode] }
                                ]
                            }
                        }
                    }],
                    as: 'states'
                }
            },
            { $unwind:{path:'$states',preserveNullAndEmptyArrays: true } },
            {
                $sort: {
                    createddate: -1
                }
            },
            {
                $project: {
                    _id: 0, gnorganisationcode: 1, gnorganisationname: '$gnorganisation.gnorganisationname',languagecode: '$gnorganisation.languagecode',  governmenttypecode: 1, governmenttypename: '$govttype.governmenttypename', statecode: 1,
                    statename: '$states.state.statename',
                    statuscode: 1, statusname: '$status.statusname', selected_language_count: 1, language_count_status: 1, logourl:1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in List - gnorganisation" + e); }
}

exports.UpdateLogourl = function (logparams, req, callback) {
    try {
        logger.info("Updating Logo URL : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.gnOrganisationCollectionName).updateOne({ "gnorganisationcode": parseInt(req.query.gnorganisationcode) }, { $set: { "logourl": req.body.logourl } }, function (err, res) {
            if (err) throw err;
            finalresult = res.modifiedCount;
            ////console.log(finalresult);
            return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
        });

    }
    catch (e) { logger.error("Error in Updating Logo URL: " + e); }
}