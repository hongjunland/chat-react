import { Ref } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

interface ChatMessageResponse {
  id: number;
  content: string;
  writer: string;
}
interface ChatMessageListProps{
    messagesEndRef: Ref<HTMLDivElement>;
    messages: ChatMessageResponse[];
    fetchMessages: ()=> Promise<void>;
    hasMore: boolean;
    writer: string;
    newMessage: string;
    sendMessage: () => void;
    setWriter: (value: string) => void;
    setNewMessage: (value: string) => void;
}

function ChatMessageList({messagesEndRef, messages, fetchMessages, hasMore, writer, newMessage, sendMessage, setWriter, setNewMessage}: ChatMessageListProps) {
  return (
      <>
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWriter(e.target.value)}
        />
      </div>
      <div className="input-group">
        <input
          type="text"
          value={newMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
        />
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
      </>
  );
}

export default ChatMessageList;
