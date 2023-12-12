'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getBranchInfoLoad = function (logparams, langparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Branch Info Load on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var stateparams = { statuscode: objConstants.activestatus, 'state.languagecode': Number(langparams) };
        dbo.collection(MongoDB.StateCollectionName).aggregate([
            { $unwind: '$state' },
            { $match: stateparams },
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
            //District Collection
            var distparams = { statuscode: objConstants.activestatus, 'district.languagecode': Number(langparams) };
            dbo.collection(MongoDB.DistrictCollectionName).aggregate([
                { $unwind: '$district' },
                { $match: distparams },
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
            ]).toArray(function (err, districtresult) {
                //taluk Collection
                var taulkparams = { statuscode: objConstants.activestatus, 
                    'taluk.languagecode': Number(langparams) };
                dbo.collection(MongoDB.TalukCollectionName).aggregate([
                    { $unwind: '$taluk' },
                    { $match: taulkparams },
                    {
                        $sort: {
                            'taluk.talukname': 1
                        }
                    },
                    {
                        $project: {
                            _id: 0, talukcode: 1, talukname: '$taluk.talukname',
                             statecode: 1, districtcode: 1 
                        }
                    }
                ]).toArray(function (err, talukresult) {
                finalresult = {
                    "statelist": stateresult,
                    "districtlist": districtresult,
                    "taluklist":talukresult
                }
                return callback(finalresult);

            });
            });
        });
    }
    catch (e) { logger.error("Error in Employer Branch Info Load: " + e); }

}


