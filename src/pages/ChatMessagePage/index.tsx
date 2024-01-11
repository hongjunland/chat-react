import { useCallback, useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./ChatMessagePage.css";
import ChatMessageList from "../../components/ChatMessageList";

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = ()=>{
    messagesEndRef.current?.scrollTo(0, messagesEndRef.current.scrollHeight);
  }
  const loadInitChatMessages = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8788/api/v1/rooms/${roomId}/messages?size=10`
      );
      const responseMessages = response.data.data as ChatMessageResponse[];
      setMessages(responseMessages);
      setHasMore(responseMessages.length > 0);
      setLoading(false)
    } catch (error) {
      console.error("채팅 내역 로드 실패", error);
    }
  }, [roomId]);
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
      setCurrentPage((prev) => prev+1);
      setHasMore(responseMessages.length > 0);
      scrollToBottom();
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
      <ChatMessageList
        messagesEndRef={messagesEndRef}
        messages={messages}
        fetchMessages={fetchMessages}
        hasMore={hasMore}
        writer={writer}
        newMessage={newMessage}
        sendMessage={sendMessage}
        setWriter={setWriter}
        setNewMessage={setNewMessage}
      />
    </div>
  );
}

export default ChatMessagePage;
