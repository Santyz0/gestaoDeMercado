from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base

engine = create_engine('sqlite:///estoque.db', echo=True)

Base = declarative_base()

class Produto(Base):
    __tablename__ = 'produtos'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    codigo_barras = Column(String, unique=True, nullable=False)
    preco = Column(Float, nullable=False)
    quatidade_estoque = Column(Integer, default=0)

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    print("Banco de dados 'estoque.db' e tabela 'produtos' criados com sucesso!")
