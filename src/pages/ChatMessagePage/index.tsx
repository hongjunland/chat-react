import { useCallback, useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./ChatMessagePage.css";
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

function ChatMessagePage() {
  const { roomId } = useParams();
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [writer, setWriter] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const loadInitChatMessages = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8788/api/v1/rooms/${roomId}/messages?page=${currentPage}&size=10`
      );
      const responseMessages = response.data.data as ChatMessageResponse[];
      setMessages(responseMessages);
      setCurrentPage((prev)=> prev + 1);
      setHasMore(responseMessages.length > 0);
      if (currentPage === 0) {
        scrollToBottom();
      }
      setLoading(false)
    } catch (error) {
      console.error("채팅 내역 로드 실패", error);
    }
  }, [currentPage, roomId]);
  const client = new Client({
    brokerURL: "ws://localhost:8788/chat", // 서버 WebSocket URL
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe(
        `/topic/public/rooms/${roomId}`,
        (message: IMessage) => {
          const msg: ChatMessageResponse = JSON.parse(message.body);
          setMessages((prevMessages) => [msg, ...prevMessages]);
        }
      );
    },
  });
  useEffect(() => {
    if(loading){
      loadInitChatMessages();
    }
    const client = new Client({
      brokerURL: "ws://localhost:8788/chat", // 서버 WebSocket URL
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(
          `/topic/public/rooms/${roomId}`,
          (message: IMessage) => {
            const msg: ChatMessageResponse = JSON.parse(message.body);
            setMessages((prevMessages) => [msg, ...prevMessages]);
          }
        );
      },
    });
    client.activate();
    setStompClient(client);
    return () => {
      client.deactivate();
    };
  }, [currentPage, loadInitChatMessages, loading, roomId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8788/api/v1/rooms/${roomId}/messages?page=${currentPage}&size=10`
      );
      const responseMessages = response.data.data as ChatMessageResponse[];
      setMessages([...messages, ...responseMessages]);
      setCurrentPage(currentPage + 1);
      messagesEndRef.current.scrollTo(0, messagesEndRef.current.scrollHeight);
      setHasMore(responseMessages.length > 0);
      if (currentPage === 0) {
        scrollToBottom();
      }
    } catch (error) {
      console.error("채팅 내역 로드 실패", error);
    }
  };
  const sendMessage = () => {
    if (stompClient && newMessage) {
      const chatMessage: ChatMessageReqeust = {
        from: writer,
        text: newMessage,
        roomId: parseInt(roomId || ""),
      };
      stompClient.publish({
        destination: `/app/chat/rooms/${roomId}/send`,
        body: JSON.stringify(chatMessage),
      });
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div>
        <Link to={"/rooms"} className="back-link">
          뒤로 가기
        </Link>
      </div>
      <div id="scrollableDiv" className="chat-messages" ref={messagesEndRef}>
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMessages}
          style={{ display: "flex", flexDirection: "column-reverse" }}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
          inverse={true} // 스크롤을 위로 올릴 때 데이터 로드
          scrollableTarget="scrollableDiv"
        >
          {messages.map((msg, idx) => (
            <div key={msg.id}>
              {msg.id}=={msg.writer}: {msg.content}
            </div>
          ))}
        </InfiniteScroll>
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
    </div>
  );
}

export default ChatMessagePage;
