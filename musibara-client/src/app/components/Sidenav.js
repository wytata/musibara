"use client";
import { GrHomeRounded } from "react-icons/gr";
import { GrSearch } from "react-icons/gr";
import { GrUser } from "react-icons/gr";
import { GrInbox } from "react-icons/gr";
import { GrSettingsOption } from "react-icons/gr";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";

const Sidenav = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };


    return (
        <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className='logoContainer'>
                    <img src="LogoFull.png"></img>
            </div>
            <div className='burgerContainer' onClick={toggleCollapse}>
                <div className="burgerTrigger"></div>
                <GiHamburgerMenu className="burgerMenu" />
            </div>
            <div className='contentContainer'>
                <ul> 
                    <a href="/" className="active">
                        <li>
                            <GrHomeRounded className="navbar__icon" color="#264653"/>
                            home
                        </li>
                    </a>
                    <a href="/discover">
                        <li>
                            <GrSearch className="navbar__icon" color="#264653"/>
                            discover
                        </li>
                    </a>
                    <a href="/profile">
                        <li>
                            <GrUser className="navbar__icon" color="#264653"/>
                            profile
                        </li>
                    </a>
                    <a href="/notifications">
                        <li>
                            <GrInbox className="navbar__icon" color="#264653"/>
                            notifications
                        </li>
                    </a>
                    <a href="/settings">
                        <li>
                            <GrSettingsOption className="navbar__icon" color="#264653"/>
                            settings
                        </li>
                    </a>
                </ul>
            </div>
        </div>
    )
}

export default Sidenav;