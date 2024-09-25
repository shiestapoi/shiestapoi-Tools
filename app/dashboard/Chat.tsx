import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Mic, Sun, Moon } from 'lucide-react';

const ChatMessage = ({ content, timestamp, isOutgoing, isImage }) => (
  <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[70%] rounded-lg p-2 ${
      isOutgoing 
        ? 'bg-green-600 dark:bg-green-700' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }`}>
      {isImage ? (
        <img src={content} alt="Shared image" className="rounded-lg max-w-full h-auto" />
      ) : (
        <p>{content}</p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">{timestamp}</p>
    </div>
  </div>
);

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { content: 'chapter-44-bahasa-indonesia/', timestamp: '20:49', isOutgoing: true },
    { content: '14/9/2024', timestamp: '', isOutgoing: false },
    { content: '/api/placeholder/300/200', timestamp: '21:21', isOutgoing: true, isImage: true },
    { content: 'KAMIS', timestamp: '', isOutgoing: false },
    { content: '/api/placeholder/300/200', timestamp: '16:40', isOutgoing: true, isImage: true },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setMessages([...messages, { content: inputMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isOutgoing: true }]);
      setInputMessage('');
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200">
      {/* Left Sidebar */}
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-2 flex-grow mr-2">
            <Search className="text-gray-400 mr-2" />
            <input type="text" placeholder="Cari" className="bg-transparent outline-none w-full" />
          </div>
          <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <div className="overflow-y-auto h-full">
          {['Notepad Shoukosagiri', 'Design Bersama Jaya Group', 'Swenson Simanjuntak (Anda)', 'Timpa Menimpa: Century Group', 'Rina Juntakk'].map((chat, index) => (
            <div key={index} className="flex items-center p-4 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
              <div>
                <p className="font-semibold">{chat}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last message...</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full mr-3"></div>
            <div>
              <p className="font-semibold">Notepad Shoukosagiri</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Anda</p>
            </div>
          </div>
          <MoreVertical className="text-gray-400" />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((msg, index) => (
            <ChatMessage key={index} {...msg} />
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
            <Smile className="text-gray-400 mr-2 cursor-pointer" />
            <Paperclip className="text-gray-400 mr-2 cursor-pointer" />
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pesan"
              className="bg-transparent outline-none flex-1 text-gray-800 dark:text-gray-200"
            />
            <Mic className="text-gray-400 ml-2 cursor-pointer" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;