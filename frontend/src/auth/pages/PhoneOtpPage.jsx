// frontend/src/auth/pages/PhoneOtpPage.jsx
import React from "react";
import TitleBarComponent from "../../components/TitleBarComponent";
import PhoneAuthFormComponent from "../../components/PhoneAuthFormComponent";

export default function PhoneOtpPage() {
  return (
    <section className="flex flex-col w-full h-full text-white">
        <PhoneAuthFormComponent />
      <footer className="h-8" />
    </section>
  );
}
