import React, { useEffect, useRef, useState } from 'react';
import {
    MDBContainer,
    MDBNavbar,
    MDBNavbarBrand,
    MDBNavbarToggler,
    MDBIcon,
    MDBNavbarNav,
    MDBNavbarItem,
    MDBNavbarLink,
    MDBBtn,
    MDBDropdown,
    MDBDropdownToggle,
    MDBDropdownMenu,
    MDBDropdownItem,
    MDBCollapse,
    MDBInput,
    MDBRadio,
} from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';

import { Iconsearch, StreamsLogo, Profile, StreamsLogoLight } from '../../assets/images';
import SettingsHandler from "../../classes/settings/SettingsHandler"
import DarkMode from "../../components/utils/DarkMode"
import Params from "../../config/Params"
import IMConnector from '../../socket/IMConnector'

let TAG = "[Header.js]."
export default function Header({ onLoad, onMessageSearch, setSearchLoadingStatus }) {

    const [uploadStatus, setUploadStatus] = useState('');
    const [searchString, setSearchString] = useState("");
    const [selectedStatus, setSelectedStatus] = useState('On Desktop');

    const [isThemeOptionsVisible, setIsThemeOptionsVisible] = useState(false);
    const [isDropDownVisible, setIsDropDownVisible] = useState(false);

    const navigate = useNavigate();

    const dropdownRef = useRef(null);

    const statusOptions = [
        { label: 'On Desktop', bgClass: 'onlineStatus' },
        { label: 'Be Right Back', bgClass: 'onlineStatus bg-danger' },
        { label: 'Busy', bgClass: 'onlineStatus bg-danger' },
        { label: 'Not At My Desk', bgClass: 'onlineStatus bg-danger' },
        { label: 'Out To Lunch', bgClass: 'onlineStatus bg-danger' },
        { label: 'Stepped Out', bgClass: 'onlineStatus bg-danger' },
        { label: 'Appear Offline', bgClass: 'onlineStatus bg-secondary' },
    ];

    useEffect(() => {

        console.log('[Header].useEffect() in statement ----');

        //onLoad();

    }, [onLoad]);

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);

        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    const onClickProfilePicUpload = async (event) => {

        try {

            event.preventDefault();

            console.log(TAG + "[onClickProfilePicUpload] ======== ");

            let selectedFile = event.target.files[0];
            if (!selectedFile) {

                alert('Please select a file.');
                return;
            }

            // Create a FormData object to send the file
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                // Send a POST request to the Java server
                const response = await fetch('', {

                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {

                    setUploadStatus('File uploaded successfully!');
                } else {

                    setUploadStatus('File upload failed.');
                }

            } catch (error) {

                setUploadStatus('Error uploading file: ' + error.message);
            }

        } catch (e) {
            console.log(TAG + "[onClickProfilePicUpload] Error :: " + e);
        }

    }

    const onSearchKeyDown = (event) => {

        try {

            if (event.key === "Enter") {

                //send server request

                let searchKeyWord = event.target.value;
                console.log("Enter key was pressed :: searchKeyWord :: " + searchKeyWord);

                if (searchKeyWord !== '') {

                    console.log(TAG + "[startMessageSearch] SEARCH KDEY :: " + searchKeyWord);

                    onMessageSearch(true)
                    SettingsHandler.loadSearchMessagesFromDB(searchKeyWord);
                }
            }

        } catch (e) {

            console.log(TAG + '[onSearchKeyDown] Error :: ' + e);
        }
    }

    const startMessageSearch = (event) => {

        try {

            let searchKeyWord = event.target.value;
            console.log(TAG + "[startMessageSearch] : " + searchKeyWord);

            if (searchKeyWord == '') {

                console.log(TAG + "[startMessageSearch] : NO SEARCH KEY FOUND ----");

                onMessageSearch(false);
            }

            setSearchString(searchKeyWord);

        } catch (e) {

            console.log('[startMessageSearch] Error :: ' + e);
        }
    }

    const handleStatusChange = (label) => {
        setSelectedStatus(label);
    };

    const toggleDropdownMenu = () => {
        setIsDropDownVisible(!isDropDownVisible);
    };

    const handleOutsideClick = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropDownVisible(false);
            setIsThemeOptionsVisible(false);
        }
    };

    const toggleThemeOptions = () => {
        setIsThemeOptionsVisible(!isThemeOptionsVisible);
    };

    const closeDropdownMenu = () => {
        setIsDropDownVisible(false);
        setIsThemeOptionsVisible(false);
        window.location.reload();
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

    const handleClearInput = () => {
        setSearchString('');
    };

    return (
        <MDBNavbar expand='lg' className='py-3 pe-2 shadow-0 mob-d-none ps-1'>
            <MDBContainer fluid className='d-flex align-items-center justify-content-between pe-1 ps-0'>
                {/* <img src={StreamsLogoLight} className='headerLogo' /> */}
                <div className="headerLogo">

                </div>

                <div className='w-30'>

                    <div className="position-relative">
                        <MDBInput size='lg' value={searchString} placeholder='Message Search' onChange={(e) => { startMessageSearch(e) }} onKeyDown={onSearchKeyDown} />
                        {searchString ? (
                            <>
                                <MDBIcon fas icon="times" onClick={handleClearInput} className='inputIconEnd cursor-pointer' />
                            </>)
                            :
                            (
                                <>
                                    <img src={Iconsearch} alt="" className='inputIconEnd' />
                                </>
                            )
                        }
                    </div>
                </div>

                <MDBNavbarItem ref={dropdownRef}>

                    <div className='d-flex'>
                        <div className='me-2 text-end'>
                            <p className='fw-bold fs-5'>
                                {localStorage.getItem("LOGIN_USER")?.split('@')[0]}
                            </p>
                            <div className='d-flex flex-row align-items-center justify-content-end'>
                                <MDBDropdown animation={false}>
                                    <MDBDropdownToggle>
                                        <div className="d-flex align-items-center defaultFont d-none">
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
                            </div>
                        </div>
                        <div className="" onClick={toggleDropdownMenu}>
                            <img
                                src={Profile}
                                alt=''
                                className='rounded-4 profileHeaderImage'
                            />
                        </div>
                    </div>
                    {isDropDownVisible && (
                        <div className="navBar__DropDown shadow-4">
                            <div className="nav_header_dropdown_options">
                                <div className="p-3 nav-link switch-theme" >
                                    <i className="fas fs-6 me-2 fa-sign-in"></i>Settings
                                </div>
                            </div>

                            <hr className="border my-1" />

                            <div className="nav_header_dropdown_options">
                                <div className="switch-theme p-3 nav-link">
                                    <MDBIcon fas icon="adjust" className="me-2" />
                                    <span>Theme</span>
                                    <span className="float-end mt-2px">
                                        <MDBIcon fas icon="angle-right" />
                                    </span>
                                </div>
                                <div className="theme-options shadow-4">
                                    <DarkMode className="me-2" />
                                </div>
                            </div>

                            <hr className="border my-1" />
                            <div className="nav_header_dropdown_options">
                                <div className="p-3 nav-link switch-theme" onClick={onClickSignOut} >
                                    <i className="fas fs-6 me-2 fa-sign-in"></i>Sign out
                                </div>
                            </div>
                        </div>
                    )}
                </MDBNavbarItem>

            </MDBContainer>
        </MDBNavbar>
    );
}