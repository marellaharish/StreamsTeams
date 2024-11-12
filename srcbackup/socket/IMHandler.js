
import { v4 as uuid } from "uuid";

import IMConstants from '../config/IMConstants'
import Utils from '../classes/utils/util'
import IMConnector from './IMConnector';
import MessageHandler from '../classes/chat/MessageHandler'
import Constants from '../config/Constants'
import EvntEmitter from '../classes/utils/EvntEmitter';
import EmitterConstants from "../config/EmitterConstants"
import Params from "../config/Params";
import SettingsHandler from "../classes/settings/SettingsHandler"
import StreamsHandler from "../classes/chat/StreamsHandler"


let smsPendigList = new Map()
let usersStautsList = new Map()

let TAG = "[IMHandler].";
class IMHandler {

    processIncomingMessage(rcvData) {

        try {

            let id = parseInt(rcvData.Message.ParamsId.id)
            console.log('[processIncomingMessage] -- id --- ' + id);

            if (id != IMConstants.PROTO_SERVER_PING_IMSERVER && id != IMConstants.PROTO_PING_IMSERVER) {

                console.log("[onmessage] Message: " + JSON.stringify(rcvData))
            }


            switch (id) {

                case IMConstants.PROTO_IM_GROUP_CHAT_MSG:

                    this.onChatMessage(rcvData);
                    break;

                case IMConstants.PROTO_IM_GROUP_CHAT_MSG_ACK:

                    this.onReceiveMessageAck(rcvData);
                    break;

                case IMConstants.PROTO_IM_ECHO_GROUP_CHAT_MSG:

                    this.onChatMessage(rcvData);
                    break;

                case IMConstants.PROTO_IM_DYNAMIC_UPDATE:

                    this.onDynamicUpdate(rcvData);
                    break;

                case IMConstants.PROTO_IM_SMS_ACK:

                    this.onReceiveSMSACK(rcvData);
                    break;

                case IMConstants.PROTO_IM_ECHO_GROUP_CHAT_MSG:

                    break;

                case IMConstants.PROTO_BUDDYSTATUS:

                    this.onReceiveUserStatus(rcvData)
                    break;

                case IMConstants.PROTO_PING_IMSERVER:
                case IMConstants.PROTO_SERVER_PING_IMSERVER:

                    IMConnector.setPingTime();
                    break;

                case IMConstants.PROTO_IM_STREAM_COMPLETED:

                    this.sendPendingMessages()
                    break

                case IMConstants.PRO_IM_LOADING_DONE:

                    break

            }

        } catch (e) {

            console.log('[IMHandler].processIncomingMessage() Error :: ' + e);
        }
    }

    //*****************             SEND FUNCTIONS  [START]    ***********************/

    sendChatMessage(messageData) {

        try {

            this.setSMSPendigList(messageData);

            let message = messageData.message
            if (messageData.msgtype === IMConstants.WS_IM_MMS) {

                message = JSON.parse(message)
                let attchmenetList = (typeof message.msg === 'object') ? message.msg : JSON.parse(message.msg);
                let msg = []

                attchmenetList.forEach((value) => {

                    let data = {

                        mediatype: value.mediatype,
                        link: value.link,
                        filesize: value.filesize,
                        filename: value.filename,
                        extension: value.extension,
                        width: value.width,
                        height: value.height,
                    }

                    msg.push(data)
                })

                message.msg = msg
                message = JSON.stringify(message)
            }

            let messageProtocolFormat = [
                IMConstants.PROTO_IM_GROUP_CHAT_MSG + "",
                messageData.msgtype + "",
                messageData.cid,
                "",
                message,
                "",
                "",
                messageData.phnumber,
            ]

            messageProtocolFormat = Utils.doFormat(IMConstants.IM_PROTO_SMS_PROTOCOL, messageProtocolFormat, false);

            IMConnector.sendMessage(messageProtocolFormat)

        } catch (e) {
            console.log('[IMHandler].sendChatMessage() Error :: ' + e);
        }


    }

    setSMSPendigList(data) {
        try {

            smsPendigList.set(data.cid, data.sid);

        } catch (e) {
            console.log('[IMHandler].setSMSPendigList() Error :: ' + e);
        }
    }

