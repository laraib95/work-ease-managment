//------> external imports----------->
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

//------> internal imports----------->
import LoginForm from '../Components/LoginForm.jsx';


function HomeScreen() {
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const navigate = useNavigate();

    const handleSignup = () => { 
        navigate('/signupform');
    }
    return (
        <div className={`bg-white opacity-70 mix-blend-luminosity rounded-3xl shadow-xl h-118 m-auto p-auto  ${isMobile ? ' w-3/4 mt-15': 'w-2/5 mt-40'}`}>             
        {/* <div className={`absolute inset-0  bg-white-500 bg-opacity-90`}> */}
            <h1 className={`text-black-500  m-1 p-1 font-bold text-center  ${isMobile ? 'text-2xl': 'text-4xl'}`} >Welcome here ! </h1>
            <div className={`flex relative z-10 ${isMobile ? 'flex-col': 'flex-row'}`}>
                <div className={`flex flex-col w-9/12 h-auto m-2`}>
                    <p className={`m-1 p-1 ${isMobile ? 'text-lg': 'text-xl'}`}>Already a member? Login Please.</p>
                    <LoginForm />
                </div>
                <div className={`flex  flex-col w-3/10 h-auto`}>
                    <p className={`ml-4 font-bold ${isMobile ? 'text-lg text-nowrap': 'text-2xl'}`}>New member? Sign in please</p>
                    <button className={` p-2 border  font-bold border-gray-900 text-center border-3 hover:bg-black hover:text-white ${isMobile ? 'ml-4 w-20 text-sm': ' ml-2 w-35 text-xl'}`}
                     onClick={handleSignup}>SignUp</button>
                </div>
            </div>
            {/* </div> */}
        </div>

    )
};
export default HomeScreen;