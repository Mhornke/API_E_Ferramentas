import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { connect } from "http2"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()
const router = Router()

router.get("/:ferramentaId", async (req, res) => {
  const { ferramentaId } = req.params

  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        ferramentaId: Number(ferramentaId)
      },
      include: {
        cliente: {
          select: {
            nome: true,
            email: true,

          }
        }
          
          
      }
    })
    const estatisticas = await prisma.avaliacao.aggregate({
      where: { ferramentaId: Number(ferramentaId) },
      _count: { id: true },
      _sum: { estrelas: true },
      _avg: { estrelas: true },
    });


    res.status(200).json({avaliacoes, estatisticas})
  } catch (error) {
    res.status(400).json(error)
  }
})

// router.get("/", async (req, res) => {
//   try {
//     const avaliacao = await prisma.avaliacao.findMany({
//       include: {
//         cliente: true,
//         ferramenta: true 
//       }
//     });
//     res.status(200).json(avaliacao);
//   } catch (error) {
//     res.status(400).json(error);
//   }
// });

router.post("/", async (req, res) => {
  const { clienteId, ferramentaId, estrelas, comentario } = req.body; // Alterado para 'ferramentaId'

  if (!clienteId || !ferramentaId || !estrelas || !comentario) {
    res.status(400).json({ erro: "Informe clienteId, ferramentaId e descricao" });
    return;
  }

  try {
    const existeComentario = await prisma.avaliacao.findFirst({
      where: { clienteId: clienteId,
        ferramentaId: Number(ferramentaId) }
    })
    if (existeComentario) {
      return;
    }
    else{
    const avaliacao = await prisma.avaliacao.create({
      data: {
        cliente: {
          connect: { id: clienteId }
        },
        ferramenta: {
          connect: { id: ferramentaId }
        },
        estrelas,
        comentario: comentario,
        totalAvaliacao: estrelas
      }
    });

    res.status(201).json(avaliacao);
  }
  } catch (error) {
    res.status(400).json(error);
  }
});



export default router