-- Step 1: Update all PAID_2 rows to PAID_1 (PostgreSQL cannot drop an enum value that is in use)
UPDATE "Vendor" SET tier = 'PAID_1' WHERE tier = 'PAID_2';
UPDATE "Voucher" SET tier = 'PAID_1' WHERE tier = 'PAID_2';
UPDATE "Payment" SET tier = 'PAID_1' WHERE tier = 'PAID_2';
UPDATE "VendorVisit" SET "agreedTier" = 'PAID_1' WHERE "agreedTier" = 'PAID_2';

-- Step 2: Recreate enum without PAID_2
CREATE TYPE "Tier_new" AS ENUM ('FREE', 'PAID_1');
ALTER TABLE "Vendor" ALTER COLUMN "tier" TYPE "Tier_new" USING tier::text::"Tier_new";
ALTER TABLE "Voucher" ALTER COLUMN "tier" TYPE "Tier_new" USING tier::text::"Tier_new";
ALTER TABLE "Payment" ALTER COLUMN "tier" TYPE "Tier_new" USING tier::text::"Tier_new";
ALTER TABLE "VendorVisit" ALTER COLUMN "agreedTier" TYPE "Tier_new" USING "agreedTier"::text::"Tier_new";
DROP TYPE "Tier";
ALTER TYPE "Tier_new" RENAME TO "Tier";
