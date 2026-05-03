from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

doc = Document()

# ── Page margins ──────────────────────────────────────────────────────────────
section = doc.sections[0]
section.page_width  = Inches(8.5)
section.page_height = Inches(11)
section.left_margin   = Inches(1.0)
section.right_margin  = Inches(1.0)
section.top_margin    = Inches(1.0)
section.bottom_margin = Inches(1.0)

# ── Brand colours ─────────────────────────────────────────────────────────────
BRAND   = RGBColor(0xE8, 0x5D, 0x04)   # orange
DARK    = RGBColor(0x1F, 0x29, 0x37)   # near-black
GRAY    = RGBColor(0x6B, 0x72, 0x80)   # medium gray
LIGHTBG = RGBColor(0xF3, 0xF4, 0xF6)  # light gray (code bg approx.)
WHITE   = RGBColor(0xFF, 0xFF, 0xFF)
HEADBG  = RGBColor(0x1F, 0x29, 0x37)   # table header bg

# ── Style helpers ─────────────────────────────────────────────────────────────
def set_cell_bg(cell, rgb: RGBColor):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement('w:shd')
    hex_color = f'{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X}'
    shd.set(qn('w:val'),   'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'),  hex_color)
    tcPr.append(shd)

def set_cell_border(table):
    """Thin borders on all cells."""
    for row in table.rows:
        for cell in row.cells:
            tc   = cell._tc
            tcPr = tc.get_or_add_tcPr()
            borders = OxmlElement('w:tcBorders')
            for side in ('top', 'left', 'bottom', 'right'):
                b = OxmlElement(f'w:{side}')
                b.set(qn('w:val'),   'single')
                b.set(qn('w:sz'),    '4')
                b.set(qn('w:space'), '0')
                b.set(qn('w:color'), 'E5E7EB')
                borders.append(b)
            tcPr.append(borders)

def add_heading(text, level=1, color=DARK):
    p = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.color.rgb = color
        if level == 1:
            run.font.size = Pt(20)
            run.font.bold = True
        elif level == 2:
            run.font.size = Pt(15)
            run.font.bold = True
        elif level == 3:
            run.font.size = Pt(12)
            run.font.bold = True
        elif level == 4:
            run.font.size = Pt(11)
            run.font.bold = True
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after  = Pt(4)
    return p

def add_para(text='', bold=False, italic=False, size=10, color=DARK, indent=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after  = Pt(3)
    if indent:
        p.paragraph_format.left_indent = Inches(indent)
    run = p.add_run(text)
    run.font.size   = Pt(size)
    run.font.bold   = bold
    run.font.italic = italic
    run.font.color.rgb = color
    return p, run

def add_code_block(text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent  = Inches(0.3)
    p.paragraph_format.right_indent = Inches(0.3)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(4)
    # shading
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'),   'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'),  'F3F4F6')
    pPr.append(shd)
    run = p.add_run(text)
    run.font.name = 'Courier New'
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    return p

def add_table(headers, rows, col_widths=None):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    # Header row
    hdr = t.rows[0]
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        set_cell_bg(cell, HEADBG)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after  = Pt(3)
        run = p.add_run(h)
        run.font.bold  = True
        run.font.size  = Pt(9)
        run.font.color.rgb = WHITE
    # Data rows
    for ri, row_data in enumerate(rows):
        row = t.rows[ri + 1]
        bg = RGBColor(0xF9, 0xFA, 0xFB) if ri % 2 == 0 else WHITE
        for ci, cell_text in enumerate(row_data):
            cell = row.cells[ci]
            set_cell_bg(cell, bg)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after  = Pt(2)
            run = p.add_run(str(cell_text))
            run.font.size = Pt(9)
            run.font.color.rgb = DARK
    # Column widths
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in t.rows:
                row.cells[i].width = Inches(w)
    set_cell_border(t)
    doc.add_paragraph()  # spacing after table
    return t

def add_bullet(text, level=0, color=DARK):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.left_indent  = Inches(0.25 + level * 0.2)
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after  = Pt(1)
    run = p.add_run(text)
    run.font.size = Pt(9.5)
    run.font.color.rgb = color
    return p

def add_divider():
    p = doc.add_paragraph()
    pPr = p._p.get_or_add_pPr()
    pb = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'),   'single')
    bottom.set(qn('w:sz'),    '4')
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), 'E85D04')
    pb.append(bottom)
    pPr.append(pb)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after  = Pt(6)

def add_info_box(text, bg=RGBColor(0xFF, 0xF7, 0xED)):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent  = Inches(0.3)
    p.paragraph_format.right_indent = Inches(0.3)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(4)
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'),   'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'),  f'{bg[0]:02X}{bg[1]:02X}{bg[2]:02X}')
    pPr.append(shd)
    run = p.add_run(text)
    run.font.size = Pt(9.5)
    run.font.italic = True
    run.font.color.rgb = RGBColor(0x78, 0x35, 0x00)
    return p

# ══════════════════════════════════════════════════════════════════════════════
# COVER PAGE
# ══════════════════════════════════════════════════════════════════════════════
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(60)
run = p.add_run('TOLLOE EXPRESS')
run.font.size  = Pt(32)
run.font.bold  = True
run.font.color.rgb = BRAND

p2 = doc.add_paragraph()
p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
run2 = p2.add_run('System Architecture & Technical Documentation')
run2.font.size  = Pt(18)
run2.font.color.rgb = DARK

