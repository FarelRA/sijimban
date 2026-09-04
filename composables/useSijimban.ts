export const siteUrl = 'https://sijimban.site'

export const navItems = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang', to: '/tentang' },
  { label: 'Pengurus', to: '/pengurus' },
  { label: 'Divisi', to: '/divisi' },
  { label: 'Proker', to: '/proker' },
  { label: 'Gabung', to: '/gabung' }
]

export const divisions = [
  ['Keproduksian', 'Merancang produksi, jadwal latihan, kebutuhan kru, dan memastikan proses pentas berjalan rapi.', 'lucide:clapperboard'],
  ['Keinventarisan', 'Mencatat, merawat, dan menyiapkan perlengkapan organisasi untuk latihan maupun pertunjukan.', 'lucide:archive'],
  ['Sastra & Teater', 'Mengembangkan naskah, ide cerita, karakter, blocking, dan pendalaman akting para pemain.', 'lucide:book-open-text'],
  ['Musik', 'Menyusun komposisi, pengiring adegan, ritme latihan, dan atmosfer audio pertunjukan.', 'lucide:music-2'],
  ['Artistik', 'Menciptakan tata panggung, properti, latar, dan visual yang menghidupkan dunia cerita.', 'lucide:palette'],
  ['Lampu', 'Mengatur pencahayaan dramatik untuk membangun suasana, fokus adegan, dan transisi waktu.', 'lucide:lightbulb'],
  ['Rias', 'Menata wajah dan rambut sesuai karakter, gaya pentas, dan kebutuhan visual naskah.', 'lucide:sparkles'],
  ['Busana', 'Mendesain dan menyiapkan kostum yang aman, kuat, dan selaras dengan konsep pertunjukan.', 'lucide:shirt'],
  ['Humas, Danus & Media', 'Membangun relasi, mencari dukungan dana, mendokumentasikan kegiatan, dan mengelola publikasi digital.', 'lucide:megaphone']
]

export const programs = [
  ['01', 'Pentas Tunggal Teater', 'Puncak produksi mandiri SIJIMBAN: karya full-length dengan kolaborasi seluruh divisi dari naskah hingga panggung.'],
  ['02', 'Musyawarah Besar', 'Forum tertinggi organisasi untuk evaluasi, aspirasi, perencanaan strategis, dan regenerasi kepengurusan.'],
  ['03', 'Pentas Seni Tutup Tahun', 'Ruang apresiasi akhir tahun untuk karya eksperimental, komedi, studi adegan, dan proses kreatif anggota.'],
  ['04', 'Serah Terima Jabatan', 'Momen simbolis penyerahan estafet kepemimpinan agar semangat Siji Manunggal terus menyala.']
]

export const board = [
  ['General Manager', 'Ketua umum yang mengatur, mengkoordinasi, dan mengkondisikan seluruh kegiatan SIJIMBAN.', 'lucide:crown'],
  ['Ass. General Manager', 'Wakil ketua yang mendampingi ketua dan memastikan operasional organisasi berjalan lancar.', 'lucide:user-round-check'],
  ['Sekretaris', 'Mengurus administrasi, persuratan, notulensi, arsip, dan dokumentasi dokumen organisasi.', 'lucide:scroll-text'],
  ['Bendahara', 'Mengelola pemasukan, pengeluaran, iuran, dan transparansi keuangan produksi maupun organisasi.', 'lucide:wallet']
]

export const benefits = [
  ['Tanpa Seleksi', 'Cemplang Cemplung', 'Semua siswa boleh mencoba. Tidak ada audisi menakutkan, cukup hadir dengan niat dan antusiasme.'],
  ['Relasi', 'ASIQ', 'Bertemu teman solid, belajar bekerja dalam tim, dan tumbuh dalam lingkungan yang suportif.'],
  ['Belajar', 'LEARN', 'Memahami akting, produksi, musik, artistik, tata cahaya, manajemen pentas, dan publikasi.'],
  ['Ide', 'OUT OF THE BOX', 'Setiap gagasan mendapat ruang. Ide liar diproses menjadi karya yang bisa ditonton dan dirasakan.']
]

export function setPageSeo(title: string, description: string, path = '/') {
  useSeoMeta({
    title: `${title} | SIJIMBAN`,
    ogTitle: `${title} | SIJIMBAN`,
    description,
    ogDescription: description,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    themeColor: '#0b1021'
  })

  useHead({
    link: [{ rel: 'canonical', href: `${siteUrl}${path}` }]
  })
}
