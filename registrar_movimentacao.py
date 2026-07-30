from sqlalchemy.orm import sessionmaker
from models import Produto, engine, Movimentacao

Session = sessionmaker(bind=engine)
session = Session()

try:
    produto = session.query(Produto).filter_by(id=1).first()

    if not produto:
        print("Produto não encontrado no sistema.")
    else:
        quantidade_comprada = 20

        nova_movimentacao = Movimentacao(
            produto_id=produto.id,
            tipo='entrada',
            quantidade=quantidade_comprada
        )
        session.add(nova_movimentacao)

        produto.quantidade_estoque += quantidade_comprada
        session.commit()

        print("-" * 45)
        print(f"Sucesso! Entrada registrada para: {produto.nome}.")
        print(f"Quantidade adicionada: {quantidade_comprada} un")
        print(f"Novo saldo no estoque: {produto.quantidade_estoque} un")
        print("-" * 45)

except Exception as e:
    session.rollback()
    print(f"Erro ao registrar movimentação: {e}")

finally:
    session.close()

