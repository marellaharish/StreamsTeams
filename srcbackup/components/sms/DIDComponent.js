import React, { useEffect, useState, useRef } from 'react'
import { MDBBadge, MDBCard, MDBCardBody, MDBCardHeader, MDBIcon, MDBInput } from 'mdb-react-ui-kit'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { isAndroid, isIOS, isMobile } from 'react-device-detect'

import Constants from "../../config/Constants"
import evntEmitter from "../../classes/utils/EvntEmitter"
import EmitterConstants from "../../config/EmitterConstants"
import MessageHandler from "../../classes/chat/MessageHandler"
import SettingsHandler from "../../classes/settings/SettingsHandler"
import { SMS } from '../../assets/images'
import Utils from '../../classes/utils/util'

let loadMoreStatus = false;
let group_code;

let TAG = "[DIDComponent] :: "
const DIDComponent = ({ onClickSMSDID }) => {

    const [groupDIDsList, setGroupDIDsList] = useState([]);
    const [selectedDID, setSelectedDID] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadMore, setLoadMore] = useState(false);
    const [isNoMoreData, setNoMoreData] = useState(false);

    const containerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {

        console.log('[DIDComponent].useEffect() in statement ----');

        unRegisterEmitters();
        registerEmitters();

        //onLoad();

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', debouncedHandleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', debouncedHandleScroll);
            }
        };

    }, []);

    useEffect(() => {

        if (!location.state) return;

        if (!isMobile) return;

        console.log(TAG + "[useEffect].[location.state] isMobile :: " + isMobile + " :: location :: " + JSON.stringify(location));

        let groupCode = location.state;

        const groupDIDList = MessageHandler.getSMSGroupDIDs(groupCode);

        console.log(TAG + "[useEffect].[location.state] group_code: " + groupCode + " :: groupDIDList: " + groupDIDList.length);

        setIsLoading(false);
        setGroupDIDsList(groupDIDList);

    }, [location.state]);

    const handleScroll = () => {

        try {

            if (loadMoreStatus == true) {

                return;
            }

            const container = containerRef.current;
            if (container) {

                const scrollTop = container.scrollTop; // scrolled content from the top
                const scrollHeight = container.scrollHeight; // Total height of the scrollable content
                const clientHeight = container.clientHeight; // Height of the visible part of the container

                console.log("[handleScroll] --- totalHeight :: " + (scrollTop + clientHeight) + " :: scrollHeight :: " + scrollHeight + " :: scrollTop :: " + scrollTop + " :: clientHeight :: " + clientHeight + " :: currentHeight :: " + (scrollTop + clientHeight));

                if ((scrollTop + clientHeight) > (scrollHeight - 10) && scrollTop !== 0) { // Added a small buffer of 5px to account for rounding issues

                    loadMoreData();
                }
            }

        } catch (e) {

            console.log('[handleScroll] Error :: ' + e);
        }

    };

    const debounce = (func, wait) => {

        let timeout;
        return function (...args) {

            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const debouncedHandleScroll = debounce(handleScroll, 600)

    const loadMoreData = () => {

        try {

            setLoadMore(true);

            if (loadMoreStatus == true) {

                //console.log("[loadMoreData] ---DONT SEND LOAD REQUEST AS IT IS ALREADY IN PROGRESS--- ");
                return;
            }

            console.log("[loadMoreData] ------ loadMoreStatus ::  " + loadMoreStatus);

            loadMoreStatus = true;

            SettingsHandler.loadSMSMGroupDIDs(group_code, '', '');

        } catch (e) {

            console.log('[loadMoreData] Error :: ' + e);
        }

    };


    const unRegisterEmitters = () => {

        try {

            evntEmitter.removeAllListeners(EmitterConstants.EMMIT_ON_SMS_GROUP_DIDS_RECEIVED);
        } catch (e) {

            console.log('[unRegisterEmitters] Error :: ' + e);
        }
    }

    const registerEmitters = () => {

        try {

            evntEmitter.on(EmitterConstants.EMMIT_ON_SMS_GROUP_DIDS_RECEIVED, reloadSMSGroupDIDs);

        } catch (e) {

            console.log('[registerEmitters] Error :: ' + e);
        }
    }

    const reloadSMSGroupDIDs = (group_details) => {

        try {

            console.log(TAG + "[reloadSMSGroupDIDs] =========  group_details :: " + JSON.stringify(group_details));

            group_code = group_details.group_code;

            var group_dids = MessageHandler.getSMSGroupDIDs(group_details.group_code);

            console.log(TAG + '[reloadSMSGroupDIDs] group_dids -- ' + JSON.stringify(group_dids));

            setGroupDIDsList([...group_dids]);

            let index = group_dids.findIndex(object => object.phnumber == group_details.phnumber)
            console.log(TAG + '[reloadSMSGroupDIDs] index :: ' + index);

            /*
                When user select a specific group select the first DID from the list and show the chat messages. 
                 But for Mobile we should not select/redirect to Chat component
            */
            if (!isMobile && !group_details.is_reload) {

                onClickSpecificSMSDID(group_dids[index]);
            }

            setIsLoading(false);
            setLoadMore(false);
            loadMoreStatus = false;

        } catch (e) {

            console.log('[reloadSMSGroupDIDs] Error :: ' + e);
        }
    }

    const onClickSpecificSMSDID = (member_data) => {

        try {

            console.log('[onClickSpecificSMSDID] ---- Member details :: ' + JSON.stringify(member_data));

            setSelectedDID(member_data.phnumber);

            if (isMobile || isIOS || isAndroid) {

                navigate('/chat', { state: { member_data } });
            } else {

                // Calling the passed function to update ChatsView's data in Home.js
                onClickSMSDID(member_data);
            }

            const latestMessage = JSON.parse(member_data.latest_message);

            SettingsHandler.loadSMSMessages(latestMessage.group_code, member_data.phnumber, Constants.SMS_CHAT_TYPES.WS_GROUP_SMS, {});

        } catch (e) {

            console.log('[onClickSpecificSMSDID] Error :: ' + e);
        }
    }

    const handleBackClick = () => {

        navigate("/home");
    };

    return (

        <>
            <div className='shadow-3 me-1 rounded-2'>

                <MDBCard>
                    <MDBCardHeader>
                        <div className='d-flex align-items-center'>
                            {isMobile &&
                                <div onClick={handleBackClick} className='me-3'>
                                    <MDBIcon fas icon="arrow-left" />
                                </div>
                            }
                            <div className='ChatUserNameMain'>Recents</div>
                        </div>

                    </MDBCardHeader>

                    <MDBCardBody className="groupDID-view-container py-3 px-2" ref={containerRef}>

                        {isLoading ? (
                            Array(11).fill().map((_, index) => (
                                <div className="mb-3">
                                    <SkeletonTheme>
                                        <Skeleton width="80%" />
                                        <Skeleton width="100%" />
                                    </SkeletonTheme>
                                </div>
                            ))
                        ) : (
                            <>
                                {groupDIDsList.map((member, index) => {

                                    console.log("member --- DID info ---- index :: " + index + " :: " + JSON.stringify(member) + " :: selectedDID :: " + selectedDID);

                                    return (

                                        <div key={index} className={`d-flex align-items-center p-2 cursor-pointer didBuddy mb-1 ${(selectedDID === member.phnumber) ? 'activeItem' : ''}`}
                                            onClick={() => { onClickSpecificSMSDID(member) }}>

                                            <div className="d-flex flex-column w-100">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <p className='ChatUserName'>{member.phnumber}</p>
                                                    <p className='text-secondary text-small'>{Utils.getFormatedDate(member.latest_time, Constants.DATE_FORMATS.WS_GROUP_DID_DATE)}</p>
                                                </div>
                                                <div className='d-flex'>
                                                    <img src={SMS} alt="" style={{ width: 18, marginRight: 5 }} />
                                                    <div className="w-75">
                                                        <p className='ellipsis'>

                                                            {(() => {
                                                                try {

                                                                    const latestMessage = JSON.parse(member.latest_message);
                                                                    const msg = latestMessage.msg;

                                                                    // Check if 'msg' is an array
                                                                    if (Array.isArray(msg)) {
                                                                        return 'Picture'
                                                                    } else {
                                                                        return msg; // Return the message directly if it's not an array
                                                                    }

                                                                } catch (e) {

                                                                    console.error('Error parsing latest_message:', e);
                                                                    return 'Invalid message format'; // Fallback message
                                                                }
                                                            })()}
                                                        </p>
                                                    </div>

                                                    {member.unread_count > 0 && (
                                                        <MDBBadge color='success' pill>
                                                            {member.unread_count}
                                                        </MDBBadge>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                        {loadMore && (

                            <div className="loadContainer">
                                <div class="customLoader">
                                </div>
                                <span className="ms-2">Loading...</span>
                            </div>
                        )}

                    </MDBCardBody>
                </MDBCard>

            </div >
        </>
    )
}

export default DIDComponent