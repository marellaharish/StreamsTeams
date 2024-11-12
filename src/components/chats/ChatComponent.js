import Attachments from './Attachments';
import Utils from '../../classes/utils/util';
import { Comment, Copy, Delete, Emoji, Forward, Edit, Reply, Profile, Send, Upload, Settings } from '../../assets/images';
import Constants, { REQ_TYPE_SMS_ACTION } from "../../config/Constants"

import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBInput,
    MDBCheckbox,
    MDBIcon,
    MDBTextArea
} from 'mdb-react-ui-kit';
import { el } from 'date-fns/locale';

class ChatComponents {

    displaySMS_MMS_Message(message, onClickSMSAction, editedMessage, setEditedMessage, editedsmsgid, setEditedsmsgid) {

        try {

            // let messageData = JSON.parse(data)
            let parsedFailureReason = null;
            let parsedMessage = null

            try {
                parsedMessage = JSON.parse(message.message);
            } catch (error) {
                console.error("Error parsing message:", error);
            }

            // Try parsing message.failure_reason if it exists
            if (message.failure_reason) {
                try {
                    parsedFailureReason = JSON.parse(message.failure_reason);
                } catch (error) {
                    console.error("[displaySMS_MMS_Message]Error parsing failure_reason:", error);
                }
            }

            const messageFrom = parsedMessage?.from || '';
            const messageTo = parsedMessage?.to || '';
            const messageContent = parsedMessage?.msg || [];

            // console.log('[displaySMS_MMS_Message] -- parsedFailureReason: ' + JSON.stringify(parsedFailureReason))

            return (

                <div className='w-100'>

                    <div>

                        <p>{
                            (() => {

                                let description = message.delivery_status === -1 ? 'SMS message sending to' : 'SMS message sent to'

                                return (
                                    <div>
                                        <p
                                            style={{ fontSize: 14, lineHeight: 1.5 }}
                                            className={`${(parsedFailureReason && parsedFailureReason.reason &&
                                                parsedFailureReason.reason.length > 0
                                            ) ? "text-danger fw-bold"
                                                : "text-secondary"
                                                }`}
                                        >
                                            {parsedFailureReason && parsedFailureReason.reason ? (

                                                <>
                                                    SMS message could not be sent to {messageTo} from {messageFrom}{" "}
                                                    {parsedFailureReason.reason && (
                                                        <>
                                                            as {parsedFailureReason.reason + ' '}
                                                        </>
                                                    )}
                                                    {parsedFailureReason.errcode.length > 0 && (
                                                        <>
                                                            ErrorCode: {parsedFailureReason.errcode}
                                                        </>
                                                    )}
                                                </>

                                            ) : (

                                                <>
                                                    {description}
                                                    <b>{' ' + messageTo}</b> from
                                                    <b>{' ' + messageFrom}</b>
                                                </>

                                            )}

                                        </p>
                                    </div>
                                )
                            })()
                        }</p>


                        {/* Display message content */}

                        {(editedsmsgid * 1 === message.smsgid * 1) ?
                            (
                                <div className="edit-mode">
                                    <MDBTextArea
                                        value={editedMessage}
                                        onChange={(e) => setEditedMessage(e.target.value)}
                                    />
                                    <div className="mt-2">
                                        <MDBBtn onClick={() => {
                                            setEditedsmsgid(undefined)
                                            onClickSMSAction(message, REQ_TYPE_SMS_ACTION.ACTION_EDIT)
                                        }}>
                                            Save Changes
                                        </MDBBtn>
                                        <MDBBtn onClick={() => setEditedsmsgid(undefined)} className='ms-2' color='secondary'>Cancel</MDBBtn>
                                    </div>
                                </div>
                            ) :
                            (
                                <>
                                    <p className='messageAlign'>{
                                        (() => {

                                            //  console.log("[ShowSMSOrSMSChat] message: " + JSON.stringify(message));

                                            if (Array.isArray(messageContent)) {
                                                return (<div><Attachments element={messageContent} /></div>)

                                            } else {

                                                return messageContent;
                                            }

                                        })()
                                    }</p>
                                </>
                            )}

                    </div>

                    {!(editedsmsgid * 1 === message.smsgid * 1) && (
                        <>
                            <div className='d-flex align-items-center mt-2 w-sm-100'>

                                {message.direction == 2 && (
                                    <>
                                        <div className="cursor-pointer me-3 text-small" onClick={() => onClickSMSAction(parsedMessage, REQ_TYPE_SMS_ACTION.ACTION_REPLY)}>
                                            <img src={Reply} alt="Reply" className="replyIcons" />
                                        </div>

                                    </>
                                )}

                                {message.direction == 1 && (
                                    <>

                                        {message.delivery_status && message.delivery_status > 0 ? (
                                            <>

                                                <div className="cursor-pointer me-3 text-small" onClick={() => onClickSMSAction(parsedMessage, REQ_TYPE_SMS_ACTION.ACTION_SEND_ANOTHER)}>
                                                    <img src={Send} alt="Send another SMS message" className="replyIcons" />
                                                </div>

                                            </>
                                        ) : (
                                            <>

                                                <div className="cursor-pointer me-3 text-small" onClick={() => onClickSMSAction(message, REQ_TYPE_SMS_ACTION.ACTION_RESEND)}>
                                                    <img src={Send} alt="Resend" title="" className="replyIcons" />
                                                </div>

                                                <div className="cursor-pointer me-3 text-small" onClick={() => {
                                                    setEditedMessage(parsedMessage.msg)
                                                    setEditedsmsgid(message.smsgid)
                                                }}>
                                                    <img src={Edit} alt="Edit" className="replyIcons" />
                                                </div>
                                            </>

                                        )}

                                        <div className='d-flex align-items-center cursor-pointer me-3' onClick={() => onClickSMSAction(message, REQ_TYPE_SMS_ACTION.ACTION_DELETE)}>
                                            <img src={Delete} alt="" className='replyIcons' />
                                        </div>

                                    </>
                                )}

                                <div className='d-flex align-items-center cursor-pointer' onClick={() => onClickSMSAction(parsedMessage, REQ_TYPE_SMS_ACTION.ACTION_COPY)}>
                                    <img src={Copy} alt="" className='replyIcons' />
                                </div>

                            </div>

                        </>
                    )}

                </div>

            )

        } catch (error) {
            console.log('[ChatComponents].displaySMS_MMS_Message() Error :: ' + error);
        }
    }

