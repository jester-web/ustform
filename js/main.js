document.addEventListener("DOMContentLoaded", function() {
    // ── 1. Nav İkonlarına Favoriler Ekleme ──
    const navIkonlar = document.querySelector('.nav-ikonlar');
    if (navIkonlar && !document.getElementById('favorilerBtn')) {
        const kalpHTML = `<a href="favoriler.html" id="favorilerBtn" style="color:var(--beyaz); margin-right:5px;"><i class="fa-regular fa-heart"></i></a>`;
        const aramaBtn = document.getElementById('aramaToggle');
        if (aramaBtn) {
            aramaBtn.insertAdjacentHTML('afterend', kalpHTML);
        }
    }


    // ── 2. Hamburger Menü ──
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinksLeft');
    if(hamburger && navLinks) {
        // Overlay oluştur ve ekle
        let navOverlay = document.getElementById('navOverlay');
        if(!navOverlay) {
            navOverlay = document.createElement('div');
            navOverlay.id = 'navOverlay';
            navOverlay.className = 'offcanvas-overlay';
            // Overlay'i body yerine menü kapsayıcısına ekle ki z-index çakışmasın
            document.querySelector('.mega-nav').appendChild(navOverlay);
        }

        const kapatMenu = () => {
            hamburger.classList.remove('acik');
            navLinks.classList.remove('acik');
            navOverlay.classList.remove('aktif');
        };

        // Mobil alt menü verileri
        const mobilAltMenuler = {
            'erkek': [
                { isim: 'Tüm Tişörtler', url: 'urunler.html?kategori=erkek' },
                { isim: 'Yeni Gelenler', url: 'urunler.html?f=yeni&kategori=erkek' },
                { isim: 'İndirimli Ürünler', url: 'urunler.html?f=indirim&kategori=erkek' },
                { isim: 'Basic Tişört', url: 'urunler.html?kategori=erkek&altkategori=basic' },
                { isim: 'Baskılı Tişört', url: 'urunler.html?kategori=erkek&altkategori=baskili' },
                { isim: 'Oversize Tişört', url: 'urunler.html?kategori=erkek&altkategori=oversize' }
            ],
            'kadin': [
                { isim: 'Tüm Tişörtler', url: 'urunler.html?kategori=kadin' },
                { isim: 'Yeni Gelenler', url: 'urunler.html?f=yeni&kategori=kadin' },
                { isim: 'İndirimli Ürünler', url: 'urunler.html?f=indirim&kategori=kadin' },
                { isim: 'Crop Tişört', url: 'urunler.html?kategori=kadin&altkategori=crop' },
                { isim: 'Basic Tişört', url: 'urunler.html?kategori=kadin&altkategori=basic' },
                { isim: 'Oversize Tişört', url: 'urunler.html?kategori=kadin&altkategori=oversize' }
            ]
        };

        // Mobil alt menüleri oluştur
        function mobilAltMenuOlustur() {
            const megaHoverItems = navLinks.querySelectorAll('.mega-hover');
            megaHoverItems.forEach(li => {
                const megaType = li.dataset.mega;
                if (!mobilAltMenuler[megaType]) return;
                if (li.querySelector('.mobil-alt-menu')) return; // zaten eklenmişse atla

                const altMenuUl = document.createElement('ul');
                altMenuUl.className = 'mobil-alt-menu';
                mobilAltMenuler[megaType].forEach(item => {
                    const altLi = document.createElement('li');
                    altLi.innerHTML = `<a href="${item.url}">${item.isim}</a>`;
                    altMenuUl.appendChild(altLi);
                });
                li.appendChild(altMenuUl);

                // Tıklama olayı: mobilde akordeon aç/kapat
                const link = li.querySelector(':scope > a');
                if (link) {
                    link.addEventListener('click', function(e) {
                        // Sadece mobilde (hamburger görünürse) akordeon davranışı
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            e.stopPropagation();
                            li.classList.toggle('alt-menu-acik');
                        }
                    });
                }
            });
        }

        hamburger.addEventListener('click', () => {
            if(!document.getElementById('mobilHeader')) {
                const headerLi = document.createElement('li');
                headerLi.id = 'mobilHeader';
                headerLi.className = 'mobil-header';
                headerLi.innerHTML = `
                    <img src="images/logo.png" alt="Logo">
                    <button class="mobil-kapat" id="mobilKapat" aria-label="Kapat">&times;</button>
                `;
                navLinks.insertBefore(headerLi, navLinks.firstChild);
                
                document.getElementById('mobilKapat').addEventListener('click', kapatMenu);
                
                // Alt menüleri oluştur
                mobilAltMenuOlustur();
            }
            hamburger.classList.toggle('acik');
            navLinks.classList.toggle('acik');
            navOverlay.classList.toggle('aktif');
        });

        navOverlay.addEventListener('click', kapatMenu);
    }

    // ── 3. Sepet Mantığı (LocalStorage) ──
    const sepetKey = "ustform_sepet";
    function getSepet() {
        const sepet = localStorage.getItem(sepetKey);
        return sepet ? JSON.parse(sepet) : [];
    }
    window.saveSepet = function(sepet) {
        localStorage.setItem(sepetKey, JSON.stringify(sepet));
        updateSepetUI();
    };
    window.getSepet = getSepet;

    function updateSepetUI() {
        const sepet = getSepet();
        const toplamAdet = sepet.reduce((toplam, urun) => toplam + urun.adet, 0);
        const sepetBtn = document.querySelector('.nav-sepet');
        if (sepetBtn) {
            sepetBtn.innerHTML = `<i class="fa-solid fa-bag-shopping"></i> <span id="sepetSayac">${toplamAdet > 0 ? toplamAdet : '0'}</span>`;
        }
    }
    updateSepetUI();

    // ── Giriş Kontrol Fonksiyonu ──
    window.girisKontrol = function(mesaj) {
        const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
        if (!aktifKullanici) {
            if(window.showToast) window.showToast(mesaj || 'Bu işlem için giriş yapmalısınız!');
            setTimeout(() => { window.location.href = 'giris.html'; }, 1200);
            return false;
        }
        return true;
    };

    // ── 4. Dinamik Ürün Render Fonksiyonu ──
    window.renderUrunler = function(containerId, data) {
        const container = document.getElementById(containerId);
        if(!container) return;
        
        container.innerHTML = '';
        const favoriler = JSON.parse(localStorage.getItem('favoriler')) || [];
        const tumYorumlar = JSON.parse(localStorage.getItem('ustform_yorumlar')) || [];

        if(data.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gri-3); padding:40px;">Ürün bulunamadı.</p>';
            return;
        }

        data.forEach((urun, index) => {
            const isFavori = favoriler.includes(urun.id);
            const gecikme = index % 4;
            
            let fiyatHTML = '';
            let etiketHTML = '';
            
            if (urun.fiyat < 600) {
                const eskiFiyat = urun.fiyat + 300; 
                const indirimYuzdesi = Math.round(((eskiFiyat - urun.fiyat) / eskiFiyat) * 100);
                etiketHTML = `<span class="urun-etiket">%${indirimYuzdesi} İNDİRİM</span>`;
                fiyatHTML = `<span class="urun-fiyat-eski">${eskiFiyat}₺</span><span class="urun-fiyat" style="color: var(--vurgu);">${urun.fiyat}₺</span>`;
            } else {
                fiyatHTML = `<span class="urun-fiyat">${urun.fiyat}₺</span>`;
            }

            const urunYorumlari = tumYorumlar.filter(y => y.urunId === String(urun.id));
            let yildizHTML = '';
            if(urunYorumlari.length > 0) {
                const toplamPuan = urunYorumlari.reduce((acc, curr) => acc + curr.puan, 0);
                const ort = toplamPuan / urunYorumlari.length;
                let yildizlar = '';
                for(let i=1; i<=5; i++) {
                    if(ort >= i) yildizlar += '<i class="fa-solid fa-star"></i>';
                    else if(ort >= i - 0.5) yildizlar += '<i class="fa-solid fa-star-half-stroke"></i>';
                    else yildizlar += '<i class="fa-regular fa-star"></i>';
                }
                yildizHTML = `<div style="color: var(--vurgu); font-size: 0.85rem; margin-top: 5px; display: flex; align-items: center; gap: 5px;">
                                <span>${yildizlar}</span>
                                <span style="color: var(--gri-3); font-size: 0.75rem;">(${urunYorumlari.length})</span>
                              </div>`;
            } else {
                yildizHTML = `<div style="color: var(--vurgu); font-size: 0.85rem; margin-top: 5px; display: flex; align-items: center; gap: 5px;">
                                <span><i class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i></span>
                                <span style="color: var(--gri-3); font-size: 0.75rem;">(0)</span>
                              </div>`;
            }

            const kartHTML = `
            <div class="urun-karti cik-animasyonu gecikme-${gecikme}" data-id="${urun.id}">
                <div class="urun-gorsel" style="position: relative;">
                    ${etiketHTML}
                    <button class="favori-btn ${isFavori ? 'aktif' : ''}" data-id="${urun.id}" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); border-radius:50%; width:35px; height:35px; border: none; font-size: 1.1rem; cursor: pointer; color: ${isFavori ? 'var(--vurgu)' : '#fff'}; z-index: 10; display:flex; align-items:center; justify-content:center; transition:0.3s;">
                        <i class="${isFavori ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    ${urun.resim}
                </div>
                <div class="urun-bilgi">
                    <h3>${urun.isim}</h3>
                    ${yildizHTML}
                    <div class="urun-alt" style="margin-top: 15px;">
                        <div>${fiyatHTML}</div>
                        <button class="urun-sepet-btn" title="Sepete Ekle"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>
            `;
            container.insertAdjacentHTML('beforeend', kartHTML);
        });

        baglaUrunEventleri(container);
    };

    function baglaUrunEventleri(container) {
        // Renk Seçimi
        container.querySelectorAll('.renk-nokta').forEach(nokta => {
            nokta.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.closest('.renkler').querySelectorAll('.renk-nokta').forEach(n => n.classList.remove('secili'));
                this.classList.add('secili');
            });
        });
        
        // Beden Seçimi
        container.querySelectorAll('.beden-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.closest('.bedenler').querySelectorAll('.beden-btn').forEach(b => b.classList.remove('secili'));
                this.classList.add('secili');
            });
        });

        // Detay Sayfasına Git
        container.querySelectorAll('.urun-karti').forEach(karti => {
            karti.addEventListener('click', function(e) {
                if(!e.target.closest('.urun-sepet-btn') && !e.target.closest('.favori-btn') && !e.target.closest('.renk-nokta') && !e.target.closest('.beden-btn')) {
                    const id = this.dataset.id;
                    window.location.href = `urun-detay.html?id=${id}`;
                }
            });
            karti.style.cursor = 'pointer';
        });

        // Favorilere Ekle/Çıkar
        container.querySelectorAll('.favori-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(!window.girisKontrol('Favorilere eklemek için giriş yapmalısınız!')) return;
                const id = parseInt(this.dataset.id);
                let favoriler = JSON.parse(localStorage.getItem('favoriler')) || [];
                
                if(favoriler.includes(id)) {
                    favoriler = favoriler.filter(fid => fid !== id);
                    this.classList.remove('aktif');
                    this.innerHTML = '<i class="fa-regular fa-heart"></i>';
                    this.style.color = '#fff';
                    if(window.showToast) window.showToast('Favorilerden çıkarıldı');
                } else {
                    favoriler.push(id);
                    this.classList.add('aktif');
                    this.innerHTML = '<i class="fa-solid fa-heart"></i>';
                    this.style.color = 'var(--vurgu)';
                    if(window.showToast) window.showToast('Favorilere eklendi!');
                }
                localStorage.setItem('favoriler', JSON.stringify(favoriler));

                // Favoriler sayfasındaysa anında gizle
                if(window.location.href.includes('favoriler.html') && !favoriler.includes(id)) {
                    this.closest('.urun-karti').style.display = 'none';
                    const list = document.getElementById('favoriUrunListesi');
                    if(list && list.querySelectorAll('.urun-karti[style="display: none;"]').length === list.children.length) {
                        document.getElementById('favoriBosMesaj').style.display = 'block';
                    }
                }
            });
        });

        // Sepete Ekle
        container.querySelectorAll('.urun-sepet-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(!window.girisKontrol('Sepete eklemek için giriş yapmalısınız!')) return;
                const urunKarti = this.closest('.urun-karti');
                if (urunKarti) {
                    const isim = urunKarti.querySelector('h3').innerText;
                    const fiyatText = urunKarti.querySelector('.urun-fiyat').innerText;
                    const fiyat = parseInt(fiyatText.replace('₺', '').trim());
                    
                    const seciliRenkDiv = urunKarti.querySelector('.renk-nokta.secili');
                    const renk = seciliRenkDiv ? seciliRenkDiv.title : 'Standart';

                    const seciliBedenBtn = urunKarti.querySelector('.beden-btn.secili');
                    const beden = seciliBedenBtn ? seciliBedenBtn.innerText : 'M';
                    
                    const imgEl = urunKarti.querySelector('img');
                    const gorsel = imgEl ? imgEl.src : '';

                    const sepet = getSepet();
                    const varOlanUrun = sepet.find(u => u.isim === isim && u.renk === renk && u.beden === beden);
                    
                    if (varOlanUrun) {
                        varOlanUrun.adet += 1;
                    } else {
                        sepet.push({ isim, fiyat, renk, beden, adet: 1, gorsel });
                    }
                    window.saveSepet(sepet);

                    if (window.showToast) window.showToast(`${isim} (${beden}) sepete eklendi!`);
                    if (window.openOffcanvasSepet) window.openOffcanvasSepet();
                }

                const orijinalIcerik = this.innerHTML;
                this.innerHTML = '<i class="fa-solid fa-check"></i>';
                this.style.background = '#4caf50';
                setTimeout(() => {
                    this.innerHTML = orijinalIcerik;
                    this.style.background = '';
                }, 1200);
            });
        });

        // Scroll Animasyonları Bağlantısı
        setupScrollAnimations(container);
    }

    // Scroll Observer
    function setupScrollAnimations(container) {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    entry.target.style.opacity = '1';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        container.querySelectorAll('.urun-karti').forEach(karti => {
            karti.style.opacity = '0';
            karti.style.animationPlayState = 'paused';
            karti.style.animationFillMode = 'forwards';
            observer.observe(karti);
        });
    }

    // ── 5. Sayfalara Göre İlk Render ──
    if(typeof urunleriGetir === 'function') {
        const tumUrunler = urunleriGetir();

        // ── Global Akıllı Sıralama Fonksiyonu ──
        const tumYorumlar = JSON.parse(localStorage.getItem('ustform_yorumlar')) || [];
        const tumSiparisler = JSON.parse(localStorage.getItem('siparisler')) || [];

        function getAverageRating(urunId) {
            const urunYorumlari = tumYorumlar.filter(y => y.urunId === String(urunId));
            if(urunYorumlari.length === 0) return 0;
            return urunYorumlari.reduce((acc, curr) => acc + curr.puan, 0) / urunYorumlari.length;
        }

        function getSatisAdedi(urunIsim) {
            let toplam = 0;
            tumSiparisler.forEach(siparis => {
                if(siparis.sepet) {
                    siparis.sepet.forEach(urun => {
                        if(urun.isim === urunIsim) toplam += urun.adet;
                    });
                }
            });
            return toplam;
        }

        window.akillSirala = function(urunler) {
            return [...urunler].sort((a, b) => {
                // 1. En çok satılanlar önce
                const aSatis = getSatisAdedi(a.isim);
                const bSatis = getSatisAdedi(b.isim);
                if(aSatis !== bSatis) return bSatis - aSatis;

                // 2. En yüksek yıldızlı olanlar
                const aPuan = getAverageRating(a.id);
                const bPuan = getAverageRating(b.id);
                if(aPuan !== bPuan) return bPuan - aPuan;

                // 3. İndirimli olanlar
                const aIndirimli = a.fiyat < 600 ? 1 : 0;
                const bIndirimli = b.fiyat < 600 ? 1 : 0;
                return bIndirimli - aIndirimli;
            });
        };

        // index.html Vitrin
        if(document.getElementById('vitrinUrunListesi')) {
            let vitrinUrunler = tumUrunler.filter(u => u.vitrin);
            vitrinUrunler = window.akillSirala(vitrinUrunler);
            window.renderUrunler('vitrinUrunListesi', vitrinUrunler);
        }

        // urunler.html Tüm Ürünler
        if(document.getElementById('tumUrunListesi')) {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            const kategori = urlParams.get('kategori');
            const altKategori = urlParams.get('altkategori');
            const urlFiltre = urlParams.get('f');
            
            let gosterilecekUrunler = tumUrunler;

            if(query) {
                gosterilecekUrunler = gosterilecekUrunler.filter(u => u.isim.toLowerCase().includes(query.toLowerCase()));
                const p = document.getElementById('yfbSayac');
                if(p) p.innerText = `${gosterilecekUrunler.length} ürün`;
                const h1 = document.getElementById('yfbBaslik');
                if(h1) h1.innerText = `Arama: ${query}`;
                const bread = document.getElementById('sayfaBreadcrumbs');
                if(bread) bread.innerText = `Ana Sayfa / Arama`;
            } else if(kategori) {
                gosterilecekUrunler = gosterilecekUrunler.filter(u => u.kategori === kategori || u.kategori === 'unisex');
                if(altKategori) {
                    gosterilecekUrunler = gosterilecekUrunler.filter(u => u.altkategori === altKategori);
                }
                
                let kBaslik = kategori.charAt(0).toUpperCase() + kategori.slice(1);
                let altKBaslik = altKategori ? (altKategori.charAt(0).toUpperCase() + altKategori.slice(1)) : '';
                
                const h1 = document.getElementById('yfbBaslik');
                const p = document.getElementById('yfbSayac');
                const bread = document.getElementById('sayfaBreadcrumbs');
                
                if(h1) h1.innerText = altKategori ? `${kBaslik} ${altKBaslik}` : kBaslik;
                if(p) p.innerText = `${gosterilecekUrunler.length} ürün`;
                if(bread) bread.innerText = altKategori ? `Ana Sayfa / ${kBaslik} / ${altKBaslik}` : `Ana Sayfa / ${kBaslik}`;
            } else {
                const p = document.getElementById('yfbSayac');
                if(p) p.innerText = `${gosterilecekUrunler.length} ürün`;
            }

            // Akıllı sıralama uygula
            gosterilecekUrunler = window.akillSirala(gosterilecekUrunler);

            let guncelLimit = 16; // 4 rows
            let isFetching = false;
            const tumListeKapsayici = document.getElementById('tumUrunListesi');
            
            function renderIleLoadMore() {
                const gosterilecek = gosterilecekUrunler.slice(0, guncelLimit);
                window.renderUrunler('tumUrunListesi', gosterilecek);
                
                let sentinel = document.getElementById('scrollSentinel');
                if (gosterilecekUrunler.length > guncelLimit) {
                    if(!sentinel) {
                        sentinel = document.createElement('div');
                        sentinel.id = 'scrollSentinel';
                        sentinel.style.margin = '40px auto';
                        sentinel.style.textAlign = 'center';
                        sentinel.style.width = '100%';
                        sentinel.style.padding = '20px';
                        sentinel.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:var(--vurgu);"></i>';
                        tumListeKapsayici.parentNode.insertBefore(sentinel, tumListeKapsayici.nextSibling);

                        const observer = new IntersectionObserver((entries) => {
                            if(entries[0].isIntersecting && !isFetching && gosterilecekUrunler.length > guncelLimit) {
                                isFetching = true;
                                setTimeout(() => {
                                    guncelLimit += 16;
                                    renderIleLoadMore();
                                    isFetching = false;
                                }, 1000); // 1 saniye beklet
                            }
                        }, { rootMargin: '100px' });
                        observer.observe(sentinel);
                    } else {
                        sentinel.style.display = 'block';
                    }
                } else if(sentinel) {
                    sentinel.style.display = 'none';
                }
            }

            renderIleLoadMore();

            const filtreButonlari = document.querySelectorAll('.filtre-btn');
            if (filtreButonlari.length > 0) {
                // Eğer URL'den filtre geldiyse, butonu bulup tıkla
                if (urlFiltre) {
                    const hedefBtn = Array.from(filtreButonlari).find(b => b.dataset.filtre === urlFiltre || b.dataset.filtre === urlFiltre.split('-')[0]);
                    if (hedefBtn) {
                        setTimeout(() => hedefBtn.click(), 50); // DOM oturduktan sonra tıkla
                    }
                }

                filtreButonlari.forEach(btn => {
                    btn.addEventListener('click', function() {
                        filtreButonlari.forEach(b => b.classList.remove('aktif'));
                        this.classList.add('aktif');
                        const filtre = this.dataset.filtre;
                        
                        // Önce sayfanın ana kategorisine göre listeyi al
                        let filtrelenmis = tumUrunler;
                        if(kategori) {
                            filtrelenmis = filtrelenmis.filter(u => u.kategori === kategori || u.kategori === 'unisex');
                            if(altKategori) {
                                filtrelenmis = filtrelenmis.filter(u => u.altkategori === altKategori);
                            }
                        }
                        
                        // Sonra butona göre alt filtreyi uygula
                        if(filtre === 'indirim' || urlFiltre === 'kampanya') filtrelenmis = filtrelenmis.filter(u => u.fiyat < 600);
                        if(filtre === 'yeni') filtrelenmis = filtrelenmis.slice(-12).reverse();
                        if(filtre === 'sinirli') filtrelenmis = [filtrelenmis[2] || filtrelenmis[0], filtrelenmis[4] || filtrelenmis[1], filtrelenmis[5] || filtrelenmis[3]].filter(Boolean);
                        
                        gosterilecekUrunler = window.akillSirala(filtrelenmis);
                        guncelLimit = 16;
                        
                        const sayac = document.getElementById('yfbSayac');
                        if(sayac) sayac.innerText = `${gosterilecekUrunler.length} ürün`;

                        const h1 = document.getElementById('yfbBaslik');
                        if(h1) {
                            if(filtre === 'hepsi') h1.innerText = 'Tüm Koleksiyon';
                            else if(filtre === 'yeni') h1.innerText = 'Yeni Gelenler';
                            else if(filtre === 'indirim') h1.innerText = 'İndirimli Ürünler';
                            else if(filtre === 'sinirli') h1.innerText = 'Sınırlı Sürüm';
                        }
                        
                        renderIleLoadMore();
                    });
                });
            }

            // Offcanvas Filtre Mantığı
            const btnAcFiltre = document.querySelector('.btn-filtre-yeni');
            const offcanvasFiltre = document.getElementById('offcanvasFiltre');
            const offcanvasOverlay = document.getElementById('offcanvasOverlay');
            const btnKapatFiltre = document.getElementById('kapatFiltreBtn');
            const btnUygula = document.getElementById('btnFiltreUygula');

            if (btnAcFiltre && offcanvasFiltre && offcanvasOverlay) {
                btnAcFiltre.addEventListener('click', () => {
                    offcanvasFiltre.classList.add('aktif');
                    offcanvasOverlay.classList.add('aktif');
                });

                const kapatFiltre = () => {
                    offcanvasFiltre.classList.remove('aktif');
                    offcanvasOverlay.classList.remove('aktif');
                };

                if (btnKapatFiltre) btnKapatFiltre.addEventListener('click', kapatFiltre);
                offcanvasOverlay.addEventListener('click', kapatFiltre);

                if (btnUygula) {
                    btnUygula.addEventListener('click', () => {
                        kapatFiltre();

                        // Hangi filtrelerin seçili olduğunu bul
                        const seciliBedenler = Array.from(document.querySelectorAll('.filtre-checkbox-beden:checked')).map(cb => cb.value);
                        const seciliRenkler = Array.from(document.querySelectorAll('.filtre-checkbox-renk:checked')).map(cb => cb.value);
                        const seciliFiyatlar = Array.from(document.querySelectorAll('.filtre-checkbox-fiyat:checked')).map(cb => cb.value);

                        // Önce sayfanın ana listesine dön (bunu tüm ürünler olarak al, sonra aktif kategoriye ve duruma göre daralt)
                        let baseUrunler = tumUrunler;
                        if(kategori) {
                            baseUrunler = baseUrunler.filter(u => u.kategori === kategori || u.kategori === 'unisex');
                            if(altKategori) {
                                baseUrunler = baseUrunler.filter(u => u.altkategori === altKategori);
                            }
                        }

                        // Üst sekmelerdeki aktif filtreyi uygula (yeni, indirim, vs)
                        const aktifBtn = document.querySelector('.filtre-btn.aktif');
                        if (aktifBtn) {
                            const filtre = aktifBtn.dataset.filtre;
                            if(filtre === 'indirim' || urlFiltre === 'kampanya') baseUrunler = baseUrunler.filter(u => u.fiyat < 600);
                            if(filtre === 'yeni') baseUrunler = baseUrunler.slice(-12).reverse();
                            if(filtre === 'sinirli') baseUrunler = [baseUrunler[2] || baseUrunler[0], baseUrunler[4] || baseUrunler[1], baseUrunler[5] || baseUrunler[3]].filter(Boolean);
                        }

                        // Şimdi offcanvas filtreleri uygula
                        let filtrelenmis = baseUrunler.filter(urun => {
                            // Beden kontrolü
                            let bedenUygun = true;
                            if (seciliBedenler.length > 0) {
                                bedenUygun = urun.bedenler && seciliBedenler.some(b => urun.bedenler.includes(b));
                            }

                            // Renk kontrolü
                            let renkUygun = true;
                            if (seciliRenkler.length > 0) {
                                renkUygun = urun.renkler && seciliRenkler.some(r => urun.renkler.some(ur => ur.isim === r));
                            }

                            // Fiyat kontrolü
                            let fiyatUygun = true;
                            if (seciliFiyatlar.length > 0) {
                                fiyatUygun = seciliFiyatlar.some(aralik => {
                                    if (aralik === '0-500') return urun.fiyat <= 500;
                                    if (aralik === '500-1000') return urun.fiyat > 500 && urun.fiyat <= 1000;
                                    if (aralik === '1000+') return urun.fiyat > 1000;
                                    return false;
                                });
                            }

                            return bedenUygun && renkUygun && fiyatUygun;
                        });

                        gosterilecekUrunler = window.akillSirala(filtrelenmis);
                        guncelLimit = 16;
                        
                        const sayac = document.getElementById('yfbSayac');
                        if(sayac) sayac.innerText = `${gosterilecekUrunler.length} ürün`;

                        renderIleLoadMore();
                    });
                }
            }
        }
    }

    // ── 6. Bülten Formu ──
    const bultenForm = document.getElementById('bultenForm');
    if (bultenForm) {
        bultenForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input');
            if (!input.value || !input.value.includes('@')) {
                input.style.borderColor = '#e63946';
                return;
            }
            input.style.borderColor = '';
            const btn = this.querySelector('button');
            btn.textContent = '✓ Kaydedildi!';
            btn.style.background = '#4caf50';
            input.value = '';
            setTimeout(() => {
                btn.textContent = 'Abone Ol';
                btn.style.background = '';
            }, 3000);
        });
    }

    // ── 7. Kullanıcı Giriş Kontrolü ──
    let mockKullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    if (!mockKullanicilar.find(k => k.email === 'admin@ustform.com')) {
        mockKullanicilar.push({
            ad: 'Yönetici Admin',
            email: 'admin@ustform.com',
            sifre: 'admin123',
            role: 'admin'
        });
        localStorage.setItem('kullanicilar', JSON.stringify(mockKullanicilar));
    }

    const aktifKullaniciState = localStorage.getItem('aktifKullanici');
    const hesabimLinkNav = document.getElementById('hesabimLinkKaan');
    
    if(hesabimLinkNav) {
        if (aktifKullaniciState) {
            const kullanici = JSON.parse(aktifKullaniciState);
            const adSadece = kullanici.ad ? kullanici.ad.split(' ')[0] : 'Profilim';
            hesabimLinkNav.innerHTML = `<i class="fa-regular fa-user"></i> ${adSadece}`;
            hesabimLinkNav.href = "profil.html";
            hesabimLinkNav.style.color = "var(--vurgu)";
            
            if (kullanici.role === 'admin' && !document.getElementById('adminPanelBtn')) {
                const adminBtnHTML = `<a href="admin.html" id="adminPanelBtn" style="color:var(--vurgu); margin-right:10px; font-weight:bold;"><i class="fa-solid fa-shield-halved"></i> Admin</a>`;
                hesabimLinkNav.insertAdjacentHTML('beforebegin', adminBtnHTML);
            }
        } else {
            hesabimLinkNav.innerHTML = `<i class="fa-regular fa-user"></i> Giriş Yap`;
            hesabimLinkNav.href = "giris.html";
            hesabimLinkNav.style.color = "";
        }
    }

    // ── 8. Mega Menü Hover Mantığı ──
    const megaMenu = document.getElementById('megaMenu');
    const megaMenuIcerik = document.getElementById('megaMenuIcerik');
    const megaHovers = document.querySelectorAll('.mega-hover');
    let megaTimeout;

    const megaIcerikler = {
        'erkek': `
            <div class="mega-col">
                <h4>Öne Çıkanlar</h4>
                <ul>
                    <li><a href="urunler.html?f=yeni&kategori=erkek">Yeni Gelenler</a></li>
                    <li><a href="urunler.html?f=indirim&kategori=erkek">İndirimli Ürünler</a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4>Erkek Giyim</h4>
                <ul>
                    <li><a href="urunler.html?kategori=erkek">Tüm Tişörtler</a></li>
                    <li><a href="urunler.html?kategori=erkek&altkategori=basic">Basic Tişört</a></li>
                    <li><a href="urunler.html?kategori=erkek&altkategori=baskili">Baskılı Tişört</a></li>
                    <li><a href="urunler.html?kategori=erkek&altkategori=oversize">Oversize Tişört</a></li>
                </ul>
            </div>


        `,
        'kadin': `
            <div class="mega-col">
                <h4>Öne Çıkanlar</h4>
                <ul>
                    <li><a href="urunler.html?f=yeni&kategori=kadin">Yeni Gelenler</a></li>
                    <li><a href="urunler.html?f=indirim&kategori=kadin">İndirimli Ürünler</a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4>Kadın Giyim</h4>
                <ul>
                    <li><a href="urunler.html?kategori=kadin">Tüm Tişörtler</a></li>
                    <li><a href="urunler.html?kategori=kadin&altkategori=crop">Crop Tişört</a></li>
                    <li><a href="urunler.html?kategori=kadin&altkategori=basic">Basic Tişört</a></li>
                    <li><a href="urunler.html?kategori=kadin&altkategori=oversize">Oversize Tişört</a></li>
                </ul>
            </div>


        `
    };

    if(megaMenu) {
        megaHovers.forEach(item => {
            const link = item.querySelector('a');
            if(link) {
                link.addEventListener('click', e => e.preventDefault());
            }

            item.addEventListener('mouseenter', function() {
                clearTimeout(megaTimeout);
                const type = this.dataset.mega;
                if(megaIcerikler[type]) {
                    megaMenuIcerik.innerHTML = megaIcerikler[type];
                }
                megaMenu.classList.add('aktif');
            });
            item.addEventListener('mouseleave', function() {
                megaTimeout = setTimeout(() => {
                    megaMenu.classList.remove('aktif');
                }, 200);
            });
        });

        megaMenu.addEventListener('mouseenter', function() {
            clearTimeout(megaTimeout);
            megaMenu.classList.add('aktif');
        });

        megaMenu.addEventListener('mouseleave', function() {
            megaTimeout = setTimeout(() => {
                megaMenu.classList.remove('aktif');
            }, 200);
        });
    }

    // ── 9. Canlı Arama (Overlay) ──
    const aramaToggle = document.getElementById('aramaToggle');
    if(aramaToggle) {
        // Overlay yapısını DOM'a ekle
        const aramaHTML = `
            <div class="arama-overlay" id="aramaOverlay">
                <div class="arama-container">
                    <input type="text" id="aramaInput" placeholder="Ürünlerde Ara" autocomplete="off" />
                    <button class="arama-kapat" id="aramaKapat"><i class="fa-solid fa-xmark"></i></button>
                    <div class="arama-sonuclar" id="aramaSonuclar"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', aramaHTML);

        const aramaOverlay = document.getElementById('aramaOverlay');
        const aramaInput = document.getElementById('aramaInput');
        const aramaSonuclar = document.getElementById('aramaSonuclar');
        const aramaKapat = document.getElementById('aramaKapat');

        aramaToggle.addEventListener('click', (e) => {
            e.preventDefault();
            aramaOverlay.classList.add('aktif');
            setTimeout(() => aramaInput.focus(), 300);
        });

        aramaKapat.addEventListener('click', () => {
            aramaOverlay.classList.remove('aktif');
            aramaInput.value = '';
            aramaSonuclar.innerHTML = '';
        });

        aramaInput.addEventListener('keyup', (e) => {
            if(e.key === 'Enter' && aramaInput.value.trim() !== '') {
                window.location.href = `urunler.html?q=${encodeURIComponent(aramaInput.value)}`;
                return;
            }

            const query = aramaInput.value.toLowerCase().trim();
            if(query.length < 2) {
                aramaSonuclar.innerHTML = '';
                return;
            }

            if(typeof urunleriGetir === 'function') {
                const sonuclar = urunleriGetir().filter(u => u.isim.toLowerCase().includes(query) || u.aciklama.toLowerCase().includes(query));
                
                if(sonuclar.length === 0) {
                    aramaSonuclar.innerHTML = '<p style="text-align:center;color:#888;">Sonuç bulunamadı.</p>';
                    return;
                }

                let html = '';
                sonuclar.forEach(u => {
                    html += `
                        <a href="urun-detay.html?id=${u.id}" class="arama-sonuc-item">
                            <div style="width: 50px; height: 50px; background:var(--gri-2); border-radius:4px; overflow:hidden;">
                                ${u.resim}
                            </div>
                            <div>
                                <h4 style="color:#1a1a1a; margin:0;">${u.isim}</h4>
                                <p style="color:var(--vurgu); font-size:0.9rem; margin: 2px 0 0 0;">${u.fiyat}₺</p>
                            </div>
                        </a>
                    `;
                });
                aramaSonuclar.innerHTML = html;
            }
        });
    }

    // ── 10. Off-Canvas Sepet ──
    const offcanvasSepetBtn = document.getElementById('offcanvasSepetBtn');
    if(offcanvasSepetBtn && !document.getElementById('offcanvasSepet')) {
        const offcanvasHTML = `
            <div class="offcanvas-overlay" id="sepetOverlay"></div>
            <div class="offcanvas-sepet" id="offcanvasSepet">
                <div class="offcanvas-header">
                    <h3>Sepetim</h3>
                    <button class="offcanvas-kapat" id="offcanvasKapat"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="offcanvas-icerik" id="offcanvasIcerik"></div>
                <div class="offcanvas-footer">
                    <a href="sepet.html" class="btn btn-birincil" style="width: 100%; justify-content: center;">Sepete Git</a>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', offcanvasHTML);
    }

    const offcanvasSepet = document.getElementById('offcanvasSepet');
    const sepetOverlay = document.getElementById('sepetOverlay');
    const offcanvasKapat = document.getElementById('offcanvasKapat');

    function toggleOffcanvas(e) {
        if(e) e.preventDefault();
        offcanvasSepet.classList.toggle('aktif');
        sepetOverlay.classList.toggle('aktif');
        renderOffcanvasSepet();
    }

    if(offcanvasSepetBtn) offcanvasSepetBtn.addEventListener('click', toggleOffcanvas);
    if(offcanvasKapat) offcanvasKapat.addEventListener('click', toggleOffcanvas);
    if(sepetOverlay) sepetOverlay.addEventListener('click', toggleOffcanvas);

    window.openOffcanvasSepet = function() {
        offcanvasSepet.classList.add('aktif');
        sepetOverlay.classList.add('aktif');
        renderOffcanvasSepet();
    };

    function renderOffcanvasSepet() {
        const icerik = document.getElementById('offcanvasIcerik');
        if(!icerik) return;
        const sepet = window.getSepet();
        if(sepet.length === 0) {
            icerik.innerHTML = '<p style="text-align:center; color:var(--gri-3); margin-top:20px;">Sepetiniz boş.</p>';
            return;
        }
        
        let html = '';
        let toplamTutar = 0;
        sepet.forEach((urun, index) => {
            toplamTutar += urun.fiyat * urun.adet;
            html += `
                <div class="mini-sepet-item" style="display:flex; gap:15px; align-items:center; border-bottom:1px dashed #e2e8f0; padding-bottom:15px; margin-bottom:15px; position:relative;">
                    <div style="width:65px; height:65px; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0; flex-shrink:0; background:#f8fafc;">
                        <img src="${urun.gorsel || 'https://via.placeholder.com/150'}" alt="${urun.isim}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="flex:1;">
                        <h4 style="color: #1a1a1a; font-size:0.95rem; font-weight:600; margin-bottom:4px; padding-right:20px;">${urun.isim}</h4>
                        <p style="color: #64748b; font-size:0.85rem; margin-bottom:6px;">Renk: ${urun.renk} | Beden: ${urun.beden || 'Standart'}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <p class="mini-sepet-fiyat" style="color: var(--vurgu); font-weight:700;">${urun.fiyat}₺</p>
                            <div style="display:flex; align-items:center; border:1px solid #e2e8f0; border-radius:4px; overflow:hidden;">
                                <button onclick="window.offcanvasMiktarDegistir(${index}, -1)" style="background:#f8fafc; border:none; padding:2px 8px; cursor:pointer; color:#64748b;">-</button>
                                <span style="font-size:0.85rem; padding:0 8px; color:#1a1a1a; font-weight:bold;">${urun.adet}</span>
                                <button onclick="window.offcanvasMiktarDegistir(${index}, 1)" style="background:#f8fafc; border:none; padding:2px 8px; cursor:pointer; color:#64748b;">+</button>
                            </div>
                        </div>
                    </div>
                    <button onclick="window.offcanvasUrunSil(${index})" style="position:absolute; top:0; right:0; background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.1rem; padding:5px;"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        });
        
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; font-weight:bold; font-size:1.1rem; color:#1a1a1a;">
                <span>Ara Toplam:</span>
                <span style="color:var(--vurgu);">${toplamTutar}₺</span>
            </div>
        `;
        icerik.innerHTML = html;
    }

    window.offcanvasMiktarDegistir = function(index, miktar) {
        let sepet = window.getSepet();
        if(sepet[index]) {
            sepet[index].adet += miktar;
            if(sepet[index].adet <= 0) {
                sepet.splice(index, 1);
            }
            window.saveSepet(sepet);
            renderOffcanvasSepet();
            if(typeof window.sepetGuncelle === 'function') window.sepetGuncelle();
        }
    };

    window.offcanvasUrunSil = function(index) {
        let sepet = window.getSepet();
        if(sepet[index]) {
            sepet.splice(index, 1);
            window.saveSepet(sepet);
            renderOffcanvasSepet();
            if(typeof window.sepetGuncelle === 'function') window.sepetGuncelle();
        }
    };

    // ── 11. Toast Bildirim Sistemi ──
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    window.showToast = function(mesaj) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${mesaj}`;
        toastContainer.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.add('goster');
        });

        setTimeout(() => {
            toast.classList.remove('goster');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // ── 12. Çerez & WhatsApp ──
    if (!localStorage.getItem('cerezKabul')) {
        const cookieBanner = document.createElement('div');
        cookieBanner.className = 'cookie-banner';
        cookieBanner.innerHTML = `
            <div class="cookie-content">
                <p>Size daha iyi bir alışveriş deneyimi sunabilmek için çerezleri kullanıyoruz.</p>
                <div class="cookie-buttons">
                    <button id="reddetBtn" class="btn" style="padding: 8px 16px; background: transparent; border: 1px solid var(--vurgu); color: var(--vurgu);">Reddet</button>
                    <button id="kabulEtBtn" class="btn btn-birincil" style="padding: 8px 16px;">Kabul Et</button>
                </div>
            </div>
        `;
        document.body.appendChild(cookieBanner);
        
        document.getElementById('kabulEtBtn').addEventListener('click', () => {
            localStorage.setItem('cerezKabul', 'true');
            cookieBanner.remove();
        });

        document.getElementById('reddetBtn').addEventListener('click', () => {
            localStorage.setItem('cerezKabul', 'false');
            cookieBanner.remove();
        });
    }

    const waButton = document.createElement('a');
    waButton.className = 'whatsapp-btn';
    waButton.href = 'https://wa.me/905519371343';
    waButton.target = '_blank';
    waButton.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    document.body.appendChild(waButton);
});
