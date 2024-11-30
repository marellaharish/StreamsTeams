import { MDBBtn, MDBCard, MDBCardBody, MDBCardHeader, MDBCardText, MDBCardTitle, MDBIcon, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane } from 'mdb-react-ui-kit'
import React, { useState, useEffect } from 'react'
import { SearchReasultDataFiles, SearchReasultDataTest } from '../../config/Constants';
import { AudioSquareSvg, ExcelSvg, HtmlSvg, ImgBoxSvg, NodeSvg, PdfSvg, VideoSquareSvg, WordSvg, ZipDocumentSvg, Profile, Group } from '../../assets/images';

import MessageHandler from "../../classes/chat/MessageHandler";
import evntEmitter from "../../classes/utils/EvntEmitter";
import EmitterConstants from "../../config/EmitterConstants";
import Constants from "../../config/Constants";
import Utils from '../../classes/utils/util';
import ContactsHandler from '../../classes/contacts/ContactsHandler'
import { type } from '@testing-library/user-event/dist/type';
import IMConstants from "../../config/IMConstants"
import Params from "../../config/Params"


let TAG = '[SearchReasult.js].';

const SearchReasult = ({ onClickSearch, onClose }) => {
    const [basicActive, setBasicActive] = useState('tab1');

    const [messageSearchList, setMessageSearchList] = useState([]);
    const [messageSearchListCount, setMessageSearchListCount] = useState(0);

    let searchTerm = "hello";

    //==========================        USE EFFECT'S()   =================================
    useEffect(() => {

        unRegisterEmitters();
        registerEmitters();

    }, []);

    //==================================== EVENTS REGISTER ==================================

    const unRegisterEmitters = () => {

        try {

            evntEmitter.removeAllListeners(EmitterConstants.EMMIT_ON_SEARCHED_MESSAGE_RECEIVED);
        } catch (e) {

            console.log(TAG + '[unRegisterEmitters] Error :: ' + e);
        }
    }


    const registerEmitters = () => {
        try {

            console.log(TAG + '[registerEmitters] -------------');
            evntEmitter.on(EmitterConstants.EMMIT_ON_SEARCHED_MESSAGE_RECEIVED, reloadMessageSearchList);
        } catch (e) {

            console.log(TAG + '[registerEmitters] Error :: ' + e);
        }
    }



    //==========================        General functions   =================================

    const handleBasicClick = (value) => {
        if (value === basicActive) {
            return;
        }
        setBasicActive(value);
    };

    const [isVisible, setIsVisible] = useState(true);

    const handleClick = () => {
        onClose(false)
    };



    // Function to get the corresponding image for a file type
    const getFileTypeImage = (fileType) => {
        switch (fileType) {
            case 'Node':
                return NodeSvg;
            case 'Html':
                return HtmlSvg;
            case 'Excel':
                return ExcelSvg;
            case 'Video':
                return VideoSquareSvg;
            case 'Word':
                return WordSvg;
            case 'Audio':
                return AudioSquareSvg;
            case 'ZipDocument':
                return ZipDocumentSvg;
            case 'ImgBox':
                return ImgBoxSvg;
            case 'Pdf':
                return PdfSvg;
            default:
                return null; // If fileType is unrecognized
        }
    };

    const reloadMessageSearchList = (data) => {
        try {

            console.log(TAG + "[reloadMessageSearchList] ========= data :: " + JSON.stringify(data));

            if (data && data.searchData && data.searchData.searchKeyword) {
                searchTerm = data.searchData.searchKeyword;
            }

            var messageSearchListData = MessageHandler.getSearchList(Constants.SEARCH_MESSAGES_TYPE.MESSAGE_SEARCH_LIST);
            var messageSearchListCountData = MessageHandler.getSearchCount(Constants.SEARCH_MESSAGES_TYPE.MESSAGE_SEARCH_LIST_COUNT);

            console.log(TAG + "[reloadMessageSearchList] :: messageSearchList :: " + messageSearchListData.length);

            setMessageSearchList(messageSearchListData);
            setMessageSearchListCount(messageSearchListCountData[0].cnt);


        } catch (e) {
            console.log(TAG + '[reloadMessageSearchList] Error :: ' + e);
        }
    }

    const onClickSearchResult = (search_data) => {

        try {
            console.log(TAG + "[onClickSearchResult] === search_data :: " + JSON.stringify(search_data));
            search_data.isSearchItem = true;
            onClickSearch(search_data);

        } catch (e) {
            console.log('[onClickSearchResult] Error :: ' + e);

        }

    }

    return (
        <>
            {isVisible &&
                <MDBCard className='rounded-0 shadow-0 searchCardContainer'>
                    {/* <MDBCardHeader className='rounded-0'>
                        <div className='d-flex align-items-center justify-content-between'>
                            <div className='userNameMain'>Search Results</div>
                            <div className="cursor-pointer px-2" onClick={handleClick}>
                                <MDBIcon fas icon="times" />
                            </div>
                        </div>

                    </MDBCardHeader> */}
                    <MDBCardBody className='p-0 rounded-0'>
                        <MDBTabsContent>
                            {messageSearchList.map((member, index) => {

                                const isAttachment = (member && member.msgtype === IMConstants.WS_IM_MMS);
                                const isSMSorMMS = (member && (member.msgtype === IMConstants.WS_IM_MMS || member.msgtype === IMConstants.WS_IM_SMS));

                                let messageContent;
                                let displayName = "";
                                let senderReceiverName = "";
                                let fileType = "";
                                let displayTime = Utils.getFormatedDate(member.messagetime);
                                let loggedInUser = localStorage.getItem(Params.WS_LOGIN_USER);
                                let parsedMessage;

                                if (isSMSorMMS) {

                                    if (!Utils.isObject(member.message)) {

                                        messageContent = member.message;
                                    } else {

                                        parsedMessage = JSON.parse(member.message);
                                        messageContent = parsedMessage.msg;
                                    }

                                    if (isAttachment) { //MMS

                                        displayName = messageContent[0].filename;
                                        fileType = messageContent[0].extension;
                                    } else { // SMS

                                        displayName = ContactsHandler.getMatchedContactName(member.phnumber);

                                        if (!displayName) {

                                            displayName = member.phnumber;
                                        }
                                    }

                                    if (parsedMessage.group_code) {

                                        let group_title = parsedMessage.group_title ? `: [${parsedMessage.group_title}]` : "";

                                        let group_fname = parsedMessage.group_fname ? parsedMessage.group_fname : "";
                                        let group_lname = parsedMessage.group_lname ? parsedMessage.group_lname : "";

                                        let formatedUserName = (group_fname.length > 0) ? (group_fname + " " + group_lname) : group_lname;

                                        if (formatedUserName.length == 0) {

                                            formatedUserName = ContactsHandler.getMatchedContactName(messageContent.phnumber);
                                        }

                                        if (parsedMessage.group_uname === loggedInUser) {

                                            senderReceiverName = `You ${group_title}`;
                                        } else {

                                            senderReceiverName = `${formatedUserName} ${group_title}`;
                                        }

                                    } else {

                                        senderReceiverName = displayName === loggedInUser ? "You: " : displayName + ": ";
                                    }

                                    messageContent = messageContent.split(new RegExp(`(${searchTerm})`, 'gi'));
                                }

                                return (
                                    <div key={index} className="d-flex align-items-start cursor-pointer didBuddy my-2 p-2" onClick={() => { onClickSearchResult(member) }}>
                                        <img
                                            src={isAttachment ? getFileTypeImage(fileType) : Profile}
                                            alt={displayName}
                                            className='profileImageUserSearch'
                                        />

                                        <div className="w-90 d-flex flex-column ps-3 pe-2 ps-2">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <p className='ChatUserName' style={{ maxWidth: "100%" }}>
                                                    {
                                                        (() => {
                                                            console.log("[displayname] :: " + displayName);
                                                            return displayName;
                                                        })()
                                                    }

                                                </p>
                                                <div className='d-flex flex-row align-items-center'>
                                                    <p className='text-secondary dateTextNew'>
                                                        {displayTime}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className='searchReasultText'>
                                                {!isAttachment ? (
                                                    <>
                                                        {senderReceiverName}: {messageContent.map((part, i) => (
                                                            part.toLowerCase() === searchTerm.toLowerCase() ? (
                                                                <strong key={i} className='text-dark' style={{ backgroundColor: "#f8f9a5" }}>{part}</strong>
                                                            ) : (
                                                                part
                                                            )
                                                        ))}
                                                    </>
                                                ) : (
                                                    `shared By : ${senderReceiverName}`
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </MDBTabsContent>
                    </MDBCardBody>
                </MDBCard>
            }

        </>
    )
}

export default SearchReasult
