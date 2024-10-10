--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

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
-- Name: albums; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.albums (
    mbid integer,
    name character varying
);


ALTER TABLE public.albums OWNER TO postgres;

--
-- Name: artists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.artists (
    mbid integer,
    name character varying
);


ALTER TABLE public.artists OWNER TO postgres;

--
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    followerid integer,
    followingid integer
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- Name: herds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.herds (
    herdid integer NOT NULL,
    name character varying,
    description character varying,
    usercount smallint
);


ALTER TABLE public.herds OWNER TO postgres;

--
-- Name: herds_herdid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.herds_herdid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.herds_herdid_seq OWNER TO postgres;

--
-- Name: herds_herdid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.herds_herdid_seq OWNED BY public.herds.herdid;


--
-- Name: playlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playlists (
    playlistid integer NOT NULL,
    name character varying,
    userid integer,
    herdid integer
);


ALTER TABLE public.playlists OWNER TO postgres;

--
-- Name: playlists_playlistid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.playlists_playlistid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playlists_playlistid_seq OWNER TO postgres;

--
-- Name: playlists_playlistid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.playlists_playlistid_seq OWNED BY public.playlists.playlistid;


--
-- Name: postcomments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.postcomments (
    postcommentid integer NOT NULL,
    postid integer,
    userid integer
);


ALTER TABLE public.postcomments OWNER TO postgres;

--
-- Name: postcomments_postcommentid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.postcomments_postcommentid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.postcomments_postcommentid_seq OWNER TO postgres;

--
-- Name: postcomments_postcommentid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.postcomments_postcommentid_seq OWNED BY public.postcomments.postcommentid;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    postid integer NOT NULL,
    userid integer,
    content character varying,
    likescount integer
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: posts_postid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_postid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_postid_seq OWNER TO postgres;

--
-- Name: posts_postid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_postid_seq OWNED BY public.posts.postid;


--
-- Name: posttags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posttags (
    postid integer NOT NULL
);


ALTER TABLE public.posttags OWNER TO postgres;

--
-- Name: posttags_postid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posttags_postid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posttags_postid_seq OWNER TO postgres;

--
-- Name: posttags_postid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posttags_postid_seq OWNED BY public.posttags.postid;


--
-- Name: songs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.songs (
    mbid integer,
    isrc character varying(12),
    name character varying
);


ALTER TABLE public.songs OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    userid integer NOT NULL,
    name character varying,
    password character(60)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_userid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_userid_seq OWNER TO postgres;

--
-- Name: users_userid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_userid_seq OWNED BY public.users.userid;


--
-- Name: herds herdid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herds ALTER COLUMN herdid SET DEFAULT nextval('public.herds_herdid_seq'::regclass);


--
-- Name: playlists playlistid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists ALTER COLUMN playlistid SET DEFAULT nextval('public.playlists_playlistid_seq'::regclass);


--
-- Name: postcomments postcommentid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postcomments ALTER COLUMN postcommentid SET DEFAULT nextval('public.postcomments_postcommentid_seq'::regclass);


--
-- Name: posts postid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN postid SET DEFAULT nextval('public.posts_postid_seq'::regclass);


--
-- Name: posttags postid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posttags ALTER COLUMN postid SET DEFAULT nextval('public.posttags_postid_seq'::regclass);


--
-- Name: users userid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN userid SET DEFAULT nextval('public.users_userid_seq'::regclass);


--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.albums (mbid, name) FROM stdin;
\.


--
-- Data for Name: artists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.artists (mbid, name) FROM stdin;
\.


--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.follows (followerid, followingid) FROM stdin;
\.


--
-- Data for Name: herds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.herds (herdid, name, description, usercount) FROM stdin;
\.


--
-- Data for Name: playlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playlists (playlistid, name, userid, herdid) FROM stdin;
\.


--
-- Data for Name: postcomments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.postcomments (postcommentid, postid, userid) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (postid, userid, content, likescount) FROM stdin;
\.


--
-- Data for Name: posttags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posttags (postid) FROM stdin;
\.


--
-- Data for Name: songs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.songs (mbid, isrc, name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (userid, name, password) FROM stdin;
2	kara	\N
3	will	\N
4	mikey	\N
5	jaxon	\N
1	wyatt	$2b$12$FKZlu6IK1UPo2u9DBjrenOV1vTUQU0olz4E0tZkNCV28dsgd58H/G
\.


--
-- Name: herds_herdid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.herds_herdid_seq', 1, false);


--
-- Name: playlists_playlistid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playlists_playlistid_seq', 1, false);


--
-- Name: postcomments_postcommentid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.postcomments_postcommentid_seq', 1, false);


--
-- Name: posts_postid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_postid_seq', 1, false);


--
-- Name: posttags_postid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posttags_postid_seq', 1, false);


--
-- Name: users_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_userid_seq', 5, true);


--
-- Name: herds herds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herds
    ADD CONSTRAINT herds_pkey PRIMARY KEY (herdid);


--
-- Name: postcomments postcomments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postcomments
    ADD CONSTRAINT postcomments_pkey PRIMARY KEY (postcommentid);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (postid);


--
-- Name: posttags posttags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posttags
    ADD CONSTRAINT posttags_pkey PRIMARY KEY (postid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- Name: follows follows_followerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_followerid_fkey FOREIGN KEY (followerid) REFERENCES public.users(userid);


--
-- Name: follows follows_followingid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_followingid_fkey FOREIGN KEY (followingid) REFERENCES public.users(userid);


--
-- Name: playlists playlists_herdid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_herdid_fkey FOREIGN KEY (herdid) REFERENCES public.herds(herdid);


--
-- Name: playlists playlists_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: postcomments postcomments_postid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postcomments
    ADD CONSTRAINT postcomments_postid_fkey FOREIGN KEY (postid) REFERENCES public.posts(postid);


--
-- Name: postcomments postcomments_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.postcomments
    ADD CONSTRAINT postcomments_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: posts posts_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- PostgreSQL database dump complete
--

