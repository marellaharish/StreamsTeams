import React from 'react'
import { Iconsearch, Profile, Read, Unread } from '../assets/images'
import { MDBIcon } from 'mdb-react-ui-kit'

function RecentChats() {
    return (
        <>
            <div className="py-3 px-2">
                <div className='NewSearch userSearch'>
                    <input type="text" placeholder='Search' />
                    <MDBIcon fas icon="search" />
                </div>



                <div className="d-flex align-items-center p-2  mt-2 cursor-pointer didBuddy">
                    <img
                        src='https://mdbootstrap.com/img/new/avatars/8.jpg'
                        className='recentUserImage'
                    />
                    <div className='ps-2 w-100'>
                        <div className="d-flex align-items-center justify-content-between w-100">
                            <p className='fw-bold'>Design Chat</p>
                            <div className="d-flex">
                                <div className="position-relative">
                                    <img src={Read} alt="" width={20} className='me-2' />
                                </div>
                                <p className='text-secondary'>4m</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between w-100">
                            <p className='ellipsis text-secondary' style={{ width: "180px" }}>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, facilis!</p>
                            <div className="p-1 bg-danger rounded-circle d-flex align-items-center justify-content-center text-light" style={{ width: "23px", height: "23px", fontSize: 12 }}>
                                3
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default RecentChats
