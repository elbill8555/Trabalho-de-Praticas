'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setToken, setUser, AuthUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch<{ token: string; user: AuthUser }>(
        '/api/v1/auth/register',
        { method: 'POST', body: JSON.stringify({ name, email, password }) },
      );
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6">
      {/* Background Decorative Element */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[30%] rounded-full bg-secondary-container/10 blur-[100px]"></div>
      </div>

      <main className="w-full max-w-[440px]">
        {/* Branding Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-6">
            <span className="material-symbols-outlined text-white text-2xl">architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface mb-2">The Fluid Architect</h1>
          <p className="text-on-surface-variant font-medium tracking-tight">Comece a organizar sua produtividade.</p>
        </div>

        {/* Register Card */}
        <div className="bg-surface-container-lowest rounded-[2rem] p-10 shadow-[0px_20px_40px_rgba(0,63,135,0.06)] border border-outline-variant/10">
          {error && (
            <div className="mb-6 p-3 bg-error-container rounded-lg text-error text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="name">
                Nome
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <input
                  id="name"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-xl text-on-surface placeholder:text-outline/60 transition-all outline-none"
                  name="name"
                  placeholder="Seu nome completo"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input
                  id="email"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-xl text-on-surface placeholder:text-outline/60 transition-all outline-none"
                  name="email"
                  placeholder="seu@email.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="password">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  id="password"
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-xl text-on-surface placeholder:text-outline/60 transition-all outline-none"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute inset-y-0 right-4 flex items-center text-outline hover:text-on-surface-variant transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="confirm">
                Confirmar senha
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-[20px]">lock_check</span>
                </div>
                <input
                  id="confirm"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-xl text-on-surface placeholder:text-outline/60 transition-all outline-none"
                  name="confirm"
                  placeholder="Repita a senha"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>

            {/* Primary Action */}
            <button
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-4 px-6 rounded-full text-lg shadow-lg shadow-primary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Criando conta...' : 'Criar conta'}</span>
              {!loading && (
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-surface-container-lowest px-4 text-outline">Ou continue com</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-colors font-semibold text-on-surface-variant text-sm"
              type="button"
            >
              <img
                alt="Google Logo"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCojqE86zty8fyQWHrdNDI6TTZkC6DyYPrvDIOG-EHrLbbr2uouADkWiTiJBMpB0R91uoI8jl6EHENTQSdTB7Xva98G0jBtI9hhpl8Q8n9FUZxPZ3hez3ULOqpQ9cLnxTlwtxpnPyDBq-1J84XLHR7kOZjTQD8S0Db7g0zoRkoY_t864S_SwmxNAO9XKHmPbVS_RVRrtorrudkTmFvTxS2y2W4FgfhS_npXv4fqwRVc7tTXg71Ya6oeATX4OfQN1UbHEwaspLs63TeU"
              />
              Google
            </button>
            <button
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-colors font-semibold text-on-surface-variant text-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-xl text-[#191c1d]" style={{ fontVariationSettings: "'FILL' 1" }}>
                ios
              </span>
              Apple
            </button>
          </div>
        </div>

        {/* Footer Action */}
        <p className="text-center mt-10 text-on-surface-variant font-medium">
          Já tem uma conta?{' '}
          <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1" href="/login">
            Entrar
          </Link>
        </p>

        {/* Terms */}
        <div className="mt-16 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline opacity-60 px-8 leading-relaxed">
            Ao continuar, você concorda com nossos <br />
            <a className="hover:text-on-surface transition-colors" href="#">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a className="hover:text-on-surface transition-colors" href="#">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
