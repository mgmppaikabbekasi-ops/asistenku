
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key tidak ditemukan. Pastikan environment variable API_KEY sudah diatur.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateContent = async (
  prompt: string, 
  systemInstruction?: string
): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        // Updated instruction: Strict usage of <br> only INSIDE tables
        systemInstruction: systemInstruction || "Anda adalah asisten AI profesional. Gunakan format Markdown yang valid. DILARANG menggunakan Block Code (```). Gunakan tag HTML <br> HANYA untuk baris baru DI DALAM sel tabel. Gunakan enter/newline biasa untuk di luar tabel.",
        temperature: 0.7,
      },
    });

    return response.text || "Maaf, tidak ada respon dari AI.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Terjadi kesalahan saat menghubungi layanan AI.");
  }
};

export const generateRPP = async (data: any) => {
  const includeRubricInstruction = data.includeRubric 
    ? "WAJIB: Buatkan Tabel Rubrik Penilaian Lengkap (Skor 1-4) di bagian lampiran setelah Refleksi." 
    : "";

  const tpInstruction = data.specificTP
    ? `Gunakan Tujuan Pembelajaran (TP) berikut secara persis: "${data.specificTP}"`
    : `Karena pengguna tidak mengisi TP, **BUATKAN Tujuan Pembelajaran (TP)** yang spesifik, relevan, dan terukur (ABCD) secara otomatis berdasarkan topik "${data.topic}".`;

  const studentDataContext = data.studentData 
    ? `**KONTEKS PERSONALISASI SISWA (PENTING):**\nSesuaikan strategi, bahasa, dan contoh pembelajaran berdasarkan profil siswa berikut: "${data.studentData}".` 
    : "";
  
  const curriculumContext = data.curriculum ? `Gunakan struktur dan istilah sesuai **${data.curriculum}**.` : "";

  // Generate Dynamic Meetings Prompt with DEEP LEARNING (Berkesadaran, Bermakna, Menggembirakan) & TAR Flow
  const meetingsPrompt = data.meetings.map((meeting: any, index: number) => {
    return `
    #### PERTEMUAN KE-${index + 1}
    **Fokus:** ${meeting.activity || data.topic}
    
    **Pendekatan:** Pembelajaran Mendalam (Deep Learning)

    | Tahapan Pembelajaran | Deskripsi Kegiatan (Berkesadaran, Bermakna, Menggembirakan) | Waktu |
    | :--- | :--- | :---: |
    | **PENDAHULUAN** <br> *(Berkesadaran & Bermakna)* | • **Berkesadaran (Mindfulness):** Guru menyapa hangat, teknik STOP sejenak/cek perasaan siswa agar hadir utuh.<br>• **Bermakna (Apersepsi):** Pertanyaan pemantik yang menghubungkan ${data.topic} dengan kehidupan nyata siswa.<br>• **Tujuan:** Menyampaikan tujuan pembelajaran yang jelas. | 10' |
    | **INTI** <br> *(Menggembirakan - Telaah & Aplikasi)* | • **Telaah (Memahami):** Siswa mengeksplorasi konsep ${data.topic} melalui media menarik/cerita (bukan ceramah panjang).<br>• **Aplikasi (Menerapkan):** Siswa melakukan aktivitas nyata/kolaborasi yang *menggembirakan* (Games/Proyek/Diskusi Aktif) sesuai metode ${meeting.method || 'Variatif'}.<br>• **Elaborasi:** Guru memfasilitasi pemahaman lebih dalam. | (Sisa) |
    | **PENUTUP** <br> *(Merefleksikan / Simpulan)* | • **Rumuskan (Refleksi):** Siswa diajak menyimpulkan poin kunci dan merefleksikan makna pembelajaran bagi dirinya.<br>• **Apresiasi:** Umpan balik positif dan doa penutup. | 10' |
    `;
  }).join('\n\n');

  const documentTitle = "RENCANA PEMBELAJARAN MENDALAM (RPM)";

  const prompt = `
    Buatkan dokumen **${documentTitle}** yang persis mengikuti struktur template PDF RPM.
    ${curriculumContext}
    
    **DATA INPUT:**
    - Sekolah: ${data.schoolName || "..................."}
    - Guru: ${data.teacherName || "..................."}
    - Mapel: ${data.subject}
    - Semester: ${data.semester || "Ganjil/Genap"}
    - Kelas: ${data.grade}
    - Topik: ${data.topic}
    - Alokasi Waktu Total: ${data.duration}
    - Jumlah Pertemuan: ${data.meetingCount}
    
    ${studentDataContext}
    ${tpInstruction}

    **INSTRUKSI PEDAGOGIS (PENTING):**
    Gunakan prinsip **Pembelajaran Mendalam (Deep Learning)** pada tabel Pengalaman Belajar:
    1. **Berkesadaran (Mindful)**: Siswa dan guru hadir utuh (mindfulness) di awal.
    2. **Bermakna (Meaningful)**: Pembelajaran relevan dengan kehidupan siswa.
    3. **Menggembirakan (Joyful)**: Kegiatan inti harus seru, interaktif, dan positif.
    
    Gunakan Alur **TAR** pada deskripsi kegiatan:
    - **T**elaah (Eksplorasi/Memahami)
    - **A**plikasi (Menerapkan/Praktik)
    - **R**umuskan (Refleksi/Simpulan)

    **INSTRUKSI FORMAT TABEL:**
    1. **Format**: Gunakan Markdown Table standard.
    2. **Ganti Baris**: Gunakan tag HTML **<br>** untuk membuat baris baru HANYA di dalam satu sel tabel. JANGAN gunakan <br> di luar tabel.
    3. **Alignment**:
       - Tabel **PENGALAMAN BELAJAR**: Kolom 1 (Tahapan - Rata Kiri), Kolom 2 (Deskripsi - Rata Kiri), Kolom 3 (Waktu - Rata Tengah).
    
    **STRUKTUR OUTPUT MARKDOWN (WAJIB URUT 1-6):**

    # ${documentTitle}

    ### 1. IDENTITAS
    | Atribut | Keterangan |
    | :--- | :--- |
    | **Nama Satuan Pendidikan** | ${data.schoolName || "..................."} |
    | **Nama Guru** | ${data.teacherName || "..................."} |
    | **Mata Pelajaran** | ${data.subject} |
    | **Kelas / Fase** | ${data.grade} |
    | **Semester** | ${data.semester || "...."} |
    | **Alokasi Waktu** | ${data.duration} |
    | **Jumlah Pertemuan** | ${data.meetingCount} Pertemuan |

    ### 2. IDENTIFIKASI
    | Komponen | Uraian Detail |
    | :--- | :--- |
    | **Kesiapan Peserta Didik** | **Pengetahuan Awal:** <br> • (Analisis kemampuan prasyarat) <br><br> **Minat & Gaya Belajar:** <br> • (Visual/Auditori/Kinestetik & Ketertarikan siswa) |
    | **Materi Pelajaran** | **Jenis Pengetahuan:** <br> • Faktual: (Fakta materi) <br> • Konseptual: (Konsep/Definisi) <br> • Prosedural: (Langkah/Cara) <br> • Metakognitif: (Refleksi) |
    | **Dimensi Profil Lulusan** | • DPL 1: Keimanan dan Ketaqwaan <br> • DPL 2: Kewargaan/Kebinekaan <br> • DPL 3: Penalaran Kritis <br> • DPL 4: Kreativitas <br> • DPL 5: Kolaborasi <br> • DPL 6: Kemandirian |
    | **Capaian Pembelajaran** | (Isi CP lengkap sesuai kurikulum) |

    ### 3. DESAIN PEMBELAJARAN
    | Komponen | Uraian Perencanaan |
    | :--- | :--- |
    | **Tujuan Pembelajaran** | (Isi TP yang spesifik dan terukur - ABCD) |
    | **Lintas Disiplin Ilmu** | (Koneksi dengan mapel lain, misal: Bahasa, Matematika) |
    | **Topik Pembelajaran** | ${data.topic} |
    | **Praktik Pedagogis** | Pembelajaran Mendalam (Berkesadaran, Bermakna, Menggembirakan) |
    | **Kemitraan Pembelajaran** | (Misal: Orang tua, Pakar tamu, Lingkungan sekitar) |
    | **Lingkungan Pembelajaran** | (Misal: Ruang Kelas, Perpustakaan, Halaman Sekolah) |
    | **Pemanfaatan Digital** | (Misal: Quizizz, Canva, Video Youtube, Google Classroom) |

    ### 4. PENGALAMAN BELAJAR
    (Rincian Kegiatan untuk **${data.meetingCount} Pertemuan** dengan Alur TAR)

    ${meetingsPrompt}

    ### 5. ASESMEN PEMBELAJARAN
    | Jenis Asesmen | Teknik Penilaian | Instrumen |
    | :--- | :--- | :--- |
    | **Asesmen Awal** | Lisan / Kuis Singkat | Daftar Pertanyaan Pemantik |
    | **Formatif (Proses)** | Observasi Kinerja (Saat Aplikasi) | Rubrik Checklist / Catatan Anekdot |
    | **Sumatif (Akhir)** | Tes Tertulis / Produk | Soal Uraian / Rubrik Penilaian Produk |

    ### 6. REFLEKSI GURU & CATATAN
    | Komponen | Catatan Refleksi |
    | :--- | :--- |
    | **Keberhasilan** | (Apa yang membuat siswa gembira dan paham?) |
    | **Kendala** | (Apa tantangan dalam menjaga kesadaran/fokus siswa?) |
    | **Tindak Lanjut** | (Apa perbaikan untuk pertemuan berikutnya?) |

    ${includeRubricInstruction}
  `;
  return generateContent(prompt, "Anda adalah ahli kurikulum RPM berbasis Pembelajaran Mendalam (Deep Learning). Output Markdown tabel harus rapi.");
};

