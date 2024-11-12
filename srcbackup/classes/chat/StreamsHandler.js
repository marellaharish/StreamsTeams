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

var moment = require('moment');

let TAG = "[StreamsHandler].";
class StreamsHandler {

    constructor() {

        this.sms_group_did_list = new Map();
    }

    //================      IM Functions [start] ======================

    onOutgoingMessage(sid, to_user, message, msg_type, direct) {

        try {

            console.log("[onOutgoingMessage] sid " + sid + " :: message :: " + JSON.stringify(message) + " :: to_user :: " + to_user);

            let cid = Utils.getUniqueID();
            let login_user = localStorage.getItem(Params.WS_LOGIN_USER);
            let temp_sid = sid;
            let sms_id;
            let phnumber;

            const message_data = {

                from_user: login_user,
                message: JSON.stringify(message),
                smsgid: "",
                type: Constants.REQ_TYPE_CHAT.WS_OUTGOING_CHAT_MESSAGE,
                msgtype: msg_type,
                sent_status: 0,
                sid: sms_id,
                cid: cid,
                direct: direct,
                latest_time: new Date().toISOString(),
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

            let cid = Utils.getUniqueID();
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
                type: Constants.REQ_TYPE_CHAT.WS_OUTGOING_CHAT_MESSAGE,
                msgtype: msg_type,
                sent_status: 0,
                sid: sms_id,
                cid: cid,
                direct: direct,
                latest_time: new Date().toISOString(),
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

            let sid = '';//(element.sid && Object.keys(element.sid).length) ? element.sid.Value : '';
            //let isMute = element.mute.Value && element.mute.Value.length > 0 ? true : false;
            let soundFiled = element.sfid ? element.sfid.Value : "";

            let type = Constants.REQ_TYPE_CHAT.WS_INCOMING_CHAT_MESSAGE;
            let message_data = {

                cid: '',
                tname: element.tname.Value,
                from_user: element.fromuser.Value,
                message: element.msg.Value,
                msgtype: element.msgtype.Value,
                type: type,
                id: Date.now(),
                latest_time: new Date().toISOString(),
                direct: 1,
                extramsg: "",
                smsgid: element.smsgid.Value,
                delivery_status: 1,
                sent_status: 0,
                //mute: isMute ? 1 : 0,
            }

            console.log(TAG + "[onIncomingMessage] -------- message_data :: " + JSON.stringify(message_data));

            let echo_status = false;
            if (message_data.from_user === login_user) {

                echo_status = true;
            }

            if (echo_status) {

                message_data.type = Constants.REQ_TYPE_CHAT.WS_OUTGOING_CHAT_MESSAGE;
                message_data.sent_status = 1;
            }

            let unreadCount;
            let is_group_sms;

            if (element.msgtype &&
                (element.msgtype.Value == IMConstants.WS_IM_SMS ||
                    element.msgtype.Value == IMConstants.WS_IM_MMS)) {

                type = Constants.REQ_TYPE_SMS_CHAT.WS_INCOMING_SMS_MESSAGE;

                let message = JSON.parse(element.msg.Value);

                //Non Stream user send SMS so he don't have sid. Instead of sid we are storing Phnum as sid.
                if (!sid || sid.length == 0 | sid === 0) {

                    sid = element.phnum.Value;
                }

                let tname = message_data.tname;
                let sent_status = message_data.sent_status;

                if (this.isGroupSMS(message)) {//Group SMS

                    is_group_sms = true;

                    /*In Group SMS if someone sent OB message others also will get that message through MADM, so we should not show 
                        unread count for those message. For this treat that message as IB though it's OB.
                        */
                    type = Constants.REQ_TYPE_SMS_CHAT.WS_OUTGOING_SMS_MESSAGE;

                    /*This is Incoming Group SMS. With in the same group multiple people can send SMS messages so for other users in 
                        the group those are OUTBOUND messages only.
                        */
                    if (element.direction && (element.direction.Value * 1) === 2) {

                        type = Constants.REQ_TYPE_SMS_CHAT.WS_INCOMING_SMS_MESSAGE;
                    }

                    sid = message.group_code + "_" + element.phnum.Value
                    tname = message.group_title;

                }

                sent_status = (type === Constants.REQ_TYPE_SMS_CHAT.WS_INCOMING_SMS_MESSAGE ? 1 : 0);
                unreadCount = this.getSMSUnreadCount(message.group_code, element.phnum.Value);

                console.log(TAG + "[onIncomingMessage] This is group SMS. type :: " + type + " :: unreadCount :: " + unreadCount);

                message_data.sid = sid;
                message_data.phnum = element.phnum.Value;
                message_data.phnumber = element.phnum.Value;
                //message_data.type = type;
                message_data.direction = type;
                message_data.tname = tname;
                message_data.sent_status = sent_status;

                //Update Unread Count.
                if ((message_data.direction && (message_data.direction * 1) !== Constants.REQ_TYPE_SMS_CHAT.WS_OUTGOING_SMS_MESSAGE)) {

                    unreadCount = (unreadCount * 1) + 1;
                    console.log(TAG + "[onIncomingMessage] direction ----- unreadCount :: " + unreadCount);
                }
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

            IMHandler.sendAck(data.Message.ParamsId.id, element.smsgid.Value, element.msgtype.Value)

            //Show Notification

        } catch (e) {

            console.log(TAG + '[onIncomingMessage] Error  -------- :: ' + e);
        }
    }

    //================      IM Functions [end]      ======================


    //===============   General Functions [start]   ==========================
    getSMSUnreadCount(group_code, phnumber) {

        let unreadcount = 0;
        try {

            let did_list = MessageHandler.getSMSGroupDIDs(group_code);

            if (!did_list || did_list.length === 0) {

                did_list = MessageHandler.getSMSData(Constants.REQ_SMS_TAB_TYPE.ALL_SMS);
            }

            for (let i = 0; i < did_list.length; i++) {

                if (did_list[i].phnumber === phnumber) {

                    console.log(TAG + '[getSMSUnreadCount] did_list --- data :: ' + JSON.stringify(did_list[i]));
                    unreadcount = did_list[i].unread_count;
                    break;
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
                phnumber: message.to,
                latest_message: message_data.message,
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

    prepareAttachemntsList(files) {

        let imagesArray = []
        try {

            const cid = Utils.getUniqueID();

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

            let group_code = group_data.latest_message ? JSON.parse(group_data.latest_message).group_code : group_data.group_code;
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