import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@contexts/AuthContext'
import sparkLogo from '/spark.svg'

export default function PhoneAuthFormComponent() {
    const { loading, error, setError, otpSent, session, user, requestOtp, verifyOtp } = useAuth();
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
        <div className="flex flex-col justify-center space-y-12 max-w-98">
        <form className="flex flex-col" onChange={() => setError("")} onSubmit={onGetOtp}>
            {error && <p className="text-red">{error}</p>}
            <input
            name="phoneNumber"
            type="tel"
            className="outline-none text-center px-4"
            placeholder="Enter phone number in +1 format"
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={loading}
            />
            <button type="submit" className="bg-primary" disabled={loading}>get otp code</button>
        </form>

        {otpSent && (
            <div className="text-center">
            <h1 className="whitespace-nowrap">code sent! your phone should get a otp code shortly</h1>
            <form className="flex flex-col" onSubmit={onVerify}>
                <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="outline-none text-6xl tracking-[0.4em] text-center"
                onChange={(e) => setCode(e.target.value.toString())}
                required
                disabled={loading}
                />
                <button type="submit" className="bg-green-400" disabled={loading}>submit</button>
            </form>
            <button onClick={() => requestOtp(phone)} disabled={loading}>resend otp</button>
            </div>
        )}

        {session && (
            <div className="w-fit break-all">
            <h3 className="text-green-300">you are authorized!</h3>
            <p>id: {user?.id || "none"}</p>
            <p className="w-fit text-red">bearer token: <span className="text-primary">{session?.access_token || "none"}</span></p>
            </div>
        )}
        </div>
    );
}