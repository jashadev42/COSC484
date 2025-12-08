import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TitleBarComponent from "../../components/TitleBarComponent";

export default function SignUpLanding() {
  const navigate = useNavigate();
  const location = useLocation();

  // animations are also included here in addition to the css file
  return (
    <div className="min-h-screen w-full text-white flex flex-col bg-black">

      {/* The styling applied to the main page image */}
      <div className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden">

        {/* TitleBarComponent */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 animate-fadeDown">
          <TitleBarComponent/>
        </div>

        {/* Main Page image */}
        <img
          src="/signUpLandingCoupleImage.jpg" // online source - Photo by Pavel Danilyuk from Pexels: https://www.pexels.com/photo/man-and-woman-sitting-on-snow-holding-firecracker-6550298/
          alt="couple sitting together in the snow holding sparklers"
          className="absolute inset-0 w-full h-full object-cover opacity-0 animate-fadeIn"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/80 opacity-0 animate-fadeInSlow"></div>

        {/* Text that lays above the image */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 text-center px-4 opacity-0 animate-fadeUp">
          <h2 className="text-5xl md:text-5xl font-bold tracking-tight">Keep the Sparks Flying</h2>
        </div>
      </div>

      {/* the signuplanding message */}
      <div className="flex-1 flex items-start justify-center px-6 py-10">
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

          {/* Button directing to phoneauthform - changed this to a modal sheet now instead of new page, but still routest to /auth/phone */}
          <button
            onClick={() => navigate("/auth/phone" , {state : { background: location } } )}
            className="w-full rounded-lg px-6 py-4 bg-white text-base font-semibold text-black transition-colors shadow-md hover:bg-neutral-200 opacity-0 animate-fadeUp"
          >
            Use phone number
          </button>
        </div>
      </div>

    </div>
  );
}
