const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const objZohoBook = require('../process/zohobook_razorpay_process_controller');
exports.UpdateStatuscodeInEmployer = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Update Statuscode: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        objUtilities.InsertLog(logparams, function (validlog) {
            if (validlog != null && validlog != "") {
                var matchparam = {};
                if (req.body.statuscode == objConstants.activestatus) {
                    // Commented during Email Bounce Issue, need to approve in Manual
                    matchparam = { "employercode": Number(req.query.employercode), "statuscode": objConstants.pendingstatus, "verificationstatus": objConstants.verifiedstatus };
                    //matchparam = { "employercode": Number(req.query.employercode), "statuscode": objConstants.pendingstatus, "verificationstatus": objConstants.verificationstatus };
                }
                else {
                    matchparam = { "employercode": Number(req.query.employercode), "statuscode": objConstants.pendingstatus };
                }
                dbo.collection(MongoDB.EmployerCollectionName).updateOne(matchparam, { $set: { "statuscode": Number(req.body.statuscode), "remarks": req.body.remarks, "checkerid": validlog, "updateddate": milliseconds, "approveddate": milliseconds } }, function (err, res) {
                    if (err)
                        throw (err)
                    ////console.log(res.modifiedCount)
                    return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);

                });
            }

        });

    }
    catch (e) {
        logger.error("Error in Update statuscode - Employer Management " + e);
    }
}

exports.DeleteEmployer = function (logparams, req, callback) {
    try {
        logger.info("Log in Delete Employer: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        objUtilities.InsertLog(logparams, function (validlog) {
            if (validlog != null && validlog != "") {
                objUtilities.getcurrentmilliseconds(function (currenttime) {
                    var matchparam = { "employercode": Number(req.body.employercode) };
                    if (Number(req.body.statuscode) == objConstants.deletestatus) {
                        dbo.collection(MongoDB.EmployerCollectionName).updateOne(matchparam, { $set: { "statuscode": Number(req.body.statuscode), "oldstatuscode": Number(req.body.currentstatuscode), "deletedon": currenttime } }, function (err, res) {
                            if (err)
                                throw (err)
                            ////console.log(res.modifiedCount)
                            return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);

                        });
                    }
                    else {
                        dbo.collection(MongoDB.EmployerCollectionName).updateOne(matchparam, { $set: { "statuscode": Number(req.body.statuscode), "oldstatuscode": 0, "recoveredon": currenttime } }, function (err, res) {
                            if (err)
                                throw (err)
                            ////console.log(res.modifiedCount)
                            return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);

                        });
                    }
                });

            }

        });

    }
    catch (e) {
        logger.error("Error in Update statuscode - Employer Management " + e);
    }
}

exports.UpdateEmailIdInEmployer = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Update Email: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        objUtilities.InsertLog(logparams, function (validlog) {
            if (validlog != null && validlog != "") {
                dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.body.employercode) }, { $set: { "verificationstatus": objConstants.verificationstatus, "oldverificationstatus": req.body.oldverificationstatus, "changed_email": req.body.registered_email, "updatedid": validlog, "updateddate": milliseconds } }, function (err, res) {
                    if (err)
                        throw (err)
                    ////console.log(res.modifiedCount)
                    return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);

                });
            }

        });

    }
    catch (e) {
        logger.error("Error in Update statuscode - Employer Management " + e);
    }
}

exports.DeleteNewEmailIdInEmployer = function (logparams, req, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in Delete Email: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        objUtilities.InsertLog(logparams, function (validlog) {
            if (validlog != null && validlog != "") {
                dbo.collection(MongoDB.EmployerCollectionName).updateOne({ "employercode": Number(req.body.employercode) }, { $set: { "verificationstatus": req.body.oldverificationstatus, "changed_email": '', "updatedid": validlog, "updateddate": milliseconds } }, function (err, res) {
                    if (err)
                        throw (err)
                    ////console.log(res.modifiedCount)
                    return callback(res.modifiedCount == 0 ? res.matchedCount : res.modifiedCount);

                });
            }

        });

    }
    catch (e) {
        logger.error("Error in Update statuscode - Employer Management " + e);
    }
}

