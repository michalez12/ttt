--
-- PostgreSQL database dump
--

\restrict Z3NRT2JY5yKPJhfeabJlHC72WYJRMahpUfUhDECJqZmanemhVmdgIrMa1vj10B6

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: eksport_bank; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.eksport_bank (
    id integer NOT NULL,
    nazwa_pliku character varying NOT NULL,
    data_utworzenia timestamp without time zone,
    liczba_faktur integer,
    suma_kwot double precision,
    xml_content text,
    status character varying
);


ALTER TABLE public.eksport_bank OWNER TO ksef_user;

--
-- Name: eksport_bank_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.eksport_bank_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.eksport_bank_id_seq OWNER TO ksef_user;

--
-- Name: eksport_bank_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.eksport_bank_id_seq OWNED BY public.eksport_bank.id;


--
-- Name: eksport_faktury; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.eksport_faktury (
    id integer NOT NULL,
    eksport_id integer,
    faktura_id integer
);


ALTER TABLE public.eksport_faktury OWNER TO ksef_user;

--
-- Name: eksport_faktury_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.eksport_faktury_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.eksport_faktury_id_seq OWNER TO ksef_user;

--
-- Name: eksport_faktury_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.eksport_faktury_id_seq OWNED BY public.eksport_faktury.id;


--
-- Name: eksporty; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.eksporty (
    id integer NOT NULL,
    data_eksportu timestamp without time zone,
    nazwa_pliku character varying(255) NOT NULL,
    format character varying(20),
    liczba_faktur integer,
    laczna_kwota double precision,
    status character varying(20),
    plik_xml text,
    sciezka_pliku character varying(500),
    created_at timestamp without time zone
);


ALTER TABLE public.eksporty OWNER TO ksef_user;

--
-- Name: eksporty_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.eksporty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.eksporty_id_seq OWNER TO ksef_user;

--
-- Name: eksporty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.eksporty_id_seq OWNED BY public.eksporty.id;


