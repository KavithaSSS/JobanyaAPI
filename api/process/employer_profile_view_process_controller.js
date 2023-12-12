'use strict';
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const objConstants = require('../../config/constants');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const objUtilities = require("../controller/utilities");
const { param } = require('../controller');
const objgovtidentity = require('./employer_profile_process_controller');
const objBranch = require('./employer_branch_process_controller');

const { stringify } = require('circular-json');

exports.getProfileView = function (logparams, params, languagecode, callback) {
    const dbo = MongoDB.getDB();
    var finalresult;

    //  console.log(params,'empparams');
    ////console.log(languagecode);
    var empparams = {"employercode": Number(params.employercode)};
    getCompanyProfileinfo(empparams, languagecode, function (compprofile) { 
        exports.getContactinfo(empparams, languagecode, function (contactres) { 
            getCompanyinfo(empparams, languagecode, function (companyres) { 
                getPreferenceView(empparams, languagecode, function (preferenceres) { 
                    objgovtidentity.getGovtInfo(logparams, empparams, function (govtres) { 
                        var branchparam = {"employercode": params.employercode, "languagecode": languagecode};
                        objBranch.getBranchList(logparams, branchparam, function (branchres) { 
                            finalresult = {
                                "profileinfo": compprofile,
                                "contactinfo": contactres,
                                "companyinfo": companyres,
                                "preferences": preferenceres,
                                "govtidentification": govtres,
                                "branchlist": branchres
                            }
                            // //console.log(finalresult);
                            return callback(finalresult);
                         
                            ////console.log(preferenceres);

                        });
                    })
                });

            });
        });
    });
    logger.info("Log in Employer Profile View : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
    //onsole.log(emptypeparams);

}

function getCompanyProfileinfo(empparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = [];
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { "$match": empparams},
            { "$lookup": 
                { 
                    "from": String(MongoDB.IndustryCollectionName),
                    "localField": "industrycode",
                    "foreignField": "industrycode",
                    "as": "industryinfo"
                }
            },
            { "$lookup": 
                {
                    "from": String(MongoDB.StatusCollectionName),
                    "localField": "statuscode",
                    "foreignField": "statuscode",
                    "as": "statusinfo"
                }
            },
            { "$lookup": 
                {
                    "from":String(MongoDB.CompanyTypeCollectionName),
                    "localField": "companytypecode",
                    "foreignField": "companytypecode",
                    "as": "companytypeinfo"
                }
            },
            { "$lookup": 
                {
                    "from":String(MongoDB.EmployerTypeCollectionName),
                    "localField": "employertypecode",
                    "foreignField": "employertypecode",
                    "as": "employertypeinfo"
                }
            },
            { "$lookup": 
                {
                    "from": String(MongoDB.KonwnFromCollectionName),
                    "localField": "knowabouttypecode",
                    "foreignField": "knownfromcode",
                    "as": "knowntypeinfo"
                }
            },
            { "$lookup": 
                {
                    "from": String(MongoDB.ActivityCollectionName),
                    "localField": "activitytypecode",
                    "foreignField": "activitytypecode",
                    "as": "activitytypeinfo"
                }
            },
            {$unwind:"$industryinfo"},
            {$unwind:"$industryinfo.industry"},
            {$match: {"industryinfo.industry.languagecode": Number(languagecode)}},
            {$unwind:"$statusinfo"},
            {$unwind:"$companytypeinfo"},
            {$unwind:"$companytypeinfo.companytype"},
            {$match: {"companytypeinfo.companytype.languagecode": Number(languagecode)}},
            {$unwind:"$employertypeinfo"},
            {$unwind:"$employertypeinfo.employertype"},
            {$match: {"employertypeinfo.employertype.languagecode": Number(languagecode)}},
            {$unwind:"$knowntypeinfo"},
            {$unwind:"$knowntypeinfo.knownfrom"},
            {$match: {"knowntypeinfo.knownfrom.languagecode": Number(languagecode)}},
           
            {$unwind: {path:'$activitytypeinfo',preserveNullAndEmptyArrays: true }  },
	        {$unwind: {path:'$activitytypeinfo.activitytype',preserveNullAndEmptyArrays: true }  },
	        { $match: { $or: [{ "activitytypeinfo.activitytype.languagecode": { $exists: false } }, { "activitytypeinfo.activitytype.languagecode": "" }, { "activitytypeinfo.activitytype.languagecode": Number(languagecode) }] } },
	
            {"$project": {_id:0, employercode:1,profileurl:1, registeredname:1, industrycode:1, industryname: '$industryinfo.industry.industryname', companytypecode:1, knowabouttypecode:1,
            companytypename:'$companytypeinfo.companytype.companytypename',employertypename:'$employertypeinfo.employertype.employertypename',knowabouttypename:'$knowntypeinfo.knownfrom.knownfromname',
            employertypecode:1, registered_email:1, statuscode:1, statusname:'$statusinfo.statusname', createddate:1, approveddate:1,remarks:1, gallery:1,verificationstatus:1, oldverificationstatus:1, changed_email:1, registervia:1,lastlogindate:1,
            preferredlanguagecode:{ $ifNull:[ '$preferredlanguagecode',objConstants.defaultlanguagecode]},activitytypecode:{ $ifNull:[ '$activitytypecode',0]}, activitytypename: { $ifNull:[ '$activitytypeinfo.activitytype.activitytypename','']}
        }}
            ]).toArray(function (err, empresult) {
                if (empresult != null && empresult.length > 0)
                    return callback(empresult);
                else
                    return callback(finalresult);

            });
    }
    catch (e) { logger.error("Error in Employer get Profile Info View: " + e); }
}