export const regenerateRPPSection = async (data: any, sectionName: string) => {
  let specificContext = "";
  let sectionHeader = "";
  
  if (sectionName.includes("IDENTIFIKASI")) {
    specificContext = "Format Tabel 2 Kolom: | Komponen | Uraian Detail |. Gunakan tag <br> dan bullet •.";
    sectionHeader = "### 2. IDENTIFIKASI";
  } else if (sectionName.includes("DESAIN")) {
    specificContext = "Format Tabel 2 Kolom: | Komponen | Uraian Perencanaan |. Gunakan tag <br> dan bullet •.";
    sectionHeader = "### 3. DESAIN PEMBELAJARAN";
  } else if (sectionName.includes("PENGALAMAN")) {
    // Updated context for Experience section to force Deep Learning Principles
    specificContext = "Buat rincian kegiatan untuk SEMUA PERTEMUAN. Gunakan Prinsip: Berkesadaran, Bermakna, Menggembirakan. Gunakan Alur: Telaah, Aplikasi, Rumuskan. Format Tabel 3 Kolom: | Tahapan Pembelajaran | Deskripsi Kegiatan Guru & Siswa | Alokasi Waktu (Tengah) |. Gunakan tag <br> untuk baris baru dalam sel.";
    sectionHeader = "### 4. PENGALAMAN BELAJAR";
  } else if (sectionName.includes("ASESMEN")) {
    specificContext = "Format Tabel 3 Kolom: | Jenis Asesmen | Teknik | Instrumen |. Gunakan tag <br> dan bullet •.";
    sectionHeader = "### 5. ASESMEN PEMBELAJARAN";
  } else if (sectionName.includes("REFLEKSI")) {
    specificContext = "Format Tabel 2 Kolom: | Komponen | Catatan Refleksi |. Gunakan tag <br>.";
    sectionHeader = "### 6. REFLEKSI GURU & CATATAN";
  } else if (sectionName.includes("IDENTITAS")) {
    specificContext = "Format Tabel 2 Kolom: | Atribut | Keterangan |. Gunakan tag <br>.";
    sectionHeader = "### 1. IDENTITAS";
  }

  const prompt = `
    Konteks: Sedang membuat RPP RPM untuk Mapel ${data.subject}, Topik ${data.topic}, Kelas ${data.grade}.
    
    TUGAS: Buat ulang HANYA BAGIAN **${sectionName}** dalam format Tabel Markdown yang diminta.
    ${specificContext}
    
    ATURAN: Gunakan tag HTML <br> untuk baris baru di dalam sel tabel. DILARANG menggunakan [br] atau list markdown standard (-, 1.). Gunakan alignment tabel yang benar (:--- untuk kiri, :---: untuk tengah).
    Header bagian harus persis: ${sectionHeader}
  `;

  return generateContent(prompt, "Anda adalah ahli kurikulum RPM berbasis Pembelajaran Mendalam. Output hanya bagian yang diminta dalam format Markdown Tabel yang rapi dengan tag <br>.");
};

