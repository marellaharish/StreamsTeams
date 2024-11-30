import React, { useEffect, useRef, useState } from "react";
import { MDBCard, MDBCardHeader, MDBIcon } from "mdb-react-ui-kit";
import { Enter, Profile } from "../../assets/images";
import { isIOS, isAndroid, isMobile } from 'react-device-detect';

import Constants from "../../config/Constants"
import { showToast } from '../../views/home/ToastView'
import SettingsHandler from '../../classes/settings/SettingsHandler'
import Uitls from "../../classes/utils/util"

let TAG = "[DialPad.js]."

const DialPadKeys = ({ onNumberClick }) => {
    const buttons = [
        { number: "1", letters: "" },
        { number: "2", letters: "ABC" },
        { number: "3", letters: "DEF" },
        { number: "4", letters: "GHI" },
        { number: "5", letters: "JKL" },
        { number: "6", letters: "MNO" },
        { number: "7", letters: "PQRS" },
        { number: "8", letters: "TUV" },
        { number: "9", letters: "WXYZ" },
        { number: "*", letters: "" },
        { number: "0", letters: "+" },
        { number: "#", letters: "" },
    ];

    const openNewWindow = () => {
        const url = 'http://localhost:3000/softphone'; // Replace with your desired URL
        const windowFeatures = 'width=360,height=580,resizable=no'; // Disable resizing
        window.open(url, '_blank', windowFeatures);
    };



    return (
        <div className="dialpad-container">
            <div className="dialpad-grid">
                {buttons.map((btn, index) => (
                    <button key={index} className="dialpad-button" onClick={() => onNumberClick(btn.number)}>
                        {btn.number}
                        <span className="dialpad-letters">{btn.letters}</span>
                    </button>
                ))}
            </div>
            <button className="dialpad-call-button" onClick={openNewWindow}>
                <i className="fas fa-phone"></i>
            </button>
        </div>
    );
};


const SearchReasult = ({ profileImage, name, extension, number, onClick }) => {
    return (
        <div className={`d-flex align-items-center p-2  mt-3 cursor-pointer didBuddy`} onClick={onClick}>
            <img
                src={profileImage}
                className='searchProfile'
            />
            <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                <p className='contactTeamName'>
                    {name} <i class="fas fa-address-book text-primary"></i>
                </p>
                <div className="d-flex align-items-center justify-content-between">
                    <p>
                        ({extension}) {number}
                    </p>
                    <p className='text-secondary'>Mobile</p>
                </div>
            </div>
        </div>
    )
}

