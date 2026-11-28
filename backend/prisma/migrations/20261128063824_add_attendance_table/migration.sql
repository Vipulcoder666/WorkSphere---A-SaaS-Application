-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE');

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_companyId_date_idx" ON "attendance"("companyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_employeeId_date_key" ON "attendance"("employeeId", "date");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
