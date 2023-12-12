'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');
const { jobrole_list_by_code } = require('../controller/cp_jobrole_controller');


exports.getAllJobList = function (logparams, params, listparams, listcode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var exp = [];
        var explist = [];
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Job List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        explist = listparams.experiencecode;
        //if (explist.length == 0)   
        //explist = [0];
        ////console.log("explist",explist);
        // if (explist.length > 0) {
        //     for (var i = 0; i <= explist.length - 1; i++) {
        //         if (i == 0) {
        //             if (explist[i] == 0) {
        //                 exp.push({ "$or": [{ 'experience.isfresher': "true" }, { "$and": [{ 'experience.from': { '$lte': explist[i] } }, { 'experience.to': { '$gte': explist[i] } }] }] });
        //             }
        //             else {
        //                 exp.push({ "$and": [{ 'experience.from': { '$gte': explist[i] } }] });
        //             }
        //             //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});

        //             // //console.log({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
        //         }
        //         else {
        //             var exp1 = [];
        //             exp1 = exp;
        //             var temp = [];
        //             if (explist[i] == 0) {
        //                 temp.push({ "$or": [{ 'experience.isfresher': "true" }, { "$and": [{ 'experience.from': { '$gte': explist[i] } }, { 'experience.to': { '$lte': explist[i] } }] }] });
        //             }
        //             else {
        //                 temp.push({ "$or": [ { "$and": [{ 'experience.from': { '$gte': explist[i] } }, { 'experience.to': { '$lte': explist[i] } }] }] });
        //             }
        //             //temp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});

        //             // //console.log(temp);
        //             exp = exp1.concat(temp);
        //             ////console.log(exp);
        //         }
        //     }
        // }
        if (explist.length == 1) {
            exp = [{ 'experience.isfresher': "true" }];
        }
        else if (explist.length == 2) {
            if (explist[0] == 0) {
                exp = [{
                    "$or": [{ 'experience.isfresher': "true" }, {
                        $or: [
                            { "$and": [{ 'experience.from': { '$gte': explist[0] } }, { 'experience.from': { '$lte': explist[1] } }] },
                            { "$and": [{ 'experience.to': { '$gte': explist[0] } }, { 'experience.to': { '$lte': explist[1] } }] }]
                    }]
                }];
            }
            else {
                exp = [{
                    $or: [
                        { "$and": [{ 'experience.from': { '$gte': explist[0] } }, { 'experience.from': { '$lte': explist[1] } }] },
                        { "$and": [{ 'experience.to': { '$gte': explist[0] } }, { 'experience.to': { '$lte': explist[1] } }] }]
                }];
            }
        }
        else if (explist.length == 3) {
            if (explist[0] == 0) {
                exp = [{
                    "$or": [{ 'experience.isfresher': "true" },
                    {
                        $or: [
                            { "$and": [{ 'experience.from': { '$gte': explist[1] } }, { 'experience.from': { '$lte': explist[2] } }] },
                            { "$and": [{ 'experience.to': { '$gte': explist[1] } }, { 'experience.to': { '$lte': explist[2] } }] }]
                    }]
                }];
            }
            else {
                exp = [
                    {
                        $or: [
                            { "$and": [{ 'experience.from': { '$gte': explist[1] } }, { 'experience.from': { '$lte': explist[2] } }] },
                            { "$and": [{ 'experience.to': { '$gte': explist[1] } }, { 'experience.to': { '$lte': explist[2] } }] }]
                    }];
            }
        }
        else {
            exp = [{}];
        }

        var skipvalue = params.skip;
        var limitvalue = params.limit;
        var searchtypecode = parseInt(params.searchtypecode);
        var skipCondition = { $skip: objConstants.skipvalue };
        var limitCondition = { $limit: objConstants.limitvalue };
        // console.log("skipvalue1", skipvalue)
        // console.log("limitvalue1", limitvalue)
        if ((skipvalue != null) && (limitvalue != null && limitvalue != 0)) {
            skipCondition = { $skip: parseInt(skipvalue) };
            limitCondition = { $limit: parseInt(limitvalue) };
        }
        var matchparams = "";
        var employerparams;
        var wishlistjobcode = [];
        var appliedjobcode = [];
        var invitedjobcode = [];
        var isshowwebsitecondition = {};
        var jobfunctioncode = {}, industrycode = {}, skillcode = {}, locationcode = {}, jobtypecode = {}, schoolqualcode = {}, maritalcode = {}, gendercode = {}, educationcode = {};
        var afterschoolqualcode = {}, afterschoolspeccode = {}, differentlyabledcode = {}, salaryfrom = {}, salaryto = {}, agefrom = {}, ageto = {}, jobrolecode = {};
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.jobrolecode.length > 0)// job function==
            jobrolecode = { 'jobrolecode': { $in: listparams.jobrolecode } };
        if (listparams.industrycode.length > 0)// Industry==
            industrycode = { 'industrycode': { $in: listparams.industrycode } };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
        if ((params.type && params.type == 2) || (params.type && params.type == 6)) {
            // console.log("Location1")
            if (listparams.locationcode.length > 0)// Location--
                locationcode = { 'preferredjoblocation.locationlist.locationcode': { $in: listparams.locationcode } };
        }

        else {
            // console.log("Location2")
            if (listparams.locationcode.length > 0)// Location--
                locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };

        }
        //  console.log("paramsKavitha");
        // console.log(listparams.locationcode);
        if (listparams.jobtypecode.length > 0)// JobType==
            // jobtypecode = {$or:[{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } },{ 'preferences.employementtype.employementtypecode': 9}]};
            jobtypecode = { 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } };
        //jobtypecode = { $or: [{ 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } }, { 'jobtypes.jobtypecode': 9 }] };
        //console.log(jobtypecode);
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.anydegree == "true") {
            educationcode = {};
            schoolqualcode = {};
            //afterschoolqualcode = {};
            //afterschoolspeccode = {};
        }
        else if (listparams.anyqualification == "true" && listparams.anyspec == "true") {
            educationcode = {
                $or: [
                    {
                        $and: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                        { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                    }]
            };
            //educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{afterschool : {$ne: 0}}]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            if (listparams.afterschoolcatecode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.afterschoolqualcode.length > 0)
                schoolqualcode = {};
        }
        else if (listparams.anyqualification == "false" && listparams.anyspec == "true") {
            educationcode = {
                $or: [{
                    $or: [{ 'afterschooling.isany': 'true' },
                    {
                        $and: [{ 'afterschooling.isany': 'false' },
                        { 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } }]
                    }]
                },
                {
                    $and: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                    { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                }]
            };
            //educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{afterschool : {$ne: 0}}]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            if (listparams.afterschoolcatecode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.afterschoolqualcode.length > 0)
                schoolqualcode = {};
        }
        else if (listparams.afterschoolcatecode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.afterschoolqualcode.length > 0) {

            //if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            //afterschoolqualcode = {'afterschooling.qualificationcode': {$in: listparams.afterschoolqualcode }};
            //if (listparams.afterschoolspeccode.length > 0)// after school spec code==

            //afterschoolspeccode = {'afterschooling.specializationcode': {$in: listparams.afterschoolspeccode }};
            //var afterschool =listparams.afterschool 
            // educationcode = {$and:[{$or:[{'afterschooling.isanyspec':'true'}, 
            // {$and:[{'afterschooling.isanyspec':'false'},
            // {'afterschooling.qualificationlist.qualificationcode': {$in: listparams.afterschoolqualcode }},
            // {'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]},
            // {$or:[{'afterschooling.isany':'true'}, 
            // {$and:[{'afterschooling.isany':'false'},
            // {'afterschooling.qualificationlist.qualificationcode': {$in: listparams.afterschoolqualcode }}]}]},            
            // {$and:[{'afterschooling.isany':'true'},{'afterschooling.isanyspec':'true'},
            // {'afterschooling.categorylist.educationcategorycode': {$in: listparams.afterschoolcatecode }}]}]};        
            // //educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{afterschool : {$ne: 0}}]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            educationcode = {
                $and: [{
                    $or: [{ 'afterschooling.isanyspec': 'true' },
                    {
                        $and: [{ 'afterschooling.isanyspec': 'false' },
                        { 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } },
                        {
                            'afterschooling.afterschoolinglist.specializationcode':
                                { $in: listparams.afterschoolspeccode }
                        }]
                    }]
                },
                {
                    $or: [{ 'afterschooling.isany': 'true' },
                    {
                        $and: [{ 'afterschooling.isany': 'false' },
                        {
                            'afterschooling.qualificationlist.qualificationcode':
                                { $in: listparams.afterschoolqualcode }
                        }]
                    }]
                },
                {
                    $or: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                    {
                        $and: [{ 'afterschooling.isany': 'false' }, { 'afterschooling.isanyspec': 'false' },
                        { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                    }]
                }]
            };


            schoolqualcode = {};
        }
        ////console.log("education:", educationcode);
        if (listparams.maritalcode.length > 0)// marital code
            maritalcode = { $or: [{ 'maritalstatus.isany': 'true' }, { $and: [{ 'maritalstatus.isany': 'false' }, { 'maritalstatus.maritallist.maritalcode': { $in: listparams.maritalcode } }] }] };
        //maritalcode = {'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}};
        if (listparams.gendercode.length > 0)// gender code
            gendercode = { $or: [{ 'gender.isany': 'true' }, { $and: [{ 'gender.isany': 'false' }, { 'gender.genderlist.gendercode': { $in: listparams.gendercode } }] }] };
        //gendercode = {'gender.genderlist.gendercode': {$in: listparams.gendercode}};
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { $or: [{ 'differentlyabled': Number(listparams.differentlyabled) }, { 'differentlyabled': -1 }] };
        if (Number(listparams.salaryto) != null && Number(listparams.salaryto) != 0)
            salaryfrom = { 'salaryrange.min': { $lte: Number(listparams.salaryto) } };
        if (Number(listparams.salaryfrom) != null && Number(listparams.salaryfrom) != 0)
            salaryto = { 'salaryrange.max': { $gte: Number(listparams.salaryfrom) } };
        ////console.log("afterschool");
        ////console.log(listparams.afterschool);
        if (listparams.anyage == "true") {
            agefrom = {};
            //ageto = {};
        }
        else {
            //{$and:[{'agecriteria.isany':'false'},{'agecriteria.from': {$lte: Number(listparams.ageto)}},{'agecriteria.to': {$gte: Number(listparams.agefrom)}}]}
            //agefrom = {$or:[{$and:[{'agecriteria.isany':'true'},{0: {$ne: listparams.afterschool}}]}, {$and:[{'agecriteria.isany':'false'},{'agecriteria.from': {$lte: Number(listparams.ageto)}},{'agecriteria.to': {$gte: Number(listparams.agefrom)}}]}]};    
            agefrom = { $or: [{ 'agecriteria.isany': 'true' }, { $and: [{ 'agecriteria.isany': 'false' }, { 'agecriteria.from': { $lte: Number(listparams.ageto) } }, { 'agecriteria.to': { $gte: Number(listparams.agefrom) } }] }] };
            //agefrom = {};
            //agefrom = {'agecriteria.from': {$lte: Number(listparams.ageto)}};
            //ageto = {'agecriteria.to': {$gte: Number(listparams.agefrom)}};
        }
        if (listparams.companytypecode.length > 0 && listparams.employertypecode.length > 0) {
            employerparams = { "employerinfo.statuscode": objConstants.activestatus, 'employerinfo.companytypecode': { $in: listparams.companytypecode }, 'employerinfo.employertypecode': { $in: listparams.employertypecode } };
        }
        else if (listparams.companytypecode.length > 0 && listparams.employertypecode.length == 0) {
            employerparams = { "employerinfo.statuscode": objConstants.activestatus, 'employerinfo.companytypecode': { $in: listparams.companytypecode } };
        }
        else if (listparams.companytypecode.length == 0 && listparams.employertypecode.length > 0) {
            employerparams = { "employerinfo.statuscode": objConstants.activestatus, 'employerinfo.employertypecode': { $in: listparams.employertypecode } };
        }
        else {
            employerparams = { "employerinfo.statuscode": objConstants.activestatus };
        }
        // console.log(milliseconds);
        // console.log(industrycode);
        //  console.log(jobfunctioncode);
        //  console.log(jobrolecode);
        //  console.log(locationcode);
        //  console.log(skillcode);
        //  console.log(jobtypecode);
        //  console.log(schoolqualcode);
        //   console.log(educationcode);
        //  console.log(agefrom);
        //  console.log(maritalcode);
        // console.log(gendercode);
        //  console.log(differentlyabledcode);
        // console.log(salaryfrom);
        // console.log(salaryto); 
        // //console.log(jobtypecode);
        // console.log("Kavitha LogParams")
        // console.log(JSON.stringify(locationcode))
        if (listcode == 1)// Common List
        {
            if (Number(params.employeecode) == -1) {
                // if (searchtypecode == 1) {
                //     //Location
                //     locationcode = {};
                //     isshowwebsitecondition = { 'joblocationinfo.isshowwebsite': 1 };
                // }
                // else if (searchtypecode == 3) {
                //     //Job Function
                //     jobfunctioncode = {};
                //     isshowwebsitecondition = { 'jobfunctioninfo.isshowwebsite': 1 };
                // }
                // else {
                //     isshowwebsitecondition = { $or: [{ 'joblocationinfo.isshowwebsite': 1 }, { 'jobfunctioninfo.isshowwebsite': 1 }] }
                // }
            }

            //{'subscriptiondetails.expirydate': {$gte: milliseconds }},
            //console.log("exp",JSON.stringify(exp,null," "))
            matchparams = {
                $and: [{ 'validitydate': { $gte: milliseconds } }, { 'statuscode': { $eq: objConstants.approvedstatus } },
                {
                    $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                        { $or: exp }, educationcode,
                        { $and: [salaryfrom, salaryto] }, agefrom]
                }]
            };
            // console.log("Kavithauuuuuuuuuuuuuuuuuuuuu");

            // console.log("params",JSON.stringify(params))
            // console.log("employerparams",JSON.stringify(employerparams))
            //    console.log("matchparams",JSON.stringify(matchparams,null, " "))
            // console.log("skipCondition",JSON.stringify(skipCondition))
            // console.log("limitCondition",JSON.stringify(limitCondition))
            if (matchparams != "") {
                // console.log("Kavitha");
                // console.log(skipCondition);
                // console.log(limitCondition);0
                GetAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                    ////console.log(jobresult);
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 2) // Recommended
        {
            /*  dbo.collection(MongoDB.EmployeeWishListCollectionName).aggregate([
                 {$match:{ "employeecode": Number(params.employeecode), "statuscode": objConstants.wishlistedstatus }}, 
                 {$group: {"_id": {"employeecode": '$employeecode'},  "jobcodelist": {"$push": {"jobcode": '$jobcode'}}}},
                         { "$project": {
                            _id: 0,
                              jobcode: '$jobcodelist.jobcode'}}
                 ]).toArray(function (err, wishlistresult) { */
            ////console.log("ji");
            /*  if (wishlistresult[0] != null && wishlistresult[0].jobcode.length > 0)
                 wishlistjobcode = wishlistresult[0].jobcode; */
            ////console.log(milliseconds);
            ////console.log(wishlistresult[0].jobcode);
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0)
                    appliedjobcode = appliedresult[0].jobcode;
                ////console.log(appliedjobcode);
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.invitedstatus } },
                    { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                    {
                        "$project": {
                            _id: 0,
                            jobcode: '$jobcodelist.jobcode'
                        }
                    }
                ]).toArray(function (err, invitedresult) {
                    if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0)
                        invitedjobcode = invitedresult[0].jobcode;
                    // console.log(invitedjobcode);
                    //console.log(milliseconds);
                    //{'subscriptiondetails.expirydate': {$gte: milliseconds }},
                    matchparams = {
                        $and: [{ 'validitydate': { $gte: milliseconds } },
                        { 'jobcode': { $nin: appliedjobcode } },
                        { 'jobcode': { $nin: invitedjobcode } }, { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [
                                jobfunctioncode, jobrolecode, industrycode, skillcode,
                                locationcode, jobtypecode, schoolqualcode, maritalcode,
                                gendercode, differentlyabledcode, agefrom, educationcode,
                                { $or: exp },
                                { $and: [salaryfrom, salaryto] }]
                        }]
                    };
                    // console.log(differentlyabledcode);
                    ////console.log("Match");
                    if (matchparams != "") {
                        GetAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                });
            });
            //});
        }
        else if (listcode == 3) // Wish List
        {
            dbo.collection(MongoDB.EmployeeWishListCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.wishlistedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, wishlistresult) {
                if (wishlistresult[0] != null && wishlistresult[0].jobcode.length > 0) {
                    matchparams = {
                        $and: [{ 'jobcode': { $in: wishlistresult[0].jobcode } },
                        { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, educationcode,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };
                    if (matchparams != "") {
                        GetAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }
                else {
                    var result = [];
                    return callback(result);
                }

            });

        }
        else if (listcode == 4) // Applied
        {
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0) {
                    matchparams = {
                        $and: [{ 'jobcode': { $in: appliedresult[0].jobcode } },
                        { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, educationcode,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };
                    if (matchparams != "") {
                        GetAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }
                else {
                    var result = [];
                    return callback(result);
                }

            });

        }
        else if (listcode == 5) // Invited
        {
            dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.invitedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, invitedresult) {
                if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0) {
                    matchparams = {
                        $and: [{ 'jobcode': { $in: invitedresult[0].jobcode } },
                        { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, educationcode,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };
                    if (matchparams != "") {
                        GetAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }
                else {
                    var result = [];
                    return callback(result);
                }
            });
        }
        else if (listcode == 6) // Apply Job
        {
            // Job function
            ////console.log("Entry");
            ////console.log(listparams);
            if (listparams.jobfunctioncode.length > 0)
                jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
            // if (listparams.jobrolecode.length > 0)
            //     jobrolecode = {'jobrolecode': {$in: listparams.jobrolecode}};
            industrycode = {};
            if (listparams.skillcode.length > 0)
                skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
            //locationcode = {'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}};
            locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };
            //jobtypecode = {'jobtypes.jobtypecode': {$in: listparams.jobtypecode}};
            if (listparams.jobtypecode.length > 0)// JobType==
                // jobtypecode = {$or:[{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } },{ 'preferences.employementtype.employementtypecode': 9}]};
                jobtypecode = { 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } };
            // jobtypecode = { $or: [{ 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } }, { 'jobtypes.jobtypecode': 9 }] };
            if (listparams.schoolqualcode.length > 0)
                schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
            if (listparams.afterschoolqualcode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.anydegree == "true")
                schoolqualcode = {};
            //afterschoolqualcode = {'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }};
            //afterschoolspeccode = {'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }};
            //maritalcode = {'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}};
            maritalcode = { $or: [{ 'maritalstatus.isany': 'true' }, { $and: [{ 'maritalstatus.isany': 'false' }, { 'maritalstatus.maritallist.maritalcode': { $in: listparams.maritalcode } }] }] };
            gendercode = { $or: [{ 'gender.isany': 'true' }, { $and: [{ 'gender.isany': 'false' }, { 'gender.genderlist.gendercode': { $in: listparams.gendercode } }] }] };
            //gendercode = {'gender.genderlist.gendercode': {$in: listparams.gendercode}};
            agefrom = { $or: [{ 'agecriteria.isany': 'true' }, { $and: [{ 'agecriteria.isany': 'false' }, { 'agecriteria.from': { $lte: Number(listparams.ageto) } }, { 'agecriteria.to': { $gte: Number(listparams.agefrom) } }] }] };
            // educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{ "afterschooling.afterschoolinglist.qualificationcode": { $exists: true } }]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            //OLD --------------educationcode = {$or:[{'afterschooling.isany':'true'}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        

            educationcode = {
                $or: [schoolqualcode, { 'afterschooling.isanydegree': 'true' }, {
                    $or: [{ 'afterschooling.isanyspec': 'true' },
                    {
                        $and: [{ 'afterschooling.isanyspec': 'false' },
                        { 'afterschooling.afterschoolinglist.qualificationcode': { $in: listparams.afterschoolqualcode } },
                        { 'afterschooling.afterschoolinglist.specializationcode': { $in: listparams.afterschoolspeccode } }]
                    }]
                },
                    {
                        $or: [{ 'afterschooling.isany': 'true' },
                        {
                            $and: [{ 'afterschooling.isany': 'false' },
                            { 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } }]
                        }]
                    },
                    {
                        $and: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                        { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                    }]
            };

            // console.log("educationcode",JSON.stringify(schoolqualcode))
            // console.log("educationcode",JSON.stringify({ 'afterschooling.afterschoolinglist.specializationcode': { $in: listparams.afterschoolspeccode } }))
            // console.log("educationcode",JSON.stringify({ 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } }))
            // console.log("educationcode",JSON.stringify({ 'afterschooling.categorylist.qualificationcode': { $in: listparams.afterschoolcatecode } }))
            var qual_eligible_count = listparams.schoolqualcode.length + listparams.afterschoolcatecode.length;
            var qual_eligible_con = {};
            qual_eligible_con = { $expr: { $gt: [qual_eligible_count, 0] } };
            //educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{0: {$ne: Number(listparams.afterschool) }}]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            // educationcode = {$or:[{'afterschooling.isany':'true'}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};         
            ////console.log("educ", educationcode);
            /* dbo.collection(MongoDB.EmployeeWishListCollectionName).aggregate([
                {$match:{ "employeecode": Number(params.employeecode), "statuscode": objConstants.wishlistedstatus, "jobcode": Number(params.jobcode) }}, 
                {$group: {"_id": {"employeecode": '$employeecode'},  "jobcodelist": {"$push": {"jobcode": '$jobcode'}}}},
                        { "$project": {
                           _id: 0,
                             jobcode: '$jobcodelist.jobcode'}}
                ]).toArray(function (err, wishlistresult) { */
            ////console.log("ji");
            //if (wishlistresult[0] != null && wishlistresult[0].jobcode.length > 0)
            // wishlistjobcode = wishlistresult[0].jobcode;
            ////console.log(wishlistjobcode);
            ////console.log(wishlistresult[0].jobcode);
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus, "jobcode": Number(params.jobcode) } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0)
                    appliedjobcode = appliedresult[0].jobcode;
                ////console.log("appliedjobcode",appliedjobcode);
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.invitedstatus, "jobcode": Number(params.jobcode) } },
                    { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                    {
                        "$project": {
                            _id: 0,
                            jobcode: '$jobcodelist.jobcode'
                        }
                    }
                ]).toArray(function (err, invitedresult) {
                    if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0)
                        invitedjobcode = invitedresult[0].jobcode;
                    ////console.log("invitedjobcode",invitedjobcode);
                    //{'subscriptiondetails.expirydate': {$gte: milliseconds }},
                    matchparams = {
                        $and: [{ 'validitydate': { $gte: milliseconds } }, { 'jobcode': Number(params.jobcode) },
                        { 'jobcode': { $nin: appliedjobcode } },
                        { 'jobcode': { $nin: invitedjobcode } }, { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [jobfunctioncode, jobrolecode, industrycode, skillcode,
                                locationcode, jobtypecode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, educationcode, qual_eligible_con,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };

                    // console.log(jobfunctioncode);
                    // console.log(jobrolecode);
                    // console.log(industrycode);
                    // console.log(skillcode);
                    // console.log(locationcode);
                    // console.log(jobtypecode);
                    // console.log(schoolqualcode);
                    ////console.log("Match");
                    if (matchparams != "") {
                        GetAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            // console.log(jobresult);
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                });
            });
            //});
        }
        else if (listcode == 7) // eligible Job
        {
            // Job function
            ////console.log("Entry");
            ////console.log(listparams);
            var joblocationcode = {};
            if (listparams.jobfunctioncode.length > 0)
                jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
            // if (listparams.jobrolecode.length > 0)
            //     jobrolecode = {'jobrolecode': {$in: listparams.jobrolecode}};
            industrycode = {};
            if (listparams.skillcode.length > 0)
                skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
            //locationcode = {'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}};
            locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };
            if (params.type && params.type == 3) {
                if (listparams.locationcode.length > 0)// Job Location--
                    joblocationcode = { 'preferredjoblocation.locationlist.locationcode': { $in: listparams.locationcode } };
            }
            //jobtypecode = {'jobtypes.jobtypecode': {$in: listparams.jobtypecode}};
            if (listparams.jobtypecode.length > 0)// JobType==
                // jobtypecode = {$or:[{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } },{ 'preferences.employementtype.employementtypecode': 9}]};
                jobtypecode = { 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } };
            // jobtypecode = { $or: [{ 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } }, { 'jobtypes.jobtypecode': 9 }] };
            if (listparams.schoolqualcode.length > 0)
                schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
            if (listparams.afterschoolqualcode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.anydegree == "true")
                schoolqualcode = {};
            //afterschoolqualcode = {'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }};
            //afterschoolspeccode = {'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }};
            //maritalcode = {'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}};
            maritalcode = { $or: [{ 'maritalstatus.isany': 'true' }, { $and: [{ 'maritalstatus.isany': 'false' }, { 'maritalstatus.maritallist.maritalcode': { $in: listparams.maritalcode } }] }] };
            gendercode = { $or: [{ 'gender.isany': 'true' }, { $and: [{ 'gender.isany': 'false' }, { 'gender.genderlist.gendercode': { $in: listparams.gendercode } }] }] };
            //gendercode = {'gender.genderlist.gendercode': {$in: listparams.gendercode}};
            agefrom = { $or: [{ 'agecriteria.isany': 'true' }, { $and: [{ 'agecriteria.isany': 'false' }, { 'agecriteria.from': { $lte: Number(listparams.ageto) } }, { 'agecriteria.to': { $gte: Number(listparams.agefrom) } }] }] };
            // educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{ "afterschooling.afterschoolinglist.qualificationcode": { $exists: true } }]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            //OLD --------------educationcode = {$or:[{'afterschooling.isany':'true'}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        

            educationcode = {
                $or: [schoolqualcode, { 'afterschooling.isanydegree': 'true' }, {
                    $or: [{ 'afterschooling.isanyspec': 'true' },
                    {
                        $and: [{ 'afterschooling.isanyspec': 'false' },
                        { 'afterschooling.afterschoolinglist.qualificationcode': { $in: listparams.afterschoolqualcode } },
                        { 'afterschooling.afterschoolinglist.specializationcode': { $in: listparams.afterschoolspeccode } }]
                    }]
                },
                    {
                        $or: [{ 'afterschooling.isany': 'true' },
                        {
                            $and: [{ 'afterschooling.isany': 'false' },
                            { 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } }]
                        }]
                    },
                    {
                        $and: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                        { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                    }]
            };

            //console.log("educationcode",JSON.stringify(educationcode))

            var qual_eligible_count = listparams.schoolqualcode.length + listparams.afterschoolcatecode.length;
            var qual_eligible_con = {};
            qual_eligible_con = { $expr: { $gt: [qual_eligible_count, 0] } };


            //educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{0: {$ne: Number(listparams.afterschool) }}]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            // educationcode = {$or:[{'afterschooling.isany':'true'}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};         
            ////console.log("educ", educationcode);
            /* dbo.collection(MongoDB.EmployeeWishListCollectionName).aggregate([
                {$match:{ "employeecode": Number(params.employeecode), "statuscode": objConstants.wishlistedstatus, "jobcode": Number(params.jobcode) }}, 
                {$group: {"_id": {"employeecode": '$employeecode'},  "jobcodelist": {"$push": {"jobcode": '$jobcode'}}}},
                        { "$project": {
                           _id: 0,
                             jobcode: '$jobcodelist.jobcode'}}
                ]).toArray(function (err, wishlistresult) { */
            ////console.log("ji");
            //if (wishlistresult[0] != null && wishlistresult[0].jobcode.length > 0)
            // wishlistjobcode = wishlistresult[0].jobcode;
            ////console.log(wishlistjobcode);
            ////console.log(wishlistresult[0].jobcode);
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0)
                    appliedjobcode = appliedresult[0].jobcode;
                ////console.log("appliedjobcode",appliedjobcode);
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.invitedstatus } },
                    { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                    {
                        "$project": {
                            _id: 0,
                            jobcode: '$jobcodelist.jobcode'
                        }
                    }
                ]).toArray(function (err, invitedresult) {
                    if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0)
                        invitedjobcode = invitedresult[0].jobcode;
                    ////console.log("invitedjobcode",invitedjobcode);
                    //{'subscriptiondetails.expirydate': {$gte: milliseconds }},
                    matchparams = {
                        $and: [{ 'validitydate': { $gte: milliseconds } },
                        // { 'jobcode': { $nin: appliedjobcode } },
                        // { 'jobcode': { $nin: invitedjobcode } },
                        { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [qual_eligible_con, jobfunctioncode, jobrolecode, industrycode, skillcode,
                                locationcode, joblocationcode, jobtypecode, maritalcode, gendercode,
                                differentlyabledcode,
                                { $or: exp }, educationcode,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };
                    //     $and: [jobfunctioncode, jobrolecode, industrycode, skillcode,
                    //         locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, 
                    //         differentlyabledcode,
                    //         { $or: exp }, educationcode,
                    //         { $and: [salaryfrom, salaryto] }, agefrom]
                    // }]
                    // console.log("jobfunctioncode",JSON.stringify(jobfunctioncode));
                    // console.log("jobrolecode",JSON.stringify(jobrolecode));
                    // console.log("industrycode",JSON.stringify(industrycode));
                    // console.log("skillcode",JSON.stringify(skillcode));
                    // console.log("locationcode",JSON.stringify(locationcode));
                    // console.log("jobtypecode",JSON.stringify(jobtypecode));
                    // console.log("schoolqualcode",JSON.stringify(schoolqualcode));
                    //   console.log("educationcode",JSON.stringify(educationcode));
                    //  console.log("agefrom",JSON.stringify(agefrom));
                    //  console.log("maritalcode",JSON.stringify(maritalcode));
                    // console.log("gendercode",JSON.stringify(gendercode));
                    //  console.log("differentlyabledcode",JSON.stringify(differentlyabledcode));
                    // console.log("salaryfrom",JSON.stringify(salaryfrom));
                    // console.log("salaryto",JSON.stringify(salaryto)); 
                    //console.log(jobtypecode);
                    //console.log("Match");
                    //console.log("matchparams",JSON.stringify(matchparams))
                    if (matchparams != "") {
                        GetAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            // console.log(jobresult);
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                });
            });
            //});
        }
        else if (listcode == 8) // Flash Job
        {
            var joblocationcode = {};
            if (listparams.jobfunctioncode.length > 0)
                jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
            locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };
            if ((params.type && params.type == 3) || (params.type && params.type == 6)) {
                if (listparams.locationcode.length > 0)// Job Location--
                    joblocationcode = { 'preferredjoblocation.locationlist.locationcode': { $in: listparams.locationcode } };
            }

            if (Number(params.employeecode) == -1) {
                // if (searchtypecode == 1) {
                //     //Location
                //     locationcode = {};
                //     isshowwebsitecondition = { 'joblocationinfo.isshowwebsite': 1 };
                // }
                // else if (searchtypecode == 3) {
                //     //Job Function
                //     jobfunctioncode = {};
                //     isshowwebsitecondition = { 'jobfunctioninfo.isshowwebsite': 1 };
                // }
                // else {
                //     isshowwebsitecondition = { $or: [{ 'joblocationinfo.isshowwebsite': 1 }, { 'jobfunctioninfo.isshowwebsite': 1 }] }
                // }
            }

            matchparams = {
                $and: [
                    { 'validitydate': { $gte: milliseconds } },
                    { 'statuscode': { $eq: objConstants.approvedstatus } },
                    // {
                    //     $and: [jobfunctioncode,jobrolecode,
                    //         joblocationcode]
                    // }
                    {
                        // $and: [jobfunctioncode, joblocationcode]
                        $and: [
                            jobfunctioncode,
                            jobrolecode,
                            joblocationcode,
                            // industrycode,
                            // skillcode,
                            // locationcode,
                            // jobtypecode,
                            // schoolqualcode,
                            // maritalcode,
                            // gendercode,
                            // differentlyabledcode,
                            { $or: exp },
                            // educationcode,
                            // { $and: [salaryfrom, salaryto] },
                            // agefrom
                        ]
                    }
                ]
            };
            if (matchparams != "") {
                GetAllFlashJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 9) // Overall Flash Jobs
        {
            var joblocationcode = {};
            if (listparams.jobfunctioncode.length > 0)
                jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
            locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };
            if ((params.type && params.type == 3) || (params.type && params.type == 6)) {
                if (listparams.locationcode.length > 0)// Job Location--
                    joblocationcode = { 'preferredjoblocation.locationlist.locationcode': { $in: listparams.locationcode } };
            }

            if (Number(params.employeecode) == -1) {
            }

            matchparams = {
                $and: [
                    { 'validitydate': { $gte: milliseconds } },
                    { 'statuscode': { $eq: objConstants.approvedstatus } },
                    {
                        // $and: [
                        //     jobfunctioncode,
                        //     jobrolecode,
                        //     joblocationcode,
                        //     { $or: exp },
                        // ]
                    }
                ]
            };
            if (matchparams != "") {
                GetOverAllFlashJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 10)// Overall Private Jobs
        {
            matchparams = {
                $and: [{ 'validitydate': { $gte: milliseconds } }, { 'statuscode': { $eq: objConstants.approvedstatus } },
                    // {
                    //     $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                    //         { $or: exp }, educationcode,
                    //         { $and: [salaryfrom, salaryto] }, agefrom]
                    // }
                ]
            };
            if (matchparams != "") {
                GetOverAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 11) // Applied Overall
        {
            var jobcode = {};
            if (listparams.jobids && listparams.jobids.length > 0)
                jobcode = { 'jobcode': { $in: listparams.jobids } };
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                // { $match: { jobcode,"employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus } },
                { $match: { $and: [{ jobcode: { $in: listparams.jobids } }, { employeecode: Number(params.employeecode) }] } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                },
            ]).toArray(function (err, appliedresult) {
                if (appliedresult && appliedresult.length > 0) {
                    return callback(appliedresult[0].jobcode);
                } else {
                    let arr = [];
                    return callback(arr);
                }
            });
        }
        else if (listcode == 12)// Shortlist
        {
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "shortliststatus": objConstants.shortlistedstatus } },

                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode), "shortliststatus": objConstants.shortlistedstatus } },
                    { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                    {
                        "$project": {
                            _id: 0,
                            jobcode: '$jobcodelist.jobcode'
                        }
                    }
                ]).toArray(function (err, invitedresult) {
                    var tempjobcode = [];
                    if (appliedresult == null && invitedresult == null && appliedresult.length == 0 && invitedresult.length == 0) {

                    }
                    else {

                        if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0) {
                            for (var i = 0; i <= invitedresult[0].jobcode.length - 1; i++) {
                                tempjobcode.push(invitedresult[0].jobcode[i]);
                            }

                        }
                        if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0) {
                            for (var i = 0; i <= appliedresult[0].jobcode.length - 1; i++) {
                                tempjobcode.push(appliedresult[0].jobcode[i]);
                            }
                            //tempempcode = appliedresult[0].employeecode;
                        }
                        if (tempjobcode != null && tempjobcode.length > 0) {
                            matchparams = {
                                $and: [{ 'jobcode': { $in: tempjobcode } },
                                { 'statuscode': { $eq: objConstants.approvedstatus } },
                                {
                                    $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                        { $or: exp }, educationcode,
                                        { $and: [salaryfrom, salaryto] }, agefrom]
                                }]
                            };
                            if (matchparams != "") {
                                GetAllJobs(matchparams, params, {}, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                                    return callback(jobresult);
                                });
                            }
                            else {
                                var result = [];
                                return callback(result);
                            }
                        }
                        else {
                            var result = [];
                            return callback(result);
                        }
                    }


                });
            });


        }
        else if (listcode == 13) {
            dbo.collection(MongoDB.JobTypeCollectionName).aggregate([
                { $match: { summarystatuscode: objConstants.summarystatuscode } },
                {
                    $lookup:
                    {
                        from: String(MongoDB.JobPostsCollectionName),
                        localField: "jobtypecode",
                        foreignField: "jobtypes.jobtypecode",
                        as: "jobinfo",
                    }
                },
                { $unwind: "$jobtype" },
                { $match: { "jobtype.languagecode": objConstants.defaultlanguagecode } },
                { $unwind: "$jobinfo" },
                { $match: { $and: [{ 'jobinfo.validitydate': { $gte: milliseconds } }, { 'jobinfo.statuscode': { $eq: objConstants.approvedstatus } }] } },
                { $group: { "_id": { "jobtypecode": '$jobtypecode', "jobtypename": '$jobtype.jobtypename' }, count: { $sum: 1 } } },
                { "$project": { _id: 0, jobtypecode: '$_id.jobtypecode', jobtypename: "$_id.jobtypename", count: '$count' } }
            ]).toArray(function (err, parttimeResult) {
                if (parttimeResult && parttimeResult.length > 0) {
                    return callback(parttimeResult)
                } else {
                    var arr = []
                    return callback(arr);
                }
            })
        }
    }
    catch (e) { logger.error("Error in Getting Job List: " + e); }
}



