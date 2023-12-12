
'use strict';




const objUtilities = require('./utilities');
const mongoose = require('mongoose')
const MongoDB = require('../../config/database');
const varconstant = require('../../config/constants');
//const co= require('../../config/constants.js');

exports.get_language_details = async function (req, res) {
  try {

    var objLogdetails;
    var params = { "ipaddress": req.query.ipaddress, "usercode": 0, "orginator": 'Language Bind', "type": 'Employee' };
    objUtilities.getLogDetails(params, function (logresponse) {
      objLogdetails = logresponse;
    });
    var logparams = objLogdetails;
    // var date = new Date();
    // console.log(date);
    // console.log(date.getTime());
    // var newdate = new Date(new Date(date).setDate(date.getDate() + 15))
    // newdate.setHours(0,0,0,0)
    // var milliseconds = newdate.getTime();
    // console.log(newdate);
    // console.log(milliseconds);
    // console.log(milliseconds);
    // console.log([
    //   date.getFullYear(),
    //   (date.getMonth() + 1).toString().padStart(2, '0'),
    //   (date.getDate()).toString().padStart(2, '0'),
    // ].join('-'));
    objUtilities.getAppLanguageDetails(logparams, function (response) {
      ////console.log(response);
      ////console.log(response.length);
      if (response.length > 0) {
        //return res.status(200).json({
        const msgparam = { "messagecode": varconstant.listcode };
        objUtilities.getMessageDetails(msgparam, function (msgtext) {

          return res.status(200).json({
            language_json_result: {
              varstatuscode: varconstant.listcode,
              responsestring: msgtext,
              response: varconstant.successresponsecode,
              defaultlanguagecode: varconstant.defaultlanguagecode,
              languagelist: response
            }
          });

        });
      }
      else {
        const msgparam = { "messagecode": varconstant.recordnotfoundcode };
        objUtilities.getMessageDetails(msgparam, function (msgtext) {
          return res.status(200).json({
            varstatuscode: varconstant.recordnotfoundcode,
            response: varconstant.successresponsecode,
            responsestring: msgtext,


          });
        });
      }
    });
  }
  catch (e) {
    throw e;
  }
}