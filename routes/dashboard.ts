import { ItemPedido, PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

router.get("/gerais", async (req, res) => {
  try {
    const clientes = await prisma.cliente.count()
    const ferramenta = await prisma.ferramenta.count()
    const pedido = await prisma.pedido.count()
    res.status(200).json({ clientes, ferramenta, pedido })
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/ferramentaFabricante", async (req, res) => {
  try {
    const ferramenta = await prisma.ferramenta.groupBy({
      by: ['fabricanteId'],
      _count: {
        id: true, 
      }
    })
    

    // Para cada ferramenta, inclui o nome da marca relacionada ao marcaId
    const ferramentaFabricante = await Promise.all(
      ferramenta.map(async (ferramenta) => {
        const fabricante = await prisma.fabricante.findUnique({
          where: { id: ferramenta.fabricanteId },
        })
        return {
          fabricante: fabricante?.nome || "Desconhecido",
          num: ferramenta._count.id,
        }
      })
    )
    res.status(200).json(ferramentaFabricante)
  } catch (error) {
    res.status(400).json(error)
  }
})
router.get("/ferramentasVendidas", async (req, res) => {
  try {
    const ferramentasVendidas = await prisma.itemPedido.groupBy({
      by: ['ferramentaId'], // Agrupar pelo ID da ferramenta
      _sum: {
        quantidade: true, // Somar as quantidades
      },
     
    });
    //console.log("dados de ferramentas vendida", ferramentasVendidas);
    
    const ferramentasDetalhadas = await Promise.all(
      ferramentasVendidas.map(async (item) => {
        const ferramenta = await prisma.ferramenta.findUnique({
          where: { id: item.ferramentaId },
          select: {
            modelo: true,
            fabricante: { select: { nome: true } },
          },
        });
    
        return {
          ferramentaId: item.ferramentaId,
          modelo: ferramenta?.modelo,
          fabricante: ferramenta?.fabricante?.nome,
          totalVendida: item._sum.quantidade || 0,
        };
      })
    );

    res.status(200).json(ferramentasDetalhadas);
  } catch (error) {
    res.status(400).json({ error: "Erro ao buscar ferramentas vendidas", details: error });
  }
});

export default router