exports.getAllJobListTotal = function (logparams, params, listparams, listcode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var exp = [];
        var explist = [];
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Job List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        explist = listparams.experiencecode;

        if (explist.length == 1) {
            exp = [{ 'experience.isfresher': "true" }];
        }
        else if (explist.length == 2) {
            if (explist[0] == 0) {
                exp = [{
                    "$or": [{ 'experience.isfresher': "true" }, {
                        $or: [
                            { "$and": [{ 'experience.from': { '$gte': explist[0] } }, { 'experience.from': { '$lte': explist[1] } }] },
                            { "$and": [{ 'experience.to': { '$gte': explist[0] } }, { 'experience.to': { '$lte': explist[1] } }] }]
                    }]
                }];
            }
            else {
                exp = [{
                    $or: [
                        { "$and": [{ 'experience.from': { '$gte': explist[0] } }, { 'experience.from': { '$lte': explist[1] } }] },
                        { "$and": [{ 'experience.to': { '$gte': explist[0] } }, { 'experience.to': { '$lte': explist[1] } }] }]
                }];
            }
        }
        else if (explist.length == 3) {
            if (explist[0] == 0) {
                exp = [{
                    "$or": [{ 'experience.isfresher': "true" },
                    {
                        $or: [
                            { "$and": [{ 'experience.from': { '$gte': explist[1] } }, { 'experience.from': { '$lte': explist[2] } }] },
                            { "$and": [{ 'experience.to': { '$gte': explist[1] } }, { 'experience.to': { '$lte': explist[2] } }] }]
                    }]
                }];
            }
            else {
                exp = [
                    {
                        $or: [
                            { "$and": [{ 'experience.from': { '$gte': explist[1] } }, { 'experience.from': { '$lte': explist[2] } }] },
                            { "$and": [{ 'experience.to': { '$gte': explist[1] } }, { 'experience.to': { '$lte': explist[2] } }] }]
                    }];
            }
        }
        else {
            exp = [{}];
        }

        var skipvalue = params.skip;
        var limitvalue = params.limit;
        var searchtypecode = parseInt(params.searchtypecode);
        var skipCondition = { $skip: objConstants.skipvalue };
        var limitCondition = { $limit: objConstants.limitvalue };

        if ((skipvalue != null) && (limitvalue != null && limitvalue != 0)) {
            skipCondition = { $skip: parseInt(skipvalue) };
            limitCondition = { $limit: parseInt(limitvalue) };
        }
        var matchparams = "";
        var employerparams;
        var wishlistjobcode = [];
        var appliedjobcode = [];
        var invitedjobcode = [];
        var isshowwebsitecondition = {};
        var jobfunctioncode = {}, industrycode = {}, skillcode = {}, locationcode = {}, jobtypecode = {}, schoolqualcode = {}, maritalcode = {}, gendercode = {}, educationcode = {};
        var afterschoolqualcode = {}, afterschoolspeccode = {}, differentlyabledcode = {}, salaryfrom = {}, salaryto = {}, agefrom = {}, ageto = {}, jobrolecode = {};
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.jobrolecode.length > 0)// job function==
            jobrolecode = { 'jobrolecode': { $in: listparams.jobrolecode } };
        if (listparams.industrycode.length > 0)// Industry==
            industrycode = { 'industrycode': { $in: listparams.industrycode } };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
        if ((params.type && params.type == 2) || (params.type && params.type == 6)) {
            if (listparams.locationcode.length > 0)// Location--
                locationcode = { 'preferredjoblocation.locationlist.locationcode': { $in: listparams.locationcode } };
        }
        else {
            if (listparams.locationcode.length > 0)// Location--
                locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };

        }
        if (listparams.jobtypecode.length > 0)// JobType==
            jobtypecode = { 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } };
        //jobtypecode = { $or: [{ 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } }, { 'jobtypes.jobtypecode': 9 }] };
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.anydegree == "true") {
            educationcode = {};
            schoolqualcode = {};
        }
        else if (listparams.anyqualification == "true" && listparams.anyspec == "true") {
            educationcode = {
                $or: [
                    {
                        $and: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                        { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                    }]
            };
            if (listparams.afterschoolcatecode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.afterschoolqualcode.length > 0)
                schoolqualcode = {};
        }
        else if (listparams.anyqualification == "false" && listparams.anyspec == "true") {
            educationcode = {
                $or: [{
                    $or: [{ 'afterschooling.isany': 'true' },
                    {
                        $and: [{ 'afterschooling.isany': 'false' },
                        { 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } }]
                    }]
                },
                {
                    $and: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                    { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                }]
            };
            if (listparams.afterschoolcatecode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.afterschoolqualcode.length > 0)
                schoolqualcode = {};
        }
        else if (listparams.afterschoolcatecode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.afterschoolqualcode.length > 0) {

            educationcode = {
                $and: [{
                    $or: [{ 'afterschooling.isanyspec': 'true' },
                    {
                        $and: [{ 'afterschooling.isanyspec': 'false' },
                        { 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } },
                        {
                            'afterschooling.afterschoolinglist.specializationcode':
                                { $in: listparams.afterschoolspeccode }
                        }]
                    }]
                },
                {
                    $or: [{ 'afterschooling.isany': 'true' },
                    {
                        $and: [{ 'afterschooling.isany': 'false' },
                        {
                            'afterschooling.qualificationlist.qualificationcode':
                                { $in: listparams.afterschoolqualcode }
                        }]
                    }]
                },
                {
                    $or: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                    {
                        $and: [{ 'afterschooling.isany': 'false' }, { 'afterschooling.isanyspec': 'false' },
                        { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                    }]
                }]
            };


            schoolqualcode = {};
        }
        if (listparams.maritalcode.length > 0)// marital code
            maritalcode = { $or: [{ 'maritalstatus.isany': 'true' }, { $and: [{ 'maritalstatus.isany': 'false' }, { 'maritalstatus.maritallist.maritalcode': { $in: listparams.maritalcode } }] }] };
        if (listparams.gendercode.length > 0)// gender code
            gendercode = { $or: [{ 'gender.isany': 'true' }, { $and: [{ 'gender.isany': 'false' }, { 'gender.genderlist.gendercode': { $in: listparams.gendercode } }] }] };
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { $or: [{ 'differentlyabled': Number(listparams.differentlyabled) }, { 'differentlyabled': -1 }] };
        if (Number(listparams.salaryto) != null && Number(listparams.salaryto) != 0)
            salaryfrom = { 'salaryrange.min': { $lte: Number(listparams.salaryto) } };
        if (Number(listparams.salaryfrom) != null && Number(listparams.salaryfrom) != 0)
            salaryto = { 'salaryrange.max': { $gte: Number(listparams.salaryfrom) } };
        if (listparams.anyage == "true") {
            agefrom = {};
        }
        else {
            agefrom = { $or: [{ 'agecriteria.isany': 'true' }, { $and: [{ 'agecriteria.isany': 'false' }, { 'agecriteria.from': { $lte: Number(listparams.ageto) } }, { 'agecriteria.to': { $gte: Number(listparams.agefrom) } }] }] };
        }
        if (listparams.companytypecode.length > 0 && listparams.employertypecode.length > 0) {
            employerparams = { "employerinfo.statuscode": objConstants.activestatus, 'employerinfo.companytypecode': { $in: listparams.companytypecode }, 'employerinfo.employertypecode': { $in: listparams.employertypecode } };
        }
        else if (listparams.companytypecode.length > 0 && listparams.employertypecode.length == 0) {
            employerparams = { "employerinfo.statuscode": objConstants.activestatus, 'employerinfo.companytypecode': { $in: listparams.companytypecode } };
        }
        else if (listparams.companytypecode.length == 0 && listparams.employertypecode.length > 0) {
            employerparams = { "employerinfo.statuscode": objConstants.activestatus, 'employerinfo.employertypecode': { $in: listparams.employertypecode } };
        }
        else {
            employerparams = { "employerinfo.statuscode": objConstants.activestatus };
        }
        if (listcode == 1)// Common List
        {
            if (Number(params.employeecode) == -1) {
            }
            matchparams = {
                $and: [{ 'validitydate': { $gte: milliseconds } }, { 'statuscode': { $eq: objConstants.approvedstatus } },
                {
                    $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                        { $or: exp }, educationcode,
                        { $and: [salaryfrom, salaryto] }, agefrom]
                }]
            };
            if (matchparams != "") {
                GetAllJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 2) // Recommended
        {
            /*  dbo.collection(MongoDB.EmployeeWishListCollectionName).aggregate([
                 {$match:{ "employeecode": Number(params.employeecode), "statuscode": objConstants.wishlistedstatus }}, 
                 {$group: {"_id": {"employeecode": '$employeecode'},  "jobcodelist": {"$push": {"jobcode": '$jobcode'}}}},
                         { "$project": {
                            _id: 0,
                              jobcode: '$jobcodelist.jobcode'}}
                 ]).toArray(function (err, wishlistresult) { */
            ////console.log("ji");
            /*  if (wishlistresult[0] != null && wishlistresult[0].jobcode.length > 0)
                 wishlistjobcode = wishlistresult[0].jobcode; */
            ////console.log(milliseconds);
            ////console.log(wishlistresult[0].jobcode);
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0)
                    appliedjobcode = appliedresult[0].jobcode;
                ////console.log(appliedjobcode);
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.invitedstatus } },
                    { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                    {
                        "$project": {
                            _id: 0,
                            jobcode: '$jobcodelist.jobcode'
                        }
                    }
                ]).toArray(function (err, invitedresult) {
                    if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0)
                        invitedjobcode = invitedresult[0].jobcode;
                    // console.log(invitedjobcode);
                    //console.log(milliseconds);
                    //{'subscriptiondetails.expirydate': {$gte: milliseconds }},
                    matchparams = {
                        $and: [{ 'validitydate': { $gte: milliseconds } },
                        { 'jobcode': { $nin: appliedjobcode } },
                        { 'jobcode': { $nin: invitedjobcode } }, { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [
                                jobfunctioncode, jobrolecode, industrycode, skillcode,
                                locationcode, jobtypecode, schoolqualcode, maritalcode,
                                gendercode, differentlyabledcode, agefrom, educationcode,
                                { $or: exp },
                                { $and: [salaryfrom, salaryto] }]
                        }]
                    };
                    // console.log(differentlyabledcode);
                    ////console.log("Match");
                    if (matchparams != "") {
                        GetAllJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                });
            });
            //});
        }
        else if (listcode == 3) // Wish List
        {
            dbo.collection(MongoDB.EmployeeWishListCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.wishlistedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, wishlistresult) {
                if (wishlistresult[0] != null && wishlistresult[0].jobcode.length > 0) {
                    matchparams = {
                        $and: [{ 'jobcode': { $in: wishlistresult[0].jobcode } },
                        { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, educationcode,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };
                    if (matchparams != "") {
                        GetAllJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }
                else {
                    var result = [];
                    return callback(result);
                }

            });

        }
        else if (listcode == 4) // Applied
        {
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0) {
                    matchparams = {
                        $and: [{ 'jobcode': { $in: appliedresult[0].jobcode } },
                        { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, educationcode,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };
                    if (matchparams != "") {
                        GetAllJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }
                else {
                    var result = [];
                    return callback(result);
                }

            });

        }
        else if (listcode == 5) // Invited
        {
            dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.invitedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, invitedresult) {
                if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0) {
                    matchparams = {
                        $and: [{ 'jobcode': { $in: invitedresult[0].jobcode } },
                        { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, educationcode,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };
                    if (matchparams != "") {
                        GetAllJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }
                else {
                    var result = [];
                    return callback(result);
                }
            });
        }
        else if (listcode == 6) // Apply Job
        {
            // Job function
            ////console.log("Entry");
            ////console.log(listparams);
            if (listparams.jobfunctioncode.length > 0)
                jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
            // if (listparams.jobrolecode.length > 0)
            //     jobrolecode = {'jobrolecode': {$in: listparams.jobrolecode}};
            industrycode = {};
            if (listparams.skillcode.length > 0)
                skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
            //locationcode = {'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}};
            locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };
            //jobtypecode = {'jobtypes.jobtypecode': {$in: listparams.jobtypecode}};
            if (listparams.jobtypecode.length > 0)// JobType==
                // jobtypecode = {$or:[{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } },{ 'preferences.employementtype.employementtypecode': 9}]};
                jobtypecode = { 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } };
            // jobtypecode = { $or: [{ 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } }, { 'jobtypes.jobtypecode': 9 }] };
            if (listparams.schoolqualcode.length > 0)
                schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
            if (listparams.afterschoolqualcode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.anydegree == "true")
                schoolqualcode = {};
            //afterschoolqualcode = {'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }};
            //afterschoolspeccode = {'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }};
            //maritalcode = {'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}};
            maritalcode = { $or: [{ 'maritalstatus.isany': 'true' }, { $and: [{ 'maritalstatus.isany': 'false' }, { 'maritalstatus.maritallist.maritalcode': { $in: listparams.maritalcode } }] }] };
            gendercode = { $or: [{ 'gender.isany': 'true' }, { $and: [{ 'gender.isany': 'false' }, { 'gender.genderlist.gendercode': { $in: listparams.gendercode } }] }] };
            //gendercode = {'gender.genderlist.gendercode': {$in: listparams.gendercode}};
            agefrom = { $or: [{ 'agecriteria.isany': 'true' }, { $and: [{ 'agecriteria.isany': 'false' }, { 'agecriteria.from': { $lte: Number(listparams.ageto) } }, { 'agecriteria.to': { $gte: Number(listparams.agefrom) } }] }] };
            // educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{ "afterschooling.afterschoolinglist.qualificationcode": { $exists: true } }]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            //OLD --------------educationcode = {$or:[{'afterschooling.isany':'true'}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        

            educationcode = {
                $or: [schoolqualcode, { 'afterschooling.isanydegree': 'true' }, {
                    $or: [{ 'afterschooling.isanyspec': 'true' },
                    {
                        $and: [{ 'afterschooling.isanyspec': 'false' },
                        { 'afterschooling.afterschoolinglist.qualificationcode': { $in: listparams.afterschoolqualcode } },
                        { 'afterschooling.afterschoolinglist.specializationcode': { $in: listparams.afterschoolspeccode } }]
                    }]
                },
                    {
                        $or: [{ 'afterschooling.isany': 'true' },
                        {
                            $and: [{ 'afterschooling.isany': 'false' },
                            { 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } }]
                        }]
                    },
                    {
                        $and: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                        { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                    }]
            };

            // console.log("educationcode",JSON.stringify(schoolqualcode))
            // console.log("educationcode",JSON.stringify({ 'afterschooling.afterschoolinglist.specializationcode': { $in: listparams.afterschoolspeccode } }))
            // console.log("educationcode",JSON.stringify({ 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } }))
            // console.log("educationcode",JSON.stringify({ 'afterschooling.categorylist.qualificationcode': { $in: listparams.afterschoolcatecode } }))
            var qual_eligible_count = listparams.schoolqualcode.length + listparams.afterschoolcatecode.length;
            var qual_eligible_con = {};
            qual_eligible_con = { $expr: { $gt: [qual_eligible_count, 0] } };
            //educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{0: {$ne: Number(listparams.afterschool) }}]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            // educationcode = {$or:[{'afterschooling.isany':'true'}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};         
            ////console.log("educ", educationcode);
            /* dbo.collection(MongoDB.EmployeeWishListCollectionName).aggregate([
                {$match:{ "employeecode": Number(params.employeecode), "statuscode": objConstants.wishlistedstatus, "jobcode": Number(params.jobcode) }}, 
                {$group: {"_id": {"employeecode": '$employeecode'},  "jobcodelist": {"$push": {"jobcode": '$jobcode'}}}},
                        { "$project": {
                           _id: 0,
                             jobcode: '$jobcodelist.jobcode'}}
                ]).toArray(function (err, wishlistresult) { */
            ////console.log("ji");
            //if (wishlistresult[0] != null && wishlistresult[0].jobcode.length > 0)
            // wishlistjobcode = wishlistresult[0].jobcode;
            ////console.log(wishlistjobcode);
            ////console.log(wishlistresult[0].jobcode);
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus, "jobcode": Number(params.jobcode) } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0)
                    appliedjobcode = appliedresult[0].jobcode;
                ////console.log("appliedjobcode",appliedjobcode);
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.invitedstatus, "jobcode": Number(params.jobcode) } },
                    { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                    {
                        "$project": {
                            _id: 0,
                            jobcode: '$jobcodelist.jobcode'
                        }
                    }
                ]).toArray(function (err, invitedresult) {
                    if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0)
                        invitedjobcode = invitedresult[0].jobcode;
                    ////console.log("invitedjobcode",invitedjobcode);
                    //{'subscriptiondetails.expirydate': {$gte: milliseconds }},
                    matchparams = {
                        $and: [{ 'validitydate': { $gte: milliseconds } }, { 'jobcode': Number(params.jobcode) },
                        { 'jobcode': { $nin: appliedjobcode } },
                        { 'jobcode': { $nin: invitedjobcode } }, { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [jobfunctioncode, jobrolecode, industrycode, skillcode,
                                locationcode, jobtypecode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, educationcode, qual_eligible_con,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };

                    // console.log(jobfunctioncode);
                    // console.log(jobrolecode);
                    // console.log(industrycode);
                    // console.log(skillcode);
                    // console.log(locationcode);
                    // console.log(jobtypecode);
                    // console.log(schoolqualcode);
                    ////console.log("Match");
                    if (matchparams != "") {
                        GetAllJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            // console.log(jobresult);
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                });
            });
            //});
        }
        else if (listcode == 7) // eligible Job
        {
            // Job function
            ////console.log("Entry");
            ////console.log(listparams);
            var joblocationcode = {};
            if (listparams.jobfunctioncode.length > 0)
                jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
            // if (listparams.jobrolecode.length > 0)
            //     jobrolecode = {'jobrolecode': {$in: listparams.jobrolecode}};
            industrycode = {};
            if (listparams.skillcode.length > 0)
                skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
            //locationcode = {'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}};
            locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };
            if (params.type && params.type == 3) {
                if (listparams.locationcode.length > 0)// Job Location--
                    joblocationcode = { 'preferredjoblocation.locationlist.locationcode': { $in: listparams.locationcode } };
            }
            //jobtypecode = {'jobtypes.jobtypecode': {$in: listparams.jobtypecode}};
            if (listparams.jobtypecode.length > 0)// JobType==
                // jobtypecode = {$or:[{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } },{ 'preferences.employementtype.employementtypecode': 9}]};
                jobtypecode = { 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } };
            // jobtypecode = { $or: [{ 'jobtypes.jobtypecode': { $in: listparams.jobtypecode } }, { 'jobtypes.jobtypecode': 9 }] };
            if (listparams.schoolqualcode.length > 0)
                schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
            if (listparams.afterschoolqualcode.length > 0 || listparams.afterschoolspeccode.length > 0 || listparams.anydegree == "true")
                schoolqualcode = {};
            //afterschoolqualcode = {'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }};
            //afterschoolspeccode = {'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }};
            //maritalcode = {'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}};
            maritalcode = { $or: [{ 'maritalstatus.isany': 'true' }, { $and: [{ 'maritalstatus.isany': 'false' }, { 'maritalstatus.maritallist.maritalcode': { $in: listparams.maritalcode } }] }] };
            gendercode = { $or: [{ 'gender.isany': 'true' }, { $and: [{ 'gender.isany': 'false' }, { 'gender.genderlist.gendercode': { $in: listparams.gendercode } }] }] };
            //gendercode = {'gender.genderlist.gendercode': {$in: listparams.gendercode}};
            agefrom = { $or: [{ 'agecriteria.isany': 'true' }, { $and: [{ 'agecriteria.isany': 'false' }, { 'agecriteria.from': { $lte: Number(listparams.ageto) } }, { 'agecriteria.to': { $gte: Number(listparams.agefrom) } }] }] };
            // educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{ "afterschooling.afterschoolinglist.qualificationcode": { $exists: true } }]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            //OLD --------------educationcode = {$or:[{'afterschooling.isany':'true'}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        

            educationcode = {
                $or: [schoolqualcode, { 'afterschooling.isanydegree': 'true' }, {
                    $or: [{ 'afterschooling.isanyspec': 'true' },
                    {
                        $and: [{ 'afterschooling.isanyspec': 'false' },
                        { 'afterschooling.afterschoolinglist.qualificationcode': { $in: listparams.afterschoolqualcode } },
                        { 'afterschooling.afterschoolinglist.specializationcode': { $in: listparams.afterschoolspeccode } }]
                    }]
                },
                    {
                        $or: [{ 'afterschooling.isany': 'true' },
                        {
                            $and: [{ 'afterschooling.isany': 'false' },
                            { 'afterschooling.qualificationlist.qualificationcode': { $in: listparams.afterschoolqualcode } }]
                        }]
                    },
                    {
                        $and: [{ 'afterschooling.isany': 'true' }, { 'afterschooling.isanyspec': 'true' },
                        { 'afterschooling.categorylist.educationcategorycode': { $in: listparams.afterschoolcatecode } }]
                    }]
            };

            //console.log("educationcode",JSON.stringify(educationcode))

            var qual_eligible_count = listparams.schoolqualcode.length + listparams.afterschoolcatecode.length;
            var qual_eligible_con = {};
            qual_eligible_con = { $expr: { $gt: [qual_eligible_count, 0] } };


            //educationcode = {$or:[{$and:[{'afterschooling.isany':'true'},{0: {$ne: Number(listparams.afterschool) }}]}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};        
            // educationcode = {$or:[{'afterschooling.isany':'true'}, {$and:[{'afterschooling.isany':'false'},{'afterschooling.afterschoolinglist.qualificationcode': {$in: listparams.afterschoolqualcode }},{'afterschooling.afterschoolinglist.specializationcode': {$in: listparams.afterschoolspeccode }}]}]};         
            ////console.log("educ", educationcode);
            /* dbo.collection(MongoDB.EmployeeWishListCollectionName).aggregate([
                {$match:{ "employeecode": Number(params.employeecode), "statuscode": objConstants.wishlistedstatus, "jobcode": Number(params.jobcode) }}, 
                {$group: {"_id": {"employeecode": '$employeecode'},  "jobcodelist": {"$push": {"jobcode": '$jobcode'}}}},
                        { "$project": {
                           _id: 0,
                             jobcode: '$jobcodelist.jobcode'}}
                ]).toArray(function (err, wishlistresult) { */
            ////console.log("ji");
            //if (wishlistresult[0] != null && wishlistresult[0].jobcode.length > 0)
            // wishlistjobcode = wishlistresult[0].jobcode;
            ////console.log(wishlistjobcode);
            ////console.log(wishlistresult[0].jobcode);
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0)
                    appliedjobcode = appliedresult[0].jobcode;
                ////console.log("appliedjobcode",appliedjobcode);
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode), "statuscode": objConstants.invitedstatus } },
                    { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                    {
                        "$project": {
                            _id: 0,
                            jobcode: '$jobcodelist.jobcode'
                        }
                    }
                ]).toArray(function (err, invitedresult) {
                    if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0)
                        invitedjobcode = invitedresult[0].jobcode;
                    ////console.log("invitedjobcode",invitedjobcode);
                    //{'subscriptiondetails.expirydate': {$gte: milliseconds }},
                    matchparams = {
                        $and: [{ 'validitydate': { $gte: milliseconds } },
                        // { 'jobcode': { $nin: appliedjobcode } },
                        // { 'jobcode': { $nin: invitedjobcode } },
                        { 'statuscode': { $eq: objConstants.approvedstatus } },
                        {
                            $and: [qual_eligible_con, jobfunctioncode, jobrolecode, industrycode, skillcode,
                                locationcode, joblocationcode, jobtypecode, maritalcode, gendercode,
                                differentlyabledcode,
                                { $or: exp }, educationcode,
                                { $and: [salaryfrom, salaryto] }, agefrom]
                        }]
                    };
                    //     $and: [jobfunctioncode, jobrolecode, industrycode, skillcode,
                    //         locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, 
                    //         differentlyabledcode,
                    //         { $or: exp }, educationcode,
                    //         { $and: [salaryfrom, salaryto] }, agefrom]
                    // }]
                    // console.log("jobfunctioncode",JSON.stringify(jobfunctioncode));
                    // console.log("jobrolecode",JSON.stringify(jobrolecode));
                    // console.log("industrycode",JSON.stringify(industrycode));
                    // console.log("skillcode",JSON.stringify(skillcode));
                    // console.log("locationcode",JSON.stringify(locationcode));
                    // console.log("jobtypecode",JSON.stringify(jobtypecode));
                    // console.log("schoolqualcode",JSON.stringify(schoolqualcode));
                    //   console.log("educationcode",JSON.stringify(educationcode));
                    //  console.log("agefrom",JSON.stringify(agefrom));
                    //  console.log("maritalcode",JSON.stringify(maritalcode));
                    // console.log("gendercode",JSON.stringify(gendercode));
                    //  console.log("differentlyabledcode",JSON.stringify(differentlyabledcode));
                    // console.log("salaryfrom",JSON.stringify(salaryfrom));
                    // console.log("salaryto",JSON.stringify(salaryto)); 
                    //console.log(jobtypecode);
                    //console.log("Match");
                    //console.log("matchparams",JSON.stringify(matchparams))
                    if (matchparams != "") {
                        GetAllJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                            // console.log(jobresult);
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                });
            });
            //});
        }
        else if (listcode == 8) // Flash Job
        {
            var joblocationcode = {};
            if (listparams.jobfunctioncode.length > 0)
                jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
            locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };
            if ((params.type && params.type == 3) || (params.type && params.type == 6)) {
                if (listparams.locationcode.length > 0)// Job Location--
                    joblocationcode = { 'preferredjoblocation.locationlist.locationcode': { $in: listparams.locationcode } };
            }

            if (Number(params.employeecode) == -1) {
                // if (searchtypecode == 1) {
                //     //Location
                //     locationcode = {};
                //     isshowwebsitecondition = { 'joblocationinfo.isshowwebsite': 1 };
                // }
                // else if (searchtypecode == 3) {
                //     //Job Function
                //     jobfunctioncode = {};
                //     isshowwebsitecondition = { 'jobfunctioninfo.isshowwebsite': 1 };
                // }
                // else {
                //     isshowwebsitecondition = { $or: [{ 'joblocationinfo.isshowwebsite': 1 }, { 'jobfunctioninfo.isshowwebsite': 1 }] }
                // }
            }

            matchparams = {
                $and: [
                    { 'validitydate': { $gte: milliseconds } },
                    { 'statuscode': { $eq: objConstants.approvedstatus } },
                    // {
                    //     $and: [jobfunctioncode,jobrolecode,
                    //         joblocationcode]
                    // }
                    {
                        // $and: [jobfunctioncode, joblocationcode]
                        $and: [
                            jobfunctioncode,
                            jobrolecode,
                            joblocationcode,
                            // industrycode,
                            // skillcode,
                            // locationcode,
                            // jobtypecode,
                            // schoolqualcode,
                            // maritalcode,
                            // gendercode,
                            // differentlyabledcode,
                            { $or: exp },
                            // educationcode,
                            // { $and: [salaryfrom, salaryto] },
                            // agefrom
                        ]
                    }
                ]
            };
            if (matchparams != "") {
                GetAllFlashJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 9) // Overall Flash Jobs
        {
            var joblocationcode = {};
            if (listparams.jobfunctioncode.length > 0)
                jobfunctioncode = { 'jobfunctioncode': { $in: listparams.jobfunctioncode } };
            locationcode = { $or: [{ 'preferredlocation.isany': 'true' }, { $and: [{ 'preferredlocation.isany': 'false' }, { 'preferredlocation.locationlist.locationcode': { $in: listparams.locationcode } }] }] };
            if ((params.type && params.type == 3) || (params.type && params.type == 6)) {
                if (listparams.locationcode.length > 0)// Job Location--
                    joblocationcode = { 'preferredjoblocation.locationlist.locationcode': { $in: listparams.locationcode } };
            }

            if (Number(params.employeecode) == -1) {
            }

            matchparams = {
                $and: [
                    { 'validitydate': { $gte: milliseconds } },
                    { 'statuscode': { $eq: objConstants.approvedstatus } },
                    {
                        // $and: [
                        //     jobfunctioncode,
                        //     jobrolecode,
                        //     joblocationcode,
                        //     { $or: exp },
                        // ]
                    }
                ]
            };
            if (matchparams != "") {
                GetOverAllFlashJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 10)// Overall Private Jobs
        {
            matchparams = {
                $and: [{ 'validitydate': { $gte: milliseconds } }, { 'statuscode': { $eq: objConstants.approvedstatus } },
                    // {
                    //     $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                    //         { $or: exp }, educationcode,
                    //         { $and: [salaryfrom, salaryto] }, agefrom]
                    // }
                ]
            };
            if (matchparams != "") {
                GetOverAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 11) // Applied Overall
        {
            var jobcode = {};
            if (listparams.jobids && listparams.jobids.length > 0)
                jobcode = { 'jobcode': { $in: listparams.jobids } };
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                // { $match: { jobcode,"employeecode": Number(params.employeecode), "statuscode": objConstants.appliedstatus } },
                { $match: { $and: [{ jobcode: { $in: listparams.jobids } }, { employeecode: Number(params.employeecode) }] } },
                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                },
            ]).toArray(function (err, appliedresult) {
                if (appliedresult && appliedresult.length > 0) {
                    return callback(appliedresult[0].jobcode);
                } else {
                    let arr = [];
                    return callback(arr);
                }
            });
        }
        else if (listcode == 12)// Shortlist
        {
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employeecode": Number(params.employeecode), "shortliststatus": objConstants.shortlistedstatus } },

                { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                {
                    "$project": {
                        _id: 0,
                        jobcode: '$jobcodelist.jobcode'
                    }
                }
            ]).toArray(function (err, appliedresult) {
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "employeecode": Number(params.employeecode), "shortliststatus": objConstants.shortlistedstatus } },
                    { $group: { "_id": { "employeecode": '$employeecode' }, "jobcodelist": { "$push": { "jobcode": '$jobcode' } } } },
                    {
                        "$project": {
                            _id: 0,
                            jobcode: '$jobcodelist.jobcode'
                        }
                    }
                ]).toArray(function (err, invitedresult) {
                    var tempjobcode = [];
                    if (appliedresult == null && invitedresult == null && appliedresult.length == 0 && invitedresult.length == 0) {

                    }
                    else {

                        if (invitedresult[0] != null && invitedresult[0].jobcode.length > 0) {
                            for (var i = 0; i <= invitedresult[0].jobcode.length - 1; i++) {
                                tempjobcode.push(invitedresult[0].jobcode[i]);
                            }

                        }
                        if (appliedresult[0] != null && appliedresult[0].jobcode.length > 0) {
                            for (var i = 0; i <= appliedresult[0].jobcode.length - 1; i++) {
                                tempjobcode.push(appliedresult[0].jobcode[i]);
                            }
                            //tempempcode = appliedresult[0].employeecode;
                        }
                        if (tempjobcode != null && tempjobcode.length > 0) {
                            matchparams = {
                                $and: [{ 'jobcode': { $in: tempjobcode } },
                                { 'statuscode': { $eq: objConstants.approvedstatus } },
                                {
                                    $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                        { $or: exp }, educationcode,
                                        { $and: [salaryfrom, salaryto] }, agefrom]
                                }]
                            };
                            if (matchparams != "") {
                                GetAllJobsTotal(matchparams, params, {}, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                                    return callback(jobresult);
                                });
                            }
                            else {
                                var result = [];
                                return callback(result);
                            }
                        }
                        else {
                            var result = [];
                            return callback(result);
                        }
                    }


                });
            });


        }
        else if (listcode == 13)// Recommended Exccept Applied
        {
            if (Number(params.employeecode) == -1) {
            }
            matchparams = {
                $and: [{ 'validitydate': { $gte: milliseconds } }, { 'statuscode': { $eq: objConstants.approvedstatus } },
                {
                    $and: [jobfunctioncode, jobrolecode, industrycode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                        { $or: exp }, educationcode,
                        { $and: [salaryfrom, salaryto] }, agefrom]
                }]
            };
            if (matchparams != "") {
                GetAllJobsTotalExceptApplied(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
    }
    catch (e) { logger.error("Error in Getting Job List: " + e); }
}


function GetAllJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        // ////console.log("JoblistEntry");
        // console.log(matchparams);
        // console.log(JSON.stringify(matchparams));
        //console.log("Check by Kavitha ")
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: matchparams },
            {
                "$lookup": {
                    "from": String(MongoDB.EmployerCollectionName),
                    "localField": "employercode",
                    "foreignField": "employercode",
                    "as": "employerinfo"
                }
            },
            { $match: employerparams },

            { $unwind: "$employerinfo" },


            {
                $group: {
                    "_id": {
                        "jobid": "$jobid", "jobcode": '$jobcode'
                    },
                }
            },

            { $sort: params.sortbyparams },
            {
                "$project": {
                    _id: 0, "jobid": '$_id.jobid', "jobcode": '$_id.jobcode'
                    // "jobid": '$_id.jobid', "jobcode": '$_id.jobcode', "jobrolecode": '$_id.jobrolecode', "jobrolename": '$_id.jobrolename', "jobfunctionname": '$_id.jobfunctionname', employercode: '$_id.employercode',
                    // employername: '$_id.employername', profileurl: '$_id.profileurl', wishliststatus: '$_id.wishliststatus', wisheddate: '$_id.wisheddate', invitedstatus: '$_id.invitedstatus', invitedshortliststatus: '$_id.invitedshortliststatus',
                    // appliedstatus: '$_id.appliedstatus', appliedshortliststatus: '$_id.appliedshortliststatus',
                    // inviteddate: '$_id.inviteddate', applieddate: '$_id.applieddate',
                    // invitedshortlistdate: '$_id.invitedshortlistdate', appliedshortlistdate: '$_id.appliedshortlistdate',matchingpercentage:'$_id.matchingpercentage', 
                    // "experience": '$_id.experience', "salaryrange": '$_id.salaryrange', "subscriptiondetails": '$_id.subscriptiondetails', "validitydate": '$_id.validitydate',
                    // "daysleft": '$_id.daysleft', "joblocationcode": '$joblocation.locationcode', "joblocationname": '$joblocation.locationname',
                    // "locationcode": '$location.locationcode', "locationname": '$location.locationname', "noofopenings": '$_id.noofopenings'
                }
            }
        ]).toArray(function (err, result) {
            // console.log(result);
            //  console.log(JSON.stringify(result));
            finalresult = result.length;
            //finalresult.jobalertdays = controlsresult[0].jobexpirydays;
            ////console.log(controlsresult);
            // console.log(result);
            return callback(finalresult);

        });
    }
    catch (e) { logger.error("Error in Getting Job List Function: " + e); }
}


