import { useCallback, useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./ChatPage.css";
import InfiniteScroll from "react-infinite-scroll-component";

interface ChatMessageReqeust {
  from: string;
  text: string;
  roomId: number;
}
interface ChatMessageResponse {
  id: number;
  content: string;
  writer: string;
}

function ChatPage() {
  const { roomId } = useParams();
  const [loading, setLoading] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [writer, setWriter] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    const loadInitChatMessages = async () =>{
      try {
        const response = await axios.get(
          `http://localhost:8788/api/v1/rooms/${roomId}/messages?page=${currentPage}&size=10`
        );
        const messages = response.data.data as ChatMessageResponse[];
        setMessages(messages);
        setCurrentPage(currentPage + 1);
        setHasMore(messages.length > 0);
        if (currentPage === 0) {
          scrollToBottom();
        }
      } catch (error) {
        console.error("채팅 내역 로드 실패", error);
      }
    }
    loadInitChatMessages();
    // const loadInitialData = async () => {
    //   setLoading(true);
    //   await fetchMessages();
    //   setLoading(false);
    // };

    // loadInitialData();
    // const client = new Client({
    //   brokerURL: "ws://localhost:8788/chat", // 서버 WebSocket URL
    //   reconnectDelay: 5000,
    //   onConnect: () => {
    //     client.subscribe(
    //       `/topic/public/rooms/${roomId}`,
    //       (message: IMessage) => {
    //         const msg: ChatMessageResponse = JSON.parse(message.body);
    //         setMessages((prevMessages) => [...prevMessages, msg]);
    //       }
    //     );
    //   },
    // });
    // client.activate();
    // setStompClient(client);
    // return () => {
    //   client.deactivate();
    // };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8788/api/v1/rooms/${roomId}/messages?page=${currentPage}&size=10`
      );
      const responseMessages = response.data.data as ChatMessageResponse[];
      setMessages([...responseMessages, ...messages]);
      setCurrentPage(currentPage + 1);
      // setHasMore(messages.length > 0);
      if (currentPage === 0) {
        scrollToBottom();
      }
    } catch (error) {
      console.error("채팅 내역 로드 실패", error);
    }
  };
  const sendMessage = () => {
    // if (stompClient && newMessage) {
    //   const chatMessage: ChatMessageReqeust = {
    //     from: writer,
    //     text: newMessage,
    //     roomId: parseInt(roomId || ""),
    //   };
    //   stompClient.publish({
    //     destination: `/app/chat/rooms/${roomId}/send`,
    //     body: JSON.stringify(chatMessage),
    //   });
    //   console.log(messages);
    //   setNewMessage("");
    // }
  };

  return (
    <div className="chat-container">
      <div>
        <Link to={"/rooms"} className="back-link">
          뒤로 가기
        </Link>
      </div>
      <InfiniteScroll
        dataLength={messages.length}
        next={fetchMessages}
        // hasMore={hasMore}
        hasMore={true}
        loader={<h4>Loading...</h4>}
        // inverse={true} // 스크롤을 위로 올릴 때 데이터 로드
        scrollableTarget="scrollableDiv"
      >
        <div id="scrollableDiv" className="chat-messages" >
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.writer}: {msg.content}
            </div>
          ))}
        </div>
        <div className="input-group">
          <label>작성자</label>
          <input
            type="text"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="send-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default ChatPage;
