const MongoDB = require('../../config/database');
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
var objConstant = require('../../config/constants');
const objUtilities = require("../controller/utilities");
exports.getMaxcode = function (logparams, callback) {
    try {
        logger.info("Log in get max Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        dbo.collection(MongoDB.smstemplateCollectionName).find().sort([['templatecode', -1]]).limit(1)
            .toArray((err, docs) => {
                if (docs.length > 0) {
                    let maxId = docs[0].templatecode + 1;
                    return callback(maxId);
                }
                else {
                    return callback(1);
                }
            });
    }
    catch (e) { logger.error("Error in Get Max Code - sms-template " + e); }
}
exports.duplicatechecknames = function (logparams, params, callback) {
    try {
        logger.info("Log in checking template name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        dbo.collection(MongoDB.smstemplateCollectionName).find({ "templatename": params }).count(function (err, doc) {
            if (doc == 0) {
                finalresult.push(params);
            }
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in checking template name -  sms-template" + e); }
}
exports.duplicatecheck = function (logparams,params, callback) {
    try {
        logger.info("Log in checking template name : UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult = [];
        dbo.collection(MongoDB.smstemplateCollectionName).find(params).count(function (err, doc) {
            ////console.log(doc);
            if (doc == 0) {
                finalresult.push(params);
            }
            ////console.log(finalresult)
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in checking template name -  sms-template" + e); }
}

exports.Insertsmstemplate = function (logparams, params, callback) {
    try {
        logger.info("Log in insert sms template: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.smstemplateCollectionName).insertOne(params, function (err, res) {
            if (err) throw err;
                finalresult = res.insertedCount;
               // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in create - sms template" + e); }
}
exports.GetSmstemplateSingleDetails = function (logparams, params, callback) {
    try {
        logger.info("Log in smstemplate Single Record: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.smstemplateCollectionName).find(params).toArray(function (err, result) {
            finalresult = result;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in single record details - smstemplate" + e); }
}
exports.Updatesmstemplate = function (logparams, params, req, callback) {
    try {
        logger.info("Log in update sms template: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.smstemplateCollectionName).updateOne({ "templatecode": Number(req.query.templatecode) }, { $set: params }, function (err, res) {
            if (err) throw err;
                finalresult = res.modifiedCount;
                ////console.log(finalresult);
                return callback(res.modifiedCount==0?res.matchedCount:res.modifiedCount);
        });
    }
    catch (e) { logger.error("Error in update - sms template" + e); }
}
exports.checkTemplatecodeExistsInSendSms = function (logparams, params, callback) {
    try {
        logger.info("Log in checking template code in SendSms: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        // //console.log( parseInt(params.templatecode));
        dbo.collection(MongoDB.SendSMSCollectionName).find({ "templatecode": parseInt(params.templatecode) }, { $exists: true }).count(function (err, templatecount) //find if a value exists
        {
            ////console.log(templatecount);
            return callback(templatecount);
        });
    }
    catch (e) { logger.error("Error in checking template code in SendSms - smstemplate" + e); }
}
exports.Deletesmstemplate = function (logparams, params, callback) {
    try {
        logger.info("Log in Delete smstemplate: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        ////console.log(params)
        dbo.collection(MongoDB.smstemplateCollectionName).deleteOne(params, function (err, res) {
            if (err) throw err;
            finalresult = res.deletedCount;
            ////console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in Delete - smstemplate " + e);
    }
}
exports.smstemplateeditload = function (logparams, req, callback) {
    try {
        logger.info("Log in Edit load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        dbo.collection(MongoDB.smstemplateCollectionName).find({ "templatecode": Number(req.query.templatecode) }, { projection: { _id: 0, templatecode: 1, languagecode: 1, smstypecode: 1, templatename: 1, message: 1 } }).toArray(function (err, result) {
            finalresult = result;
            return callback(finalresult);
        });
    }
    catch (e) { logger.error("Error in Edit load List - smstemplate" + e); }
}
exports.getFormLoadList = function (logparams, callback) {
    try {
        logger.info("Log in form load List: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        var params = { statuscode: parseInt(objConstant.activestatus) }
        objUtilities.getPortalLanguageDetails(logparams, function (languageresult) {
            dbo.collection(MongoDB.smstypeCollectionName).aggregate([
                { $match: params },
                {
                    $sort: {
                        smstypename: 1
                    }
                },
                {
                    $project: { _id: 0, smstypecode: 1, smstypename: 1, smscharcount: 1 }
                }
            ]).toArray(function (err, smsresult) {

                finalresult = {
                    "languagelist": languageresult,
                    "smstypelist": smsresult,
                }
                return callback(finalresult);
            });
        });
        
    }
    catch (e) { logger.error("Error in Form load -smstemplate " + e); }
}
exports.smstemplatelist = function (logparams, params, callback) {
    try {
        logger.info("Log in smstemplate List by Status Code: UserId: " + logparams.usercode + ", Originator: " + logparams.orginator + ", DeviceIP: " + logparams.ipaddress + ", Logdate: " + logparams.logdate);
        const dbo = MongoDB.getDB();
        var finalresult;
        // //console.log(params);
        if (parseInt(params.statuscode) == 0) { var condition = { "statuscode": { $ne: objConstant.deletestatus } }; }
        else { var condition = { statuscode: parseInt(params.statuscode) }; }
        // var condition = { "statuscode": Number(req.query.statuscode) };
        dbo.collection(MongoDB.smstemplateCollectionName).aggregate([
            { $match: condition },
            {
                $lookup:
                {
                    from: String(MongoDB.StatusCollectionName),
                    localField: 'statuscode',
                    foreignField: 'statuscode',
                    as: 'status'
                }
            },
            { $unwind: '$status' },
            {
                $sort:{
                    createddate:-1
                }
            },
            { $project: { _id: 0, templatecode: 1, smstypecode: 1, languagecode: 1, statuscode: 1, smscount: 1, templatename: 1, message: 1, statusname: '$status.statusname' } }
        ]).toArray(function (err, result) {
            finalresult = result;
            // //console.log(finalresult);
            return callback(finalresult);
        });
    }
    catch (e) {
        logger.error("Error in List -smstemplate " + e);
    }

}