import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import ChatMessagePage from "./pages/ChatMessagePage";
import ChatRoomPage from "./pages/ChatRoomPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Link to={"/rooms"}>채팅방 보기</Link>
        <Routes>
          <Route path="/rooms" element={<ChatRoomPage/>}/>
          <Route path="/rooms/:roomId" element={<ChatMessagePage/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
