'use strict';
const Logger = require('../services/logger_service')
const logger = new Logger('logs')
const LoggerPortal = require('../services/logger_service_portal')
const loggerportal = new LoggerPortal('logsPortal')
const LoggerEmployee = require('../services/logger_service_employee')
const loggeremployee = new LoggerEmployee('logsEmployee')
const LoggerEmployerApp = require('../services/logger_service_employer_app')
const loggeremployerapp = new LoggerEmployerApp('logsEmployerApp')
const LoggerEmployerPortal = require('../services/logger_service_employer_portal')
const loggeremployerportal = new LoggerEmployerPortal('logsEmployerPortal')
var express = require('express');
// const languagemodel = require('../models/language.model.js');
// const constantfile = require('constants');
var objDefLanguage = require('./def_language_controller');
var objCPDesignation = require('./cp_designation_controller');
var objCPUserRole = require('./cp_userrole_controller');
var objCPDistrict = require('./cp_district_controller');
var objCPUser = require('./cp_user_controller');
var objCPState = require('./cp_state_controller');
var objCPCity = require('./cp_city_controller');
var objCPTaluka = require('./cp_taluka_controller');
var objCPIndustry = require('./cp_industry_controller');
var objCPJobFunction = require('./cp_jobfunction_controller');
var objCPJobRole = require('./cp_jobrole_controller');
var objCPSkillMapping = require('./cp_skills_mapping_controller');
var objCPSkill = require('./cp_skills_controller');
var objCPGnOrg = require('./cp_gnorganisation_controller');
var objCPFacility = require('./cp_facility_controller');
var objCPNews = require('./cp_newsevents_controller');
var objAdminSettings = require('./admin_settings_controller');
var objCPQualification = require('./cp_educationqualification_controller');
var objCPJobPackage = require('./cp_jobpackage_controller');
var objCommonSplash = require('./common_splash_controller');
var objEmployeeRegistration = require('./employee_login_controller');
var objEmployeePreferences = require('./employee_preference_controller');
var objEmployeeProfile = require('./employee_profile_controller');
var objEmployeeEducation = require('./employee_education_controller');
var objEmployeeReference = require('./employee_reference_controller');
var objEmployeeExperience = require('./employee_experience_controller');
var objEmployeeNotification = require('./employee_notification_controller');
var objEmployeeSkills = require('./employee_skills_controller');
var objGovtJobsList = require('./govtjobs_list_controller');
var objEmployeeProfileview = require('./employee_profile_view_controller');
var objJobListCount = require('./employee_job_count_list_controller');
var objJobList = require('./employee_job_list_controller');
var objSpecialization = require('./cp_specialization_controller');
var objGnjobpost = require('./admin_gnjob_post_controller');
var objJobView = require('./employee_job_view_controller');
var objFilterBind = require('./employee_filter_controller');
var objSmsTemplate = require('./cp_sms_template_controller');
var objSendSms = require('./cp_sendsms_controller');
var objRecommendedJob = require('./employee_recommended_controller');
var objEligibleJob = require('./employee_eligible_controller');
var objFlashJob = require('./employee_flash_controller');
var objQualificationMapping = require('./cp_qual_spec_mapping_controller');
var objContactUs = require('./trans_contact_controller');
var objWishList = require('./employee_wishlist_controller');
var objApplied = require('./employee_applied_controller');
var objInvited = require('./employee_invited_controller');
var objEmployerAbuse = require('./employee_abuse_controller');
var objJobPostView = require('./cp_job_post_view_controller');
var objSearch = require('./employee_search_controller');
var objAbuse = require('./cp_abuse_controller');
var objEmployerLogin = require('./employer_login_controller');
var objEmployerProfile = require('./employer_profile_controller');
var objBranch = require('./employer_branch_controller');
var objEmplyerNewsandEvents = require('./employer_newandevents_controller');
var objEmployerNotification = require('./employer_notification_controller');
var objEmployerPreference = require('./employer_preference_controller');
var objEmployerContactUs = require('./employer_subscription_contact_controller');
var objEmployerProfileView = require('./employer_profile_view_controller');
var objEmployerManagement = require('./employer_management_controller');
var objSubscription = require('./employer_subscription_controller');
var objJobDescription = require('./employer_job_description_controller');
var objProfileJobStatus = require('./employer_job_profile_status_controller');
var objRecommendedProfile = require('./employer_recommended_controller');
var objJobPost = require('./employer_jobpost_controller');
var objPrivateJobPost = require('./employer_private_jobpost_controller');
var objEmployerSearch = require('./employer_search_controller');
var objprofileListSearch = require('./employer_profile_list_controller');
var objWishListEmployer = require('./employer_wishlist_controller');
var objInvitedEmployer = require('./employer_invited_controller');
var objProfileOverallEmployer = require('./employer_overall_profile_count_controller');
var objAppliedEmployer = require('./employer_applied_controller');
var objshortlistEmployer = require('./employer_shortlist_controller');
var objShortlistReport = require('./admin_shortlist_controller');
var objSendEmail = require('./send_email_controller');
var objNotificationDetails = require('./notification_controller');
var objSalesReport = require('./admin_sales_report_controller');
var objSubscriptionReport = require('./admin_subscription_report_controller');
var objEmployerFilterBind = require('./employer_filter_controller');
var objJobpostFilter = require('./job_filter_controller');
var objAdminDashboard = require('./admin_dashboard_controller');
var objEmployerDashboard = require('./employer_dashboard_controller');
var objErrorWriting = require('./error_controller');
var objGeneratePDF = require('./generate_employee_profile_pdf_controller');
//var objSendMail=require("./sendemail_controller");
//var objSendNotification = require('./sendnotification_controller');
var objSendSMS = require('./send_sms_controller');
var objAWSDetails = require('./common_aws_controller');
var objJoinusDetails = require('./common_joinus_controller');
var objEmployeeChatDetails = require('./employee_chat_controller');
var objEmployerChatDetails = require('./employer_chat_controller');
var objPushNotification = require('./push_notificaction_controller');
var objEmpRegistration = require('./employee_subscription_controller');
var objShortlisted = require('./employee_shortlisted_controller');
var objJobPercentage = require('./employee_job_percentage_controller');

