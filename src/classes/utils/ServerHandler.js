
import Config from "../../config/Config";
import axios from "axios";
import Params from "../../config/Params";
import URLParams from "../../config/URLParams"

class ServerHandler {

    getHeaders() {

        let headers = {

            agentid: localStorage.getItem(Params.WS_LOGIN_USER),
            sbusertype: localStorage.getItem(Params.WS_SB_USER_TYPE),
            xauthtoken: localStorage.getItem(Params.WS_XAUTH_TOKEN)
        };

        return headers;
    }

    sendServerRequest(req_type, headersData, params, req_method, extra_data) {

        try {

            let headersInfo = this.getHeaders();

            headersData = { ...headersInfo, ...headersData }

            let resp_status;
            let url = Config.STREAMS_NODE_SERVICE_URL + req_type;

            url = this.setParams(url, params);

            console.log("[sendServerRequest] ========== url :: " + url + " :: req_method :: " + req_method + " :: headersData :: " + JSON.stringify(headersData) + " :: extra_data :: " + JSON.stringify(extra_data));

            return new Promise((resolve, reject) => {

                try {

                    console.log("[sendServerRequest] ====Promise====== ");

                    fetch(url, {

                        method: req_method,
                        headers: headersData,
                        ...(req_method === 'POST' ? { body: JSON.stringify({}) } : '')

                    }).then(response => {

                        resp_status = response.status;
                        return response.json();

                    }).then((response_data) => {

                        response_data.resp_status = resp_status;
                        resolve({ response_data, extra_data });

                    }).catch(function (error) {

                        console.log("Error in sendServerRequest :: " + error);
                        reject({ error, extra_data });
                    });

                } catch (e) {

                    console.log('Error in [sendServerRequest ]:: ' + e);
                    reject({ e, headersData });
                }
            });

        } catch (e) {

            console.log('Error in [sendServerRequest ]:: ' + e);
        }
    }

    sendGETServerRequest(req_type, headersData, params) {

        try {

            let headersInfo = this.getHeaders();

            headersData = { ...headersInfo, ...headersData }

            let resp_status;
            let url = Config.STREAMS_NODE_SERVICE_URL + req_type;

            url = this.setParams(url, params);

            console.log("[sendGETServerRequest] ========== ");

            return new Promise((resolve, reject) => {

                try {

                    console.log("[sendGETServerRequest] ====Promise====== url :: " + url);

                    fetch(url, {
                        method: 'GET',
                        headers: headersData,
                        mode: 'cors'
                    }).then(response => {

                        console.log('in resp');
                        resp_status = response.status;
                        return response.json();

                    }).then((response_data) => {

                        response_data.resp_status = resp_status;
                        resolve({ response_data, headersData });

                    }).catch(function (error) {

                        console.log("Error in sendGETServerRequest :: " + error);
                        reject({ error, headersData });
                    });

                } catch (e) {

                    console.log('Error in [sendGETServerRequest ]:: ' + e);
                    reject({ e, headersData });
                }
            });

        } catch (e) {

            console.log('Error in [sendGETServerRequest ]:: ' + e);
        }
    }

    sendServerRequest_Axios(url, headersData, params, req_method, extra_data, onProgressBar) {

        try {

            if (!url.includes(URLParams.REQ_WSGATEKEEPER)) {

                let headersInfo = this.getHeaders();

                headersData = { ...headersInfo, ...headersData }
            }

            console.log("[sendServerRequest_Axios] ====Promise====== URL :: " + url + " :: headersData :: " + JSON.stringify(headersData) + " :: params :: " + JSON.stringify(params));

            return new Promise((resolve, reject) => {

                try {

                    axios({
                        method: req_method,
                        url: url,
                        headers: headersData,
                        data: params,
                        onUploadProgress: onProgressBar

                    }).then((response) => {

                        let data = {}
                        if (response.data) {

                            data = { ...data, ...response.data }
                        }

                        if (response.headers) {//This is for MMS or Picture upload. GK will send the link in headers.

                            data = { ...data, ...response.headers }
                        }

                        console.log("[sendServerRequest_Axios] data :: " + JSON.stringify(data));

                        resolve({ data, extra_data });

                    }).catch((error) => {

                        console.log("[sendServerRequest_Axios] Error :: " + error);
                        reject({ error, extra_data });
                    })


                } catch (e) {

                    console.log('[sendServerRequest_Axios] Error :: ' + e);
                    reject({ e, headersData });
                }
            });

        } catch (e) {
            console.log('[sendServerRequest_Axios] Error :: ' + e);
        }
    }

    sendApiHandlerRequest(requestType, params, extra_data, headersData, req_method) {

        try {

            let headersInfo = this.getHeaders();

            headersData = { ...headersInfo, ...headersData }

            let requestUrl = Config.STREAMS_NODE_SERVICE_URL
            requestUrl = requestUrl + requestType

            return new Promise((resolve, reject) => {

                try {

                    console.log("[sendApiHandlerRequest] ====Promise====== requestUrl :: " + requestUrl + " :: message_data :: " + JSON.stringify(params));

                    axios({
                        method: req_method,
                        url: requestUrl,
                        headers: headersData,
                        data: params,
                    }).then((response) => {

                        let data = response.data
                        console.log("[sendApiHandlerRequest] data :: " + JSON.stringify(data));

                        resolve({ data, extra_data });

                    }).catch((error) => {

                        console.log("[sendApiHandlerRequest] Error :: " + error);
                        reject({ error, extra_data });
                    })

                } catch (e) {

                    console.log('[sendApiHandlerRequest] Error :: ' + e);
                    reject({ e, headersData });
                }
            });


        } catch (e) {
            console.log('[sendApiHandlerRequest] Error :: ' + e);
        }
    }

    setParams(url, params) {

        try {

            let queryString = "";
            console.log('setParams ==== params :: ' + JSON.stringify(params));

            if (params && Object.keys(params).length > 0) {

                Object.entries(params).forEach(([key, value]) => {

                    console.log('key -- ' + key + " :: " + value);

                    let val = encodeURIComponent(value);

                    let delimiter = (queryString == '' ? "?" : "&");

                    queryString = queryString + delimiter + key + "=" + val;
                });

                if (queryString != '') {

                    url = url + queryString;
                }
            }

        } catch (e) {

            console.log('Error in [setParams ]:: ' + e);
        }

        return url;
    }

}

let handlerInstance = Object.freeze(new ServerHandler());

export default handlerInstance; 