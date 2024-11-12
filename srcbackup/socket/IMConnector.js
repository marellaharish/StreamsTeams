
import IMConstants from '../config/IMConstants'
import IMHandler from './IMHandler'
import Utils from '../classes/utils/util'
import Config from '../config/Config'
import EmitterConstants from '../config/EmitterConstants'
import Constants from '../config/Constants'
import evntEmitter from "../classes/utils/EvntEmitter"


let instance;
let timerID;
let socket;
let sockPingTime;
let triggeredTime = 0

class IMConnector {

    constructor() {

        try {

            if (instance) {

                return;
            }

            instance = this;

        } catch (e) {

            console.log("[constructor] Error :: " + e);
        }
    }

    connectToIM() {

        try {

            let URL = "wss://im1.beta-wspbx.com/wschat";//'wss://devim8.beta-wspbx.com/wschat' 
            let isIMConnected = this.isIMConnected()

            if (socket) {
                console.log('[connectToIM] IM ALREADY CONNECTED , socket: ' + socket);
                return
            }

            console.log("[connectToIM] -------------- URL :: " + URL + " :: isIMConnected : " + isIMConnected);

            socket = new WebSocket(URL)

            socket.onopen = function (event) {

                try {

                    if (socket.readyState === WebSocket.OPEN) {

                    }

                    console.log("Connection established ----- ");

                    var user_auth_msg = IMHandler.getUserAuthendicationDetails();

                    var message = Utils.doFormat(IMConstants.IM_PROTO_CONNECT, user_auth_msg, true);

                    //console.log('message --- ' + message);

                    // let json_obj = { name: 'sunil' };
                    // evntEmitter.emit(EmitterConstants.EMITT_ON_IM_CONNECTED, json_obj);

                    handlerInstance.sendMessage(message);
                    handlerInstance.setPingTime()
                    handlerInstance.startPingTimer();

                } catch (e) {

                    console.log('[onopen] Error  -------- :: ' + e);
                }
            }

            socket.onmessage = function (event) {

                try {

                    // console.log("Message from server :: " + event.data);

                    let message = Utils.convertXML_JSON(event)
                    if (message == null || !message) {

                        console.log("[onmessage] =========== UNABLE TO CONVERT THE XML DATA ========== ");
                        return;
                    }

                    IMHandler.processIncomingMessage(message);

                } catch (e) {

                    console.log('[onmessage] Exception: ' + e);
                }

                return false
            }

            socket.onclose = function (event) {

                try {

                    console.log('[onclose]  -------- code: ' + event.code + ', reason: ' + event.reason + ', wasClean: ' + event.wasClean);

                } catch (e) {

                    console.log('[onclose] Exception: ' + e);
                }
            }

            socket.onerror = function (err) {

                try {
                    console.log('[onerror] Error :: ' + err);
                    handlerInstance.closeSocket()
                } catch (e) {

                    console.log('[onerror] Exception: ' + e);
                }
            }

        } catch (e) {

            console.log('[connectToIM] Exception: ' + e);
        }
    }

    isIMConnected() {
        return (socket && socket != undefined & socket.readyState === WebSocket.OPEN)
    }

    sendMessage(message) {

        try {
            if (!message.includes(IMConstants.PROTO_PING_IMSERVER) && !message.includes(IMConstants.PROTO_IM_CHAT_ACK)) {
                console.log('[sendMessage] message send: ' + message)
            }

            if (this.isIMConnected()) {
                socket.send(message)
            }
        } catch (e) {

            console.log('[sendMessage] Error -------- :: ' + e);
        }
    }

    sendPingToSocket = () => {

        try {

            // sockPingTime = Date.now()
            handlerInstance.sendMessage(IMConstants.IM_PROTO_PING)

        } catch (e) {

            console.log('[sendPingToSocket] Error -------- :: ' + e);
        }
    }

    closeSocket = () => {

        try {

            console.log('[closeSocket] socket :: ' + socket);
            if (socket && socket != undefined) {

                socket.close()
            }

            socket = null;
            handlerInstance.cancelPingTimer()

        } catch (e) {

            console.log('[closeSocket] Error -------- :: ' + e);
        }

    }

    setPingTime = () => {

        sockPingTime = Date.now()
    }

    startPingTimer = () => {

        try {

            console.log("[startPingTimer] ==================");

            timerID = setInterval(() => {

                let difference = Math.floor((Date.now() - triggeredTime) / 1000)

                if (triggeredTime === 0 || difference > 3) {
                    //console.log('[startPingTimer] difference :: ' + difference);
                    triggeredTime = Date.now()
                    this.checkSocketPingTimoutAndReconnect()

                }

            }, Constants.PING_INTERVAL * 1000);

        } catch (e) {

            console.err('[startPingTimer] Error -------- :: ' + e);
        }
    }

    checkSocketPingTimoutAndReconnect() {

        try {

            let difference = Math.floor((Date.now() - sockPingTime) / 1000)
            // console.log('[checkSocketPingTimoutAndReconnect] difference :: ' + difference);

            if (difference > Constants.CONNECTION_PINGTIME_OUT) {

                this.closeSocket()
                this.cancelPingTimer();
                this.connectToIM()

            } else {

                this.sendPingToSocket();
            }

        } catch (e) {

            console.err('[checkSocketPingTimoutAndReconnect] Error -------- :: ' + e);
        }
    }

    cancelPingTimer = () => {
        try {

            if (timerID) {

                clearInterval(timerID);
            }

        } catch (e) {

            console.log('[cancelPingTimer] Error -------- :: ' + e);
        }
    }

}

let handlerInstance = Object.freeze(new IMConnector());
export default handlerInstance; 