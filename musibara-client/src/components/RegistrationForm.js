'use client'
import { useRouter } from 'next/navigation';
import React, {useState} from 'react';

export default function RegistrationForm() {
  const router = useRouter()

  const [confirmPassword, setConfirmPassword] = useState("")
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    email: '',
  });

  const submitRegistrationForm = async (event) => {
    event.preventDefault()
    try {
      if (confirmPassword != formData.password) {
        alert("Password confirmation failed: Ensure passwords match.")
        return
      }
      const registrationResult = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData)
      })
      
      const response = await registrationResult.json();
      console.log(response.detail);

      if (!registrationResult.ok) {
        if(response.detail=="User is already registered"){
            router.push('login')
        }
      } 
      else {
        console.log("User registered successfully");
        router.push('/login')
      }
    }
    catch (error) {
      console.log(error) // TODO - don't just console log this
    }
  }

  const handleChange = (event) => {
    const {name, value} = event.target;
    setFormData({ ...formData, [name]: value});
  }

  const handleConfirmPassword = (event) => {
    const {name, value} = event.target
    setConfirmPassword(value)
  }

  return (
    <form onSubmit={submitRegistrationForm} className='space-y-3'>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <h1 className={'mb-3 text-2xl text-black'}>
          Welcome to Musibara!
        </h1>
        <div className='w-full'>
          <div>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-black'
              htmlFor='email'
            >
              Email
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-black'
                id='email'
                type='email'
                name='email'
                placeholder='Enter your email'
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-black'
              htmlFor='phone'
            >
              Phone
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 text-black'
                id='phone'
                type='phone'
                name='phone'
                placeholder='Enter your new phone number'
                onChange={handleChange}
                required
              />
            </div>
          </div>
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
                placeholder='Enter your new username'
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
                placeholder='Enter your new password'
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>
        </div>
        <div className='mt-4'>
          <label
            className='mb-3 mt-5 block text-xs font-medium text-gray-900'
            htmlFor='password'
          >
            Confirm Password
          </label>
          <div className='relative'>
            <input
              className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-black-500 text-black'
              id='passwordConfirmation'
              type='password'
              onChange={handleConfirmPassword}
              name='passwordConfirmation'
              placeholder='Confirm your new password'
              required
              minLength={6}
            />
          </div>
        </div>
        <button 
          className='text-black border border-black rounded px-1 mt-5'
          type='submit'
          onClick={submitRegistrationForm}
        >
          Register
        </button>
        </div>
        <div
          className='flex h-8 items-end space-x-1'
          aria-live='polite'
          aria-atomic='true'
        >
        </div>
    </form>
  );
}
