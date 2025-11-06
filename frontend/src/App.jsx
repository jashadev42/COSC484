import { useState } from 'react'
import TitleBarComponent from './components/TitleBarComponent'
import PhoneAuthComponent from './components/PhoneAuthComponent'
import './index.css'

function App() {
    return (
        <section className='flex flex-col w-full h-full'>
            <header>
                <TitleBarComponent/>
            </header>
            <main className='flex w-full justify-center '>
                {/*  */}
                <PhoneAuthComponent/>
            </main>
            <footer>
                {/*  */}
            </footer>
        </section>
    )
}

export default App
