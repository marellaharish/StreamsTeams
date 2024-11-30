/**
 * Author: Sunil
 * Date: 27/08/24
 */

import React, { useEffect } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBCheckbox, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import { useState } from "react";
import { json, useLocation, useNavigate } from "react-router-dom";
import md5 from 'md5';

import { checkmark, Panterra, StreamsLogo } from '../../assets/images';

import URLParams from "../../config/URLParams"
import Params from "../../config/Params"
import Config from "../../config/Config"
import Constants from "../../config/Constants"
import MessaageConstants from "../../config/MessaageConstants"
import serverHandler from "../../classes/utils/ServerHandler"

let TAG = "[Login.js].";
function Login() {

    const navigate = useNavigate();

    const [errorMessages, setErrorMessages] = useState({});

    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [authkey, setAuthKey] = useState("");
    const [verificationcode, setVerificationCode] = useState("");
    const [auth_field_enable, setauthfieldenable] = useState(0);
    const [authenticated, setauthenticated] = useState(localStorage.getItem(localStorage.getItem("authenticated") || false));

    const [showPassword, setShowPassword] = useState(false);
    const [loginReqStatus, setLoginReqStatus] = useState(false);

    const location = useLocation();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {

        try {
            console.log('[Login].useEffect() default---- ');

            if (localStorage.getItem("authenticated") &&
                localStorage.getItem("LOGIN_USER")) {

                navigate("/home");
            }

            console.log(TAG + '[Login].useEffect() default---- authenticated :: ' + localStorage.getItem("authenticated") + ", LOGIN_USER :: " + localStorage.getItem("LOGIN_USER") + " :: window :: " + window.location.href);

            let result = new URL(window.location.href);
            let authKey = result.searchParams.get("authkey");

            const baseURL = new URL(location.href || window.location.href).origin + location.pathname;

            console.log(TAG + "baseURL :: " + baseURL + ", pathname :: " + location.pathname);  // Logs: https://streamsreact.beta-wspbx.com/auth 

            console.log(TAG + "[Login]    pathaname :: " + JSON.stringify(location));

            if (baseURL === "LoginSuccess") {

                //verifyAuthKey();
            }

            //debugger;
            if (!authKey && (localStorage.getItem("authenticated") == null &&
                localStorage.getItem("LOGIN_USER") == null) ||
                localStorage.getItem("authenticated") == false ||
                localStorage.getItem("LOGIN_USER") == '') {

                console.log("[Login].useEffect() default---- REDIRECTING TO AUTH SERVICE ---- ")
                //window.location.href = Config.AUTH_SERVICE_URL;
                return
            }

        } catch (e) {

            console.log("Error in [Login].useEffect() default :: " + e);
        }

    }, []);

    useEffect(() => {

        console.log(TAG + '[Login].useEffect() LoginSuccess---- ');

        verifyAuthKey();

    }, [location.pathname === "LoginSuccess"]);

    async function verifyAuthKey() {
        var self = this;
        try {

            let result = new URL(window.location.href);
            let authKey = result.searchParams.get("authkey");

            let params = {

                authkey: authKey
            }

            let extra_data = {

                req_type: Constants.REQ_TYPE.VERIFY_USER_LOGIN
            }

            console.log(TAG + "[verifyAuthKey] authJKey :: " + authKey + " :: params :: " + JSON.stringify(params) + " :: extra_data :: " + JSON.stringify(extra_data));

            serverHandler.sendServerRequest(URLParams.REQ_VERIFY_USER_LOGIN, {}, params, URLParams.REQ_GET, extra_data)
                .then((data, extra_data) => {

                    console.log(TAG + '[verifyAuthKey] response_data :: ' + JSON.stringify(data.response_data) + " :: extra_data :: " + JSON.stringify(data.extra_data));
                    onReceiveResponse(data, data.extra_data);

                })
                .catch((error) => {

                    onGotErrorResponse(error, extra_data);
                });

        } catch (e) {
            console.log("[verifyAuthKey] Error  -------- :: " + e);
        }
    }

    const errors = {

        username: "Invalid Username",
        pass: "Invalid Password"
    };


    const handleSubmit = (event) => {

        let self = this;
        try {

            //Prevent page reload
            event.preventDefault();

            var { username_id, password_id } = document.forms[0];

            if (username == '') {

                alert("Please enter UserName.");
                username_id.focus();
                return;
            }

            if (password == '') {

                alert("Please enter Password.");
                password_id.focus();
                return;
            }

            console.log("authkey ---- " + authkey);
            if (authkey) {

                sendDeviceVerificationRequest();
            } else {

                setLoginReqStatus(true);
                sendLoginRequest();
            }

        } catch (e) {

            console.log("Error in handleSubmit :: " + e);
        }

    };

    function onUserAuthenticationSuccess(response) {

        try {

            //const userData = database.find((user) => user.username === username);

            //if (userData) {

            console.log("[onUserAuthenticationSuccess] ---------")

            // if (userData.password !== password) {

            //   setErrorMessages({ name: "error_password", message: errors.pass });
            //} else {

            setauthenticated(true)

            localStorage.setItem("authenticated", true);
            localStorage.setItem(Params.WS_LOGIN_USER, !response.username ? response.wsuserid : response.username);

            for (let key in response) {

                console.log(`${key} --> ${response[key]}`);

                localStorage.setItem(`${key}`, `${response[key]}`);
            }

            sendLoginUserDetailsRequest();

            //}
            //}

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

                    console.log("Success :: " + ", data :: " + JSON.stringify(data));

                    const siteID = data.response_data[0].siteid;
                    const archiveid = data.response_data[0].im_archiveid;

                    console.log("SiteID :: " + siteID + " :: archiveid :: " + archiveid);

                    localStorage.setItem(Params.WS_SITE_ID, siteID);
                    localStorage.setItem(Params.WS_IM_ARCHIVEID, archiveid);
                    localStorage.setItem(Params.WS_LOGGED_USER_FIRSTNAME, data.response_data[0].firstname);
                    localStorage.setItem(Params.WS_LOGGED_USER_LASTNAME, data.response_data[0].lastname);

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

    function onReceiveResponse(response, headersData) {

        try {

            console.log("[onReceiveResponse]  response_data :: " + JSON.stringify(response.response_data));

            switch (response.response_data.resp_status * 1) {

                case 200://Success

                    onUserAuthenticationSuccess(response.response_data);

                    break

                case 401: // Unauthorized or Blocked

                    break

                case 403: // Device Authentication Required

                    setAuthKey(response.response_data.authkey);
                    //setauthfieldenable(1);  
                    setLoginReqStatus(false);
                    navigate("/auth", { state: { authkey: response.response_data.authkey, username: username } });
                    break

                case 500: // Internal server error

                    break

                default:

                    setLoginReqStatus(false);
                    setErrorMessages({ name: "error_username", message: errors.email });
                    console.log("OOOPS!!! There is some problem. Plesae try after some time.");

                    break;

            }

        } catch (e) {

            console.log("Error in onReceiveResponse :: " + e);
        }
    }

    function onGotErrorResponse(error, headersData) {

        try {

            setLoginReqStatus(false);
            console.log("[onGotErrorResponse] ERROR :: " + error);
            alert("OOOOPS!!!! Something went wrong. Pleae try again...");

        } catch (e) {

            console.log("Error in onGotErrorResponse :: " + e);
        }
    }

    async function sendLoginRequest() {

        let data = '';
        try {

            console.log('sendLoginRequest ============ ');

            let md5Password = md5(password);
            console.log("md5Password --- " + md5Password);

            let jsonObject = {
                'username': username,
                'password': md5Password,
                'dashboardid': Config.DASHBOARD_ID,
                'CLIENTTYPE': Config.CLIENT_TYPE,
                'userinfo': 'Call Sentiments Info',
                'VERSION': Config.VERSION,
                'ws_system_id': "!@#12",
                'ws_device_name': 'REACT_SENTIMENTS_WEB_APP'
            };

            console.log('[sendLoginRequest] jsonObject ---- ' + JSON.stringify(jsonObject));

            sendPOSTServerRequest(URLParams.REQ_LOGIN, jsonObject, {}, URLParams.REQ_POST, {});

        } catch (e) {

            console.log("ERROR: [sendLoginRequest] ----- error :: " + e);
        }

        return data;
    }

    async function sendDeviceVerificationRequest() {

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

            sendPOSTServerRequest(URLParams.REQ_LOGIN, headersData, {}, URLParams.REQ_POST, {});

        } catch (e) {

            console.log("ERROR: [sendDeviceVerificationRequest] ----- error :: " + e);
        }

    }

    async function sendPOSTServerRequest(req_type, headersData, params, req_method, extra_data) {

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

            /*
            fetch(url, {
                method: 'POST',
                headers: jsonObject,
                body: JSON.stringify({})
              }).then(response => {
    
                resp_status = response.status;
                return response.json();
                    
            }).then((data) => {
    
                onReceiveResponse(jsonObject, data);
            }).catch(function(error) {
    
                console.log("Error in sendPOSTServerRequest :: "+error);
    
                onGotErrorResponse(jsonObject);
            });*/

        } catch (e) {

            console.log('Error in [sendPOSTServerRequest ]:: ' + e);
        }
    }

    const renderErrorMessage = (name) =>

        name === errorMessages.name && (

            <div className="error">{errorMessages.message}</div>
        );


    return (

        <>
            <MDBContainer fluid className="p-5 loginPage" style={{ height: '100vh' }}>

                <img src={Panterra} alt="PanTerra" style={{ width: '180px' }} className='mob-d-none' />

                <div className="h-100 d-flex justify-content-center align-items-center w-100">

                    <MDBRow className="d-flex justify-content-center align-items-center w-100 h-100">

                        <MDBCol md="6" sm={12} className="text-center inputContainer">

                            <form onSubmit={handleSubmit} className='w-sm-100'>
                                <center >
                                    <div className='w-80 w-sm-100'>
                                        <img src={StreamsLogo} alt="PanTerra" style={{ width: '180px', marginBottom: '30px' }} />
                                        <MDBInput size='lg' label="User Name" id="username" name="username_id" onChange={(e) => setusername(e.target.value)} value={username} type="text" className="mb-4" />
                                        <div className="position-relative">
                                            <MDBInput size='lg' label="Password" id="password" type={showPassword ? 'text' : 'password'}
                                                name="password_id" onChange={(e) => setpassword(e.target.value)} className="mb-2" />
                                            <MDBIcon fas icon={showPassword ? 'eye' : 'eye-slash'} onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }} className="inputIconEnd" />
                                        </div>

                                        {auth_field_enable == 1 &&

                                            <MDBInput className='mt-4 mb-2 border-danger'
                                                size='lg'
                                                type="text"

                                                placeholder="Auth Code" name="auth_code" onChange={(e) => setVerificationCode(e.target.value)}

                                            />
                                        }

                                        <div className="d-flex justify-content-between mb-4">
                                            <MDBCheckbox name="flexCheck" value="" id="flexCheckDefault" label="Remember me" />
                                            <a href="#!" className="text-muted" style={{ textDecoration: 'none', color: '#8bc500' }}>Forgot?</a>
                                        </div>
                                        <MDBBtn style={{ backgroundColor: '#8bc500', color: 'white' }} className='shadow-2 py-3 fs-6' block>
                                            Log In
                                        </MDBBtn>

                                        {loginReqStatus == true &&

                                            <div className="d-flex align-items-center jun=stify-content-center flex-column h-100 mt-5">
                                                <MDBIcon className='loading-icon' fas icon='spinner' size='2x' spin />
                                                <span>Authenticating</span>
                                            </div>
                                        }

                                        <p className="mt-4">
                                            <a href="#!" style={{ textDecoration: 'none', color: '#8bc500' }}>Use Single Sign On</a>
                                        </p>
                                    </div>
                                </center>

                            </form>
                        </MDBCol>

                        <MDBCol md="6" className="text-left p-4 mob-d-none  ">
                            <div className="bg-card p-5 shadow-4 rounded-5 w-100 h-100 p-mob-0">
                                <h4 className="mb-3"><strong>Introducing Streams, the revolutionary new way for Businesses to Communicate, Collaborate & Share Information</strong></h4>
                                <ul className="pl-3 loginInstructions mt-5" style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                                    {MessaageConstants.STREAMS_FEATURES.map((feature, index) => (
                                        <div className="d-flex align-items-start mb-4" key={index}>
                                            <img src={checkmark} alt="bullet" style={{ width: '15px', marginRight: '10px' }} />
                                            <li>{feature}</li>
                                        </div>
                                    ))}
                                </ul>
                            </div>
                            <footer className="text-center mt-auto pt-4">
                                <small>©2024 PanTerra Networks, Inc. All rights reserved. | <a href="#!" style={{ textDecoration: 'none', color: '#8bc500' }}>Privacy Policy</a></small>
                            </footer>
                        </MDBCol>
                    </MDBRow >

                </div >
            </MDBContainer >


        </>

    )
}

export default Login;