import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import SearchBar from "@/components/SearchBar";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <LoginForm />
      </div>
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <SearchBar />
      </div>
    </main>
  );
}