export const generateQuiz = async (data: any) => {
  // ... (Quiz generation logic remains unchanged)
  // Re-exporting unchanged logic to keep file consistency
  const getFormatInstruction = (type: string) => {
    switch (type) {
      case "Pilihan Ganda":
        return `
          - Format: 
            1. (Nomor). Tulis Pertanyaan di sini.
            
            A. Pilihan 1
            B. Pilihan 2
            C. Pilihan 3
            D. Pilihan 4
          
          - INSTRUKSI PENTING: 
            1. Berikan JARAK SATU BARIS KOSONG antara Pertanyaan dan Pilihan A.
            2. Pilihan A, B, C, D HARUS diletakkan SECARA VERTIKAL (Ke Bawah).
            3. DILARANG meletakkan pilihan menyamping (A. ... B. ...).
            4. Gunakan format List untuk opsi jika memungkinkan.`;
            
      case "Pilihan Ganda Kompleks":
        return `
          - Format: 
            1. (Nomor). Tulis Pertanyaan di sini. (Jawaban > 1).
            
            [ ] Opsi 1
            [ ] Opsi 2
            [ ] Opsi 3
            [ ] Opsi 4
          
          - INSTRUKSI PENTING: 
            1. Berikan JARAK SATU BARIS KOSONG antara Pertanyaan dan Opsi.
            2. Opsi jawaban HARUS VERTIKAL (Ke Bawah) menggunakan Checkbox Markdown.
            3. DILARANG meletakkan opsi menyamping.`;

      case "Menjodohkan":
        return `
          - Format: Buat dua daftar/kolom (Premis A dan Premis B) yang harus dipasangkan.
          - Gunakan format Tabel untuk menyajikannya agar rapi.
          - Kolom Kiri: Pernyataan/Soal. Kolom Kanan: Pasangan Jawaban (acak).
          - Di Kunci Jawaban, jelaskan pasangan yang benar (Misal: 1-C, 2-A).`;
      case "Benar Salah":
        return `
          - Format: Sajikan pernyataan, lalu minta siswa menentukan Benar atau Salah.
          - Contoh:
            1. Bumi berbentuk datar. (Benar / Salah)
            2. Air mendidih pada suhu 100 derajat Celcius. (Benar / Salah)`;
      case "Setuju / Tidak Setuju":
        return `
          - Format: Sajikan pernyataan opini atau sikap, minta siswa memilih Setuju/Tidak Setuju beserta alasannya.
          - Contoh:
            1. Penggunaan HP diperbolehkan di dalam kelas setiap saat. (Setuju / Tidak Setuju)
               Alasan: ..........................`;
      case "Jawaban Singkat":
      case "Isian Singkat":
        return `
          - Format: Pertanyaan langsung dengan tempat menjawab berupa titik-titik atau garis bawah pendek di tengah atau akhir kalimat.
          - Contoh: 
            1. Ibukota negara Indonesia adalah ....................`;
      case "Uraian / Essay":
        return `
          - Format: Pertanyaan terbuka yang membutuhkan jawaban panjang. Sediakan ruang kosong secukupnya (space).`;
      default:
        return "Format standar soal ujian.";
    }
  };

  const sectionsPrompt = data.sections.map((sec: any, idx: number) => `
    ### BAGIAN ${idx + 1}: ${sec.type.toUpperCase()}
    - Jumlah Soal: ${sec.questionCount}
    - Tingkat Kesulitan: ${sec.difficulty}
    - Instruksi Khusus: ${getFormatInstruction(sec.type)}
  `).join('\n\n');

  const syllabusContext = data.syllabus 
    ? `Gunakan Referensi Kisi-kisi dari Pengguna: "${data.syllabus}"` 
    : `Karena pengguna tidak mengisi kisi-kisi, **BUATKAN OTOMATIS** kisi-kisi yang relevan dengan topik "${data.topic}" dan jenjang ${data.grade}.`;

  const syllabusInstruction = `
    **BAGIAN 1: KISI-KISI PENULISAN SOAL (WAJIB ADA DI AWAL)**
    ${syllabusContext}
    
    Buatkan tabel "KISI-KISI PENULISAN SOAL" yang rapi di bagian paling awal dokumen output (Sebelum soal). 
    Tabel **WAJIB** mencakup kolom: **No**, **Tujuan Pembelajaran (TP)**, **Kelas/Semester**, **Materi**, **Level Kognitif**, **Indikator Soal**, **Bentuk Soal**, **Nomor Soal**.
    
    **ATURAN PENGISIAN LEVEL KOGNITIF (Taksonomi Bloom):**
    - **Level 1 (L1)**: Pengetahuan/Pemahaman (C1, C2)
    - **Level 2 (L2)**: Aplikasi (C3)
    - **Level 3 (L3)**: Penalaran (C4, C5, C6)

    *ATURAN PENTING: Pada tabel kisi-kisi, 1 Tujuan Pembelajaran (TP) HARUS dipetakan untuk 1 Soal saja (1 TP = 1 Soal) agar terarah dan spesifik. Jangan menggabungkan banyak soal untuk satu TP umum. Buatkan TP spesifik untuk setiap nomor.*
    *Catatan: Pastikan Indikator Soal menggunakan Kata Kerja Operasional (KKO) yang terukur sesuai Level Kognitif yang ditentukan.*
  `;

  const prompt = `
    Buatkan Instrumen Penilaian berupa Soal Latihan/Kuis (Tanpa kop surat, langsung judul).
    
    **SPESIFIKASI SOAL:**
    - Mapel: ${data.subject}
    - Materi: ${data.topic}
    - Kelas: ${data.grade}
    ${data.curriculum ? `- Kurikulum: ${data.curriculum}` : ''}
    ${data.semester ? `- Semester: ${data.semester}` : ''}
    
    ${syllabusInstruction}

    **STRUKTUR SOAL (${data.sections.length} Bagian):**
    ${sectionsPrompt}

    **ATURAN UMUM:**
    1. **JUDUL BESAR**: "LATIHAN SOAL - ${data.topic.toUpperCase()}"
    2. Gunakan penomoran soal yang rapi (Bisa reset nomor per bagian atau lanjut, asalkan jelas).
    3. Pisahkan antar bagian dengan Header Markdown (### Bagian X).
    4. **KUNCI JAWABAN**:
       - Letakkan di bagian paling bawah dokumen (Halaman terpisah).
       - Pisahkan dengan garis pembatas (---).
       - Kelompokkan kunci jawaban berdasarkan Bagian.
    5. **PEDOMAN PENILAIAN**:
       - Buat dalam kotak kutipan (Blockquote >) di akhir dokumen.
       - Tulis rumus penilaian yang sesuai.

    **OUTPUT DIHARAPKAN**:
    Judul, Tabel Kisi-kisi (Otomatis/Manual), Soal (sesuai format per bagian), Garis Pembatas, Kunci Jawaban Lengkap, Pedoman Nilai.
  `;
  return generateContent(prompt, "Anda adalah pembuat soal ujian profesional. Gunakan format Markdown yang rapi dan sesuai instruksi.");
};

