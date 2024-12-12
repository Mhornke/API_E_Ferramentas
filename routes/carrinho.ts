import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

router.get("/:clienteId", async (req, res) => {
  const { clienteId } = req.params;

  try {
    console.log(`[GET /:clienteId] Cliente ID: ${clienteId}`);
    const carrinho = await prisma.carrinho.findMany({
      where: {
        clienteId: clienteId
      },
      include: {
        ferramenta: {
          select: {
            id: true,
            foto: true,
            preco: true,
            acessorios: true,
            fabricante: {
              select: { nome: true }
            },
          }
        }
      }
    });

    console.log(`[GET /:clienteId] Carrinho encontrado:`, carrinho);
    if (carrinho) {
      res.status(200).json(carrinho);
    } else {
      res.status(404).json({ message: "Carrinho não encontrado" });
    }
  } catch (error) {
    console.error(`[GET /:clienteId] Erro:`, error);
    res.status(400).json(error);
  }
});

router.get("/:clienteId/:ferramentaId", async (req, res) => {
  const { clienteId, ferramentaId } = req.params;

  try {
    console.log(`[GET /:clienteId/:ferramentaId] Cliente ID: ${clienteId}, Ferramenta ID: ${ferramentaId}`);
    const carrinho = await prisma.carrinho.findFirst({
      where: {
        clienteId: clienteId,
        ferramentaId: Number(ferramentaId),
      }
    });

    console.log(`[GET /:clienteId/:ferramentaId] Resultado:`, carrinho);
    if (carrinho) {
      res.status(200).json({ message: "Carrinho já existe", carrinho });
    } else {
      res.status(404).json({ message: "Carrinho não encontrado" });
    }
  } catch (error) {
    console.error(`[GET /:clienteId/:ferramentaId] Erro:`, error);
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post("/", async (req, res) => {
  const {nome,  quantidade, precoUnitario, clienteId, ferramentaId } = req.body;

  if (!nome || !quantidade || !precoUnitario || !clienteId || !ferramentaId) {
    console.warn(`[POST /] Dados ausentes: quantidade, precoUnitario, clienteId, ferramentaId são obrigatórios`);
    res.status(400).json({ erro: "Informe nome, quantidade, precoUnitario, clienteId e ferramentaId." });
    return;
  }

  try {
    const itemExistente = await prisma.carrinho.findFirst({
      where: {
        clienteId: clienteId,
        ferramentaId: Number(ferramentaId),
      },
    })

    if (itemExistente){
      const carrinhoAtualizado = await prisma.carrinho.update({
        where: {
          id: itemExistente.id
        },
        data: {
          quantidade: itemExistente.quantidade + 1
        }
      })
      res.status(200).json(carrinhoAtualizado)
    }else {   
      const novoitem = await prisma.carrinho.create({
      data: {
        nome,
        quantidade,
        precoUnitario,
        cliente: {
          connect: { id: clienteId }
        },
        ferramenta: {
          connect: { id: ferramentaId }
        }
      }
    });
      res.status(201).json(novoitem)
  }
    
  } catch (error) {
    console.error(`[POST /] Erro ao criar carrinho:`, error);
    res.status(400).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { clienteId } = req.body;

  console.log(`[DELETE /:id] ID: ${id}, Cliente ID: ${clienteId}`);

  try {
    const carrinho = await prisma.carrinho.findFirst({
      where: {
        id: Number(id),
        clienteId: clienteId,
      }
    });

    if (!carrinho) {
      console.warn(`[DELETE /:id] Carrinho não encontrado ou não pertence ao cliente.`);
      return res.status(404).json({ error: "Carrinho não encontrado ou não pertence ao cliente." });
    }

    const carrinhoExcluido = await prisma.carrinho.delete({
      where: { id: Number(id) }
    });

    
    res.status(200).json(carrinhoExcluido);
  } catch (error) {
    console.error(`[DELETE /:id] Erro ao excluir carrinho:`, error);
    res.status(400).json({ error: "Erro ao excluir o carrinho", details: error });
  }
});
router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const { quantidade } = req.body

  if (!quantidade) {
    res.status(400).json({ "erro": "erro ao alterar a quantidade" })
    return
  }

  try {
    const carrinhoAtual = await prisma.carrinho.findUnique({
      where: { id: Number(id) }
            
    });
    const novaQuantidade = carrinhoAtual?.quantidade + quantidade

    if (novaQuantidade <= 0){
      await prisma.carrinho.delete({
        where: { id: Number(id) }
      });
      return res.status(200).json({message: "Produto remivido do carrinho "})
    }
        const carrinhoAtualizado = await prisma.carrinho.update({
          where: { id: Number(id) },
          data: { quantidade: novaQuantidade }
        })
    
    res.status(200).json(carrinhoAtualizado)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router;