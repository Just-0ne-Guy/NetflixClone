"use client";

import useAuth from "@/hooks/useAuth";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface Inputs {
  email: string;
  password: string;
}

function Login() {
  const [login, setLogin] = useState(false);
  const { signIn, signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
    if (login) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  return (
    <div className="relative flex h-screen w-screen flex-col bg-black sm:items-center sm:justify-center sm:bg-transparent">
      <Head>
        <title>Netflix</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Image
        src="https://assets.nflxext.com/ffe/siteui/vlv3/d0982892-13ac-4702-b9fa-87a410c1f2da/519e3d3a-1c8c-4fdb-8f8a-7eabdbe87056/AE-en-20220321-popsignuptwoweeks-perspective_alpha_website_large.jpg"
        alt="Netflix background"
        layout="fill"
        className="-z-10 hidden! opacity-60 sm:inline!"
        objectFit="cover"
      />
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
        className="absolute left-4 top-4 cursor-pointer object-contain sm:left-10 sm:top-6"
        width={150}
        height={150}
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative mt-24 w-full space-y-8 rounded bg-black/75 py-10 px-6 sm:mt-0 sm:max-w-md sm:px-14"
      >
        <h1 className="text-3xl font-semibold">Sign In</h1>

        <div className="space-y-4">
          <label className="block">
            <input
              type="email"
              placeholder="Email or mobile number"
              className="w-full rounded bg-transparent border border-white/40 px-5 py-4 text-sm text-white placeholder-gray-300 outline-none focus:border-white focus:bg-black/40 transition focus:ring-1 focus:ring-white/50"
              {...register("email", { required: true })}
            />
            {errors.email && (
              <p className="p-1 text-[13px] font-light  text-[#e50914]">
                Please enter a valid email or mobile number.
              </p>
            )}
          </label>

          <label className="block">
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded bg-transparent border border-white/40 px-5 py-4 text-sm text-white placeholder-gray-300 outline-none focus:border-white focus:bg-black/40 transition focus:ring-1 focus:ring-white/50"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <p className="p-1 text-[13px] font-light  text-[#e50914]">
                Your password must contain between 4 and 60 characters.
              </p>
            )}
          </label>

          <button
            type="submit"
            className="w-full rounded bg-[#e50914] py-3 font-semibold text-white hover:bg-[#f6121d] transition cursor-pointer"
            onClick={() => setLogin(true)}
          >
            Sign In
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-600/60" />
            <span className="text-sm text-gray-300">OR</span>
            <div className="h-px flex-1 bg-gray-600/60" />
          </div>

          <button
            type="button"
            className="w-full rounded bg-[#333]/80 py-3 font-semibold text-white hover:bg-[#333] transition cursor-no-drop"
          >
            Use a Sign-In Code
          </button>

          <button
            type="button"
            className="w-full text-center text-sm text-white/90 hover:underline font-semibold cursor-no-drop"
          >
            Forgot password?
          </button>

          <div className="flex items-center justify-between text-sm text-gray-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-white cursor-pointer"
              />
              Remember me
            </label>
          </div>
        </div>

        <div className="space-y-3 ">
          <p className="text-gray-300">
            New to Netflix?{" "}
            <button
              type="submit"
              className="text-white hover:underline font-semibold cursor-pointer"
              onClick={() => setLogin(false)}
            >
              Sign up now.
            </button>
          </p>

          <p className="text-xs text-gray-400">
            This page is protected by Google reCAPTCHA to ensure you&apos;re not
            a bot.
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