var router = express.Router();

//router.post('/sendnotification', objSendNotification.SendNotification1);
//router.post('/sendmail', objSendMail.SendMail);
router.post('/generatepdf', objGeneratePDF.generateEmployeeProfilePDF);
router.post('/errorwriting', objErrorWriting.ErrorWriting);
router.post('/languagebind', objDefLanguage.get_language_details);
router.post('/employee/register', objEmployeeRegistration.lead_registration);
router.post('/employeeportal/register', objEmployeeRegistration.employee_registration_portal);
router.post('/employeeportal/personalupdate', objEmployeeRegistration.employee_update_portal);
router.post('/employeeportal/jobroleupdate', objEmployeeRegistration.employee_jobrole_update_portal);
router.post('/employee/checkout/load', objEmpRegistration.getcheckoutLoad);
router.post('/employee/checkout/save', objEmpRegistration.getRazorPayOrderId);
router.post('/Employeepaymentupdate', objEmpRegistration.EmployeePaymentUpdate);
router.post('/paymentwebhook', objEmpRegistration.paymentwebhook);
router.post('/employee/checkout/update', objEmpRegistration.getSubscriptionStatusUpdate);
router.post('/employee/AutomaticRegistration', objEmpRegistration.AutomaticEmployeeRegistration);
router.post('/employee/login', objEmployeeRegistration.employee_login);
router.post('/employee/load', objEmployeeRegistration.employee_load);
router.post('/employee/forgotpassword', objEmployeeRegistration.forgotpassword);
router.post('/employee/changemobileno', objEmployeeRegistration.UpdateMobileNumber);
router.post('/employee/personalinfoload', objEmployeeProfile.getPersonalinfoLoad);
router.post('/employee/personalinfo', objEmployeeProfile.personalinfoupdate);
router.post('/employee/personalinfosave', objEmployeeProfile.personalinfoinsert);
router.post('/employee/personalinfoedit', objEmployeeProfile.personalinfoEdit);
router.post('/employee/contactinfoload', objEmployeeProfile.getContactinfoLoad);
//router.post('/employee/list', objEmployeeProfile.get_employee_list);
router.post('/employee/list', objEmployeeProfile.employee_list);
router.post('/employee/excellist', objEmployeeProfile.employee_excel_list);
router.post('/employee/listload', objEmployeeProfile.get_employee_load);
router.post('/employee/createzohocustomer', objEmployeeProfileview.InsertZohoCustomerContactDetails);
router.post('/employee/createzohoinvoice', objEmpRegistration.createzohobookInvoice);
//router.post('/employee/emplist', objEmployeeProfile.employee_list);
router.post('/employee/contactinfo', objEmployeeProfile.contactinfoupdate);
router.post('/employee/referenceload', objEmployeeReference.getReferenceLoad);
router.post('/employee/referenceeditload', objEmployeeReference.getReferenceEditLoad);
router.post('/employee/referencecreate', objEmployeeReference.referenceSave);
router.post('/employee/referenceupdate', objEmployeeReference.referenceUpdate);
router.post('/employee/referencedelete', objEmployeeReference.referenceDelete);
router.post('/employee/referencelist', objEmployeeReference.referenceList);

router.post('/employee/explist', objEmployeeExperience.ExperienceList);
router.post('/employee/expupdatestatus', objEmployeeExperience.ExperienceUpdateStatus);
router.post('/employee/expcreate', objEmployeeExperience.ExperienceSave);
router.post('/employee/expupdate', objEmployeeExperience.ExperienceUpdate);
router.post('/employee/expdelete', objEmployeeExperience.ExperienceDelete);
router.post('/employee/expeditload', objEmployeeExperience.getExperienceEditLoad);
router.post('/employee/expload', objEmployeeExperience.getExperienceFormload);
router.post('/employee/totalexperience', objEmployeeExperience.UpdateTotalExperience);

