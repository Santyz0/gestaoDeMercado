from sqlalchemy.orm import Session, sessionmaker
from pydantic import BaseModel, Field
from models import engine, Produto, Movimentacao
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(title="API de Gestão de Mercado")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 2. Atualizamos a nossa "Fôrma" com regras de negócio rígidas
class ProdutoCreate(BaseModel):
    nome: str
    codigo_barras: str
    # gt=0 significa "Greater Than 0" (Maior que zero)
    preco: float = Field(gt=0, description="O preço deve ser estritamente maior que zero")
    # ge=0 significa "Greater or Equal to 0" (Maior ou igual a zero)
    quantidade_estoque: int = Field(default=0, ge=0, description="O estoque não pode ser negativo")

class MovimentacaoCreate(BaseModel):
    produto_id: int
    quantidade: int = Field(gt=0, description="Quantidade deve ser maior que zero")
    tipo: str = Field(pattern="^(entrada|saida)$")

@app.get("/produtos")
def listar_produtos(db: Session = Depends(get_db)):
    produtos_banco = db.query(Produto).all()
    
    lista_formatada = []
    for produto in produtos_banco:
        lista_formatada.append({
            "id": produto.id,
            "nome": produto.nome,
            "codigo_barras": produto.codigo_barras,
            "preco": produto.preco,
            "estoque": produto.quantidade_estoque
        })
        
    return lista_formatada

@app.post("/produtos")
def cadastrar_produto(produto_entrada: ProdutoCreate, db: Session = Depends(get_db)):
    
    produto_existente = db.query(Produto).filter_by(codigo_barras=produto_entrada.codigo_barras).first()
    if produto_existente:
        raise HTTPException(status_code=400, detail="Código de barras já cadastrado no sistema.")
    
    novo_produto = Produto(
        nome=produto_entrada.nome,
        codigo_barras=produto_entrada.codigo_barras,
        preco=produto_entrada.preco,
        quantidade_estoque=produto_entrada.quantidade_estoque
    )
    
    db.add(novo_produto)
    db.commit()
    db.refresh(novo_produto)
    
    return novo_produto

@app.put("/produtos/{produto.id}")
def atualizar_produto(produto_id: int, produto_atualizado: ProdutoCreate, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter_by(id=produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail= "Produto não encontrado.")
    produto.nome = produto_atualizado.no
    produto.preco = produto_atualizado.preco

    db.commit()
    return {"mensagem": f"Produto {produto.nome} atualizado com sucesso!" }

@app.delete("/produtos/{produto_id}")
def deletar_produto(produto_id: int, db:Session = Depends(get_db)):
    produto = db.query(Produto).filter_by(id=produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    db.delete(produto)
    db.commit()
    return {"mensagem": "Produto deletado com sucesso!"}

@app.post("/movimentacoes")
def registrar_movimentacao(mov_entrada: MovimentacaoCreate, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter_by(id=mov_entrada.produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    if mov_entrada.tipo == 'saida' and mov_entrada.quantidade > produto.quantidade_estoque:
        raise HTTPException(
            status_code=404, 
            detail=f"Estoque insuficiente. Saldo atual: {produto.quantidade_estoque}"
        )

    if mov_entrada.tipo == "entrada":
        produto.quantidade_estoque += mov_entrada.quantidade
    elif mov_entrada.tipo == "saida":
        produto.quantidade_estoque -= mov_entrada.quantidade

    nova_movimentacao = Movimentacao(
        produto_id=produto.id,
        tipo=mov_entrada.tipo,
        quantidade=mov_entrada.quantidade
    )
    db.add(nova_movimentacao)
    db.commit()
    
    return {"msg": "Sucesso", "novo_saldo": produto.quantidade_estoque}