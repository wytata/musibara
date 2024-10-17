"use client";

import { GrHomeRounded } from "react-icons/gr";
import { GrSearch } from "react-icons/gr";
import { GrUser } from "react-icons/gr";
import { GrInbox } from "react-icons/gr";
import { GrSettingsOption } from "react-icons/gr";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";
import Link from "next/link";

const apiTest = async () => {
    console.log("api test")
    const usersRequest = await fetch("http://localhost:8000/api/users", {
        credentials: "include",
    })
    const resJson = await usersRequest.json()
    console.log(resJson)
}

const authMeBrotha = async () => {
    try {
        const tokenResponse = await fetch("http://localhost:8000/api/users/token", {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                "username": "wyatt",
                "password": "Hyldf7Epoa"
            })
        })
        return tokenResponse
    } catch (err) {
        console.log(err)
    }
}

const Sidenav = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };


    return (
        <div className="sidebar">
            <div className='logoContainer'>
                <img src="LogoFull.png"></img>
            </div>
            <div className='contentContainer'>
                <ul>
                    <li>
                        <Link href="/"><GrHomeRounded className="navbar__icon" color="#264653" />Home</Link>
                    </li>
                    <li>
                        <Link href="/discover"><GrSearch className="navbar__icon" color="#264653" />discover</Link>
                    </li>
                    <li>
                        <Link href="/profile"><GrUser className="navbar__icon" color="#264653" />profile</Link>
                    </li>
                    <li>
                        <Link href="/notifications"><GrInbox className="navbar__icon" color="#264653" />notifications</Link>
                    </li>
                    <li>
                        <Link href="/settings"><GrSettingsOption className="navbar__icon" color="#264653" />settings</Link>
                    </li>
                </ul>
            </div>
            <button onClick={authMeBrotha}>AUTHHHHH</button> <br />
            <button onClick={apiTest}>Hello world!</button>
        </div>
    )
}

export default Sidenav;
