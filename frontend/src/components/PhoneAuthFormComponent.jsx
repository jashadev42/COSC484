import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'

export default function PhoneAuthFormComponent() {
    const { loading, error, setError, otpSent, session, user, requestOtp, verifyOtp, signOut } = useAuth();
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const navigate = useNavigate();

    const onGetOtp = useCallback(async (e) => {
        e.preventDefault();
        await requestOtp(phone);
    }, [phone, requestOtp]);

    const onVerify = useCallback(async (e) => {
        e.preventDefault();
        await verifyOtp({ phone, code });
    }, [phone, code, verifyOtp]);

    useEffect(() => {
        if (session?.access_token) {
            navigate("/spark", { replace: true });
        }
    }, [session?.access_token, navigate]);

    return (
        <div className="w-full text-center">
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

        {!otpSent && !session && (
            <form className="space-y-4" onChange={() => setError("")} onSubmit={onGetOtp}>
                {error && <p className="text-red">{error}</p>}
                {/* phone number input */}
                <input
                    name="phoneNumber"
                    type="tel"
                    className="w-full rounded-2xl px-6 py-4 bg-white text-base font-semibold text-black transition-colors shadow-md"
                    placeholder="Enter Phone Number in +1 format"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                />
                <button type="submit" className="w-full rounded-2xl px-6 py-4 bg-white text-base font-semibold text-black transition-colors shadow-md" disabled={loading}>
                    Get one-time passcode
                </button>
            </form>
        )}
            
        {/* input for OTP */}
        {otpSent && !session && (
            <form className="space-y-4 mt-4" onSubmit={onVerify}>
                {error && <p className="text-red-400">{error}</p>}

                <p className= "text-green-300"> code sent! your phone should receive an otp code shortly. </p>
                <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className="w-full rounded-2xl px-6 py-4 bg-white text-base font-semibold text-black transition-colors shadow-md"
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
                <button type="button" onClick={() => requestOtp(phone)} className="w-full rounded-2xl px-6 py-4 bg-white text-base font-semibold text-black shadow-md" disabled={loading}> 
                    Resend OTP
                </button>
            </form>
        )}

            {session && (
                <div className="mt-6 space-y-3 text-left">
                    <h3 className="text-green-300">You are authorized!</h3>
                    <p>id: {user?.id || "none"}</p>
                    <p className="w-fit text-red">bearer token: <span className="text-primary">{session?.access_token || "none"}</span></p>

                    <button onClick={signOut} className='bg-red-500 px-4 py-2 rounded-xl text-white mt-4'>Sign Out</button>
                </div>
            )}
            </div>
        </div>
    );
}