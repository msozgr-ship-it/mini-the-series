const DB = {
  series: [
    {
      id: 's1',
      title: 'Mini: The Journey',
      searchTags: 'mini, the journey, orman',
      desc: 'Karanlık bir ormanda yalnız yürüyen Mini, gizemli bir ışığın peşine düşer. Bu destansı yolculuk onu ormanın kalbindeki büyük sırrı keşfetmeye götürecektir.',
      poster: 'assets/img/mini.jpg.png',
      year: '2026',
      match: '98%',
      meta: '4K HDR',
      rating: '8.9',
      highlights: 'Karanlık bir orman, gizemli bir ışık ve Mini\'nin destansı yolculuğu.',
      episodes: [
        {
          id: 's1e1',
          epNum: 1,
          title: 'Karanlık Ormana Giriş',
          desc: 'Mini karanlık ormanda yürür. Uzakta gizemli bir ışık görür ve peşine düşer.',
          file: 'bolum1.mp4',
          isYoutube: false
        },
        {
          id: 's1e2',
          epNum: 2,
          title: 'Işığın Gizemi',
          desc: 'Işığın gizemi derinleşir. Mini ormanın kalbindeki büyük kütüphaneye ulaşır.',
          file: 'bolum2.mp4',
          isYoutube: false
        }
      ]
    }
  ],
  movies: [
    {
      id: "up-movie",
      title: "Yukarı Bak (Up)",
      poster: "assets/img/yukarıbak.jpg",
      file: "https://archive.org/embed/up_20260516",
      searchTags: "up, yukarı bak, pixar, disney, carl, russell, balon, macera, animasyon, komedi, aile, 2009",
      desc: "78 yaşındaki baloncu Carl Fredricksen, evine binlerce balon bağlayarak ömür boyu hayalini kurduğu vahşi Güney Amerika semalarına doğru uçuşa geçer. Ancak davetsiz misafiri Russell ile çıktığı bu yolculukta onu unutulmaz maceralar beklemektedir.",
      year: "2009",
      match: "99%",
      meta: "4K HDR",
      rating: "9.0",
      highlights: "Carl ve Russell'ın binlerce rengarenk balonla çıktığı, her yaştan izleyiciyi büyüleyen Oscar ödüllü Pixar başyapıtı.",
      isYoutube: true,
      isNew: true
    },
    {
      id: "the-wampire-hunter-movie",
      title: "The Vampire Hunter",
      poster: "assets/img/thewampirehunter.jpeg",
      file: "https://archive.org/embed/vampire-hunter-d-bloodlust_202605",
      searchTags: "the vampire hunter, vampir avcısı, aksiyon, macera, korku, fantastik, 2024",
      isNew: true
    },
    {
      id: "saftirik-greg-movie",
      title: "Saftirik Greg'in Maceraları",
      poster: "assets/img/saftirikgrekinmaceraları.webp",
      file: "https://pixeldrain.com/u/SAFTIRIK_ID",
      searchTags: "saftirik greg'in maceraları, saftirik, greg, animasyon, komedi, aile, 2024",
      isNew: true
    },
    {
      id: "ancak-ruyada-olur-movie",
      title: "Ancak Rüyada Olur",
      poster: "assets/img/ancakrüyadaolur.jpg",
      file: "https://archive.org/embed/ancak-ruyada-olur",
      searchTags: "ancak rüyada olur, komedi, romantik, dram, 2024",
      isNew: true
    },
    {
      id: "the-twits-movie",
      title: "The Twits",
      poster: "assets/img/thetwits.webp",
      file: "https://archive.org/embed/the-twits_202605",
      searchTags: "the twits, twits, animasyon, komedi, roald dahl, netflix, 2025",
      isNew: true
    },
    {
      id: "karaya-movie",
      title: "Kayara",
      poster: "assets/img/kayara.webp",
      file: "https://www.dailymotion.com/embed/video/k6KRWrhctyV9mmG4D0c?autoplay=1&queue-enable=false&queue-autoplay-next=false",
      searchTags: "kayara, karaya, macera, aksiyon, deniz, 2024",
      isNew: true
    },
    {
      id: "stitch-head-movie",
      title: "Stitch Head",
      poster: "assets/img/Stitchhead.jpg",
      file: "https://www.dailymotion.com/embed/video/k3xfwFMvJ1FAKaG4D2Y?autoplay=1&queue-enable=false&queue-autoplay-next=false",
      searchTags: "stitch head, stitchhead, animasyon, macera, korku, komedi, 2024",
      isNew: true
    },
    {
      id: "swapped-movie",
      title: "Swapped",
      poster: "assets/img/swapped.webp",
      file: "https://pixeldrain.com/u/SWAPPED_ID",
      trailer: "https://youtu.be/h_ypav1tCHw?si=5iAbRUcYN0RfITVK",
      searchTags: "swapped, animasyon, macera, fantastik, aile, 2024",
      isNew: true
    },
    {
      id: 'm1',
      title: 'Hoplayanlar',
      searchTags: 'hoppers, hoplayanlar, disney, pixar, animasyon',
      desc: 'Eşsiz bir animasyon macerası. Disney ve Pixar\'ın en yeni başyapıtı.',
      poster: 'assets/img/hoplayanlar.jpg',
      file: 'https://archive.org/embed/hoplayanlar-izle-2026',
      isYoutube: true,
      year: '2026',
      match: '95%',
      meta: 'HD',
      rating: '8.5',
      highlights: 'Disney ve Pixar\'ın en yeni, eğlence dolu animasyon başyapıtı.'
    },
    {
      id: 'm2',
      title: 'Zootopia Serisi',
      searchTags: 'zootopia 2, zootropolis, hayvanlar şehri, judy hopps, nick wilde, tavşan, polis, animasyon',
      desc: 'Zootropolis şehrinin maceraları tek bir yerde. Judy Hopps ve Nick Wilde ile efsanevi yolculuk.',
      poster: 'assets/img/zootopia_main.jpg.jpg',
      isCollection: true,
      year: 'Koleksiyon',
      match: '99%',
      meta: '2 Film',
      rating: '8.7',
      highlights: 'Judy ve Nick ile Zootropolis\'in heyecan dolu polisiye macerası.',
      collection: [
        {
          id: 'm2f1',
          epNum: 1,
          title: 'Zootropolis: Hayvanlar Şehri (2016)',
          desc: 'Judy Hopps polis akademisinden mezun olup Zootropolis\'e gelir. Nick Wilde ile unutulmaz bir macera başlar.',
          poster: 'assets/img/zootopia1.jpg',
          file: 'https://archive.org/embed/zootropolis-hayvanlar-sehri-izle-hdfilmcehennemi-film-izle-hd-film-izle',
          isYoutube: true
        },
        {
          id: 'm2f2',
          epNum: 2,
          title: 'Zootopia 2 (2025)',
          desc: 'Judy ve Nick\'in yeni macerası. Çok yakında SiomJourney\'de!',
          poster: 'assets/img/zootopia2.jpg',
          file: 'https://archive.org/embed/zootropolis-2-izle-hdfilmcehennemi-film-izle-hd-film-izle',
          isYoutube: true
        }
      ]
    },
    {
      id: 'm3',
      title: 'Coco (Koko)',
      searchTags: 'coco, koko, miguel, ölüler diyarı, pixar, animasyon, müzikal',
      desc: '12 yaşındaki Miguel\'in Ölüler Diyarı\'ndaki unutulmaz müzikal yolculuğu.',
      poster: 'assets/img/coco.jpg.jpg',
      trailer: 'https://youtu.be/V46MgKE0LsQ?si=idM1EYnPeGq1rlzT',
      year: '2017',
      match: '97%',
      meta: '4K Ultra HD',
      rating: '8.5',
      highlights: 'Miguel\'in Ölüler Diyarı\'ndaki rengarenk ve duygusal müzikal hikayesi.',
      file: 'https://archive.org/embed/koko_20260511',
      isYoutube: true
    },
    {
      id: 'm4',
      title: 'Ejderhanı Nasıl Eğitirsin Serisi',
      searchTags: 'ejderhanı nasıl eğitirsin, how to train your dragon, htyd, dişsiz, toothless, hıçkıdık, hiccup, ejderha, animasyon',
      desc: 'Hıçkıdık ve Dişsiz\'in Berk adasındaki efsanevi dostluk hikayesi.',
      poster: 'assets/img/httyd_main.jpg.jpg',
      isCollection: true,
      year: '2010-2019',
      match: '99%',
      meta: 'Koleksiyon',
      rating: '8.8',
      highlights: 'Hıçkıdık ve Dişsiz\'in ejderhalarla dolu efsanevi dostluk destanı.',
      collection: [
        {
          id: 'm4f1',
          epNum: 1,
          title: 'Ejderhanı Nasıl Eğitirsin 1',
          desc: 'Genç bir Viking olan Hıçkıdık ve yaralı bir ejderhanın dostluğu.',
          poster: 'assets/img/ejderhanınasıleğitirsin1.jpg',
          file: 'https://archive.org/embed/ejderhani-nasil-egitirsin-1',
          isYoutube: true
        },
        {
          id: 'm4f2',
          epNum: 2,
          title: 'Ejderhanı Nasıl Eğitirsin 2',
          desc: 'Hıçkıdık ve Dişsiz yeni dünyalar keşfederken büyük bir tehditle karşılaşır.',
          poster: 'assets/img/ejderhanınasıleğitirsin2.jpg',
          file: 'https://archive.org/embed/ejderhani-nasil-egitirsin-2',
          isYoutube: true
        },
        {
          id: 'm4f3',
          epNum: 3,
          title: 'Ejderhanı Nasıl Eğitirsin 3: Gizli Dünya',
          desc: 'Hıçkıdık ejderha ütopyasını ararken, Dişsiz kendi türünden birini bulur.',
          poster: 'assets/img/ejderhanınasıleğitirsin3.jpg',
          file: 'https://archive.org/embed/ejderhani-nasil-egitirsin-3',
          isYoutube: true
        }
      ]
    },
    {
      id: 'm5',
      title: 'Elio',
      searchTags: 'elio, disney, pixar, uzay, animasyon, 2025',
      desc: 'Evrenin elçisi seçilen küçük bir çocuğun komik ve heyecan dolu macerası.',
      poster: 'assets/img/elio.jpg',
      trailer: 'https://youtu.be/XqnozEexIqE?si=5a5Sr9BPDE_4lzyr',
      year: '2025',
      match: '98%',
      meta: '4K Ultra HD',
      rating: '8.5',
      highlights: 'Elio\'nun galaksiler arası elçi olarak yaşadığı komik macera.',
      file: 'https://archive.org/embed/elio_20260516',
      isYoutube: true
    },
    {
      id: 'm6',
      title: 'Dayı Serisi',
      searchTags: 'dayı serisi, dayi, dayı 1, dayı 2, ufuk bayraktar, aksiyon, dram, türk filmi, koleksiyon',
      desc: 'Dayı\'nın adalet mücadelesi ve efsanevi hikayesi tek bir koleksiyonda. Ufuk Bayraktar\'ın başrolünde yer aldığı aksiyon dolu yapımlar.',
      poster: 'assets/img/dayımain.jpg',
      isCollection: true,
      year: 'Koleksiyon',
      match: '99%',
      meta: '2 Film',
      rating: '8.9',
      highlights: 'Dayı\'nın adalet mücadelesi ve efsanevi kabadayılık raconları tek bir çatı altında.',
      collection: [
        {
          id: 'm6f1',
          epNum: 1,
          title: 'Dayı: Bir Adamın Hikayesi (2021)',
          desc: 'Adil ve cesur bir adam olan Cevahir\'in, İstanbul sokaklarında adaleti arama ve kabadayılık dünyasına adım atış hikayesi.',
          poster: 'assets/img/dayı1.jpg',
          file: 'https://archive.org/embed/dayi-bir-adamin-hikayesi',
          isYoutube: true
        },
        {
          id: 'm6f2',
          epNum: 2,
          title: 'Dayı 2: Bir Adamın Hikayesi (2025)',
          desc: 'Efsane geri dönüyor. Dayı\'nın adaleti ve hikayesi kaldığı yerden devam ediyor.',
          poster: 'assets/img/dayı2.jpg',
          file: 'https://archive.org/embed/dayi-bir-adamin-hikayesi-2',
          isYoutube: true
        }
      ]
    }
  ]
};