doc.add_paragraph()
p3 = doc.add_paragraph()
p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
for label, val in [('Version', '1.0'), ('Date', '2026-05-03'), ('Status', 'As-Built (derived from source code)'), ('Audience', 'Engineers, Technical Stakeholders')]:
    run = p3.add_run(f'{label}: ')
    run.font.bold = True
    run.font.size = Pt(10)
    run.font.color.rgb = GRAY
    run2 = p3.add_run(f'{val}     ')
    run2.font.size = Pt(10)
    run2.font.color.rgb = DARK

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
# TABLE OF CONTENTS (manual)
# ══════════════════════════════════════════════════════════════════════════════
add_heading('Table of Contents', 1, BRAND)
toc_items = [
    ('1.', 'System Analysis', '3'),
    ('  1.1', 'Functional Requirements', '3'),
    ('  1.2', 'Non-Functional Requirements', '4'),
    ('  1.3', 'User Roles & Permissions', '5'),
    ('  1.4', 'Business Logic Summary', '5'),
    ('2.', 'System Design', '6'),
    ('  2.1', 'Architecture Overview', '6'),
    ('  2.2', 'Technology Stack', '7'),
    ('  2.3', 'Database Design', '8'),
    ('  2.4', 'API Design', '9'),
    ('  2.5', 'Security Design', '10'),
    ('3.', 'Code Structure Documentation', '11'),
    ('4.', 'Implementation Details', '13'),
    ('  4.1', 'Backend Implementation', '13'),
    ('  4.2', 'Frontend Implementation', '14'),
    ('  4.3', 'Database & Data Access', '15'),
    ('5.', 'Architectural Assessment', '15'),
    ('  5.1', 'Strengths', '15'),
    ('  5.2', 'Risks & Weaknesses', '16'),
    ('  5.3', 'Improvement Suggestions', '17'),
]
for num, title, page in toc_items:
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after  = Pt(2)
    r1 = p.add_run(f'{num}  {title}')
    r1.font.size = Pt(10)
    r1.font.bold = num.strip().endswith('.')
    r1.font.color.rgb = DARK
    # Tab to page number
    tab = OxmlElement('w:r')
    tab_t = OxmlElement('w:tab')
    tab.append(tab_t)
    p._p.append(tab)
    r2 = p.add_run(f'  {page}')
    r2.font.size = Pt(10)
    r2.font.color.rgb = GRAY

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
# 1. SYSTEM ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════
add_heading('1. System Analysis', 1, BRAND)
add_divider()
add_para('All requirements below are derived directly from the source code. '
         'Where something is inferred rather than explicitly implemented, it is labelled as such.', size=9.5, color=GRAY, italic=True)

# 1.1 Functional Requirements
add_heading('1.1  Functional Requirements (Implemented)', 2)
add_para('Features are mapped to the specific controllers and service files where they are implemented.', size=9.5, color=GRAY)

add_table(
    ['Feature', 'Implementation Location'],
    [
        ['Public shipment tracking (no auth)', 'track.routes.ts → shipment.service.ts#getShipmentByTracking'],
        ['Price estimation', 'calculator.routes.ts → calculator.service.ts'],
        ['User registration & login', 'auth.routes.ts → auth.service.ts'],
        ['Customer shipment booking', 'shipment.routes.ts → shipment.service.ts#createShipment'],
        ['Shipment status timeline', 'TrackingEvent model, addTrackingEvent controller'],
        ['Driver assignment', 'PUT /shipments/:id/assign-driver'],
        ['Proof of delivery upload', 'POST /shipments/:id/proof-of-delivery'],
        ['HTML invoice download', 'pdf.service.ts#streamInvoice'],
        ['Bulk CSV/XLSX upload (business)', 'upload.service.ts, POST /shipments/bulk-upload'],
        ['Email notifications', 'notification.service.ts (Nodemailer / Ethereal fallback)'],
        ['SMS notifications', 'notification.service.ts#sendSMS (stub — console log only)'],
        ['Admin dashboard & analytics', 'admin.controller.ts#getDashboard / getReports'],
        ['Driver management', 'admin.controller.ts#listDrivers / createDriver / updateDriver'],
        ['Service area management', 'admin.controller.ts#listServiceAreas / createServiceArea'],
        ['Promo code management', 'admin.controller.ts#listPromoCodes / createPromoCode'],
        ['Blog CMS (create/edit/delete)', 'blog.routes.ts, blog.controller.ts'],
        ['Site content CMS (key-value)', 'admin.controller.ts#getCmsContent / updateCmsContent'],
        ['Logo / image upload', 'admin.controller.ts#uploadCmsImage (multer + local disk)'],
        ['Counter POS — shift management', 'counter.controller.ts#openSession / closeSession'],
        ['Counter POS — shipment entry', 'counter.controller.ts#createCounterShipment'],
        ['Counter POS — daily history', 'counter.controller.ts#getTodayShipments'],
        ['Receipts', 'counter.controller.ts#getReceipt'],
        ['Branch & counter CRUD', 'counter.controller.ts#listBranches / createBranch / createCounter'],
        ['Reporting (daily / range / staff)', 'reports.controller.ts'],
        ['Audit log', 'AuditLog model; written in openSession / closeSession'],
        ['Business client portal', 'business.routes.ts, business.controller.ts'],
        ['API key management', 'ApiKey model, business.controller.ts'],
        ['Webhook management', 'Webhook model'],
    ],
    col_widths=[2.8, 4.0]
)

# 1.2 Non-Functional Requirements
add_heading('1.2  Non-Functional Requirements', 2)

add_heading('Security (Implemented)', 3)
security_impl = [
    'JWT dual-token: 15-min access token in Authorization header + 7-day refresh token in httpOnly; SameSite=Strict cookie',
    'Refresh token stored in DB (User.refreshToken column) — enables server-side invalidation on logout',
    'bcrypt cost factor 12 for password hashing',
    'Zod validation on all auth inputs (registerSchema, loginSchema)',
    'Helmet middleware sets 15 security-related HTTP headers by default',
    'CORS restricted to FRONTEND_URL env var with credentials enabled',
    'Rate limiting: 100 req/15 min global on /api/*; 10 req/15 min on /auth/login and /auth/register',
    'Role-based authorization via requireRole() middleware at route level',
]
for item in security_impl:
    add_bullet(item)

add_heading('Security (Inferred / Missing)', 3)
security_missing = [
    'No input validation beyond auth routes — createDriver, updateDriver, createServiceArea pass req.body directly to Prisma',
    'No CSRF protection (partially mitigated by SameSite=Strict cookie)',
    'No file type verification beyond extension check in bulk upload',
    'Refresh token stored plaintext in DB (should be hashed)',
]
for item in security_missing:
    add_bullet(item, color=RGBColor(0xB9, 0x1C, 0x1C))

add_heading('Performance (Implemented)', 3)
for item in [
    'compression middleware (gzip) on all responses',
    'Promise.all() used for parallel DB queries in dashboard and reports controllers',
    'CMS module-level cache: 60-second TTL in useCms.ts prevents per-render API calls',
    'Next.js ISR on public homepage: revalidate = 60 seconds',
]:
    add_bullet(item)

