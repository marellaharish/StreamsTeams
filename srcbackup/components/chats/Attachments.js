import React, { useEffect, useRef, useState } from 'react';
import evntEmitter from "../../classes/utils/EvntEmitter";
import EmitterConstants from "../../config/EmitterConstants"
import Utils from '../../classes/utils/util';
import Constants from "../../config/Constants"

let TAG = "[Attachments].";
const Attachments = ({ element }) => {
    const imageRf = useRef({});

    let images = (typeof element === 'object' && element !== null) ? element : JSON.parse(element);
    let imagesToShow = images.slice(0, 2)

    console.log(TAG + 'parsed images: ' + JSON.stringify(images) + ' :: imagesToShow :: ' + imagesToShow);

    useEffect(() => {

        try {
            console.log(TAG + '[useEffect] default---- element :: ' + JSON.stringify(element));

            evntEmitter.removeAllListeners(EmitterConstants.EMMIT_ON_UPLOAD_PERCENTAGE);

            evntEmitter.on(EmitterConstants.EMMIT_ON_UPLOAD_PERCENTAGE, handleProgressBarForUpload)

        } catch (error) {
            console.error(TAG + "[useEffect][] Error: ", error);
        }

    }, []);

    const handleProgressBarForUpload = (imageData) => {

        try {

            let percentage = imageData.percentageValue
            let cid = imageData.cid

            let curImageRef = imageRf.current[cid];
            console.log(TAG + '[handleProgressBarForUpload]--- percentCompleted: ' + percentage + ', curImageRef: ' + curImageRef)

            if (curImageRef) {

                curImageRef.style.width = percentage + 'px'
                const parentElement = curImageRef.parentNode;

                if (parentElement) {

                    parentElement.style.visibility = !(percentage === 100 || percentage === 0) ? 'visible' : 'hidden'
                }

                var childRef = curImageRef.querySelector('.percentageId')
                if (childRef) {

                    childRef.textContent = percentage + '%'
                }
            }

        } catch (error) {
            console.error(TAG + "[handleProgressBarForUpload] Error: ", error);
        }

    }

    const renderImage = (image, index) => {

        let link = image.link.includes('http') ? image.link :
            Utils.formUrlForAttachmentDownload(image.link, image.filename, Constants.ATTACHMENT_RESOLUTION_TYPE_720);

        console.log(TAG + '[renderImage] image render ---- imgSrc: ' + link + ', showSpinner: ' + image.isUploading);

        let extraImagesCount = images.length - 2; // Calculate remaining images

        const isLastImageWithOverlay = index === 1 && extraImagesCount > 0;

        return (

            <div className={`image-wrapper ${image.isUploading ? 'masked-image' : ''}`} key={image.cid}>
                <img src={link} title={image.filename} className="chatImage" alt={image.filename} />

                {(
                    <div className="overlay" style={{
                        zIndex: 9, visibility: !(image.percentage === 100 || image.percentage === 0) ? 'visible' : 'visible'
                    }}>
                        <div className='loaderCircle'>
                            <div ref={(el) => (imageRf.current[image.cid] = el)} style={{
                                width: `${image.percentage}%`,

                            }} className='loaderPercentage' >
                                <span className='percentageId'>90%</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="image-container">

            {imagesToShow.map((image, index) => {



                return renderImage(image, index);
            })}
        </div>
    );

};

export default Attachments;