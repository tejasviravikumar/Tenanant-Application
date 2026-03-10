import {Routes,Route, BrowserRouter} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";

import MainPage from "./pages/MainPage/MainPage";
import Profile from "./pages/Profile/Profile";


function App() {
  return (
    <>
      <Navbar/>

      <Routes>
        <Route path="/" element={<MainPage/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Routes>
    </>
  );
}

export default App
