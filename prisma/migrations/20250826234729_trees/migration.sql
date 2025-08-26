-- CreateEnum
CREATE TYPE "public"."SidewalkSide" AS ENUM ('Norte', 'Sur', 'Este', 'Oeste', 'Ambas', 'Ninguna');

-- CreateEnum
CREATE TYPE "public"."GeneralStatus" AS ENUM ('Bueno', 'Regular', 'Malo', 'Necesita_Intervencion');

-- CreateEnum
CREATE TYPE "public"."TreeStatus" AS ENUM ('Sano', 'Enfermo', 'Necesita_Poda', 'Seco', 'Recien_Plantado', 'Malo');

-- CreateTable
CREATE TABLE "public"."StreetSection" (
    "id" TEXT NOT NULL,
    "streetName" TEXT NOT NULL,
    "addressRange" TEXT NOT NULL,
    "sidewalkSide" "public"."SidewalkSide" NOT NULL,
    "predominantSpecies" TEXT NOT NULL,
    "treeCount" INTEGER NOT NULL,
    "generalStatus" "public"."GeneralStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreetSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tree" (
    "id" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "status" "public"."TreeStatus" NOT NULL,
    "streetName" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "sidewalk" "public"."SidewalkSide",
    "location" JSONB,
    "plantingDate" TIMESTAMP(3),
    "lastPruningDate" TIMESTAMP(3),
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tree_pkey" PRIMARY KEY ("id")
);
