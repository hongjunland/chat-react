import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ChatRoomPage.css";
import InfiniteScroll from "react-infinite-scroll-component";

interface ChatRoom {
  roomId: number;
}
function ChatRoomPage() {
  const [chatRoomList, setChatRoomList] = useState<ChatRoom[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  useEffect(() => {
    const loadChatRoomHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:8788/api/v1/rooms?size=10`);
        const chatRoomList: ChatRoom[] = response.data.data.messageList.map((item: any) => {
          return { roomId: item.roomId } as ChatRoom;
        });
        setChatRoomList(chatRoomList);
      } catch (error) {
        console.error("채팅 내역 로드 실패", error);
      }
    };
    loadChatRoomHistory();
  }, []);
  const fetchData = async () => {
    // 현재 페이지 번호를 사용하여 서버에 다음 페이지 데이터 요청
    const response = await axios.get(
      `http://localhost:8788/api/v1/rooms?page=${currentPage}&size=10`
    );
    // 데이터를 기존 리스트에 추가
    const nextChatRoomList: ChatRoom[] = response.data.data.messageList.map((item: any) => {
      return { roomId: item.roomId } as ChatRoom;
    });
    setChatRoomList([...chatRoomList, ...nextChatRoomList]);
    setCurrentPage(currentPage + 1);
  };
  return (
    <>
      <div className="ChatRoomPage">
        <InfiniteScroll
          dataLength={chatRoomList.length}
          next={fetchData}
          hasMore={true} // 더 불러올 데이터가 있는지 여부
          loader={<h4>Loading...</h4>}
        >
          <ul className="chatRoomList">
            {chatRoomList.map((chatRoom, idx) => (
              <div key={idx}>
                <li>
                  <Link to={`/rooms/${chatRoom.roomId}`}>
                    {chatRoom.roomId} 번 채팅방
                  </Link>
                </li>
              </div>
            ))}
          </ul>
        </InfiniteScroll>
      </div>
    </>
  );
}

export default ChatRoomPage;
