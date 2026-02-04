Berikut adalah **Implementation Plan Detail untuk Phase 3: Backend Integration & Data Mutation**.

Setelah UI/UX selesai di Phase 2 (menggunakan Mock Data), Phase 3 fokus pada **"Making it Real"**: menghubungkan aplikasi ke Database, mengatur Autentikasi, dan menangani Create-Read-Update-Delete (CRUD) data secara nyata menggunakan fitur **Server Actions** di Next.js.

---

### **Overview Phase 3**

* **Database:** PostgreSQL (via Supabase atau Neon).
* **ORM:** Prisma (Wajib untuk TypeScript agar tipe data otomatis ter-generate).
* **Data Mutation:** Next.js Server Actions (cara modern tanpa bikin API route manual).
* **State Sync:** TanStack Query (React Query) atau `useOptimistic` untuk update UI instan saat drag-and-drop.

---

### **Module 1: Database Setup & Schema (The Backbone)**

**Goal:** Menyiapkan tempat penyimpanan data yang terstruktur.

* **Tech Stack:** Prisma ORM + PostgreSQL.
* **File Target:** `prisma/schema.prisma`
* **Prompt untuk Minimax:**
> "Kita masuk ke backend. Tolong buatkan skema Prisma (`schema.prisma`) untuk aplikasi Task Manager.
> **Requirements:**
> 1. **User:** id, email, name, avatarUrl, createdAt.
> 2. **Project:** id, name, description, ownerId (relasi ke User), createdAt.
> 3. **Task:** id, title, description, status ('TODO', 'IN_PROGRESS', 'DONE'), priority ('HIGH', 'MEDIUM', 'LOW'), order (Int - untuk posisi drag & drop), projectId (relasi ke Project), assigneeId (relasi ke User), dueDate.
> 4. **Comment:** id, content, taskId, userId.
> 
> 
> Tolong sertakan juga perintah terminal untuk install Prisma dan melakukan push ke database."



---

### **Module 2: Server Actions (The Logic Layer)**

**Goal:** Membuat fungsi backend yang bisa dipanggil langsung dari tombol frontend (misal: saat klik "Create Task").

* **Lokasi:** `app/actions/`
* **Konsep:** Di Next.js App Router, kita tidak perlu membuat `/api/tasks`. Cukup buat fungsi async dengan directive `'use server'`.

#### **A. Project Actions**

* **File:** `app/actions/projectActions.ts`
* **Prompt:**
> "Buatkan Server Actions untuk Project management di file `app/actions/projectActions.ts`.
> Gunakan `'use server'`.
> 1. `getProjects(userId)`: Fetch semua project milik user.
> 2. `createProject(data)`: Create project baru.
> 3. `deleteProject(id)`: Hapus project.
> Pastikan menggunakan `revalidatePath` agar halaman otomatis refresh setelah data berubah."
> 
> 



#### **B. Task Actions (CRUD & Reordering)**

* **File:** `app/actions/taskActions.ts`
* **Prompt:**
> "Buatkan Server Actions untuk Task di `app/actions/taskActions.ts`.
> 1. `createTask(formData)`: Menerima input dari modal dan save ke DB.
> 2. `updateTaskStatus(taskId, newStatus, newOrder)`: Ini penting untuk fitur Drag & Drop nanti.
> 3. `updateTaskPriority(taskId, newPriority)`.
> 4. `deleteTask(taskId)`."
> 
> 



---

### **Module 3: Wiring Frontend to Backend (Integration)**

**Goal:** Mengganti `mockData` dengan data asli dari database.

#### **A. Fetching Data di Server Components**

* **Target:** `app/(dashboard)/layout.tsx` (untuk Sidebar) & `app/(dashboard)/projects/[projectId]/page.tsx`.
* **Prompt:**
> "Sekarang kita hubungkan UI dengan Database.
> 1. Di `app/(dashboard)/layout.tsx`, hapus mock data projects. Ganti dengan panggilan `await prisma.project.findMany(...)` dan passing datanya ke komponen `<Sidebar />`.
> 2. Di halaman `projects/[projectId]/page.tsx`, fetch data tasks berdasarkan `params.projectId`. Passing data tasks ini ke komponen `KanbanBoard`."
> 
> 



#### **B. Wiring "Add Task" Modal**

* **Target:** `components/CreateTaskModal.tsx`
* **Prompt:**
> "Update komponen `CreateTaskModal`.
> Ubah tombol 'Create' agar memanggil Server Action `createTask` yang sudah kita buat.
> Gunakan hook `useFormStatus` dari `react-dom` untuk menampilkan loading spinner saat sedang proses save.
> Setelah sukses, tutup modal secara otomatis."



---

### **Module 4: Drag & Drop Persistence (Advanced)**

**Goal:** Saat kartu digeser, posisi barunya tersimpan di database, bukan cuma di layar.

* **Target:** `components/kanban/Board.tsx`
* **Logika:** Optimistic Update (Ubah UI dulu, baru request ke server agar terasa cepat).
* **Prompt untuk Minimax:**
> "Saya ingin fitur Drag and Drop menyimpan perubahan ke database.
> Update fungsi `onDragEnd` di `KanbanBoard`.
> 1. Saat kartu dipindah (status berubah atau urutan berubah), panggil Server Action `updateTaskStatus`.
> 2. **Optimistic UI:** Jangan tunggu server merespons. Update state lokal React terlebih dahulu agar UI tidak nge-lag (snappy). Jika server error, baru revert perubahannya (Rollback)."
> 
> 



---

### **Step-by-Step Prompt Execution Guide**

Berikut urutan prompt yang bisa kamu copy-paste ke Minimax:

1. **Step 1 (DB Schema):** "Setup Prisma Schema untuk User, Project, dan Task lengkap dengan relasi dan Enum untuk Status/Priority."
2. **Step 2 (Seeding):** "Buatkan script `seed.ts` sederhana untuk mengisi database dengan 1 User dummy dan 3 Project dummy beserta beberapa Task, agar saya bisa langsung melihat hasilnya di UI."
3. **Step 3 (Data Fetching):** "Refactor `app/(dashboard)/layout.tsx` dan `page.tsx` untuk mengambil data real dari Prisma, bukan dari mock file."
4. **Step 4 (Mutation):** "Buatkan file `actions/taskActions.ts` berisi fungsi `createTask` dan `updateTask`, lalu ajarkan saya cara memanggilnya dari Client Component `CreateTaskModal`."

Apakah kamu sudah memiliki database PostgreSQL (bisa lokal atau cloud seperti Supabase)? Jika belum, saya sarankan mulai dengan **Supabase** (gratis & cepat setupnya).