export const generateRubric = async (data: any) => {
  // ... (Rubric generation logic remains unchanged)
  const subject = data.subject || "Umum";
  const topic = data.topic || "Tugas Standar";
  const grade = data.grade || "Umum";
  const rubricCount = data.rubricCount || 1;

  const tasksInstruction = data.rubricItems.map((item: any, i: number) => 
    `Rubrik ke-${i+1}: Jenis Tugas "${item.taskType}"`
  ).join('\n');

  const isFallbackNeeded = !data.subject && !data.topic;
  
  const fallbackInstruction = isFallbackNeeded 
    ? "**PERHATIAN**: Karena pengguna tidak mengisi detail Mapel/Topik, BUATKAN CONTOH RUBRIK LENGKAP untuk mata pelajaran 'Bahasa Indonesia' dengan topik 'Berpidato/Presentasi' sebagai template contoh." 
    : "";

  const prompt = `
    Buatkan ${rubricCount} variasi Rubrik Penilaian (Asesmen) dalam format **TABEL MARKDOWN**.
    
    Detail Umum:
    - Mapel: ${subject}
    - Kelas: ${grade}
    ${data.curriculum ? `- Kurikulum: ${data.curriculum}` : ''}
    ${data.semester ? `- Semester: ${data.semester}` : ''}
    - Topik/Judul Tugas: ${topic}
    - Jumlah Kriteria per Tabel: ${data.criteriaCount}
    
    **DAFTAR RUBRIK YANG HARUS DIBUAT (Total ${rubricCount}):**
    ${tasksInstruction}

    ${fallbackInstruction}

    Instruksi:
    1. Buatkan sebanyak **${rubricCount} Model Rubrik berbeda** sesuai jenis tugas yang diminta di atas.
    2. Pisahkan setiap variasi rubrik dengan Judul Header (### Rubrik [Nomor]: [Jenis Tugas]).
    3. Buat Tabel dengan kolom: **Aspek Penilaian**, **Skor 4 (Sangat Baik)**, **Skor 3 (Baik)**, **Skor 2 (Cukup)**, **Skor 1 (Kurang)**.
    4. Isi setiap sel dengan deskripsi indikator yang jelas dan spesifik sesuai jenis tugas.
    5. Di bawah setiap tabel, tuliskan Rumus Penilaian (Nilai = Skor Perolehan / Skor Maksimal x 100) dengan teks biasa.
  `;
  return generateContent(prompt, "Anda adalah spesialis asesmen. Sajikan rubrik dalam tabel markdown yang rapi. Jangan gunakan HTML.");
};

