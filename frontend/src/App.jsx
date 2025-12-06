// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import AppRoutes from "./AppRoutes.jsx";

export default function App() {
    return (
        <section className='flex flex-col w-full h-full'>
            <header>
                <TitleBarComponent/>
            </header>
            <main className='flex w-full justify-center '>
                <PhoneAuthFormComponent/>
            </main>
            <footer>
            </footer>
        </section>
    )
}
