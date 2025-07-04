//-------> external imports
import { BrowserRouter } from "react-router-dom";
//------> Redux imports
import { Provider } from "react-redux";
import { Store } from "./Redux/Store.js"
//------> internal Imports
import AppContent from "./Components/AppContent.jsx";
import './App.css';

function App() {
  return (
    <div className="h-full w-full m-0 p-0">

    <Provider store={Store}>
      <BrowserRouter>
          <AppContent/>
      </BrowserRouter>
    </Provider>
    </div>

  )
}
export default App;