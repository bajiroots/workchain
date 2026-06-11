# WorkChain Ideation

## 1. Product One-Liner

WorkChain adalah freelance escrow sederhana yang mengunci pembayaran di smart
contract dan otomatis menerbitkan NFT certificate setelah pekerjaan disetujui.

**Tagline:** Your Reputation Lives On-Chain

## 2. Latar Belakang

Hubungan kerja freelance memiliki dua masalah kepercayaan yang terjadi pada
waktu yang sama:

- Freelancer berisiko menyelesaikan pekerjaan tetapi tidak menerima pembayaran.
- Client berisiko membayar lebih dulu tanpa jaminan pekerjaan diselesaikan.
- Bukti pengalaman biasanya tersebar di chat, invoice, screenshot, atau profil
  platform yang tidak mudah diverifikasi.
- Riwayat kerja sering terkunci di satu platform dan sulit dibawa ke tempat lain.

Masalah utamanya bukan hanya pembayaran. Setelah pembayaran selesai, hasil kerja
yang bernilai juga belum otomatis menjadi reputasi yang dapat diverifikasi.

## 3. Product Insight

Satu lifecycle project dapat menghasilkan dua output sekaligus:

1. Penyelesaian pembayaran yang lebih aman melalui escrow.
2. Bukti pekerjaan selesai yang dapat dimiliki freelancer.

WorkChain menghubungkan kedua output tersebut dalam satu transaksi approval.
Client tidak perlu melakukan proses sertifikasi terpisah, dan freelancer tidak
perlu meminta testimonial manual setelah pekerjaan selesai.

## 4. Target User Awal

### Freelancer

- Mahasiswa dan junior freelancer yang sedang membangun portfolio.
- Developer, designer, dan creator yang bekerja langsung dengan client.
- Freelancer Web3 yang sudah terbiasa menggunakan wallet.

### Client

- Founder atau tim kecil yang memesan pekerjaan berbasis milestone.
- Komunitas dan project Web3 yang membayar contributor.
- Agency kecil yang membutuhkan bukti penyelesaian pekerjaan.

Target awal sengaja sempit. MVP tidak mencoba menggantikan seluruh marketplace
freelance.

## 5. Jobs To Be Done

### Freelancer

> Ketika menerima project dari client baru, saya ingin dana sudah terkunci
> sebelum mulai bekerja, sehingga saya yakin pembayaran tersedia.

> Setelah pekerjaan selesai, saya ingin memperoleh bukti yang dapat diverifikasi
> tanpa bergantung pada screenshot atau testimonial manual.

### Client

> Ketika merekrut freelancer, saya ingin dana hanya keluar setelah saya menerima
> bukti pekerjaan, sehingga pembayaran tetap terkontrol.

## 6. Value Proposition

### Untuk Freelancer

- Dana project terlihat dan terkunci sebelum pekerjaan dimulai.
- Pembayaran diterima otomatis setelah approval.
- Setiap project completed menghasilkan certificate NFT.
- Certificate menyimpan client, freelancer, nilai project, dan waktu selesai.

### Untuk Client

- Tidak perlu mengirim pembayaran penuh langsung ke freelancer.
- Dana tetap berada di contract sampai pekerjaan disetujui.
- Refund tersedia sebelum freelancer menerima project.
- Semua perubahan status dapat diverifikasi melalui event on-chain.

## 7. Core Experience

```text
Create project
    -> Approve WCT
    -> Fund escrow
    -> Freelancer accepts
    -> Freelancer submits proof URL
    -> Client approves
    -> Payment released + certificate minted
```

Prinsip pengalaman produk:

- Satu project memiliki satu client dan satu freelancer.
- Satu project menggunakan satu amount WCT.
- Setiap role hanya melihat action yang relevan.
- Contract state menjadi sumber kebenaran.
- Frontend tidak memerlukan database atau backend indexer.

## 8. MVP Scope

### Dibangun

