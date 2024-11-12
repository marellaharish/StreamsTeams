import URLParams from "../../config/URLParams"
import ServerHandler from "../utils/ServerHandler"
import Constants from "../../config/Constants"
import Config from "../../config/Config"
import MessageHandler from "../chat/MessageHandler"
import Params from "../../config/Params"
import EmitterConstants from '../../config/EmitterConstants'
import evntEmitter from "../utils/EvntEmitter"

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

            console.log("[StreamsHandler].onReceiveUserSMSDIDSettings() ===11==== enable_status :: " + enable_status + " :: persist_did :: " + persist_did + " :: did_list :: " + JSON.stringify(did_list));

            //localStorage.setItem(Constants.WS_KEY_SMS_DONT_ASK_STATUS, send_alert_status);
            if (persist_did && persist_did != null && persist_did != undefined && persist_did != "undefined") {

                localStorage.setItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID, persist_did);
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

    loadSMSEnableDisableSettings() {

        var self = this;
        try {

            let params = {};

            let extra_data = {

                req_type: Constants.REQ_TYPE.REQ_SMS_ENABLE_SETTINGS,
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
    }

    loadSMSGroupAssignedDIDList() {
        var self = this;
        try {

            let params = {

                siteid: localStorage.getItem(Params.WS_SITE_ID)
            };

            let extra_data = {

                req_type: Constants.REQ_TYPE.REQ_GROUPS_DIDLIST,
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

                    MessageHandler.addSMSAssignedGroupsDIDList(data.code, data);
                }

                console.log(TAG + "[onReceiveSMSGroupAssignedDIDList] code :: " + data.code + " :: numbers :: " + MessageHandler.getSMSAssignedGroupsDIDList(data.code * 1));
            });

        } catch (e) {
            console.log('[onReceiveSMSGroupAssignedDIDList] Error  -------- :: ' + e);
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
                initialLimit: MessageHandler.getSMSData(type).length,
                secondLimit: Config.LOAD_MORE_DATA_LIMIT,
                type: type
            };

            let extra_data = {

                req_type: type,
            }

            console.log('[loadSMSData] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_SMS_GROUPS, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log('[loadSMSData] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
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

            let message_args = {

                type: extra_data.req_type,
            };

            response_data.map((data, index) => {

                if ((data.message && JSON.parse(data.message).group_code) || data.code) {

                    //allUnreadCount = (allUnreadCount === -1 ? (allUnreadCount + 1) : allUnreadCount)

                    allUnreadCount = allUnreadCount + (data.unread_count * 1);

                } else if (!JSON.parse(data.message).group_code && JSON.parse(data.message).to) {

                    //individualUnreadCount = (individualUnreadCount === -1 ? (individualUnreadCount + 1) : individualUnreadCount)
                    individualUnreadCount = individualUnreadCount + (data.unread_count * 1);
                }

                console.log('[onReceiveSMSData] index --- ' + index + " :: data :: " + JSON.stringify(data) + " :: type :: " + extra_data.req_type +
                    ", allUnreadCount ::" + allUnreadCount + " :: individualUnreadCount :: " + individualUnreadCount);

                MessageHandler.addSMSData(data, (extra_data.req_type * 1));
            });

            evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUPS_RECEIVED, message_args);

        } catch (e) {

            console.log('[onReceiveSMSData] Error  -------- :: ' + e);
        }
    }

    loadSMSMGroupDIDs(group_code, phnumber, searchString) {

        var self = this;
        try {

            let searchKeyWord = searchString;

            let params = {

                groupcode: group_code,
                xauthtoken: localStorage.getItem(Constants.WS_XAUTH_TOKEN),
                siteid: localStorage.getItem(Params.WS_SITE_ID), //375865
                search_key: searchKeyWord,
                initialLimit: MessageHandler.getSMSGroupDIDs(group_code).length,
                secondLimit: Config.LOAD_MORE_DATA_LIMIT
            };

            let extra_data = {

                req_type: Constants.REQ_TYPE.SMS_GROUP_DIDS,
                group_code: group_code,
                phnumber: phnumber
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

            console.log("[onReceiveGroupDIDs] ------------ : " + extra_data);

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

            MessageHandler.addSMSGroupDID(group_code, response_data, false);

            console.log("[onReceiveGroupDIDs] Total DIDs length ::  --- " + MessageHandler.getSMSGroupDIDs(group_code).length);

            evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_GROUP_DIDS_RECEIVED, message_data);

            console.log('[onReceiveGroupDIDs] --fianl -- ' + JSON.stringify(MessageHandler.getSMSGroupDIDs(group_code)));

        } catch (e) {

            console.log('[onReceiveGroupDIDs] Error  -------- :: ' + e);
        }
    }

    loadSMSMessages(group_id, did, type, extra_info) {

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
            };

            if (group_id && group_id !== '') {

                params.groupcode = group_id;
                params.initialLimit = MessageHandler.getSMSMessages(group_id + "_" + did).length;
            } else {

                params.initialLimit = MessageHandler.getSMSMessages(did).length;
            }

            let load_more = extra_info.is_load_more ? true : false;

            let extra_data = {

                req_type: Constants.REQ_TYPE.SMS_GROUP_DID_MESSAGES,
                type: type,
                is_load_more_data_req: load_more
            }

            console.log('[loadSMSMessages] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_SMS_DIDS_MESSAGES, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log('[loadSMSMGroupDIDs] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
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
                evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, { "noData": true });
                return;
            }

            if (response_data.messages.length == 0) {

                console.log("[onReceiveSMSMessages] NO DATA FOUND -----------");
                evntEmitter.emit(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, { "noData": true });
                return;
            }

            let sms_id = response_data.phnumber;
            if (response_data.group_code) {

                sms_id = response_data.group_code + "_" + response_data.phnumber;
            }

            //MessageHandler.clearSMSMessages(sms_id);

            let messagesList = response_data.messages;

            messagesList.map((data, index) => {

                console.log('[onReceiveSMSMessages] index --- ' + index + " :: data :: " + JSON.stringify(data));

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

        try {

            let extra_data = {};

            let message_data = {

                opcode: Constants.API_HANDLER.WS_APIHANDLER_SMS_ALWAYS_USE_DID,
                phnum: from_did,
                siteid: localStorage.getItem(Params.WS_SITE_ID),
                enable: status,
                archiveid: localStorage.getItem(Params.WS_IM_ARCHIVEID),
                xauthtoken: localStorage.getItem(Params.WS_XAUTH_TOKEN)
            };

            ServerHandler.sendApiHandlerRequest(JSON.stringify(message_data), extra_data);

        } catch (e) {

            console.log('[sendSMSAlwaysUseDIDToAPI] Error  -------- :: ' + e);
        }
    }

    async saveSMSAlwaysUseDetails(data) {

        try {

            let persistentDID = localStorage.getItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID);
            if (data.isEnableAlwaysUseDID) {

                localStorage.setItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID, data.from);
                //Send API Server request
                this.sendSMSAlwaysUseDIDToAPI(data.from, 2);
            } else {

                localStorage.removeItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID);
                //send API Server request
                this.sendSMSAlwaysUseDIDToAPI(persistentDID, 0);
            }

        } catch (e) {

            console.log('[saveSMSAlwaysUseDetails] Error  -------- :: ' + e);
        }
    }

    async loadImportedContacts() {
        var self = this;
        try {

            let agentId = localStorage.getItem(Params.WS_LOGIN_USER);
            let siteName = agentId.includes('@') && agentId.substr(agentId.lastIndexOf('@') + 1).split(' ')[0];

            console.log(TAG + "[loadImportedContacts] agentId :: " + agentId + ", siteName :: " + siteName);

            let params = {
                agentid: agentId,
                sitename: siteName,
                initialLimit: 0,
                secondLimit: 100
            };

            let extra_data = {

                req_type: Constants.REQ_TYPE.IMPORTED_CONTACTS,
            }

            console.log(TAG + '[loadImportedContacts] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_IMPORTED_CONTACTS, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log(TAG + '[loadImportedContacts] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });

        } catch (e) {

            console.log('[loadImportedContacts] Error  -------- :: ' + e);
        }
    }

    onReceiveImportedContacts(response_data, extra_data) {

        var self = this;
        try {

            console.log(TAG + "[onReceiveImportedContacts] --------- :: ");

            if (response_data.length == 0) {

                console.log(TAG + "[onReceiveImportedContacts] NO DATA FOUND -----------");
                return;
            }

            response_data.map((data, index) => {

                console.log(TAG + '[onReceiveImportedContacts] index --- ' + index + " :: data :: " + JSON.stringify(data));

                MessageHandler.addContacts(Constants.WS_IMPORTED_CONTACTS, data);

                evntEmitter.emit(EmitterConstants.EMMIT_ON_CONTACTS_RECEIVED, {});
            });

        } catch (e) {

            console.log(TAG + '[onReceiveImportedContacts] Error  -------- :: ' + e);
        }
    }

    loadCompanyContacts() {
        var self = this;
        try {

            let params = {

                siteid: localStorage.getItem(Params.WS_SITE_ID),
                archiveid: localStorage.getItem(Params.WS_IM_ARCHIVEID),
                initialLimit: 0,
                secondLimit: 100
            };

            let extra_data = {

                req_type: Constants.REQ_TYPE.COMPANY_CONTACTS,
            }

            console.log(TAG + '[loadCompanyContacts] params ---- ' + JSON.stringify(params));

            ServerHandler.sendServerRequest(URLParams.REQ_COMPANY_CONTACTS, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log(TAG + '[loadCompanyContacts] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    self.onReceiveResponse(data.response_data, data.extra_data);

                })
                .catch((error) => {

                    self.onGotErrorResponse(error, extra_data);
                });

        } catch (e) {

            console.log(TAG + '[loadCompanyContacts] Error  -------- :: ' + e);
        }
    }

    onReceiveCompanyContacts(response_data, extra_data) {
        var self = this;
        try {

            console.log(TAG + "[onReceiveCompanyContacts] --------- :: ");

            if (response_data.length == 0) {

                console.log(TAG + "[onReceiveCompanyContacts] NO DATA FOUND -----------");
                return;
            }

            response_data.map((data, index) => {

                console.log(TAG + '[onReceiveCompanyContacts] index --- ' + index + " :: data :: " + JSON.stringify(data));

                MessageHandler.addContacts(Constants.WS_COMPANY_CONTACTS, data);

                evntEmitter.emit(EmitterConstants.EMMIT_ON_CONTACTS_RECEIVED, {});

            });

        } catch (e) {

            console.log(TAG + '[onReceiveImportedContacts] Error  -------- :: ' + e);
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

                case Constants.REQ_TYPE.REQ_SMS_ENABLE_SETTINGS:

                    self.onReceiveSMSEnableDisableSettings(response_data);
                    break;

                case Constants.REQ_TYPE.REQ_GROUPS_DIDLIST:

                    self.onReceiveSMSGroupAssignedDIDList(response_data);
                    break;

                case Constants.REQ_TYPE.REQ_IMPORTED_CONTACTS:

                    self.onReceiveImportedContacts(response_data);
                    break;

                case Constants.REQ_TYPE.REQ_COMPANY_CONTACTS:

                    self.onReceiveCompanyContacts(response_data);
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
