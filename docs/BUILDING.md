# Building WorkChain

## 1. Build Goal

Tujuan implementasi adalah membuktikan satu flow lengkap:

```text
Client creates and funds a project
-> Freelancer accepts and submits work
-> Client approves
-> WCT is paid to freelancer
-> NFT certificate is minted
```

Arsitektur sengaja dibuat tanpa database, backend API, chat, dispute, atau
marketplace agar seluruh state penting dapat diverifikasi langsung dari contract.

## 2. Technology Stack

| Layer | Technology |
| --- | --- |
| Smart contract | Solidity 0.8.28, OpenZeppelin |
| Development | Hardhat 3, Hardhat Ignition |
| Frontend | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS |
| Wallet | Wagmi, Viem, RainbowKit |
| Storage | Pinata/IPFS untuk artwork certificate |
| Network | Hardhat local dan Ethereum Sepolia |

## 3. Smart Contract Architecture

### WorkChainToken

- ERC-20 bernama `WorkChain Token`.
- Symbol `WCT`.
- Initial supply dikirim ke deployer.
- Digunakan sebagai payment token tunggal untuk MVP.

### WorkCertificateNFT

- ERC-721 Enumerable.
- Hanya escrow contract yang dapat mint certificate.
- Escrow address ditetapkan sekali setelah deployment.
- Ownership kemudian dilepas untuk mengurangi kontrol deployer.
- Metadata JSON dibuat on-chain dan dikembalikan sebagai Base64 data URI.
- Artwork menggunakan satu immutable `ipfs://` URI dari Pinata.

Metadata certificate:

- Project ID.
- Project title.
- Client address.
- Freelancer address.
- Amount.
- Completion timestamp.

### WorkChainEscrow

Status project:

```text
Created -> Funded -> Accepted -> Submitted -> Completed
      |        |
      v        v
 Cancelled  Refunded
```

Proteksi utama:

- Role check untuk client dan freelancer.
- Status check pada setiap transition.
- `SafeERC20` untuk transfer WCT.
- `ReentrancyGuard` pada fund, approve, dan refund.
- State diubah sebelum external transfer pada approval.
- Payment dan NFT mint terjadi atomically pada transaksi approval.

## 4. Data Flow

```text
Browser wallet
    |
    v
Next.js + Wagmi
    |
    +---- contract reads and event logs ----> Sepolia RPC
    |
    +---- signed transactions -------------> WorkChainEscrow
                                               |       |
                                               v       v
                                         WCT payment  NFT mint
                                                           |
                                                           v
                                               Pinata artwork URI
```

Tidak ada private key di frontend. Semua transaksi user ditandatangani melalui
wallet browser.

## 5. Frontend Implementation

### `/`

- Menjelaskan value proposition.
- Menampilkan certificate artwork.
- Menyediakan wallet connection dan link ke project.

### `/dashboard`

- Menghitung total, active, dan completed project.
- Menghitung active escrow value.
- Membaca recent activity dari event contract.

### `/projects`

- Membaca seluruh project menggunakan `projectCount` dan `getProject`.
- Menyediakan filter berdasarkan status.

### `/projects/create`

- Form title, description, freelancer address, dan amount.
- Memvalidasi input sebelum mengirim transaksi.

### `/projects/[id]`

- Menampilkan detail dan status project.
- Menampilkan action berdasarkan wallet role dan contract state.
- Mendukung fund, accept, submit, approve, refund, dan cancel.

### `/certificates`

- Membaca NFT yang dimiliki connected wallet.
- Decode metadata on-chain.
- Mengubah `ipfs://` menjadi gateway URL untuk menampilkan gambar Pinata.

## 6. Pinata Decision

WorkChain hanya menyimpan file artwork di Pinata. Metadata unik tetap dibuat
on-chain.

Alasan:

- Tidak memerlukan upload metadata setiap project selesai.
- Approval tidak bergantung pada Pinata API route.
- Metadata project tetap dapat diverifikasi dari contract.
- Satu artwork cukup untuk MVP dan mengurangi kompleksitas deployment.

Trade-off:

