'use client';

import React, {useState} from 'react'
import { useRouter } from 'next/navigation';


export default function LoginForm({setLoggedIn}) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
 
  const [loginMessage, setLoginMessage] = useState(null)

  const submitLoginInfo = async (event) => {
    event.preventDefault()
    console.log(`${process.env.NEXT_PUBLIC_API_URL}`)
    const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'username': formData.username,
        'password': formData.password
      }),
    })
    const result = await loginResponse.json();
    if (loginResponse.ok) {
      router.push('/')
      setLoginMessage('Success. You are now being directed to the home page...')
      setLoggedIn(true)
    } else {
      console.log("Failed to login")
      console.log(result);
      setLoginMessage('You entered the wrong credentials')
      setLoggedIn(false)
    }
  }

  const handleChange = (event) => {
    const {name, value} = event.target;
    console.log(`name: ${name}\nvalue: ${value}`)
    setFormData({ ...formData, [name]: value});
  }
 
  return (
    <form onSubmit={submitLoginInfo} className='space-y-3'>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <h1 className={'mb-3 text-2xl text-black'}>
          Please log in to continue.
        </h1>
        <div className='w-full'>
          <div>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-black'
              htmlFor='username'
            >
              Username
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-black'
                id='username'
                type='username'
                name='username'
                placeholder='Enter your username'
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className='mt-4'>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='password'
            >
              Password
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-black-500 text-black'
                id='password'
                type='password'
                name='password'
                placeholder='Enter password'
                required
                onChange={handleChange}
                minLength={6}
              />
            </div>
          </div>
        </div>
        <button 
          className='text-black mt-5 border border-black rounded px-2 py-1'
          type='submit'
          > 
          Log In
        </button>
        <div
          className='flex h-8 items-end space-x-1'
          aria-live='polite'
          aria-atomic='true'
        >
        </div>
        <div>
          <h2 className='text-black'>Don&apos;t have an account yet? <a style={{color: '#264653'}} href='/register'>Register</a></h2>
        </div>
        <div>
          <h1 className='text-black'>{loginMessage}</h1>
        </div>
      </div>
    </form>
  );
}