import React, { useState } from 'react';
import {
    MDBIcons,
    MDBTabs,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsContent,
    MDBTabsPane,
    MDBIcon
} from 'mdb-react-ui-kit';
import RecentChats from './RecentChats';

function Chats() {
    const [iconsActive, setIconsActive] = useState('tab1');

    const handleIconsClick = (value) => {
        if (value === iconsActive) {
            return;
        }

        setIconsActive(value);
    };


    return (
        <>
            <div className="recenteHeight shadow-2">
                {/* <div class="sc-dYRFos eTTMW">
                    <div class="sc-jWgdIJ fLwiKI">
                        <h1 className='cKbOKx' title="Message">Message</h1>
                    </div>
                </div> */}

                <MDBTabs justify size="lg">
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleIconsClick('tab1')} active={iconsActive === 'tab1'}>
                            <MDBIcon fas icon="phone" size='xl' />
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleIconsClick('tab2')} active={iconsActive === 'tab2'}>
                            <MDBIcon far icon="comments" size='xl' />
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleIconsClick('tab3')} active={iconsActive === 'tab3'}>
                            <MDBIcon fas icon="voicemail" size='xl' />
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleIconsClick('tab4')} active={iconsActive === 'tab4'}>
                            <MDBIcon fas icon="fax" size='xl' />
                        </MDBTabsLink>
                    </MDBTabsItem>
                </MDBTabs>

                <MDBTabsContent>
                    <MDBTabsPane open={iconsActive === 'tab1'}>
                        <RecentChats />
                    </MDBTabsPane>
                    <MDBTabsPane open={iconsActive === 'tab2'}>Tab 2 content</MDBTabsPane>
                    <MDBTabsPane open={iconsActive === 'tab3'}>Tab 3 content</MDBTabsPane>
                    <MDBTabsPane open={iconsActive === 'tab4'}>Tab 4 content</MDBTabsPane>
                </MDBTabsContent>


            </div>

        </>
    )
}

export default Chats
