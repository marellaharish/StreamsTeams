
import knockSound from '../../assets/notification_sounds/knock.mp3'
import { format } from 'date-fns';
import CryptoJS from 'crypto-js';

import IMConstants from '../../config/IMConstants';
import buzzSound from '../../assets/notification_sounds/buzz.mp3'
import chimedwnSound from '../../assets/notification_sounds/chimedwn.mp3'
import doorSound from '../../assets/notification_sounds/door.mp3'
import Constants from '../../config/Constants'
import { showToast } from '../../views/home/ToastView'
import Params from '../../config/Params';
import Config from '../../config/Config';
import URLParams from '../../config/URLParams';

var convert = require('xml-js');

var TAG = "[Utils].";
class Utils {

    static doFormat = (strMsg, list, isTAG) => {

        try {

            var strProtocol = strMsg;
            try {

                list.map(data => {
                    strProtocol = strProtocol.replace("?", data + "")
                })

                strProtocol = (isTAG ? IMConstants.XML_IM_TAG : "") + strProtocol

            } catch (e) {

                console.log('[doFormat] Error -------- :: ' + e);
            }

        } catch (e) {

            console.log('Util.[doFormat] Error :: ' + e);
        }

        return strProtocol;
    }

    static convertXML_JSON = (data) => {

        try {

            var message = convert.xml2json(data.data,
                {
                    compact: true, ignoreComment: true, ignoreAttributes: false, trim: true, nativeType: true,
                    attributesKey: 'ParamsId', textKey: 'Value', cdataKey: 'Value'
                });

            return JSON.parse(message);


        } catch (e) {

            console.log('Util.[convertXML_JSON] Error :: ' + e);
        }
    }

    static getTimeStamp = () => {

        try {

            return Date.now();//Unique time stamp.
        } catch (e) {

            console.log('Util.[getTimeStamp] Error :: ' + e);
        }
    }

    static getUniqueID = () => {

        try {

            // Get high resolution time (microseconds)
            const highResTime = performance.now().toFixed(6);

            const dateTime = Date.now();

            const randomPart = Math.floor(Math.random() * 1000);

            return `${dateTime}-${highResTime}-${randomPart}`;

        } catch (e) {

            console.log('Util.[getUniqueID] Error :: ' + e);
        }
    }

    static createFileFromUrl = async (fileUrl, fileName) => {
        try {

            const response = await fetch(fileUrl);
            const blob = await response.blob(); // Get the Blob from the response
            return new File([blob], fileName, { type: blob.type }); // Create a File object

        } catch (error) {

            console.error("Util.[createFileFromUrl] Error fetching the file :: " + error);
        }
    };

    static showAlert(msg) {

        try {

            alert(msg);

        } catch (e) {

            console.log('[showAlert] Error  -------- :: ' + e);
        }
    }

    static formatString(message, ...values) {

        return message.replace(/%@/g, () => values.shift());
    }

    static getFormatedDate(latest_time, type) {

        let output = "";
        try {

            if (type == Constants.DATE_FORMATS.WS_GROUP_DID_DATE) {

                let dateFormatOutput = format(`${latest_time}`, "MMM d, yyyy");
                output = dateFormatOutput;

            } else if (type == Constants.DATE_FORMATS.WS_CHAT_MESSAGE_DATE) {

                let timeFormatOutput = format(`${latest_time}`, "hh:mm a");
                output = timeFormatOutput;
            }

        } catch (e) {
            console.log('Utils [getFormatedDate] Error ::' + e);
        }

        return output;

    }

    static notificationSound(type) {
        let audio;
        try {

            switch (type) {

                case 1:
                    audio = new Audio(buzzSound);
                    break;

                case 2:
                    audio = new Audio(chimedwnSound);
                    break;

                case 3:
                    audio = new Audio(doorSound);
                    break;

                case 4:
                    audio = new Audio(knockSound);
                    break;

                default:
                    audio = new Audio(buzzSound);
                    break;

            }

            audio.play();

        } catch (e) {
            console.log('Utils [notificationSound] Error ::' + e);
        }
    }

    static parseToObject(data) {

        return (typeof data === 'object' && data !== null) ? data : JSON.parse(data);
    }

    static async copyToClipboard(messageData) {
        try {

            if (navigator.clipboard) {

                await navigator.clipboard.writeText(messageData.msg);
                showToast('Copied to clipboard')

            } else {
                console.log('[copyToClipboard] The Clipboard API is not available.')
            }

        } catch (e) {
            console.log('[copyToClipboard] Error  -------- :: ' + e);
        }

    }

    static setCookie = (name, value) => {
        try {
            console.log("[setCookie] --- name :: " + name + " :: value :: " + value);

            // Create expiration date 100 years in the future
            const date = new Date();
            date.setFullYear(date.getFullYear() + 100);

            value = value + Constants.GATEKEEPER_SEPARATOR + Constants.GATEKEEPER_SECRET_KEY
            console.log("[setCookie] --- value :: " + value);

            const encrypted = CryptoJS.Blowfish.encrypt(value, Constants.GATEKEEPER_SECRET_KEY).toString();
            const urlSafeBase64 = this.base64UrlSafeEncode(encrypted);

            console.log("[setCookie] --- encrypted :: " + urlSafeBase64);

            // Format the expiration date to UTC string
            const expires = "; expires=" + date.toUTCString();

            let url = window.location.hostname;
            url = url.substring(url.indexOf('.'));

            // Setting the cookie with domain, but HttpOnly cannot be set client-side
            document.cookie = name + "=" + (urlSafeBase64 || "") + expires + "; path=/; domain=" + url + "; Secure; SameSite=Strict";

        } catch (e) {
            console.log('[setCookie] Error  -------- :: ' + e);
        }
    }

    // Function to encode Base64 URL-safe (replacing +, / and removing padding =)
    static base64UrlSafeEncode = (inputString) => {

        let encoded = null;
        try {

            // Encode the input string to Base64
            encoded = btoa(inputString);
            // Make it URL-safe by replacing "+" with "-", "/" with "_", and removing "=" padding
            encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        } catch (e) {
            console.log('[base64UrlSafeEncode] Error  -------- :: ' + e);
        }

        return encoded;
    };

    static formUrlForAttachmentDownload(link, fileName, resolution) {
        let sourceUrl = ''
        try {

            let xauthtoken = localStorage.getItem(Params.WS_XAUTH_TOKEN);
            let login_user = localStorage.getItem(Params.WS_LOGIN_USER);

            sourceUrl = Config.STREAMS_NODE_SERVICE_URL + URLParams.REQ_ATTACHMENT_DOWNLOAD + '?link=' + link + '&res=' + resolution + '&filename=' + fileName + '&xauthtoken=' + xauthtoken + '&agentid=' + login_user
            //sourceUrl = Config.STREAMS_NODE_SERVICE_URL + '/download?link=' + link + '&res=' + resolution + '&filename=' + fileName + '&xauthtoken=' + xauthtoken + '&agentid=' + login_user

        } catch (e) {
            console.log('[formUrlForAttachmentDownload] Error  -------- :: ' + e);
        }

        return sourceUrl
    }

    static formatTheKey(key) {

        try {

            let isnumeric = Utils.isNumeric(key);
            key = isnumeric ? (key * 1) : key;

        } catch (e) {

            console.log('[formatTheKey] Error  -------- :: ' + e);
        }

        return key;
    }

    static isNumeric(value) {

        return /^[0-9]*$/.test(value);
    }
}


export default Utils