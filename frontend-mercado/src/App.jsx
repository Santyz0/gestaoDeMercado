import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle, AlertTriangle, ArrowLeftRight, Boxes, Loader2,
  PackageOpen, PackageSearch, Plus, RefreshCw, Trash2, Wallet, X,
} from 'lucide-react'

const API_BASE_URL = 'http://127.0.0.1:8000'

function Card({ children, className = '' }) {
  return <div className={`rounded-xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>{children}</div>
}

function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200',
  }
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function Input({ label, error, ...props }) {
  return (
    <label className="mb-4 block text-sm font-medium text-gray-700">
      {label}
      <input
        className={`mt-1 block w-full rounded-lg border px-3 py-2 transition-shadow focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-green-500 focus:ring-green-100'}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

function Select({ label, options, error, ...props }) {
  return (
    <label className="mb-4 block text-sm font-medium text-gray-700">
      {label}
      <select
        className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 transition-shadow focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-green-500 focus:ring-green-100'}`}
        {...props}
      >
        <option value="">Selecione...</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export default function App() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isProdutoModalOpen, setIsProdutoModalOpen] = useState(false)
  const [isMovModalOpen, setIsMovModalOpen] = useState(false)
  const [formProduto, setFormProduto] = useState({ nome: '', codigo_barras: '', preco: '', quantidade_estoque: '' })
  const [formMov, setFormMov] = useState({ produto_id: '', quantidade: '', tipo: 'entrada' })
  const [formErrors, setFormErrors] = useState({})

  const fetchProdutos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/produtos`)
      if (!response.ok) throw new Error('Falha ao carregar produtos. Verifique se a API está rodando.')
      setProdutos(await response.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProdutos() }, [fetchProdutos])

  async function handleProdutoSubmit(event) {
    event.preventDefault()
    setFormErrors({})
    if (!formProduto.nome.trim()) return setFormErrors({ nome: 'Nome é obrigatório' })
    if (!formProduto.codigo_barras.trim()) return setFormErrors({ codigo_barras: 'Código é obrigatório' })
    if (!(Number(formProduto.preco) > 0)) return setFormErrors({ preco: 'Preço deve ser maior que zero' })
    if (Number(formProduto.quantidade_estoque || 0) < 0) return setFormErrors({ quantidade_estoque: 'Estoque não pode ser negativo' })

    try {
      const response = await fetch(`${API_BASE_URL}/produtos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formProduto, preco: Number(formProduto.preco), quantidade_estoque: Number(formProduto.quantidade_estoque || 0) }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Erro ao cadastrar produto')
      await fetchProdutos()
      setIsProdutoModalOpen(false)
      setFormProduto({ nome: '', codigo_barras: '', preco: '', quantidade_estoque: '' })
    } catch (err) { alert(`Erro: ${err.message}`) }
  }

  async function handleMovimentacaoSubmit(event) {
    event.preventDefault()
    setFormErrors({})
    if (!formMov.produto_id) return setFormErrors({ produto_id: 'Selecione um produto' })
    if (!(Number(formMov.quantidade) > 0)) return setFormErrors({ quantidade: 'Quantidade deve ser maior que zero' })
    try {
      const response = await fetch(`${API_BASE_URL}/movimentacoes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto_id: Number(formMov.produto_id), quantidade: Number(formMov.quantidade), tipo: formMov.tipo }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Erro ao registrar movimentação')
      await fetchProdutos()
      setIsMovModalOpen(false)
      setFormMov({ produto_id: '', quantidade: '', tipo: 'entrada' })
    } catch (err) { alert(`Erro: ${err.message}`) }
  }

  async function handleDeletarProduto(id) {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return
    try {
      const response = await fetch(`${API_BASE_URL}/produtos/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao excluir produto')
      await fetchProdutos()
    } catch (err) { alert(`Erro: ${err.message}`) }
  }

  const valorTotalEstoque = produtos.reduce((total, produto) => total + produto.preco * produto.estoque, 0)
  const itensBaixoEstoque = produtos.filter((produto) => produto.estoque < 10).length
  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-green-600"><PackageSearch className="h-8 w-8" /><h1 className="text-xl font-bold text-gray-900">Mercado Estoque</h1></div>
          <Button variant="secondary" onClick={fetchProdutos} title="Atualizar dados"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {error && <div className="mb-6 flex items-start gap-3 rounded-r-md border-l-4 border-red-500 bg-red-50 p-4"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" /><div><h3 className="font-medium text-red-800">Erro de conexão</h3><p className="mt-1 text-sm text-red-700">{error}</p></div></div>}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="flex items-center gap-4"><div className="rounded-lg bg-blue-100 p-3 text-blue-600"><Boxes className="h-6 w-6" /></div><div><p className="text-sm font-medium text-gray-500">Total de produtos</p><p className="text-2xl font-bold text-gray-900">{produtos.length}</p></div></Card>
          <Card className="flex items-center gap-4"><div className="rounded-lg bg-green-100 p-3 text-green-600"><Wallet className="h-6 w-6" /></div><div><p className="text-sm font-medium text-gray-500">Valor em estoque</p><p className="text-2xl font-bold text-gray-900">{moeda.format(valorTotalEstoque)}</p></div></Card>
          <Card className="flex items-center gap-4"><div className="rounded-lg bg-amber-100 p-3 text-amber-600"><AlertTriangle className="h-6 w-6" /></div><div><p className="text-sm font-medium text-gray-500">Baixo estoque (&lt; 10)</p><p className="text-2xl font-bold text-gray-900">{itensBaixoEstoque}</p></div></Card>
        </div>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><h2 className="text-lg font-semibold text-gray-900">Catálogo de produtos</h2><div className="flex w-full gap-2 sm:w-auto"><Button className="flex-1 sm:flex-none" onClick={() => setIsProdutoModalOpen(true)}><Plus className="h-4 w-4" />Novo produto</Button><Button variant="secondary" className="flex-1 border border-gray-200 sm:flex-none" onClick={() => setIsMovModalOpen(true)}><ArrowLeftRight className="h-4 w-4" />Movimentar</Button></div></div>
        <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="border-b border-gray-200 bg-gray-50 text-sm font-medium uppercase tracking-wider text-gray-500"><th className="px-6 py-4">Cód. barras</th><th className="px-6 py-4">Produto</th><th className="px-6 py-4 text-right">Preço</th><th className="px-6 py-4 text-right">Estoque</th><th className="px-6 py-4 text-center">Ações</th></tr></thead><tbody className="divide-y divide-gray-200 bg-white">
          {loading && produtos.length === 0 ? <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500"><Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-green-500" />Carregando produtos...</td></tr> : produtos.length === 0 ? <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500"><PackageOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />Nenhum produto cadastrado.</td></tr> : produtos.map((produto) => <tr key={produto.id} className="group transition-colors hover:bg-gray-50"><td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-500">{produto.codigo_barras}</td><td className="whitespace-nowrap px-6 py-4"><div className="font-medium text-gray-900">{produto.nome}</div><div className="text-xs text-gray-400">ID: {produto.id}</div></td><td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">{moeda.format(produto.preco)}</td><td className="whitespace-nowrap px-6 py-4 text-right"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${produto.estoque === 0 ? 'bg-red-100 text-red-800' : produto.estoque < 10 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{produto.estoque} un</span></td><td className="px-6 py-4 text-center"><button onClick={() => handleDeletarProduto(produto.id)} className="text-gray-400 opacity-0 transition-colors hover:text-red-600 group-hover:opacity-100" title="Excluir produto"><Trash2 className="h-4 w-4" /></button></td></tr>)}
        </tbody></table></div></Card>
      </main>
      {isProdutoModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"><div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"><div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4"><h3 className="text-lg font-semibold">Cadastrar novo produto</h3><button onClick={() => setIsProdutoModalOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div><form onSubmit={handleProdutoSubmit} className="p-6"><Input label="Nome do produto" value={formProduto.nome} onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })} error={formErrors.nome} required /><Input label="Código de barras" value={formProduto.codigo_barras} onChange={(e) => setFormProduto({ ...formProduto, codigo_barras: e.target.value })} error={formErrors.codigo_barras} required /><div className="grid grid-cols-2 gap-4"><Input label="Preço (R$)" type="number" step="0.01" min="0.01" value={formProduto.preco} onChange={(e) => setFormProduto({ ...formProduto, preco: e.target.value })} error={formErrors.preco} required /><Input label="Estoque" type="number" min="0" value={formProduto.quantidade_estoque} onChange={(e) => setFormProduto({ ...formProduto, quantidade_estoque: e.target.value })} error={formErrors.quantidade_estoque} /></div><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setIsProdutoModalOpen(false)}>Cancelar</Button><Button type="submit">Salvar produto</Button></div></form></div></div>}
      {isMovModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"><div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"><div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4"><h3 className="text-lg font-semibold">Registrar movimentação</h3><button onClick={() => setIsMovModalOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div><form onSubmit={handleMovimentacaoSubmit} className="p-6"><Select label="Produto" value={formMov.produto_id} onChange={(e) => setFormMov({ ...formMov, produto_id: e.target.value })} error={formErrors.produto_id} options={produtos.map((p) => ({ value: p.id, label: `${p.nome} (Estoque: ${p.estoque})` }))} required /><div className="grid grid-cols-2 gap-4"><Select label="Tipo" value={formMov.tipo} onChange={(e) => setFormMov({ ...formMov, tipo: e.target.value })} options={[{ value: 'entrada', label: 'Entrada (+)' }, { value: 'saida', label: 'Saída (-)' }]} /><Input label="Quantidade" type="number" min="1" value={formMov.quantidade} onChange={(e) => setFormMov({ ...formMov, quantidade: e.target.value })} error={formErrors.quantidade} required /></div><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setIsMovModalOpen(false)}>Cancelar</Button><Button type="submit" className={formMov.tipo === 'saida' ? 'bg-amber-600 hover:bg-amber-700' : ''}>Confirmar</Button></div></form></div></div>}
    </div>
  )
}
