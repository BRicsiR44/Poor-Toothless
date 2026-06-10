# 🐉 Poor Toothless

Egy pörgős, 2D platformer arcade játék, ahol egy éhes sárkány bőrébe bújva kell minél több halat levásásznod, miközben folyamatosan veszélyek záporoznak rád az égből és a föld alól is.

---

## 🎯 A játék célja

A célod a túlélés és a lehető legmagasabb pontszám (**Score**) elérése. 
* **Vadászat:** Kapd el a potyogó sima halakat és a ritka, extra pontot érő aranyhalakat.
* **Veszélyek:** Kerüld el a mérgező angolnákat, a lövészek nyílvesszőit, a lehulló köveket és a földből kilövellő lávaoszlopokat.
* **A háló csapda:** Az égből potyogó hálók nem sebeznek meg azonnal, de 1.5 másodpercre teljesen mozgásképtelenné (legyökerezetté) tesznek a földön vagy a levegőben, így védtelenné válsz a többi veszéllyel szemben!
* **Életek:** 3 élettel indulsz. Ha eltalál egy veszélyforrás, veszítesz egyet. Ha az életed 0-ra csökken, a játéknak vége.

---

## 🎮 Irányítás

A játékot billentyűzet segítségével tudod irányítani. A mozgás reszponzív, és támogatja mind a klasszikus **WASD**, mind az **Iránygombok** elrendezést.

| Akció | Billentyűk | Leírás |
| :--- | :--- | :--- |
| **Mozgás balra** | `A` vagy `←` | A sárkány balra fut és arra is fordul. |
| **Mozgás jobbra** | `D` vagy `→` | A sárkány jobbra fut és arra is fordul. |
| **Ugrás** | `W` / `Space` / `↑` | Egyszeri megnyomásával a sárkány a levegőbe ugrik. |
| **Magas ugrás** | Tartsd nyomva a gombot | Minél tovább tartod nyomva az ugrás gombot, annál magasabbra száll a sárkány. |
| **Levegő Dash (Lökés)** | Irány + Ugrás a levegőben | Ha a levegőben vagy, nyomj egy irányt és az ugrás gombot a hirtelen horizontális kitéréshez. |

---

## ✨ Kiemelt QoL (Quality of Life) funkciók

A játék fejlesztése során nagy hangsúlyt fektettünk arra, hogy a játékmenet igazságos, reszponzív és modern platformer érzetű legyen:

* **Dinamikus ugrási magasság:** Nem csak egy fix íven tudsz ugrani. Ha csak megpöccinted a gombot, kicsit ugrik, ha nyomva tartod, maximális magasságot ér el. Ez kritikus a precíz kikerüléseknél.
* **Coyote Time (Gyalogkakukk időzítő):** Ha lefutnál egy platform széléről, a játék ad egy **100 ms-os** láthatatlan türelmi időt, amíg a levegőben állva is elrugaszkodhatsz. Így nem fogod azt érezni, hogy "de én megnyomtam az ugrást!".
* **Hitbox és Sprite szétválasztás:** A sárkány fizikai ütközésdoboza (hitbox) egy tökéletes és precíz 40x40-es négyzet, míg a grafikája egy nagyobb (64x64, futásnál 72x72) keretben jelenik meg. Így a szárnyak vagy a farok szélei nem akadnak el igazságtalanul a csapdákban.
* **Állapot-prioritásos animációk:** A karakter animációs állapotgépe mindig a legfontosabb eseményt mutatja. Ha a sárkány meghal, a halál animációnak abszolút prioritása van, teljesen felülírja a zuhanást vagy a hálós bénultságot.

---

## 🛠️ Hogyan készült? (Technikai háttér)

A projekt egy teljesen egyedi fejlesztésű, külső motorok (mint a Unity vagy a Phaser) nélkül, tiszta **Vanilla JavaScript** és **HTML5 Canvas API** segítségével épült fel.

### Főbb technikai megoldások:
* **Mesterséges Intelligencia Támogatás:** A kódstruktúra kialakítása, a bonyolultabb fizikai számítások (pl. a ferdén potyogó kövek röppályája), a hibakeresés és a generatív assetek (háttér, platform) elkészítése során a **Google Gemini Flash (kibővített)** AI modellje nyújtott folyamatos szakmai segítséget és útmutatást a fejlesztés során.
* **Objektumorientált architektúra (OOP):** Minden játékelem (`Player`, `Fish`, `Lava`, `Net`, `Projectiles`) saját, zárt logikával rendelkező ES6 osztályba (`class`) lett szervezve.
* **DeltaTime alapú fizika:** A mozgások kiszámítása nem a képfrissítéstől (FPS) függ, hanem a ténylegesen eltelt időtől (`deltaTime`).
* **Fix Időlépéses Akkumulátor (Fixed Timestep):** A fizikai szimuláció fix ütemben frissül, így megakadályozza, hogy a sárkány a szaggatások (lag) miatt átessen a platformokon.
* **Pixelated Rendering:** CSS segítségével kényszerített textúra-szűrés biztosítja, hogy a retro elemek tűélesek maradjanak a böngészőben.

---

## 📂 Mappaszerkezet

```text
fogatlan-a-halvadasz/
│
├── assets/             # A játék összes grafikai eleme (.png, .jpg)
│   ├── background.png  # Skicselt, viking hangulatú esti háttér
│   ├── platform.png    # Sziklás, füves textúrájú talaj elem
│   ├── player_*.png    # A sárkány különböző állapotai (idle, running, dead, stb.)
│   └── fish, eel, net  # Csapdák és zsákmányok textúrái
│
├── js/                 # A játék logikáját futtató szkriptek
│   ├── main.js         # Belépési pont, a Canvas inicializálása
│   ├── game.js         # A fő játék-hurok (Game Loop) és állapotkezelő
│   ├── player.js       # Sárkány fizika, bemenet-kezelés és rajzolás
│   └── ...             # Egyéb entitások (fish.js, net.js, lava.js stb.)
│
├── index.html          # A játékot befogadó HTML oldal
└── style.css           # A játékvásznat méretező stíluslap