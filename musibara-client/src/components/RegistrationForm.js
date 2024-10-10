"use client"

import React, {useState} from "react";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const submitRegistrationForm = async (event) => {
    event.preventDefault()
    try {
      const registrationResult = await fetch("http://localhost:8000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData)
      })
      console.log(registrationResult.body)
    } catch (error) {
      console.log(error) // TODO - don't just console log this
    }
  }

  const handleChange = (event) => {
    const {name, value} = event.target;
    console.log(`name: ${name}\nvalue: ${value}`)
    setFormData({ ...formData, [name]: value});
  }

  return (
    <form onSubmit={submitRegistrationForm} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`mb-3 text-2xl text-black`}>
          Welcome to Musibara!
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-black"
              htmlFor="username"
            >
              Username
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="username"
                type="username"
                name="username"
                placeholder="Enter your new username"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-black-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter your new password"
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="password"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-black-500"
              id="passwordConfirmation"
              type="passwordConfirmation"
              name="passwordConfirmation"
              placeholder="Confirm your new password"
              required
              minLength={6}
            />
          </div>
        </div>
        <button className="text-black">hello I am button</button>
        </div>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
        </div>
    </form>
  );
}
