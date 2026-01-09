-- Migration avec fonction SECURITY DEFINER pour contourner le problème auth.uid()
-- À utiliser si la migration 20250108000008 fonctionne avec la politique permissive

-- 1. Créer une fonction qui vérifie si l'utilisateur peut modifier un événement
CREATE OR REPLACE FUNCTION public.can_update_event(_event_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _event_user_id UUID;
    _current_user_id UUID;
    _is_admin BOOLEAN;
BEGIN
    -- Récupérer l'ID de l'utilisateur actuel
    _current_user_id := auth.uid();
    
    -- Si pas d'utilisateur connecté, refuser
    IF _current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Récupérer le propriétaire de l'événement
    SELECT user_id INTO _event_user_id
    FROM public.events
    WHERE id = _event_id;
    
    -- Si l'événement n'existe pas, refuser
    IF _event_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Si l'utilisateur est le propriétaire, autoriser
    IF _event_user_id = _current_user_id THEN
        RETURN TRUE;
    END IF;
    
    -- Vérifier si l'utilisateur est admin
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = _current_user_id 
        AND role = 'admin'::app_role
    ) INTO _is_admin;
    
    -- Si admin, autoriser
    IF _is_admin THEN
        RETURN TRUE;
    END IF;
    
    -- Sinon, refuser
    RETURN FALSE;
END;
$$;

-- 2. Supprimer l'ancienne politique UPDATE permissive
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Admins can update all events" ON public.events;

-- 3. Créer une nouvelle politique UPDATE qui utilise la fonction
CREATE POLICY "Users can update events with function" ON public.events
  FOR UPDATE 
  TO authenticated
  USING (public.can_update_event(id))
  WITH CHECK (public.can_update_event(id));

-- Cette approche utilise une fonction SECURITY DEFINER qui peut accéder à auth.uid()
-- même si les politiques RLS normales ont des problèmes avec ça
