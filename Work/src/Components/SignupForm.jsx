import { useState } from "react";
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from "react-router-dom";


function SignupForm() {
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState("");
    const [mobilenumber, setMobileNumber] = useState("");
    const [error, setError] = useState('');

    const handleSignupbutton= async (e) => {
        e.preventDefault();
        
        //fields validation
        if(!name || !email || !password || !age || !mobilenumber)
        {
            setError("All fields are required.");
            return;
        }
         const nameRegex = /^[A-Za-z\s]{2,50}$/;
        if (!name || !nameRegex.test(name)) {
            setError("Please enter a valid name (letters only, min 2 characters).");
            return;
        }
        //email format validation
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            setError("Invalid Email Format!");
            return;
        }
        //mobile number format validation
        const mobilenumberRegex = /^0\d{10}$/;
        if (!mobilenumberRegex.test(mobilenumber)) {
            setError("Incorrect Contact Number! It should start with 0 and have 11 digits.");
            return;
        }

        try {
            const res = await fetch("http://localhost:5001/api/v1/register",{
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify({name, email,password,age, mobilenumber}),
            })
            const data = await res.json();
            if(res.ok)
            {
                alert("Registration completed Successfully.")
                navigate('/login');
            }
            else {
                setError(data.message || "registration failed")
            }
        } catch (error) {
            console.error(error);
            setError("Server Error. Try again later");
        }
    };

    return (
        <div className={`flex flex-col bg-gray-400 items-center bg-white opacity-70 mix-blend-luminosity rounded-3xl shadow-xl box-border m-auto p-auto ${isMobile ? ' mt-1 w-10/13 h-170': 'mt-3 w-1/2 h-190'}`}>
            <button className={`m-1 p-2 text-center border border-gray-700 border-3 hover:bg-black hover:text-white ${isMobile ? 'w-25': 'w-35'}`}
            onClick={() => navigate(-1)}>← Back</button>
            <h1 className={`m-2 font-bold ${isMobile ? 'text-lg p-0': ' p-2 text-2xl'}`}>Welcome to EaseManagement! </h1>
            <form onSubmit={handleSignupbutton}>
                <div className={`flex flex-col m-4`}>
                    <label className={` text-xl ${isMobile ? 'm-0': ' m-2'}`}
                    htmlFor="name">Name</label>
                    <input className={`bg-transparent border border-black-400 border-2 m-2 p-2 text-black ${isMobile ? ' w-50 h-8': 'w-80 h-10'}`}
                    type="text" value={name} onChange={(e)=>setName(e.target.value)}/>
                    <label className={` text-xl ${isMobile ? 'm-0': ' m-2'}`} 
                    htmlFor="email">Email</label>
                    <input className={`bg-transparent border border-black-400 border-2 m-2 p-2 text-black ${isMobile ? ' w-50 h-8': 'w-80 h-10'}`}
                    type="text" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                    <label className={`text-xl ${isMobile ? 'm-0': ' m-2'}`} 
                    htmlFor="password">Password</label>
                    <input className={`bg-transparent border border-black-400 border-2 m-2 p-2 text-black ${isMobile ? ' w-50 h-8': 'w-80 h-10'}`}
                    type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                    <label className={`text-xl ${isMobile ? 'm-0': ' m-2'}`} 
                    htmlFor="age">Age</label>
                    <input className={`bg-transparent border border-black-400 border-2 m-2 p-2 text-black ${isMobile ? ' w-50 h-8': 'w-80 h-10'}`}
                    type="number" value={age} onChange={(e)=>setAge(e.target.value)}/>
                    <label className={`text-xl ${isMobile ? 'm-0': ' m-2'}`} 
                    htmlFor="mobilenumber">Mobile Number</label>
                    <input className={`bg-transparent border border-black-400 border-2 m-2 p-2 text-black ${isMobile ? ' w-50 h-8': 'w-80 h-10'}`}
                    type="text" value={mobilenumber} onChange={(e)=>setMobileNumber(e.target.value)}/>
                </div>
                {/* Display Error Message Here */}
                {error && (
                    <div className="text-red-500 text-center m-2 p-2">
                        {error}
                    </div>
                )}
                <div className={`flex  flex-col  h-auto ${isMobile ? 'w-2/12': ' w-3/12'}`}>
                    <button className={`w-35 text-center border border-gray-700 border-3 hover:bg-black hover:text-white ${isMobile ? 'm-0 p-0': ' m-5 p-2'}`}>
                    Signup</button>
                </div>
            </form>
        </div>
    );
}
export default SignupForm;