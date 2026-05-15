-- ============================================================
-- CV merge apply: UNIQUE expression indexes + atomic apply RPC
-- Applied: 2026-05-16
-- Phase C.3 — idempotent apply over L2 collections, with signature
-- semantics matching lib/profilux/educationSignature.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uniq_education_records_member_signature
  ON public.education_records (
    member_id,
    lower(trim(institution)),
    lower(trim(coalesce(field_of_study, ''))),
    coalesce(graduation_year, -1)
  );

CREATE UNIQUE INDEX IF NOT EXISTS uniq_member_languages_member_language
  ON public.member_languages (member_id, lower(trim(language)));

CREATE UNIQUE INDEX IF NOT EXISTS uniq_member_sectors_member_sector
  ON public.member_sectors (member_id, sector);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_work_experiences_member_company_start
  ON public.work_experiences (
    member_id,
    lower(trim(coalesce(company, ''))),
    coalesce(start_date, '1900-01-01'::date)
  );

-- ===== Atomic apply RPC =====
-- ON CONFLICT DO NOTHING skips any unique/exclusion conflict.
-- No EXCEPTION blocks: unexpected errors must rollback the RPC.
-- Idempotency counted via GET DIAGNOSTICS ROW_COUNT.

CREATE OR REPLACE FUNCTION public.apply_cv_merge(
  p_member_id uuid,
  p_accept jsonb,
  p_new_cv_parsed_data jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_identity jsonb;
  v_exp jsonb;
  v_edu jsonb;
  v_lang jsonb;
  v_sec jsonb;
  v_n int;
  v_inserted_exp int := 0;
  v_inserted_edu int := 0;
  v_inserted_lang int := 0;
  v_inserted_sec int := 0;
  v_skipped_dup int := 0;
BEGIN
  v_identity := p_accept->'identity';
  IF v_identity IS NOT NULL AND jsonb_typeof(v_identity) = 'object' THEN
    UPDATE public.members SET
      first_name  = COALESCE(v_identity->>'first_name',  first_name),
      last_name   = COALESCE(v_identity->>'last_name',   last_name),
      city        = COALESCE(v_identity->>'city',        city),
      country     = COALESCE(v_identity->>'country',     country),
      nationality = COALESCE(v_identity->>'nationality', nationality),
      phone       = COALESCE(v_identity->>'phone',       phone),
      headline    = COALESCE(v_identity->>'headline',    headline),
      bio         = COALESCE(v_identity->>'bio',         bio)
    WHERE id = p_member_id;
  END IF;

  FOR v_exp IN SELECT * FROM jsonb_array_elements(COALESCE(p_accept->'experiences', '[]'::jsonb)) LOOP
    INSERT INTO public.work_experiences (member_id, job_title, company, city, country, start_date, end_date, is_current, description)
    VALUES (
      p_member_id,
      v_exp->>'job_title',
      v_exp->>'company',
      v_exp->>'city',
      v_exp->>'country',
      NULLIF(v_exp->>'start_date','')::date,
      NULLIF(v_exp->>'end_date','')::date,
      COALESCE((v_exp->>'is_current')::boolean, false),
      v_exp->>'description'
    )
    ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    IF v_n > 0 THEN v_inserted_exp := v_inserted_exp + 1; ELSE v_skipped_dup := v_skipped_dup + 1; END IF;
  END LOOP;

  FOR v_edu IN SELECT * FROM jsonb_array_elements(COALESCE(p_accept->'education', '[]'::jsonb)) LOOP
    IF (v_edu->>'institution') IS NULL OR trim(v_edu->>'institution') = '' THEN CONTINUE; END IF;
    INSERT INTO public.education_records (member_id, institution, degree_level, field_of_study, city, country, start_year, graduation_year)
    VALUES (
      p_member_id,
      trim(v_edu->>'institution'),
      v_edu->>'degree_level',
      v_edu->>'field_of_study',
      v_edu->>'city',
      v_edu->>'country',
      NULLIF(v_edu->>'start_year','')::int,
      NULLIF(v_edu->>'graduation_year','')::int
    )
    ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    IF v_n > 0 THEN v_inserted_edu := v_inserted_edu + 1; ELSE v_skipped_dup := v_skipped_dup + 1; END IF;
  END LOOP;

  FOR v_lang IN SELECT * FROM jsonb_array_elements(COALESCE(p_accept->'languages', '[]'::jsonb)) LOOP
    IF (v_lang->>'language') IS NULL OR trim(v_lang->>'language') = '' THEN CONTINUE; END IF;
    IF (v_lang->>'proficiency') IS NULL OR trim(v_lang->>'proficiency') = '' THEN CONTINUE; END IF;
    INSERT INTO public.member_languages (member_id, language, proficiency)
    VALUES (p_member_id, trim(v_lang->>'language'), trim(v_lang->>'proficiency'))
    ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    IF v_n > 0 THEN v_inserted_lang := v_inserted_lang + 1; ELSE v_skipped_dup := v_skipped_dup + 1; END IF;
  END LOOP;

  FOR v_sec IN SELECT * FROM jsonb_array_elements(COALESCE(p_accept->'sectors', '[]'::jsonb)) LOOP
    IF (v_sec->>'sector') IS NULL OR trim(v_sec->>'sector') = '' THEN CONTINUE; END IF;
    INSERT INTO public.member_sectors (member_id, sector, rank)
    VALUES (p_member_id, trim(v_sec->>'sector'), COALESCE((v_sec->>'rank')::int, 1))
    ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    IF v_n > 0 THEN v_inserted_sec := v_inserted_sec + 1; ELSE v_skipped_dup := v_skipped_dup + 1; END IF;
  END LOOP;

  UPDATE public.members SET
    cv_parsed_data = p_new_cv_parsed_data,
    cv_parsed_at = now(),
    cv_parsed_pending = NULL,
    updated_at = now()
  WHERE id = p_member_id;

  UPDATE public.cv_parse_history
    SET applied_at = now(), applied_by_user = true
    WHERE member_id = p_member_id AND applied_at IS NULL;

  RETURN jsonb_build_object(
    'inserted_experiences', v_inserted_exp,
    'inserted_education', v_inserted_edu,
    'inserted_languages', v_inserted_lang,
    'inserted_sectors', v_inserted_sec,
    'skipped_duplicates', v_skipped_dup
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_cv_merge(uuid, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_cv_merge(uuid, jsonb, jsonb) TO service_role;
