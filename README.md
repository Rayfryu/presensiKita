# PresensiKita Deployment Guide

## Vercel Settings
Aplikasi ini menggunakan **Vite** (bukan Next.js). Pastikan pengaturan di Vercel sebagai berikut:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## Environment Variables
Anda **WAJIB** menambahkan variabel berikut di dashboard Vercel agar aplikasi tidak blank:

1. `VITE_SUPABASE_URL`: Ambil dari Supabase Project Settings > API
2. `VITE_SUPABASE_ANON_KEY`: Ambil dari Supabase Project Settings > API

## SQL Setup
Pastikan Anda sudah menjalankan perintah SQL yang ada di file `supabase_schema.sql` di SQL Editor Supabase Anda sebelum menggunakan aplikasi.