router.post('/employee/schoolload', objEmployeeEducation.getSchoolingLoad);
router.post('/employee/schoolcreate', objEmployeeEducation.SchoolingSave);
router.post('/employee/schoolupdate', objEmployeeEducation.SchoolingUpdate);
router.post('/employee/schooldelete', objEmployeeEducation.SchoolingDelete);
router.post('/employee/schooleditload', objEmployeeEducation.getSchoolingEditLoad);

router.post('/employee/afterschoolload', objEmployeeEducation.getAfterSchoolingLoad);
router.post('/employee/afterschoolcreate', objEmployeeEducation.AfterSchoolingSave);
router.post('/employee/afterschoolupdate', objEmployeeEducation.AfterSchoolingUpdate);
router.post('/employee/afterschooldelete', objEmployeeEducation.AfterSchoolingDelete);
router.post('/employee/afterschooleditload', objEmployeeEducation.getAfterSchoolingEditLoad);
router.post('/employee/educationlist', objEmployeeEducation.EducationList);

router.post('/employee/skillload', objEmployeeSkills.getSkillLoad);
router.post('/employee/skilldelete', objEmployeeSkills.SkillsProfileDelete);
router.post('/employee/skilleditload', objEmployeeSkills.getSkillEditLoad);
router.post('/employee/skillcreate', objEmployeeSkills.SkillSave);
router.post('/employee/skilllist', objEmployeeSkills.SkillsProfileList);
router.post('/employee/profileload', objEmployeeProfileview.getProfileView);
router.post('/employee/portalprofileload', objEmployeeProfileview.getPortalProfileView);
router.post('/employee/registerusername', objEmployeeRegistration.empCheckUserName);
router.post('/employee/registermobileno', objEmployeeRegistration.empCheckMobileNo);
router.post('/employee/registeremail', objEmployeeRegistration.empCheckEmailId);
router.post('/employee/checkaadharno', objEmployeeRegistration.empCheckAadhar);
router.post('/employee/changepassword', objEmployeeRegistration.Changepassword);
router.post('/employee/deactivateemployee', objEmployeeRegistration.DeactivateEmployee);
router.post('/employee/activateemployee', objEmployeeRegistration.ActivateEmployee);
router.post('/employee/checkvalidemployee', objEmployeeRegistration.checkValidEmployeeorLead);
router.post('/employee/profilestatus', objEmployeeProfile.getProfileStatus);

router.post('/employee/notificationload', objEmployeeNotification.NotificationStatus);
router.post('/employee/notificationsave', objEmployeeNotification.NotificationSave);

router.post('/employee/sortlist', objJobList.getSortListLoad);
router.post('/contactus/load', objContactUs.getTransContactLoad);
router.post('/contactus/save', objContactUs.getTransContactSave);
router.post('/contactus/list', objContactUs.getTransContactList);

router.post('/newsandevents/newsbind', objCPNews.NewsBind);
router.post('/newsandevents/eventsbind', objCPNews.EventsBind);
router.post('/newsandevents/newsdetails', objCPNews.NewsDetails);
router.post('/newsandevents/eventsdetails', objCPNews.EventsDetails);
router.post('/gnorganisation/govtjobslist', objGovtJobsList.GovtJobsList);
router.post('/gnorganisation/govtjobsdetails', objGovtJobsList.GovtJobsDetails);
router.post('/gnorganisation/govtjobsbind', objGovtJobsList.GovtJobsListbyCount);

router.post('/preference/load', objEmployeePreferences.getPreferenceLoad);
router.post('/preference/create', objEmployeePreferences.preferenceupdate);

router.post('/employee/overalljobscount', objJobListCount.getOverallJobListCount);
router.post('/employer/overallprofilecount', objProfileOverallEmployer.getOverallProfileListCount);
router.post('/jobs/jobscount', objJobListCount.getJobListCount);
router.post('/jobs/jobslist', objJobList.getJobList);
router.post('/jobs/recommended', objRecommendedJob.getRecommendedJobList);
router.post('/jobs/eligible', objEligibleJob.getEligibleJobList);
router.post('/jobs/flash', objFlashJob.getFlashJobList);
router.post('/jobs/wishlist', objWishList.getWishListJobList);
router.post('/jobs/applied', objApplied.getAppliedJobList);
router.post('/jobs/invited', objInvited.getInvitedJobList);
router.post('/jobs/wishlistsave', objWishList.WishListSave);
router.post('/jobs/accepted', objInvited.InvitationAccepted);
router.post('/jobs/jobapply', objApplied.ApplyJob);
router.post('/jobs/shortlisted', objShortlisted.getShortlistedJobList);

router.post('/jobs/view', objJobView.getJobView);
router.post('/flashjobs/view', objJobView.FlashJobDescriptionView);
router.post('/flashjobs/dial', objJobView.FlashJobDialCount);
router.post('/jobs/counts', objJobView.getJobCount);
router.post('/search/load', objSearch.getSearchBindLoad);
router.post('/search/delete', objSearch.searchDelete);
router.post('/employee/filterbind', objFilterBind.getJobFilterBind);
router.post('/employee/profilefilterbind', objFilterBind.getProfileJobFilterBind);
router.post('/abuse/abuse', objEmployerAbuse.AbuseSave);

