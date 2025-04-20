-- Migration to remove the default frete value of 10
-- This script does not modify any data, it just provides a down migration

-- Comentário indicando que esta é uma migração de reversão para a 022
COMMENT ON DATABASE CURRENT_DATABASE() IS 'Down migration for 022_add_frete_field_with_default completed. No data change needed.'; 