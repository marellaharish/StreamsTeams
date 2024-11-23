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
    STREAM_CHAT: 5,
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
    SMS_SAVE_PERSISTENT_DID: 10,
    IMPORTED_CONTACTS: 11,
    COMPANY_CONTACTS: 12,
    OTHER_STREAMS_CONTACTS: 13,
});

exports.REQ_CONTACTS_TAB_TYPE = Object.freeze({

    COMPANY_CONTACTS: 1,
    OTHER_STREAMS_CONTACTS: 2,
    IMPORTED_CONTACTS: 3,
});

exports.REQ_TYPE_CHAT = Object.freeze({

    WS_OUTGOING_MESSAGE: 1,
    WS_INCOMING_MESSAGE: 2,
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
    ACTION_SEND: 6,
    ACTION_SEND_FROM_POPUP: 7
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
exports.WS_OTHERS_STREAMS_CONTACTS = "Other Streams Contacts";

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


exports.SearchReasultDataTest = [
    {
        name: "Alice Smith",
        profileImage: "https://via.placeholder.com/150",
        From: "Alice",
        msg: "Hello! How are you after the meeting?",
    },
    {
        name: "Bob Johnson",
        profileImage: "https://via.placeholder.com/150",
        From: "Bob",
        msg: "Are we still on for the meeting?",
    },
    {
        name: "Charlie Brown",
        profileImage: "https://via.placeholder.com/150",
        From: "Charlie",
        msg: "Don't forget to send the report after the meeting.",
    },
    {
        name: "Dana White",
        profileImage: "https://via.placeholder.com/150",
        From: "Dana",
        msg: "Let's catch up after the meeting soon!",
    },
    {
        name: "Eva Green",
        profileImage: "https://via.placeholder.com/150",
        From: "Eva",
        msg: "Happy to help you with the meeting details!",
    },
    {
        name: "Frank Black",
        profileImage: "https://via.placeholder.com/150",
        From: "Frank",
        msg: "I'll check the meeting details and get back to you.",
    },
    {
        name: "Grace Lee",
        profileImage: "https://via.placeholder.com/150",
        From: "Grace",
        msg: "Can we reschedule our meeting call?",
    },
    {
        name: "Henry Adams",
        profileImage: "https://via.placeholder.com/150",
        From: "Henry",
        msg: "I'll join the meeting shortly.",
    },
    {
        name: "Iris Turner",
        profileImage: "https://via.placeholder.com/150",
        From: "Iris",
        msg: "Thank you for your assistance with the meeting!",
    },
    {
        name: "Jack Wilson",
        profileImage: "https://via.placeholder.com/150",
        From: "Jack",
        msg: "Let's finalize the meeting agenda soon.",
    },
    {
        name: "Kathy Lee",
        profileImage: "https://via.placeholder.com/150",
        From: "Kathy",
        msg: "We need to review the meeting minutes.",
    },
    {
        name: "Leo Kim",
        profileImage: "https://via.placeholder.com/150",
        From: "Leo",
        msg: "I'll send the meeting summary after I finish it.",
    },
    {
        name: "Mona Scott",
        profileImage: "https://via.placeholder.com/150",
        From: "Mona",
        msg: "Let's plan the next meeting date.",
    },
    {
        name: "Nina Davis",
        profileImage: "https://via.placeholder.com/150",
        From: "Nina",
        msg: "I look forward to our meeting next week.",
    },
    {
        name: "Oscar Bell",
        profileImage: "https://via.placeholder.com/150",
        From: "Oscar",
        msg: "I have updated the meeting agenda.",
    },
    {
        name: "Paul Grant",
        profileImage: "https://via.placeholder.com/150",
        From: "Paul",
        msg: "I'm preparing for the meeting presentation.",
    },
    {
        name: "Quincy Roberts",
        profileImage: "https://via.placeholder.com/150",
        From: "Quincy",
        msg: "Looking forward to meeting with you soon.",
    },
    {
        name: "Rachel Adams",
        profileImage: "https://via.placeholder.com/150",
        From: "Rachel",
        msg: "I'll review the meeting notes and send my feedback.",
    },
    {
        name: "Steve Harris",
        profileImage: "https://via.placeholder.com/150",
        From: "Steve",
        msg: "The meeting went well. I'll follow up on the tasks.",
    },
    {
        name: "Tina Ward",
        profileImage: "https://via.placeholder.com/150",
        From: "Tina",
        msg: "Can we schedule another meeting next week?",
    },
    {
        name: "Ursula Baker",
        profileImage: "https://via.placeholder.com/150",
        From: "Ursula",
        msg: "I enjoyed our meeting today, thanks for your time.",
    },
    {
        name: "Vince Miller",
        profileImage: "https://via.placeholder.com/150",
        From: "Vince",
        msg: "I'll send the meeting materials by end of the day.",
    },
    {
        name: "Willie Carter",
        profileImage: "https://via.placeholder.com/150",
        From: "Willie",
        msg: "We can discuss this further in our next meeting.",
    },
    {
        name: "Xena Wilson",
        profileImage: "https://via.placeholder.com/150",
        From: "Xena",
        msg: "Let's plan the agenda for the upcoming meeting.",
    },
    {
        name: "Yara Hughes",
        profileImage: "https://via.placeholder.com/150",
        From: "Yara",
        msg: "I will confirm the meeting details with everyone.",
    },
    {
        name: "Zachary Young",
        profileImage: "https://via.placeholder.com/150",
        From: "Zachary",
        msg: "Looking forward to our next meeting.",
    },
];



exports.SearchReasultDataFiles = [
    {
        name: "Admin5WebHelp_v15B.zip",
        dateTime: "Oct 26, 2024",
        sharedBy: "UX Team",
        sharedIn: "You",
        fileType: "ZipDocument"
    },
    {
        name: "UXDesign_Documentation.html",
        dateTime: "Oct 25, 2024",
        sharedBy: "John Doe",
        sharedIn: "You",
        fileType: "Html"
    },
    {
        name: "Financial_Report_2024.xlsx",
        dateTime: "Oct 24, 2024",
        sharedBy: "Finance Team",
        sharedIn: "You",
        fileType: "Excel"
    },
    {
        name: "Marketing_Video.mp4",
        dateTime: "Oct 23, 2024",
        sharedBy: "Marketing Team",
        sharedIn: "You",
        fileType: "Video"
    },
    {
        name: "ProjectPlan_2024.docx",
        dateTime: "Oct 22, 2024",
        sharedBy: "Project Management",
        sharedIn: "You",
        fileType: "Word"
    },
    {
        name: "TeamMeeting_Audio.mp3",
        dateTime: "Oct 21, 2024",
        sharedBy: "HR Team",
        sharedIn: "You",
        fileType: "Audio"
    },
    {
        name: "Backup_Files.zip",
        dateTime: "Oct 20, 2024",
        sharedBy: "IT Team",
        sharedIn: "You",
        fileType: "ZipDocument"
    },
    {
        name: "ProductImages_Folder.zip",
        dateTime: "Oct 19, 2024",
        sharedBy: "Design Team",
        sharedIn: "You",
        fileType: "ImgBox"
    },
    {
        name: "Company_Policies.pdf",
        dateTime: "Oct 18, 2024",
        sharedBy: "Legal Team",
        sharedIn: "You",
        fileType: "Pdf"
    },
    {
        name: "ProjectDescription_Node.js",
        dateTime: "Oct 17, 2024",
        sharedBy: "Dev Team",
        sharedIn: "You",
        fileType: "Node"
    }
];