router.post('/splash/splashbind', objCommonSplash.getSplashList);
router.post('/splash/create', objCommonSplash.insert_splash_details);
router.post('/splash/update', objCommonSplash.update_splash_details);
router.post('/splash/delete', objCommonSplash.delete_splash_details);
router.post('/splash/list', objCommonSplash.getWebSplashList);
router.post('/splash/editload', objCommonSplash.splash_list_by_code);
router.post('/splash/load', objCommonSplash.splash_formload);
router.post('/splash/imageurlupdate', objCommonSplash.update_splash_imageurl_details);
router.post('/splash/welcomescreenload', objCommonSplash.welcome_screen_load);
router.post('/splash/welcomescreenapp', objCommonSplash.welcome_screen_app);
router.post('/splash/updatewelcomescreen', objCommonSplash.welcome_screen_update);

router.post('/designation/create', objCPDesignation.insert_designation_details);
router.post('/designation/update', objCPDesignation.update_designation_details);
router.post('/designation/delete', objCPDesignation.delete_designation_details);
router.post('/designation/list', objCPDesignation.designation_list);
router.post('/designation/editload', objCPDesignation.designation_list_by_code);

router.post('/userrole/create', objCPUserRole.insert_userrole_details);
router.post('/userrole/update', objCPUserRole.update_userrole_details);
router.post('/userrole/delete', objCPUserRole.delete_userrole_details);
router.post('/userrole/list', objCPUserRole.userrole_list);
router.post('/userrole/editload', objCPUserRole.userrole_list_by_code);
router.post('/userrole/load', objCPUserRole.userrole_formload);

router.post('/user/create', objCPUser.insert_user_details);
router.post('/user/update', objCPUser.update_user_details);
router.post('/user/delete', objCPUser.delete_user_details);
router.post('/user/list', objCPUser.user_list);
router.post('/user/editload', objCPUser.user_list_by_code);
router.post('/user/load', objCPUser.user_formload);
router.post('/user/login', objCPUser.user_login_details);

router.post('/state/create', objCPState.insert_state_details);
router.post('/state/update', objCPState.update_state_details);
router.post('/state/delete', objCPState.delete_state_details);
router.post('/state/list', objCPState.state_list);
router.post('/state/editload', objCPState.state_list_by_code);
router.post('/state/load', objCPState.state_formload);

router.post('/district/create', objCPDistrict.insert_district_details);
router.post('/district/update', objCPDistrict.update_district_details);
router.post('/district/delete', objCPDistrict.delete_district_details);
router.post('/district/list', objCPDistrict.district_list);
router.post('/district/editload', objCPDistrict.district_list_by_code);
router.post('/district/load', objCPDistrict.district_formload);
router.post('/district/imageurlupdate', objCPDistrict.update_district_imageurl_details);

router.post('/city/create', objCPCity.insert_city_details);
router.post('/city/update', objCPCity.update_city_details);
router.post('/city/delete', objCPCity.delete_city_details);
router.post('/city/list', objCPCity.city_list);
router.post('/city/editload', objCPCity.city_list_by_code);
router.post('/city/load', objCPCity.city_formload);

router.post('/taluk/create', objCPTaluka.insert_taluk_details);
router.post('/taluk/update', objCPTaluka.update_taluk_details);
router.post('/taluk/delete', objCPTaluka.delete_taluk_details);
router.post('/taluk/list', objCPTaluka.taluk_list);
router.post('/taluk/editload', objCPTaluka.taluk_list_by_code);
router.post('/taluk/load', objCPTaluka.taluk_formload);

router.post('/qualification/create', objCPQualification.insert_qualification_details);
router.post('/qualification/update', objCPQualification.update_qualification_details);
router.post('/qualification/delete', objCPQualification.delete_qualification_details);
router.post('/qualification/list', objCPQualification.qualification_list);
router.post('/qualification/editload', objCPQualification.qualification_list_by_code);
router.post('/qualification/load', objCPQualification.qualification_formload);

router.post('/industry/create', objCPIndustry.insert_industry_details);
router.post('/industry/update', objCPIndustry.update_industry_details);
router.post('/industry/delete', objCPIndustry.delete_industry_details);
router.post('/industry/list', objCPIndustry.industry_list);
router.post('/industry/editload', objCPIndustry.industry_list_by_code);
router.post('/industry/load', objCPIndustry.industry_formload);
router.post('/industry/imageurlupdate', objCPIndustry.update_industry_image_details);

router.post('/jobrole/create', objCPJobRole.insert_jobrole_details);
router.post('/jobrole/update', objCPJobRole.update_jobrole_details);
router.post('/jobrole/delete', objCPJobRole.delete_jobrole_details);
router.post('/jobrole/list', objCPJobRole.jobrole_list);
router.post('/jobrole/editload', objCPJobRole.jobrole_list_by_code);
router.post('/jobrole/load', objCPJobRole.jobrole_formload);

