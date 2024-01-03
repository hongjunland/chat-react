import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatPage from "./ChatPage";
import ChatRoomPage from "./ChatRoomPage";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route path="/rooms" element={<ChatRoomPage/>}/>
            <Route path="/rooms/:roomId" element={<ChatPage/>}/>
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
