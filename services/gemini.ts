
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
        systemInstruction: systemInstruction || "Anda adalah asisten AI profesional untuk guru di Indonesia. Gunakan Markdown murni. DILARANG KERAS MENGGUNAKAN HTML (Tag <table>, <tr>, <br>, <div>, dll). Gunakan format tabel Markdown standard.",
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
    ? "WAJIB: Buatkan Tabel Rubrik Penilaian Lengkap (Skor 1-4) di bagian lampiran setelah Asesmen." 
    : "";

  const tpInstruction = data.specificTP
    ? `Gunakan Tujuan Pembelajaran (TP) berikut secara persis: "${data.specificTP}"`
    : `Karena pengguna tidak mengisi TP, **BUATKAN Tujuan Pembelajaran (TP)** yang spesifik, relevan, dan terukur (ABCD) secara otomatis berdasarkan topik "${data.topic}".`;

  const customAssessmentInstruction = data.customAssessments && data.customAssessments.length > 0
    ? `Tambahkan juga kolom/kategori asesmen berikut ini ke dalam tabel ASESMEN PEMBELAJARAN: ${data.customAssessments.join(', ')}.`
    : "";

  const meetingDetailsStr = data.meetings.map((m: any, i: number) => 
    `Pertemuan ${i+1}: Metode "${m.method || data.method || 'Variatif'}", Fokus Kegiatan: "${m.activity || 'Sesuai alur standar'}"`
  ).join(', ');

  const documentTitle = data.title || "Rencana Pembelajaran Mendalam (RPM)";
  
  const studentDataContext = data.studentData 
    ? `**KONTEKS PERSONALISASI SISWA (PENTING):**\nSesuaikan strategi, bahasa, dan contoh pembelajaran berdasarkan profil siswa berikut: "${data.studentData}".` 
    : "";
  
  const curriculumContext = data.curriculum ? `Gunakan struktur dan istilah sesuai **${data.curriculum}**.` : "";

  // Logic for Core Activity Model with Integrated Pedagogical Principles
  const coreActivityInstruction = data.coreActivityModel === 'tar'
    ? `Untuk bagian KEGIATAN INTI, **WAJIB** gunakan format poin di dalam kolom 'Deskripsi Kegiatan' yang secara eksplisit mengintegrasikan alur TAR dengan prinsip **Berkesadaran, Bermakna, Menggembirakan**:
       1. **Memahami (Telaah/Konsep) - Berkesadaran**: (Isi kegiatan siswa yang membangun fokus/mindfulness saat menelaah konsep...)
       2. **Mengaplikasi (Praktek/Diskusi) - Bermakna**: (Isi kegiatan siswa yang kontekstual dengan kehidupan nyata...)
       3. **Merefleksi (Simpul/Evaluasi) - Menggembirakan**: (Isi kegiatan refleksi yang positif, apresiatif, dan menyenangkan...)`
    : `Untuk bagian KEGIATAN INTI, susun langkah pembelajaran yang mengintegrasikan prinsip **Berkesadaran, Bermakna, dan Menggembirakan** ke dalam fase **Memahami, Mengaplikasi, dan Merefleksi**:
       - Fase **Memahami** harus mencerminkan prinsip **Berkesadaran**.
       - Fase **Mengaplikasi** harus mencerminkan prinsip **Bermakna**.
       - Fase **Merefleksi** harus mencerminkan prinsip **Menggembirakan**.
       - Gunakan simbol bullet (•) untuk poin-poin agar rapi.`;

  // Date formatting
  const formattedDate = data.date 
    ? new Date(data.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const prompt = `
    Buatkan dokumen **${documentTitle}** yang persis mengikuti struktur di bawah ini.
    ${curriculumContext}
    
    **DATA INPUT:**
    - Sekolah: ${data.schoolName || "..................."}
    - Guru: ${data.teacherName || "..................."} (NIP: ${data.teacherNIP || "..................."})
    - Mapel: ${data.subject}
    - Semester: ${data.semester || "Ganjil/Genap"}
    - Kelas: ${data.grade}
    - Topik: ${data.topic}
    - Alokasi Waktu Harian: ${data.duration}
    - Detail Pertemuan: ${meetingDetailsStr}
    
    ${studentDataContext}

    ${tpInstruction}
    ${coreActivityInstruction}

    **ATURAN FORMAT (ANTI HTML & RAPI):**
    1. **HANYA GUNAKAN TABEL MARKDOWN**. Dilarang menggunakan tag HTML seperti <table>, <tr>, <td>, <br>, <center>.
    2. **FORMAT TANDA TANGAN**: Gunakan tabel markdown 2 kolom untuk tanda tangan. Tambahkan baris JABATAN di bawah NIP.
    3. **POIN DALAM TABEL**: Gunakan bullet (•) atau angka (1.) secara langsung.
    4. **JANGAN GUNAKAN ATRIBUT WIDTH/ALIGN**. Biarkan renderer yang mengatur lebar.
    
    **STRUKTUR OUTPUT:**

    # ${documentTitle}

    ### 1. IDENTITAS
    | Komponen | Keterangan |
    | :--- | :--- |
    | **Nama Satuan Pendidikan** | ${data.schoolName || "..................."} |
    | **Nama Guru** | ${data.teacherName || "..................."} |
    | **NIP** | ${data.teacherNIP || "-"} |
    | **Mata Pelajaran** | ${data.subject} |
    | **Kelas** | ${data.grade} |
    | **Semester** | ${data.semester || "...."} |
    | **Alokasi Waktu Harian** | ${data.duration} (${data.meetingCount} Pertemuan) |

    ### 2. IDENTIFIKASI
    | Komponen | Deskripsi |
    | :--- | :--- |
    | **Kesiapan Peserta Didik** | • **Pengetahuan awal**: (Isi detail) - • **Minat**: (Isi detail) |
    | **Siswa Aktif** | (Deskripsikan profil siswa yang aktif dalam pembelajaran. Contoh: "5 Siswa sangat antusias bertanya," "Kelompok B selalu mendominasi diskusi," atau "Siswa kinestetik cenderung bergerak saat praktek.") |
    | **Materi Pelajaran** | • **Faktual**: (Isi) - • **Konseptual**: (Isi) - • **Prosedural**: (Isi) - • **Metakognitif**: (Isi) |
    | **Dimensi Profil Lulusan (DPL)** | (Sebutkan DPL 1-8 yang relevan) |

    ### 3. DESAIN PEMBELAJARAN
    | Komponen | Deskripsi |
    | :--- | :--- |
    | **Capaian Pembelajaran (CP)** | (Isi CP) |
    | **Tujuan Pembelajaran (TP)** | (Isi TP yang telah dibuat) |
    | **Topik Pembelajaran** | ${data.topic} |
    | **Lintas Disiplin Ilmu** | (Hubungan dengan mapel lain) |
    | **Praktik Pedagogis** | ${data.method || "Inkuiri, PBL, PjBL"} |
    | **Kemitraan Pembelajaran** | (Orang Tua, Pakar, Komunitas) |
    | **Lingkungan Pembelajaran** | (Fisik, Virtual, Budaya) |
    | **Pemanfaatan Digital** | (Aplikasi/Platform yang dipakai) |

    ### 4. PENGALAMAN BELAJAR
    (Buat tabel ini untuk SETIAP pertemuan).

    **PERTEMUAN 1**
    | Tahap | Deskripsi Kegiatan (Berkesadaran, Bermakna, Menggembirakan) | Estimasi Waktu |
    | :--- | :--- | :--- |
    | **AWAL** | (Sapaan, Doa, "Check-in" emosi siswa/Mindfulness, Pertanyaan Pemantik) | 10 menit |
    | **INTI** | ${data.coreActivityModel === 'tar' ? '1. **Memahami (Berkesadaran)**: ... \n2. **Mengaplikasi (Bermakna)**: ... \n3. **Merefleksi (Menggembirakan)**: ...' : '(Isi langkah kegiatan inti dengan poin-poin yang interaktif dan berprinsip pedagogis)'} | ... menit |
    | **PENUTUP** | (Refleksi bermakna, Apresiasi, Doa penutup) | 10 menit |

    *(Ulangi Struktur Tabel PENGALAMAN BELAJAR di atas untuk Pertemuan selanjutnya sesuai input)*

    ### 5. ASESMEN PEMBELAJARAN
    | Indikator / Tahapan | Indikator Penilaian (Rinci & Spesifik) | Asesmen Formatif (Awal & Proses) | Asesmen Sumatif (Akhir) |
    | :--- | :--- | :--- | :--- |
    | **Bentuk & Instrumen** | (Tuliskan indikator ketercapaian secara rinci, misal: 'Siswa mampu menjelaskan...') | **Teknik:** (Misal: Observasi, Lisan) <br> **Instrumen:** (Misal: Ceklis, Rubrik) | **Teknik:** (Misal: Tes Tulis) <br> **Instrumen:** (Misal: Soal PG, Uraian) |
    | **Keterangan** | *Kriteria keberhasilan minimum.* | *Dilakukan selama pembelajaran.* | *Dilakukan di akhir untuk nilai.* |
    ${customAssessmentInstruction ? `| **Tambahan** | (Indikator untuk ${data.customAssessments.join(', ')}) | ${data.customAssessments.join(', ')} | (Isi keterangan) |` : ''}

    ### 6. REFLEKSI GURU
    | Pertanyaan Refleksi | Catatan Guru (Diisi Setelah Pembelajaran) |
    | :--- | :--- |
    | Apakah tujuan pembelajaran tercapai? | ....................................................... |
    | Apakah prinsip berkesadaran & bermakna muncul? | ....................................................... |
    | Kesulitan apa yang dialami peserta didik? | ....................................................... |
    | Langkah perbaikan untuk pertemuan berikutnya? | ....................................................... |

    ${includeRubricInstruction}

    ---
    
    Mengetahui,
    
    | Kepala Sekolah | Guru Mata Pelajaran |
    | :--- | :--- |
    | (Tanda Tangan) | ${data.place ? data.place + ', ' : ''}${formattedDate} |
    | | |
    | **${data.principalName || ".............................."}** | **${data.teacherName || ".............................."}** |
    | NIP. ${data.principalNIP || ".............................."} | NIP. ${data.teacherNIP || ".............................."} |
    | Jabatan: Kepala Sekolah | Jabatan: Guru Kelas / Mapel |
    
  `;
  return generateContent(prompt, "Anda adalah ahli kurikulum dan pedagogi modern. Hasilkan output Markdown yang bersih.");
};

