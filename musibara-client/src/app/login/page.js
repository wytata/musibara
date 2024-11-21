'use client';

import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import SearchBar from "@/components/SearchBar";
import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from '@/app/layout'; 


export default function LoginPage() {
  const [selectedResult, setSelectedResult] = useState(null);

  const { userData, setUserData, loggedIn, setLoggedIn } = useContext(DataContext);

  const handleSelectResult = (result) => {
      setSelectedResult(result)
  };

  return (
    <main className="flex flex-col items-center justify-around md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <LoginForm setLoggedIn={setLoggedIn} loggedIn={loggedIn}/>
      </div>
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <SearchBar searchCategory="postTags" onSelectResult={handleSelectResult}/>
      </div>
    </main>
  );
}