import React, { useState, useEffect } from 'react';
import { Send, User, MessageSquare, Clock } from 'lucide-react';
import { apiFetchMessages, apiSendMessage } from '../api/client';

export default function MessagesPanel({ contract, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const otherParty = currentUser?.role === 'client' ? contract?.freelancer : contract?.client;

  useEffect(() => {
    if (contract?._id) {
      loadMessages();
    }
  }, [contract]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await apiFetchMessages(contract._id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;

    try {
      setSending(true);
      const msg = await apiSendMessage(contract._id, newMsg.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMsg('');
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-bold text-emerald-300">
            {otherParty?.name ? otherParty.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{otherParty?.name || 'Workroom Partner'}</h3>
            <p className="text-xs text-slate-400">Contract: {contract?.title}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs px-3 py-1 rounded bg-slate-800">
            Close Chat
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
            No messages yet. Send a greeting to start workroom collaboration!
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender?._id === currentUser?._id || m.sender === currentUser?._id;
            return (
              <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                  <span>{m.sender?.name || 'User'}</span>
                  <span>•</span>
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type your message here..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={sending || !newMsg.trim()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
}