- Semua certificate memiliki artwork yang sama.
- Ketersediaan gambar tetap bergantung pada IPFS gateway/pinning.

## 7. Deployment

Network: Ethereum Sepolia, chain ID `11155111`.

| Contract | Address |
| --- | --- |
| WorkChainToken | `0xE8d63500d1605e45a5BF9dF7e5bDBb4660867D84` |
| WorkCertificateNFT | `0xbD71Af45ff638bAf454a317cA1b8e37052efdCCC` |
| WorkChainEscrow | `0x6df59bF0E7cF2a4fB861180e554284B13F4FCb1b` |

Deployment dilakukan dengan Hardhat Ignition. Script sinkronisasi membaca hasil
deployment dan menulis konfigurasi public contract ke `.env.local`, sehingga
frontend lokal dapat langsung membaca Sepolia.

## 8. Testing

Contract test mencakup:

- Deployment token dan initial supply.
- Create dan cancel project.
- Approve allowance dan fund project.
- Accept dan submit work.
- Approve, transfer payment, dan mint certificate.
- Refund sebelum accepted.
- Metadata Base64 dan image URI Pinata.
- Event lifecycle.
- Revert untuk role, input, allowance, dan status yang salah.

Quality checks:

```bash
pnpm test:contracts
pnpm lint
pnpm build
```

Pada implementasi awal, 12 contract tests telah lolos. Rerun dapat memerlukan
akses tunggal ke cache compiler Hardhat karena Hardhat menggunakan mutex pada
compiler download list.

## 9. End-To-End Proof

Pada 11 Juni 2026, dashboard yang terhubung ke Sepolia membaca:

- 1 total project.
- 1 completed project.
- 0 active project.
- Event create, fund, accept, submit, dan completed.
- Payment release dan certificate mint pada completion.

Ini adalah demo teknis dari satu flow, bukan klaim traction pengguna.

## 10. Challenge Encountered

### Sepolia nonce mismatch

Saat deployment, Ignition sempat menampilkan bahwa next nonce seharusnya `5`
tetapi RPC mengembalikan `4`.

Diagnosis:

- Transaksi deployment NFT dengan nonce `4` sebenarnya sudah mined.
- Public RPC terlambat atau tidak konsisten membaca pending/latest nonce.
- Ignition journal tetap menyimpan transaksi dengan benar.

Resolution:

- Receipt transaction dan nonce diverifikasi langsung ke Sepolia RPC.
- Deployment dilanjutkan dari journal yang sama.
- `--reset` tidak digunakan agar NFT tidak dideploy ulang dan gas tidak terbuang.

Lesson:

- Gunakan dedicated RPC untuk deployment yang lebih stabil.
- Selalu cek receipt sebelum menghapus atau mereset Ignition deployment state.

## 11. Known Limitations

- Tidak ada dispute setelah freelancer menerima project.
- Tidak ada deadline atau timeout.
- Client menjadi satu-satunya pihak yang approve hasil.
- Certificate NFT transferable.
- WCT tidak memiliki nilai ekonomi dan hanya digunakan untuk demo.
- Direct event reads akan menjadi lambat jika volume data besar.
- Contract belum melalui audit keamanan independen.

## 12. Demo Runbook

1. Jalankan `pnpm dev`.
2. Buka `http://localhost:3000`.
3. Hubungkan client wallet pada Sepolia.
4. Buat project dengan freelancer wallet yang berbeda.
5. Approve WCT dan fund project.
6. Pindah ke freelancer wallet, lalu accept dan submit proof URL.
7. Kembali ke client wallet dan approve.
8. Periksa payment pada freelancer wallet.
9. Buka `/certificates` menggunakan freelancer wallet.
10. Periksa event lifecycle di dashboard.

## 13. What To Build Next

Prioritas berdasarkan risiko dan validasi:

1. Tambahkan deadline dan mutual cancellation.
2. Uji stablecoin testnet sebagai payment token.
3. Tambahkan shareable public certificate profile.
4. Validasi kebutuhan dispute dengan pengguna pilot.
5. Audit smart contract sebelum menggunakan aset bernilai nyata.
6. Tambahkan indexer hanya setelah query langsung tidak lagi memadai.

