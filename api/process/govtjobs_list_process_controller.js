'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.GovtJobsList = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Listing Goverment Jobs  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        // var dbcollectionname=dbo.collection(MongoDB.gnOrganisationCollectionName);
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        ////console.log(params);
        //, "expirationdate": { "$gte": milliseconds }
        //{ $match: { "gnjob.languagecode": Number(params.languagecode), "gnorganisationcode": Number(params.gnorganisationcode) } },
        dbo.collection(MongoDB.GnJobsCollectionName).aggregate([
            { $unwind: '$gnjob' },
            {$match:{  $and: [{"statuscode":objConstants.approvedstatus},{'expirationdate': {$gte: milliseconds }},{'gnorganisationcode': {$eq: Number(params.gnorganisationcode)}},{'gnjob.languagecode': {$eq: Number(params.languagecode) }}]}},
            
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
            { $match: { "organisation.gnorganisation.languagecode": Number(params.languagecode) } },
            {
                $lookup:
                {
                    from: String(MongoDB.StateCollectionName),
                    localField: 'organisation.statecode',
                    foreignField: 'statecode',
                    as: 'statelist'
                }
            },
            { $unwind: {path:'$statelist',preserveNullAndEmptyArrays: true }  },
            { $unwind: {path:'$statelist.state',preserveNullAndEmptyArrays: true }  },
            {$match:{$or:[{"statelist.state.languagecode":{ $exists: false }},{"statelist.state.languagecode":""},{"statelist.state.languagecode":Number(params.languagecode)}]}},

            {
                $project: {
                    _id: 0, title: '$gnjob.title', description: '$gnjob.description', gnjobid: 1, gnjobcode: 1, link: 1, gnorganisationcode: 1, uploads: 1, expirationdate:1, noofvacancies:1,
                    gnorganisationname: '$organisation.gnorganisation.gnorganisationname', gnorganisationurl: '$organisation.logourl', statecode: '$organisation.statecode', statename: '$statelist.state.statename'
                }
            }]).toArray(function (err, result) {
                ////console.log(result);
                return callback(result);
            });
    }
    catch (e) {
        { logger.error("Error in Listing Govtment Jobs: " + e); }
    }
}


exports.GovtJobsListbyCount = function (logparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Listing Goverment Jobs  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        dbo.collection(MongoDB.gnOrganisationCollectionName).aggregate([
            {$unwind: '$gnorganisation'},       
             {$match:{"gnorganisation.languagecode":Number(languagecode)}},    
              { "$lookup": {
                "from": String(MongoDB.GnJobsCollectionName),
                "localField": "gnorganisationcode",
                "foreignField": "gnorganisationcode",
                "as": "organisation"
              }},
              {
                "$addFields": {
                    "organisation": {
                "$filter": {
                  "input": "$organisation",
                  "as": "org",
                  "cond": { "$and": [{"$gte": [ "$$org.expirationdate", milliseconds ]},
                                    {"$eq": [ "$$org.statuscode",objConstants.approvedstatus]}]
                    
                  }
                }
                    }
                }
            },
              { $lookup:            
              {              
             from:  String(MongoDB.StateCollectionName),         
             localField: 'statecode',              
             foreignField: 'statecode',              
             as: 'statelist' }},
              { $unwind: {path:'$statelist',preserveNullAndEmptyArrays: true }  },
            { $unwind: {path:'$statelist.state',preserveNullAndEmptyArrays: true }  },
            {$match:{$or:[{"statelist.state.languagecode":{ $exists: false }},{"statelist.state.languagecode":""},{"statelist.state.languagecode":Number(languagecode)}]}},

              { "$project": {
              _id: 0,
                "gnorganisationcode": 1,
                "logourl":1,
              gnorganisationname:'$gnorganisation.gnorganisationname',
              statecode:'$statelist.statecode',
              statename:'$statelist.state.statename',
                "jobcount": { "$sum": "$organisation.noofvacancies" }
              }},
              {$sort:{'gnorganisationname':1}},
              {
                    "$match": {
                        "jobcount": { "$gt": 0 }
                     }
                }
            ]).toArray(function (err, result) {
            ////console.log(result);
            return callback(result);
        });
    }
    catch (e) {
        { logger.error("Error in Listing Govtment Jobs: " + e); }
    }
}

exports.GovtJobsDetails = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        logger.info("Details Goverment Jobs  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        // var dbcollectionname=dbo.collection(MongoDB.gnOrganisationCollectionName);
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        ////console.log(params);
        //{ $match: { "gnjob.languagecode": Number(params.languagecode), "gnorganisationcode": Number(params.gnorganisationcode) } },
        dbo.collection(MongoDB.GnJobsCollectionName).aggregate([
            { $unwind: '$gnjob' },
            {$match:{  $and: [{"gnjobcode":params.gnjobcode},{"statuscode":objConstants.approvedstatus},{'expirationdate': {$gte: milliseconds }},{'gnjob.languagecode': {$eq: Number(params.languagecode) }}]}},
            
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
            { $match: { "organisation.gnorganisation.languagecode": Number(params.languagecode) } },
            {
                $lookup:
                {
                    from: String(MongoDB.StateCollectionName),
                    localField: 'organisation.statecode',
                    foreignField: 'statecode',
                    as: 'statelist'
                }
            },
            { $unwind: {path:'$statelist',preserveNullAndEmptyArrays: true }  },
            { $unwind: {path:'$statelist.state',preserveNullAndEmptyArrays: true }  },
            {$match:{$or:[{"statelist.state.languagecode":{ $exists: false }},{"statelist.state.languagecode":""},{"statelist.state.languagecode":Number(params.languagecode)}]}},

            {
                $project: {
                    _id: 0, title: '$gnjob.title', description: '$gnjob.description', gnjobid: 1, link: 1, gnorganisationcode: 1, uploads: 1, expirationdate:1, noofvacancies:1,
                    gnorganisationname: '$organisation.gnorganisation.gnorganisationname', gnorganisationurl: '$organisation.logourl', statecode: '$organisation.statecode', statename: '$statelist.state.statename'
                }
            }]).toArray(function (err, result) {
                ////console.log(result);
                return callback(result);
            });
    }
    catch (e) {
        { logger.error("Error in Listing Govtment Jobs: " + e); }
    }
}
