'use client';

import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import SearchBar from "@/components/SearchBar";
import React, { useState, useEffect } from 'react';

export default function LoginPage() {
  const [selectedResult, setSelectedResult] = useState(null);

  const handleSelectResult = (result) => {
      setSelectedResult(result)
  };

  return (
    <main className="flex flex-col items-center justify-around md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <LoginForm />
      </div>
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <SearchBar searchCategory="postTags" onSelectResult={handleSelectResult}/>
      </div>
    </main>
  );
}
