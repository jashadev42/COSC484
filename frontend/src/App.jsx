import TitleBarComponent from './components/TitleBarComponent'
import PhoneAuthFormComponent from './components/PhoneAuthFormComponent'
import ProfileScreen from './components/ProfileScreen'
import { useAuth } from '@contexts/AuthContext'
import './index.css'

export default function App() {
    const { isAuthenticated } = useAuth()

    return (
        <section className='flex flex-col w-full h-full'>
            <header>
                <TitleBarComponent/>
            </header>
            <main className='flex w-full justify-center '>
                {isAuthenticated ? <ProfileScreen/> : <PhoneAuthFormComponent/>}
            </main>
            <footer>
            </footer>
        </section>
    )
}
