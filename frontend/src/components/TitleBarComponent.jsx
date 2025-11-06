import { useState, useEffect } from 'react'
import { useAuth } from '@contexts/AuthContext'
import sparkLogo from '/spark.svg'

export default function TitleBarComponent() {
    const [viewUser, setViewerUser] = useState("Ronald");
    const [viewUserAge, setViewerAge] = useState(null);
    const { fetchWithAuth } = useAuth();  

    async function fetchViewUser() {
        const res = await fetchWithAuth(`/user/me`); 
        if (!res.ok) return;
        const data = await res.json();
        setViewerUser(data);
        setViewerAge(getAge(data.birthdate));
        console.log(data)
    }

    function getAge(date) {
        const birthDate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    }

    useEffect(() => { fetchViewUser() }, [fetchWithAuth])

    return (
        <div className='w-full h-full text-white flex justify-between'>
        <div className='flex items-end justify-center space-x-2'>
            <h1 className='text-4xl font-title font-bold'>{viewUser?.first_name}</h1> {/* Shows the logged in users name just as an example, this would be the person you're chatting with tho */}
            <h3 className='text-lg text-primary font-normal '>{viewUserAge}</h3>
        </div>
        <img src={sparkLogo} />
        </div>
    )
}