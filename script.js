// Email domain handler
        const emailInput = document.getElementById('email');
        const emailUserInput = document.getElementById('emailUser');
        const emailDomainSelect = document.getElementById('emailDomain');
        const emailGroup = document.querySelector('.input-group');

        emailDomainSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                // Tam email girişi moduna geç
                emailInput.style.display = 'block';
                emailInput.required = true;
                emailUserInput.style.display = 'none';
                emailUserInput.required = false;
                emailDomainSelect.style.display = 'none';
            } else {
                // Domain seçimli moda geri dön
                emailInput.style.display = 'none';
                emailInput.required = false;
                emailUserInput.style.display = 'block';
                emailUserInput.required = true;
                emailDomainSelect.style.display = 'block';
            }
        });

        // Form gönderim kontrolü
        function canSubmitForm() {
            const lastSubmission = localStorage.getItem('lastFormSubmission');
            if (!lastSubmission) return true;

            const timeDiff = Date.now() - parseInt(lastSubmission);
            const waitTime = 10 * 60 * 1000; // 10 dakika
            
            if (timeDiff < waitTime) {
                const remainingSeconds = Math.ceil((waitTime - timeDiff) / 1000);
                return remainingSeconds;
            }
            
            return true;
        }

        function updateTimerMessage(seconds) {
            const timerMessage = document.getElementById('timerMessage');
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            timerMessage.innerHTML = `Yeni bir şikayet gönderebilmek için kalan süre: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            timerMessage.style.display = 'block';
            
            if (seconds > 0) {
                setTimeout(() => updateTimerMessage(seconds - 1), 1000);
            } else {
                timerMessage.style.display = 'none';
            }
        }

        // Sayfa yüklendiğinde timer kontrolü
        document.addEventListener('DOMContentLoaded', function() {
            const canSubmit = canSubmitForm();
            if (typeof canSubmit === 'number') {
                updateTimerMessage(canSubmit);
            }
        });

        document.getElementById('sikayetForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Form gönderim kontrolü
            const canSubmit = canSubmitForm();
            if (typeof canSubmit === 'number') {
                updateTimerMessage(canSubmit);
                return;
            }
            
            // Email değerini belirle
            let emailValue;
            if (emailDomainSelect.value === 'custom') {
                emailValue = emailInput.value;
            } else {
                emailValue = emailUserInput.value ? emailUserInput.value + emailDomainSelect.value : '';
            }
            
            const phoneValue = document.getElementById('telefon').value;
            
            // En az biri dolu mu kontrolü
            if (!emailValue && !phoneValue) {
                document.getElementById('errorMessage').style.display = 'block';
                return;
            }
            
            document.getElementById('errorMessage').style.display = 'none';
            
            const formData = {
                isim: document.getElementById('isim').value,
                email: emailValue || null,
                telefon: phoneValue ? document.getElementById('ulkeKodu').value + phoneValue : null,
                sikayet: document.getElementById('sikayet').value,
                tarih: new Date().toISOString()
            };

            try {
                const response = await fetch('https://form.gvpmarkt.workers.dev/sikayet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // Form başarıyla gönderildiğinde timestamp'i kaydet
                    localStorage.setItem('lastFormSubmission', Date.now().toString());
                    document.getElementById('successMessage').style.display = 'block';
                    document.getElementById('sikayetForm').reset();
                } else {
                    throw new Error('Bir hata oluştu');
                }
            } catch (error) {
                alert('Şikayet gönderilirken bir hata oluştu: ' + error.message);
            }
        });

        // Form alanları değiştiğinde hata mesajını gizle
        ['emailUser', 'email', 'telefon'].forEach(id => {
            document.getElementById(id).addEventListener('input', function() {
                document.getElementById('errorMessage').style.display = 'none';
            });
        });

        // Telefon numarası formatları için konfigürasyon
        const phoneFormats = {
            '+90': { pattern: '^[5][0-9]{9}$', placeholder: '5XX XXX XXXX', length: 10 }, // Türkiye
            '+1': { pattern: '^[2-9][0-9]{9}$', placeholder: 'XXX XXX XXXX', length: 10 }, // ABD ve Kanada
            '+44': { pattern: '^[7][0-9]{9}$', placeholder: '7XXX XXX XXX', length: 10 }, // Birleşik Krallık
            '+49': { pattern: '^[1-9][0-9]{10}$', placeholder: '15X XXXX XXXX', length: 11 }, // Almanya
            '+33': { pattern: '^[6-7][0-9]{8}$', placeholder: '6XX XXX XXX', length: 9 }, // Fransa
            '+46': { pattern: '^[7][0-9]{8}$', placeholder: '7XX XXX XXX', length: 9 }, // İsveç
            '+34': { pattern: '^[6-7][0-9]{8}$', placeholder: '6XX XXX XXX', length: 9 }, // İspanya
            '+39': { pattern: '^[3][0-9]{9}$', placeholder: '3XX XXX XXXX', length: 10 }, // İtalya
            '+31': { pattern: '^[6][0-9]{8}$', placeholder: '6XX XXX XXX', length: 9 }, // Hollanda
            '+7': { pattern: '^[9][0-9]{9}$', placeholder: '9XX XXX XXXX', length: 10 }, // Rusya
            '+380': { pattern: '^[6-9][0-9]{8}$', placeholder: '6XX XXX XXX', length: 9 }, // Ukrayna
            '+48': { pattern: '^[4-8][0-9]{8}$', placeholder: '5XX XXX XXX', length: 9 }, // Polonya
            '+45': { pattern: '^[2-9][0-9]{7}$', placeholder: '2X XX XX XX', length: 8 }, // Danimarka
            '+47': { pattern: '^[4-9][0-9]{7}$', placeholder: '4XX XX XXX', length: 8 }, // Norveç
            '+358': { pattern: '^[4-5][0-9]{8}$', placeholder: '4XX XXX XXX', length: 9 }, // Finlandiya
            '+43': { pattern: '^[6][0-9]{8}$', placeholder: '6XX XXX XXX', length: 9 }, // Avusturya
            '+32': { pattern: '^[4][0-9]{8}$', placeholder: '4XX XXX XXX', length: 9 }, // Belçika
            '+41': { pattern: '^[7][0-9]{8}$', placeholder: '7XX XXX XXX', length: 9 }, // İsviçre
            '+351': { pattern: '^[9][0-9]{8}$', placeholder: '9XX XXX XXX', length: 9 }, // Portekiz
            '+30': { pattern: '^[6][0-9]{9}$', placeholder: '6XX XXX XXXX', length: 10 }, // Yunanistan
            '+353': { pattern: '^[8][0-9]{8}$', placeholder: '8XX XXX XXX', length: 9 }, // İrlanda
            '+36': { pattern: '^[3][0-9]{8}$', placeholder: '3XX XXX XXX', length: 9 }, // Macaristan
            '+420': { pattern: '^[7][0-9]{8}$', placeholder: '7XX XXX XXX', length: 9 }, // Çek Cumhuriyeti
            '+421': { pattern: '^[9][0-9]{8}$', placeholder: '9XX XXX XXX', length: 9 }, // Slovakya
            '+386': { pattern: '^[3-7][0-9]{7}$', placeholder: '3XX XX XXX', length: 8 }, // Slovenya
            '+385': { pattern: '^[9][0-9]{8}$', placeholder: '9XX XXX XXX', length: 9 }, // Hırvatistan
            '+381': { pattern: '^[6][0-9]{8}$', placeholder: '6XX XXX XXX', length: 9 }, // Sırbistan
            '+359': { pattern: '^[8-9][0-9]{8}$', placeholder: '8XX XXX XXX', length: 9 }, // Bulgaristan
            '+40': { pattern: '^[7][0-9]{8}$', placeholder: '7XX XXX XXX', length: 9 }, // Romanya
            '+994': { pattern: '^[5-7][0-9]{8}$', placeholder: '5XX XXX XXX', length: 9 }, // Azerbaycan
            '+995': { pattern: '^[5][0-9]{8}$', placeholder: '5XX XXX XXX', length: 9 }, // Gürcistan
            '+972': { pattern: '^[5][0-9]{8}$', placeholder: '5XX XXX XXX', length: 9 }, // İsrail
            '+971': { pattern: '^[5][0-9]{8}$', placeholder: '5X XXX XXXX', length: 9 }, // BAE
            '+966': { pattern: '^[5][0-9]{8}$', placeholder: '5XX XXX XXX', length: 9 }, // Suudi Arabistan
            '+20': { pattern: '^[1][0-9]{9}$', placeholder: '1XX XXX XXXX', length: 10 }, // Mısır
            '+98': { pattern: '^[9][0-9]{9}$', placeholder: '9XX XXX XXXX', length: 10 }, // İran
            '+82': { pattern: '^[1][0-9]{9}$', placeholder: '1XX XXX XXXX', length: 10 }, // Güney Kore
            '+81': { pattern: '^[7-9][0-9]{9}$', placeholder: '7XX XXX XXXX', length: 10 }, // Japonya
            '+86': { pattern: '^[1][0-9]{10}$', placeholder: '1XX XXXX XXXX', length: 11 }, // Çin
            '+91': { pattern: '^[6-9][0-9]{9}$', placeholder: '9XX XXX XXXX', length: 10 }, // Hindistan
            // Diğer ülkeler için varsayılan format
            'default': { 
                pattern: '^[0-9]{8,12}$', 
                placeholder: 'Telefon Numarası', 
                length: 12,
                message: 'Geçerli bir telefon numarası girin'
            }
        };

        // Telefon alanı validasyonu güncellendi
        function validatePhone(input) {
            const phoneError = document.getElementById('phoneError');
            const selectedCountry = document.getElementById('ulkeKodu').value;
            const format = phoneFormats[selectedCountry] || phoneFormats.default;
            
            const phoneRegex = new RegExp(format.pattern);
            
            if (input.value && !phoneRegex.test(input.value)) {
                input.classList.add('input-error');
                phoneError.style.display = 'block';
                phoneError.textContent = `Lütfen geçerli bir telefon numarası girin (${format.placeholder})`;
                input.setCustomValidity(`Geçersiz telefon numarası formatı`);
            } else {
                input.classList.remove('input-error');
                phoneError.style.display = 'none';
                input.setCustomValidity('');
            }
        }

        // Ülke kodu değiştiğinde telefon alanını güncelle
        document.getElementById('ulkeKodu').addEventListener('change', function() {
            const phoneInput = document.getElementById('telefon');
            const format = phoneFormats[this.value] || phoneFormats.default;
            
            phoneInput.placeholder = format.placeholder;
            phoneInput.maxLength = format.length;
            phoneInput.pattern = format.pattern;
            
            // Mevcut numarayı kontrol et
            if (phoneInput.value) {
                validatePhone(phoneInput);
            }
        });
