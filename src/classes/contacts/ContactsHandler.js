import { memo } from "react";
import Constants from "../../config/Constants"
import Params from "../../config/Params"
import MessageHandler from "../chat/MessageHandler"
import Utils from "../utils/util"


let TAG = "[ContactsHandler].";
class ContactsHandler {

    constructor() {

    }

    getUserName = (user_data) => {
        try {

            let userName;

            if ((user_data.firstname && user_data.firstname != null && user_data.firstname != undefined) &&
                (user_data.lastname && user_data.lastname != null && user_data.lastname != undefined)) {

                userName = user_data.firstname + " " + user_data.lastname;
            } else if (user_data.firstname) {

                userName = user_data.firstname;
            } else if (user_data.lastname) {

                userName = user_data.lastname;
            }

            return userName;

        } catch (e) {
            console.log(TAG + '[getUserName] Error  -------- :: ' + e);
        }

        return null;
    }

    getMatchedContactName(phnumber) {

        let contact_name = phnumber;
        try {

            var imported_contacts_data = MessageHandler.getContacts(Constants.REQ_CONTACTS_TAB_TYPE.IMPORTED_CONTACTS * 1);

            //onsole.log(TAG + "[getMatchedContactName] imported_contacts_data length :: " + imported_contacts_data.length + " :: phnumber :: " + phnumber);

            phnumber = phnumber * 1;

            for (let i = 0; i <= imported_contacts_data.length; i++) {

                let member = imported_contacts_data[i];

                let mobile = member && member.mobilephone ? member.mobilephone.replace(/[^0-9]/g, '') : '';
                let home = member && member.homephone ? member.homephone.replace(/[^0-9]/g, '') : '';
                let office = member && member.officePhone ? member.officePhone.replace(/[^0-9]/g, '') : '';
                let company = member && member.companyphone ? member.companyphone.replace(/[^0-9]/g, '') : '';

                if (mobile * 1 === phnumber && home * 1 === phnumber) {

                    contact_name = this.getUserName(member);

                    //console.log(`111111 --- member firstName : ${member.firstname}, mamber lastName : ${member.lastName}, contact_name :: ${contact_name}`)
                    break;

                } else if (office * 1 === phnumber && company * 1 === phnumber) {

                    contact_name = this.getUserName(member);

                    //console.log(`22222 --- member firstName : ${member.firstname}, mamber lastName : ${member.lastName}, contact_name :: ${contact_name}`)
                    break;

                } else if (mobile * 1 === phnumber || home * 1 === phnumber || office * 1 === phnumber || company * 1 === phnumber) {

                    contact_name = this.getUserName(member);

                    //console.log(`33333 member firstName : ${member.firstname}, mamber lastName : ${member.lastName}, contact_name :: ${contact_name}`)

                    break;
                }

                /*
                if (member && ((member.mobilephone && member.mobilephone * 1 === phnumber) ||
                    (member.homephone && member.homephone * 1 === phnumber) ||
                    (member.companyphone && member.companyphone * 1 === phnumber) ||
                    (member.officePhone && member.officePhone * 1 === phnumber))) {

                    contact_name = this.getUserName(member);

                    console.log(`member firstName : ${member.firstname}, mamber lastName : ${member.lastName}, contact_name :: ${contact_name}`)

                    break;
                }
                    */
            }

        } catch (e) {
            console.log(TAG + '[getMatchContactName] Error  -------- :: ' + e);
        }

        return contact_name;
    }
}

let handlerInstance = new ContactsHandler();

export default handlerInstance; 