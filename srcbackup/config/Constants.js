/**
 * Author: Sunil
 * Date: 16/08/24
 */

//==================        Integer Constants  ======================
exports.PARAMS_CALL_RECORDINGS_LIST_REQ = 1;
exports.PARAMS_CALL_RECORDINGS_ANALYSE_REQ = 2;
exports.PARAMS_CALL_RECORDINGS_WORDSEARCH_REQ = 3;

exports.IM_STANDARD_MESSAGES = [
    "Call me when you're free",
    "I'm in a meeting right now",
    "Not free now, I'll call you when I'm free",
    "Give me 5 minutes",
    "Busy now"
];

exports.REQ_SMS_TAB_TYPE = Object.freeze({

    ALL_SMS: 1,
    INDIVIDUAL_SMS: 2,
    SMS_GROUPS: 3,
    SMS_UNREAD: 4,
});

exports.REQ_TYPE = Object.freeze({

    ALL_SMS: 1,
    INDIVIDUAL_SMS: 2,
    SMS_GROUPS: 3,
    SMS_UNREAD: 4,
    SMS_GROUP_DIDS: 5,
    SMS_GROUP_DID_MESSAGES: 6,
    SMS_USER_SMS_DID_SETTINGS: 7,
    SMS_ENABLE_SETTINGS: 8,
    GROUPS_DIDLIST: 9,
    IMPORTED_CONTACTS: 10,
    COMPANY_CONTACTS: 11,
});

exports.REQ_TYPE_CHAT = Object.freeze({

    WS_OUTGOING_CHAT_MESSAGE: 0,
    WS_INCOMING_CHAT_MESSAGE: 1,
});

exports.REQ_TYPE_SMS_CHAT = Object.freeze({

    WS_OUTGOING_SMS_MESSAGE: 1,
    WS_INCOMING_SMS_MESSAGE: 2,
});

exports.API_HANDLER = Object.freeze({

    WS_APIHANDLER_SMS_ALWAYS_USE_DID: 70002,
});

exports.DATE_FORMATS = Object.freeze({

    WS_GROUP_DID_DATE: 1,
    WS_CHAT_MESSAGE_DATE: 2,
});

exports.SMS_CHAT_TYPES = Object.freeze({

    WS_GROUP_SMS: 1,
    WS_ONE_TO_ONE_SMS: 2,
});

exports.REQ_TYPE_SMS_ACTION = Object.freeze({

    ACTION_REPLY: 0,
    ACTION_SEND_ANOTHER: 1,
    ACTION_RESEND: 2,
    ACTION_EDIT: 3,
    ACTION_DELETE: 4,
    ACTION_COPY: 5,
    ACTION_SEND: 6
});


// SMS DID Keys  
exports.WS_KEY_SMS_ENABLED_STATUS = "smsenabled";
exports.WS_KEY_SMS_DONT_ASK_STATUS = "sms_dontask_status";
exports.WS_KEY_SMS_ALWAYS_USE_DID = "sms_always_use_did";
exports.WS_KEY_SMS_DID_LIST = "smsdidlist";
exports.WS_KEY_SMS_ALWAYS_USE_DID_DETAILS = "sms_always_use_did_details"
exports.WS_KEY_SMS_PERSISTDID = "smspersistdid"
exports.WS_KEY_SMS_USER_LEVEL_SETTING = "accountlevel_sms_flag";
exports.WS_KEY_SMS_ACCOUNT_LEVEL_SETTING = "userlevel_sms_flag";
exports.WS_KEY_SMS_ACCOUNT_LEVEL_ENABLE_STATUS = "sms_account_level_enable_status";
exports.WS_KEY_SMS_USER_LEVEL_ENABLE_STATUS = "sms_user_level_enable_status";

exports.CONNECTION_PINGTIME_OUT = 20 // Socket ping timout
exports.PING_INTERVAL = 5 // Socket ping interval

//==================        Stirng Constants    ===========================
exports.WS_PRODUCT_NAME = "Streams"

exports.WS_COMPANY_CONTACTS = "Company Contacts";
exports.WS_IMPORTED_CONTACTS = "Imported Contacts";


//==================        GateKeeper Constants        ===================
exports.GATEKEEPER_FILE_PATH = 'filespp';
exports.PROFILE_RESOLUTION_TYPE_80 = 'profilepic_80.png';
exports.PROFILE_RESOLUTION_TYPE_360 = 'profilepic_360.png';
exports.ATTACHMENT_RESOLUTION_TYPE_720 = 720;
exports.GATEKEEPER_SEPARATOR = 'E4';
exports.GATEKEEPER_SECRET_KEY = 'wUEhHzGR98240397';
exports.ATTACHMENT_PATH = '864abd7e-68a0-11e3-a577-001e58a7db4a-864abd92-68a0-11e3-a577-001e58a7db4a'




