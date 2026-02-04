Berikut adalah **Implementation Plan Detail untuk Phase 2: Core Features & UI Components**.

Fokus fase ini adalah **mengisi "cangkang"** yang sudah dibuat di Phase 1 dengan fitur fungsional (Dashboard, Project Views, Calendar) menggunakan *Mock Data* terlebih dahulu agar UI/UX-nya matang sebelum masuk ke Backend.

---

### **Prerequisite: Centralized Data (Mocking)**

Sebelum meminta AI membuat komponen, kita butuh "sumber kebenaran" data palsu agar semua halaman terlihat konsisten.

* **File:** `lib/mockData.ts`
* **Instruksi untuk Minimax:**
> "Buatkan file `lib/mockData.ts`. Saya butuh array constant untuk `USERS` (avatar, name, email), `PROJECTS` (id, name, status), dan `TASKS` (id, title, status: 'Todo'|'In Progress'|'Done', priority: 'High'|'Medium'|'Low', dueDate, assignee). Pastikan datanya cukup banyak (10-20 tasks) untuk tes scrolling."



---

### **Module 1: Dashboard (Overview)**

**Goal:** Membuat halaman Home yang informatif seperti referensi *Fireart Studio*.

* **File Target:** `app/(dashboard)/page.tsx`
* **Komponen Baru:**
1. `StatsCard.tsx`: Kartu ringkasan angka (Total Task, Completed, Pending).
2. `GreetingHeader.tsx`: "Good Morning, [Name]" + Tanggal hari ini.
3. `RecentActivityTable.tsx`: Tabel sederhana task yang baru di-update.


* **Prompt untuk Minimax:**
> "Tolong buatkan isi halaman `app/(dashboard)/page.tsx`.
> 1. **Header:** Tampilkan sapaan user dan tanggal sekarang.
> 2. **Stats Grid:** Buat 3 kartu (Total Projects, Pending Tasks, Completed Tasks) dengan styling modern (sedikit shadow, rounded corners).
> 3. **Recent Tasks:** Ambil 5 data teratas dari mock data `TASKS` dan tampilkan dalam tabel list sederhana (Judul, Priority Badge, Due Date).
> Gunakan Tailwind CSS untuk layout responsif."
> 
> 



---

### **Module 2: Project Features (The Core)**

**Goal:** Upgrade tampilan Project agar memiliki opsi **Board View** (Kanban) dan **List View** (Table) seperti *Tasklab*.

* **File Target:** `app/(dashboard)/projects/[projectId]/page.tsx`
* **State Management:** Menggunakan `useState` untuk switch antara mode 'BOARD' dan 'LIST'.

#### **A. Komponen: Project Header & Filters**

* **Prompt:**
> "Buatkan komponen `ProjectHeader` yang menerima props `projectData`.
> Fiturnya:
> 1. Menampilkan Judul Project dan Deskripsi.
> 2. Di sebelah kanan, ada tombol **Tab Switcher**: 'Board' vs 'List'.
> 3. Ada tombol '+ Add Task' (UI only dulu).
> 4. Ada tombol 'Filter' dan 'Sort' (UI only)."
> 
> 



#### **B. Komponen: List View (Table)**

* **Prompt:**
> "Buatkan komponen `TaskListView.tsx`.
> Ini adalah tampilan tabel untuk task. Kolomnya: Task Name, Status (Badge), Priority (Flag Icon + Warna), Assignee (Avatar), Due Date.
> Gunakan mock data tasks yang sudah ada."



#### **C. Integrasi di Halaman Project**

* **Prompt:**
> "Update halaman `app/(dashboard)/projects/[projectId]/page.tsx`.
> 1. Gunakan `useState` untuk melacak `currentView` ('board' atau 'list').
> 2. Render `ProjectHeader` di atas.
> 3. Jika `currentView === 'board'`, render komponen Kanban Board yang lama (tolong refactor agar menerima props `tasks`).
> 4. Jika `currentView === 'list'`, render `TaskListView`.
> 5. Pastikan transisi antar view mulus."
> 
> 



---

### **Module 3: Calendar Page**

**Goal:** Visualisasi deadline tugas.

* **File Target:** `app/(dashboard)/calendar/page.tsx`
* **Library Recommendation:** `react-big-calendar` (Standar industri, stabil) atau `fullcalendar`. Untuk kemudahan setup di Next.js, saya sarankan mulai dengan *custom grid* sederhana atau `react-calendar` jika hanya butuh date picker, tapi untuk *Scheduler* gunakan `react-big-calendar`.
* **Prompt untuk Minimax:**
> "Saya ingin membuat halaman Calendar. Install `react-big-calendar` dan `moment`.
> 1. Buat komponen `CalendarView` yang membungkus `react-big-calendar`.
> 2. Mapping data `mockTasks` ke format events kalender (start = dueDate, end = dueDate, title = task title).
> 3. Beri warna event berbeda berdasarkan prioritas task (High = Merah, Low = Biru).
> 4. Implementasikan di `app/(dashboard)/calendar/page.tsx`.
> Pastikan CSS calendar di-import agar tampilannya benar."
> 
> 



---

### **Module 4: Global "Add Task" Modal**

**Goal:** Tombol "+ Add Task" harus berfungsi memunculkan formulir, di mana pun user berada.

* **Teknik Next.js:** Menggunakan **Intercepting Routes** (Advanced) atau **Global Modal Component** (Simpler). Untuk tahap ini, gunakan Global Modal State (Zustand/Context).
* **Komponen:** `CreateTaskModal.tsx`
* **Prompt:**
> "Buatkan komponen `CreateTaskModal` yang berupa popup/overlay di tengah layar.
> Input fields:
> * Title (Text)
> * Description (Textarea)
> * Status (Select)
> * Priority (Radio Button)
> * Due Date (Input Date)
> * Assignee (Select User)
> Berikan tombol 'Cancel' dan 'Create'. Untuk sekarang, tombol Create hanya perlu `console.log` data formnya."
> 
> 



---

### **Urutan Eksekusi untuk AI (Step-by-Step Guide)**

Berikut adalah urutan perintah yang bisa kamu berikan ke Minimax agar kodenya tidak berantakan:

1. **Step 1 (Data):** "Generate file `lib/mockData.ts` dan `types/index.ts` dengan interface lengkap."
2. **Step 2 (Components - Dashboard):** "Buat komponen `StatsCard` dan halaman Dashboard utama menggunakan mock data tersebut."
3. **Step 3 (Components - Project List):** "Buat komponen `TaskListView` (tampilan tabel) yang rapi menggunakan Tailwind."
4. **Step 4 (Logic - Project Page):** "Gabungkan `KanbanBoard` lama saya dengan `TaskListView` baru di dalam halaman `projects/[projectId]/page.tsx` dengan fitur tab switcher."
5. **Step 5 (Feature - Calendar):** "Implementasikan halaman Calendar menggunakan `react-big-calendar`."

Apakah kamu ingin langsung memulai dengan **Step 1 (Mock Data & Types)**? Saya bisa bantu generate prompt spesifiknya.