function GetAllJobsTotalExceptApplied(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        // ////console.log("JoblistEntry");
        // console.log(matchparams);
        // console.log(JSON.stringify(matchparams));
        //console.log("Check by Kavitha ")
        var jobcode = [];
        dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
            { $match: { "employeecode": Number(params.employeecode) } },
            { $project: { _id: 0, jobcode: 1 } }
        ]).toArray(function (err, jobresult) {
            if (jobresult != null && jobresult != undefined && jobresult.length > 0) {
                for (var i = 0; i < jobresult.length; i++) {
                    jobcode.push(jobresult[i].jobcode)
                }
            }
            if (Number(params.employeecode) == 29529) {
                console.log("jobcode", jobcode)
                console.log("employeecode", params.employeecode)
            }

            var matchparams1 = { $and: [matchparams, { jobcode: { $nin: jobcode } }] }
            dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
                { $match: matchparams1 },
                {
                    "$lookup": {
                        "from": String(MongoDB.EmployerCollectionName),
                        "localField": "employercode",
                        "foreignField": "employercode",
                        "as": "employerinfo"
                    }
                },
                { $match: employerparams },

                { $unwind: "$employerinfo" },


                {
                    $group: {
                        "_id": {
                            "jobid": "$jobid", "jobcode": '$jobcode'
                        },
                    }
                },

                { $sort: params.sortbyparams },
                {
                    "$project": {
                        _id: 0, "jobid": '$_id.jobid', "jobcode": '$_id.jobcode'
                        // "jobid": '$_id.jobid', "jobcode": '$_id.jobcode', "jobrolecode": '$_id.jobrolecode', "jobrolename": '$_id.jobrolename', "jobfunctionname": '$_id.jobfunctionname', employercode: '$_id.employercode',
                        // employername: '$_id.employername', profileurl: '$_id.profileurl', wishliststatus: '$_id.wishliststatus', wisheddate: '$_id.wisheddate', invitedstatus: '$_id.invitedstatus', invitedshortliststatus: '$_id.invitedshortliststatus',
                        // appliedstatus: '$_id.appliedstatus', appliedshortliststatus: '$_id.appliedshortliststatus',
                        // inviteddate: '$_id.inviteddate', applieddate: '$_id.applieddate',
                        // invitedshortlistdate: '$_id.invitedshortlistdate', appliedshortlistdate: '$_id.appliedshortlistdate',matchingpercentage:'$_id.matchingpercentage', 
                        // "experience": '$_id.experience', "salaryrange": '$_id.salaryrange', "subscriptiondetails": '$_id.subscriptiondetails', "validitydate": '$_id.validitydate',
                        // "daysleft": '$_id.daysleft', "joblocationcode": '$joblocation.locationcode', "joblocationname": '$joblocation.locationname',
                        // "locationcode": '$location.locationcode', "locationname": '$location.locationname', "noofopenings": '$_id.noofopenings'
                    }
                }
            ]).toArray(function (err, result) {
                // console.log(result);
                //  console.log(JSON.stringify(result));
                finalresult = result.length;
                //finalresult.jobalertdays = controlsresult[0].jobexpirydays;
                ////console.log(controlsresult);
                // console.log(result);
                return callback(finalresult);

            });
        });

    }
    catch (e) { logger.error("Error in Getting Job List Function: " + e); }
}

function GetAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        // ////console.log("JoblistEntry");
        // console.log(matchparams);
        // console.log(JSON.stringify(matchparams));
        //console.log("Check by Kavitha ")
        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: matchparams },
            {
                "$lookup": {
                    "from": String(MongoDB.JobRoleCollectionName),
                    "localField": "jobrolecode",
                    "foreignField": "jobrolecode",
                    "as": "jobroleinfo"
                }
            },
            {
                "$lookup": {
                    "from": String(MongoDB.JobFunctionCollectionName),
                    "localField": "jobfunctioncode",
                    "foreignField": "jobfunctioncode",
                    "as": "jobfunctioninfo"
                }
            },
            {
                "$lookup": {
                    "from": String(MongoDB.EmployerCollectionName),
                    "localField": "employercode",
                    "foreignField": "employercode",
                    "as": "employerinfo"
                }
            },
            { $match: employerparams },
            {
                "$lookup": {
                    "from": String(MongoDB.DistrictCollectionName),
                    "localField": "preferredlocation.locationlist.locationcode",
                    "foreignField": "districtcode",
                    "as": "districtinfo"
                }
            },
            {
                "$lookup":
                {
                    "from": String(MongoDB.DistrictCollectionName),
                    "localField": "preferredjoblocation.locationlist.locationcode",
                    "foreignField": "districtcode",
                    "as": "joblocationinfo"
                }
            },
            {
                "$lookup":
                {
                    "from": String(MongoDB.EmployeeWishListCollectionName),
                    "localField": 'jobcode',
                    "foreignField": 'jobcode',
                    "as": 'wishlistinfo'
                }
            },
            {
                "$addFields": {
                    "wishlistinfo": {
                        "$filter": {
                            "input": "$wishlistinfo",
                            "as": "wishinfo",
                            "cond": {
                                "$eq": ["$$wishinfo.employeecode", Number(params.employeecode)]
                            }
                        }
                    }
                }
            },
            {
                $lookup:
                {
                    from: String(MongoDB.EmployeeInvitedCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'invitedinfo'
                }
            },
            {
                "$addFields": {
                    "invitedinfo": {
                        "$filter": {
                            "input": "$invitedinfo",
                            "as": "inviteinfo",
                            "cond": {
                                "$eq": ["$$inviteinfo.employeecode", Number(params.employeecode)]
                            }
                        }
                    }
                }
            },
            {
                $lookup:
                {
                    from: String(MongoDB.EmployeeAppliedCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'appliedinfo'
                }
            },
            {
                "$addFields": {
                    "appliedinfo": {
                        "$filter": {
                            "input": "$appliedinfo",
                            "as": "applyinfo",
                            "cond": {
                                "$eq": ["$$applyinfo.employeecode", Number(params.employeecode)]
                            }
                        }
                    }
                }
            },
            {
                $lookup:
                {
                    from: String(MongoDB.EmployeeAppliedCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'totalappliedinfo'
                }
            },
            // {
            //     "$lookup":
            //     {
            //         "from": String(MongoDB.EmpJobPercentageCollectionName),
            //         "localField": 'jobcode',
            //         "foreignField": 'jobcode',
            //         "as": 'percentagelistinfo'
            //     }
            // },
            // {
            //     "$addFields": {
            //         "percentagelistinfo": {
            //             "$filter": {
            //                 "input": "$percentagelistinfo",
            //                 "as": "percentageinfo",
            //                 "cond": {
            //                     "$eq": ["$$percentageinfo.employeecode", Number(params.employeecode)]
            //                 }
            //             }
            //         }
            //     }
            // },
            {
                "$lookup":
                {
                    "from": String(MongoDB.EmpJobPercentageCollectionName),
                    "let": { "jobcode": "$jobcode", "employeecode": Number(params.employeecode) },
                    "pipeline": [
                        {
                            $match: {
                                "$expr": {
                                    "$and": [{ $eq: ["$jobcode", "$$jobcode"] },
                                    { $eq: ["$employeecode", "$$employeecode"] }, { $eq: ["$employeecode", Number(params.employeecode)] }
                                    ]
                                }
                            }
                        }
                    ],
                    "as": "percentagelistinfo"
                }
            },
            { $unwind: { path: '$wishlistinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$invitedinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$appliedinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$totalappliedinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$percentagelistinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: "$employerinfo" },
            { $unwind: "$employerinfo.contactinfo" },
            { $unwind: "$jobfunctioninfo" },
            { $unwind: "$jobfunctioninfo.jobfunction" },
            {
                $match: {
                    // $and: [isshowwebsitecondition, {
                    $or: [{ "jobfunctioninfo.jobfunction.languagecode": { $exists: false } },
                    { "jobfunctioninfo.jobfunction.languagecode": "" },
                    { "jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }]
                    // }]
                }
            },
            { $unwind: { path: '$districtinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$districtinfo.district', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
            //{$match:{"jobroleinfo.jobrole.languagecode":Number(params.languagecode)} },
            { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(params.languagecode) }] } },
            //{$match:{"districtinfo.district.languagecode":Number(params.languagecode)} },
            { $match: { $or: [{ "districtinfo.district.languagecode": { $exists: false } }, { "districtinfo.district.languagecode": "" }, { "districtinfo.district.languagecode": Number(params.languagecode) }] } },
            { $unwind: { path: '$joblocationinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$joblocationinfo.district', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "joblocationinfo.district.languagecode": { $exists: false } }, { "joblocationinfo.district.languagecode": "" }, { "joblocationinfo.district.languagecode": Number(params.languagecode) }] } },
            { $match: isshowwebsitecondition },
            {
                $group: {
                    "_id": {
                        "jobid": "$jobid", "jobcode": '$jobcode', "jobrolecode": '$jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname',
                        "employercode": '$employercode', "employername": '$employerinfo.registeredname', "employermobileno": '$employerinfo.contactinfo.mobileno', "profileurl": '$employerinfo.profileurl', "experience": '$experience', "salaryrange": '$salaryrange',
                        "subscriptiondetails": '$subscriptiondetails', "wishliststatus": { $ifNull: ['$wishlistinfo.statuscode', 0] }, "wisheddate": { $ifNull: ['$wishlistinfo.createddate', 0] },
                        "invitedstatus": { $ifNull: ['$invitedinfo.statuscode', 0] }, "invitedshortliststatus": { $ifNull: ['$invitedinfo.shortliststatus', 0] },
                        "appliedstatus": { $ifNull: ['$appliedinfo.statuscode', 0] }, "appliedshortliststatus": { $ifNull: ['$appliedinfo.shortliststatus', 0] },
                        "inviteddate": { $ifNull: ['$invitedinfo.createddate', 0] },
                        "applieddate": { $ifNull: ['$appliedinfo.createddate', 0] },
                        "invitedshortlistdate": { $ifNull: ['$invitedinfo.updateddate', 0] },
                        "appliedshortlistdate": { $ifNull: ['$appliedinfo.updateddate', 0] }, "matchingpercentage": { $ifNull: ['$percentagelistinfo.matchpercentage', 0] },
                        "noofopenings": '$noofopenings', "approveddate": '$approveddate', "validitydate": '$validitydate', "daysleft": {
                            $ceil: {
                                "$divide": [
                                    { "$subtract": ["$validitydate", milliseconds] },
                                    60 * 1000 * 60 * 24
                                ]
                            }
                        }
                    }, "location": {
                        "$addToSet": {
                            "locationcode": "$districtinfo.districtcode",
                            "locationname": "$districtinfo.district.districtname"
                        },
                    },
                    "joblocation": {
                        "$addToSet": {
                            "locationcode": "$joblocationinfo.districtcode",
                            "locationname": "$joblocationinfo.district.districtname"
                        },
                    },
                    "totalappliedcount": { $addToSet: "$totalappliedinfo.employeecode" }
                }
            },

            { $sort: params.sortbyparams },
            {
                "$project": {
                    _id: 0,
                    "jobid": '$_id.jobid', "jobcode": '$_id.jobcode', "jobrolecode": '$_id.jobrolecode', "jobrolename": '$_id.jobrolename', "jobfunctionname": '$_id.jobfunctionname', employercode: '$_id.employercode',
                    employername: '$_id.employername', employermobileno: '$_id.employermobileno', profileurl: '$_id.profileurl', wishliststatus: '$_id.wishliststatus', wisheddate: '$_id.wisheddate', invitedstatus: '$_id.invitedstatus', invitedshortliststatus: '$_id.invitedshortliststatus',
                    appliedstatus: '$_id.appliedstatus', appliedshortliststatus: '$_id.appliedshortliststatus',
                    inviteddate: '$_id.inviteddate', applieddate: '$_id.applieddate',
                    invitedshortlistdate: '$_id.invitedshortlistdate', appliedshortlistdate: '$_id.appliedshortlistdate', matchingpercentage: '$_id.matchingpercentage',
                    "experience": '$_id.experience', "salaryrange": '$_id.salaryrange', "subscriptiondetails": '$_id.subscriptiondetails', "validitydate": '$_id.validitydate',
                    "daysleft": '$_id.daysleft', "joblocationcode": '$joblocation.locationcode', "joblocationname": '$joblocation.locationname',
                    "locationcode": '$location.locationcode', "locationname": '$location.locationname', "noofopenings": '$_id.noofopenings', "totalappliedcount": { "$size": "$totalappliedcount" },
                }
            },
            skipCondition,
            limitCondition
        ]).toArray(function (err, result) {
            // console.log(result);
            //  console.log(JSON.stringify(result));
            dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, controlsresult) {
                // console.log(controlsresult)
                finalresult = result;
                finalresult.jobalertdays = controlsresult[0].jobexpirydays;
                ////console.log(controlsresult);
                // console.log(result);
                return callback(finalresult);
            });

        });
    }
    catch (e) { logger.error("Error in Getting Job List Function: " + e); }
}
function GetOverAllJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        ////console.log("JoblistEntry");
        //console.log(matchparams);

        dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
            { $match: matchparams },
            // {
            //     "$lookup": {
            //         "from": String(MongoDB.JobRoleCollectionName),
            //         "localField": "jobrolecode",
            //         "foreignField": "jobrolecode",
            //         "as": "jobroleinfo"
            //     }
            // },
            // {
            //     "$lookup": {
            //         "from": String(MongoDB.JobFunctionCollectionName),
            //         "localField": "jobfunctioncode",
            //         "foreignField": "jobfunctioncode",
            //         "as": "jobfunctioninfo"
            //     }
            // },
            // {
            //     "$lookup": {
            //         "from": String(MongoDB.EmployerCollectionName),
            //         "localField": "employercode",
            //         "foreignField": "employercode",
            //         "as": "employerinfo"
            //     }
            // },
            // { $match: employerparams },
            // {
            //     "$lookup": {
            //         "from": String(MongoDB.DistrictCollectionName),
            //         "localField": "preferredlocation.locationlist.locationcode",
            //         "foreignField": "districtcode",
            //         "as": "districtinfo"
            //     }
            // },
            // {
            //     "$lookup":
            //     {
            //         "from": String(MongoDB.DistrictCollectionName),
            //         "localField": "preferredjoblocation.locationlist.locationcode",
            //         "foreignField": "districtcode",
            //         "as": "joblocationinfo"
            //     }
            // },
            // {
            //     "$lookup":
            //     {
            //         "from": String(MongoDB.EmployeeWishListCollectionName),
            //         "localField": 'jobcode',
            //         "foreignField": 'jobcode',
            //         "as": 'wishlistinfo'
            //     }
            // },
            // {
            //     "$addFields": {
            //         "wishlistinfo": {
            //             "$filter": {
            //                 "input": "$wishlistinfo",
            //                 "as": "wishinfo",
            //                 "cond": {
            //                     "$eq": ["$$wishinfo.employeecode", Number(params.employeecode)]
            //                 }
            //             }
            //         }
            //     }
            // },
            // {
            //     $lookup:
            //     {
            //         from: String(MongoDB.EmployeeInvitedCollectionName),
            //         localField: 'jobcode',
            //         foreignField: 'jobcode',
            //         as: 'invitedinfo'
            //     }
            // },
            // {
            //     "$addFields": {
            //         "invitedinfo": {
            //             "$filter": {
            //                 "input": "$invitedinfo",
            //                 "as": "inviteinfo",
            //                 "cond": {
            //                     "$eq": ["$$inviteinfo.employeecode", Number(params.employeecode)]
            //                 }
            //             }
            //         }
            //     }
            // },
            // {
            //     $lookup:
            //     {
            //         from: String(MongoDB.EmployeeAppliedCollectionName),
            //         localField: 'jobcode',
            //         foreignField: 'jobcode',
            //         as: 'appliedinfo'
            //     }
            // },
            // {
            //     "$addFields": {
            //         "appliedinfo": {
            //             "$filter": {
            //                 "input": "$appliedinfo",
            //                 "as": "applyinfo",
            //                 "cond": {
            //                     "$eq": ["$$applyinfo.employeecode", Number(params.employeecode)]
            //                 }
            //             }
            //         }
            //     }
            // },
            // { $unwind: { path: '$wishlistinfo', preserveNullAndEmptyArrays: true } },
            // { $unwind: { path: '$invitedinfo', preserveNullAndEmptyArrays: true } },
            // { $unwind: { path: '$appliedinfo', preserveNullAndEmptyArrays: true } },
            // { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
            // { $unwind: "$employerinfo" },
            // { $unwind: "$jobfunctioninfo" },
            // { $unwind: "$jobfunctioninfo.jobfunction" },
            // {
            //     $match: {
            //         // $and: [isshowwebsitecondition, {
            //         $or: [{ "jobfunctioninfo.jobfunction.languagecode": { $exists: false } },
            //         { "jobfunctioninfo.jobfunction.languagecode": "" },
            //         { "jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }]
            //         // }]
            //     }
            // },
            // { $unwind: { path: '$districtinfo', preserveNullAndEmptyArrays: true } },
            // { $unwind: { path: '$districtinfo.district', preserveNullAndEmptyArrays: true } },
            // { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
            // //{$match:{"jobroleinfo.jobrole.languagecode":Number(params.languagecode)} },
            // { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(params.languagecode) }] } },
            // //{$match:{"districtinfo.district.languagecode":Number(params.languagecode)} },
            // { $match: { $or: [{ "districtinfo.district.languagecode": { $exists: false } }, { "districtinfo.district.languagecode": "" }, { "districtinfo.district.languagecode": Number(params.languagecode) }] } },
            // { $unwind: { path: '$joblocationinfo', preserveNullAndEmptyArrays: true } },
            // { $unwind: { path: '$joblocationinfo.district', preserveNullAndEmptyArrays: true } },
            // { $match: { $or: [{ "joblocationinfo.district.languagecode": { $exists: false } }, { "joblocationinfo.district.languagecode": "" }, { "joblocationinfo.district.languagecode": Number(params.languagecode) }] } },
            // { $match: isshowwebsitecondition },
            // {
            //     $group: {
            //         "_id": {
            //             "jobid": "$jobid", "jobcode": '$jobcode', "jobrolecode": '$jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname',
            //             "employercode": '$employercode', "employername": '$employerinfo.registeredname', "profileurl": '$employerinfo.profileurl', "experience": '$experience', "salaryrange": '$salaryrange',
            //             "subscriptiondetails": '$subscriptiondetails', "wishliststatus": { $ifNull: ['$wishlistinfo.statuscode', 0] }, "wisheddate": { $ifNull: ['$wishlistinfo.createddate', 0] },
            //             "invitedstatus": { $ifNull: ['$invitedinfo.statuscode', 0] }, "invitedshortliststatus": { $ifNull: ['$invitedinfo.shortliststatus', 0] },
            //             "appliedstatus": { $ifNull: ['$appliedinfo.statuscode', 0] }, "appliedshortliststatus": { $ifNull: ['$appliedinfo.shortliststatus', 0] },
            //             "inviteddate": { $ifNull: ['$invitedinfo.createddate', 0] },
            //             "applieddate": { $ifNull: ['$appliedinfo.createddate', 0] },
            //             "invitedshortlistdate": { $ifNull: ['$invitedinfo.updateddate', 0] },
            //             "appliedshortlistdate": { $ifNull: ['$appliedinfo.updateddate', 0] },
            //             "noofopenings": '$noofopenings', "approveddate": '$approveddate', "validitydate": '$validitydate', "daysleft": {
            //                 $trunc: {
            //                     "$divide": [
            //                         { "$subtract": ["$validitydate", milliseconds] },
            //                         60 * 1000 * 60 * 24
            //                     ]
            //                 }
            //             }
            //         }, "location": {
            //             "$push": {
            //                 "locationcode": "$districtinfo.districtcode",
            //                 "locationname": "$districtinfo.district.districtname"
            //             },
            //         },
            //         "joblocation": {
            //             "$push": {
            //                 "locationcode": "$joblocationinfo.districtcode",
            //                 "locationname": "$joblocationinfo.district.districtname"
            //             },
            //         },
            //     }
            // },

            // { $sort: params.sortbyparams },
            // {
            //     "$project": {
            //         _id: 0,
            //         "jobid": '$_id.jobid', "jobcode": '$_id.jobcode', "jobrolecode": '$_id.jobrolecode', "jobrolename": '$_id.jobrolename', "jobfunctionname": '$_id.jobfunctionname', employercode: '$_id.employercode',
            //         employername: '$_id.employername', profileurl: '$_id.profileurl', wishliststatus: '$_id.wishliststatus', wisheddate: '$_id.wisheddate', invitedstatus: '$_id.invitedstatus', invitedshortliststatus: '$_id.invitedshortliststatus',
            //         appliedstatus: '$_id.appliedstatus', appliedshortliststatus: '$_id.appliedshortliststatus',
            //         inviteddate: '$_id.inviteddate', applieddate: '$_id.applieddate',
            //         invitedshortlistdate: '$_id.invitedshortlistdate', appliedshortlistdate: '$_id.appliedshortlistdate',
            //         "experience": '$_id.experience', "salaryrange": '$_id.salaryrange', "subscriptiondetails": '$_id.subscriptiondetails', "validitydate": '$_id.validitydate',
            //         "daysleft": '$_id.daysleft', "joblocationcode": '$joblocation.locationcode', "joblocationname": '$joblocation.locationname',
            //         "locationcode": '$location.locationcode', "locationname": '$location.locationname', "noofopenings": '$_id.noofopenings'
            //     }
            // },
            // skipCondition,
            // limitCondition
        ]).toArray(function (err, result) {
            // console.log(result)
            dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, controlsresult) {
                // console.log(controlsresult)
                finalresult = result;
                finalresult.jobalertdays = controlsresult[0].jobexpirydays;
                ////console.log(controlsresult);
                // console.log(result);
                return callback(finalresult);
            });

        });
    }
    catch (e) { logger.error("Error in Getting Job List Function: " + e); }
}
function GetOverAllFlashJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
            { $match: matchparams },
            // {
            //     "$lookup": {
            //         "from": String(MongoDB.JobRoleCollectionName),
            //         "localField": "jobrolecode",
            //         "foreignField": "jobrolecode",
            //         "as": "jobroleinfo"
            //     }
            // },
            // {
            //     "$lookup": {
            //         "from": String(MongoDB.JobFunctionCollectionName),
            //         "localField": "jobfunctioncode",
            //         "foreignField": "jobfunctioncode",
            //         "as": "jobfunctioninfo"
            //     }
            // },
            // {
            //     "$lookup":
            //     {
            //         "from": String(MongoDB.DistrictCollectionName),
            //         "localField": "preferredjoblocation.locationlist.locationcode",
            //         "foreignField": "districtcode",
            //         "as": "joblocationinfo"
            //     }
            // },
            // { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
            // { $unwind: "$jobfunctioninfo" },
            // { $unwind: "$jobfunctioninfo.jobfunction" },
            // { $match: { $or: [{ "jobfunctioninfo.jobfunction.languagecode": { $exists: false } }, { "jobfunctioninfo.jobfunction.languagecode": "" }, { "jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }] } },
            // { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
            // { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(params.languagecode) }] } },
            // { $unwind: { path: '$joblocationinfo', preserveNullAndEmptyArrays: true } },
            // { $unwind: { path: '$joblocationinfo.district', preserveNullAndEmptyArrays: true } },
            // { $match: { $or: [{ "joblocationinfo.district.languagecode": { $exists: false } }, { "joblocationinfo.district.languagecode": "" }, { "joblocationinfo.district.languagecode": Number(params.languagecode) }] } },
            // { $match: isshowwebsitecondition },
            // {
            //     $group: {
            //         "_id": {
            //             "companyname": "$contactdetails.companyname",
            //             "jobid": "$jobid", "jobcode": '$jobcode', "jobrolecode": '$jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname', "jobfunctioncode": '$jobfunctioninfo.jobfunction.jobfunctioncode',
            //             "experience": '$experience', "salaryrange": '$salaryrange',
            //             "isbestsalary": '$isbestsalary',
            //             "noofopenings": '$noofopenings', "validitydate": '$validitydate', "daysleft": {
            //                 $trunc: {
            //                     "$divide": [
            //                         { "$subtract": ["$validitydate", milliseconds] },
            //                         60 * 1000 * 60 * 24
            //                     ]
            //                 }
            //             }
            //         },
            //         "joblocation": {
            //             "$push": {
            //                 "locationcode": "$joblocationinfo.districtcode",
            //                 "locationname": "$joblocationinfo.district.districtname"
            //             },
            //         },
            //     }
            // },
            // { $sort: params.sortbyparams },
            // {
            //     "$project": {
            //         _id: 0,
            //         "companyname": '$_id.companyname',
            //         "jobid": '$_id.jobid', "jobcode": '$_id.jobcode', "jobrolecode": '$_id.jobrolecode', "jobrolename": '$_id.jobrolename', "jobfunctionname": '$_id.jobfunctionname', 'jobfunctioncode': '$_id.jobfunctioncode', employercode: '$_id.employercode',
            //         "experience": '$_id.experience', "salaryrange": '$_id.salaryrange', "validitydate": '$_id.validitydate',
            //         "daysleft": '$_id.daysleft', "joblocationcode": '$joblocation.locationcode', "joblocationname": '$joblocation.locationname',
            //         "noofopenings": '$_id.noofopenings', "isbestsalary": '$_id.isbestsalary'
            //     }
            // },
            // skipCondition,
            // limitCondition
        ]).toArray(function (err, result) {
            dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, controlsresult) {
                finalresult = result;
                finalresult.jobalertdays = controlsresult[0].jobexpirydays;
                //console.log(controlsresult);
                return callback(finalresult);
            });

        });
    }
    catch (e) { logger.error("Error in Getting Job List Function: " + e); }
}
function GetAllFlashJobs(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
            { $match: matchparams },
            {
                "$lookup": {
                    "from": String(MongoDB.JobRoleCollectionName),
                    "localField": "jobrolecode",
                    "foreignField": "jobrolecode",
                    "as": "jobroleinfo"
                }
            },
            {
                "$lookup": {
                    "from": String(MongoDB.JobFunctionCollectionName),
                    "localField": "jobfunctioncode",
                    "foreignField": "jobfunctioncode",
                    "as": "jobfunctioninfo"
                }
            },
            {
                "$lookup":
                {
                    "from": String(MongoDB.DistrictCollectionName),
                    "localField": "preferredjoblocation.locationlist.locationcode",
                    "foreignField": "districtcode",
                    "as": "joblocationinfo"
                }
            },
            { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: "$jobfunctioninfo" },
            { $unwind: "$jobfunctioninfo.jobfunction" },
            { $match: { $or: [{ "jobfunctioninfo.jobfunction.languagecode": { $exists: false } }, { "jobfunctioninfo.jobfunction.languagecode": "" }, { "jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }] } },
            { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(params.languagecode) }] } },
            { $unwind: { path: '$joblocationinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$joblocationinfo.district', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "joblocationinfo.district.languagecode": { $exists: false } }, { "joblocationinfo.district.languagecode": "" }, { "joblocationinfo.district.languagecode": Number(params.languagecode) }] } },
            { $match: isshowwebsitecondition },
            {
                $group: {
                    "_id": {
                        "companyname": "$contactdetails.companyname",
                        "jobid": "$jobid", "jobcode": '$jobcode', "jobrolecode": '$jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname', "jobfunctioncode": '$jobfunctioninfo.jobfunction.jobfunctioncode',
                        "experience": '$experience', "salaryrange": '$salaryrange',
                        "isbestsalary": '$isbestsalary',
                        "noofopenings": '$noofopenings', "validitydate": '$validitydate', "daysleft": {
                            $ceil: {
                                "$divide": [
                                    { "$subtract": ["$validitydate", milliseconds] },
                                    60 * 1000 * 60 * 24
                                ]
                            }
                        }
                    },
                    "joblocation": {
                        "$addToSet": {
                            "locationcode": "$joblocationinfo.districtcode",
                            "locationname": "$joblocationinfo.district.districtname"
                        },
                    },
                }
            },
            { $sort: params.sortbyparams },
            {
                "$project": {
                    _id: 0,
                    "companyname": '$_id.companyname',
                    "jobid": '$_id.jobid', "jobcode": '$_id.jobcode', "jobrolecode": '$_id.jobrolecode', "jobrolename": '$_id.jobrolename', "jobfunctionname": '$_id.jobfunctionname', 'jobfunctioncode': '$_id.jobfunctioncode', employercode: '$_id.employercode',
                    "experience": '$_id.experience', "salaryrange": '$_id.salaryrange', "validitydate": '$_id.validitydate',
                    "daysleft": '$_id.daysleft', "joblocationcode": '$joblocation.locationcode', "joblocationname": '$joblocation.locationname',
                    "noofopenings": '$_id.noofopenings', "isbestsalary": '$_id.isbestsalary'
                }
            },
            skipCondition,
            limitCondition
        ]).toArray(function (err, result) {
            dbo.collection(MongoDB.ControlsCollectionName).find().toArray(function (err, controlsresult) {
                finalresult = result;
                finalresult.jobalertdays = controlsresult[0].jobexpirydays;
                //console.log(controlsresult);
                return callback(finalresult);
            });

        });
    }
    catch (e) { logger.error("Error in Getting Job List Function: " + e); }
}

