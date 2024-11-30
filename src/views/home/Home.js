import React, { useEffect, useRef, useState } from 'react'
import { MDBBadge, MDBCol, MDBContainer, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon, MDBInput, MDBRadio, MDBRow, MDBTabsContent, MDBTabsPane } from 'mdb-react-ui-kit'
import { isIOS, isAndroid, isMobile } from 'react-device-detect';
import { useLocation } from 'react-router-dom';
import { dialpad, Iconsearch } from '../../assets/images';
import { useNavigate } from 'react-router-dom';


import ChatsView from '../../components/chats/Chats'
import Header from '../../components/utils/Header';
import UsersComponent from '../../components/sms/UsersComponent'
import IMConnector from '../../socket/IMConnector'
import evntEmitter from "../../classes/utils/EvntEmitter"
import Config from '../../config/Config'
import EmitterConstants from "../../config/EmitterConstants"
import SettingsHandler from "../../classes/settings/SettingsHandler"
import DIDComponent from '../../components/sms/DIDComponent';
import Welcome from './Welcome';
import Params from '../../config/Params'
import Utils from '../../classes/utils/util';
import SearchReasults from '../../components/home/SearchReasults';
import DarkMode from '../../components/utils/DarkMode';
import Contacts from '../../components/home/Contacts';
import DialPad from '../../components/home/DialPad';

let TAG = "[Home.js].";

