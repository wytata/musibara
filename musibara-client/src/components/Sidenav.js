'use client';

import { GrHomeRounded } from 'react-icons/gr';
import { GrSearch } from 'react-icons/gr';
import { GrUser } from 'react-icons/gr';
import { GrInbox } from 'react-icons/gr';
import { GrSettingsOption } from 'react-icons/gr';
import { GiHamburgerMenu } from 'react-icons/gi';
import { GiCapybara } from "react-icons/gi";
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataContext } from '@/app/layout'; 

const apiUrl = process.env.NEXT_PUBLIC_API_URL

const Sidenav = ({logged, setLogged}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter()

    const { userData } = useContext(DataContext);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const checkAuth = async () => {
        try {
            const fetchResponse = await fetch(apiUrl + `/api/users/me`, {
                method: "GET",
                credentials: "include"
            });

            if (fetchResponse.status === 401) {
                setLogged(false);
            } else {
                setLogged(true);
            }
        } catch (err) {
            console.log(err)
            setLogged(false);
        }
    };

    const handleLogout = async () => {
        try {
            const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout`, {
                credentials: "include"
            })
            if (request.ok) {
                setLogged(false)
                router.push("/login")      
            } else {
                alert("Server error: unable to log out user.")
            }
        } catch (err) {
            console.log('Error signing out', err);
        }
    };

    useEffect(() => { checkAuth(); }, []);

    return (
        <div className='sidebar' style={{display: 'flex col'}}>
            <div className='logoContainer' style={{display: 'flex', justifyContent: 'center'}}>
                <img src='LogoFull.png' style={{width: '80%'}}></img>
            </div>
            <div className='contentContainer' style={{margin: '2rem 0 0 0', transition: 'opacity 0.2s'}}>
                <ul>
                    <li>
                        <Link href='/'><GrHomeRounded className='navbar__icon' color='#264653' />home</Link>
                    </li>
                    <li>
                        <Link href='/discover'><GrSearch className='navbar__icon' color='#264653' />discover</Link>
                    </li>
                    {logged && (
                        <>
                        <li>
                            <Link href={`/profile/${userData.username}`}><GrUser className='navbar__icon' color='#264653' />profile</Link>
                        </li>
                        <li>
                            <Link href='/notifications'><GrInbox className='navbar__icon' color='#264653' />notifications</Link>
                        </li>
                        <li>
                            <Link href='/settings'><GrSettingsOption className='navbar__icon' color='#264653' />settings</Link>
                        </li>
                        </>
                    )}
                </ul>
            </div>
            <div className='contentContainer' style={{margin: '2rem 0 0 0', transition: 'opacity 0.2s'}}>
                <ul>
                    {logged ? (
                        <li style={{width: '100%'}}> 
                            <button style={{display: 'flex', alignItems: 'center', padding: '0.75rem 2rem 1rem 1rem', width: '100%', color: '#264653', fontSize: '1.2rem', margin: '0.75rem 0'}} onClick={handleLogout}><GiCapybara style={{marginRight: '1rem', marginLeft: '1rem'}}className='navbar__icon' color='#264653'/>sign out</button>
                            </li>
                    ): (
                        <li style={{width: '100%'}}> 
                            <Link href='/login'><GiCapybara className='navbar__icon' color='#264653'/>sign in</Link>
                        </li>  
                    )}
                </ul>
            </div>
        </div>
    )
}

export default Sidenav;
