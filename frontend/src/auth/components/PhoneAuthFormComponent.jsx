import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@contexts/AuthContext'

export default function PhoneAuthFormComponent() {
    const { loading, error, setError, otpSent, session, user, requestOtp, verifyOtp, signOut } = useAuth();
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");

    const onGetOtp = useCallback(async (e) => {
        e.preventDefault();
        await requestOtp(phone);
    }, [phone, requestOtp]);

    const onVerify = useCallback(async (e) => {
        e.preventDefault();
        await verifyOtp({ phone, code });
    }, [phone, code, verifyOtp]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 text-white">
            <div className="w-full max-w-sm text-center">

            {/* Logo from prev page*/}
            <div className= "flex items-center justify-center mb-10">
                <img
                    src="/spark-logo-gold.svg"
                    alt="Spark logo"
                    className="h-40 w-40"
            />
            </div>

            {/* title/heading */}
            {!session && (
                <h1 className=" font-medium tracking-tight mb-8 text-neutral-200">
                    Enter your phone number and we’ll text you a one‑time code
                    to sign in or create an account.
                </h1>
            )}

            <form className="space-y-4" onChange={() => setError("")} onSubmit={onGetOtp}>
                {error && <p className="text-red">{error}</p>}
                <input
                    name="phoneNumber"
                    type="tel"
                    className="w-full rounded-2xl px-6 py-4 bg-white text-base font-semibold text-black transition-colors shadow-md"
                    placeholder="Enter Phone Number in +1 format"
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                />      
                <button type="submit" className="w-full rounded-2xl px-6 py-4 bg-primary text-2xl text-base font-semibold text-black transition-colors shadow-md" disabled={loading}>
                    Get one-time passcode
                </button>           
            </form>

            {otpSent && !session && (
                <div className="text-center">
                    <h1 className="whitespace-nowrap"><span className='text-primary'>code sent!</span> your phone should recieve an otp code shortly</h1>
                    <form className="space-y-4 mt-4" onSubmit={onVerify}>
                        <input
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            className="outline-none text-6xl tracking-[0.4em] text-center"
                            value={code}
                            // only allow numbers
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setCode(value);
                                }
                            }}
                            required
                            disabled={loading}
                        />
                    <button type="submit" className="w-full rounded-2xl px-6 py-4 bg-white text-base font-semibold text-black transition-colors shadow-md" disabled={loading}>submit</button>
                    </form>
                    <button onClick={() => requestOtp(phone)} disabled={loading}>Resend otp</button>
                </div>
            )}

            {session && (
                <div>
                    <div className="mt-6 space-y-3 text-left">
                        <h3 className="text-green-300">You are authorized!</h3>
                        <p>id: {user?.id || "none"}</p>
                        <p className="w-fit text-red">bearer token: <span className="text-primary">{session?.access_token || "none"}</span></p>
                    </div>
                    <button onClick={signOut} className='bg-red-500 px-4 py-2 rounded-xl text-white mt-4'>Sign Out</button>
                </div>
            )}
        </div>
    </div>
    );
}