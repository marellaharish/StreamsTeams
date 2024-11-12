import React, { useState } from 'react'
import { MDBAccordion, MDBAccordionItem, MDBBadge, MDBChip, MDBIcon, MDBInput, MDBPagination, MDBPaginationItem, MDBPaginationLink, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane } from 'mdb-react-ui-kit'
import { contactsWithStatus, contactTeams, GlobalContactsData, OtherStreamsContactsData } from '../../config/Constants'
import { Group, Iconsearch, Profile } from '../../assets/images'

const Teams = ({ profileImage, name, teamName }) => {
    return (
        <div>
            <div className={`d-flex align-items-center p-2  mt-3 cursor-pointer didBuddy`}>
                <img
                    src={profileImage}
                    className='contactProfile'
                />
                <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                    <p className='contactTeamName'>
                        {name}
                    </p>
                    <p>{teamName}</p>
                </div>
            </div>
        </div>
    )
}



const CompanyContacts = ({ profileImage, name, extension, statusLabel, bgClass }) => {
    return (
        <div className={`d-flex align-items-center p-2  mt-3 cursor-pointer didBuddy`}>
            <img
                src={profileImage}
                className='contactProfile'
            />
            <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                <p className='contactTeamName'>
                    {name} - {extension}
                </p>
                <div className="d-flex align-items-center defaultFont">
                    <div className={`rounded-circle me-2 ${bgClass}`} />
                    {statusLabel}
                </div>
            </div>
        </div>
    )
}



const GlobalContacts = ({ profileImage, name }) => {
    return (
        <div>
            <div className={`d-flex align-items-center p-2  mt-3 cursor-pointer didBuddy`}>
                <div className="position-relative">
                    <img
                        src={profileImage}
                        className='contactProfile'
                    />
                    <div className="globe">
                        <MDBIcon fas icon="globe" />
                    </div>
                </div>

                <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                    <p className='contactTeamName'>
                        {name}
                    </p>
                </div>
            </div>
        </div>
    )
}


const OtherStreamsContacts = ({ profileImage, name, extension, statusLabel, bgClass }) => {
    return (
        <div>
            <div className={`d-flex align-items-center p-2  mt-3 cursor-pointer didBuddy`}>
                <img
                    src={profileImage}
                    className='contactProfile'
                />
                <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                    <p className='contactTeamName'>
                        {name} - {extension}
                    </p>
                    <div className="d-flex align-items-center defaultFont">
                        <div className={`rounded-circle me-2 ${bgClass}`} />
                        {statusLabel}
                    </div>
                </div>
            </div>
        </div>
    )
}


const Contacts = () => {

    const [selectedTab, setSelectedTab] = useState('company');

    const handleTabSelect = (value) => {

        try {

            if (value === selectedTab) {
                return;
            }
            setSelectedTab(value);


        } catch (e) {

            console.log('[handleTabSelect] Error :: ' + e);
        }

    };

    return (
        <div className="p-2 users-view-container">


            <div className="position-relative userSearch d-flex align-items-center justify-content-between mt-2 pe-2">
                <input placeholder='Search' />
                <img src={Iconsearch} alt="" className='inputIcon' />

            </div>
            <div className="d-flex flex-wrap pt-2">
                {/* <MDBChip className={`${selectedTab == 'group' ? "active" : ""}`} onClick={() => handleTabSelect('group')} active={selectedTab === 'group'}>Other Streams</MDBChip> */}
                <MDBChip className={`${selectedTab == 'company' ? "active" : ""}`} onClick={() => handleTabSelect('company')} active={selectedTab === 'company'}>Company</MDBChip>
                <MDBChip className={`${selectedTab == 'imported' ? "active" : ""}`} onClick={() => handleTabSelect('imported')} active={selectedTab === 'imported'}>Imported</MDBChip>
                {/* <MDBChip className={`${selectedTab == 'all' ? "active" : ""}`} onClick={() => handleTabSelect('all')} active={selectedTab === 'all'} >Teams</MDBChip> */}
            </div>

            <MDBTabsPane open={(selectedTab === 'company') || (selectedTab === 'imported')}>
                {selectedTab === 'company' &&
                    <div>
                        {contactsWithStatus.map((member, index) => {
                            return (
                                <>
                                    <CompanyContacts profileImage={Profile} name={member.name} extension={member.extension} statusLabel={member.statusLabel} bgClass={member.bgClass} />
                                </>
                            )
                        })}
                    </div>
                }
                {selectedTab === 'imported' &&
                    <div>
                        {OtherStreamsContactsData.map((member, index) => {
                            return (
                                <>
                                    <OtherStreamsContacts profileImage={Profile} name={member.name} extension={member.extension} statusLabel={member.statusLabel} bgClass={member.bgClass} />
                                </>
                            )
                        })}
                    </div>
                }
            </MDBTabsPane>
        </div>
    )
}

export default Contacts
