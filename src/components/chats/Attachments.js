import React, { useEffect, useRef, useState } from 'react';
import evntEmitter from "../../classes/utils/EvntEmitter";
import EmitterConstants from "../../config/EmitterConstants"
import { MDBIcon } from 'mdb-react-ui-kit';
import Utils from '../../classes/utils/util';
import Constants from "../../config/Constants"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { easeQuadInOut } from "d3-ease";
import { videoType, audioType } from '../../assets/images'
import { PhotoProvider, PhotoView } from 'react-photo-view';

let TAG = "[Attachments].";
const Attachments = ({ element }) => {

    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState(
        typeof element === 'object' && element !== null ? element : JSON.parse(element)
    );

    // Slice the first 2 images for display
    let imagesToShow = images.slice(0, 2);
    useEffect(() => {

        try {

            evntEmitter.removeAllListeners(EmitterConstants.EMMIT_ON_UPLOAD_PERCENTAGE);
            evntEmitter.on(EmitterConstants.EMMIT_ON_UPLOAD_PERCENTAGE, handleProgressBarForUpload)

        } catch (error) {
            console.error(TAG + "[useEffect][] Error: ", error);
        }

    }, []);

    const handleProgressBarForUpload = (imageData) => {
        try {
            let percentage = imageData.percentageValue;

            // Find the index of the image with matching `cid`
            const imageIndex = images.findIndex(object => object.cid === imageData.cid);
            if (imageIndex !== -1) {

                console.log('[handleProgressBarForUpload]--- cid: ' + imageData.cid + ', percentage: ' + percentage + ', imageIndex: ' + imageIndex);
                // Create a copy of images array and update the specific image's percentage
                const updatedImages = [...images];
                updatedImages[imageIndex] = {
                    ...updatedImages[imageIndex],
                    percentage: percentage,
                    isUploading: (percentage > 0 && percentage < 100),
                    isUploadDone: (percentage === 100),
                };

                // Set the new images state to trigger re-render
                setImages(updatedImages);
            }

        } catch (error) {
            console.error("[handleProgressBarForUpload] Error: ", error);
        }
    };

    const renderImage = (image, index) => {

        let isUploadLink = (image.link.includes('http'))
        let link = isUploadLink ? image.link :
            Utils.formUrlForAttachmentDownload(image.link, image.filename, Constants.ATTACHMENT_RESOLUTION_TYPE_720);

        let extraImagesCount = images.length - 2; // Calculate remaining images

        const isLastImageWithOverlay = (index === 1 && extraImagesCount > 0);
        const overlayText = isLastImageWithOverlay ? `+${extraImagesCount}` : ''
        const isUploadPregress = (isUploadLink && image.isUploading) ? true : false
        const fileType = Utils.getFileType(image.filename)

        // console.log(TAG + '[renderImage]  index: ' + index + ', name: '
        //     + image.filename + ', isUploadPregress: ' + isUploadPregress +
        //     ", loading: " + loading + ', uploading : ' + image.isUploading + ', fileType: ' + fileType);

        return (

            <div>

                {/*  show Audio and Video source */}
                {(fileType === Constants.FILE_TYPES.AUDIO || fileType === Constants.FILE_TYPES.VIDEO) && (

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '10px' }}>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginTop: '10px' }}>

                            {fileType === Constants.FILE_TYPES.AUDIO ? (
                                <img src={audioType} style={{ width: 40, height: 40, marginRight: '10px' }} />
                            ) : (
                                <img src={videoType} style={{ width: 40, height: 40, marginRight: '10px' }} />
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column' }}>

                                <span style={{ color: '#2e7d32', fontSize: '14px', fontWeight: 'bold' }}>
                                    {image.filename}
                                </span>

                                <span style={{ fontSize: '12px' }}>{(image.filesize / 1000) + 'KB'}</span>
                            </div>

                        </div>

                        {fileType === Constants.FILE_TYPES.AUDIO ? (

                            <audio controls>
                                <source src={link} type={`audio/${image.filename.split('.').pop()}`} />
                                Your browser does not support the audio tag.
                            </audio>

                        ) : (

                            <div style={{
                                position: 'relative',
                                borderRadius: '10px',
                                boxSizing: 'border-box',
                                background: 'linear-gradient(45deg, #e0e0e0, #5c5c5c)', // Example background
                            }}>

                                <video controls style={{ width: 350, height: 240 }}>
                                    <source src={link} type={`video/${image.filename.split('.').pop()}`} />
                                    Your browser does not support the video tag.
                                </video>

                            </div>

                        )}

                    </div>
                )}

                {/*  show Image source */}
                {fileType === Constants.FILE_TYPES.IMAGES && (

                    <div className={`image-wrapper ${(isUploadPregress || isLastImageWithOverlay) || (loading && !isUploadLink) ? 'masked-image' : ''}`} key={image.cid}>

                        <div className="overlay">

                            {isLastImageWithOverlay && (
                                <span style={{ zIndex: 9, fontSize: 35 }}>{overlayText}</span>
                            )}
                        </div>

                        {/* Show spinner or loading indicator while loading */}
                        {((loading && !isUploadLink) || isUploadPregress) && (
                            <div className="overlay">

                                {/* {isLastImageWithOverlay && (
                            <span style={{ zIndex: 9, fontSize: 24 }}>{overlayText}</span>
                        )} */}

                                {loading && !isUploadLink ? (
                                    <MDBIcon
                                        className="loading-icon"
                                        fas
                                        icon="spinner"
                                        size="2x"
                                        spin
                                    />
                                ) : image.isUploading ? (
                                    <div className="loader-Class">
                                        <CircularProgressbar
                                            valueStart={0}
                                            valueEnd={image.percentage}
                                            duration={1.4}
                                            strokeWidth={6}
                                            easingFunction={easeQuadInOut}
                                            styles={buildStyles({
                                                textSize: "22px",
                                                backgroundColor: "#fa9f22",
                                                textColor: "#fff",
                                                pathColor: "#fff",
                                                trailColor: "transparent",
                                            })}
                                            background
                                            backgroundPadding={6}
                                            value={image.percentage || 0}  // Default to 0 if not set
                                            text={`${image.percentage || 0}%`}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Image element */}


                        <PhotoView src={link}>
                            <img
                                src={link}
                                title={image.filename}
                                className="chatImage"
                                alt={image.filename}
                                onLoad={() => { setLoading(false) }}
                                style={loading ? { visibility: 'hidden', width: 350, height: 240 } : { width: 350, height: 240 }}
                            />

                        </PhotoView>
                    </div>

                )}

            </div>

        );
    };


    return (
        <div className="image-container">

            {imagesToShow.map((image, index) => renderImage(image, index))}
        </div>
    );

};

export default Attachments;