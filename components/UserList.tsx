import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './UserList.module.css';

interface User {
  id: string;
  email: string;
  // Adicione outros campos de usuário conforme necessário
}

interface Props {
  onClose: () => void;
  onSelectUser: (user: User) => void;
  currentUserId: string;
}

export default function UserList({ onClose, onSelectUser, currentUserId }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // Nota: Acessar a tabela auth.users pode exigir privilégios de administrador.
      // Se isso falhar, precisaremos criar uma tabela de 'perfis' pública.
      const { data, error } = await supabase.from('users').select('id, email');

      if (error) {
        console.error('Error fetching users:', error);
        setError('Falha ao buscar usuários. Verifique as políticas de acesso do Supabase.');
        // COMO SOLUÇÃO ALTERNATIVA, vamos usar a lista de usuários das mensagens existentes
        const { data: messageUsers, error: messageError } = await supabase
          .from('mensagens')
          .select('user_name');
        if (messageError) {
            console.error('Error fetching message users:', messageError)
        } else {
            const uniqueUsers = [...new Set(messageUsers.map(u => u.user_name))].map((name, index) => ({ id: `${index}`, email: name }));
            setUsers(uniqueUsers.filter(u => u.email !== currentUserId));
            setError(null);
        }

      } else {
        // Filtra o usuário atual da lista
        setUsers(data.filter(user => user.id !== currentUserId));
      }
      setLoading(false);
    };

    fetchUsers();
  }, [currentUserId]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <header className={styles.header}>
          <h2>Nova Conversa</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </header>
        <div className={styles.userList}>
          {loading && <p>Carregando...</p>}
          {error && <p className={styles.error}>{error}</p>}
          {!loading && !error && users.map(user => (
            <div key={user.id} className={styles.userItem} onClick={() => onSelectUser(user)}>
              {user.email}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
