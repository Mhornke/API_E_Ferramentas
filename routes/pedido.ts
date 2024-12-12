import { ItemPedido, PrismaClient } from "@prisma/client"
import { Router } from "express"
import nodemailer from "nodemailer"
import { verificaToken } from "../middewares/verificaToken"
import { error } from "console";
import { connect } from "http2";
import { create } from "domain";
import mailjet from 'node-mailjet';

const mailjet2 = mailjet.apiConnect(process.env.KEY_API!, process.env.SECRET_KEY!);
 



const prisma = new PrismaClient()
const router = Router()
router.get("/:clienteId", async (req, res) => {
    const { clienteId } = req.params;  // Pega o clienteId da URL

    try {
        const pedidos = await prisma.pedido.findMany({
            where: {
                clienteId: String(clienteId)  // Filtra os pedidos pelo clienteId
            },
            include: {
                itens: {
                    include: {
                        ferramenta: true,
                    },
                },
                cliente: true,
            },
            orderBy: { id: 'desc' },
        });

        res.status(200).json(pedidos);
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        res.status(400).json({ message: "Erro ao carregar pedidos", error });
    }
});


router.get("/", async (req, res) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            include: {
                itens: { // Inclui os itens do pedido
                    include: {
                        ferramenta: true, // Inclui detalhes da ferramenta em cada item
                    },
                },
                cliente: true, // Inclui os dados do cliente, caso necessário
            },
            orderBy: { id: 'desc' } // Ordena pelos pedidos mais recentes
        });

        res.status(200).json(pedidos);
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        res.status(400).json({ message: "Erro ao carregar pedidos", error });
    }
});



async function enviaEmail(
    nome_cliente: string,
    email_cliente: string,
    descricao: string,
    ID_pedido: string,
    modelo_produto: string,
    status_pedido: string,
    modelo: string,
    fotoUrl: string
): Promise<void> {
    const request = mailjet2
        .post('send', { version: 'v3.1' })  
        .request({
            Messages: [
                {
                    From: {
                        Email: 'mhornke46@gmail.com', // Substitua pelo seu e-mail
                        Name: 'E-Ferramentas' // Nome do remetente
                    },
                    To: [
                        {
                            Email: email_cliente,
                            Name: nome_cliente // Nome do destinatário
                        }
                    ],
                    Subject: `Re: Confirmação de Pedido Nº: ${ID_pedido}`,
                    TextPart: `Olá ${nome_cliente}\nO status do seu pedido de compra é: ${status_pedido}\nProduto: ${modelo_produto}\nDescrição do Pedido: ${descricao}`,
                    HtmlPart: `<p>Olá ${nome_cliente},</p>
                               <p>Obrigado pela sua compra!</p>
                               <p>O status do seu pedido de compra é: ${status_pedido}</p>
                               <p>Produto: ${modelo_produto}</p>
                               <p><img src="${fotoUrl}" alt="imagem da compra" style="max-width:200px; height: auto;"/></p>
                               <p><strong>Descrição do Pedido:</strong> ${descricao}</p>
                               <p>Muito obrigado pela sua compra!</p>`
                }
            ]
        });

    try {
        const response = await request;
        console.log('E-mail enviado com sucesso', response.body);
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
    }
}




