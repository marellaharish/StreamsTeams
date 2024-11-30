
exports.REQ_POST = "POST"
exports.REQ_GET = "GET"

exports.REQ_LOGIN = "/login";
exports.REQ_VERIFY_USER_LOGIN = "/login/verify_user_login"

//SMS Related
exports.REQ_SMS_SETTINGS = "/sms/sms_user_did_settings"
exports.REQ_SMS_ENABLE_SETTINGS = "/sms/sms_enable_disable_settings"
exports.REQ_SMS_GROUPS = "/sms/sg"
exports.REQ_SMS_GROUPS_DIDS = "/sms/sg_did"
exports.REQ_SMS_DIDS_MESSAGES = "/sms/sg_did_msg"
exports.REQ_LOGIN_USER_DETAILS = "/login/login_user_details"
exports.REQ_GROUPS_DID_LIST = "/sms/sg_did_list"
exports.REQ_GET_ATTACHMENT_ID = '/sms/attachment_id'

//GateKeeper related
exports.REQ_WSGATEKEEPER = '/WSGateKeeper'
exports.REQ_ATTACHMENT_DOWNLOAD = '/attachments/download'

//Contacts Related
exports.REQ_LOAD_CONTACTS = "/contacts/load_contacts"

//API Handler related
exports.REQ_API_HANDLER = "/api_handler/api_handler_request"

//Settings Related
exports.REQ_NOTIFICATION_SOUNDS = "/settings/notification_sounds";

exports.REQ_SEARCH_MESSAGES = "/chat/search_messages";