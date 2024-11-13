import { MDBBtn, MDBCard, MDBCardBody, MDBCardHeader, MDBCardText, MDBCardTitle, MDBIcon, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane } from 'mdb-react-ui-kit'
import React, { useState } from 'react'
import { SearchReasultDataFiles, SearchReasultDataTest } from '../../config/Constants';
import { AudioSquareSvg, ExcelSvg, HtmlSvg, ImgBoxSvg, NodeSvg, PdfSvg, VideoSquareSvg, WordSvg, ZipDocumentSvg } from '../../assets/images';

const SearchReasult = () => {
    const [basicActive, setBasicActive] = useState('tab1');

    const handleBasicClick = (value) => {
        if (value === basicActive) {
            return;
        }
        setBasicActive(value);
    };

    const [isVisible, setIsVisible] = useState(true);

    const handleClick = () => {
        setIsVisible(false);
    };

    const searchTerm = "meeting";

    // Function to get the corresponding image for a file type
    const getFileTypeImage = (fileType) => {
        switch (fileType) {
            case 'Node':
                return NodeSvg;
            case 'Html':
                return HtmlSvg;
            case 'Excel':
                return ExcelSvg;
            case 'Video':
                return VideoSquareSvg;
            case 'Word':
                return WordSvg;
            case 'Audio':
                return AudioSquareSvg;
            case 'ZipDocument':
                return ZipDocumentSvg;
            case 'ImgBox':
                return ImgBoxSvg;
            case 'Pdf':
                return PdfSvg;
            default:
                return null; // If fileType is unrecognized
        }
    };

    return (
        <>
            {isVisible &&
                <MDBCard className='rounded-0 shadow-0 searchCardContainer'>
                    <MDBCardHeader className='rounded-0'>
                        <div className='d-flex align-items-center justify-content-between'>
                            <div className='userNameMain'>Search Results</div>
                            <div className="cursor-pointer px-2" onClick={handleClick}>
                                <MDBIcon fas icon="times" />
                            </div>
                        </div>

                    </MDBCardHeader>
                    <MDBCardBody className='groupDID-view-container p-0 rounded-0'>
                        <MDBTabs className='mb-2' fill pills >
                            <MDBTabsItem>
                                <MDBTabsLink onClick={() => handleBasicClick('tab1')} active={basicActive === 'tab1'}>
                                    <div className="tabsText">
                                        Messages ({SearchReasultDataTest.length})
                                    </div>
                                </MDBTabsLink>
                            </MDBTabsItem>
                            <MDBTabsItem>
                                <MDBTabsLink onClick={() => handleBasicClick('tab2')} active={basicActive === 'tab2'}>
                                    <div className="tabsText">
                                        Files
                                    </div>
                                </MDBTabsLink>
                            </MDBTabsItem>
                        </MDBTabs>

                        <MDBTabsContent>
                            <MDBTabsPane open={basicActive === 'tab1'}>
                                <div>
                                    {SearchReasultDataTest.map((member, index) => {
                                        const parts = member.msg.split(new RegExp(`(${searchTerm})`, 'gi'));
                                        return (
                                            <div key={index} className="d-flex align-items-start cursor-pointer didBuddy my-2 p-2">
                                                <img src={member.profileImage} alt={member.name}
                                                    className='profileImageUserSearch' />

                                                <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <p className='ChatUserName'>{member.name}</p>
                                                        <div className='d-flex flex-row align-items-center'>
                                                            <p className='text-secondary dateTextNew'>22 Aug 2024</p>
                                                        </div>
                                                    </div>
                                                    <p className='searchReasultText'>
                                                        {member.From}: {parts.map((part, i) => (
                                                            part.toLowerCase() === searchTerm.toLowerCase() ? (
                                                                <strong key={i} className='text-dark' style={{ backgroundColor: "#f8f9a5" }}>{part}</strong>
                                                            ) : (
                                                                part
                                                            )
                                                        ))}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            </MDBTabsPane>
                            <MDBTabsPane open={basicActive === 'tab2'}>
                                {SearchReasultDataFiles.map((member, index) => {
                                    const parts = member.name.split(new RegExp(`(${searchTerm})`, 'gi'));
                                    return (
                                        <div key={index} className="d-flex align-items-start cursor-pointer didBuddy my-2 p-2">
                                            <img src={getFileTypeImage(member.fileType)} alt={member.name}
                                                className='profileImageUserSearch' />

                                            <div className="W-85 d-flex flex-column ps-3 pe-2 ps-2">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <p className='ChatUserName'>
                                                        {parts.map((part, i) => (
                                                            part.toLowerCase() === searchTerm.toLowerCase() ? (
                                                                <strong key={i} className='text-dark' style={{ backgroundColor: "#f8f9a5" }}>{part}</strong>
                                                            ) : (
                                                                part
                                                            )
                                                        ))}
                                                    </p>
                                                    <div className='d-flex flex-row align-items-center'>
                                                        <p className='text-secondary dateTextNew'>{member.dateTime}</p>
                                                    </div>
                                                </div>
                                                <p className='searchReasultText'>
                                                    shared By : {member.sharedBy}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </MDBTabsPane>
                        </MDBTabsContent>
                    </MDBCardBody>
                </MDBCard>
            }

        </>
    )
}

export default SearchReasult
