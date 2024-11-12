
import ServerHandler from '../../classes/utils/ServerHandler'
import EventEmitter from "../utils/EvntEmitter"
import EmitterConstants from '../../config/EmitterConstants'
import Constants from "../../config/Constants"
import IMConstants from "../../config/IMConstants"
import moment from "moment"
import Utils from "../utils/util"
import { Queue } from '../utils/Queue';
import MessageHandler from '../../classes/chat/MessageHandler'
import StreamsHandler from '../../classes/chat/StreamsHandler'
import IMHandler from '../../socket/IMHandler'
import URLParams from '../../config/URLParams'
import Config from '../../config/Config'
import Params from '../../config/Params'
import { Settings } from '../../assets/images'

let handlerInstance

const apiQueue = new Queue();

class UploadHandler {

    constructor() {
        if (handlerInstance) {
            return handlerInstance
        }

        handlerInstance = this
    }

    uploadAttachments(dataObject) {

        try {

            let message = JSON.parse(dataObject.message)
            let uploadList = message.msg
            console.log('[uploadAttachments] uploadList length: ' + uploadList.length)

            let xauthtoken = localStorage.getItem(Params.WS_XAUTH_TOKEN);
            let deviceNameAndsystemId = xauthtoken.replaceAll('-', '')

            let attachmentPath = encodeURIComponent(Constants.ATTACHMENT_PATH);

            uploadList.forEach(async (item) => {

                if (item.isUploadDone || (item.percentage && (item.percentage === 100 || item.percentage > 0))) {

                    console.log('[uploadAttachments]  file: ' + item.filename + ' IS ALREADY UPLOADED')
                    return
                }

                if (item.retry >= 3) {
                    console.log('[uploadAttachments]  file: ' + item.filename + ' IS ALREADY RETRIED MULTIPLE TIMES')
                    return
                }

                if (item.token && item.isUploadDone && !item.isUploadDone) {

                    console.log('[uploadAttachments] filename : ' + item.filename + ' DETAILS ARE ALREADY SAVED IN SERVER, SO JUST UPLOAD THE FILE TO GATEKEEPER, token:' + item.token)

                    this.sendRequestToGateKeeperToUpload(item.token, item, dataObject)
                    return
                }

                let params = [
                    ['Content-Type', item.mediatype],
                    ['FILENAME', item.filename],
                    ['WSContent-Length', item.filesize],
                    ['FILETYPE', '4'],
                    ['CLIENTTYPE', 'WEB'],
                    ['X-Auth-Token', xauthtoken],
                    ['VERSION', '0'],
                    ['ws_device_name', "REACT_SENTIMENTS_WEB_APP"],
                    ['ws_system_id', "!@#12"],
                    ['WORKFOLDERPATH', attachmentPath]
                ]

                //let gateKeeperDomain = localStorage.getItem(Params.GATEKEEPER_DOMAIN)
                let requestUrl = Config.STREAMS_NODE_SERVICE_URL + URLParams.REQ_GET_ATTACHMENT_ID
                //let requestUrl = 'http://localhost:3005' + URLParams.REQ_GET_ATTACHMENT_ID


                apiQueue.add(() => ServerHandler.sendServerRequest_Axios(requestUrl, {},
                    params, 'POST', item, null)
                ).then(({ data, extra_data }) => {

                    console.log('[uploadAttachments] filename: ' + extra_data.filename + ', data: ' + JSON.stringify(data))

                    if (data && data.status_code && (data.status_code * 1) === 1) {

                        this.sendRequestToGateKeeperToUpload(data.token_id, extra_data, dataObject)
                    } else {

                        console.error("[uploadAttachments] SOMETHING WENT WRONG, RETRY AGAIN == : ");
                    }
                })
                    .catch((error) => {

                        //  this.onRetryUploadForError(item, dataObject, error)
                        console.error("[uploadAttachments] Error: ", error);
                    });
            })


        } catch (e) {
            console.log('[uploadAttachments] Exception ' + e)
        }

    }

