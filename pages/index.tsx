import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './index.module.css';
import UserList from '../components/UserList'; // Importa o componente do modal

// Define a interface para o usuário, que será usada no modal
interface User {
  id: string;
  email: string;
}

export default function Home() {
  const [channels, setChannels] = useState<any[]>([]);
  const [newChannelName, setNewChannelName] = useState('');
  const [isModalOpen, setModalOpen] = useState(false); // Estado para controlar o modal
  const [currentUserId, setCurrentUserId] = useState(''); // Estado para o ID do usuário atual
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUserId(user.id);
        }
    };

    const fetchChannels = async () => {
      const { data, error } = await supabase.from('mensagens').select('channel_id');
      if (error) {
        console.error('Error fetching channels', error);
      } else {
        const uniqueChannelIds = [...new Set(data.map(item => item.channel_id))];
        setChannels(uniqueChannelIds.map(id => ({ id, name: `Canal ${id}` })));
      }
    };

    fetchSession();
    fetchChannels();
  }, []);

  const createChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) {
      alert('O nome do canal não pode ser vazio.');
      return;
    }
    router.push(`/chat/${newChannelName.trim()}`);
  };

  // Função para lidar com a seleção de um usuário no modal
  const handleSelectUser = (user: User) => {
    // Cria um ID de canal único e determinístico para a conversa privada
    // Ordenando os IDs, garantimos que ambos os usuários cheguem ao mesmo canal
    const channelId = [currentUserId, user.id].sort().join('_');
    router.push(`/chat/${channelId}`);
    setModalOpen(false); // Fecha o modal após a seleção
  };

  return (
    <div className={styles.container}>
        {isModalOpen && (
            <UserList 
                onClose={() => setModalOpen(false)} 
                onSelectUser={handleSelectUser} 
                currentUserId={currentUserId}
            />
        )}

      <header className={styles.header}>
        <h1>Conversas</h1>
        <button onClick={() => setModalOpen(true)} className={styles.newChatButton}>
          Nova Conversa
        </button>
      </header>

      <div className={styles.channelList}>
        <h2>Canais de Grupo</h2>
        {channels.map(channel => (
          <Link key={channel.id} href={`/chat/${channel.id}`} passHref>
            <div className={styles.channelItem}>
              {channel.name}
            </div>
          </Link>
        ))}
      </div>

      <form onSubmit={createChannel} className={styles.createChannelForm}>
        <input
          type="text"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          placeholder="Criar um novo canal de grupo"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Criar</button>
      </form>
    </div>
  );
}
