'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');
exports.getExperienceInfo = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = [];
        logger.info("Log in Employee Getting Single Record for Experience Info on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(empparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;

        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: "$personalinfo" },

            { $unwind: { path: '$experienceinfo', preserveNullAndEmptyArrays: true } },
            { $match: { "employeecode": empparams.employeecode } },
            {
                "$lookup": {
                    "from": String(MongoDB.MonthCollectionName),
                    "localField": "experienceinfo.frommonth",
                    "foreignField": "monthnumber",
                    "as": "frommonthinfo"
                }
            },
            {
                "$lookup": {
                    "from": String(MongoDB.MonthCollectionName),
                    "localField": "experienceinfo.tomonth",
                    "foreignField": "monthnumber",
                    "as": "tomonthinfo"
                }
            },
            { $unwind: { path: '$frommonthinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$frommonthinfo.month', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "frommonthinfo.month.languagecode": { $exists: false } }, { "frommonthinfo.month.languagecode": "" }, { "frommonthinfo.month.languagecode": empparams.languagecode }] } },
            { $unwind: { path: '$tomonthinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$tomonthinfo.month', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "tomonthinfo.month.languagecode": { $exists: false } }, { "tomonthinfo.month.languagecode": "" }, { "tomonthinfo.month.languagecode": empparams.languagecode }] } },
            { $set: { "experienceinfo.frommonthname": { $ifNull: ['$frommonthinfo.month.monthname', ''] }, "experienceinfo.tomonthname": { $ifNull: ['$tomonthinfo.month.monthname', ''] }, "experienceinfo.fromshortmonthname": { $ifNull: ['$frommonthinfo.month.shortname', ''] }, "experienceinfo.toshortmonthname": { $ifNull: ['$tomonthinfo.month.shortname', ''] },
        
            "experienceinfo.toyear": {"$cond": [{ "$eq": ['$experienceinfo.toyear', 0] }, 'Till now', '$experienceinfo.toyear']} }
        },
            { $sort: { 'experienceinfo.fromyear': -1, 'experienceinfo.frommonth': -1 } },
            { $group: { _id: { totalexperience: '$totalexperience',expmonth: '$expmonth',expyear: '$expyear', fresherstatus: '$fresherstatus', dateofbirth: '$personalinfo.dateofbirth' }, "experienceinfo": { "$push": '$experienceinfo' } } },
            { $project: { _id: 0, experienceinfo: '$experienceinfo', totalexperience: '$_id.totalexperience', expmonth: '$_id.expmonth', expyear: '$_id.expyear', fresherstatus: '$_id.fresherstatus', dateofbirth: '$_id.dateofbirth' } }]).toArray(function (err, empresult) {
                if (err) throw err;
                ////console.log(empresult);
                if (empresult != null && empresult.length > 0) {
                    finalresult = empresult;
                }
                //console.log(empresult[0].experienceinfo);
                //console.log(JSON.stringify(empresult[0].experienceinfo));
                //console.log(JSON.stringify(finalresult));
                return callback(finalresult);
            });

    }
    catch (e) { logger.error("Error in Employee Experience Info: " + e); }
}

