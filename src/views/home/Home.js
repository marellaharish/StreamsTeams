import React, { useEffect, useState } from 'react'
import { MDBCol, MDBContainer, MDBRow } from 'mdb-react-ui-kit'
import { isIOS, isAndroid, isMobile } from 'react-device-detect';
import { useLocation } from 'react-router-dom';


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

    console.log("[handleComponentLoad] -- component :: " + component);

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

  useEffect(() => {

    console.log('[Home].useEffect() in statement ----');

    //evntEmitter.removeAllListeners();

    onLoadHomePage();

    unRegisterEvents();
    registerEvents();

    const queryParams = new URLSearchParams(location.search);

    const group_code = queryParams.get('group_code');
    console.log("groupd_code :: " + group_code);

    const theme = localStorage.getItem('selectedColorTheme');
    if (!theme) {

      localStorage.setItem("selectedColorTheme", "dark");

      const body = document.querySelector("body");
      body.setAttribute("data-theme", "dark");
    }


  }, []);

  const unRegisterEvents = () => {

    try {

      evntEmitter.removeAllListeners(EmitterConstants.EMITT_ON_IM_CONNECTED);
      window.removeEventListener('keydown', handleKeyDown);
    } catch (e) {

      console.log('[unRegisterEvents] Error :: ' + e);
    }

  }

  const registerEvents = () => {

    try {

      evntEmitter.on(EmitterConstants.EMITT_ON_IM_CONNECTED, handleEvent);
      window.addEventListener('keydown', handleKeyDown);

    } catch (e) {

      console.log('[registerEvents] Error :: ' + e);
    }

  }

  const onLoadHomePage = () => {

    try {

      console.log('[onLoadHomePage] ----------- ');

      //Shift this to Login page.
      let xauthtoken = localStorage.getItem(Params.WS_XAUTH_TOKEN)
      Utils.setCookie(Params.COOKIE_XAUTHTOKEN, xauthtoken)

      IMConnector.connectToIM();

      SettingsHandler.loadUserSMSDIDSettings();

    } catch (e) {

      console.log('[onLoadHomePage] Error :: ' + e);
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {

      setSelectedContact(null)
    }
  };

  const handleEvent = (msg) => {

    console.log("[handleEvent] ---- " + JSON.stringify(msg));
  };

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

    console.log('userAgent --------- ' + userAgent);

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

  const onClickSMSDID = (did_data) => {

    try {

      console.log('[Home.js].onClickSMSDID() -- ');

      setDIDSelectStatus(true);
      setUserData(did_data);
      setSelectedContact(null);

    } catch (e) {

      console.log('[onClickSMSDID] Error :: ' + e);
    }
  }

  const onClickGroup = (sms_group_data) => {

    try {
      console.log('[Home.js].onClickGroup() -- ');

      setDIDSelectStatus(false);
      setGroupSelectStatus(true);
      setSMSGroupData(sms_group_data);
      setSelectedContact(null);

    } catch (e) {

      console.log('[onClickGroup] Error :: ' + e);
    }
  }

  const onSelectIndividualSMS = () => {

    try {

      console.log('[Home.js].onSelectIndividualSMS() -- ');

      setDIDSelectStatus(false);
      setGroupSelectStatus(false);
      setSelectedContact(null);

    } catch (e) {

      console.log('[onSelectIndividualSMS] Error :: ' + e);
    }
  }

  const onContactSelect = (user, e) => {

    try {
      console.log('[Home.js].onContactSelect() -- ');
      setSelectedContact(user);
      setGroupSelectStatus(false)

    } catch (e) {

      console.log('[onContactSelect] Error :: ' + e);
    }

    console.log(user + " user Clicked in dialpad search");
  };

  const dailpadNumberClick = (user, e) => {

    setSelectedUser(user);
    setSelectedUserStatus(true)
    setGroupSelectStatus(false)
    console.log(user, "user Clicked in search", selectedUserStatus)
  };

  useEffect(() => {

    const handleKeyDown = (event) => {

      if (event.key === 'Escape') {

        setSelectedUserStatus(false);
        setSelectedUser(null)
      }
    };

    // Attach the event listener
    window.addEventListener('keydown', handleKeyDown);
    console.log("keydown Keyboard [addEventListener]----------Pressed")

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log("keydown Keyboard [removeEventListener]----------relesed")
    };
  }, []);


  console.log("platform --- " + getPlatform() + " :: getPlatformNew :: " + getPlatformNew() + " :: isMobile :: " + isMobile);

  return (
    <>

      <Header onLoad={() => handleComponentLoad('header')} />
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
                            </>


                          )
                            :
                            (

                              <div className="w-100">
                                {
                                  didselectstatus || (selectedContact != null && selectedContact.length > 0) ?

                                    <ChatsView user_data={userData} />
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
