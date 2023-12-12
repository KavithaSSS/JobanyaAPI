'use strict';
const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
const objGeneratePDF = require('../process/generate_employee_profile_pdf_process_controller')
const objZohoBook = require('../process/zohobook_razorpay_process_controller')
const Logger = require('../services/logger_service');
const { Console } = require('winston/lib/winston/transports');
const express = require('express');
const app = express();
const logger = new Logger('logs')
exports.generateEmployeeProfilePDF = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        var logType = "";
        var logUserCode = "";
        if (req.query.employeecode != null) {
            logUserCode = req.query.employeecode;
            logType = varconstant.employeeLogType;
        }
        else {
            logUserCode = req.query.registered_email;
            logType = varconstant.AppEmployerLogType;
        }
        var objLogdetails;
        const logvalues = { ipaddress: req.query.ipaddress, usercode: logUserCode, orginator: 'Generate PDF', logdate: new Date(), type: logType }
        objUtilities.getLogDetails(logvalues, function (logresponse) {
            objLogdetails = logresponse;
        });
        var logparams = objLogdetails;
        objGeneratePDF.generateEmployeeProfilePDF(logparams, req.query.employeecode, req, function (profileurl) {
            ////console.log(profileurl);
            const dbo = MongoDB.getDB();
                    dbo.collection(MongoDB.EmployeeCollectionName).updateOne({ "employeecode": Number(req.query.employeecode) }, { $set: { "generatedresumeurl": profileurl } }, function (err, result) {
                       
                    }); 
            return res.status(200).json({
                profile_list_json_result: {
                  profileurl: profileurl

                }
              });
        });
    }
    catch (e) {
        logger.error("Error in PDF Generatoe : Employee" + e);
    }
}
//Create zoho book item
exports.createzohobookitem = async function (req, res) {
    try {
        const decoded = await objUtilities.validateToken(req);
        if (!decoded) {
          return res.status(200).json({
            status: 401,
            message: "Unauthorized",
          });
        }
        
        const params = { price: parseInt(req.body.price), package: req.body.package};
        objZohoBook.insertJobPackageAsItem(params, req.body.zohocode, function (zohoresponse) {
            console.log(zohoresponse);            
            return res.status(200).json({
                profile_list_json_result: zohoresponse
              });
        });
    }
    catch (e) {
        logger.error("Error in PDF Generatoe : Employee" + e);
    }
}
