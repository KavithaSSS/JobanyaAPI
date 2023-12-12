const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
var date = new Date(); // some mock date
var milliseconds = date.getTime();
exports.JobpostList = function (logparams, params, callback) {
    try {
        logger.info("Log in Job Post List: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var employercode = {}, jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, joblocationcode = {}, maritalcode = {}, gendercode = {};
        var agefrom = {}, differentlyabledcode = {}, salaryfrom = {}, salaryto = {}, statuscode = {};
        //var explist = [];
        var explist = params.experiencecode;
        var exp = [];
        var fromdate = parseFloat(params.fromdate);
        var todate = parseFloat(params.todate);
        var dateparam = {};
        if ((params.fromdate != null && params.fromdate != undefined) && (params.fromdate != null && params.fromdate != undefined))
            dateparam = { "$and": [{ "approveddate": { $gte: fromdate } }, { "approveddate": { $lte: todate } }] };


        if (explist.length > 0) {
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
                    exp.push({ "$or": [{ "$and": [{ 'experience.from': { '$lte': explist[i] } }, { 'experience.to': 0 }] }, { "$and": [{ 'experience.from': { '$lte': explist[i] } }, { 'experience.to': { '$gte': explist[i] } }] }] });
                    ////console.log(exp);
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    //temp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
                    temp.push({ "$or": [{ "$and": [{ 'experience.from': { '$lte': explist[i] } }, { 'experience.to': 0 }] }, { "$and": [{ 'experience.from': { '$lte': explist[i] } }, { 'experience.to': { '$gte': explist[i] } }] }] });
                    // //console.log(temp);
                    exp = exp1.concat(temp);
                    ////console.log(exp);
                }
            }
        }
        else {
            exp = [{}];
        }
        if (params.employercode.length > 0)// Employer
            employercode = { 'employercode': { $in: params.employercode } };
        if (params.jobfunctioncode.length > 0)// Job function
            jobfunctioncode = { 'jobfunctioncode': { $in: params.jobfunctioncode } };
        if (params.jobrolecode.length > 0)// Job Role
            jobrolecode = { 'jobrolecode': { $in: params.jobrolecode } };
        if (params.skillcode.length > 0)// Skill
            skillcode = { 'skills.skillcode': { $in: params.skillcode } };
        if (params.locationcode.length > 0)// Job Location
            joblocationcode = { 'preferredlocation.locationlist.locationcode': { $in: params.locationcode } };
        if (params.maritalcode.length > 0)// marital code
            maritalcode = { $or: [{ 'maritalstatus.isany': 'true' }, { $and: [{ 'maritalstatus.isany': 'false' }, { 'maritalstatus.maritallist.maritalcode': { $in: params.maritalcode } }] }] };
        if (params.gendercode.length > 0)// gender code
            gendercode = { $or: [{ 'gender.isany': 'true' }, { $and: [{ 'gender.isany': 'false' }, { 'gender.genderlist.gendercode': { $in: params.gendercode } }] }] };
        if (params.differentlyabled) // Differently abled
            if (Number(params.differentlyabled) > 0)
                differentlyabledcode = { 'differentlyabled': Number(params.differentlyabled) };
        if (Number(params.salaryto) != null && Number(params.salaryto) != 0)
            salaryfrom = { 'salaryrange.min': { $lte: Number(params.salaryto) } };
        if (Number(params.salaryfrom) != null && Number(params.salaryfrom) != 0)
            salaryto = { 'salaryrange.max': { $gte: Number(params.salaryfrom) } };

        if (params.anyage == "true") {
            agefrom = {};
            //ageto = {};
        }
        else {
            agefrom = { $or: [{ 'agecriteria.isany': 'true' }, { $and: [{ 'agecriteria.isany': 'false' }, { 'agecriteria.from': { $lte: Number(params.ageto) } }, { 'agecriteria.to': { $gte: Number(params.agefrom) } }] }] };
            //agefrom = {};
            //agefrom = {'agecriteria.from': {$lte: Number(listparams.ageto)}};
            //ageto = {'agecriteria.to': {$gte: Number(listparams.agefrom)}};
        }
        if ((params.statuscode) == 0) { statuscode = { 'statuscode': { $ne: objConstants.deletestatus } }; }
        else {
            statuscode = { 'statuscode': parseInt(params.statuscode) };
            // if(parseInt(params.statuscode) == 4 ){
            //     statuscode = {$or:[{'statuscode': parseInt(params.statuscode)},{'editedstatuscode': parseInt(params.statuscode)}]};
            // }else{
            //     statuscode = { 'statuscode': parseInt(params.statuscode) };
            // } 
        }
        var matchparams = { $and: [dateparam, employercode, jobfunctioncode, jobrolecode, skillcode, joblocationcode, maritalcode, gendercode, agefrom, differentlyabledcode, statuscode, { $or: exp }, { $and: [salaryfrom, salaryto] }] };
        if (matchparams != "") {
            FindAllActiveEmployee(function (emplist) {
                var empcondition = {};
                var tempempcode = [];
                if (emplist != null && emplist.length > 0) {
                    for (var i = 0; i <= emplist.length - 1; i++) {
                        tempempcode.push(emplist[i].employeecode);
                    }
                    empcondition = { "$in": ["$employeecode", tempempcode] };
                }
                dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
                    { $match: matchparams },
                    {
                        $lookup: {
                            from: String(MongoDB.EmployerCollectionName),
                            localField: 'employercode',
                            foreignField: 'employercode',
                            as: 'employer'
                        }
                    },
                    { $unwind: '$employer' },
                    {
                        $lookup: {
                            from: String(MongoDB.JobRoleCollectionName),
                            localField: 'jobrolecode',
                            foreignField: 'jobrolecode',
                            as: 'jobrolelist'
                        }
                    },
                    { $unwind: { path: '$jobrolelist', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$jobrolelist.jobrole', preserveNullAndEmptyArrays: true } },
                    { $match: { $or: [{ "jobrolelist.jobrole.languagecode": { $exists: false } }, { "jobrolelist.jobrole.languagecode": "" }, { "jobrolelist.jobrole.languagecode": objConstants.defaultlanguagecode }] } },

                    {
                        $lookup: {
                            from: String(MongoDB.JobFunctionCollectionName),
                            localField: 'jobfunctioncode',
                            foreignField: 'jobfunctioncode',
                            as: 'jobfunctionlist'
                        }
                    },
                    { $unwind: '$jobfunctionlist' },
                    { $unwind: '$jobfunctionlist.jobfunction' },
                    { $match: { 'jobfunctionlist.jobfunction.languagecode': objConstants.defaultlanguagecode } },
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
                        $sort: {
                            createddate: -1
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeInvitedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, empcondition] } } },
                            ],
                            "as": "invitedinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeAppliedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, empcondition] } } },
                            ],
                            "as": "appliedinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeAppliedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$shortliststatus", 8] }, empcondition] } } },
                            ],
                            "as": "appshortlistinfo"
                        }
                    },
                    {
                        "$lookup": {
                            "from": String(MongoDB.EmployeeInvitedCollectionName),
                            "let": { "jobcode": "$jobcode" },
                            "pipeline": [
                                { "$match": { "$expr": { $and: [{ "$eq": ["$jobcode", "$$jobcode"] }, { "$eq": ["$shortliststatus", 8] }, empcondition] } } },
                            ],
                            "as": "invshortlistinfo"
                        }
                    },
                    { $unwind: { path: '$appliedinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$invitedinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$appshortlistinfo', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$invshortlistinfo', preserveNullAndEmptyArrays: true } },
                    {
                        "$group":
                        {
                            "_id": {
                                employercode: '$employercode', registeredname: '$employer.registeredname', profileurl: '$employer.profileurl', jobid: '$jobid', jobrolename: '$jobrolelist.jobrole.jobrolename'
                                , jobcode: '$jobcode', remarks: '$remarks', jobfunctionname: '$jobfunctionlist.jobfunction.jobfunctionname', createddate: '$createddate', validitydate: '$validitydate', approveddate: '$approveddate', statuscode: '$statuscode', statusname: '$statusinfo.statusname',
                                "matchingprofilecount": '$matchingprofilecount', "wishlistcount": '$wishlistcount', "viewedcount": '$viewedcount'
                            },
                            "appcount": { $addToSet: "$appliedinfo.employeecode" },
                            "invcount": { $addToSet: "$invitedinfo.employeecode" },
                            "appshortcount": { $addToSet: "$appshortlistinfo.employeecode" },
                            "invshortcount": { $addToSet: "$invshortlistinfo.employeecode" },
                            "appcallcount": { "$sum": "$appliedinfo.callcount" },
                            "invcallcount": { "$sum": "$invitedinfo.callcount" },
                        }
                    },
                    {
                        $project: {
                            // _id: 0, employercode: 1, registeredname: '$employer.registeredname', profileurl: '$employer.profileurl', jobid: 1, jobrolename: '$jobrolelist.jobrole.jobrolename'
                            // , jobcode: 1, remarks: 1, jobfunctionname: '$jobfunctionlist.jobfunction.jobfunctionname', createddate: 1, validitydate: 1, approveddate: 1, statuscode: 1, statusname: '$statusinfo.statusname',
                            _id: 0, employercode: '$_id.employercode',
                            registeredname: '$_id.registeredname',
                            profileurl: '$_id.profileurl',
                            jobid: '$_id.jobid',
                            jobrolename: '$_id.jobrolename',
                            jobcode: '$_id.jobcode',
                            remarks: '$_id.remarks',
                            jobfunctionname: '$_id.jobfunctionname',
                            createddate: '$_id.createddate',
                            validitydate: '$_id.validitydate',
                            approveddate: '$_id.approveddate',
                            statuscode: '$_id.statuscode',
                            statusname: '$_id.statusname',
                            "appliedcount": { "$size": "$appcount" },
                            "invitedcount": { "$size": "$invcount" },
                            "appshortlistcount": { "$size": "$appshortcount" },
                            "invshortlistcount": { "$size": "$invshortcount" },
                            "matchingprofilecount": { $ifNull: ['$_id.matchingprofilecount', 0] },
                            "wishlistcount": { $ifNull: ['$_id.wishlistcount', 0] },
                            "viewedcount": { $ifNull: ['$_id.viewedcount', 0] },
                            "appcallcount": { $ifNull: ['$appcallcount', 0] },
                            "invcallcount": { $ifNull: ['$invcallcount', 0] },
                        }
                    },
                    { $sort: { "createddate": -1 } },
                    { $skip: parseInt(params.skipvalue) },
                    { $limit: parseInt(params.limitvalue) }
                ]).toArray(function (err, result) {
                    finalresult = result;
                    return callback(finalresult);
                });
            });
        }
        else {
            return callback(finalresult);
        }
    }
    catch (e) {
        logger.error("Error in Job post view- Jobpost " + e);
    }

}