    showSMSPopUp(title, smsPopupInputs, setSMSPopupInputs, isPopUpVisible, setPopUpVisible, onClick) {
        try {

            if (smsPopupInputs === undefined || smsPopupInputs === null || Object.keys(smsPopupInputs).length <= 0) {
                console.log('[showSMSPopUp] == POPUP INPUTS ARE EMPTY ==  ')
                return
            }

            return (
                <>
                    <MDBModal open={isPopUpVisible} tabIndex='-1' setOpen={setPopUpVisible}>
                        <MDBModalDialog centered>
                            <MDBModalContent>
                                <MDBModalHeader>
                                    <MDBModalTitle className="fw-bold">{title}</MDBModalTitle>
                                    <MDBIcon fas icon='times' size='xl' onClick={() => setPopUpVisible(false)} />
                                </MDBModalHeader>
                                <MDBModalBody>

                                    <p>
                                        You cannot send SMS message as the phone number is no longer associated with the user. Try another phone number.
                                    </p>
                                    <strong className="my-2 d-block">To Number</strong>
                                    <div className="ms-0 w-50">
                                        <MDBInput
                                            placeholder="Enter To Number"
                                            type="text"
                                            value={smsPopupInputs.to}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                console.log('[showSMSPopUp] to: ' + value + ',to: ' + smsPopupInputs.to)
                                                if (/^\d*$/.test(value)) {
                                                    setSMSPopupInputs(prevState => ({
                                                        ...prevState,
                                                        to: value
                                                    }));
                                                }

                                            }}
                                            maxLength="11"
                                        />
                                        {smsPopupInputs.to && smsPopupInputs.to.length < 3 && (
                                            <p className="text-danger">Please enter a phone number with at least 3 digits and not exceeding 11 digits.</p>
                                        )}
                                    </div>
                                    <strong className="my-2 d-block">From Number</strong>
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                        {Array.isArray(smsPopupInputs.did_list) && smsPopupInputs.did_list.length > 1 ? (
                                            <div className="d-flex align-items-center w-50">
                                                <p className="lh-0 me-2">DID&nbsp;-&nbsp;</p>
                                                <select
                                                    className="form-select"
                                                    value={smsPopupInputs.from}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSMSPopupInputs(prevState => ({
                                                            ...prevState,
                                                            from: value
                                                        }));
                                                    }}
                                                >
                                                    {smsPopupInputs.did_list.map((did, index) => (
                                                        <option key={index} value={did}>
                                                            {did}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <p>DID - {smsPopupInputs.did_list[0]}</p>
                                        )}
                                        {smsPopupInputs.did_list.length > 1 && (
                                            <div>
                                                <MDBCheckbox
                                                    id="controlledCheckbox"
                                                    label="Always use this DID"
                                                    checked={smsPopupInputs.isEnableAlwaysUseDID}
                                                    onChange={(e) => {
                                                        setSMSPopupInputs(prevState => ({
                                                            ...prevState,
                                                            isEnableAlwaysUseDID: e.target.checked
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                </MDBModalBody>
                                <MDBModalFooter>
                                    <MDBBtn color='secondary' onClick={() => setPopUpVisible(false)}>
                                        Cancel
                                    </MDBBtn>
                                    <MDBBtn onClick={() => {

                                        console.log('length :: ' + smsPopupInputs.to.length);
                                        if ((smsPopupInputs.to.length * 1) >= 3) {

                                            //smsPopupInputs.message = 'hi sunil'
                                            setPopUpVisible(false)
                                            onClick(smsPopupInputs)
                                        }

                                    }}>Send</MDBBtn>
                                </MDBModalFooter>
                            </MDBModalContent>
                        </MDBModalDialog>
                    </MDBModal>
                </>
            );
        } catch (error) {
            console.log('[ChatComponents].showSMSPopUp() Error :: ' + error);
        }
    }

    showSMSBanner(data, setSMSBannerVisible, setIsModalVisible) {

        try {

            return (

                <div id='smspop-bar' className='w-100 bg-success rounded-6 px-4 mt-2 d-flex align-items-center justify-content-between py-1'
                    onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsModalVisible(true)
                    }}>
                    <div style={{ fontSize: '13px', color: 'white' }}>
                        <>
                            SMS message sent to
                            <b>
                                {' ' + ((data && data != undefined) ? data.to : '')}
                            </b>
                            from
                            <b>
                                {' ' + ((data && data != undefined) ? data.from : '')}
                            </b>
                        </>
                    </div>
                    <div>
                        <MDBIcon fas icon='times' color='light'
                            onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                setSMSBannerVisible(false)
                            }} />
                    </div>
                </div>
            )

        } catch (error) {
            console.log('[ChatComponents].showSMSBanner() Error :: ' + error);
        }

    }


}

let chatComponents = Object.freeze(new ChatComponents())
export default chatComponents