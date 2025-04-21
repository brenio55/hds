-- Migration to revert the update of valor_final with frete
-- This down migration doesn't need to modify data as it just removes the calculation logic
-- The original values are preserved in the database

-- Comentário indicando que esta é uma migração de reversão
COMMENT ON DATABASE CURRENT_DATABASE() IS 'Down migration for 018_update_valor_final_with_frete completed. No data modification needed.'; 