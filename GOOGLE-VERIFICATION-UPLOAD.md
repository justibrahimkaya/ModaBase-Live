# Google Site Doğrulama Dosyası Yükleme Rehberi

## Dosyayı Nereye Yükleyeceğiniz:

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - ModaBase-Live projenizi seçin

2. **Alternatif Yöntem - Doğrudan Proje Klasörüne:**
   
   Google'dan indirdiğiniz dosyayı (örn: `google4f3b2a1c8d9e5f6a.html`) 
   şu klasöre kopyalayın:
   
   ```
   C:\Users\Hp\Desktop\ModaBase\public\
   ```
   
   Yani dosya şu konumda olmalı:
   ```
   C:\Users\Hp\Desktop\ModaBase\public\google4f3b2a1c8d9e5f6a.html
   ```

3. **Dosyayı ekledikten sonra terminalde şu komutları çalıştırın:**
   ```bash
   git add -A
   git commit -m "Add Google Search Console verification file"
   git push origin main
   ```

4. **Deployment tamamlandıktan sonra (1-2 dakika) kontrol edin:**
   ```
   https://www.modabase.com.tr/googleXXXXXXXX.html
   ```
   (XXXX yerine sizin dosya adınız)

5. **Google Search Console'a dönün ve "Doğrula" butonuna tıklayın**
