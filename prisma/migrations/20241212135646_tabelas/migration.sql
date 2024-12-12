-- CreateEnum
CREATE TYPE "Voltage" AS ENUM ('BIVOLT', 'VOLT_220', 'VOLT_110');

-- CreateEnum
CREATE TYPE "StatusOrdem" AS ENUM ('EM_PROCESSAMENTO', 'ENVIADO', 'EM_TRANSITO', 'CONCLUIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "fabricantes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(30) NOT NULL,

    CONSTRAINT "fabricantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ferramentas" (
    "id" SERIAL NOT NULL,
    "modelo" VARCHAR(60) NOT NULL,
    "ano" SMALLINT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "destaque" BOOLEAN NOT NULL DEFAULT true,
    "foto" TEXT NOT NULL,
    "quantidadeEstoque" INTEGER NOT NULL,
    "acessorios" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipo" "Voltage" NOT NULL DEFAULT 'BIVOLT',
    "fabricanteId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ferramentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" SERIAL NOT NULL,
    "totalAvaliacao" INTEGER NOT NULL,
    "estrelas" INTEGER NOT NULL DEFAULT 0,
    "comentario" VARCHAR(255),
    "ferramentaId" INTEGER NOT NULL,
    "clienteId" VARCHAR(36) NOT NULL,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "id" SERIAL NOT NULL,
    "clienteId" VARCHAR(36) NOT NULL,
    "ferramentaId" INTEGER NOT NULL,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos" (
    "id" SERIAL NOT NULL,
    "descricao" VARCHAR(30) NOT NULL,
    "codigoFoto" TEXT NOT NULL,
    "ferramentaId" INTEGER NOT NULL,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" VARCHAR(36) NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "senha" VARCHAR(60) NOT NULL,
    "novaSenha" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorTotal" DECIMAL(10,3) NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "StatusOrdem" NOT NULL DEFAULT 'EM_PROCESSAMENTO',
    "clienteId" TEXT NOT NULL,
    "ferramentaId" INTEGER,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" SERIAL NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(65,30) NOT NULL,
    "nome" TEXT NOT NULL,
    "ferramentaId" INTEGER NOT NULL,
    "pedidoId" INTEGER NOT NULL,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrinho" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(10,3) NOT NULL,
    "clienteId" VARCHAR(36) NOT NULL,
    "ferramentaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrinho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "senha" VARCHAR(60) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "ferramentas" ADD CONSTRAINT "ferramentas_fabricanteId_fkey" FOREIGN KEY ("fabricanteId") REFERENCES "fabricantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ferramentas" ADD CONSTRAINT "ferramentas_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_ferramentaId_fkey" FOREIGN KEY ("ferramentaId") REFERENCES "ferramentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_ferramentaId_fkey" FOREIGN KEY ("ferramentaId") REFERENCES "ferramentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_ferramentaId_fkey" FOREIGN KEY ("ferramentaId") REFERENCES "ferramentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_ferramentaId_fkey" FOREIGN KEY ("ferramentaId") REFERENCES "ferramentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_ferramentaId_fkey" FOREIGN KEY ("ferramentaId") REFERENCES "ferramentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrinho" ADD CONSTRAINT "carrinho_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrinho" ADD CONSTRAINT "carrinho_ferramentaId_fkey" FOREIGN KEY ("ferramentaId") REFERENCES "ferramentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
