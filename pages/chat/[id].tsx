import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/router';

export default function ChatRoom() {
  const router = useRouter();
  const { id } = router.query;

  const [channel, setChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [uploading, setUploading] = useState(false); // NOVO ESTADO
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 1. Carregar Dados e Realtime
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setCurrentUser(data.user.email || 'Anônimo');
    };
    getUser();

    if (id) {
      fetchChannelDetails();
      fetchMessages();
      
      const channelSub = supabase
        .channel('public:mensagens') // Nome da tabela corrigido
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `channel_id=eq.${id}` }, (payload) => {
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
      .from('mensagens') // Nome corrigido para 'mensagens'
      .select('*')
      .eq('channel_id', id)
      .order('id', { ascending: true });
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  // 2. FUNÇÃO DE ENVIAR ARQUIVO (ANEXADA AQUI)
  const enviarArquivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('arquivos').getPublicUrl(filePath);

      await supabase.from('mensagens').insert([{ 
        file_url: data.publicUrl, 
        user_name: currentUser.split('@')[0], 
        channel_id: id 
      }]);

    } catch (error: any) {
      alert('Erro ao enviar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await supabase.from('mensagens').insert([{
      content: newMessage,
      channel_id: id,
      user_name: currentUser.split('@')[0]
    }]);

    setNewMessage('');
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
      {/* Cabeçalho */}
      <div style={{ padding: '15px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <strong>{channel?.name || 'Carregando...'}</strong>
      </div>

      {/* Lista de Mensagens */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '15px', textAlign: msg.user_name === currentUser.split('@')[0] ? 'right' : 'left' }}>
            <div style={{ display: 'inline-block', padding: '10px', borderRadius: '10px', backgroundColor: msg.file_url ? 'transparent' : '#334155' }}>
              <small style={{ color: '#94a3b8' }}>{msg.user_name}</small><br/>
              {msg.file_url ? (
                <img src={msg.file_url} style={{ maxWidth: '200px', borderRadius: '10px' }} />
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Digitação (Onde o Clipe entra) */}
      <div style={{ padding: '15px', background: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ cursor: 'pointer' }}>
          <input type="file" style={{ display: 'none' }} onChange={enviarArquivo} disabled={uploading} accept="image/*" />
          <span style={{ fontSize: '24px' }}>{uploading ? '⏳' : '📎'}</span>
        </label>
        
        <form onSubmit={sendMessage} style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Mensagem"
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white' }} 
          />
          <button type="submit" style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '20px' }}>➤</button>
        </form>
      </div>
    </div>
  );
}