-- ============================================================
-- Dinesh Portfolio – PostgreSQL Schema
-- Run once against your database:
--   psql -U <user> -d <dbname> -f schema.sql
-- ============================================================

-- Hero section
CREATE TABLE IF NOT EXISTS hero (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL DEFAULT '',
  title     TEXT NOT NULL DEFAULT '',
  subtitle  TEXT NOT NULL DEFAULT '',
  tagline   TEXT NOT NULL DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT true,
  photo_b64 TEXT,                        -- base64 profile photo (optional)
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- About section
CREATE TABLE IF NOT EXISTS about (
  id              SERIAL PRIMARY KEY,
  bio             TEXT NOT NULL DEFAULT '',
  bio2            TEXT NOT NULL DEFAULT '',
  location        TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  experience      TEXT NOT NULL DEFAULT '',
  projects_count  TEXT NOT NULL DEFAULT '',
  ai_models       TEXT NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id         SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  icon       TEXT NOT NULL DEFAULT '',
  name       TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tags       TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  num         TEXT NOT NULL DEFAULT '',
  name        TEXT NOT NULL DEFAULT '',
  type        TEXT NOT NULL DEFAULT '',
  year        TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  link        TEXT NOT NULL DEFAULT '#',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id          SERIAL PRIMARY KEY,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  name        TEXT NOT NULL DEFAULT '',
  issuer      TEXT NOT NULL DEFAULT '',
  year        TEXT NOT NULL DEFAULT '',
  badge       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Resume metadata
CREATE TABLE IF NOT EXISTS resume (
  id               SERIAL PRIMARY KEY,
  file_name        TEXT NOT NULL DEFAULT '',
  file_data        TEXT,                  -- base64 PDF
  education        TEXT NOT NULL DEFAULT '',
  education_years  TEXT NOT NULL DEFAULT '',
  experience       TEXT NOT NULL DEFAULT '',
  experience_years TEXT NOT NULL DEFAULT '',
  certifications   TEXT NOT NULL DEFAULT '',
  cert_years       TEXT NOT NULL DEFAULT '',
  open_source      TEXT NOT NULL DEFAULT '',
  open_source_years TEXT NOT NULL DEFAULT '',
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Contact
CREATE TABLE IF NOT EXISTS contact (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL DEFAULT '',
  linkedin   TEXT NOT NULL DEFAULT '',
  github     TEXT NOT NULL DEFAULT '',
  twitter    TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact messages (submitted via Contact form)
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Seed default data (idempotent via INSERT … ON CONFLICT DO NOTHING) ────

INSERT INTO hero (id, name, title, subtitle, tagline, available)
VALUES (1,
  'Dinesh Yadav',
  'AI & Software Developer',
  'Building intelligent systems that shape the future',
  'Full-Stack • AI/ML • LLM Engineering',
  true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO about (id, bio, bio2, location, email, experience, projects_count, ai_models)
VALUES (1,
  'I''m Dinesh Yadav, an AI & Software Developer with 3+ years of experience building production-grade intelligent systems. I specialise in LLM applications, full-stack web engineering, and ML pipelines — turning complex ideas into elegant, scalable solutions.',
  'My work lives at the intersection of engineering precision and design empathy. Whether it''s fine-tuning a language model or architecting a cloud-native backend, I bring the same obsession with quality to every layer of the stack.',
  'India',
  'dinesh@email.com',
  '3+',
  '20+',
  '8+')
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (sort_order, icon, name, description, tags) VALUES
(1, '🤖', 'AI & Machine Learning',   'LLM pipelines, RAG systems, fine-tuning, and AI agent architectures deployed at scale.',                                    ARRAY['LangChain','OpenAI API','RAG','Hugging Face','Ollama','FAISS']),
(2, '☕', 'Java & Spring Boot',      'Robust RESTful APIs, microservices architecture, Spring Security, JPA/Hibernate.',                                           ARRAY['Java 21','Spring Boot','Spring Security','Hibernate','Maven']),
(3, '🐍', 'Python Backend',          'High-performance async APIs, ML serving, data engineering, and ETL workflows.',                                              ARRAY['Python','FastAPI','Celery','Pandas','SQLAlchemy']),
(4, '⚡', 'Frontend Engineering',    'Modern, responsive web interfaces with pixel-perfect attention to UX and performance.',                                       ARRAY['React','Next.js','TypeScript','Tailwind','Zustand']),
(5, '☁️', 'Cloud & DevOps',          'Cloud infrastructure, containerisation, CI/CD pipelines, and production monitoring.',                                        ARRAY['AWS','Docker','Kubernetes','GitHub Actions','Terraform']),
(6, '🐘', 'PostgreSQL & Databases',  'Advanced relational database design, query optimisation, indexing strategies, and vector extensions for AI-powered search.', ARRAY['PostgreSQL 16','pgvector','Redis','MongoDB','TimescaleDB','Alembic'])
ON CONFLICT DO NOTHING;

INSERT INTO projects (sort_order, num, name, type, year, description, tags, link) VALUES
(1, '01', 'AI Document Assistant',      'AI / Full-Stack',  '2024', 'RAG-powered chatbot enabling natural language Q&A over large document corpora. Processes 10M+ tokens with sub-second latency using vector embeddings and semantic chunking.',                    ARRAY['Python','LangChain','React','Pinecone','FastAPI'], '#'),
(2, '02', 'Intelligent Code Reviewer',  'AI / DevTools',    '2024', 'GitHub bot leveraging LLMs to perform automated code reviews, suggest refactors, and identify security vulnerabilities in pull requests — cutting review time by 60%.',                          ARRAY['Node.js','OpenAI','GitHub API','TypeScript'], '#'),
(3, '03', 'Enterprise Spring Boot API', 'Backend / Java',   '2023', 'Scalable REST API platform serving 100k+ daily requests. Built with Spring Boot, JWT auth, rate limiting, and comprehensive OpenAPI documentation.',                                             ARRAY['Java','Spring Boot','PostgreSQL','Redis','Docker'], '#'),
(4, '04', 'Real-Time Analytics Dashboard', 'Full-Stack',    '2023', 'Full-stack analytics platform with live data streaming, interactive charts, and AI-generated insights. WebSocket-powered real-time updates with sub-100ms latency.',                              ARRAY['React','FastAPI','WebSocket','PostgreSQL'], '#'),
(5, '05', 'LLM Fine-Tuning Pipeline',   'ML Engineering',   '2024', 'End-to-end pipeline for domain-specific LLM fine-tuning — data curation, LoRA training, evaluation, and deployment. Reduced inference costs by 40% vs GPT-4.',                                  ARRAY['Python','HuggingFace','LoRA','AWS SageMaker'], '#')
ON CONFLICT DO NOTHING;

INSERT INTO resume (id, file_name, education, education_years, experience, experience_years, certifications, cert_years, open_source, open_source_years)
VALUES (1,
  '',
  'B.Tech Computer Science', '2018 – 2022',
  '3+ Years Professional',   '2022 – Present',
  'AWS, TensorFlow',         '2023 – 2024',
  '20+ Contributions',       '2022 – Present')
ON CONFLICT (id) DO NOTHING;

INSERT INTO contact (id, email, linkedin, github, twitter)
VALUES (1,
  'dinesh@email.com',
  'linkedin.com/in/dineshyadav',
  'github.com/dineshyadav',
  '@dineshyadav_dev')
ON CONFLICT (id) DO NOTHING;
