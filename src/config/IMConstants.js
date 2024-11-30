

exports.IM_PROTO_CONNECT = `<Message id=\"?\"><name>?</name><key>?</key><user_type>?</user_type><encoding>?</encoding>
                                <device_type>?</device_type><cflag>?</cflag><macid>?</macid><system_info>?</system_info>
                                <ace_status>?</ace_status><ulm_connect_status>?</ulm_connect_status><cache_capability>?</cache_capability>
                                <apptype>?</apptype><clientip>?</clientip><version>?</version><bulkpstream>?</bulkpstream>
                                <dnd_status>?</dnd_status><grpsms>?</grpsms></Message>`;

exports.XML_IM_TAG = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n";

exports.IM_PROTO_SMS_PROTOCOL = "<Message id=\"?\"><msgtype>?</msgtype><cid>?</cid><sid>?</sid><msg><![CDATA[?]]></msg><commentvia>?</commentvia><extramsg><![CDATA[?]]></extramsg><phnum>?</phnum></Message>";

exports.IM_PROTO_PING = "<Message id=\"764\"/>";

exports.IM_PROTO_ACK = "<Message smsgid=\"?\" id=\"?\" pid=\"?\" msgtype=\"?\"/>";

exports.IM_PROTO_GROUP_CHAT_READ_PROTOCOL = "<Message id=\"?\"><sid>?</sid><readsmsgid>?</readsmsgid><cid>?</cid><phnum>?</phnum><msg>?</msg></Message>"

exports.WS_IM_SMS = 50;
exports.WS_IM_MMS = 51;

exports.WS_SMS_GROUP_MSG_TYPE = 445;

exports.WS_SMS_FEATURE_ENABLED = 472;
exports.WS_SMS_FEATURE_DISABLED = 473;
exports.WS_SMS_SEND_ALERT_DISPLAY_STATUS = 474;
exports.WS_SMS_SMS_ALWAYS_USE_DID = 475;
exports.WS_ADD_OR_DELETE_GLOBAL_CONTACT = 477;
exports.WS_SMS_FEATURE_ENABLED_ACCOUNT_LEVLE = 479;
exports.WS_SMS_FEATURE_DISABLED_ACCOUNT_LEVLE = 480;
exports.WS_SMS_FEATURE_ENABLED_USER_LEVLE = 481;
exports.WS_SMS_FEATURE_DISABLED_USER_LEVLE = 482;


exports.PROTO_IM_GROUP_CHAT_MSG = 504;
exports.PROTO_IM_GROUP_CHAT_MSG_ACK = 506;
exports.PROTO_IM_ECHO_GROUP_CHAT_MSG = 507;
exports.PROTO_IM_SMS_ACK = 508;
exports.PROTO_IM_GROUP_EXTRA_MSG = 509;
exports.PROTO_IM_DYNAMIC_UPDATE = 511;
exports.PROTO_IM_GROUP_CHAT_MSG_READ_STATUS = 512;
exports.PROTO_IM_GROUP_CHAT_SERVER_READ_ACK = 513;
exports.PROTO_IM_GROUP_CHAT_READ_SERVER_STATUS = 514;
exports.PROTO_IM_MSG_EDIT = 540;
exports.PROTO_IM_MSG_DELETE = 541;

exports.PROTO_BUDDYSTATUS = 753;
exports.PROTO_IM_CONNECT = 748;
exports.PROTO_PING_IMSERVER = 764
exports.PROTO_SERVER_PING_IMSERVER = 774

exports.PROTO_IM_CHAT_ACK = 4000;
exports.PROTO_IM_STREAM_COMPLETED = 4051;

exports.IM_CONNECT_SHARE_PREF_USER_TYPE = 1
exports.IM_CONNECT_ENCODING = 0
exports.IM_CONNECT_DEVICE_TYPE = 2 // Desktop - 2, Android - 1, IOS - 0
exports.IM_CONNECT_CFLAG = 1 // 1 , 2
exports.IM_CONNECT_MACID = '23c90ca0-6663-4409-93ef-9d0395a63150'
exports.IM_CONNECT_SYSTEM_INFO = '23c90ca0-6663-4409-93ef-9d0395a63150 Windows10 Chrome_12_128.0.0.0 128.0.0.0 Desktop Streams'
exports.IM_CONNECT_ACE_STATUS = 0
exports.IM_CONNECT_ULM_CONNECT_STATUS = 1
exports.IM_CONNECT_CACHE_CAPABILITY = 1
exports.IM_CONNECT_APPTYPE = 4
exports.IM_CONNECT_CLIENT_IP = '49.206.60.24:35254'
exports.IM_CONNECT_VERSION = 1
exports.IM_CONNECT_BULK_PSTREAM = 2
exports.IM_CONNECT_DND_STATUS = 0
exports.IM_CONNECT_GROUP_SMS = 1

exports.SMS_GROUP = Object.freeze({

    WS_SMS_GROUP_CREATE: 1,
    WS_SMS_GROUP_DELETE: 2,
    WS_SMS_GROUP_EDIT: 3
});