const DialPad = ({ dailpadNumberClick, onClickSMSDID, onDialSMSFromDialPad }) => {


    const [inputValue, setInputValue] = useState("");
    const [showDialPad, setShowDialPad] = useState(true); // Dial pad is visible initially
    const [isFirstInputFromDialPad, setIsFirstInputFromDialPad] = useState(false); // To track the first input method
    const inputRef = useRef(null); // For autofocus

    const primaryDID = localStorage.getItem(Constants.WS_KEY_SMS_ALWAYS_USE_DID);

    // Filter the members based on inputValue
    /*const filteredMembers = allData.filter(member =>
        member.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        member.phoneNumber.includes(inputValue) ||
        member.extension.includes(inputValue)
    );*/

    // Handle number click from the dial pad
    const handleNumberClick = (number) => {

        try {

            if (inputValue.length === 0) {

                setIsFirstInputFromDialPad(true);
            }

            Uitls.playDialPadTones(number);

            setInputValue((prev) => prev + number);
            setShowDialPad(true); // Ensure dial pad remains visible when clicking
            inputRef.current.focus(); // Ensure input remains focused

        } catch (e) {

            console.log(TAG + "[handleNumberClick] Error :: " + e);
        }

    };

    const handleKeyboardInput = (e) => {

        try {

            if (inputValue.length === 0) {
                // If the first input is from the keyboard, hide the dial pad
                setIsFirstInputFromDialPad(false);
                setShowDialPad(false);
            }

            setInputValue(e.target.value);

        } catch (e) {

            console.log(TAG + "[handleKeyboardInput] Error :: " + e);
        }
    };


    const handleBackspace = () => {

        try {

            setInputValue((prev) => prev.slice(0, -1)); // Remove the last character

            if (inputValue.length === 1) {
                // If input becomes empty, reset the dial pad visibility
                setShowDialPad(true);
                setIsFirstInputFromDialPad(false); // Reset the input tracking
            }

        } catch (e) {

            console.log(TAG + "[handleBackspace] Error :: " + e);
        }
    };

    // Show dial pad if input is empty
    useEffect(() => {

        try {

            console.log(TAG + "[useEffect] Default ---- :: ");

            if (inputValue.length === 0) {

                setShowDialPad(true);
            }
        } catch (e) {

            console.log(TAG + "[useEffect] Error :: " + e);
        }

    }, [inputValue]);


    const handleKeyPress = (e) => {

        console.log(`Keyboard Key Clicked: ${e.key}`); // Log keyboard input
    };

    const onClickSMS = () => {

        try {

            console.log(TAG + "[onClickSMS] inputValue :: " + inputValue)

            if (!inputValue || inputValue === '' || inputValue.length < 3) {
                showToast('Please enter valid name or number')
                return
            }

            let phnumber = (inputValue * 1)
            let userData = {

                'isNavigatedFromDialpad': true,
                'phnumber': phnumber
            }

            if (isMobile || isIOS || isAndroid) {

                // navigate('/chat', { state: { userData } });
            } else {

                onDialSMSFromDialPad(userData)
                onClickSMSDID(userData);
            }

            setShowDialPad(false)
            setIsFirstInputFromDialPad(false);
            setInputValue('')

            SettingsHandler.loadSMSMessages('', phnumber, Constants.SMS_CHAT_TYPES.WS_ONE_TO_ONE_SMS, {});

        } catch (e) {

            console.log(TAG + "[onClickSMS] Error :: " + e);
        }

    }


    return (
        <div className="users-view-container-full dialpadMain">

            <MDBCard className='shadow-0 bg-transparent'>
                <MDBCardHeader className=' border-0 d-flex align-items-center justify-content-between'>
                    <div className='tabsHeader'>
                        Dialpad</div>
                    <div className="cursor-pointer" title="SMS" onClick={onClickSMS}><MDBIcon fas icon="comment-alt" /></div>

                    {
                        localStorage.getItem(Constants.WS_KEY_SMS_ENABLED_STATUS) === true ?

                            (<div className="cursor-pointer" title="SMS" onClick={onClickSMS}><MDBIcon fas icon="comment-alt" /></div>)
                            :
                            ("")
                    }

                </MDBCardHeader>
            </MDBCard>


            <div className="dialpadView">
                {primaryDID && primaryDID != null && primaryDID != "undefined"
                    && (<p className="my-4">My Caller ID: {primaryDID}</p>)
                }
                <div className="position-relative w-100">
                    {/* Input field */}
                    <input
                        ref={inputRef} // Reference for autofocus
                        className="w-100 dailpadInput"
                        placeholder="Enter a name or number"
                        value={inputValue}
                        onFocus={() => setShowDialPad(true)} // Show dial pad when input is focused
                        onChange={handleKeyboardInput} // Detect keyboard input
                        onKeyDown={handleKeyPress} // Log key press
                    />

                    {/* Show backspace icon only if there's input */}
                    {inputValue.length > 0 && (
                        <MDBIcon
                            fas
                            icon="backspace"
                            size="lg"
                            color="secondary"
                            className="inputIconEnd cursor-pointer"
                            title="Clear"
                            onClick={handleBackspace} // Trigger backspace function
                        />
                    )}
                </div>

                {/* Dial Pad */}
                {/* Dial Pad */}
                {showDialPad ? (
                    <div className="mt-4">
                        <DialPadKeys onNumberClick={handleNumberClick} />
                    </div>
                ) :
                    <>
                        <div className="w-100 searchReasult">
                            <div className={`d-flex align-items-center p-2  mt-3 mb-0 cursor-pointer didBuddy w-100`}>
                                <img
                                    src={Profile}
                                    className='searchProfile'
                                />
                                <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                                    <p className='contactTeamName'>
                                        Dial:
                                    </p>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <p>
                                            {inputValue}
                                        </p>
                                        <img src={Enter} width={15} />
                                    </div>
                                </div>
                            </div>
                            <div className="w-100">
                                {/* {filteredMembers.map((member, index) => {
                                    return (
                                        <>
                                            <SearchReasult profileImage={Profile} name={member.name} extension={member.extension} number={member.phoneNumber} onClick={() => dailpadNumberClick(member)} />
                                        </>
                                    )
                                })} */}
                            </div>
                        </div>
                    </>}
            </div>
        </div>
    )
}


export default DialPad;











