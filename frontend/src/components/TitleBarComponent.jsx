import { useState, useEffect } from 'react'
import sparkLogo from '/spark.svg'

function TitleBarComponent() {
    const [viewUser, setViewerUser] = useState("Ronald");
    const [viewUserAge, setViewerAge] = useState(-1);
    
    // Should move these to external files and import the function
    async function fetchViewUser() {
        const res = await fetch(`${__API_URL__}/`);
        if (!res.ok) return;
        const data = await res.json();
        setViewerUser(data);
        setViewerAge(getAge(data.birthdate))
    }

    function getAge(date) {
        const birthDate = new Date(date);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // If birthday hasn't occurred this year yet, subtract 1
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    useEffect(() => {
        fetchViewUser()
    }, [])


    return (
            <div className='w-full h-full text-white flex justify-between'>
                <div className='flex items-end justify-center space-x-2'>
                    <h1 className='text-4xl font-title font-bold'>{viewUser?.first_name}</h1>
                    <h3 className='text-lg text-primary font-normal '>{viewUserAge}</h3>
                </div>
                <img src={sparkLogo}></img> 
            </div>
    )
}

export default TitleBarComponent
