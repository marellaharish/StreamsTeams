import EmojiPicker from 'emoji-picker-react'
import { MDBIcon } from 'mdb-react-ui-kit'
import React from 'react'

function ChatView() {
    return (
        <>
            <div className='w-100 h-100 bg-light shadow-4'>
                <div className='d-flex align-items-center justify-content-between py-2 px-4 border-bottom'>
                    <div className="">
                        <p className='fw-bold fs-4 '>Design Chat</p>
                        <p className='text-secondary'>23 Members, 10 Online</p>
                    </div>
                    <div className='d-flex'>
                        <MDBIcon fas color='secondary' className='cursor-pointer ' icon="search" size='xl' />
                        <MDBIcon fas color='secondary' className='cursor-pointer px-4' icon="phone" size='xl' />
                        <MDBIcon fas color='secondary' className='cursor-pointer ' icon="ellipsis-v" size='xl' />
                    </div>
                </div>
                <div className="chatContainer mt-3">

                    {/* ----------------- Date Start ----------------- */}
                    <div class="date-container">
                        <hr class="date-divider" />
                        <div class="date-display bg-light"><span>29 Oct 2024</span></div>
                    </div>
                    {/* ----------------- Date end ----------------- */}



                    {/* ----------------- Recived Message Model Start ----------------- */}

                    <div className="d-flex align-items-start">
                        <img
                            src='https://mdbootstrap.com/img/new/avatars/15.jpg'
                            className='recentUserImage'
                        />
                        <div className="message-container received">
                            <div className="message-content">
                                <div className="d-flex align-items-center">
                                    <h4 className="user-name">Jasmin Lowery</h4> <span style={{ fontSize: 12, lineHeight: 0.5 }} className='text-secondary ms-3'>12:24 AM</span>
                                </div>
                                <p className="message-text my-2">
                                    I added new flows to our design system. Now you can use them for your projects!
                                </p>
                                <div className='reactionsCounter shadow-3 '>
                                    ❤️ 3
                                </div>
                            </div>
                            <div className="reactionsPicker">
                                {/* <EmojiPicker reactionsDefaultOpen={false} /> */}
                                <div className='bg-light p-2 shadow-4 rounded-4 d-flex cursor-pointer'>
                                    <div>❤️</div>
                                    <div className='ms-2'>👍</div>
                                    <div className='ms-2'>😅</div>
                                    <div className='ms-2'>😯</div>
                                    <div className='ms-3'><i class="far fa-face-grin-beam-sweat"></i></div>
                                    <div className='ms-3'><i class="fas fa-pencil"></i></div>
                                    <div className='ms-3'><i class="fas fa-share"></i></div>
                                    <div className='ms-3'><i class="fas fa-comment"></i></div>
                                    <div className='ms-3'><i class="fas fa-thumbtack"></i></div>
                                    <div className='ms-3 me-2'><i class="fas fa-ellipsis-vertical"></i></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ----------------- Recived Message Model End ----------------- */}

                    {/* ----------------- Send Message Model Start ----------------- */}

                    <div className="d-flex align-items-start justify-content-end mt-3">
                        <div className="d-flex align-items-end justify-content-end flex-column w-100">
                            <div className="message-container sent">
                                <div className="message-content">
                                    <div className="d-flex align-items-center justify-content-end">
                                        <span style={{ fontSize: 12, lineHeight: 0.5 }} className='text-secondary me-3'>12:24 AM</span>
                                        <h4 className="user-name">You</h4>
                                    </div>
                                    <p className="message-text mt-2">
                                        I added new flows to our design system. Now you can use them for your projects!
                                    </p>
                                </div>
                            </div>
                            <div className="message-container mt-1">
                                <div className="message-content">
                                    <p className="message-text">
                                        I added new flows to our design system. Now you can use them for your projects!
                                    </p>
                                </div>
                            </div>
                        </div>
                        <img
                            src='https://mdbootstrap.com/img/new/avatars/8.jpg'
                            className='recentUserImage'
                        />
                    </div>
                    {/* ----------------- Send Message Model End ----------------- */}



                    {/* ----------------- Recived Message Model Start ----------------- */}

                    <div className="d-flex align-items-start mt-3">
                        <img
                            src='https://mdbootstrap.com/img/new/avatars/15.jpg'
                            className='recentUserImage'
                        />

                        <div className="d-flex align-items-start justify-content-end flex-column w-100">
                            <div className="message-container received">
                                <div className="message-content">
                                    <div className="d-flex align-items-center">
                                        <h4 className="user-name">Jasmin Lowery</h4> <span style={{ fontSize: 12, lineHeight: 0.5 }} className='text-secondary ms-3'>12:24 AM</span>
                                    </div>
                                    <p className="message-text mt-2">
                                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse officiis amet consequatur, tempora facilis optio maiores. Debitis voluptas ullam nam, deserunt, velit officiis, facere vitae consequatur voluptatum et amet maiores!
                                    </p>
                                </div>
                            </div>
                            <div className="message-container mt-1">
                                <p className="message-text">
                                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolorem, eligendi.
                                </p>
                            </div>
                            <div className="message-container mt-1">
                                <p className="message-text ">
                                    Lorem ipsum dolor sit amet.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ----------------- Recived Message Model End ----------------- */}

                    {/* ----------------- Send Message replied Model Start ----------------- */}

                    <div className="d-flex align-items-start justify-content-end mt-3">
                        <div className="d-flex align-items-end justify-content-end flex-column w-100  position-relative">
                            <div className="message-container sent replaied">
                                <div className="message-content">
                                    <div className="d-flex align-items-center justify-content-end">
                                        <span style={{ fontSize: 12, lineHeight: 0.5 }} className='text-secondary me-3'>12:24 AM</span>
                                        <h4 className="user-name"> <MDBIcon fas icon="reply" /> You replied to Jasmin Lowery</h4>
                                    </div>
                                    <p className="message-text mt-2 op-5">
                                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolorem, eligendi.
                                    </p>
                                </div>
                            </div>

                            <div className="message-container mt-1 replaiedmessage shadow-2">
                                <div className="message-content">
                                    <p className="message-text">
                                        I added new flows to our design system
                                    </p>
                                </div>
                            </div>

                        </div>
                        <img
                            src='https://mdbootstrap.com/img/new/avatars/8.jpg'
                            className='recentUserImage'
                        />
                    </div>
                    {/* ----------------- Send Message replied Model End ----------------- */}




                    {/* ----------------- Recived Message Model Start ----------------- */}

                    <div className="d-flex align-items-start mt-3">
                        <img
                            src='https://mdbootstrap.com/img/new/avatars/15.jpg'
                            className='recentUserImage'
                        />

                        <div className="d-flex align-items-start justify-content-end flex-column w-100">
                            <div className="message-container received">
                                <div className="message-content">
                                    <div className="d-flex align-items-center">
                                        <h4 className="user-name">Jasmin Lowery</h4> <span style={{ fontSize: 12, lineHeight: 0.5 }} className='text-secondary ms-3'>12:24 AM</span>
                                    </div>
                                    <div className='chatImage'>
                                        <img src="https://images.pexels.com/photos/1456291/pexels-photo-1456291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="" />
                                        <div className="iosLoader">
                                            <div class="spinner">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>


                                        <p className="message-text my-2">
                                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse officiis amet consequatur, tempora facilis optio maiores.
                                        </p>
                                        <div className='reactionsCounter shadow-3 '>
                                            ❤️ 3
                                        </div>
                                    </div>
                                </div>
                                <div className="reactionsPicker">
                                    <EmojiPicker reactionsDefaultOpen={true} />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* ----------------- Recived Message Model End ----------------- */}






                </div>














                <div className="w-60 mx-auto mt-3 messageEditTextarea">
                    <textarea name="" id="" placeholder='Type Your Message here' />


                    <div className="sendIconsContainer">
                        <div className="me-2">
                            <i class="fas fa-arrow-up-from-bracket fa-lg"></i>
                        </div>

                        <div className="me-2">
                            <i class="fas fa-plus fa-lg"></i>
                        </div>
                        <div className="me-2">
                            <i class="far fa-face-grin fa-lg"></i>
                        </div>
                        <div className="me-2">
                            <i class="fas fa-microphone fa-lg"></i>
                        </div>
                        <div className="me-2">
                            <i class="fas fa-ellipsis-vertical fa-lg"></i>
                        </div>
                        <div className="me-0 me-2 ">
                            <i class="far fa-paper-plane fa-lg"></i>
                        </div>
                    </div>

                </div>




            </div>
        </>
    )
}

export default ChatView