exports.getPortalExperienceInfo = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = [];
        logger.info("Log in Employee Getting Single Record for Experience Info on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(empparams);
        var dbCollectionName = MongoDB.EmployeeCollectionName;

        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: "$personalinfo" },

            { $unwind: { path: '$experienceinfo', preserveNullAndEmptyArrays: true } },
            { $match: { "employeecode": empparams.employeecode } },
            {
                "$lookup": {
                    "from": String(MongoDB.MonthCollectionName),
                    "localField": "experienceinfo.frommonth",
                    "foreignField": "monthnumber",
                    "as": "frommonthinfo"
                }
            },
            {
                "$lookup": {
                    "from": String(MongoDB.MonthCollectionName),
                    "localField": "experienceinfo.tomonth",
                    "foreignField": "monthnumber",
                    "as": "tomonthinfo"
                }
            },
            {
                "$lookup": {
                    "from": String(MongoDB.ExperienceCollectionName),
                    "localField": "experienceinfo.expid",
                    "foreignField": "experiencecode",
                    "as": "experienceinfo1"
                }
            },
            { $unwind: { path: '$experienceinfo1', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$frommonthinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$frommonthinfo.month', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "frommonthinfo.month.languagecode": { $exists: false } }, { "frommonthinfo.month.languagecode": "" }, { "frommonthinfo.month.languagecode": empparams.languagecode }] } },
            { $unwind: { path: '$tomonthinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$tomonthinfo.month', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "tomonthinfo.month.languagecode": { $exists: false } }, { "tomonthinfo.month.languagecode": "" }, { "tomonthinfo.month.languagecode": empparams.languagecode }] } },
            { $set: { "experienceinfo.frommonthname": { $ifNull: ['$frommonthinfo.month.monthname', ''] }, "experienceinfo.tomonthname": { $ifNull: ['$tomonthinfo.month.monthname', ''] }, "experienceinfo.fromshortmonthname": { $ifNull: ['$frommonthinfo.month.shortname', ''] }, "experienceinfo.toshortmonthname": { $ifNull: ['$tomonthinfo.month.shortname', ''] },
        
            "experienceinfo.toyear": {"$cond": [{ "$eq": ['$experienceinfo.toyear', 0] }, 'Till now', '$experienceinfo.toyear']}, "experienceinfo.expvalue": { $ifNull: ['$experienceinfo1.value', 0] } }
        },
            { $sort: { 'experienceinfo.fromyear': -1, 'experienceinfo.frommonth': -1 } },
            { $group: { _id: { totalexperience: '$totalexperience',expmonth: '$expmonth',expyear: '$expyear', fresherstatus: '$fresherstatus', dateofbirth: '$personalinfo.dateofbirth' }, "experienceinfo": { "$push": '$experienceinfo' } } },
            { $project: { _id: 0, experienceinfo: '$experienceinfo', totalexperience: '$_id.totalexperience', expmonth: '$_id.expmonth', expyear: '$_id.expyear', fresherstatus: '$_id.fresherstatus', dateofbirth: '$_id.dateofbirth' } }]).toArray(function (err, empresult) {
                if (err) throw err;
                ////console.log(empresult);
                if (empresult != null && empresult.length > 0) {
                    finalresult = empresult;
                }
                //console.log(empresult[0].experienceinfo);
                //console.log(JSON.stringify(empresult[0].experienceinfo));
                //console.log(JSON.stringify(finalresult));
                return callback(finalresult);
            });

    }
    catch (e) { logger.error("Error in Employee Experience Info: " + e); }
}

exports.getExperienceDetails = function (logparams, empparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        logger.info("Log in Employee Getting Single Record for Experience Info on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(empparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;

        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: "$personalinfo" },
            { $unwind: "$experienceinfo" },
            { $match: { employeecode: empparams.employeecode } },
            { $group: { _id: { totalexperience: '$totalexperience',expmonth: '$expmonth',expyear: '$expyear', fresherstatus: '$fresherstatus', dateofbirth: '$personalinfo.dateofbirth' }, "experienceinfo": { "$addToSet": '$experienceinfo' } } },
            { $project: { _id: 0, experienceinfo: '$experienceinfo', totalexperience: '$_id.totalexperience', expmonth: '$_id.expmonth', expyear: '$_id.expyear', fresherstatus: '$_id.fresherstatus', dateofbirth: '$_id.dateofbirth' } }]).toArray(function (err, empresult) {
                if (err) throw err;
                ////console.log(empresult);
                if (empresult != null && empresult.length > 0) {
                    finalresult = empresult;
                }
                ////console.log(finalresult);
                return callback(finalresult);
            });

    }
    catch (e) { logger.error("Error in Employee Experience Info: " + e); }
}

exports.updateExperiencestatus = function (params, employeecode, logparams,isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(params);
            //params.makerid = String(logres["ops"][0]["_id"]);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).updateOne({ "employeecode": Number(employeecode) }, { $set: { "totalexperience": Number(params.totalexperience),"expmonth": Number(params.expmonth),"expyear": Number(params.expyear), "fresherstatus": Number(params.fresherstatus) } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
               // //console.log(finalresult);
               return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employee Experience Update status: " + e); }
}

exports.experiencesave = function (params, employeecode, logparams, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var logcollectionname = dbo.collection(MongoDB.LogCollectionName);
        logcollectionname.insertOne(logparams, function (err, logres) {
            ////console.log(logres["ops"][0]["_id"]);
            //params.makerid = String(logres["ops"][0]["_id"]);
            var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).updateOne({ "employeecode": Number(employeecode) }, { $set: { "experienceinfo": params } }, function (err, res) {
                if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
            });

        });

    }
    catch (e) { logger.error("Error in Employee Experience Info Update: " + e); }
}

