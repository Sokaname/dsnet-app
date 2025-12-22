import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Importar o Link
import Image from 'next/image';
import styles from './ChatRoom.module.css';

export default function ChatRoom() {
  const router = useRouter();
  const { id } = router.query;

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const notificationSoundRef = useRef<null | HTMLAudioElement>(null);

  useEffect(() => {
    notificationSoundRef.current = new Audio('/notificacao.mp3');
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('mensagens')
      .select('*')
      .eq('channel_id', id)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      setError('Falha ao carregar mensagens.');
    } else {
      setMessages(data || []);
      scrollToBottom();
    }
  }, [id]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserEmail(user.email || 'Anônimo');
      }
    };
    getUser();
    fetchMessages();

    const channelSub = supabase
      .channel(`chat:${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mensagens', 
        filter: `channel_id=eq.${id}` 
      }, (payload) => {
        setMessages((current) => [...current, payload.new]);
        notificationSoundRef.current?.play().catch(err => console.log("Audio play failed:", err));
        scrollToBottom();
      }).subscribe();

    return () => { supabase.removeChannel(channelSub); };
  }, [id, fetchMessages]);

  const enviarArquivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('arquivos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('arquivos').getPublicUrl(fileName);
      await supabase.from('mensagens').insert([{ 
        file_url: data.publicUrl, 
        user_name: currentUserEmail.split('@')[0], 
        channel_id: id 
      }]);

    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError('Falha no upload do arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const userName = currentUserEmail.split('@')[0];

    const { error } = await supabase.from('mensagens').insert([{
      content: newMessage,
      channel_id: id,
      user_name: userName
    }]);
    
    if (error) {
      console.error('Error sending message:', error);
      setError('Falha ao enviar mensagem.');
    } else {
      setNewMessage('');
    }
  };

  const handleMicClick = () => {
    alert('A função de gravação de voz será implementada em breve!');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentUserShortName = currentUserEmail.split('@')[0];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" legacyBehavior>
          <a className={styles.backButton}>
            <Image src="/arrow-left.svg" alt="Voltar" width={24} height={24} />
          </a>
        </Link>
        <span className={styles.headerTitle}>Canal: {id}</span>
        {/* Espaço reservado para outras ações no cabeçalho */}
        <div style={{ width: '24px' }} />
      </div>
      {error && <div style={{ padding: '10px', backgroundColor: '#d9534f', textAlign: 'center' }}>{error}</div>}

      <div className={styles.messagesContainer}>
        {messages.map((msg) => {
          const isCurrentUser = msg.user_name === currentUserShortName;
          return (
            <div key={msg.id} className={`${styles.messageWrapper} ${isCurrentUser ? styles.currentUser : styles.otherUser}`}>
              <div className={`${styles.message} ${isCurrentUser ? styles.currentUser : styles.otherUser}`}>
                {!isCurrentUser && <div className={styles.userName}>{msg.user_name}</div>}
                <div className={styles.messageContent}>
                  {msg.file_url ? (
                    <Image src={msg.file_url} alt="Arquivo enviado" width={250} height={250} className={styles.imageAttachment} />
                  ) : (
                    <span>{msg.content}</span>
                  )}
                   <div className={styles.timestamp}>{formatTimestamp(msg.created_at)}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Escreva uma mensagem..."
            className={styles.inputField} 
          />
          <label className={styles.iconButton}>
            <input type="file" style={{ display: 'none' }} onChange={enviarArquivo} disabled={uploading} />
            {uploading ? <div className={styles.uploadingSpinner}></div> : <Image src="/clipe-icon.png" alt="Anexar" width={22} height={22} />}
          </label>
          <label className={styles.iconButton} style={{ marginLeft: '10px' }}>
            <input type="file" style={{ display: 'none' }} onChange={enviarArquivo} accept="image/*" capture="environment" disabled={uploading} />
            <Image src="/camera-icon.png" alt="Câmera" width={24} height={24} />
          </label>
        </div>

        {newMessage.trim() ? (
          <button type="submit" className={styles.sendButton} disabled={uploading}>
            <Image src="/send-icon.svg" alt="Enviar" width={24} height={24} />
          </button>
        ) : (
          <button type="button" className={styles.sendButton} onClick={handleMicClick}>
            <Image src="/mic-icon.png" alt="Microfone" width={24} height={24} />
          </button>
        )}
      </form>
    </div>
  );
}
