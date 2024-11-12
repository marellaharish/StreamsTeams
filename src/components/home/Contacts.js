import { MDBChip, MDBIcon, MDBTabsPane } from 'mdb-react-ui-kit'
import React, { useEffect, useRef, useState } from 'react'
import { Iconsearch, Profile } from '../../assets/images'
import MessageHandler from "../../classes/chat/MessageHandler"
import ContactsHandler from "../../classes/contacts/ContactsHandler"
import SettingsHandler from "../../classes/settings/SettingsHandler"
import EvntEmitter from '../../classes/utils/EvntEmitter'
import Constants from "../../config/Constants"
import EmitterConstants from '../../config/EmitterConstants'

let loadMoreStatus = false;
let selectedTabIndex = Constants.REQ_CONTACTS_TAB_TYPE.COMPANY_CONTACTS;

let TAG = "[Contacts.js]."
const Contacts = ({ contacts_tab_selection }) => {

    const [selectedTab, setSelectedTab] = useState('company');
    const [searchString, setSearchString] = useState("");

    const [loadMore, setLoadMore] = useState(false);
    const [loadingNew, setLoadingNew] = useState(true);

    const [contactsList, setContactsList] = useState([]);

    const containerRef = useRef(null);

    //=============================       useEffect's     ==================================

    useEffect(() => {

        try {

            console.log(TAG + 'useEffect() in statement ----');

            unRegisterEmitters();
            registerEmitters();

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

            console.log(TAG + 'useEffect() Error :: ' + e);
        }

    }, []);

    useEffect(() => {

        try {
            console.log(TAG + 'useEffect().contacts_tab_selection() ----');

            init();

        } catch (e) {

            console.log(TAG + 'useEffect().contacts_tab_selection Error :: ' + e);
        }

    }, [contacts_tab_selection]);


    //=============================      GENERAL Functinos     ==================================
    const init = () => {

        try {

            SettingsHandler.loadContacts(selectedTabIndex, '', false);

        } catch (e) {

            console.log(TAG + '[init].useEffect() Error :: ' + e);
        }
    }

    const unRegisterEmitters = () => {

        try {

            EvntEmitter.removeAllListeners(EmitterConstants.EMMIT_ON_CONTACTS_RECEIVED);
        } catch (e) {

            console.log(TAG + '[unRegisterEmitters] Error :: ' + e);
        }
    }

    const registerEmitters = () => {

        try {

            EvntEmitter.on(EmitterConstants.EMMIT_ON_CONTACTS_RECEIVED, reloadContacts);

        } catch (e) {

            console.log(TAG + '[registerEmitters] Error :: ' + e);
        }
    }

    const handleTabSelect = (value) => {

        try {

            if (value === selectedTab) {
                return;
            }

            setLoadingNew(false);
            setSelectedTab(value);

            console.log('[handleTabSelect] ---- tab :: ' + value);

            if (value == 'company') {

                selectedTabIndex = Constants.REQ_CONTACTS_TAB_TYPE.COMPANY_CONTACTS;

            } else if (value == 'other') {

                selectedTabIndex = Constants.REQ_CONTACTS_TAB_TYPE.OTHER_STREAMS_CONTACTS;

            } else if (value == 'imported') {

                selectedTabIndex = Constants.REQ_CONTACTS_TAB_TYPE.IMPORTED_CONTACTS;

            }

            var contacts_data = MessageHandler.getContacts(selectedTabIndex);

            console.log(TAG + "[handleTabSelect] contacts_data :: " + contacts_data.length);

            if (contacts_data.length == 0) {

                setLoadingNew(true);

                console.log("[handleTabSelect] ---------- Send server request to load data. Tab Index :: " + selectedTabIndex);

                SettingsHandler.loadContacts(selectedTabIndex, '', false);
            }

            setContactsList(contacts_data);

        } catch (e) {

            console.log('[handleTabSelect] Error :: ' + e);
        }

    };

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

                console.log(TAG + "[handleScroll] --- totalHeight :: " + (scrollTop + clientHeight) + " :: scrollHeight :: " + scrollHeight + " :: scrollTop :: " + scrollTop + " :: clientHeight :: " + clientHeight + " :: currentHeight :: " + (scrollTop + clientHeight));

                if ((scrollTop + clientHeight) > (scrollHeight - 10) && scrollTop !== 0) { // Added a small buffer of 5px to account for rounding issues

                    loadMoreData();
                }
            }

        } catch (e) {

            console.log(TAG + '[handleScroll] Error :: ' + e);
        }

    };

    const debounce = (func, wait) => {

        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const debouncedHandleScroll = debounce(handleScroll, 600);

    const loadMoreData = () => {

        try {

            setLoadMore(true);

            if (loadMoreStatus == true) {

                return;
            }

            console.log(TAG + "[loadMoreData] ------ loadMoreStatus ::  " + loadMoreStatus);

            loadMoreStatus = true;

            SettingsHandler.loadContacts(selectedTabIndex, '', true);

        } catch (e) {

            console.log(TAG + '[loadMoreData] Error :: ' + e);
        }

    };

    const reloadContacts = (extra_data) => {

        try {

            let contactType = selectedTabIndex;
            if (extra_data) {

                console.log(TAG + "[reloadContacts] data = " + JSON.stringify(extra_data) + ", contact_type :: " + extra_data.contact_type);

                contactType = extra_data.contact_type;

                if (selectedTabIndex != extra_data.contact_type) {

                    console.log(TAG + "[reloadContacts] OOOOOOOPPPPSSS!!! CURRENT SELECTED CONTACT TAB IS NOT MATCHED WITH THE SERVER RESPONSE CONTACT TAB.");

                    return;
                }
            }

            var contacts = MessageHandler.getContacts(contactType * 1);

            console.log(TAG + "[reloadContacts] contacts length :: " + contacts.length);
            setContactsList(contacts);

            loadMoreStatus = false;

        } catch (e) {

            console.log(TAG + '[reloadContacts] Error :: ' + e);
        }
    };



    //=============================      UI Functinos     ==================================

    const showTeams = (member) => {

        try {

            return (
                <div>
                    <div className={`d-flex align-items-center p-2  mt-3 cursor-pointer didBuddy`}>
                        <img
                            src={Profile}
                            className='contactProfile'
                        />
                        <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                            <p className='contactTeamName'>
                                {member.name}
                            </p>
                            <p>{member.teamName}</p>
                        </div>
                    </div>
                </div>
            )
        } catch (e) {

            console.log(TAG + '[showTeams] Error :: ' + e);
        }
    }

    const showCompanyOrOtherStreamContacts = (member) => {

        try {

            let username = ContactsHandler.getUserName(member);

            //console.log(TAG + '[showCompanyOrOtherStreamContacts] -- username :: ' + username + " :: member :: " + JSON.stringify(member));
            let extension = '';
            if (member.extension * 1 != 0) {

                extension = "- " + member.extension;
            }
            return (
                <div className={`d-flex align-items-center p-2  mt-3 cursor-pointer didBuddy`}>
                    <img
                        src={Profile}
                        className='contactProfile'
                    />
                    <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                        <p className='contactTeamName'>
                            {username}  {extension}
                        </p>
                        <div className="d-flex align-items-center defaultFont">
                            <div className={`rounded-circle`} />
                            {member.STATUS ? member.STATUS : 'Offline'}
                        </div>
                    </div>
                </div>
            )

        } catch (e) {

            console.log(TAG + '[showImportedContacts] Error :: ' + e);
        }
    }

    const showImportedContacts = (member) => {

        try {

            let username = ContactsHandler.getUserName(member);
            return (
                <div>
                    <div className={`d-flex align-items-center p-2  mt-3 cursor-pointer didBuddy`}>
                        <div className="position-relative">
                            <img
                                src={Profile}
                                className='contactProfile'
                            />
                            <div className="globe">
                                <MDBIcon fas icon="globe" />
                            </div>
                        </div>

                        <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                            <p className='contactTeamName'>
                                {username}
                            </p>
                        </div>
                    </div>
                </div>
            )

        } catch (e) {

            console.log(TAG + '[showImportedContacts] Error :: ' + e);
        }
    }

    return (

        <div>

            <div className="position-relative userSearch d-flex align-items-center justify-content-between mt-2 pe-2">
                <input placeholder='Search' />
                <img src={Iconsearch} alt="" className='inputIcon' />

            </div>
            <div className="d-flex flex-wrap pt-2" ref={containerRef}>
                {/* <MDBChip className={`${selectedTab == 'group' ? "active" : ""}`} onClick={() => handleTabSelect('group')} active={selectedTab === 'group'}>Other Streams</MDBChip> */}
                <MDBChip className={`${selectedTab == 'company' ? "active" : ""}`} onClick={() => handleTabSelect('company')} active={selectedTab === 'company'}>Company</MDBChip>
                <MDBChip className={`${selectedTab == 'other' ? "active" : ""}`} onClick={() => handleTabSelect('other')} active={selectedTab === 'other'}>Other</MDBChip>
                <MDBChip className={`${selectedTab == 'imported' ? "active" : ""}`} onClick={() => handleTabSelect('imported')} active={selectedTab === 'imported'}>Imported</MDBChip>
                {/* <MDBChip className={`${selectedTab == 'all' ? "active" : ""}`} onClick={() => handleTabSelect('all')} active={selectedTab === 'all'} >Teams</MDBChip> */}
            </div>

            <MDBTabsPane open={(selectedTab === 'company') || (selectedTab === 'imported' || (selectedTab === 'other'))} className='users-view-container'>
                <div>
                    {contactsList.map((member, index) => {

                        console.log("selectedTab ---- " + selectedTab);

                        if (selectedTab === 'company' || selectedTab === 'other') {

                            return (
                                showCompanyOrOtherStreamContacts(member)
                            )
                        } else if (selectedTab === 'imported') {

                            return (
                                showImportedContacts(member)
                            )
                        }

                    })}
                </div>

            </MDBTabsPane>
        </div>
    )
}

export default Contacts
