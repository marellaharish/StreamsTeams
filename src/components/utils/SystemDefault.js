import React, { useState, useEffect } from "react";

const SystemDefault = () => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("selectedColorTheme") === "dark"
    );

    const toggleTheme = () => {

        try {

            console.log("[toggleTheme] -----------");

            const newDarkMode = !darkMode;
            setDarkMode(newDarkMode);
            localStorage.setItem("selectedColorTheme", newDarkMode ? "dark" : "light");

        } catch (error) {

            console.err('Error toggleTheme : ' + error.message);
        }

    };

    useEffect(() => {

        try {

            console.log("[useEffect] -----[]------");

            const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)");

            const handleChange = (e) => {
                setDarkMode(e.matches);
            };

            prefersDarkMode.addEventListener("change", handleChange);

            // Set the initial dark mode based on system preference
            setDarkMode(prefersDarkMode.matches);

            return () => {
                // Cleanup: Remove the event listener
                prefersDarkMode.removeEventListener("change", handleChange);
            };
        } catch (error) {

            console.err('Error useEffect : ' + error.message);
        }

    }, []);

    useEffect(() => {

        try {

            console.log("[useEffect] -----[darkMode]------");

            if (darkMode) {
                document.querySelector("body").setAttribute("data-theme", "dark");
            } else {
                document.querySelector("body").setAttribute("data-theme", "light");
            }
        } catch (error) {

            console.err('Error useEffect : ' + error.message);
        }

    }, [darkMode]);

    return (
        <div className="dark_mode d-none">
            <input
                className="dark_mode_input"
                type="checkbox"
                id="darkmode-toggle"
                onChange={toggleTheme}
                checked={darkMode}
            />
            <label className="dark_mode_label" htmlFor="darkmode-toggle">

            </label>
        </div>
    );
};

export default SystemDefault;
