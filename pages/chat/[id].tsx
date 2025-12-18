import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';

export default function ChatRoom() {
  const router = useRouter();
  const { id } = router.query; // Pega o ID da URL (ex: 1, 2)

  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 1. Pega o usuário logado e os dados do canal
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setCurrentUser(data.user.email || 'Anônimo');
    };
    getUser();

    if (id) {
      fetchChannelDetails();
      fetchMessages();
      
      // ATIVAR O REALTIME (Mensagens chegando na hora)
      const channelSub = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${id}` }, (payload) => {
          setMessages((current) => [...current, payload.new]);
          scrollToBottom();
        })
        .subscribe();

      return () => { supabase.removeChannel(channelSub); };
    }
  }, [id]);

  const fetchChannelDetails = async () => {
    const { data } = await supabase.from('channels').select('*').eq('id', id).single();
    if (data) setChannel(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', id)
      .order('id', { ascending: true });
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from('messages').insert([{
      content: newMessage,
      channel_id: id,
      user_email: currentUser
    }]);

    setNewMessage('');
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- ESTILOS ---
  const styles: { [key: string]: React.CSSProperties } = {
    container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', fontFamily: 'sans-serif', color: 'white' },
    header: { padding: '20px', borderBottom: '1px solid #334155', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10 },
    backBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '5px' },
    titleArea: { textAlign: 'center' },
    title: { margin: 0, fontSize: '18px' },
    sub: { margin: 0, fontSize: '12px', color: '#94a3b8' },
    
    chatArea: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },
    
    messageBubble: { maxWidth: '70%', padding: '12px 16px', borderRadius: '12px', position: 'relative', wordWrap: 'break-word', fontSize: '15px', lineHeight: '1.4' },
    myMsg: { alignSelf: 'flex-end', backgroundColor: '#2563eb', color: 'white', borderBottomRightRadius: '2px' },
    otherMsg: { alignSelf: 'flex-start', backgroundColor: '#334155', color: '#e2e8f0', borderBottomLeftRadius: '2px' },
    
    senderName: { fontSize: '10px', marginBottom: '4px', opacity: 0.8, fontWeight: 'bold' },
    
    inputArea: { padding: '20px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '10px' },
    input: { flex: 1, padding: '15px', borderRadius: '25px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', outline: 'none' },
    sendBtn: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }
  };

  if (!channel) return <div style={{padding: 20, color: 'white'}}>Carregando chat...</div>;

  return (
    <div style={styles.container}>
      {/* Topo */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push('/dashboard')}>← Voltar</button>
        <div style={styles.titleArea}>
          <h2 style={styles.title}># {channel.title}</h2>
          <p style={styles.sub}>{currentUser}</p>
        </div>
        <div style={{width: 30}}></div> {/* Espaço vazio pra equilibrar */}
      </div>

      {/* Mensagens */}
      <div style={styles.chatArea}>
        {messages.length === 0 && (
          <div style={{textAlign: 'center', color: '#64748b', marginTop: '50px'}}>
            <p>Nenhuma mensagem ainda.</p>
            <p>Seja o primeiro a falar!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.user_email === currentUser;
          return (
            <div key={msg.id} style={{...styles.messageBubble, ...(isMe ? styles.myMsg : styles.otherMsg)}}>
              {!isMe && <div style={styles.senderName}>{msg.user_email}</div>}
              {msg.content}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Campo de Digitar */}
      <form style={styles.inputArea} onSubmit={sendMessage}>
        <input 
          style={styles.input} 
          placeholder="Digite sua mensagem..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" style={styles.sendBtn}>➤</button>
      </form>
    </div>
  );
}