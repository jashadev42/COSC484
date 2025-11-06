import { useState, useEffect } from 'react'
import sparkLogo from '/spark.svg'

function PhoneAuthComponent() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpAnswer, setOtpAnswer] = useState("");
    const [authData, setAuthData] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Should move these to external files and import the function
    // Need to use the auth bearer token retrieved here in all future api calls!
    // Should probably setup the axios client in 'api/client.js' when we get the bearer token

    // this sequence will create a user profile for you on the backend (in supabases)
    async function getOtp() {
        try {
            if (phoneNumber == "") return alert("Phone number can't be blank!");

            setLoading(true)
            const res = await fetch(`${__API_URL__}/auth/phone/otp?phone=${encodeURIComponent(phoneNumber)}`);
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                setError(`Error occurred: ${errorData.message || res.statusText}`);
                throw new Error("Failed to send phone one time password!");
            }
            
            const data = await res.json();
            console.log(data);
            setOtpSent(true);
            setLoading(false);
        } catch (error) {
            console.error("OTP request failed:", error);
            setError(error.message || "Failed to send OTP. Please try again.");
        }
    }

    async function answerOtp() {
        try {
            if (otpAnswer.toString().length < 6) {
                return alert("OTP codes are 6 digits!");
            }
            
            setLoading(true);
            const res = await fetch(`${__API_URL__}/auth/phone/otp`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "phone": phoneNumber,
                    "code": otpAnswer
                })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Authentication failed with status ${res.status}`);
            }
            
            const data = await res.json();
            console.log(data);
            setAuthData(data);
            setLoading(false);
        } catch (error) {
            console.error("OTP verification failed:", error);
        }
    }

    return (
        <div className='flex flex-col justify-center space-y-12 max-w-98'>
            
            <form className='flex flex-col' onChange={() => setError("")} onSubmit={(e) => {e.preventDefault(); getOtp()}}>
                {error && (
                    <p className='text-red'>{error}</p>
                )}
                <input name="phoneNumber" type='tel' className='outline-none text-center px-4' placeholder='Enter phone number in +1 format' onChange={(e) => setPhoneNumber(e.target.value)} required></input>
                <button type="submit" className='bg-primary'>get otp code</button>
            </form>

            {otpSent && (
                <>
                    <div className='text-center'>
                        <h1 className='whitespace-nowrap'>code sent! your phone should get a otp code shortly</h1>
                        <form className="flex flex-col" onChange={() => setError("")} onSubmit={(e) => {e.preventDefault(); answerOtp()}}>
                            <input type="number" max={999099}  className="outline-none text-6xl tracking-[0.4em] text-center" onChange={(e) => setOtpAnswer(e.target.value.toString())} required></input>
                            <button type="submit" className='bg-green-400'>submit</button>
                        </form>
                        <button onClick={() => getOtp()}>resend otp</button>
                    </div>
                </>
            )}

            {authData && (
               <div className='w-fit break-all'>
                    <h3 className='text-green-300'>you are authorized!</h3>
                    <p>id: {authData?.user.id || "none"}</p>
                    <p className='w-fit text-red'>bearer token: <span className='text-primary'>{authData.session?.access_token || "none"}</span></p>
                </div>
            )}
        </div>
    )

}

export default PhoneAuthComponent