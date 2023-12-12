'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
var dblogcollectionname = MongoDB.LogCollectionName;
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.GnJobsCollectionName).find().sort([['gnjobcode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].gnjobcode + 1;

                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - gnjobpost " + e); }
}
exports.getGnjobpostFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // var langparams= { statuscode: parseInt(objConstants.defaultstatuscode),languagecode:1}
        var params = { statuscode: parseInt(objConstants.activestatus) }
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            dbo.collection(MongoDB.govttypeCollectionName).aggregate([
                { $match: params },
                {
                    $sort: {
                        governmenttypename: 1
                    }
                },

                {
                    $project: { _id: 0, governmenttypecode: 1, governmenttypename: 1 }
                }
            ]).toArray(function (err, goverresult) {
                dbo.collection(MongoDB.StateCollectionName).aggregate([
                    { $unwind: '$state' },
                    { $match: { 'state.languagecode': parseInt(objConstants.defaultlanguagecode), statuscode: parseInt(objConstants.activestatus) } },
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
                    dbo.collection(MongoDB.gnOrganisationCollectionName).aggregate([
                        { $unwind: '$gnorganisation' },
                        { $match: { 'gnorganisation.languagecode': parseInt(objConstants.defaultlanguagecode), statuscode: parseInt(objConstants.activestatus) } },
                        {
                            $sort: {
                                'gnorganisation.gnorganisationname': 1
                            }
                        },
                        {
                            $project: { _id: 0, gnorganisationcode: 1, gnorganisationname: '$gnorganisation.gnorganisationname', governmenttypecode: 1 ,statecode :1}
                        }
                    ]).toArray(function (err, organisationresult) {

                        finalresult = {
                            "languagelist": languageresult,
                            "govermentlist": goverresult,
                            "statelist": stateresult,
                            "gnorganisationlist": organisationresult
                        }
                        return callback(finalresult);
                    });
                });
            });
        });
    }
    catch (e) { logger.error("Error in Form load - Gnjobpost" + e); }
}
exports.Gnjobposteditload = function (logparams, req, callback) {
    try {
        logger.info("Log in Edit load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.GnJobsCollectionName).aggregate([
            { $match: { "gnjobcode": Number(req.query.gnjobcode) } },
            {
                $lookup: {
                    from: String(MongoDB.gnOrganisationCollectionName),
                    localField: 'gnorganisationcode',
                    foreignField: 'gnorganisationcode',
                    as: 'gnorganisationinfo'
                }
            },
            { $unwind: { path: '$gnorganisationinfo', preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, gnjobid: 1, gnjobcode: 1, gnjob: 1, approveddate:1,remarks:1, statuscode: 1, gnorganisationcode: 1, link: 1, uploads: 1, expirationdate: 1, noofvacancies:1,governmenttypecode: '$gnorganisationinfo.governmenttypecode', statecode: '$gnorganisationinfo.statecode' } }]).toArray(function (err, result) {
                finalresult = result;
                return callback(finalresult);
            });
    }
    catch (e) { logger.error("Error in Edit load List - Gnjobpost" + e); }
}
exports.Insertgnjobpost = function (logparams, params, callback) {
    try {
        logger.info("Log in Insert Gnjobpost: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.GnJobsCollectionName).insertOne(params, function (err, res) {
            if (err) throw err;
            finalresult = res.insertedCount;
             //console.log(finalresult)
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in insert - gnjobpost " + e);
    }
}
exports.UpdateUploads = function (logparams, req, callback) {
    try {
        logger.info("Updating Uploads: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        // //console.log(req.body);
        dbo.collection(MongoDB.GnJobsCollectionName).findOneAndUpdate({ "gnjobcode": Number(req.query.gnjobcode) }, { $set: { "uploads": req.body } }, function (err, res) {
            ////console.log(res);
            ////console.log("hi");
            if (err) {
                //return callback(false);
                //throw err;
                return callback(false);
            }
            else {
                return callback(res.lastErrorObject.updatedExisting);
            }
        });

    }
    catch (e) { logger.error("Error in Update uploads: " + e); }
}
exports.Getgnjobpostlist = function (logparams, req, langcount, callback) {
    try {
        logger.info("Log in Gnjobpost List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        if (parseInt(req.query.statuscode) == 0) { var condition = { 'gnjob.languagecode': objConstants.defaultlanguagecode, "statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { 'gnjob.languagecode': objConstants.defaultlanguagecode, statuscode: parseInt(req.query.statuscode) }; }
        dbo.collection(MongoDB.GnJobsCollectionName).aggregate([
            {
                $addFields: {
                    selected_language_count: {
                        $size: "$gnjob"
                    },
                    language_count_status: { $toInt: { $eq: [{ $size: "$gnjob" }, langcount] } },
                }
            },
            { $unwind: '$gnjob' },
            { $match: condition },
            {
                $lookup:
                {
                    from: String(MongoDB.gnOrganisationCollectionName),
                    localField: 'gnorganisationcode',
                    foreignField: 'gnorganisationcode',
                    as: 'organisation'
                }
            },
            { $unwind: '$organisation' },
            { $unwind: '$organisation.gnorganisation' },
            { $match: { "organisation.gnorganisation.languagecode": objConstants.defaultlanguagecode } },
            {
                $lookup:
                {
                    from: String(MongoDB.StatusCollectionName),
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
                    _id: 0, expirydate:'$expirationdate', title: '$gnjob.title', description: '$gnjob.description', gnjobid: 1, link: 1, gnorganisationcode: 1, gnjobcode: 1,approveddate:1,remarks:1,noofvacancies:1, statuscode: 1, statusname: '$status.statusname',
                    gnorganisationname: '$organisation.gnorganisation.gnorganisationname', logourl: '$organisation.logourl', selected_language_count: 1, language_count_status: 1
                }
            }]).toArray(function (err, result) {
                finalresult = result;
                // //console.log(finalresult);
                return callback(finalresult);
            });
    }
    catch (e) {
        logger.error("Error in List - gnjobpost " + e);
    }
}
exports.deletegnjobpost = function (logparams, params, callback) {
    try {
        logger.info("Log in Delete Gnjobpost: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        //var finalresult;
        // //console.log(params)
        dbo.collection(MongoDB.GnJobsCollectionName).deleteOne(params, function (err, res) {
            if (err) throw err;
            //finalresult = res;
             ////console.log(res.deletedCount);
            return callback(res.deletedCount);
        });
    }
    catch (e) {
        logger.error("Error in Delete - gnjobpost " + e);
    }
}
exports.updategnjobspost = function (logparams, req, params, callback) {
    try {
        logger.info("Log in update Gnjobpost: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.GnJobsCollectionName).findOneAndUpdate({ "gnjobcode": Number(req.query.gnjobcode) }, { $set: params }, function (err, res) {
            if (err) {
                logger.error("Error in update Gnjobpost: " + err);
                
                // //console.log(finalresult);
                return callback(false);
            }
            else {
                
                // //console.log(finalresult);
                return callback(res.lastErrorObject.updatedExisting);
            }
        });
    }
    catch (e) {
        logger.error("Error in update - gnjobpost " + e);
    }
}
exports.GetGnjobSingleDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in Gnjob Single Record: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // dbo.collection(MongoDB.GnJobsCollectionName).find(params).toArray(function (err, result) {
        //     finalresult = result;
        //     // //console.log(finalresult);
        //     return callback(finalresult);
        // });
        dbo.collection(MongoDB.GnJobsCollectionName).aggregate([
            { $unwind: '$gnjob' },
            { $match: params },
            {
                $project: {
                    _id: 0, languagecode: '$gnjob.languagecode',title: '$gnjob.title', description: '$gnjob.description', "gnjobcode": 1, "gnjobid": 1, "link": 1, "gnorganisationcode": 1,"noofvacancies":1, "createddate": 1, "expirationdate": 1,"makerid":1,"uploads":1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
             ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - gnjobs" + e); }
}

exports.UpdateStatuscodeInGnjobpost = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        const dbo = MongoDB.getDB();
        logger.info("Log in GNJob Update Active Statuscode : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        objUtilities.InsertLog(logparams, function (validlog) {
            if (validlog != null && validlog != 0) {
                dbo.collection(MongoDB.GnJobsCollectionName).updateOne({ "gnjobcode": Number(req.body.gnjobcode) }, { $set: {  "statuscode": Number(req.body.statuscode), updateddate: milliseconds, checkerid: validlog} }, function (err, result) {
                    if (err)
                        throw err;
                     ////console.log(result.modifiedCount);
                    return callback(result.modifiedCount==0?result.matchedCount:result.modifiedCount);
                });
            }

        });

    }
    catch (e) {
        logger.error("Error in Update Active Statuscode in Jobpost :  " + e);
    }

}

exports.Getgnjobpostdetails = function (logparams, params, callback) {
    try {
        logger.info("Log in Gnjobpost List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        //console.log(params);
        dbo.collection(MongoDB.GnJobsCollectionName).aggregate([
            
            { $unwind: '$gnjob' },
            { $match: params },
            {
                $lookup:
                {
                    from: String(MongoDB.gnOrganisationCollectionName),
                    localField: 'gnorganisationcode',
                    foreignField: 'gnorganisationcode',
                    as: 'organisation'
                }
            },
            { $unwind: '$organisation' },
            { $unwind: '$organisation.gnorganisation' },
            
            {
                $lookup:
                {
                    from: String(MongoDB.StatusCollectionName),
                    localField: 'statuscode',
                    foreignField: 'statuscode',
                    as: 'status'
                }
            },
            { $unwind: '$status' },
            {
                $project: {
                    _id: 0, title: '$gnjob.title', description: '$gnjob.description', gnjobid: 1, link: 1,makerid:1, gnorganisationcode: 1, gnjobcode: 1,approveddate:1,remarks:1,noofvacancies:1, statuscode: 1, statusname: '$status.statusname',
                    gnorganisationname: '$organisation.gnorganisation.gnorganisationname', logourl: '$organisation.logourl',governmenttypecode: '$organisation.governmenttypecode',
					languagecode:'$gnjob.languagecode', expirydate:'$expirationdate',
					cmp_value: {$cmp: ['$gnjob.languagecode','$organisation.gnorganisation.languagecode']}
					
                }
            },{$match: {cmp_value: {$eq: 0}}} ]).toArray(function (err, result) {
                finalresult = result;
                //console.log(finalresult);
                return callback(finalresult);
            });
    }
    catch (e) {
        logger.error("Error in List - gnjobpost " + e);
    }
}