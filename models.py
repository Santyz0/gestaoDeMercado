from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

engine = create_engine('sqlite:///estoque.db', echo=True)

Base = declarative_base()

class Produto(Base):
    __tablename__ = 'produtos'

    id = Column(Integer, primary_key=True)
    nome = Column(String, nullable=False)
    codigo_barras = Column(String, unique=True, nullable=False)
    preco = Column(Float, nullable=False)
    quantidade_estoque = Column(Integer, default=0)

class Movimentacao(Base):
    __tablename__ = 'movimentacoes'

    id = Column(Integer, primary_key=True) 
    produto_id = Column(Integer, ForeignKey('produtos.id'), nullable=False)
    tipo = Column(String, nullable=False)
    quantidade = Column(Integer, nullable=False)
    data_hora = Column(DateTime, default=func.now())

    produto = relationship("Produto")

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    print("Banco de dados 'estoque.db' e tabela 'produtos' criados com sucesso!")