exports.getBranchTypeLoad = function (logparams, langparams, callback) {
    try {
        const dbo = MongoDB.getDB();  
        logger.info("Log in branch type Info Load on Employer : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        
        dbo.collection(MongoDB.BranchTypeCollectionName).aggregate([
            { $unwind: '$branchtype' },
            { $match: {statuscode: objConstants.activestatus, 'branchtype.languagecode': Number(langparams) } },
            {
                $sort: {
                    'branchtype.branchtypename': 1
                }
            },
            {
                $project: {
                    _id: 0, branchtypecode: 1, branchtypename: '$branchtype.branchtypename'
                }
            }
        ]).toArray(function (err, finalresult) {  
           return callback(finalresult);
       }); 
    }
    catch (e) { logger.error("Error in Employer Company Info Load: " + e); }

}

exports.getBranchMaxcode = function (logparams, employercode, callback) {
    try {

        logger.info("Log in Branch getting max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var paramcheck = { "employercode": Number(employercode) };

        dbo.collection(String(MongoDB.EmployerCollectionName)).find(paramcheck, { projection: { _id: 0, branch: 1 } }).toArray((err, docs) => {
            var maxcode;
            ////console.log("Max code");
            ////console.log(docs);
            if (docs[0].branch == null) {
                maxcode = 1;
            }
            else {
                const collection = docs[0].branch;
                const list = [];
                if (collection.length == 0)
                    maxcode = 1;
                else {
                    for (var i = 0; i <= collection.length - 1; i++) {
                        list.push(collection[i].branchcode);
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
    catch (e) { logger.error("Error in Get Max Code - Branch" + e); }
}

exports.branchsave = function (params, employercode, logparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(employercode) }, { $set: { "branch": params } }, function (err, res) {
                    if (err) throw err;
                    //console.log(res.modifiedCount);
                    return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employer Branch Info Update: " + e); }
}

exports.deletebranchDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in branch Delete by branch Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.EmployerCollectionName).deleteOne({ "employercode": parseInt(params.employercode) },{ "branchcode": parseInt(params.branchcode) }, function (err, res) {
            if (err)
                throw err;
            ////console.log(res.deletedCount);
            return callback(res.deletedCount);
        });
    }
    catch (e) { logger.error("Error in deletebranchDetails" + e); }
}

exports.getBranchInfo = function (logparams, empparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employer Getting Single Record for Branch Info on Employer App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        dbo.collection(String(MongoDB.EmployerCollectionName)).find(empparams, { projection: { _id: 0, branch: 1 } }).toArray(function (err, empresult) {
            ////console.log("Reference");
            ////console.log(empresult);
            if (err) throw err;
            if (empresult != null) {
                finalresult = empresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Employer Branch Info: " + e); }

}

exports.getBranchList = function (logparams, empparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Employer Branch List : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //console.log(empparams);
        //console.log(Number(empparams.languagecode));
        //dbo.collection(String(MongoDB.EmployeeCollectionName)).find(empparams,{projection: { _id: 0, referenceinfo:1}}).toArray(function(err, empresult) {
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { "$unwind": "$branch" },
            { $match: { "employercode": Number(empparams.employercode) } },
            {
                "$lookup":
                {
                    "from": String(MongoDB.TalukCollectionName),
                    "localField": "branch.talukcode",
                    "foreignField": "talukcode",
                    "as": "talukinfo"
                }
            },
            { $unwind: {path:'$talukinfo',preserveNullAndEmptyArrays: true }    },
            { $unwind: {path:'$talukinfo.taluk',preserveNullAndEmptyArrays: true } },
            { $match:  { $or: [{ "talukinfo.taluk.languagecode": { $exists: false } }, 
            { "talukinfo.taluk.languagecode": "" }, { "talukinfo.taluk.languagecode": Number(empparams.languagecode) }] } },
            {
                "$lookup":
                {
                    "from": String(MongoDB.DistrictCollectionName),
                    "localField": "talukinfo.districtcode",
                    "foreignField": "districtcode",
                    "as": "districtinfo"
                }
            },
            { $unwind: "$districtinfo" },
            { $unwind: "$districtinfo.district" },
            { $match: { "districtinfo.district.languagecode": Number(empparams.languagecode) } },
            {
                "$lookup":
                {
                    "from": String(MongoDB.StateCollectionName),
                    "localField": "districtinfo.statecode",
                    "foreignField": "statecode",
                    "as": "stateinfo"
                }
            },
            { $unwind: "$stateinfo" },
            { $unwind: "$stateinfo.state" },
            { $match: { "stateinfo.state.languagecode": Number(empparams.languagecode) } },
            
            {
                "$lookup":
                {
                    "from": String(MongoDB.BranchTypeCollectionName),
                    "localField": "branch.branchtypecode",
                    "foreignField": "branchtypecode",
                    "as": "branchtypeinfo"
                }
            },
            { $unwind:  { path: '$branchtypeinfo', preserveNullAndEmptyArrays: true }, },
            { $unwind: { path: '$branchtypeinfo.branchtype', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "branchtypeinfo.branchtype.languagecode": { $exists: false } },{ "branchtypeinfo.branchtype.languagecode": "" }, { "branchtypeinfo.branchtype.languagecode": Number(empparams.languagecode) }] } }, 
            {
                $project:
                {
                    "_id": 0, branchcode: '$branch.branchcode', branchname: '$branch.branchname', "designation": '$branch.designation',
                    "statecode": '$districtinfo.statecode', "statename": '$stateinfo.state.statename',
                    "districtcode": '$branch.districtcode', "districtname": '$districtinfo.district.districtname', 
                    "cityname": '$branch.cityname', contactperson: '$branch.contactperson', pincode: '$branch.pincode',
                    companyaddress: '$branch.companyaddress', latitude: '$branch.latitude', longitude: '$branch.longitude', mobileno: '$branch.mobileno',
                    telephoneno: '$branch.telephoneno', emailid: '$branch.emailid',branchtypecode:{$ifNull:[ '$branch.branchtypecode',2]},
                    branchtypename:{$ifNull:[ '$branchtypeinfo.branchtype.branchtypename','Branch Office']},
                    talukcode:{ $ifNull:[ '$talukinfo.talukcode',0]}, talukname:{ $ifNull:[ '$talukinfo.taluk.talukname','']}
                }
            }
        ]).toArray(function (err, empresult) {
            ////console.log("Reference");
            ////console.log(empresult);
            if (err) throw err;
            if (empresult != null) {
                finalresult = empresult;
            }
            return callback(finalresult);
        });
    }
    catch (e) {  logger.error("Error in Employer Branch List Info: " + e); }

}