const HomePage = () => {

  const location = useLocation();

  const [userData, setUserData] = useState({});
  const [smsgroupdata, setSMSGroupData] = useState({});

  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [selectedUserStatus, setSelectedUserStatus] = useState(false);
  const [groupselectstatus, setGroupSelectStatus] = useState(false);
  const [didselectstatus, setDIDSelectStatus] = useState(false);
  const [searchLoadingStatus, setSearchLoadingStatus] = useState(true);
  const [isSettingsMenuVisible, setIsDropdownVisible] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchString, setSearchString] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('On Desktop');
  const [activeTab, setActiveTab] = useState('SMS'); // Default active tab

  const searchRef = useRef(null);
  const searchResultRef = useRef(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const [componentsLoaded, setComponentsLoaded] = useState({
    header: false,
    users: false,
  });

  const statusOptions = [
    { label: 'On Desktop', bgClass: 'onlineStatus' },
    { label: 'Be Right Back', bgClass: 'onlineStatus bg-danger' },
    { label: 'Busy', bgClass: 'onlineStatus bg-danger' },
    { label: 'Not At My Desk', bgClass: 'onlineStatus bg-danger' },
    { label: 'Out To Lunch', bgClass: 'onlineStatus bg-danger' },
    { label: 'Stepped Out', bgClass: 'onlineStatus bg-danger' },
    { label: 'Appear Offline', bgClass: 'onlineStatus bg-secondary' },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const allComponentsLoaded = Object.values(componentsLoaded).every(Boolean);

  const handleComponentLoad = (component) => {

    console.log(TAG + "[handleComponentLoad] -- component :: " + component);

    setComponentsLoaded((prevState) => ({
      ...prevState,
      [component]: true,
    }));
  };

  /*
  useEffect(() => {

      console.log('smsgroupdata updated:', smsgroupdata);
  }, [smsgroupdata]);
    */

  //=============================       useEffect's     ==================================

  useEffect(() => {

    console.log(TAG + '.useEffect() in statement ----');

    //evntEmitter.removeAllListeners();

    onLoadHomePage();

    unRegisterEvents();
    registerEvents();

    const queryParams = new URLSearchParams(location.search);

    const group_code = queryParams.get('group_code');
    console.log(TAG + "groupd_code :: " + group_code);

    //If there is no theme set then default is Dark theme.
    const theme = localStorage.getItem('selectedColorTheme');
    if (!theme) {

      localStorage.setItem("selectedColorTheme", "dark");

      const body = document.querySelector("body");
      body.setAttribute("data-theme", "dark");
    }

    // Attach the event listener
    window.removeEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);

    document.removeEventListener('mousedown', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {

      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      console.log(TAG + "keydown Keyboard [removeEventListener]----------relesed")
    };

  }, []);

  useEffect(() => {

    try {

      if (!location.state) return;
      if (!isMobile) return;

      console.log(TAG + '[useEffect].[location.state] ---- location.state ::' + JSON.stringify(location.state));

      if (location.state.member_data) {

      } else if (location.state) {

      }

    } catch (e) {

      console.log(TAG + "[useEffect].[location.state] :: ERROR :: " + e);
    }

  }, [location.state]);

  //=============================      CLICK Functinos     ==================================
  const handleKeyDown = (event) => {

    if (event.key === 'Escape') {

      setSelectedUserStatus(false);
      setSelectedUser(null);
      setShowSearchResults(false);
      setSearchString('');
    }
  };

  const handleClickOutside = (event) => {

    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {

      setIsDropdownVisible(false);
      setIsOpen(false);
    }

    if (searchRef.current && !searchRef.current.contains(event.target) &&
      searchResultRef.current && !searchResultRef.current.contains(event.target)) {

      setShowSearchResults(false);
    }
  };

  const handleEvent = (msg) => {

    console.log(TAG + "[handleEvent] ---- " + JSON.stringify(msg));
  };

  const onClickSMSDID = (did_data) => {

    try {

      console.log(TAG + '.onClickSMSDID() -- ');

      setDIDSelectStatus(true);
      setUserData(did_data);
      setSelectedContact(null);

    } catch (e) {

      console.log(TAG + '[onClickSMSDID] Error :: ' + e);
    }
  }

  const onClickGroup = (sms_group_data) => {

    try {
      console.log(TAG + '.onClickGroup() -- ');

      setDIDSelectStatus(true);
      setGroupSelectStatus(true);
      setSMSGroupData(sms_group_data);
      setSelectedContact(null);

    } catch (e) {

      console.log(TAG + '[onClickGroup] Error :: ' + e);
    }
  }

  const onSelectIndividualSMS = () => {

    try {

      console.log(TAG + '.onSelectIndividualSMS() -- ');

      setDIDSelectStatus(false);
      setGroupSelectStatus(false);
      setSelectedContact(null);

    } catch (e) {

      console.log(TAG + '[onSelectIndividualSMS] Error :: ' + e);
    }
  }

  const onContactSelect = (user, e) => {

    try {
      console.log(TAG + '.onContactSelect() -- ');
      setSelectedContact(user);
      setGroupSelectStatus(false)

    } catch (e) {

      console.log(TAG + '[onContactSelect] Error :: ' + e);
    }

    console.log(TAG + ".[onContactSelect] :: " + user + " user Clicked in dialpad search");
  };

  const dailpadNumberClick = (user, e) => {

    setSelectedUser(user);
    setSelectedUserStatus(true)
    setGroupSelectStatus(false)
    console.log(TAG + ".[dailpadNumberClick] :: " + user + "user Clicked in search", selectedUserStatus)
  };

  const onClickSignOut = () => {

    try {

      let username = localStorage.getItem(Params.WS_LOGIN_USER);
      localStorage.clear();

      IMConnector.closeSocket()

      navigate('/login');

    } catch (e) {

      console.log(TAG + '[onClickSignOut] Error :: ' + e);
    }
  }

  const onClickSearchResult = (search_data) => {

    try {

      console.log(TAG + '.onClickSearchResult() -- ' + JSON.stringify(search_data));

      setShowSearchResults(false);
      setUserData(search_data);

      evntEmitter.emit(EmitterConstants.EMMIT_ON_SEARCH_MESSAGE_BUDDY_CLICKED, search_data);

    } catch (e) {

      console.log(TAG + '[onClickSearchResult] Error :: ' + e);
    }
  }

  const handleClearInput = () => {
    try {
      setSearchString('');
    } catch (e) {
      console.log(TAG + '[handleClearInput] Error :: ' + e);
    }
  }

  const onStartSearch = (e) => {

    try {

      console.log(TAG + 'onStartSearch() -- ');

      let searchKeyword = e.target.value;
      setSearchString(searchKeyword);

    } catch (e) {

      console.log(TAG + '[onStartSearch] Error :: ' + e);
    }
  }

  const onSearchKeyDown = (event) => {

    try {

      if (event.key === "Enter") {

        console.log("Enter key was pressed!");

        //send server request
        SettingsHandler.loadSearchMessagesFromDB(searchString);
      }

    } catch (e) {

      console.log('[onSearchKeyDown] Error :: ' + e);
    }
  }

  //=============================      GENERAL Functinos     ==================================
  const unRegisterEvents = () => {

    try {

      evntEmitter.removeAllListeners(EmitterConstants.EMITT_ON_IM_CONNECTED);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);


    } catch (e) {

      console.log(TAG + '[unRegisterEvents] Error :: ' + e);
    }

  }

  const registerEvents = () => {

    try {

      evntEmitter.on(EmitterConstants.EMITT_ON_IM_CONNECTED, handleEvent);

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener("beforeunload", handleBeforeUnload);

    } catch (e) {

      console.log(TAG + '[registerEvents] Error :: ' + e);
    }

  }

  const handleBeforeUnload = (event) => {
    // close the IM connection while resfresh page
    IMConnector.closeSocket()
  };

  const onLoadHomePage = () => {

    try {

      console.log(TAG + '[onLoadHomePage] ----------- isIMConnected :: ' + IMConnector.isIMConnected());

      console.log(TAG + '[onLoadHomePage] SETTING THE COOKIE ----------- ');
      //Shift this to Login page.
      let xauthtoken = localStorage.getItem(Params.WS_XAUTH_TOKEN)
      Utils.setCookie(Params.COOKIE_XAUTHTOKEN, xauthtoken)

      let imConnectStatus = IMConnector.isIMConnected();
      if (imConnectStatus == undefined ||
        imConnectStatus == null ||
        imConnectStatus == false) {

        IMConnector.connectToIM();
        SettingsHandler.loadUserSMSDIDSettings();
      }

    } catch (e) {

      console.log(TAG + '[onLoadHomePage] Error :: ' + e);
    }
  }

  const getPlatformNew = () => {

    if (isIOS) {
      return 'iOS';
    }
    if (isAndroid) {
      return 'Android';
    }
    if (isMobile) {
      return 'Mobile';
    }

    return 'Web';
  };

  const getPlatform = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    console.log(TAG + '[getPlatform] userAgent --------- ' + userAgent);

    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS';
    }

    // Check for Android
    if (/android/i.test(userAgent)) {
      return 'Android';
    }

    // Otherwise assume web
    return 'Web';
  };


  console.log(TAG + "platform --- " + getPlatform() + " :: getPlatformNew :: " + getPlatformNew() + " :: isMobile :: " + isMobile);


  const handleBasicClick = (value) => {
    console.log(value, "handle basic click");
    if (value === activeTab) {
      return;
    }
    setActiveTab(value);
  };

  const onDialSMSFromDialPad = (userData) => {
    try {

      console.log('[onDialSMSFromDialPad] Start :: ');

    } catch (e) {
      console.log('[onDialSMSFromDialPad] Error :: ' + e);
    }

  }

  const handleStatusChange = (label) => {
    setSelectedStatus(label);
  };

  const showOrHideSettings = () => {
    setIsDropdownVisible((prev) => !prev);
  };


  return (
    <>

      {!isMobile && (
        <>

          <div className="RcDrawer-paper">
            <div className="hOLPxV  shadow-end-0">

              <div
                className={`d-flex align-items-center mainTabs ${activeTab === 'SMS' ? 'active' : ''}`}
                onClick={() => handleBasicClick('SMS')}
              >
                <i className="fas fa-comments fa-lg"></i>
                <div className='d-flex align-items-center'>
                  <span className="ms-2">SMS</span>
                  <MDBBadge pill color='danger' light className='ms-2'>

                  </MDBBadge>
                </div>
              </div>

              <div
                className={`d-flex align-items-center mainTabs ${activeTab === 'Contacts' ? 'active' : ''}`}
                onClick={() => handleBasicClick('Contacts')}
              >
                <i className="far fa-address-book fa-lg"></i>
                <div className='d-flex align-items-center'>
                  <span className="ms-2">Contacts</span>
                </div>
              </div>


              <div
                className={`d-flex align-items-center mainTabs ${activeTab === 'Dialpad' ? 'active' : ''}`}
                onClick={() => handleBasicClick('Dialpad')}
              >
                <img src={dialpad} width={23} />
                <div>
                  <span className="ms-2">Dialpad</span>
                </div>
              </div>

            </div>

            <div className="kycUAM" >

              <div className="me-3 cursor-pointer" onClick={() => setShowSearchResults(true)}>
                <i className="fas fa-magnifying-glass fa-lg"></i>
              </div>

              <div className="me-2 cursor-pointer" onClick={showOrHideSettings}>
                <i className="fas fa-gear fa-lg"></i>
              </div>

              {isSettingsMenuVisible && (
                <div className='dropDownSettings' ref={dropdownRef}>
                  <div class="sc-czXssZ eWaaYG">
                    <h1 class="jupiter-MuiTypography-root sc-jJMGHv sc-jXmsZE fPsbdp iYwrwl">
                      {localStorage.getItem("LOGIN_USER")?.split('@')[0]}
                    </h1>
                    {/* <button class="jupiter-MuiButtonBase-root jupiter-MuiButton-root jupiter-MuiButton-text RcButton-text sc-ksluoS sc-bpSgSL jFnKxu eQgYCX">
                      <span class="jupiter-MuiButton-label">
                        View profile
                      </span>
                    </button> */}
                  </div>
                  <ul>
                    <li className='p-0'>
                      <MDBDropdown animation={false}>

                        <MDBDropdownToggle>
                          <div className="d-flex align-items-center defaultFont">
                            <div className={statusOptions.find(option => option.label === selectedStatus)?.bgClass + ' rounded-circle me-2'}></div>
                            {selectedStatus}
                          </div>
                        </MDBDropdownToggle>

                        <MDBDropdownMenu className='dropdownWidth' responsive='end'>

                          <MDBDropdownItem link onClick={() => handleStatusChange('On Desktop')}>
                            <div className="d-flex align-items-center">
                              <div className='onlineStatus rounded-circle me-2'></div>
                              On Desktop
                            </div>
                          </MDBDropdownItem>
                          {statusOptions.slice(1).map((option) => (
                            <MDBDropdownItem key={option.label} link onClick={() => handleStatusChange(option.label)}>
                              <div className="d-flex align-items-center">
                                <div className={option.bgClass + ' rounded-circle me-2'}></div>
                                {option.label}
                              </div>
                            </MDBDropdownItem>
                          ))}
                          <div className='dropdown-divider'></div>
                          <form className='p-3'>
                            <MDBInput placeholder='Add a new custom message' />
                            <div className="text-center mt-3">
                              <MDBRadio name='inlineRadio' id='inlineRadio1' value='option1' label='Busy' inline />
                              <MDBRadio name='inlineRadio' id='inlineRadio2' value='option2' label='Available' inline />
                            </div>
                          </form>
                        </MDBDropdownMenu>

                      </MDBDropdown>

                    </li>
                    <li onClick={toggleDropdown}>
                      <div className='d-flex align-items-center justify-content-between'>
                        Theme
                        <MDBIcon fas icon={isOpen ? "caret-down" : "caret-right"} color='secondary' />
                      </div>
                    </li>
                    {/* <li>
                      Settings
                      </li> */}
                    <li onClick={onClickSignOut}>
                      Sign out
                    </li>
                  </ul>

                  <div className={`dropdown-content ${isOpen ? "show" : ""}`}>
                    <DarkMode setIsOpen={setIsOpen} />
                  </div>


                </div>
              )}

              {showSearchResults && (
                <>
                  <div className='search-data-container'>
                    <div className="overlayNew" style={{ display: showSearchResults ? "block" : "none" }}>
                      <div className="searchDropdown" ref={searchRef}>
                        <div className="position-relative">
                          <input value={searchString} placeholder='Search' onChange={(e) => { onStartSearch(e) }} onKeyDown={onSearchKeyDown} />
                          {!searchString ? (
                            <img src={Iconsearch} alt="Search Icon" className='inputIconEnd' />
                          ) : (
                            <div
                              onClick={handleClearInput}
                              className='py-1 pe-1 cursor-pointer inputIconEnd'
                            >
                              <MDBIcon fas icon="times" className='' />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="searchDropdownreasult" ref={searchResultRef}>
                        {
                          (searchString && searchString !== '') ?
                            <SearchReasults onClickSearch={onClickSearchResult} setSearchLoadingStatus={searchLoadingStatus} /> : ""
                        }
                      </div>
                    </div>
                  </div>
                </>)}

            </div >
          </div >
        </>
      )}


      {/* <Header onLoad={() => handleComponentLoad('header')} onMessageSearch={onClickMessageSearch} searchLoadingStatus={searchLoadingStatus} setSearchLoadingStatus={setSearchLoadingStatus} /> */}
      <MDBContainer fluid>
        <MDBRow>

          <MDBCol md={3} lg={3} sm={12} className='ps-0 pe-0' id='HideGroups'>

            <MDBTabsContent>

              <MDBTabsPane open={activeTab === 'SMS'}>
                <UsersComponent onLoad={() => handleComponentLoad('users')}
                  onClickGroup={onClickGroup}
                  onClickSMSDID={onClickSMSDID}
                  onSelectIndividualSMS={onSelectIndividualSMS}
                  onContactSelect={onContactSelect}
                  dailpadNumberClick={dailpadNumberClick} />
              </MDBTabsPane>

              <MDBTabsPane open={activeTab === 'Contacts'}>
                {activeTab === 'Contacts' && <Contacts contacts_tab_selection={true} />}
              </MDBTabsPane>

              <MDBTabsPane open={activeTab === 'Fax'}>Tab 3 content</MDBTabsPane>

              <MDBTabsPane open={activeTab === 'Dialpad'}>
                <DialPad dailpadNumberClick={dailpadNumberClick}
                  onClickSMSDID={onClickSMSDID}
                  onDialSMSFromDialPad={onDialSMSFromDialPad} />
              </MDBTabsPane>

              <MDBTabsPane open={activeTab === 'More'}>Tab 5 content</MDBTabsPane>

            </MDBTabsContent>

          </MDBCol>

          {isMobile == false &&

            (
              <>
                {

                  console.log('this is not mobile ----------')}

                <MDBCol md={9} lg={9} sm={12} className='mob-d-none'>

                  {groupselectstatus || didselectstatus || (selectedContact != null && selectedContact.length > 0) ?
                    <>
                      <div className='d-flex w-100'>
                        <div className='d-flex w-100'>

                          {groupselectstatus == true ? (

                            <>
                              <div className='d-inline-flex w-100'>
                                <div className='w-380px'>
                                  <DIDComponent onClickSMSDID={onClickSMSDID} groupData={smsgroupdata} />
                                </div>

                                <div className="w-100">
                                  {
                                    didselectstatus || (selectedContact != null && selectedContact.length > 0) ?

                                      <ChatsView user_data={userData} />
                                      :
                                      <Welcome />
                                  }

                                </div>

                              </div>
                            </>

                          )
                            :
                            (

                              <div className="w-100">
                                {
                                  didselectstatus || (selectedContact != null && selectedContact.length > 0) ?

                                    <>
                                      <div className="d-flex">
                                        <div className="w-100">

                                          < ChatsView user_data={userData} />
                                        </div>

                                      </div>
                                    </>
                                    :
                                    <Welcome />
                                }

                              </div>
                            )
                          }
                        </div>
                      </div>
                    </>
                    :
                    <>
                      <Welcome />
                    </>
                  }
                </MDBCol>
              </>
            )

          }

        </MDBRow>

      </MDBContainer>
    </>
  )
}

export default HomePage
