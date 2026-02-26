-- Step 1: Update all GOLD rows to GOLD (PostgreSQL cannot drop an enum value that is in use)
UPDATE "Vendor" SET tier = 'GOLD' WHERE tier = 'GOLD';
UPDATE "Voucher" SET tier = 'GOLD' WHERE tier = 'GOLD';
UPDATE "Payment" SET tier = 'GOLD' WHERE tier = 'GOLD';
UPDATE "VendorVisit" SET "agreedTier" = 'GOLD' WHERE "agreedTier" = 'GOLD';

-- Step 2: Recreate enum without GOLD
CREATE TYPE "Tier_new" AS ENUM ('FREE', 'GOLD');
ALTER TABLE "Vendor" ALTER COLUMN "tier" TYPE "Tier_new" USING tier::text::"Tier_new";
ALTER TABLE "Voucher" ALTER COLUMN "tier" TYPE "Tier_new" USING tier::text::"Tier_new";
ALTER TABLE "Payment" ALTER COLUMN "tier" TYPE "Tier_new" USING tier::text::"Tier_new";
ALTER TABLE "VendorVisit" ALTER COLUMN "agreedTier" TYPE "Tier_new" USING "agreedTier"::text::"Tier_new";
DROP TYPE "Tier";
ALTER TYPE "Tier_new" RENAME TO "Tier";
