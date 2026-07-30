from sqlalchemy.orm import sessionmaker
from models import Produto, engine, Movimentacao

Session = sessionmaker(bind=engine)
session = Session()

try:
    produto = session.query(Produto).filter_by(id=1).first()

    if not produto:
        print("ERROR: Produto não encontrado no sistema.")

    else:
        quantidade_vendida = 100

    if quantidade_vendida > produto.quantidade_estoque:
        print("-" * 45)
        print("❌ VENDA BLOQUEADA: Produto sem estoque suficiente!")
        print(f"Tentativa de venda: {quantidade_vendida} un")
        print(f"Estoque atual: {produto.quantidade_estoque} un")
        print("-" * 45)

    else:
        nova_movimentacao = Movimentacao(
            produto_id=produto.id,
            tipo='saida',
            quantidade=quantidade_vendida
        )
        session.add(nova_movimentacao)

        produto.quantidade_estoque -= quantidade_vendida
        session.commit()

        print("-" * 45)
        print(f"✅ VENDA APROVADA: {produto.nome}")
        print(f"Quantidade vendida: {quantidade_vendida} un")
        print(f"Novo saldo no estoque: {produto.quantidade_estoque} un")
        print("-" * 45)

except Exception as e:
    session.rollback()
    print(f"Erro ao registrar venda. Transação cancelada: {e}")

finally:
    session.close()