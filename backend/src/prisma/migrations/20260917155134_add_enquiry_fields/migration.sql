-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "preferredDate" TIMESTAMP(3),
ADD COLUMN     "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW';
