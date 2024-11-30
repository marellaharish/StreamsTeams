import React, { useState, useRef, useEffect } from 'react'
import { MDBAccordion, MDBAccordionItem, MDBBadge, MDBCard, MDBCardHeader, MDBChip, MDBIcon, MDBInput, MDBPagination, MDBPaginationItem, MDBPaginationLink, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane } from 'mdb-react-ui-kit'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { GoogleIcon, Group, Iconsearch, Outlook, Profile, Yahoo, Excel, smartbox, Globe } from '../../assets/images'

import EmitterConstants from '../../config/EmitterConstants'
import EvntEmitter from '../../classes/utils/EvntEmitter'
import SettingsHandler from "../../classes/settings/SettingsHandler"
import MessageHandler from "../../classes/chat/MessageHandler"
import Constants from "../../config/Constants"
import ContactsHandler from "../../classes/contacts/ContactsHandler"

let loadMoreStatus = false;
let selectedTabIndex = Constants.REQ_CONTACTS_TAB_TYPE.COMPANY_CONTACTS;

let TAG = "[Contacts.js]."
const Contacts = ({ contacts_tab_selection }) => {

    const [selectedTab, setSelectedTab] = useState('company');
    const [searchString, setSearchString] = useState("");
    const [selectedColorTheme, setSelectedColorTheme] = useState('dark');

    const [loadMore, setLoadMore] = useState(false);
    const [loadingNew, setLoadingNew] = useState(true);

    const [contactsList, setContactsList] = useState([]);
    const [tempBuddyList, setTempBuddyList] = useState([]);

    const containerRef = useRef(null);

    const iconMap = {
        'googleIcon.png': GoogleIcon,
        'outlookIcon_onPic.gif': Outlook,
        'csvIcon.png': Excel,
        'smartboxIcon.png': smartbox,
        'globalIcon': Globe,
    };

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

    useEffect(() => {

        try {

            const theme = localStorage.getItem('selectedColorTheme');
            setSelectedColorTheme(theme);

            console.log(theme + "##############");

        } catch (e) {
            console.log(TAG + 'useEffect.selectedColorTheme ');
        }

    }, [selectedColorTheme]);

    useEffect(() => {

        try {

            if (contactsList && contactsList.length > 0 && loadingNew) {

                setLoadingNew(false)
            }

        } catch (e) {
            console.log(TAG + 'useEffect.selectedColorTheme ');
        }

    }, [contactsList]);

    //=============================      GENERAL Functinos     ==================================
    const init = () => {

        try {

            var contacts = MessageHandler.getContacts(selectedTabIndex);

            console.log(TAG + "[init] contacts length :: " + (contacts && contacts.length));

            if (contacts && contacts.length > 0) {

                setContactsList(contacts);
            } else {

                SettingsHandler.loadContacts(selectedTabIndex, '', false);
            }

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

    const startSearch = (event) => {

        try {

            let searchKeyWord = event.target.value;
            console.log("[startSearch] searchKeyWord :: " + searchKeyWord + ", length :: " + contactsList.length + ", selectedTab :: " + selectedTab);

            setSearchString(searchKeyWord);

            if (searchKeyWord !== '') {//Search is started.

                let data;

                data = tempBuddyList;
                if (tempBuddyList.length === 0) {

                    data = contactsList;
                    setTempBuddyList(contactsList);
                }

                console.log('temp list -- ' + tempBuddyList.length);

                var search_data = data.filter((data) => {

                    searchKeyWord = searchKeyWord.toLowerCase();

                    let firstName = (data && data.firstname != null) ? data.firstname.toLowerCase() : "";
                    let lastName = (data && data.lastname != null) ? data.lastname.toLowerCase() : "";
                    let buddyid = (data && data.buddyid != null) ? data.buddyid.toLowerCase() : "";
                    let extension = (data && data.extension != null) ? data.extension : "";
                    let emailID = (data && data.emailID != null) ? data.emailID.toLowerCase() : "";
                    let cellphone = (data && data.cellphone != null) ? data.cellphone : "";

                    let mobilePhone;
                    let homephone;
                    let officePhone;
                    let companyphone;

                    if (selectedTab === "imported") {

                        mobilePhone = (data && data.mobilephone != null) ? data.mobilephone : "";
                        homephone = (data && data.homephone != null) ? data.homephone : "";
                        officePhone = (data && data.officePhone != null) ? data.officePhone : "";
                        companyphone = (data && data.companyphone != null) ? data.companyphone : "";

                    }

                    return (

                        firstName.includes(searchKeyWord) ||
                        lastName.includes(searchKeyWord) ||
                        buddyid.includes(searchKeyWord) ||
                        extension.includes(searchKeyWord) ||
                        emailID.includes(searchKeyWord) ||
                        String(cellphone).includes(searchKeyWord) ||

                        String(mobilePhone).includes(searchKeyWord) ||
                        String(homephone).includes(searchKeyWord) ||
                        String(officePhone).includes(searchKeyWord) ||
                        String(companyphone).includes(searchKeyWord)
                    );

                });

                setContactsList(search_data);

                console.log("search data :: " + search_data.length + " :: contactsList :: " + contactsList.length)

            } else {//Search stopped.

                console.log('Search completed ----');

                setContactsList(tempBuddyList);
                setTempBuddyList([]);
            }

        } catch (e) {

            console.log('[startSearch] Error :: ' + e);
        }
    }

    const onSearchKeyDown = (event) => {

        try {

            if (event.key === "Enter") {
                console.log("Enter key was pressed!");

                //send server request
                //SettingsHandler.loadSMSData(searchString, selectedTabIndex);
            }

        } catch (e) {

            console.log('[onSearchKeyDown] Error :: ' + e);
        }
    }

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
                            <div className={`rounded-circle me-2 ${member.STATUS ? "bg-secondary" : "bg-secondary"} `} />
                            {member.STATUS ? member.STATUS : 'Offline'}
                        </div>
                    </div>
                </div>
            )

        } catch (e) {

            console.log(TAG + '[showCompanyOrOtherStreamContacts] Error :: ' + e);
        }
    }

    const showImportedContacts = (member) => {

        try {

            let username = ContactsHandler.getUserName(member);
            let groupIconSrc = member.groupicon;
            const iconSource = iconMap[groupIconSrc];

            return (
                <div>
                    <div className={`d-flex align-items-center p-2  mt-3 cursor-pointer didBuddy`}>
                        <div className="position-relative">
                            <img src={Profile} className='contactProfile' />
                            <div className="globe">
                                <img src={iconSource} style={{ width: 15, height: 15 }} />
                            </div>
                        </div>
                        <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                            <p className='contactTeamName'>{username}</p>
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

            <MDBCard className='shadow-0 bg-transparent'>
                <MDBCardHeader className=' border-0'>
                    <div className='tabsHeader'>
                        Contacts</div>
                </MDBCardHeader>
            </MDBCard>

            <div className="position-relative userSearch d-flex align-items-center justify-content-between mt-2 pe-2">
                <input placeholder='Search' onChange={(e) => { startSearch(e) }} onKeyDown={onSearchKeyDown} />
                <img src={Iconsearch} alt="" className='inputIcon' />

            </div>
            <div className="d-flex flex-wrap pt-2" ref={containerRef}>
                {/* <MDBChip className={`${selectedTab == 'group' ? "active" : ""}`} onClick={() => handleTabSelect('group')} active={selectedTab === 'group'}>Other Streams</MDBChip> */}
                <MDBChip className={`${selectedTab == 'company' ? "active" : ""}`} onClick={() => handleTabSelect('company')} active={selectedTab === 'company'}>Company</MDBChip>
                <MDBChip className={`${selectedTab == 'imported' ? "active" : ""}`} onClick={() => handleTabSelect('imported')} active={selectedTab === 'imported'}>Imported</MDBChip>
                <MDBChip className={`${selectedTab == 'other' ? "active" : ""}`} onClick={() => handleTabSelect('other')} active={selectedTab === 'other'}>Other</MDBChip>
                {/* <MDBChip className={`${selectedTab == 'all' ? "active" : ""}`} onClick={() => handleTabSelect('all')} active={selectedTab === 'all'} >Teams</MDBChip> */}
            </div>

            <MDBTabsPane open={(selectedTab === 'company') || (selectedTab === 'imported' || (selectedTab === 'other'))} className='users-view-container'>
                <div>
                    <>
                        {loadingNew ? (
                            Array(9).fill().map((_, index) => (
                                <SkeletonTheme baseColor={selectedColorTheme === "light" ? '#DBDBDB' : '#313131'} highlightColor={selectedColorTheme === "light" ? '#F1F1F1' : '#525252'}>
                                    <div className="d-flex align-items-center py-2 px-3 cursor-pointer">
                                        <Skeleton width={40} height={40} borderRadius="8px" />
                                        <div className="mx-3" style={{ flexGrow: 1 }}>
                                            <Skeleton width="100%" />
                                        </div>
                                        <Skeleton width={50} />
                                    </div>
                                </SkeletonTheme>
                            ))

                        ) : (

                            (contactsList.length === 0) ? (

                                <div className='d-flex justify-content-center align-items-center h-100'>
                                    <p>No Contacts to display.</p>
                                </div>

                            ) : (
                                contactsList.map((member, index) => {

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

                                })

                            )
                        )
                        }
                    </>
                </div>

            </MDBTabsPane>
        </div>
    )
}

export default Contacts
