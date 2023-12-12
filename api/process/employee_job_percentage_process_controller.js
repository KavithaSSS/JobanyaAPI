'use strict';
const Logger = require('../services/logger_service');
const logger = new Logger('logs')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const objUtilities = require("../controller/utilities");
const objRecommended = require('../process/employer_recommended_process_controller');


exports.UpdateMatchingPercentage = function (empresult, activejobcodelist, jobpercentage, callback) {
    try {

        UpdateMatchingPercentageToEmployee(empresult, activejobcodelist, jobpercentage, function (err, employeecount) {
            if (err) {
                return;
            }
            return callback(employeecount);
        });
    }
    catch (e) { logger.error("Error in UpdateMatchingPercentage" + e); }
}


var async = require('async');
function UpdateMatchingPercentageToEmployee(empresult, activejobcodelist, jobpercentage, callback) {
    try {
        var returnval;
        var iteratorFcn = function (jobcode, done) {
            if (jobcode == null) {
                done();
                return;
            }

            exports.UpdateMatchingPercentage_Employee(jobcode, empresult, jobpercentage,  function (response) {
                returnval = response;
                done();
                return;
            });
        };
        var doneIteratingFcn = function (err) {
            callback(err, returnval);
        };
        async.forEach(activejobcodelist, iteratorFcn, doneIteratingFcn);
    }
    catch (e) { logger.error("Error in UpdateMatchingPercentageToEmployee" + e); }
}

exports.UpdateMatchingPercentage_Employee = function (jobcodevalue, empresult, jobpercentage, callback) {
    try {        
        //console.log(jobcodevalue,"jobcodevalue")
        var empparams = { "jobcode": jobcodevalue.jobcode };
        objRecommended.getJobProfileConditions({}, empparams, function (jobresult) {
            //console.log(jobresult,"jobresult")
            if (jobresult && jobresult.length > 0) {
                exports.CalcAndUpdatePercentage(empresult, jobresult, jobpercentage,  function (response) {
                    return callback(response);
                }); 
            }
        }); 
        

    }
    catch (e) {
        logger.error("Error in UpdateMatchingPercentage_Employee " + e);
    }
}