add_heading('Performance (Risk Areas)', 3)
for item in [
    'getReports loops day-by-day with sequential awaits — N DB round-trips instead of a single groupBy',
    'No Redis or query cache layer',
    'No pagination on listDrivers, listServiceAreas, listPromoCodes',
]:
    add_bullet(item, color=RGBColor(0xB9, 0x1C, 0x1C))

add_heading('Configuration Management', 3)
for item in [
    'Zod schema validates all env vars at startup; missing required vars cause process.exit(1)',
    'dotenv.config() called explicitly before Zod parse in env.ts',
    'All config consumed via the typed env export — no direct process.env calls in app code',
    'No structured logger — console.error only (missing: Winston / Pino)',
]:
    add_bullet(item)

# 1.3 User Roles
add_heading('1.3  User Roles & Permissions', 2)
add_para('Roles are defined in packages/types/src/index.ts (TypeScript enum) and packages/database/prisma/schema.prisma (PostgreSQL enum).', size=9.5, color=GRAY)

add_table(
    ['Role', 'Access Level', 'Portals / Endpoints'],
    [
        ['ADMIN', 'Full system access', '/admin/*, /counter/*'],
        ['SUPERVISOR', 'Reports + counter oversight', '/counter/*, /admin/reports'],
        ['STAFF', 'Counter ops, shipment events', '/counter/*, shipment tracking events'],
        ['CUSTOMER', 'Own shipments only', '/dashboard/*'],
        ['BUSINESS_CLIENT', 'Company shipments, bulk upload, API keys', '/business/*'],
    ],
    col_widths=[1.4, 2.0, 3.4]
)

add_para('Authorization is enforced at four layers:', bold=True, size=10)
for item in [
    '1. Route level — requireRole(...roles) middleware in each *.routes.ts file',
    '2. Service level — getShipment() enforces ownership check for CUSTOMER role',
    '3. Frontend layout — each route group layout checks user.role on mount and redirects',
    '4. Middleware chain — all protected routes pass through authenticate first, then requireRole',
]:
    add_bullet(item)

# 1.4 Business Logic
add_heading('1.4  Business Logic Summary', 2)

add_heading('Pricing Formula  (calculator.service.ts)', 3)
add_code_block(
    'price = BASE_RATE[serviceType]\n'
    '      + weight(kg) × 15 ETB/kg\n'
    '      + ceil(haversineDistance(km)) × 2 ETB/km\n'
    '      + (isCOD ? 30 : 0)\n\n'
    'total = ceil(price)   // rounded up to whole ETB\n\n'
    'BASE_RATES:\n'
    '  SAME_DAY: 200 ETB | EXPRESS: 120 ETB | STANDARD: 80 ETB | ECONOMY: 50 ETB\n\n'
    'City coordinates fetched live from ServiceArea table.\n'
    'Unknown city → HTTP 400.'
)

add_heading('Tracking Number Format  (tracking.ts)', 3)
add_code_block('TE-{YYYYMMDD}-{6 uppercase nanoid chars}\nExample: TE-20260503-A7K2PQ')

add_heading('Counter Shipment Flow  (counter.controller.ts)', 3)
for item in [
    'Walk-in customer — no email collected by staff',
    'Synthetic email derived from phone: {phone}@counter.toloeexpress.com',
    'createShipment() creates or finds the user record by email',
    'Shipment linked to CashSession, Counter, and processedById (staff user)',
    'Cash received incremented on CashSession if payment method is CASH or COD',
]:
    add_bullet(item)

add_heading('Refresh Token Rotation  (auth.service.ts)', 3)
for item in [
    'Each /auth/refresh call: verify token → match against DB stored token → issue new pair',
    'Old token is invalidated — new refresh token overwrites DB record',
    'Logout nulls the DB field, invalidating all sessions immediately',
]:
    add_bullet(item)

add_heading('Bulk Upload Flow  (upload.service.ts)', 3)
for item in [
    'HTTP 202 returned immediately with uploadId',
    'processBulkUpload() continues asynchronously in the background',
    'Each row calls createShipment() individually',
    'Success/error counts written to BulkUpload record on completion',
]:
    add_bullet(item)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
# 2. SYSTEM DESIGN
# ══════════════════════════════════════════════════════════════════════════════
add_heading('2. System Design', 1, BRAND)
add_divider()

# 2.1 Architecture
add_heading('2.1  Architecture Overview', 2)
add_para('Style: Layered monorepo — two independently deployable applications sharing a single Prisma schema package.', bold=True, size=10)
doc.add_paragraph()

add_code_block(
    '┌──────────────────────────────────────────────────────────────────┐\n'
    '│                        CLIENT BROWSER                           │\n'
    '│                                                                  │\n'
    '│  ┌───────────────────────────────────────────────────────────┐  │\n'
    '│  │       Next.js 14 App  (apps/web)  :3000                   │  │\n'
    '│  │                                                           │  │\n'
    '│  │  Route Groups:                                            │  │\n'
    '│  │  (public)    Landing, Track, Blog, Calculator             │  │\n'
    '│  │  (auth)      Login, Register, Forgot / Reset Password     │  │\n'
    '│  │  (dashboard) Customer Portal                              │  │\n'
    '│  │  (business)  Business Client Portal                       │  │\n'
    '│  │  (admin)     Admin Dashboard + CMS + Reports              │  │\n'
    '│  │  (counter)   Counter POS                                  │  │\n'
    '│  │                                                           │  │\n'
    '│  │  State : Zustand (auth) + module cache (CMS 60s TTL)      │  │\n'
    '│  │  HTTP  : Axios singleton — JWT interceptor + 401 queue    │  │\n'
    '│  └─────────────────────────┬─────────────────────────────────┘  │\n'
    '└────────────────────────────┼─────────────────────────────────────┘\n'
    '                             │  REST JSON  /api/v1/*\n'
    '                             │  Bearer token in header\n'
    '                             │  refreshToken in httpOnly cookie\n'
    '┌────────────────────────────▼─────────────────────────────────────┐\n'
    '│        Express API  (apps/server)  :4000                        │\n'
    '│                                                                  │\n'
    '│  Routes → Controllers → Services → Prisma Client                │\n'
    '│                                                                  │\n'
    '│  Middleware chain:                                               │\n'
    '│  helmet→cors→json→cookieParser→rateLimiter                       │\n'
    '│  →authenticate→requireRole→controller→errorHandler              │\n'
    '└──────────────────────────────────────────┬───────────────────────┘\n'
    '                                           │  Prisma ORM\n'
    '┌──────────────────────────────────────────▼───────────────────────┐\n'
    '│        PostgreSQL  (packages/database/prisma)                    │\n'
    '│                                                                  │\n'
    '│  Schema-first, db:push (no migration files)                      │\n'
    '│  Seed: 15 cities, 5 users, 2 promo codes, 30 CMS defaults        │\n'
    '└──────────────────────────────────────────────────────────────────┘'
)

