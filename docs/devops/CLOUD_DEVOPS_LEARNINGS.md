# CounsConnect — Cloud, Azure & DevOps Learning Log

This document serves as an evolving engineering notebook for **CounsConnect**. It logs every cloud, networking, DevOps, and deployment concept learned and implemented in this project, complete with dates, architecture diagrams, rationales ("Why did we do this?"), and real-world best practices.

---

## Table of Contents
- [Entry 1 — 2026-09-04: Azure NSG, Inbound Firewalls & The Dynamic IP Dilemma](#entry-1--2026-09-04-azure-nsg-inbound-firewalls--the-dynamic-ip-dilemma)
  - [1. What is an Azure Network Security Group (NSG)?](#1-what-is-an-azure-network-security-group-nsg)
  - [2. Anatomy of an Inbound Firewall Rule](#2-anatomy-of-an-inbound-firewall-rule)
  - [3. Supabase Port Architecture](#3-supabase-port-architecture)
  - [4. The Dynamic IP Problem: How to Secure Admin Dashboards](#4-the-dynamic-ip-problem-how-to-secure-admin-dashboards)
  - [5. The Solution: SSH Port Forwarding (Tunneling)](#5-the-solution-ssh-port-forwarding-tunneling)
- [Entry 2 — 2026-09-04: Linux Permissions, Docker Sockets, and Git Shallow Clones](#entry-2--2026-09-04-linux-permissions-docker-sockets-and-git-shallow-clones)
  - [1. The Docker Client-Server Architecture & Unix Sockets](#1-the-docker-client-server-architecture--unix-sockets)
  - [2. Linux Group Management: `usermod -aG` and `newgrp`](#2-linux-group-management-usermod--ag-and-newgrp)
  - [3. Docker Compose V1 vs V2 Plugin](#3-docker-compose-v1-vs-v2-plugin)
  - [4. Cloud Best Practice: Git Shallow Clone (`--depth 1`)](#4-cloud-best-practice-git-shallow-clone---depth-1)
  - [5. The 12-Factor App & `.env.example` Pattern](#5-the-12-factor-app---envexample-pattern)
- [Entry 3 — 2026-09-04: Secrets Architecture, JWT Cryptography, and Row Level Security (RLS)](#entry-3--2026-09-04-secrets-architecture-jwt-cryptography-and-row-level-security-rls)
  - [1. The Cryptographic Spine: `JWT_SECRET`](#1-the-cryptographic-spine-jwt_secret)
  - [2. `ANON_KEY` vs `SERVICE_ROLE_KEY` & RLS Bypass](#2-anon_key-vs-service_role_key--rls-bypass)
  - [3. Cryptographic Entropy: Why `openssl rand -base64 32`?](#3-cryptographic-entropy-why-openssl-rand--base64-32)
  - [4. URL Routing: `SITE_URL` vs `API_EXTERNAL_URL`](#4-url-routing-site_url-vs-api_external_url)
  - [5. Linux Dotfiles: Why `.env` is Hidden in Standard `ls`](#5-linux-dotfiles-why-env-is-hidden-in-standard-ls)
  - [6. Terminal Text Editing: Working with `nano`](#6-terminal-text-editing-working-with-nano)
  - [7. Automated Key Provisioning: `utils/generate-keys.sh`](#7-automated-key-provisioning-utilsgenerate-keyssh)
  - [8. Asymmetric Cryptography & Modern Auth: `utils/add-new-auth-keys.sh`](#8-asymmetric-cryptography--modern-auth-utilsadd-new-auth-keyssh)
- [Entry 4 — 2026-09-05: The `localhost` Trap in Cloud Deployments & External URL Resolution](#entry-4--2026-09-05-the-localhost-trap-in-cloud-deployments--external-url-resolution)
  - [1. What is `localhost` (The Loopback Interface)?](#1-what-is-localhost-the-loopback-interface)
  - [2. The Context Trap: Whose "local" are we talking about?](#2-the-context-trap-whose-local-are-we-talking-about)
  - [3. Why `SUPABASE_PUBLIC_URL=http://localhost:8000` Fails](#3-why-supabase_public_urlhttplocalhost8000-fails)
  - [4. The Fix: Binding to Azure VM's Public IP](#4-the-fix-binding-to-azure-vms-public-ip)
- [Entry 5 — 2026-09-05: Docker Compose Lifecycle, Detached Mode (-d), and Service Discovery](#entry-5--2026-09-05-docker-compose-lifecycle-detached-mode--d-and-service-discovery)
  - [1. Images vs Containers: Blueprints vs Running Processes](#1-images-vs-containers-blueprints-vs-running-processes)
  - [2. Why Run `docker compose pull` Separately?](#2-why-run-docker-compose-pull-separately)
  - [3. Detached Mode (`-d`) & Process Daemonization](#3-detached-mode--d--process-daemonization)
  - [4. Docker Internal Networking & Embedded DNS (Service Discovery)](#4-docker-internal-networking--embedded-dns-service-discovery)
  - [5. Monitoring & Triage: `docker compose ps` and `logs`](#5-monitoring--triage-docker-compose-ps-and-logs)
- [Entry 6 — 2026-09-05: API Gateway Health Checks and Secure Studio Access](#entry-6--2026-09-05-api-gateway-health-checks-and-secure-studio-access)
  - [1. End-to-End API Health Checks via cURL](#1-end-to-end-api-health-checks-via-curl)
  - [2. PostgREST OpenAPI Schema Introspection](#2-postgrest-openapi-schema-introspection)
  - [3. Establishing the SSH Tunnel for Supabase Studio](#3-establishing-the-ssh-tunnel-for-supabase-studio)
  - [4. Next Phase: Executing Schema Migrations & RLS](#4-next-phase-executing-schema-migrations--rls)
- [Entry 7 — 2026-09-05: The "Unauthorized" (HTTP 401) Milestone & API Gateway Key Enforcement](#entry-7--2026-09-05-the-unauthorized-http-401-milestone--api-gateway-key-enforcement)
  - [1. Why "Unauthorized" is a Complete Networking Victory](#1-why-unauthorized-is-a-complete-networking-victory)
  - [2. Transport Errors vs Application Errors (OSI Model Distinction)](#2-transport-errors-vs-application-errors-osi-model-distinction)
  - [3. Envoy API Gateway: Header-Based Authentication (`apikey`)](#3-envoy-api-gateway-header-based-authentication-apikey)
  - [4. Authenticating the cURL Request](#4-authenticating-the-curl-request)
- [Entry 8 — 2026-09-05: SSH Tunnel Execution Context & Host Key Verification](#entry-8--2026-09-05-ssh-tunnel-execution-context--host-key-verification)
  - [1. The Execution Context: Client vs Remote VM](#1-the-execution-context-client-vs-remote-vm)
  - [2. Private Key Locality: Where your `.pem` File Lives](#2-private-key-locality-where-your-pem-file-lives)
  - [3. SSH Host Key Fingerprints & TOFU (Trust On First Use)](#3-ssh-host-key-fingerprints--tofu-trust-on-first-use)
- [Entry 9 — 2026-09-05: Container Port vs Host Binding & Unified Port 8000 Architecture](#entry-9--2026-09-05-container-port-vs-host-binding--unified-port-8000-architecture)
  - [1. Diagnosing `channel open failed: connect failed: Connection refused`](#1-diagnosing-channel-open-failed-connect-failed-connection-refused)
  - [2. Reading `docker compose ps` Ports: Exposed vs Mapped](#2-reading-docker-compose-ps-ports-exposed-vs-mapped)
  - [3. The Modern Unified Gateway Pattern (Envoy on Port 8000)](#3-the-modern-unified-gateway-pattern-envoy-on-port-8000)
  - [4. Accessing Supabase Studio via Port 8000](#4-accessing-supabase-studio-via-port-8000)
- [Entry 10 — 2026-09-05: Database Migrations, Relational Modeling & Row Level Security (RLS)](#entry-10--2026-09-05-database-migrations-relational-modeling--row-level-security-rls)
  - [1. Relational Data Integrity vs NoSQL Silos](#1-relational-data-integrity-vs-nosql-silos)
  - [2. Foreign Key Constraints & Cascading (`ON DELETE CASCADE`)](#2-foreign-key-constraints--cascading-on-delete-cascade)
  - [3. Declarative Security: How RLS Replaces Backend Middleware](#3-declarative-security-how-rls-replaces-backend-middleware)
  - [4. The `auth.uid()` Bridge: Linking JWTs to SQL Policies](#4-the-authuid-bridge-linking-jwts-to-sql-policies)
- [Entry 11 — 2026-09-05: The RLS Security Posture: Default-Allow vs Default-Deny](#entry-11--2026-09-05-the-rls-security-posture-default-allow-vs-default-deny)
  - [1. Why Supabase Flags "Potential Issue Detected"](#1-why-supabase-flags-potential-issue-detected)
  - [2. Default-Allow vs Default-Deny: The Security Flip](#2-default-allow-vs-default-deny-the-security-flip)
  - [3. The Two-Step Security Pattern: Lock the Door, Then Hand Out Keys](#3-the-two-step-security-pattern-lock-the-door-then-hand-out-keys)
- [Entry 12 — 2026-09-06: Frontend Cloud Integration: Client-Side Bundling & Environment Prefixes](#entry-12--2026-09-06-frontend-cloud-integration-client-side-bundling--environment-prefixes)
  - [1. Build-Time Inlining: Why Standard `.env` Fails in Browsers](#1-build-time-inlining-why-standard-env-fails-in-browsers)
  - [2. The Framework Prefix Convention (`NEXT_PUBLIC_` & `EXPO_PUBLIC_`)](#2-the-framework-prefix-convention-next_public_--expo_public_)
  - [3. Key Security: Why `ANON_KEY` is Safe in Bundles vs `SERVICE_ROLE_KEY`](#3-key-security-why-anon_key-is-safe-in-bundles-vs-service_role_key)
  - [4. Production Milestone: Domain Names & TLS/HTTPS Reverse Proxies](#4-production-milestone-domain-names--tlshttps-reverse-proxies)
- [Entry 13 — 2026-09-06: The HTTPS / TLS Dilemma: Why Bare IPs Lack SSL & The Mixed Content Trap](#entry-13--2026-09-06-the-https--tls-dilemma-why-bare-ips-lack-ssl--the-mixed-content-trap)
  - [1. HTTP vs HTTPS: The TLS Handshake & CA Signatures](#1-http-vs-https-the-tls-handshake--ca-signatures)
  - [2. Why Free Certificate Authorities (Let's Encrypt) Require Domain Names](#2-why-free-certificate-authorities-lets-encrypt-require-domain-names)
  - [3. The Browser "Mixed Content" Blocker (The Production Trap)](#3-the-browser-mixed-content-blocker-the-production-trap)
  - [4. The Solution: TLS Termination via Nginx Reverse Proxy](#4-the-solution-tls-termination-via-nginx-reverse-proxy)
- [Entry 14 — 2026-09-06: Auth Service Configuration: Email Autoconfirm & Profile Triggers](#entry-14--2026-09-06-auth-service-configuration-email-autoconfirm--profile-triggers)
  - [1. Diagnosing `Error sending confirmation email`](#1-diagnosing-error-sending-confirmation-email)
  - [2. The Setting: `ENABLE_EMAIL_AUTOCONFIRM=true`](#2-the-setting-enable_email_autoconfirmtrue)
  - [3. Zero-Downtime Container Re-creation via Docker Compose](#3-zero-downtime-container-re-creation-via-docker-compose)
  - [4. The Profile Sync Trigger: Automating `auth.users` to `public.profiles`](#4-the-profile-sync-trigger-automating-authusers-to-publicprofiles)
- [Entry 15 — 2026-09-06: Database Integrity: Check Constraints & Form Value Mapping](#entry-15--2026-09-06-database-integrity-check-constraints--form-value-mapping)
  - [1. What is a PostgreSQL `CHECK` Constraint?](#1-what-is-a-postgresql-check-constraint)
  - [2. Diagnosing `violates check constraint "clients_marital_status_check"`](#2-diagnosing-violates-check-constraint-clients_marital_status_check)
  - [3. The Root Cause: Display Labels vs Serialized Wire Values](#3-the-root-cause-display-labels-vs-serialized-wire-values)
  - [4. The Two-Pronged Solution (Frontend Mapping & Resilient DDL)](#4-the-two-pronged-solution-frontend-mapping--resilient-ddl)
- [Entry 16 — 2026-09-06: Verification Testing, Real-Time Sync & The Production Deployment Pipeline](#entry-16--2026-09-06-verification-testing-real-time-sync--the-production-deployment-pipeline)
  - [1. The Multi-Tier Verification Strategy: Why Test Before Deploy](#1-the-multi-tier-verification-strategy-why-test-before-deploy)
  - [2. PostgreSQL Logical Replication & The Realtime WebSocket Engine](#2-postgresql-logical-replication--the-realtime-websocket-engine)
  - [3. The Production Deployment Architecture: Vercel, TLS & Reverse Proxy](#3-the-production-deployment-architecture-vercel-tls--reverse-proxy)
  - [4. Mobile Release Engineering: Expo Go vs Standalone APK (EAS)](#4-mobile-release-engineering-expo-go-vs-standalone-apk-eas)
- [Entry 17 — 2026-09-06: Containerized Web Deployment, Loopback Security & Build-Time Secrets](#entry-17--2026-09-06-containerized-web-deployment-loopback-security--build-time-secrets)
  - [1. The "All-in-One VM" Architecture & Co-located Microservices](#1-the-all-in-one-vm-architecture--co-located-microservices)
  - [2. Next.js Standalone Dockerization: Tracing & Multi-Stage Compilation](#2-nextjs-standalone-dockerization-tracing--multi-stage-compilation)
  - [3. Build-Time vs Runtime Secrets: How Docker Inlines `NEXT_PUBLIC_*`](#3-build-time-vs-runtime-secrets-how-docker-inlines-next_public_)
  - [4. The Loopback Security Barrier (`127.0.0.1` vs `0.0.0.0`) & Why Port 3000 Stays Closed](#4-the-loopback-security-barrier-127001-vs-0000--why-port-3000-stays-closed)

---

## Entry 1 — 2026-09-04: Azure NSG, Inbound Firewalls & The Dynamic IP Dilemma

### 1. What is an Azure Network Security Group (NSG)?
An **NSG** is a stateful virtual packet-filtering firewall attached to your Virtual Machine's Network Interface Card (NIC) or Subnet in Azure.

* **Default Security Stance (Zero Trust):** By default, Azure includes a baseline rule: `DenyAllInBound` (Priority 65500). Any outside packet hitting your VM's public IP is silently dropped unless you explicitly define an `Allow` rule with a higher priority (lower number).
* **Evaluation Priority:** Rules are evaluated strictly sequentially from smallest number to largest (e.g., Priority 300 is evaluated before 350). **The first rule that matches the incoming packet decides its fate**, and subsequent rules are ignored.

```
Incoming Internet Packet
          │
          ▼
   [Priority 300: HTTP (80)]  ─── Match? ──► ALLOW
          │ No
          ▼
   [Priority 320: HTTPS (443)] ─── Match? ──► ALLOW
          │ No
          ▼
   [Priority 340: SSH (22)]   ─── Match? ──► ALLOW
          │ No
          ▼
   [Priority 350: Kong (8000)]─── Match? ──► ALLOW
          │ No
          ▼
   [Priority 65500: DenyAll]  ─────────────► DROP / BLOCK
```

---

### 2. Anatomy of an Inbound Firewall Rule

Every rule configuration form asks for 8 key parameters. Understanding the network physics behind them avoids blind clicks:

| Setting | Technical Definition | What to Choose & Why |
|---|---|---|
| **Source** | The origin IP address or network CIDR range initiating the packet. | <ul><li>`Any`: Open to the entire global internet (0.0.0.0/0). Used for public APIs and websites.</li><li>`IP Addresses`: Locked down to specific client IPs (e.g. your home Wi-Fi).</li></ul> |
| **Source Port Ranges** | The ephemeral port assigned by the client's OS. | Always **`*`**. When your laptop browser connects to a website, your OS randomly assigns a client port (e.g., 52144) to send the request. You cannot predict this port, so it must remain wildcard (`*`). |
| **Destination** | The target inside the Azure network. | **`Any`** or VM private IP. Specifies that packets arriving at this VM's network interface match this rule. |
| **Service** | Azure UI presets (shortcuts for well-known ports). | **`Custom`** when using application-specific ports (like Supabase 8000 or 3000) that Azure doesn't have a template for. |
| **Destination Port Ranges** | The exact port your server software is listening on. | The port bound to the host (e.g., `8000` for Kong, `22` for SSH). *Never confuse client port with server destination port.* |
| **Protocol** | Transport layer protocol (Layer 4 in OSI model). | **`TCP`** for web services (HTTP, REST, WebSockets, SSH). TCP provides reliable, ordered byte streams. UDP is reserved for streaming, DNS, and VoIP. |
| **Action** | What the firewall does upon a match. | **`Allow`** or **`Deny`**. |
| **Priority** | Execution order (100 to 4096). | Must be lower than 65500. Increment by 10s or 20s (e.g., 300, 320, 340, 350) to leave space for future rules in between. |

---

### 3. Supabase Port Architecture

In self-hosted Supabase, multiple microservices run in Docker. Understanding what listens on which port dictates what you expose:

```
                          Internet / Clients
                                  │
          ┌───────────────────────┴───────────────────────┐
          │                                               │
     Port 8000 (Kong API Gateway)            Port 3000 (Supabase Studio)
     [EXPOSED PUBLICLY]                      [PRIVATE / RESTRICTED]
          │                                               │
    Routing Layer                                    Admin Web GUI
   ┌──────┴─────────────────────────┐                     │
   ▼              ▼                 ▼                     │
GoTrue         PostgREST         Realtime                 │
(Auth)         (Auto-REST)      (WebSockets)              │
   │              │                 │                     │
   └──────────────┼─────────────────┘                     │
                  ▼                                       ▼
          PostgreSQL Database ◄───────────────────────────┘
              (Port 5432 - NEVER exposed to public internet!)
```

* **Port 22 (SSH):** Administration entry point into the Ubuntu OS.
* **Port 80 (HTTP):** Required initially for Let's Encrypt ACME SSL challenges; later redirects to 443.
* **Port 443 (HTTPS):** Standard encrypted production traffic.
* **Port 8000 (Kong Gateway):** The front door for all your application's data. Next.js on Vercel talks to this port to query the database, authenticate users, and listen to realtime changes.
* **Port 3000 (Supabase Studio):** The internal admin dashboard (tables, SQL editor, storage buckets). **Must never be left open to `Any`** because it provides administrative control over your database.
* **Port 5432 (PostgreSQL):** Internal Docker network only. External apps should talk through Kong or an encrypted connection pooler, never directly to raw Postgres over the open internet.

---

### 4. The Dynamic IP Problem: How to Secure Admin Dashboards

#### The Dilemma:
* Restricting an Azure NSG rule to your personal IP (`Source: IP Addresses`) sounds great, but **home and mobile Wi-Fi IPs are dynamic**.
* Most residential ISPs reassign your public IP every few hours or whenever the router restarts.
* If you hardcode your IP into Azure NSG, you get locked out the moment your IP changes. Leaving it open to `Any` leaves an administrative backdoor exposed to internet crawlers.

#### The Solutions:
1. **SSH Port Forwarding / Tunneling (Best Practice & Zero Setup)** — Explained below.
2. **Tailscale / WireGuard (Mesh VPN):** Connects Mac and VM into an encrypted private mesh network without opening any firewall ports on Azure.
3. **Cloudflare Tunnel (`cloudflared`):** Outbound-only tunnel exposing a subdomain (e.g., `studio.yourdomain.com`) protected by Cloudflare Access (Google/email OAuth).

---

### 5. The Solution: SSH Port Forwarding (Tunneling)

Instead of opening Port 3000 on Azure NSG, **keep Port 3000 completely closed to the internet**. You access it using an encrypted SSH tunnel.

#### Architecture:
```
Your Local Mac                                                Azure VM
┌─────────────────────────┐                     ┌────────────────────────────────┐
│ Browser:                │                     │                                │
│ http://localhost:3000   │                     │                                │
│       │                 │                     │                                │
│       ▼                 │                     │                                │
│ Local Port 3000         │   SSH Tunnel        │                                │
│       │                 │   (Port 22, SSL)    │                                │
│       └─────────────────┼────────────────────►│ Port 22 (sshd)                 │
│                         │                     │      │                         │
│                         │                     │      ▼ Forwarded internally    │
│                         │                     │ localhost:3000 (Docker Studio) │
└─────────────────────────┘                     └────────────────────────────────┘
```

#### How to run it:
From your local Mac terminal:
```bash
ssh -i /path/to/your-key.pem -L 3000:localhost:3000 azureuser@YOUR_VM_PUBLIC_IP
```

* **Command Breakdown:**
  * `-i /path/to/your-key.pem`: Uses your cryptographic private key.
  * `-L 3000:localhost:3000`: "Listen on local port 3000 of my Mac, tunnel the packets through SSH, and deliver them to port 3000 on the VM."
* Open `http://localhost:3000` in Chrome on your Mac — the Supabase Studio dashboard loads seamlessly as if it were running directly on your laptop!

#### Why Port 22 (SSH) is safe with dynamic IPs:
* Unlike web passwords which can be brute-forced, SSH keys (2048/4096-bit RSA or Ed25519) cannot be brute-forced within any realistic timeframe.
* As long as `PasswordAuthentication no` is set in `/etc/ssh/sshd_config`, an open Port 22 is cryptographically secured.

---

## Entry 2 — 2026-09-04: Linux Permissions, Docker Sockets, and Git Shallow Clones

### 1. The Docker Client-Server Architecture & Unix Sockets
Docker is **not** a single monolithic program. It uses a client-server model:
* **The Server (`dockerd`):** The persistent daemon running in the background with `root` privileges. It handles containers, images, networks, and disk storage.
* **The Client (`docker`):** The command-line utility you type into your terminal.

```
Your Terminal User (counsconnect)
          │
          ▼
   Docker CLI (`docker ps`)
          │ (communicates over Unix Socket)
          ▼
   /var/run/docker.sock  [Permissions: srw-rw---- root:docker]
          │
          ▼
   Docker Daemon (`dockerd` running as root)
```

**The Permission Dilemma:**
The Unix socket `/var/run/docker.sock` is owned by `root` and the `docker` group. If your user account (`counsconnect`) is not in the `docker` group, typing `docker ps` results in:
`Got permission denied while trying to connect to the Docker daemon socket...`

Running `sudo docker` every single time is bad practice because:
1. Containers and volumes inadvertently get created with root-only file ownership.
2. CLI automations and scripts would require root access, breaking the principle of least privilege.

---

### 2. Linux Group Management: `usermod -aG` and `newgrp`

To grant your normal user access to Docker without `sudo`, you run two commands:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### Detailed Breakdown:
* **`usermod` (User Modify):** The Linux binary used to change user attributes.
* **`-a` (Append):** **CRITICAL flag.** Linux users can belong to multiple groups (like `sudo`, `adm`, `counsconnect`). If you omit `-a` and only type `-G docker`, Linux will **replace all your existing groups with just docker**, stripping away your `sudo` privileges and locking you out of root actions!
* **`-G docker`:** Specifies the supplementary group to add the user to.
* **`$USER`:** A built-in shell environment variable that evaluates to your current username (`counsconnect`).
* **Why `newgrp docker`?**
  * In Linux, group permissions are loaded into memory when an SSH session starts. Normally, after modifying groups, you must log out (disconnect SSH) and log back in.
  * `newgrp docker` immediately reloads the group membership into the current running shell session without dropping your SSH connection.

---

### 3. Docker Compose V1 vs V2 Plugin
In older tutorials, you will often see:
```bash
docker-compose up -d  # Old Compose V1 (Deprecated)
```
* **Compose V1:** Was an independent Python binary called `docker-compose` (with a hyphen). It was slow, required Python dependencies, and had to be installed separately.
* **Compose V2:** Completely rewritten in Go by the Docker core team. It is now a native Docker CLI plugin:
```bash
docker compose up -d  # Modern Compose V2 (Space, no hyphen)
```
When we ran `curl -fsSL https://get.docker.com | sh`, the official script automatically installed `docker-compose-plugin`, giving you modern Compose V2 out of the box.

---

### 4. Cloud Best Practice: Git Shallow Clone (`--depth 1`)

In Step 3 of the setup, we download Supabase using:
```bash
git clone --depth 1 https://github.com/supabase/supabase
```

#### Why `--depth 1`?
* Supabase is a massive monorepo with 5+ years of active development, thousands of contributors, and hundreds of thousands of commits.
* A standard `git clone` downloads the entire repository history (every version of every file ever committed). This would download ~500 MB to 1 GB of data you will never need on a production server.
* **`--depth 1` creates a "shallow clone":** Git only downloads the single latest snapshot (HEAD commit) without any commit history.
* **Result:** The download takes ~5 seconds instead of 2 minutes, saving cloud bandwidth, CPU, and VM disk space.

---

### 5. The 12-Factor App & `.env.example` Pattern

In Step 3, we execute:
```bash
cd supabase/docker
cp .env.example .env
```

* **Why the `docker` subdirectory?**
  Supabase is open-source. The root of the repository contains their frontend apps, documentation, and client libraries. The production Docker Compose orchestration files live specifically in `supabase/docker/`.
* **The 12-Factor App Rule (Config in Environment):**
  A core cloud-native engineering principle is: **Code and Configuration must be strictly separated.**
  * `.env`: The actual active configuration file created on the server. It contains the real production secrets (DB password, JWT secret, API keys). **This file is git-ignored and must never be pushed to a public repository.**

---

## Entry 3 — 2026-09-04: Secrets Architecture, JWT Cryptography, and Row Level Security (RLS)

### 1. The Cryptographic Spine: `JWT_SECRET`
In Supabase, identity and authorization are governed by **JSON Web Tokens (JWT)** signed via symmetric cryptography (**HMAC-SHA256**).

#### How a JWT Works:
A JWT is composed of three Base64URL-encoded parts separated by dots (`header.payload.signature`):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.SIGNATURE
      [ Header: Alg & Type ]          .              [ Claims Payload ]             . [ Cryptographic Hash ]
```
The signature is generated as:
$$\text{Signature} = \text{HMAC-SHA256}(\text{Header} + \text{"."} + \text{Payload}, \text{JWT\_SECRET})$$

#### Why `JWT_SECRET` is the Most Sensitive Key:
* The PostgREST API and GoTrue verify incoming tokens using this secret.
* **If an attacker steals your `JWT_SECRET`**, they can forge their own tokens locally, claim to be an administrator, or assign themselves the `service_role`. They gain unrestricted read/write access to your database without ever touching your login screen.
* **Requirement:** Must be at least 32 characters (256 bits) to prevent brute-force hash-cracking attacks.

---

### 2. `ANON_KEY` vs `SERVICE_ROLE_KEY` & RLS Bypass

Supabase decouples client access using two specialized JWT tokens, both signed with your `JWT_SECRET`:

```
                             Frontend Client (Browser / Mobile)
                                            │
                                  Sends ANON_KEY (JWT)
                                            ▼
                                   Kong API Gateway
                                            ▼
                                  PostgREST / Postgres
                                            ▼
                             [Evaluates Row Level Security (RLS)]
                                            │
                       ┌────────────────────┴────────────────────┐
                       ▼                                         ▼
           Matches RLS Policy?                       No Matching Policy?
            Data is Returned                             Returns [ ] (Blocked)
```

```
                             Backend Server (Next.js API Route)
                                            │
                             Sends SERVICE_ROLE_KEY (JWT)
                                            ▼
                                   Kong API Gateway
                                            ▼
                                  PostgREST / Postgres
                                            ▼
                             [BYPASSES ROW LEVEL SECURITY (RLS)]
                                            ▼
                            Full Unrestricted Access to Tables
```

| Key | Encoded Role | Where it Lives | Security Implication |
|---|---|---|---|
| **`ANON_KEY`** | `role: "anon"` | Frontend browser code, mobile apps, public repositories. | **Safe to expose publicly.** Does not allow raw database access; PostgreSQL enforces **Row Level Security (RLS)** on every query. If no policy allows access, 0 rows are returned. |
| **`SERVICE_ROLE_KEY`** | `role: "service_role"` | Server-side only (Next.js server actions, API routes, cron workers). | **NEVER expose to browser.** It completely bypasses all RLS policies in PostgreSQL. It is equivalent to a superadmin key. |

---

### 3. Cryptographic Entropy: Why `openssl rand -base64 32`?

When configuring passwords and secrets, human-generated strings (e.g., `Password123!`) suffer from low entropy and are vulnerable to dictionary attacks and rainbow tables.

```bash
openssl rand -base64 32
```
* **`openssl rand`**: Draws raw randomness directly from the Linux kernel's Cryptographically Secure Pseudo-Random Number Generator (CSPRNG) pool (`/dev/urandom`).
* **Kernel Entropy:** The OS gathers hardware noise (disk access timing, CPU interrupts, thermal fluctuations) to generate unpredictable bits.
* **`32`**: 32 bytes = 256 bits of pure entropy (mathematically unguessable).
* **`-base64`**: Encodes the raw binary bytes into a URL-safe, printable ASCII string (`A-Z`, `a-z`, `0-9`, `+`, `/`).

---

### 4. URL Routing: `SITE_URL` vs `API_EXTERNAL_URL`

* **`SITE_URL` (Frontend URL):**
  * Tells the GoTrue authentication server where your actual user-facing web app lives (e.g., `http://YOUR_VM_IP:8000` or `https://counsconnect.vercel.app`).
  * Used to generate email verification links and password reset links (e.g., `<SITE_URL>/auth/callback?token=xyz`).
* **`API_EXTERNAL_URL` (Backend API URL):**
  * Tells internal Supabase microservices (Kong, GoTrue, Realtime) how external clients reach the API gateway (e.g., `http://YOUR_VM_IP:8000`).

---

### 5. Linux Dotfiles: Why `.env` is Hidden in Standard `ls`

In your terminal output, you ran `ls` and saw `docker-compose.yml`, `README.md`, etc., but not `.env`.

* **The Dotfile Convention:** In Unix and Linux systems, any file or folder whose name begins with a period (`.`) is designated as a **hidden file** (dotfile).
* **Why?** Operating systems and developer tools use dotfiles for configuration (e.g., `.bashrc`, `.git`, `.env`, `.gitignore`). Standard `ls` hides them to avoid cluttering your daily file view.
* **The Flag:** Run `ls -la` or `ls -a`:
  * `-a` (`--all`): Tells `ls` not to ignore entries starting with `.`.
  * `-l` (long format): Shows file permissions, ownership (`root`/`counsconnect`), file size, and modification dates.

---

### 6. Terminal Text Editing: Working with `nano`

Because cloud VMs are headless (they have no desktop GUI, monitor, or mouse window), editing configuration files is done directly within the terminal shell.

* **`nano .env`**: Opens the simple terminal-based text editor.
* **Key Shortcuts in Nano:**
  * Arrow keys: Move the cursor.
  * `Ctrl + W`: Search / Find a specific string (e.g., search for `JWT_SECRET`).
  * `Ctrl + O` followed by `Enter`: **WriteOut** (Save changes to disk).
  * `Ctrl + X`: **Exit** nano back to the shell prompt.

---

### 7. Automated Key Provisioning: `utils/generate-keys.sh`

In older Supabase setups, users had to copy-paste secrets into a web browser tool. Supabase deprecated that web form for two big reasons:
1. **Security hygiene:** Pasting master JWT secrets into a web browser violates zero-leakage security practices.
2. **Modern self-hosting automation:** Supabase now provides utility scripts directly inside the repository (`docker/utils/`).

#### How `sh utils/generate-keys.sh` Works Internally:
Located right inside your `~/supabase/supabase/docker/utils` directory, this shell script:
1. Calls `openssl rand -base64 30` to generate a secure `JWT_SECRET`.
2. Generates the standard base64-encoded JWT header: `{"alg":"HS256","typ":"JWT"}`.
3. Generates the JSON payloads for `anon` (`role: anon`) and `service_role` (`role: service_role`).
4. Signs them locally inside Linux using OpenSSL HMAC-SHA256:
   ```bash
   signature=$(printf %s "$signed_content" | openssl dgst -binary -sha256 -hmac "$jwt_secret" | base64_url_encode)
   ```
5. Assembles the complete RFC 7519 JWT tokens (`header.payload.signature`).
6. When run with `--update-env`, it automatically writes these generated secrets directly into `.env`, eliminating human copy-paste errors!

---

### 8. Asymmetric Cryptography & Modern Auth: `utils/add-new-auth-keys.sh`

The second script visible in Supabase's documentation is `sh utils/add-new-auth-keys.sh`.

#### Why Did Supabase Introduce This?
* **Legacy Symmetric Signing (HS256):** Both signing and verification use the exact same secret (`JWT_SECRET`). If a microservice needs to verify if a token is valid, it must possess the master secret. If that microservice is ever compromised, the entire database secret is compromised.
* **Modern Asymmetric Signing (ES256 / Elliptic Curve):**
  * Uses a **Private Key** (held exclusively by GoTrue to sign user tokens).
  * Uses a **Public Key (JWKS — JSON Web Key Set)** shared across Kong, PostgREST, and external microservices. Microservices can mathematically verify that a token was issued by Supabase without ever having access to the private signing secret!
* **`utils/add-new-auth-keys.sh`** generates an EC P-256 key pair, creates the new publishable/secret keys, and updates your `.env` to support this newer security architecture.

---

## Entry 4 — 2026-09-05: The `localhost` Trap in Cloud Deployments & External URL Resolution

### 1. What is `localhost` (The Loopback Interface)?
In networking, `localhost` (IP address `127.0.0.1`) is the **loopback network interface**. 
It literally means: *"Route this network packet back to the very same machine that sent it, without ever sending it through a physical network card or out to the internet."*

---

### 2. The Context Trap: Whose "local" are we talking about?

In modern cloud and distributed architectures, `localhost` is dangerous because the definition of "local" changes depending on which machine or container is speaking:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Your Mac Laptop (Browser):                              │
│    `localhost:8000` = Searches for a server on YOUR LAPTOP. │
│    It cannot see the Azure VM!                              │
└─────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Azure Virtual Machine (Host OS):                         │
│    `localhost:8000` = The ports mapped to Docker on the VM. │
└─────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Docker Container (e.g. GoTrue Auth or Kong):             │
│    `localhost:8000` = Looks INSIDE that single container!   │
│    It cannot even see other containers unless bridged.      │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Why `SUPABASE_PUBLIC_URL=http://localhost:8000` Fails

When `SUPABASE_PUBLIC_URL` is set to `http://localhost:8000`:
1. **Frontend App Failure:** When your Next.js web application (running locally or deployed on Vercel) tries to fetch data or authenticate, it receives API links directing it to `http://localhost:8000`. The user's browser attempts to connect to `localhost:8000` on *their own device*, causing `ERR_CONNECTION_REFUSED`.
2. **Auth & OAuth Failure:** When Supabase GoTrue generates email verification links, magic links, or OAuth callbacks (Google, GitHub), it generates URLs like:
   `http://localhost:8000/auth/v1/verify?token=...`
   If a user clicks that link on their smartphone or laptop, their device searches for a local server on port 8000 and fails completely.

---

### 4. The Fix: Binding to Azure VM's Public IP

In `.env`, any URL intended for external clients must use the **Public IP of your Azure VM** (or your registered domain name):

```env
# Change this:
SUPABASE_PUBLIC_URL=http://localhost:8000
API_EXTERNAL_URL=http://localhost:8000/auth/v1

# To this:
SUPABASE_PUBLIC_URL=http://YOUR_AZURE_VM_PUBLIC_IP:8000
API_EXTERNAL_URL=http://YOUR_AZURE_VM_PUBLIC_IP:8000/auth/v1
```
*(Example: `http://20.198.45.120:8000` — replace with your real Azure VM public IP, with NO trailing slash).*

---

## Entry 5 — 2026-09-05: Docker Compose Lifecycle, Detached Mode (-d), and Service Discovery

### 1. Images vs Containers: Blueprints vs Running Processes
In containerized cloud architecture, understanding the distinction between an **Image** and a **Container** is fundamental:

| Concept | What It Is | Analogy | Storage Location |
|---|---|---|---|
| **Docker Image** | An immutable, read-only package containing application binaries, system libraries, and runtime dependencies (e.g. `supabase/postgres:15.8.1`). | Blueprint / Class | Stored on disk (`/var/lib/docker/overlay2`) |
| **Docker Container** | A running, stateful, isolated process instance created from an image. Has its own virtual network interface, PID namespace, and writable scratch layer. | Building / Object Instance | Executes in RAM & CPU |

---

### 2. Why Run `docker compose pull` Separately?

`docker compose up` automatically downloads any missing images. However, in production microservice architectures, we **always run `docker compose pull` first as a distinct step**:

1. **Complex Multi-Service Size:** Supabase consists of ~12 different microservices (`postgres`, `gotrue`, `postgrest`, `realtime`, `storage`, `kong`, `studio`, `supavisor`, `vector`, etc.) totaling several gigabytes of download data.
2. **Avoiding Race Conditions & Timeouts:** If you execute `docker compose up` directly, services with fast image downloads may spin up and try to connect to dependencies (e.g., GoTrue attempting to connect to PostgreSQL) while the PostgreSQL multi-gigabyte image is still downloading, triggering startup crash-loops.
3. **Clean Visual Progress:** `pull` cleanly displays the download and extraction progress bar for each layer.

---

### 3. Detached Mode (`-d`) & Process Daemonization

```bash
docker compose up -d
```

* **Foreground Execution (without `-d`):**
  * Attaches standard input/output (`stdout`/`stderr`) of all 12 containers directly to your active SSH terminal window.
  * **The Fatal Flaw:** If your Wi-Fi drops, your SSH session times out, or you press `Ctrl + C`, the operating system sends a termination signal (`SIGINT`) to Docker, immediately killing all containers!
* **Detached Execution (`-d` flag):**
  * Tells the Docker daemon (`dockerd`) to detach the processes from your terminal session and run them as background daemons.
  * Your terminal prompt is freed immediately.
  * The containers continue executing persistently 24/7 on the Azure VM even if you log out of SSH or power down your laptop.

---

### 4. Docker Internal Networking & Embedded DNS (Service Discovery)

When you run `docker compose up`, Docker automatically sets up a dedicated software-defined bridge network (e.g., `docker_default`).

```
                      Docker Bridge Network (Internal DNS: 127.0.0.11)
                     ┌───────────────────────────────────────────────┐
                     │                                               │
   [Kong Gateway] ───┼──► Resolves "auth" ───► [GoTrue Auth:9999]    │
   (Port 8000 host)  │                                               │
                     │                                               │
                     ├──► Resolves "rest" ───► [PostgREST:3000]      │
                     │                                               │
                     │                                               │
                     └──► Resolves "db"   ───► [PostgreSQL:5432]     │
                                                                     │
                     └───────────────────────────────────────────────┘
```

* **Embedded DNS (`127.0.0.11`):** Docker runs an internal DNS resolver inside the bridge network.
* **Service Name Discovery:** Instead of needing static internal IP addresses, containers refer to one another by their YAML service keys:
  * In `.env`, `POSTGRES_HOST=db` tells GoTrue to ask Docker's DNS: *"What is the IP of `db`?"*
  * Docker resolves it to the internal container IP on the fly.

---

### 5. Monitoring & Triage: `docker compose ps` and `logs`

Once the stack is launched, you manage and verify it using:

```bash
# Check status of all containers
docker compose ps

# View the last 50 log lines of a specific failing service
docker compose logs <service-name> --tail=50

# Follow live output streams of all services in real time
docker compose logs -f
```

---

## Entry 6 — 2026-09-05: API Gateway Health Checks and Secure Studio Access

### 1. End-to-End API Health Checks via cURL
Once the container stack is up and healthy, we test network ingress from the public internet using `curl`:

```bash
curl http://YOUR_VM_PUBLIC_IP:8000/rest/v1/
```

#### What this request verifies:
1. **Azure NSG Firewall (Port 8000):** Validates that incoming traffic through Azure's virtual firewall is successfully reaching the VM.
2. **API Gateway (Envoy / Kong):** Confirms that the reverse proxy is listening on host port `8000` and routing `/rest/v1/` to the internal `rest` container on the Docker bridge network.
3. **PostgREST Execution:** Confirms that the PostgREST binary is connected to PostgreSQL and actively generating REST endpoints from the database schema.

---

### 2. PostgREST OpenAPI Schema Introspection
When you hit `/rest/v1/` with a `GET` request without specifying a table, PostgREST returns an **OpenAPI (Swagger 2.0) JSON specification**:
* It lists all tables, column datatypes, primary keys, and relationships present in the database.
* When this JSON returns, it proves that PostgreSQL, PostgREST, and Envoy are functioning in complete harmony.

---

### 3. Establishing the SSH Tunnel for Supabase Studio

As established in **Entry 1**, Port 3000 (Supabase Studio) is kept **closed on Azure NSG** to protect the database administration GUI from internet crawlers and brute-force attacks.

#### Running the Tunnel:
On your **local Mac terminal** (not inside the VM):
```bash
ssh -i /path/to/your-key.pem -L 3000:localhost:3000 counsconnect@YOUR_VM_PUBLIC_IP
```

* **What happens:** Your local Mac binds port `3000` to a secure encrypted tunnel terminating at `localhost:3000` on the Azure VM.
* In your Mac browser, open: `http://localhost:3000`
* You authenticate with `DASHBOARD_USERNAME` (`supabase`) and `DASHBOARD_PASSWORD`.

---

### 4. Next Phase: Executing Schema Migrations & RLS

Inside Supabase Studio, you have a visual SQL Editor:
1. **Schema Migration:** Executes DDL (`CREATE TABLE`, foreign keys, indexes) defining the CounsConnect data model (appointments, patients, counselors, progress notes).
2. **Row Level Security (RLS) Policies:** Enables Postgres policies defining which users can read and write specific records, preventing unauthorized access.

---

## Entry 7 — 2026-09-05: The "Unauthorized" (HTTP 401) Milestone & API Gateway Key Enforcement

### 1. Why "Unauthorized" is a Complete Networking Victory

When running `curl http://20.244.34.104:8000/rest/v1/`, the terminal printed:
```
Unauthorized
```

To someone new to DevOps, this looks like an error. **To a cloud engineer, this is the ultimate proof that the entire network stack works!**

#### Why this proves success:
1. **Azure NSG Firewall Passed:** Your packet traveled across the internet, reached Azure VM IP `20.244.34.104`, hit Port `8000`, and the NSG inbound rule allowed it through.
2. **Docker Port Mapping Passed:** Docker's kernel iptables routed the packet from the host's `0.0.0.0:8000` into the `supabase-envoy` container.
3. **API Gateway Active:** Envoy (the API gateway reverse proxy) accepted the HTTP connection and executed its authentication validation filter.
4. **Security Enforcement Working:** The gateway evaluated the incoming request, found that no API key was provided, and correctly rejected unauthorized access with `401 Unauthorized` instead of exposing internal endpoints!

---

### 2. Transport Errors vs Application Errors (OSI Model Distinction)

In DevOps debugging, always distinguish between **Layer 4 (Transport)** failures and **Layer 7 (Application)** responses:

| Output | OSI Layer | Meaning | Did the Server Respond? |
|---|---|---|---|
| `Connection refused` | Layer 4 (Transport) | Azure NSG or Docker is not listening on that port. | **No** (dropped by TCP/kernel) |
| `Connection timed out` | Layer 3/4 (Network) | Firewall (NSG) silently dropped the packets. | **No** (blackholed) |
| `401 Unauthorized` | Layer 7 (Application) | Network, firewall, ports, and reverse proxy all work. The application actively evaluated you and rejected unauthenticated traffic. | **YES! Server is 100% operational.** |

---

### 3. Envoy API Gateway: Header-Based Authentication (`apikey`)

Supabase uses **Envoy** as its modern API gateway. 

Unlike a basic web server, Envoy does not allow raw, keyless requests to hit the REST API. It requires clients to identify themselves by sending either:
* An **`apikey`** header: `apikey: <ANON_KEY>`
* An **`Authorization`** Bearer header: `Authorization: Bearer <ANON_KEY>`

When Envoy sees the `apikey`, it validates the JWT signature and proxies the request to PostgREST, assigning it the Postgres `anon` database role.

---

### 4. Authenticating the cURL Request

To see PostgREST return the full database schema specification, pass your `ANON_KEY` in the header:

```bash
# Read ANON_KEY from .env and pass it to cURL:
ANON=$(grep ANON_KEY ~/supabase/supabase/docker/.env | cut -d '=' -f2)

curl http://20.244.34.104:8000/rest/v1/ -H "apikey: $ANON"
```
* With the `apikey` header included, Envoy permits the request and PostgREST returns the OpenAPI Swagger 2.0 schema!

---

## Entry 8 — 2026-09-05: SSH Tunnel Execution Context & Host Key Verification

### 1. The Execution Context: Client vs Remote VM

In your terminal prompt, notice where you ran the SSH command:
```
counsconnect@counsconnet-vm1:~/supabase/supabase/docker$ ssh -i ... -L 3000:localhost:3000 counsconnect@20.244.34.104
```

* **What happened:** You executed the `ssh` command **from inside the Azure VM, attempting to SSH back into itself!**
* **The Rule of Tunneling:** An SSH Tunnel must always be executed **from the machine that wants to consume the service** (your Mac laptop) targeting the server providing the service (the Azure VM).

```
WRONG:
[Azure VM] ─── attempts to tunnel to ───► [Azure VM] (Recursive loop, no private key)

CORRECT:
[Your Local Mac] ─── tunnels to ───► [Azure VM]
Local browser opens `http://localhost:3000` on Mac ───► arrives at Studio inside VM
```

---

### 2. Private Key Locality: Where your `.pem` File Lives

The error in your terminal stated:
```
Warning: Identity file /home/counsconnect/.ssh/counsconnect-vm1_key.pem not accessible: No such file or directory.
```

* **Private Key Security:** When you created the VM in Azure, your browser downloaded `counsconnect-vm1_key.pem` onto **your Mac's hard drive** (e.g., `~/Downloads/` or `~/.ssh/`).
* The remote VM does **not** have your private key on its disk (and it never should!). Storing private keys on a remote server defeats public-key cryptography because anyone who accesses the server could steal your private identity.
* Therefore, running `ssh -i ...` must be done on your **Mac**, where the file actually exists.

---

### 3. SSH Host Key Fingerprints & TOFU (Trust On First Use)

The prompt in your terminal:
```
The authenticity of host '20.244.34.104' can't be established.
ED25519 key fingerprint is SHA256:8K5JyyPpqBtm2Ecz7VApkSTGaAaKTsGSNT1yAcEgnjI.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

* **What is this?** SSH uses a security model called **Trust On First Use (TOFU)**.
* When a client connects to a server for the first time, SSH does not yet know if the machine at `20.244.34.104` is truly your server or an attacker intercepting the network (a Man-in-the-Middle attack).
* The server presents its public host fingerprint (hashed with SHA256).
* When you type `yes`, SSH saves this cryptographic fingerprint into `~/.ssh/known_hosts` on your client machine. On all future logins, SSH verifies that the server's fingerprint matches this recorded value. If an attacker ever tries to spoof your server's IP in the future, SSH blocks the connection with a severe warning.

---

## Entry 9 — 2026-09-05: Container Port vs Host Binding & Unified Port 8000 Architecture

### 1. Diagnosing `channel open failed: connect failed: Connection refused`

When you ran `ssh -L 3000:localhost:3000` and opened `http://localhost:3000`, the terminal printed:
```
channel 3: open failed: connect failed: Connection refused
```
And the browser showed:
```
This site can't be reached (ERR_CONNECTION_RESET)
```

#### Why did this happen?
The SSH tunnel worked properly between your Mac and Azure. It asked the Azure host: *"Forward this connection to port 3000 on the VM."*
However, the Azure VM operating system responded: **`Connection refused`** — meaning **NOTHING was listening on port 3000 on the host!**

---

### 2. Reading `docker compose ps` Ports: Exposed vs Mapped

Look closely at the `PORTS` column from your `docker compose ps` table:

```
SERVICE           PORTS
supabase-envoy    0.0.0.0:8000->8000/tcp, [::]:8000->8000/tcp
supabase-pooler   0.0.0.0:5432->5432/tcp, 0.0.0.0:6543->6543/tcp
supabase-studio   3000/tcp
```

* **Host Port Mapping (`0.0.0.0:8000->8000/tcp`):**
  Docker actively binds the host VM's network interface to the container. Port `8000` on the VM forwards to port `8000` inside Envoy.
* **Internal Exposed Port (`3000/tcp`):**
  There is **NO `->` arrow!** Port 3000 is only open *inside the private Docker bridge network* for other containers to see. It is **never published to the VM host**.

---

### 3. The Modern Unified Gateway Pattern (Envoy on Port 8000)

In older self-hosted Supabase setups (2022-2023), Supabase published Studio directly on host port `3000`.

In modern Supabase:
1. **Studio is private:** The Studio container runs completely inside Docker without exposing any host ports.
2. **Unified Entry Point:** The **Envoy API Gateway (Port 8000)** handles *everything*:
   * API requests (`/rest/v1/`, `/auth/v1/`, etc.) → Routed to PostgREST / GoTrue.
   * Web browser visits (Root `/`) → **Routed directly to Supabase Studio!**
3. **HTTP Basic Authentication:** Envoy intercepts incoming browser requests on Port 8000 and demands HTTP Basic Auth (`DASHBOARD_USERNAME` & `DASHBOARD_PASSWORD`), securing the dashboard at the reverse-proxy layer.

---

### 4. Accessing Supabase Studio via Port 8000

Because Port 8000 is already opened in your Azure Network Security Group:

* Simply open your browser on your Mac and navigate directly to:
  ```
  http://YOUR_VM_PUBLIC_IP:8000
  ```
* Enter `DASHBOARD_USERNAME` (`supabase`) and your generated `DASHBOARD_PASSWORD` into the browser prompt.
* Supabase Studio loads immediately!

---

## Entry 10 — 2026-09-05: Database Migrations, Relational Modeling & Row Level Security (RLS)

### 1. Relational Data Integrity vs NoSQL Silos

In the legacy CounsConnect architecture:
* A Node.js backend connected to MongoDB for the web interface.
* A Go backend connected to MongoDB for the mobile app.
* **The Problem:** MongoDB is document-oriented (NoSQL). It lacks enforced relationships between collections. If an appointment referenced a patient ID that was deleted or altered, MongoDB had no way of stopping data corruption or keeping web and mobile clients in sync.
* **The PostgreSQL Solution:** Tables have strict relational schemas, types (`UUID`, `TIMESTAMPTZ`, `TEXT[]`), check constraints (`CHECK (status IN ('pending', 'confirmed'))`), and foreign keys that guarantee database-level integrity.

---

### 2. Foreign Key Constraints & Cascading (`ON DELETE CASCADE`)

In `public.profiles`:
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ...
);
```

* **`REFERENCES auth.users(id)`**: Links your application profile table directly to Supabase's internal authentication identity engine (`auth.users`).
* **`ON DELETE CASCADE`**: A database trigger rule. If an administrator deletes a user from `auth.users`, PostgreSQL automatically cascades the deletion and removes their associated profile, appointments, and check-ins. No orphaned ghost records are left in the database.

---

### 3. Declarative Security: How RLS Replaces Backend Middleware

In traditional backend frameworks (Express, Spring, Django, Go Gin), security is **imperative** — written by hand on every single endpoint:

```javascript
// Traditional API Route: If the dev forgets this check, ALL data is leaked!
app.get('/api/clients/:id', async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (client.counselor_id !== req.user.id) {
    return res.status(403).send("Forbidden");
  }
  res.json(client);
});
```

In Supabase PostgreSQL, security is **declarative** at the database layer using **Row Level Security (RLS)**:

```sql
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "counselors_own_clients" ON public.clients
  FOR ALL USING (counselor_id = auth.uid());
```

* **How it works:** Even if an attacker uses the REST API or WebSockets to query `SELECT * FROM clients`, PostgreSQL intercepts the query plan and automatically injects `WHERE counselor_id = auth.uid()`.
* **Zero Leakage:** The application code can never accidentally return another counselor's patient data, because the database engine itself enforces the boundary.

---

### 4. The `auth.uid()` Bridge: Linking JWTs to SQL Policies

When a user logs in, Supabase issues them a JWT containing their unique user ID in the `sub` claim (`{"sub": "123e4567-e89b-..."}`).

1. The client sends the JWT in the `Authorization: Bearer <token>` header.
2. The Envoy API Gateway and PostgREST verify the JWT signature using `JWT_SECRET`.
3. PostgREST extracts the user's ID and passes it to PostgreSQL as a session variable: `request.jwt.claim.sub`.
4. PostgreSQL's helper function **`auth.uid()`** evaluates to this exact user ID during the execution of RLS policies!

---

## Entry 11 — 2026-09-05: The RLS Security Posture: Default-Allow vs Default-Deny

### 1. Why Supabase Flags "Potential Issue Detected"

When running DDL `CREATE TABLE` scripts in the SQL Editor, Supabase intercepts the query and pops up:
> *"This query creates tables without enabling Row Level Security. Clients using anon or authenticated keys may be able to access these tables."*

#### Why does this alert exist?
* In raw standard PostgreSQL, when you create a new table, **Row Level Security is OFF by default** (`DISABLE ROW LEVEL SECURITY`).
* In traditional databases that sit hidden behind a backend server, this was acceptable because only the backend could talk to Postgres.
* **In Supabase, the database IS the API!** PostgREST exposes every table directly to the web. If RLS is left disabled, anyone who has your public `ANON_KEY` can run `SELECT * FROM clients` in their browser console and scrape your entire patient database!

---

### 2. Default-Allow vs Default-Deny: The Security Flip

Understanding the two states of a table:

| State | RLS Setting | What Happens on `SELECT * FROM clients`? |
|---|---|---|
| **Default-Allow** | `DISABLE ROW LEVEL SECURITY` | Anyone with the public `ANON_KEY` can read, insert, edit, or delete **every single row in the table**! |
| **Default-Deny** | `ENABLE ROW LEVEL SECURITY` | **Total lockdown.** Zero rows are returned to anyone (returns `[]`), unless an explicit `POLICY` exists permitting that specific action. |

---

### 3. The Two-Step Security Pattern: Lock the Door, Then Hand Out Keys

Security in Supabase is always a two-stage process:

1. **Stage 1 — Lock the Door (Enable RLS):**
   Clicking **`Run and enable RLS`** automatically executes:
   ```sql
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
   -- (Locks all tables from unauthorized public access)
   ```
2. **Stage 2 — Hand Out Specific Keys (Create Policies):**
   Once locked, you define granular rules:
   ```sql
   -- Only allow a counselor to see their OWN clients
   CREATE POLICY "counselors_own_clients" ON public.clients
     FOR ALL USING (counselor_id = auth.uid());
   ```

---

## Entry 12 — 2026-09-06: Frontend Cloud Integration: Client-Side Bundling & Environment Prefixes

### 1. Build-Time Inlining: Why Standard `.env` Fails in Browsers

In Node.js server runtimes, `process.env.DB_PASSWORD` dynamically reads environment variables from the operating system's RAM.

However, in client-side Single Page Applications (Next.js client components, React, Expo React Native):
* The code runs **inside the user's browser or mobile phone**, thousands of miles away from your server!
* The user's browser has no operating system environment variables.
* Therefore, build tools (Webpack, Turbopack, Metro) must **statically inline (find and replace)** environment variables during bundling.

---

### 2. The Framework Prefix Convention (`NEXT_PUBLIC_` & `EXPO_PUBLIC_`)

To prevent developers from accidentally leaking server secrets into client code, modern frameworks enforce a strict prefix rule:

| Framework | Prefix | Behavior |
|---|---|---|
| **Next.js** | `NEXT_PUBLIC_` | Any variable prefixed with `NEXT_PUBLIC_` is inlined into the JavaScript bundle sent to the user's browser. Any variable without it remains server-side only. |
| **Expo / React Native** | `EXPO_PUBLIC_` | Inlines the variable into the mobile APK / IPA bundle. |

```
# web-frontend/.env.local:
NEXT_PUBLIC_SUPABASE_URL=http://20.244.34.104:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# app-frontend/.env:
EXPO_PUBLIC_SUPABASE_URL=http://20.244.34.104:8000
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

### 3. Key Security: Why `ANON_KEY` is Safe in Bundles vs `SERVICE_ROLE_KEY`

Because `NEXT_PUBLIC_` and `EXPO_PUBLIC_` variables are inlined into the client bundle, **anyone can open Chrome DevTools, inspect the JavaScript network tab or source code, and read your `ANON_KEY`!**

* **Is this a security vulnerability? NO!**
  * The `ANON_KEY` only identifies the tenant to the API gateway.
  * Every single database query executed with `ANON_KEY` is checked against the **Row Level Security (RLS)** policies we created in Entry 11.
  * If a malicious user tries `supabase.from('clients').select('*')`, PostgreSQL only returns the rows where `counselor_id = auth.uid()`.
* **CRITICAL WARNING:** Never prefix `SERVICE_ROLE_KEY` with `NEXT_PUBLIC_` or `EXPO_PUBLIC_`! The `SERVICE_ROLE_KEY` bypasses all RLS and must strictly remain on server-side functions.

---

### 4. Production Milestone: Domain Names & TLS/HTTPS Reverse Proxies

Currently, both frontends connect to the raw IP: `http://20.244.34.104:8000`.
* **The Limitation:** Standard `http://` is unencrypted (plain text across Wi-Fi networks). Browsers also restrict camera/microphone access (WebRTC video sessions) on non-HTTPS origins outside of localhost.
* **The Production Next Step:**
  1. Point a domain/subdomain (e.g. `api.counsconnect.com`) to `20.244.34.104`.
  2. Use Nginx + Let's Encrypt (`certbot`) to terminate TLS/HTTPS on port 443.
  3. Update `NEXT_PUBLIC_SUPABASE_URL=https://api.counsconnect.com`.

---

## Entry 13 — 2026-09-06: The HTTPS / TLS Dilemma: Why Bare IPs Lack SSL & The Mixed Content Trap

### 1. HTTP vs HTTPS: The TLS Handshake & CA Signatures

* **HTTP (`http://`):** Plain text communication. Any router or ISP between your client and Azure can inspect, alter, or inject packets.
* **HTTPS (`https://`):** HTTP wrapped inside **TLS (Transport Layer Security)**.
  * During the TLS handshake, the server must present an **X.509 Digital Certificate** issued and cryptographically signed by a globally trusted **Certificate Authority (CA)** (like Let's Encrypt, DigiCert, or Sectigo).
  * Your browser verifies that the certificate's cryptographic signature matches a CA pre-installed in your operating system's trust store.

---

### 2. Why Free Certificate Authorities (Let's Encrypt) Require Domain Names

Why can't we just get a free SSL certificate for `http://20.244.34.104`?

1. **Ephemeral Ownership of IPs:** In cloud providers (Azure, AWS, GCP), public IPv4 addresses are leased, recycled, and re-assigned frequently.
2. **ACME Domain Validation (DNS/HTTP-01):** Free automated Certificate Authorities (like Let's Encrypt) verify ownership using the **ACME protocol**. ACME challenges verify that *you control the domain's DNS records*. Let's Encrypt **does not issue certificates for bare public IP addresses**.
3. **Domain Binding:** SSL certificates are cryptographically bound to fully qualified domain names (FQDNs), such as `api.counsconnect.com`.

---

### 3. The Browser "Mixed Content" Blocker (The Production Trap)

While developing locally on your laptop, `http://localhost:3000` talking to `http://20.244.34.104:8000` is permitted because browsers treat `localhost` as a development exception.

**However, when you deploy to Vercel in production:**
* Vercel serves your web application over HTTPS: `https://counsconnect.vercel.app`.
* Modern browsers enforce **Active Mixed Content Blocking**:
  > *"An HTTPS page cannot load unencrypted HTTP subresources (APIs, scripts, or WebSockets)."*
* If your production frontend makes a request to `http://20.244.34.104:8000`, the browser silently drops the request with:
  ```
  Mixed Content: The page at 'https://counsconnect.vercel.app' was loaded over HTTPS,
  but requested an insecure resource 'http://20.244.34.104:8000/rest/v1/'.
  This request has been blocked; the content must be served over HTTPS.
  ```

---

### 4. The Solution: TLS Termination via Nginx Reverse Proxy

To achieve production HTTPS on Azure, we set up **TLS Termination**:

```
Client (Browser / Phone)
          │
          ▼ HTTPS (Port 443, Encrypted with Let's Encrypt SSL Cert)
   Azure VM: Nginx Reverse Proxy
          │
          ▼ HTTP (Port 8000, Internal plaintext across localhost)
   Supabase Envoy Gateway / Docker
```

#### The Architecture:
1. **Domain Name:** An `A Record` in DNS points `api.yourdomain.com` ──► `20.244.34.104`.
2. **Nginx:** Listens on Port 443 with a free auto-renewing Let's Encrypt SSL certificate (`certbot`).
3. **Reverse Proxy:** Nginx decrypts incoming HTTPS traffic and passes it locally via `proxy_pass http://localhost:8000;`.
4. **Result:** Your Next.js app on Vercel connects to `https://api.yourdomain.com`, completely eliminating Mixed Content blocks and securing patient data in transit!

---

## Entry 14 — 2026-09-06: Auth Service Configuration: Email Autoconfirm & Profile Triggers

### 1. Diagnosing `Error sending confirmation email`

When a user registers on `/register`, GoTrue (the Supabase authentication service) returned:
```
Error sending confirmation email
```

#### Why this happened:
1. **Default Security Behavior:** By default, Supabase requires every newly registered user to verify their email address before issuing an authenticated session.
2. **Missing SMTP Provider:** In self-hosted Supabase, GoTrue attempts to connect to an SMTP server (like Resend, SendGrid, or AWS SES) to dispatch the verification email.
3. Because SMTP credentials in `.env` were left as default/unconfigured, the SMTP handshake failed, causing GoTrue to abort user creation with `Error sending confirmation email`.

---

### 2. The Setting: `ENABLE_EMAIL_AUTOCONFIRM=true`

This is **not an RLS policy**; it is an environment configuration flag for the GoTrue authentication daemon:

```env
# In ~/supabase/supabase/docker/.env:
ENABLE_EMAIL_AUTOCONFIRM=true
```

* **What it does:**
  * Disables the outgoing confirmation email requirement.
  * When a user clicks "Register", GoTrue automatically sets `email_confirmed_at = NOW()` inside `auth.users`.
  * The user is immediately logged in with an active JWT session.

---

### 3. Zero-Downtime Container Re-creation via Docker Compose

In Docker Compose, after editing `.env`, you do not need to reboot the server:

```bash
docker compose up -d
```

* **Declarative State Reconciliation:** Docker Compose compares the live containers against the updated `.env` configuration.
* It notices that only `supabase-auth` has modified environment variables.
* It seamlessly destroys and recreates the `supabase-auth` container in **< 2 seconds**, leaving PostgreSQL, Envoy, and all other services completely uninterrupted!

---

### 4. The Profile Sync Trigger: Automating `auth.users` to `public.profiles`

When a user signs up, their core auth record is created in `auth.users`. However, application features (appointments, clients, tasks) reference `public.profiles`.

#### The Trigger Pattern:
Instead of forcing the frontend to perform two separate network writes (which could fail halfway and create corrupted data), we use a PostgreSQL **Trigger Function**:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    COALESCE(new.raw_user_meta_data->>'role', 'counselor')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

* **`SECURITY DEFINER`**: Runs with superuser database privileges, bypassing RLS to guarantee that the profile row is created 100% of the time whenever a user signs up.

---

## Entry 15 — 2026-09-06: Database Integrity: Check Constraints & Form Value Mapping

### 1. What is a PostgreSQL `CHECK` Constraint?
In relational databases, a **`CHECK` Constraint** is an invariant rule that validates incoming data at the database engine level before any row is inserted or updated.

In our `clients` table DDL:
```sql
marital_status text CHECK (marital_status IN ('Married', 'Unmarried', 'Divorced', 'Widowed'))
```
* If any query attempts to insert a string that is **not** in that explicit list, PostgreSQL rejects the transaction with:  
  `new row for relation "clients" violates check constraint "clients_marital_status_check"`

---

### 2. The Root Cause: Display Labels vs Serialized Wire Values

In HTML/React `<select>` dropdowns:
```tsx
// BUGGY: Without an explicit value attribute, HTML sends the inner text:
<select onChange={e => setMaritalStatus(e.target.value)}>
  <option>Single / Unmarried</option> ──► Sends "Single / Unmarried" to PostgreSQL
</select>
```
* **The Collision:** The frontend sent `"Single / Unmarried"`, but the database check constraint only allowed `"Unmarried"`.
* **The Result:** PostgreSQL halted the `INSERT` operation to prevent invalid data from corrupting the table.

---

### 3. The Two-Pronged Solution (Frontend Mapping & Resilient DDL)

In production software engineering, we apply defensive programming at both layers:

#### Layer 1: Frontend Explicit Values
Always specify the exact wire value using the `value` attribute:
```tsx
<option value="Unmarried">Single / Unmarried</option>
```
* The user sees the friendly UI label (`Single / Unmarried`).
* The database receives the exact schema token (`Unmarried`).

#### Layer 2: Resilient Database Constraints
Make the PostgreSQL check constraint flexible enough to accept synonymous real-world terms:
```sql
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_marital_status_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_marital_status_check 
  CHECK (marital_status IN ('Single', 'Unmarried', 'Single / Unmarried', 'Married', 'Divorced', 'Widowed'));
```

---

## Entry 16 — 2026-09-06: Verification Testing, Real-Time Sync & The Production Deployment Pipeline

### 1. The Multi-Tier Verification Strategy: Why Test Before Deploy

In professional software deployment, rushing directly to production before verifying core data loops creates "compounded failure states" — when a bug occurs, you cannot tell if it is an infrastructure firewall error, an SSL failure, an RLS policy issue, or a frontend state glitch.

We divide the remaining steps into two clear phases:

```
┌────────────────────────────────────────────────────────┐
│  PHASE 1: LOCAL VERIFICATION & CROSS-PLATFORM SYNC     │
│  (Next.js on localhost:3000 + Expo Mobile + Azure DB)  │
│  • Verify Counselor creates clients, notes, tasks      │
│  • Verify Patient registers & logs in on mobile        │
│  • Verify WebSocket Real-Time Push (zero-refresh)      │
└──────────────────────────┬─────────────────────────────┘
                           │ All data flows confirmed
                           ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 2: PRODUCTION DEPLOYMENT & DEVOPS HARDENING     │
│  (Vercel + Domain + Nginx Reverse Proxy + SSL/TLS)     │
│  • Attach Domain / DNS to Azure VM                     │
│  • Nginx TLS Termination (Let's Encrypt SSL)           │
│  • Deploy Next.js to Vercel (HTTPS)                    │
│  • Build Android Standalone APK (EAS Build)            │
└────────────────────────────────────────────────────────┘
```

---

### 2. PostgreSQL Logical Replication & The Realtime WebSocket Engine

One of the most critical superpowers of Supabase is **instant cross-device sync** without custom WebSocket servers.

#### How it works under the hood:
1. **PostgreSQL WAL (Write-Ahead Log):** Every time a row is inserted, updated, or deleted in PostgreSQL (e.g., `tasks` or `appointments`), PostgreSQL writes the change to its transaction log.
2. **Logical Replication Slot:** PostgreSQL's built-in replication engine reads the WAL and emits decoded change events.
3. **Supabase Realtime (Elixir / Phoenix):** The `supabase-realtime` container listens to the replication slot. It checks the table's RLS policies to determine which connected clients are permitted to see the row.
4. **WebSocket Push:** The Realtime container broadcasts the JSON payload down the persistent WebSocket connection directly to the patient's phone (`app-frontend/app/(main)/home.tsx`).
5. **Client State Update:** React Native receives the payload in < 200ms and updates component state, causing the new task to appear on the screen without any page reload.

---

### 3. The Production Deployment Architecture: Vercel, TLS & Reverse Proxy

When you deploy your Next.js frontend to **Vercel**, Vercel automatically issues an SSL certificate (`https://counsconnect.vercel.app`).

#### The Problem: Mixed Content Security Blocker
* If `https://counsconnect.vercel.app` attempts to execute an `axios` or `fetch` request against `http://20.244.34.104:8000`, Google Chrome and Safari will refuse to send the request:  
  `Blocked loading mixed active content "http://20.244.34.104:8000/rest/v1/..."`
* Browsers strictly prohibit an encrypted page (`https://`) from communicating with an unencrypted API (`http://`) to prevent man-in-the-middle packet tampering.

#### The Solution: Nginx TLS Reverse Proxy
On the Azure VM:
1. Map a domain name or Azure DNS label to the static public IP (`20.244.34.104`).
2. Run Nginx on ports 80 and 443.
3. Issue a free trusted SSL certificate via Certbot (Let's Encrypt).
4. Nginx decrypts incoming `https://` traffic and forwards it locally to Envoy on `http://127.0.0.1:8000`.

---

## Entry 17 — 2026-09-06: Containerized Web Deployment, Loopback Security & Build-Time Secrets

### 1. The "All-in-One VM" Architecture & Co-located Microservices

Rather than deploying the frontend to a separate third-party serverless platform (like Vercel) or spinning up additional billable Azure resources (such as Azure Container Apps or Azure App Service), we co-locate the Next.js web application on the **exact same Azure VM (`counsconnet-vm1`)** alongside the Supabase Docker stack.

```
                  Counselor Browser / Mobile Web
                                │
                                ▼ HTTPS (Port 443)
┌──────────────────────────────────────────────────────────────┐
│  Azure Ubuntu VM (Central India / Pune - 20.244.34.104)      │
│                                                              │
│  Nginx Reverse Proxy & TLS Termination (Ports 80 / 443)      │
│  │                                                           │
│  ├── Domain Request ──► Internal Proxy ──► 127.0.0.1:3000    │
│  │                                             │             │
│  │                                             ▼             │
│  │                                   ┌──────────────────┐    │
│  │                                   │ Next.js Container│    │
│  │                                   │ (web-frontend)   │    │
│  │                                   │ ~180 MB RAM      │    │
│  │                                   └────────┬─────────┘    │
│  │                                            │              │
│  │                                            │ < 0.2 ms     │
│  │                                            ▼              │
│  └── API Subdomain / Internal Calls ──► 127.0.0.1:8000       │
│                                               │              │
│                                               ▼              │
│                                      ┌──────────────────┐    │
│                                      │ Supabase Stack   │    │
│                                      │ (Envoy/Kong/DB)  │    │
│                                      │ ~1.8 GB RAM      │    │
│                                      └──────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

#### Why Co-location Wins on Speed, Cost, and Architecture:
1. **Zero Additional Cloud Cost ($0 / month extra):** Azure Virtual Machines are billed on a flat hourly rate for provisioned hardware (`Standard_B2as_v2`). Because the VM already has 8 GB of RAM and 2 vCPUs, adding a ~180 MB Next.js container utilizes resources already paid for by Azure credits.
2. **Sub-Millisecond Internal Latency (< 0.2 ms):** When React Server Components (RSC) query Supabase on the server side (`lib/supabase/server.ts`), the packets never traverse the public internet or cross-cloud routers. They communicate across the host's loopback interface (`127.0.0.1`) at native RAM bus speeds.
3. **Hardware Capacity Breakdown on `Standard_B2as_v2` (8 GiB RAM):**
   * Ubuntu 22.04 LTS OS Kernel + Daemons: ~350 MB
   * Supabase Microservices (14 Docker containers): ~1,800 MB
   * Next.js Standalone Container: ~180 MB
   * Nginx Reverse Proxy: ~30 MB
   * **Free Remaining RAM for OS Page Cache & PostgreSQL Buffers:** **~5,600 MB (70% headroom)**

---

### 2. Next.js Standalone Dockerization: Tracing & Multi-Stage Compilation

Deploying a production Node.js application inside a standard container often results in bloated images (1.2 GB+), sluggish boot times, and security vulnerabilities inside unnecessary development dependencies.

#### The Standalone Mode Pattern:
In `web-frontend/next.config.ts`, we set:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ...
};
```

#### How Dependency Tracing Works Under the Hood:
When `next build` runs with `output: 'standalone'`, Next.js utilizes `@vercel/nft` (Node File Trace) to perform static Abstract Syntax Tree (AST) analysis on your codebase:
1. It crawls every page, route handler, and server action.
2. It detects the exact functions and files imported from `node_modules` (e.g., only specific modules of `@supabase/ssr` or `lucide-react`).
3. It bundles a minimal `server.js` file and copies **only the required subset of files** into `.next/standalone/`.
4. It discards unused development packages (`eslint`, `tailwindcss`, compilers, TypeScript engines).
5. The resulting production runner image drops from **~1.3 GB down to ~150 MB**, booting in under 200 ms.

#### The 4-Stage Multi-Stage Dockerfile:
Our [`web-frontend/Dockerfile`](file:///Users/rujal122a/Desktop/CounsConnect/web-frontend/Dockerfile) implements an optimized 4-stage pipeline:
* **Stage 1 (`base`):** `node:20-alpine` with `libc6-compat` for fast musl/glibc compatibility.
* **Stage 2 (`deps`):** Copies `package.json` and `package-lock.json` and executes `npm ci` (deterministic dependency tree installation).
* **Stage 3 (`builder`):** Inlines build-time arguments (`ARG`), sets `NODE_ENV=production`, and compiles the standalone bundle via `npm run build`.
* **Stage 4 (`runner`):** A lightweight production image that creates a dedicated unprivileged user (`nextjs:nodejs`), copies `.next/standalone` and static assets, exposes port 3000, and boots via `node server.js` without requiring `npm` or development tooling.

---

### 3. Build-Time vs Runtime Secrets: How Docker Inlines `NEXT_PUBLIC_*`

A frequent source of bugs in Dockerized Next.js applications is understanding when client-side environment variables are evaluated.

#### The Mechanism:
* **Standard Server Environment Variables (e.g., `DATABASE_URL`):** Read dynamically at runtime via Node's `process.env` during request execution.
* **Client-Side Prefixed Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`):** These **must be known at build time**. During compilation, Next.js's bundler scans client components and replaces all occurrences of `process.env.NEXT_PUBLIC_*` with the **hardcoded literal string** in the compiled JavaScript bundle.
* If these variables are missing during `docker build`, Next.js bakes `undefined` into the browser JavaScript, causing authentication requests to fail silently in production.

#### The Dockerfile Solution:
```dockerfile
# Declare build-time arguments
ARG NEXT_PUBLIC_SUPABASE_URL=http://20.244.34.104:8000
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...

# Export as environment variables for the builder stage
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Next.js inlines these values during this step
RUN npm run build
```

---

### 4. The Loopback Security Barrier (`127.0.0.1` vs `0.0.0.0`) & Why Port 3000 Stays Closed

#### The Dilemma:
When hosting on cloud VMs, developers often worry:
> *"If I run my Next.js container on port 3000, do I need to open port 3000 in Azure NSG? If I open it, won't everyone on the internet have direct access? And since my team has dynamic Wi-Fi IPs, how can we access it securely?"*

#### The Answer: Port 3000 Must NEVER Be Opened to the Internet.
You do **not** need to open port 3000 in Azure NSG, and you do **not** need a static office IP.

#### Understanding Network Binding:
Every Linux server possesses multiple network interfaces:
1. **`0.0.0.0` (All Interfaces):** Binds the listening socket to all network interfaces, including public-facing NICs. If a firewall allows the port, any attacker on the public internet can connect.
2. **`127.0.0.1` (The Loopback Interface / Localhost):** Binds the socket **exclusively to internal system memory**. Packets arriving from external network adapters (the internet) are dropped by the operating system kernel before reaching the application.

#### The Secure Container Command:
```bash
docker run -d \
  --name counsconnect-web \
  --restart always \
  -p 127.0.0.1:3000:3000 \
  counsconnect-web
```

Notice the prefix `-p 127.0.0.1:3000:3000`:
* This instructs Docker to bind host port 3000 **strictly to `127.0.0.1`**.
* Even if an attacker scans port 3000 on `20.244.34.104`, the kernel responds with `Connection Refused`.

#### How Users Access the Web App (The Nginx Reverse Proxy Gateway):
Only two standard web ports are exposed in the Azure NSG:
* **Port 80 (HTTP):** Standard unencrypted web traffic.
* **Port 443 (HTTPS):** Standard encrypted TLS web traffic.

```
Internet User (Dynamic IP / Any Wi-Fi)
              │
              ▼ HTTPS (Port 443)
┌─────────────────────────────────────────────────────────┐
│ Azure Network Security Group (NSG)                      │
│ Allows Inbound Port 443 (Allowed for all users)        │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│ Nginx (Listening on 0.0.0.0:443)                        │
│ 1. Validates TLS Certificate (Let's Encrypt SSL)        │
│ 2. Decrypts traffic                                     │
│ 3. Forwards internally to loopback:                     │
│    proxy_pass http://127.0.0.1:3000;                   │
└─────────────────────────────┬───────────────────────────┘
                              │ Internal Loopback (Memory)
                              ▼
┌─────────────────────────────────────────────────────────┐
│ Next.js Container (Listening on 127.0.0.1:3000)         │
│ Serves Counselor Dashboard securely                     │
└─────────────────────────────────────────────────────────┘
```

#### Key Architectural Advantages:
1. **Dynamic IP Freedom:** Because Port 443 is open to standard web browsers, counselors, patients, and team members can connect from any fluctuating home/mobile Wi-Fi without firewall IP reconfigurations.
2. **Zero Internal Exposure:** Internal application servers (Next.js on 3000, PostgreSQL on 5432) remain invisible to internet port scanners.
3. **Encrypted in Transit:** Nginx enforces automatic HTTP-to-HTTPS redirection, ensuring HIPAA/GDPR compliance with zero unencrypted transmission of patient records.

















