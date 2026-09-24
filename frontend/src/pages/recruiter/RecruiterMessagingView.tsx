import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  MessageSquare, 
  Users, 
  Check, 
  CheckCheck, 
  Clock,
  ArrowLeft
} from 'lucide-react';
import { recruiterAPI } from '../../services/api';
import { useRouter } from '../../context/RouterContext';

export const RecruiterMessagingView: React.FC = () => {
  const { params } = useRouter();
  const queryCandidateId = params?.candidateId;

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [queryCandidateId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await recruiterAPI.getConversations();
      const list = res.data?.conversations || [];
      setConversations(list);

      if (queryCandidateId) {
        const found = list.find((c: any) => String(c.participant_id) === String(queryCandidateId) || String(c.candidate_id) === String(queryCandidateId));
        if (found) {
          selectConversation(found);
        } else {
          // If no existing conversation exists, create dummy/pending active conversation
          const fallback = {
            id: 'new',
            participant_id: parseInt(queryCandidateId),
            participant_name: `Candidate #${queryCandidateId}`,
            last_message: 'Start a conversation...'
          };
          setActiveConversation(fallback);
          setMessages([]);
        }
      } else if (list.length > 0) {
        selectConversation(list[0]);
      }
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: any) => {
    setActiveConversation(conv);
    if (conv.id === 'new') {
      setMessages([]);
      return;
    }
    try {
      const res = await recruiterAPI.getMessages(conv.id);
      setMessages(res.data?.messages || []);
      scrollToBottom();
    } catch (err: any) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await recruiterAPI.sendMessage({
        conversation_id: activeConversation.id !== 'new' ? activeConversation.id : undefined,
        recipient_id: activeConversation.participant_id,
        body: textToSend
      });

      const newMsg = res.data?.message || {
        id: Date.now(),
        sender_id: 'me',
        content: textToSend,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMsg]);
      scrollToBottom();

      // Refresh conversations list
      const convRes = await recruiterAPI.getConversations();
      setConversations(convRes.data?.conversations || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#2c2a1e]">Direct Candidate Messaging</h1>
        <p className="text-[#9a8e7a] text-sm mt-1">
          Coordinate interviews, answer candidate questions, and discuss compensation offers.
        </p>
      </div>

      <div className="bg-[#ede8df] rounded-2xl border border-[#d5cec3] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px] max-h-[750px]">
        {/* Left: Conversations Sidebar */}
        <div className="w-full md:w-80 border-r border-[#d5cec3] flex flex-col">
          <div className="p-4 border-b border-[#d5cec3]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#9a8e7a] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#d5cec3] text-xs text-[#2c2a1e] focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#d5cec3]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#9a8e7a]">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-[#b5aa96] mx-auto" />
                <p className="text-xs text-[#9a8e7a] font-medium">No active chats yet</p>
                <p className="text-[11px] text-[#9a8e7a]">
                  Select a candidate from the talent pool to message them.
                </p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 cursor-pointer transition flex items-center gap-3 ${
                    activeConversation?.id === conv.id ? 'bg-[#c8d5a8]/30/70 border-l-4 border-[#4a5e2f]' : 'hover:bg-[#e4ddd2]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#c8d5a8]/30 text-[#4a5e2f] font-bold flex items-center justify-center text-sm shrink-0">
                    {conv.participant_name ? conv.participant_name[0].toUpperCase() : 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#2c2a1e] truncate">
                        {conv.participant_name || 'Candidate'}
                      </h4>
                      <span className="text-[10px] text-[#9a8e7a]">
                        {new Date(conv.updated_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9a8e7a] truncate mt-0.5">
                      {conv.last_message || 'Click to open conversation'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Chat View */}
        <div className="flex-1 flex flex-col justify-between bg-[#ede8df]/50">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-[#ede8df] border-b border-[#d5cec3] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#4a5e2f] text-[#f0ebe0] font-bold flex items-center justify-center text-xs">
                    {activeConversation.participant_name ? activeConversation.participant_name[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2c2a1e]">
                      {activeConversation.participant_name || 'Candidate'}
                    </h3>
                    <span className="text-[11px] text-[#3d6b35] flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3d6b35]"></span>
                      Verified Job Seeker
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-[#9a8e7a]">
                    <MessageSquare className="w-8 h-8 text-[#b5aa96]" />
                    <p className="text-xs font-medium">Say hello to {activeConversation.participant_name}!</p>
                    <p className="text-[11px] max-w-xs">Ask questions about their availability, portfolio, or schedule a technical call.</p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMe = m.sender_id === 'me' || m.sender_role === 'employer' || m.sender_role === 'recruiter';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-[#4a5e2f] text-[#f0ebe0] rounded-br-none shadow-sm'
                              : 'bg-[#ede8df] text-[#2c2a1e] rounded-bl-none border border-[#d5cec3] shadow-sm'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[10px] text-[#9a8e7a] mt-1 px-1">
                          {new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#ede8df] border-t border-[#d5cec3] flex items-center gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Message ${activeConversation.participant_name || 'candidate'}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#d5cec3] text-xs text-[#2c2a1e] focus:outline-none focus:ring-2 focus:ring-[#4a5e2f]"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#4a5e2f] hover:bg-[#4a5e2f] text-[#f0ebe0] text-xs font-semibold shadow transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#9a8e7a] space-y-2">
              <MessageSquare className="w-10 h-10 text-[#b5aa96]" />
              <p className="text-sm font-semibold text-[#6b6151]">Select a conversation</p>
              <p className="text-xs max-w-sm">
                Choose a candidate from the left sidebar to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default RecruiterMessagingView;