# 2.2 Technology Stack
add_heading('2.2  Technology Stack (Actual)', 2)

add_heading('Frontend', 3)
add_table(
    ['Technology', 'Version', 'How It Is Used'],
    [
        ['Next.js', '14.2.15', 'App Router, route groups for portals, ISR (revalidate:60) on public pages'],
        ['React', '18', 'Client components marked with "use client"; server components for public pages'],
        ['Tailwind CSS', '3.x', 'Utility classes; custom brand-* color scale configured in tailwind.config'],
        ['Zustand', 'latest', 'Auth state only: user, accessToken, isLoading'],
        ['Axios', 'latest', 'Singleton api instance; request interceptor injects Bearer token; response interceptor handles 401 refresh queue'],
        ['Lucide React', 'latest', 'Icon library used throughout all pages and sidebars'],
        ['Recharts', 'latest', 'LineChart on reports page; BarChart on analytics page'],
        ['next-intl', 'v3', 'Non-routing i18n setup; English default; Amharic stub'],
        ['react-hot-toast', 'latest', 'Toast notifications for success/error feedback'],
    ],
    col_widths=[1.5, 0.9, 4.4]
)

add_heading('Backend', 3)
add_table(
    ['Technology', 'Version', 'How It Is Used'],
    [
        ['Express', '4.22', 'REST API; Router instances per domain; middleware chain on app.ts'],
        ['TypeScript', '5.6', 'Strict mode; --transpile-only in dev (skips type checking)'],
        ['jsonwebtoken', '9.x', 'HS256; two secrets (access + refresh); signAccessToken / signRefreshToken helpers'],
        ['bcryptjs', '2.x', 'Cost factor 12; register + login'],
        ['Zod', '3.x', 'Env schema validation at startup; auth request body schemas'],
        ['Helmet', '8.x', 'Default security headers on all responses'],
        ['express-rate-limit', '7.x', '100 req/15 min global; 10 req/15 min on auth routes'],
        ['Nodemailer', '6.x', 'SMTP transport; Ethereal test account fallback if SMTP not configured'],
        ['multer', '1.x', 'CMS image uploads (disk storage); bulk upload (memory storage)'],
        ['csv-parse / xlsx', 'latest', 'Parse CSV and Excel files for bulk shipment upload'],
        ['date-fns', '4.x', 'Date arithmetic in reports and counter controllers'],
        ['nanoid', '3.x', 'Generates 6-char suffix for tracking numbers'],
        ['compression', '1.x', 'Gzip all API responses'],
        ['morgan', '1.x', 'HTTP request logging (combined in prod, dev in development)'],
        ['dotenv', '17.x', 'Load .env before Zod validation in env.ts'],
    ],
    col_widths=[1.8, 0.9, 4.1]
)

add_heading('Tooling & Infrastructure', 3)
add_table(
    ['Technology', 'How It Is Used'],
    [
        ['Turborepo', 'Task orchestration; build depends on ^build; dev runs persistent watchers'],
        ['pnpm workspaces', 'Monorepo package management; workspace:* protocol for local packages'],
        ['Prisma 5', 'ORM; schema-first; db:push for schema sync; no migration files'],
        ['PostgreSQL', 'Primary database'],
        ['ts-node', 'Dev server execution with --transpile-only; separate tsconfig.seed.json for seed'],
        ['tsconfig-paths', 'Resolves @repo/* aliases at ts-node runtime'],
        ['nodemon', 'File watcher for server hot reload in development'],
    ],
    col_widths=[1.8, 5.0]
)

# 2.3 Database Design
add_heading('2.3  Database Design', 2)
add_para('18 models. All managed by Prisma 5 with schema-first db:push (no rollback support).', size=9.5, color=GRAY)

add_heading('Entity Relationship Summary', 3)
add_code_block(
    'User ──1:1──► Profile\n'
    '     ──1:N──► Address\n'
    '     ──1:N──► Shipment (as sender, recipient, processedBy)\n'
    '     ──1:1──► BusinessClient\n'
    '     ──1:1──► Driver\n'
    '     ──1:N──► BlogPost\n'
    '     ──1:N──► Notification\n'
    '     ──1:N──► AuditLog\n'
    '     ──1:N──► CashSession (as staff)\n'
    '\n'
    'BusinessClient ──1:N──► ApiKey\n'
    '               ──1:N──► Webhook\n'
    '               ──1:N──► Shipment\n'
    '               ──1:N──► BulkUpload\n'
    '\n'
    'Shipment ──1:1──► Payment\n'
    '         ──1:1──► ProofOfDelivery\n'
    '         ──1:N──► TrackingEvent\n'
    '         ──N:1──► Address (pickup + delivery)\n'
    '         ──N:1──► PromoCode (optional)\n'
    '         ──N:1──► Counter (optional)\n'
    '         ──N:1──► CashSession (optional)\n'
    '\n'
    'Branch ──1:N──► Counter ──1:N──► CashSession\n'
    '                        ──1:N──► Shipment\n'
    '\n'
    'ServiceArea  (standalone — used by price calculator)\n'
    'SiteContent  (standalone — key-value CMS store)\n'
    'BulkUpload ──1:N──► Shipment'
)

add_heading('Key Constraints', 3)
add_table(
    ['Model', 'Field', 'Constraint'],
    [
        ['User', 'email', 'UNIQUE'],
        ['User', 'refreshToken', 'Nullable — nulled on logout'],
        ['Shipment', 'trackingNumber', 'UNIQUE + INDEX'],
        ['SiteContent', 'key', 'UNIQUE'],
        ['PromoCode', 'code', 'UNIQUE'],
        ['Address / ApiKey / Webhook / Notification', '(child records)', 'CASCADE DELETE on parent User'],
        ['Shipment', 'totalPrice / weight / codAmount', 'Decimal(12,2) / (8,2)'],
    ],
    col_widths=[2.2, 2.0, 2.6]
)

