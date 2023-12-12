const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
// Connection URL
//Dev
// const url = 'mongodb://localhost:27017'
//aws
//const url = 'mongodb://172.31.45.149:27017'
//aws test
// const url = 'mongodb://172.31.35.125:27017'
//aws uat
// const url = 'mongodb://localhost:27017'
//aws Live
//const url = 'mongodb://172.31.37.5:27017'
//Live Atlas

const url = 'mongodb+srv://bestjobs_dba:j1XZw7vYegXtDSnW@cluster0.16umh.mongodb.net/test'

// const url = 'mongodb+srv://bestjobs_dba:j1XZw7vYegXtDSnW@cluster0.16umh.mongodb.net/test'
const LanguageCollectionName = 'tbl_def_languages';
const MessageCollectionName = 'tbl_def_messages';
const EmployeeCollectionName = 'tbl_employee';
const GenderCollectionName = 'tbl_def_gender';
const MaritalStatusCollectionName = 'tbl_def_maritalstatus';
const JobTypeCollectionName = 'tbl_def_jobtype';
const StateCollectionName = 'tbl_cp_state';
const CityCollectionName = 'tbl_cp_city';
const TalukCollectionName = 'tbl_cp_taluk';
const BranchTypeCollectionName = 'tbl_def_branchtype';
const UserRoleCollectionName = 'tbl_cp_userrole';
const UserCollectionName = 'tbl_cp_user';
const DesignationCollectionName = 'tbl_cp_designation';
const DistrictCollectionName = 'tbl_cp_district';
const LogCollectionName = 'tbl_trans_activitylog';
const SpecializationCollectionName = 'tbl_cp_specialization';
const QualificationCollectionName = 'tbl_cp_qualification';
const IndustryCollectionName = 'tbl_cp_industry';
const JobFunctionCollectionName = 'tbl_cp_jobfunction';
const JobRoleCollectionName = 'tbl_cp_jobrole';
const FacilityCollectionName = 'tbl_cp_facility';
const EduCategoryCollectionName = 'tbl_def_educationcategory';
const EmpTypeCollectionName = 'tbl_def_employmenttype';
const StatusCollectionName = 'tbl_def_status';
const MenuCollectionName = 'tbl_def_menu';
const SplashCollectionName = 'tbl_cp_splashscreen';
const PreferenceCollectionName = 'tbl_preference';
const SkillCollectionName = 'tbl_cp_skills';
const ControlsCollectionName = 'tbl_def_controls';
const relationCollectionName = 'tbl_def_relationship';
const Quali_Spec_MappingCollectionName = 'tbl_cp_quali_spec_mapping';
const govttypeCollectionName = 'tbl_def_govttype';
const gnOrganisationCollectionName = 'tbl_cp_gnorganisation';
const notificationtypeCollectionName = 'tbl_def_notificationtype';
const notificationCollectionName = 'tbl_employee_notification';
const newseventsCollectionName = 'tbl_cp_newsevents';
const newstypeCollectionName = 'tbl_def_newstype';
const newscategoryCollectionName = 'tbl_def_newscategory';
const smstypeCollectionName = 'tbl_def_smstype';
const smstemplateCollectionName = 'tbl_cp_smstemplate';
const settingsCollectionName = 'tbl_cp_settings';
const GnJobsCollectionName = 'tbl_cp_gnjobpost';
const planTypeCollectionName = 'tbl_def_plantype';
const JobPackageCollectionName = 'tbl_cp_jobpackage';
const EmployerCollectionName = 'tbl_employer';
const RecipientCriteriaCollectionName = 'tbl_def_recipientcriteria';
const SendSMSCollectionName = 'tbl_cp_sendsms';
const SmsCreditsCollectionName = 'tbl_def_smscredits';
const ExperienceCollectionName = 'tbl_def_experience';
const JobPostsCollectionName = 'tbl_job_posts';
const PrivateJobPostsCollectionName = 'tbl_private_jobs';
const SortListCollectionName = 'tbl_def_sortlist';
const EmployerTypeCollectionName = 'tbl_def_employertype';
const CompanyTypeCollectionName = 'tbl_def_companytype';
const EmployeeWishListCollectionName = 'tbl_employee_wishlist';
const EmployeeShortListCollectionName = 'tbl_employee_shortlist';
const EmployeeInvitedCollectionName = 'tbl_employee_invited';
const EmployeeAppliedCollectionName = 'tbl_employee_applied';
const AdminContactCollectionName = 'tbl_def_admincontactdetails';
const SubjectCollectionName = 'tbl_def_subject';
const TransContactsCollectionName = 'tbl_trans_contactdetails';
const AbuseEmployerCollectionName = 'tbl_abuse_reporting';
const AppTypeCollectionName = 'tbl_def_apptype';
const AbuseTypeCollectionName = 'tbl_def_abusetype'
const RecentSearchCollectionName = 'tbl_recent_search';
const KonwnFromCollectionName = 'tbl_def_knownfrom';
const EmployerNotificationCollectionName = 'tbl_employer_notification';
const EmployerContactUsCollectionName = 'tbl_employer_customplan_contact';
const EmployerWishListCollectionName = 'tbl_employer_wishlist';
const JobPackageSubscriptionCollectionName = 'tbl_jobpackage_subscription';
const EmployerRecentSearchCollectionName = 'tbl_employer_recent_search';
const CategoryTypeCollectionName = 'tbl_def_categorytype';
const MonthCollectionName = 'tbl_def_month';
const NotificationDetailsCollectionName = 'tbl_notification_details';
const OTPDetailsCollectionName = 'tbl_otp_details';
const RejectedJobsCollectionName = 'tbl_rejected_jobs';
const LoginActivityCollectionName = 'tbl_def_login_activity';
const DeviceTokenCollectionName = 'tbl_trans_devicetoken';
const MailIdCollectionName = 'tbl_def_mailid';
const WelcomeScreenCollectionName = 'tbl_cp_welcome_screen';
const VersionCollectionName = 'tbl_def_versiondetails';
const AWSBucketCollectionName = 'tbl_def_aws_bucket_details';
const ActivityCollectionName = 'tbl_def_activitytype';
const SkillsMappingCollectionName = 'tbl_cp_skills_mapping';
const JoinusCollectionName = 'tbl_def_joinus_details';
const TurnOverSlabCollectionName = 'tbl_def_turnoverslab';
const NotificationTitleCollectionName = 'tbl_def_notificationtitle';
const JobPostViewedHistory = 'tbl_employee_viewed';
const ChatTypeCollectionName = 'tbl_def_chattype';
const DocumentTypeCollectionName = 'tbl_def_documenttype';
const ProfilePercentageCollectionName = 'tbl_def_profilepercentage';
const pushnotificationCollectionName = 'tbl_push_notification';
const FlashJobViewCount = 'tbl_employee_fj_count';
const ShiftTimingCollectionName = 'tbl_def_shift';
const LoginActivity = 'tbl_login_activity';
const LeadCollectionName = 'tbl_lead';
const EmpRegisterCollectionName = 'tbl_employee_registration';
const EmpJobPercentageCollectionName = 'tbl_employee_job_percentage';
const JobPercentageCollectionName = 'tbl_def_jobpercentage';
const EmployeeProfileViewCollectionName = 'tbl_employee_profile_view';
// const testEmployeeProfileViewCollectionName = 'tbl_test_employee_profile_view';
// Database Name test/live
const dbName = 'bestjobs_live'
// const dbName = 'bestjobs_dev'
// const dbName = 'bestjobs_test'
// Database Name uat
// const dbName = 'bestjobs_uat'

