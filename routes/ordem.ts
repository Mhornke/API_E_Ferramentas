// import { PrismaClient } from "@prisma/client"
// import { Router } from "express"
// import nodemailer from "nodemailer"
// import { verificaToken } from "../middewares/verificaToken"

// const prisma = new PrismaClient()
// const router = Router()

// router.get("/", async (req, res) => {
//   try {
//     const ordens = await prisma.ordem.findMany({
//       include: {
//         cliente: true,
//         ferramenta: true
//       },
//       orderBy: { id: 'desc'}
//     })
//     res.status(200).json(ordens)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.post("/", async (req, res) => {
//   const { clienteId, ferramentaId, descricao } = req.body

//   if (!clienteId || !ferramentaId || !descricao) {
//     res.status(400).json({ erro: "Informe clienteId, ferramentaId e descricao" })
//     return
//   }

//   try {
//     const ordem = await prisma.ordem.create({
//       data: { clienteId, ferramentaId, descricao }
//     })
//     res.status(201).json(ordem)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// async function enviaEmail(nome: string, email: string,
//   descricao: string, resposta: string) {

//   const transporter = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 587,
//     secure: false,
//     auth: {
//       user: "968f0dd8cc78d9",
//       pass: "89ed8bfbf9b7f9"
//     }
//   });

//   const info = await transporter.sendMail({
//     from: '__________@gmail.com', // sender address
//     to: email, // list of receivers
//     subject: "Re: Proposta E-ferramentas", // Subject line
//     text: resposta, // plain text body
//     html: `<h3>Estimado Cliente: ${nome}</h3>
//            <h3>Compra: ${descricao}</h3>
//            <h3> ${resposta}</h3>
//            <p>Muito obrigado pelo seu compra</p>
//            <p></p>`
//   });

//   console.log("Message sent: %s", info.messageId);
// }

// router.patch("/:id", async (req, res) => {
//   const { id } = req.params
//   const { resposta } = req.body

//   if (!resposta) {
//     res.status(400).json({ "erro": "Informe a resposta desta ordem de compra" })
//     return
//   }

//   try {
//     const ordem = await prisma.ordem.update({
//       where: { id: Number(id) },
//       data: { resposta }
//     })

//     const dados = await prisma.ordem.findUnique({
//       where: { id: Number(id) },
//       include: {
//         cliente: true
//       }
//     })

//     enviaEmail(dados?.cliente.nome as string,
//       dados?.cliente.email as string,
//       dados?.descricao as string,
//       resposta)

//     res.status(200).json(ordem)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.get("/:clienteId", async (req, res) => {
//   const { clienteId } = req.params
//   try {
//     const ordens = await prisma.ordem.findMany({
//       where: { clienteId },
//       include: {
//         ferramenta: true
//       }
//     })
//     res.status(200).json(ordens)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.delete("/:id", verificaToken, async (req, res) => {
//   const { id } = req.params

//   try {
//     const ordem = await prisma.ordem.delete({
//       where: { id: Number(id) }
//     })
//     res.status(200).json(ordem)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// export default router