exports.contactTeams = [
    { name: "123456789 001 Alice Smith", team: "Company Team" },
    { name: "123456780 002 Bob Johnson", team: "Company Team" },
    { name: "123456781 003 Charlie Brown", team: "Company Team" },
    { name: "123456782 004 Dana White", team: "Company Team" },
    { name: "123456783 005 Eva Green", team: "Company Team" },
    { name: "123456784 006 Frank Black", team: "Company Team" },
    { name: "123456785 007 Grace Lee", team: "Company Team" },
    { name: "123456786 008 Henry Adams", team: "Company Team" },
    { name: "123456787 009 Iris Turner", team: "Company Team" },
    { name: "123456788 010 Jack Wilson", team: "Company Team" }
];

exports.contactsWithStatus = [
    { name: "Alice Smith", extension: "101", statusLabel: 'On Desktop', bgClass: 'onlineStatus' },
    { name: "Bob Johnson", extension: "102", statusLabel: 'Busy', bgClass: 'onlineStatus bg-danger' },
    { name: "Charlie Brown", extension: "103", statusLabel: 'Not At My Desk', bgClass: 'onlineStatus bg-danger' },
    { name: "Dana White", extension: "104", statusLabel: 'On Desktop', bgClass: 'onlineStatus' },
    { name: "Eva Green", extension: "105", statusLabel: 'Out To Lunch', bgClass: 'onlineStatus bg-danger' },
    { name: "Frank Black", extension: "106", statusLabel: 'Appear Offline', bgClass: 'onlineStatus bg-secondary' },
    { name: "Grace Lee", extension: "107", statusLabel: 'Be Right Back', bgClass: 'onlineStatus bg-danger' },
    { name: "Henry Adams", extension: "108", statusLabel: 'Stepped Out', bgClass: 'onlineStatus bg-danger' },
    { name: "Iris Turner", extension: "109", statusLabel: 'Busy', bgClass: 'onlineStatus bg-danger' },
    { name: "Jack Wilson", extension: "110", statusLabel: 'On Desktop', bgClass: 'onlineStatus' }
];


exports.OtherStreamsContactsData = [
    { name: "Liam Brown", extension: "201", statusLabel: 'On Desktop', bgClass: 'onlineStatus' },
    { name: "Mia Davis", extension: "202", statusLabel: 'Busy', bgClass: 'onlineStatus bg-danger' },
    { name: "Noah Miller", extension: "203", statusLabel: 'Out To Lunch', bgClass: 'onlineStatus bg-danger' },
    { name: "Olivia Wilson", extension: "204", statusLabel: 'Stepped Out', bgClass: 'onlineStatus bg-danger' },
    { name: "Emma Moore", extension: "205", statusLabel: 'Be Right Back', bgClass: 'onlineStatus bg-danger' },
    { name: "Ava Taylor", extension: "206", statusLabel: 'Appear Offline', bgClass: 'onlineStatus bg-secondary' },
    { name: "Sophia Anderson", extension: "207", statusLabel: 'Not At My Desk', bgClass: 'onlineStatus bg-danger' },
    { name: "Jackson Thomas", extension: "208", statusLabel: 'On Desktop', bgClass: 'onlineStatus' },
    { name: "Lucas Jackson", extension: "209", statusLabel: 'Busy', bgClass: 'onlineStatus bg-danger' },
    { name: "Amelia White", extension: "210", statusLabel: 'On Desktop', bgClass: 'onlineStatus' }
];


exports.GlobalContactsData = [
    { name: "John Smith" },
    { name: "Liam O'Connor" },
    { name: "Sofia Garcia" },
    { name: "Aisha Khan" },
    { name: "Hiroshi Tanaka" },
    { name: "Fatima Al-Sayed" },
    { name: "Carlos Fernández" },
    { name: "Zhang Wei" },
    { name: "Nina Müller" },
    { name: "Arjun Patel" }
];


exports.allData = [
    { name: "Alice Smith", extension: "101", phoneNumber: "5550101010" },
    { name: "Bob Johnson", extension: "102", phoneNumber: "5550101020" },
    { name: "Charlie Brown", extension: "103", phoneNumber: "5550101030" },
    { name: "Dana White", extension: "104", phoneNumber: "5550101040" },
    { name: "Eva Green", extension: "105", phoneNumber: "5550101050" },
    { name: "Frank Black", extension: "106", phoneNumber: "5550101060" },
    { name: "Grace Lee", extension: "107", phoneNumber: "5550101070" },
    { name: "Henry Adams", extension: "108", phoneNumber: "5550101080" },
    { name: "Iris Turner", extension: "109", phoneNumber: "5550101090" },
    { name: "Jack Wilson", extension: "110", phoneNumber: "5550101100" }
];