router.post('/jobfunction/create', objCPJobFunction.insert_jobfunction_details);
router.post('/jobfunction/update', objCPJobFunction.update_jobfunction_details);
router.post('/jobfunction/delete', objCPJobFunction.delete_jobfunction_details);
router.post('/jobfunction/list', objCPJobFunction.jobfunction_list);
router.post('/jobfunction/editload', objCPJobFunction.jobfunction_list_by_code);
router.post('/jobfunction/load', objCPJobFunction.jobfunction_formload);
router.post('/jobfunction/imageurlupdate', objCPJobFunction.update_jobfunction_imageurl_details);

router.post('/pushnotification/create', objPushNotification.insert_pushnotification_details);
router.post('/pushnotification/update', objPushNotification.update_pushnotification_details);
router.post('/pushnotification/delete', objPushNotification.delete_pushnotification_details);
router.post('/pushnotification/list', objPushNotification.notification_list);
router.post('/pushnotification/editload', objPushNotification.notification_list_by_code);
router.post('/pushnotification/load', objPushNotification.pushnotification_formload);
router.post('/pushnotification/send', objPushNotification.send_notification);
router.post('/pushnotification/employeecount', objPushNotification.pushnotification_employee_count);

router.post('/skills/create', objCPSkill.insert_skill_details);
router.post('/skills/update', objCPSkill.update_skill_details);
router.post('/skills/delete', objCPSkill.delete_skill_details);
router.post('/skills/list', objCPSkill.skill_list);
router.post('/skills/editload', objCPSkill.skill_list_by_code);
router.post('/skills/load', objCPSkill.skill_formload);

router.post('/skillsmapping/create', objCPSkillMapping.insert_skill_mapping_details);
router.post('/skillsmapping/update', objCPSkillMapping.update_skill_mapping_details);
router.post('/skillsmapping/delete', objCPSkillMapping.delete_skill_mapping_details);
router.post('/skillsmapping/list', objCPSkillMapping.skill_mapping_list);
router.post('/skillsmapping/load', objCPSkillMapping.skill_mapping_formload);
router.post('/skillsmapping/skilllist', objCPSkillMapping.GetSkillMappingdetails);

router.post('/gnorganisation/create', objCPGnOrg.insert_gnorg_details);
router.post('/gnorganisation/update', objCPGnOrg.update_gnorg_details);
router.post('/gnorganisation/delete', objCPGnOrg.delete_gnorganisation_details);
router.post('/gnorganisation/list', objCPGnOrg.gnorganisation_list);
router.post('/gnorganisation/editload', objCPGnOrg.gnorganisation_list_by_code);
router.post('/gnorganisation/load', objCPGnOrg.gnorg_formload);
router.post('/gnorganisation/imageurlupdate', objCPGnOrg.update_imageurl);

router.post('/facility/create', objCPFacility.insert_facility_details);
router.post('/facility/update', objCPFacility.update_facility_details);
router.post('/facility/delete', objCPFacility.delete_facility_details);
router.post('/facility/list', objCPFacility.facility_list);
router.post('/facility/editload', objCPFacility.facility_list_by_code);
router.post('/facility/load', objCPFacility.facility_formload);

router.post('/newsandevents/create', objCPNews.insert_newsevents_details);
router.post('/newsandevents/update', objCPNews.update_newsevents_details);
router.post('/newsandevents/delete', objCPNews.delete_newsevents_details);
router.post('/newsandevents/list', objCPNews.newsevents_list);
router.post('/newsandevents/editload', objCPNews.newsevents_list_by_code);
router.post('/newsandevents/newscategoryload', objCPNews.newsevents_formload);
router.post('/newsandevents/updatestatuscode', objCPNews.UpdateStatuscode);
router.post('/newsandevents/imageurlupdate', objCPNews.update_imageurl);

router.post('/settings/update', objAdminSettings.update_settings_details);
router.post('/settings/editload', objAdminSettings.settings_list_by_code);
router.post('/admin/changepassword', objAdminSettings.ChangePassword);

router.post('/jobpackage/create', objCPJobPackage.insert_jobpackage_details);
router.post('/jobpackage/update', objCPJobPackage.update_jobpackage_details);
router.post('/jobpackage/delete', objCPJobPackage.delete_jobpackage_details);
router.post('/jobpackage/createzohoitem', objCPJobPackage.insert_jobpackage_zohoitem_details);
router.post('/jobpackage/list', objCPJobPackage.jobpackage_list);
router.post('/jobpackage/editload', objCPJobPackage.jobpackage_list_by_code);
router.post('/jobpackage/load', objCPJobPackage.jobpackage_formload);
router.post('/specialization/create', objSpecialization.insert_specialization_details);
router.post('/specialization/update', objSpecialization.update_specialization_details);
router.post('/specialization/delete', objSpecialization.delete_specialization_details);
router.post('/specialization/load', objSpecialization.specialization_formload);
router.post('/specialization/editload', objSpecialization.specialization_list_by_code);
router.post('/specialization/list', objSpecialization.specialization_list);

