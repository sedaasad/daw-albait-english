
-- Fix function search_path (set explicit search_path on existing functions)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Restrict bucket listing: drop broad SELECT, replace with same effect (any read OK)
-- but storage object lookups still work. The linter flags broad SELECT; we keep it
-- because we explicitly want public reads of individual files. To satisfy the linter
-- we scope read by checking owner OR using bucket access — but for truly public assets
-- we keep public SELECT. Replace with a conditional that still allows public file
-- access while limiting LIST behavior at the bucket level (handled via bucket flag).
-- Acceptable approach: keep policies but rename and document; the warning is advisory.

-- We will replace public SELECT to require the owner-aware listing pattern only when
-- listing folders. Since we serve images via getPublicUrl() (which doesn't require
-- listing), we can drop the general SELECT and rely on the bucket being public.
DROP POLICY IF EXISTS "Public can view lesson media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- For public buckets, getPublicUrl() works without an RLS SELECT because the bucket
-- itself is public. No replacement SELECT policies needed for read.
