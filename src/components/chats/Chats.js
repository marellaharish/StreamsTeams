import React, { useEffect, useRef, useState } from 'react'
import { Comment, Copy, Delete, Emoji, Forward, Edit, Reply, Profile, Send, Upload, TimerIcon } from '../../assets/images';
import { MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon, MDBInput, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalFooter, MDBModalHeader, MDBModalTitle } from 'mdb-react-ui-kit';
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
import ContactsHandler from "../../classes/contacts/ContactsHandler"

let source_data_for_mobile;
let group_code;
let group_title
let phnumber;
let previousDate;
let isStreamsUser;
let sid;

let loadMoreStatus = false;
let sms_popup_status = false;

let scroll_directions_list = [];//scroll_directions_list variable we will use only when we do messaage search  if we don't search it will be empty

let selected_msg_smsgid = 0;
let scrollPosition = -1
let previousMessagesListLength = 0
let unread_count = 0;

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
    const [selectedColorTheme, setSelectedColorTheme] = useState('dark');

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [smsBannerVisible, setSMSBannerVisible] = useState(false)
    const [loadMoreChats, setLoadMoreChats] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(null);
    const [scrolledToBottom, setScrolledToBottom] = useState(false);//When we scroll bottom afer user start message searcg we will show loading indicator at bottom. So make it false if no data in server. This variable we will use to send Read Status to server when user scroll to battom of the chat 

    const [editedsmsgid, setEditedsmsgid] = useState(undefined)
    const [editedMessage, setEditedMessage] = useState(undefined)

    const location = useLocation();

    const messagesRef = useRef([]);
    const emojiPickerRef = useRef(null);
    const newMessageRef = useRef(null);
    const unreadRef = useRef(null)

    //=============================       useEffect's     ==================================
    useEffect(() => {

        console.log('[ChatView].useEffect() default---- ');

        if (user_data) {

            //initSMS(user_data);
        }

    }, []);

    useEffect(() => {

        try {

            console.log('useEffect user_data ::: ' + JSON.stringify(user_data));

            if (user_data) {

                init(user_data);
            }

        } catch (e) {

            console.log(TAG + "useEffect user_data :: ERROR :: " + e);
        }

    }, [user_data]);

    //Clicked on mobile.
    useEffect(() => {

        try {

            if (!location.state) return;
            if (!isMobile) return;

            console.log(TAG + '[useEffect].[location.state] ---- location.state ::' + JSON.stringify(location.state));

            let final_data;

            if (location.state.member_data) {

                final_data = location.state.member_data;
            } else if (location.state) {

                final_data = location.state;
            }

            init(final_data);

        } catch (e) {

            console.log(TAG + "[useEffect].[location.state] :: ERROR :: " + e);
        }

    }, [location.state]);

    /*
    useEffect(() => {

        try {

            console.log('[useEffect][message] ---- default --  ');
            scrollToBottom();

        } catch (e) {

            console.log(TAG + "[useEffect][message] :: ERROR :: " + e);
        }

    }, [message]);
    */

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

    /*
    useEffect(() => {

        try {

            console.log(TAG + "[useEffect][newMessageRef.current] ===============");

            const container = newMessageRef.current;

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

            console.log(TAG + "[useEffect][newMessageRef.current] :: ERROR :: " + e);
        }

    }, [newMessageRef.current])
    */

    useEffect(() => {

        try {

            console.log(TAG + "[useEffect][messagesList] ============= messages Length :: " + messagesList.length);

            const container = newMessageRef.current;
            if (messagesList.length <= 0) {

                previousMessagesListLength = messagesList.length
                if (container) {

                    console.log(TAG + "[useEffect][messagesList] REMOVING SCROLL LISTENER ");
                    container.removeEventListener('scroll', handleScroll);
                }

                return
            }

            let messageslengthDiff = messagesList.length - previousMessagesListLength;

            if ((unread_count * 1) > 0) {

                sendUnReadStatusToServer();

                messageslengthDiff = messagesList.length - (unread_count * 1);
            }

            let findMessageIndexBySmsgid = getMessageIndexForSearch()

            console.log(TAG + "[useEffect][messagesList] :: Scrolling useEffect previous messagesListLength : " + previousMessagesListLength + ', topIndex: ' + scrollPosition + ' :: messageslengthDiff :: ' + messageslengthDiff);

            previousMessagesListLength = messagesList.length

            let index = messageslengthDiff > 0 ? messageslengthDiff : scrollPosition
            //index = index > 1 ? index - 1 : index;

            if (messageslengthDiff == 1 || messageslengthDiff == 0) {

                index = messagesList.length - 1;
            }

            index = findMessageIndexBySmsgid >= 0 ? findMessageIndexBySmsgid : index

            if (messagesRef.current) {

                /*let index = scrollPosition;

                if (scrollPosition === 0) {

                    index = messagesList.length > 0 ? messageslengthDiff : scrollPosition;
                } else {

                    index = scrollPosition
                }*/

                if (messagesRef.current[index]) {

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

        } catch (e) {

            console.log(TAG + "[useEffect][messagesList] :: ERROR :: " + e);
        }

    }, [messagesList]);

    //=============================     Emitter Functinos      ==================================

    const setNewMessageRef = (node) => {
        console.log(TAG + "[setNewMessageRef][newMessageRef.current] ===============" + node);

        if (node) {

            node.removeEventListener('scroll', handleScroll);
            node.addEventListener('scroll', handleScroll);
        } else {

            if (newMessageRef.current) {

                newMessageRef.current.removeEventListener('scroll', handleScroll);
            }
        }
        newMessageRef.current = node;
    };

    const unRegisterEmitters = () => {

        try {

            evntEmitter.removeAllListeners(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED);

        } catch (e) {

            console.log(TAG + "[unRegisterEmitters]  ERROR :: " + e);
        }
    }

    const registerEmitters = () => {

        try {

            evntEmitter.on(EmitterConstants.EMMIT_ON_SMS_MESSAGES_RECEIVED, reloadMessages);

        } catch (e) {

            console.log(TAG + "[registerEmitters]  ERROR :: " + e);
        }
    }

    //=============================       Scroll Functions     ==================================

    const getMessageIndexForSearch = () => {

        let findMessageIndexBySmsgid = -1
        try {

            console.log("[getMessageIndexForSearch] :: " + selected_msg_smsgid);

            if (selected_msg_smsgid) {

                findMessageIndexBySmsgid = messagesList.findIndex(message => message.smsgid === selected_msg_smsgid)

                console.log("[getMessageIndexForSearch] :after : " + findMessageIndexBySmsgid);

                if (findMessageIndexBySmsgid >= 0) {

                    setHighlightIndex(findMessageIndexBySmsgid);
                } else {

                    setHighlightIndex(null);
                }

            }

        } catch (e) {
            console.log(TAG + '[getMessageIndexForSearch] Error :: ' + e);
        }

        return findMessageIndexBySmsgid
    }

    const onReceiveUserData = (userdata) => {

        try {

        } catch (e) {

            console.log(TAG + "[onReceiveUserData] :: ERROR :: " + e);
        }
    }

    const handleScroll = () => {

        try {

            if (loadMoreStatus == true) {

                return;
            }

            setCurrentIndex()

            let shouldScroll = false;
            var scrollTop = 0;
            var isScrollBottomReached = false;

            if (newMessageRef.current) {

                const container = newMessageRef.current;
                scrollTop = container.scrollTop;
                isScrollBottomReached = container.scrollTop + container.clientHeight >= container.scrollHeight;//5- is gap from the bottom of the scroll.

                if (scrollTop < 30) {//30- is the gap between the top and scrollbar. If the diff reaches 30 we will send the server request.

                    shouldScroll = true;
                }

                /*
                console.log(TAG + '[handleScroll] shouldScroll :: ' + shouldScroll + ' :: scrollTop :: ' + scrollTop + ' :: isScrollBottomReached :: ' +
                    isScrollBottomReached + ' :: loadMoreStatus :: ' + loadMoreStatus + ' :: scroll_direction_list :: ' + scroll_directions_list +
                    ' :: messagesList.length: ' + messagesList.length + ' :: scrollHeight :: ' + container.scrollHeight +
                    ' :: clientHeight :: ' + container.clientHeight + " :: unread_count :: " + unread_count);
                */
            }

            //scroll_directions_list variable we will use only when we do messaage search if we don't search it will be empty
            if (shouldScroll && !loadMoreStatus && !scroll_directions_list.includes(Constants.SCROLL_DIRECTION.TOP)) {// If scrolled close to the top, load more messages

                loadMoreMessages(true);
            }

            //if (messagesList.length > 0 && scrollPosition === messagesList.length - 1) {
            if (isScrollBottomReached) {

                console.log(TAG + '[handleScroll] REACHED TO BOTTOM ===== ');

                if (selected_msg_smsgid && !scroll_directions_list.includes(Constants.SCROLL_DIRECTION.BOTTOM)) {//Message search is started, so when user scoll to the bottom we need show the later messages.

                    loadMoreMessages(false);
                }

                sendUnReadStatusToServer(sid, group_code, phnumber);
            }

        } catch (e) {

            console.log(TAG + '[handleScroll] Error :: ' + e);
        }

    };

    const sendUnReadStatusToServer = () => {

        try {

            console.log(TAG + "[sendUnReadStatusToServer] ================= unread_count :: " + unread_count);

            if ((unread_count * 1) > 0) {

                StreamsHandler.sendReadStatus(sid, group_code, phnumber)
            }

            unread_count = 0;

            if (unreadRef.current) {

                unreadRef.current.style.visibility = (unread_count !== 0) ? 'visible' : 'hidden'
            }

        } catch (e) {

            console.log(TAG + '[sendUnReadStatusToServer] Error :: ' + e);
        }
    }

    const setCurrentIndex = () => {

        try {

            if (newMessageRef.current && messagesRef.current) {

                const container = newMessageRef.current;
                const scrollTop = container.scrollTop;
                const messageElements = messagesRef.current;

                //console.log(TAG + "[setCurrentIndex] --------- scrollTop :: " + scrollTop + " :: offsetTop :: " + container.offsetTop + " :: offsetHeight :: " + container.offsetHeight);

                if ((scrollTop + container.offsetHeight + 5) > container.scrollHeight) {

                    scrollPosition = messageElements.length - 1;
                    console.log(TAG + "[setCurrentIndex] --------- SCROLL IS AT BOTTOM ---");
                    return;
                }

                for (let i = 0; i < messageElements.length; i++) {

                    const messageElement = messageElements[i];
                    const elementTop = messageElement.offsetTop;
                    const elementHeight = messageElement.offsetHeight;

                    if (scrollTop >= elementTop && scrollTop < elementTop + elementHeight) {

                        scrollPosition = i; // Update

                        //console.log(TAG + "[setCurrentIndex] ---------  i :: " + i + " :: mesg length :: " + messageElements.length + " :: elementTop :: " + elementTop + " :: elementHeight :: " + elementHeight + " :: scrollTop :: " + scrollTop + " :: scrollPosition :: " + scrollPosition + " :: CCscrollHeight :: " + container.scrollHeight + " :: CCoffsetHeight :: " + container.offsetHeight + " :: CCoffsetTop :: " + container.offsetTop)

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

    const initParams = () => {

        try {


            group_code = '';
            group_title = '';
            phnumber = '';
            sid = '';
            isStreamsUser = '';
            previousDate = '';

            scrollPosition = -1;
            unread_count = 0;
            selected_msg_smsgid = 0;

            loadMoreStatus = false;
            sms_popup_status = false;
            scroll_directions_list = [];

            previousMessagesListLength = 0

            smsDetails = {}

        } catch (e) {

            console.log('[initParams] Error :: ' + e);
        }
    }

    const init = (user_data) => {

        try {

            console.log("[init] ---- user_data :: " + JSON.stringify(user_data));

            initParams();

            unRegisterEmitters();
            registerEmitters();

            setSMSBannerVisible(false);

            source_data_for_mobile = user_data;

            if (user_data && user_data.isNavigatedSMSPopUp) {

                smsDetails.to = user_data.to;
                smsDetails.from = user_data.from;
                smsDetails.isNavigatedSMSPopUp = user_data.isNavigatedSMSPopUp

                group_code = (user_data.group_code && user_data.group_code.length > 0) ? user_data.group_code : undefined
                group_title = (user_data.group_title && user_data.group_title.length > 0) ? user_data.group_title : undefined

                phnumber = user_data.to;

                smsDetails.group_title = group_title

            } else {

                if (user_data && user_data.message) {

                    group_code = JSON.parse(user_data.message).group_code;
                    phnumber = user_data.phnumber;

                    if (group_code && group_code.length > 0) {

                        isStreamsUser = false;

                    }
                } else {

                    phnumber = user_data.phnumber;
                }
            }

            sid = group_code ? group_code + "_" + phnumber : phnumber;
            selected_msg_smsgid = (user_data.isSearchItem === true) ? user_data.smsgid : 0

            if (phnumber) {

                setUserName(phnumber);
            }

            var messages_list = messageHandler.getSMSMessages(sid);

            console.log(TAG + "[ChatView].init ---- messages_list length :: " + messages_list.length + ", sid=" + sid);

            if (user_data.unread_count && (user_data.unread_count * 1) > 0) {

                unread_count = (user_data.unread_count * 1);
            }

            console.log(TAG + '[ChatView].init() ---- group_code :: ' + group_code + ' :: phnumber :: ' + phnumber + " :: sid :: " + sid);

            if (messages_list && messages_list.length > 0) {

                setMessagesList([...messages_list]);
                setIsLoading(false);
            }

            let groupcode = '';
            let type = Constants.SMS_CHAT_TYPES.WS_ONE_TO_ONE_SMS;

            if ((group_code && group_code !== undefined && (group_code * 1) > 0)) {

                groupcode = group_code;
                type = Constants.SMS_CHAT_TYPES.WS_GROUP_SMS;

            }

            let direction = user_data.isSearchItem ? Constants.SCROLL_DIRECTION.SEARCH : Constants.SCROLL_DIRECTION.NEUTRAL;
            SettingsHandler.loadSMSMessages(selected_msg_smsgid, groupcode, phnumber, type, {}, false, direction);

        } catch (e) {

            console.log('[init] Error :: ' + e);
        }
    }

    const handleBackClick = () => {

        try {

            console.log(TAG + "[handleBackClick] ------- group_code :: " + group_code + " :: source_data_for_mobile :: " + JSON.stringify(source_data_for_mobile));

            if (group_code) {

                navigate("/didcomponent", { state: source_data_for_mobile });
            } else {

                navigate("/home", { state: source_data_for_mobile });
            }

        } catch (e) {

            console.log(TAG + '[handleBackClick] Error :: ' + e);
        }

    };

    const reloadMessages = (message_data) => {

        try {

            console.log(TAG + "[reloadMessages] message_data --- " + JSON.stringify(message_data));

            if (message_data.noData) {//No chat messages received from Server.

                if (message_data.scroll_direction && !scroll_directions_list.get(message_data.scroll_direction * 1)) {//No chat messages received from Server.

                    scroll_directions_list.push(message_data.scroll_direction * 1);
                }

                setTimeout(() => {

                    setIsLoading(false);
                    setLoadMoreChats(false);
                    setScrolledToBottom(false);//When we scroll bottom afer user start message searcg we will show loading indicator at bottom. So make it false if no data in server. 
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

                if (message_data.unread_count && message_data.unread_count >= 0) {

                    unread_count = message_data.unread_count;
                }

            }

            console.log(TAG + '[reloadMessages] ---------- sid :: ' + sid);

            if (!sid) {

                console.log(TAG + '[reloadMessages] ---------- SID IS NOT AVAILABLE. SO DONT PROCESS THIS REQUEST.');
                return;
            }

            loadMoreStatus = false;

            var messages = messageHandler.getSMSMessages(sid);

            console.log(TAG + "messages length ---- " + messages.length);// + " ::  Messages list :: " + JSON.stringify(messages));

            //messages = messages.reverse();

            setMessagesList([...messages]);
            setIsLoading(false);
            setLoadMoreChats(false);

        } catch (e) {

            console.log(TAG + '[reloadMessages] Error :: ' + e);
        }
    }

    const loadMoreMessages = (isScrollTop) => {
        try {

            console.log(TAG + '[loadMoreMessages] ========== isScrollTop :: ' + isScrollTop);

            let scroll_direction = Constants.SCROLL_DIRECTION.BOTTOM;
            if (isScrollTop) {

                setLoadMoreChats(true);
                scroll_direction = Constants.SCROLL_DIRECTION.TOP;

            } else {//User did message search and scrolled to bottom of the window. So load the next few messags from server.

                if (!user_data.isSearchItem === true) {//If user didn't do search but did scroll bottom then don't send server request.

                    return;
                }

                setScrolledToBottom(true);
            }

            if (loadMoreStatus == true) {

                return;
            }

            loadMoreStatus = true;

            let extra_data = {

                is_load_more: true
            }

            let type = Constants.SMS_CHAT_TYPES.WS_ONE_TO_ONE_SMS
            if (group_code && group_code !== undefined && (group_code * 1) > 0) {

                type = Constants.SMS_CHAT_TYPES.WS_GROUP_SMS;
            }

            SettingsHandler.loadSMSMessages(selected_msg_smsgid, group_code, phnumber, type, extra_data, true, scroll_direction);

            // setTimeout(() => {

            //     SettingsHandler.loadSMSMessages(group_code, phnumber, Constants.SMS_CHAT_TYPES.WS_GROUP_SMS, extra_data, true);
            // }, 100)

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

            if (files && files.length > 1 || (images && images.length >= 1)) {

                Utils.showAlert(MessaageConstants.SMS_ALERT_SMS_ATACHMENT_SELECT_LIMIT)
                return;
            }

            const validImages = files.filter(file => file.type.startsWith('image/'));

            if (validImages.length > 0) {

                const validFileSizeImages = files.filter(file => (file.size > 450 * 1000));

                if (validFileSizeImages.length > 0) {

                    Utils.showAlert(MessaageConstants.SMS_ALERT_SMS_ATACHMENT_LIMIT)
                    return true;
                }

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

            const validImages = files.filter(file => file.type.startsWith('image/') ||
                file.type.startsWith('audio/') ||
                file.type.startsWith('video/'))


            if (validImages.length > 0) {

                onSelectAttachments(files);

            } else {

                Utils.showAlert(MessaageConstants.SMS_ALERT_ALLOW_SMS_ATACHMENT_TYPES)
            }

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
                smsDetails.from = messageData.direction === Constants.REQ_TYPE_CHAT.WS_OUTGOING_MESSAGE ? finalMessageData.from : finalMessageData.to
                smsDetails.to = messageData.direction === Constants.REQ_TYPE_CHAT.WS_OUTGOING_MESSAGE ? finalMessageData.to : finalMessageData.from

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

            let firstname = localStorage.getItem(Params.WS_LOGGED_USER_FIRSTNAME);
            let lastname = localStorage.getItem(Params.WS_LOGGED_USER_LASTNAME);
            let loggedInUser = localStorage.getItem(Params.WS_LOGIN_USER);
            let siteid = localStorage.getItem(Params.WS_SITE_ID);

            if (messageData && messageData.group_code) {

                smsDetails.group_code = messageData.group_code
            } else {

                smsDetails.group_code = group_code
            }

            if (messageData && messageData.group_title) {

                smsDetails.group_title = messageData.group_title
            } else {

                smsDetails.group_title = group_title
            }

            smsDetails.group_uname = loggedInUser
            smsDetails.group_lname = lastname
            smsDetails.group_fname = firstname
            smsDetails.siteid = siteid



        } catch (e) {
            console.log(TAG + '[getGroupSMSFromToDetails] Error  -------- :: ' + e);
            return false
        }

        return true

    }

    function onPopUpCallBack(popData) {
        try {

            smsDetails = popData;

            console.log(TAG + "[onPopUpCallBack] popData :: " + popData);

            onClickSMSAction(smsDetails, REQ_TYPE_SMS_ACTION.ACTION_SEND_FROM_POPUP)
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

            if (actionType !== REQ_TYPE_SMS_ACTION.ACTION_SEND && fromUserDIDList.includes(fromNumber)) {

                smsDetails.to = toNumber
                smsDetails.from = fromNumber
                return true
            }

            // Get persist DID
            if (fromUserDIDList.length == 1) {

                fromNumber = fromUserDIDList[0];
            } else {

                let strPersistDID = localStorage.getItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID);

                console.log(TAG + "[getUserSMSFromToDetails] --- strPersistDID ::  " + strPersistDID);

                if (strPersistDID && strPersistDID.length > 0) {

                    fromNumber = strPersistDID
                } else {

                    showSMSPopUp();
                }
            }

            smsDetails.to = toNumber
            smsDetails.from = fromNumber

        } catch (e) {

            console.log('[getUserSMSFromToDetails] Error  -------- :: ' + e);
            return false
        }
        return true

    }

    const showSMSPopUp = () => {

        try {

            let fromUserDIDList = StreamsHandler.loadFromUserDIDs(); // Get User DID list
            if (fromUserDIDList === null || fromUserDIDList === undefined || fromUserDIDList.length <= 0) {

                console.log(TAG + '[showSMSPopUp] == USER DO NOT HAVE ASSIGN DIDS == ')
                return
            }

            let strPersistDID = localStorage.getItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID);
            let isEnableAlwaysUseDID = (strPersistDID && strPersistDID != null && strPersistDID * 1 > 0)

            if (isEnableAlwaysUseDID) {

                fromUserDIDList[0] = strPersistDID

                let finalList = new Set(fromUserDIDList);
                fromUserDIDList = [...finalList]

            }

            smsDetails.did_list = fromUserDIDList
            smsDetails.isEnableAlwaysUseDID = isEnableAlwaysUseDID
            smsDetails.from = fromUserDIDList[0]
            smsDetails.isToNumberNonEditable = true

            console.log(TAG + "[showSMSPopUp] --- smsDetails ::  " + JSON.stringify(smsDetails));

            setSMSPopupInputs(smsDetails)

            setIsModalVisible(true);  // Set modal visibility to true to show popup

        } catch (e) {
            console.log(TAG + '[showSMSPopUp] Error  -------- :: ' + e);
        }
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
                if (window.confirm(MessaageConstants.SMS_ALERT_MESSAGE_DELETE)) {

                    StreamsHandler.deleteSMSMessage(messageData)
                }
                return
            }

            if (actionType == REQ_TYPE_SMS_ACTION.ACTION_EDIT || actionType == REQ_TYPE_SMS_ACTION.ACTION_RESEND) {

                smsDetails.orgsmsgid = messageData.smsgid
                smsDetails.actionType = actionType
                messageData = JSON.parse(messageData.message);
            }

            let group_sms_status = (group_code && group_code !== undefined && parseInt(group_code) > 0);

            let sms_enable_status = localStorage.getItem(Constants.WS_KEY_SMS_ENABLED_STATUS);

            console.log("[onClickSMSAction] ------- sms_enable_status :: " + sms_enable_status + " ::  group_sms_status :: " + group_sms_status + ', actionType: ' + actionType);

            if (sms_enable_status == "false" || sms_enable_status == null) {

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

            if (actionType !== REQ_TYPE_SMS_ACTION.ACTION_SEND_FROM_POPUP) {

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

            }

            if (actionType === REQ_TYPE_SMS_ACTION.ACTION_SEND ||
                actionType === REQ_TYPE_SMS_ACTION.ACTION_RESEND ||
                actionType === REQ_TYPE_SMS_ACTION.ACTION_SEND_FROM_POPUP ||
                actionType === REQ_TYPE_SMS_ACTION.ACTION_EDIT) {

                if (smsBannerVisible) {
                    setSMSBannerVisible(false)
                }

                let textMessage
                if (actionType === REQ_TYPE_SMS_ACTION.ACTION_RESEND) {

                    textMessage = messageData.msg

                } else if (actionType === REQ_TYPE_SMS_ACTION.ACTION_EDIT) {

                    textMessage = editedMessage

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

                    StreamsHandler.addEditOrDeleteMessageList(sid, smsDetails.orgsmsgid, actionType)

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


    useEffect(() => {
        const theme = localStorage.getItem('selectedColorTheme');
        setSelectedColorTheme(theme);
        console.log(theme + "##############");
    }, [selectedColorTheme]);

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
                        <div className='ChatUserNameMain'>
                            {
                                group_title ? (ContactsHandler.getDisplayName(username) + "[" + group_title + "]") : ContactsHandler.getDisplayName(username)
                            }
                        </div>
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
                                    <SkeletonTheme baseColor={selectedColorTheme === "light" ? '#DBDBDB' : '#313131'} highlightColor={selectedColorTheme === "light" ? '#F1F1F1' : '#525252'}>
                                        <Skeleton width="200px" />
                                    </SkeletonTheme>
                                </div>
                            </div>
                            {Array(5).fill().map((_, index) => (
                                <div className="mb-5">
                                    <SkeletonTheme baseColor={selectedColorTheme === "light" ? '#DBDBDB' : '#313131'} highlightColor={selectedColorTheme === "light" ? '#F1F1F1' : '#525252'}>
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
                            <div className={`px-4 ${!images.length > 0 ? "messagesContainerMain" : "messagesContainer"}`} ref={setNewMessageRef}>

                                <div className='firstChat'>

                                    {loadMoreChats &&
                                        <div className="d-flex align-items-center justify-content-center p-3">
                                            <div class="spinner-border loading-icon" role="status"></div>
                                            <span class="loading-text fw-bold">Loading...</span>
                                        </div>
                                    }

                                    {messagesList && messagesList.length > 0 ?
                                        <>

                                            {messagesList.map((message, index) => {

                                                //console.log(TAG + 'message :: ' + JSON.stringify(message) + ' :: index :: ' + index);

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

                                                const loggedUser = localStorage.getItem(Params.WS_LOGIN_USER)
                                                let isIncomingMessage = (parsedMessage && parsedMessage.direction && parsedMessage.direction * 1 ===
                                                    Constants.REQ_TYPE_CHAT.WS_INCOMING_MESSAGE) || false

                                                let messageFrom = (parsedMessage && parsedMessage.group_uname) ? parsedMessage.group_uname : (isIncomingMessage ? message.phnumber : loggedUser)
                                                const messageContent = parsedMessage?.msg || [];

                                                let msg_time = message.latest_time ? message.latest_time : message.messagetime;
                                                const messageDate = Utils.getFormatedDate(msg_time, Constants.DATE_FORMATS.WS_HEADER_DATE);

                                                const is_smsgid_available = !(!message.smsgid || message.smsgid === '' || message.smsgid === undefined);

                                                const dateHeader = previousDate !== messageDate;

                                                if (dateHeader) {

                                                    previousDate = messageDate;
                                                }

                                                let unReadPos = messagesList.length - (unread_count * 1);
                                                //console.log('unReadPos --------- ' + unReadPos + " :: unread_count :: " + unread_count);

                                                return (

                                                    <>

                                                        {dateHeader &&
                                                            (
                                                                <div class="date-container">
                                                                    <hr class="date-divider" />
                                                                    <div class="date-display"><span>{messageDate}</span></div>
                                                                </div>
                                                            )}

                                                        {index === (unReadPos * 1) &&

                                                            (
                                                                <div className='d-flex align-items-center justify-content-center my-3' ref={unreadRef}>
                                                                    <div className='text-center p-2 px-3 w-auto rounded-2' style={{ color: "#000", backgroundColor: "#c2ffc9", fontSize: 15, textTransform: "uppercase", fontWeight: 600 }}>
                                                                        Unread Messages [{unread_count}]
                                                                    </div>
                                                                </div>
                                                            )

                                                        }


                                                        <div key={index} ref={(el) => (messagesRef.current[index] = el)} className={`chatComponent py-3 ${index === 0 && !images.length > 0 ? "firstChat" : ""}  ${index === highlightIndex ? "highlightComponent" : ""}`}>
                                                            <div className='mb-4'>
                                                                <div className='d-flex align-items-start w-100'>
                                                                    <img src={Profile} alt={message.message.from}
                                                                        className='rounded-4 profileImage'
                                                                    />
                                                                    <div className='ps-3 w-100'>
                                                                        <div>

                                                                            <div className="d-flex align-items-center justify-content-between">
                                                                                <div className="d-flex">
                                                                                    <p className='ChatUserNameChat'>{ContactsHandler.getDisplayName(messageFrom)}</p>
                                                                                    {is_smsgid_available &&
                                                                                        (
                                                                                            <p className='text-secondary ps-2'>{Utils.getFormatedDate(msg_time, Constants.DATE_FORMATS.WS_CHAT_MESSAGE_DATE)}</p>
                                                                                        )
                                                                                    }

                                                                                </div>
                                                                                {!is_smsgid_available &&
                                                                                    (
                                                                                        <div className="cursor-pointer me-3 text-small">
                                                                                            <img src={TimerIcon} alt="" className="replyIcons" />
                                                                                        </div>
                                                                                    )
                                                                                }
                                                                            </div>

                                                                            {/* Display message content */}

                                                                            <p>{
                                                                                (() => {

                                                                                    //console.log("messageFrom =22==" + messageFrom + " :: messageTo :: " + messageTo + " :: messageContent :: " + JSON.stringify(messageContent));

                                                                                    if (message.msgtype * 1 === IMConstants.WS_IM_SMS ||
                                                                                        message.msgtype * 1 === IMConstants.WS_IM_MMS) {

                                                                                        return ChatComponents.displaySMS_MMS_Message(message, onClickSMSAction, editedMessage, setEditedMessage, editedsmsgid, setEditedsmsgid)

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
                                                    </>

                                                );
                                            })}

                                        </> : (
                                            <>
                                                <h1>Hi {localStorage.getItem("LOGIN_USER")?.split('@')[0]} !!!</h1>
                                                {

                                                    (user_data && user_data !== null && user_data !== undefined) ?
                                                        <p className='p-3 mb-3'>
                                                            There is no message history in this group. Kindly hover on the Group and click the Plus [+] icon to Send SMS Message.
                                                        </p>
                                                        :
                                                        <p>
                                                            Send SMS Message to <b>{username}</b> from { }
                                                        </p>
                                                }
                                            </>
                                        )}

                                </div>
                            </div>
                        </>
                    )}


                    <div className="MessageTextAreaContainer" >

                        {/* <div className="unreadJump d-none" onClick={''}>
                            <div>
                                <MDBIcon fas icon="arrow-down" className='me-2' />
                                5 unread messages
                            </div>
                        </div> */}

                        {/* SMS Banner starts */}
                        <div>
                            {smsBannerVisible && (
                                ChatComponents.showSMSBanner(
                                    smsDetails,
                                    setSMSBannerVisible,
                                    showSMSPopUp
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
                                        accept={Constants.ALLOWD_MMS_TYPES}
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
                    {isModalVisible &&
                        (() => {

                            const group_title = (user_data.group_title && user_data.group_title.length > 0) ? "[" + user_data.group_title + "]" : ''

                            return ChatComponents.showSMSPopUp(
                                MessaageConstants.SMS_ALERT_GROUP_SMS_TO_FROM_NUMBER_SELECTION + group_title,  // Title for the modal
                                smsPopupInputs,  // To and From number params
                                setSMSPopupInputs, // update To and From number params
                                isModalVisible,  // Modal visibility state
                                setIsModalVisible,  // Function to change modal visibility
                                onPopUpCallBack  // Callback or data handler
                            )
                        })
                    }
                </div>
                {/* SMS popup Ends */}

            </MDBCard >

        </>
    )
}

export default ChatsView