--
-- Name: faktury; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.faktury (
    id integer NOT NULL,
    numer_ksef character varying NOT NULL,
    numer_faktury character varying NOT NULL,
    kontrahent_id integer NOT NULL,
    rachunek_id integer,
    data_wystawienia date NOT NULL,
    termin_platnosci date,
    kwota_netto double precision NOT NULL,
    kwota_vat double precision NOT NULL,
    kwota_brutto double precision NOT NULL,
    waluta character varying(3),
    forma_platnosci character varying NOT NULL,
    opis_platnosci character varying,
    status character varying,
    czy_do_eksportu boolean,
    kolor character varying,
    xml_ksef text,
    data_pobrania timestamp without time zone,
    rodzaj_faktury character varying(20) DEFAULT 'VAT'::character varying,
    numer_fa_oryginalnej character varying(100),
    czy_korekta boolean DEFAULT false,
    faktura_oryginalna_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.faktury OWNER TO ksef_user;

--
-- Name: faktury_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.faktury_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.faktury_id_seq OWNER TO ksef_user;

--
-- Name: faktury_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.faktury_id_seq OWNED BY public.faktury.id;


--
-- Name: kontrahenci; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.kontrahenci (
    id integer NOT NULL,
    nip character varying(10) NOT NULL,
    nazwa character varying NOT NULL,
    adres character varying,
    email character varying,
    telefon character varying,
    created_at timestamp without time zone
);


ALTER TABLE public.kontrahenci OWNER TO ksef_user;

--
-- Name: kontrahenci_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.kontrahenci_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.kontrahenci_id_seq OWNER TO ksef_user;

--
-- Name: kontrahenci_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.kontrahenci_id_seq OWNED BY public.kontrahenci.id;


--
-- Name: ksef_sessions; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.ksef_sessions (
    id integer NOT NULL,
    session_token character varying(500),
    nip character varying(20) NOT NULL,
    data_utworzenia timestamp without time zone,
    data_wygasniecia timestamp without time zone,
    is_active boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.ksef_sessions OWNER TO ksef_user;

--
-- Name: ksef_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.ksef_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ksef_sessions_id_seq OWNER TO ksef_user;

--
-- Name: ksef_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.ksef_sessions_id_seq OWNED BY public.ksef_sessions.id;


--
-- Name: pozycje_faktury; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.pozycje_faktury (
    id integer NOT NULL,
    faktura_id integer NOT NULL,
    numer_pozycji integer,
    nazwa character varying(500) NOT NULL,
    ilosc double precision,
    jednostka character varying(20),
    cena_netto double precision,
    wartosc_netto double precision,
    stawka_vat character varying(10),
    kwota_vat double precision,
    wartosc_brutto double precision
);


ALTER TABLE public.pozycje_faktury OWNER TO ksef_user;

--
-- Name: pozycje_faktury_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.pozycje_faktury_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pozycje_faktury_id_seq OWNER TO ksef_user;

--
-- Name: pozycje_faktury_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.pozycje_faktury_id_seq OWNED BY public.pozycje_faktury.id;


--
-- Name: rachunki_bankowe; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.rachunki_bankowe (
    id integer NOT NULL,
    kontrahent_id integer NOT NULL,
    numer_rachunku character varying(26) NOT NULL,
    iban character varying(28),
    nazwa_banku character varying,
    status_biala_lista character varying,
    data_weryfikacji timestamp without time zone,
    created_at timestamp without time zone,
    swift character varying(11),
    ignore_biala_lista boolean DEFAULT false NOT NULL
);


ALTER TABLE public.rachunki_bankowe OWNER TO ksef_user;

--
-- Name: rachunki_bankowe_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.rachunki_bankowe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rachunki_bankowe_id_seq OWNER TO ksef_user;

--
-- Name: rachunki_bankowe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.rachunki_bankowe_id_seq OWNED BY public.rachunki_bankowe.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    is_active boolean,
    is_admin boolean,
    created_at timestamp without time zone,
    api_token character varying(255),
    firma_nazwa character varying(255),
    firma_nip character varying(20),
    firma_rachunek character varying(34)
);


ALTER TABLE public.users OWNER TO ksef_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO ksef_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: uzytkownicy; Type: TABLE; Schema: public; Owner: ksef_user
--

CREATE TABLE public.uzytkownicy (
    id integer NOT NULL,
    email character varying NOT NULL,
    api_token character varying NOT NULL,
    firma_nazwa character varying NOT NULL,
    firma_nip character varying(10) NOT NULL,
    ksef_token character varying,
    is_active boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.uzytkownicy OWNER TO ksef_user;

--
-- Name: uzytkownicy_id_seq; Type: SEQUENCE; Schema: public; Owner: ksef_user
--

CREATE SEQUENCE public.uzytkownicy_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.uzytkownicy_id_seq OWNER TO ksef_user;

--
-- Name: uzytkownicy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ksef_user
--

ALTER SEQUENCE public.uzytkownicy_id_seq OWNED BY public.uzytkownicy.id;


--
-- Name: eksport_bank id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.eksport_bank ALTER COLUMN id SET DEFAULT nextval('public.eksport_bank_id_seq'::regclass);


--
-- Name: eksport_faktury id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.eksport_faktury ALTER COLUMN id SET DEFAULT nextval('public.eksport_faktury_id_seq'::regclass);


--
-- Name: eksporty id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.eksporty ALTER COLUMN id SET DEFAULT nextval('public.eksporty_id_seq'::regclass);


--
-- Name: faktury id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.faktury ALTER COLUMN id SET DEFAULT nextval('public.faktury_id_seq'::regclass);


--
-- Name: kontrahenci id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.kontrahenci ALTER COLUMN id SET DEFAULT nextval('public.kontrahenci_id_seq'::regclass);


--
-- Name: ksef_sessions id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.ksef_sessions ALTER COLUMN id SET DEFAULT nextval('public.ksef_sessions_id_seq'::regclass);


--
-- Name: pozycje_faktury id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.pozycje_faktury ALTER COLUMN id SET DEFAULT nextval('public.pozycje_faktury_id_seq'::regclass);


--
-- Name: rachunki_bankowe id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.rachunki_bankowe ALTER COLUMN id SET DEFAULT nextval('public.rachunki_bankowe_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: uzytkownicy id; Type: DEFAULT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.uzytkownicy ALTER COLUMN id SET DEFAULT nextval('public.uzytkownicy_id_seq'::regclass);


--
-- Data for Name: eksport_bank; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.eksport_bank (id, nazwa_pliku, data_utworzenia, liczba_faktur, suma_kwot, xml_content, status) FROM stdin;
\.


--
-- Data for Name: eksport_faktury; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.eksport_faktury (id, eksport_id, faktura_id) FROM stdin;
\.


--
-- Data for Name: eksporty; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.eksporty (id, data_eksportu, nazwa_pliku, format, liczba_faktur, laczna_kwota, status, plik_xml, sciezka_pliku, created_at) FROM stdin;
1	2026-02-17 20:13:19.770172	przelew_20260217_201319.xml	XML	2	3704.17	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09" xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260217201319</MsgId>\n      <CreDtTm>2026-02-17T20:13:19</CreDtTm>\n      <NbOfTxs>2</NbOfTxs>\n      <CtrlSum>3704.17</CtrlSum>\n      <InitgPty>\n        <Nm>admin</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260217201319</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>2</NbOfTxs>\n      <CtrlSum>3704.17</CtrlSum>\n      <PmtTpInf/>\n      <ReqdExctnDt>2026-03-03</ReqdExctnDt>\n      <Dbtr>\n        <Nm>admin</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL38124039271111001039604171</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006238BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">2866.08</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006238BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0002</InstrId>\n          <EndToEndId>FV 2462/S12/2026</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">838.09</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>"INTER - TEAM" SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL94237000080004750320843081</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FV 2462/S12/2026</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-17 20:13:19.771221
2	2026-02-18 11:07:01.138454	przelew_20260218_110701.xml	XML	1	2866.08	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218110701</MsgId>\n      <CreDtTm>2026-02-18T11:07:01</CreDtTm>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>2866.08</CtrlSum>\n      <InitgPty>\n        <Nm>admin</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218110701</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>2866.08</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-15</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>admin</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL38124039271111001039604171</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006238BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">2866.08</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006238BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 11:07:01.139562
3	2026-02-18 11:07:08.962769	przelew_20260218_110708.xml	XML	1	838.09	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218110708</MsgId>\n      <CreDtTm>2026-02-18T11:07:08</CreDtTm>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>838.09</CtrlSum>\n      <InitgPty>\n        <Nm>admin</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218110708</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>838.09</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-03</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>admin</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL38124039271111001039604171</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FV 2462/S12/2026</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">838.09</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>"INTER - TEAM" SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL94237000080004750320843081</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FV 2462/S12/2026</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 11:07:08.963046
4	2026-02-18 11:07:16.873731	przelew_20260218_110716.xml	XML	2	3704.17	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218110716</MsgId>\n      <CreDtTm>2026-02-18T11:07:16</CreDtTm>\n      <NbOfTxs>2</NbOfTxs>\n      <CtrlSum>3704.17</CtrlSum>\n      <InitgPty>\n        <Nm>admin</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218110716</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>2</NbOfTxs>\n      <CtrlSum>3704.17</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-03</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>admin</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL38124039271111001039604171</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006238BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">2866.08</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006238BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0002</InstrId>\n          <EndToEndId>FV 2462/S12/2026</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">838.09</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>"INTER - TEAM" SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL94237000080004750320843081</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FV 2462/S12/2026</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 11:07:16.873944
5	2026-02-18 11:07:41.393268	przelew_20260218_110741.xml	XML	2	3704.17	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218110741</MsgId>\n      <CreDtTm>2026-02-18T11:07:41</CreDtTm>\n      <NbOfTxs>2</NbOfTxs>\n      <CtrlSum>3704.17</CtrlSum>\n      <InitgPty>\n        <Nm>admin</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218110741</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>2</NbOfTxs>\n      <CtrlSum>3704.17</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-03</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>admin</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL38124039271111001039604171</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006238BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">2866.08</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006238BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0002</InstrId>\n          <EndToEndId>FV 2462/S12/2026</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">838.09</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>"INTER - TEAM" SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL94237000080004750320843081</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FV 2462/S12/2026</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 11:07:41.393513
6	2026-02-18 11:48:11.817834	przelew_20260218_114811.xml	XML	1	2866.08	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218114811</MsgId>\n      <CreDtTm>2026-02-18T11:48:11</CreDtTm>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>2866.08</CtrlSum>\n      <InitgPty>\n        <Nm>admin</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218114811</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>2866.08</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-15</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>admin</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL38124039271111001039604171</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006238BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">2866.08</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006238BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 11:48:11.819101
7	2026-02-18 12:12:48.006514	przelew_20260218_121248.xml	XML	1	2866.08	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218121248</MsgId>\n      <CreDtTm>2026-02-18T12:12:48</CreDtTm>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>2866.08</CtrlSum>\n      <InitgPty>\n        <Nm>admin</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218121248</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>2866.08</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-15</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>admin</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL38124039271111001039604171</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006238BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">2866.08</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006238BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 12:12:48.006796
9	2026-02-18 14:08:11.843469	przelew_20260218140811.xml	XML	1	214.82	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218140811</MsgId>\n      <CreDtTm>2026-02-18T14:08:11</CreDtTm>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>214.82</CtrlSum>\n      <InitgPty>\n        <Nm>AUTO SERWIS KOWALSKI</Nm>\n        <Id>\n          <OrgId>\n            <Othr>\n              <Id>5260151365</Id>\n            </Othr>\n          </OrgId>\n        </Id>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218140811</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>214.82</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-16</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>AUTO SERWIS KOWALSKI</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL61109010140000071219812874</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006872BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">214.82</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006872BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 14:08:11.844479
10	2026-02-18 14:25:44.825616	przelew_20260218142544.xml	XML	1	214.82	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218142544</MsgId>\n      <CreDtTm>2026-02-18T142544</CreDtTm>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>214.82</CtrlSum>\n      <InitgPty>\n        <Nm>AUTO SERWIS KOWALSKI</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218142544</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>214.82</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-16</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>AUTO SERWIS KOWALSKI</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL61109010140000071219812874</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006872BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">214.82</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006872BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 14:25:44.82693
11	2026-02-18 14:29:17.161837	przelew_20260218142917.xml	XML	1	214.82	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218142917</MsgId>\n      <CreDtTm>2026-02-18T142917</CreDtTm>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>214.82</CtrlSum>\n      <InitgPty>\n        <Nm>admin</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218142917</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>214.82</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-16</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>admin</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL61109010140000071219812874</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006872BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">214.82</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006872BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 14:29:17.162927
12	2026-02-18 14:35:38.712795	przelew_20260218143538.xml	XML	1	214.82	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218143538</MsgId>\n      <CreDtTm>2026-02-18T143538</CreDtTm>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>214.82</CtrlSum>\n      <InitgPty>\n        <Nm>admin</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218143538</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>1</NbOfTxs>\n      <CtrlSum>214.82</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-16</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>admin</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL38124039271111001039604171</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006872BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">214.82</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006872BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 14:35:38.713807
13	2026-02-18 16:59:30.085789	przelew_20260218165930.xml	XML	4	4466.51	WYGENEROWANY	<?xml version='1.0' encoding='UTF-8'?>\n<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">\n  <CstmrCdtTrfInitn>\n    <GrpHdr>\n      <MsgId>MSG20260218165930</MsgId>\n      <CreDtTm>2026-02-18T165930</CreDtTm>\n      <NbOfTxs>4</NbOfTxs>\n      <CtrlSum>4466.51</CtrlSum>\n      <InitgPty>\n        <Nm>Lowkis-Lozowski</Nm>\n      </InitgPty>\n    </GrpHdr>\n    <PmtInf>\n      <PmtInfId>PMT20260218165930</PmtInfId>\n      <PmtMtd>TRF</PmtMtd>\n      <BtchBookg>true</BtchBookg>\n      <NbOfTxs>4</NbOfTxs>\n      <CtrlSum>4466.51</CtrlSum>\n      <PmtTpInf>\n        <SvcLvl>\n          <Cd>TRF</Cd>\n        </SvcLvl>\n      </PmtTpInf>\n      <ReqdExctnDt>\n        <Dt>2026-03-03</Dt>\n      </ReqdExctnDt>\n      <Dbtr>\n        <Nm>Lowkis-Lozowski</Nm>\n      </Dbtr>\n      <DbtrAcct>\n        <Id>\n          <IBAN>PL38124039271111001039604171</IBAN>\n        </Id>\n      </DbtrAcct>\n      <DbtrAgt>\n        <FinInstnId/>\n      </DbtrAgt>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0001</InstrId>\n          <EndToEndId>FA006238BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">2866.08</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006238BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0002</InstrId>\n          <EndToEndId>FV 2462/S12/2026</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">838.09</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>'INTER - TEAM' SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL94237000080004750320843081</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FV 2462/S12/2026</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0003</InstrId>\n          <EndToEndId>FA006907BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">547.52</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006907BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n      <CdtTrfTxInf>\n        <PmtId>\n          <InstrId>TXN0004</InstrId>\n          <EndToEndId>FA006872BG</EndToEndId>\n        </PmtId>\n        <Amt>\n          <InstdAmt Ccy="PLN">214.82</InstdAmt>\n        </Amt>\n        <Cdtr>\n          <Nm>Stellantis Polska Sp. z o.o.</Nm>\n        </Cdtr>\n        <CdtrAcct>\n          <Id>\n            <IBAN>PL17160014620008078176003156</IBAN>\n          </Id>\n        </CdtrAcct>\n        <RmtInf>\n          <Ustrd>Faktura FA006872BG</Ustrd>\n        </RmtInf>\n      </CdtTrfTxInf>\n    </PmtInf>\n  </CstmrCdtTrfInitn>\n</Document>\n	\N	2026-02-18 16:59:30.087481
\.


--
-- Data for Name: faktury; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.faktury (id, numer_ksef, numer_faktury, kontrahent_id, rachunek_id, data_wystawienia, termin_platnosci, kwota_netto, kwota_vat, kwota_brutto, waluta, forma_platnosci, opis_platnosci, status, czy_do_eksportu, kolor, xml_ksef, data_pobrania, rodzaj_faktury, numer_fa_oryginalnej, czy_korekta, faktura_oryginalna_id, created_at, updated_at) FROM stdin;
1	MANUAL-1771357457	FK001269BG	3	1	2026-02-12	2026-03-10	-180.41	-41.49	-221.9	PLN	6	\N	NOWA	f	blue	<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Faktura xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/"><Naglowek><KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza><WariantFormularza>3</WariantFormularza><DataWytworzeniaFa>2026-02-12T10:26:06.840Z</DataWytworzeniaFa><SystemInfo>Aplikacja LDC - Stellantis</SystemInfo></Naglowek><Podmiot1><DaneIdentyfikacyjne><NIP>5260151365</NIP><Nazwa>Stellantis Polska Sp. z o.o.</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Al. Krakowska 206 02-219 Warszawa</AdresL1></Adres><DaneKontaktowe><Email>czesci@distrigo.com.pl</Email><Telefon>22 500-94-72</Telefon></DaneKontaktowe></Podmiot1><Podmiot2><DaneIdentyfikacyjne><NIP>8522588404</NIP><Nazwa>ŁOWKIS-ŁOZOWSKI SP.J</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85 71-220 SZCZECIN</AdresL1></Adres><DaneKontaktowe><Email>czesci@citroenszczecin.pl</Email></DaneKontaktowe><NrKlienta>5LC033P</NrKlienta><JST>2</JST><GV>2</GV></Podmiot2><Podmiot3><DaneIdentyfikacyjne><BrakID>1</BrakID></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85 71-220 SZCZECIN</AdresL1></Adres><DaneKontaktowe><Email>serwis@citroenszczecin.pl</Email></DaneKontaktowe><Rola>2</Rola><NrKlienta>5LC033P01</NrKlienta></Podmiot3><Podmiot3><DaneIdentyfikacyjne><NIP>9661767430</NIP><Nazwa>BNP Paribas Faktoring Sp. z o. o.</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>ul. M. Kasprzaka 2 01-211 Warszawa</AdresL1></Adres><Rola>1</Rola></Podmiot3><Fa><KodWaluty>PLN</KodWaluty><P_1>2026-02-12</P_1><P_2>FK001269BG</P_2><P_6>2026-02-03</P_6><P_13_1>-180.41</P_13_1><P_14_1>-41.49</P_14_1><P_15>-221.90</P_15><Adnotacje><P_16>2</P_16><P_17>2</P_17><P_18>2</P_18><P_18A>2</P_18A><Zwolnienie><P_19N>1</P_19N></Zwolnienie><NoweSrodkiTransportu><P_22N>1</P_22N></NoweSrodkiTransportu><P_23>2</P_23><PMarzy><P_PMarzyN>1</P_PMarzyN></PMarzy></Adnotacje><RodzajFaktury>KOR</RodzajFaktury><PrzyczynaKorekty>RK/451/02/2026</PrzyczynaKorekty><DaneFaKorygowanej><DataWystFaKorygowanej>2026-02-03</DataWystFaKorygowanej><NrFaKorygowanej>FA000867BG</NrFaKorygowanej><NrKSeF>1</NrKSeF><NrKSeFFaKorygowanej>5260151365-20260204-0300C0190A04-AF</NrKSeFFaKorygowanej></DaneFaKorygowanej><DodatkowyOpis><NrWiersza>2</NrWiersza><Klucz>Nr Zamówienia</Klucz><Wartosc>ZAM/538/02/2026; 1JGF08TJS/jarecki; 15%</Wartosc></DodatkowyOpis><FaWiersz><NrWierszaFa>2</NrWierszaFa><P_7>CZUJNIK CISNIENIA</P_7><Indeks>12694431</Indeks><CN>90262020</CN><P_8A>Szt.</P_8A><P_8B>1</P_8B><P_9A>212.25</P_9A><P_10>31.84</P_10><P_11>180.41</P_11><P_12>23</P_12><StanPrzed>1</StanPrzed></FaWiersz><FaWiersz><NrWierszaFa>2</NrWierszaFa><P_7>CZUJNIK CISNIENIA</P_7><Indeks>12694431</Indeks><CN>90262020</CN><P_8A>Szt.</P_8A><P_8B>0</P_8B><P_9A>212.25</P_9A><P_10>31.84</P_10><P_11>0.00</P_11><P_12>23</P_12></FaWiersz><Platnosc><TerminPlatnosci><Termin>2026-03-10</Termin></TerminPlatnosci><FormaPlatnosci>6</FormaPlatnosci><RachunekBankowyFaktora><NrRB>17160014620008078176003156</NrRB><NazwaBanku>BNP Paribas Faktoring Sp. z o. o.</NazwaBanku></RachunekBankowyFaktora></Platnosc></Fa><Stopka><Informacje><StopkaFaktury>* Wierzytelności, które wynikają z tej Faktury, przelaliśmy na rzecz BNP Paribas Faktoring Sp. z o. o. Oznacza to, że masz obowiązek wykonywać płatności na niżej wskazany rachunek – ze skutkiem zwolnienia z długu. Numer Rachunku dla waluty PLN nr PL 17 1600 1462 0008 0781 7600 3156</StopkaFaktury></Informacje><Rejestry><KRS>0000019125</KRS><REGON>012077140</REGON><BDO>000024936</BDO></Rejestry></Stopka></Faktura>	2026-02-17 19:44:17.29833	KOR	\N	t	\N	2026-02-17 19:44:17.298333	2026-02-17 19:44:17.298333
2	MANUAL-1771357462	36451/CE/26/KOR	10	6	2026-02-13	2026-03-06	-542.35	-124.74	-667.09	PLN	6	\N	NOWA	f	blue	<?xml version="1.0" encoding="UTF-8"?>\n<Faktura xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/" xmlns:etd="http://crd.gov.pl/xml/schematy/dziedzinowe/mf/2022/01/05/eD/DefinicjeTypy/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Naglowek><KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza><WariantFormularza>3</WariantFormularza><DataWytworzeniaFa>2026-02-13T12:34:40.000+01:00</DataWytworzeniaFa><SystemInfo>cairo.ERP Falcon5</SystemInfo></Naglowek><Podmiot1><DaneIdentyfikacyjne><NIP>5842731959</NIP><Nazwa>Auto-Partner Gdańsk Spółka z ograniczoną odpowiedzialnością</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Magazynowa 7</AdresL1><AdresL2>80-180 Kowale</AdresL2></Adres></Podmiot1><Podmiot2><DaneIdentyfikacyjne><NIP>8522588404</NIP><Nazwa>ŁOWKIS-ŁOZOWSKI SPÓŁKA JAWNA</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>MODRA 85</AdresL1><AdresL2>71-220 SZCZECIN</AdresL2></Adres><DaneKontaktowe><Email>czesci@citroenszczecin.pl</Email></DaneKontaktowe><NrKlienta>5982</NrKlienta><JST>2</JST><GV>2</GV></Podmiot2><Fa><KodWaluty>PLN</KodWaluty><P_1>2026-02-13</P_1><P_2>36451/CE/26/KOR</P_2><P_6>2026-02-13</P_6><P_13_1>-542.35</P_13_1><P_14_1>-124.74</P_14_1><P_15>-667.09</P_15><Adnotacje><P_16>2</P_16><P_17>2</P_17><P_18>2</P_18><P_18A>2</P_18A><Zwolnienie><P_19N>1</P_19N></Zwolnienie><NoweSrodkiTransportu><P_22N>1</P_22N></NoweSrodkiTransportu><P_23>2</P_23><PMarzy><P_PMarzyN>1</P_PMarzyN></PMarzy></Adnotacje><RodzajFaktury>KOR</RodzajFaktury><PrzyczynaKorekty>ZWROT TOWARU</PrzyczynaKorekty><TypKorekty>3</TypKorekty><DaneFaKorygowanej><DataWystFaKorygowanej>2026-02-02</DataWystFaKorygowanej><NrFaKorygowanej>52134/CE/2026</NrFaKorygowanej><NrKSeF>1</NrKSeF><NrKSeFFaKorygowanej>5842731959-20260202-0800C0AED38C-90</NrKSeFFaKorygowanej></DaneFaKorygowanej><DaneFaKorygowanej><DataWystFaKorygowanej>2026-02-06</DataWystFaKorygowanej><NrFaKorygowanej>60977/CE/2026</NrFaKorygowanej><NrKSeF>1</NrKSeF><NrKSeFFaKorygowanej>5842731959-20260206-0C0020CBF685-5B</NrKSeFFaKorygowanej></DaneFaKorygowanej><DodatkowyOpis><Klucz>komentarz</Klucz><Wartosc>ZWROT TOWARU</Wartosc></DodatkowyOpis><FaWiersz><NrWierszaFa>1</NrWierszaFa><UU_ID>4MA26Y</UU_ID><P_7>FILTR KABINOWY TOYOTA YARIS 99-05 (FRANCJA), LAND CRUISER J12, LEXUS RX 03-</P_7><Indeks>M110455K DKM</Indeks><P_8A>SZT</P_8A><P_8B>0</P_8B><P_9A>0</P_9A><P_11>0</P_11><P_12>0 KR</P_12><StanPrzed>1</StanPrzed></FaWiersz><FaWiersz><NrWierszaFa>1</NrWierszaFa><UU_ID>4MA26Y</UU_ID><P_7>FILTR KABINOWY TOYOTA YARIS 99-05 (FRANCJA), LAND CRUISER J12, LEXUS RX 03-</P_7><Indeks>M110455K DKM</Indeks><P_8A>SZT</P_8A><P_8B>1</P_8B><P_9A>14.26</P_9A><P_11>14.26</P_11><P_12>23</P_12></FaWiersz><FaWiersz><NrWierszaFa>3</NrWierszaFa><UU_ID>4MA2EX</UU_ID><P_7>ŁOŻYSKO KOŁA KPL. WITH WHEEL HUB AND ABS SENSOR RING</P_7><Indeks>174440 FEBI</Indeks><P_8A>SZT</P_8A><P_8B>0</P_8B><P_9A>0</P_9A><P_11>0</P_11><P_12>0 KR</P_12><StanPrzed>1</StanPrzed></FaWiersz><FaWiersz><NrWierszaFa>3</NrWierszaFa><UU_ID>4MA2EX</UU_ID><P_7>ŁOŻYSKO KOŁA KPL. WITH WHEEL HUB AND ABS SENSOR RING</P_7><Indeks>174440 FEBI</Indeks><P_8A>SZT</P_8A><P_8B>1</P_8B><P_9A>276.36</P_9A><P_11>276.36</P_11><P_12>23</P_12></FaWiersz><FaWiersz><NrWierszaFa>5</NrWierszaFa><UU_ID>4MA2GC</UU_ID><P_7>ZESTAW SZCZĘK HAM.+ CYLINDERKI + SPRĘŻ. TOYOTA YARIS (_CP10)</P_7><Indeks>GSK1910 TRW</Indeks><P_8A>SZT</P_8A><P_8B>0</P_8B><P_9A>0</P_9A><P_11>0</P_11><P_12>0 KR</P_12><StanPrzed>1</StanPrzed></FaWiersz><FaWiersz><NrWierszaFa>5</NrWierszaFa><UU_ID>4MA2GC</UU_ID><P_7>ZESTAW SZCZĘK HAM.+ CYLINDERKI + SPRĘŻ. TOYOTA YARIS (_CP10)</P_7><Indeks>GSK1910 TRW</Indeks><P_8A>SZT</P_8A><P_8B>1</P_8B><P_9A>251.73</P_9A><P_11>251.73</P_11><P_12>23</P_12></FaWiersz><Platnosc><TerminPlatnosci><Termin>2026-03-06</Termin></TerminPlatnosci><FormaPlatnosci>6</FormaPlatnosci><RachunekBankowy><NrRB>77203000451110000002820740</NrRB><RachunekWlasnyBanku>2</RachunekWlasnyBanku><NazwaBanku>BNP PARIBAS Bank Polska SA PLN</NazwaBanku></RachunekBankowy></Platnosc></Fa></Faktura>\n	2026-02-17 19:44:22.808403	KOR	\N	t	\N	2026-02-17 19:44:22.808405	2026-02-17 19:44:22.808407
3	MANUAL-1771357465	00003415/SZC/26/FK	7	5	2026-02-17	2026-03-10	-20.13	-4.63	-24.76	PLN	6	\N	NOWA	f	blue	<Faktura xmlns:etd="http://crd.gov.pl/xml/schematy/dziedzinowe/mf/2022/01/05/eD/DefinicjeTypy/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/"><Naglowek><KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza><WariantFormularza>3</WariantFormularza><DataWytworzeniaFa>2026-02-17T14:08:05</DataWytworzeniaFa><SystemInfo>EBS R12</SystemInfo></Naglowek><Podmiot1><PrefiksPodatnika>PL</PrefiksPodatnika><NrEORI>PL118145294600000</NrEORI><DaneIdentyfikacyjne><NIP>1181452946</NIP><Nazwa>Inter Cars Spółka Akcyjna</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>05-180 Swobodnia, Swobodnia 35</AdresL1></Adres><AdresKoresp><KodKraju>PL</KodKraju><AdresL1>70-340 Szczecin, Bohaterów Warszawy 37 i 37E</AdresL1></AdresKoresp></Podmiot1><Podmiot2><DaneIdentyfikacyjne><NIP>8522588404</NIP><Nazwa>ŁOWKIS ŁOZOWSKI SPÓŁKA JAWNA</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>71-220 Szczecin, Modra 85</AdresL1></Adres><NrKlienta>442111</NrKlienta><JST>2</JST><GV>2</GV></Podmiot2><Fa><KodWaluty>PLN</KodWaluty><P_1>2026-02-17</P_1><P_1M>Szczecin</P_1M><P_2>00003415/SZC/26/FK</P_2><WZ>00005395/SZC1/2026/ZW, </WZ><P_13_1>-20.13</P_13_1><P_14_1>-4.63</P_14_1><P_15>-24.76</P_15><Adnotacje><P_16>2</P_16><P_17>2</P_17><P_18>2</P_18><P_18A>2</P_18A><Zwolnienie><P_19N>1</P_19N></Zwolnienie><NoweSrodkiTransportu><P_22N>1</P_22N></NoweSrodkiTransportu><P_23>2</P_23><PMarzy><P_PMarzyN>1</P_PMarzyN></PMarzy></Adnotacje><RodzajFaktury>KOR</RodzajFaktury><PrzyczynaKorekty>REZYGNACJA KLIENTA</PrzyczynaKorekty><DaneFaKorygowanej><DataWystFaKorygowanej>2026-02-13</DataWystFaKorygowanej><NrFaKorygowanej>00007636/SZC/26/F</NrFaKorygowanej><NrKSeF>1</NrKSeF><NrKSeFFaKorygowanej>1181452946-20260213-2E00A0D48047-6E</NrKSeFFaKorygowanej></DaneFaKorygowanej><DodatkowyOpis><Klucz>LOKALIZACJA</Klucz><Wartosc>SZC</Wartosc></DodatkowyOpis><DodatkowyOpis><Klucz>KOMENTARZ</Klucz><Wartosc>dotyczy dokumentu sprzedaży 00007636/SZC/26/F z dnia 2026.02.13</Wartosc></DodatkowyOpis><DodatkowyOpis><Klucz>Data zwrotu towaru</Klucz><Wartosc>2026.02.17</Wartosc></DodatkowyOpis><FaWiersz><NrWierszaFa>1</NrWierszaFa><UU_ID>1366280838</UU_ID><P_7>Uszczelka pompy paliwa</P_7><Indeks>5232271</Indeks><CN>40169300</CN><P_8A>Sztuka</P_8A><P_8B>1</P_8B><P_9A>20.13</P_9A><P_11>20.13</P_11><P_12>23</P_12><StanPrzed>1</StanPrzed></FaWiersz><FaWiersz><NrWierszaFa>2</NrWierszaFa><UU_ID>1366280839</UU_ID><P_7>Uszczelka pompy paliwa</P_7><Indeks>5232271</Indeks><CN>40169300</CN><P_8A>Sztuka</P_8A><P_8B>0</P_8B><P_9A>20.13</P_9A><P_11>0.00</P_11><P_12>23</P_12></FaWiersz><Rozliczenie><DoZaplaty>-24.76</DoZaplaty></Rozliczenie><Platnosc><TerminPlatnosci><Termin>2026-03-10</Termin><TerminOpis><Ilosc>21</Ilosc><Jednostka>dni</Jednostka><ZdarzeniePoczatkowe>od daty wystawienia</ZdarzeniePoczatkowe></TerminOpis></TerminPlatnosci><FormaPlatnosci>6</FormaPlatnosci><RachunekBankowy><NrRB>08103019999000720000442111</NrRB></RachunekBankowy></Platnosc></Fa><Stopka><Informacje><StopkaFaktury>Szanowny Kliencie, Faktura stanowi jednocześnie potwierdzenie odbioru towaru. Jeżeli chcesz wiedzieć kiedy możesz zwrócić zakupiony u nas towar oraz jak możesz go zareklamować, a dokonywałeś zakupów przez Internet, zapoznaj się z treścią regulaminu sklepu internetowego, w którym dokonywałeś zakupu. Jeżeli kupiłeś towar w jednej z naszych Filii, zapoznaj się z informacjami o zasadach zwrotów i reklamacji, które opublikowaliśmy na naszej stronie https://intercars.com.pl/pl/OWS/obowiazujace-ows</StopkaFaktury></Informacje><Rejestry><KRS>0000008734</KRS><REGON>014992887</REGON><BDO>000012313</BDO></Rejestry></Stopka></Faktura>	2026-02-17 19:44:25.465382	KOR	\N	t	\N	2026-02-17 19:44:25.465385	2026-02-17 19:44:25.465386
4	MANUAL-1771357468	FVS-000027982	8	\N	2026-02-03	2026-02-03	0	0	1175	PLN	1	\N	NOWA	f	green	<?xml version="1.0" encoding="utf-8"?><Faktura xmlns:etd="http://crd.gov.pl/xml/schematy/dziedzinowe/mf/2022/01/05/eD/DefinicjeTypy/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/"><Naglowek><KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza><WariantFormularza>3</WariantFormularza><DataWytworzeniaFa>2026-02-04T10:01:16+00:00</DataWytworzeniaFa><SystemInfo>Microsoft Dynamics 365 for Finance and Operations</SystemInfo></Naglowek><Podmiot1><DaneIdentyfikacyjne><NIP>9512622152</NIP><Nazwa>LIFESTYLE SOLUTIONS SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>ul. ADAMA BRANICKIEGO 17, 02-972 WARSZAWA</AdresL1></Adres></Podmiot1><Podmiot2><DaneIdentyfikacyjne><NIP>8522588404</NIP><Nazwa>ŁOWKIS - ŁOZOWSKI SPÓŁKA JAWNA</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>ul. Modra 85</AdresL1><AdresL2>71-220 Szczecin POL</AdresL2></Adres><JST>2</JST><GV>2</GV></Podmiot2><Podmiot3><DaneIdentyfikacyjne><BrakID>1</BrakID><Nazwa>joannabaga@gmail.com</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85</AdresL1><AdresL2>71-220 Szczecin POL</AdresL2></Adres><Rola>2</Rola></Podmiot3><Fa><KodWaluty>PLN</KodWaluty><P_1>2026-02-03</P_1><P_2>FVS-000027982</P_2><P_13_2>1087.96</P_13_2><P_14_2>87.04</P_14_2><P_15>1175.00</P_15><Adnotacje><P_16>2</P_16><P_17>2</P_17><P_18>2</P_18><P_18A>2</P_18A><Zwolnienie><P_19N>1</P_19N></Zwolnienie><NoweSrodkiTransportu><P_22N>1</P_22N></NoweSrodkiTransportu><P_23>2</P_23><PMarzy><P_PMarzyN>1</P_PMarzyN></PMarzy></Adnotacje><RodzajFaktury>VAT</RodzajFaktury><FaWiersz><NrWierszaFa>1</NrWierszaFa><UU_ID>5639597160</UU_ID><P_7>Usługa Cateringowa 8%</P_7><P_8A>Usługa Cateringowa 8%</P_8A><P_8B>1.00</P_8B><P_9A>1087.96</P_9A><P_9B>1175.00</P_9B><P_11>1087.96</P_11><P_11A>1175.00</P_11A><P_11Vat>87.04</P_11Vat><P_12>8</P_12></FaWiersz><Platnosc><Zaplacono>1</Zaplacono><DataZaplaty>2026-02-03</DataZaplaty><TerminPlatnosci><Termin>2026-02-03</Termin><TerminOpis><Ilosc>0</Ilosc><Jednostka>dni</Jednostka><ZdarzeniePoczatkowe>od daty wystawienia</ZdarzeniePoczatkowe></TerminOpis></TerminPlatnosci><FormaPlatnosci>1</FormaPlatnosci><RachunekBankowy><NrRB>21105000861000009151616340</NrRB><SWIFT>INGBPLPW</SWIFT><NazwaBanku>ING</NazwaBanku></RachunekBankowy></Platnosc><WarunkiTransakcji><Zamowienia><DataZamowienia>2026-02-03</DataZamowienia><NrZamowienia>NEUrCF6Mab,iKt5fxpxQh</NrZamowienia></Zamowienia></WarunkiTransakcji></Fa><Stopka><Rejestry><PelnaNazwa>LIFESTYLE SOLUTIONS SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</PelnaNazwa></Rejestry></Stopka></Faktura>	2026-02-17 19:44:28.631276	VAT	\N	f	\N	2026-02-17 19:44:28.63128	2026-02-17 19:44:28.631281
5	MANUAL-1771357473	FAS/133/PL-PL/02/2026	11	7	2026-02-02	2026-02-02	80.49	18.51	99	PLN	8	\N	NOWA	f	gray	<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Faktura xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/">\n    <Naglowek>\n        <KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza>\n        <WariantFormularza>3</WariantFormularza>\n        <DataWytworzeniaFa>2026-02-02T13:40:11Z</DataWytworzeniaFa>\n        <SystemInfo>Streamsoft Verto</SystemInfo>\n    </Naglowek>\n    <Podmiot1>\n        <PrefiksPodatnika>PL</PrefiksPodatnika>\n        <DaneIdentyfikacyjne>\n            <NIP>9532457650</NIP>\n            <Nazwa>Oponeo.pl S.A.</Nazwa>\n        </DaneIdentyfikacyjne>\n        <Adres>\n            <KodKraju>PL</KodKraju>\n            <AdresL1>Podleśna 17</AdresL1>\n            <AdresL2>85-145 Bydgoszcz</AdresL2>\n        </Adres>\n    </Podmiot1>\n    <Podmiot2>\n        <DaneIdentyfikacyjne>\n            <NIP>8522588404</NIP>\n            <Nazwa>ŁOWKIS - ŁOZOWSKI SPÓŁKA JAWNA</Nazwa>\n        </DaneIdentyfikacyjne>\n        <Adres>\n            <KodKraju>PL</KodKraju>\n            <AdresL1>ul. Modra 85 null</AdresL1>\n            <AdresL2>71-220 Szczecin</AdresL2>\n        </Adres>\n        <JST>2</JST>\n        <GV>2</GV>\n    </Podmiot2>\n    <Fa>\n        <KodWaluty>PLN</KodWaluty>\n        <P_1>2026-02-02</P_1>\n        <P_1M>Bydgoszcz</P_1M>\n        <P_2>FAS/133/PL-PL/02/2026</P_2>\n        <WZ>WZ/12414/PL4/01/2026</WZ>\n        <P_6>2026-01-30</P_6>\n        <P_13_1>80.49</P_13_1>\n        <P_14_1>18.51</P_14_1>\n        <P_15>99.00</P_15>\n        <Adnotacje>\n            <P_16>2</P_16>\n            <P_17>2</P_17>\n            <P_18>2</P_18>\n            <P_18A>2</P_18A>\n            <Zwolnienie>\n                <P_19N>1</P_19N>\n            </Zwolnienie>\n            <NoweSrodkiTransportu>\n                <P_22N>1</P_22N>\n            </NoweSrodkiTransportu>\n            <P_23>2</P_23>\n            <PMarzy>\n                <P_PMarzyN>1</P_PMarzyN>\n            </PMarzy>\n        </Adnotacje>\n        <RodzajFaktury>VAT</RodzajFaktury>\n        <DodatkowyOpis>\n            <Klucz>Numery pozycji zamówienia z CC</Klucz>\n            <Wartosc>185604800</Wartosc>\n        </DodatkowyOpis>\n        <FaWiersz>\n            <NrWierszaFa>1</NrWierszaFa>\n            <P_7>REV AirPatrol 2IN1 TPMS OE replacement 315/433 MHz - Black</P_7>\n            <P_8A>szt</P_8A>\n            <P_8B>1.0000</P_8B>\n            <P_9B>99.00</P_9B>\n            <P_11A>99.00</P_11A>\n            <P_11Vat>18.51</P_11Vat>\n            <P_12>23</P_12>\n            <GTU>GTU_07</GTU>\n        </FaWiersz>\n        <Platnosc>\n            <Zaplacono>1</Zaplacono>\n            <DataZaplaty>2026-02-02</DataZaplaty>\n            <TerminPlatnosci>\n                <Termin>2026-02-02</Termin>\n                <TerminOpis>\n                    <Ilosc>0</Ilosc>\n                    <Jednostka>dzień</Jednostka>\n                    <ZdarzeniePoczatkowe>wystawienie faktury</ZdarzeniePoczatkowe>\n                </TerminOpis>\n            </TerminPlatnosci>\n            <PlatnoscInna>1</PlatnoscInna>\n            <OpisPlatnosci>Pobranie FedEx Polska</OpisPlatnosci>\n            <RachunekBankowy>\n                <NrRB>PL26160011850004080189652001</NrRB>\n                <SWIFT>PPABPLPKXXX</SWIFT>\n                <NazwaBanku>BNP PARIBAS BANK POLSKA SA  O. w Bydgoszczy al. Ossolińskich 25</NazwaBanku>\n                <OpisRachunku>BNP PLN PODSTAWOWY</OpisRachunku>\n            </RachunekBankowy>\n        </Platnosc>\n    </Fa>\n    <Stopka>\n        <Rejestry>\n            <PelnaNazwa>Oponeo.pl S.A.</PelnaNazwa>\n            <REGON>093149847</REGON>\n            <BDO>000017746</BDO>\n        </Rejestry>\n    </Stopka>\n</Faktura>\n	2026-02-17 19:44:33.467437	VAT	\N	f	\N	2026-02-17 19:44:33.467439	2026-02-17 19:44:33.46744
6	MANUAL-1771357475	FA006238BG	3	1	2026-02-17	2026-03-15	2330.15	535.93	2866.08	PLN	6	\N	WYEKSPORTOWANA	f	yellow	<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Faktura xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/"><Naglowek><KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza><WariantFormularza>3</WariantFormularza><DataWytworzeniaFa>2026-02-17T15:42:15.444Z</DataWytworzeniaFa><SystemInfo>Aplikacja LDC - Stellantis</SystemInfo></Naglowek><Podmiot1><DaneIdentyfikacyjne><NIP>5260151365</NIP><Nazwa>Stellantis Polska Sp. z o.o.</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Al. Krakowska 206 02-219 Warszawa</AdresL1></Adres><DaneKontaktowe><Email>czesci@distrigo.com.pl</Email><Telefon>22 500-94-72</Telefon></DaneKontaktowe></Podmiot1><Podmiot2><DaneIdentyfikacyjne><NIP>8522588404</NIP><Nazwa>ŁOWKIS-ŁOZOWSKI SP.J</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85 71-220 SZCZECIN</AdresL1></Adres><DaneKontaktowe><Email>czesci@citroenszczecin.pl</Email></DaneKontaktowe><NrKlienta>5LC033P</NrKlienta><JST>2</JST><GV>2</GV></Podmiot2><Podmiot3><DaneIdentyfikacyjne><BrakID>1</BrakID></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85 71-220 SZCZECIN</AdresL1></Adres><DaneKontaktowe><Email>serwis@citroenszczecin.pl</Email></DaneKontaktowe><Rola>2</Rola><NrKlienta>5LC033P02</NrKlienta></Podmiot3><Podmiot3><DaneIdentyfikacyjne><NIP>9661767430</NIP><Nazwa>BNP Paribas Faktoring Sp. z o. o.</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>ul. M. Kasprzaka 2 01-211 Warszawa</AdresL1></Adres><Rola>1</Rola></Podmiot3><Fa><KodWaluty>PLN</KodWaluty><P_1>2026-02-17</P_1><P_2>FA006238BG</P_2><P_6>2026-02-17</P_6><P_13_1>2330.15</P_13_1><P_14_1>535.93</P_14_1><P_15>2866.08</P_15><Adnotacje><P_16>2</P_16><P_17>2</P_17><P_18>2</P_18><P_18A>2</P_18A><Zwolnienie><P_19N>1</P_19N></Zwolnienie><NoweSrodkiTransportu><P_22N>1</P_22N></NoweSrodkiTransportu><P_23>2</P_23><PMarzy><P_PMarzyN>1</P_PMarzyN></PMarzy></Adnotacje><RodzajFaktury>VAT</RodzajFaktury><DodatkowyOpis><NrWiersza>1</NrWiersza><Klucz>Nr Zamówienia</Klucz><Wartosc>ZAM/24232/01/2026; 47.5%</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>2</NrWiersza><Klucz>Nr Zamówienia</Klucz><Wartosc>ZAM/6886/02/2026; 1JH13Q5UH/jarecki; 15%</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>3</NrWiersza><Klucz>Nr Zamówienia</Klucz><Wartosc>ZAM/7432/02/2026; 1JH1C63S2/WE5GX11; 25%</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>4</NrWiersza><Klucz>Nr Zamówienia</Klucz><Wartosc>ZAM/8405/02/2026; 1JH3PQQI7/opensystem; 13%</Wartosc></DodatkowyOpis><FaWiersz><NrWierszaFa>1</NrWierszaFa><P_7>ELEMENT FILTRA POWIETRZA</P_7><Indeks>9838721480</Indeks><CN>84219990</CN><P_8A>Szt.</P_8A><P_8B>4</P_8B><P_9A>152.37</P_9A><P_10>72.38</P_10><P_11>319.96</P_11><P_12>23</P_12></FaWiersz><FaWiersz><NrWierszaFa>2</NrWierszaFa><P_7>SONDA LAMBDA UKŁ OCZYSZ SPALIN</P_7><Indeks>9678267980</Indeks><CN>90271090</CN><P_8A>Szt.</P_8A><P_8B>1</P_8B><P_9A>1111.90</P_9A><P_10>166.79</P_10><P_11>945.12</P_11><P_12>23</P_12></FaWiersz><FaWiersz><NrWierszaFa>3</NrWierszaFa><P_7>WSPORNIK ZDERZAKA TYLNEGO</P_7><Indeks>9818876480</Indeks><CN>87082990</CN><P_8A>Szt.</P_8A><P_8B>1</P_8B><P_9A>226.23</P_9A><P_10>56.56</P_10><P_11>169.67</P_11><P_12>23</P_12><GTU>GTU_07</GTU></FaWiersz><FaWiersz><NrWierszaFa>4</NrWierszaFa><P_7>EKRAN WIDOKU Z TYŁU</P_7><Indeks>9836431080</Indeks><CN>85258900</CN><P_8A>Szt.</P_8A><P_8B>1</P_8B><P_9A>1029.20</P_9A><P_10>133.80</P_10><P_11>895.40</P_11><P_12>23</P_12></FaWiersz><Platnosc><TerminPlatnosci><Termin>2026-03-15</Termin></TerminPlatnosci><FormaPlatnosci>6</FormaPlatnosci><RachunekBankowyFaktora><NrRB>17160014620008078176003156</NrRB><NazwaBanku>BNP Paribas Faktoring Sp. z o. o.</NazwaBanku></RachunekBankowyFaktora></Platnosc></Fa><Stopka><Informacje><StopkaFaktury>* Wierzytelności, które wynikają z tej Faktury, przelaliśmy na rzecz BNP Paribas Faktoring Sp. z o. o. Oznacza to, że masz obowiązek wykonywać płatności na niżej wskazany rachunek – ze skutkiem zwolnienia z długu. Numer Rachunku dla waluty PLN nr PL 17 1600 1462 0008 0781 7600 3156</StopkaFaktury></Informacje><Rejestry><KRS>0000019125</KRS><REGON>012077140</REGON><BDO>000024936</BDO></Rejestry></Stopka></Faktura>	2026-02-17 19:44:35.672325	VAT	\N	f	\N	2026-02-17 19:44:35.672327	2026-02-17 20:13:19.776115
7	MANUAL-1771358686	FV 2462/S12/2026	4	2	2026-02-17	2026-03-03	681.37	156.72	838.09	PLN	6	\N	WYEKSPORTOWANA	f	yellow	<?xml version="1.0" encoding="utf-8" ?>\r\n<Faktura xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/"><Naglowek><KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza><WariantFormularza>3</WariantFormularza><DataWytworzeniaFa>2026-02-17T12:32:54</DataWytworzeniaFa></Naglowek><Podmiot1><PrefiksPodatnika>PL</PrefiksPodatnika><DaneIdentyfikacyjne><NIP>5240301927</NIP><Nazwa>"INTER - TEAM" SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Daniszewska 4</AdresL1><AdresL2>03-230 Warszawa</AdresL2></Adres><DaneKontaktowe><Email>e-mail: szczecin@inter-team.com.pl</Email><Telefon>914856516</Telefon></DaneKontaktowe></Podmiot1><Podmiot2><DaneIdentyfikacyjne><NIP>8522588404</NIP><Nazwa>ŁOWKIS-ŁOZOWSKI S.J.</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85</AdresL1><AdresL2>71-220 Szczecin</AdresL2></Adres><NrKlienta>047503</NrKlienta><JST>2</JST><GV>2</GV></Podmiot2><Fa><KodWaluty>PLN</KodWaluty><P_1>2026-02-17</P_1><P_1M>Szczecin</P_1M><P_2>FV 2462/S12/2026</P_2><WZ>5843/S12/2026</WZ><WZ>5363/S12/2026</WZ><WZ>5321/S12/2026</WZ><WZ>5247/S12/2026</WZ><WZ>4969/S12/2026</WZ><WZ>5691/S12/2026</WZ><P_13_1>681.37</P_13_1><P_14_1>156.72</P_14_1><P_15>838.09</P_15><Adnotacje><P_16>2</P_16><P_17>2</P_17><P_18>2</P_18><P_18A>2</P_18A><Zwolnienie><P_19N>1</P_19N></Zwolnienie><NoweSrodkiTransportu><P_22N>1</P_22N></NoweSrodkiTransportu><P_23>2</P_23><PMarzy><P_PMarzyN>1</P_PMarzyN></PMarzy></Adnotacje><RodzajFaktury>VAT</RodzajFaktury><DodatkowyOpis><NrWiersza>1</NrWiersza><Klucz>Producent</Klucz><Wartosc>AMTRA</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>1</NrWiersza><Klucz>Nr producenta</Klucz><Wartosc>39-020</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>1</NrWiersza><Klucz>Nr Wz</Klucz><Wartosc>5843/S12/2026</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>2</NrWiersza><Klucz>Producent</Klucz><Wartosc>ELRING</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>2</NrWiersza><Klucz>Nr producenta</Klucz><Wartosc>785.710</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>2</NrWiersza><Klucz>Nr Wz</Klucz><Wartosc>5363/S12/2026</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>3</NrWiersza><Klucz>Producent</Klucz><Wartosc>ELRING</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>3</NrWiersza><Klucz>Nr producenta</Klucz><Wartosc>926.430</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>3</NrWiersza><Klucz>Nr Wz</Klucz><Wartosc>5321/S12/2026</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>4</NrWiersza><Klucz>Producent</Klucz><Wartosc>BOSCH</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>4</NrWiersza><Klucz>Nr producenta</Klucz><Wartosc>3 397 009 081</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>4</NrWiersza><Klucz>Nr Wz</Klucz><Wartosc>5247/S12/2026</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>5</NrWiersza><Klucz>Producent</Klucz><Wartosc>BOSCH</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>5</NrWiersza><Klucz>Nr producenta</Klucz><Wartosc>0 242 135 518</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>5</NrWiersza><Klucz>Nr Wz</Klucz><Wartosc>4969/S12/2026</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>6</NrWiersza><Klucz>Producent</Klucz><Wartosc>BOSCH</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>6</NrWiersza><Klucz>Nr producenta</Klucz><Wartosc>0 986 494 716</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>6</NrWiersza><Klucz>Nr Wz</Klucz><Wartosc>5691/S12/2026</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>7</NrWiersza><Klucz>Producent</Klucz><Wartosc>BOSCH</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>7</NrWiersza><Klucz>Nr producenta</Klucz><Wartosc>0 986 479 C24</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>7</NrWiersza><Klucz>Nr Wz</Klucz><Wartosc>5691/S12/2026</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>8</NrWiersza><Klucz>Producent</Klucz><Wartosc>BOSCH</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>8</NrWiersza><Klucz>Nr producenta</Klucz><Wartosc>0 221 504 800</Wartosc></DodatkowyOpis><DodatkowyOpis><NrWiersza>8</NrWiersza><Klucz>Nr Wz</Klucz><Wartosc>4969/S12/2026</Wartosc></DodatkowyOpis><FaWiersz><NrWierszaFa>1</NrWierszaFa><P_7>ENERGIZER BATERIA SP</P_7><Indeks>20629750</Indeks><CN>85065030</CN><P_8A>szt.</P_8A><P_8B>2</P_8B><P_9A>5.20</P_9A><P_11>10.40</P_11><P_12>23</P_12></FaWiersz><FaWiersz><NrWierszaFa>2</NrWierszaFa><P_7>USZCZELKA POMPY PODCIŚNIENIA</P_7><Indeks>61136001</Indeks><CN>84099900</CN><P_8A>szt.</P_8A><P_8B>1</P_8B><P_9A>18.54</P_9A><P_11>18.54</P_11><P_12>23</P_12></FaWiersz><FaWiersz><NrWierszaFa>3</NrWierszaFa><P_7>ZESTAW ŚRUB GŁOWICY</P_7><Indeks>61474046</Indeks><CN>73181595</CN><P_8A>kpl.</P_8A><P_8B>1</P_8B><P_9A>167.52</P_9A><P_11>167.52</P_11><P_12>23</P_12></FaWiersz><FaWiersz><NrWierszaFa>4</NrWierszaFa><P_7>AR500S PIÓRO WYCIER.500/500 AE</P_7><Indeks>90700456</Indeks><CN>85129090</CN><P_8A>kpl.</P_8A><P_8B>1</P_8B><P_9A>56.41</P_9A><P_11>56.41</P_11><P_12>23</P_12></FaWiersz><FaWiersz><NrWierszaFa>5</NrWierszaFa><P_7>ZR7SI332S         ŚWIECA ZAPŁ.</P_7><Indeks>90905911</Indeks><CN>85111000</CN><P_8A>szt.</P_8A><P_8B>4</P_8B><P_9A>26.10</P_9A><P_11>104.40</P_11><P_12>23</P_12></FaWiersz><FaWiersz><NrWierszaFa>6</NrWierszaFa><P_7>KLOCKI HAMULCOWE BP1711</P_7><Indeks>96015970</Indeks><CN>87083091</CN><P_8A>kpl.</P_8A><P_8B>1</P_8B><P_9A>93.08</P_9A><P_11>93.08</P_11><P_12>23</P_12><GTU>GTU_07</GTU></FaWiersz><FaWiersz><NrWierszaFa>7</NrWierszaFa><P_7>TARCZA HAMUL.TYLNA</P_7><Indeks>96055944</Indeks><CN>87083091</CN><P_8A>szt.</P_8A><P_8B>2</P_8B><P_9A>82.67</P_9A><P_11>165.34</P_11><P_12>23</P_12><GTU>GTU_07</GTU></FaWiersz><FaWiersz><NrWierszaFa>8</NrWierszaFa><P_7>CEWKA ZAPŁONOWA</P_7><Indeks>99046322</Indeks><CN>85113000</CN><P_8A>szt.</P_8A><P_8B>1</P_8B><P_9A>65.68</P_9A><P_11>65.68</P_11><P_12>23</P_12></FaWiersz><Platnosc><TerminPlatnosci><Termin>2026-03-03</Termin></TerminPlatnosci><FormaPlatnosci>6</FormaPlatnosci><RachunekBankowy><NrRB>94237000080004750320843081</NrRB><NazwaBanku>SEB AB S.A.</NazwaBanku></RachunekBankowy></Platnosc></Fa><Stopka><Informacje><StopkaFaktury>Informujemy, że kody GTU podane na fakturze są informacją dodatkową. Ich dalsze użycie wymaga weryfikacji. Informujemy, że zakupiony towar nie podlega zwrotowi.</StopkaFaktury></Informacje><Informacje><StopkaFaktury>- REKLAMACJE TOWARÓW OBJĘTYCH KARTĄ GWARANCYJNĄ SĄ MOŻLIWE TYLKO NA PODSTAWIE KARTY GWARANCYJNEJ DANEGO PRODUKTU ORAZ DOWODU ZAKUPU - SPRZEDAŻ W PROMOCJACH I OFERTACH SPECJALNYCH NIE PODLEGA ZWROTOWI - OGÓLNE WARUNKI SPRZEDAŻY DOSTĘPNE SĄ NA STRONIE WWW.INTER-TEAM.COM.PL</StopkaFaktury></Informacje><Informacje><StopkaFaktury>Niniejsza faktura jest wezwaniem do zapłaty zgodnie z art. 455 Kodeksu Cywilnego. Po przekroczeniu terminu płatności naliczone zostaną ustawowe odsetki za zwłokę. Dostawca zastrzega sobie prawo podwyższenia ceny po wystawieniu faktury w wypadku wzrostu kursu waluty ponad 2% na dzień faktycznego dokonania zapłaty. Sprzedawca informuje (a Nabywca tę zasadę akceptuje), że od 01.01.2022 przy wystawianiu faktur korygujących (z przyczyn, o których  mowa w Art. 106j Ustawy o VAT), dniem ostatecznego uzgodnienia warunków handlowych odnośnie obniżenia podstawy opodatkowania jest dzień wystawienia faktury korygującej przez sprzedawcę. Stosownie do art. 589 K.C. sprzedający zastrzega sobie prawo własności sprzedanej rzeczy ruchomej aż do uiszczenia za nią ceny.Informacje o nieuregulowanych zobowiązaniach będą przekazywane do Krajowego Rejestru Długów Biura Informacji Gospodarczej SA zgodnie z Ustawą z dnia 9 kwietnia 2010 r. o udostępnianiu informacji gospodarczych i wymianie danych gospodarczych.</StopkaFaktury></Informacje><Rejestry><KRS>0000139224</KRS><REGON>001397040</REGON><BDO>000040735</BDO></Rejestry></Stopka></Faktura>\r\n	2026-02-17 20:04:46.401514	VAT	\N	f	\N	2026-02-17 20:04:46.401516	2026-02-17 20:13:19.776118
8	MANUAL-1771418252	FA006872BG	3	1	2026-02-18	2026-03-16	174.65	40.17	214.82	PLN	6	\N	WYEKSPORTOWANA	t	yellow	<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Faktura xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/"><Naglowek><KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza><WariantFormularza>3</WariantFormularza><DataWytworzeniaFa>2026-02-18T11:15:47.364Z</DataWytworzeniaFa><SystemInfo>Aplikacja LDC - Stellantis</SystemInfo></Naglowek><Podmiot1><DaneIdentyfikacyjne><NIP>5260151365</NIP><Nazwa>Stellantis Polska Sp. z o.o.</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Al. Krakowska 206 02-219 Warszawa</AdresL1></Adres><DaneKontaktowe><Email>czesci@distrigo.com.pl</Email><Telefon>22 500-94-72</Telefon></DaneKontaktowe></Podmiot1><Podmiot2><DaneIdentyfikacyjne><NIP>8522588404</NIP><Nazwa>ŁOWKIS-ŁOZOWSKI SP.J</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85 71-220 SZCZECIN</AdresL1></Adres><DaneKontaktowe><Email>czesci@citroenszczecin.pl</Email></DaneKontaktowe><NrKlienta>5LC033P</NrKlienta><JST>2</JST><GV>2</GV></Podmiot2><Podmiot3><DaneIdentyfikacyjne><BrakID>1</BrakID></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85 71-220 SZCZECIN</AdresL1></Adres><DaneKontaktowe><Email>serwis@citroenszczecin.pl</Email></DaneKontaktowe><Rola>2</Rola><NrKlienta>5LC033P02</NrKlienta></Podmiot3><Podmiot3><DaneIdentyfikacyjne><NIP>9661767430</NIP><Nazwa>BNP Paribas Faktoring Sp. z o. o.</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>ul. M. Kasprzaka 2 01-211 Warszawa</AdresL1></Adres><Rola>1</Rola></Podmiot3><Fa><KodWaluty>PLN</KodWaluty><P_1>2026-02-18</P_1><P_2>FA006872BG</P_2><P_6>2026-02-18</P_6><P_13_1>174.65</P_13_1><P_14_1>40.17</P_14_1><P_15>214.82</P_15><Adnotacje><P_16>2</P_16><P_17>2</P_17><P_18>2</P_18><P_18A>2</P_18A><Zwolnienie><P_19N>1</P_19N></Zwolnienie><NoweSrodkiTransportu><P_22N>1</P_22N></NoweSrodkiTransportu><P_23>2</P_23><PMarzy><P_PMarzyN>1</P_PMarzyN></PMarzy></Adnotacje><RodzajFaktury>VAT</RodzajFaktury><DodatkowyOpis><NrWiersza>1</NrWiersza><Klucz>Nr Zamówienia</Klucz><Wartosc>ZAM/7432/02/2026; 1JH1C63S2/WE5GX11; 25%</Wartosc></DodatkowyOpis><FaWiersz><NrWierszaFa>1</NrWierszaFa><P_7>KPL WSPORN CZUJNIKA ZBLIŻEN</P_7><Indeks>1640106680</Indeks><CN>87082990</CN><P_8A>Szt.</P_8A><P_8B>1</P_8B><P_9A>232.86</P_9A><P_10>58.22</P_10><P_11>174.65</P_11><P_12>23</P_12><GTU>GTU_07</GTU></FaWiersz><Platnosc><TerminPlatnosci><Termin>2026-03-16</Termin></TerminPlatnosci><FormaPlatnosci>6</FormaPlatnosci><RachunekBankowyFaktora><NrRB>17160014620008078176003156</NrRB><NazwaBanku>BNP Paribas Faktoring Sp. z o. o.</NazwaBanku></RachunekBankowyFaktora></Platnosc></Fa><Stopka><Informacje><StopkaFaktury>* Wierzytelności, które wynikają z tej Faktury, przelaliśmy na rzecz BNP Paribas Faktoring Sp. z o. o. Oznacza to, że masz obowiązek wykonywać płatności na niżej wskazany rachunek – ze skutkiem zwolnienia z długu. Numer Rachunku dla waluty PLN nr PL 17 1600 1462 0008 0781 7600 3156</StopkaFaktury></Informacje><Rejestry><KRS>0000019125</KRS><REGON>012077140</REGON><BDO>000024936</BDO></Rejestry></Stopka></Faktura>	2026-02-18 12:37:32.259684	VAT	\N	f	\N	2026-02-18 12:37:32.259686	2026-02-18 14:08:11.846508
9	MANUAL-1771418258	FA006907BG	3	1	2026-02-18	2026-03-16	445.14	102.38	547.52	PLN	6	\N	WYEKSPORTOWANA	t	yellow	<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Faktura xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/"><Naglowek><KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza><WariantFormularza>3</WariantFormularza><DataWytworzeniaFa>2026-02-18T11:16:02.216Z</DataWytworzeniaFa><SystemInfo>Aplikacja LDC - Stellantis</SystemInfo></Naglowek><Podmiot1><DaneIdentyfikacyjne><NIP>5260151365</NIP><Nazwa>Stellantis Polska Sp. z o.o.</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Al. Krakowska 206 02-219 Warszawa</AdresL1></Adres><DaneKontaktowe><Email>czesci@distrigo.com.pl</Email><Telefon>22 500-94-72</Telefon></DaneKontaktowe></Podmiot1><Podmiot2><DaneIdentyfikacyjne><NIP>8522588404</NIP><Nazwa>ŁOWKIS-ŁOZOWSKI SP.J</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85 71-220 SZCZECIN</AdresL1></Adres><DaneKontaktowe><Email>czesci@citroenszczecin.pl</Email></DaneKontaktowe><NrKlienta>5LC033P</NrKlienta><JST>2</JST><GV>2</GV></Podmiot2><Podmiot3><DaneIdentyfikacyjne><BrakID>1</BrakID></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>Modra 85 71-220 SZCZECIN</AdresL1></Adres><DaneKontaktowe><Email>serwis@citroenszczecin.pl</Email></DaneKontaktowe><Rola>2</Rola><NrKlienta>5LC033P01</NrKlienta></Podmiot3><Podmiot3><DaneIdentyfikacyjne><NIP>9661767430</NIP><Nazwa>BNP Paribas Faktoring Sp. z o. o.</Nazwa></DaneIdentyfikacyjne><Adres><KodKraju>PL</KodKraju><AdresL1>ul. M. Kasprzaka 2 01-211 Warszawa</AdresL1></Adres><Rola>1</Rola></Podmiot3><Fa><KodWaluty>PLN</KodWaluty><P_1>2026-02-18</P_1><P_2>FA006907BG</P_2><P_6>2026-02-18</P_6><P_13_1>445.14</P_13_1><P_14_1>102.38</P_14_1><P_15>547.52</P_15><Adnotacje><P_16>2</P_16><P_17>2</P_17><P_18>2</P_18><P_18A>2</P_18A><Zwolnienie><P_19N>1</P_19N></Zwolnienie><NoweSrodkiTransportu><P_22N>1</P_22N></NoweSrodkiTransportu><P_23>2</P_23><PMarzy><P_PMarzyN>1</P_PMarzyN></PMarzy></Adnotacje><RodzajFaktury>VAT</RodzajFaktury><DodatkowyOpis><NrWiersza>1</NrWiersza><Klucz>Nr Zamówienia</Klucz><Wartosc>ZAM/13377/02/2026; 1JHJ5I0HF/ZS101UK; 20%</Wartosc></DodatkowyOpis><FaWiersz><NrWierszaFa>1</NrWierszaFa><P_7>AKUMULATOR STEROWANIA 12 v</P_7><Indeks>9828201580</Indeks><CN>85071020</CN><P_8A>Szt.</P_8A><P_8B>1</P_8B><P_9A>556.42</P_9A><P_10>111.28</P_10><P_11>445.14</P_11><P_12>23</P_12></FaWiersz><Platnosc><TerminPlatnosci><Termin>2026-03-16</Termin></TerminPlatnosci><FormaPlatnosci>6</FormaPlatnosci><RachunekBankowyFaktora><NrRB>17160014620008078176003156</NrRB><NazwaBanku>BNP Paribas Faktoring Sp. z o. o.</NazwaBanku></RachunekBankowyFaktora></Platnosc></Fa><Stopka><Informacje><StopkaFaktury>* Wierzytelności, które wynikają z tej Faktury, przelaliśmy na rzecz BNP Paribas Faktoring Sp. z o. o. Oznacza to, że masz obowiązek wykonywać płatności na niżej wskazany rachunek – ze skutkiem zwolnienia z długu. Numer Rachunku dla waluty PLN nr PL 17 1600 1462 0008 0781 7600 3156</StopkaFaktury></Informacje><Rejestry><KRS>0000019125</KRS><REGON>012077140</REGON><BDO>000024936</BDO></Rejestry></Stopka></Faktura>	2026-02-18 12:37:38.467	VAT	\N	f	\N	2026-02-18 12:37:38.467002	2026-02-18 16:59:30.094451
\.


--
-- Data for Name: kontrahenci; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.kontrahenci (id, nip, nazwa, adres, email, telefon, created_at) FROM stdin;
3	5260151365	Stellantis Polska Sp. z o.o.	Al. Krakowska 206 02-219 Warszawa	czesci@distrigo.com.pl	22 500-94-72	2026-02-17 18:28:01.925644
5	9511600361	Telwis Zbigniew Kaczmarczyk	02-784 Warszawa	\N	\N	2026-02-17 18:28:17.335893
6	9452188455	Enis S.A. (dawniej: Enis sp. z o.o. sp.k.)	ul. Cementowa 10	bok@sklepopon.com	\N	2026-02-17 18:39:39.28426
7	1181452946	Inter Cars Spółka Akcyjna	05-180 Swobodnia, Swobodnia 35	\N	\N	2026-02-17 19:00:42.061261
8	9512622152	LIFESTYLE SOLUTIONS SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ	ul. ADAMA BRANICKIEGO 17, 02-972 WARSZAWA	\N	\N	2026-02-17 19:00:48.006766
11	9532457650	Oponeo.pl S.A.	Podleśna 17	\N	\N	2026-02-17 19:32:16.616452
4	5240301927	'INTER - TEAM' SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ	Daniszewska 4	e-mail: szczecin@inter-team.com.pl	914856516	2026-02-17 18:28:09.986861
10	5842731959	AUTO-PARTNER GDAŃSK SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ	Magazynowa 7	\N	\N	2026-02-17 19:32:00.652311
\.


--
-- Data for Name: ksef_sessions; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.ksef_sessions (id, session_token, nip, data_utworzenia, data_wygasniecia, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: pozycje_faktury; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.pozycje_faktury (id, faktura_id, numer_pozycji, nazwa, ilosc, jednostka, cena_netto, wartosc_netto, stawka_vat, kwota_vat, wartosc_brutto) FROM stdin;
\.


--
-- Data for Name: rachunki_bankowe; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.rachunki_bankowe (id, kontrahent_id, numer_rachunku, iban, nazwa_banku, status_biala_lista, data_weryfikacji, created_at, swift, ignore_biala_lista) FROM stdin;
3	5	83249000050000400084133437	PL83249000050000400084133437	Alior Bank	PENDING	\N	2026-02-17 18:28:17.337315	\N	f
4	6	63160010131841017860000013	PL63160010131841017860000013	\N	PENDING	\N	2026-02-17 18:39:39.287574	\N	f
5	7	08103019999000720000442111	PL08103019999000720000442111	\N	PENDING	\N	2026-02-17 19:00:42.063816	\N	f
9	4	15124062921787001087577380	15124062921787001087577380	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.804301	2026-02-18 11:26:38.815966	\N	f
10	4	42124062921213001086109854	42124062921213001086109854	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.805419	2026-02-18 11:26:38.815966	\N	f
11	4	69124062921978001086109724	69124062921978001086109724	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.806069	2026-02-18 11:26:38.815967	\N	f
12	4	69237000080000000020843090	69237000080000000020843090	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.806647	2026-02-18 11:26:38.815969	\N	f
13	4	24237000080000000020843027	24237000080000000020843027	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.807268	2026-02-18 11:26:38.815969	\N	f
14	4	73237000080000000020843018	73237000080000000020843018	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.807838	2026-02-18 11:26:38.81597	\N	f
15	4	23237000080000000020843045	23237000080000000020843045	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.80849	2026-02-18 11:26:38.81597	\N	f
16	4	25237000080000000020843009	25237000080000000020843009	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.809061	2026-02-18 11:26:38.81597	\N	f
17	4	22237000080000000020843063	22237000080000000020843063	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.809563	2026-02-18 11:26:38.815971	\N	f
18	4	72237000080000000020843036	72237000080000000020843036	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.810079	2026-02-18 11:26:38.815971	\N	f
19	4	95237000080000000020843107	95237000080000000020843107	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.810576	2026-02-18 11:26:38.815971	\N	f
20	4	21237000080000000020843081	21237000080000000020843081	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.811171	2026-02-18 11:26:38.815971	\N	f
21	4	70237000080000000020843072	70237000080000000020843072	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.811744	2026-02-18 11:26:38.815972	\N	f
22	4	80124010821111001004184491	80124010821111001004184491	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.812325	2026-02-18 11:26:38.815972	\N	f
24	10	11203000453110000000304300	11203000453110000000304300	\N	ZWERYFIKOWANY	2026-02-18 11:26:44.69789	2026-02-18 11:26:44.70264	\N	f
25	10	30203000451110000002825660	30203000451110000002825660	\N	ZWERYFIKOWANY	2026-02-18 11:26:44.698478	2026-02-18 11:26:44.70264	\N	f
26	10	41160014621029834250000020	41160014621029834250000020	\N	ZWERYFIKOWANY	2026-02-18 11:26:44.699081	2026-02-18 11:26:44.702641	\N	f
27	10	48203000453110000000319930	48203000453110000000319930	\N	ZWERYFIKOWANY	2026-02-18 11:26:44.699617	2026-02-18 11:26:44.702641	\N	f
28	10	73160014621029834250000026	73160014621029834250000026	\N	ZWERYFIKOWANY	2026-02-18 11:26:44.700135	2026-02-18 11:26:44.702641	\N	f
29	10	77203000451110000002820740	77203000451110000002820740	\N	ZWERYFIKOWANY	2026-02-18 11:26:44.700638	2026-02-18 11:26:44.702641	\N	f
30	10	81102014620000750203588811	81102014620000750203588811	\N	ZWERYFIKOWANY	2026-02-18 11:26:44.701127	2026-02-18 11:26:44.702642	\N	f
31	10	18102014620000710203588977	18102014620000710203588977	\N	ZWERYFIKOWANY	2026-02-18 11:26:44.701654	2026-02-18 11:26:44.702642	\N	f
23	10	09203000451110000002825650	09203000451110000002825650	\N	ZWERYFIKOWANY	2026-02-18 11:45:42.967896	2026-02-18 11:26:44.702639	\N	f
8	4	71237000080000000020843054	71237000080000000020843054	\N	ZWERYFIKOWANY	2026-02-18 11:26:38.802023	2026-02-18 11:26:38.815964	\N	t
1	3	17160014620008078176003156	PL17160014620008078176003156	BNP Paribas Faktoring Sp. z o. o.	NIE_ZWERYFIKOWANY	2026-02-18 17:08:43.40193	2026-02-17 18:28:01.92997	\N	t
7	11	26160011850004080189652001	PL26160011850004080189652001	BNP PARIBAS BANK POLSKA SA  O. w Bydgoszczy al. Ossolińskich 25	NIE_ZWERYFIKOWANY	2026-02-18 17:08:48.739834	2026-02-17 19:32:16.61825	\N	f
2	4	94237000080004750320843081	PL94237000080004750320843081	SEB AB S.A.	NIE_ZWERYFIKOWANY	2026-02-18 17:08:51.386821	2026-02-17 18:28:09.988582	\N	f
6	10	77203000451110000002820740	PL77203000451110000002820740	BNP PARIBAS Bank Polska SA PLN	NIE_ZWERYFIKOWANY	2026-02-18 17:08:53.183287	2026-02-17 19:32:00.6546	\N	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.users (id, username, email, hashed_password, is_active, is_admin, created_at, api_token, firma_nazwa, firma_nip, firma_rachunek) FROM stdin;
1	admin	admin@localhost	$2b$12$XAu/ZeO9lHfEK4OMCaFekeVEc36TUBVaiXRA4U12gffexAhKb4OrC	t	t	2026-02-17 19:15:57.464002	test-token-123456	Lowkis-Lozowski	8522588404	PL38124039271111001039604171
\.


--
-- Data for Name: uzytkownicy; Type: TABLE DATA; Schema: public; Owner: ksef_user
--

COPY public.uzytkownicy (id, email, api_token, firma_nazwa, firma_nip, ksef_token, is_active, created_at) FROM stdin;
1	admin@lowkis.pl	test-token-123456	ŁOWKIS-ŁOZOWSKI SP.J	8522588404	\N	t	\N
\.


--
-- Name: eksport_bank_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.eksport_bank_id_seq', 1, false);


--
-- Name: eksport_faktury_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.eksport_faktury_id_seq', 1, false);


--
-- Name: eksporty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.eksporty_id_seq', 13, true);


--
-- Name: faktury_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.faktury_id_seq', 9, true);


--
-- Name: kontrahenci_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.kontrahenci_id_seq', 11, true);


--
-- Name: ksef_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.ksef_sessions_id_seq', 1, false);


--
-- Name: pozycje_faktury_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.pozycje_faktury_id_seq', 1, false);


--
-- Name: rachunki_bankowe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.rachunki_bankowe_id_seq', 31, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: uzytkownicy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ksef_user
--

SELECT pg_catalog.setval('public.uzytkownicy_id_seq', 2, true);


--
-- Name: eksport_bank eksport_bank_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.eksport_bank
    ADD CONSTRAINT eksport_bank_pkey PRIMARY KEY (id);


--
-- Name: eksport_faktury eksport_faktury_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.eksport_faktury
    ADD CONSTRAINT eksport_faktury_pkey PRIMARY KEY (id);


--
-- Name: eksporty eksporty_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.eksporty
    ADD CONSTRAINT eksporty_pkey PRIMARY KEY (id);


--
-- Name: faktury faktury_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.faktury
    ADD CONSTRAINT faktury_pkey PRIMARY KEY (id);


--
-- Name: kontrahenci kontrahenci_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.kontrahenci
    ADD CONSTRAINT kontrahenci_pkey PRIMARY KEY (id);


--
-- Name: ksef_sessions ksef_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.ksef_sessions
    ADD CONSTRAINT ksef_sessions_pkey PRIMARY KEY (id);


--
-- Name: ksef_sessions ksef_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.ksef_sessions
    ADD CONSTRAINT ksef_sessions_session_token_key UNIQUE (session_token);


--
-- Name: pozycje_faktury pozycje_faktury_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.pozycje_faktury
    ADD CONSTRAINT pozycje_faktury_pkey PRIMARY KEY (id);


--
-- Name: rachunki_bankowe rachunki_bankowe_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.rachunki_bankowe
    ADD CONSTRAINT rachunki_bankowe_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: uzytkownicy uzytkownicy_pkey; Type: CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.uzytkownicy
    ADD CONSTRAINT uzytkownicy_pkey PRIMARY KEY (id);


--
-- Name: idx_users_api_token; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE UNIQUE INDEX idx_users_api_token ON public.users USING btree (api_token);


--
-- Name: ix_eksport_bank_id; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE INDEX ix_eksport_bank_id ON public.eksport_bank USING btree (id);


--
-- Name: ix_eksporty_id; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE INDEX ix_eksporty_id ON public.eksporty USING btree (id);


--
-- Name: ix_faktury_id; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE INDEX ix_faktury_id ON public.faktury USING btree (id);


--
-- Name: ix_faktury_numer_ksef; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE UNIQUE INDEX ix_faktury_numer_ksef ON public.faktury USING btree (numer_ksef);


--
-- Name: ix_kontrahenci_id; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE INDEX ix_kontrahenci_id ON public.kontrahenci USING btree (id);


--
-- Name: ix_kontrahenci_nip; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE UNIQUE INDEX ix_kontrahenci_nip ON public.kontrahenci USING btree (nip);


--
-- Name: ix_ksef_sessions_id; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE INDEX ix_ksef_sessions_id ON public.ksef_sessions USING btree (id);


--
-- Name: ix_pozycje_faktury_id; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE INDEX ix_pozycje_faktury_id ON public.pozycje_faktury USING btree (id);


--
-- Name: ix_rachunki_bankowe_id; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE INDEX ix_rachunki_bankowe_id ON public.rachunki_bankowe USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: ix_uzytkownicy_api_token; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE UNIQUE INDEX ix_uzytkownicy_api_token ON public.uzytkownicy USING btree (api_token);


--
-- Name: ix_uzytkownicy_email; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE UNIQUE INDEX ix_uzytkownicy_email ON public.uzytkownicy USING btree (email);


--
-- Name: ix_uzytkownicy_id; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE INDEX ix_uzytkownicy_id ON public.uzytkownicy USING btree (id);


--
-- Name: uniq_faktury_kontrahent_numer; Type: INDEX; Schema: public; Owner: ksef_user
--

CREATE UNIQUE INDEX uniq_faktury_kontrahent_numer ON public.faktury USING btree (kontrahent_id, numer_faktury);


--
-- Name: eksport_faktury eksport_faktury_eksport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.eksport_faktury
    ADD CONSTRAINT eksport_faktury_eksport_id_fkey FOREIGN KEY (eksport_id) REFERENCES public.eksport_bank(id);


--
-- Name: eksport_faktury eksport_faktury_faktura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.eksport_faktury
    ADD CONSTRAINT eksport_faktury_faktura_id_fkey FOREIGN KEY (faktura_id) REFERENCES public.faktury(id);


--
-- Name: faktury faktury_faktura_oryginalna_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.faktury
    ADD CONSTRAINT faktury_faktura_oryginalna_id_fkey FOREIGN KEY (faktura_oryginalna_id) REFERENCES public.faktury(id);


--
-- Name: faktury faktury_kontrahent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.faktury
    ADD CONSTRAINT faktury_kontrahent_id_fkey FOREIGN KEY (kontrahent_id) REFERENCES public.kontrahenci(id);


--
-- Name: faktury faktury_rachunek_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.faktury
    ADD CONSTRAINT faktury_rachunek_id_fkey FOREIGN KEY (rachunek_id) REFERENCES public.rachunki_bankowe(id);


--
-- Name: pozycje_faktury pozycje_faktury_faktura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.pozycje_faktury
    ADD CONSTRAINT pozycje_faktury_faktura_id_fkey FOREIGN KEY (faktura_id) REFERENCES public.faktury(id);


--
-- Name: rachunki_bankowe rachunki_bankowe_kontrahent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ksef_user
--

ALTER TABLE ONLY public.rachunki_bankowe
    ADD CONSTRAINT rachunki_bankowe_kontrahent_id_fkey FOREIGN KEY (kontrahent_id) REFERENCES public.kontrahenci(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Z3NRT2JY5yKPJhfeabJlHC72WYJRMahpUfUhDECJqZmanemhVmdgIrMa1vj10B6