router.post('/gnjobpost/create', objGnjobpost.insert_gnjobpost_details);
router.post('/gnjobpost/delete', objGnjobpost.delete_gnjobpost_details);
router.post('/gnjobpost/update', objGnjobpost.update_gnjobpost_details);
router.post('/gnjobpost/load', objGnjobpost.gnjobpost_formload);
router.post('/gnjobpost/editload', objGnjobpost.gnjob_list_by_code);
router.post('/gnjobpost/list', objGnjobpost.gnjobpost_list);
router.post('/gnjobpost/updateuploads', objGnjobpost.uploads_files);
router.post('/gnjobpost/updatestatuscode', objGnjobpost.UpdateStatuscode);

router.post('/smstemplate/create', objSmsTemplate.insert_smstemplate_details);
router.post('/smstemplate/update', objSmsTemplate.update_smstemplate_details);
router.post('/smstemplate/delete', objSmsTemplate.delete_smstemplate_details);
router.post('/smstemplate/editload', objSmsTemplate.smstemplate_list_by_code);
router.post('/smstemplate/load', objSmsTemplate.smstemplate_formload);
router.post('/smstemplate/list', objSmsTemplate.smstemplate_list);

router.post('/sendsms/load', objSendSms.sendsms_formload);
router.post('/sendsms/create', objSendSms.insert_sendsms_details);
router.post('/sendsms/smsrecipientlist', objSendSms.sendsms_list);
router.post('/sendsms/update', objSendSms.update_sendsms_details);
router.post('/sendsms/editload', objSendSms.sendsms_list_by_code);
router.post('/sendsms/list', objSendSms.sendsms_totallist);

router.post('/quali_spc_mapping/create', objQualificationMapping.insert_quali_mapping_details);
router.post('/quali_spc_mapping/load', objQualificationMapping.quali_sepc_mapping_formload);
router.post('/quali_spc_mapping/update', objQualificationMapping.update_quali_mapping_details);
router.post('/quali_spc_mapping/delete', objQualificationMapping.delete_qual_spec_mapping);
router.post('/quali_spc_mapping/list', objQualificationMapping.quali_spec_mapping_list);
router.post('/quali_spc_mapping/editload', objQualificationMapping.quali_sepc_spec_List_by_code);

router.post('/jobpost/list', objJobPostView.job_post_view_list);
router.post('/jobpost/updateremarks', objJobPostView.update_jobpost_remarks);
router.post('/jobpost/view', objJobPostView.getJobView);

router.post('/employee/imagesave', objEmployeeProfile.imageurl);
router.post('/employee/saveresumeurl', objEmployeeProfile.resumeurl);
router.post('/employee/deleteemployee', objEmployeeProfile.DeleteEmployee);

router.post('/abuse/list', objAbuse.abuse_reporting);
router.post('/abuse/update', objAbuse.Update_statuscode);
router.post('/abuse/view', objAbuse.abuse_view);

router.post('/employer/login', objEmployerLogin.employerlogin);
router.post('/employer/refreshToken', objEmployerLogin.refreshToken);
router.post('/employer/forgotpassword', objEmployerLogin.forgotpassword);
router.post('/employer/checkotp', objEmployerLogin.CheckOTP);
router.post('/employer/changepassword', objEmployerLogin.changepassword);
router.post('/employer/changeemail', objEmployerLogin.ChangeEmailId);
router.post('/employer/employeeprofile', objEmployeeProfileview.getProfileView);
router.post('/employer/checkversion', objEmployerLogin.CheckVersion);

router.post('/employer/load', objEmployerLogin.employerload);
router.post('/employer/register', objEmployerLogin.registeration);
router.post('/employer/registermail', objEmployerLogin.CheckRegisterEmailname);
router.post('/employer/registermobile', objEmployerLogin.CheckRegisterMobile);
router.post('/employer/checkgstn', objEmployerLogin.CheckGSTIN);
router.post('/employer/checkpan', objEmployerLogin.CheckPAN);
router.post('/employer/checkaadhar', objEmployerLogin.CheckAadhar);
router.post('/employer/list', objEmployerLogin.EmployerLanguageList);
router.post('/employer/profileupload', objEmployerLogin.ProfileImageUpload);
router.post('/employer/deactiveemployer', objEmployerLogin.DeactiveEmployer);
router.post('/employer/activeemployer', objEmployerLogin.ActiveEmployer);
router.post('/employer/validemployer', objEmployerLogin.checkValidEmployer);
router.post('/employer/verification', objEmployerLogin.VerificationUpdate);

router.post('/employer/newsbind', objEmplyerNewsandEvents.NewsBind);
router.post('/employer/eventsbind', objEmplyerNewsandEvents.EventsBind);
router.post('/employer/newsdetails', objEmplyerNewsandEvents.NewsDetails);
router.post('/employer/eventsdetails', objEmplyerNewsandEvents.EventsDetails);

router.post('/employer/profileinfoload', objEmployerProfile.getProfileinfoLoad);
router.post('/employer/profileinfoupdate', objEmployerProfile.profileinfoupdate);

