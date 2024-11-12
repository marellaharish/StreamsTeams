
import Constants from "../../config/Constants"
import Utils from "../utils/util"

let TAG = "[MessageHandler].";
class MessageHandler {

    constructor() {

        this.all_sms = [];

        this.contacts_list = new Map();

        this.sms_assigned_groups_didlist = new Map();
        this.sms_data = new Map();
        this.sms_group_dids = new Map();
        this.sms_messages = new Map();
    }

    clearSMSGroups() {

        this.sms_groups = [];
    }

    clearSMSGroupDIDs(group_code) {

        try {

            group_code = group_code * 1;

            this.sms_group_dids.delete(String(group_code));
            this.sms_group_dids.delete(group_code);

        } catch (e) {
            console.log(TAG + '[clearSMSGroupDIDs] Error  -------- :: ' + e);
        }

    }

    clearSMSMessages(sms_id) {

        this.sms_messages.delete(sms_id);
    }

    addSMSData(message_data, sms_type) {

        try {

            let newMessage;

            if (this.sms_data.get(sms_type)) {

                let data = this.sms_data.get(sms_type);
                //console.log('[addSMSData] data --- ' + JSON.stringify(data));
                if (data == null || !data || data.length == 0) {

                    data = [];
                }

                data.push(message_data);

                //console.log('[addSMSData] data.length : after : ', data.length);

                newMessage = data;

            } else {

                newMessage = [];
                newMessage.push(message_data);

                //console.log('[addSMSData] - in else - newMessage :: ' + JSON.stringify(newMessage));
            }

            this.sms_data.set(sms_type, newMessage);

        } catch (e) {

            console.log('[addSMSData] Error  -------- :: ' + e);
        }
    }

    addSMSGroups(group) {

        try {

            this.sms_groups.push(group);

        } catch (e) {

            console.log('[addSMSGroups] Error  -------- :: ' + e);
        }

    }

    addSMSGroupDID(group_code, did_data, is_chat_message) {

        try {
            if (!group_code) {

                console.log("[addSMSGroupDID] !!!!!!OOOOOPPPS GROUP CODE IS NOT FOUND IN THE RESPONSE ----------");
                return;
            }



            console.log('[addSMSGroupDID] did_data.length : before : ' + did_data.length);

            if (did_data == null) {

                return;
            }

            if (Utils.isNumeric(group_code)) {

                group_code = group_code * 1;
            }

            let data = this.sms_group_dids.get(group_code);

            if (!data || data == null || data == undefined) {

                data = []
            }

            console.log('[addSMSGroupDID] data.length : before : ' + data.length);

            if (is_chat_message) {

                // Find the index of the entry to determine if it exists
                const index = data.findIndex((item) => {

                    const existing_msg_to = item.phnumber //JSON.parse(item.message).to;
                    const current_msg_to = did_data[0].phnumber;//JSON.parse(did_data[0].message).to;

                    return existing_msg_to === current_msg_to
                });

                console.log(TAG + "[addSMSGroupDID] index :: " + index);
                if (index !== -1) {

                    // If the entry exists, delete it and add the new message at first place.
                    data.splice(index, 1);
                }

                data.unshift(...did_data);

            } else {

                data.push(...did_data);
            }

            console.log('[addSMSGroupDID] data.length : after : ' + data.length);

            this.sms_group_dids.set(group_code, data);

        } catch (e) {

            console.log('[addSMSGroupDID] Error  -------- :: ' + e);
        }

    }

    addSMSMessage(sms_id, chatMessage, is_load_more_req) {

        try {

            let newMessage;

            if (Utils.isNumeric(sms_id)) {

                sms_id = sms_id * 1
            }

            if (this.sms_messages.get(sms_id)) {

                let data = this.sms_messages.get(sms_id);

                if (is_load_more_req) {

                    data.unshift(chatMessage);
                } else {

                    data.push(chatMessage);
                }

                //console.log('data ----- ' + JSON.stringify(data));
                newMessage = data;
            } else {

                newMessage = [];
                newMessage.push(chatMessage)
            }

            this.sms_messages.set(sms_id, newMessage);

            /*
            this.sms_messages.push({

                message: chatMessage,
                timestamp: new Date().toISOString()  // Add a timestamp to each message
            });*/

        } catch (e) {

            console.log('[addSMSMessage] Error  -------- :: ' + e);
        }

    }

    addSMSAssignedGroupsDIDList(group_code, response_data) {

        try {

            if (!group_code) {

                console.log(TAG + "[addSMSAssignedGroupsDIDList] !!!!!!OOOOOPPPS GROUP CODE IS NOT FOUND IN THE RESPONSE ----------");
                return;
            }

            if (response_data == null || !response_data.did_list) {

                console.log(TAG + "[addSMSAssignedGroupsDIDList] !!!!!!OOOOOPPPS DID LIST IS NOT FOUND IN THE RESPONSE ----------");
                return;
            }

            group_code = Utils.formatTheKey(group_code);

            this.sms_assigned_groups_didlist.set(group_code, response_data);

            //console.log("[addSMSAssignedGroupsDIDList] this.sms_assigned_groups_didlist :: " + JSON.stringify(this.sms_assigned_groups_didlist.get(group_code)));
        } catch (e) {

            console.log(TAG + '[addSMSAssignedGroupsDIDList] Error  -------- :: ' + e);
        }

    }

