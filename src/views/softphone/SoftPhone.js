import { MDBIcon } from 'mdb-react-ui-kit'
import React from 'react'

const SoftPhone = () => {
    return (
        <>
            <div className='SoftPhoneContainer'>
                <div className="titleCard">
                    <div className="titleDiv">
                        <h3 className='m-0'>MH</h3>
                    </div>
                </div>

                <div className='softphoneCallContainer'>
                    <h1 className='m-0'>
                        Marella <br /> Harish
                    </h1>


                    <p className='mt-2'>
                        +91 98481 73866
                    </p>

                    <p className='my-2'>
                        To: +91 12545 85456
                    </p>


                    <div class="grid-container">
                        <div class="grid-item">
                            <button class="dialpad-button">
                                <MDBIcon fas icon="minus" />
                                <span class="dialpad-letters"></span>
                            </button>
                            <p>Ignore</p>
                        </div>

                        <div class="grid-item">
                            <button class="dialpad-button">
                                <MDBIcon fas icon="ellipsis-h" />
                                <span class="dialpad-letters"></span>
                            </button>
                            <p>More</p>
                        </div>

                        <div class="grid-item">
                            <button class="dialpad-call-button reject"><i class="fas fa-phone"></i></button>
                            <p>Reject</p>
                        </div>

                        <div class="grid-item">
                            <button class="dialpad-call-button"><i class="fas fa-phone"></i></button>
                            <p>Answer</p>
                        </div>
                    </div>



                </div>
            </div>
        </>
    )
}

export default SoftPhone
