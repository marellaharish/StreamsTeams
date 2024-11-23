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

    const combinedSearchResults = [...SearchReasultDataTest.map(item => ({ ...item, type: 'user' })),
    ...SearchReasultDataFiles.map(item => ({ ...item, type: 'file' }))];

    return (
        <>
            {isVisible &&
                <MDBCard className='rounded-0 shadow-0 searchCardContainer'>
                    {/* <MDBCardHeader className='rounded-0'>
                        <div className='d-flex align-items-center justify-content-between'>
                            <div className='userNameMain'>Search Results</div>
                            <div className="cursor-pointer px-2" onClick={handleClick}>
                                <MDBIcon fas icon="times" />
                            </div>
                        </div>

                    </MDBCardHeader> */}
                    <MDBCardBody className='groupDID-view-container p-0 rounded-0'>
                        <MDBTabsContent>
                            {combinedSearchResults.map((member, index) => {
                                const isUser = member.type === 'user';
                                const parts = isUser
                                    ? member.msg.split(new RegExp(`(${searchTerm})`, 'gi'))
                                    : member.name.split(new RegExp(`(${searchTerm})`, 'gi'));

                                return (
                                    <div key={index} className="d-flex align-items-start cursor-pointer didBuddy my-2 p-2">
                                        <img
                                            src={isUser ? member.profileImage : getFileTypeImage(member.fileType)}
                                            alt={member.name}
                                            className='profileImageUserSearch'
                                        />

                                        <div className="w-90 d-flex flex-column ps-3 pe-2 ps-2">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <p className='ChatUserName' style={{ maxWidth: "100%" }}>
                                                    {isUser ? (
                                                        member.name
                                                    ) : (
                                                        <>
                                                            {parts.map((part, i) => (
                                                                part.toLowerCase() === searchTerm.toLowerCase() ? (
                                                                    <strong key={i} className='text-dark' style={{ backgroundColor: "#f8f9a5" }}>{part}</strong>
                                                                ) : (
                                                                    part
                                                                )
                                                            ))}
                                                            <span className="ms-2">
                                                                <i className="fas fa-paperclip"></i>
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                                <div className='d-flex flex-row align-items-center'>
                                                    <p className='text-secondary dateTextNew'>
                                                        {isUser ? '22 Aug 2024' : member.dateTime}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className='searchReasultText'>
                                                {isUser ? (
                                                    <>
                                                        {member.From}: {parts.map((part, i) => (
                                                            part.toLowerCase() === searchTerm.toLowerCase() ? (
                                                                <strong key={i} className='text-dark' style={{ backgroundColor: "#f8f9a5" }}>{part}</strong>
                                                            ) : (
                                                                part
                                                            )
                                                        ))}
                                                    </>
                                                ) : (
                                                    `shared By : ${member.sharedBy}`
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </MDBTabsContent>
                    </MDBCardBody>
                </MDBCard>
            }

        </>
    )
}

export default SearchReasult