export const regenerateRPPSection = async (data: any, sectionName: string) => {
  // Simplifikasi prompt untuk regenerasi bagian tertentu
  let specificContext = "";
  
  if (sectionName.includes("IDENTIFIKASI")) {
    specificContext = "Fokus pada Kesiapan Peserta Didik, Siswa Aktif, Materi Pelajaran (Faktual-Metakognitif), dan Profil Lulusan.";
  } else if (sectionName.includes("DESAIN")) {
    specificContext = "Fokus pada CP, TP, dan elemen desain pembelajaran.";
  } else if (sectionName.includes("PENGALAMAN")) {
    specificContext = `Fokus pada langkah kegiatan Pertemuan (Awal, Inti, Penutup) yang **Berkesadaran, Bermakna, dan Menggembirakan** serta terintegrasi dengan **Memahami, Mengaplikasi, Merefleksi**. Model inti: ${data.coreActivityModel}`;
  } else if (sectionName.includes("ASESMEN")) {
    specificContext = "Fokus pada tabel Asesmen dengan kolom Indikator Penilaian, Instrumen/Teknik, Formatif, dan Sumatif.";
  }

  const prompt = `
    Konteks: Sedang membuat RPP untuk Mapel ${data.subject}, Topik ${data.topic}, Kelas ${data.grade}.
    ${data.curriculum ? `Kurikulum: ${data.curriculum}` : ''}
    ${data.studentData ? `Data Siswa Khusus: ${data.studentData}` : ''}
    
    TUGAS: Buat ulang HANYA BAGIAN **${sectionName}** dalam format Markdown yang valid.
    ${specificContext}
    
    Gunakan format Tabel Markdown. Jangan berikan pembuka/penutup basa-basi, langsung isi konten bagian tersebut.
    Header bagian harus persis: ### ${sectionName}
    Isi konten harus lengkap.
  `;

  return generateContent(prompt, "Anda adalah ahli kurikulum. Output hanya bagian yang diminta dalam format Markdown.");
};