exports.getContactinfo = function (empparams, languagecode, callback) {
//function getContactinfo(empparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = [];
        ////console.log(empparams);
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { "$match": empparams},
            {$unwind:"$contactinfo"},
            {
                $lookup: {
                    from: String(MongoDB.TalukCollectionName),
                    localField: 'contactinfo.talukcode',
                    foreignField: 'talukcode',
                    as: 'talukinfo'
                }
            },
            {$unwind: {path:'$talukinfo',preserveNullAndEmptyArrays: true }  },
            {$unwind: {path:'$talukinfo.taluk',preserveNullAndEmptyArrays: true }  },
            { $match: { $or: [{ "talukinfo.taluk.languagecode": { $exists: false } }, 
            { "talukinfo.taluk.languagecode": "" }, { "talukinfo.taluk.languagecode": Number(languagecode) }] } },
            {
                $lookup: {
                    from: String(MongoDB.DistrictCollectionName),
                    localField: 'talukinfo.districtcode',
                    foreignField: 'districtcode',
                    as: 'districtinfo'
                }
            },
            {$unwind: {path:'$districtinfo',preserveNullAndEmptyArrays: true }  },
            {$unwind: {path:'$districtinfo.district',preserveNullAndEmptyArrays: true }  },
            { $match: { $or: [{ "districtinfo.district.languagecode": { $exists: false } }, { "districtinfo.district.languagecode": "" }, { "districtinfo.district.languagecode": Number(languagecode) }] } },
            {
                $lookup: {
                    from: String(MongoDB.StateCollectionName),
                    localField: 'districtinfo.statecode',
                    foreignField: 'statecode',
                    as: 'stateinfo'
                }
            },
            {$unwind: {path:'$stateinfo',preserveNullAndEmptyArrays: true }  },
            {$unwind: {path:'$stateinfo.state',preserveNullAndEmptyArrays: true }  },
            { $match: { $or: [{ "stateinfo.state.languagecode": { $exists: false } }, { "stateinfo.state.languagecode": "" }, { "stateinfo.state.languagecode": Number(languagecode) }] } },
            
{"$project": {_id:0, statecode:'$districtinfo.statecode', statename:'$stateinfo.state.statename', districtcode:'$talukinfo.districtcode', 
districtname: '$districtinfo.district.districtname', cityname:'$contactinfo.cityname', pincode:'$contactinfo.pincode',
companyaddress:'$contactinfo.companyaddress',latitude:'$contactinfo.latitude',longitude:'$contactinfo.longitude', mobileno: '$contactinfo.mobileno',
telephoneno: '$contactinfo.telephoneno', website:1,registered_email: 1,talukcode:{ $ifNull:[ '$talukinfo.talukcode',0]},
 talukname:{ $ifNull:[ '$talukinfo.taluk.talukname','']}
}}
]).toArray(function (err, empresult) {
    //console.log("contactinfo",empresult);
                if (empresult != null && empresult.length > 0)
                    return callback(empresult);
                else
                    return callback(finalresult);

            });
    }
    catch (e) { logger.error("Error in Employer get Contact Info View: " + e); }
}