exports.EmployerFormLoad = function (logparams, langparams, callback) {
    try {
        var finalresult;
        const dbo = MongoDB.getDB();
        logger.info("Log in Employer Form Load : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);

        // //console.log(langparams);
        dbo.collection(MongoDB.FacilityCollectionName).aggregate([
            { $unwind: '$facility' },
            { $match: { statuscode: objConstants.activestatus, 'facility.languagecode': Number(langparams) } },
            {
                $sort: {
                    'facility.facilityname': 1
                }
            },
            {
                $project: {
                    _id: 0, facilitycode: 1, facilityname: '$facility.facilityname'
                }
            }
        ]).toArray(function (err, facilityresult) {
            // //console.log(facilityresult);
            dbo.collection(MongoDB.IndustryCollectionName).aggregate([
                { $unwind: '$industry' },
                { $match: { 'industry.languagecode': Number(langparams), statuscode: objConstants.activestatus } },
                {
                    $sort: {
                        'industry.industryname': 1
                    }
                },
                {
                    $project: {
                        _id: 0, industrycode: 1, industryname: '$industry.industryname'
                    }
                }
            ]).toArray(function (err, industryresult) {
                dbo.collection(MongoDB.CompanyTypeCollectionName).aggregate([
                    { $unwind: '$companytype' },
                    { $match: { 'companytype.languagecode': Number(langparams), statuscode: parseInt(objConstants.activestatus) } },
                    {
                        $sort: {
                            'ordervalue': 1
                        }
                    },
                    {
                        $project: { _id: 0, companytypecode: 1, companytypename: '$companytype.companytypename', ordervalue: 1 }
                    }
                ]).toArray(function (err, companyresult) {
                    dbo.collection(MongoDB.JobPackageCollectionName).aggregate([
                        { $unwind: '$package' },
                        { $match: { 'package.languagecode': Number(langparams), statuscode: parseInt(objConstants.activestatus) } },
                        {
                            $sort: {
                                'package.packagename': 1
                            }
                        },
                        {
                            $project: { _id: 0, packagecode: 1, packagename: '$package.packagename' }
                        }
                    ]).toArray(function (err, packageresult) {
                        dbo.collection(MongoDB.UserCollectionName).aggregate([
                            { $match: { statuscode: parseInt(objConstants.activestatus) } },
                            {
                                $sort: {
                                    username: 1
                                }
                            },
                            {
                                $project: { _id: 0, usercode: 1, username: 1, nameoftheuser: 1, designationcode: 1, userrolecode: 1 }
                            }
                        ]).toArray(function (err, userresult) {
                            dbo.collection(MongoDB.LoginActivityCollectionName).aggregate([
                                { $match: { statuscode: parseInt(objConstants.activestatus) } },
                                {
                                    $sort: {
                                        activitycode: 1
                                    }
                                },
                                {
                                    $project: { _id: 0, activitycode: 1, activityname: 1, value: 1 }
                                }
                            ]).toArray(function (err, activityresult) {
                                dbo.collection(MongoDB.KonwnFromCollectionName).aggregate([
                                    { $unwind: '$knownfrom' },
                                    { $match: { 'knownfrom.languagecode': Number(langparams), statuscode: parseInt(objConstants.activestatus) } },
                                    {
                                        $sort: {
                                            'ordervalue': 1
                                        }
                                    },
                                    {
                                        $project: { _id: 0, knownfromcode: 1, knownfromname: '$knownfrom.knownfromname', isneedinput: 1, isuser: 1, ordervalue: 1 }
                                    }
                                ]).toArray(function (err, knownresult) {
                                    dbo.collection(MongoDB.EmployerTypeCollectionName).aggregate([
                                        { $unwind: '$employertype' },
                                        { $match: { 'employertype.languagecode': Number(langparams), statuscode: parseInt(objConstants.activestatus) } },
                                        {
                                            $sort: {
                                                'employertype.employertypename': 1
                                            }
                                        },
                                        {
                                            $project: { _id: 0, employertypecode: 1, employertypename: '$employertype.employertypename' }
                                        }
                                    ]).toArray(function (err, employertyperesult) {
                                        dbo.collection(MongoDB.TurnOverSlabCollectionName).aggregate([
                                            { $unwind: '$slabs' },
                                            { $match: { statuscode: objConstants.activestatus, 'slabs.languagecode': Number(langparams) } },
                                            {
                                                $sort: {
                                                    'slabcode': 1
                                                }
                                            },
                                            {
                                                $project: {
                                                    _id: 0, slabcode: 1, slabname: '$slabs.slabname'
                                                }
                                            }
                                        ]).toArray(function (err, turnoverslabresult) {
                                            dbo.collection(MongoDB.ChatTypeCollectionName).aggregate([
                                                { $match: { $and: [{ statuscode: parseInt(objConstants.activestatus) }, { chattypecode: { $in: [2, 3] } }] } },
                                                {
                                                    $sort: {
                                                        chattypecode: 1
                                                    }
                                                },
                                                {
                                                    $project: { _id: 0, chattypecode: 1, chattypename: 1 }
                                                }
                                            ]).toArray(function (err, chattyperesult) {
                                                dbo.collection(MongoDB.DocumentTypeCollectionName).aggregate([
                                                    { $unwind: '$documenttype' },
                                                    { $match: { statuscode: objConstants.activestatus, 'documenttype.languagecode': Number(langparams) } },
                                                    {
                                                        $sort: {
                                                            'ordervalue': 1
                                                        }
                                                    },
                                                    {
                                                        $project: {
                                                            _id: 0, documenttypecode: 1, documenttypename: '$documenttype.documenttypename', ordervalue: 1, companytypecode: 1
                                                        }
                                                    }
                                                ]).toArray(function (err, documenttyperesult) {
                                                    finalresult = {
                                                        facility: facilityresult,
                                                        industry: industryresult,
                                                        companylist: companyresult,
                                                        employertypelist: employertyperesult,
                                                        packagelist: packageresult,
                                                        userlist: userresult,
                                                        activitylist: activityresult,
                                                        knownlist: knownresult,
                                                        turnoverslabresult: turnoverslabresult,
                                                        chattyperesult: chattyperesult,
                                                        documenttypelist: documenttyperesult
                                                    }

                                                    // //console.log(finalresult)
                                                    return callback(finalresult);
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
    }
    catch (e) {
        logger.error("Error in List Load - Employer Management " + e);
    }
}
exports.EmployerList = function (logparams, listparams, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in EmployerList: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        // //console.log(listparams);
        var subscription = {}, subcreateddate = {}, empcreateddate = {}, finalresult, companytypecode = {}, inactivedays = {}, activedays = {}, employertypecode = {}, locationcode = {}, jobfunctioncode = {}, industrycode = {}, statecode = {}, knowabouttypecode = {}, usercode = {}, packagecode = {}, registereddate = {};
        var sortbyparams;
        var sortbycode = listparams.sortbycode;
        if (sortbycode == 15)
            sortbyparams = { 'lastlogindate': -1, 'createddate': -1 };
        else if (sortbycode == 16)
            sortbyparams = { 'lastlogindate': 1, 'createddate': -1 };
        else if (sortbycode == 17)
            sortbyparams = { 'createddate': -1 };
        else if (sortbycode == 18)
            sortbyparams = { 'createddate': 1 };
        else
            sortbyparams = { 'lastlogindate': -1, 'createddate': -1 };
        if (listparams.issubscription == 0)
            subscription = { subscriptioncount: { $gte: 0 } };
        else
            subscription = { subscriptioncount: { $gte: 1 } };
        if (listparams.reportcode == 3 && listparams.fromdate != 0 && listparams.todate != 0) {
            subcreateddate = {
                "$and": [{ "$gte": ["$$subsinfo.createddate", listparams.fromdate] },
                { "$lte": ["$$subsinfo.createddate", listparams.todate] }]

            }
            // subcreateddate = { $and: [{ "$$subsinfo.createddate": { $gte: listparams.fromdate } }, { "$$subsinfo.createddate": { $lte: listparams.todate } }] }
            // //console.log(subcreateddate)
        }
        else if (listparams.fromdate != 0 && listparams.todate != 0) {
            empcreateddate = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { lastlogindate: { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { lastlogindate: { $gte: milliseconds } };
            //    console.log(activedays);
        }
        if (listparams.employertypecode.length > 0)
            employertypecode = { 'employertypecode': { $in: listparams.employertypecode } };
        if (listparams.knowabouttypecode.length > 0)
            knowabouttypecode = { 'knowabouttypecode': { $in: listparams.knowabouttypecode } };
        if (listparams.usercode.length > 0)
            usercode = { 'usercode': { $in: listparams.usercode } };
        if (listparams.companytypecode.length > 0)
            companytypecode = { 'companytypecode': { $in: listparams.companytypecode } };
        if (listparams.industrycode.length > 0)
            industrycode = { 'industrycode': { $in: listparams.industrycode } };
        if (listparams.locationcode.length > 0)
            locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        if (listparams.jobfunctioncode.length > 0)
            jobfunctioncode = { 'preferences.jobfunction.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.statecode.length > 0)
            statecode = { 'contactinfo.statecode': { $in: listparams.statecode } };
        if (listparams.packagecode.length > 0) {
            packagecode = { 'subscriptioninfo.packagecode': { $in: listparams.packagecode } };
            // //console.log(packagecode)
        }
        var statuscode = {}, searchvalue = {}, languagecode = {}, profilestatus = {}, registervia = {};
        if (listparams.searchvalue != "") {
            searchvalue = {
                $or: [{ registeredname: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { gstn: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { pan: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { aadhaarno: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { registered_email: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { 'contactinfo.mobileno': { $regex: '^' + listparams.searchvalue, $options: 'i' } }]
            };
        }
        if ((listparams.registervia) == 1) { registervia = { 'registervia': 1 }; }
        else if ((listparams.registervia) == 2) { registervia = { 'registervia': 2 }; }
        if ((listparams.statuscode) == 0) { statuscode = { 'statuscode': { $ne: objConstants.deletestatus } }; }
        else if ((listparams.statuscode) == -1) { statuscode = { $or: [{ 'statuscode': objConstants.pendingstatus }, { 'statuscode': objConstants.rejectedstatus }] }; }
        else if ((listparams.statuscode) == -2) { statuscode = { 'statuscode': { $nin: [objConstants.pendingstatus, objConstants.rejectedstatus, objConstants.deletestatus] } }; }
        else { statuscode = { 'statuscode': parseInt(listparams.statuscode) }; }
        if ((listparams.profilestatus) != 0) {
            if ((listparams.profilestatus) == 2) {
                profilestatus = { $or: [{ 'profilestatus': { $exists: false } }, { 'profilestatus': parseInt(listparams.profilestatus) }] };
            } else {
                profilestatus = { 'profilestatus': parseInt(listparams.profilestatus) };
            }
        }
        var languagecodecondition = {};
        if (listparams.languagecode && (listparams.languagecode) != 0)
            languagecodecondition = { 'preferredlanguagecode': listparams.languagecode };
        if (listparams.registeredfrom > 0 && listparams.registeredto > 0) {
            registereddate = { $and: [{ createddate: { $gte: listparams.registeredfrom } }, { createddate: { $lte: listparams.registeredto } }] };
        }
        var matchparams = {
            $and: [profilestatus, languagecodecondition, inactivedays,
                employertypecode, searchvalue, industrycode, companytypecode,
                statuscode,
                activedays, locationcode, jobfunctioncode, statecode,
                knowabouttypecode, usercode, empcreateddate, registervia,registereddate
            ]
        };
        //(JSON.stringify(matchparams))
        if (matchparams != "") {
            dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                { $match: matchparams },
                {
                    $lookup: {
                        from: String(MongoDB.JobPackageSubscriptionCollectionName),
                        localField: 'employercode',
                        foreignField: 'employercode',
                        as: 'subscriptioninfo'
                    }
                },
                {
                    "$addFields": {
                        "subscriptioninfo": {
                            "$filter": {
                                "input": "$subscriptioninfo",
                                "as": "subsinfo",
                                "cond": subcreateddate
                            }
                        }
                    }
                },
                { $match: packagecode },
                { $set: { "count": { "$size": '$subscriptioninfo' } } },

                {
                    $project: {
                        _id: 0, employercode: 1, registeredname: 1, companytypecode: 1, employertypecode: 1, industrycode: 1, registered_email: 1, contactinfo: 1, website: 1, knowabouttypecode: 1, gstn: 1, gstnurl: 1, pan: 1, others: 1, usercode: 1,
                        panurl: 1, aadhaarno: 1, aadhaarnourl: 1, documentdetails: 1, facilities_offered: 1, preferences: 1, aboutcompany: 1, preferences: 1, turnovercode: 1, noofemployees: 1, gallery: 1, statuscode: 1, profileurl: 1, password: 1, remarks: 1,
                        subscriptioncount: "$count", branch: 1,
                        createddate: 1, approveddate: 1, verificationstatus: 1, oldverificationstatus: 1, changed_email: 1,
                        registervia: 1, oldstatuscode: 1, deletedon: 1, recoveredon: 1, profilestatus: 1,
                        completedon: 1, lastlogindate: 1, zohocontactid: 1
                    }
                },
                { $match: subscription },
                { $sort: sortbyparams },
                { $skip: parseInt(listparams.skipvalue) },
                { $limit: parseInt(listparams.limitvalue) }
            ]).toArray(function (err, result) {
                //console.log(result.length)
                finalresult = result;
                return callback(finalresult);
            });
        }
        else {
            return callback(finalresult);
        }
    }
    catch (e) {

    }
}

exports.EmployerListFilter = function (logparams, listparams, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in EmployerList: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        // //console.log(listparams);
        var subscription = {}, subcreateddate = {}, empcreateddate = {}, finalresult, companytypecode = {}, inactivedays = {}, activedays = {}, employertypecode = {}, locationcode = {}, jobfunctioncode = {}, industrycode = {}, statecode = {}, knowabouttypecode = {}, usercode = {}, packagecode = {}, registereddate = {};
        var sortbyparams;
        var sortbycode = listparams.sortbycode;
        if (sortbycode == 15)
            sortbyparams = { 'lastlogindate': -1, 'createddate': -1 };
        else if (sortbycode == 16)
            sortbyparams = { 'lastlogindate': 1, 'createddate': -1 };
        else if (sortbycode == 17)
            sortbyparams = { 'createddate': -1 };
        else if (sortbycode == 18)
            sortbyparams = { 'createddate': 1 };
        else
            sortbyparams = { 'lastlogindate': -1, 'createddate': -1 };
        if (listparams.issubscription == 0)
            subscription = { subscriptioncount: { $gte: 0 } };
        else
            subscription = { subscriptioncount: { $gte: 1 } };
        if (listparams.reportcode == 3 && listparams.fromdate != 0 && listparams.todate != 0) {
            subcreateddate = {
                "$and": [{ "$gte": ["$$subsinfo.createddate", listparams.fromdate] },
                { "$lte": ["$$subsinfo.createddate", listparams.todate] }]

            }
            // subcreateddate = { $and: [{ "$$subsinfo.createddate": { $gte: listparams.fromdate } }, { "$$subsinfo.createddate": { $lte: listparams.todate } }] }
            // //console.log(subcreateddate)
        }
        else if (listparams.fromdate != 0 && listparams.todate != 0) {
            empcreateddate = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { lastlogindate: { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { lastlogindate: { $gte: milliseconds } };
            //    console.log(activedays);
        }
        if (listparams.employertypecode.length > 0)
            employertypecode = { 'employertypecode': { $in: listparams.employertypecode } };
        if (listparams.knowabouttypecode.length > 0)
            knowabouttypecode = { 'knowabouttypecode': { $in: listparams.knowabouttypecode } };
        if (listparams.usercode.length > 0)
            usercode = { 'usercode': { $in: listparams.usercode } };
        if (listparams.companytypecode.length > 0)
            companytypecode = { 'companytypecode': { $in: listparams.companytypecode } };
        if (listparams.industrycode.length > 0)
            industrycode = { 'industrycode': { $in: listparams.industrycode } };
        if (listparams.locationcode.length > 0)
            locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        if (listparams.jobfunctioncode.length > 0)
            jobfunctioncode = { 'preferences.jobfunction.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.statecode.length > 0)
            statecode = { 'contactinfo.statecode': { $in: listparams.statecode } };
        if (listparams.packagecode.length > 0) {
            packagecode = { 'subscriptioninfo.packagecode': { $in: listparams.packagecode } };
            // //console.log(packagecode)
        }
        var statuscode = {}, searchvalue = {}, languagecode = {}, profilestatus = {}, registervia = {};
        if (listparams.searchvalue != "") {
            searchvalue = {
                $or: [{ registeredname: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { gstn: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { pan: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { aadhaarno: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { registered_email: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { 'contactinfo.mobileno': { $regex: '^' + listparams.searchvalue, $options: 'i' } }]
            };
        }
        // if ((listparams.registervia) == 1) { registervia = { 'registervia': 1 }; }
        // else if ((listparams.registervia) == 2) { registervia = { 'registervia': 2 }; }
        if ((listparams.statuscode) == objConstants.deletestatus)
            statuscode = { 'statuscode': { $eq: objConstants.deletestatus } };
        else
            statuscode = { 'statuscode': { $ne: objConstants.deletestatus } };
        if ((listparams.profilestatus) != 0) {
            if ((listparams.profilestatus) == 2) {
                profilestatus = { $or: [{ 'profilestatus': { $exists: false } }, { 'profilestatus': parseInt(listparams.profilestatus) }] };
            } else {
                profilestatus = { 'profilestatus': parseInt(listparams.profilestatus) };
            }
        }
        var languagecodecondition = {};
        if (listparams.languagecode && (listparams.languagecode) != 0)
            languagecodecondition = { 'preferredlanguagecode': listparams.languagecode };
        if (listparams.registeredfrom > 0 && listparams.registeredto > 0) {
            registereddate = { $and: [{ createddate: { $gte: listparams.registeredfrom } }, { createddate: { $lte: listparams.registeredto } }] };
        }
        var matchparams = {
            $and: [profilestatus, languagecodecondition, inactivedays,
                employertypecode, searchvalue, industrycode, companytypecode,
                statuscode,
                activedays, locationcode, jobfunctioncode, statecode,
                knowabouttypecode, usercode, empcreateddate, registervia,registereddate
            ]
        };
        //  console.log(matchparams)
        if (matchparams != "") {
            dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                { $match: matchparams },                
                {
                    $project: {
                        _id: 0, employercode: 1, registervia: 1, statuscode: 1
                    }
                }
            ]).toArray(function (err, employerlist) {
                if (employerlist != null && employerlist.length > 0) {
                    var activecount, inactivecount, blockcount, pendingcount , rejectedcount , regviaapp, regviaportal , totalcount =0;
                    activecount = employerlist.filter(t => t.statuscode == objConstants.activestatus);
                    inactivecount = employerlist.filter(t => t.statuscode == objConstants.inactivestatus);
                    blockcount = employerlist.filter(t => t.statuscode == objConstants.blockstatus);
                    pendingcount = employerlist.filter(t => t.statuscode == objConstants.pendingstatus);
                    rejectedcount = employerlist.filter(t => t.statuscode == objConstants.rejectedstatus);
                    regviaapp = employerlist.filter(t => t.registervia == 1 && t.statuscode != objConstants.pendingstatus);
                    regviaportal = employerlist.filter(t => t.registervia == 2 && t.statuscode != objConstants.pendingstatus);
                    totalcount = activecount.length + inactivecount.length + blockcount.length + pendingcount.length + rejectedcount.length;
                    //var percentage = {"percentagetext": "20 %","percentagevalue": 20,"percentagecount":percentage_20.length};
                    var finalresult=[];
                    finalresult.push(activecount.length);
                    finalresult.push(inactivecount.length);
                    finalresult.push(blockcount.length);
                    finalresult.push(pendingcount.length);
                    finalresult.push(rejectedcount.length);
                    finalresult.push(totalcount);                        
                    finalresult.push(regviaapp.length);
                    finalresult.push(regviaportal.length);
                    return callback(finalresult);
                  }
            });
        }
        else {
            return callback(finalresult);
        }
    }
    catch (e) {

    }
}

exports.EmailEmployerList = function (logparams, listparams, callback) {
    try {
        var date = new Date(); // some mock date
        var milliseconds = date.getTime();
        logger.info("Log in EmailEmployerList: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        // //console.log(listparams);
        var subscription = {}, subcreateddate = {}, empcreateddate = {}, finalresult, companytypecode = {}, inactivedays = {}, activedays = {}, employertypecode = {}, locationcode = {}, jobfunctioncode = {}, industrycode = {}, statecode = {}, knowabouttypecode = {}, usercode = {}, packagecode = {};
        var sortbyparams;
        var sortbycode = listparams.sortbycode;
        if (sortbycode == 15)
            sortbyparams = { 'lastlogindate': -1, 'createddate': -1 };
        else if (sortbycode == 16)
            sortbyparams = { 'lastlogindate': 1, 'createddate': -1 };
        else if (sortbycode == 17)
            sortbyparams = { 'createddate': -1 };
        else if (sortbycode == 18)
            sortbyparams = { 'createddate': 1 };
        else
            sortbyparams = { 'lastlogindate': -1, 'createddate': -1 };
        if (listparams.issubscription == 0)
            subscription = { subscriptioncount: { $gte: 0 } };
        else
            subscription = { subscriptioncount: { $gte: 1 } };
        if (listparams.reportcode == 3 && listparams.fromdate != 0 && listparams.todate != 0) {
            subcreateddate = {
                "$and": [{ "$gte": ["$$subsinfo.createddate", listparams.fromdate] },
                { "$lte": ["$$subsinfo.createddate", listparams.todate] }]

            }
            // subcreateddate = { $and: [{ "$$subsinfo.createddate": { $gte: listparams.fromdate } }, { "$$subsinfo.createddate": { $lte: listparams.todate } }] }
            // //console.log(subcreateddate)
        }
        else if (listparams.fromdate != 0 && listparams.todate != 0) {
            empcreateddate = { $and: [{ "createddate": { $gte: listparams.fromdate } }, { "createddate": { $lte: listparams.todate } }] }
            ////console.log(empcreateddate)
        }
        if (listparams.inactivedays > 0) {
            date.setDate(date.getDate() - listparams.inactivedays);
            var milliseconds = date.getTime();
            inactivedays = { lastlogindate: { $lte: milliseconds } };
        }
        if (listparams.activedays > 0) {
            date.setDate(date.getDate() - listparams.activedays);
            var milliseconds = date.getTime();
            activedays = { lastlogindate: { $gte: milliseconds } };
            //    console.log(activedays);
        }
        if (listparams.employertypecode.length > 0)
            employertypecode = { 'employertypecode': { $in: listparams.employertypecode } };
        if (listparams.knowabouttypecode.length > 0)
            knowabouttypecode = { 'knowabouttypecode': { $in: listparams.knowabouttypecode } };
        if (listparams.usercode.length > 0)
            usercode = { 'usercode': { $in: listparams.usercode } };
        if (listparams.companytypecode.length > 0)
            companytypecode = { 'companytypecode': { $in: listparams.companytypecode } };
        if (listparams.industrycode.length > 0)
            industrycode = { 'industrycode': { $in: listparams.industrycode } };
        if (listparams.locationcode.length > 0)
            locationcode = { 'preferences.location.locationcode': { $in: listparams.locationcode } };
        if (listparams.jobfunctioncode.length > 0)
            jobfunctioncode = { 'preferences.jobfunction.jobfunctioncode': { $in: listparams.jobfunctioncode } };
        if (listparams.statecode.length > 0)
            statecode = { 'contactinfo.statecode': { $in: listparams.statecode } };
        if (listparams.packagecode.length > 0) {
            packagecode = { 'subscriptioninfo.packagecode': { $in: listparams.packagecode } };
            // //console.log(packagecode)
        }
        var statuscode = {}, searchvalue = {}, languagecode = {}, profilestatus = {}, registervia = {};
        if (listparams.searchvalue != "") {
            searchvalue = {
                $or: [{ registeredname: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { gstn: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { pan: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { aadhaarno: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { registered_email: { $regex: '^' + listparams.searchvalue, $options: 'i' } },
                { 'contactinfo.mobileno': { $regex: '^' + listparams.searchvalue, $options: 'i' } }]
            };
        }
        if ((listparams.registervia) == 1) { registervia = { 'registervia': 1 }; }
        else if ((listparams.registervia) == 2) { registervia = { 'registervia': 2 }; }
        if ((listparams.statuscode) == 0) { statuscode = { 'statuscode': { $ne: objConstants.deletestatus } }; }
        else if ((listparams.statuscode) == -1) { statuscode = { $or: [{ 'statuscode': objConstants.pendingstatus }, { 'statuscode': objConstants.rejectedstatus }] }; }
        else if ((listparams.statuscode) == -2) { statuscode = { 'statuscode': { $nin: [objConstants.pendingstatus, objConstants.rejectedstatus, objConstants.deletestatus] } }; }
        else { statuscode = { 'statuscode': parseInt(listparams.statuscode) }; }
        if ((listparams.profilestatus) != 0) {
            if ((listparams.profilestatus) == 2) {
                profilestatus = { $or: [{ 'profilestatus': { $exists: false } }, { 'profilestatus': parseInt(listparams.profilestatus) }] };
            } else {
                profilestatus = { 'profilestatus': parseInt(listparams.profilestatus) };
            }
        }
        var languagecodecondition = {};
        if (listparams.languagecode && (listparams.languagecode) != 0)
            languagecodecondition = { 'preferredlanguagecode': listparams.languagecode };
        var matchparams = {
            $and: [profilestatus, languagecodecondition, inactivedays,
                employertypecode, searchvalue, industrycode, companytypecode,
                statuscode,
                activedays, locationcode, jobfunctioncode, statecode,
                knowabouttypecode, usercode, empcreateddate, registervia
            ]
        };
        //  console.log(matchparams)
        if (matchparams != "") {
            dbo.collection(MongoDB.EmployerCollectionName).aggregate([
                { $match: matchparams },
                // {
                //     $lookup: {
                //         from: String(MongoDB.JobPackageSubscriptionCollectionName),
                //         localField: 'employercode',
                //         foreignField: 'employercode',
                //         as: 'subscriptioninfo'
                //     }
                // },
                // {
                //     "$addFields": {
                //         "subscriptioninfo": {
                //             "$filter": {
                //                 "input": "$subscriptioninfo",
                //                 "as": "subsinfo",
                //                 "cond": subcreateddate
                //             }
                //         }
                //     }
                // },
                // { $match: packagecode },
                // { $set: { "count": { "$size": '$subscriptioninfo' } } },

                {
                    $project: {
                        _id: 0, 
                        employercode: 1, 
                        registeredname: 1, 
                        // companytypecode: 1, employertypecode: 1, industrycode: 1, 
                        registered_email: 1, 
                        // contactinfo: 1, website: 1, knowabouttypecode: 1, gstn: 1, gstnurl: 1, pan: 1, others: 1, usercode: 1,
                        // panurl: 1, aadhaarno: 1, aadhaarnourl: 1, documentdetails: 1, facilities_offered: 1, preferences: 1, aboutcompany: 1, preferences: 1, turnovercode: 1, noofemployees: 1, gallery: 1, statuscode: 1, profileurl: 1, password: 1, remarks: 1,
                        // subscriptioncount: "$count", branch: 1,
                        createddate: 1, approveddate: 1, verificationstatus: 1, oldverificationstatus: 1, changed_email: 1,
                        registervia: 1, oldstatuscode: 1, deletedon: 1, recoveredon: 1, profilestatus: 1,
                        completedon: 1, lastlogindate: 1, zohocontactid: 1
                    }
                },
                // { $match: subscription },
                { $sort: { "createddate": -1 } },
                { $sort: sortbyparams },
                // { $skip: parseInt(listparams.skipvalue) },
                // { $limit: parseInt(listparams.limitvalue) }
            ]).toArray(function (err, result) {
                finalresult = result;
                return callback(finalresult);
            });
        }
        else {
            return callback(finalresult);
        }
    }
    catch (e) {

    }
}

exports.checkvalidemployer = function (req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        var empparams = { employercode: Number(req.query.employercode) };
        dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, employercode: 1 } }).toArray(function (err, result) {
            if (result.length > 0)
                res = true;
            else
                res = false;
            // //console.log(result);
            return callback(res);
        });
    }
    catch (ex) {
        logger.error(ex.message);
    }
}
exports.FindEmployerMailID = function (req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        var empparams = { employercode: Number(req.query.employercode) };
        dbo.collection(MongoDB.EmployerCollectionName).find(empparams, { projection: { _id: 0, registered_email: 1 } }).toArray(function (err, result) {
            if (err) throw err;
            // //console.log(result);
            return callback(result);
        });
    }
    catch (ex) {
        logger.error(ex.message);
    }
}



exports.GetEmployerDetails = function (req, callback) {
    try {
        const dbo = MongoDB.getDB();
        var res;
        var empparams = { employercode: Number(req.query.employercode) };
        dbo.collection(MongoDB.EmployerCollectionName).aggregate(
            [
                { $match: empparams },
                { $unwind: '$contactinfo' },
                {
                    $project: {
                        item: 1,
                        registeredname: { $ifNull: ["$registeredname", ""] },
                        website: { $ifNull: ["$website", ""] },
                        mobileno: { $ifNull: ["$contactinfo.mobileno", ""] },
                        registered_email: { $ifNull: ["$registered_email", ""] },
                        telephoneno: { $ifNull: ["$contactinfo.telephoneno", ""] },
                        zohocontactid: { $ifNull: ["$zohocontactid", ""] },
                        zohocontactpersonid: { $ifNull: ["$zohocontactpersonid", ""] },
                    }
                }
            ]
        ).toArray(function (err, result) {
            return callback(result);
        });
    }
    catch (ex) {
        logger.error(ex.message);
    }
}


//Create customer and contact details
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
exports.UpdateEmployerZohoContactID = function (employercode, zohocontactid, contactpersonid, callback) {
    try {
        console.log(contactpersonid, 'contactpersonid')
        const dbo = MongoDB.getDB();
        if (zohocontactid != null && zohocontactid != "") {
            var matchparam = {};
            matchparam = { "employercode": Number(employercode) };
            dbo.collection(MongoDB.EmployerCollectionName).updateOne(matchparam,
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