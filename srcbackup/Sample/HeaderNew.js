import React from 'react'
import { StreamsIcon } from '../assets/images'

const HeaderNew = () => {
    return (
        <>
            <div className='Header-New'>
                <div className="headerInner">
                    <div className="d-flex align-items-center">
                        <img src={StreamsIcon} alt="" width={40} height={40} />
                        <p class="logoName">Streams</p>
                    </div>

                    <div class="sc-fsjzwC iBbbKF searchBar">
                        <div data-test-automation-id="topBar-search-bar" role="search" aria-label="Search" class="sc-itGaNv SpFyf">
                            <button aria-haspopup="dialog" aria-label="Global Search: " class="sc-gMxAzm hjnXOo">
                                <span class="sc-gKAblj kjYrie search_nav icon">
                                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="sc-jSFkmK jGLdVH">
                                        <path
                                            d="M14 3c6.075 0 11 4.925 11 11a10.95 10.95 0 0 1-2.454 6.926l6.197 6.195a1.5 1.5 0 1 1-2.121 2.121l-6.265-6.264A10.95 10.95 0 0 1 14 25C7.925 25 3 20.075 3 14S7.925 3 14 3zm0 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"
                                        ></path>
                                    </svg>
                                </span>
                                <span class="sc-kTVWsB JpkgC">Search</span>
                            </button>
                        </div>
                    </div>

                    <div className='user-Profile'>
                        HM
                    </div>


                </div>
            </div>
        </>
    )
}

export default HeaderNew
