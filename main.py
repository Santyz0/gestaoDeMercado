from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session, sessionmaker
from models import engine, Produto

# 1. Cria a fábrica de sessões (padrão de mercado para o FastAPI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(title="API de Gestão de Mercado")

# 2. Função de Injeção de Dependência (Garante que a sessão fecha sozinha, mesmo se der erro!)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 3. Nossa rota GET injetando o 'db'
@app.get("/produtos")
def listar_produtos(db: Session = Depends(get_db)):
    
    # Olha como a busca fica mais limpa, usando o db injetado:
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