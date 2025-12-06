import { useState } from 'react'
import TitleBarComponent from './auth/components/TitleBarComponent'
import PhoneAuthFormComponent from './auth/components/PhoneAuthFormComponent'
import AppRoutes from './routes/AppRoutes'
import './index.css'

export default function App() {
    return (
        <section className='flex flex-col w-full h-full'>
            <header>
                <TitleBarComponent/>
            </header>
            <main className='flex w-full justify-center '>
                <AppRoutes /> 
            </main>
            <footer>
            </footer>
        </section>
    )
}