router.post("/", async (req, res) => {
    const { clienteId, valorTotal, quantidade, descricao } = req.body;

    if (!clienteId || !valorTotal || !quantidade || !descricao) {
        res.status(400).json({ erro: "Informe clienteId, valorTotal, quantidade e descricao." })
        return;
    }

    try {
        const itensCarrinho = await prisma.carrinho.findMany({
            where: { clienteId },
            include: {
                ferramenta: true // Inclui os dados da ferramenta (como preço e nome)
            }
        })

        if (!itensCarrinho.length) {
            return res.status(404).json({ error: "Carrinho vazio" });
        }

        const itensPedido = itensCarrinho.map(item => ({
            nome: item.ferramenta.modelo,
            ferramentaId: item.ferramenta.id,
            quantidade: item.quantidade,
            precoUnitario: parseFloat(item.ferramenta.preco.toString()),

        }));

        // Criação do pedido
        const pedido = await prisma.pedido.create({
            data: {
                clienteId,
                valorTotal,
                quantidade,
                descricao,
                status: "EM_PROCESSAMENTO",
                itens: {
                    create: itensPedido
                }
            }
        });

       
        // Obtenção dos dados do cliente
        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId }
        });

        // if (cliente) {
        //     const fotoUrl = itensCarrinho[0].ferramenta.foto || '';
        //     const nome_cliente = cliente.nome; // nome
        //     const email_cliente = cliente.email; // email
        //     const ID_pedido = pedido.id.toString(); // número do pedido
        //     const modelo_produto = itensCarrinho[0].ferramenta.modelo; // modelo da ferramenta
        //     const status_pedido = pedido.status; // status do pedido
        //     const descricao_pedido = descricao; // descrição do pedido

        //     // Envia o e-mail com os dados
        //     await enviaEmail(
        //         nome_cliente,
        //         email_cliente,
        //         descricao_pedido,
        //         ID_pedido,
        //         modelo_produto,
        //         status_pedido,
        //         "Pedido de compra realizado com sucesso!",
        //         fotoUrl
        //     );
        // }

        // res.status(201).json({
        //     clienteId,
        //     valorTotal,
        //     descricao,
        //     itens: itensPedido
        // });

    } catch (error) {
        res.status(400).json("Erro ao processar o pedido");
    }
});



router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { status, itensPedido  } = req.body;

    if (!status) {
        res.status(400).json({ "erro": "Informe o status do pedido" });
        return;
    }

    try {
        // Atualiza o status do pedido no banco de dados
        const pedido = await prisma.pedido.update({
            where: { id: Number(id) },
            data: { status }
        });

        if (status === 'ENVIADO' && itensPedido) {
            await Promise.all(itensPedido.map((item:ItemPedido) => 
                prisma.ferramenta.update({
                    where: { id: item.ferramentaId },
                    data: {
                        quantidadeEstoque: {
                            decrement: item.quantidade,
                        },
                    },
                })
            ));
        }   else if (status === 'CANCELADA') {
            if (pedido.status === 'ENVIADO') {
                await Promise.all(itensPedido.map((item:ItemPedido) => 
                    prisma.ferramenta.update({
                        where: { id: item.ferramentaId },
                        data: {
                            quantidadeEstoque: {
                                increment: item.quantidade,
                            },
                        },
                    })
                ));
            } else {
                return res.status(400).json({ error: "Não é possível cancelar um pedido que ainda não foi enviado." });
            }
        }
    

        const dadosPedido = await prisma.pedido.findUnique({
            where: { id: Number(id) },
            include: {
                cliente: true,  
                itens: { 
                    include: {
                        ferramenta: true, 
                    }
                }
            }
        });

        if (dadosPedido) {
            // Obtenção dos dados do cliente
            const cliente = dadosPedido.cliente;
            const nome_cliente = cliente?.nome;
            const email_cliente = cliente?.email;
            const ID_pedido = dadosPedido.id.toString();
            const modelo_produto = dadosPedido.itens[0]?.ferramenta?.modelo;
            const status_pedido = dadosPedido.status;
            const descricao_pedido = dadosPedido.descricao;
            const fotoUrl = dadosPedido.itens[0]?.ferramenta?.foto || '';  // Se houver foto da ferramenta

            // Envia o e-mail com os dados do pedido
            await enviaEmail(
                nome_cliente as string,
                email_cliente as string,
                descricao_pedido as string,
                ID_pedido,
                modelo_produto as string,
                status_pedido as string,
                "Pedido de compra atualizado com sucesso!",
                fotoUrl
            );
        }

        res.status(200).json(pedido);
    } catch (error) {
        console.error("Erro ao atualizar o status do pedido:", error);
        res.status(400).json({ error: "Erro ao atualizar o status do pedido" });
    }
});


router.delete("/:id", verificaToken, async (req, res) => {
    const { id } = req.params

    try {
        const pedido = await prisma.pedido.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(pedido)
    } catch (error) {
        res.status(400).json(error)
    }
})

export default router