    async sendRequestToGateKeeperToUpload(token, uploadObject, dataObject) {

        try {

            this.updateTokenIdToAttachment(token, uploadObject, dataObject)

            let gateKeeperDomain = localStorage.getItem(Params.GATEKEEPER_DOMAIN)
            let login_user = localStorage.getItem(Params.WS_LOGIN_USER);
            let requestUrl = gateKeeperDomain + URLParams.REQ_WSGATEKEEPER + '/' + login_user

            console.log('[sendRequestToGateKeeperToUpload] --- requestUrl : ' + requestUrl)
            let headers = {
                'CDGKTOKEN': token
            }

            console.log('[sendRequestToGateKeeperToUpload] --- url : ' + uploadObject.link + ', filename: ' + uploadObject.filename)
            let file = await Utils.createFileFromUrl(uploadObject.link, uploadObject.filename);

            const formData = new FormData();
            formData.append('file', file);

            apiQueue.add(() => ServerHandler.sendServerRequest_Axios(requestUrl, headers,
                formData, 'PUT', uploadObject, (progressEvent) => {

                    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    this.onAttchementProgress(percentage, uploadObject, dataObject)

                })).then(({ data, extra_data }) => {

                    console.log('[sendRequestToGateKeeperToUpload] filename: ' + extra_data.filename, +', data:' + data)

                    this.onAttachmentUploadDone(data, extra_data, dataObject)
                })
                .catch((error) => {

                    //this.onRetryUploadForError(uploadObject, dataObject, error)
                    console.error("[sendRequestToGateKeeperToUpload] Error: ", error);
                });

        } catch (e) {
            console.log('[sendRequestToGateKeeperToUpload] Exception ' + e)
        }

    }

    async updateTokenIdToAttachment(token, uploadObject, dataObject) {

        try {

            let dataList = MessageHandler.getSMSMessages(dataObject.sid)
            if (dataList) {

                let index = dataList.findIndex(object => object.cid == dataObject.cid)
                let existingData = dataList[index]

                let messageObject = JSON.parse(existingData.message)
                //let msgObject = messageObject.msg //JSON.parse(messageObject.msg)

                let msgObject = (typeof messageObject.msg === 'object' && messageObject.msg !== null) ? messageObject.msg : JSON.parse(messageObject.msg);
                let attchmentIndex = msgObject.findIndex(object => object.cid == uploadObject.cid)
                let attachmentObject = msgObject[attchmentIndex]

                attachmentObject.token = token // update token to the upload image/file

                msgObject[attchmentIndex] = attachmentObject
                messageObject.msg = msgObject

                existingData.message = JSON.stringify(messageObject)

                //MessageHandler.addSMSMessage(dataObject.sid, existingData)
                console.log('[updateTokenIdToAttachment] token: ' + token)
            }


        } catch (e) {
            console.log('[updateTokenIdToAttachment] Exception ' + e)
        }

    }

    async onAttachmentUploadDone(responseData, uploadObject, dataObject) {

        try {

            console.log("[onAttachmentUploadDone] ===  ");

            let dataList = MessageHandler.getSMSMessages(dataObject.sid)
            if (dataList && dataList != undefined) {

                let index = dataList.findIndex(object => object.cid == dataObject.cid)
                let existingData = dataList[index]

                let messageObject = JSON.parse(existingData.message)
                //let msgObject = JSON.parse(messageObject.msg)
                let msgObject = (typeof messageObject.msg === 'object' && messageObject.msg !== null) ? messageObject.msg : JSON.parse(messageObject.msg);

                let attchmentIndex = msgObject.findIndex(object => object.cid == uploadObject.cid)
                let attachmentObject = msgObject[attchmentIndex]

                attachmentObject.link = responseData.publiclink
                attachmentObject.isUploading = false
                msgObject[attchmentIndex] = attachmentObject
                messageObject.msg = msgObject
                existingData.message = JSON.stringify(messageObject)

                let failedAttachment = msgObject.filter(value => value.isUploadDone === false);
                // console.log("[onAttachmentUploadDone] failedAttachment " + failedAttachment);
                if (Object.keys(failedAttachment).length === 0 || failedAttachment === null || failedAttachment === undefined) {

                    console.log("[onAttachmentUploadDone] == ALL FILES ARE UPLODED == ");
                    IMHandler.sendChatMessage(existingData)
                }

            }

        } catch (error) {
            console.error("[onAttachmentUploadDone] Error: ", error);
        }

    }

