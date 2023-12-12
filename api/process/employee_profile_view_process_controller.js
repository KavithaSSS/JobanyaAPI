'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');
const objReference = require('./employee_reference_process_controller');
const objExperience = require('./employee_experience_process_controller');
const objEducation = require('./employee_education_process_controller');
const objSkills = require('./employee_skills_process_controller');
const objProfile = require('../process/employee_profile_process_controller')
const { stringify } = require('circular-json');
const objZohoBook = require('../process/zohobook_razorpay_process_controller');

exports.FindAllEmployeeList = function (req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "statuscode": Number(objConstants.activestatus) };
        ////console.log(params)
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: params },
            {
                $project: {
                    _id: 0, employeecode: 1
                }
            }
        ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Find all employee- sendsms " + e);
    }
}

exports.FindEmployeeList = function (req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { "statuscode": Number(objConstants.activestatus) };
        ////console.log(params)
        dbo.collection(MongoDB.EmployeeCollectionName).aggregate([
            { $match: params },
            {
                $project: {
                    _id: 0, employeecode: 1
                }
            },
            { $skip: Number(req.query.skipvalue) },
            { $limit: Number(req.query.limitvalue) }
        ]).toArray(function (err, result) {
            finalresult = result;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Find all employee- sendsms " + e);
    }
}

exports.EmployeeProfileUpdation = function (logparams, empresult, languagecode, req, callback) {
    try {
        //console.log("EntryLevel1")
        UpdateEmployeeProfile(logparams, empresult, languagecode, req, function (err, employeecount) {
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
function UpdateEmployeeProfile(logparams, empresult, languagecode, req, callback) {
    try {
        //console.log("EntryLevel2")
        var returnval;
        var iteratorFcn = function (employeecode, done) {
            if (employeecode == null) {
                done();
                return;
            }

            exports.getEmployeeProfileView(logparams, employeecode, languagecode, req, function (response) {
                returnval = response;
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

exports.getEmployeeProfileView = function (logparams, empparams, languagecode, req, callback) {
    //console.log("EntryLevel3")
    const dbo = MongoDB.getDB();
    var finalresult;
    // //console.log(empparams);
    ////console.log(languagecode);
    var profileviewparams;
    var expinfo;
    var expinfo1;
    var expinfohindi;
    var totalexp;
    var expmonth;
    var expyear;
    var fresher;
    var invitedstatus, inviteddate;
    var appliedstatus, applieddate;
    var englishlangcode = objConstants.englishlangcode;
    var tamillangcode = objConstants.tamillangcode;
    var hindilangcode = objConstants.hindilangcode;
    var empmatchparam = { "employeecode": empparams.employeecode };
    //var jobmatchparam = {"jobcode":empparams.jobcode};
    var employercode = 0;

    // if (req.query.isleadtype == null) {
    //     req.query.isleadtype = 0
    // }
    req.query.isleadtype = 0
    //console.log(empmatchparam);
    getPersonalinfo(empmatchparam, englishlangcode, Number(req.query.isleadtype), function (personalres) {
        getPersonalinfo(empmatchparam, tamillangcode, Number(req.query.isleadtype), function (personalrestamil) {
            getPersonalinfo(empmatchparam, hindilangcode, Number(req.query.isleadtype), function (personalreshindi) {
                exports.getContactinfo(empmatchparam, englishlangcode, Number(req.query.isleadtype), function (contactres) {
                    exports.getContactinfo(empmatchparam, tamillangcode, Number(req.query.isleadtype), function (contactrestamil) {
                        exports.getContactinfo(empmatchparam, hindilangcode, Number(req.query.isleadtype), function (contactreshindi) {

                            objReference.getReferenceList(logparams, empmatchparam, englishlangcode, Number(req.query.isleadtype), function (referenceres) {
                                objReference.getReferenceList(logparams, empmatchparam, tamillangcode, Number(req.query.isleadtype), function (referencerestamil) {
                                    objReference.getReferenceList(logparams, empmatchparam, hindilangcode, Number(req.query.isleadtype), function (referencereshindi) {
                                        // console.log("EntryLevel3.3")
                                        var expparams = { "employeecode": empmatchparam.employeecode, "languagecode": Number(englishlangcode) };
                                        var expparams1 = { "employeecode": empmatchparam.employeecode, "languagecode": Number(tamillangcode) };
                                        var expparams2 = { "employeecode": empmatchparam.employeecode, "languagecode": Number(hindilangcode) };
                                        objExperience.getExperienceInfo(logparams, expparams, Number(req.query.isleadtype), function (experienceres) {
                                            objExperience.getExperienceInfo(logparams, expparams1, Number(req.query.isleadtype), function (experiencerestamil) {
                                                objExperience.getExperienceInfo(logparams, expparams2, Number(req.query.isleadtype), function (experiencereshindi) {
                                                    // //console.log(experienceres.length);
                                                    ////console.log(experienceinfo);
                                                    // console.log("EntryLevel3.4")
                                                    if (experienceres != null && experienceres.length > 0) {
                                                        if (experienceres[0].experienceinfo != null) {
                                                            expinfo = experienceres[0].experienceinfo;
                                                        }
                                                        if (experienceres[0].totalexperience != null) {
                                                            totalexp = experienceres[0].totalexperience;
                                                        }
                                                        if (experienceres[0].fresherstatus != null) {
                                                            fresher = experienceres[0].fresherstatus;
                                                        }
                                                        expmonth = experienceres[0].expmonth;
                                                        expyear = experienceres[0].expyear;
                                                    }

                                                    if (experiencerestamil != null && experiencerestamil.length > 0) {
                                                        if (experiencerestamil[0].experienceinfo != null) {
                                                            expinfo1 = experiencerestamil[0].experienceinfo;
                                                            // console.log(expinfo1);
                                                            // console.log(JSON.stringify(expinfo1));
                                                        }

                                                    }
                                                    if (experiencereshindi != null && experiencereshindi.length > 0) {
                                                        if (experiencereshindi[0].experienceinfo != null) {
                                                            expinfohindi = experiencereshindi[0].experienceinfo;
                                                            // console.log(expinfo1);
                                                            // console.log(JSON.stringify(expinfo1));
                                                        }

                                                    }

                                                    objEducation.getEducationInfo(logparams, empmatchparam, englishlangcode, Number(req.query.isleadtype), function (educationres) {
                                                        objEducation.getEducationInfo(logparams, empmatchparam, tamillangcode, Number(req.query.isleadtype), function (educationrestamil) {
                                                            objEducation.getEducationInfo(logparams, empmatchparam, hindilangcode, Number(req.query.isleadtype), function (educationreshindi) {
                                                                // console.log("EntryLevel3.5")
                                                                getPreferences(empmatchparam, englishlangcode, Number(req.query.isleadtype), function (preferenceres) {
                                                                    getPreferences(empmatchparam, tamillangcode, Number(req.query.isleadtype), function (preferencerestamil) {
                                                                        getPreferences(empmatchparam, hindilangcode, Number(req.query.isleadtype), function (preferencereshindi) {
                                                                            // console.log("EntryLevel3.6")
                                                                            var skillparams = { "employeecode": empmatchparam.employeecode, "languagecode": englishlangcode };
                                                                            var skillparams1 = { "employeecode": empmatchparam.employeecode, "languagecode": tamillangcode };
                                                                            var skillparamshindi = { "employeecode": empmatchparam.employeecode, "languagecode": hindilangcode };
                                                                            objSkills.getSkillsList(logparams, skillparams, Number(req.query.isleadtype), function (skillresult) {
                                                                                // console.log("EntryLevel3.7")
                                                                                objSkills.getSkillsList(logparams, skillparams1, Number(req.query.isleadtype), function (skillresulttamil) {
                                                                                    objSkills.getSkillsList(logparams, skillparamshindi, Number(req.query.isleadtype), function (skillresulthindi) {

                                                                                        personalres.languagecode = englishlangcode;
                                                                                        personalrestamil.languagecode = tamillangcode;
                                                                                        personalreshindi.languagecode = hindilangcode;

                                                                                        contactres.languagecode = englishlangcode;
                                                                                        contactrestamil.languagecode = tamillangcode;
                                                                                        contactreshindi.languagecode = hindilangcode;

                                                                                        contactres.languagecode = englishlangcode;
                                                                                        contactrestamil.languagecode = tamillangcode;
                                                                                        contactreshindi.languagecode = hindilangcode;

                                                                                        referenceres.languagecode = englishlangcode;
                                                                                        referencerestamil.languagecode = tamillangcode;
                                                                                        referencereshindi.languagecode = hindilangcode;

                                                                                        experienceres.languagecode = englishlangcode;
                                                                                        experiencerestamil.languagecode = tamillangcode;
                                                                                        experiencereshindi.languagecode = hindilangcode;

                                                                                        educationres.schoollist.languagecode = englishlangcode;
                                                                                        educationrestamil.schoollist.languagecode = tamillangcode;
                                                                                        educationreshindi.schoollist.languagecode = hindilangcode;

                                                                                        educationres.afterschoollist.languagecode = englishlangcode;
                                                                                        educationrestamil.afterschoollist.languagecode = tamillangcode;
                                                                                        educationreshindi.afterschoollist.languagecode = hindilangcode;

                                                                                        preferenceres.languagecode = englishlangcode;
                                                                                        preferencerestamil.languagecode = tamillangcode;
                                                                                        preferencereshindi.languagecode = hindilangcode;

                                                                                        skillresult.languagecode = englishlangcode;
                                                                                        skillresulttamil.languagecode = tamillangcode;
                                                                                        skillresulthindi.languagecode = hindilangcode;

                                                                                        profileviewparams = {
                                                                                            "employeecode": Number(empmatchparam.employeecode),
                                                                                            "statuscode": objConstants.activestatus,
                                                                                            "personalinfo": personalres,
                                                                                            "personalinfotamil": personalrestamil,
                                                                                            "personalinfohindi": personalreshindi,
                                                                                            "contactinfo": contactres,
                                                                                            "contactinfotamil": contactrestamil,
                                                                                            "contactinfohindi": contactreshindi,
                                                                                            "references": referenceres,
                                                                                            "referencestamil": referencerestamil,
                                                                                            "referenceshindi": referencereshindi,
                                                                                            "experience": expinfo,
                                                                                            "experiencetamil": expinfo1,
                                                                                            "totalexperience": totalexp,
                                                                                            "expmonth": expmonth,
                                                                                            "expyear": expyear,
                                                                                            "fresherstatus": fresher,
                                                                                            "schooling": educationres.schoollist,
                                                                                            "schoolingtamil": educationrestamil.schoollist,
                                                                                            "schoolinghindi": educationreshindi.schoollist,
                                                                                            "afterschooling": educationres.afterschoollist,
                                                                                            "afterschoolingtamil": educationrestamil.afterschoollist,
                                                                                            "afterschoolinghindi": educationreshindi.afterschoollist,
                                                                                            "preferences": preferenceres,
                                                                                            "preferencestamil": preferencerestamil,
                                                                                            "preferenceshindi": preferencereshindi,
                                                                                            "skilllist": skillresult,
                                                                                            "skilllisttamil": skillresulttamil,
                                                                                            "skilllisthindi": skillresulthindi
                                                                                        }
                                                                                        //console.log("EntryLevel3.9")
                                                                                        if (req.query.isleadtype == 0) {
                                                                                            // console.log("Hi")
                                                                                            //console.log(profileviewparams);
                                                                                            dbo.collection(MongoDB.EmployeeProfileViewCollectionName).deleteMany({ "employeecode": Number(empmatchparam.employeecode) }, function (err, res) {
                                                                                                if (err) throw err;
                                                                                                dbo.collection(MongoDB.EmployeeProfileViewCollectionName).insertOne(profileviewparams, function (err, logres) {
                                                                                                    //params.makerid = String(logres["ops"][0]["_id"]);
                                                                                                    finalresult = "Success"
                                                                                                });

                                                                                            });
                                                                                        }
                                                                                        else {
                                                                                            //console.log("Hi2")
                                                                                            finalresult = "Failure"
                                                                                        }
                                                                                        //  //console.log(finalresult);
                                                                                        return callback(finalresult);
                                                                                        //});
                                                                                    });
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    logger.info("Log in Employee Profile View on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    //onsole.log(emptypeparams);

}


exports.getProfileView = function (logparams, empparams, languagecode, req, callback) {
    const dbo = MongoDB.getDB();
    var finalresult;
    // //console.log(empparams);
    ////console.log(languagecode);
    var expinfo;
    var totalexp;
    var expmonth;
    var expyear;
    var fresher;
    var invitedstatus, inviteddate;
    var appliedstatus, applieddate;
    var dobdate = "", age = ""
    var empmatchparam = { "employeecode": empparams.employeecode };
    // console.log("process controller2")
    var jobmatchparam = { "jobcode": empparams.jobcode };
    // console.log("process controller2.1")
    // console.log(JSON.stringify(req.query))
    var employercode = 0;
    if (req == "")
        employercode = 0;
    else
        employercode = Number(req.query.employercode);
    if (req.query.isleadtype == null) {
        req.query.isleadtype = 0
    }
    // console.log("process controller2.2")
    getPersonalinfo(empmatchparam, languagecode, Number(req.query.isleadtype), function (personalres) {
        // console.log("process controller2.3")
        ////console.log(personalres);
        if (personalres.dateofbirth != null) {
            var d = new Date(personalres.dateofbirth),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            dobdate = [day, month, year].join('-');
            var ageDifMs = Date.now() - personalres.dateofbirth;
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }
        personalres.age = age;
        exports.getContactinfo(empmatchparam, languagecode, Number(req.query.isleadtype), function (contactres) {
            // //console.log(contactres);
            objReference.getReferenceList(logparams, empmatchparam, languagecode, Number(req.query.isleadtype), function (referenceres) {
                var expparams = { "employeecode": empmatchparam.employeecode, "languagecode": Number(languagecode) };
                objExperience.getExperienceInfo(logparams, expparams, Number(req.query.isleadtype), function (experienceres) {
                    // //console.log(experienceres.length);
                    ////console.log(experienceinfo);
                    if (experienceres != null && experienceres.length > 0) {
                        if (experienceres[0].experienceinfo != null) {
                            expinfo = experienceres[0].experienceinfo;
                        }
                        if (experienceres[0].totalexperience != null) {
                            totalexp = experienceres[0].totalexperience;
                        }
                        if (experienceres[0].fresherstatus != null) {
                            fresher = experienceres[0].fresherstatus;
                        }
                        expmonth = experienceres[0].expmonth;
                        expyear = experienceres[0].expyear;
                    }

                    objEducation.getEducationInfo(logparams, empmatchparam, languagecode, Number(req.query.isleadtype), function (educationres) {
                        getPreferences(empmatchparam, languagecode, Number(req.query.isleadtype), function (preferenceres) {
                            var skillparams = { "employeecode": empmatchparam.employeecode, "languagecode": languagecode };
                            objSkills.getSkillsList(logparams, skillparams, Number(req.query.isleadtype), function (skillresult) {
                                dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode) }).toArray(function (err, appresult) {
                                    if (appresult != null && appresult.length > 0) {
                                        appliedstatus = appresult[0].statuscode;
                                        applieddate = appresult[0].createddate;
                                        // //console.log(appliedcount);
                                        // //console.log(applieddate);
                                    }
                                    else {
                                        appliedstatus = 0;
                                    }
                                    dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode) }).toArray(function (err, invresult) {
                                        if (invresult != null && invresult.length > 0) {
                                            invitedstatus = invresult[0].statuscode;
                                            inviteddate = invresult[0].createddate;
                                        }
                                        else {
                                            invitedstatus = 0;
                                        }

                                        dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode), "shortliststatus": { $ne: 0 } }).toArray(function (err, appshortresult) {
                                            if (appshortresult != null && appshortresult.length > 0) {
                                                var appliedshortliststatus = appshortresult[0].shortliststatus;
                                                var appliedshortlistdate = appshortresult[0].createddate;
                                            }
                                            else {
                                                appliedshortliststatus = 0;
                                            }

                                            dbo.collection(MongoDB.EmployerWishListCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode) }).toArray(function (err, wishresult) {
                                                //console.log(wishresult);
                                                if (wishresult != null && wishresult.length > 0) {
                                                    var wishliststatus = wishresult[0].statuscode;
                                                    var wishlistdate = wishresult[0].createddate;

                                                }
                                                else {
                                                    wishliststatus = 0;
                                                }

                                                dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode), "shortliststatus": { $ne: 0 } }).toArray(function (err, invshortresult) {
                                                    if (invshortresult != null && invshortresult.length > 0) {
                                                        var invitedshortliststatus = invshortresult[0].shortliststatus;
                                                        var totalshortlistdate = invshortresult[0].createddate;
                                                    }
                                                    else {
                                                        invitedshortliststatus = 0;
                                                    }

                                                    dbo.collection(MongoDB.AbuseEmployerCollectionName).find({ "apptypecode": 2, "statuscode": objConstants.pendingstatus, "employeecode": Number(empmatchparam.employeecode), "employercode": employercode }).toArray(function (err, abuseresult) {
                                                        var abusestatus = 0;
                                                        if (abuseresult != null && abuseresult.length > 0) {
                                                            abusestatus = abuseresult[0].statuscode;
                                                        }
                                                        var prefparams = { employeecode: Number(empmatchparam.employeecode), statuscode: objConstants.activestatus };
                                                        objProfile.CheckProfileStatus(logparams, prefparams, Number(req.query.isleadtype), function (profileinforesult) {
                                                            finalresult = {
                                                                "personalinfo": personalres,
                                                                "contactinfo": contactres,
                                                                "references": referenceres,
                                                                "experience": expinfo,
                                                                "totalexperience": totalexp,
                                                                "expmonth": expmonth,
                                                                "expyear": expyear,
                                                                "fresherstatus": fresher,
                                                                "schooling": educationres.schoollist,
                                                                "afterschooling": educationres.afterschoollist,
                                                                "preferences": preferenceres,
                                                                "skilllist": skillresult,
                                                                "invitedshortliststatus": invitedshortliststatus,
                                                                "totalshortlistdate": totalshortlistdate,
                                                                "appliedstatus": appliedstatus,
                                                                "applieddate": applieddate,
                                                                "invitedstatus": invitedstatus,
                                                                "inviteddate": inviteddate,
                                                                "appliedshortliststatus": appliedshortliststatus,
                                                                "appliedshortlistdate": appliedshortlistdate,
                                                                "wishliststatus": wishliststatus,
                                                                "wishlistdate": wishlistdate,
                                                                "abusestatus": abusestatus,
                                                                "profilestatus": profileinforesult
                                                            }
                                                            //  //console.log(finalresult);
                                                            return callback(finalresult);
                                                        });

                                                    });


                                                });
                                                ////console.log("pref");
                                                ////console.log(preferenceres);
                                            });
                                        });
                                    });
                                });

                            });
                        });
                    })
                });

            });
        });
    });
    logger.info("Log in Employee Profile View on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    //onsole.log(emptypeparams);

}

exports.getPortalProfileView = function (logparams, empparams, languagecode, req, callback) {
    const dbo = MongoDB.getDB();
    var finalresult;
    // //console.log(empparams);
    ////console.log(languagecode);
    var expinfo;
    var totalexp;
    var expmonth;
    var expyear;
    var fresher;
    var invitedstatus, inviteddate;
    var appliedstatus, applieddate;
    var dobdate = "", age = ""
    var empmatchparam = { "employeecode": empparams.employeecode };
    // console.log("process controller2")
    var jobmatchparam = { "jobcode": empparams.jobcode };
    // console.log("process controller2.1")
    // console.log(JSON.stringify(req.query))
    var employercode = 0;
    if (req == "")
        employercode = 0;
    else
        employercode = Number(req.query.employercode);
    if (req.query.isleadtype == null) {
        req.query.isleadtype = 0
    }
    // console.log("process controller2.2")
    getPersonalinfo(empmatchparam, languagecode, Number(req.query.isleadtype), function (personalres) {
        // console.log("process controller2.3")
        ////console.log(personalres);
        if (personalres.dateofbirth != null) {
            var d = new Date(personalres.dateofbirth),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            dobdate = [day, month, year].join('-');
            var ageDifMs = Date.now() - personalres.dateofbirth;
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }
        personalres.age = age;
        exports.getPortalContactinfo(empmatchparam, languagecode, Number(req.query.isleadtype), function (contactres) {
            // //console.log(contactres);
            objReference.getReferenceList(logparams, empmatchparam, languagecode, Number(req.query.isleadtype), function (referenceres) {
                var expparams = { "employeecode": empmatchparam.employeecode, "languagecode": Number(languagecode) };
                objExperience.getPortalExperienceInfo(logparams, expparams, Number(req.query.isleadtype), function (experienceres) {
                    // //console.log(experienceres.length);
                    ////console.log(experienceinfo);
                    if (experienceres != null && experienceres.length > 0) {
                        if (experienceres[0].experienceinfo != null) {
                            expinfo = experienceres[0].experienceinfo;
                        }
                        if (experienceres[0].totalexperience != null) {
                            totalexp = experienceres[0].totalexperience;
                        }
                        if (experienceres[0].fresherstatus != null) {
                            fresher = experienceres[0].fresherstatus;
                        }
                        expmonth = experienceres[0].expmonth;
                        expyear = experienceres[0].expyear;
                    }

                    objEducation.getPortalEducationInfo(logparams, empmatchparam, languagecode, Number(req.query.isleadtype), function (educationres) {
                        getPreferences(empmatchparam, languagecode, Number(req.query.isleadtype), function (preferenceres) {
                            var skillparams = { "employeecode": empmatchparam.employeecode, "languagecode": languagecode };
                            objSkills.getSkillsList(logparams, skillparams, Number(req.query.isleadtype), function (skillresult) {
                                // console.log("1")
                                // if (skillresult != null && skillresult.length > 0)
                                // {
                                //     // console.log("2")
                                //     for (let i = 0; i<= skillresult.length -1; i++)
                                //     {
                                //         // console.log("3")
                                //         for (let j = 0; j<= experienceres.length - 1; j++)
                                //         {
                                //             // console.log("4")
                                //             if (skillresult[i].jobrolename == experienceres[j].designationname)
                                //             {
                                //                 // console.log("SkilldetailsbyKavitha")
                                //                 skillresult[i].expvalue = experienceres[j].expvalue;
                                //             }
                                //         }
                                //     }
                                // }
                                dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode) }).toArray(function (err, appresult) {
                                    if (appresult != null && appresult.length > 0) {
                                        appliedstatus = appresult[0].statuscode;
                                        applieddate = appresult[0].createddate;
                                        // //console.log(appliedcount);
                                        // //console.log(applieddate);
                                    }
                                    else {
                                        appliedstatus = 0;
                                    }
                                    dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode) }).toArray(function (err, invresult) {
                                        if (invresult != null && invresult.length > 0) {
                                            invitedstatus = invresult[0].statuscode;
                                            inviteddate = invresult[0].createddate;
                                        }
                                        else {
                                            invitedstatus = 0;
                                        }

                                        dbo.collection(MongoDB.EmployeeAppliedCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode), "shortliststatus": { $ne: 0 } }).toArray(function (err, appshortresult) {
                                            if (appshortresult != null && appshortresult.length > 0) {
                                                var appliedshortliststatus = appshortresult[0].shortliststatus;
                                                var appliedshortlistdate = appshortresult[0].createddate;
                                            }
                                            else {
                                                appliedshortliststatus = 0;
                                            }

                                            dbo.collection(MongoDB.EmployerWishListCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode) }).toArray(function (err, wishresult) {
                                                //console.log(wishresult);
                                                if (wishresult != null && wishresult.length > 0) {
                                                    var wishliststatus = wishresult[0].statuscode;
                                                    var wishlistdate = wishresult[0].createddate;

                                                }
                                                else {
                                                    wishliststatus = 0;
                                                }

                                                dbo.collection(MongoDB.EmployeeInvitedCollectionName).find({ "jobcode": Number(jobmatchparam.jobcode), "employeecode": Number(empmatchparam.employeecode), "shortliststatus": { $ne: 0 } }).toArray(function (err, invshortresult) {
                                                    if (invshortresult != null && invshortresult.length > 0) {
                                                        var invitedshortliststatus = invshortresult[0].shortliststatus;
                                                        var totalshortlistdate = invshortresult[0].createddate;
                                                    }
                                                    else {
                                                        invitedshortliststatus = 0;
                                                    }

                                                    dbo.collection(MongoDB.AbuseEmployerCollectionName).find({ "apptypecode": 2, "statuscode": objConstants.pendingstatus, "employeecode": Number(empmatchparam.employeecode), "employercode": employercode }).toArray(function (err, abuseresult) {
                                                        var abusestatus = 0;
                                                        if (abuseresult != null && abuseresult.length > 0) {
                                                            abusestatus = abuseresult[0].statuscode;
                                                        }

                                                        var prefparams = { employeecode: Number(empmatchparam.employeecode), statuscode: objConstants.activestatus };
                                                        objProfile.CheckProfileStatus(logparams, prefparams, Number(req.query.isleadtype), function (profileinforesult) {
                                                            // objProfile.getTotalPercentage(logparams, prefparams, Number(req.query.isleadtype), function (percentageresult){
                                                            finalresult = {
                                                                "personalinfo": personalres,
                                                                "contactinfo": contactres,
                                                                "references": referenceres,
                                                                "experience": expinfo,
                                                                "totalexperience": totalexp,
                                                                "expmonth": expmonth,
                                                                "expyear": expyear,
                                                                "fresherstatus": fresher,
                                                                "schooling": educationres.schoollist,
                                                                "afterschooling": educationres.afterschoollist,
                                                                "preferences": preferenceres,
                                                                "skilllist": skillresult,
                                                                "invitedshortliststatus": invitedshortliststatus,
                                                                "totalshortlistdate": totalshortlistdate,
                                                                "appliedstatus": appliedstatus,
                                                                "applieddate": applieddate,
                                                                "invitedstatus": invitedstatus,
                                                                "inviteddate": inviteddate,
                                                                "appliedshortliststatus": appliedshortliststatus,
                                                                "appliedshortlistdate": appliedshortlistdate,
                                                                "wishliststatus": wishliststatus,
                                                                "wishlistdate": wishlistdate,
                                                                "abusestatus": abusestatus,
                                                                "profilestatus": profileinforesult
                                                            }
                                                            //  //console.log(finalresult);
                                                            return callback(finalresult);
                                                            // })

                                                        });

                                                    });


                                                });
                                                ////console.log("pref");
                                                ////console.log(preferenceres);
                                            });
                                        });
                                    });
                                });

                            });
                        });
                    })
                });

            });
        });
    });
    logger.info("Log in Employee Profile View on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    //onsole.log(emptypeparams);

}


exports.getProfileDetails = function (logparams, languagecode, req, callback) {
    const dbo = MongoDB.getDB();
    var finalresult;
    var empmatchparam = { "employeecode": Number(req.query.employeecode) };

    if (req.query.isleadtype == null) {
        req.query.isleadtype = 0
    }
    getPersonalinfo(empmatchparam, languagecode, Number(req.query.isleadtype), function (personalres) {
        ////console.log(personalres);
        exports.getContactinfo(empmatchparam, languagecode, Number(req.query.isleadtype), function (contactres) {
            // //console.log(contactres);
            finalresult = {
                "personalinfo": personalres,
                "contactinfo": contactres
            }
            //  //console.log(finalresult);
            return callback(finalresult);
        });
    });
    logger.info("Log in Employee Profile View on Employee App : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    //onsole.log(emptypeparams);

}

function getPersonalinfo(empparams, languagecode, isleadtype, callback) {
    try {
        const dbo = MongoDB.getDB();
        // console.log("Personal"); 
        ////console.log(empparams);
        // //console.log(languagecode);
        var languageparams = { "personalinfo.languagesknown.status": objConstants.activestatus };
        var finalresult = [];
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $match: empparams },
            { $unwind: { path: '$personalinfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: String(MongoDB.MaritalStatusCollectionName),
                    localField: 'personalinfo.maritalstatus',
                    foreignField: 'maritalcode',
                    as: 'maritalinfo'
                }
            },
            {
                $lookup:
                {
                    from: String(MongoDB.KonwnFromCollectionName),
                    localField: "personalinfo.knowabouttypecode",
                    foreignField: "knownfromcode",
                    as: "knowntypeinfo"
                }
            },
            { $unwind: { path: '$maritalinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$maritalinfo.marital', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "maritalinfo.marital.languagecode": { $exists: false } }, { "maritalinfo.marital.languagecode": "" }, { "maritalinfo.marital.languagecode": Number(languagecode) }] } },
            {
                $lookup: {
                    from: String(MongoDB.GenderCollectionName),
                    localField: 'personalinfo.gender',
                    foreignField: 'gendercode',
                    as: 'genderinfo'
                }
            },
            { $unwind: { path: "$knowntypeinfo", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$knowntypeinfo.knownfrom', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "knowntypeinfo.knownfrom.languagecode": { $exists: false } }, { "knowntypeinfo.knownfrom.languagecode": "" }, { "knowntypeinfo.knownfrom.languagecode": Number(languagecode) }] } },
            { $unwind: { path: '$genderinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$genderinfo.gender', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "genderinfo.gender.languagecode": { $exists: false } }, { "genderinfo.gender.languagecode": "" }, { "genderinfo.gender.languagecode": Number(languagecode) }] } },
            {
                $project: {
                    "_id": 0,
                    "lastlogindate": "$lastlogindate",
                    "employeefullname": '$personalinfo.employeefullname', "fathername": { $ifNull: ['$personalinfo.fathername', ''] }, "spousename": { $ifNull: ['$personalinfo.spousename', ''] }, "knowabouttypecode": { $ifNull: ['$personalinfo.knowabouttypecode', ''] },
                    "knowabouttypename": { $ifNull: ['$knowntypeinfo.knownfrom.knownfromname', ''] },
                    "others": { $ifNull: ['$personalinfo.others', ''] },
                    "usercode": { $ifNull: ['$personalinfo.usercode', ''] },
                    "dateofbirth": { $ifNull: ['$personalinfo.dateofbirth', ''] }, "gender": { $ifNull: ['$personalinfo.gender', ''] }, "gendername": { $ifNull: ['$genderinfo.gender.gendername', ''] }, "maritalstatus": { $ifNull: ['$maritalinfo.marital.maritalname', ''] },
                    "preferredlanguagecode": { $ifNull: ['$preferredlanguagecode', objConstants.defaultlanguagecode] }, "maritalstatuscode": { $ifNull: ['$personalinfo.maritalstatus', ''] }, "differentlyabled": { $ifNull: ['$personalinfo.differentlyabled', ''] }, "aadharno": { $ifNull: ['$personalinfo.aadharno', ''] }, "medicalhistory": { $ifNull: ['$personalinfo.medicalhistory', ''] }, "resumeurl": { $ifNull: ['$resumeurl', ''] }, "generatedresumeurl": { $ifNull: ['$generatedresumeurl', ''] }, "createddate": 1, "lastlogindate": 1, "imageurl": { $ifNull: ['$imageurl', ''] }
                }
            }]).toArray(function (err, empresult) {
                ////console.log("p");
                ////console.log(empresult);
                if (empresult != null && empresult.length > 0) {
                    dbo.collection(String(dbCollectionName)).aggregate([
                        { $match: empparams },
                        { $unwind: "$personalinfo.languagesknown" },
                        {
                            $lookup: {
                                from: String(MongoDB.LanguageCollectionName),
                                localField: 'personalinfo.languagesknown.languagecode',
                                foreignField: 'languagecode',
                                as: 'languageinfo'
                            }
                        },
                        { $unwind: "$languageinfo" },
                        { $match: languageparams },
                        {
                            $project: {
                                "_id": 0,
                                "languagecode": '$personalinfo.languagesknown.languagecode', "languagename": '$languageinfo.languagename', "displayname": '$languageinfo.language', "knowntype": '$personalinfo.languagesknown.knowntype', "status": '$personalinfo.languagesknown.status'
                            }
                        }]).toArray(function (err, langresult) {
                            ////console.log("personal");
                            // //console.log(empresult);
                            if (langresult != null && langresult.length > 0) {
                                empresult[0].languagesknown = langresult;

                                return callback(empresult[0]);
                            }
                            else
                                return callback(empresult[0]);

                        });
                }
                else
                    return callback(finalresult);
                ////console.log(empresult);

            });
    }
    catch (e) { logger.error("Error in Employee get Personal Info View: " + e); }
}
exports.getContactinfo = function (empparams, languagecode, isleadtype, callback) {
    //function getContactinfo(empparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: { path: '$contactinfo', preserveNullAndEmptyArrays: true } },
            { $match: empparams },
            {
                $lookup: {
                    from: String(MongoDB.TalukCollectionName),
                    localField: 'contactinfo.talukcode',
                    foreignField: 'talukcode',
                    as: 'talukinfo'
                }
            },
            { $unwind: { path: '$talukinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$talukinfo.taluk', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "talukinfo.taluk.languagecode": { $exists: false } }, { "talukinfo.taluk.languagecode": "" }, { "talukinfo.taluk.languagecode": Number(languagecode) }] } },
            {
                $lookup: {
                    from: String(MongoDB.DistrictCollectionName),
                    localField: 'talukinfo.districtcode',
                    foreignField: 'districtcode',
                    as: 'districtinfo'
                }
            },
            { $unwind: { path: '$districtinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$districtinfo.district', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "districtinfo.district.languagecode": { $exists: false } }, { "districtinfo.district.languagecode": "" }, { "districtinfo.district.languagecode": Number(languagecode) }] } },
            {
                $lookup: {
                    from: String(MongoDB.StateCollectionName),
                    localField: 'districtinfo.statecode',
                    foreignField: 'statecode',
                    as: 'stateinfo'
                }
            },
            { $unwind: { path: '$stateinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$stateinfo.state', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "stateinfo.state.languagecode": { $exists: false } }, { "stateinfo.state.languagecode": "" }, { "stateinfo.state.languagecode": Number(languagecode) }] } },
            {
                $project: {
                    "_id": 0,
                    "statecode": '$districtinfo.statecode', "statename": '$stateinfo.state.statename',
                    "districtcode": '$talukinfo.districtcode', "districtname": '$districtinfo.district.districtname',
                    "cityname": '$contactinfo.cityname', "streetname": '$contactinfo.streetname',
                    "areaname": '$contactinfo.areaname', "pincode": '$contactinfo.pincode', "emailid": '$contactinfo.emailid',
                    "mobileno": '$contactinfo.mobileno', "altmobileno": '$contactinfo.altmobileno',
                    "linkedin": '$contactinfo.linkedin', "twitter": '$contactinfo.twitter',
                    "facebook": '$contactinfo.facebook', "youtube": '$contactinfo.youtube',
                    "instagram": '$contactinfo.instagram',
                    "talukcode": '$talukinfo.talukcode', "talukname": '$talukinfo.taluk.talukname'
                }
            }]).toArray(function (err, empresult) {
                ////console.log(empresult);
                if (err) throw err;

                return callback(empresult[0]);
            });
    }
    catch (e) { logger.error("Error in Employee get Contact Info View: " + e); }
}

exports.getPortalContactinfo = function (empparams, languagecode, isleadtype, callback) {
    //function getContactinfo(empparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: { path: '$contactinfo', preserveNullAndEmptyArrays: true } },
            { $match: empparams },
            {
                $lookup: {
                    from: String(MongoDB.TalukCollectionName),
                    localField: 'contactinfo.talukcode',
                    foreignField: 'talukcode',
                    as: 'talukinfo'
                }
            },
            { $unwind: { path: '$talukinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$talukinfo.taluk', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "talukinfo.taluk.languagecode": { $exists: false } }, { "talukinfo.taluk.languagecode": "" }, { "talukinfo.taluk.languagecode": Number(languagecode) }] } },
            {
                $lookup: {
                    from: String(MongoDB.DistrictCollectionName),
                    localField: 'contactinfo.districtcode',
                    foreignField: 'districtcode',
                    as: 'districtinfo'
                }
            },
            { $unwind: { path: '$districtinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$districtinfo.district', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "districtinfo.district.languagecode": { $exists: false } }, { "districtinfo.district.languagecode": "" }, { "districtinfo.district.languagecode": Number(languagecode) }] } },
            {
                $lookup: {
                    from: String(MongoDB.StateCollectionName),
                    localField: 'districtinfo.statecode',
                    foreignField: 'statecode',
                    as: 'stateinfo'
                }
            },
            { $unwind: { path: '$stateinfo', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$stateinfo.state', preserveNullAndEmptyArrays: true } },
            { $match: { $or: [{ "stateinfo.state.languagecode": { $exists: false } }, { "stateinfo.state.languagecode": "" }, { "stateinfo.state.languagecode": Number(languagecode) }] } },
            {
                $project: {
                    "_id": 0,
                    "statecode": '$districtinfo.statecode', "statename": '$stateinfo.state.statename',
                    "districtcode": '$districtinfo.districtcode', "districtname": '$districtinfo.district.districtname',
                    "cityname": '$contactinfo.cityname', "streetname": '$contactinfo.streetname',
                    "areaname": '$contactinfo.areaname', "pincode": '$contactinfo.pincode', "emailid": '$contactinfo.emailid',
                    "mobileno": '$contactinfo.mobileno', "altmobileno": '$contactinfo.altmobileno',
                    "linkedin": '$contactinfo.linkedin', "twitter": '$contactinfo.twitter',
                    "facebook": '$contactinfo.facebook', "youtube": '$contactinfo.youtube',
                    "instagram": '$contactinfo.instagram',
                    "talukcode": '$talukinfo.talukcode', "talukname": '$talukinfo.taluk.talukname'
                }
            }]).toArray(function (err, empresult) {
                ////console.log(empresult);
                if (err) throw err;

                return callback(empresult[0]);
            });
    }
    catch (e) { logger.error("Error in Employee get Contact Info View: " + e); }
}

function getPreferences(empparams, languagecode, isleadtype, callback) {
    try {
        var finalresult;
        const dbo = MongoDB.getDB();
        ////console.log(empparams);
        ////console.log(languagecode);
        var dbCollectionName = isleadtype == 0 ? MongoDB.EmployeeCollectionName : MongoDB.LeadCollectionName;
        dbo.collection(String(dbCollectionName)).aggregate([
            { $unwind: "$preferences" },
            { $match: empparams },
            {
                $lookup: {
                    from: String(MongoDB.StateCollectionName),
                    localField: 'preferences.statecode',
                    foreignField: 'statecode',
                    as: 'stateinfo'
                }
            },
            { $unwind: "$stateinfo" },
            { $unwind: "$stateinfo.state" },
            { $match: { "stateinfo.state.languagecode": Number(languagecode) } },
            {
                $project: {
                    "_id": 0,
                    "isanystate": { $ifNull: ['$preferences.isanystate', 'false'] },
                    "isanydistrict": { $ifNull: ['$preferences.isanydistrict', 'false'] },
                    "isanytaluk": { $ifNull: ['$preferences.isanytaluk', 'false'] },
                    "statecode": '$preferences.statecode', "statename": '$stateinfo.state.statename', "timeforjoiningcode": '$preferences.timeforjoiningcode', "joiningdays": '$preferences.joiningdays', "minsalary": '$preferences.minsalary', "maxsalary": '$preferences.maxsalary'
                }
            }]).toArray(function (err, empresult) {
                ////console.log("Preferences");
                //console.log(empresult);
                if (empresult != null && empresult.length > 0)
                    finalresult = empresult;
                //Job Function
                dbo.collection(String(dbCollectionName)).aggregate([
                    { $unwind: "$preferences" },
                    { $match: empparams },
                    {
                        $lookup: {
                            from: String(MongoDB.JobFunctionCollectionName),
                            localField: 'preferences.jobfunction.jobfunctioncode',
                            foreignField: 'jobfunctioncode',
                            as: 'jobfunctioninfo'
                        }
                    },
                    { $unwind: "$jobfunctioninfo" },
                    { $unwind: "$jobfunctioninfo.jobfunction" },
                    { $match: { "jobfunctioninfo.jobfunction.languagecode": Number(languagecode) } },
                    {
                        $project: {
                            "_id": 0,
                            "jobfunctioncode": '$jobfunctioninfo.jobfunctioncode', "jobfunctionname": '$jobfunctioninfo.jobfunction.jobfunctionname'
                        }
                    }]).toArray(function (err, jobfunctionresult) {
                        ////console.log("Job Function");
                        ////console.log(jobfunctionresult);
                        dbo.collection(String(dbCollectionName)).aggregate([
                            { $unwind: "$preferences" },
                            { $match: empparams },
                            {
                                $lookup: {
                                    from: String(MongoDB.JobRoleCollectionName),
                                    localField: 'preferences.jobrole.jobrolecode',
                                    foreignField: 'jobrolecode',
                                    as: 'jobroleinfo'
                                }
                            },
                            { $unwind: "$jobroleinfo" },
                            { $unwind: "$jobroleinfo.jobrole" },
                            { $match: { "jobroleinfo.jobrole.languagecode": Number(languagecode) } },
                            {
                                $project: {
                                    "_id": 0,
                                    "jobrolecode": '$jobroleinfo.jobrolecode', "jobrolename": '$jobroleinfo.jobrole.jobrolename'
                                }
                            }]).toArray(function (err, jobroleresult) {
                                ////console.log("Job Role");
                                ////console.log(jobroleresult);
                                dbo.collection(String(dbCollectionName)).aggregate([
                                    { $unwind: "$preferences" },
                                    { $match: empparams },
                                    {
                                        $lookup: {
                                            from: String(MongoDB.DistrictCollectionName),
                                            localField: 'preferences.location.locationcode',
                                            foreignField: 'districtcode',
                                            as: 'locationinfo'
                                        }
                                    },
                                    { $unwind: "$locationinfo" },
                                    { $unwind: "$locationinfo.district" },
                                    { $match: { "locationinfo.district.languagecode": Number(languagecode) } },
                                    {
                                        $project: {
                                            "_id": 0,
                                            "locationcode": '$locationinfo.districtcode', "locationname": '$locationinfo.district.districtname'
                                        }
                                    }]).toArray(function (err, locationresult) {
                                        dbo.collection(String(dbCollectionName)).aggregate([
                                            { $unwind: "$preferences" },
                                            { $match: empparams },
                                            {
                                                $lookup: {
                                                    from: String(MongoDB.TalukCollectionName),
                                                    localField: 'preferences.taluk.talukcode',
                                                    foreignField: 'talukcode',
                                                    as: 'talukinfo'
                                                }
                                            },
                                            { $unwind: "$talukinfo" },
                                            { $unwind: "$talukinfo.taluk" },
                                            { $match: { "talukinfo.taluk.languagecode": Number(languagecode) } },
                                            {
                                                $project: {
                                                    "_id": 0,
                                                    "talukcode": '$talukinfo.talukcode',
                                                    "talukname": '$talukinfo.taluk.talukname'
                                                }
                                            }]).toArray(function (err, talukresult) {
                                                ////console.log("Location");
                                                ////console.log(locationresult);
                                                dbo.collection(String(dbCollectionName)).aggregate([
                                                    { $unwind: "$preferences" },
                                                    { $match: empparams },
                                                    {
                                                        $lookup: {
                                                            from: String(MongoDB.JobTypeCollectionName),
                                                            localField: 'preferences.employementtype.employementtypecode',
                                                            foreignField: 'jobtypecode',
                                                            as: 'emptypeinfo'
                                                        }
                                                    },
                                                    { $unwind: "$emptypeinfo" },
                                                    { $unwind: "$emptypeinfo.jobtype" },
                                                    { $match: { "emptypeinfo.statuscode": objConstants.activestatus, "emptypeinfo.jobtype.languagecode": Number(languagecode) } },
                                                    {
                                                        $project: {
                                                            "_id": 0,
                                                            "employementtypecode": '$emptypeinfo.jobtypecode', "employementtypename": '$emptypeinfo.jobtype.jobtypename'
                                                        }
                                                    }]).toArray(function (err, emptyperesult) {
                                                        if (empresult != null && empresult.length > 0) {
                                                            finalresult[0].jobfunctionlist = jobfunctionresult,
                                                                finalresult[0].jobrolelist = jobroleresult,
                                                                finalresult[0].locationlist = locationresult,
                                                                finalresult[0].taluklist = talukresult;
                                                            finalresult[0].emptypelist = emptyperesult;
                                                            return callback(finalresult[0]);
                                                        }
                                                        else
                                                            return callback(finalresult);
                                                    });

                                            });
                                    });
                            });
                    });


            });
    }
    catch (e) { logger.error("Error in Employee get Preference View: " + e); }
}

exports.createzohobookcustomercontact = function (params, callback) {
    try {
        objZohoBook.insertCustomerAndContact(params, params.zohocode, function (zohoresponse) {

            if (zohoresponse) {
                return callback(zohoresponse);
            }
        });
    }
    catch (e) {
        logger.error("Error in PDF Generatoe : Employee" + e);
    }
}

//Update Employer details add zoho contact id 
exports.UpdateEmployeeZohoContactID = function (employeecode, zohocontactid, contactpersonid, callback) {
    try {
        console.log(contactpersonid, 'contactpersonid')
        const dbo = MongoDB.getDB();
        if (zohocontactid != null && zohocontactid != "") {
            var matchparam = {};
            matchparam = { "employeecode": Number(employeecode) };
            dbo.collection(MongoDB.EmployeeCollectionName).updateOne(matchparam,
                { $set: { "zohocontactid": zohocontactid, "zohocontactpersonid": contactpersonid } }, function (err, res) {
                    if (err) {
                        throw (err)
                    }
                    // console.log(res)
                    return callback(res);

                });
        }

    }
    catch (e) {
        logger.error("Error in Update statuscode - Employer Management " + e);
    }
}