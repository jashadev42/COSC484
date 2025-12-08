import React from "react";
import { useNavigate } from "react-router-dom";

export default function SignUpLanding() {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full items-center text-white flex flex-col bg-black ">

      {/* The styling applied to the main page image */}
      <div className="w-full overflow-hidden h-fit">
        <img
          src="/signUpLandingCoupleImage.jpg" // online source - Photo by Pavel Danilyuk from Pexels: https://www.pexels.com/photo/man-and-woman-sitting-on-snow-holding-firecracker-6550298/
          alt="Hero"
          className=" w-full h-full max-h-[400px] object-cover opacity-0 animate-fadeIn"
        />

        <div className="absolute bottom-0 inset-0 bg-linear-to-b from-black/40 to-black/80 opacity-0 animate-fadeInSlow"></div>
      </div>


      <div className="flex flex-col space-y-4 py-10 z-20">
        <h2 className="text-4xl font-bold tracking-tight text-neutral-200 w-60 text-center">Keep the Sparks Flying</h2>
        {/* the signuplanding message */}
        <div className="flex-1 flex items-start justify-center px-6 py">
          <div className="w-full max-w-sm text-center">

            {/* Spark "lighting boldt" logo */}
            <div className="flex items-center justify-center mb-10 opacity-0 animate-fadeIn">
              <img
                src="/spark-logo-gold.svg"
                alt="Spark logo"
                className="h-40 w-40"
              />
            </div>

            {/* Sign Up to Continue mesage */}
            <h1 className="text-xl font-medium tracking-tight mb-8 text-neutral-200 opacity-0 animate-fadeUp">
              Sign up to continue
            </h1>

            {/* Button directing to phoneauthform - changed this to a modal sheet now instead of new page */}
            <button
              onClick={() => navigate("/auth/phone", { state: {modal: true} })}
              className="w-full rounded-2xl px-6 py-4 bg-white text-base font-semibold text-black transition-colors shadow-md hover:bg-neutral-200 opacity-0 animate-fadeUp"
            >
              Use phone number
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
