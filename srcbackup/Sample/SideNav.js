import React, { useState } from 'react';
import {
    MDBSideNav,
    MDBSideNavMenu,
    MDBSideNavItem,
    MDBSideNavLink,
    MDBSideNavCollapse,
    MDBBtn,
    MDBIcon
} from 'mdb-react-ui-kit';

export default function SideNav() {
    const [slimCollapse1, setSlimCollapse1] = useState(false);
    const [slimCollapse2, setSlimCollapse2] = useState(false);
    const [slimMode, setSlimMode] = useState(true);

    const items = [
        { icon: "clock", label: "Recents" },
        { icon: "user", label: "Contacts" },
        { icon: "folder", label: "Smart Box" },
        { icon: "headset", label: "Connect" },
        { icon: "ellipsis-h", label: "More" },
    ];

    const itemBottom = [
        { icon: "clock", label: "Recents" },
        { icon: "cog", label: "Settings" },
        { icon: "sign-out-alt", label: "Sign Out" },
    ];


    return (
        <>
            <MDBSideNav
                backdrop={false}
                absolute
                slim={slimMode}
                slimCollapsed={!slimCollapse1 && !slimCollapse2}
            >
                <MDBSideNavMenu className='justify-content-between h-100 d-flex flex-column'>
                    <div>

                        {items.map((item, index) => (
                            <div className="d-flex justify-content-center flex-column align-items-center cursor-pointer pb-4" key={index}>
                                <MDBIcon fas icon={item.icon} size='2x' className='fs-4' style={{ color: "#121212" }} />
                                <p className='ListItemText-primary'>{item.label}</p>
                            </div>
                        ))}
                    </div>
                    <div>

                        {itemBottom.map((item, index) => (
                            <div className="d-flex justify-content-center flex-column align-items-center cursor-pointer pb-4" key={index}>
                                <MDBIcon fas icon={item.icon} size='2x' className='fs-4' style={{ color: "#121212" }} />
                                <p className='ListItemText-primary'>{item.label}</p>
                            </div>
                        ))}
                    </div>
                </MDBSideNavMenu>
            </MDBSideNav>

            {/* <div style={{ padding: '200px' }} className='text-center'>
                <MDBBtn onClick={() => setSlimMode(!slimMode)}>Toggle slim</MDBBtn>
            </div> */}
        </>
    );
}