    async onAttchementProgress(percentage, uploadObject, dataObject) {

        try {

            EventEmitter.emit(EmitterConstants.EMMIT_ON_UPLOAD_PERCENTAGE, { cid: uploadObject.cid, percentageValue: percentage })

            let dataList = MessageHandler.getSMSMessages(dataObject.sid)
            if (dataList && dataList != undefined) {

                let index = dataList.findIndex(object => object.cid == dataObject.cid)
                let existingData = dataList[index]

                let messageObject = JSON.parse(existingData.message)
                //let msgObject = messageObject.msg //JSON.parse(messageObject.msg)

                let msgObject = (typeof messageObject.msg === 'object' && messageObject.msg !== null) ? messageObject.msg : JSON.parse(messageObject.msg);
                let attchmentIndex = msgObject.findIndex(object => object.cid == uploadObject.cid)
                let attachmentObject = msgObject[attchmentIndex]

                attachmentObject.isUploadDone = (percentage === 100)
                attachmentObject.isUploading = !(percentage === 100)
                attachmentObject.percentage = percentage

                //msgObject.splice(attchmentIndex, 1, attachmentObject)
                msgObject[attchmentIndex] = attachmentObject

                messageObject.msg = msgObject

                existingData.message = JSON.stringify(messageObject)

                //EventEmitter.emit(EmitterConstants.EMMIT_ON_UPLOAD_PERCENTAGE, { cid: uploadObject.cid, percentageValue: percentage })
            }

        } catch (e) {
            console.error("[onAttchementProgress] Error: ", e);
        }
    }

    async onRetryUploadForError(uploadObject, dataObject, failureReason) {

        try {

            let dataList = MessageHandler.getSMSMessages(dataObject.sid)
            if (dataList && dataList != undefined) {

                let index = dataList.findIndex(object => object.cid == dataObject.cid)
                let existingData = dataList[index]

                let messageObject = JSON.parse(existingData.message)
                // let msgObject = messageObject.msg //JSON.parse(messageObject.msg)
                let msgObject = (typeof messageObject.msg === 'object' && messageObject.msg !== null) ? messageObject.msg : JSON.parse(messageObject.msg);
                let attchmentIndex = msgObject.findIndex(object => object.cid == uploadObject.cid)
                let attachmentObject = msgObject[attchmentIndex]
                let retryCount = attachmentObject.retry + 1
                attachmentObject.retry = retryCount
                attachmentObject.percentage = 0
                attachmentObject.isUploadDone = false
                attachmentObject.isUploading = true

                //msgObject.splice(attchmentIndex, 1, attachmentObject)
                msgObject[attchmentIndex] = attachmentObject

                messageObject.msg = msgObject

                existingData.message = JSON.stringify(messageObject)
                //console.error("[onRetryUploadForError] existingData: " + JSON.stringify(existingData));

                //MessageHandler.addSMSMessage(dataObject.sid, existingData)

                if (retryCount > 3) {
                    console.error("[onRetryUploadForError] retryCount: ", retryCount + ' is Exceed to upload the file');
                    return
                }

                this.uploadAttachments(existingData)

            }

        } catch (error) {
            console.error("[onRetryUploadForError] Error: ", error);
        }
    }

}

let uploadHandlerInstance = Object.freeze(new UploadHandler())
export default uploadHandlerInstance;