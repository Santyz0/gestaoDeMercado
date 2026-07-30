from sqlalchemy.orm import sessionmaker
from models import Produto, engine

Session = sessionmaker(bind=engine)
session = Session()

print('Buscando produtos no sistema...')
print("-" * 45)

produtos = session.query(Produto).all()

for produto in produtos:
    print(f"ID: {produto.id} | {produto.nome}")
    print(f"  Código de Barras: {produto.codigo_barras}")
    print(f"  Preço: R$ {produto.preco:.2f} | Estoque Atual: {produto.quantidade_estoque} un")
    print("-" * 45)

session.close()