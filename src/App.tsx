import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/common/Navbar";
import ViewAllItems from "./components/core/Items/ViewAllItems";

function App() {
  return (
    <div className="w-screen min-h-screen flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<ViewAllItems />}></Route>
      </Routes>
    </div>
  );
}

export default App;