# 2.4 API Design
add_heading('2.4  API Design', 2)
add_para('Paradigm: REST over JSON.  Base path: /api/v1.  All responses use the envelope: { success: boolean, data?: T, error?: string }', size=9.5)

add_table(
    ['Method', 'Path', 'Auth', 'Role Required'],
    [
        # Auth
        ['POST', '/auth/register', 'No (rate limited)', '—'],
        ['POST', '/auth/login', 'No (rate limited)', '—'],
        ['POST', '/auth/refresh', 'Cookie', '—'],
        ['POST', '/auth/logout', 'Bearer', 'Any'],
        ['GET',  '/auth/me', 'Bearer', 'Any'],
        # Tracking
        ['GET',  '/track/:trackingNumber', 'No', '—'],
        # Calculator
        ['POST', '/calculator/estimate', 'No', '—'],
        # Shipments
        ['GET',  '/shipments', 'Bearer', 'Any (filtered by role)'],
        ['POST', '/shipments', 'Bearer', 'Any'],
        ['GET',  '/shipments/:id', 'Bearer', 'Owner / Admin / Staff'],
        ['PUT',  '/shipments/:id', 'Bearer', 'ADMIN | STAFF'],
        ['POST', '/shipments/:id/events', 'Bearer', 'ADMIN | STAFF'],
        ['PUT',  '/shipments/:id/assign-driver', 'Bearer', 'ADMIN | STAFF'],
        ['POST', '/shipments/:id/proof-of-delivery', 'Bearer', 'ADMIN | STAFF'],
        ['GET',  '/shipments/:id/invoice', 'Bearer', 'Owner / Admin'],
        ['POST', '/shipments/bulk-upload', 'Bearer', 'BUSINESS_CLIENT | ADMIN'],
        # Admin
        ['GET',  '/admin/dashboard', 'Bearer', 'ADMIN'],
        ['GET',  '/admin/reports', 'Bearer', 'ADMIN'],
        ['GET/POST', '/admin/drivers', 'Bearer', 'ADMIN'],
        ['PUT',  '/admin/drivers/:id', 'Bearer', 'ADMIN'],
        ['GET/POST', '/admin/service-areas', 'Bearer', 'ADMIN'],
        ['GET/POST', '/admin/promo-codes', 'Bearer', 'ADMIN'],
        ['GET',  '/admin/cms', 'Bearer', 'ADMIN'],
        ['PUT',  '/admin/cms/:key', 'Bearer', 'ADMIN'],
        ['POST', '/admin/cms/upload', 'Bearer', 'ADMIN'],
        # Counter
        ['GET',  '/counter/dashboard', 'Bearer', 'ADMIN | SUPERVISOR | STAFF'],
        ['POST', '/counter/sessions/open', 'Bearer', 'ADMIN | SUPERVISOR | STAFF'],
        ['POST', '/counter/sessions/:id/close', 'Bearer', 'ADMIN | SUPERVISOR | STAFF'],
        ['POST', '/counter/shipments', 'Bearer', 'ADMIN | SUPERVISOR | STAFF'],
        ['GET',  '/counter/shipments/today', 'Bearer', 'ADMIN | SUPERVISOR | STAFF'],
        # Reports
        ['GET',  '/reports/daily', 'Bearer', 'ADMIN | SUPERVISOR'],
        ['GET',  '/reports/range', 'Bearer', 'ADMIN | SUPERVISOR'],
        ['GET',  '/reports/staff', 'Bearer', 'ADMIN | SUPERVISOR'],
        ['GET',  '/reports/audit-logs', 'Bearer', 'ADMIN | SUPERVISOR'],
        # CMS Public
        ['GET',  '/cms', 'No', '—'],
        # Blog
        ['GET',  '/blog/posts', 'No', '—'],
        ['GET',  '/blog/posts/:slug', 'No', '—'],
        ['POST', '/blog/posts', 'Bearer', 'ADMIN | STAFF'],
        ['PUT/DELETE', '/blog/posts/:slug', 'Bearer', 'ADMIN | STAFF'],
    ],
    col_widths=[0.8, 2.5, 1.3, 2.2]
)

# 2.5 Security Design
add_heading('2.5  Security Design (As Implemented)', 2)

add_heading('Authentication Flow', 3)
add_code_block(
    '1. POST /auth/login\n'
    '   ├── Zod validates body (email, password)\n'
    '   ├── prisma.user.findUnique({ email }) + bcrypt.compare()\n'
    '   ├── signAccessToken()  → JWT HS256, 15 min, payload: {userId, email, role}\n'
    '   ├── signRefreshToken() → JWT HS256, 7 days, separate JWT_REFRESH_SECRET\n'
    '   ├── DB: user.refreshToken = newRefreshToken (plaintext)\n'
    '   ├── Response body: { accessToken }\n'
    '   └── Response cookie: refreshToken (httpOnly, SameSite=Strict, Secure in prod)\n'
    '\n'
    '2. Subsequent requests\n'
    '   └── authenticate middleware reads Authorization: Bearer <token>\n'
    '       └── verifyAccessToken() → attaches req.user = {userId, email, role}\n'
    '\n'
    '3. POST /auth/refresh\n'
    '   ├── Reads httpOnly cookie\n'
    '   ├── verifyRefreshToken()\n'
    '   ├── DB lookup: user WHERE id = payload.userId AND refreshToken = token\n'
    '   ├── Issues new access + refresh tokens\n'
    '   └── Overwrites DB record (token rotation)\n'
    '\n'
    '4. POST /auth/logout\n'
    '   └── DB: user.refreshToken = null  (all sessions invalidated)'
)

add_heading('Frontend Token Management', 3)
for item in [
    'Access token lives in Axios module closure (let accessToken: string | null) — never in localStorage',
    'On 401: Axios response interceptor calls /auth/refresh, queues concurrent requests via failedQueue, retries all with new token',
    'On refresh failure: window.location.href = "/login" hard redirect clears all state',
]:
    add_bullet(item)