    //4000
    sendAck = (msgId, smsgId, msgType) => {

        try {

            let ackData = [smsgId, IMConstants.PROTO_IM_CHAT_ACK, msgId, msgType]
            var message = Utils.doFormat(IMConstants.IM_PROTO_ACK, ackData, false)

            console.log('[sendAck] -- message: ' + message)
            IMConnector.sendMessage(message)

        } catch (e) {

            console.log('[IMHandler].sendAck Error :: ' + e);
        }

    }

    sendPendingMessages = async () => {
        try {

            if (smsPendigList) {

                smsPendigList.forEach((sid, cid) => {

                    let dataList = MessageHandler.getSMSMessages(sid)
                    let index = dataList.findIndex(object => object.cid == cid)
                    let messageData = dataList[index]

                    this.sendOutboundSMS(messageData)
                })
            }

        } catch (e) {
            console.log('[IMHandler].sendPendingMessages Error :: ' + e);
        }
    }

    //*****************             SEND FUNCTIONS  [END]    ***********************/




    //*****************             RECEIVE FUNCTIONS [START]  ***********************/

    //504
    onChatMessage(data) {
        try {

            console.log('[onChatMessage] data: ' + JSON.stringify(data))

            if (data.Message.pstream && data.Message.pstream.Value == 1) {

                console.log('[onChatMessage]   == HANDLE PENDING EVENTS == : ')
                this.onReceivePendingMessages(data)
                return
            }

            StreamsHandler.onIncomingMessage(data, data.Message);

            /*
            let sid;

            const message_data = {

                cid: '',
                tname: data.Message.tname.Value,
                from_user: data.Message.fromuser.Value,
                message: data.Message.msg.Value,
                msgtype: data.Message.msgtype,
                type: Constants.REQ_TYPE_CHAT.WS_INCOMING_CHAT_MESSAGE,
                id: Date.now(),
                messagetime: time,
                direct: 1,
                extramsg: "",
                smsgid: data.Message.smsgid.Value,
                direction: 2,
                delivery_status: 1
            }

            // handle Incoming SMS protocol and save the message details in local to show
            if (data.Message.msgtype &&
                (data.Message.msgtype.Value == IMConstants.WS_IM_SMS ||
                    data.Message.msgtype.Value == IMConstants.WS_IM_MMS)) {

                var time = moment(Date(data.Message.time.Value)).utc().format('HH:mm a');

                let message = JSON.parse(data.Message.msg.Value);

                sid = data.Message.phnum.Value

                if (message.group_code) {

                    sid = message.group_code + "_" + data.Message.phnum.Value
                }

                message_data.sid = sid;
                message_data.phnum = data.Message.phnum.Value;
                message_data.phnumber = data.Message.phnum.Value;

            }

            MessageHandler.addSMSMessage(sid, message_data);

            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, message_data);

            this.sendAck(data.Message.ParamsId.id, data.Message.smsgid.Value, data.Message.msgtype.Value)
            */
        } catch (e) {

            console.log('[IMHandler].onChatMessage Error :: ' + e);
        }
    }

    onReceivePendingMessages(data) {

        try {

            console.log('[onReceivePendingMessages] length: ' + data.Message.msginfo.length)
            data.Message.msginfo.forEach((element) => {

                StreamsHandler.onIncomingMessage(data, element);

                /*
                let sid;

                const message_data = {

                    cid: '',
                    tname: element.tname.Value,
                    from_user: element.fromuser.Value,
                    message: element.msg.Value,
                    msgtype: element.msgtype.Value,
                    type: Constants.REQ_TYPE_CHAT.WS_INCOMING_CHAT_MESSAGE,
                    id: Date.now(),
                    messagetime: time,
                    direct: 1,
                    extramsg: "",
                    smsgid: element.smsgid.Value,
                    direction: 2,
                    delivery_status: 1
                }

                if (element.msgtype &&
                    (element.msgtype.Value == IMConstants.WS_IM_SMS ||
                        element.msgtype.Value == IMConstants.WS_IM_MMS)) {

                    var time = moment(Date(element.time.Value)).utc().format('HH:mm a');

                    let message = JSON.parse(element.msg.Value);

                    if (message.group_code) {

                        sid = message.group_code + "_" + element.phnum.Value
                    }

                    message_data.sid = sid;
                    message_data.phnum = element.phnum.Value;
                    message_data.phnumber = element.phnum.Value;
                }

                MessageHandler.addSMSMessage(sid, message_data);

                this.sendAck(data.Message.ParamsId.id, element.smsgid.Value, element.msgtype.Value)
                */
            })

            //EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, message_data);

        } catch (e) {
            console.log('[IMHandler].onReceivePendingMessages Error :: ' + e);
        }
    }

