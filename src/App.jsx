import { BrowserRouter, Navigate } from "react-router-dom";
import Routers from "./Pages/Router/Routers";

function App() {
  return (
    <div className="">
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    </div>
  );
}

export default App; 