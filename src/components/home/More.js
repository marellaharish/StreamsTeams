import React from 'react'
import { Profile } from '../../assets/images'

const More = () => {
    return (
        <>
            <div className="p-2">
                <div className="d-flex align-items-center justify-content-center pt-5">
                    <img
                        src={Profile}
                        alt=''
                        className='rounded-4'
                        width={150}
                    />
                </div>
            </div>
        </>
    )
}

export default More
