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
let phnumber;

let TAG = "[DIDComponent] :: "
const DIDComponent = ({ onClickSMSDID, groupData }) => {

    const [groupDIDsList, setGroupDIDsList] = useState([]);
    const [selectedDID, setSelectedDID] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadMore, setLoadMore] = useState(false);
    const [isNoMoreData, setNoMoreData] = useState(false);
    const [selectedColorTheme, setSelectedColorTheme] = useState('dark');

    const containerRef = useRef(null);
    const messagesRef = useRef([]);

    const navigate = useNavigate();
    const location = useLocation();

    //=============================       useEffect's     ==================================

    useEffect(() => {

        try {

            console.log(TAG + "useEffect() in statement ---- groupData :: " + JSON.stringify(groupData));

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

        } catch (e) {

            console.log(TAG + "[useEffect] in statement Error " + e);
        }

    }, []);

    useEffect(() => {

        try {

            console.log(TAG + "[useEffect] in group_data ---------------");

            groupData = groupData;

            initGroupData();

        } catch (e) {

            console.log(TAG + "[useEffect] in group_data Error " + e);
        }

    }, [groupData]);

    //For Moblies we will use this state useEffect().
    useEffect(() => {

        try {

            if (!location.state) return;

            if (!isMobile) return;

            console.log(TAG + "[useEffect].[location.state] isMobile :: " + isMobile + " :: location :: " + JSON.stringify(location));

            if (location.state.member && location.state.member.message) {

                groupData = location.state.member;
                group_code = JSON.parse(location.state.member.message).group_code;
            }

            initGroupData();

        } catch (e) {

            console.log(TAG + "[useEffect].[location.state] Error " + e);
        }

    }, [location.state]);

    useEffect(() => {

        console.log(TAG + 'useEffect(selectedDID) did : ' + selectedDID);

        if (messagesRef.current && selectedDID && groupDIDsList && groupDIDsList.length > 0) {

            let index = groupDIDsList.findIndex(object => (object.phnumber * 1) === (selectedDID * 1))

            if (index && index >= 0 && messagesRef.current[index] && containerRef.current) {

                const child = messagesRef.current[index];
                const container = containerRef.current;
                const offsetTop = child.offsetTop - container.offsetTop;

                container.scrollTop = offsetTop - container.clientHeight / 2 + child.clientHeight / 2;
            }

        }

    }, [selectedDID])

    //=============================      GENERAL Functinos     ==================================

    const initParams = () => {

        try {

            group_code = '';
            phnumber = '';

        } catch (e) {

            console.log(TAG + "[initParams] Error " + e);
        }
    }

    const initGroupData = () => {

        try {

            initParams();

            unRegisterEmitters();
            registerEmitters();

            if (groupData) {

                group_code = groupData.message ? JSON.parse(groupData.message).group_code : groupData.code;

                if (groupData.phnumber) {

                    phnumber = groupData.phnumber;
                }

                console.log(TAG + '[initGroupData]  grop_code :: ' + group_code);

                loadGroupSMSDIDs();
            }

        } catch (e) {

            console.log(TAG + "[initGroupData] Error " + e);
        }
    }

    const loadGroupSMSDIDs = () => {

        try {

            if (!group_code || group_code == null) {

                console.log(TAG + "[loadGroupSMSDIDs] groupCode IS NOT FOUND");
                return;
            }

            const groupDIDList = MessageHandler.getSMSGroupDIDs(group_code);

            console.log(TAG + "[loadGroupSMSDIDs] group_code: " + group_code + " :: groupDIDList: " + groupDIDList.length + " :: phnumber :: " + phnumber + " :: groupData :: " + JSON.stringify(groupData));

            if (groupDIDList.length > 0) {

                setIsLoading(false);
                setGroupDIDsList(groupDIDList);

                if (groupDIDList[0].phnumber) {//If we select Group, as there are no messages showing in Groups we cannot send 'phnumber', so select the 1st DID.

                    phnumber = groupDIDList[0].phnumber;
                }

                let message_obj = groupDIDList.find(object => object.phnumber == phnumber)
                console.log(TAG + '[loadGroupSMSDIDs] message_obj :: ' + JSON.stringify(message_obj));

                if (!isMobile) {

                    onClickSpecificSMSDID(message_obj);
                }

            } else {

                setIsLoading(true);
            }

            SettingsHandler.loadSMSMGroupDIDs(group_code, phnumber, '', false);


        } catch (e) {

            console.log('[loadGroupSMSDIDs] Error :: ' + e);
        }
    }

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

            console.log("[loadMoreData] ------ loadMoreStatus ::  " + loadMoreStatus + " :: groupData : " + JSON.stringify(groupData));

            loadMoreStatus = true;

            SettingsHandler.loadSMSMGroupDIDs(group_code, '', '', true);

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

            console.log(TAG + "[reloadSMSGroupDIDs] ========= groupData ::" + JSON.stringify(groupData) + " :: group_details From server :: " + JSON.stringify(group_details));

            group_code = group_details.group_code;
            phnumber = group_details.phnumber;

            if (groupData && groupData.code) {

                if ((group_details.group_code * 1) != (groupData.code * 1)) {

                    console.log(TAG + "[reloadSMSGroupDIDs] OOOOOOOPPPPSSS!!! CURRENT WINDOW GROUP CODE IS NOT MATCHED WITH THE SERVER RESPONSE GROUP CODE.");
                    return
                }
            }

            var group_dids = MessageHandler.getSMSGroupDIDs(group_details.group_code);

            console.log(TAG + '[reloadSMSGroupDIDs] group_dids -- ' + JSON.stringify(group_dids));

            setGroupDIDsList([...group_dids]);

            if ((!phnumber || phnumber == null) && group_dids && group_dids.length > 0 && group_dids[0].phnumber) {//If we select Group, as there are no messages showing in Groups we cannot send 'phnumber', so select the 1st DID.

                phnumber = group_dids[0].phnumber;
            }

            let message_obj = group_dids.find(object => object.phnumber == phnumber)
            console.log(TAG + '[reloadSMSGroupDIDs] selected DID  message_obj :: ' + JSON.stringify(message_obj));

            /*
                When user select a specific group select the first DID from the list and show the chat messages. 
                 But for Mobile we should not select/redirect to Chat component
            */
            if (message_obj) {

                if (!isMobile && !group_details.is_reload) {

                    onClickSpecificSMSDID(message_obj);
                } else {

                    if (phnumber != message_obj.phnumber) {

                        //setSelectedDID(message_obj.phnumber);//This is to Select the Specific DID in the DID Component.
                    }

                }
            }


            setIsLoading(false);
            setLoadMore(false);
            loadMoreStatus = false;

        } catch (e) {

            console.log('[reloadSMSGroupDIDs] Error :: ' + e);
        }
    }

    //This function will Highlite the Specific DID and open the Chat.js
    const onClickSpecificSMSDID = (member_data) => {

        try {

            console.log('[onClickSpecificSMSDID] ---- Member details :: ' + JSON.stringify(member_data));

            setSelectedDID(member_data.phnumber);//This is to Select the Specific DID in the DID Component.

            //Bellow code is to show the Chat.js upon clicking the Specific DID.
            if (isMobile || isIOS || isAndroid) {

                navigate('/chat', { state: { member_data } });
            } else {

                // Calling the passed function to update ChatsView's data in Home.js
                onClickSMSDID(member_data);
            }

            //const latestMessage = JSON.parse(member_data.message);

            //SettingsHandler.loadSMSMessages(latestMessage.group_code, member_data.phnumber, Constants.SMS_CHAT_TYPES.WS_GROUP_SMS, {});

        } catch (e) {

            console.log('[onClickSpecificSMSDID] Error :: ' + e);
        }
    }

    const handleBackClick = () => {

        navigate("/home");
    };



    useEffect(() => {
        const theme = localStorage.getItem('selectedColorTheme');
        setSelectedColorTheme(theme);
        console.log(theme + "##############");
    }, [selectedColorTheme]);


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
                                    <SkeletonTheme baseColor={selectedColorTheme === "light" ? '#DBDBDB' : '#313131'} highlightColor={selectedColorTheme === "light" ? '#F1F1F1' : '#525252'}>
                                        <Skeleton width="80%" />
                                        <Skeleton width="100%" />
                                    </SkeletonTheme>
                                </div>
                            ))
                        ) : (
                            <>
                                {groupDIDsList.map((member, index) => {

                                    //console.log("member --- DID info ---- index :: " + index + " :: " + JSON.stringify(member) + " :: selectedDID :: " + selectedDID);
                                    //console.log("selectedDID ------" + selectedDID + " :: member :: " + JSON.stringify(member));
                                    return (

                                        <div key={index}
                                            ref={(el) => (messagesRef.current[index] = el)}
                                            className={`d-flex align-items-center p-2 cursor-pointer didBuddy mb-1 ${((selectedDID * 1) === (member.phnumber * 1)) ? 'activeItem' : ''}`}
                                            onClick={() => { onClickSpecificSMSDID(member) }}>

                                            <div className="d-flex flex-column w-100">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <p className='ChatUserName'>{member.phnumber}</p>
                                                    <p className='dateTextNew text-small'>{Utils.getFormatedDate(member.latest_time, Constants.DATE_FORMATS.WS_GROUP_DID_DATE)}</p>
                                                </div>
                                                <div className='d-flex pt-1'>
                                                    <img src={SMS} alt="" style={{ width: 18, marginRight: 5 }} />
                                                    <div className="w-75">
                                                        <p className='ellipsis'>

                                                            {(() => {
                                                                try {

                                                                    const latestMessage = JSON.parse(member.message);
                                                                    const msg = latestMessage.msg;

                                                                    // Check if 'msg' is an array
                                                                    if (Array.isArray(msg)) {
                                                                        return 'Picture'
                                                                    } else {
                                                                        return msg; // Return the message directly if it's not an array
                                                                    }

                                                                } catch (e) {

                                                                    console.error('Error parsing message:', e);
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

                            <div className="loadContainer  pb-3 text-center">
                                <MDBIcon className='loading-icon' fas icon='spinner' size='2x' spin />
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