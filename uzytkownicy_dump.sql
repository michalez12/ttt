--
-- PostgreSQL database dump
--

\restrict 1PTdGbGdGuNzq1EvBdsdMwnlXjHhc2qWBntug4IwtJAWrcxx5DXTYdmKikJYntY

-- Dumped from database version 15.16
-- Dumped by pg_dump version 15.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: uzytkownicy; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.uzytkownicy (id, username, email, hashed_password, api_token, firma_nazwa, firma_nip, firma_rachunek, ksef_token, is_active, last_login, created_at, updated_at) FROM stdin;
1	admin	admin@ksef.local	$2b$12$OOe7W1846MDy1uVxf0EdteC4Jc.TZS3TyOVPL17UNEIYDvnS7mXfa	802a18fa5bc0c8e0f931ccdc7f3ab210202db15c0e0834293aef4256e301eb09	Lowkis Lozowski	8522588404	PL38124039271111001039604171	20260202-EC-32FB682000-C3EE129F66-A9|nip-8522588404|a0931327c97a41e4a003948b42dcbef6cb95e3588ec6488cafa9cdd642dd38f6	t	2026-02-26 10:42:06.619307+00	2026-02-18 19:50:01.758644+00	2026-02-26 10:42:06.619446+00
\.


--
-- Name: uzytkownicy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.uzytkownicy_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 1PTdGbGdGuNzq1EvBdsdMwnlXjHhc2qWBntug4IwtJAWrcxx5DXTYdmKikJYntY