function GetAllFlashJobsTotal(matchparams, params, employerparams, skipCondition, limitCondition, isshowwebsitecondition, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        dbo.collection(MongoDB.PrivateJobPostsCollectionName).aggregate([
            { $match: matchparams },

            {
                $group: {
                    "_id": {
                        "companyname": "$contactdetails.companyname",
                        "jobid": "$jobid", "jobcode": '$jobcode'
                    },

                }
            },

            {
                "$project": {
                    _id: 0,
                    "companyname": '$_id.companyname',
                    "jobid": '$_id.jobid', "jobcode": '$_id.jobcode'
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result.length;
            // finalresult.jobalertdays = controlsresult[0].jobexpirydays;
            //console.log(controlsresult);
            return callback(finalresult);

        });
    }
    catch (e) { logger.error("Error in Getting Job List Function: " + e); }
}
exports.RecentSearchUpdate = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Job List on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(params);
        dbo.collection(String(MongoDB.RecentSearchCollectionName)).find({ "employeecode": params.employeecode, "type": params.type, "typecode": params.typecode }, { $exists: true }).count(function (err, totalcount) {
            ////console.log(totalcount);
            if (totalcount == 0) {
                dbo.collection(String(MongoDB.RecentSearchCollectionName)).insertOne(params, function (err, recentresult) {
                    if (err) throw err;
                    finalresult = recentresult.insertedCount;
                    // //console.log(finalresult);
                    return callback(finalresult);
                });
            }
            else {
                dbo.collection(String(MongoDB.RecentSearchCollectionName)).updateOne({ "employeecode": params.employeecode, "type": params.type, "typecode": params.typecode }, { $set: { "searchdate": milliseconds } }, function (err, res) {
                    if (err) throw err;
                    finalresult = res.modifiedCount;
                    ////console.log(finalresult);
                    return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);
                });
            }
        });

    }
    catch (e) { logger.error("Error in Recent Search Update: " + e); }
}  