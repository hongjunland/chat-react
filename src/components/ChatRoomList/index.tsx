import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import styled from "@emotion/styled";

interface ChatRoomItem {
  roomId: number;
}
interface ChatRoomProps {
  chatRoomList: ChatRoomItem[];
  fetchData: () => Promise<void>;
  hasMore: boolean;
}
function ChatRoom({ chatRoomList, fetchData, hasMore }: ChatRoomProps) {
  return (
    <>
      <InfiniteScroll
        dataLength={chatRoomList.length}
        next={fetchData}
        hasMore={hasMore} // 더 불러올 데이터가 있는지 여부
        loader={<h4>Loading...</h4>}
      >
        <ChatRoomList>
          {chatRoomList.map((chatRoom, idx) => (
            <div key={idx}>
              <li>
                <Link to={`/rooms/${chatRoom.roomId}`}>
                  {chatRoom.roomId} 번 채팅방
                </Link>
              </li>
            </div>
          ))}
        </ChatRoomList>
      </InfiniteScroll>
    </>
  );
}

const ChatRoomList = styled.ul`
  list-style: none;
  padding: 0;
  overflow-y: scroll;
  li {
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 10px 15px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
  }
  li:hover {
    background-color: #f9f9f9;
  }

  li a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
  }
  @media (max-width: 600px) {
    li {
      padding: 8px 10px;
    }
  }
`;

export default ChatRoom;
