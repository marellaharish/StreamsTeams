import React, { useEffect, useState } from 'react'
import { MDBCol, MDBContainer, MDBIcon, MDBRow } from 'mdb-react-ui-kit'
import { isIOS, isAndroid, isMobile } from 'react-device-detect';
import { useLocation } from 'react-router-dom';
import { Tooltip } from "react-tooltip";


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
import SearchReasult from '../../components/home/SearchReasult';

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
  const [componentsLoaded, setComponentsLoaded] = useState({
    header: false,
    users: false,
  });

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

    const handleKeyDown = (event) => {

      if (event.key === 'Escape') {

        setSelectedUserStatus(false);
        setSelectedUser(null)
      }
    };

    // Attach the event listener
    window.removeEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);

    console.log(TAG + "keydown Keyboard [addEventListener]----------Pressed")

    // Cleanup the event listener on component unmount
    return () => {
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

      setSelectedContact(null)
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

      setDIDSelectStatus(false);
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


  //=============================      GENERAL Functinos     ==================================
  const unRegisterEvents = () => {

    try {

      evntEmitter.removeAllListeners(EmitterConstants.EMITT_ON_IM_CONNECTED);
      window.removeEventListener('keydown', handleKeyDown);
    } catch (e) {

      console.log(TAG + '[unRegisterEvents] Error :: ' + e);
    }

  }

  const registerEvents = () => {

    try {

      evntEmitter.on(EmitterConstants.EMITT_ON_IM_CONNECTED, handleEvent);
      window.addEventListener('keydown', handleKeyDown);

    } catch (e) {

      console.log(TAG + '[registerEvents] Error :: ' + e);
    }

  }

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

  return (
    <>
      {/* <Header onLoad={() => handleComponentLoad('header')} /> */}
      <div className="RcDrawer-paper">

        <div className='hOLPxV shadow-2 shadow-end-0'>
          <div className='d-flex align-items-center mainTabs active sms'>
            <i class="fas fa-comments fa-lg"></i>
            <div>
              <span className='ms-2'>SMS</span>
            </div>
          </div>


          <div className='d-flex align-items-center mainTabs'>
            <i class="far fa-address-book  fa-lg"></i>
            <div>
              <span className='ms-2'>Contacts</span>
            </div>
          </div>

          <div className='d-flex align-items-center mainTabs'>
            <i class="fas fa-fax fa-lg"></i>
            <div>
              <span className='ms-2'>Fax</span>
            </div>
          </div>

          <div className='d-flex align-items-center mainTabs'>
            <i class="fas fa-phone fa-lg"></i>
            <div>
              <span className='ms-2'>Phone</span>
            </div>
          </div>

          <div className='d-flex align-items-center mainTabs'>
            <i class="fas fa-ellipsis fa-lg"></i>
            <div>
              <span className='ms-2'>More</span>
            </div>
          </div>
        </div>

        <div className='kycUAM'>
          <div className="mx-3 cursor-pointer">
            <i class="fas fa-plus fa-lg"></i>
          </div>
          <div className="me-2 cursor-pointer">
            <i class="fas fa-gear fa-lg"></i>
          </div>
        </div>
      </div>
      <MDBContainer fluid>
        <MDBRow>

          <MDBCol md={3} lg={3} sm={12} className='ps-0 pe-0' id='HideGroups'>

            <UsersComponent onLoad={() => handleComponentLoad('users')}
              onClickGroup={onClickGroup}
              onClickSMSDID={onClickSMSDID}
              onSelectIndividualSMS={onSelectIndividualSMS}
              onContactSelect={onContactSelect}
              dailpadNumberClick={dailpadNumberClick} />

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
                              <div className="d-flex">

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
                                <div className={`${groupselectstatus == false ? 'd-none' : 'w-360px'} `}>
                                  <SearchReasult />
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
                                          <ChatsView user_data={userData} />
                                        </div>
                                        <div className={`${!groupselectstatus == false ? 'd-none' : 'w-360px'} `}>
                                          <SearchReasult />
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


      <Tooltip anchorSelect=".sms" place="top" className="exampleTooltip">
        All <br />
        Individual <br />
        Group <br />
        Unread <br />
      </Tooltip>
    </>
  )
}

export default HomePage
