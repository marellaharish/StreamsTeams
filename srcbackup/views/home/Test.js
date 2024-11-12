import React from 'react'
import HeaderNew from '../../Sample/HeaderNew'
import SideNav from '../../Sample/SideNav'
import Chats from '../../Sample/Chats'
import ChatView from '../../Sample/ChatView'

const Test = () => {
    return (
        <>
            <div id="home-wrapper" class="sc-kBzjQh jeSZoh">

                <HeaderNew />
                <div className="d-flex">

                    <div id="app-main-section" class="sc-jFthCE bFNYbJ">
                        <SideNav />
                    </div>
                    <div className='d-flex w-100'>
                        <Chats />
                        <ChatView />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Test