let dbo;


const connectDB = MongoClient.connect(url, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    {server: {
        socketOptions: {
            connectTimeoutMS: 120000
        }
    }}, (err, client) => {
    if (err) {
        throw err;
        return;
    }

    console.log('Database connection successful');

    // This objects holds the refrence to the db
    dbo = client.db(dbName);


    // client.close();
});




const getDB = () => dbo
//const getLanguageCollectionName = () => language_collection_name


const disconnectDB = () => dbo.close()

module.exports = {
    connectDB, getDB, disconnectDB,
    //collect
    LanguageCollectionName, MessageCollectionName, EmployeeCollectionName, GenderCollectionName,
    MaritalStatusCollectionName, JobTypeCollectionName, StateCollectionName, CityCollectionName, UserRoleCollectionName, UserCollectionName,
    DesignationCollectionName, DistrictCollectionName, LogCollectionName, SpecializationCollectionName, QualificationCollectionName,
    IndustryCollectionName, JobFunctionCollectionName, JobRoleCollectionName, FacilityCollectionName, EduCategoryCollectionName, EmpTypeCollectionName,
    StatusCollectionName, MenuCollectionName, SplashCollectionName, PreferenceCollectionName, SkillCollectionName, ControlsCollectionName,
    relationCollectionName, Quali_Spec_MappingCollectionName, govttypeCollectionName, gnOrganisationCollectionName, notificationtypeCollectionName,
    notificationCollectionName, newseventsCollectionName, newstypeCollectionName, newscategoryCollectionName, smstypeCollectionName,
    smstemplateCollectionName, settingsCollectionName, GnJobsCollectionName, planTypeCollectionName, JobPackageCollectionName, EmployerCollectionName,
    RecipientCriteriaCollectionName, SendSMSCollectionName, SmsCreditsCollectionName, ExperienceCollectionName, JobPostsCollectionName, PrivateJobPostsCollectionName, SortListCollectionName,
    EmployerTypeCollectionName, CompanyTypeCollectionName, EmployeeWishListCollectionName, EmployeeShortListCollectionName,
    EmployeeInvitedCollectionName, EmployeeAppliedCollectionName, AdminContactCollectionName, SubjectCollectionName, TransContactsCollectionName, EmployerContactUsCollectionName,
    AbuseEmployerCollectionName, RecentSearchCollectionName, AppTypeCollectionName, KonwnFromCollectionName, AbuseTypeCollectionName, EmployerNotificationCollectionName, EmployerWishListCollectionName,
    JobPackageSubscriptionCollectionName, EmployerRecentSearchCollectionName, CategoryTypeCollectionName, MonthCollectionName, NotificationDetailsCollectionName, OTPDetailsCollectionName, RejectedJobsCollectionName, LoginActivityCollectionName,
    DeviceTokenCollectionName, MailIdCollectionName, WelcomeScreenCollectionName, VersionCollectionName, AWSBucketCollectionName, ActivityCollectionName, SkillsMappingCollectionName, JoinusCollectionName, TurnOverSlabCollectionName,
    NotificationTitleCollectionName, TalukCollectionName, BranchTypeCollectionName, JobPostViewedHistory, ChatTypeCollectionName, DocumentTypeCollectionName, ProfilePercentageCollectionName, pushnotificationCollectionName, FlashJobViewCount,
    ShiftTimingCollectionName, LoginActivity,LeadCollectionName,EmpRegisterCollectionName,EmpJobPercentageCollectionName,JobPercentageCollectionName, EmployeeProfileViewCollectionName
}