function getCompanyinfo(empparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = [];
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { "$match": empparams},
            {$unwind:"$facilities_offered"},
	{ "$lookup": 
		{
			"from": String(MongoDB.FacilityCollectionName),
			"localField": "facilities_offered.facilitycode",
			"foreignField": "facilitycode",
			"as": "facilityinfo"
		}
	},
    {
        "$lookup": {
          "from": String(MongoDB.TurnOverSlabCollectionName),
          "localField": "turnovercode",
          "foreignField": "slabcode",
          "as": "slabinfo"
        }
      },
	{$unwind:"$facilityinfo"},
    {$unwind:"$facilityinfo.facility"},
	{$match: {"facilityinfo.facility.languagecode": Number(languagecode)}},
    { $unwind: {path:'$slabinfo',preserveNullAndEmptyArrays: true }  },
      { $unwind: { path: '$slabinfo.slabs', preserveNullAndEmptyArrays: true } },
      { $match: { $or: [{ "slabinfo.slabs.languagecode": { $exists: false } }, { "slabinfo.slabs.languagecode": "" }, { "slabinfo.slabs.languagecode": Number(languagecode) }] } },
      
	{"$group":{_id: {aboutcompany: '$aboutcompany', "turnovercode": '$slabinfo.slabcode', "turnovername": '$slabinfo.slabs.slabname', noofemployees:'$noofemployees'},
	facilitycode:{ $addToSet:"$facilities_offered.facilitycode" }, facilityname: { $addToSet:"$facilityinfo.facility.facilityname"}}},
{"$project": {_id:0, aboutcompany: '$_id.aboutcompany', turnovercode:'$_id.turnovercode',turnovername:'$_id.turnovername', noofemployees:'$_id.noofemployees',
facilitycode:'$facilitycode', facilityname:'$facilityname'
}}
]).toArray(function (err, empresult) {
    // //console.log("company");
    // //console.log(empresult);
                if (empresult != null && empresult.length > 0)
                    return callback(empresult);
                else
                    return callback(finalresult);

            });
    }
    catch (e) { logger.error("Error in Employer get Company Info View: " + e); }
}

