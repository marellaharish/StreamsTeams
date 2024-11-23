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
        <div className="ThemeOptions">
            <div className="">
                <ul className="p-0">
                    <li onClick={() => toggleTheme("light")} className={`${selectedColorTheme === "light" ? "active" : ""
                        }`}>
                        <a
                            type="checkbox"


                        >
                            <MDBIcon far icon="sun" className="me-2 position-relative" /> Light
                        </a>
                    </li>

                    <li onClick={() => toggleTheme("dark")} className={`${selectedColorTheme === "dark" ? "active" : ""
                        }`}>
                        <a
                            type="checkbox"

                        >
                            <MDBIcon far icon="moon" className="me-2 position-relative" /> Dark
                        </a>
                    </li>

                    <li onClick={() => toggleTheme("system")} className={`${selectedColorTheme === "system" ? "active" : ""
                        }`}>
                        <a
                            type="checkbox"
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