- ERC-20 WCT untuk demo pembayaran.
- Escrow lifecycle dari create sampai completed.
- Refund sebelum project diterima freelancer.
- NFT certificate dengan metadata Base64 on-chain.
- Satu artwork certificate yang disimpan di Pinata.
- Dashboard berbasis event contract.
- Integrasi wallet dan jaringan Sepolia.

### Sengaja Tidak Dibangun

- Dispute dan arbitrase.
- Marketplace bidding.
- Chat.
- Rating kompleks.
- KYC dan fiat payment.
- Multi-token payment.
- Backend database.
- Metadata certificate yang dapat diubah.

Scope kecil dipilih agar flow utama dapat diuji end-to-end dan risiko smart
contract tetap mudah dipahami.

## 9. Differentiation

WorkChain tidak bersaing melalui jumlah lowongan atau sistem bidding. Pembeda
utamanya adalah mengikat settlement dan reputation dalam satu lifecycle:

| Pendekatan | Pembayaran aman | Bukti selesai | Portabel |
| --- | --- | --- | --- |
| Transfer langsung | Tidak | Manual | Tidak |
| Escrow biasa | Ya | Terpisah | Terbatas |
| Portfolio manual | Tidak | Ya, tetapi sulit diverifikasi | Ya |
| WorkChain | Ya | Otomatis saat approval | Ya, berbasis wallet |

## 10. Validation Hypotheses

Hipotesis yang perlu diuji setelah MVP:

1. Freelancer bersedia menggunakan wallet jika client sudah menyediakan dana
   project.
2. Client memahami approve dan fund sebagai dua transaksi yang berbeda.
3. Certificate lebih bernilai jika dapat ditampilkan di portfolio atau profil
   publik.
4. Pengguna lebih memilih stablecoin dibanding token demo WCT untuk penggunaan
   nyata.
5. Dispute dan deadline menjadi fitur berikutnya setelah pengguna mencoba flow
   dasar.

## 11. Success Metrics

Untuk pilot awal, metrik yang relevan:

- Persentase project funded yang mencapai completed.
- Waktu dari funded ke accepted.
- Waktu dari submitted ke approved.
- Jumlah wallet freelancer yang memiliki certificate.
- Jumlah user yang kembali membuat project kedua.
- Jumlah transaksi yang gagal karena network, allowance, atau pemahaman flow.

Data saat ini adalah bukti teknis, bukan traction pasar. Pada 11 Juni 2026,
dashboard Sepolia telah membaca satu demo project completed beserta seluruh event
lifecycle-nya.

## 12. Business Model Hypothesis

MVP belum mengenakan protocol fee. Pilihan monetisasi yang dapat diuji nanti:

- Fee kecil saat project completed.
- Paket team untuk agency atau komunitas contributor.
- Sponsored gas atau managed onboarding untuk organisasi.
- Verification API atau embeddable reputation profile.

Monetisasi hanya masuk setelah keamanan contract, kebutuhan dispute, dan
kesediaan pengguna menggunakan stablecoin tervalidasi.

## 13. Risks

- Client dapat menahan approval setelah freelancer submit.
- Tidak ada mekanisme timeout atau dispute setelah project accepted.
- WCT hanya token demo dan belum cocok untuk pembayaran nyata.
- NFT transferable, sehingga ownership certificate belum identik dengan identitas.
- Query event langsung dari browser tidak cocok untuk skala besar.
- Smart contract belum diaudit untuk penggunaan production.

## 14. Product Direction

Tahap selanjutnya bukan menambah sebanyak mungkin fitur. Urutan yang lebih
masuk akal:

1. Uji flow dengan pengguna pilot.
2. Tambahkan deadline dan mutual cancellation.
3. Rancang dispute minimal berdasarkan hasil pilot.
4. Gunakan stablecoin di testnet.
5. Audit contract.
6. Bangun reputation profile dan indexing ketika volume event membutuhkannya.