export const generateLKPD = async (data: any) => {
  // ... (LKPD generation logic remains unchanged)
  const activityCount = data.activityCount || 1;
  const activitiesInstruction = data.activities.map((item: any, i: number) => 
    `Aktivitas ke-${i+1}: Jenis "${item.type}"`
  ).join('\n');

  const prompt = `
    Buatkan Lembar Kerja Peserta Didik (LKPD) format Markdown.
    
    SPESIFIKASI:
    - Mapel: ${data.subject}
    - Kelas: ${data.grade}
    ${data.curriculum ? `- Kurikulum: ${data.curriculum}` : ''}
    ${data.semester ? `- Semester: ${data.semester}` : ''}
    - Topik: ${data.topic}
    
    **DAFTAR AKTIVITAS YANG HARUS DIBUAT (Total ${activityCount}):**
    ${activitiesInstruction}

    Instruksi Utama:
    1. Buatkan sebanyak **${activityCount} Aktivitas LKPD** sesuai jenis yang diminta di atas dalam satu dokumen.
    2. Pisahkan setiap aktivitas dengan Judul Header yang jelas (### AKTIVITAS [Nomor]: [Jenis Aktivitas]).
    3. Setiap aktivitas harus memiliki Struktur Lengkap: 
       - Judul Aktivitas
       - Identitas (Nama/Kelompok)
       - Tujuan Pembelajaran
       - Alat & Bahan
       - Langkah Kerja (Sistematis sesuai jenis aktivitasnya)
       - Pertanyaan Diskusi / Tabel Pengamatan (Sediakan tempat isi)
       - Kesimpulan.
    
    Gunakan Format Markdown rapi.
  `;
  return generateContent(prompt, "Guru kreatif.");
};