    /*
    processIncomingMessage(data, element) {

        try {

            let sid;

            const message_data = {

                cid: '',
                tname: element.tname.Value,
                from_user: element.fromuser.Value,
                message: element.msg.Value,
                msgtype: element.msgtype.Value,
                type: Constants.REQ_TYPE_CHAT.WS_INCOMING_CHAT_MESSAGE,
                id: Date.now(),
                messagetime: time,
                direct: 1,
                extramsg: "",
                smsgid: element.smsgid.Value,
                direction: 2,
                delivery_status: 1
            }

            if (element.msgtype &&
                (element.msgtype.Value == IMConstants.WS_IM_SMS ||
                    element.msgtype.Value == IMConstants.WS_IM_MMS)) {

                var time = moment(Date(element.time.Value)).utc().format('HH:mm a');

                let message = JSON.parse(element.msg.Value);

                if (message.group_code) {

                    sid = message.group_code + "_" + element.phnum.Value
                }

                message_data.sid = sid;
                message_data.phnum = element.phnum.Value;
                message_data.phnumber = element.phnum.Value;
            }

            MessageHandler.addSMSMessage(sid, message_data);

            //Add message in DID Recents and Groups Recents array list
            if (element.message.group_code) {


            }

            //updateUnreadCount();

            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, message_data);
            //Send Notitication to DID and User components

            this.sendAck(data.Message.ParamsId.id, element.smsgid.Value, element.msgtype.Value)

        } catch (e) {
            console.log('[IMHandler].processIncomingMessage Error :: ' + e);
        }
    }*/

