import React from 'react'
import { MDBIcon } from 'mdb-react-ui-kit'
import { Read, Unread } from '../../assets/images'



const RecentChats = ({ profileImage, name, LatestMsg, statusLabel, bgClass, newNitifications, isGroup, readStatus, date, onClick }) => {
    return (
        <>

            <div className="pb-3" title={statusLabel}>
                <div className="d-flex align-items-center p-2 m-0 cursor-pointer didBuddy" onClick={onClick}>
                    <div className="position-relative">
                        <img
                            src={profileImage}
                            className='recentUserImage'
                        />
                        <div class={`onlineStatus ${bgClass} rounded-circle newStatusShow`}></div>
                    </div>
                    <div className='ps-2 w-100'>
                        <div className="d-flex align-items-center justify-content-between w-100">
                            <p className='fw-bold'>{name}</p>
                            <div className="d-flex align-items-center">
                                <p className='text-secondary' style={{ fontSize: "14px" }}>{date}</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between w-100">
                            <div className="position-relative d-flex align-items-center">
                                <img src={`${readStatus ? Read : Unread}`} alt="" width={20} className='mx-1' />
                                <p className='ellipsis text-secondary' style={{ width: "260px" }}>{LatestMsg}</p>
                            </div>
                            {newNitifications > 0 && newNitifications &&
                                <div className="p-1 bg-danger rounded-circle d-flex align-items-center justify-content-center text-light" style={{ width: "23px", height: "23px", fontSize: 12 }}>
                                    {newNitifications > 9 ?
                                        <>
                                            9+
                                        </> :
                                        <>
                                            {newNitifications}
                                        </>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div >


        </>
    )

}



const Recents = ({ onClickRecents }) => {

    const members = [
        {
            id: 1,
            name: 'Harish Marella',
            status: 'On Desktop',
            comment: 'Commented on a message "Hi, Kaushal I have discussed with Harish yesterday regarding the changes In react App. Today I am on leave please start the work, tomorrow I will send a mail and will discuss."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/8.jpg',
            date: "Today",
            newNitifications: 10,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-danger",
        }
        ,
        {
            id: 2,
            name: 'Anjali Sharma',
            status: 'Away',
            comment: 'Commented on a task "I will review the PR later today. Please hold off on merging until then."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/2.jpg',
            date: "Yesterday",
            newNitifications: 8,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        }
        ,
        {
            id: 3,
            name: 'Ravi Kumar',
            status: 'Online',
            comment: 'Commented on a document "The draft looks good. I will finalize it by tomorrow."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/3.jpg',
            date: "Tuesday",
            newNitifications: 3,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-secondary",
        }
        ,
        {
            id: 4,
            name: 'Neha Singh',
            status: 'On Mobile',
            comment: 'Commented on a message "Please check the latest design and provide feedback."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/4.jpg',
            date: "Monday",
            newNitifications: 5,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        }
        ,
        {
            id: 5,
            name: 'Vikram Patel',
            status: 'Busy',
            comment: 'Commented on a task "I am currently in a meeting. I will get back to this later."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/5.jpg',
            date: "Sunday",
            newNitifications: 2,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        }
        ,
        {
            id: 6,
            name: 'Ayesha Khan',
            status: 'Offline',
            comment: 'Commented on a document "The budget proposal needs revision. I will send you the updated figures."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/6.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        }
        ,
        {
            id: 7,
            name: 'Rajesh Gupta',
            status: 'On Desktop',
            comment: 'Commented on a message "I have completed the initial testing. The results are promising."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/7.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        }
        ,
        {
            id: 8,
            name: 'Pooja Verma',
            status: 'Online',
            comment: 'Commented on a task "The server issue has been resolved. Please proceed with the deployment."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/9.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        }
        ,
        {
            id: 9,
            name: 'Sandeep Rawat',
            status: 'Away',
            comment: 'Commented on a message "I will be available for the call in the afternoon."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/10.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        }
        ,
        {
            id: 10,
            name: 'Deepika Reddy',
            status: 'On Mobile',
            comment: 'Commented on a document "Please review the attached report and provide feedback."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/11.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        }
        ,
        {
            id: 11,
            name: 'Ayesha Khan',
            status: 'Offline',
            comment: 'Commented on a document "The budget proposal needs revision. I will send you the updated figures."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/6.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        }
        ,
        {
            id: 12,
            name: 'Rajesh Gupta',
            status: 'On Desktop',
            comment: 'Commented on a message "I have completed the initial testing. The results are promising."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/7.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        }
        ,
        {
            id: 13,
            name: 'Pooja Verma',
            status: 'Online',
            comment: 'Commented on a task "The server issue has been resolved. Please proceed with the deployment."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/9.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        }
        ,
        {
            id: 14,
            name: 'Sandeep Rawat',
            status: 'Away',
            comment: 'Commented on a message "I will be available for the call in the afternoon."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/10.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        }
        ,
        {
            id: 15,
            name: 'Deepika Reddy',
            status: 'On Mobile',
            comment: 'Commented on a document "Please review the attached report and provide feedback."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/11.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        },
        {
            id: 16,
            name: 'Arjun Patel',
            status: 'Offline',
            comment: 'Commented on a task "The design phase is complete. Ready for review."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/12.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        },
        {
            id: 17,
            name: 'Nisha Sharma',
            status: 'On Desktop',
            comment: 'Commented on a message "The client meeting has been rescheduled to next week."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/13.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        },
        {
            id: 18,
            name: 'Vikram Singh',
            status: 'Online',
            comment: 'Commented on a document "I have updated the project timeline in the shared file."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/14.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        },
        {
            id: 19,
            name: 'Meera Joshi',
            status: 'Away',
            comment: 'Commented on a task "The presentation slides are ready for review."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/15.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        },
        {
            id: 20,
            name: 'Anil Kumar',
            status: 'On Mobile',
            comment: 'Commented on a message "I will provide the final report by end of day."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/16.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        },
        {
            id: 21,
            name: 'Rina Malhotra',
            status: 'Offline',
            comment: 'Commented on a document "The budget review is scheduled for tomorrow morning."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/17.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        },
        {
            id: 22,
            name: 'Sanjay Patel',
            status: 'On Desktop',
            comment: 'Commented on a message "The database migration is complete. Please verify."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/18.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        },
        {
            id: 23,
            name: 'Ananya Rao',
            status: 'Online',
            comment: 'Commented on a task "The user feedback has been integrated into the latest version."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/19.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: false,
            bgClass: "bg-success",
        },
        {
            id: 24,
            name: 'Rajiv Kumar',
            status: 'Away',
            comment: 'Commented on a message "I will send the updated designs by this evening."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/20.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        },
        {
            id: 25,
            name: 'Priti Singh',
            status: 'On Mobile',
            comment: 'Commented on a document "Please check the attached proposal for the new project."',
            avatar: 'https://mdbootstrap.com/img/new/avatars/8.jpg',
            date: "09 Oct 2024",
            newNitifications: 0,
            isGroup: false,
            readStatus: true,
            bgClass: "bg-success",
        }
    ];


    return (
        <>
            <div className="users-view-container dialpadMain">
                <div className='NewSearch userSearch mb-3'>
                    <input type="text" placeholder='Search' />
                    <MDBIcon fas icon="search" />
                </div>
                {members.map((member, index) => {
                    return (
                        <>
                            <RecentChats
                                profileImage={member.avatar}
                                name={member.name}
                                statusLabel={member.status}
                                bgClass={member.bgClass}
                                newNitifications={member.newNitifications}
                                LatestMsg={member.comment}
                                isGroup={member.isGroup}
                                readStatus={member.readStatus}
                                date={member.date}
                                onClick={onClickRecents}
                            />
                        </>
                    )
                })}
                <RecentChats />
            </div>
        </>
    )
}

export default Recents