// exports.GetJobpostDetails = function (logparams, req, callback) {
//     try {
//         const dbo = MongoDB.getDB();
//         var empparams = {  "jobcode": Number(req.body.jobcode) , "editedstatuscode": Number(objConstants.pendingstatus) };
//         logger.info("Log in Find jobcode  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

//         dbo.collection(MongoDB.JobPostsCollectionName).find(empparams, { projection: { _id: 0, jobcode: 1,
//             statuscode: 1,editedstatuscode:1,editedsalaryrange:1,
//             editedexperience:1,editedschooling:1,editedafterschooling:1,experience:1
//             ,schooling:1,afterschooling:1,salaryrange:1 } }).toArray(function (err, result) { 
//             if (err)
//                { 

//                    throw err; 
//                } 
//             return callback(result);
//         });
//     }
//     catch (e) {
//         logger.error("Error in Find jobcode  : " + e);
//     }
// }

exports.UpdateRemarks = function (logparams, req, callback) {
    try {
        logger.info("Log in Update remarks: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        objUtilities.InsertLog(logparams, function (validlog) {
            if (validlog != null && validlog != "") {
                objUtilities.getcurrentmilliseconds(function (currenttime) {
                    // if(statuscode == 0){
                    //Update job post status code
                    dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode": Number(req.body.jobcode) }, { $set: { "statuscode": Number(req.body.statuscode), "remarks": req.body.remarks, "checkerid": validlog, "updateddate": currenttime, "approveddate": currenttime } }, function (err, res) {
                        if (err) throw err;
                        if (res.modifiedCount > 0)
                        {
                            dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
                                {$match: {"jobcode": Number(req.body.jobcode)}},
                                {$project: {_id: 0, jobcode: 1, repostjobid: { $ifNull: ['$repostjobid', 0] }}}
                                ]).toArray(function (err, result) {
                                    if (result != null && result.length > 0 && Number(result[0].repostjobid) != 0)
                                    {
                                        dbo.collection(MongoDB.EmployerWishListCollectionName).aggregate([
                                            {$match: { "$and": [{ "$or": [{statuscode: objConstants.unwishlistedstatus}, {statuscode: objConstants.shortlistedstatus}]}, {"jobcode":result[0].repostjobid}]}},
                                            {
                                                "$addFields": {
                                                  "jobcode": Number(req.body.jobcode)
                                                }
                                            },
                                            {
                                                "$addFields": {
                                                  "statuscode": objConstants.repostrejectedstatus
                                                }
                                            },
                                            {
                                                "$addFields": {
                                                  "createddate": currenttime
                                                }
                                            },
                                            {$project: {_id: 0, employeecode: 1, makerid: 1, remarks: 1, statuscode: 1, jobcode: 1, employercode: 1, createddate: 1}}
                                            ]).toArray(function (err, wishresult){
                                                if (wishresult != null && wishresult != undefined && wishresult.length > 0)
                                                {
                                                    //console.log(JSON.stringify(wishresult, null, " "))
                                                    dbo.collection(MongoDB.EmployerWishListCollectionName).insertMany(wishresult, function (err, wishres) {
                                                        // //console.log(res);
                                                        if (err) throw err;
                                                            //finalresult = res.insertedCount;
                                                            ////console.log(finalresult);
                                                           // return callback(finalresult);
                                                    });
                                                }
                                                return callback(validlog);
                                            });
                                    }
                                    else
                                    {
                                        return callback(validlog);
                                    }
                                    
                                });
                           
                        }
                            
                        else
                            return callback("");
                    });
                    // }else{
                    //     //Update approval job details and status code
                    //     updateparams.statuscode=Number(req.body.statuscode);
                    //     updateparams.remarks=req.body.remarks;
                    //     updateparams.checkerid=validlog;
                    //     updateparams.updateddate=currenttime;
                    //     updateparams.approveddate=currenttime;
                    //     dbo.collection(MongoDB.JobPostsCollectionName).updateOne({ "jobcode": 
                    //     Number(req.body.jobcode) }, { $set: updateparams }, function (err, res) {
                    //         if (err) throw err; 
                    //         if (res.modifiedCount > 0)
                    //             return callback(validlog);
                    //         else
                    //             return callback("");
                    //     });
                    // }

                });

            }
        });

    }
    catch (e) {
        logger.error("Error in Update Remarks- Jobpost " + e);
    }
}
function FindAllActiveEmployee(callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "statuscode": Number(objConstants.activestatus) };
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: params },
            {
                $project: {
                    _id: 0, employeecode: 1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Find all employee- sendsms " + e);
    }
}
exports.FindJobcode = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        logger.info("Log in Find Job code: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);

        dbo.collection(MongoDB.JobPostsCollectionName).find(params, { projection: { _id: 0, jobcode: 1 } }).toArray(function (err, result) {
            if (result.length > 0)
                res = true;
            else
                res = false;
            return callback(res);
        });

    }
    catch (ex) {
        logger.error("Error in Find Job code- Jobpost " + e);
    }
}