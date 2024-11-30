import URLParams from "../../config/URLParams"
import ServerHandler from "../utils/ServerHandler"
import Constants from "../../config/Constants"
import Config from "../../config/Config"
import MessageHandler from "../chat/MessageHandler"
import Params from "../../config/Params"
import EmitterConstants from '../../config/EmitterConstants'
import evntEmitter from "../utils/EvntEmitter"
import Utils from "../utils/util"

let TAG = "[SettingsHanlder]."
class SettingsHandler {

    loadUserSMSDIDSettings() {

        var self = this;
        try {

            let params = {

                siteid: localStorage.getItem(Params.WS_SITE_ID),//375865
                archiveid: localStorage.getItem(Params.WS_IM_ARCHIVEID)//7107881
            };

            let extra_data = {

                req_type: Constants.REQ_TYPE.SMS_USER_SMS_DID_SETTINGS,
            }

            console.log('[loadUserSMSDIDSettings] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_SMS_SETTINGS, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log('[loadUserSMSDIDSettings] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });

        } catch (e) {

            console.log('[loadUserSMSDIDSettings] Error  -------- :: ' + e);
        }
    }

    onReceiveUserSMSDIDSettings(response_data) {

        try {

            console.log("[StreamsHandler].onReceiveUserSMSDIDSettings() ======= ");

            let enable_status = response_data.enable_status;
            let did_list = response_data.did_list;
            //let send_alert_status = response_data.send_alert_status;
            let persist_did = response_data.persist_did;

            let persistent_did = '';
            if (persist_did.persist && persist_did.persist == 2) {

                persistent_did = persist_did.phnumber;
            }

            console.log("[StreamsHandler].onReceiveUserSMSDIDSettings() ===11==== enable_status :: " + enable_status + " :: persistent_did :: " + persistent_did + " :: did_list :: " + JSON.stringify(did_list));

            //localStorage.setItem(Constants.WS_KEY_SMS_DONT_ASK_STATUS, send_alert_status);
            if (persistent_did && (persistent_did.length * 1) > 0) {

                localStorage.setItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID, persistent_did);
            } else {

                localStorage.removeItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID);
            }

            this.saveSMSSettings(enable_status, did_list);

        } catch (e) {

            console.log('[onReceiveUserSMSDIDSettings] Error  -------- :: ' + e);
        }
    }

    saveSMSSettings(enable_status, did_list) {

        var self = this;
        try {

            console.log("[StreamsHandler].saveSMSSettings() ======= ");

            localStorage.removeItem(Constants.WS_KEY_SMS_DID_LIST);
            localStorage.removeItem(Constants.WS_KEY_SMS_ENABLED_STATUS);

            if (enable_status == false) {

                //self.removeSMSDID(did_list);
                return;
            }

            let fromUserDIDList = localStorage.getItem(Constants.WS_KEY_SMS_DID_LIST);

            let exist_phno_array = [];
            let new_ph_no_array = [];

            // Check if strFromUserDIDList is not null and has length > 0
            if (fromUserDIDList && fromUserDIDList.length > 0) {

                if (fromUserDIDList.includes(',')) {

                    exist_phno_array = fromUserDIDList.split(',');
                } else {

                    exist_phno_array = [fromUserDIDList];
                }
            }

            let strFinalPhnums = fromUserDIDList || '';

            console.log("fromUserDIDList --- " + fromUserDIDList + " :: strFinalPhnums :: " + strFinalPhnums);

            // Check if strDidList is not null and has length > 0
            if (did_list && did_list.length > 0) {

                if (did_list.includes(',')) {

                    new_ph_no_array = did_list.split(',');
                } else {

                    new_ph_no_array = [did_list];
                }
            }

            // Iterate over new phone numbers array
            for (let strPhnumber of new_ph_no_array) {
                let isFound = false;

                // Check if the phone number already exists in the existing phone numbers array
                for (let strExistPhnumber of exist_phno_array) {
                    if (strExistPhnumber === strPhnumber) {
                        isFound = true;
                        break;
                    }
                }

                // If the phone number is not found in the existing list, add it
                if (!isFound) {
                    if (strFinalPhnums.length === 0) {
                        strFinalPhnums = strPhnumber;
                    } else {
                        strFinalPhnums += `,${strPhnumber}`;
                    }
                }
            }

            console.log("[saveSMSSettings] strFinalPhnums :: " + JSON.stringify(strFinalPhnums));

            if (strFinalPhnums && strFinalPhnums != undefined && strFinalPhnums != null && strFinalPhnums != "undefined") {

                localStorage.setItem(Constants.WS_KEY_SMS_DID_LIST, strFinalPhnums);
            }

            if (enable_status && enable_status != undefined && enable_status != null && enable_status != "undefined") {

                localStorage.setItem(Constants.WS_KEY_SMS_ENABLED_STATUS, enable_status);
            }

            //Check whether need to update the UI or not. If yes update the UI.

        } catch (e) {

            console.log('[saveSMSSettings] Error  -------- :: ' + e);
        }
    }

    removeSMSDID(did_list) {

        try {

            console.log("[StreamsHandler].removeSMSDID() ======= ");

            let fromUserDIDList = localStorage.getItem(Constants.WS_KEY_SMS_DID_LIST);

            console.log("fromUserDIDList --- " + fromUserDIDList);

            let exist_phno_array = [];
            let delete_ph_no_array = [];

            // Check if strFromUserDIDList is not null and has length > 0
            if (fromUserDIDList && fromUserDIDList.length > 0) {

                if (fromUserDIDList.includes(',')) {

                    exist_phno_array = fromUserDIDList.split(',');
                } else {

                    exist_phno_array = [fromUserDIDList];
                }
            }

            let strFinalPhnums = fromUserDIDList || '';

            // Check if strDidList is not null and has length > 0
            if (did_list && did_list.length > 0) {

                if (did_list.includes(',')) {

                    delete_ph_no_array = did_list.split(',');
                } else {

                    delete_ph_no_array = [did_list];
                }
            }

            // Iterate over the existing phone number array
            for (let strExistPhnumber of exist_phno_array) {
                let isFound = false;

                // Iterate over the deleted phone number array
                for (let strPhnumber of delete_ph_no_array) {

                    /*
                        If the deleted DID is set as Default DID to send SMS, remove it from the session.
                    */
                    let strKey = Constants.WS_KEY_SMS_ALWAYS_USE_DID;
                    const strPersistntDID = localStorage.getItem(strKey);

                    if (strPersistntDID && strPersistntDID.length > 0 && strPhnumber === strPersistntDID) {

                        localStorage.removeItem(strKey);
                        localStorage.removeItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID_DETAILS);
                    }

                    // If the existing phone number matches the deleted phone number, set isFound to true
                    if (strExistPhnumber === strPhnumber) {
                        isFound = true;
                        break;
                    }
                }

                // If the existing phone number wasn't found in the delete list, append it to strFinalPhnums
                if (!isFound) {
                    if (strFinalPhnums.length === 0) {
                        strFinalPhnums = strExistPhnumber;
                    } else {
                        strFinalPhnums += `,${strExistPhnumber}`;
                    }
                }
            }

            // If no final phone numbers exist, set the status to false
            let strStatus = 'true';
            if (strFinalPhnums.length === 0) {
                strStatus = 'false';
            }

            console.log("[removeSMSDID] --- strFinalPhnums :: " + JSON.stringify(strFinalPhnums) + " :: strStatus :: " + strStatus);

            localStorage.setItem(Constants.WS_KEY_SMS_DID_LIST, strFinalPhnums);
            localStorage.setItem(Constants.WS_KEY_SMS_ENABLED_STATUS, strStatus);

            //Check whether need to update the UI or not. If yes update the UI.

        } catch (e) {

            console.log('[removeSMSDID] Error  -------- :: ' + e);
        }
    }

    /*
    loadSMSEnableDisableSettings() {

        var self = this;
        try {

            let params = {
                siteid: localStorage.getItem(Params.WS_SITE_ID)
            };

            let extra_data = {

                req_type: Constants.REQ_TYPE.SMS_ENABLE_SETTINGS,
            }

            console.log('[loadSMSEnableDisableSettings] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_SMS_ENABLE_SETTINGS, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log('[loadSMSEnableDisableSettings] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });


        } catch (e) {

            console.log('[loadSMSEnableDisableSettings] Error  -------- :: ' + e);
        }
    }

    onReceiveSMSEnableDisableSettings(response_data) {

        try {

            console.log("[StreamsHandler].onReceiveSMSEnableDisableSettings() ======= ");

            let nAccountLevelSetting = response_data.WS_KEY_SMS_ACCOUNT_LEVEL_SETTING;
            let nUserLevelSetting = response_data.WS_KEY_SMS_USER_LEVEL_SETTING

            const strFromUserDIDList = localStorage.getItem(Constants.WS_KEY_SMS_DID_LIST);

            // Account level setting logic
            if (nAccountLevelSetting === 1) {

                localStorage.setItem(Constants.WS_KEY_SMS_ACCOUNT_LEVEL_ENABLE_STATUS, true);
            } else {

                localStorage.setItem(Constants.WS_KEY_SMS_ACCOUNT_LEVEL_ENABLE_STATUS, false);
            }

            // User level setting logic
            if (nUserLevelSetting === 1) {

                localStorage.setItem(Constants.WS_KEY_SMS_USER_LEVEL_ENABLE_STATUS, true);
            } else {

                localStorage.setItem(Constants.WS_KEY_SMS_USER_LEVEL_ENABLE_STATUS, false);
            }

            if (nAccountLevelSetting === 1 && nUserLevelSetting === 1 && strFromUserDIDList.length > 0) {

                localStorage.setItem(Constants.WS_KEY_SMS_ENABLED_STATUS, true);
            } else {

                localStorage.setItem(Constants.WS_KEY_SMS_ENABLED_STATUS, false);
            }

            // Persist DID logic
            const strKey = Constants.WS_KEY_SMS_ALWAYS_USE_DID;
            const strPersistntDID = localStorage.getItem(strKey);

            if (strPersistntDID && strPersistntDID.length > 0) {

                const sms_from_to_details = {

                    from: strPersistntDID,
                    sms_always_use_status: 1
                };

                localStorage.setItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID_DETAILS, sms_from_to_details);
            }

            //Check whether need to update the UI or not. If yes update the UI.

        } catch (e) {

            console.log('[onReceiveSMSEnableDisableSettings] Error  -------- :: ' + e);
        }
    }*/

    loadSMSGroupAssignedDIDList(extra_info) {
        var self = this;
        try {

            let params = {

                siteid: localStorage.getItem(Params.WS_SITE_ID)
            };

            let extra_data = {

                req_type: Constants.REQ_TYPE.GROUPS_DIDLIST,
            }

            console.log(TAG + '[loadSMSGroupAssignedDIDList] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_GROUPS_DID_LIST, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log(TAG + '[loadSMSGroupAssignedDIDList] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));

                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });

        } catch (e) {
            console.log('[loadSMSGroupAssignedDIDList] Error  -------- :: ' + e);
        }
    }

    onReceiveSMSGroupAssignedDIDList(response_data) {
        try {

            if (response_data.length == 0) {
                return;
            }

            response_data.map((data, index) => {

                if (data && data.code) {

                    console.log(TAG + "[onReceiveSMSGroupAssignedDIDList] code :: " + data.code + " :: data :: " + JSON.stringify(data));

                    MessageHandler.clearAssignedGroupsDIDList();
                    MessageHandler.addSMSAssignedGroupsDIDList(data.code, data);
                }

                console.log(TAG + "[onReceiveSMSGroupAssignedDIDList] code :: " + data.code + " :: numbers :: " + MessageHandler.getSMSAssignedGroupsDIDList(data.code));
            });


            //Get the group_code from extra_data
            /*if (group_code &&  (group_code * 1) > 1) {

                self.updateGroupNamesOnDynamicEvent(data);
            }*/

        } catch (e) {
            console.log('[onReceiveSMSGroupAssignedDIDList] Error  -------- :: ' + e);
        }
    }

    updateGroupNamesOnDynamicEvent(data) {

        try {

            //prepare Groups array as like tabe type 3. Prepare Groups data in Arrary form as like tab 3 and stor in map.
            MessageHandler.addSMSData(data, Constants.REQ_SMS_TAB_TYPE.SMS_GROUPS);

            evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUPS_RECEIVED, {});

        } catch (e) {
            console.log(TAG + '[updateGroupNamesOnDynamicEvent] Error  -------- :: ' + e);
        }
    }

    loadSMSData(searchString, type) {

        var self = this;
        try {

            console.log("[loadSMSData] searchString :: " + searchString + " :: type :: " + type);

            if (!type) {

                type = Constants.REQ_TYPE.ALL_SMS;
            }

            let params = {

                siteid: localStorage.getItem(Params.WS_SITE_ID),//375865
                search_key: searchString,
                agentid: localStorage.getItem(Params.WS_LOGIN_USER),
                archiveid: localStorage.getItem(Params.WS_IM_ARCHIVEID),
                initialLimit: (type === Constants.REQ_SMS_TAB_TYPE.SMS_UNREAD) ? "" : MessageHandler.getSMSData(type).length,
                secondLimit: (type === Constants.REQ_SMS_TAB_TYPE.SMS_UNREAD) ? "" : Config.LOAD_MORE_DATA_LIMIT,
                type: type,
                userTimeZoneInMins: Utils.getUserTimeZone()
            };

            let extra_data = {

                req_type: type,
            }

            console.log('[loadSMSData] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_SMS_GROUPS, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    //console.log('[loadSMSData] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });

        } catch (e) {

            console.log('[loadSMSData] Error  -------- :: ' + e);
        }
    }

    onReceiveSMSData(response_data, extra_data) {

        try {

            //MessageHandler.clearSMSGroups();

            if (response_data.length == 0) {

                console.log(TAG + "[loadSMSData] ------  NO DATA RECEIVED FROM SERVER --------- ");
                evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUPS_RECEIVED, { "noData": true });

                return;
            }

            let allUnreadCount = 0;
            let individualUnreadCount = 0;

            response_data.map((data, index) => {

                if (extra_data.req_type === Constants.REQ_SMS_TAB_TYPE.SMS_UNREAD) {

                    if ((data.message && JSON.parse(data.message).group_code) || data.code) {

                        //allUnreadCount = (allUnreadCount === -1 ? (allUnreadCount + 1) : allUnreadCount)

                        allUnreadCount = allUnreadCount + (data.unread_count * 1);

                    } else if (!JSON.parse(data.message).group_code && JSON.parse(data.message).to) {

                        //individualUnreadCount = (individualUnreadCount === -1 ? (individualUnreadCount + 1) : individualUnreadCount)
                        individualUnreadCount = individualUnreadCount + (data.unread_count * 1);
                    }
                }

                //console.log('[onReceiveSMSData] index --- ' + index + " :: data :: " + JSON.stringify(data) + " :: type :: " + extra_data.req_type +", allUnreadCount ::" + allUnreadCount + " :: individualUnreadCount :: " + individualUnreadCount);

                MessageHandler.addSMSData(data, (extra_data.req_type * 1));
            });

            let message_args = {

                type: extra_data.req_type,
                ALL_UNREAD_COUNT: allUnreadCount,
                INDIVIDUAL_UNREAD_COUNT: individualUnreadCount
            };

            evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUPS_RECEIVED, message_args);

        } catch (e) {

            console.log('[onReceiveSMSData] Error  -------- :: ' + e);
        }
    }

    loadSMSMGroupDIDs(group_code, phnumber, searchString, is_load_more) {

        var self = this;
        try {

            let searchKeyWord = searchString;

            let first_limit = MessageHandler.getSMSGroupDIDs(group_code).length;
            if (!is_load_more) {

                //We went to another group and re-visited the same group. In this case we have DID's in the array so don't send the server req again.
                if (first_limit > Config.LOAD_MORE_DATA_LIMIT) {

                    console.log(TAG + "[loadSMSMGroupDIDs] ENOUGH DATA AVAILABLE IN MEMORY. SO DON't SEND SERER REQUEST ==============");
                    return;

                } else {

                    /*
                    For the first time before we read the data from server and user received some SMS messages. In this case we are sending server req while selecting
                    the Group from recents as DID array has some data. So clear the Memory and load the fresh data.
                    */
                    first_limit = 0;
                }
            }

            let params = {

                groupcode: group_code,
                xauthtoken: localStorage.getItem(Params.WS_XAUTH_TOKEN),
                siteid: localStorage.getItem(Params.WS_SITE_ID), //375865
                search_key: searchKeyWord,
                initialLimit: first_limit,
                secondLimit: Config.LOAD_MORE_DATA_LIMIT,
                userTimeZoneInMins: Utils.getUserTimeZone()
            };

            let extra_data = {

                req_type: Constants.REQ_TYPE.SMS_GROUP_DIDS,
                group_code: group_code,
                phnumber: phnumber,
                first_limit: first_limit,
            }

            console.log('[loadSMSMGroupDIDs] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_SMS_GROUPS_DIDS, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log('[loadSMSMGroupDIDs] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });


        } catch (e) {

            console.log('[loadSMSMGroupDIDs] Error  -------- :: ' + e);
        }
    }

    onReceiveGroupDIDs(response_data, extra_data) {

        try {
            //Update Group DID's in array

            console.log("[onReceiveGroupDIDs] ------------ : " + JSON.stringify(extra_data) + " :: extra_data.first_limit :: " + extra_data.first_limit);

            if (extra_data.group_code) {

                //MessageHandler.clearSMSGroupDIDs(extra_data.group_code);
            }

            let message_data = { "group_code": extra_data.group_code, "phnumber": extra_data.phnumber }

            //If no data received nothting to add in DID Array list, so stop continueing.
            if (response_data.length == 0) {

                evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUP_DIDS_RECEIVED, message_data);
                return;
            }

            let group_code = extra_data.group_code;

            /*
            For the first time before we read the data from server and user received some SMS messages. In this case we are sending server req while selecting
            the Group from recents as DID array has some data. So clear the Memory and load the fresh data.
            */
            if (extra_data.first_limit === 0) {

                MessageHandler.clearSMSGroupDIDs(group_code)
            }

            MessageHandler.addSMSGroupDID(group_code, response_data, false);

            console.log("[onReceiveGroupDIDs] Total DIDs length ::  --- " + MessageHandler.getSMSGroupDIDs(group_code).length);

            evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUP_DIDS_RECEIVED, message_data);

            //console.log('[onReceiveGroupDIDs] --fianl -- ' + JSON.stringify(MessageHandler.getSMSGroupDIDs(group_code)));

        } catch (e) {

            console.log('[onReceiveGroupDIDs] Error  -------- :: ' + e);
        }
    }

    loadSMSMessages(smsgid, group_id, did, type, extra_info, is_load_more, scroll_direction) {

        var self = this;
        try {

            let params = {

                xauthtoken: localStorage.getItem(Params.WS_XAUTH_TOKEN),
                //groupcode: group_id,
                phnumber: did,
                siteid: localStorage.getItem(Params.WS_SITE_ID),
                //initialLimit: MessageHandler.getSMSMessages(did).length,
                secondLimit: Config.LOAD_MORE_DATA_LIMIT,
                type: type,
                archiveid: localStorage.getItem(Params.WS_IM_ARCHIVEID),
                userTimeZoneInMins: Utils.getUserTimeZone(),
                smsgid: smsgid,
                direction: scroll_direction,
            };

            let sid = (group_id && group_id !== '') ? (group_id + "_" + did) : did

            let first_limit = MessageHandler.getSMSMessages(sid).length;
            if (!is_load_more) {

                if (first_limit > Config.LOAD_MORE_DATA_LIMIT) {

                    console.log(TAG + "[loadSMSMessages] ENOUGH DATA AVAILABLE IN MEMORY. SO DON't SEND SERER REQUEST ==============");
                    return;

                } else {

                    /*
                    For the first time before we read the data from server and user received some SMS messages. In this case we are sending server req while selecting
                    the Group from recents as DID array has some data. So clear the Memory and load the fresh data.
                    */
                    first_limit = 0;
                }
            }

            if (group_id && group_id !== '') {

                params.groupcode = group_id;
            }

            params.initialLimit = first_limit;

            let load_more = extra_info.is_load_more ? true : false;

            let extra_data = {

                req_type: Constants.REQ_TYPE.SMS_GROUP_DID_MESSAGES,
                type: type,
                is_load_more_data_req: load_more,
                first_limit: first_limit,
                scroll_direction: scroll_direction
            }

            console.log('[loadSMSMessages] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_SMS_DIDS_MESSAGES, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    //console.log('[loadSMSMessages] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });

        } catch (e) {

            console.log('[loadSMSMessages] Error  -------- :: ' + e);
        }
    }

    onReceiveSMSMessages(response_data, extra_data) {

        var self = this;
        try {

            console.log("'[onReceiveSMSMessages] ---------");

            if (!response_data.messages) {

                console.log("[onReceiveSMSMessages] NO MESSAGES DATA FOUND -----------");
                evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, { "noData": true, scroll_direction: extra_data.scroll_direction });
                return;
            }

            if (response_data.messages.length == 0) {

                console.log("[onReceiveSMSMessages] NO DATA FOUND -----------");
                evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, { "noData": true, scroll_direction: extra_data.scroll_direction });
                return;
            }

            let sms_id = response_data.phnumber;
            if (response_data.group_code) {

                sms_id = response_data.group_code + "_" + response_data.phnumber;
            }

            //MessageHandler.clearSMSMessages(sms_id);

            let messagesList = response_data.messages;
            if (messagesList && messagesList.length > 1) {

                //messagesList = messagesList.reverse()
            }

            /*
            For the first time before we read the data from server and user received some SMS messages. In this case we are sending server req while selecting
            the Group from recents as DID array has some data. So clear the Memory and load the fresh data.
            */
            if (extra_data.first_limit === 0) {

                console.log('[onReceiveSMSMessages]  messages --before---- ' + MessageHandler.getSMSMessages(sms_id).length);
                MessageHandler.clearSMSMessages(sms_id)
                console.log('[onReceiveSMSMessages]  messages --after- ' + MessageHandler.getSMSMessages(sms_id).length);
            }

            //console.log('[onReceiveSMSMessages] Existing messages --before- ' + JSON.stringify(MessageHandler.getSMSMessages(sms_id)));

            if (MessageHandler.getSMSMessages(sms_id).length == 0) {

                messagesList = messagesList.reverse();
            }

            messagesList.map((data, index) => {

                //console.log('[onReceiveSMSMessages] index --- ' + index + " :: data :: " + JSON.stringify(data));

                /*
                let messageObj = new Message();
     
                // Iterate over the keys in the data and assign to message object if property exists
                for (let key in data) {
                    if (data.hasOwnProperty(key) && messageObj.hasOwnProperty(key)) {
              
                        messageObj[key] = data[key];
                    }
                }*/

                MessageHandler.addSMSMessage(sms_id, data, extra_data.is_load_more_data_req);
            });

            //console.log('[onReceiveSMSMessages] Existing messages -after-- ' + JSON.stringify(MessageHandler.getSMSMessages(sms_id)));

            evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, {});

        } catch (e) {

            console.log('[onReceiveSMSMessages] Error  -------- :: ' + e);
        }
    }

    loadSearchedSMSMessages(group_id, did) {

        var self = this;
        try {

            let params = { groupcode: group_id, phnumber: did };

            let extra_data = {

                req_type: Constants.REQ_TYPE.SMS_GROUP_DID_MESSAGES,
            }

            console.log('[loadSearchedSMSMessages] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_SMS_DIDS_MESSAGES, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log('[loadSearchedSMSMessages] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });


        } catch (e) {

            console.log('[loadSearchedSMSMessages] Error  -------- :: ' + e);
        }
    }

    sendSMSAlwaysUseDIDToAPI(from_did, status) {

        var self = this;
        try {

            let extra_data = {
                req_type: Constants.REQ_TYPE.SMS_GROUP_DID_MESSAGES,
                from_did: from_did
            };

            let message_data = {

                agentid: localStorage.getItem(Params.WS_LOGIN_USER),
                opcode: Constants.API_HANDLER.WS_APIHANDLER_SMS_ALWAYS_USE_DID,
                phnum: from_did,
                siteid: localStorage.getItem(Params.WS_SITE_ID),
                enable: status,
                archiveid: localStorage.getItem(Params.WS_IM_ARCHIVEID),
                authtoken: localStorage.getItem(Params.WS_XAUTH_TOKEN),
                usertype: localStorage.getItem(Params.WS_SB_USER_TYPE)
            };

            let headersData = {

                opcode: Constants.API_HANDLER.WS_APIHANDLER_SMS_ALWAYS_USE_DID
            };

            let requestType = URLParams.REQ_API_HANDLER

            console.log(TAG + '[sendSMSAlwaysUseDIDToAPI]==  url: ' + requestType + ', message_data :: ' + JSON.stringify(message_data));


            ServerHandler.sendApiHandlerRequest(requestType, message_data, extra_data, headersData, URLParams.REQ_POST)
                .then(({ data, extra_data }) => {

                    console.log('[sendSMSAlwaysUseDIDToAPI]  data:' + JSON.stringify(data))

                    self.onReceiveResponse(data.response_data, data.extra_data);

                }).catch((error) => {

                    console.error("[sendSMSAlwaysUseDIDToAPI] Error: ", error);
                    self.onGotErrorResponse(error, extra_data);
                });


        } catch (e) {

            console.log('[sendSMSAlwaysUseDIDToAPI] Error  -------- :: ' + e);
        }
    }

    async saveSMSAlwaysUseDetails(data) {

        try {

            let persistentDID = localStorage.getItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID);
            let fromDID = data.from

            console.log(TAG + "[saveSMSAlwaysUseDetails] data :: " + JSON.stringify(data) + " :: persistentDID :: " + persistentDID);

            if (persistentDID && (persistentDID * 1 !== fromDID * 1) && !data.isEnableAlwaysUseDID) {

                //return;
            }

            let save_status = data.isEnableAlwaysUseDID ? 2 : 0;//2-Always is Enalbed, 0- Alwayes is disabled

            this.sendSMSAlwaysUseDIDToAPI(fromDID, save_status);

        } catch (e) {

            console.log('[saveSMSAlwaysUseDetails] Error  -------- :: ' + e);
        }
    }

    loadContacts(contact_type, search_string) {
        var self = this;
        try {

            let agentId = localStorage.getItem(Params.WS_LOGIN_USER);
            let siteName = agentId.includes('@') && agentId.substr(agentId.lastIndexOf('@') + 1).split(' ')[0];

            let params = {

                agentid: agentId,
                sitename: siteName,
                siteid: localStorage.getItem(Params.WS_SITE_ID),
                archiveid: localStorage.getItem(Params.WS_IM_ARCHIVEID),
                initialLimit: 0,
                secondLimit: 100,
                contact_type: contact_type,
                search_string: search_string
            };

            let contact_req_type = Constants.REQ_TYPE.IMPORTED_CONTACTS
            switch (contact_type) {

                case Constants.REQ_CONTACTS_TAB_TYPE.COMPANY_CONTACTS:

                    contact_req_type = Constants.REQ_TYPE.COMPANY_CONTACTS
                    break;

                case Constants.REQ_CONTACTS_TAB_TYPE.OTHER_STREAMS_CONTACTS:

                    contact_req_type = Constants.REQ_TYPE.OTHER_STREAMS_CONTACTS
                    break;

                case Constants.REQ_CONTACTS_TAB_TYPE.IMPORTED_CONTACTS:

                    contact_req_type = Constants.REQ_TYPE.IMPORTED_CONTACTS
                    break;
            }

            let extra_data = {

                req_type: contact_req_type,
                contact_type: contact_type
            }

            console.log(TAG + '[loadContacts] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_LOAD_CONTACTS, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    // console.log(TAG + '[loadContacts] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });

        } catch (e) {

            console.log(TAG + '[loadContacts] Error  -------- :: ' + e);
        }
    }

    onReceiveContacts(response_data, extra_data) {
        var self = this;
        try {

            console.log(TAG + "[onReceiveContacts] --------- :: " + response_data.length);

            if (response_data.length == 0) {

                console.log(TAG + "[onReceiveContacts] NO DATA FOUND -----------");
                return;
            }

            response_data.map((data, index) => {

                //console.log(TAG + '[onReceiveContacts] index --- ' + index + " :: contact_type :: " + extra_data.contact_type + " :: data :: " + JSON.stringify(data));

                MessageHandler.addContacts((extra_data.contact_type * 1), data);

            });

            evntEmitter.emit(EmitterConstants.EMMIT_ON_CONTACTS_RECEIVED, extra_data);

            if ((extra_data.contact_type * 1) === Constants.REQ_CONTACTS_TAB_TYPE.IMPORTED_CONTACTS) {

                evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUPS_RECEIVED, {});
            }

        } catch (e) {

            console.log(TAG + '[onReceiveContacts] Error  -------- :: ' + e);
        }
    }

    loadUsersNotificationSound() {
        var self = this;
        try {

            let archiveId = localStorage.getItem(Params.WS_IM_ARCHIVEID);

            let params = {
                archiveid: archiveId,
            };

            let extra_data = {
                req_type: Constants.REQ_TYPE.LOAD_NOTIFICATION_SOUNDS,
            }

            ServerHandler.sendServerRequest(URLParams.REQ_NOTIFICATION_SOUNDS, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log(TAG + '[loadUsersNotificationSound] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {
                    self.onGotErrorResponse(error, extra_data);
                });

        } catch (e) {
            console.log(TAG + '[loadUsersNotificationSound] Error  -------- :: ' + e);
        }
    }

    onReceiveNotificationSounds(response_data, extra_data) {
        var self = this;
        try {
            console.log(TAG + "[onReceiveNotificationSounds] ------------  ");

            if (response_data.length == 0) {

                console.log(TAG + "[onReceiveNotificationSounds] NO DATA FOUND -----------");
                return;
            }

            let muteNotificationSounds = response_data.mute_notification_sounds[0].notificationpreference;
            let userEventNotificationSound = response_data.user_event_notification_sound[0].soundfileid;
            let notificationSoundOnDevices = response_data.notification_sounds_on_devices[0].devicetype;
            let likeNotificationSounds = response_data.like_notification_sounds[0].likenotificationsetting;
            let muteNotificationSoundsOnSpecificTimeEnabled = response_data.notification_sounds_on_specific_time[0].date_timesettingsenabled;
            let muteNotificationSoundsFromTime = response_data.notification_sounds_on_specific_time[0].fromtime;
            let muteNotificationSoundsToTime = response_data.notification_sounds_on_specific_time[0].totime;

            // console.log("[onReceiveNotificationSounds] :: muteNotificationSounds :: " + JSON.stringify(muteNotificationSounds) + ", userEventNotificationSound :: " + JSON.stringify(userEventNotificationSound) + " , notificationSoundOnDevices :: " + JSON.stringify(notificationSoundOnDevices) + ", likeNotificationSounds :: " + JSON.stringify(likeNotificationSounds) + ", notificationSoundsOnSpecificTime :: " + JSON.stringify(muteNotificationSoundsOnSpecificTime) + ", muteNotificationSoundsFromTime :: " + JSON.stringify(muteNotificationSoundsFromTime) + ", muteNotificationSoundsToTime :: " + JSON.stringify(muteNotificationSoundsToTime));

            //Addind Data 
            if (muteNotificationSounds) {
                MessageHandler.addNotificationSounds(Constants.NOTIFICATION_SOUNDS.MUTE_ALL_NOTIFCATION_SOUNDS, muteNotificationSounds);
            }

            if (userEventNotificationSound) {
                MessageHandler.addNotificationSounds(Constants.NOTIFICATION_SOUNDS.USER_EVENT_NOTIFICATION_SOUND, userEventNotificationSound);
            }

            if (notificationSoundOnDevices) {
                MessageHandler.addNotificationSounds(Constants.NOTIFICATION_SOUNDS.NOTIFICATION_SOUNDS_ON_DEVICES, notificationSoundOnDevices);
            }

            if (likeNotificationSounds) {
                MessageHandler.addNotificationSounds(Constants.NOTIFICATION_SOUNDS.LIKE_NOTIFICATION_SOUNDS, likeNotificationSounds);
            }

            if (muteNotificationSoundsOnSpecificTimeEnabled && muteNotificationSoundsOnSpecificTimeEnabled === 1) {

                let data = {};

                if (muteNotificationSoundsFromTime) {
                    data.from_time = muteNotificationSoundsFromTime;

                }

                if (muteNotificationSoundsToTime) {
                    data.to_time = muteNotificationSoundsToTime;
                }

                MessageHandler.addNotificationSounds(Constants.NOTIFICATION_SOUNDS.MUTE_NOTIFICATION_SOUNDS_ON_SPECIFIC_TIME_ENABLED, data);
            }

        } catch (e) {
            console.log(TAG + '[onReceiveNotificationSounds] Error  -------- :: ' + e);
        }
    }

    sendRequestForDeleteMessage(params) {

        var self = this;
        try {

            let extra_data = {
                req_type: Constants.REQ_TYPE.DELETE_MESSAGE,
                sid: params.sid,
                smsgid: params.smsgid
            };

            let headersData = {
                opcode: Constants.API_HANDLER.WS_APIHANDLER_DELETE_MESSAGE
            };

            let requestType = URLParams.REQ_API_HANDLER

            console.log(TAG + '[sendRequestForDeleteMessage]==  url: ' + requestType + ', message_data :: ' + JSON.stringify(params));


            ServerHandler.sendApiHandlerRequest(requestType, params, extra_data, headersData, URLParams.REQ_POST)
                .then(({ data, extra_data }) => {

                    console.log('[sendRequestForDeleteMessage]  data:' + JSON.stringify(data))

                    self.onReceiveResponse(data, extra_data);

                }).catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });


        } catch (e) {

            console.log('[sendRequestForDeleteMessage] Error  -------- :: ' + e);
        }
    }

    loadSearchMessagesFromDB(searchKeyword) {
        var self = this;

        try {

            let archiveId = localStorage.getItem(Params.WS_IM_ARCHIVEID);
            let agentId = localStorage.getItem(Params.WS_LOGIN_USER);
            let siteId = localStorage.getItem(Params.WS_SITE_ID);

            console.log("[loadSearchMessagesFromDB] =========== ");

            let params = {
                agentid: agentId,
                archiveid: archiveId,
                siteid: siteId,
                searchedKeyword: searchKeyword,
                initialLimit: 0,
                secondLimit: 40,
            };

            let extra_data = {
                req_type: Constants.REQ_TYPE.LOAD_SEARCH_MESSAGES,
                searchkeyword: searchKeyword,
            }

            ServerHandler.sendServerRequest(URLParams.REQ_SEARCH_MESSAGES, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log(TAG + '[loadSearchMessagesFromDB] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });


        } catch (e) {
            console.log(TAG + '[loadSearchMessagesFromDB] Error  -------- :: ' + e);
        }
    }

    onReceiveSearchMessagesData(response_data, extra_data) {
        var self = this;
        try {
            console.log(TAG + "[onReceiveSearchMessagesData] ------------ response_data: " + JSON.stringify(response_data));

            if (response_data.length == 0) {

                console.log(TAG + "[onReceiveSearchMessagesData] NO DATA FOUND -----------");
                return;
            }

            let messageSearchList = response_data.message_search_list;
            let messageSearchListCount = response_data.message_search_count
            // let attachmentSearchList = response_data.attachment_search_list
            // let attachmentSearchListCount = response_data.attachment_search_count

            console.log(TAG + "[onReceiveSearchMessagesData] messageSearchList :: " + JSON.stringify(messageSearchList) + ", messageSearchListCount :: " + JSON.stringify(messageSearchListCount));

            //console.log("[onReceiveSearchMessagesData] messageSearchList :: " + JSON.stringify(messageSearchList) + ", messageSearchListCount :: " + JSON.stringify(messageSearchListCount) + ", attachmentSearchList :: " + attachmentSearchList + ", attachmentSearchListCount :: " + attachmentSearchListCount);

            var messageSearchListData = MessageHandler.getSearchList(Constants.SEARCH_MESSAGES_TYPE.MESSAGE_SEARCH_LIST);
            var messageSearchListCountData = MessageHandler.getSearchCount(Constants.SEARCH_MESSAGES_TYPE.MESSAGE_SEARCH_LIST_COUNT);
            // var attachmentSearchListData = MessageHandler.getSearchList(Constants.REQ_SEARCH_MESSAGES_TYPE.ATTACHMENT_SEARCH_LIST);
            // var attachmentSearchListCountData = MessageHandler.getSearchCount(Constants.REQ_SEARCH_MESSAGES_TYPE.ATTACHMENT_SEARCH_LIST_COUNT);

            // CLEARING THE CURRENT DATA
            if (messageSearchListData.length > 0) {
                MessageHandler.clearSearchList(Constants.SEARCH_MESSAGES_TYPE.MESSAGE_SEARCH_LIST);
            }

            if (messageSearchListCountData.length > 0) {
                MessageHandler.clearSearchList(Constants.SEARCH_MESSAGES_TYPE.MESSAGE_SEARCH_LIST_COUNT);
            }

            // if (attachmentSearchListData.length >0) {
            //     MessageHandler.clearSearchList(Constants.SEARCH_MESSAGES_TYPE.ATTACHMENT_SEARCH_LIST);
            // }

            // if (attachmentSearchListCountData.length >0) {
            //     MessageHandler.clearSearchList(Constants.SEARCH_MESSAGES_TYPE.ATTACHMENT_SEARCH_LIST_COUNT);
            // }

            // ADDING THE DATA
            if (messageSearchList && messageSearchList.length > 0) { // save message search list
                MessageHandler.addSearchList(messageSearchList, Constants.SEARCH_MESSAGES_TYPE.MESSAGE_SEARCH_LIST);
            }

            if (messageSearchListCount) { // save message search count
                MessageHandler.addSearchList(messageSearchListCount, Constants.SEARCH_MESSAGES_TYPE.MESSAGE_SEARCH_LIST_COUNT);
            }

            // if (attachmentSearchList && attachmentSearchList.length >0) { // save attachment search list
            //     MessageHandler.addSearchList(attachmentSearchList, Constants.SEARCH_MESSAGES_TYPE.ATTACHMENT_SEARCH_LIST);
            // }

            // if (attachmentSearchListCount) { // save attachment search count
            //     MessageHandler.addSearchList(attachmentSearchListCount, Constants.SEARCH_MESSAGES_TYPE.ATTACHMENT_SEARCH_LIST_COUNT);
            // }

            let searchData = {

                isMessageSearched: true,
                searchKeyword: extra_data.searchkeyword,
            }

            evntEmitter.emit(EmitterConstants.EMMIT_ON_SEARCHED_MESSAGE_RECEIVED, { searchData });
            evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, { "isMessageSearched": true });

        } catch (e) {
            console.log("[onReceiveSearchMessagesData] Error ---- :: " + e);
        }
    }

    //===================           RESPONSE HANDLING       =======================
    onReceiveResponse(response_data, extra_data) {

        var self = this;
        try {

            console.log("[StreamsHandler].onReceiveResponse() extra_data :: " + JSON.stringify(extra_data));
            switch ((extra_data.req_type * 1)) {

                case Constants.REQ_TYPE.ALL_SMS:
                case Constants.REQ_TYPE.INDIVIDUAL_SMS:
                case Constants.REQ_TYPE.SMS_GROUPS:
                case Constants.REQ_TYPE.SMS_UNREAD:

                    self.onReceiveSMSData(response_data, extra_data);

                    break;

                case Constants.REQ_TYPE.SMS_GROUP_DIDS:

                    self.onReceiveGroupDIDs(response_data, extra_data);

                    break;

                case Constants.REQ_TYPE.SMS_GROUP_DID_MESSAGES:

                    self.onReceiveSMSMessages(response_data, extra_data);

                    break;

                case Constants.REQ_TYPE.SMS_USER_SMS_DID_SETTINGS:

                    self.onReceiveUserSMSDIDSettings(response_data);
                    break;

                case Constants.REQ_TYPE.SMS_ENABLE_SETTINGS:

                    self.onReceiveSMSEnableDisableSettings(response_data);
                    break;

                case Constants.REQ_TYPE.GROUPS_DIDLIST:

                    self.onReceiveSMSGroupAssignedDIDList(response_data);
                    break;

                case Constants.REQ_TYPE.SMS_SAVE_PERSISTENT_DID:

                    localStorage.setItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID, extra_data.from_did);
                    break;

                case Constants.REQ_TYPE.COMPANY_CONTACTS:
                case Constants.REQ_TYPE.OTHER_STREAMS_CONTACTS:
                case Constants.REQ_TYPE.IMPORTED_CONTACTS:

                    self.onReceiveContacts(response_data, extra_data);
                    break;

                case Constants.REQ_TYPE.LOAD_NOTIFICATION_SOUNDS:

                    self.onReceiveNotificationSounds(response_data, extra_data);
                    break;

                case Constants.REQ_TYPE.DELETE_MESSAGE:


                    break;

                case Constants.REQ_TYPE.LOAD_SEARCH_MESSAGES:

                    self.onReceiveSearchMessagesData(response_data, extra_data);
                    break;
            }

        } catch (e) {

            console.log('[onReceiveResponse] Error  -------- :: ' + e);
        }
    }

    onGotErrorResponse(error, extra_data) {

        try {

            console.log('[onGotErrorResponse] Error  -------- :: ' + error + " ::extra_data :: " + extra_data);

        } catch (e) {

            console.log('[onGotErrorResponse] Error  -------- :: ' + e);
        }
    }
}

let handlerInstance = Object.freeze(new SettingsHandler());

export default handlerInstance;
