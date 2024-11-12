import { MDBIcon } from "mdb-react-ui-kit";
import React, { useEffect, useState } from "react";
import SystemDefault from "./SystemDefault";

const DarkMode = () => {

    const [selectedColorTheme, setSelectedColorTheme] = useState(
        localStorage.getItem("selectedColorTheme") || "dark"
    );
    const [showSystemDefault, setShowSystemDefault] = useState(
        selectedColorTheme === "system"
    );

    const toggleTheme = (theme) => {

        try {

            console.log("[toggleTheme] ------ ---- ");

            setSelectedColorTheme(theme);
            localStorage.setItem("selectedColorTheme", theme);
            setShowSystemDefault(theme === "system");

            // Reload the page if the system default is selected
            if (theme === "system") {
                window.location.reload();
            }

        } catch (error) {

            console.err('Error toggleTheme : ' + error.message);
        }

    };

    useEffect(() => {

        try {

            console.log("[useEffect] ------selectedColorTheme ---- ");

            const body = document.querySelector("body");

            if (selectedColorTheme === "dark") {

                body.setAttribute("data-theme", "dark");
            } else if (selectedColorTheme === "light") {

                body.setAttribute("data-theme", "light");
            } else {

                body.setAttribute("data-theme", "dark");
            }

            if (selectedColorTheme === "system") {

                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if ((systemPrefersDark && !body.hasAttribute("data-theme")) ||
                    (!systemPrefersDark && body.hasAttribute("data-theme", "dark"))) {

                    body.setAttribute("data-theme", systemPrefersDark ? "dark" : "light");
                }
            }
        } catch (error) {

            console.err('Error useEffect : ' + error.message);
        }


    }, [selectedColorTheme]);


    return (
        <div className="dark_mode">
            <div className="options">
                <ul>
                    <li>
                        <a
                            type="checkbox"
                            className={`nav-link px-3 d-flex justify-content-start align-items-center ${selectedColorTheme === "light" ? "active" : ""
                                }`}
                            onClick={() => toggleTheme("light")}
                        >
                            <MDBIcon far icon="sun" className="me-2 position-relative" /> Light
                        </a>
                    </li>
                    <hr className="border my-1" />
                    <li>
                        <a
                            type="checkbox"
                            className={`nav-link px-3 d-flex justify-content-start align-items-center ${selectedColorTheme === "dark" ? "active" : ""
                                }`}
                            onClick={() => toggleTheme("dark")}
                        >
                            <MDBIcon far icon="moon" className="me-2 position-relative" /> Dark
                        </a>
                    </li>
                    <hr className="border my-1" />
                    <li>
                        <a
                            type="checkbox"
                            className={`nav-link px-3 d-flex justify-content-start align-items-center ${selectedColorTheme === "system" ? "active" : ""
                                }`}
                            onClick={() => toggleTheme("system")}
                        >
                            <MDBIcon fas icon="desktop" className="me-2 position-relative" /> System Default
                        </a>
                    </li>
                </ul>
            </div>
            {showSystemDefault && <SystemDefault />}
        </div>
    );
};

export default DarkMode;