function getPreferenceView(empparams, languagecode, callback) {
    try {
        const dbo = MongoDB.getDB();
        var finalresult = [];
        // //console.log(empparams);
        dbo.collection(MongoDB.EmployerCollectionName).aggregate([
            { "$match": empparams},
            {$unwind: {path:'$preferences',preserveNullAndEmptyArrays: true }  },
{$unwind: {path:'$preferences.jobfunction',preserveNullAndEmptyArrays: true }  },
{$unwind: {path:'$preferences.jobrole',preserveNullAndEmptyArrays: true }  },
{$unwind: {path:'$preferences.location',preserveNullAndEmptyArrays: true }  },
	{ "$lookup": 
		{
			"from": String(MongoDB.JobFunctionCollectionName),
			"localField": "preferences.jobfunction.jobfunctioncode",
			"foreignField": "jobfunctioncode",
			"as": "jobfunctioninfo"
		}
	},
	{ "$lookup": 
		{
			"from":  String(MongoDB.JobRoleCollectionName),
			"localField": "preferences.jobrole.jobrolecode",
			"foreignField": "jobrolecode",
			"as": "jobroleinfo"
		}
	},
	{ "$lookup": 
		{
			"from":  String(MongoDB.DistrictCollectionName),
			"localField": "preferences.location.locationcode",
			"foreignField": "districtcode",
			"as": "districtinfo"
		}
    },
    { "$lookup": 
        {
            "from":  String(MongoDB.TalukCollectionName),
            "localField": "preferences.taluk.talukcode",
            "foreignField": "talukcode",
            "as": "talukinfo"
        }
    },
	{ "$lookup": 
		{
			"from":  String(MongoDB.StateCollectionName),
			"localField": "preferences.statecode",
			"foreignField": "statecode",
			"as": "stateinfo"
		}
	},
	{$unwind: {path:'$jobfunctioninfo',preserveNullAndEmptyArrays: true }  },
	{$unwind: {path:'$jobfunctioninfo.jobfunction',preserveNullAndEmptyArrays: true }  },
	{ $match: { $or: [{ "jobfunctioninfo.jobfunction.languagecode": { $exists: false } }, { "jobfunctioninfo.jobfunction.languagecode": "" }, { "jobfunctioninfo.jobfunction.languagecode": Number(languagecode) }] } },
	
	{$unwind: {path:'$jobroleinfo',preserveNullAndEmptyArrays: true }  },
	{$unwind: {path:'$jobroleinfo.jobrole',preserveNullAndEmptyArrays: true }  },
	{ $match: { $or: [{ "jobroleinfo.jobrole.languagecode": { $exists: false } }, { "jobroleinfo.jobrole.languagecode": "" }, { "jobroleinfo.jobrole.languagecode": Number(languagecode) }] } },
	
	{$unwind: {path:'$districtinfo',preserveNullAndEmptyArrays: true }  },
	{$unwind: {path:'$districtinfo.district',preserveNullAndEmptyArrays: true }  },
    {$match: { $or: [{ "districtinfo.district.languagecode": { $exists: false } }, { "districtinfo.district.languagecode": "" }, { "districtinfo.district.languagecode": Number(languagecode) }] } },
    
    {$unwind: {path:'$talukinfo',preserveNullAndEmptyArrays: true }  },
	{$unwind: {path:'$talukinfo.taluk',preserveNullAndEmptyArrays: true }  },
    {$match: { $or: [{ "talukinfo.taluk.languagecode": { $exists: false } },
     { "talukinfo.taluk.languagecode": "" }, { "talukinfo.taluk.languagecode": Number(languagecode) }] } },
    

    {$unwind: {path:'$stateinfo',preserveNullAndEmptyArrays: true }  },
	{$unwind: {path:'$stateinfo.state',preserveNullAndEmptyArrays: true }  },
	{$match: { $or: [{ "stateinfo.state.languagecode": { $exists: false } }, { "stateinfo.state.languagecode": "" }, { "stateinfo.state.languagecode": Number(languagecode) }] } },
	{"$group":{_id: {employercode: '$employercode', statecode:'$preferences.statecode', statename: '$stateinfo.state.statename'},
	jobfunctioncode:{ $addToSet:"$preferences.jobfunction.jobfunctioncode" }, jobfunctionname: { $addToSet:"$jobfunctioninfo.jobfunction.jobfunctionname"},
	jobrolecode:{ $addToSet:"$preferences.jobrole.jobrolecode" }, jobrolename: { $addToSet:"$jobroleinfo.jobrole.jobrolename"},
    locationcode:{ $addToSet:"$preferences.location.locationcode" }, locationname: { $addToSet:"$districtinfo.district.districtname"},
    talukcode:{ $addToSet:"$talukinfo.talukcode" }, 
    talukname: { $addToSet:"$talukinfo.taluk.talukname"}
	}},
{"$project": {_id:0, jobfunctioncode: '$jobfunctioncode', jobfunctionname:'$jobfunctionname', jobrolecode:'$jobrolecode',jobrolename:'$jobrolename',
locationcode:'$locationcode', locationname:'$locationname',talukcode:'$talukcode', talukname:'$talukname', statecode: '$_id.statecode', statename: '$_id.statename'
}}
]).toArray(function (err, empresult) {
    // //console.log("pref");
   // //console.log("pref",empresult);
                if (empresult != null && empresult.length > 0)
                    return callback(empresult);
                else
                    return callback(finalresult);

            });
    }
    catch (e) { logger.error("Error in Employer get Preference Info View: " + e); }
}

exports.getEmployerProfileImage = function (logparams, req, callback) {
    try {
        logger.info("Log in getEmployerProfileImage  : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate + ", Type: " + logparams.type);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.EmployerCollectionName).aggregate({$match:{employercode: Number(req.query.employercode)}}, 
        { $project: { _id: 0, "employercode": 1, "profileurl":{ $ifNull:[ '$profileurl','']}} }).toArray(function (err, imageresult) {
            // if(imageresult.profileurl==null)
            //     imageresult.profileurl="";
              //  //console.log(imageresult);
            return callback(imageresult);

        });
    }
    catch (e) { logger.error("Error in getEmployerProfileImage : " + e); }
}