router.post('/employer/notificationload', objEmployerNotification.NotificationStatus);
router.post('/employer/notificationsave', objEmployerNotification.NotificationSave);

router.post('/employer/contactinfoload', objEmployerProfile.getContactinfoLoad);
router.post('/employer/contactinfoupdate', objEmployerProfile.contactinfoupdate);

router.post('/employer/companyinfoload', objEmployerProfile.getCompanyinfoLoad);
router.post('/employer/companyinfosave', objEmployerProfile.companyinfoupdate);
router.post('/employer/govtidentificationload', objEmployerProfile.getgovtidentificationLoad);
router.post('/employer/branch/load', objBranch.getBranchinfoLoad);

router.post('/employer/preferenceload', objEmployerPreference.PreferenceLoad);
router.post('/employer/preferencesave', objEmployerPreference.PreferenceSave);
router.post('/employer/branch/list', objBranch.BranchList);
router.post('/employer/branch/save', objBranch.BranchSave);
router.post('/employer/branch/update', objBranch.BranchUpdate);
router.post('/employer/branch/delete', objBranch.BranchDelete);
router.post('/employer/branch/branchtype', objBranch.getBranchtypeLoad);

router.post('/employer/contactus', objEmployerContactUs.ContactusSave);
router.post('/employer/view', objEmployerProfileView.EmployerProfileView);
router.post('/employer/subscription/load', objSubscription.getSubscriptionLoad);
router.post('/employer/subscription/save', objSubscription.getSubscriptionSave);
router.post('/employer/subscription/update', objSubscription.getSubscriptionStatusUpdate);
router.post('/Employerpaymentupdate', objSubscription.EmployerPaymentUpdate);
router.post('/employer/subscription/list', objSubscription.getSubscriptionList);
router.post('/subscription/createinvoice', objSubscription.createzohobookInvoice);
router.post('/employer/sort/list', objRecommendedProfile.getEmpSortListLoad);
router.post('/admin/sort/list', objRecommendedProfile.getAdminEmpSortListLoad);
router.post('/employer/recommended', objRecommendedProfile.getRecommendedProfileList);
router.post('/employer/search/load', objEmployerSearch.getEmpSearchLoad);
router.post('/employer/search/delete', objEmployerSearch.EmployersearchDelete);
router.post('/employer/profilesearch', objprofileListSearch.getSearchProfileList);
router.post('/employer/jobs/profilesearch', objRecommendedProfile.getRecommendedProfileList_jobcode);

router.post('/jobdescription/view', objJobDescription.JobDescriptionView);
router.post('/jobdescription/employeeview', objJobDescription.JobDescriptionEmployeeView);

router.post('/profilejobstatus/wishliststatus', objProfileJobStatus.WishListSave);
router.post('/profilejobstatus/invitestatus', objProfileJobStatus.InviteEmployee);
router.post('/profilejobstatus/shortliststatus', objProfileJobStatus.ShortliststatusUpdate);

router.post('/jobpost/load', objJobPost.JobPostLoad);
router.post('/jobpost/save', objJobPost.InsertJobpost);
router.post('/jobpost/update', objJobPost.UpdateJobpost);
router.post('/jobpost/delete', objJobPost.DeleteJobpost);
router.post('/jobpost/editload', objJobPost.JobPost_list_by_code);
router.post('/jobpost/updatestatus', objJobPost.UpdateStatuscode);
router.post('/jobpost/postlist', objJobPost.JobPostList);
router.post('/jobpost/filterlist', objJobPost.FilterList);
router.post('/jobpost/updatevalidity', objJobPost.UpdateValiditydate);

router.post('/privatejobpost/load', objPrivateJobPost.JobPostLoad);
router.post('/privatejobpost/save', objPrivateJobPost.InsertJobpost);
router.post('/privatejobpost/update', objPrivateJobPost.UpdateJobpost);
router.post('/privatejobpost/delete', objPrivateJobPost.DeleteJobpost);
router.post('/privatejobpost/editload', objPrivateJobPost.JobPost_list_by_code);
router.post('/privatejobpost/postlist', objPrivateJobPost.JobPostList);


router.post('/employermanagement/view', objEmployerManagement.EmployerView);
router.post('/employermanagement/updatestatus', objEmployerManagement.UpdateStatuscode);
router.post('/employermanagement/deleteemployer', objEmployerManagement.DeleteEmployer);
router.post('/employermanagement/updateemailid', objEmployerManagement.UpdateEmailIdInEmployer);
router.post('/employermanagement/deleteemailid', objEmployerManagement.DeleteNewEmailIdInEmployer);
router.post('/employermanagement/listload', objEmployerManagement.EmployerMasterList);
router.post('/employermanagement/list', objEmployerManagement.EmployerList);
router.post('/employermanagement/Emaillist', objEmployerManagement.EmailEmployerList);
router.post('/employermanagement/SentMail', objEmployerManagement.SendEmailEmployerList);
router.post('/employermanagement/createzohocustomer', objEmployerManagement.InsertZohoCustomerContactDetails);


