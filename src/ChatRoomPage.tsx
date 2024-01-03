import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface ChatRoom {
  roomId: number;
}
function ChatRoomPage() {
  const [chatRoomList, setChatRoomList] = useState<ChatRoom[]>([]);
  
  useEffect(() => {
    const loadChatRoomHistory = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8788/api/v1/rooms"
        );
        const chatRoomList : ChatRoom[] = response.data.data.map((item: any) => {
          return { roomId: item.roomId} as ChatRoom;
        });
        setChatRoomList(chatRoomList);
      } catch (error) {
        console.error("채팅 내역 로드 실패", error);
      }
    };
    loadChatRoomHistory();
  }, []);
  return (<>
    <div>
        {chatRoomList.map((chatRoom, idx) => (
          <div key={idx}>
            <Link to={`/rooms/${chatRoom.roomId}`}>{idx}: {chatRoom.roomId}</Link>
          </div>
        ))}
      </div>
  </>)
  ;
}

export default ChatRoomPage;
