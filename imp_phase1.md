Karena kamu menggunakan **Next.js (App Router)** dengan **TypeScript**, pendekatannya akan sedikit berbeda dari React biasa, terutama dalam hal routing dan struktur folder. Next.js sangat powerful untuk kasus ini karena fitur *Nested Layouts*-nya.

Berikut adalah **Implementation Plan** detail yang disiapkan agar kamu bisa langsung memberikannya sebagai instruksi (prompt) ke model **Minimax** kamu.

---

### **Phase 1: Foundation & Architecture (Next.js App Router)**

Tujuan fase ini adalah membangun "Rumah" (Layout) dan "Pintu" (Routing) sebelum mengisi perabotannya (Fitur).

#### **1. Definisi Tipe Data (TypeScript Interfaces)**

Sebelum generate komponen, instruksikan modelmu untuk membuat tipe data dasar. Ini akan mencegah error `any` di kemudian hari.

* **File:** `types/index.ts`
* **Instruksi untuk Minimax:**
> "Buatkan TypeScript interfaces untuk aplikasi Task Manager. Saya butuh interface untuk `Task` (id, title, status, priority, dueDate), `Project` (id, name, description), dan `User`. Status bisa berupa 'Todo', 'InProgress', 'Done'. Priority: 'High', 'Medium', 'Low'."



#### **2. Struktur Folder (App Router)**

Kita akan menggunakan fitur **Route Groups** `(dashboard)` agar Sidebar hanya muncul di halaman panel, bukan di halaman Login/Register nanti.

**Rencana Struktur:**

```text
src/
├── app/
│   ├── (dashboard)/        <-- Route Group (tidak mempengaruhi URL)
│   │   ├── layout.tsx      <-- Layout Utama (Sidebar + Header + Main)
│   │   ├── page.tsx        <-- Halaman Dashboard (Overview)
│   │   ├── calendar/       
│   │   │   └── page.tsx    <-- Halaman Calendar
│   │   ├── projects/
│   │   │   └── [projectId]/ <-- Dynamic Route
│   │       └── page.tsx    <-- Halaman Kanban Board (Reusable)
│   │   └── settings/
│   │       └── page.tsx
│   ├── layout.tsx          <-- Root Layout (HTML/Body)
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx     <-- Client Component (Interactive)
│   │   └── Header.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   └── ProjectList.tsx
│   └── kanban/
│       └── Board.tsx       <-- Komponen utamamu yang lama
└── types/
    └── index.ts

```

#### **3. Detail Implementasi Komponen (Blueprint untuk AI)**

Berikut adalah spesifikasi logika yang harus kamu berikan ke Minimax saat meminta kode:

**A. Sidebar Component (`components/layout/Sidebar.tsx`)**

* **Type:** Client Component (`"use client"`) karena butuh interaksi *expand/collapse* dan membaca URL aktif.
* **Requirements:**
* Gunakan hook `usePathname` dari `next/navigation` untuk menentukan menu mana yang sedang aktif (beri style beda).
* Menu "Projects" harus berupa *Accordion* (bisa dibuka/tutup).
* Gunakan `Link` dari `next/link` untuk navigasi instan (SPA feel).
* Terima prop data `projects` (array) untuk merender sub-menu Project A, B, C secara dinamis.



**B. Dashboard Layout (`app/(dashboard)/layout.tsx`)**

* **Type:** Server Component.
* **Requirements:**
* Ini adalah pembungkus utama. Render `<Sidebar />` di kiri (fixed width) dan `{children}` di kanan.
* Untuk tahap awal, buat *Mock Data* projects di sini dan passing ke Sidebar sebagai props.



**C. Dynamic Project Page (`app/(dashboard)/projects/[projectId]/page.tsx`)**

* **Type:** Server Component.
* **Requirements:**
* Ambil `params.projectId` untuk mengetahui project mana yang sedang dibuka.
* Berdasarkan ID tersebut, render komponen `KanbanBoard`.
* Contoh logic untuk AI: "Jika URL adalah `/projects/project-a`, tampilkan judul 'Project A' dan load data task khusus project A."



---

### **Prompt Guide: Cara Meminta Kode ke Minimax**

Agar hasilnya presisi, kamu bisa copy-paste prompt berikut secara bertahap ke Opencode Models Minimax:

#### **Step 1: Setup Layout & Sidebar**

> "Saya sedang membangun aplikasi Task Manager dengan Next.js 14 (App Router) dan TypeScript. Tolong buatkan kode untuk `components/layout/Sidebar.tsx` dan `app/(dashboard)/layout.tsx`.
> 1. **Sidebar:** Harus Client Component. Gunakan `lucide-react` untuk icon. Ada menu: Dashboard, Projects (Dropdown), Calendar, Chat, Members, Settings. Gunakan `usePathname` untuk highlight menu aktif.
> 2. **Layout:** Buat layout dengan Sidebar fixed di kiri (lebar 64-80px atau 250px) dan konten utama di kanan. Gunakan Tailwind CSS untuk styling agar terlihat modern dan clean seperti SaaS app."
> 
> 

#### **Step 2: Implementasi Dynamic Routing**

> "Sekarang buatkan struktur halaman untuk Project dinamis.
> 1. Buat file `app/(dashboard)/projects/[projectId]/page.tsx`.
> 2. Halaman ini harus menangkap `params.projectId`.
> 3. Tampilkan judul project berdasarkan ID tersebut.
> 4. Render komponen placeholder `<KanbanBoard />` di dalamnya. Pastikan tipe datanya aman (TypeScript)."
> 
> 

#### **Step 3: Dashboard Overview**

> "Buatkan halaman `app/(dashboard)/page.tsx` sebagai Dashboard utama.
> 1. Saya ingin ada 3 kartu statistik di atas (Total Tasks, Completed, In Progress).
> 2. Di bawahnya ada tabel 'Recent Tasks' sederhana.
> 3. Gunakan data dummy dulu dalam bentuk Array Object."
> 
> 

---

### **Tips Tambahan untuk Next.js + TS**

1. **"Use Client" is Key:** Karena sidebar butuh state (buka/tutup menu project), jangan lupa pastikan AI menambahkan `'use client';` di baris paling atas file `Sidebar.tsx`.
2. **Lucide React:** Pastikan kamu sudah install: `npm install lucide-react`.
3. **Data Fetching (Nanti):** Di Next.js, nanti kamu bisa fetch data project langsung di `layout.tsx` (Server Component) dan mengirimnya ke Sidebar. Ini membuat load time sangat cepat.

Silakan mulai generate Step 1 dengan Minimax, lalu jika ada error atau butuh penyesuaian CSS, kamu bisa tanya lagi ke saya!