router.post('/employer/appliedlist', objAppliedEmployer.AppliedList);
router.post('/employer/invitedlist', objInvitedEmployer.InvitedList);
router.post('/employer/wishlist', objWishListEmployer.WishlistList);
router.post('/employer/shortlist', objshortlistEmployer.getShortlistedProfileList);

router.post('/notification/notificationcount', objNotificationDetails.NotificationTotalCount);
router.post('/notification/notificationupdatestatus', objNotificationDetails.NotificationStatusUpdate);
router.post('/notification/viewedstatus', objNotificationDetails.UpdateViewedStatus);
router.post('/notification/dismissnotification', objNotificationDetails.UpdateDismissStatus);
router.post('/notification/notificationlist', objNotificationDetails.NotificationList);
router.post('/notification/tokenentry', objNotificationDetails.DeviceTokenEntry);
router.post('/notification/tokendisable', objNotificationDetails.DeviceTokenDisable);

router.post('/employer/filterbind', objFilterBind.getJobFilterBind);
router.post('/employer/profilefilterbind', objEmployerFilterBind.getEmployerFilterBind);
router.post('/jobs/profilefilterbind', objJobpostFilter.getJobFilterBind);


router.post('/report/shortlist', objShortlistReport.ShortListReport);
router.post('/report/applied', objShortlistReport.AppliedReport);
router.post('/report/notapplied', objShortlistReport.NotAppliedReport);
router.post('/report/notapplieddetails', objShortlistReport.NotAppliedReportDetails);
router.post('/report/invited', objShortlistReport.InvitedReport);
router.post('/report/appliedexcellist', objShortlistReport.ExcelAppliedReport);
router.post('/report/invitedexcellist', objShortlistReport.ExcelInvitedReport);

router.post('/OTP', objSendEmail.SendOTP);
router.post('/resendverificationlink', objSendEmail.ResendVerificationLink);
router.post('/testresendverificationlink', objSendEmail.ResendVerificationLink_test);
router.post('/employeeemailverification', objSendEmail.EmployeeEmailVerification);

router.post('/employer/dashboard', objEmployerDashboard.employer_dashboard_load);
router.post('/admin/dashboard', objAdminDashboard.dashboard_load);
router.post('/admin/dashboardchart', objAdminDashboard.dashboard_chart_load);
router.post('/admin/profiledashboard', objAdminDashboard.profile_dashboard);

// router.post('/report/salesload', objSalesReport.SalesReportLoad);
// router.post('/report/saleslist', objSalesReport.SalesReportList);
// router.post('/report/salesfilterlist', objSalesReport.SalesReportFilter);
router.post('/report/subscriptionlist', objSalesReport.Sales_SubscriptionList);
router.post('/report/employeesubscription', objSalesReport.Employeee_SubscriptionList);
router.post('/report/loginactivitylist', objSalesReport.LoginActivityReportList);
router.post('/report/loginactivitylist/editload', objSalesReport.LoginActivityReportEditload);

router.post('/sendsms/getOTP', objSendSMS.SendOTP);
router.post('/sendsms/verifyOTP', objSendSMS.CheckOTP);
router.post('/sendsms/sendsms', objSendSMS.SendSMS);

router.post('/awsdetails', objAWSDetails.AWSDetails);
router.post('/getLamdaDetails', objAWSDetails.getLamdaUrl);
router.post('/firebase', objAWSDetails.FirebasePushNotification);
// router.post('/report/subscriptionlist', objSubscriptionReport.SubscriptionList);
router.post('/employer/getprofileurl', objEmployerProfileView.getEmployerProfileImage);
router.post('/employee/getprofileurl', objEmployeeProfile.getEmployeeProfileImage);
router.post('/joinusdetails', objJoinusDetails.JoinusList);


router.post('/employer/contactuslist', objEmployerContactUs.getsubsContactList);
router.post('/employer/contactusUpdate', objEmployerContactUs.ContactUsUpdate);
router.post('/jobpost/updateafterapproval', objJobPost.UpdateJobpostAfterApproval);

router.post('/employee/chat/insert', objEmployeeChatDetails.insert_chat_details);
router.post('/employee/chat/list', objEmployeeChatDetails.chat_list);
router.post('/employer/chat/insert', objEmployerChatDetails.insert_chat_details);
router.post('/employer/chat/list', objEmployerChatDetails.chat_list);

router.post('/employee/UpdateJobPercentage', objJobPercentage.employee_job_percentage);
router.post('/employee/UpdateJobPercentActiveEmployee', objJobPercentage.active_employee_job_percentage);
router.post('/employee/activejobs', objJobPercentage.employee_active_job);

router.post('/employee/updateprofile', objEmployeeProfileview.getEmployeeProfileView);
router.post('/employee/autoupdateprofile', objEmployeeProfileview.getEmployeeProfileViewCount);
router.post('/employee/downloadResumePDF', objEmployeeProfile.downloadResumePDF);
router.post('/jobs/updateCallCount', objApplied.updateCallCount);
// router.post('/createzohobookitem', objGeneratePDF.createzohobookitem);
module.exports = router;
