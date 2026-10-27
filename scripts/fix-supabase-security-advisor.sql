-- ==============================================================================
-- WPI GUJARAT FEDERATION — SUPABASE SECURITY ADVISOR FIX
-- Fixes:
--   1. "Public Can Execute SECURITY DEFINER Function" (anon role)
--   2. "Signed-In Users Can Execute SECURITY DEFINER Function" (authenticated role)
-- Entity: public.rls_auto_enable()
-- ==============================================================================

-- Step 1: Revoke execution rights from unprivileged roles (anon, authenticated, and public)
-- This blocks PostgREST from exposing the function to the internet (/rest/v1/rpc/rls_auto_enable)
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- Step 2: Grant execution rights strictly to database admins and backend service roles
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO supabase_admin;

-- Step 3: Secure search_path to prevent schema hijacking (Supabase Best Practice)
ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp;

-- ==============================================================================
-- Verification Query (Run this after to confirm permissions are revoked):
-- ==============================================================================
-- SELECT 
--   routine_name, 
--   grantee, 
--   privilege_type 
-- FROM information_schema.routine_privileges 
-- WHERE routine_name = 'rls_auto_enable';
