"use client"
import { GrHomeRounded } from "react-icons/gr";
import { GrSearch } from "react-icons/gr";
import { GrUser } from "react-icons/gr";
import { GrInbox } from "react-icons/gr";
import { GrSettingsOption } from "react-icons/gr";
import { GiHamburgerMenu } from "react-icons/gi";

const Sidenav = () => {
    return (
        <div className="sidebar">
            <div className='logoContainer'>
                    <img src="LogoFull.png"></img>
            </div>
            <div className='burgerContainer'>
                <div className="burgerTrigger"></div>
                <GiHamburgerMenu className="burgerMenu" />
            </div>
            <div className='contentContainer'>
                <ul>
                    <li className="active">
                        <a href="/">
                        <GrHomeRounded className="navbar__icon" color="#264653"/>
                        home</a>
                    </li>
                    <li>
                        <a href="/discover">
                        <GrSearch className="navbar__icon" color="#264653"/>
                        discover</a>
                    </li>
                    <li>
                        <a href="/profile">
                        <GrUser className="navbar__icon" color="#264653"/>
                        profile</a>
                    </li>
                    <li>
                        <a href="/notifications">
                        <GrInbox className="navbar__icon" color="#264653"/>
                        notifications</a>
                    </li>
                    <li>
                        <a href="/settings">
                        <GrSettingsOption className="navbar__icon" color="#264653"/>
                        settings</a>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Sidenav;