exports.getExperienceMaxcode = function (logparams, employeecode,isleadtype, callback) {
    try {

        logger.info("Log in Experience getting max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var paramcheck = { "employeecode": Number(employeecode) };
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find(paramcheck, { projection: { _id: 0, experienceinfo: 1 } }).toArray((err, docs) => {
            var maxcode;
            ////console.log("Max code");
            ////console.log(docs);
            if (docs[0].experienceinfo == null) {
                maxcode = 1;
            }
            else {
                const collection = docs[0].experienceinfo;
                const list = [];
                if (collection.length == 0)
                    maxcode = 1;
                else {
                    for (var i = 0; i <= collection.length - 1; i++) {
                        list.push(collection[i].experiencecode);
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
    catch (e) { logger.error("Error in Get Max Code - Experience" + e); }
}

exports.ExperienceDuplicateCheck = function (logparams, empparams, employeecodeparams, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = false;

        logger.info("Log in Employee Experience Duplicate Checking : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).find({ "employeecode": employeecodeparams.employeecode }, { projection: { _id: 0, experienceinfo: 1 } }).toArray(function (err, emplist) {
            ////console.log("dateservice");
            ////console.log(empparams);
            if (err) throw err;
            if (emplist != null && emplist[0].experienceinfo != null) {
                ////console.log("ExpEntry");
                for (var i = 0; i <= emplist[0].experienceinfo.length - 1; i++) {
                    ////console.log("forentry");
                    var fromdatestr = emplist[0].experienceinfo[i].frommonth + '/01/' + emplist[0].experienceinfo[i].fromyear;
                    var todatestr = emplist[0].experienceinfo[i].tomonth + '/01/' + emplist[0].experienceinfo[i].toyear;
                    ////console.log("///////");
                    ////console.log(fromdatestr);
                    ////console.log(todatestr);
                    ////console.log("///////");
                    if ((new Date(fromdatestr) >= new Date(empparams.fromdate) && new Date(fromdatestr) <= new Date(empparams.todate))
                        || (new Date(todatestr) >= new Date(empparams.fromdate) && new Date(todatestr) <= new Date(empparams.todate))
                        || (new Date(empparams.fromdate) >= new Date(fromdatestr) && new Date(empparams.fromdate) <= new Date(todatestr))
                        || (new Date(empparams.todate) >= new Date(todatestr) && new Date(empparams.todate) <= new Date(fromdatestr))) {
                        finalresult = true;
                    }
                }
                return callback(finalresult);
            }
            else {
                return callback(finalresult);
            }

        });

    }
    catch (e) { logger.error("Error in Employee Experience Duplicate Check : " + e); }

}

exports.getExperienceEditLoad = function (logparams, params, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;

        logger.info("Log in Experience Edit Load on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //var dbcollectionname = dbo.collection(MongoDB.SplashCollectionName);
        //state Collection
        var referenceparams = { "employeecode": Number(params.employeecode), 'experienceinfo.experiencecode': Number(params.experiencecode) };
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: '$experienceinfo' },
            { $match: referenceparams },
            {
                $project: {
                    _id: 0, experienceinfo: 1//, splashcontent:'$splash.content',statuscode:1,imageurl:1,statusname:'$statusname.statusname'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });

    }
    catch (e) { logger.error("Error in Employee Experience Edit Load: " + e); }

}
exports.ExperienceDuplicateCheckEdit = function (logparams, empparams, employeecodeparams, experiencecode, isleadtype,callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = false;

        logger.info("Log in Employee Experience Duplicate Checking : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        //onsole.log(emptypeparams);
        /* dbo.collection(String(MongoDB.EmployeeCollectionName)).find(employeecodeparams, { projection: { _id: 0, experienceinfo: 1 } }).toArray(function (err, emplist) {
            ////console.log("dateservice");
            ////console.log(empparams);
            if (err) throw err;
            if (emplist != null) {
                ////console.log("ExpEntry");
                for (var i = 0; i <= emplist[0].experienceinfo.length - 1; i++) {
                    if (emplist[0].experienceinfo[i].experiencecode != experiencecode) {
                        var fromdatestr = Number(emplist[0].experienceinfo[i].frommonth) + '/01/' + Number(emplist[0].experienceinfo[i].fromyear);
                        var todatestr = Number(emplist[0].experienceinfo[i].tomonth) + '/01/' + Number(emplist[0].experienceinfo[i].toyear);

                        if ((new Date(fromdatestr) >= new Date(empparams.fromdate) && new Date(fromdatestr) <= new Date(empparams.todate))
                            || (new Date(todatestr) >= new Date(empparams.fromdate) && new Date(todatestr) <= new Date(empparams.todate))
                            || (new Date(empparams.fromdate) >= new Date(fromdatestr) && new Date(empparams.fromdate) <= new Date(todatestr))
                            || (new Date(empparams.todate) >= new Date(todatestr) && new Date(empparams.todate) <= new Date(fromdatestr))) {
                            finalresult = true;
                        }
                    }

                }
            }
            return callback(finalresult);
        }); */
        return callback(finalresult);

    }
    catch (e) { logger.error("Error in Experience Duplicate Check: " + e); }

}
exports.getMonthinfo = function (logparams, employeecode,isleadtype,callback) {
    try {
        logger.info("Log in Employee Month info : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.MonthCollectionName).aggregate([
            { $unwind: "$month" },
            { $match: { "month.languagecode": objConstants.defaultlanguagecode } },
            {
                $sort: {
                    monthnumber: 1
                }
            },
            {
                $project: {
                    _id: 0, monthnumber: 1, monthname: "$month.monthname", shortname: "$month.shortname"
                }
            }
        ]).toArray(function (err, result) {
                        // //console.log(result)            
                        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
            dbo.collection(String(dbCollectionName)).aggregate([
                {$unwind: {path:'$personalinfo',preserveNullAndEmptyArrays: true }},
                { $match: { 'employeecode': Number(employeecode) } },
                {$project: {_id:0, dateofbirth: { $ifNull:[ '$personalinfo.dateofbirth','']}}}
                ]).toArray(function (err, empresult) {
                    finalresult = {
                        monthlist: result,
                        dateofbirth: empresult[0].dateofbirth
                    } 
            // //console.log("school");
            // //console.log(finalresult);
            return callback(finalresult);
                });
        });
    }
    catch (e) {
        logger.error("Error in Month Bind: " + e);
    }
}

exports.updateTotalExperience = function (employeecode, isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var empparams = { employeecode: Number(employeecode), languagecode: 2 };
        exports.getExperienceDetails({}, empparams,isleadtype, function (expresponse) {
            var empexplist = [];
            
              if (expresponse != null && expresponse[0].experienceinfo != null) {
                ////console.log("Entry");
                empexplist = expresponse[0].experienceinfo;
                var totalmonths = 0;
                var updateparams = {};
                if(empexplist && empexplist.length > 0){
                    // empexplist.sort(function(a, b) {
                    //     return parseFloat(b.tomonth) - parseFloat(a.tomonth);
                    // });
                    //console.log("empexplist",empexplist);
                    for(var i = 0; i< empexplist.length; i++){
                        var exp_detail = empexplist[i];
                        var fromdatestr = exp_detail.frommonth + '/01/' + exp_detail.fromyear;
                        var todatestr = exp_detail.tomonth + '/01/' + exp_detail.toyear;
                        var fromdate = new Date(fromdatestr);
                        var todate = exp_detail.tomonth==0? new Date() : new Date(todatestr);
                        totalmonths = totalmonths + monthDiff(fromdate,todate);
                        //console.log("totalmonths",totalmonths);
                    }
                    var ExpMonth = (totalmonths%12);
                    var ExpYear = Math.floor(totalmonths/12);
                    var TotalExperience = totalmonths/12;
                    TotalExperience = TotalExperience.toFixed(2);
                    //  console.log("expresponse",expresponse);
                    //  console.log("expresponse",expresponse[0].fresherstatus);
                    updateparams = { "totalexperience": TotalExperience,"expmonth": ExpMonth,"expyear": ExpYear, "fresherstatus": expresponse[0].fresherstatus ? expresponse[0].fresherstatus : 0 }
                     //console.log("updateparams",updateparams);
                    exports.updateExperiencestatus(updateparams, employeecode, {},isleadtype, function (expupdateresponse) {
                        //console.log("expupdateresponse",expupdateresponse);
                        return callback(expupdateresponse);
                    });
                }     
                else{
                    updateparams = { "totalexperience": 0,"expmonth": 0,"expyear": 0, "fresherstatus": expresponse[0].fresherstatus ? expresponse[0].fresherstatus : 0 }
                     //console.log("updateparams",updateparams);
                    exports.updateExperiencestatus(updateparams, employeecode, {},isleadtype, function (expupdateresponse) {
                        //console.log("expupdateresponse",expupdateresponse);
                        return callback(expupdateresponse);
                    });
                }           
              }
              else{
                updateparams = { "totalexperience": 0,"expmonth": 0,"expyear": 0, "fresherstatus": 1 }
                 console.log("updateparams",updateparams);
                exports.updateExperiencestatus(updateparams, employeecode, {},isleadtype, function (expupdateresponse) {
                    //console.log("expupdateresponse",expupdateresponse);
                    return callback(expupdateresponse);
                });
            }    
        });

    }
    catch (e) { logger.error("Error in Employee Experience Update status: " + e); }
}

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}