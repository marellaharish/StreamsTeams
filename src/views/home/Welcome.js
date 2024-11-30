import { MDBBtn, MDBCard, MDBCardBody, MDBCardText, MDBCardTitle, MDBCol, MDBRow } from 'mdb-react-ui-kit'
import React from 'react'
import { communicate, CreateTeam, shareFiles } from '../../assets/images'

const Welcome = () => {
    return (
        <>
            <MDBCard>
                <MDBCardBody className='defaultchat-view-container p-5'>
                    <center>
                        <h4>Hi {localStorage.getItem("LOGIN_USER")}, Welcome to Streams! </h4>
                        <p className='fw-500'>Communicate, Collaborate and Share Your Way!</p>
                    </center>

                    <MDBRow className='pt-5 mt-5 justify-content-center'>
                        <MDBCol md={6} lg={4} sm={12}>
                            <div className='WeclomePageContent'>
                                <img src={communicate} alt="" />
                                <h3>Communicate</h3>
                                <p>Make and receive audio and video calls to/from anyone, anywhere!  Conduct conference calls, web meetings or share your desk seamlessly. Receive your voicemails, faxes and call recordings in one HIPAA secure cloud. Even deploy
                                    a full contact center with ease.  Unified communications has never been easier.</p>
                            </div>
                        </MDBCol>
                        <MDBCol md={6} lg={4} sm={12}>

                            <div className='WeclomePageContent'>
                                <img src={CreateTeam} alt="" />
                                <h3>Multi-Media Team Messaging</h3>
                                <p>Create unlimited teams and collaborate with multi-media, persistent messaging.
                                    Share text, links, pictures, video, audio, files, folders and even broadcast live streaming video! Streams stores all your content in a HIPAA secure, ultra-reliable, encrypted cloud. A free client is available so you can collaborate with anyone, anywhere, anytime!</p>
                            </div>
                        </MDBCol>
                        <MDBCol md={6} lg={4} sm={12}>
                            <div className='WeclomePageContent'>
                                <img src={shareFiles} alt="" />
                                <div className='d-flex align-items-center '>
                                    <h3>Sync and Share Your File</h3>
                                </div>
                                <p>Securely store, sync and share your documents, files, call recordings, voicemails, faxes and more using Streams - SmartBox.  With unlimited HIPAA compliant storage, advanced security, file versioning, mobile device support and full local device syncing, SmartBox has all your cloud storage and content management needs covered.</p>
                            </div>
                        </MDBCol>
                    </MDBRow>



                </MDBCardBody>
            </MDBCard >
        </>
    )
}

export default Welcome
