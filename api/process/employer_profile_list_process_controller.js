'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');

exports.getAllProfiles = function (logparams, params, listparams, listcode, sortbycode, exptype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var exp = [];
        var explist = [];
        var sortbyparams;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Profiles List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(sortbycode);

        if (sortbycode == 7)
            sortbyparams = { '_id.totalexperience': 1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 8)
            sortbyparams = { '_id.totalexperience': -1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 9)
            sortbyparams = { '_id.joiningdays': 1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 10)
            sortbyparams = { '_id.joiningdays': -1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 11)
            sortbyparams = { '_id.salarymax': 1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 12)
            sortbyparams = { '_id.salarymax': -1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 13)
            sortbyparams = { '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 14)
            sortbyparams = { '_id.lastlogindate': 1, '_id.employeecode': -1 };
        else if (sortbycode == 31)
            sortbyparams = { '_id.matchpercentage': -1, '_id.employeecode': -1 };
        else if (sortbycode == 32)
            sortbyparams = { '_id.matchpercentage': 1, '_id.employeecode': -1 };
        else
            sortbyparams = { '_id.lastlogindate': -1, '_id.totalexperience': -1, '_id.employeecode': -1 };
        ////console.log("e", exptype);
        explist = listparams.experiencecode;
        //console.log("job type", listparams.jobtypecode.includes(9));
        if (explist.length > 0) {
            // if (exptype == 0)
            // {
            //     if (explist[1] == 0)
            //     {
            //         exp.push({ "$and": [{}, {'totalexperience': {'$eq': explist[0]}}]});
            //     }
            //     else
            //     {
            //         ////console.log("Entry EXP");
            //         exp.push({ "$and": [{'totalexperience': {'$lte': explist[1]}}, {'totalexperience': {'$gte': explist[0]}}]});

            //     }
            // }
            // else {
            //     for (var i = 0; i <= explist.length - 1; i++) {
            //         if (i == 0) {
            //             exp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
            //         }
            //         else {
            //             var exp1 = [];
            //             exp1 = exp;
            //             var temp = [];
            //             temp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
            //             exp = exp1.concat(temp);
            //         }
            //     }
            // }
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    if (explist[i] == 0) {
                        exp.push({ "$and": [{}, { 'totalexperience': { '$eq': explist[i] } }] });
                    }
                    else {
                        exp.push({ "$and": [{}, { 'totalexperience': { '$gte': explist[i] } }] });
                    }
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    temp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i+1] } }, { 'totalexperience': { '$gte': explist[i] } }] });
                    exp = exp1.concat(temp);
                }
                // break;
            }

        }
        else {
            exp = [{}];
        }
        // console.log('listparams.jobrolecode')
        // console.log(listparams.jobrolecode)
        ////console.log("ext", exp);
        var matchparams = "";

        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, jobtypecode = {}, schoolqualcode = {}, maritalcode = {}, gendercode = {};
        var afterschoolqualcode = {}, afterschoolspeccode = {}, afterschoolcatecode = {}, differentlyabledcode = {}, salaryfrom = {}, salaryto = {}, agefrom = {}, ageto = {}, searchcode = {};
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { $or: [{ 'skills.jobfunctioncode': { $in: listparams.jobfunctioncode } }, { 'preferences.jobfunction.jobfunctioncode': { $in: listparams.jobfunctioncode } }] };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { 'skills.jobrolecode': { $in: listparams.jobrolecode } };
        if (listparams.skillcode.length > 0 && listparams.skillcode[0] != 0)// Skill--
        {
            skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
        }

        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0 && listparams.jobtypecode.includes(9) == false)// JobType==
            jobtypecode = { $or: [{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } }, { 'preferences.employementtype.employementtypecode': 9 }] };
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
        {
            afterschoolqualcode = { 'afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
            schoolqualcode = {};
        }

        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
        {
            afterschoolspeccode = { 'afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
            schoolqualcode = {};
        }

        if (listparams.afterschoolcatecode != null && listparams.afterschoolcatecode.length > 0)// after school spec code==
        {
            afterschoolcatecode = { 'afterschooling.educationcategorycode': { $in: listparams.afterschoolcatecode } };
            schoolqualcode = {};
        }

        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'personalinfo.gender': { $in: listparams.gendercode } };
        if (listparams.differentlyabled != null && listparams.differentlyabled >= 0)
            differentlyabledcode = { 'personalinfo.differentlyabled': listparams.differentlyabled };
        if (listparams.salaryto != null && Number(listparams.salaryto) != 0)
            salaryfrom = { 'preferences.minsalary': { $lte: Number(listparams.salaryto) } };
        if (listparams.salaryfrom != null && Number(listparams.salaryfrom) != 0)
            salaryto = { 'preferences.maxsalary': { $gte: Number(listparams.salaryfrom) } };
        // if (listparams.salaryto != null && Number(listparams.salaryto) != 0)
        //     salaryfrom = { 'preferences.minsalary': { $gte: Number(listparams.salaryfrom) } };
        // if (listparams.salaryfrom != null && Number(listparams.salaryfrom) != 0)
        //     salaryto = { 'preferences.maxsalary': { $lte: Number(listparams.salaryto) } };
        if (listparams.searchcode != null)
            searchcode = listparams.searchcode;
        //      //console.log(searchcode);
        // //console.log(listparams.salaryto);
        //  //console.log(listparams.salaryfrom );
        //  //console.log(jobfunctioncode);
        //  //console.log(jobrolecode);
        //  //console.log(locationcode);
        //  //console.log(skillcode);
        //  //console.log(jobtypecode);
        //  //console.log(schoolqualcode);
        //  //console.log(maritalcode);
        // //console.log(gendercode);
        //  //console.log(differentlyabledcode);
        // //console.log(salaryfrom);
        // //console.log(salaryto); 

        // //console.log(afterschoolqualcode);
        // //console.log(afterschoolspeccode);
        // //console.log(afterschoolcatecode);
        if (listparams.anyage == "true" || listparams.agefrom == 0 || listparams.ageto == 0) {
            agefrom = {};
            //ageto = {};
        }
        else {
            //agefrom = {$or:[{'agecriteria.isany':'true'}, {$and:[{'agecriteria.isany':'false'},{'agecriteria.from': {$lte: Number(listparams.ageto)}},{'agecriteria.to': {$gte: Number(listparams.agefrom)}}]}]};    
            //agefrom = {};
            //exp.push({ "$and": [{'totalexperience': {'$lte': explist[i]}}, {'totalexperience': {'$gte': explist[i]}}]});
            //var tempage =  "$divide" + ":" + [{"$subtract": [ milliseconds, "$personalinfo.dateofbirth" ] }, (365 * 24*60*60*1000)];
            //agefrom = {tempage: {$lte: Number(listparams.ageto)}};
            //agefrom = {'agecriteria.from': {$lte: Number(listparams.ageto)}};
            //ageto = {tempage: {$gte: Number(listparams.agefrom)}};
            agefrom = { $and: [{ "_id.age": { $lte: Number(listparams.ageto) } }, { "_id.age": { $gte: Number(listparams.agefrom) } }] };

        }
        ////console.log(agefrom);
        //console.log(skillcode);
        if (listcode == 1)// Common List
        {

            ////console.log("Entry");
            // matchparams = {
            //     $and: [{ 'statuscode': { $eq: objConstants.activestatus } },{ 'registervia': 2 },
            //     {
            //         $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
            //             { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
            //             { $and: [salaryfrom, salaryto] }]
            //     }]
            // };

            matchparams = {
                $and: [{ 'statuscode': { $eq: objConstants.activestatus } },
                {
                    $and: [jobfunctioncode, jobrolecode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
                        { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                        { $and: [salaryfrom, salaryto] }]
                }]
            };

            if (matchparams != "") {
                GetAllProfilesList(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 2)// Shortlist
        {
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "jobcode": Number(params.jobcode), "shortliststatus": objConstants.shortlistedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, appliedresult) {
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "jobcode": Number(params.jobcode), "shortliststatus": objConstants.shortlistedstatus } },
                    { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                    { "$project": { _id: 0, employeecode: '$employeecode' } }
                ]).toArray(function (err, invitedresult) {
                    var tempempcode = [];
                    if (appliedresult == null && invitedresult == null && appliedresult.length == 0 && invitedresult.length == 0) {

                    }
                    else {

                        if (invitedresult[0] != null && invitedresult[0].employeecode.length > 0) {
                            for (var i = 0; i <= invitedresult[0].employeecode.length - 1; i++) {
                                tempempcode.push(invitedresult[0].employeecode[i]);
                            }

                        }
                        if (appliedresult[0] != null && appliedresult[0].employeecode.length > 0) {
                            for (var i = 0; i <= appliedresult[0].employeecode.length - 1; i++) {
                                tempempcode.push(appliedresult[0].employeecode[i]);
                            }
                            //tempempcode = appliedresult[0].employeecode;
                        }
                        ////console.log("emp", tempempcode);
                        matchparams = {
                            $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { "employeecode": { $in: tempempcode } },
                                // {
                                //     $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                //         { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                                //         { $and: [salaryfrom, salaryto] }]
                                // }
                            ]
                        };
                        ////console.log(matchparams);
                        if (matchparams != "") {
                            GetAllProfilesList(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                                ////console.log(jobresult);
                                return callback(jobresult);
                            });
                        }
                        else {
                            var result = [];
                            return callback(result);
                        }
                    }


                });
            });


        }
        else if (listcode == 3)// Applied
        {
            // //console.log("Applied");
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "jobcode": Number(params.jobcode), "statuscode": objConstants.appliedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, appliedresult) {
                ////console.log("A", appliedresult);
                var tempempcode = [];
                if (appliedresult == null && appliedresult.length == 0) {

                }
                else {


                    if (appliedresult[0] != null && appliedresult[0].employeecode.length > 0) {
                        for (var i = 0; i <= appliedresult[0].employeecode.length - 1; i++) {
                            tempempcode.push(appliedresult[0].employeecode[i]);
                        }
                        //tempempcode = appliedresult[0].employeecode;
                    }
                    ////console.log("emp", tempempcode);
                    matchparams = {
                        $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { "employeecode": { $in: tempempcode } }
                            // {
                            //     $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                            //         { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                            //         { $and: [salaryfrom, salaryto] }]
                            // }
                        ]
                    };
                    if (matchparams != "") {
                        GetAllProfilesList(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }


                //});
            });


        }
        else if (listcode == 4)// Invited
        {

            dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                { $match: { "jobcode": Number(params.jobcode), "statuscode": objConstants.invitedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, invitedresult) {
                var tempempcode = [];
                ////console.log("invi", invitedresult);
                if (invitedresult == null && invitedresult.length == 0) {

                }
                else {

                    if (invitedresult[0] != null && invitedresult[0].employeecode.length > 0) {
                        for (var i = 0; i <= invitedresult[0].employeecode.length - 1; i++) {
                            tempempcode.push(invitedresult[0].employeecode[i]);
                        }

                    }

                    // //console.log("emp", tempempcode);
                    matchparams = {
                        $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { "employeecode": { $in: tempempcode } },
                            // {
                            //     $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                            //         { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                            //         { $and: [salaryfrom, salaryto] }]
                            // }
                        ]
                    };
                    // //console.log(matchparams);
                    if (matchparams != "") {
                        GetAllProfilesList(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                            ////console.log(jobresult);
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }


            });
            //});


        }
        else if (listcode == 5)// wisheslist
        {

            dbo.collection(MongoDB.EmployerWishListCollectionName).aggregate([
                { $match: { "jobcode": Number(params.jobcode), "statuscode": objConstants.wishlistedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, wishresult) {
                var tempempcode = [];
                if (wishresult == null && wishresult.length == 0) {

                }
                else {

                    if (wishresult[0] != null && wishresult[0].employeecode.length > 0) {
                        for (var i = 0; i <= wishresult[0].employeecode.length - 1; i++) {
                            tempempcode.push(wishresult[0].employeecode[i]);
                        }

                    }

                    ////console.log("emp", tempempcode);
                    matchparams = {
                        $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { "employeecode": { $in: tempempcode } },
                        {
                            $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                                { $and: [salaryfrom, salaryto] }]
                        }]
                    };
                    ////console.log(matchparams);
                    if (matchparams != "") {
                        GetAllProfilesList(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                            ////console.log(jobresult);
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }


            });
            //});


        }
        else if (listcode == 6)// For Notification
        {

            matchparams = {
                $and: [{ 'statuscode': { $eq: objConstants.activestatus } },
                {
                    $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
                        { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                        { $and: [salaryfrom, salaryto] }]
                }]
            };
            ////console.log(matchparams);
            if (matchparams != "") {
                ////console.log("Kavitha");
                GetAllEmployees(matchparams, function (jobresult) {
                    ////console.log(jobresult);

                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
            //});


        }
        else if (listcode == 7)// For Private Job Notification
        {

            matchparams = {
                $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { 'registervia': 2 },
                {
                    // $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
                    //     { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                    //     { $and: [salaryfrom, salaryto] }]
                    // $and: [jobfunctioncode, jobrolecode, locationcode]
                    $and: [jobfunctioncode]
                }]
            };
            // console.log(JSON.stringify(jobfunctioncode));
            // console.log(JSON.stringify(jobrolecode));
            // console.log(JSON.stringify(locationcode));
            // console.log(JSON.stringify({ $or: exp }));
            // console.log(JSON.stringify({ $and: [salaryfrom, salaryto] }));

            if (matchparams != "") {
                ////console.log("Kavitha");
                GetAllEmployees(matchparams, function (jobresult) {
                    ////console.log(jobresult);

                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
            //});


        }
        else if (listcode == 8)// Overall Invited
        {
            //console.log('employercode',listparams.employercode);
            dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                { $match: { "employercode": Number(listparams.employercode) , "statuscode": objConstants.invitedstatus } },
                //{ $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                //{ "$project": { _id: 0, employeecode: 1 } }
            ]).toArray(function (err, invitedresult) {
                 //console.log('invitedresult');
                 //console.log(invitedresult);
                if (invitedresult == null && invitedresult.length == 0) {
                    var result = [];
                    return callback(result);
                } else {
                    return callback(invitedresult);
                }
            });
        }
        else if (listcode == 9)// Overall Applied
        {
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "employercode": Number(listparams.employercode), "statuscode": objConstants.appliedstatus } },
                //{ $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                //{ "$project": { _id: 0, employeecode: 1 } }
            ]).toArray(function (err, appliedresult) {
                 //console.log('appliedresult');
                 //console.log(appliedresult);
                if (appliedresult == null && appliedresult.length == 0) {
                    var result = [];
                    return callback(result);
                } else {
                    return callback(appliedresult);
                }
            });
        }
        else if (listcode == 10)// Overall Matched Profiles
        {

            ////console.log("Entry");
            // matchparams = {
            //     $and: [{ 'statuscode': { $eq: objConstants.activestatus } },{ 'registervia': 2 },
            //     {
            //         $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
            //             { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
            //             { $and: [salaryfrom, salaryto] }]
            //     }]
            // };

            matchparams = {
                $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { 'registervia': 2 },
                {
                    $and: [jobfunctioncode, jobrolecode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
                        { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                        { $and: [salaryfrom, salaryto] }]
                }]
            };

            if (matchparams != "") {
                GetAllMatchedProfilesList(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
    }
    catch (e) { logger.error("Error in Getting Profile List: " + e); }
}
function GetAllProfilesList(matchparams, params, listagefrom, sortbyparams, skipvalue, limitvalue, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        /* var date = new Date(); // some mock date
        var milliseconds = date.getTime(); */
        ////console.log("JoblistEntry",matchparams);
        if (params.employeecode == null || params.employeecode == undefined)
        {
            params.employeecode = [];
        }
        var DefaultConditions = {};
        DefaultConditions = {
            $and: [
                { "personalinfo.dateofbirth": { $exists: true } }, { "personalinfo.dateofbirth": { $gt: 0 } },
                { "preferences.minsalary": { $exists: true } }, { "preferences.minsalary": { $gt: 0 } },
                { "employeecode": {$nin : params.employeecode}}
            ]
        }
        //  console.log(JSON.stringify(matchparams, null, " "))
         //console.log(JSON.stringify(DefaultConditions))
        var skipCondition = {};
        var limitCondition = {};
        if (limitvalue != null && limitvalue != 0 && limitvalue != undefined) {
            skipCondition = { $skip: parseInt(skipvalue) };
            limitCondition = { $limit: parseInt(limitvalue) }
        }
        // console.log(JSON.stringify(skipCondition))
        // console.log(JSON.stringify(limitCondition))
        // console.log(JSON.stringify(sortbyparams))
        //dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $unwind: "$personalinfo" },
            { $unwind: { path: '$skills', preserveNullAndEmptyArrays: true } },
            { $unwind: "$preferences" },
            { $unwind: { path: '$preferences.location', preserveNullAndEmptyArrays: true } },
            { $match: { $and: [matchparams, DefaultConditions] } },
            {
                $group:
                {
                    "_id": {
                        "employeecode": '$employeecode',
                        "totalexperience": '$totalexperience',
                        "joiningdays": '$joiningdays',
                        "lastlogindate": '$lastlogindate',
                        "salarymax": '$salarymax',
                    }
                }
            },
            { $sort: sortbyparams },
            { "$project": { _id: 0, employeecode: '$_id.employeecode' } },
            skipCondition,
            limitCondition,
            //{ $skip: parseInt(0) },
            //limitCondition,
        ],{ allowDiskUse: true }).toArray(function (err, matchedresult) {
            var tempempcode = [];
            if (matchedresult == null && matchedresult.length == 0) {
                var result = [];
                return callback(result);
            }
            else {
            //    console.log("matchedresult.length", matchedresult.length);
                for (var i = 0; i <= matchedresult.length - 1; i++) {
                    ////console.log("emp", matchedresult[i].employeecode);
                    tempempcode.push(matchedresult[i].employeecode);
                }
                // console.log("emp", tempempcode);
                var empmatchparams = { "employeecode": { $in: tempempcode } };
                //   console.log('Kavithaaaaaaaaaaaaaaaaaa');
                //  console.log(Number(params.languagecode));
                // console.log(objConstants.hindilangcode);
                if (empmatchparams != "") {
                    //console.log(empmatchparams);
                    dbo.collection(MongoDB.EmployeeProfileViewCollectionName).aggregate([
                        { $unwind: "$contactinfo" },
                        { $unwind: "$personalinfo" },
                        { $unwind: { path: '$skilllist', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$skilllisttamil', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$skilllisthindi', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$skilllist.skillcode', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$skilllist.skillname', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$skilllisttamil.skillname', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$skilllisthindi.skillname', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$preferences', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$preferences.locationlist', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$preferencestamil', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$preferencestamil.locationlist', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$preferenceshindi', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$preferenceshindi.locationlist', preserveNullAndEmptyArrays: true } },
                        { $match: empmatchparams },
                        // {
                        //     "$lookup":
                        //     {
                        //         "from": String(MongoDB.EmployeeAppliedCollectionName),
                        //         "localField": "employeecode",
                        //         "foreignField": "employeecode",
                        //         "as": "appliedinfo"
                        //     }
                        // },
                        // {
                        //     "$addFields": {
                        //         "appliedinfo": {
                        //             "$filter": {
                        //                 "input": "$appliedinfo",
                        //                 "as": "applyinfo",
                        //                 "cond": {
                        //                     "$eq": ["$$applyinfo.jobcode", Number(params.jobcode)]
                        //                 }
                        //             }
                        //         }
                        //     }
                        // },
                        // {
                        //     "$lookup":
                        //     {
                        //         "from": String(MongoDB.EmployeeInvitedCollectionName),
                        //         "localField": "employeecode",
                        //         "foreignField": "employeecode",
                        //         "as": "invitedinfo"
                        //     }
                        // },
                        // {
                        //     "$addFields": {
                        //         "invitedinfo": {
                        //             "$filter": {
                        //                 "input": "$invitedinfo",
                        //                 "as": "inviteinfo",
                        //                 "cond": {
                        //                     "$eq": ["$$inviteinfo.jobcode", Number(params.jobcode)]
                        //                 }
                        //             }
                        //         }
                        //     }
                        // },
                        // {
                        //     "$lookup":
                        //     {
                        //         "from": String(MongoDB.EmployerWishListCollectionName),
                        //         "localField": "employeecode",
                        //         "foreignField": "employeecode",
                        //         "as": "wishedinfo"
                        //     }
                        // },
                        // {
                        //     "$addFields": {
                        //         "wishedinfo": {
                        //             "$filter": {
                        //                 "input": "$wishedinfo",
                        //                 "as": "wishinfo",
                        //                 "cond": {
                        //                     "$eq": ["$$wishinfo.jobcode", Number(params.jobcode)]
                        //                 }
                        //             }
                        //         }
                        //     }
                        // },
                        // {
                        //     "$lookup":
                        //     {
                        //       "from": String(MongoDB.EmpJobPercentageCollectionName),
                        //       "let": { "employeecode": "$employeecode", "jobcode": Number(params.jobcode) },
                        //       "pipeline": [
                        //         {
                        //           $match: {
                        //             "$expr": {
                        //               "$and": [{ $eq: ["$employeecode", "$$employeecode"] },
                        //               { $eq: ["$jobcode", "$$jobcode"] }, { $eq: ["$jobcode", Number(params.jobcode)] }
                        //               ]
                        //             }
                        //           }
                        //         }
                        //       ],
                        //       "as": "percentagelistinfo"
                        //     }
                        // },
                        { $unwind: { path: '$appliedinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$wishedinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$invitedinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$percentagelistinfo', preserveNullAndEmptyArrays: true } },
                        {
                            $group:
                            {
                                "_id": {
                                    "contactinfo": '$contactinfo',
                                    "contactinfotamil": '$contactinfotamil',
                                    "contactinfohindi": '$contactinfohindi',
                                    "mobileno": '$contactinfo.mobileno',
                                    "lastlogindate": "$personalinfo.lastlogindate",
                                    "employeecode": '$employeecode', 
									"employeename": '$personalinfo.employeefullname', 
									"imageurl": '$personalinfo.imageurl', 
									"dateofbirth": '$personalinfo.dateofbirth', 
									"gendercode": '$personalinfo.gender',
                                    "gendername": '$personalinfo.gendername', 
                                    "gendernametamil": '$personalinfotamil.gendername', 
                                    "gendernamehindi": '$personalinfohindi.gendername', 
									"totalexperience": '$totalexperience', 
									"expyear": '$expyear', 
									"expmonth": '$expmonth', 
									"fresherstatus": '$fresherstatus',
									"salarymin": '$preferences.minsalary', "joiningdays": { $ifNull: ['$preferences.joiningdays', 0] },
                                    "salarymax": '$preferences.maxsalary', "age": {
                                        "$floor": {
                                            "$divide": [
                                                { "$subtract": [milliseconds, "$personalinfo.dateofbirth"] },
                                                (365 * 24 * 60 * 60 * 1000)
                                            ]
                                        }
                                    },"wishedstatus": { $ifNull: ['$wishedinfo.statuscode', 0] },"wishedremarks": { $ifNull: ['$wishedinfo.remarks', ''] }, "invitedstatus": { $ifNull: ['$invitedinfo.statuscode', 0] }, "invitedshortliststatus": { $ifNull: ['$invitedinfo.shortliststatus', 0] },
                                    "appliedstatus": { $ifNull: ['$appliedinfo.statuscode', 0] }, "appliedshortliststatus": { $ifNull: ['$appliedinfo.shortliststatus', 0] },
                                    "inviteddate": { $ifNull: ['$invitedinfo.createddate', ''] }, "wisheddate": { $ifNull: ['$wishedinfo.createddate', ''] }, "invitedshortlistdate": { $ifNull: ['$invitedinfo.updateddate', ''] },
                                    "applieddate": { $ifNull: ['$appliedinfo.createddate', ''] }, "appliedshortlistdate": { $ifNull: ['$appliedinfo.updateddate', ''] },"matchingpercentage": { $ifNull: ['$percentagelistinfo.matchpercentage', 0] }
                                    , "appliedlastcalldate": { $ifNull: ['$appliedinfo.lastcalldate', ''] }, "invitedlastcalldate": { $ifNull: ['$invitedinfo.lastcalldate', ''] }
                                },
                                "jobfunctioncode": { $addToSet: "$skilllist.jobfunctioncode" }, 
                                 "jobfunctionname": { $addToSet: "$skilllist.jobfunctionname" }, 
								 "jobfunctionnametamil": { $addToSet: "$skilllisttamil.jobfunctionname" }, 
                                 "jobfunctionnamehindi": { $addToSet: "$skilllisthindi.jobfunctionname" }, 
                                "jobrolecode": { $addToSet: "$skilllist.jobrolecode" }, 
                                "jobrolename": { $addToSet: "$skilllist.jobrolename"  },
								"jobrolenametamil": { $addToSet: "$skilllisttamil.jobrolename"  },
                                "jobrolenamehindi": { $addToSet: "$skilllisthindi.jobrolename"  },
                                "locationcode": { $addToSet: "$preferences.locationlist.locationcode" }, 
                                "locationname": { $addToSet: "$preferences.locationlist.locationname"  },
								"locationnametamil": { $addToSet: "$preferencestamil.locationlist.locationname"  },
                                "locationnamehindi": { $addToSet: "$preferenceshindi.locationlist.locationname"  },
                                "skillcode": { $addToSet: "$skilllist.skillcode" }, 
                                "skillname": { $addToSet: "$skilllist.skillname" },
								"skillnametamil": { $addToSet: "$skilllisttamil.skillname" },
                                "skillnamehindi": { $addToSet: "$skilllisthindi.skillname" },
                                //  "jobfunctioncode": { $addToSet: "$skilllist.jobfunctioncode" }, "jobfunctionname": { $addToSet: "$skilllist.jobfunctionname" },
                                // "jobrolecode": { $addToSet: "$skilllist.jobrolecode" }, "jobrolename": { $addToSet: "$skilllist.jobrolename" },
                                // "locationcode": { $addToSet: "$preferences.locationlist.locationcode" }, "locationname": { $addToSet: "$preferences.locationlist.locationname" },
                                // "skillcode": { $addToSet: "$skilllist.skillcode" }, "skillname": { $addToSet: "$skilllist.skillname" },
                                // "currentjobrolename": { $addToSet: "$skills.currentjobfunction" },

                                "currentjobrolename": {
                                    "$addToSet": {
                                       
                                        "$cond": [
                                            { "$eq": ["$skilllist.currentjobfunction", 1] },
                                            "$skilllist.jobrolename",
                                            ""
                                        ]
                                    }
                                },


                            }
                        },
                        { $match: listagefrom },
                        { $sort: sortbyparams },

                        {
                            $project:
                            {
                                //"contactinfo": {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.englishlangcode] }, '$_id.contactinfo', {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.hindilangcode] }, '$_id.contactinfohindi', '$_id.contactinfotamil']}]}, 
                                "contactinfo": {
                                    "$switch": {
                                      "branches": [
                                        { "case": { "$eq": [ Number(params.languagecode), objConstants.englishlangcode ] }, "then": '$_id.contactinfo' },
                                        { "case": { "$eq": [ Number(params.languagecode), objConstants.hindilangcode ] }, "then": '$_id.contactinfohindi' },
                                        { "case": { "$eq": [ Number(params.languagecode), objConstants.tamillangcode ] }, "then": '$_id.contactinfotamil' },
                                      ],
                                      "default": {}
                                    }
                                  },
                                "mobileno": '$_id.mobileno',
                                "_id": 0, "employeecode": '$_id.employeecode', "employeename": '$_id.employeename', "imageurl": '$_id.imageurl', "dateofbirth": '$_id.dateofbirth', "age": '$_id.age', "gendercode": '$_id.gendercode',
                                //"gendername": {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.englishlangcode] }, '$_id.gendername', {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.hindilangcode] }, '$_id.gendernamehindi', '$_id.gendernametamil']}]}, 
                                "gendername": {
                                    "$switch": {
                                      "branches": [
                                        { "case": { "$eq": [ Number(params.languagecode), objConstants.englishlangcode ] }, "then": '$_id.gendername' },
                                        { "case": { "$eq": [ Number(params.languagecode), objConstants.hindilangcode ] }, "then": '$_id.gendernamehindi' },
                                        { "case": { "$eq": [ Number(params.languagecode), objConstants.tamillangcode ] }, "then": '$_id.gendernametamil' },
                                      ],
                                      "default": {}
                                    }
                                  },
                                "totalexperience": '$_id.totalexperience', "expyear": '$_id.expyear', "expmonth": '$_id.expmonth', "fresherstatus": '$_id.fresherstatus', "salarymin": '$_id.salarymin', "salarymax": '$_id.salarymax', "joiningdays": '$_id.joiningdays',
                                "jobfunctioncode": '$jobfunctioncode', 
                                //"jobfunctionname": {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.englishlangcode] }, '$jobfunctionname', {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.hindilangcode] }, '$jobfunctionnamehindi', '$jobfunctionnametamil']}]}, 
                                "jobfunctionname": {
                                    "$switch": {
                                      "branches": [
                                        { "case": { "$eq": [ Number(params.languagecode), objConstants.englishlangcode ] }, "then": '$jobfunctionname' },
                                        { "case": { "$eq": [ Number(params.languagecode), objConstants.hindilangcode ] }, "then": '$jobfunctionnamehindi' },
                                        { "case": { "$eq": [ Number(params.languagecode), objConstants.tamillangcode ] }, "then": '$jobfunctionnametamil' },
                                      ],
                                      "default": {}
                                    }
                                  },
                                "jobrolecode": '$jobrolecode', "jobrolename": {$cond: [{ "$eq": [Number(params.languagecode), objConstants.englishlangcode] }, '$jobrolename', {$cond: [{ "$eq": [Number(params.languagecode), objConstants.hindilangcode] }, '$jobrolenamehindi', '$jobrolenametamil']}]},
                                "locationcode": '$locationcode', "locationname": {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.englishlangcode] }, '$locationname', {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.hindilangcode] }, '$locationnamehindi', '$locationnametamil']}]}, "skillcode": '$skillcode', "skillname": {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.englishlangcode] }, '$skillname', {"$cond": [{ "$eq": [Number(params.languagecode), objConstants.hindilangcode] }, '$skillnamehindi', '$skillnametamil']}]},
                                "wishedstatus": '$_id.wishedstatus', "wishedremarks": '$_id.wishedremarks', "wisheddate": '$_id.wisheddate', "appliedstatus": '$_id.appliedstatus', "appliedshortliststatus": '$_id.appliedshortliststatus', "applieddate": '$_id.applieddate', "appliedshortlistdate": '$_id.appliedshortlistdate',
                                "invitedstatus": '$_id.invitedstatus', "invitedshortliststatus": '$_id.invitedshortliststatus', "inviteddate": '$_id.inviteddate', "invitedshortlistdate": '$_id.invitedshortlistdate',matchingpercentage:'$_id.matchingpercentage', 
                                "currentjobrolename": '$currentjobrolename', "lastlogindate": '$_id.lastlogindate', "appliedlastcalldate": '$_id.appliedlastcalldate', "invitedlastcalldate": "$_id.invitedlastcalldate"
                                // "currentjobrolename": {
                                //     $cond: [{ $and: [{ $ifNull: ['$skills', false] }, { $ifNull: ['$skills.currentjobfunction', false] }, { $eq: [{ $type: '$skills.currentjobfunction' }, 1], }] },
                                //     '$skills.jobrolecode', []
                                //     ]
                                // },
                            }
                        },
                        // skipCondition,
                        // limitCondition,
                       
                    ],{ allowDiskUse: true }).toArray(function (err, result) {
                        var tempemployeecode = [];
                        if (result == null && result.length == 0) {
                            finalresult = result;
                             return callback(finalresult);
                        }
                        else {
                        //    console.log("matchedresult.length", result.length);
                            for (var i = 0; i <= result.length - 1; i++) {
                                ////console.log("emp", matchedresult[i].employeecode);
                                tempemployeecode.push(result[i].employeecode);
                            }
                            ////console.log("emp", tempempcode);
                            var empmatchparams1 = { "$and": [{"employeecode": { $in: tempemployeecode } }, {"jobcode": Number(params.jobcode)}]};


                            dbo.collection(String(MongoDB.EmpJobPercentageCollectionName)).aggregate([
                                {$match: empmatchparams1},
                                {$project: {_id: 0, employeecode: '$employeecode', matchpercentage: '$matchpercentage'}}
                            ]).toArray(function (err, percentageresult) {
                                if (percentageresult != null && percentageresult.length > 0)
                                {
                                    result.forEach(element => {
                                        var empcode = element.employeecode;
                                        var percentage = percentageresult.filter(t=>t.employeecode==empcode);
                                        var percent = 0;
                                        if (percentage != null && percentage != undefined && percentage.length > 0)
                                        {
                                            //console.log(JSON.stringify(percentage));
                                            percent = percentage[0].matchpercentage;
                                        }
                                        element.matchingpercentage = percent;
                                    });
                                }
                                dbo.collection(String(MongoDB.EmployeeAppliedCollectionName)).aggregate([
                                    {$match: empmatchparams1},
                                    {$project: {employeecode: '$employeecode', statuscode: { $ifNull: ['$statuscode', 0] }, createddate: { $ifNull: ['$createddate', ''] }, updateddate: { $ifNull: ['$updateddate', ''] }, shortliststatus: { $ifNull: ['$shortliststatus', 0] }, lastcalldate: { $ifNull: ['$lastcalldate', ''] }}}
                                ]).toArray(function (err, appliedresult) {
                                    if (appliedresult != null && appliedresult.length > 0)
                                    {
                                        result.forEach(element => {
                                            var empcode = element.employeecode;
                                            var appliedres = appliedresult.filter(t=>t.employeecode==empcode);
                                            var appliedstatus = 0, appliedshortliststatus = 0, applieddate = '', appliedshortlistdate= '', appliedlastcalldate = '';
                                            if (appliedres != null && appliedres != undefined && appliedres.length > 0)
                                            {
                                                //console.log(JSON.stringify(percentage));
                                                appliedstatus = appliedres[0].statuscode;
                                                appliedshortliststatus = appliedres[0].shortliststatus;
                                                applieddate = appliedres[0].createddate;
                                                appliedshortlistdate = appliedres[0].updateddate;
                                                appliedlastcalldate = appliedres[0].lastcalldate;
                                            }
                                            element.appliedstatus = appliedstatus;
                                            element.appliedshortliststatus = appliedshortliststatus;
                                            element.applieddate = applieddate;
                                            element.appliedshortlistdate = appliedshortlistdate;
                                            element.appliedlastcalldate = appliedlastcalldate;
                                        });
                                    }


                                    dbo.collection(String(MongoDB.EmployeeInvitedCollectionName)).aggregate([
                                        {$match: empmatchparams1},
                                        {$project: {employeecode: '$employeecode', statuscode: { $ifNull: ['$statuscode', 0] }, createddate: { $ifNull: ['$createddate', ''] }, updateddate: { $ifNull: ['$updateddate', ''] }, shortliststatus: { $ifNull: ['$shortliststatus', 0] }, lastcalldate: { $ifNull: ['$lastcalldate', ''] }}}
                                    ]).toArray(function (err, invitedresult) {
                                        if (invitedresult != null && invitedresult.length > 0)
                                        {
                                            result.forEach(element => {
                                                var empcode = element.employeecode;
                                                var invitedres = invitedresult.filter(t=>t.employeecode==empcode);
                                                var invitedstatus = 0, invitedshortliststatus = 0, inviteddate = '', invitedshortlistdate= '', invitedlastcalldate = '';
                                                if (invitedres != null && invitedres != undefined && invitedres.length > 0)
                                                {
                                                    //console.log(JSON.stringify(percentage));
                                                    invitedstatus = invitedres[0].statuscode;
                                                    invitedshortliststatus = invitedres[0].shortliststatus;
                                                    inviteddate = invitedres[0].createddate;
                                                    invitedshortlistdate = invitedres[0].updateddate;
                                                    invitedlastcalldate = invitedres[0].lastcalldate;
                                                }
                                                element.invitedstatus = invitedstatus;
                                                element.invitedshortliststatus = invitedshortliststatus;
                                                element.inviteddate = inviteddate;
                                                element.invitedshortlistdate = invitedshortlistdate;
                                                element.invitedlastcalldate = invitedlastcalldate;
                                            });
                                        }

                                        dbo.collection(String(MongoDB.EmployerWishListCollectionName)).aggregate([
                                            {$match: empmatchparams1},
                                            {$project: {employeecode: '$employeecode', statuscode: { $ifNull: ['$statuscode', 0] }, remarks: { $ifNull: ['$remarks', ''] }, createddate: { $ifNull: ['$createddate', ''] }, updateddate: { $ifNull: ['$updateddate', ''] }, shortliststatus: { $ifNull: ['$shortliststatus', 0] }, lastcalldate: { $ifNull: ['$lastcalldate', ''] }}}
                                        ]).toArray(function (err, wishedresult) {

                                            if (wishedresult != null && wishedresult.length > 0)
                                            {
                                                result.forEach(element => {
                                                    var empcode = element.employeecode;
                                                    var wishedres = wishedresult.filter(t=>t.employeecode==empcode);
                                                    var wishedstatus = 0, wisheddate = '', wishedremarks = '';
                                                    if (wishedres != null && wishedres != undefined && wishedres.length > 0)
                                                    {
                                                        //console.log(JSON.stringify(percentage));
                                                        wishedstatus = wishedres[0].statuscode;
                                                        wisheddate = wishedres[0].createddate;
                                                        wishedremarks = wishedres[0].remarks;
                                                    }
                                                    element.wishedstatus = wishedstatus;
                                                    element.wisheddate = wisheddate;
                                                    element.wishedremarks = wishedremarks;
                                                });
                                            }
                                            setTimeout(() => {
                                                finalresult = result;
                                                return callback(finalresult);
                                              }, 2000);

                                        });

                                        
                                       
                                    });
                                  


                                });
                               

                            });
                        }            
                       
                    });
                }
                else {
                    var result = [];
                    return callback(result);
                }
            }
        });

    }
    catch (e) { logger.error("Error in Getting Profile List Function: " + e); }
}

