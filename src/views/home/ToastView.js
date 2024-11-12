import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showToast = (message, type = "success", duration = 2000) => {

    try {

        const backgroundColor =
            type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8"; // Customize colors as needed


        toast[type](message, {

            autoClose: duration, // Set default duration to 2 seconds
            position: "bottom-right",
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: { backgroundColor, color: "#fff" },
        });

    } catch (e) {

        console.log("[ToastView] Error :: " + e);
    }

};