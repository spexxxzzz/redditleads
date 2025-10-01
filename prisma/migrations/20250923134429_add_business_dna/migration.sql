-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "businessDNA" JSONB;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "relevanceReasoning" TEXT;