    //506
    onReceiveMessageAck(data) {

        try {

            if (data.Message.pstream && data.Message.pstream.Value == 1) {

                console.log('[onReceiveMessageAck]   == HANDLE PENDING EVENTS == : ')
                this.onReceivePendingMessageAck(data)
                return
            }

            let cid = data.Message.cid.Value;
            console.log('[onReceiveMessageAck] --- cid : ' + cid + ', smsPendigList size: ' + smsPendigList.size)

            if (smsPendigList && smsPendigList.size > 0) {

                let sid = smsPendigList.get(cid);

                console.log('[onReceiveMessageAck] --- sid : ' + sid)

                if (sid) {

                    let dataList = MessageHandler.getSMSMessages(sid)
                    if (dataList) {

                        let index = dataList.findIndex(object => object.cid == cid)
                        let messageData = dataList[index]
                        messageData.delivery_status = 1
                        messageData.smsgid = data.Message.smsgid.Value
                        EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, messageData);
                        // dataList.slice(index, 1)
                        // dataList[index] = messageData
                        // console.log('[onReceiveMessageAck] --- dataList : ' + JSON.stringify(dataList))
                    }

                    smsPendigList.delete(cid);

                }
            }

            this.sendAck(data.Message.ParamsId.id, data.Message.smsgid.Value, '')

            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, {});

        } catch (e) {

            console.log('[IMHandler].onReceiveMessageAck Error :: ' + e);
        }
    }

    onReceivePendingMessageAck(data) {

        try {

            data.Message.msginfo.forEach((element) => {

                let cid = element.cid.Value;
                if (smsPendigList && smsPendigList.size > 0) {

                    let sid = smsPendigList.get(cid)

                    console.log('[onReceivePendingMessageAck] --- sid : ' + sid)

                    if (sid) {

                        let dataList = MessageHandler.getSMSMessages(sid)
                        if (dataList) {

                            let index = dataList.findIndex(object => object.cid == cid)
                            let messageData = dataList[index]
                            messageData.delivery_status = 1
                            messageData.smsgid = element.smsgid.Value
                            // dataList.slice(index, 1)
                            // dataList[index] = messageData
                            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, {});
                            this.sendAck(data.Message.ParamsId.id, element.smsgid.Value, messageData.msgtype)
                        }

                        smsPendigList.delete(cid);

                    }


                }
            })


        } catch (e) {
            console.log('[IMHandler].onReceivePendingMessageAck Error :: ' + e);
        }

    }

    //508
    onReceiveSMSACK(data) {

        try {

            if (data.Message.pstream && data.Message.pstream.Value == 1) {

                console.log('[onReceiveSMSACK]   == HANDLE PENDING EVENTS == : ')
                this.onReceivePendingSMSACK(data)
                return
            }

            console.log('[onReceiveSMSACK]   data: ' + JSON.stringify(data));

            let orgsmsgid = data.Message.orgsmsgid.Value;
            let phnumber = data.Message.phnum.Value
            let msgData = JSON.parse(data.Message.msg.Value)

            let sid = data.Message.phnum.Value
            if (msgData && msgData.group_code) {

                sid = msgData.group_code + '_' + phnumber
            }

            console.log('[onReceiveSMSACK]  == sid : ' + sid);

            let dataList = MessageHandler.getSMSMessages(sid)
            if (dataList) {

                let index = dataList.findIndex(object => object.smsgid == orgsmsgid)
                let messageData = dataList[index]

                console.log(TAG + "[onReceiveSMSACK] dataList :: " + JSON.stringify(dataList) + " :: messageData : " + JSON.stringify(messageData));

                if (messageData) {

                    let failureReason = {
                        code: msgData.code,
                        errcode: msgData.errcode,
                        reason: msgData.reason,
                    }

                    messageData.failure_reason = JSON.stringify(failureReason)

                    // dataList.slice(index, 1)
                    // dataList[index] = messageData

                    // let msg = JSON.parse(messageData.message)
                    // msg['code'] = msgData.code
                    // msg['errcode'] = msgData.errcode
                    // msg['failure_reason'] = msgData.reason

                    //messageData.message = JSON.stringify(msg)
                    //dataList[index] = messageData
                    console.log('[onReceiveSMSACK]   update done : ');
                    EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, {});
                    this.sendAck(data.Message.ParamsId.id, data.Message.smsgid.Value, messageData.msgtype)
                }
            }

        } catch (e) {

            console.log('[IMHandler].onReceiveSMSACK Error :: ' + e);
        }

    }

    onReceivePendingSMSACK(data) {

        try {

            data.Message.msginfo.forEach((element) => {

                let orgsmsgid = element.orgsmsgid.Value;
                let phnumber = element.phnum.Value
                let msgData = JSON.parse(element.msg.Value)

                let sid = element.phnum.Value
                if (msgData && msgData != undefined && msgData.group_code && msgData.group_code != undefined) {
                    if (phnumber && phnumber != undefined) {
                        phnumber = msgData.to
                    }
                    sid = msgData.group_code + '_' + phnumber
                }

                let dataList = MessageHandler.getSMSMessages(sid)
                if (dataList) {

                    let index = dataList.findIndex(object => object.smsgid == orgsmsgid)
                    let messageData = dataList[index]

                    if (messageData && messageData != undefined) {

                        let failureReason = {
                            code: msgData.code,
                            errcode: msgData.errcode,
                            reason: msgData.reason,
                        }

                        messageData.failure_reason = JSON.stringify(failureReason)
                        // dataList.slice(index, 1)
                        // dataList[index] = messageData

                        // let msg = JSON.parse(messageData.message)

                        // msg['code'] = msgData.code
                        // msg['errcode'] = msgData.errcode
                        // msg['failure_reason'] = msgData.reason

                        //messageData.message = JSON.stringify(msg)
                        // dataList[index] = messageData

                    }
                }

                this.sendAck(data.Message.ParamsId.id, element.smsgid.Value, '')

            })

            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, {});

        } catch (e) {
            console.log('[IMHandler].onReceivePendingSMSACK Error :: ' + e);
        }
    }

    //753
    onReceiveUserStatus(data) {

        try {

            let name = data.Message.XMLChatter.ParamsId.name;

            let strStatusMsg = data.Message.XMLChatter.ParamsId.status.replace(/\+/g, " ");
            if (strStatusMsg != null && strStatusMsg.indexOf("+") !== -1) {
                strStatusMsg = strStatusMsg.replace(/\+/g, " ");
            }
            strStatusMsg = strStatusMsg.replace(/'/g, "''");
            try {
                strStatusMsg = decodeURIComponent(strStatusMsg);
                if (strStatusMsg && strStatusMsg.indexOf("#") !== -1) {
                    strStatusMsg = strStatusMsg.substring(strStatusMsg.indexOf("#") + 1);
                }
            } catch (e) {
                if (strStatusMsg.indexOf("#") !== -1) {
                    strStatusMsg = strStatusMsg.substring(strStatusMsg.indexOf("#") + 1);
                }
            }

            console.log('[onReceiveUserStatus] -- name: ' + name + ', strStatusMsg: ' + strStatusMsg)
            usersStautsList.set(name, strStatusMsg)

            // update Buddy status
            let loggedUser = localStorage.getItem(Params.WS_LOGIN_USER)
            if (loggedUser === name) {
                EvntEmitter.emit(EmitterConstants.EMMIT_ON_IM_CONNECT, {})
            }

            this.sendAck(data.Message.ParamsId.id, data.Message.XMLChatter.ParamsId.smsgid, '')

        } catch (e) {

            console.log('[IMHandler].onReceiveUserStatus Error :: ' + e);
        }
    }


    onDynamicUpdate = async (rcvData) => {

        try {

            let nMsgType = rcvData.Message.msgtype;

            switch (nMsgType) {

                case IMConstants.WS_SMS_FEATURE_ENABLED:
                case IMConstants.WS_SMS_FEATURE_DISABLED:

                    let msg = JSON.parse(rcvData.Message.msg);
                    let phnumbersArray = msg.phnums;

                    let finalPhoneNumbers;
                    phnumbersArray.Map((phnumber, index) => {

                        if (phnumber.length == 0) {

                            finalPhoneNumbers = phnumber;
                        } else {

                            finalPhoneNumbers = finalPhoneNumbers + "," + phnumber;
                        }
                    });

                    let enable_status = true;
                    if (nMsgType === IMConstants.WS_SMS_FEATURE_DISABLED) {

                        enable_status = false;
                    }

                    SettingsHandler.saveSMSSettings(enable_status, finalPhoneNumbers);

                    break;

                case IMConstants.WS_SMS_SEND_ALERT_DISPLAY_STATUS:

                    msg = rcvData.Message.msg;

                    if (msg === '') {

                        msg = '0';
                    }

                    localStorage.setItem(Constants.WS_KEY_SMS_DONT_ASK_STATUS, msg);
                    break;

                case IMConstants.WS_SMS_SMS_ALWAYS_USE_DID:

                    msg = JSON.parse(rcvData.Message.msg);
                    let phnumber = msg.phnum;

                    if (!phnumber) {

                        return;
                    }

                    let status = msg.enable;
                    if (!status) {

                        return;
                    }

                    if ((status * 1) === 2) {

                        const sms_from_to_details = {

                            from: phnumber,
                            sms_always_use_status: 1
                        };

                        localStorage.setItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID_DETAILS, sms_from_to_details);
                        localStorage.setItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID, phnumber);

                    } else if ((status * 1) === 0) {

                        localStorage.removeItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID_DETAILS);
                        localStorage.removeItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID);
                    }

                    break;

                case IMConstants.WS_SMS_FEATURE_ENABLED_ACCOUNT_LEVLE:
                case IMConstants.WS_SMS_FEATURE_ENABLED_USER_LEVLE:

                    if (nMsgType === IMConstants.WS_SMS_FEATURE_ENABLED_ACCOUNT_LEVLE) {

                        localStorage.setItem(Constants.WS_KEY_SMS_ACCOUNT_LEVEL_ENABLE_STATUS, true);

                    } else if (nMsgType === IMConstants.WS_SMS_FEATURE_ENABLED_USER_LEVLE) {

                        localStorage.setItem(Constants.WS_KEY_SMS_USER_LEVEL_ENABLE_STATUS, true);
                    }

                    let fromUserDIDList = localStorage.getItem(Constants.WS_KEY_SMS_DID_LIST);
                    if (fromUserDIDList && fromUserDIDList.length > 0) {

                        /*
                        If Account level is enabled, then at User level is also enabled then only set the feature as 'true'
                        If User level is enabled, then at Account level is also enabled then only set the feature as 'true'
                        */
                        if (nMsgType === IMConstants.WS_SMS_FEATURE_ENABLED_ACCOUNT_LEVLE) {

                            let userLevelSetting = localStorage.getItem(Constants.WS_KEY_SMS_USER_LEVEL_ENABLE_STATUS);
                            if (userLevelSetting == true) {

                                localStorage.setItem(Constants.WS_KEY_SMS_ENABLED_STATUS, true);
                            }

                        } else if (nMsgType === IMConstants.WS_SMS_FEATURE_ENABLED_USER_LEVLE) {

                            let accountLevelSetting = localStorage.getItem(Constants.WS_KEY_SMS_ACCOUNT_LEVEL_ENABLE_STATUS);
                            if (accountLevelSetting == true) {

                                localStorage.setItem(Constants.WS_KEY_SMS_ENABLED_STATUS, true);
                            }

                        }
                    }

                    break;

                case IMConstants.WS_SMS_FEATURE_DISABLED_ACCOUNT_LEVLE:
                case IMConstants.WS_SMS_FEATURE_DISABLED_USER_LEVLE:

                    localStorage.setItem(Constants.WS_KEY_SMS_ENABLED_STATUS, false);

                    if (nMsgType === IMConstants.WS_SMS_FEATURE_DISABLED_ACCOUNT_LEVLE) {

                        localStorage.setItem(Constants.WS_KEY_SMS_ACCOUNT_LEVEL_ENABLE_STATUS, false);
                    } else if (nMsgType === IMConstants.WS_SMS_FEATURE_DISABLED_USER_LEVLE) {

                        localStorage.setItem(Constants.WS_KEY_SMS_USER_LEVEL_ENABLE_STATUS, true);
                    }

                    break;

            }

        } catch (e) {
            console.log('[IMHandler].onDynamicUpdate Error :: ' + e);
        }
    }

    //*****************             RECEIVE FUNCTIONS [END]  ***********************/


    //*****************             GENERAL FUNCTIONS [START]  ***********************/
    getUserAuthendicationDetails() {

        try {

            let login_user = localStorage.getItem(Params.WS_LOGIN_USER);
            let xauthtoken = localStorage.getItem(Params.WS_XAUTH_TOKEN);

            let macid = localStorage.getItem(Params.MACID);
            if (!macid) {

                macid = uuid();
                localStorage.setItem(Params.MACID, macid)
            }
            let systemInfo = navigator.userAgent

            return [
                IMConstants.PROTO_IM_CONNECT,
                login_user, //name
                xauthtoken, //key
                IMConstants.IM_CONNECT_SHARE_PREF_USER_TYPE,//SHARE_PREF_USER_TYPE
                IMConstants.IM_CONNECT_ENCODING, //encoding
                IMConstants.IM_CONNECT_DEVICE_TYPE, //device_type
                IMConstants.IM_CONNECT_CFLAG, //cflag
                macid, //macid
                systemInfo, //system_info
                IMConstants.IM_CONNECT_ACE_STATUS, //ace_status
                IMConstants.IM_CONNECT_ULM_CONNECT_STATUS, //ulm_connect_status
                IMConstants.IM_CONNECT_CACHE_CAPABILITY, //cache_capability
                IMConstants.IM_CONNECT_APPTYPE, //apptype
                IMConstants.IM_CONNECT_CLIENT_IP, //clientip
                IMConstants.IM_CONNECT_VERSION, //version
                IMConstants.IM_CONNECT_BULK_PSTREAM, //bulkpstream
                IMConstants.IM_CONNECT_DND_STATUS, //dnd_status
                IMConstants.IM_CONNECT_GROUP_SMS, // grpsms
            ];

        } catch (e) {

            console.log('[IMHandler].getUserAuthendicationDetails() Error :: ' + e);
        }
    }

    //*****************             GENERAL FUNCTIONS [END]  ***********************/


    processReadSMSStatus = (data) => {

    }

    processEditSMS = (data) => {

    }

    processDeleteSMS = (data) => {

    }

    processFinalProtocol = (data) => {

    }

}

let imHandlerInstance = Object.freeze(new IMHandler());
export default imHandlerInstance; 