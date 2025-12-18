import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router'; // Importamos o navegador

export default function Login() {
  const router = useRouter(); // Preparamos o navegador
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setMessage('❌ Senha incorreta ou usuário não existe.');
        setLoading(false);
      } else {
        setMessage('✅ Login aprovado! Entrando...');
        // O PULO DO GATO: Espera 1 segundo e muda de tela
        setTimeout(() => {
            router.push('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setMessage('Erro técnico.');
      setLoading(false);
    }
  };

  // --- ESTILOS VISUAIS ---
  const styles: { [key: string]: React.CSSProperties } = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', fontFamily: 'sans-serif', padding: '20px' },
    card: { width: '100%', maxWidth: '380px', backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: '24px', padding: '40px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' },
    logoArea: { textAlign: 'center', marginBottom: '30px' },
    title: { color: 'white', fontSize: '26px', fontWeight: '700', margin: '10px 0 5px 0' },
    subtitle: { color: '#94a3b8', fontSize: '14px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '8px', fontWeight: '500' },
    input: { width: '100%', padding: '16px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
    button: { width: '100%', padding: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '10px', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)' },
    message: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: message.includes('✅') ? '#4ade80' : '#f87171', minHeight: '20px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <h1 style={styles.title}>Dsnet</h1>
          <p style={styles.subtitle}>Portal do Técnico</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input type="email" placeholder="ex: rafael@dsnet.com.br" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input type="password" placeholder="••••••••" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          </div>
          <button type="submit" style={styles.button}>{loading ? 'Verificando...' : 'Entrar no Sistema'}</button>
        </form>
        <div style={styles.message}>{message}</div>
      </div>
    </div>
  );
}