import { Routes, Route } from "react-router-dom";
import { AvatarProvider } from "./pages/Avatarcontent/Avatarcontent";
import Navbar from "./components/Navbar/Navbar";

import MainPage from "./pages/MainPage/MainPage";
import Profile from "./pages/Profile/Profile";
import Payments from "./pages/Payments/Payments";
import Maintenance from "./pages/Maintenance/Maintenance";
import Complaints from "./pages/Complaints/Complaints";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Parking from "./pages/Parking/Parking";

function App() {
  return (
     <AvatarProvider>
      <Routes>

      {/* Login page WITHOUT navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages WITH navbar */}
      <Route path="/" element={<><Navbar /><MainPage /></>} />
      <Route path="/profile" element={<><Navbar /><Profile /></>} />
      <Route path="/payments" element={<><Navbar /><Payments /></>} />
      <Route path="/maintenance" element={<><Navbar /><Maintenance /></>} />
      <Route path="/raiseComplaints" element={<><Navbar /><Complaints /></>} />

      {/* Parking page */}
      <Route path="/parking" element={<><Navbar /><Parking /></>} />

    </Routes>
     </AvatarProvider>
    
  );
}

export default App;