    getSMSData(tab_type) {

        let message_data = [];
        try {

            if (this.sms_data.get(tab_type)) {

                message_data = this.sms_data.get(tab_type);
            }

        } catch (e) {

            console.log('[getSMSData] Error  -------- :: ' + e);
        }

        return message_data;
    }

    getSMSGroups() {

        return this.sms_groups;
    }

    getSMSGroupDIDs(group_code) {

        let messages = [];
        try {

            group_code = group_code * 1;

            if (this.sms_group_dids.get(group_code)) {

                messages = this.sms_group_dids.get(group_code);
            }

        } catch (e) {

            console.log('[getSMSGroupDIDs] Error  -------- :: ' + e);
        }

        return messages;
    }

    // Retrieve all Chat messages
    getSMSMessages(buddyId) {

        let messages = [];
        try {

            if (Utils.isNumeric(buddyId)) {

                buddyId = buddyId * 1
            }

            if (this.sms_messages.get(buddyId)) {

                messages = this.sms_messages.get(buddyId);
            }

        } catch (e) {

            console.log('[getSMSMessages] Error  -------- :: ' + e);
        }

        return messages;
    }

    getSMSAssignedGroupsDIDList(group_code) {

        let didsList = [];
        try {

            group_code = Utils.formatTheKey(group_code)

            console.log(TAG + "[getSMSAssignedGroupsDIDList] :: group_code :: " + (typeof group_code) + " :: this.sms_assigned_groups_didlist : " + JSON.stringify(this.sms_assigned_groups_didlist.get(group_code)));

            if (this.sms_assigned_groups_didlist.get(group_code)) {

                didsList = this.sms_assigned_groups_didlist.get(group_code);
            }

        } catch (e) {

            console.log(TAG + '[getSMSAssignedGroupsDIDList] Error  -------- :: ' + e);
        }

        return didsList;
    }

    // Retrieve all messages (SMS and Chat) in chronological order
    getAllMessages() {

        try {

            // Merge the arrays and sort them by timestamp
            const allMessages = [...this.sms_groups];
            return allMessages//allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        } catch (e) {

            console.log("[MessageHandler].getAllMessages() Error :: " + e);
        }

    }

    updateSMSTabMessage(phnumber, message_data) {

        try {

            let message = message_data.message;

            console.log(TAG + "[updateSMSTabMessage] phnumber :: " + phnumber + " :: message :: " + JSON.stringify(message_data) + " :: length :: " + this.sms_data.size);

            if (!phnumber || !message) {

                console.log(TAG + "[updateSMSTabMessage] NO PHNUMBER OF MESSAGE FOUND....");
                return
            }

            let message_array = [];
            let isEntryFound = 0;
            for (let i = 1; i <= this.sms_data.size; i++) {

                if (i === Constants.REQ_SMS_TAB_TYPE.SMS_GROUPS) {

                    continue;
                }

                message_array = this.getSMSData(i);

                for (let j = 0; j < message_array.length; j++) {

                    if (message_array[j] && message_array[j].phnumber && ((message_array[j].phnumber * 1) === phnumber * 1)) {
                        console.log('[updateSMSTabMessage] before message updated ---000-- Tab :: ' + i + " :: msg ::" + JSON.stringify(message_array[j]));
                        //update the message
                        /*message_array[j].message = message;

                        if (message_data.unread_count) {

                            message_array[j].unread_count = (message_data.unread_count * 1);
                        }*/


                        //console.log('[updateSMSTabMessage] before message updated ----- Tab :: ' + i + " :: msg ::" + JSON.stringify(message_array[j]));

                        let new_msg = message_data;//message_array[j];

                        message_array.splice(j, 1);
                        message_array.unshift(new_msg);
                        isEntryFound = 1;

                        //console.log('after message updated ----- ' + JSON.stringify(message_array[j].message));
                        break;
                    }
                }

                if (isEntryFound == 0) {

                    message_array.push(message_data);
                }
            }

        } catch (e) {

            console.log("[MessageHandler].updateSMSTabMessage() Error :: " + e);
        }
    }

    addContacts(contact_type, response_data) {

        try {

            let contacts;

            if (this.contacts_list.get(contact_type)) {

                let data = this.contacts_list.get(contact_type);

                if (data == null || !data || data.length == 0) {

                    data = [];
                }

                data.push(response_data);

                contacts = data;

            } else {

                contacts = [];
                contacts.push(response_data);
            }

            this.contacts_list.set(contact_type, contacts);

        } catch (e) {

            console.log('[addContacts] Error  -------- :: ' + e);
        }

    }

    getContacts(contact_type) {

        let contactsData = [];
        try {

            if (this.contacts_list.get(contact_type)) {

                contactsData = this.contacts_list.get(contact_type);
            }

        } catch (e) {

            console.log('[getSMSData] Error  -------- :: ' + e);
        }

        return contactsData;
    }


}

let handlerInstance = new MessageHandler();

export default handlerInstance; 