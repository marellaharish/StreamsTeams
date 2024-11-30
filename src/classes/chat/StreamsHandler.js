import Constants from "../../config/Constants"
import MessaageConstants from "../../config/MessaageConstants"
import Params from "../../config/Params"
import MessageHandler from "../chat/MessageHandler"
import EmitterConstants from '../../config/EmitterConstants'
import EvntEmitter from '../../classes/utils/EvntEmitter';
import Utils from "../utils/util"
import IMConstants from "../../config/IMConstants"
import UploadHandler from "../../classes/media/UploadHandler"
import IMHandler from "../../socket/IMHandler"
import IMConnector from '../../socket/IMConnector'
import SettingsHandler from '../../classes/settings/SettingsHandler'

var moment = require('moment');

let TAG = "[StreamsHandler].";
class StreamsHandler {

    constructor() {

        this.sms_group_did_list = new Map();

        this.editOrDeleteMessageList = []
    }

    //================      IM Functions [start] ======================

    onOutgoingMessage(sid, to_user, message, msg_type, direct) {

        try {

            console.log("[onOutgoingMessage] sid " + sid + " :: message :: " + JSON.stringify(message) + " :: to_user :: " + to_user);

            let cid = Utils.getTimeStamp();
            let login_user = localStorage.getItem(Params.WS_LOGIN_USER);
            let temp_sid = sid;
            let sms_id;
            let phnumber;

            const message_data = {

                from_user: login_user,
                message: JSON.stringify(message),
                smsgid: "",
                type: Constants.REQ_TYPE_CHAT.WS_OUTGOING_MESSAGE,
                msgtype: msg_type,
                //sent_status: 0,
                sid: sms_id,
                cid: cid,
                direct: direct,
                latest_time: Utils.getCurrentUTCTime(),
                extramsg: "",
                direction: 1,
                unread_count: 0

            };

            if (msg_type == IMConstants.WS_IM_SMS) {

                phnumber = message.to;

                sms_id = phnumber;

                if (temp_sid == phnumber) {//this is not Stream contact. For non-stream contact we are maintaing sid as phonenumber. To IM Server we need to send sid as empty for non-stream contact.

                    temp_sid = '';
                }

                let group_sms_status = this.isGroupSMS(message);
                if (group_sms_status) {

                    sms_id = message.group_code + "_" + phnumber;
                    temp_sid = '';
                }

                message_data.phnumber = phnumber;
                message_data.sid = sms_id;

                this.appendSMSToDIDRecents(message_data, msg_type);

                MessageHandler.addSMSMessage(sms_id, message_data);
                MessageHandler.updateSMSTabMessage(message_data.phnumber, message_data);

                EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUPS_RECEIVED, {});

            }

            console.log("[onOutgoingMessage] --- " + JSON.stringify(message_data) + " :: sms_id :: " + sms_id);

            IMHandler.sendChatMessage(message_data)

            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, message_data);

        } catch (e) {

            console.log('[onOutgoingMessage] Error  -------- :: ' + e);
        }
    }

    onOutgoingMessageAttachment(sid, name, message, msg_type, direct) {

        try {

            let cid = Utils.getTimeStamp();
            let login_user = localStorage.getItem(Params.WS_LOGIN_USER);
            let temp_sid = sid;
            let sms_id;
            let phnumber;

            if (msg_type == IMConstants.WS_IM_MMS) {

                phnumber = message.to;

                sms_id = phnumber;

                let group_sms_status = this.isGroupSMS(message);
                if (group_sms_status) {


                    sms_id = message.group_code + "_" + phnumber;
                    temp_sid = '';
                }
            }

            const message_data = {

                from_user: login_user,
                message: JSON.stringify(message),
                smsgid: "",
                type: Constants.REQ_TYPE_CHAT.WS_OUTGOING_MESSAGE,
                msgtype: msg_type,
                //sent_status: 0,
                sid: sms_id,
                cid: cid,
                direct: direct,
                latest_time: Utils.getCurrentUTCTime(),
                phnumber: phnumber,
                extramsg: "",
                direction: 1,
                unread_count: 0
            };

            console.log("[onOutgoingMessage] --- " + JSON.stringify(message_data));

            MessageHandler.addSMSMessage(sms_id, message_data);
            this.appendSMSToDIDRecents(message_data, msg_type);
            MessageHandler.updateSMSTabMessage(message_data.phnumber, message_data);

            UploadHandler.uploadAttachments(message_data);

            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, message_data);
            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUPS_RECEIVED, {});

        } catch (e) {

            console.log('[onOutgoingMessageAttachment] Error  -------- :: ' + e);
        }
    }

    onIncomingMessage(data, element) {

        try {

            let login_user = localStorage.getItem(Params.WS_LOGIN_USER);

            console.log(TAG + '[onIncomingMessage] data :: ' + JSON.stringify(element));

            let sid = '';//(element.sid && Object.keys(element.sid).length) ? element.sid : '';
            //let isMute = element.mute && element.mute.length > 0 ? true : false;
            let soundFiled = element.sfid ? element.sfid : "";

            let bEchoStatus = false;

            if (element.fromuser === login_user) {

                bEchoStatus = true;
            }

            let type = bEchoStatus == true ? Constants.REQ_TYPE_CHAT.WS_OUTGOING_MESSAGE : Constants.REQ_TYPE_CHAT.WS_INCOMING_MESSAGE;

            let message_data = {

                cid: '',
                tname: element.tname,
                from_user: element.fromuser,
                message: element.msg,
                msgtype: element.msgtype,
                type: type,
                id: Date.now(),
                latest_time: element.time,
                direct: 1,
                extramsg: "",
                smsgid: element.smsgid,
                delivery_status: 1,
                //sent_status: 0,
                direction: 0,
                //mute: isMute ? 1 : 0,
            }

            console.log(TAG + "[onIncomingMessage] -------- message_data :: " + JSON.stringify(message_data));

            let echo_status = false;
            if (message_data.from_user === login_user) {

                echo_status = true;
            }

            if (echo_status) {

                message_data.type = Constants.REQ_TYPE_CHAT.WS_OUTGOING_MESSAGE;
                //message_data.sent_status = 1;
            }

            let unreadCount;
            let is_group_sms;

            if (element.msgtype &&
                (element.msgtype == IMConstants.WS_IM_SMS ||
                    element.msgtype == IMConstants.WS_IM_MMS)) {

                type = Constants.REQ_TYPE_CHAT.WS_INCOMING_MESSAGE;

                let message = JSON.parse(element.msg);

                //Non Stream user send SMS so he don't have sid. Instead of sid we are storing Phnum as sid.
                if (!sid || sid.length == 0 | sid === 0) {

                    sid = element.phnum;
                }

                let tname = message_data.tname;
                //let sent_status = message_data.sent_status;

                if (this.isGroupSMS(message)) {//Group SMS

                    is_group_sms = true;

                    /*In Group SMS if someone sent OB message others also will get that message through MADM, so we should not show 
                        unread count for those message. For this treat that message as IB though it's OB.
                        */
                    type = Constants.REQ_TYPE_CHAT.WS_OUTGOING_MESSAGE;

                    /*This is Incoming Group SMS. With in the same group multiple people can send SMS messages so for other users in 
                        the group those are OUTBOUND messages only.
                        */
                    console.log('[onIncomingMessage] direction: ' + message.direction);
                    if (message.direction && (message.direction * 1) === 2) {

                        type = Constants.REQ_TYPE_CHAT.WS_INCOMING_MESSAGE;
                    }

                    sid = message.group_code + "_" + element.phnum
                    tname = message.group_title;

                    //did_unreadcount = this.getSMSDIDUnreadCount(message.group_code, element.phnum);
                }

                message_data.sid = sid;
                message_data.phnum = element.phnum;
                message_data.phnumber = element.phnum;
                //message_data.type = type;
                message_data.direction = type;
                message_data.tname = tname;
                //message_data.sent_status = sent_status;

            }

            unreadCount = this.getUnreadCount(message_data);

            console.log(TAG + "[onIncomingMessage] This is group SMS. type :: " + type + " :: unreadCount :: " + unreadCount);

            //Update Unread Count.
            if (bEchoStatus == false && type == Constants.REQ_TYPE_CHAT.WS_INCOMING_MESSAGE) {

                unreadCount = (unreadCount * 1) + 1;
                console.log(TAG + "[onIncomingMessage] direction ----- unreadCount :: " + unreadCount);
            }

            message_data.unread_count = unreadCount;

            console.log(TAG + "[onIncomingMessage] message_data after prepare :: " + JSON.stringify(message_data));

            MessageHandler.addSMSMessage(sid, message_data);

            MessageHandler.updateSMSTabMessage(message_data.phnumber, message_data);

            //Add message in DID Recents and Groups Recents array list
            if (is_group_sms) {

                this.appendSMSToDIDRecents(message_data, message_data.msgtype);
            }

            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, message_data);
            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUPS_RECEIVED, {});

            IMHandler.sendAck(data.Message.id, element.smsgid, element.msgtype)

            if (echo_status == false) {

                var userNotificationSound = MessageHandler.getNotificationSounds(Constants.NOTIFICATION_SOUNDS.USER_EVENT_NOTIFICATION_SOUND);
                Utils.playSound(userNotificationSound);

                //Show Notification
            }


        } catch (e) {

            console.log(TAG + '[onIncomingMessage] Error  -------- :: ' + e);
        }
    }

    //================      IM Functions [end]      ======================


    //===============   General Functions [start]   ==========================

    sendReadStatus(sid, group_code, phnumber) {

        try {

            console.log(TAG + '[sendReadStatus] ==== sid: ' + sid)

            let msg_data = {
                sid: sid,
            }

            if (phnumber) {
                msg_data.phnumber = phnumber;
            }

            if (group_code) {
                msg_data.group_code = group_code;
            }

            this.clearUnreadCount(msg_data);

            let messagesList = MessageHandler.getSMSMessages(sid);
            if (messagesList && messagesList.length <= 0) {

                console.log(TAG + '[sendReadStatus] == MESSAGES LIST IS EMPTY == ')
                return
            }

            let messageData = messagesList[messagesList.length - 1]

            if (!messageData) {

                console.log(TAG + '[sendReadStatus] == MESSAGE DATA IS EMPTY OR NULL ');
                return
            }

            console.log(TAG + '[sendReadStatus] === messageData: ' + JSON.stringify(messageData));
            let msg = '';

            let temp_phnumber = phnumber;
            if (group_code) {

                msg = {
                    'grp_code': group_code,
                    'from_num': phnumber
                }

                msg = JSON.stringify(msg)
                sid = ''

                temp_phnumber = group_code + phnumber
            }

            const cid = Utils.getTimeStamp();
            let data = [
                IMConstants.PROTO_IM_GROUP_CHAT_MSG_READ_STATUS,
                (messageData.msgtype === IMConstants.WS_IM_SMS || messageData.msgtype === IMConstants.WS_IM_MMS) ? '' : sid, // SID
                messageData.smsgid,
                cid, // CID,
                temp_phnumber ? temp_phnumber : "",
                msg
            ];

            let formattedData = Utils.doFormat(IMConstants.IM_PROTO_GROUP_CHAT_READ_PROTOCOL, data, false)

            let prepareDataForpending = {

                protocol: formattedData,
                sid: sid
            }

            console.log(TAG + '[sendReadStatus] === formattedData: ' + formattedData);

            IMHandler.setSMSPendigList(cid, prepareDataForpending)
            IMConnector.sendMessage(formattedData);

        } catch (e) {
            console.log(TAG + '[sendReadStatus] ERROR  -------- :: ' + e);
        }
    }

    clearUnreadCount(msg_data) {

        try {

            let msg_group_code = msg_data.group_code;
            let msg_phnumber = msg_data.phnumber;
            let sid = msg_data.sid;


            let keyIndex = (msg_group_code || msg_phnumber) ? Constants.REQ_SMS_TAB_TYPE.ALL_SMS : Constants.REQ_TYPE.CHAT

            //Need to update the count in All tab. 
            this.clearUnreadCountForMatchedData(msg_data, keyIndex)

            //Need to update the count in Individual as well. 
            keyIndex = Constants.REQ_SMS_TAB_TYPE.INDIVIDUAL_SMS
            this.clearUnreadCountForMatchedData(msg_data, keyIndex)

            //Need to update the count in UnRead as well.   
            keyIndex = Constants.REQ_SMS_TAB_TYPE.SMS_UNREAD
            this.clearUnreadCountForMatchedData(msg_data, keyIndex)

            if (msg_group_code) {

                let recentsChatList = MessageHandler.getSMSGroupDIDs(msg_group_code)
                let message_data = recentsChatList.find(object => (msg_phnumber && object.phnumber && ((object.phnumber * 1) === (msg_phnumber * 1))))

                if (message_data) {//This is to update count in DID's list

                    message_data.unread_count = 0
                    message_data.group_code = msg_group_code;
                    EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUP_DIDS_RECEIVED, message_data)
                }

            }

        } catch (e) {
            console.log(TAG + '[clearUnreadCount] ERROR  -------- :: ' + e);
        }
    }

    clearUnreadCountForMatchedData(msg_data, filterType) {

        try {

            let recentsChatList = MessageHandler.getSMSData(filterType);

            console.log(TAG + "[clearUnreadCountForMatchedData]  recentsChatList : " + recentsChatList.length + " :: filterType :: " + filterType);

            let msg_group_code = msg_data.group_code;
            let msg_phnumber = msg_data.phnumber;
            let sid = msg_data.sid;

            let message_data = recentsChatList.find((object) => {

                //console.log(TAG + "[clearUnreadCountForMatchedData] object :--1111--: " + JSON.stringify(object));

                if (object.msgtype === IMConstants.WS_IM_MMS || object.msgtype === IMConstants.WS_IM_SMS) {

                    const messageData = object.message ? JSON.parse(object.message) : object;

                    //console.log(TAG + "[clearUnreadCountForMatchedData] messageData :----: " + JSON.stringify(messageData) + " :: msg_group_code :: " + msg_group_code + " :: msg_phnumber :: " + msg_phnumber);
                    // Group SMS or Group with one recipient check
                    if (
                        msg_group_code &&
                        messageData.group_code &&
                        (messageData.group_code * 1) === (msg_group_code * 1) &&
                        msg_phnumber &&
                        object.phnumber &&
                        (object.phnumber * 1) === (msg_phnumber * 1)
                    ) {
                        console.log(TAG + "[clearUnreadCountForMatchedData] Group SMS check matched");
                        return true;
                    }

                    // 1-1 SMS check
                    if (
                        !messageData.group_code &&
                        msg_phnumber &&
                        object.phnumber &&
                        (object.phnumber * 1) === (msg_phnumber * 1)
                    ) {
                        console.log(TAG + "[clearUnreadCountForMatchedData] 1-1 SMS check matched");
                        return true;
                    }
                }

                // SID match check
                if (sid && object.sid && (object.sid * 1) === (sid * 1)) {

                    console.log(TAG + "[clearUnreadCountForMatchedData] SID check matched");
                    return true;
                }

                // If none of the conditions match, skip this object
                return false;
            });

            console.log(TAG + "[clearUnreadCountForMatchedData] message_data :: " + message_data);

            if (message_data) {

                message_data.unread_count = 0
                EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUPS_RECEIVED, message_data)
            }


        } catch (e) {
            console.log(TAG + '[clearUnreadCountForMatchedData] ERROR  -------- :: ' + e);
        }

    }

    getSMSDIDUnreadCount(group_code, phnumber) {

        let unreadcount = 0;
        try {

            let did_list = MessageHandler.getSMSGroupDIDs(group_code);
            for (let i = 0; i < did_list.length; i++) {

                if (did_list[i].phnumber === phnumber) {

                    console.log(TAG + '[getSMSUnreadCount] did_list --- data :: ' + JSON.stringify(did_list[i]));
                    unreadcount = did_list[i].unread_count;
                    break;
                }
            };

        } catch (e) {
            console.log(TAG + '[getSMSDIDUnreadCount] ERROR  -------- :: ' + e);
        }

        return unreadcount;
    }

    getUnreadCount(message_data) {

        let unreadcount = 0;
        try {

            console.log(TAG + '[getUnreadCount] message_data :: ' + JSON.stringify(message_data));

            let msg_data = message_data;
            let phnumber;

            if (message_data.msgtype == IMConstants.WS_IM_SMS ||
                message_data.msgtype == IMConstants.WS_IM_MMS) {

                msg_data = JSON.parse(message_data.message);
                phnumber = message_data.phnumber
            }

            let message_array = MessageHandler.getSMSData(Constants.REQ_SMS_TAB_TYPE.ALL_SMS);

            for (let i = 0; i < message_array.length; i++) {

                let existingData = message_array[i]
                if (message_data.msgtype == IMConstants.WS_IM_SMS ||
                    message_data.msgtype == IMConstants.WS_IM_MMS) {

                    let existingMessage = JSON.parse(existingData.message);

                    if (msg_data.group_code) {

                        if (existingMessage.group_code && (existingMessage.group_code * 1) === (msg_data.group_code * 1) &&
                            existingData.phnumber && (existingData.phnumber * 1) === (phnumber * 1)) {

                            //console.log(TAG + '[getUnreadCount] -- object : ' + JSON.stringify(existingData))
                            unreadcount = existingData.unread_count
                            break
                        }

                    } else {

                        if (!existingMessage.group_code && existingData.phnumber && (existingData.phnumber * 1) === (phnumber * 1)) {

                            //onsole.log(TAG + '[getUnreadCount] -- object 55555: ' + JSON.stringify(existingData))
                            unreadcount = existingData.unread_count
                            break
                        }
                    }

                } else {

                }

            };

        } catch (e) {

            console.log(TAG + '[getUnreadCount] Error  -------- :: ' + e);
        }

        return unreadcount;
    }


    prepareSMSData(message, group_data, msg_type) {

        let json_data;
        try {

            console.log("[prepareSMSData] message :: " + message + " :: msg_type :: " + msg_type + " :: group_data :: " + JSON.stringify(group_data));

            if (Object.keys(group_data).length == 0) {

                console.log("[prepareSMSData] OOOOOPS DID NOT FOUND THE GROUP DATA.");
                return;
            }

            let phnumber = group_data.to;
            let from = group_data.from;

            json_data = {

                from: from, to: phnumber, msg: message
            }

            if (this.isGroupSMS(group_data) == false) {

                console.log("[prepareSMSData] --This is NOT group sms -- " + JSON.stringify(json_data));
                return json_data;
            }

            let group_code = group_data.group_code;
            let g_uname = group_data.group_uname;
            let g_lname = group_data.group_lname;
            let g_fname = group_data.group_fname;
            let siteid = group_data.siteid;
            let group_title = group_data.group_title;

            /*
                If the message is not reply/resend/SendAnotherSMS/Edit use the Primary DID.
                If Primary DID is not enabled then take the last SMS From number from the array list.
            */

            json_data = {

                from: from, to: phnumber, msg: message,
                group_code: group_code, group_title: group_title,
                group_uname: g_uname, group_fname: g_fname,
                group_lname: g_lname, siteid: siteid
            }

            if (group_data.orgsmsgid) {

                json_data.orgsmsgid = group_data.orgsmsgid
                json_data.retry = 1
            }

            console.log("[prepareSMSData] --This is group sms -- " + JSON.stringify(json_data));

        } catch (e) {

            console.log('[prepareSMSData] Error  -------- :: ' + e);
        }

        return json_data;
    }

    verifyAndLoadGroupSMSDID(group_code, phnumber) {

        let primary_did = '';
        try {

            let group_details = MessageHandler.getSMSAssignedGroupsDIDList(group_code);

            for (const group_did of group_details.did_list) {

                if (group_did == phnumber) {

                    console.log(TAG + "[verifyAndLoadGroupSMSDID] -- phnumber --- " + phnumber);
                    primary_did = phnumber;
                    break;
                }
            };

            if (group_details.primary_number && primary_did === '') {

                console.log(TAG + "[verifyAndLoadGroupSMSDID] -- primary_did --- " + group_details.primary_number);
                primary_did = group_details.primary_number;
            }

        } catch (e) {

            console.log(TAG + '[verifyAndLoadGroupSMSDID] Error  -------- :: ' + e);
        }

        return primary_did;
    }

    appendSMSToDIDRecents(message_data, msg_type) {

        try {

            let message = JSON.parse(message_data.message);
            const did_component_data = {

                group_title: message.group_title,
                msgtype: msg_type,
                phnumber: (message_data.phnumber * 1),
                message: message_data.message,
                latest_time: message_data.latest_time,
                unread_count: message_data.unread_count,
            }

            console.log("[appendSMSToDIDRecents] --- did_component_data :: " + message.group_code + " :: did_data :: " + JSON.stringify(did_component_data));
            MessageHandler.addSMSGroupDID((message.group_code * 1), [did_component_data], true);

            EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUP_DIDS_RECEIVED, { "group_code": (message.group_code * 1), "phnumber": did_component_data.phnumber, "is_reload": true });

        } catch (e) {

            console.log('[appendSMSToDIDRecents] Error  -------- :: ' + e);
        }
    }

    addEditOrDeleteMessageList(sid, smsgid, actionType) {

        try {

            if (actionType == Constants.REQ_TYPE_SMS_ACTION.ACTION_EDIT ||
                actionType == Constants.REQ_TYPE_SMS_ACTION.ACTION_RESEND) {

                let data = {
                    sid: sid,
                    smsgid: smsgid
                }

                this.editOrDeleteMessageList.push(data)
            }

        } catch (e) {
            console.log(TAG + '[addEditOrDeleteMessageList] Error  -------- :: ' + e);
        }
    }

    getEditOrDeleteMessageList() {

        return this.editOrDeleteMessageList
    }

    prepareAttachemntsList(files) {

        let imagesArray = []
        try {

            const cid = Utils.getTimeStamp();

            files.forEach((file, index) => {

                console.log('[prepareAttachemntsList] -- element: ' + file.name + ', index: ' + index)
                let fileDataObject = {

                    mediatype: file.type,
                    isUploadDone: false,
                    isUploading: true,
                    link: URL.createObjectURL(file),
                    filesize: file.size,
                    filename: file.name,
                    extension: file.name.split('.').pop(),
                    cid: cid + "_" + index,
                    retry: 0,
                    percentage: 0,
                    width: file.width,
                    height: file.height,
                }

                imagesArray.push(fileDataObject)
            });

        } catch (error) {
            console.log('[prepareAttachemntsList] Error  -------- :: ' + error);
        }

        return imagesArray
    }

    loadFromUserDIDs() {

        let fromUserDIDsList = [];
        try {

            let fromUserDIDList = localStorage.getItem(Constants.WS_KEY_SMS_DID_LIST);

            if (fromUserDIDList && fromUserDIDList.length > 0) {

                if (fromUserDIDList.includes(',')) {

                    fromUserDIDsList = fromUserDIDList.split(',');
                } else {

                    fromUserDIDsList = [fromUserDIDList];
                }
            }
        }
        catch (error) {

            console.log('[loadFromUserDIDs] Error  -------- :: ' + error);
        }

        return fromUserDIDsList;
    }

    async deleteSMSMessage(messageData) {

        try {

            let msgData = messageData.message && messageData.message !== undefined ? JSON.parse(messageData.message) : messageData

            let sid = (msgData.group_code && msgData.group_code !== undefined) ?
                msgData.group_code + "_" + msgData.to : messageData.phnumber;

            console.log('[deleteSMSMessage] sid  :: ' + sid);

            if (sid) {

                let dataList = MessageHandler.getSMSMessages(sid);
                let index = dataList ? dataList.findIndex(object => (object.smsgid == messageData.smsgid || object.cid === messageData.cid)) : undefined

                if (index !== -1) {

                    dataList.splice(index, 1);
                    EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, {});
                }

            }

        } catch (e) {
            console.log('[deleteSMSMessage] Error  -------- :: ' + e);
        }
    }

    async deleteSMSMessage(messageData) {

        try {

            let msgData = messageData.message && messageData.message !== undefined ? JSON.parse(messageData.message) : messageData

            let sid = (msgData.group_code && msgData.group_code !== undefined) ?
                msgData.group_code + "_" + msgData.to : messageData.phnumber;

            console.log('[deleteSMSMessage] sid  :: ' + sid);
            let requestParams = {

                opcode: Constants.API_HANDLER.WS_APIHANDLER_DELETE_MESSAGE,
                smsgid: String(messageData.smsgid),
                sid: String(messageData.phnumber), //String(sid),
                phnumber: String(messageData.phnumber),
                nonstream: 'true',
                wsuniqueid: localStorage.getItem(Params.WS_IM_ARCHIVEID),
                siteid: localStorage.getItem(Params.WS_SITE_ID),
            };

            this.addEditOrDeleteMessageList(sid, messageData.smsgid, Constants.REQ_TYPE_SMS_ACTION.ACTION_DELETE)
            SettingsHandler.sendRequestForDeleteMessage(requestParams)

            // if (sid) {

            //     let dataList = MessageHandler.getSMSMessages(sid);
            //     let index = dataList ? dataList.findIndex(object => (object.smsgid == messageData.smsgid || object.cid === messageData.cid)) : undefined

            //     if (index !== -1) {

            //         dataList.splice(index, 1);
            //         EvntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, {});
            //     }

            // }

        } catch (e) {
            console.log(TAG + '[deleteSMSMessage] Error  -------- :: ' + e);
        }
    }

    async onUpdateSMSGroupDetails(receivedData, message) {

        try {

            console.log(TAG + "[onUpdateSMSGroupDetails] --------");

            let removedUsersList = message.removed_users;
            let addedUsersList = message.added_users;
            let phoneNumbersList = message.phonenumbers;

            let groupsList = message.groups;

            let group_code = 0;
            groupsList.forEach(group => {

                console.log("Code:", group.code);
                group_code = group.code;

            });

            let data = {};
            data.group_code = group_code;

            if (group_code * 1 > 0) {

                SettingsHandler.loadSMSGroupAssignedDIDList(data);
            }

        } catch (e) {
            console.log(TAG + '[onUpdateSMSGroupDetails] Error  -------- :: ' + e);
        }
    }


    //===============   General Functions [end]   ==========================    



    //===============   Util Functions [start]   ==========================    
    getMMSFileTypeForRecents(message) {

        let type = "MMS";
        try {

            const parsedMessage = JSON.parse(message.message);
            const msg = parsedMessage.msg;

            if (msg.extension == 'PNG') {

                type = "Photo"
            }

        } catch (e) {

            console.log('[getMMSFileTypeForRecents] Error  -------- :: ' + e);
        }
    }

    isGroupSMS(group_data) {

        let status = false;
        try {

            if (Object.keys(group_data).length == 0) {

                console.log("[isGroupSMS] No SMS Group data found.");
                status = false;
            }

            let group_code = group_data.message ? JSON.parse(group_data.message).group_code : group_data.group_code;
            if (group_code > 0) {

                status = true;
            }

        } catch (e) {

            console.log('[isGroupSMS] Error  -------- :: ' + e);
        }

        console.log('[isGroupSMS] -- status :: ' + status);

        return status;
    }

    isStreamsUser(user) {

        try {


        } catch (e) {

            console.log('[isStreamsUser] Error  -------- :: ' + e);
        }

        return true;
    }

    //===============   Util Functions [end]   ==========================    



}

let handlerInstance = new StreamsHandler();

export default handlerInstance; 