add_heading('Trust Boundaries', 3)
add_table(
    ['Boundary', 'Mechanism'],
    [
        ['Browser → Next.js', 'HTTPS (inferred — not configured in code)'],
        ['Next.js → Express', 'CORS: only FRONTEND_URL env var allowed; credentials: true'],
        ['Express → PostgreSQL', 'Prisma connection via DATABASE_URL env var'],
        ['Static uploads (/uploads/*)', 'No auth — file URLs are public once known'],
    ],
    col_widths=[2.0, 4.8]
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
# 3. CODE STRUCTURE
# ══════════════════════════════════════════════════════════════════════════════
add_heading('3. Code Structure Documentation', 1, BRAND)
add_divider()

add_code_block(
    'TOLO EXPRESS/\n'
    '│\n'
    '├── turbo.json                     Task pipeline: build depends on ^build\n'
    '├── pnpm-workspace.yaml            Workspace roots: apps/*, packages/*\n'
    '├── tsconfig.base.json             Shared TS config inherited by all packages\n'
    '│\n'
    '├── packages/\n'
    '│   ├── types/\n'
    '│   │   └── src/index.ts           Role, ShipmentStatus, ServiceType enums\n'
    '│   │                              ApiResponse<T>, UserPublic, ShipmentDto\n'
    '│   │\n'
    '│   └── database/\n'
    '│       ├── prisma/\n'
    '│       │   ├── schema.prisma      Single source of truth for all 18 models\n'
    '│       │   └── seed.ts            15 cities, 5 users, 2 promos, 30 CMS defaults\n'
    '│       ├── src/index.ts           Exports { prisma } singleton\n'
    '│       └── tsconfig.seed.json     Separate CommonJS config for seed script\n'
    '│\n'
    '└── apps/\n'
    '    ├── server/\n'
    '    │   └── src/\n'
    '    │       ├── index.ts           Entry: validates env, starts HTTP, SIGTERM handler\n'
    '    │       ├── app.ts             Express setup, middleware + route mounting\n'
    '    │       ├── config/env.ts      dotenv + Zod validation, exits on failure\n'
    '    │       ├── lib/\n'
    '    │       │   ├── prisma.ts      Re-exports @repo/database singleton\n'
    '    │       │   ├── jwt.ts         sign/verify access & refresh tokens\n'
    '    │       │   └── tracking.ts    generateTrackingNumber(), haversineDistance()\n'
    '    │       ├── middleware/\n'
    '    │       │   ├── auth.ts        Bearer token extraction + verifyAccessToken\n'
    '    │       │   ├── requireRole.ts Role whitelist guard\n'
    '    │       │   ├── errorHandler.ts Global handler + createError factory\n'
    '    │       │   └── rateLimiter.ts defaultLimiter(100/15m), authLimiter(10/15m)\n'
    '    │       ├── routes/            Express Router instances, middleware application\n'
    '    │       │   ├── auth.routes.ts\n'
    '    │       │   ├── shipment.routes.ts  (inline bulk-upload handler)\n'
    '    │       │   ├── admin.routes.ts     (multer for CMS image upload)\n'
    '    │       │   ├── counter.routes.ts\n'
    '    │       │   ├── reports.routes.ts\n'
    '    │       │   └── ... (track, calculator, user, business, blog)\n'
    '    │       ├── controllers/       HTTP layer: parse → service call → respond\n'
    '    │       │   ├── auth.controller.ts\n'
    '    │       │   ├── shipment.controller.ts\n'
    '    │       │   ├── admin.controller.ts\n'
    '    │       │   ├── counter.controller.ts\n'
    '    │       │   ├── reports.controller.ts\n'
    '    │       │   └── ... (calculator, user, business, blog)\n'
    '    │       └── services/          Business logic + DB access\n'
    '    │           ├── auth.service.ts\n'
    '    │           ├── shipment.service.ts\n'
    '    │           ├── calculator.service.ts\n'
    '    │           ├── notification.service.ts\n'
    '    │           ├── pdf.service.ts\n'
    '    │           └── upload.service.ts\n'
    '    │\n'
    '    └── web/\n'
    '        ├── next.config.mjs        next-intl plugin, transpilePackages, /api/v1 rewrite\n'
    '        └── src/\n'
    '            ├── app/\n'
    '            │   ├── layout.tsx     Root layout: Toaster, html/body\n'
    '            │   ├── (public)/      Landing, track, blog, calculator, about, etc.\n'
    '            │   ├── (auth)/        Login, register, forgot/reset password\n'
    '            │   ├── (dashboard)/   Customer portal\n'
    '            │   ├── (business)/    Business client portal\n'
    '            │   ├── (admin)/       Admin dashboard, CMS, analytics, counters, reports\n'
    '            │   └── (counter)/     Counter POS\n'
    '            ├── components/\n'
    '            │   ├── layout/        Navbar, Footer, AdminSidebar, CounterSidebar\n'
    '            │   ├── dashboard/     StatsCard, RecentShipments\n'
    '            │   ├── tracking/      TrackingTimeline, TrackingMap (Leaflet)\n'
    '            │   ├── shipment/      BookingForm, ShipmentCard, ShipmentTable\n'
    '            │   └── admin/         AnalyticsChart, UserTable\n'
    '            ├── lib/\n'
    '            │   ├── api.ts         Axios + token injection + 401 refresh queue\n'
    '            │   └── utils.ts       cn(), formatETB(), formatDate(), STATUS_LABELS\n'
    '            ├── store/authStore.ts Zustand: user, accessToken, isLoading\n'
    '            └── hooks/useCms.ts    Module-level cache, 60s TTL, invalidateCmsCache()'
)

add_heading('Separation of Concerns', 2)
add_table(
    ['Layer', 'Responsibility', 'Example File'],
    [
        ['Routes', 'Middleware application only — no logic', 'auth.routes.ts'],
        ['Controllers', 'HTTP concerns: parse body, call service, send response', 'auth.controller.ts'],
        ['Services', 'All business logic and DB access', 'shipment.service.ts'],
        ['@repo/types', 'Shared TypeScript contract between frontend and backend', 'packages/types/src/index.ts'],
        ['@repo/database', 'Single Prisma schema and client singleton', 'packages/database/src/index.ts'],
        ['lib/ (server)', 'Pure utility functions: JWT, tracking number, haversine', 'lib/jwt.ts, lib/tracking.ts'],
        ['lib/ (web)', 'Axios singleton, Tailwind class helper, format utilities', 'lib/api.ts, lib/utils.ts'],
        ['store/', 'Global client state (auth only)', 'store/authStore.ts'],
        ['hooks/', 'Reusable data-fetching logic with caching', 'hooks/useCms.ts'],
    ],
    col_widths=[1.5, 2.8, 2.5]
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
# 4. IMPLEMENTATION DETAILS
# ══════════════════════════════════════════════════════════════════════════════
add_heading('4. Implementation Details', 1, BRAND)
add_divider()

# 4.1 Backend
add_heading('4.1  Backend Implementation', 2)

add_heading('Request Lifecycle', 3)
add_code_block(
    'HTTP Request\n'
    '  → Helmet           (security headers)\n'
    '  → CORS             (origin whitelist check)\n'
    '  → JSON body parse  (10 MB limit)\n'
    '  → cookieParser     (reads refreshToken cookie)\n'
    '  → compression      (gzip)\n'
    '  → morgan           (request logging)\n'
    '  → defaultLimiter   (100 req / 15 min)\n'
    '  → Router match\n'
    '      → authenticate (verifies Bearer JWT → req.user)\n'
    '      → requireRole  (whitelist check)\n'
    '      → controller   (calls service → res.json)\n'
    '  → errorHandler     (if next(err) was called)'
)

add_heading('Environment Validation  (env.ts)', 3)
for item in [
    'dotenv.config() called at the top of env.ts before any Zod import',
    'Zod safeParse validates all env vars; failure causes process.exit(1)',
    'Exported env object is fully typed — no string | undefined in app code',
    'Min-length constraints on JWT secrets (32 chars) prevent weak secrets',
]:
    add_bullet(item)

add_heading('Auth Service — Detailed Flow  (auth.service.ts)', 3)
add_code_block(
    'login(email, password):\n'
    '  1. prisma.user.findUnique({ email }) — fetches with profile\n'
    '  2. !user.isActive check — soft-ban support without deletion\n'
    '  3. bcrypt.compare(password, passwordHash)\n'
    '     Both failures return the same 401 to prevent user enumeration\n'
    '  4. signAccessToken({ userId, email, role })\n'
    '  5. signRefreshToken({ userId, email, role })  — separate secret\n'
    '  6. prisma.user.update({ refreshToken })  — single DB write binds token to account\n'
    '  7. Returns plain object — controller sets cookie, not service'
)

add_heading('No Dependency Injection', 3)
add_info_box('No DI container is used. Services import prisma directly. Controllers import services directly. '
             'This is pragmatic for the current scale but couples layers tightly — a trade-off noted in Section 5.')

# 4.2 Frontend
add_heading('4.2  Frontend Implementation', 2)

add_heading('Auth Guard Pattern (all protected layouts)', 3)
add_code_block(
    "useEffect(() => {\n"
    "  if (!user) {\n"
    "    api.post('/auth/refresh')\n"
    "      .then(res => api.get('/auth/me').then(me => setAuth(me.data.data, token)))\n"
    "      .catch(() => { clearAuth(); router.push('/login?redirect=...'); });\n"
    "  } else if (!ALLOWED_ROLES.includes(user.role)) {\n"
    "    router.push('/dashboard');\n"
    "  }\n"
    "}, []);\n"
    "\n"
    "// Wait for refresh attempt — isLoading starts true\n"
    "if (!user) return <Spinner />;"
)
add_para('The auth check in layouts uses !user (not !user && !isLoading) to avoid an infinite spinner. '
         'If user is null after the refresh attempt, clearAuth() sets isLoading: false and triggers redirect.', size=9.5, color=GRAY)

add_heading('API Client — Interceptors  (lib/api.ts)', 3)
for item in [
    'Request interceptor: injects Authorization: Bearer {token} from module-level accessToken closure',
    'Response interceptor on 401: uses a failedQueue pattern — only one refresh request fires; all concurrent 401s queue and replay with the new token',
    'On refresh failure: hard redirect to /login via window.location.href',
    'Token never stored in localStorage — lives in module closure only',
]:
    add_bullet(item)

add_heading('CMS Cache  (hooks/useCms.ts)', 3)
for item in [
    'Module-level _cache and _cacheTime persist across component unmounts',
    'useState(_cache ?? {}) initializes synchronously from cache — no loading flash on navigation',
    'fetchCms() returns cached data immediately if within 60-second TTL',
    'invalidateCmsCache() exported for use after admin saves a CMS field',
]:
    add_bullet(item)

add_heading('Debounced Price Calculation  (counter/new-shipment/page.tsx)', 3)
add_code_block(
    'useEffect(() => {\n'
    '  const timer = setTimeout(() => fetchEstimate(form), 400);\n'
    '  return () => clearTimeout(timer);  // cancel on dependency change\n'
    '}, [form.weight, form.senderCity, form.recipientCity, form.serviceType, form.isCOD]);\n'
    '\n'
    '// fetchEstimate wrapped in useCallback with empty deps.\n'
    '// Takes form snapshot as parameter — avoids stale closure.'
)

# 4.3 Database
add_heading('4.3  Database & Data Access', 2)
add_table(
    ['Pattern', 'Where Used', 'Notes'],
    [
        ['Parallel queries', 'getDashboard, getDailyReport, getCounterDashboard', 'Promise.all([...]) for independent queries'],
        ['Eager loading (include)', 'All shipment/user fetches', 'Nested include for profile, addresses, payment'],
        ['upsert', 'All seed.ts entries', 'Idempotent — safe to re-run seed'],
        ['Singleton client', 'packages/database/src/index.ts', 'One PrismaClient instance across app lifecycle'],
        ['No transactions', 'createShipment', 'Risk: address + shipment not atomic — see Section 5'],
        ['No raw SQL', 'Entire codebase', 'All access via Prisma Client API'],
        ['req.body → Prisma', 'createDriver, updateServiceArea, etc.', 'Risk: no field whitelist — see Section 5'],
    ],
    col_widths=[1.8, 2.5, 2.5]
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
# 5. ARCHITECTURAL ASSESSMENT
# ══════════════════════════════════════════════════════════════════════════════
add_heading('5. Architectural Assessment', 1, BRAND)
add_divider()
add_para('All observations are based strictly on the code. Nothing is invented or assumed.', size=9.5, color=GRAY, italic=True)

# 5.1 Strengths
add_heading('5.1  Strengths  ✅', 2)

strengths = [
    ('Dual-token auth with server-side invalidation',
     'Refresh tokens stored in DB and nulled on logout mean sessions can be revoked immediately. Many implementations skip this step.'),
    ('Zod env validation with hard exit at startup',
     'Misconfiguration is caught before any request is served. The typed env export eliminates string | undefined casts throughout.'),
    ('Debounced price calculation',
     'setTimeout/clearTimeout prevents API flooding on keystroke; parameter-passing avoids stale closure — a subtle correctness detail.'),
    ('EMPTY_FORM canonical reset constant',
     'Single source of truth for form initialization and reset prevents divergence between the initial state and the reset action.'),
    ('Operational vs non-operational error distinction',
     'createError marks errors with isOperational: true. The global handler only exposes messages for operational errors — no accidental stack traces in production.'),
    ('Async bulk upload with HTTP 202',
     'Large CSV/XLSX uploads return immediately with an uploadId; processing continues in the background. Correct pattern for potentially long-running operations.'),
    ('@repo/types shared contract',
     'TypeScript types and enums are shared between frontend and backend from a single package — prevents type drift across the API boundary.'),
    ('Monorepo with Turborepo',
     'Task pipeline with ^build dependency ensures packages build in correct order; persistent dev tasks run concurrently.'),
]
for title, desc in strengths:
    add_para(f'  {title}', bold=True, size=10)
    add_para(f'  {desc}', size=9.5, color=GRAY, indent=0.3)
    doc.add_paragraph()

# 5.2 Risks
add_heading('5.2  Risks & Weaknesses  ⚠️', 2)

risks = [
    ('HIGH RISK', 'Unvalidated req.body passed directly to Prisma',
     'createDriver, updateDriver, createServiceArea, updateServiceArea, createPromoCode, createBranch, createCounter all do prisma.X.create({ data: req.body }). '
     'An attacker can inject arbitrary Prisma fields — e.g., setting role: "ADMIN" or isActive: true on a banned user.'),
    ('HIGH RISK', 'No transactions in createShipment',
     'Address records are created before the shipment in sequence. If the shipment insert fails, address records are left orphaned with no cleanup. '
     'A prisma.$transaction() block would atomize this.'),
    ('MEDIUM RISK', 'getReports sequential loop',
     'Admin getReports loops day-by-day with await inside a for loop. 30 days = 60 sequential DB round-trips. '
     'Should be replaced with a single groupBy on date-truncated createdAt.'),
    ('MEDIUM RISK', 'Refresh token stored plaintext',
     'If the users table is compromised, all refresh tokens are immediately usable. They should be hashed (SHA-256 or bcrypt) before storage.'),
    ('MEDIUM RISK', 'Single refresh token per user',
     'User.refreshToken is one column. Logging in from a second device invalidates the first device session. '
     'Multi-device support requires a RefreshToken table (userId + token + expiresAt).'),
    ('MEDIUM RISK', 'Local disk file storage',
     'multer writes to UPLOAD_DIR on the local filesystem. This is incompatible with horizontal scaling or container restarts without a shared volume.'),
    ('LOW RISK', 'No structured logging',
     'console.error only. No log levels, no request IDs, no correlation between requests and errors. '
     'Winston or Pino with request ID middleware would make production debugging tractable.'),
    ('MISSING', 'SMS is a stub',
     'sendSMS() logs to console. Africastalking SDK is referenced in env vars but never imported or called.'),
    ('MISSING', 'Invoice is HTML, not PDF',
     'pdf.service.ts generates styled HTML with Content-Disposition: attachment. '
     'Actual PDF generation requires Puppeteer, pdfkit, or a similar library.'),
    ('MISSING', 'No test coverage',
     'Zero test files found across all packages. No unit tests for pricing logic, no integration tests for auth flow, no e2e tests.'),
]

for severity, title, desc in risks:
    color_map = {'HIGH RISK': RGBColor(0xB9, 0x1C, 0x1C), 'MEDIUM RISK': RGBColor(0x92, 0x40, 0x07), 'LOW RISK': GRAY, 'MISSING': RGBColor(0x1E, 0x40, 0xAF)}
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    r1 = p.add_run(f'[{severity}]  ')
    r1.font.bold = True
    r1.font.size = Pt(9)
    r1.font.color.rgb = color_map.get(severity, GRAY)
    r2 = p.add_run(title)
    r2.font.bold = True
    r2.font.size = Pt(10)
    r2.font.color.rgb = DARK
    add_para(f'  {desc}', size=9.5, color=GRAY, indent=0.3)

# 5.3 Improvements
add_heading('5.3  Improvement Suggestions  🔧', 2)
add_table(
    ['Priority', 'Suggestion', 'Effort'],
    [
        ['High Impact', 'Add Zod or field whitelist to all req.body → prisma.create/update paths', 'Low'],
        ['High Impact', 'Wrap createShipment address + shipment in prisma.$transaction()', 'Low'],
        ['High Impact', 'Replace getReports sequential loop with groupBy + date truncation', 'Low'],
        ['High Impact', 'Add integration tests: auth flow, price calculation, shipment creation', 'High'],
        ['Medium Risk', 'Hash refresh tokens before DB storage (SHA-256)', 'Low'],
        ['Medium Risk', 'Migrate to RefreshToken table (1:N per user) for multi-device support', 'Medium'],
        ['Medium Risk', 'Replace local disk storage with S3-compatible object store', 'Medium'],
        ['Medium Risk', 'Add Winston/Pino with request ID middleware', 'Low'],
        ['Low Risk', 'Paginate listDrivers, listServiceAreas, listPromoCodes', 'Low'],
        ['Low Risk', 'Add CSRF token for the cookie-based refresh endpoint', 'Low'],
        ['Low Risk', 'Implement Africastalking SMS (env vars already present)', 'Low'],
        ['Low Risk', 'Replace HTML invoice stream with Puppeteer for true PDF', 'Medium'],
        ['Strategic', 'Add Redis cache for public /cms endpoint', 'Medium'],
        ['Strategic', 'Implement proper multi-device session management', 'High'],
        ['Strategic', 'Add CI pipeline with lint + type-check + test gates', 'Medium'],
    ],
    col_widths=[1.4, 4.0, 1.4]
)

# ── Save ──────────────────────────────────────────────────────────────────────
output_path = r'c:\VSCODE\TOLO EXPRESS\TOLLOE_EXPRESS_System_Documentation.docx'
doc.save(output_path)
print(f'Saved: {output_path}')