function GetAllMatchedProfilesList(matchparams, params, listagefrom, sortbyparams, skipvalue, limitvalue, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        /* var date = new Date(); // some mock date
        var milliseconds = date.getTime(); */
        ////console.log("JoblistEntry",matchparams);
        var DefaultConditions = {};
        DefaultConditions = {
            $and: [
                { "personalinfo.dateofbirth": { $exists: true } }, { "personalinfo.dateofbirth": { $gt: 0 } },
                { "preferences.minsalary": { $exists: true } }, { "preferences.minsalary": { $gt: 0 } }
            ]
        }
        // console.log(JSON.stringify(matchparams))
        // console.log(JSON.stringify(DefaultConditions))
        var skipCondition = {};
        var limitCondition = {};
        if (limitvalue != null && limitvalue != 0 && limitvalue != undefined) {
            skipCondition = { $skip: parseInt(skipvalue) };
            limitCondition = { $limit: parseInt(limitvalue) }
        }
        // console.log(JSON.stringify(skipCondition))
        // console.log(JSON.stringify(limitCondition))
        // console.log(JSON.stringify(sortbyparams))
        //dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $unwind: "$personalinfo" },
            { $unwind: { path: '$skills', preserveNullAndEmptyArrays: true } },
            { $unwind: "$preferences" },
            { $unwind: { path: '$preferences.location', preserveNullAndEmptyArrays: true } },
            { $match: { $and: [matchparams, DefaultConditions] } },
            {
                $group:
                {
                    "_id": {
                        "employeecode": '$employeecode',
                        "totalexperience": '$totalexperience',
                        "joiningdays": '$joiningdays',
                        "lastlogindate": '$lastlogindate',
                        "salarymax": '$salarymax',
                    }
                }
            },
            { $sort: sortbyparams },
            { "$project": { _id: 0, employeecode: '$_id.employeecode' } }
        ]).toArray(function (err, matchedresult) {
            return callback(matchedresult);            
        });

    }
    catch (e) { logger.error("Error in Getting Profile List Function: " + e); }
}
exports.GetAllActiveJobs = function (matchparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        // dbo.collection(String(MongoDB.JobPostsCollectionName)).find({"$and": [{"statuscode": objConstants.approvedstatus}, {"employercode":Number(matchparams.employercode)}, {"validitydate": {$gte: milliseconds}}]}).count(function (err, activejobsresult) {
        // })
        dbo.collection(String(MongoDB.JobPostsCollectionName)).aggregate([
            { $match: { "$and": [{ "statuscode": objConstants.approvedstatus }, { "employercode": Number(matchparams.employercode) }, { "validitydate": { $gte: milliseconds } }] } },
        ]).toArray(function (err, activejobsresult) {
            if (activejobsresult == null && activejobsresult.length == 0) {
                var result = [];
                return callback(result);
            } else {
                let tempjobcode = [];
                for (var i = 0; i <= activejobsresult.length - 1; i++) {
                    tempjobcode.push(activejobsresult[i].jobcode);
                }
                return callback(tempjobcode);
            }
        })
        // dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
        //     { $unwind: "$personalinfo" },
        //     { $unwind: "$skills" },
        //     { $unwind: "$preferences" },
        //     { $unwind: "$preferences.location" },
        //     { $match: matchparams },
        //     { "$project": { _id: 0, employeecode: '$employeecode' } }
        // ]).toArray(function (err, matchedresult) {
        //     var tempempcode = [];
        //     ////console.log("matchedresult",matchedresult.length);
        //     if (matchedresult == null && matchedresult.length == 0) {
        //         var result = [];
        //         return callback(result);
        //     }
        //     else {
        //         for (var i = 0; i <= matchedresult.length - 1; i++) {
        //             ////console.log("emp", matchedresult[i].employeecode);
        //             if (tempempcode.indexOf(matchedresult[i].employeecode) < 0) {
        //                 tempempcode.push(matchedresult[i].employeecode);
        //             }

        //         }
        //         ////console.log("emp", tempempcode);
        //         //var empmatchparams = {"employeecode": { $in: tempempcode } };                  
        //         return callback(tempempcode);

        //     }
        // });
    }
    catch (e) { logger.error("Error in Getting All Employees: " + e); }
}
function GetAllEmployees(matchparams, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        /* var date = new Date(); // some mock date
        var milliseconds = date.getTime(); */
        ////console.log("JoblistEntry",matchparams);
        ////console.log(params);
        //dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $unwind: "$personalinfo" },
            { $unwind: "$skills" },
            { $unwind: "$preferences" },
            { $unwind: "$preferences.location" },
            { $match: matchparams },
            { "$project": { _id: 0, employeecode: '$employeecode' } }
        ]).toArray(function (err, matchedresult) {
            var tempempcode = [];
            ////console.log("matchedresult",matchedresult.length);
            if (matchedresult == null && matchedresult.length == 0) {
                var result = [];
                return callback(result);
            }
            else {
                for (var i = 0; i <= matchedresult.length - 1; i++) {
                    ////console.log("emp", matchedresult[i].employeecode);
                    if (tempempcode.indexOf(matchedresult[i].employeecode) < 0) {
                        tempempcode.push(matchedresult[i].employeecode);
                    }

                }
                ////console.log("emp", tempempcode);
                //var empmatchparams = {"employeecode": { $in: tempempcode } };                  
                return callback(tempempcode);

            }
        });

    }
    catch (e) { logger.error("Error in Getting All Employees: " + e); }
}
exports.getAllProfilesTotal = function (logparams, params, listparams, listcode, sortbycode, exptype, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var exp = [];
        var explist = [];
        var sortbyparams;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Profiles List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        ////console.log(sortbycode);

        if (sortbycode == 7)
            sortbyparams = { '_id.totalexperience': 1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 8)
            sortbyparams = { '_id.totalexperience': -1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 9)
            sortbyparams = { '_id.joiningdays': 1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 10)
            sortbyparams = { '_id.joiningdays': -1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 11)
            sortbyparams = { '_id.salarymax': 1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 12)
            sortbyparams = { '_id.salarymax': -1, '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 13)
            sortbyparams = { '_id.lastlogindate': -1, '_id.employeecode': -1 };
        else if (sortbycode == 14)
            sortbyparams = { '_id.lastlogindate': 1, '_id.employeecode': -1 };
        else if (sortbycode == 31)
            sortbyparams = { '_id.matchpercentage': -1, '_id.employeecode': -1 };
        else if (sortbycode == 32)
            sortbyparams = { '_id.matchpercentage': 1, '_id.employeecode': -1 };
        else
            sortbyparams = { '_id.lastlogindate': -1, '_id.totalexperience': -1, '_id.employeecode': -1 };
        ////console.log("e", exptype);
        explist = listparams.experiencecode;
        //console.log("job type", listparams.jobtypecode.includes(9));
        if (explist.length > 0) {
            // if (exptype == 0)
            // {
            //     if (explist[1] == 0)
            //     {
            //         exp.push({ "$and": [{}, {'totalexperience': {'$eq': explist[0]}}]});
            //     }
            //     else
            //     {
            //         ////console.log("Entry EXP");
            //         exp.push({ "$and": [{'totalexperience': {'$lte': explist[1]}}, {'totalexperience': {'$gte': explist[0]}}]});

            //     }
            // }
            // else {
            //     for (var i = 0; i <= explist.length - 1; i++) {
            //         if (i == 0) {
            //             exp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
            //         }
            //         else {
            //             var exp1 = [];
            //             exp1 = exp;
            //             var temp = [];
            //             temp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
            //             exp = exp1.concat(temp);
            //         }
            //     }
            // }
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    if (explist[i] == 0) {
                        exp.push({ "$and": [{}, { 'totalexperience': { '$eq': explist[i] } }] });
                    }
                    else {
                        exp.push({ "$and": [{}, { 'totalexperience': { '$gte': explist[i] } }] });
                    }
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    temp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i+1] } }, { 'totalexperience': { '$gte': explist[i] } }] });
                   // temp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i - 1] } }] });
                    exp = exp1.concat(temp);
                }
            }

        }
        else {
            exp = [{}];
        }
        // console.log('listparams.jobrolecode')
        // console.log(listparams.jobrolecode)
        ////console.log("ext", exp);
        var matchparams = "";

        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, jobtypecode = {}, schoolqualcode = {}, maritalcode = {}, gendercode = {};
        var afterschoolqualcode = {}, afterschoolspeccode = {}, afterschoolcatecode = {}, differentlyabledcode = {}, salaryfrom = {}, salaryto = {}, agefrom = {}, ageto = {}, searchcode = {};
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { $or: [{ 'skills.jobfunctioncode': { $in: listparams.jobfunctioncode } }, { 'preferences.jobfunction.jobfunctioncode': { $in: listparams.jobfunctioncode } }] };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { 'skills.jobrolecode': { $in: listparams.jobrolecode } };
        if (listparams.skillcode.length > 0 && listparams.skillcode[0] != 0)// Skill--
        {
            skillcode = { 'skills.skillcode': { $in: listparams.skillcode } };
        }

        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0 && listparams.jobtypecode.includes(9) == false)// JobType==
            jobtypecode = { $or: [{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } }, { 'preferences.employementtype.employementtypecode': 9 }] };
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
        {
            afterschoolqualcode = { 'afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
            schoolqualcode = {};
        }

        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
        {
            afterschoolspeccode = { 'afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
            schoolqualcode = {};
        }

        if (listparams.afterschoolcatecode != null && listparams.afterschoolcatecode.length > 0)// after school spec code==
        {
            afterschoolcatecode = { 'afterschooling.educationcategorycode': { $in: listparams.afterschoolcatecode } };
            schoolqualcode = {};
        }

        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'personalinfo.gender': { $in: listparams.gendercode } };
        if (listparams.differentlyabled != null && listparams.differentlyabled >= 0)
            differentlyabledcode = { 'personalinfo.differentlyabled': listparams.differentlyabled };
        if (listparams.salaryto != null && Number(listparams.salaryto) != 0)
            salaryfrom = { 'preferences.minsalary': { $lte: Number(listparams.salaryto) } };
        if (listparams.salaryfrom != null && Number(listparams.salaryfrom) != 0)
            salaryto = { 'preferences.maxsalary': { $gte: Number(listparams.salaryfrom) } };
        if (listparams.searchcode != null)
            searchcode = listparams.searchcode;
        //      //console.log(searchcode);
        // //console.log(listparams.salaryto);
        //  //console.log(listparams.salaryfrom );
        //  //console.log(jobfunctioncode);
        //  //console.log(jobrolecode);
        //  //console.log(locationcode);
        //  //console.log(skillcode);
        //  //console.log(jobtypecode);
        //  //console.log(schoolqualcode);
        //  //console.log(maritalcode);
        // //console.log(gendercode);
        //  //console.log(differentlyabledcode);
        // //console.log(salaryfrom);
        // //console.log(salaryto); 

        // //console.log(afterschoolqualcode);
        // //console.log(afterschoolspeccode);
        // //console.log(afterschoolcatecode);
        if (listparams.anyage == "true" || listparams.agefrom == 0 || listparams.ageto == 0) {
            agefrom = {};
            //ageto = {};
        }
        else {
            //agefrom = {$or:[{'agecriteria.isany':'true'}, {$and:[{'agecriteria.isany':'false'},{'agecriteria.from': {$lte: Number(listparams.ageto)}},{'agecriteria.to': {$gte: Number(listparams.agefrom)}}]}]};    
            //agefrom = {};
            //exp.push({ "$and": [{'totalexperience': {'$lte': explist[i]}}, {'totalexperience': {'$gte': explist[i]}}]});
            //var tempage =  "$divide" + ":" + [{"$subtract": [ milliseconds, "$personalinfo.dateofbirth" ] }, (365 * 24*60*60*1000)];
            //agefrom = {tempage: {$lte: Number(listparams.ageto)}};
            //agefrom = {'agecriteria.from': {$lte: Number(listparams.ageto)}};
            //ageto = {tempage: {$gte: Number(listparams.agefrom)}};
            agefrom = { $and: [{ "_id.age": { $lte: Number(listparams.ageto) } }, { "_id.age": { $gte: Number(listparams.agefrom) } }] };

        }
        ////console.log(agefrom);
        //console.log(skillcode);
        if (listcode == 1)// Common List
        {

            ////console.log("Entry");
            // matchparams = {
            //     $and: [{ 'statuscode': { $eq: objConstants.activestatus } },{ 'registervia': 2 },
            //     {
            //         $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
            //             { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
            //             { $and: [salaryfrom, salaryto] }]
            //     }]
            // };

            matchparams = {
                $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { 'registervia': 2 },
                {
                    $and: [jobfunctioncode, jobrolecode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
                        { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                        { $and: [salaryfrom, salaryto] }]
                }]
            };

            if (matchparams != "") {
                GetAllProfilesListTotal(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
        }
        else if (listcode == 2)// Shortlist
        {
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "jobcode": Number(params.jobcode), "shortliststatus": objConstants.shortlistedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, appliedresult) {
                dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                    { $match: { "jobcode": Number(params.jobcode), "shortliststatus": objConstants.shortlistedstatus } },
                    { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                    { "$project": { _id: 0, employeecode: '$employeecode' } }
                ]).toArray(function (err, invitedresult) {
                    var tempempcode = [];
                    if (appliedresult == null && invitedresult == null && appliedresult.length == 0 && invitedresult.length == 0) {

                    }
                    else {

                        if (invitedresult[0] != null && invitedresult[0].employeecode.length > 0) {
                            for (var i = 0; i <= invitedresult[0].employeecode.length - 1; i++) {
                                tempempcode.push(invitedresult[0].employeecode[i]);
                            }

                        }
                        if (appliedresult[0] != null && appliedresult[0].employeecode.length > 0) {
                            for (var i = 0; i <= appliedresult[0].employeecode.length - 1; i++) {
                                tempempcode.push(appliedresult[0].employeecode[i]);
                            }
                            //tempempcode = appliedresult[0].employeecode;
                        }
                        ////console.log("emp", tempempcode);
                        matchparams = {
                            $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { "employeecode": { $in: tempempcode } },
                                // {
                                //     $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                //         { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                                //         { $and: [salaryfrom, salaryto] }]
                                // }
                            ]
                        };
                        ////console.log(matchparams);
                        if (matchparams != "") {
                            GetAllProfilesListTotal(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                                ////console.log(jobresult);
                                return callback(jobresult);
                            });
                        }
                        else {
                            var result = [];
                            return callback(result);
                        }
                    }


                });
            });


        }
        else if (listcode == 3)// Applied
        {
            // //console.log("Applied");
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "jobcode": Number(params.jobcode), "statuscode": objConstants.appliedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, appliedresult) {
                ////console.log("A", appliedresult);
                var tempempcode = [];
                if (appliedresult == null && appliedresult.length == 0) {

                }
                else {


                    if (appliedresult[0] != null && appliedresult[0].employeecode.length > 0) {
                        for (var i = 0; i <= appliedresult[0].employeecode.length - 1; i++) {
                            tempempcode.push(appliedresult[0].employeecode[i]);
                        }
                        //tempempcode = appliedresult[0].employeecode;
                    }
                    ////console.log("emp", tempempcode);
                    matchparams = {
                        $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { "employeecode": { $in: tempempcode } }
                            // {
                            //     $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                            //         { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                            //         { $and: [salaryfrom, salaryto] }]
                            // }
                        ]
                    };
                    if (matchparams != "") {
                        GetAllProfilesListTotal(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }


                //});
            });


        }
        else if (listcode == 4)// Invited
        {

            dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                { $match: { "jobcode": Number(params.jobcode), "statuscode": objConstants.invitedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, invitedresult) {
                var tempempcode = [];
                ////console.log("invi", invitedresult);
                if (invitedresult == null && invitedresult.length == 0) {

                }
                else {

                    if (invitedresult[0] != null && invitedresult[0].employeecode.length > 0) {
                        for (var i = 0; i <= invitedresult[0].employeecode.length - 1; i++) {
                            tempempcode.push(invitedresult[0].employeecode[i]);
                        }

                    }

                    // //console.log("emp", tempempcode);
                    matchparams = {
                        $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { "employeecode": { $in: tempempcode } },
                            // {
                            //     $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                            //         { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                            //         { $and: [salaryfrom, salaryto] }]
                            // }
                        ]
                    };
                    // //console.log(matchparams);
                    if (matchparams != "") {
                        GetAllProfilesListTotal(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                            ////console.log(jobresult);
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }


            });
            //});


        }
        else if (listcode == 5)// wisheslist
        {

            dbo.collection(MongoDB.EmployerWishListCollectionName).aggregate([
                { $match: { "jobcode": Number(params.jobcode), "statuscode": objConstants.wishlistedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, wishresult) {
                var tempempcode = [];
                if (wishresult == null && wishresult.length == 0) {

                }
                else {

                    if (wishresult[0] != null && wishresult[0].employeecode.length > 0) {
                        for (var i = 0; i <= wishresult[0].employeecode.length - 1; i++) {
                            tempempcode.push(wishresult[0].employeecode[i]);
                        }

                    }

                    ////console.log("emp", tempempcode);
                    matchparams = {
                        $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { "employeecode": { $in: tempempcode } },
                        {
                            $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode,
                                { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                                { $and: [salaryfrom, salaryto] }]
                        }]
                    };
                    ////console.log(matchparams);
                    if (matchparams != "") {
                        GetAllProfilesListTotal(matchparams, params, agefrom, sortbyparams, listparams.skip, listparams.limit, function (jobresult) {
                            ////console.log(jobresult);
                            return callback(jobresult);
                        });
                    }
                    else {
                        var result = [];
                        return callback(result);
                    }
                }


            });
            //});


        }
        else if (listcode == 6)// For Notification
        {

            matchparams = {
                $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { 'registervia': 2 },
                {
                    $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
                        { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                        { $and: [salaryfrom, salaryto] }]
                }]
            };
            ////console.log(matchparams);
            if (matchparams != "") {
                ////console.log("Kavitha");
                GetAllEmployees(matchparams, function (jobresult) {
                    ////console.log(jobresult);

                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
            //});


        }
        else if (listcode == 7)// For Private Job Notification
        {

            matchparams = {
                $and: [{ 'statuscode': { $eq: objConstants.activestatus } }, { 'registervia': 2 },
                {
                    // $and: [jobfunctioncode, jobrolecode, skillcode, locationcode, jobtypecode, schoolqualcode, maritalcode, gendercode, differentlyabledcode, searchcode,
                    //     { $or: exp }, { $and: [afterschoolcatecode, afterschoolqualcode, afterschoolspeccode] },
                    //     { $and: [salaryfrom, salaryto] }]
                    // $and: [jobfunctioncode, jobrolecode, locationcode]
                    $and: [jobfunctioncode]
                }]
            };
            // console.log(JSON.stringify(jobfunctioncode));
            // console.log(JSON.stringify(jobrolecode));
            // console.log(JSON.stringify(locationcode));
            // console.log(JSON.stringify({ $or: exp }));
            // console.log(JSON.stringify({ $and: [salaryfrom, salaryto] }));

            if (matchparams != "") {
                ////console.log("Kavitha");
                GetAllEmployees(matchparams, function (jobresult) {
                    ////console.log(jobresult);

                    return callback(jobresult);
                });
            }
            else {
                var result = [];
                return callback(result);
            }
            //});


        }
        else if (listcode == 8)// Overall Invited
        {
            dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
                { $match: { "jobcode": { $in: listparams.activejobcode }, "statuscode": objConstants.invitedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, invitedresult) {
                // console.log('invitedresult');
                // console.log(invitedresult);
                if (invitedresult == null && invitedresult.length == 0) {
                    var result = [];
                    return callback(result);
                } else {
                    return callback(invitedresult);
                }
            });
        }
        else if (listcode == 9)// Overall Applied
        {
            dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
                { $match: { "jobcode": { $in: listparams.activejobcode }, "statuscode": objConstants.appliedstatus } },
                { $group: { "_id": { "jobcode": '$jobcode' }, "employeecode": { "$addToSet": '$employeecode' } } },
                { "$project": { _id: 0, employeecode: '$employeecode' } }
            ]).toArray(function (err, appliedresult) {
                // console.log('appliedresult');
                // console.log(appliedresult);
                if (appliedresult == null && appliedresult.length == 0) {
                    var result = [];
                    return callback(result);
                } else {
                    return callback(appliedresult);
                }
            });
        }
    }
    catch (e) { logger.error("Error in Getting Profile List: " + e); }
}
function GetAllProfilesListTotal(matchparams, params, listagefrom, sortbyparams, skipvalue, limitvalue, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        /* var date = new Date(); // some mock date
        var milliseconds = date.getTime(); */
        ////console.log("JoblistEntry",matchparams);
        if (params.employeecode == null || params.employeecode == undefined)
        {
            params.employeecode = [];
        }
       
        var DefaultConditions = {};
        DefaultConditions = {
            $and: [
                { "personalinfo.dateofbirth": { $exists: true } }, { "personalinfo.dateofbirth": { $gt: 0 } },
                { "preferences.minsalary": { $exists: true } }, { "preferences.minsalary": { $gt: 0 } },
                { "employeecode": {$nin : params.employeecode}}
            ]
        }
        // console.log(JSON.stringify(matchparams))
        // console.log(JSON.stringify(DefaultConditions))
        var TotalEmployeeCount = 0;
        var skipCondition = {};
        var limitCondition = {};
        if (limitvalue != null && limitvalue != 0 && limitvalue != undefined) {
            skipCondition = { $skip: parseInt(skipvalue) };
            limitCondition = { $limit: parseInt(limitvalue) }
        }
        // console.log(JSON.stringify(skipCondition))
        // console.log(JSON.stringify(limitCondition))
        // console.log(JSON.stringify(sortbyparams))
        //dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $unwind: "$personalinfo" },
            { $unwind: { path: '$skills', preserveNullAndEmptyArrays: true } },
            { $unwind: "$preferences" },
            { $unwind: { path: '$preferences.location', preserveNullAndEmptyArrays: true } },
            { $match: { $and: [matchparams, DefaultConditions] } },
            {
                $group:
                {
                    "_id": {
                        "employeecode": '$employeecode',
                        "totalexperience": '$totalexperience',
                        "joiningdays": '$joiningdays',
                        "lastlogindate": '$lastlogindate',
                        "salarymax": '$salarymax', "age": {
                            "$floor": {
                                "$divide": [
                                    { "$subtract": [milliseconds, "$personalinfo.dateofbirth"] },
                                    (365 * 24 * 60 * 60 * 1000)
                                ]
                            }
                        }
                    }
                }
            },
            { $match: listagefrom },
            { $sort: sortbyparams },
            { "$project": { _id: 0, employeecode: '$_id.employeecode' } },
            // { $skip: parseInt(0) },
            // limitCondition,
        ]).toArray(function (err, TotalEmployeeList) {
            //console.log(TotalEmployeeList)
            if (TotalEmployeeList == null && TotalEmployeeList.length == 0) {
                var result = [];
                return callback(TotalEmployeeCount);
            }
            if (TotalEmployeeList && TotalEmployeeList != null) {
                TotalEmployeeCount = TotalEmployeeList.length;
                return callback(TotalEmployeeCount);
            }
        });
    }
    catch (e) { logger.error("Error in Getting Profile List Function: " + e); }
}


