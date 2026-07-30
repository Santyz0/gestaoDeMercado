from sqlalchemy.orm import sessionmaker
from models import Produto, engine

Session = sessionmaker(bind=engine)
session = Session()

try:
    produto1 = Produto(nome="Arroz Parbolizado 1kg", codigo_barras='7891010101112', preco=5.99, quantidade_estoque=50)
    produto2 = Produto(nome='Feijão Macassa 1kg', codigo_barras='7892020201113', preco=8.49, quantidade_estoque=30)

    session.add(produto1)
    session.add(produto2)

    session.commit()
    print("Produtos cadastrados com sucesso!")

except Exception as e:
    session.rollback()
    print(f"Erro ao cadastrar produtos: {e}")

finally: 
    session.close()