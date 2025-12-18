import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  
  const [channels, setChannels] = useState<any[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(''); 

  const [newChannel, setNewChannel] = useState<any>({
    title: '',
    description: '',
    category: 'GERAL',
    color: '#3b82f6'
  });

  const isAdmin = true; 

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) setChannels(data);
    } catch (error: any) {
      console.error('Erro ao buscar canais:', error);
      setErrorMsg('Erro ao carregar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (e: any) => {
    e.preventDefault();
    if (!newChannel.title) return alert('O canal precisa de um nome!');

    try {
      const { error } = await supabase
        .from('channels')
        .insert([{
            title: newChannel.title,
            description: newChannel.description,
            category: newChannel.category,
            color: newChannel.color
        }]);

      if (error) throw error;
      alert('✅ Canal criado com sucesso!');
      setIsModalOpen(false); 
      setNewChannel({ title: '', description: '', category: 'GERAL', color: '#3b82f6' }); 
      fetchChannels(); 
    } catch (error: any) {
      alert('Erro ao criar: ' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este canal?')) return;
    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (!error) fetchChannels();
  };

  // --- A NAVEGAÇÃO MÁGICA ESTÁ AQUI ---
  const handleEnterChannel = (id: number) => {
      router.push(`/chat/${id}`); // Manda para a página [id].tsx
  };

  const filteredChannels = channels.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ESTILOS ---
  const styles: { [key: string]: React.CSSProperties } = {
    container: { minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif', padding: '30px', color: 'white' },
    topHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #1e293b' },
    pageTitle: { fontSize: '28px', fontWeight: 'bold', margin: 0 },
    subTitle: { color: '#94a3b8', marginTop: '5px' },
    actionBar: { display: 'flex', gap: '15px', marginBottom: '30px' },
    searchInput: { flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', outline: 'none', fontSize: '16px' },
    newBtn: { padding: '0 25px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', display: isAdmin ? 'block' : 'none' }, 
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    
    // O Cursor vira mãozinha pra indicar clique
    card: { backgroundColor: '#1e293b', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '220px', position: 'relative', cursor: 'pointer', border: '1px solid #334155', transition: 'all 0.2s' },
    
    cardTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'white' },
    cardDesc: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' },
    cardFooter: { marginTop: 'auto', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155' },
    badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: 'rgba(255,255,255,0.1)' },
    deleteBtn: { position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', zIndex: 10, display: isAdmin ? 'block' : 'none' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '20px', width: '400px', border: '1px solid #334155' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', color: '#cbd5e1', fontSize: '14px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' },
    modalActions: { display: 'flex', gap: '10px', marginTop: '20px' },
    saveBtn: { flex: 1, padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topHeader}>
        <div>
          <h1 style={styles.pageTitle}>Central de Comunicação</h1>
          <p style={styles.subTitle}>Gerencie seus grupos de trabalho</p>
        </div>
        <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>A</div>
      </div>

      <div style={styles.actionBar}>
        <input 
          type="text" 
          placeholder="🔍 Buscar canais..." 
          style={styles.searchInput} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button style={styles.newBtn} onClick={() => setIsModalOpen(true)}>
          + Novo Canal
        </button>
      </div>

      {errorMsg && <p style={{color: 'red', background: 'rgba(255,0,0,0.1)', padding: 10}}>⚠️ {errorMsg}</p>}

      {loading ? <p>Carregando canais...</p> : (
        <div style={styles.grid}>
          {filteredChannels.length === 0 && <p style={{color: '#64748b'}}>Nenhum canal encontrado. Crie um!</p>}
          
          {filteredChannels.map((channel: any) => (
            // AQUI ESTÁ A CORREÇÃO: Adicionei o onClick no cartão inteiro
            <div 
                key={channel.id} 
                style={{...styles.card, borderTop: `4px solid ${channel.color}`}}
                onClick={() => handleEnterChannel(channel.id)}
            >
              <button 
                style={styles.deleteBtn} 
                onClick={(e) => { 
                    e.stopPropagation(); // Evita entrar no chat quando clica na lixeira
                    handleDelete(channel.id); 
                }}
              >
                🗑️
              </button>
              
              <div>
                <h3 style={styles.cardTitle}>{channel.title}</h3>
                <p style={styles.cardDesc}>{channel.description}</p>
              </div>
              <div style={styles.cardFooter}>
                <span style={styles.badge}>{channel.category}</span>
                <span style={{color: channel.color, fontWeight: 'bold', fontSize: '14px'}}>Entrar →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JANELINHA MODAL (Igual antes) */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{color: 'white', marginTop: 0}}>Novo Canal</h2>
            <form onSubmit={handleCreateChannel}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome do Grupo</label>
                <input style={styles.input} placeholder="Ex: Financeiro" value={newChannel.title} onChange={e => setNewChannel({...newChannel, title: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição</label>
                <input style={styles.input} placeholder="Ex: Assuntos de pagamento" value={newChannel.description} onChange={e => setNewChannel({...newChannel, description: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Categoria</label>
                <select style={styles.input} value={newChannel.category} onChange={e => setNewChannel({...newChannel, category: e.target.value})}>
                  <option>GERAL</option>
                  <option>SUPORTE</option>
                  <option>VENDAS</option>
                  <option>TI</option>
                  <option>DIRETORIA</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Cor do Cartão</label>
                <input type="color" style={{width: '100%', height: '40px', cursor: 'pointer'}} value={newChannel.color} onChange={e => setNewChannel({...newChannel, color: e.target.value})} />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" style={styles.saveBtn}>Salvar Canal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}