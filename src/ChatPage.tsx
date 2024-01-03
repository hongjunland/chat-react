import { useEffect, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import axios from "axios";
import { useParams } from "react-router-dom";

interface ChatMessage {
  // id: number;
  // content: string;
  // writer: number;
  from: string;
  text: string;
  roomId: number;
}
// interface ChatMessageForm {
//     from: string;
//     text: string;
//     roomId: number;
// }

function ChatPage() {
  let { roomId } = useParams();
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [writer, setWriter] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    
    const loadChatHistory = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8788/api/v1/rooms/${roomId}`
        );
        const messages = response.data.data.messageList.map((item: any) => {
          return { from: item.writer, text: item.content, roomId: roomId };
        });
        setMessages(messages);
      } catch (error) {
        console.error("채팅 내역 로드 실패", error);
      }
    };

    loadChatHistory();
    const client = new Client({
      brokerURL: "ws://localhost:8788/chat", // 서버 WebSocket URL
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/public", (message: IMessage) => {
          const msg: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, msg]);
        });
      },
    });
    client.activate();
    setStompClient(client);
    console.log(roomId);
    return () => {
      client.deactivate();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (stompClient && newMessage) {
      const chatMessage: ChatMessage = {
        from: writer,
        text: newMessage,
        roomId: parseInt(roomId||''),
      };
      stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(chatMessage),
      });
      console.log(messages);
      setNewMessage("");
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.from}: {msg.text}
          </div>
        ))}
      </div>
      <div>
        <label>작성자</label>
        <input
          type="text"
          value={writer}
          onChange={(e) => setWriter(e.target.value)}
          width={"50px"}
        />
      </div>
      <div>
        <input
          type="text"
          value={newMessage}
          width={"100px"}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatPage;
