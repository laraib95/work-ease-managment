import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginsuccess } from '../Redux/AuthSlice';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';


function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const emailValidate = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if(!email || !password)
        {
            setError("Both fields are required");   
        }
        if(!emailValidate(email))
        {
            setError("Email is invalid");
        }
        try {
            const res = await fetch("http://localhost:5001/api/v1/login", {
                method: 'POST',
                headers:{
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify({email,password}),
            })
            const data = await res.json();
            if(res.ok)
            {
                dispatch(loginsuccess({
                    user : data.user,
                    token : data.token,
                }));
                setError('');
                if(data.user.role === 'Admin') {
                    navigate('/admindashboard');
                } else if(data.user.role === 'Employee'){
                    navigate('/employeedashboard');
                }
                else {
                    console.warn("Unknown user role:", data.user.role);
                    navigate('/'); 
                }
            } else {
                setError(data.message || "Login Failed");
            }
        } catch (error) {
            console.error(error);
            setError("Server Error. Try again later")
        }
    };


    return (
        <div className={`flex flex-col m-2  `}>
            <form onSubmit={handleSubmit}>
                <div className={`flex flex-col m-2`}>
                    <label className={`m-2 text-xl`}
                    htmlFor="email">Email</label>
                    <input className={`bg-transparent border border-black-400 border-2 text-black  ml-2 p-2 ${isMobile ? 'w-55 h-9': 'w-80 h-10'}`}
                        type="text" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                    <label className={`m-2 text-xl`}
                    htmlFor="password">Password</label>
                    <input className={`bg-transparent border border-black-400 border-2 text-black ml-2 p-2 ${isMobile ? 'w-55 h-9': 'w-80'}`}
                        type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                </div>
                {/* Display Error Message Here */}
                {error && (
                    <div className="text-red-500 text-center m-2 p-2">
                        {error}
                    </div>
                )}
                <div className={`m-5 p-2 font-bold border border-gray-900 text-center border-3 hover:bg-black hover:text-white ${isMobile ? 'w-20': 'w-35'}`}>
                    <button>Login </button>
                </div>
            </form>
        </div>
    )

}
export default LoginForm;