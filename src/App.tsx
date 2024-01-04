import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import ChatPage from "./ChatPage";
import ChatRoomPage from "./ChatRoomPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Link to={"/rooms"}>채팅방 보기</Link>
        <Routes>
          <Route path="/rooms" element={<ChatRoomPage/>}/>
          <Route path="/rooms/:roomId" element={<ChatPage/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