export const generateMaterials = async (data: any) => {
  // ... (Materials generation logic remains unchanged)
  const materialCount = data.materialCount || 1;
  const stylesInstruction = data.materialItems.map((item: any, i: number) => 
    `Bagian ke-${i+1}: Gaya Penulisan "${item.style}"`
  ).join('\n');

  const prompt = `
    Buatkan Bahan Ajar / Materi Bacaan format Markdown.
    
    SPESIFIKASI:
    - Mapel: ${data.subject}
    - Kelas: ${data.grade}
    ${data.curriculum ? `- Kurikulum: ${data.curriculum}` : ''}
    ${data.semester ? `- Semester: ${data.semester}` : ''}
    - Topik: ${data.topic}
    
    **DAFTAR VARIASI MATERI YANG HARUS DIBUAT (Total ${materialCount}):**
    ${stylesInstruction}
    
    Instruksi Utama:
    1. Buatkan sebanyak **${materialCount} versi materi** sesuai gaya penulisan yang diminta di atas.
    2. Pisahkan setiap materi dengan Judul Header (### MATERI BAGIAN [Nomor]: [Gaya Penulisan]).
    3. Buat materi yang mudah dipahami siswa, gunakan sub-judul dan poin-poin.

    **SARAN KUSTOMISASI UNTUK GURU (WAJIB - Di Akhir Dokumen):**
    Setelah semua materi selesai, tambahkan satu bagian terpisah di paling bawah dengan judul "### SARAN KUSTOMISASI UNTUK GURU".
    Berikan 3-5 tips konkret bagaimana guru bisa menyesuaikan materi ini.
  `;
  return generateContent(prompt, "Penulis buku teks.");
};

