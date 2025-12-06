import { useState } from 'react'
import TitleBarComponent from '@components/TitleBarComponent'
import PhoneAuthFormComponent from '@components/PhoneAuthFormComponent'
import './index.css'
import { useAuth } from '@contexts/AuthContext'
import { Matchmaking } from './components/Matchmaking'

export default function App() {
    const {isAuthenticated} = useAuth();

    return (
        <section className='flex flex-col w-full h-full'>
            <header>
                <TitleBarComponent/>
            </header>
            {isAuthenticated && <Matchmaking/>}
            <main className='flex w-full justify-center '>
                <PhoneAuthFormComponent/>
            </main>
            <footer>
            </footer>
        </section>
    )
}