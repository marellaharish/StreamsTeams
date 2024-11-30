
import { format } from 'date-fns';
import CryptoJS from 'crypto-js';


import IMConstants from '../../config/IMConstants';
import {
    buzzSound, chimedwnSound, doorSound, knockSound, zero, one,
    two, three, four, five, six, seven, eight, nine, star, hash
} from '../../assets/sounds/sounds_index';

import Constants from '../../config/Constants'
import { showToast } from '../../views/home/ToastView'
import Params from '../../config/Params';
import Config from '../../config/Config';
import URLParams from '../../config/URLParams';

const { XMLParser } = require('fast-xml-parser');

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

            const parser = new XMLParser({

                ignoreAttributes: false, // To include attributes in the JSON output
                attributeNamePrefix: "", // Prefix for attributes to distinguish them from tags
            });

            return parser.parse(data.data);

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

    static getUserTimeZone() {

        return new Date().getTimezoneOffset();
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

    static getFormatedDate(dateString, type) {
        let output = "";
        try {

            const localDate = new Date(dateString);  // This should work without manually appending ".000Z"
            let now = new Date();

            // Get the local timezone offset in milliseconds
            const timezoneOffset = localDate.getTimezoneOffset() * 60000;  // getTimezoneOffset returns offset in minutes
            const localTime = new Date(localDate.getTime() - timezoneOffset);

            let formatTime = (date) => {

                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // Check if the date is today
            if (localTime.toDateString() === now.toDateString()) {

                return (type === Constants.DATE_FORMATS.WS_HEADER_DATE) ? 'Today' : `${formatTime(localTime)}`;
            }

            // Check if the date was yesterday
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);

            if (localTime.toDateString() === yesterday.toDateString()) {

                return (type === Constants.DATE_FORMATS.WS_CHAT_MESSAGE_DATE) ? `${formatTime(localTime)}` : 'Yesterday';
            }

            // Otherwise, format as "MMM DD, YYYY"
            output = localTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        } catch (e) {
            console.log('Utils [formatDate] Error ::' + e);
        }

        return output
    }

    static getCurrentUTCTime() {

        let utcTime = new Date().toISOString()
        try {

            utcTime = utcTime.replace('T', ' ').replace(/(\.\d{3})?Z$/, '');

        } catch (e) {
            console.log('Utils [getCurrentUTCTime] Error ::' + e);
        }

        return utcTime
    }

    static playSound(type) {
        let audio;
        try {

            switch (type * 1) {

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

            audio.preload = 'auto';

            // Play the audio, but ensure it respects user interaction
            const playPromise = audio.play();

            if (playPromise !== undefined) {

                playPromise.catch(error => {

                    console.error('Audio playback failed:', error);
                });
            }

        } catch (e) {
            console.log('Utils [notificationSound] Error ::' + e);
        }
    }

    static playDialPadTones(type) {
        let audio;
        try {

            console.log('[playDialPadTones] type :: ' + type);

            if (type == '#') {

                audio = new Audio(hash);
            } else if (type == '*') {

                audio = new Audio(star);
            }

            switch (type * 1) {

                case 0:
                    audio = new Audio(zero);
                    break;

                case 1:
                    audio = new Audio(one);
                    break;

                case 2:
                    audio = new Audio(two);
                    break;

                case 3:
                    audio = new Audio(three);
                    break;

                case 4:
                    audio = new Audio(four);
                    break;

                case 5:
                    audio = new Audio(five);
                    break;

                case 6:
                    audio = new Audio(six);
                    break;

                case 7:
                    audio = new Audio(seven);
                    break;

                case 8:
                    audio = new Audio(eight);
                    break;

                case 9:
                    audio = new Audio(nine);
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

    static isObject(value) {
        try {

            if (typeof (value) !== "object") {
                JSON.parse(value);
            }

            return true;

        } catch (e) {

            console.log('[isObject] Error  -------- :: ' + e);
            return false
        }

        return false
    }

    static getFileType(fileName) {

        try {

            let fileTypeMapping = Constants.FILETYPES
            const fileExtension = fileName.split('.').pop().toLowerCase();

            if (fileTypeMapping.images.includes(fileExtension)) {

                return Constants.FILE_TYPES.IMAGES; // Images
            } else if (fileTypeMapping.audios.includes(fileExtension)) {

                return Constants.FILE_TYPES.AUDIO; // Audios
            } else if (fileTypeMapping.videos.includes(fileExtension)) {

                return Constants.FILE_TYPES.VIDEO; // Videos
            } else {

                return Constants.FILE_TYPES.FILE; // Other files
            }

        } catch (e) {
            console.log('[getFileType] Error  -------- :: ' + e);
        }

        return -1;

    }
}


export default Utils