exports.CalcAndUpdatePercentage = function (employee, jobresult, jobpercentage,  callback) {
    try {         
        //console.log("employee",employee)
        
            if (employee != null && employee.length > 0) {    
                var totalPercentage = 0;
                let result = (employee[0].preferences && employee[0].preferences.jobfunction && employee[0].preferences.jobfunction.length>0) ? employee[0].preferences.jobfunction.map(a => a.jobfunctioncode):[];
                let skillresult = (employee[0].skills && employee[0].skills.length>0) ? employee[0].skills.map(a => a.jobfunctioncode):[];

                if((jobresult[0].jobfunctioncode && jobresult[0].jobfunctioncode.length>0 && result.diff(jobresult[0].jobfunctioncode)) || 
                (jobresult[0].jobfunctioncode && jobresult[0].jobfunctioncode.length>0 && skillresult.diff(jobresult[0].jobfunctioncode))){
                    var jobprofile = jobpercentage.filter(t => t.code == 1);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }   


                result = (employee[0].preferences && employee[0].preferences.employementtype && employee[0].preferences.employementtype.length>0) ? employee[0].preferences.employementtype.map(a => a.employementtypecode):[];
                if(jobresult[0].jobtypecode && jobresult[0].jobtypecode.length>0 && result.diff(jobresult[0].jobtypecode)){
                    var jobprofile = jobpercentage.filter(t => t.code == 2);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }

                
                result = (employee[0].preferences && employee[0].preferences.jobrole && employee[0].preferences.jobrole.length>0) ? employee[0].preferences.jobrole.map(a => a.jobrolecode):[];
                skillresult = (employee[0].skills && employee[0].skills.length>0) ? employee[0].skills.map(a => a.jobrolecode):[];
                if((jobresult[0].jobrolecode && jobresult[0].jobrolecode.length>0 && result.diff(jobresult[0].jobrolecode)) || 
                (jobresult[0].jobrolecode && jobresult[0].jobrolecode.length>0 && skillresult.diff(jobresult[0].jobrolecode))){
                    var jobprofile = jobpercentage.filter(t => t.code == 3);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }
                
                if(employee[0].preferences && ((employee[0].preferences.minsalary >= jobresult[0].salaryfrom && employee[0].preferences.minsalary <= jobresult[0].salaryto) || 
                (employee[0].preferences.maxsalary >= jobresult[0].salaryfrom && employee[0].preferences.maxsalary <= jobresult[0].salaryto) || 
                (jobresult[0].salaryfrom >= employee[0].preferences.minsalary && jobresult[0].salaryfrom <= employee[0].preferences.maxsalary) || 
                (jobresult[0].salaryto >= employee[0].preferences.minsalary && jobresult[0].salaryto <= employee[0].preferences.maxsalary))){
                    var jobprofile = jobpercentage.filter(t => t.code == 4);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }

                result = (employee[0].preferences && employee[0].preferences.location && employee[0].preferences.location.length>0) ? employee[0].preferences.location.map(a => a.locationcode):[];
                
                if((jobresult[0].joblocationcode && jobresult[0].joblocationcode.length>0 && result && result.length>0 && result.diff(jobresult[0].joblocationcode)) || 
                (employee[0].preferences && (employee[0].preferences.isanydistrict == 'true'))){
                    var jobprofile = jobpercentage.filter(t => t.code == 5);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }
                
                if(employee[0].personalinfo && jobresult[0].gendercode && jobresult[0].gendercode.length>0 && jobresult[0].gendercode.includes(employee[0].personalinfo.gender)){
                    var jobprofile = jobpercentage.filter(t => t.code == 6);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }
                else if(jobresult[0].gendercode && jobresult[0].gendercode.length == 0){
                    var jobprofile = jobpercentage.filter(t => t.code == 6);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }

                result = (employee[0].personalinfo && employee[0].personalinfo.languagesknown && employee[0].personalinfo.languagesknown.length>0) ? employee[0].personalinfo.languagesknown.map(a => a.languagecode):[];
                var joblangresult = (jobresult[0].languagesknown && jobresult[0].languagesknown.length>0) ? jobresult[0].languagesknown.map(a => a.languagecode):[];
                
                if(joblangresult && joblangresult.length>0 && result && result.length>0 && result.diff(joblangresult)){
                    var jobprofile = jobpercentage.filter(t => t.code == 7);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }

                if(employee[0].personalinfo && jobresult[0].maritalcode && jobresult[0].maritalcode.length>0 && jobresult[0].maritalcode.includes(employee[0].personalinfo.maritalstatus)){
                    var jobprofile = jobpercentage.filter(t => t.code == 8);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }
                else if(jobresult[0].maritalcode && jobresult[0].maritalcode.length == 0){
                    var jobprofile = jobpercentage.filter(t => t.code == 8);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }
                if (jobresult[0].anyage=='true'){
                    var jobprofile = jobpercentage.filter(t => t.code == 9);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }
                else if (employee[0].personalinfo && jobresult[0].anyage=='false' && employee[0].personalinfo.dateofbirth != null && jobresult[0].agefrom != null && jobresult[0].ageto != null) {
                    var ageDifMs = Date.now() - employee[0].personalinfo.dateofbirth;
                    var ageDate = new Date(ageDifMs); // miliseconds from epoch
                    var age = Math.abs(ageDate.getUTCFullYear() - 1970);
                    if(age >= jobresult[0].agefrom && age <= jobresult[0].ageto){
                        var jobprofile = jobpercentage.filter(t => t.code == 9);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                    }
                }

                result = (employee[0].preferences && employee[0].preferences.location && employee[0].preferences.location.length>0) ? employee[0].preferences.location.map(a => a.locationcode):[];
                
                if((jobresult[0].locationcode && jobresult[0].locationcode.length>0 && result && result.length>0 && result.diff(jobresult[0].locationcode)) || 
                jobresult[0].locationany == 'true' || (employee[0].preferences && employee[0].preferences.isanydistrict == 'true')){
                    var jobprofile = jobpercentage.filter(t => t.code == 10);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }
                
                result = (employee[0].preferences && employee[0].preferences.taluk && employee[0].preferences.taluk.length>0) ? employee[0].preferences.taluk.map(a => a.talukcode):[];
                
                if((jobresult[0].talukcode && jobresult[0].talukcode.length>0 && result && result.length>0 && result.diff(jobresult[0].talukcode)) || 
                jobresult[0].anytaluk == 'true' || (employee[0].preferences && employee[0].preferences.isanytaluk == 'true')){
                    var jobprofile = jobpercentage.filter(t => t.code == 11);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }

                result = (employee[0].schooling && employee[0].schooling.length>0) ? employee[0].schooling.map(a => a.qualificationcode):[];
                var qualresult = (employee[0].afterschooling && employee[0].afterschooling.length>0) ? employee[0].afterschooling.map(a => a.qualificationcode):[];
                
                if((jobresult[0].schoolqualcode && jobresult[0].schoolqualcode.length>0 && result && result.length>0 && result.diff(jobresult[0].schoolqualcode)) || 
                jobresult[0].anyqualification == 'true' || (jobresult[0].anyqualification == 'false' && jobresult[0].afterschoolqualcode && jobresult[0].afterschoolqualcode.length>0 
                && qualresult && qualresult.length>0 && result.diff(jobresult[0].afterschoolqualcode))){
                    var jobprofile = jobpercentage.filter(t => t.code == 12);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }

                result = (employee[0].afterschooling && employee[0].afterschooling.length>0) ? employee[0].afterschooling.map(a => a.educationcategorycode):[];
                
                if(jobresult[0].anydegree == 'true' || (jobresult[0].anydegree == 'false' && jobresult[0].afterschoolcatecode && jobresult[0].afterschoolcatecode.length>0 
                && result && result.length>0 && result.diff(jobresult[0].afterschoolcatecode))){
                    var jobprofile = jobpercentage.filter(t => t.code == 13);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }

                var fresher = 0;

                for (var i = 0; i <= jobresult[0].experiencecode.length - 1; i++) {
                    if (i == 0) {
                        if (jobresult[0].experiencecode[i] == 0) {
                            fresher = 1;
                        }
                    }
                    else {
                        if(employee[0].totalexperience >= explist[i] && employee[0].totalexperience <= explist[i+1]){
                            var jobprofile = jobpercentage.filter(t => t.code == 14);
                            totalPercentage = totalPercentage + jobprofile[0].percentage ;
                        }
                    }
                    break;
                }

                if(employee[0].fresherstatus == fresher || employee[0].totalexperience>0){
                    var jobprofile = jobpercentage.filter(t => t.code == 15);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }

                result = (employee[0].skills && employee[0].skills.length>0) ? employee[0].skills.map(a => a.skillcode):[];
                if(jobresult[0].skillcode && jobresult[0].skillcode.length>0 && result.diff(jobresult[0].skillcode)){
                    var jobprofile = jobpercentage.filter(t => t.code == 16);
                    totalPercentage = totalPercentage + jobprofile[0].percentage ;
                }

                

                   
                const dbo = MongoDB.getDB(); 
                // dbo.collection(MongoDB.EmpJobPercentageCollectionName).deleteOne({"employeecode":employeecode, "jobcode":jobresult[0].jobcode}, function (err, res) {
                //     if (err) throw err;
                    objUtilities.getcurrentmilliseconds(function (currenttime) {
                         console.log("totalPercentage",totalPercentage); 
                         //console.log("currenttime",currenttime); 
                        var insertparams = {"employeecode":employee[0].employeecode, "jobcode":jobresult[0].jobcode, "matchpercentage":totalPercentage,"createddate":currenttime}              
                        dbo.collection(MongoDB.EmpJobPercentageCollectionName).insertOne(insertparams, function (err, res) {
                            if (err) throw err;
                            var finalresult = res.insertedCount;
                            return callback(finalresult);
                        });
                    });
                //});
                
            }
      
    }
    catch (e) {
        logger.error("Error in UpdateMatchingPercentage_Employee " + e);
    }
}

Array.prototype.diff = function(arr2) {
    var ret = [];
    this.sort();
    arr2.sort();
    for(var i = 0; i < this.length; i += 1) {
        if(arr2.indexOf(this[i]) > -1){
            ret.push(this[i]);
        }
    }
    return ret.length>0;
};