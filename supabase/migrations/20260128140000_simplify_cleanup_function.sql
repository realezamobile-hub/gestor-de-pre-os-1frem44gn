CREATE OR REPLACE FUNCTION cleanup_old_records(p_target_date timestamptz)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_products_deleted int;
    v_messages_deleted int;
    result json;
BEGIN
    -- Delete from produtos where created timestamp is less than or equal to target date
    WITH deleted_products AS (
        DELETE FROM public.produtos
        WHERE criado_em <= p_target_date
        RETURNING id
    )
    SELECT count(*) INTO v_products_deleted FROM deleted_products;

    -- Delete from mensagens_processadas where created timestamp is less than or equal to target date
    WITH deleted_messages AS (
        DELETE FROM public.mensagens_processadas
        WHERE created_at <= p_target_date
        RETURNING id
    )
    SELECT count(*) INTO v_messages_deleted FROM deleted_messages;

    SELECT json_build_object(
        'products_deleted', COALESCE(v_products_deleted, 0),
        'messages_deleted', COALESCE(v_messages_deleted, 0)
    ) INTO result;

    RETURN result;
END;
$$;
