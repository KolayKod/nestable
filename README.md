# Vanilla Nestable

Vanilla JavaScript ile yazılmış, jQuery bağımlılığı olmayan, sürükle-bırak özellikli iç içe liste (nested list) kütüphanesi.

## Özellikler

- ✅ jQuery bağımlılığı yok
- ✅ Modern JavaScript (ES6+)
- ✅ Sürükle-bırak desteği
- ✅ Touch olayları desteği
- ✅ Responsive tasarım
- ✅ Özelleştirilebilir görünüm
- ✅ Kolay entegrasyon
- ✅ Hafif ve performanslı

## Kurulum

### NPM ile Kurulum

```bash
npm install vanilla-nestable
```

### CDN ile Kurulum

```html
<script src="https://unpkg.com/vanilla-nestable/dist/vanilla-nestable.min.js"></script>
```

### Manuel Kurulum

1. `vanilla-nestable.js` dosyasını projenize ekleyin
2. HTML dosyanızda script etiketini ekleyin:

```html
<script src="path/to/vanilla-nestable.js"></script>
```

## Kullanım

### Temel Kullanım

```html
<div class="dd" id="nestable">
    <ol class="dd-list">
        <li class="dd-item" data-id="1">
            <div class="dd-handle">Item 1</div>
        </li>
        <li class="dd-item" data-id="2">
            <div class="dd-handle">Item 2</div>
            <ol class="dd-list">
                <li class="dd-item" data-id="3">
                    <div class="dd-handle">Item 3</div>
                </li>
            </ol>
        </li>
    </ol>
</div>

<script>
    // Nestable'ı başlat
    const nestableElement = document.querySelector('#nestable');
    window.nestable(nestableElement);
</script>
```

### Grup Kullanımı

```html
<div class="dd" id="nestable1" data-nestable-group="1">
    <!-- Liste içeriği -->
</div>

<div class="dd" id="nestable2" data-nestable-group="1">
    <!-- Liste içeriği -->
</div>

<script>
    // Aynı gruptaki listeler arasında sürükle-bırak yapılabilir
    window.nestable(document.querySelectorAll('.dd'));
</script>
```

### Metodlar

```javascript
const nestableElement = document.querySelector('#nestable');
const nestableInstance = window.nestable(nestableElement);

// Tüm öğeleri genişlet
nestableInstance.expandAll();

// Tüm öğeleri daralt
nestableInstance.collapseAll();

// Liste yapısını serialize et
const serialized = nestableInstance.serialize();
```

### Olaylar

```javascript
const nestableElement = document.querySelector('#nestable');
window.nestable(nestableElement);

// Değişiklik olayını dinle
nestableElement.addEventListener('change', function(e) {
    const serialized = window.nestable(nestableElement, 'serialize');
    console.log('Yeni liste yapısı:', serialized);
});
```

## Özelleştirme

### CSS Sınıfları

```css
.dd { }                    /* Ana konteyner */
.dd-list { }              /* Liste */
.dd-item { }              /* Liste öğesi */
.dd-handle { }            /* Sürükleme tutamacı */
.dd-placeholder { }       /* Sürükleme sırasındaki yer tutucu */
.dd-dragel { }            /* Sürüklenen öğe */
.dd-collapsed { }         /* Daraltılmış öğe */
.dd-empty { }             /* Boş liste */
.dd-nochildren { }        /* Alt öğesi olmayan öğe */
```

### Seçenekler

```javascript
const options = {
    listNodeName: 'ol',           // Liste elementi
    itemNodeName: 'li',           // Öğe elementi
    rootClass: 'dd',              // Kök sınıf
    listClass: 'dd-list',         // Liste sınıfı
    itemClass: 'dd-item',         // Öğe sınıfı
    dragClass: 'dd-dragel',       // Sürükleme sınıfı
    handleClass: 'dd-handle',     // Tutamak sınıfı
    collapsedClass: 'dd-collapsed', // Daraltılmış sınıf
    placeClass: 'dd-placeholder',  // Yer tutucu sınıf
    noDragClass: 'dd-nodrag',      // Sürüklenemez sınıf
    emptyClass: 'dd-empty',        // Boş liste sınıfı
    expandBtnHTML: '<button data-action="expand">Genişlet</button>',
    collapseBtnHTML: '<button data-action="collapse">Daralt</button>',
    group: 0,                      // Grup ID
    maxDepth: 5,                   // Maksimum derinlik
    threshold: 20                  // Sürükleme eşiği
};

window.nestable(element, options);
```

## Tarayıcı Desteği

- Chrome (son 2 versiyon)
- Firefox (son 2 versiyon)
- Safari (son 2 versiyon)
- Edge (son 2 versiyon)
- iOS Safari (son 2 versiyon)
- Android Chrome (son 2 versiyon)

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: Açıklama'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Pull Request oluşturun

## Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

- GitHub: [GitHub Profiliniz]
- E-posta: [E-posta Adresiniz]

## Teşekkürler

- Orijinal jQuery Nestable projesine teşekkürler
- Tüm katkıda bulunanlara teşekkürler