export const generatePresentation = async (data: any) => {
  const prompt = `
    Buatkan Kerangka Presentasi (Outline Slide) Powerpoint / Google Slides format Markdown.
    - Topik: ${data.topic}
    - Audiens: ${data.audience}
    - Tujuan: ${data.objective}
    - Jumlah Slide: ${data.slideCount}

    Struktur output:
    Slide 1: Judul & Subjudul
    Slide 2 - dst: Judul Slide & Poin-poin pembahasan.
    
    Setiap slide harus memiliki:
    - Judul Slide
    - 3-5 Poin utama
    - Saran Visual/Gambar (deskripsi singkat gambar yang cocok)
  `;
  return generateContent(prompt, "Anda adalah desainer instruksional ahli.");
};

export const generateIceBreaking = async (data: any) => {
  const prompt = `
    Berikan 3-5 ide Games / Ice Breaking yang seru dan detail.
    - Kelas/Target: ${data.grade}
    - Situasi: ${data.situation}
    - Durasi per game: ${data.duration}

    Format setiap ide:
    1. Nama Game
    2. Alat yang dibutuhkan (jika ada, utamakan tanpa alat/sederhana)
    3. Cara bermain (langkah-langkah)
    4. Tujuan / Manfaat
  `;
  return generateContent(prompt, "Anda adalah guru kreatif yang ahli membuat suasana kelas hidup.");
};

export const chatWithTeacher = async (message: string, history: string[]) => {
    return generateContent(message, "Anda adalah Asisten Guru Asep Saefullah.");
}

export const chatWithMentor = async (message: string, history: string[]) => {
    const systemInstruction = "Anda adalah rekan curhat, mentor senior, dan konselor bagi guru. Nama Anda adalah 'Rekan Cerita'. Dengarkan keluh kesah pengguna dengan empati tinggi, validasi perasaan mereka, dan berikan saran konstruktif yang menenangkan namun profesional. Gaya bahasa santai, hangat, dan suportif (seperti teman dekat).";
    return generateContent(message, systemInstruction);
}