function GetAllProfilesList_backup(matchparams, params, listagefrom, sortbyparams, skipvalue, limitvalue, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        /* var date = new Date(); // some mock date
        var milliseconds = date.getTime(); */
        ////console.log("JoblistEntry",matchparams);
        var DefaultConditions = {};
        DefaultConditions = {
            $and: [
                { "personalinfo.dateofbirth": { $exists: true } }, { "personalinfo.dateofbirth": { $gt: 0 } },
                { "preferences.minsalary": { $exists: true } }, { "preferences.minsalary": { $gt: 0 } }
            ]
        }
        // console.log(JSON.stringify(matchparams))
        // console.log(JSON.stringify(DefaultConditions))
        var skipCondition = {};
        var limitCondition = {};
        if (limitvalue != null && limitvalue != 0 && limitvalue != undefined) {
            skipCondition = { $skip: parseInt(skipvalue) };
            limitCondition = { $limit: parseInt(limitvalue) }
        }
        // console.log(JSON.stringify(skipCondition))
        // console.log(JSON.stringify(limitCondition))
        // console.log(JSON.stringify(sortbyparams))
        //dbo.collection(MongoDB.JobPostsCollectionName).aggregate([
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $unwind: "$personalinfo" },
            { $unwind: { path: '$skills', preserveNullAndEmptyArrays: true } },
            { $unwind: "$preferences" },
            { $unwind: { path: '$preferences.location', preserveNullAndEmptyArrays: true } },
            { $match: { $and: [matchparams, DefaultConditions] } },
            {
                $group:
                {
                    "_id": {
                        "employeecode": '$employeecode',
                        "totalexperience": '$totalexperience',
                        "joiningdays": '$joiningdays',
                        "lastlogindate": '$lastlogindate',
                        "salarymax": '$salarymax',
                    }
                }
            },
            { $sort: sortbyparams },
            { "$project": { _id: 0, employeecode: '$_id.employeecode' } },
            { $skip: parseInt(0) },
            limitCondition,
        ]).toArray(function (err, matchedresult) {
            var tempempcode = [];
            if (matchedresult == null && matchedresult.length == 0) {
                var result = [];
                return callback(result);
            }
            else {
                for (var i = 0; i <= matchedresult.length - 1; i++) {
                    ////console.log("emp", matchedresult[i].employeecode);
                    tempempcode.push(matchedresult[i].employeecode);
                }
                ////console.log("emp", tempempcode);
                var empmatchparams = { "employeecode": { $in: tempempcode } };

                if (empmatchparams != "") {
                    ////console.log(empmatchparams);
                    dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
                        { $unwind: "$personalinfo" },
                        { $unwind: "$contactinfo" },
                        { $unwind: { path: '$skills', preserveNullAndEmptyArrays: true } },
                        { $unwind: "$preferences" },
                        { $unwind: { path: '$preferences.location', preserveNullAndEmptyArrays: true } },
                        { $match: empmatchparams },
                        {
                            "$lookup":
                            {
                                "from": String(MongoDB.GenderCollectionName),
                                "localField": "personalinfo.gender",
                                "foreignField": "gendercode",
                                "as": "genderinfo"
                            }
                        },
                        {
                            "$lookup":
                            {
                                "from": String(MongoDB.JobFunctionCollectionName),
                                "localField": "skills.jobfunctioncode",
                                "foreignField": "jobfunctioncode",
                                "as": "jobfunctioninfo"
                            }
                        },
                        {
                            "$lookup":
                            {
                                "from": String(MongoDB.JobRoleCollectionName),
                                "localField": "skills.jobrolecode",
                                "foreignField": "jobrolecode",
                                "as": "jobroleinfo"
                            }
                        },
                        {
                            "$lookup":
                            {
                                "from": String(MongoDB.DistrictCollectionName),
                                "localField": "preferences.location.locationcode",
                                "foreignField": "districtcode",
                                "as": "locationinfo"
                            }
                        }, {
                            "$lookup":
                            {
                                "from": String(MongoDB.SkillCollectionName),
                                "localField": "skills.skillcode",
                                "foreignField": "skillcode",
                                "as": "skillinfo"
                            }
                        },
                        {
                            "$lookup":
                            {
                                "from": String(MongoDB.EmployeeAppliedCollectionName),
                                "localField": "employeecode",
                                "foreignField": "employeecode",
                                "as": "appliedinfo"
                            }
                        },
                        {
                            "$addFields": {
                                "appliedinfo": {
                                    "$filter": {
                                        "input": "$appliedinfo",
                                        "as": "applyinfo",
                                        "cond": {
                                            "$eq": ["$$applyinfo.jobcode", Number(params.jobcode)]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "$lookup":
                            {
                                "from": String(MongoDB.EmployeeInvitedCollectionName),
                                "localField": "employeecode",
                                "foreignField": "employeecode",
                                "as": "invitedinfo"
                            }
                        },
                        {
                            "$addFields": {
                                "invitedinfo": {
                                    "$filter": {
                                        "input": "$invitedinfo",
                                        "as": "inviteinfo",
                                        "cond": {
                                            "$eq": ["$$inviteinfo.jobcode", Number(params.jobcode)]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "$lookup":
                            {
                                "from": String(MongoDB.EmployerWishListCollectionName),
                                "localField": "employeecode",
                                "foreignField": "employeecode",
                                "as": "wishedinfo"
                            }
                        },
                        {
                            "$addFields": {
                                "wishedinfo": {
                                    "$filter": {
                                        "input": "$wishedinfo",
                                        "as": "wishinfo",
                                        "cond": {
                                            "$eq": ["$$wishinfo.jobcode", Number(params.jobcode)]
                                        }
                                    }
                                }
                            }
                        },
                        // {
                        //     "$lookup":
                        //     {
                        //         "from": String(MongoDB.EmpJobPercentageCollectionName),
                        //         "localField": "employeecode",
                        //         "foreignField": "employeecode",
                        //         "as": "percentagelistinfo"
                        //     }
                        // },
                        // {
                        //     "$addFields": {
                        //         "percentagelistinfo": {
                        //             "$filter": {
                        //                 "input": "$percentagelistinfo",
                        //                 "as": "percentageinfo",
                        //                 "cond": {
                        //                     "$eq": ["$$percentageinfo.jobcode", Number(params.jobcode)]
                        //                 }
                        //             }
                        //         }
                        //     }
                        // },
                        {
                            "$lookup":
                            {
                              "from": String(MongoDB.EmpJobPercentageCollectionName),
                              "let": { "employeecode": "$employeecode", "jobcode": Number(params.jobcode) },
                              "pipeline": [
                                {
                                  $match: {
                                    "$expr": {
                                      "$and": [{ $eq: ["$employeecode", "$$employeecode"] },
                                      { $eq: ["$jobcode", "$$jobcode"] }, { $eq: ["$jobcode", Number(params.jobcode)] }
                                      ]
                                    }
                                  }
                                }
                              ],
                              "as": "percentagelistinfo"
                            }
                        },
                        // { $unwind: "$genderinfo" },
                        // { $unwind: "$genderinfo.gender" },
                        // { $match: { "genderinfo.gender.languagecode": Number(params.languagecode) } },
                        { $unwind: { path: '$genderinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$genderinfo.gender', preserveNullAndEmptyArrays: true } },
                        { $match: { $or: [{ "genderinfo.gender.languagecode": { $exists: false } }, { "genderinfo.gender.languagecode": "" }, { "genderinfo.gender.languagecode": Number(params.languagecode) }] } },
                        // { $unwind: "$jobfunctioninfo" },
                        // { $unwind: "$jobfunctioninfo.jobfunction" },
                        // { $match: { "jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) } },
                        { $unwind: { path: '$jobfunctioninfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$jobfunctioninfo.jobfunction', preserveNullAndEmptyArrays: true } },
                        { $match: { $or: [{ "jobfunctioninfo.jobfunction.languagecode": { $exists: false } }, { "jobfunctioninfo.jobfunction.languagecode": "" }, { "jobfunctioninfo.jobfunction.languagecode": Number(params.languagecode) }] } },
                        // { $unwind: "$jobroleinfo" },
                        // { $unwind: "$jobroleinfo.jobrole" },
                        // { $match: { "jobroleinfo.jobrole.languagecode": Number(params.languagecode) } },
                        { $unwind: { path: '$jobroleinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$jobroleinfo.jobrole', preserveNullAndEmptyArrays: true } },
                        { $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(params.languagecode) }] } },
                        // { $unwind: "$locationinfo" },
                        // { $unwind: "$locationinfo.district" },
                        // { $match: { "locationinfo.district.languagecode": Number(params.languagecode) } },
                        { $unwind: { path: '$locationinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$locationinfo.district', preserveNullAndEmptyArrays: true } },
                        { $match: { $or: [{ "locationinfo.district.languagecode": { $exists: false } }, { "locationinfo.district.languagecode": "" }, { "locationinfo.district.languagecode": Number(params.languagecode) }] } },
                        // { $unwind: "$skillinfo" },
                        // { $unwind: "$skillinfo.skill" },
                        // { $match: { "skillinfo.skill.languagecode": Number(params.languagecode) } },
                        { $unwind: { path: '$skillinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$skillinfo.skill', preserveNullAndEmptyArrays: true } },
                        { $match: { $or: [{ "skillinfo.skill.languagecode": { $exists: false } }, { "skillinfo.skill.languagecode": "" }, { "skillinfo.skill.languagecode": Number(params.languagecode) }] } },
                        { $unwind: { path: '$appliedinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$wishedinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$invitedinfo', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$percentagelistinfo', preserveNullAndEmptyArrays: true } },
                        {
                            $group:
                            {
                                "_id": {
                                    "mobileno": '$contactinfo.mobileno',
                                    "lastlogindate": "$lastlogindate",
                                    "employeecode": '$employeecode', "employeename": '$employeename', "imageurl": '$imageurl', "dateofbirth": '$personalinfo.dateofbirth', "gendercode": '$personalinfo.gender',
                                    "gendername": '$genderinfo.gender.gendername', "totalexperience": '$totalexperience', "expyear": '$expyear', "expmonth": '$expmonth', "fresherstatus": '$fresherstatus', "salarymin": '$preferences.minsalary', "joiningdays": { $ifNull: ['$preferences.joiningdays', 0] },
                                    "salarymax": '$preferences.maxsalary', "age": {
                                        "$floor": {
                                            "$divide": [
                                                { "$subtract": [milliseconds, "$personalinfo.dateofbirth"] },
                                                (365 * 24 * 60 * 60 * 1000)
                                            ]
                                        }
                                    }, "wishedstatus": { $ifNull: ['$wishedinfo.statuscode', 0] }, "invitedstatus": { $ifNull: ['$invitedinfo.statuscode', 0] }, "invitedshortliststatus": { $ifNull: ['$invitedinfo.shortliststatus', 0] },
                                    "appliedstatus": { $ifNull: ['$appliedinfo.statuscode', 0] }, "appliedshortliststatus": { $ifNull: ['$appliedinfo.shortliststatus', 0] },
                                    "inviteddate": { $ifNull: ['$invitedinfo.createddate', ''] }, "wisheddate": { $ifNull: ['$wishedinfo.createddate', ''] }, "invitedshortlistdate": { $ifNull: ['$invitedinfo.updateddate', ''] },
                                    "applieddate": { $ifNull: ['$appliedinfo.createddate', ''] }, "appliedshortlistdate": { $ifNull: ['$appliedinfo.updateddate', ''] },"matchingpercentage": { $ifNull: ['$percentagelistinfo.matchpercentage', 0] }
                                },
                                "jobfunctioncode": { $addToSet: "$skills.jobfunctioncode" }, "jobfunctionname": { $addToSet: "$jobfunctioninfo.jobfunction.jobfunctionname" },
                                "jobrolecode": { $addToSet: "$skills.jobrolecode" }, "jobrolename": { $addToSet: "$jobroleinfo.jobrole.jobrolename" },
                                "locationcode": { $addToSet: "$preferences.location.locationcode" }, "locationname": { $addToSet: "$locationinfo.district.districtname" },
                                "skillcode": { $addToSet: "$skills.skillcode" }, "skillname": { $addToSet: "$skillinfo.skill.skillname" },
                                // "currentjobrolename": { $addToSet: "$skills.currentjobfunction" },

                                "currentjobrolename": {
                                    "$push": {
                                        // "$cond":[
                                        //     {"$eq":["$skills.currentjobfunction", 1]},
                                        //     { "jobrolename":"$jobroleinfo.jobrole.jobrolename"},
                                        //     {
                                        //         "jobrolename":""
                                        //     }
                                        // ]
                                        "$cond": [
                                            { "$eq": ["$skills.currentjobfunction", 1] },
                                            "$jobroleinfo.jobrole.jobrolename",
                                            ""
                                        ]
                                    }
                                },

                            }
                        },
                        { $match: listagefrom },
                        { $sort: sortbyparams },

                        {
                            $project:
                            {
                                "mobileno": '$_id.mobileno',
                                "_id": 0, "employeecode": '$_id.employeecode', "employeename": '$_id.employeename', "imageurl": '$_id.imageurl', "dateofbirth": '$_id.dateofbirth', "age": '$_id.age', "gendercode": '$_id.gendercode',
                                "gendername": '$_id.gendername', "totalexperience": '$_id.totalexperience', "expyear": '$_id.expyear', "expmonth": '$_id.expmonth', "fresherstatus": '$_id.fresherstatus', "salarymin": '$_id.salarymin', "salarymax": '$_id.salarymax', "joiningdays": '$_id.joiningdays',
                                "jobfunctioncode": '$jobfunctioncode', "jobfunctionname": '$jobfunctionname', "jobrolecode": '$jobrolecode', "jobrolename": '$jobrolename',
                                "locationcode": '$locationcode', "locationname": '$locationname', "skillcode": '$skillcode', "skillname": '$skillname',
                                "wishedstatus": '$_id.wishedstatus', "wisheddate": '$_id.wisheddate', "appliedstatus": '$_id.appliedstatus', "appliedshortliststatus": '$_id.appliedshortliststatus', "applieddate": '$_id.applieddate', "appliedshortlistdate": '$_id.appliedshortlistdate',
                                "invitedstatus": '$_id.invitedstatus', "invitedshortliststatus": '$_id.invitedshortliststatus', "inviteddate": '$_id.inviteddate', "invitedshortlistdate": '$_id.invitedshortlistdate',matchingpercentage:'$_id.matchingpercentage', 
                                "currentjobrolename": '$currentjobrolename', "lastlogindate": '$_id.lastlogindate',
                                // "currentjobrolename": {
                                //     $cond: [{ $and: [{ $ifNull: ['$skills', false] }, { $ifNull: ['$skills.currentjobfunction', false] }, { $eq: [{ $type: '$skills.currentjobfunction' }, 1], }] },
                                //     '$skills.jobrolecode', []
                                //     ]
                                // },
                            }
                        },
                        skipCondition,
                        limitCondition,
                    ]).toArray(function (err, result) {
                        finalresult = result;
                        ////console.log("school");
                        ////console.log("FR", result);
                        return callback(finalresult);
                    });
                }
                else {
                    var result = [];
                    return callback(result);
                }
            }
        });

    }
    catch (e) { logger.error("Error in Getting Profile List Function: " + e); }
}



exports.getwishlistemployees = function (logparams, params, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var exp = [];
        var explist = [];
        var sortbyparams;
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Profiles List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        
        //var matchparams = {jobcode: Number(params.jobcode), statuscode: objConstants.wishlistedstatus};
        var matchparams = {"$and": [{jobcode: Number(params.jobcode)}, { $or: [{statuscode: objConstants.wishlistedstatus}, {statuscode: objConstants.repostrejectedstatus}]}]}
        dbo.collection(String(MongoDB.EmployerWishListCollectionName)).aggregate([
            {$match: matchparams},
            {$project: {employeecode: '$employeecode', _id: 0}}
        ]).toArray(function (err, wishedresult) {
            
            var finalresult = [];
            for (var i = 0; i <= wishedresult.length - 1; i++) {
                ////console.log("emp", matchedresult[i].employeecode);
                finalresult.push(wishedresult[i].employeecode);

            }
           // console.log(finalresult);
           return callback(finalresult);

        });
       
    }
    catch (e) { logger.error("Error in Getting Profile List: " + e); }
}