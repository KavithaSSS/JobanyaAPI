'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objConstants = require('../../config/constants');
var dblogcollectionname = MongoDB.LogCollectionName;
const objRecommendedJobList = require('../process/employee_recommended_process_controller')
const objJobList = require('../process/employee_job_list_process_controller');

exports.ShortListInvitedList = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in InvitedShortList : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {};

        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = [];

        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { 'employeeinfo.lastlogindate': { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { 'employeeinfo.lastlogindate': { $gte: milliseconds } };
            ////console.log(activedays);
        }
        var empshortlistparam;
        var employercode = {},datefilter = {};
        if (listparams.employercode.length > 0){
            employercode = { "employercode": { $in: listparams.employercode } };
        }
        if (listparams.fromdate != 0 && listparams.todate != 0) {
            datefilter = { $and: [{"shortliststatus": objConstants.shortlistedstatus}, { "updateddate": { $gte: listparams.fromdate } }, { "updateddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        else{
            datefilter = {"shortliststatus": objConstants.shortlistedstatus};
        }
        empshortlistparam = {$and: [employercode,datefilter]};
        ////console.log(empshortlistparam);
        if (listparams.searchbymobileno != "") {
            searchbymobileno = {$or:[{ 'employeeinfo.mobileno': listparams.searchbymobileno },{ 'employeeinfo.contactinfo.altmobileno': listparams.searchbymobileno }]};
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'employeeinfo.employeename': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        if (explist.length > 0) {
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    exp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
                    // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    ////console.log(exp);
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    temp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //temp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    // //console.log(temp);
                    exp = exp1.concat(temp);
                    ////console.log(exp);
                }
            }
        }
        else {
            exp = [{}];
        }
        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { 'employeeinfo.skills.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { 'employeeinfo.skills.jobrolecode': { $in: listparams.jobrolecode } };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'employeeinfo.skills.skillcode': { $in: listparams.skillcode } };
        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'employeeinfo.preferences.location.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0)// JobType==
            jobtypecode = {$or:[{ 'preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } },{ 'preferences.employementtype.employementtypecode': 9}]};
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'employeeinfo.schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'employeeinfo.afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'employeeinfo.afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'employeeinfo.personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'employeeinfo.personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'employeeinfo.personalinfo.differentlyabled': listparams.differentlyabled };
        if (Number(listparams.statuscode) == 0) { var condition = { "employeeinfo.statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { 'employeeinfo.statuscode': Number(listparams.statuscode) }; }
        var employercode = {};
        if (listparams.employercode.length > 0){
            employercode = { "employerinfo.employercode": { $in: listparams.employercode } };
        }
        var matchparams = {
            $and: [locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays, activedays, { $or: exp }, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
       /* var matchparams = {
            $and: [locationcode,jobfunctioncode, jobrolecode,skillcode, schoolqualcode, jobtypecode,gendercode, differentlyabledcode,
                maritalcode]
        };*/
        
        
        dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
            { $match: empshortlistparam },
            {
                $lookup: {
                    from: String(MongoDB.JobPostsCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'jobinfo'
                }
            },
            { $unwind: "$jobinfo" },
           
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: "$employerinfo" },
            {
                $lookup: {
                    from: String(MongoDB.EmployeeCollectionName),
                    localField: 'employeecode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: "$employeeinfo" },
            { $match: matchparams },
            {
                $project: {
                    _id: 0, employeeinfo: 1,employerinfo: 1,jobinfo: 1, inviteddate: "$createddate", invitedshortlistdate: "$updateddate"
                }
            },
            {$sort:{"employeeinfo.createddate":-1}}//,
            //{$skip:parseInt(listparams.skipvalue)},
            //{$limit:parseInt(listparams.limitvalue)}
        ]).toArray(function (err, result) {
                ////console.log(result);
                return callback(result);
            });
    }
    catch (e) {
        logger.error("Error in InvitedShortList - report " + e);
    }
}
exports.ShortListAppliedList = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in AppliedShortList : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {};

        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = [];

        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { 'employeeinfo.lastlogindate': { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { 'employeeinfo.lastlogindate': { $gte: milliseconds } };
            ////console.log(activedays);
        }
        var empshortlistparam;
        var employercode = {},datefilter = {};
        if (listparams.employercode.length > 0){
            employercode = { "employercode": { $in: listparams.employercode } };
        }
        //console.log(Number(listparams.fromdate));
        //console.log(listparams.fromdate);
        if (listparams.fromdate != 0 && listparams.todate != 0) {
            datefilter = { $and: [{"shortliststatus": objConstants.shortlistedstatus}, { "updateddate": { $gte: listparams.fromdate } }, { "updateddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        else{
            datefilter = {"shortliststatus": objConstants.shortlistedstatus};
        }
        empshortlistparam = {$and: [employercode,datefilter]};
        if (listparams.searchbymobileno != "") {
            searchbymobileno = {$or:[{ 'employeeinfo.mobileno': listparams.searchbymobileno },{ 'employeeinfo.contactinfo.altmobileno': listparams.searchbymobileno }]};
            
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'employeeinfo.employeename': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        if (explist.length > 0) {
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    exp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
                    // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    ////console.log(exp);
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    temp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //temp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    // //console.log(temp);
                    exp = exp1.concat(temp);
                    ////console.log(exp);
                }
            }
        }
        else {
            exp = [{}];
        }
        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { 'employeeinfo.skills.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { 'employeeinfo.skills.jobrolecode': { $in: listparams.jobrolecode } };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'employeeinfo.skills.skillcode': { $in: listparams.skillcode } };
        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'employeeinfo.preferences.location.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0)// JobType==
            //jobtypecode = { 'employeeinfo.preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } };
            jobtypecode = {$or:[{ 'employeeinfo.preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } },{ 'employeeinfo.preferences.employementtype.employementtypecode': 9}]};
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'employeeinfo.schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'employeeinfo.afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'employeeinfo.afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'employeeinfo.personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'employeeinfo.personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'employeeinfo.personalinfo.differentlyabled': listparams.differentlyabled };
        if (Number(listparams.statuscode) == 0) { var condition = { "employeeinfo.statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { 'employeeinfo.statuscode': Number(listparams.statuscode) }; }
        var matchparams = {
            $and: [locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays, activedays, { $or: exp }, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
        
        dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
            { $match: empshortlistparam },
            {
                $lookup: {
                    from: String(MongoDB.JobPostsCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'jobinfo'
                }
            },
            { $unwind: "$jobinfo" },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: "$employerinfo" },
            {
                $lookup: {
                    from: String(MongoDB.EmployeeCollectionName),
                    localField: 'employeecode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: "$employeeinfo" },
            { $match: matchparams },
            {
                $project: {
                    _id: 0, employeeinfo: 1, employerinfo: 1, jobinfo: 1, applieddate: "$createddate", appliedshortlistdate: "$updateddate"
                }
            },
            {$sort:{"employeeinfo.createddate":-1}}//,
            //{$skip:parseInt(listparams.skipvalue)},
            //{$limit:parseInt(listparams.limitvalue)}
        ]).toArray(function (err, result) {
                ////console.log(result);
                return callback(result);
            });
    }
    catch (e) {
        logger.error("Error in AppliedShortList - report " + e);
    }
}


exports.AppliedList = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in AppliedShortList : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {};

        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = [];
        var sortbycode = req.query.sortbycode;
        var sortbyparams;

        if (sortbycode == 7 || sortbycode == 19)
        sortbyparams = { 'employeeinfo.totalexperience': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 8 || sortbycode == 20)
        sortbyparams = { 'employeeinfo.totalexperience': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 9 || sortbycode == 21)
        sortbyparams = { 'employeeinfo.preferences.joiningdays': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 10 || sortbycode == 22)
        sortbyparams = { 'employeeinfo.preferences.joiningdays': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 11 || sortbycode == 23)
        sortbyparams = { 'employeeinfo.preferences.maxsalary': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 12 || sortbycode == 24)
        sortbyparams = { 'employeeinfo.preferences.maxsalary': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 13 || sortbycode == 25)
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 14 || sortbycode == 26)
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 27)
        sortbyparams = { 'employeeinfo.personalinfo.createddate': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 28)
        sortbyparams = { 'employeeinfo.personalinfo.createddate': -1, 'employeeinfo.employeecode': -1 };
    else
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': -1, 'employeeinfo.totalexperience': -1, 'employeeinfo.employeecode': -1 };
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { 'employeeinfo.lastlogindate': { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { 'employeeinfo.lastlogindate': { $gte: milliseconds } };
            ////console.log(activedays);
        }
        var empshortlistparam;
        var employercode = {},datefilter = {};
        if (listparams.employercode.length > 0){
            employercode = { "employercode": { $in: listparams.employercode } };
        }
        //console.log(Number(listparams.fromdate));
        //console.log(listparams.fromdate);
        if (listparams.fromdate != 0 && listparams.todate != 0) {
            datefilter = { $and: [ { "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        else{
            datefilter = {};
        }
        empshortlistparam = {$and: [employercode,datefilter]};
        if (listparams.searchbymobileno != "") {
            searchbymobileno = {$or:[{ 'employeeinfo.contactinfo.mobileno': listparams.searchbymobileno },{ 'employeeinfo.contactinfo.altmobileno': listparams.searchbymobileno }]};
            
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'employeeinfo.personalinfo.employeefullname': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        if (explist.length > 0) {
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    exp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
                    // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    ////console.log(exp);
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    temp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //temp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    // //console.log(temp);
                    exp = exp1.concat(temp);
                    ////console.log(exp);
                }
            }
        }
        else {
            exp = [{}];
        }
        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { 'employeeinfo.skilllist.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { 'employeeinfo.skilllist.jobrolecode': { $in: listparams.jobrolecode } };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'employeeinfo.skilllist.skillcode': { $in: listparams.skillcode } };
        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'employeeinfo.preferences.locationlist.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0)// JobType==
            //jobtypecode = { 'employeeinfo.preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } };
            jobtypecode = {$or:[{ 'employeeinfo.preferences.emptypelist.employementtypecode': { $in: listparams.jobtypecode } },{ 'employeeinfo.preferences.employementtype.employementtypecode': 9}]};
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'employeeinfo.schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'employeeinfo.afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'employeeinfo.afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'employeeinfo.personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'employeeinfo.personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'employeeinfo.personalinfo.differentlyabled': listparams.differentlyabled };
        if (Number(listparams.statuscode) == 0) { var condition = { "employeeinfo.statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { 'employeeinfo.statuscode': Number(listparams.statuscode) }; }
        var matchparams = {
            $and: [locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays, activedays, { $or: exp }, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
        //console.log(JSON.stringify(empshortlistparam, null, " "));

        dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
            { $match: empshortlistparam },
            {
                $lookup: {
                    from: String(MongoDB.JobPostsCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'jobinfo'
                }
            },
            { $unwind: "$jobinfo" },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: "$employerinfo" },
            {
                "$lookup":
                {
                  "from": String(MongoDB.EmpJobPercentageCollectionName),
                  "let": { "employeecode": "$employeecode", "jobcode": "$jobcode" },
                  "pipeline": [
                    {
                      $match: {
                        "$expr": {
                          "$and": [{ $eq: ["$employeecode", "$$employeecode"] },
                          { $eq: ["$jobcode", "$$jobcode"] }
                          ]
                        }
                      }
                    }
                  ],
                  "as": "percentagelistinfo"
                }
            },
            { $unwind: { path: '$percentagelistinfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: String(MongoDB.EmployeeProfileViewCollectionName),
                    localField: 'employeecode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: "$employeeinfo" },
            { $match: matchparams },
            {
                $project: {
                    _id: 0, employeeinfo: 1, employerinfo: 1, jobinfo: 1, applieddate: "$createddate", appliedshortlistdate: "$updateddate","matchingpercentage": { $ifNull: ['$percentagelistinfo.matchpercentage', 0] }
                }
            },
            {$sort:sortbyparams},//,
            {$skip:parseInt(listparams.skipvalue)},
            {$limit:parseInt(listparams.limitvalue)}
        ]).toArray(function (err, result) {
                ////console.log(result);
                
                return callback(result);
            });
    }
    catch (e) {
        logger.error("Error in AppliedShortList - report " + e);
    }
}


exports.InvitedList = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in InvitedShortList : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {};

        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = [];
        var sortbycode = req.query.sortbycode;
        var sortbyparams;

        if (sortbycode == 7 || sortbycode == 19)
        sortbyparams = { 'employeeinfo.totalexperience': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 8 || sortbycode == 20)
        sortbyparams = { 'employeeinfo.totalexperience': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 9 || sortbycode == 21)
        sortbyparams = { 'employeeinfo.preferences.joiningdays': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 10 || sortbycode == 22)
        sortbyparams = { 'employeeinfo.preferences.joiningdays': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 11 || sortbycode == 23)
        sortbyparams = { 'employeeinfo.preferences.maxsalary': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 12 || sortbycode == 24)
        sortbyparams = { 'employeeinfo.preferences.maxsalary': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 13 || sortbycode == 25)
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 14 || sortbycode == 26)
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 27)
        sortbyparams = { 'employeeinfo.personalinfo.createddate': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 28)
        sortbyparams = { 'employeeinfo.personalinfo.createddate': -1, 'employeeinfo.employeecode': -1 };
    else
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': -1, 'employeeinfo.totalexperience': -1, 'employeeinfo.employeecode': -1 };
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { 'employeeinfo.personalinfo.lastlogindate': { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { 'employeeinfo.personalinfo.lastlogindate': { $gte: milliseconds } };
            ////console.log(activedays);
        }
        var empshortlistparam;
        var employercode = {},datefilter = {};
        if (listparams.employercode.length > 0){
            employercode = { "employercode": { $in: listparams.employercode } };
        }
        if (listparams.fromdate != 0 && listparams.todate != 0) {
            datefilter = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        else{
            datefilter = {};
        }
        empshortlistparam = {$and: [employercode,datefilter]};
        ////console.log(empshortlistparam);
        if (listparams.searchbymobileno != "") {
            searchbymobileno = {$or:[{ 'employeeinfo.contactinfo.mobileno': listparams.searchbymobileno },{ 'employeeinfo.contactinfo.altmobileno': listparams.searchbymobileno }]};
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'employeeinfo.personalinfo.employeefullname': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        if (explist.length > 0) {
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    exp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
                    // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    ////console.log(exp);
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    temp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //temp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    // //console.log(temp);
                    exp = exp1.concat(temp);
                    ////console.log(exp);
                }
            }
        }
        else {
            exp = [{}];
        }
        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
       // console.log(listparams.jobrolecode)
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { 'employeeinfo.skilllist.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { 'employeeinfo.skilllist.jobrolecode': { $in: listparams.jobrolecode } };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'employeeinfo.skilllist.skillcode': { $in: listparams.skillcode } };
        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'employeeinfo.preferences.locationlist.locationcode': { $in: listparams.locationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0)// JobType==
            //jobtypecode = { 'employeeinfo.preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } };
            jobtypecode = {$or:[{ 'employeeinfo.preferences.emptypelist.employementtypecode': { $in: listparams.jobtypecode } },{ 'employeeinfo.preferences.employementtype.employementtypecode': 9}]};
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'employeeinfo.schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'employeeinfo.afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'employeeinfo.afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'employeeinfo.personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'employeeinfo.personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'employeeinfo.personalinfo.differentlyabled': listparams.differentlyabled };
        if (Number(listparams.statuscode) == 0) { var condition = { "employeeinfo.statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { 'employeeinfo.statuscode': Number(listparams.statuscode) }; }
        var employercode = {};
        if (listparams.employercode.length > 0){
            employercode = { "employerinfo.employercode": { $in: listparams.employercode } };
        }
        var matchparams = {
            $and: [locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays, activedays, { $or: exp }, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
       /* var matchparams = {
            $and: [locationcode,jobfunctioncode, jobrolecode,skillcode, schoolqualcode, jobtypecode,gendercode, differentlyabledcode,
                maritalcode]
        };*/
        
       // console.log(matchparams)
        console.log(JSON.stringify(matchparams, null, 2))
        dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
            { $match: empshortlistparam },
            {
                $lookup: {
                    from: String(MongoDB.JobPostsCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'jobinfo'
                }
            },
            { $unwind: "$jobinfo" },
           
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: "$employerinfo" },
            {
                $lookup: {
                    from: String(MongoDB.EmployeeProfileViewCollectionName),
                    localField: 'employeecode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: "$employeeinfo" },
            {
                "$lookup":
                {
                  "from": String(MongoDB.EmpJobPercentageCollectionName),
                  "let": { "employeecode": "$employeecode", "jobcode": "$jobcode" },
                  "pipeline": [
                    {
                      $match: {
                        "$expr": {
                          "$and": [{ $eq: ["$employeecode", "$$employeecode"] },
                          { $eq: ["$jobcode", "$$jobcode"] }
                          ]
                        }
                      }
                    }
                  ],
                  "as": "percentagelistinfo"
                }
            },
            { $unwind: { path: '$percentagelistinfo', preserveNullAndEmptyArrays: true } },
            { $match: matchparams },
            {
                $project: {
                    _id: 0, employeeinfo: 1,employerinfo: 1,jobinfo: 1, inviteddate: "$createddate", invitedshortlistdate: "$updateddate","matchingpercentage": { $ifNull: ['$percentagelistinfo.matchpercentage', 0] }
                }
            },
            {$sort:sortbyparams}//,
            //{$skip:parseInt(listparams.skipvalue)},
            //{$limit:parseInt(listparams.limitvalue)}
        ]).toArray(function (err, result) {
                ////console.log(result);
                return callback(result);
            });
    }
    catch (e) {
        logger.error("Error in InvitedShortList - report " + e);
    }
}



exports.AppliedListExcel = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in AppliedShortList : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {};

        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = [];
        var sortbycode = req.query.sortbycode;
        var sortbyparams;

        if (sortbycode == 7 || sortbycode == 19)
        sortbyparams = { 'employeeinfo.totalexperience': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 8 || sortbycode == 20)
        sortbyparams = { 'employeeinfo.totalexperience': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 9 || sortbycode == 21)
        sortbyparams = { 'employeeinfo.preferences.joiningdays': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 10 || sortbycode == 22)
        sortbyparams = { 'employeeinfo.preferences.joiningdays': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 11 || sortbycode == 23)
        sortbyparams = { 'employeeinfo.preferences.maxsalary': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 12 || sortbycode == 24)
        sortbyparams = { 'employeeinfo.preferences.maxsalary': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 13 || sortbycode == 25)
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 14 || sortbycode == 26)
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 27)
        sortbyparams = { 'employeeinfo.personalinfo.createddate': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 28)
        sortbyparams = { 'employeeinfo.personalinfo.createddate': -1, 'employeeinfo.employeecode': -1 };
    else
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': -1, 'employeeinfo.totalexperience': -1, 'employeeinfo.employeecode': -1 };
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { 'employeeinfo.personalinfo.lastlogindate': { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { 'employeeinfo.personalinfo.lastlogindate': { $gte: milliseconds } };
            ////console.log(activedays);
        }
        var empshortlistparam;
        var employercode = {},datefilter = {};
        if (listparams.employercode.length > 0){
            employercode = { "employercode": { $in: listparams.employercode } };
        }
        if (listparams.fromdate != 0 && listparams.todate != 0) {
            datefilter = { $and: [ { "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        else{
            datefilter = {};
        }
        empshortlistparam = {$and: [employercode,datefilter]};
        ////console.log(empshortlistparam);
        if (listparams.searchbymobileno != "") {
            searchbymobileno = {$or:[{ 'employeeinfo.contactinfo.mobileno': listparams.searchbymobileno },{ 'employeeinfo.contactinfo.altmobileno': listparams.searchbymobileno }]};
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'employeeinfo.personalinfo.employeefullname': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        if (explist.length > 0) {
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    exp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
                    // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    ////console.log(exp);
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    temp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //temp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    // //console.log(temp);
                    exp = exp1.concat(temp);
                    ////console.log(exp);
                }
            }
        }
        else {
            exp = [{}];
        }
        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
        if (listparams.jobfunctioncode.length > 0)// job function==
        jobfunctioncode = { 'employeeinfo.skilllist.jobfunctioncode': { $in: listparams.jobfunctioncode } };
    if (listparams.jobrolecode.length > 0)// job Role==
        jobrolecode = { 'employeeinfo.skilllist.jobrolecode': { $in: listparams.jobrolecode } };
    if (listparams.skillcode.length > 0)// Skill--
        skillcode = { 'employeeinfo.skilllist.skillcode': { $in: listparams.skillcode } };
    if (listparams.locationcode.length > 0)// Location--
        locationcode = { 'employeeinfo.preferences.locationlist.locationcode': { $in: listparams.locationcode } };
    //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
    if (listparams.jobtypecode.length > 0)// JobType==
        //jobtypecode = { 'employeeinfo.preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } };
        jobtypecode = {$or:[{ 'employeeinfo.preferences.emptypelist.employementtypecode': { $in: listparams.jobtypecode } },{ 'employeeinfo.preferences.employementtype.employementtypecode': 9}]};
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'employeeinfo.schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'employeeinfo.afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'employeeinfo.afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'employeeinfo.personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'employeeinfo.personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'employeeinfo.personalinfo.differentlyabled': listparams.differentlyabled };
        if (Number(listparams.statuscode) == 0) { var condition = { "employeeinfo.statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { 'employeeinfo.statuscode': Number(listparams.statuscode) }; }
        var matchparams = {
            $and: [locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays, activedays, { $or: exp }, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
        //console.log(JSON.stringify(empshortlistparam, null, " "));

        dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
            { $match: empshortlistparam },
            {
                $lookup: {
                    from: String(MongoDB.JobPostsCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'jobinfo'
                }
            },
            { $unwind: "$jobinfo" },
            { $unwind: "$jobinfo.contactdetails" },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: "$employerinfo" },
            {
                $lookup: {
                    from: String(MongoDB.JobRoleCollectionName),
                    localField: 'jobinfo.jobrolecode',
                    foreignField: 'jobrolecode',
                    as: 'jobroleinfo'
                }
            },
            { $unwind: "$jobroleinfo" },
            { $unwind: "$jobroleinfo.jobrole" },
            { $match:  { "jobroleinfo.jobrole.languagecode": objConstants.defaultlanguagecode } },
            {
                $lookup: {
                    from: String(MongoDB.EmployeeProfileViewCollectionName),
                    localField: 'employeecode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: "$employeeinfo" },
            { $unwind: "$employeeinfo.contactinfo" },
			{ $unwind: "$employeeinfo.personalinfo" },
            {
				"$addFields": {
					"createddate": {
					"$toDate": "$createddate"
					}
				}
			},
			{
				"$addFields": {
					"updateddate": {
					"$toDate": "$updateddate"
					}
				}
			},
            
            { $match: matchparams },
            {
                $project: {
                    _id: 0, companyname: '$employerinfo.registeredname', jobid: '$jobinfo.jobid', jobpost: '$jobroleinfo.jobrole.jobrolename', contactdetails: {$concat: ["$jobinfo.contactdetails.contactperson", " - ", "$jobinfo.contactdetails.designation", " - ", "$jobinfo.contactdetails.emailid", " - ", "$jobinfo.contactdetails.mobileno"]}, employeename: '$employeeinfo.personalinfo.employeefullname', 
					mobileno: '$employeeinfo.contactinfo.mobileno',applieddate: { $dateToString: { format: "%d-%m-%Y %H:%M", date: "$createddate" } }, 
					shortliststatus: '$shortliststatus', appliedshortlistdate: { $dateToString: { format: "%d-%m-%Y %H:%M", date: "$updateddate" } }
                }
            },
            {$sort:sortbyparams}//,
            //{$replaceAll: {input: "$jobinfo.contactdetails.address", find: "\n", replacement: ", "}}
            //{$skip:parseInt(listparams.skipvalue)},
            //{$limit:parseInt(listparams.limitvalue)}
        ]).toArray(function (err, result) {
                ////console.log(result);
                return callback(result);
            });
    }
    catch (e) {
        logger.error("Error in AppliedShortList - report " + e);
    }
}


exports.InvitedListExcel = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in InvitedShortList : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {};

        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = [];
        var sortbycode = req.query.sortbycode;
        var sortbyparams;

        if (sortbycode == 7 || sortbycode == 19)
        sortbyparams = { 'employeeinfo.totalexperience': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 8 || sortbycode == 20)
        sortbyparams = { 'employeeinfo.totalexperience': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 9 || sortbycode == 21)
        sortbyparams = { 'employeeinfo.preferences.joiningdays': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 10 || sortbycode == 22)
        sortbyparams = { 'employeeinfo.preferences.joiningdays': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 11 || sortbycode == 23)
        sortbyparams = { 'employeeinfo.preferences.maxsalary': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 12 || sortbycode == 24)
        sortbyparams = { 'employeeinfo.preferences.maxsalary': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 13 || sortbycode == 25)
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': -1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 14 || sortbycode == 26)
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 27)
        sortbyparams = { 'employeeinfo.personalinfo.createddate': 1, 'employeeinfo.employeecode': -1 };
    else if (sortbycode == 28)
        sortbyparams = { 'employeeinfo.personalinfo.createddate': -1, 'employeeinfo.employeecode': -1 };
    else
        sortbyparams = { 'employeeinfo.personalinfo.lastlogindate': -1, 'employeeinfo.totalexperience': -1, 'employeeinfo.employeecode': -1 };
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { 'employeeinfo.personalinfo.lastlogindate': { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { 'employeeinfo.personalinfo.lastlogindate': { $gte: milliseconds } };
            ////console.log(activedays);
        }
        var empshortlistparam;
        var employercode = {},datefilter = {};
        if (listparams.employercode.length > 0){
            employercode = { "employercode": { $in: listparams.employercode } };
        }
        if (listparams.fromdate != 0 && listparams.todate != 0) {
            datefilter = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        else{
            datefilter = {};
        }
        empshortlistparam = {$and: [employercode,datefilter]};
        ////console.log(empshortlistparam);
        if (listparams.searchbymobileno != "") {
            searchbymobileno = {$or:[{ 'employeeinfo.contactinfo.mobileno': listparams.searchbymobileno },{ 'employeeinfo.contactinfo.altmobileno': listparams.searchbymobileno }]};
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'employeeinfo.personalinfo.employeefullname': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        if (explist.length > 0) {
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    exp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
                    // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    ////console.log(exp);
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    temp.push({ "$and": [{ 'employeeinfo.totalexperience': { '$lte': explist[i] } }, { 'employeeinfo.totalexperience': { '$gte': explist[i] } }] });
                    //temp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    // //console.log(temp);
                    exp = exp1.concat(temp);
                    ////console.log(exp);
                }
            }
        }
        else {
            exp = [{}];
        }
        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
        if (listparams.jobfunctioncode.length > 0)// job function==
        jobfunctioncode = { 'employeeinfo.skilllist.jobfunctioncode': { $in: listparams.jobfunctioncode } };
    if (listparams.jobrolecode.length > 0)// job Role==
        jobrolecode = { 'employeeinfo.skilllist.jobrolecode': { $in: listparams.jobrolecode } };
    if (listparams.skillcode.length > 0)// Skill--
        skillcode = { 'employeeinfo.skilllist.skillcode': { $in: listparams.skillcode } };
    if (listparams.locationcode.length > 0)// Location--
        locationcode = { 'employeeinfo.preferences.locationlist.locationcode': { $in: listparams.locationcode } };
    //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
    if (listparams.jobtypecode.length > 0)// JobType==
        //jobtypecode = { 'employeeinfo.preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } };
        jobtypecode = {$or:[{ 'employeeinfo.preferences.emptypelist.employementtypecode': { $in: listparams.jobtypecode } },{ 'employeeinfo.preferences.employementtype.employementtypecode': 9}]};
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'employeeinfo.schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'employeeinfo.afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'employeeinfo.afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'employeeinfo.personalinfo.maritalstatus': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'employeeinfo.personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'employeeinfo.personalinfo.differentlyabled': listparams.differentlyabled };
        if (Number(listparams.statuscode) == 0) { var condition = { "employeeinfo.statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { 'employeeinfo.statuscode': Number(listparams.statuscode) }; }
        var employercode = {};
        if (listparams.employercode.length > 0){
            employercode = { "employerinfo.employercode": { $in: listparams.employercode } };
        }
        var matchparams = {
            $and: [locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays, activedays, { $or: exp }, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
       /* var matchparams = {
            $and: [locationcode,jobfunctioncode, jobrolecode,skillcode, schoolqualcode, jobtypecode,gendercode, differentlyabledcode,
                maritalcode]
        };*/
        
        
        dbo.collection(MongoDB.EmployeeInvitedCollectionName).aggregate([
            { $match: empshortlistparam },
            {
                $lookup: {
                    from: String(MongoDB.JobPostsCollectionName),
                    localField: 'jobcode',
                    foreignField: 'jobcode',
                    as: 'jobinfo'
                }
            },
            { $unwind: "$jobinfo" },
            { $unwind: "$jobinfo.contactdetails" },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'employercode',
                    foreignField: 'employercode',
                    as: 'employerinfo'
                }
            },
            { $unwind: "$employerinfo" },
            {
                $lookup: {
                    from: String(MongoDB.JobRoleCollectionName),
                    localField: 'jobinfo.jobrolecode',
                    foreignField: 'jobrolecode',
                    as: 'jobroleinfo'
                }
            },
            { $unwind: "$jobroleinfo" },
            { $unwind: "$jobroleinfo.jobrole" },
            { $match:  { "jobroleinfo.jobrole.languagecode": objConstants.defaultlanguagecode } },
            {
                $lookup: {
                    from: String(MongoDB.EmployeeProfileViewCollectionName),
                    localField: 'employeecode',
                    foreignField: 'employeecode',
                    as: 'employeeinfo'
                }
            },
            { $unwind: "$employeeinfo" },
            { $unwind: "$employeeinfo.contactinfo" },
			{ $unwind: "$employeeinfo.personalinfo" },
            {
				"$addFields": {
					"createddate": {
					"$toDate": "$createddate"
					}
				}
			},
			{
				"$addFields": {
					"updateddate": {
					"$toDate": "$updateddate"
					}
				}
			},
            { $match: matchparams },
            {
                $project: {
                    _id: 0, companyname: '$employerinfo.registeredname', jobid: '$jobinfo.jobid', jobpost: '$jobroleinfo.jobrole.jobrolename', contactdetails: {$concat: ["$jobinfo.contactdetails.contactperson", " - ", "$jobinfo.contactdetails.designation", " - ", "$jobinfo.contactdetails.emailid", " - ", "$jobinfo.contactdetails.mobileno"]}, employeename: '$employeeinfo.personalinfo.employeefullname', 
					mobileno: '$employeeinfo.contactinfo.mobileno',inviteddate: { $dateToString: { format: "%d-%m-%Y %H:%M", date: "$createddate" } }, 
					shortliststatus: '$shortliststatus', invitedshortlistdate: { $dateToString: { format: "%d-%m-%Y %H:%M", date: "$updateddate" } }
                }
            },
            {$sort:sortbyparams}//,
            //{$skip:parseInt(listparams.skipvalue)},
            //{$limit:parseInt(listparams.limitvalue)}
        ]).toArray(function (err, result) {
                ////console.log(result);
                return callback(result);
            });
    }
    catch (e) {
        logger.error("Error in InvitedShortList - report " + e);
    }
}



exports.GetRecommendedJobCount = function (logparams, empresult, callback) {
    try {
        //console.log("EntryLevel1")
        fnRecommendedcount(logparams, empresult, function (err, employeecount) {
           // console.log("EntryLevel1.1")
            if (err) {
                return;
            }
            return callback(employeecount);
        });
    }
    catch (e) { logger.error("Error in UpdateMatchingPercentage" + e); }
}



var async = require('async');
function fnRecommendedcount(logparams, empresult, callback) {
    try {
        //console.log("EntryLevel2")
        var returnval = [];
        var empjson = {};
        var iteratorFcn = function (employeecode, done) {
            if (employeecode == null) {
                done();
                return;
            }

            exports.getRecommendedCount(logparams, employeecode, function (response) {
            //   console.log(response);
                returnval = returnval.concat(response)
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(empresult, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in UpdateMatchingPercentageToEmployee" + e); }
}

exports.getRecommendedCount = function (logparams, employeecode, callback) {
    var empparams = { "languagecode": objConstants.englishlangcode, "sortbyparams": { '_id.approveddate': -1, '_id.jobcode': -1 }, "employeecode": employeecode, "skip": 0, "limit": 25, "type": 6 };
    objRecommendedJobList.getAllProfileConditions(logparams, empparams, function (profileresult) {
        //listparams = {"industrycode": req.body.industrycode, "jobfunctioncode": req.body.jobfunctioncode, "skillcode":req.body.skillcode, "locationcode":req.body.locationcode, "jobtypecode":req.body.jobtypecode,"schoolqualcode":req.body.schoolqualcode, "afterschoolqualcode":req.body.afterschoolqualcode, "afterschoolspeccode":req.body.afterschoolspeccode, "experiencecode":req.body.experiencecode, "employertypecode":req.body.employertypecode, "companytypecode":req.body.companytypecode, "maritalcode":req.body.maritalcode, "gendercode":req.body.gendercode, "differentlyabled": req.body.differentlyabled, "salaryfrom": req.body.salaryfrom, "salaryto": req.body.salaryto, "agefrom": req.body.agefrom, "ageto": req.body.ageto, "anyage": req.body.anyage};
        // console.log(profileresult.jobrolecode);
        ///// NOTE : SKILL BASED FILTER WAS REMOVED AS PER REQUIREMENT
        var isanystate = 'true'
        var isanydistrict = profileresult.isanydistrict != null ? profileresult.isanydistrict : 'false'
        var isanytaluk = 'true'
        // listparams = {
        //   "industrycode": profileresult.industrycode, "jobrolecode": [], "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": isanydistrict == 'true' ? [] : profileresult.locationcode, "jobtypecode": profileresult.jobtypecode, "schoolqualcode": profileresult.schoolqualcode, "afterschoolcatecode": profileresult.afterschoolcatecode, "afterschoolqualcode": profileresult.afterschoolqualcode, "afterschoolspeccode": profileresult.afterschoolspeccode, "experiencecode": profileresult.experiencecode, "employertypecode": profileresult.employertypecode, "companytypecode": profileresult.companytypecode, "maritalcode": profileresult.maritalcode, "gendercode": profileresult.gendercode, "differentlyabled": profileresult.differentlyabled, "salaryfrom": profileresult.salaryfrom, "salaryto": profileresult.salaryto, "agefrom": profileresult.agefrom, "ageto": profileresult.ageto, "anyage": "false",
        //   "anydegree": "true", "anyqualification": "true", "anyspec": "true"
        // };
       var listparams = {
          "industrycode": [], "jobrolecode": profileresult.jobrolecode, "jobfunctioncode": profileresult.jobfunctioncode, "skillcode": [], "locationcode": [], "jobtypecode": [], "schoolqualcode": [], "afterschoolcatecode": [], "afterschoolqualcode": [], "afterschoolspeccode": [], "experiencecode": [], "employertypecode": [], "companytypecode": [], "maritalcode": [], "gendercode": profileresult.gendercode, "differentlyabled": [], "salaryfrom": 0, "salaryto": 0, "agefrom": 0, "ageto": 0, "anyage": "true",
          "anydegree": "true", "anyqualification": "true", "anyspec": "true"
        };
        objJobList.getAllJobListTotal(logparams, empparams, listparams, 13, function (joblisttotal) {
            var empjson = {
                "employeecode": employeecode,
                "jobcount": joblisttotal
            }
            var finalresult = [];
            finalresult.push(empjson)
            return callback(finalresult);
        });
      });
   

    logger.info("Log in Employee Profile View on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    //onsole.log(emptypeparams);

}


exports.NotAppliedList = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in AppliedShortList : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var jobfunctioncode = {}, jobrolecode = {}, skillcode = {}, locationcode = {}, schoolqualcode = {}, afterschoolqualcode = {}, afterschoolspeccode = {};
        var maritalcode = {}, gendercode = {}, jobtypecode = {}, searchbyname = {}, searchbymobileno = {}, differentlyabledcode = {}, inactivedays = {}, activedays = {};

        var listparams = req.body;
        var explist = listparams.experiencecode;
        var exp = [];
        var sortbycode = req.query.sortbycode;
        var sortbyparams;

        if (sortbycode == 7 || sortbycode == 19)
        sortbyparams = { 'totalexperience': 1, 'employeecode': -1 };
    else if (sortbycode == 8 || sortbycode == 20)
        sortbyparams = { 'totalexperience': -1, 'employeecode': -1 };
    else if (sortbycode == 9 || sortbycode == 21)
        sortbyparams = { 'preferences.joiningdays': 1, 'employeecode': -1 };
    else if (sortbycode == 10 || sortbycode == 22)
        sortbyparams = { 'preferences.joiningdays': -1, 'employeecode': -1 };
    else if (sortbycode == 11 || sortbycode == 23)
        sortbyparams = { 'preferences.maxsalary': 1, 'employeecode': -1 };
    else if (sortbycode == 12 || sortbycode == 24)
        sortbyparams = { 'preferences.maxsalary': -1, 'employeecode': -1 };
    else if (sortbycode == 13 || sortbycode == 25)
        sortbyparams = { 'personalinfo.lastlogindate': -1, 'employeecode': -1 };
    else if (sortbycode == 14 || sortbycode == 26)
        sortbyparams = { 'personalinfo.lastlogindate': 1, 'employeecode': -1 };
    else if (sortbycode == 27)
        sortbyparams = { 'personalinfo.createddate': 1, 'employeecode': -1 };
    else if (sortbycode == 28)
        sortbyparams = { 'personalinfo.createddate': -1, 'employeecode': -1 };
    else
        sortbyparams = { 'personalinfo.lastlogindate': -1, 'totalexperience': -1, 'employeecode': -1 };
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { 'personalinfo.lastlogindate': { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { 'personalinfo.lastlogindate': { $gte: milliseconds } };
            ////console.log(activedays);
        }
        var empshortlistparam;
        var empshortlistparam1, datefilter1;
        var employercode = {},datefilter = {};
        if (listparams.employercode.length > 0){
            employercode = { "employercode": { $in: listparams.employercode } };
        }
        //console.log(Number(listparams.fromdate));
        //console.log(listparams.fromdate);
        if (listparams.fromdate != 0 && listparams.todate != 0) {
            datefilter = { $and: [ { "personalinfo.createddate": { $gte: listparams.fromdate } }, { "personalinfo.createddate": { $lte: listparams.todate } }] }
            datefilter1 = { $and: [ { "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        else{
            datefilter = {};
        }
        empshortlistparam = {$and: [employercode,datefilter]};
        empshortlistparam1 = {$and: [employercode,datefilter1]};
        if (listparams.searchbymobileno != "") {
            searchbymobileno = {$or:[{ 'contactinfo.mobileno': listparams.searchbymobileno },{ 'contactinfo.altmobileno': listparams.searchbymobileno }]};
            
        }
        if (listparams.searchbyname != "") {
            //searchbyname = {$or: [{'employeename': {$regex: "/^" + listparams.searchbyname + "/"}  }, {'employeename': '/.*' + listparams.searchbyname + '.*/'}]};
            //var regex = new RegExp("^" + listparams.searchbyname, "i");
            //searchbyname = {'employeename': {$regex: '.*' + listparams.searchbyname + '.*'}  };
            //searchbyname = {'employeename': {$regex:".*"+listparams.searchbyname+"$",$options:'i'} };
            searchbyname = { 'personalinfo.employeefullname': { $regex: ".*" + listparams.searchbyname + ".*", $options: 'i' } };
        }
        // //console.log(searchbyname);
        // //console.log(searchbymobileno);
        if (explist.length > 0) {
            for (var i = 0; i <= explist.length - 1; i++) {
                if (i == 0) {
                    exp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
                    //exp.push({ "$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]});
                    // exp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    ////console.log(exp);
                }
                else {
                    var exp1 = [];
                    exp1 = exp;
                    var temp = [];
                    temp.push({ "$and": [{ 'totalexperience': { '$lte': explist[i] } }, { 'totalexperience': { '$gte': explist[i] } }] });
                    //temp.push({ "$or": [{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to':0}]},{"$and": [{'experience.from': {'$lte': explist[i]}}, {'experience.to': {'$gte': explist[i]}}]}]});
                    // //console.log(temp);
                    exp = exp1.concat(temp);
                    ////console.log(exp);
                }
            }
        }
        else {
            exp = [{}];
        }
        /* if (req.body.inactivedays != null) {
            date.setDate(date.getDate() - req.body.inactivedays);
            var milliseconds = date.getTime();
        }
        else {
            var inactivedays = 0;
            date.setDate(date.getDate() - inactivedays);
            var milliseconds = date.getTime();
        } */
        if (listparams.jobfunctioncode.length > 0)// job function==
            jobfunctioncode = { 'skilllist.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.jobrolecode.length > 0)// job Role==
            jobrolecode = { 'skilllist.jobrolecode': { $in: listparams.jobrolecode } };
        if (listparams.skillcode.length > 0)// Skill--
            skillcode = { 'skilllist.skillcode': { $in: listparams.skillcode } };
        if (listparams.locationcode.length > 0)// Location--
            locationcode = { 'preferences.locationlist.locationcode': { $in: listparams.locationcode } };
        if (listparams.preferedlocationcode.length > 0)// Location--
            locationcode = { 'preferences.locationlist.locationcode': { $in: listparams.preferedlocationcode } };
        //locationcode = {$or:[{'preferredlocation.isany':'true'}, {$and:[{'preferredlocation.isany':'false'},{'preferredlocation.locationlist.locationcode': {$in: listparams.locationcode}}]}]};
        if (listparams.jobtypecode.length > 0)// JobType==
            //jobtypecode = { 'employeeinfo.preferences.employementtype.employementtypecode': { $in: listparams.jobtypecode } };
            jobtypecode = {$or:[{ 'preferences.emptypelist.employementtypecode': { $in: listparams.jobtypecode } },{ 'preferences.employementtype.employementtypecode': 9}]};
        if (listparams.schoolqualcode.length > 0)// school qual code==
            schoolqualcode = { 'schooling.qualificationcode': { $in: listparams.schoolqualcode } };
        if (listparams.afterschoolqualcode.length > 0)// after school qual code==
            afterschoolqualcode = { 'afterschooling.qualificationcode': { $in: listparams.afterschoolqualcode } };
        if (listparams.afterschoolspeccode.length > 0)// after school spec code==
            afterschoolspeccode = { 'afterschooling.specializationcode': { $in: listparams.afterschoolspeccode } };
        if (listparams.maritalcode.length > 0)// marital code
            //maritalcode = {$or:[{'maritalstatus.isany':'true'}, {$and:[{'maritalstatus.isany':'false'},{'maritalstatus.maritallist.maritalcode': {$in: listparams.maritalcode}}]}]};
            maritalcode = { 'personalinfo.maritalstatuscode': { $in: listparams.maritalcode } };
        if (listparams.gendercode.length > 0)// gender code
            //gendercode = {$or:[{'gender.isany':'true'}, {$and:[{'gender.isany':'false'},{'gender.genderlist.gendercode': {$in: listparams.gendercode}}]}]};    
            gendercode = { 'personalinfo.gender': { $in: listparams.gendercode } };
        // //console.log(listparams.differentlyabled )
        if (listparams.differentlyabled >= 0)
            differentlyabledcode = { 'personalinfo.differentlyabled': listparams.differentlyabled };
        if (Number(listparams.statuscode) == 0) { var condition = { "employeeinfo.statuscode": { $ne: objConstants.deletestatus } }; }
        else { var condition = { 'statuscode': Number(listparams.statuscode) }; }
        var matchparams = {
            $and: [locationcode, jobfunctioncode, jobrolecode, skillcode, schoolqualcode, jobtypecode, gendercode, differentlyabledcode,
                maritalcode, condition, searchbymobileno, searchbyname, inactivedays, activedays, { $or: exp }, { $and: [afterschoolqualcode, afterschoolspeccode] }]
        };
        //console.log(JSON.stringify(empshortlistparam, null, " "));

        dbo.collection(MongoDB.EmployeeAppliedCollectionName).aggregate([
            { $match: empshortlistparam1 },
            {
                $project: {
                    _id: 0, employeecode: 1
                }
            },
            {$sort:sortbyparams}//,
            //{$skip:parseInt(listparams.skipvalue)},
            //{$limit:parseInt(listparams.limitvalue)}
        ]).toArray(function (err, appliedres) {
                ////console.log(result);
                var empcode = [];
                for(var i = 0; i< appliedres.length; i++){
                    empcode.push(appliedres[i].employeecode)
                }
                var empcodeparams = { "employeecode": {$nin: empcode}}
                empshortlistparam = {$and: [employercode,datefilter, empcodeparams]};
                dbo.collection(MongoDB.EmployeeProfileViewCollectionName).aggregate([
                    { $match: empshortlistparam },
                    { $match: matchparams },
                    {
                        $lookup: {
                            from: String(MongoDB.EmployerCollectionName),
                            localField: 'skilllist.jobrolecode',
                            foreignField: 'preferences.jobrole.jobrolecode',
                            as: 'employerinfo'
                        }
                    },
                    {
                        $project: {
                            _id: 0, employeecode: 1, personalinfo: 1, contactinfo: 1, experience: 1, preferences: 1, skilllist: 1, employercount : { $size: '$employerinfo' }
                        }
                    },
                    {$sort:sortbyparams}//,
                    //{$skip:parseInt(listparams.skipvalue)},
                    //{$limit:parseInt(listparams.limitvalue)}
                ]).toArray(function (err, result) {
                    return callback(result);
                });
               
            });
    }
    catch (e) {
        logger.error("Error in AppliedShortList - report " + e);
    }
}

exports.NotAppliedListDetails = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in AppliedShortList : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        
        //console.log(JSON.stringify(empshortlistparam, null, " "));

        dbo.collection(MongoDB.EmployeeProfileViewCollectionName).aggregate([
            { $match: {"employeecode": Number(req.query.employeecode)} },
            {
                $lookup: {
                    from: String(MongoDB.EmployerCollectionName),
                    localField: 'skilllist.jobrolecode',
                    foreignField: 'preferences.jobrole.jobrolecode',
                    as: 'employerinfo'
                }
            },
            { $unwind: "$employerinfo" },
            { $unwind: "$employerinfo.preferences" },
            { $unwind: "$employerinfo.preferences.jobrole" },
            {
                $lookup: {
                    from: String(MongoDB.JobRoleCollectionName),
                    localField: 'employerinfo.preferences.jobrole.jobrolecode',
                    foreignField: 'jobrolecode',
                    as: 'jobroleinfo'
                }
            },
            {
                $lookup: {
                    from: String(MongoDB.DistrictCollectionName),
                    localField: 'employerinfo.preferences.location.locationcode',
                    foreignField: 'districtcode',
                    as: 'locationinfo'
                }
            },
            
            { $unwind: "$jobroleinfo" },
            { $unwind: "$jobroleinfo.jobrole" },
            { $match:  { "jobroleinfo.jobrole.languagecode": objConstants.defaultlanguagecode } },
            { $unwind: "$locationinfo" },
            { $unwind: "$locationinfo.district" },
            { $match:  { "locationinfo.district.languagecode": objConstants.defaultlanguagecode } },
            {
                "$group":
                {
                    "_id": {
                        employercode: '$employerinfo.employercode', registeredname: '$employerinfo.registeredname', email: '$employerinfo.registered_email', 
                        mobileno: '$employerinfo.contactinfo.mobileno',
                        location: '$employerinfo.contactinfo.cityname', "profileurl": '$employerinfo.profileurl'
                        
                    },
                    "preferredjobrole": { $addToSet: "$jobroleinfo.jobrole.jobrolename" },
                    "preferredlocation": { $addToSet: "$locationinfo.district.districtname" }
                }
            },
            {
                $project: {
                    _id: 0, employeecode: 1, employercode: '$_id.employercode', companyname: '$_id.registeredname', email: '$_id.email', mobileno: '$_id.mobileno',
                    "preferredjobrole": '$preferredjobrole', "preferredlocation": '$preferredlocation', "profileurl": '$_id.profileurl'
                }
            }
            // {$sort:sortbyparams}//,
            //{$skip:parseInt(listparams.skipvalue)},
            //{$limit:parseInt(listparams.limitvalue)}
        ]).toArray(function (err, result) {
            return callback(result);
        });
    }
    catch (e) {
        logger.error("Error in AppliedShortList - report " + e);
    }
}

