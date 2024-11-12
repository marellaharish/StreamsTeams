import { MDBBtn, MDBCard, MDBCardBody, MDBCardText, MDBCardTitle, MDBCol } from 'mdb-react-ui-kit'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { StreamsLogo } from "../../assets/images/index"

import URLParams from "../../config/URLParams"
import Config from "../../config/Config"
import Constants from "../../config/Constants"
import serverHandler from "../../classes/utils/ServerHandler"
import Params from "../../config/Params"

const AuthCode = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { authkey, username } = location.state || {};  // Retrieve both authkey and username

    const [verificationcode, setVerificationCode] = useState("");

    function sendDeviceVerificationRequest() {

        try {

            console.log('sendDeviceVerificationRequest ============ ');

            let headersData = {
                'username': username,
                'authkey': authkey,
                'reqtype': 1, //0-Only for this session, 1-For ever Register
                'verificationcode': verificationcode,
                'dashboardid': Config.DASHBOARD_ID,
                'CLIENTTYPE': Config.CLIENT_TYPE,
                'userinfo': 'Call Sentiments Info1',
                'VERSION': Config.VERSION,
                'WS_SYSTEM_ID': "!@#12",
                'WS_DEVICE_NAME': 'REACT_SENTIMENTS_WEB_APP'
            };

            console.log('[sendDeviceVerificationRequest] jsonObject ---- ' + JSON.stringify(headersData));

            sendServerRequest(URLParams.REQ_LOGIN, headersData, {}, URLParams.REQ_POST, {});

        } catch (e) {

            console.log("ERROR: [sendDeviceVerificationRequest] ----- error :: " + e);
        }

    }

    async function sendServerRequest(req_type, headersData, params, req_method, extra_data) {

        try {

            serverHandler.sendServerRequest(req_type, headersData, params, req_method, extra_data)
                .then((data, headersData) => {

                    console.log('Success :: ' + JSON.stringify(data) + " :: headersData :: " + headersData);
                    onReceiveResponse(data, headersData);

                })
                .catch((error) => {

                    console.log('Error occurred:', error);
                    onGotErrorResponse(error, headersData);
                });;

        } catch (e) {

            console.log('Error in [sendPOSTServerRequest ]:: ' + e);
        }
    }


    function onUserAuthenticationSuccess(response) {

        try {

            console.log("[onUserAuthenticationSuccess] ---------")

            localStorage.setItem("authenticated", true);
            localStorage.setItem("LOGIN_USER", username);

            for (let key in response) {

                console.log(`${key} --> ${response[key]}`);

                localStorage.setItem(`${key}`, `${response[key]}`);
            }

            sendLoginUserDetailsRequest();


        } catch (e) {

            console.log("Error in onUserAuthenticationSuccess :: " + e);
        }
    }

    async function sendLoginUserDetailsRequest() {
        try {
            console.log("sendLoginUserDetailsRequest ============ ");

            serverHandler.sendServerRequest(URLParams.REQ_LOGIN_USER_DETAILS,
                {
                    "agentid": localStorage.getItem(Params.WS_LOGIN_USER),
                    xauthtoken: localStorage.getItem(Params.WS_XAUTH_TOKEN)
                },
                {},
                URLParams.REQ_GET,
                {})
                .then((data) => {

                    console.log("Success :: ", ", data :: " + JSON.stringify(data));

                    const siteID = data.response_data[0].siteid;
                    const archiveid = data.response_data[0].im_archiveid;

                    console.log("SiteID :: " + siteID, "archiveid :: " + archiveid);

                    localStorage.setItem(Params.WS_SITE_ID, siteID);
                    localStorage.setItem(Params.WS_IM_ARCHIVEID, archiveid);

                    navigate("/home");

                })
                .catch((error) => {

                    console.log("Error occurred:", error);
                    onGotErrorResponse(error);
                });

        } catch (e) {
            console.log("ERROR: [sendDeviceVerificationRequest] ----- error :: " + e);
        }
    }

    function onGotErrorResponse(error, headersData) {

        try {

            //setLoginReqStatus(false);
            console.log("[onGotErrorResponse] ERROR :: " + error);
            alert("OOOOPS!!!! Something went wrong. Pleae try again...");

        } catch (e) {

            console.log("Error in onGotErrorResponse :: " + e);
        }
    }

    function onReceiveResponse(response, headersData) {

        try {

            console.log("[onReceiveResponse]  response_data :: " + JSON.stringify(response.response_data));

            switch (response.response_data.resp_status * 1) {

                case 200://Success

                    onUserAuthenticationSuccess(response.response_data);

                    break

                case 401: // Unauthorized or Blocked

                    break

                case 500: // Internal server error

                    break

                default:

                    //setLoginReqStatus(false);
                    console.log("OOOPS!!! There is some problem. Plesae try after some time.");

                    break;

            }

        } catch (e) {

            console.log("Error in onReceiveResponse :: " + e);
        }
    }


    return (
        <div className='authenticationBg'>
            <MDBCol md={6} lg={6} sm={12} className="auth-card"> {/* Responsive size change */}
                <MDBCard>
                    <MDBCardBody>
                        <div>
                            <img src={StreamsLogo} alt="Streams Logo" width={200} />
                        </div>

                        <div className='pt-4'>

                            <p>For your security, <b>Streams requires that all new devices</b> (desktops, tablets, and smartphones) and <b>browsers be registered</b> before accessing any content. This registration is <b>specific to each browser</b> and is <b>only required once per new device and browser</b>. Once a device and browser are registered, you will be able to <b>log in normally</b>. If you attempt to log in using a <b>different browser on the same device</b>, you will need to <b>register that browser as well</b> (only once).</p>

                            <p className='py-3'>
                                An email has been sent to the email address associated with your user ID. Please read that email.
                            </p>
                            <p className='pb-2'>
                                Please enter the DEVICE VERIFICATION CODE contained in the email into the box below:
                            </p>

                            <input type="text" className='w-100 OTP' placeholder='Enter Registration Code' autoFocus onChange={(e) => setVerificationCode(e.target.value)} />

                            <p className='text-dark py-3'>
                                <b>Note:</b> The Device Verification Code is <b>NOT</b> your password. It is included in the email sent to you. You have <b>10 attempts</b> to enter the code before the device will be automatically blocked. For best results, copy and paste the code into the box above.
                            </p>

                            <p className='mt-3'>
                                If you did not receive the email, please check your spam folder or contact customer support at (800) 805-0558 or +1 (408) 702-2200.
                            </p>

                            <p className='py-4'>
                                WHEN DONE, PLEASE SELECT ONE OF THE FOLLOWING OPTIONS:
                            </p>

                            <div className="d-flex justify-content-between align-items-center flex-wrap"> {/* Wrap buttons for better responsive design */}
                                <div className="d-flex flex-wrap">
                                    <MDBBtn className='me-2 mb-2' color='success' onClick={() => { sendDeviceVerificationRequest('1') }}>Register this device</MDBBtn>
                                    <MDBBtn className='mb-2' onClick={() => { sendDeviceVerificationRequest('0') }}>Register this device for ONLY THIS SESSION</MDBBtn>
                                </div>
                                <MDBBtn color='secondary' onClick={() => { navigate('/login') }}>Cancel</MDBBtn>
                            </div>

                            <br />
                            <p>
                                If you select "Register this device", you will not receive any more registration emails for that device and browser.
                            </p>
                        </div>

                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
            <p className='footer-text mt-2'>
                ©2024 PanTerra Networks, Inc. All rights reserved.
            </p>
        </div>

    )
}

export default AuthCode
