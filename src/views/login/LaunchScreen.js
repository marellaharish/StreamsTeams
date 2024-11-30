import React from "react"
import { Icon_feather_loader, Streams_Icon } from "../../assets/images"

function LaunchScreen() {
    return (
        <React.Fragment>
            <>
                <div className="welcomeScreen_main">
                    <div className="d-flex align-items-center ">
                        <img src={Streams_Icon} alt="" className="StreamsMainLogo" />
                        <h1 className="m-0 ms-2 text-dark Streamstext">STREAMS</h1>
                    </div>
                    <p className="mt-3 mb-0 WelcomeSubHead">Communicate, Collaborate and Share Your Way!</p>
                    <div className="d-flex flex-column align-items-center Welcomeloader_main">
                        <img src={Icon_feather_loader} alt="" className="Welcomeloader" />
                        <p className="mt-2 mb-0">Please wait while the application loads....</p>
                    </div>
                </div>
            </>
        </React.Fragment>
    )
}
export default LaunchScreen