import React, { useEffect, useRef, useState } from 'react'
import { Comment, Copy, Delete, Emoji, Forward, Edit, Reply, Profile, Send, Upload, TimerIcon } from '../../assets/images';
import { MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon, MDBInput, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalFooter, MDBModalHeader, MDBModalTitle, MDBTextArea } from 'mdb-react-ui-kit';
import {
    MDBCard,
    MDBCardHeader,
    MDBCardBody,
    MDBCardTitle,
    MDBCardText,
    MDBBtn
} from 'mdb-react-ui-kit';
import { useLocation, useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { showToast } from '../../views/home/ToastView';
import EmojiPicker from 'emoji-picker-react';

import evntEmitter from "../../classes/utils/EvntEmitter";
import EmitterConstants from "../../config/EmitterConstants"
import messageHandler from "../../classes/chat/MessageHandler"
import StreamsHandler from "../../classes/chat/StreamsHandler"
import Constants, { REQ_TYPE_SMS_ACTION } from "../../config/Constants"
import MessaageConstants from "../../config/MessaageConstants"
import Header from '../utils/Header';
import IMConstants from '../../config/IMConstants';
import Utils from '../../classes/utils/util';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import Attachments from './Attachments';
import Params from '../../config/Params'
import SettingsHandler from '../../classes/settings/SettingsHandler'
import ChatComponents from './ChatComponent'

let group_code;
let group_title
let phnumber;
let previousDate;
let isStreamsUser;
let sid;

let loadMoreStatus = false;
let sms_popup_status = false;
let noDataFromServer = false;

let scrollPosition = -1
let messagesListLength = 0

let smsDetails = {}

let TAG = "[ChatsView].";
const ChatsView = ({ user_data }) => {

    const navigate = useNavigate();

    const [smsPopupInputs, setSMSPopupInputs] = useState({});

    const [messagesList, setMessagesList] = useState([]);
    const [images, setImages] = useState([]);

    const [hoveredIndex, setHoveredIndex] = useState(null);

    const [message, setMessage] = useState('');
    const [username, setUserName] = useState('');

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [smsBannerVisible, setSMSBannerVisible] = useState(false)
    const [loadMoreChats, setLoadMoreChats] = useState(false);

    const location = useLocation();

    const messagesRef = useRef([]);
    const emojiPickerRef = useRef(null);
    const newMessageRef = useRef(null);

    //=============================       useEffect's     ==================================
    useEffect(() => {

        console.log('[ChatView].useEffect() default---- ');

        group_code = '';
        group_title = '';
        phnumber = '';
        sid = '';
        isStreamsUser = '';
        previousDate = '';

        if (user_data) {

            initSMS(user_data);
        }

    }, []);

    useEffect(() => {

        try {

            console.log('useEffect user_data ::: ' + JSON.stringify(user_data));

            if (user_data) {

                initSMS(user_data);
            }

            //reloadMessages();

            evntEmitter.removeAllListeners(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED);

            evntEmitter.on(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, reloadMessages);

        } catch (e) {

            console.log(TAG + "useEffect user_data :: ERROR :: " + e);
        }

    }, [user_data]);

    //Clicked on mobile.
    useEffect(() => {

        try {

            if (!location.state) return;
            if (!isMobile) return;

            console.log(TAG + '[useEffect].[location.state] ---- state ::' + JSON.stringify(location.state));

            let final_data;

            if (location.state.member_data) {

                final_data = location.state.member_data;
            } else if (location.state.member) {

                final_data = location.state.member;
            }

            initSMS(final_data);

        } catch (e) {

            console.log(TAG + "[useEffect].[location.state] :: ERROR :: " + e);
        }

    }, [location.state]);

    useEffect(() => {

        try {

            console.log('[useEffect][message] ---- default --  ');
            scrollToBottom();

        } catch (e) {

            console.log(TAG + "[useEffect][message] :: ERROR :: " + e);
        }

    }, [message]);

    // Handle closing the emoji picker when clicking outside
    useEffect(() => {

        try {

            const handleClickOutside = (event) => {

                if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {

                    setShowEmojiPicker(false);
                }
            };

            const handleKeyDown = (event) => {

                if (event.key === 'Escape') {

                    setShowEmojiPicker(false);
                }
            };

            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);

            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);

        } catch (e) {

            console.log(TAG + "[useEffect][emojiPickerRef] :: ERROR :: " + e);
        }

    }, [emojiPickerRef]);


    useEffect(() => {

        try {

            console.log(TAG + "[useEffect][messagesList] :: " + loadMoreChats + ", loadMoreStatus::  " + loadMoreStatus);

            const container = newMessageRef.current;
            if (messagesList.length <= 0) {

                messagesListLength = messagesList.length
                if (container) {

                    container.removeEventListener('scroll', handleScroll);
                }

                return
            }

            let messageslengthDiff = messagesList.length - messagesListLength;
            messagesListLength = messagesList.length

            if (messagesRef.current) {

                let index = scrollPosition;
                console.log(TAG + "[useEffect][messagesList] :: Scrolling useEffect index : " + index + ', topIndex: ' + scrollPosition);

                if (scrollPosition === 0) {

                    index = messagesList.length > 0 ? messageslengthDiff : scrollPosition;
                } else {

                    index = scrollPosition
                }

                index = index > 1 ? index - 1 : index;

                if (messagesList.length > 1 && messagesRef.current[index]) {

                    console.log(TAG + "[useEffect][messagesList] ::Scrolling useEffect index : " + index);
                    messagesRef.current[index].scrollIntoView({ behavior: "auto" });
                } else {

                    const lastMessageIndex = messagesList.length - 1;
                    if (messagesRef.current[lastMessageIndex]) {

                        console.log(TAG + "[useEffect][messagesList] ::Scrolling useEffect lastMessageIndex : " + lastMessageIndex);
                        messagesRef.current[lastMessageIndex].scrollIntoView({ behavior: 'auto' });
                    }
                }
            }


            if (container) {

                container.removeEventListener('scroll', handleScroll);
                container.addEventListener('scroll', handleScroll);
            }

            return () => {
                if (container) {
                    container.removeEventListener('scroll', handleScroll);
                }
            };

        } catch (e) {

            console.log(TAG + "[useEffect][messagesList] :: ERROR :: " + e);
        }

    }, [messagesList]);


    //=============================       Scroll Functions     ==================================

    const handleScroll = () => {

        try {

            if (loadMoreStatus == true) {

                return;
            }

            console.log(TAG + "[handleScroll] ::  loadMoreStatus :: " + loadMoreStatus);

            setCurrentIndex()

            console.log(TAG + '[handleScroll]  :: ' + scrollPosition + ', messagesList.length: ' + messagesList.length);
            if (scrollPosition === 0 && !noDataFromServer) {

                loadMoreMessages();
            }

        } catch (e) {

            console.log(TAG + '[handleScroll] Error :: ' + e);
        }

    };

    const setCurrentIndex = () => {

        try {

            if (newMessageRef.current && messagesRef.current) {

                const container = newMessageRef.current;
                const scrollTop = container.scrollTop;
                const messageElements = messagesRef.current;

                for (let i = 0; i < messageElements.length; i++) {

                    const messageElement = messageElements[i];
                    const elementTop = messageElement.offsetTop;
                    const elementHeight = messageElement.offsetHeight;

                    if (scrollTop >= elementTop && scrollTop < elementTop + elementHeight) {

                        scrollPosition = i; // Update
                        break;
                    }
                }
            }

        } catch (e) {
            console.log('[setcurrentIndex] Error :: ' + e);
        }

    }

    const scrollToBottom = () => {

        try {

            if (messagesRef.current) {

                messagesRef.current.scrollIntoView({ behavior: 'auto' });
            }

        } catch (e) {

            console.log('[scrollToBottom] Error :: ' + e);
        }

    };

    //=============================       General Functions    ==================================

    const initSMS = (user_data) => {

        try {

            console.log("[initSMS] ---- user_data :: " + JSON.stringify(user_data));

            setSMSBannerVisible(false);

            if (user_data && user_data.isNavigatedSMSPopUp) {

                smsDetails.to = user_data.to;
                smsDetails.from = user_data.from;
                smsDetails.isNavigatedSMSPopUp = user_data.isNavigatedSMSPopUp

                group_code = (user_data.group_code && user_data.group_code.length > 0) ? user_data.group_code : undefined
                group_title = (user_data.group_title && user_data.group_title.length > 0) ? user_data.group_title : undefined

                phnumber = user_data.to;

                smsDetails.group_title = group_title

            } else {

                if (user_data && user_data.latest_message) {

                    group_code = JSON.parse(user_data.latest_message).group_code;
                    phnumber = user_data.phnumber;

                    if (group_code.length > 0) {

                        isStreamsUser = false;

                    }
                } else {

                    phnumber = user_data.phnumber;
                }
            }

            sid = group_code ? group_code + "_" + phnumber : phnumber;

            if (phnumber) {

                setUserName(phnumber);
            }

            var messages = messageHandler.getSMSMessages(sid);

            console.log(TAG + "[ChatView].initSMS ---- " + messages.length + ", sid=" + sid);

            setMessagesList([...messages].reverse());

            setIsLoading((messages.length == 0));

            console.log(TAG + '[ChatView].initSMS() ---- group_code :: ' + group_code + ' :: phnumber :: ' + phnumber + " :: sid :: " + sid);

        } catch (e) {

            console.log('[initSMS] Error :: ' + e);
        }
    }

    const handleBackClick = () => {

        try {

            console.log(TAG + "[handleBackClick] ------- group_code :: " + group_code);

            if (group_code) {

                navigate("/didcomponent", { state: group_code });
            } else {

                navigate("/home");
            }

        } catch (e) {

            console.log(TAG + '[handleBackClick] Error :: ' + e);
        }

    };

    const reloadMessages = (message_data) => {

        try {

            console.log(TAG + "[reloadMessages] message_data --- " + JSON.stringify(message_data));

            if (message_data.noData) {//No chat messages received from Server.

                noDataFromServer = true;

                setTimeout(() => {

                    setLoadMoreChats(false);
                    loadMoreStatus = false;

                }, 500);

                return;
            }

            if (message_data && Object.keys(message_data).length > 0) {//New Message.

                let messageData = message_data.message ? JSON.parse(message_data.message) : message_data

                let curr_sms_id = messageData.group_code ?
                    messageData.group_code + "_" + message_data.phnumber : message_data.phnumber;

                if (sid != curr_sms_id) {

                    console.log(TAG + "[reloadMessages] RECEIVED SMS IS NOT BELOINGING TO THIS GROUP. CURRENT WINDOW :: " + sid + " :: NEW MEEAGE ID :: " + curr_sms_id);
                    return;

                }

            }

            console.log(TAG + '[reloadMessages] ---------- sid :: ' + sid);

            if (!sid) {

                console.log(TAG + '[reloadMessages] ---------- SID IS NOT AVAILABLE. SO DONT PROCESS THIS REQUEST.');
                return;
            }

            var messages = messageHandler.getSMSMessages(sid);

            console.log(TAG + "messages ---- " + messages);

            setMessagesList([...messages].reverse());
            setIsLoading(false);
            setLoadMoreChats(false);

            loadMoreStatus = false;

        } catch (e) {

            console.log(TAG + '[reloadMessages] Error :: ' + e);
        }
    }

    const loadMoreMessages = () => {
        try {

            setLoadMoreChats(true);

            if (loadMoreStatus == true) {

                return;
            }

            loadMoreStatus = true;

            let extra_data = {

                is_load_more: true
            }

            setTimeout(() => {

                SettingsHandler.loadSMSMessages(group_code, phnumber, Constants.SMS_CHAT_TYPES.WS_GROUP_SMS, extra_data);
            }, 1000)

        } catch (e) {
            console.log("[loadMoreMessages] Error --- " + e);
        }
    }

    const handleMouseEnter = (index) => {
        setHoveredIndex(index);
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    const handleKeyDown = (event) => {

        try {

            console.log("[handleKeyDown] ----- group_code :: " + group_code + " :: phnumber :: " + phnumber + " :: event :: " + event);

            if (event.key === 'Enter' && !event.shiftKey) {

                event.preventDefault(); // Prevents new line in textarea
                onClickSend();
            }

        } catch (e) {

            console.log("Error in handleKeyDown() :: " + e);
        }

    };

    const handleEmojiClick = (emojiObject) => {

        setMessage((prevMessage) => prevMessage + emojiObject.emoji); // Append the selected emoji to the textarea 
    };

    const deleteImage = (index) => {
        setImages(images.filter((_, i) => i !== index)); // Remove image at index
    };

    const onSelectAttachments = (files) => {

        try {

            const validImages = files.filter(file => file.type.startsWith('image/'));

            if (validImages.length > 0) {

                //const imageUrls = validImages.map(file => URL.createObjectURL(file));
                let imagesArray = StreamsHandler.prepareAttachemntsList(files);
                setImages(prevImages => [...prevImages, ...imagesArray]);
            }

        } catch (e) {

            console.err("[onSelectAttachments] Error :: " + e);
        }
    }

    const handleFileUpload = (event) => {

        try {

            const files = Array.from(event.target.files);

            onSelectAttachments(files);

            event.target.value = null

        } catch (e) {

            console.err("[handleFileUpload] Error :: " + e);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Prevent default to allow drop
    };

    const handleDrop = (e) => {

        try {

            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);

            onSelectAttachments(files);

        } catch (e) {

            console.log("Error in handleDrop() :: " + e);
        }

    };

    const handleDragLeave = (e) => {
        // Optionally handle styling or state changes on drag leave
    };

    const onSelectIMStandardMessage = (text) => {

        try {

            setMessage(text);


        } catch (e) {

            console.log("Error in onSelectIMStandardMessage() :: " + e);
        }
    }

    const onClickSend = () => {
        try {

            console.log('[onClickSend] -------- :: ' + JSON.stringify(smsDetails));

            if (smsDetails && ((Object.keys(smsDetails).length === 0) ||
                (smsDetails.actionType && (smsDetails.actionType * 1) <= 0 &&
                    !smsDetails.isNavigatedSMSPopUp))) {

                prepareSMSDetailsFromLastMessage();
            }

            onClickSMSAction(undefined, REQ_TYPE_SMS_ACTION.ACTION_SEND)

        } catch (e) {
            console.log('[onClickSend] Error  -------- :: ' + e);
        }
    }

    const prepareSMSDetailsFromLastMessage = () => {

        try {

            let finalMessageData
            if (messagesList && messagesList.length > 0) {

                let messageData = messagesList[messagesList.length - 1]
                finalMessageData = Utils.parseToObject(messageData.message)

                console.log("[prepareSMSDetailsFromLastMessage]  finalMessageData: " + JSON.stringify(messageData));

                //1- means Outgoing, 0- means Incoming sms.
                smsDetails.from = messageData.direction === Constants.REQ_TYPE_SMS_CHAT.WS_OUTGOING_SMS_MESSAGE ? finalMessageData.from : finalMessageData.to
                smsDetails.to = messageData.direction === Constants.REQ_TYPE_SMS_CHAT.WS_OUTGOING_SMS_MESSAGE ? finalMessageData.to : finalMessageData.from

            }

            if (group_code && group_code !== undefined && (group_code * 1) > 0) {

                if (finalMessageData && finalMessageData !== undefined) {

                    smsDetails.group_code = finalMessageData.group_code
                    smsDetails.group_title = finalMessageData.group_title
                    // smsDetails.group_uname = finalMessageData.group_uname
                    // smsDetails.group_lname = finalMessageData.group_lname
                    // smsDetails.group_fname = finalMessageData.group_fname
                    // smsDetails.siteid = finalMessageData.siteid
                } else {

                    smsDetails.group_code = group_code
                    // userData.group_title = group_title
                }
            }

        } catch (e) {
            console.log('[prepareSMSDetailsFromLastMessage] Error  -------- :: ' + e);
        }

    }

    const getGroupSMSFromToDetails = (messageData, actionType) => {

        try {

            console.log(TAG + "[getGroupSMSFromToDetails] messageData :: " + JSON.stringify(messageData));

            let toNumber = (actionType === REQ_TYPE_SMS_ACTION.ACTION_SEND) ? smsDetails.to : messageData.to
            let fromNumber = (actionType === REQ_TYPE_SMS_ACTION.ACTION_SEND) ? smsDetails.from : messageData.from

            console.log(TAG + "[getGroupSMSFromToDetails] messageData :: " + JSON.stringify(messageData) + " :: toNumber: " + toNumber + ' :: fromNumber: ' + fromNumber);

            if (actionType === REQ_TYPE_SMS_ACTION.ACTION_REPLY) {

                toNumber = messageData.from
                fromNumber = messageData.to
            }

            if (actionType !== REQ_TYPE_SMS_ACTION.ACTION_SEND) {

                smsDetails.group_code = messageData.group_code
                smsDetails.group_title = messageData.group_title
                smsDetails.group_uname = messageData.group_uname
                smsDetails.group_lname = messageData.group_lname
                smsDetails.group_fname = messageData.group_fname
                smsDetails.siteid = messageData.siteid
            }

            console.log(TAG + "[getGroupSMSFromToDetails] 22 toNumber: " + toNumber + ', fromNumber: ' + fromNumber +
                ', group_code: ' + group_code + ', phnumber: ' + phnumber);

            /*
            * If DID removed from Group for Group SMS which is used for existing message.
            * Client should check the available DID and send the SMS with available DID.
            * */
            let primary_did = StreamsHandler.verifyAndLoadGroupSMSDID(group_code, fromNumber);
            console.log(TAG + "[getGroupSMSFromToDetails] primary_did : " + primary_did);

            if (!primary_did || primary_did === '') {

                // show alert for no DID's available for Group
                let message = MessaageConstants.SMS_ALERT_FROM_NUMBER_NOT_AVAILABLE
                message = message.replace('?', fromNumber)
                Utils.showAlert(message)
                return false
            }

            console.log(TAG + "[getGroupSMSFromToDetails]  fromNumber :: " + fromNumber + " :: primary_did :: " + primary_did);
            if (fromNumber !== primary_did) {

                let confimationMsg = MessaageConstants.SMS_ALERT_NEW_NUMBER_CONFIRMATION
                confimationMsg = confimationMsg.replace('?', fromNumber)
                confimationMsg = confimationMsg.replace('#', primary_did)
                const userConfirmed = window.confirm(confimationMsg);

                if (!userConfirmed) {

                    console.log(TAG + '[getGroupSMSFromToDetails] == USER IGNORE TO SEND THE SMS == ')
                    return false
                } else {

                    fromNumber = primary_did
                }
            }

            if ((actionType !== REQ_TYPE_SMS_ACTION.ACTION_SEND)) {

            }

            smsDetails.to = toNumber
            smsDetails.from = fromNumber

        } catch (e) {
            console.log(TAG + '[getGroupSMSFromToDetails] Error  -------- :: ' + e);
            return false
        }

        return true

    }

    function onPopUpCallBack(popData) {
        try {

            smsDetails = popData;

            onClickSMSAction(smsDetails, REQ_TYPE_SMS_ACTION.ACTION_SEND)
            SettingsHandler.saveSMSAlwaysUseDetails(popData)

            sms_popup_status = false

        } catch (e) {
            console.log("[Chat.js].onPopUpCallBack() Error: " + e);
        }
    }

    const getUserSMSFromToDetails = (messageData, actionType) => {

        try {

            let toNumber = (actionType === REQ_TYPE_SMS_ACTION.ACTION_SEND) ? smsDetails.to : messageData.to
            let fromNumber = (actionType === REQ_TYPE_SMS_ACTION.ACTION_SEND) ? smsDetails.from : messageData.from
            console.log("[getUserSMSFromToDetails] 11- toNumber: " + toNumber + ', fromNumber: ' + fromNumber);

            if (actionType == REQ_TYPE_SMS_ACTION.ACTION_REPLY) {
                toNumber = messageData.from
                fromNumber = messageData.to
            }

            let fromUserDIDList = StreamsHandler.loadFromUserDIDs(); // Get User DID list
            if (fromUserDIDList === null || fromUserDIDList === undefined || fromUserDIDList.length <= 0) {
                // show alert for no DID's available for Group
                let message = MessaageConstants.SMS_ALERT_SMS_DID__NOT_AVAILABLE
                Utils.showAlert(message)
                return false
            }

            if (isStreamsUser) {
                // GET cellphone number of streams user
            } else {

                // Get SMS DID's of Non-streams user
            }

            if (actionType !== REQ_TYPE_SMS_ACTION.ACTION_SEND && fromUserDIDList.includes(fromNumber)) {

                smsDetails.to = toNumber
                smsDetails.from = fromNumber
                return true
            }

            // Get persist DID
            let strPersistDID = localStorage.getItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID);
            if (strPersistDID === null || strPersistDID === undefined || strPersistDID.length === 0) {

                if (fromUserDIDList.length == 1) {
                    strPersistDID = fromUserDIDList[0]; // set DID as strPersistDID (from number)
                } else {

                    // show popup for enter the toNumber and fromNumber (show strToCellPhone and strPersistDID in popup)
                    if (!sms_popup_status) {
                        // Need to 
                        sms_popup_status = true
                        smsDetails.did_list = fromUserDIDList
                        smsDetails.isEnableAlwaysUseDID = false
                        smsDetails.from = ''
                        setSMSPopupInputs(smsDetails)

                        setIsModalVisible(true);  // Set modal visibility to true to show popup

                        return false
                    }

                }
            } else {

                fromNumber = strPersistDID
            }

            smsDetails.to = toNumber
            smsDetails.from = fromNumber

        } catch (e) {
            console.log('[getUserSMSFromToDetails] Error  -------- :: ' + e);
            return false
        }
        return true

    }

    const onClickSMSAction = (messageData, actionType) => {

        try {

            if (actionType === REQ_TYPE_SMS_ACTION.ACTION_COPY) {
                // Write the copy message code
                Utils.copyToClipboard(messageData)
                return
            }

            if (actionType == REQ_TYPE_SMS_ACTION.ACTION_DELETE) {
                // Write the Delete message code
                StreamsHandler.deleteSMSMessage(messageData)
                return
            }

            let group_sms_status = (group_code && group_code !== undefined && parseInt(group_code) > 0);

            console.log("[onClickSMSAction] ------- group_sms_status :: " + group_sms_status + ', actionType: ' + actionType);

            let sms_enable_status = localStorage.getItem(Constants.WS_KEY_SMS_ENABLED_STATUS);

            if (!sms_enable_status) {

                if (!isStreamsUser) {

                    console.log("[onClickSMSAction] ---- HE IS NOT STREAMS USER ------");
                    Utils.showAlert(MessaageConstants.SMS_ALERT_FOR_NON_STREAM_USERS);

                } else {

                    let alert_msg = Utils.formatString(MessaageConstants.SMS_CONFIRMATION_ALERT_FOR_STREAM_USERS, Constants.WS_PRODUCT_NAME, Constants.WS_PRODUCT_NAME);

                    console.log("[onClickSMSAction] ---- SENDING SMS AS REGULAR IM MESSAGE ------");
                    Utils.showAlert(alert_msg);

                }

                return;
            }

            if (group_sms_status) {

                let isValidGroupInputs = getGroupSMSFromToDetails(messageData, actionType)
                if (!isValidGroupInputs) {
                    return
                }

            } else {

                let isValidUserInputs = getUserSMSFromToDetails(messageData, actionType)
                if (!isValidUserInputs) {
                    return
                }

            }

            if (actionType === REQ_TYPE_SMS_ACTION.ACTION_SEND || actionType === REQ_TYPE_SMS_ACTION.ACTION_RESEND) {

                if (smsBannerVisible) {
                    setSMSBannerVisible(false)
                }

                let textMessage
                if (actionType === REQ_TYPE_SMS_ACTION.ACTION_RESEND) {

                    textMessage = messageData.msg
                } else {

                    textMessage = message
                }

                if (images.length <= 0 && textMessage == '') {

                    console.log('[onClickSMSAction] Sorry!!!!! Message is Empty.');
                    return
                }


                if (!smsDetails || Object.keys(smsDetails).length <= 0) {

                    console.log('[onClickSMSAction] THERE IS NO USER DATA ==================');
                    return
                }

                if (textMessage.trim().length > 0) {

                    //smsDetails.from = '12095153038'

                    let final_message = StreamsHandler.prepareSMSData(textMessage, smsDetails, IMConstants.WS_IM_SMS);

                    console.log('[onClickSMSAction] - final_message : ' + JSON.stringify(final_message))

                    StreamsHandler.onOutgoingMessage('', '', final_message, IMConstants.WS_IM_SMS, 1);
                    setMessage('')

                }

                if (images.length > 0) {

                    let final_message = StreamsHandler.prepareSMSData(images, smsDetails, IMConstants.WS_IM_MMS);

                    console.log('[onClickSMSAction] - final_message : ' + JSON.stringify(final_message))

                    StreamsHandler.onOutgoingMessageAttachment('', '', final_message, IMConstants.WS_IM_MMS, 1);
                    setImages([]);
                }

                smsDetails = {}
            } else {  // For User clicked on SMS actions(reply, Resend, Send another SMS, Edit), not on Send Action

                smsDetails.actionType = actionType
                console.log("[onClickSMSAction] smsDetails : " + JSON.stringify(smsDetails));
                setSMSBannerVisible(true)
            }

        } catch (e) {

            console.log('[onClickSMSAction] Error  -------- :: ' + e);
        }
    }

    const [isEditing, setIsEditing] = useState(false);
    const [messageNew, setMessageNew] = useState("  Lorem ipsum dolor, sit amet consectetur adipisicing elit. Distinctio, voluptates.");

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        // Add logic to save changes, e.g., updating backend or local state
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };


    return (
        <>

            <div className="d-hide">
                <Header />
            </div>
            <MDBCard>
                <MDBCardHeader>
                    <div className='d-flex align-items-center'>
                        {isMobile &&
                            <div onClick={handleBackClick} className='me-3'>
                                <MDBIcon fas icon="arrow-left" />
                            </div>
                        }
                        <div className='ChatUserNameMain'>{username}</div>
                    </div>
                </MDBCardHeader>
                <MDBCardBody className='card-height position-relative p-0'
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragLeave={handleDragLeave}
                >

                    {isLoading ? (
                        <div className="p-3">
                            <div class="date-container">
                                <hr class="date-divider" />
                                <div class="date-display">
                                    <span>
                                        <Skeleton width="200px" />
                                    </span>
                                </div>
                            </div>
                            {Array(5).fill().map((_, index) => (
                                <div className="mb-5">
                                    <SkeletonTheme>
                                        <div className="d-flex align-items-start">
                                            <Skeleton width={50} height={50} borderRadius={"8px"} />
                                            <div className="ms-2">
                                                <p className='ChatUserName'>
                                                    <Skeleton width="250px" />
                                                </p>
                                                <p>
                                                    <Skeleton width="500px" />
                                                </p>
                                                <div className="d-flex">
                                                    <div className="cursor-pointer me-3 text-small">
                                                        <Skeleton width={40} height={25} borderRadius={"8px"} />
                                                    </div>
                                                    <div className="cursor-pointer me-3 text-small">
                                                        <Skeleton width={40} height={25} borderRadius={"8px"} />
                                                    </div>
                                                    <div className="cursor-pointer me-3 text-small">
                                                        <Skeleton width={40} height={25} borderRadius={"8px"} />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>



                                    </SkeletonTheme>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className={`px-4 ${!images.length > 0 ? "messagesContainerMain" : "messagesContainer"}`} ref={newMessageRef}>

                                <div className='firstChat'>

                                    {loadMoreChats &&
                                        <div className="d-flex align-items-center justify-content-center p-3">
                                            <div class="spinner-border loading-icon" role="status"></div>
                                            <span class="loading-text fw-bold">Loading...</span>
                                        </div>
                                    }

                                    {messagesList && messagesList.length > 0 ? <>

                                        {messagesList.map((message, index) => {

                                            console.log(TAG + 'message :: ' + JSON.stringify(message) + ' :: index :: ' + index);
                                            let parsedFailureReason = null;
                                            let parsedMessage = null;

                                            try {
                                                parsedMessage = JSON.parse(message.message);
                                            } catch (error) {
                                                console.error("Error parsing message:", error);
                                            }

                                            // Try parsing message.failure_reason if it exists
                                            if (message.failure_reason) {
                                                try {
                                                    parsedFailureReason = JSON.parse(message.failure_reason);
                                                } catch (error) {
                                                    console.error("Error parsing failure_reason:", error);
                                                }
                                            }

                                            const messageFrom = parsedMessage?.from || '';
                                            const messageTo = parsedMessage?.to || '';
                                            const messageContent = parsedMessage?.msg || [];

                                            let msg_time = message.latest_time ? message.latest_time : message.messagetime;
                                            const messageDate = Utils.getFormatedDate(msg_time, Constants.DATE_FORMATS.WS_GROUP_DID_DATE);

                                            const dateHeader = previousDate !== messageDate;

                                            if (dateHeader) {

                                                previousDate = messageDate;
                                            }

                                            return (

                                                <>

                                                    {dateHeader &&
                                                        (
                                                            <div class="date-container">
                                                                <hr class="date-divider" />
                                                                <div class="date-display"><span>{messageDate}</span></div>
                                                            </div>
                                                        )}

                                                    <div key={index} ref={(el) => (messagesRef.current[index] = el)} className={`chatComponent ${index === 0 && !images.length > 0 ? "firstChat" : ""}`}>
                                                        <div className='mb-4 firstChat'>
                                                            <div className='d-flex align-items-start w-100'>
                                                                <img src={Profile} alt={message.message.from}
                                                                    className='rounded-4 profileImage'
                                                                />
                                                                <div className='ps-3 w-100'>
                                                                    <div>

                                                                        <div className="d-flex align-items-center justify-content-between">
                                                                            <div className="d-flex">
                                                                                <p className='ChatUserName'>{messageFrom}</p>
                                                                                {(!message.delivery_status && message.delivery_status > 0) &&
                                                                                    (
                                                                                        <p className='text-secondary ps-2'>{Utils.getFormatedDate(msg_time, Constants.DATE_FORMATS.WS_CHAT_MESSAGE_DATE)}</p>
                                                                                    )
                                                                                }

                                                                            </div>
                                                                            {(!message.delivery_status || message.delivery_status === -1) && (
                                                                                <div className="cursor-pointer me-3 text-small">
                                                                                    <img src={TimerIcon} alt="" className="replyIcons" />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Display message content */}

                                                                        <p>{
                                                                            (() => {

                                                                                //console.log("messageFrom =22==" + messageFrom + " :: messageTo :: " + messageTo + " :: messageContent :: " + JSON.stringify(messageContent));

                                                                                if (message.msgtype * 1 === IMConstants.WS_IM_SMS ||
                                                                                    message.msgtype * 1 === IMConstants.WS_IM_MMS) {

                                                                                    return ChatComponents.displaySMS_MMS_Message(message, onClickSMSAction)

                                                                                } else {

                                                                                    return messageContent;
                                                                                }
                                                                            })()
                                                                        }</p>

                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>







                                                    <div className="chatComponent">
                                                        <div className="mb-4 firstChat">
                                                            <div className="d-flex align-items-start w-100">
                                                                <img
                                                                    src={Profile} className="rounded-4 profileImage"
                                                                    alt="User Icon"
                                                                />
                                                                <div className="ps-3 w-100">
                                                                    <div>
                                                                        <div className="d-flex align-items-center justify-content-between">
                                                                            <div className="d-flex">
                                                                                <p className="ChatUserName">Harish Marella</p>
                                                                            </div>
                                                                            <div className="cursor-pointer me-3 text-small">
                                                                                <img src=''
                                                                                    alt=""
                                                                                    className="replyIcons"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <p>
                                                                            <div className="ps-3 w-100">
                                                                                <div>
                                                                                    <p>
                                                                                        <div>
                                                                                            <p className="text-secondary" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                                                                                                SMS message sent to <b>19988776644</b> from <b>11015565966</b>
                                                                                            </p>
                                                                                        </div>
                                                                                    </p>

                                                                                    {isEditing ? (
                                                                                        <div className="edit-mode">
                                                                                            <MDBTextArea
                                                                                                value={messageNew}
                                                                                                onChange={(e) => setMessageNew(e.target.value)}
                                                                                            />
                                                                                            <div className="mt-2">
                                                                                                <MDBBtn onClick={handleSaveClick}>Save Changes</MDBBtn>
                                                                                                <MDBBtn onClick={handleCancelClick} className='ms-2' color='secondary'>Cancel</MDBBtn>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <>
                                                                                            <p className="messageAlign">
                                                                                                {messageNew}
                                                                                            </p>
                                                                                            <div className="d-flex align-items-center mt-2 w-sm-100">
                                                                                                <div className="cursor-pointer me-3 text-small" onClick={handleEditClick}>
                                                                                                    <img src={Edit} alt="Edit" className="replyIcons" />
                                                                                                </div>
                                                                                            </div>
                                                                                        </>
                                                                                    )}


                                                                                </div>
                                                                            </div>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>



                                                </>

                                            );
                                        })}

                                    </> : <>

                                        <h1>Hi {localStorage.getItem("LOGIN_USER")?.split('@')[0]} !!!</h1>
                                        <p>
                                            Send SMS Message to <b>{username}</b> from { }
                                        </p>

                                    </>}

                                </div>
                            </div>
                        </>
                    )}


                    <div className="MessageTextAreaContainer" >

                        {/* SMS Banner starts */}
                        <div>
                            {smsBannerVisible && (
                                ChatComponents.showSMSBanner(
                                    smsDetails,
                                    setSMSBannerVisible,
                                    setIsModalVisible
                                )
                            )}
                        </div>
                        {/* SMS Banner Ends */}

                        {images.length > 0 && (
                            <div id="uploading_images_area" className="d-flex align-items-center pt-4">
                                {images.map((image, index) => (
                                    <div
                                        className="image-container"
                                        key={index}
                                        onMouseEnter={() => handleMouseEnter(index)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <img
                                            src={image.link}
                                            alt={`Uploaded ${index}`}
                                            className="uploadedImage"
                                        />
                                        {hoveredIndex === index && (
                                            <div className="mask">
                                                <div className="cloneBtn" onClick={() => deleteImage(index)}>
                                                    <MDBIcon fas icon="times" className='fs-6 m-0' color='light' />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}


                        <div className="MessageTextArea mt-2">

                            <textarea
                                type="text"
                                placeholder='Type Your message here....'
                                rows={1}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />

                            <div className='EmojiPosition'>

                                <div className="iconContainer ms-1" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    <img src={Emoji} alt="" className="smsIcon" />
                                </div>

                                {showEmojiPicker && (
                                    <div style={{ position: 'absolute', zIndex: 9999, bottom: 40, right: 0 }} ref={emojiPickerRef}>
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>
                                )}

                                <div className='iconContainer ms-1'>
                                    <input
                                        type="file"
                                        id='SelectFiles'
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                    <label htmlFor='SelectFiles'>
                                        <img src={Upload} alt="" className='smsIcon' />
                                    </label>
                                </div>

                                <div className="nobg">
                                    <MDBDropdown dropup>
                                        <MDBDropdownToggle>
                                            <div className="iconContainer ms-1">
                                                <img src={Comment} alt="" className="smsIcon" />
                                            </div>
                                        </MDBDropdownToggle>
                                        <MDBDropdownMenu style={{ width: '310px' }} responsive="end">
                                            {Constants.IM_STANDARD_MESSAGES.map((msg, index) => (
                                                <MDBDropdownItem key={index} link onClick={() => onSelectIMStandardMessage(msg)}>
                                                    <div className="d-flex align-items-center">{msg}</div>
                                                </MDBDropdownItem>
                                            ))}
                                            <div className="dropdown-divider"></div>
                                            <form className="p-3">
                                                <MDBInput
                                                    size="sm"
                                                    placeholder="Add a new custom message"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)} // Allow user to type custom message
                                                />
                                            </form>
                                        </MDBDropdownMenu>
                                    </MDBDropdown>
                                </div>

                                <div className='iconContainer ms-1' onClick={onClickSend}>
                                    <img src={Send} alt="" className='smsIcon' />
                                </div>
                            </div>
                        </div>
                    </div>

                </MDBCardBody>

                {/* SMS popup starts */}
                <div>
                    {isModalVisible && (

                        ChatComponents.showSMSPopUp(
                            MessaageConstants.SMS_ALERT_GROUP_SMS_TO_FROM_NUMBER_SELECTION + ' gropName',  // Title for the modal
                            smsPopupInputs,  // To and From number params
                            setSMSPopupInputs, // update To and From number params
                            isModalVisible,  // Modal visibility state
                            setIsModalVisible,  // Function to change modal visibility
                            onPopUpCallBack  // Callback or data handler
                        )
                    )}
                </div>
                {/* SMS popup Ends */}

            </MDBCard >

        </>
    )
}

export default ChatsView