export const generateQuiz = async (data: any) => {
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

  // Build prompts for all sections
  const sectionsPrompt = data.sections.map((sec: any, idx: number) => `
    ### BAGIAN ${idx + 1}: ${sec.type.toUpperCase()}
    - Jumlah Soal: ${sec.questionCount}
    - Tingkat Kesulitan: ${sec.difficulty}
    - Instruksi Khusus: ${getFormatInstruction(sec.type)}
  `).join('\n\n');

  // Logic for automatic syllabus generation if input is empty
  const syllabusContext = data.syllabus 
    ? `Gunakan Referensi Kisi-kisi dari Pengguna: "${data.syllabus}"` 
    : `Karena pengguna tidak memberikan kisi-kisi, **BUATKAN OTOMATIS** kisi-kisi yang relevan dengan topik "${data.topic}" dan jenjang ${data.grade}.`;

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
  const subject = data.subject || "Umum";
  const topic = data.topic || "Tugas Standar";
  const grade = data.grade || "Umum";
  const rubricCount = data.rubricCount || 1;

  // Build string of requests based on array of types
  const tasksInstruction = data.rubricItems.map((item: any, i: number) => 
    `Rubrik ke-${i+1}: Jenis Tugas "${item.taskType}"`
  ).join('\n');

  // Logic to force example if data is sparse
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
  const activityCount = data.activityCount || 1;
  
  // Build string of requests based on array of types
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
  const materialCount = data.materialCount || 1;

  // Build string of requests based on array of styles
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
