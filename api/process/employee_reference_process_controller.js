'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');


exports.getReferenceLoad = function (logparams, langparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Reference Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var relationparams = { statuscode: Number(objConstants.activestatus), "relationship.languagecode": parseInt(langparams) };
        dbo.collection(MongoDB.relationCollectionName).aggregate([
            { $unwind: '$relationship'},
            { $match: relationparams },
            {
                $sort: {
                    sortvalue: 1, 'relationship.relationshipname': 1
                }
            },
            {
                $project:
                    { _id: 0, relationshipcode: 1, relationshipname: '$relationship.relationshipname', isneedinput: 1 }
            }
        ]).toArray(function (err, relationresult) {
            finalresult = relationresult;
            return callback(finalresult);
        });

    }
    catch (e) { logger.error("Error in Employee Reference Load: " + e); }

}

exports.getReferenceEditLoad = function (logparams, params, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Reference Edit Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        var referenceparams = { "employeecode": Number(params.employeecode), 'referenceinfo.referencecode': Number(params.referencecode) };
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: '$referenceinfo' },
            { $match: referenceparams },
            {
                $project: {
                    _id: 0, referencecode: '$referenceinfo.referencecode', referencename: '$referenceinfo.referencename', designation: '$referenceinfo.designation',
                    organization: '$referenceinfo.organization', relationship: '$referenceinfo.relationship', relationshipcode: '$referenceinfo.relationshipcode', remarks: '$referenceinfo.remarks',
                    emailid: '$referenceinfo.emailid', mobileno: '$referenceinfo.mobileno'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Reference Edit Load: " + e); }


}

exports.referencesave = function (params, employeecode,isleadtype, logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).updateOne({ "employeecode": Number(employeecode) }, { $set: { "referenceinfo": params } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employee Reference Info Update: " + e); }
}

exports.getReferenceInfo = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Getting Single Record for Reference Info on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(empparams, { projection: { _id: 0, referenceinfo: 1 } }).toArray(function (err, empresult) {
            ////console.log("Reference");
            ////console.log(empresult);
            if (err) throw err;
            if (empresult != null) {
                finalresult = empresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Employee Reference Info: " + e); }

}

exports.getReferenceMaxcode = function (logparams, employeecode,isleadtype, callback) {
    try {

        logger.info("Log in Reference getting max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var paramcheck = { "employeecode": Number(employeecode) };
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(paramcheck, { projection: { _id: 0, referenceinfo: 1 } }).toArray((err, docs) => {
            var maxcode;
            ////console.log("Max code");
            ////console.log(docs);
            if (docs[0].referenceinfo == null) {
                maxcode = 1;
            }
            else {
                const collection = docs[0].referenceinfo;
                const list = [];
                if (collection.length == 0)
                    maxcode = 1;
                else {
                    for (var i = 0; i <= collection.length - 1; i++) {
                        list.push(collection[i].referencecode);
                    }
                    //collection.every(e => e.values.every(e2 => list.push(e2.referencecode)));
                    maxcode = Math.max.apply(null, list) + 1;
                }
            }
            ////console.log("finalmaxcode");
            ////console.log(maxcode);
            return callback(maxcode);
        });
    }
    catch (e) { logger.error("Error in Get Max Code - Reference" + e); }
}

exports.getReferenceList = function (logparams, empparams, languagecode,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employee Reference List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        //dbo.collection(String(MongoDB.EmployeeCollectionName)).find(empparams,{projection: { _id: 0, referenceinfo:1}}).toArray(function(err, empresult) {
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([

            { $unwind: "$referenceinfo" },


            { $match: empparams },
            {
                $lookup: {
                    from: String(MongoDB.relationCollectionName),

                    localField: 'referenceinfo.relationshipcode',
                    foreignField: 'relationshipcode',
                    as: 'relationshipinfo'
                }
            },
            { $unwind: "$relationshipinfo" },
            { $unwind: '$relationshipinfo.relationship' },
            { $match: { "relationshipinfo.relationship.languagecode": parseInt(languagecode) } },	

            //{ $addFields: { othercond: { $cond: [ { $eq: [ "specialization.languagecode", 1 ] }, 'afterschooling.specializationcode' ] } } },


            {
                $project: {
                    "_id": 0,
                    "referencename": '$referenceinfo.referencename', "designation": '$referenceinfo.designation', "organization": '$referenceinfo.organization', "relationship": '$referenceinfo.relationship', "relationshipcode": '$referenceinfo.relationshipcode', "relationshipname": '$relationshipinfo.relationship.relationshipname', "remarks": '$referenceinfo.remarks', "emailid": '$referenceinfo.emailid', "mobileno": '$referenceinfo.mobileno', "referencecode": '$referenceinfo.referencecode'
                }
            }]).toArray(function (err, empresult) {
                ////console.log("Reference");
                ////console.log(empresult);
                if (err) throw err;
                if (empresult != null) {
                    finalresult = empresult;
                }
                return callback(finalresult);
            });
    }
    catch (e) { logger.error("Error in Employee Reference Info: " + e); }

}