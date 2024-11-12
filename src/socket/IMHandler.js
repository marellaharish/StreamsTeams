
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

            let id = parseInt(rcvData.Message.id)
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

                case IMConstants.PROTO_IM_LOADING_DONE:

                    break

                case IMConstants.PROTO_IM_GROUP_CHAT_READ_SERVER_STATUS:

                    this.onReceiveMessageReadStatus(rcvData)
                    break

                case IMConstants.PROTO_IM_GROUP_CHAT_SERVER_READ_ACK:

                    this.onReceiveMessageReadStatusAck(rcvData)
                    break

                case IMConstants.PROTO_IM_MSG_DELETE:
                    this.onReceiveMessageDelete(rcvData)
                    break

            }

        } catch (e) {

            console.log('[IMHandler].processIncomingMessage() Error :: ' + e);
        }
    }

    //*****************             SEND FUNCTIONS  [START]    ***********************/

    async sendChatMessage(messageData) {

        try {

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

            let prepareDataForpending = {
                sid: messageData.sid,
                protocol: messageProtocolFormat
            }

            this.setSMSPendigList(messageData.cid, prepareDataForpending);
            IMConnector.sendMessage(messageProtocolFormat)

        } catch (e) {
            console.log('[IMHandler].sendChatMessage() Error :: ' + e);
        }


    }

    setSMSPendigList(cid, data) {
        try {

            smsPendigList.set(cid, data);

        } catch (e) {
            console.log('[IMHandler].setSMSPendigList() Error :: ' + e);
        }
    }

    //4000
    sendAck = async (msgId, smsgId, msgType) => {

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

            console.log(TAG + "[sendPendingMessages] ------ smsPendigList :: " + smsPendigList.length);

            if (smsPendigList) {

                smsPendigList.forEach((data, cid) => {

                    let protocol = data.protocol

                    this.setSMSPendigList(cid, data)
                    IMConnector.sendMessage(protocol)
                })
            }

        } catch (e) {
            console.log('[IMHandler].sendPendingMessages Error :: ' + e);
        }
    }

    //*****************             SEND FUNCTIONS  [END]    ***********************/




    //*****************             RECEIVE FUNCTIONS [START]  ***********************/

    //504
    async onChatMessage(data) {
        try {

            console.log('[onChatMessage] data: ' + JSON.stringify(data))

            if (data.Message.pstream && data.Message.pstream == 1) {

                console.log('[onChatMessage]   == HANDLE PENDING EVENTS == : ')
                this.onReceivePendingMessages(data)
                return
            }

            StreamsHandler.onIncomingMessage(data, data.Message);

        } catch (e) {

            console.log('[IMHandler].onChatMessage Error :: ' + e);
        }
    }

    async onReceivePendingMessages(data) {

        try {

            console.log('[onReceivePendingMessages] length: ' + data.Message.msginfo.length)
            data.Message.msginfo.forEach((element) => {

                StreamsHandler.onIncomingMessage(data, element);
            })

        } catch (e) {
            console.log('[IMHandler].onReceivePendingMessages Error :: ' + e);
        }
    }

    //506
    async onReceiveMessageAck(data) {

        try {

            if (data.Message.pstream && data.Message.pstream == 1) {

                console.log(TAG + '[onReceiveMessageAck]   == HANDLE PENDING EVENTS == : ')

                data.Message.msginfo.forEach((element) => {

                    this.processMessageReceiveACK(element.cid, element.smsgid);
                })

                return
            }

            console.log(TAG + '[onReceiveMessageAck] --- cid : ' + data.Message.cid)

            this.processMessageReceiveACK(data.Message.cid, data.Message.smsgid);

        } catch (e) {

            console.log('[IMHandler].onReceiveMessageAck Error :: ' + e);
        }
    }

    //508
    async onReceiveSMSACK(data) {

        try {

            console.log('[onReceiveSMSACK] =================  ');

            if (data.Message.pstream && data.Message.pstream == 1) {

                console.log('[onReceiveSMSACK]   == HANDLE PENDING EVENTS == : ')

                data.Message.msginfo.forEach((element) => {

                    this.procesSMSReceiveACK(element);
                });

                return
            }

            this.procesSMSReceiveACK(data.Message);

        } catch (e) {

            console.log('[IMHandler].onReceiveSMSACK Error :: ' + e);
        }

    }

    //753
    async onReceiveUserStatus(data) {

        try {

            let name = data.Message.XMLChatter.name;

            let strStatusMsg = data.Message.XMLChatter.status.replace(/\+/g, " ");
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

            this.sendAck(data.Message.id, data.Message.XMLChatter.smsgid, '')

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

    //513
    async onReceiveMessageReadStatusAck(data) {

        try {

            if (data.Message.pstream && data.Message.pstream == 1) {

                console.log('[onReceiveMessageReadStatusAck]   == HANDLE PENDING EVENTS == : ')
                // this.onReceivePendingMessageAck(data)
                return
            }

            let cid = data.Message.cid;
            console.log('[onReceiveMessageReadStatusAck] --- cid : ' + cid + ', smsPendigList size: ' + smsPendigList.size)

            if (cid && smsPendigList && smsPendigList.size > 0) {
                smsPendigList.delete(cid);
            }

            this.sendAck(data.Message.id, data.Message.smsgid, '')

        } catch (e) {
            console.log('[IMHandler].onReceiveMessageReadStatusAck Error :: ' + e);
        }
    }

    //514
    async onReceiveMessageReadStatus(data) {

        try {

            if (data.Message.pstream && data.Message.pstream == 1) {

                console.log(TAG + '[onReceiveMessageReadStatus]   == HANDLE PENDING EVENTS == : ')
                return
            }

            console.log(TAG + '[onReceiveMessageReadStatus]   data: ' + JSON.stringify(data));

            let sid = data.Message.sid;
            let readSmsgid = data.Message.readsmsgid;
            let phnumber = data.Message.phnum ? data.Message.phnum : "";
            let msgData = data.Message.msg ? JSON.parse(data.Message.msg) : undefined;

            console.log(TAG + 'onReceiveMessageReadStatus sid :: ' + sid);

            if (!readSmsgid || readSmsgid === '') {

                console.log(TAG + '[onReceiveMessageReadStatus] == readSmsgid NOT FOUND IN RECEIVED PROTOCOL == ');
                return
            }

            let msg_data = {
                sid: sid,
            }

            if (phnumber) {
                msg_data.phnumber = phnumber;
            }

            if (msgData && msgData.grp_code) {

                msg_data.group_code = (msgData.grp_code * 1);
                msg_data.phnumber = (msgData.from_num * 1);
            }

            StreamsHandler.clearUnreadCount(msg_data);

            this.sendAck(data.Message.id, data.Message.smsgid, '')

        } catch (e) {
            console.log('[IMHandler].onReceiveMessageReadStatus Error :: ' + e);
        }
    }

    //541
    async onReceiveMessageDelete(data) {

        try {

            if (data.Message.pstream && data.Message.pstream == 1) {

                console.log('[onReceiveMessageReadStatusAck]   == HANDLE PENDING EVENTS == : ')
                data.Message.msginfo.forEach((element) => {

                    this.processDeleteMessage(element);
                })
                return
            }

            this.processDeleteMessage(data.Message);


        } catch (e) {
            console.log(TAG + '[onReceiveMessageDelete] Error :: ' + e);
        }
    }

    //*****************             RECEIVE FUNCTIONS [END]  ***********************/


    //*****************             GENERAL FUNCTIONS [START]  ***********************/

    //508
    procesSMSReceiveACK(element) {

        try {

            let orgsmsgid = element.orgsmsgid;
            let phnumber = element.phnum
            let msgData = JSON.parse(element.msg)

            let sid = element.sid ? element.sid : '';

            if (element.phnum) {

                sid = element.phnum;
            }

            if (msgData && msgData != undefined && msgData.group_code && msgData.group_code != undefined) {

                if (phnumber && phnumber != undefined) {

                    phnumber = msgData.to
                }

                sid = msgData.group_code + '_' + phnumber
            }

            let dataList = MessageHandler.getSMSMessages(sid)
            if (!dataList) {

                console.log(TAG + "[procesSMSReceiveACK] NO MESSAGES FOUND WITH THIS SID :: " + sid);
                return
            }

            let messageData = dataList.find(object => object.smsgid == orgsmsgid)

            console.log(TAG + "[procesSMSReceiveACK] messageDAta :: " + JSON.stringify(messageData));

            if (messageData) {

                let failureReason = {

                    code: msgData.code,
                    errcode: msgData.errcode,
                    reason: msgData.reason,
                }

                messageData.failure_reason = JSON.stringify(failureReason)

                console.log('[procesSMSReceiveACK]   update done : ');

                EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, messageData);

                this.sendAck(IMConstants.PROTO_IM_SMS_ACK, element.smsgid, messageData.msgtype)
            }



        } catch (e) {
            console.log(TAG + '[procesSMSReceiveACK] Error :: ' + e);
        }
    }

    //506
    processMessageReceiveACK(cid, smsgid) {

        try {

            if (!smsPendigList || smsPendigList.size === 0) {

                console.log(TAG + "[processMessageReceiveACK] NO PENDING MESSAGES ARE AVAILABLE ===========");
                return;
            }

            let peding_data = smsPendigList.get(cid);
            const sid = peding_data.sid
            console.log(TAG + '[processMessageReceiveACK] --- sid : ' + sid + ' :: data :: ' + JSON.stringify(peding_data))

            if (!sid) {

                console.log(TAG + '[processMessageReceiveACK] --- SID IS NOT AVAILABLE ----------- ');
                return;
            }

            let dataList = MessageHandler.getSMSMessages(sid)
            if (dataList) {

                let messageData = dataList.find(object => object.cid == cid)
                if (messageData) {

                    messageData.delivery_status = 1
                    messageData.smsgid = smsgid

                    smsPendigList.delete(cid);

                    this.sendAck(IMConstants.PROTO_IM_GROUP_CHAT_MSG_ACK, smsgid, messageData.msgtype)

                    EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, messageData);

                }

            }

        } catch (e) {
            console.log(TAG + '[processMessageReceiveACK] Error :: ' + e);
        }
    }

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

    // 541
    processDeleteMessage(element) {

        try {

            let orgsmsgid = element.orgsmsgid;

            let editOrDeleteMessageList = StreamsHandler.getEditOrDeleteMessageList()
            let sid = undefined

            if (editOrDeleteMessageList && editOrDeleteMessageList.length > 0) {

                let index = editOrDeleteMessageList.findIndex(object => (object.smsgid * 1) === (orgsmsgid * 1))
                let data = editOrDeleteMessageList[index]

                sid = data.sid
                editOrDeleteMessageList.splice(index, 1)
            }

            console.log(TAG + "[processDeleteMessage] sid :: " + sid);
            if (!sid) {

                console.log(TAG + "[processDeleteMessage] SID NOT FOUND FROM LIST :: ");
                return
            }

            let dataList = MessageHandler.getSMSMessages(sid)
            if (!dataList) {

                console.log(TAG + "[processDeleteMessage] NO MESSAGES FOUND WITH THIS SID :: " + sid);
                return
            }

            let index = dataList.findIndex(object => (object.smsgid * 1) === (orgsmsgid * 1))
            if (index && index >= 0) {

                let messageData = dataList[index]
                dataList.splice(index, 1)

                EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, messageData);

                this.sendAck(IMConstants.PROTO_IM_SMS_ACK, element.smsgid, '')
            }

        } catch (e) {
            console.log(TAG + '[processDeleteMessage] Error :: ' + e);
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