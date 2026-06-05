/* TAI FOOD · data.js
 * 單一資料來源：首頁菜卡與詳情頁 dish.html 共用這份資料與工具函式。
 * 改菜色 / 店家 / 食材，只改這裡一處，兩個頁面同步更新。
 */

/* ---------- 全域抓錯：依用戶規則「所有錯誤完整顯示在前端」（兩頁共用） ---------- */
(function () {
  function showFatal(msg, file, line) {
    const box = document.createElement('pre');
    box.style.cssText = `
      position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;
      background:#9b1f12;color:#fff;padding:14px 18px;border-radius:10px;
      font:13px/1.5 ui-monospace,Consolas,monospace;white-space:pre-wrap;
      box-shadow:0 10px 30px rgba(0,0,0,.4);border:1px solid #d9a441;
    `;
    box.textContent = `⚠️ JS Error: ${msg}` + (file ? `\n${file}:${line}` : '');
    (document.body || document.documentElement).appendChild(box);
  }
  window.addEventListener('error', (e) => showFatal(e.message, e.filename, e.lineno));
  window.addEventListener('unhandledrejection', (e) => showFatal(String(e.reason)));
})();

/* ---------- 分類標籤 ---------- */
const CAT_LABEL = { salty: '鹹點', sweet: '甜點', drink: '飲品' };

/* ---------- 33 道菜（首頁卡片 + 詳情頁皆讀此） ----------
 * id：網址用識別字（dish.html?d=id）；salty 的 id 與資料夾名相同，對得上 INGREDIENTS。
 */
const DISHES = [
  // 鹹點 salty
  { id: '蚵仔煎', num: 'A1', name: '蚵仔煎', en: 'Oyster Omelette', cat: 'salty', price: 'NT$ 75', desc: '蛋液、地瓜粉、青菜與肥蚵，淋上甜辣醬，夜市必點的鐵板協奏曲。', tags: ['蚵仔煎', 'oyster', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/蚵仔煎/main.png', emoji: '' },
  { id: '大腸蚵仔麵線', num: 'A2', name: '大腸蚵仔麵線', en: 'Oyster Intestine Vermicelli', cat: 'salty', price: 'NT$ 75', desc: '紅油湯頭裹細麵線，加滷大腸、肥蚵與一勺辣醬，撒上香菜——是巷口永遠排隊的那一攤。', tags: ['大腸蚵仔麵線', '蚵仔麵線', '麵線', 'oyster', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/大腸蚵仔麵線/main.png', emoji: '' },
  { id: '刈包', num: 'A3', name: '刈包', en: 'Gua Bao', cat: 'salty', price: 'NT$ 55', desc: '虎咬豬：滷得入味的爌肉、酸菜、花生粉、香菜，包入饅皮——台灣的漢堡。', tags: ['刈包', '割包', '虎咬豬', '漢堡', '小吃', '鹹點', 'gua bao'], img: 'assets/foods/salty/刈包/main.png', emoji: '' },
  { id: '鹽酥雞', num: 'A4', name: '鹽酥雞', en: 'Popcorn Chicken', cat: 'salty', price: 'NT$ 80', desc: '炸到酥脆的雞塊、九層塔香氣四溢，胡椒辣粉攪勻——深夜的罪惡。', tags: ['鹽酥雞', '鹹酥雞', '炸物', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/鹽酥雞/main.png', emoji: '' },
  { id: '烤玉米', num: 'A5', name: '烤玉米', en: 'Grilled Corn', cat: 'salty', price: 'NT$ 90', desc: '炭火慢烤，刷上沙茶、甜辣、蒜蓉醬，金黃焦香的夜市排隊王。', tags: ['烤玉米', '玉米', 'corn', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/烤玉米/main.png', emoji: '' },
  { id: '牛肉麵', num: 'A6', name: '牛肉麵', en: 'Beef Noodle Soup', cat: 'salty', price: 'NT$ 180', desc: '紅燒湯頭熬 6 小時，半筋半肉、酸菜佐之——台北滿街都在比拚的國民料理。', tags: ['牛肉麵', '紅燒牛肉麵', 'beef noodle', '小吃', '鹹點'], img: 'assets/foods/salty/牛肉麵/main.png', emoji: '' },
  { id: '滷肉飯', num: 'A7', name: '滷肉飯', en: 'Braised Pork Rice', cat: 'salty', price: 'NT$ 45', desc: '滷得透亮的肉燥淋在熱白飯上，配一顆滷蛋與酸黃瓜——台灣人從小吃到大。', tags: ['滷肉飯', '魯肉飯', 'lu rou fan', '小吃', '鹹點'], img: 'assets/foods/salty/滷肉飯/main.png', emoji: '' },
  { id: '雞排', num: 'A8', name: '雞排', en: 'Fried Chicken Cutlet', cat: 'salty', price: 'NT$ 75', desc: '巴掌大的去骨雞排，外酥內嫩、灑黑胡椒辣粉——是逛夜市的入場券。', tags: ['雞排', '炸雞排', 'fried chicken', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/雞排/main.png', emoji: '' },
  { id: '臭豆腐', num: 'A9', name: '臭豆腐', en: 'Stinky Tofu', cat: 'salty', price: 'NT$ 70', desc: '炸到外酥內嫩，配台式泡菜、淋上蒜蓉醬油——氣味嗆人但一口入魂。', tags: ['臭豆腐', 'stinky tofu', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/臭豆腐/main.png', emoji: '' },
  { id: '胡椒餅', num: 'A10', name: '胡椒餅', en: 'Pepper Bun', cat: 'salty', price: 'NT$ 60', desc: '炭爐烤至金黃，內餡蔥花胡椒豬肉，咬下去是滾燙的肉汁與胡椒辣香。', tags: ['胡椒餅', 'pepper bun', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/胡椒餅/main.png', emoji: '' },
  { id: '肉圓', num: 'A11', name: '肉圓', en: 'Ba-Wan', cat: 'salty', price: 'NT$ 50', desc: 'Q 彈外皮包覆肉餡、筍丁，淋上甜辣醬與蒜泥——是中部出來的傳奇。', tags: ['肉圓', '彰化肉圓', 'ba-wan', '小吃', '鹹點'], img: 'assets/foods/salty/肉圓/main.png', emoji: '' },
  { id: '碗粿', num: 'A12', name: '碗粿', en: 'Wa Gui', cat: 'salty', price: 'NT$ 50', desc: '在來米漿蒸成 Q 彈米糕，配香菇、滷肉與蛋黃，淋上蒜蓉醬油膏——南台灣早餐之王。', tags: ['碗粿', 'wa gui', '小吃', '鹹點'], img: 'assets/foods/salty/碗粿/main.png', emoji: '' },
  { id: '筒仔米糕', num: 'A13', name: '筒仔米糕', en: 'Tube Sticky Rice', cat: 'salty', price: 'NT$ 55', desc: '糯米與滷肉一同蒸在竹筒裡，倒扣後淋上甜辣醬——米粒沾滿肉汁的療癒料理。', tags: ['筒仔米糕', 'mi gao', '小吃', '鹹點'], img: 'assets/foods/salty/筒仔米糕/main.png', emoji: '' },
  { id: '貢丸湯', num: 'A14', name: '貢丸湯', en: 'Meatball Soup', cat: 'salty', price: 'NT$ 40', desc: '新竹貢丸彈牙紮實，清湯撒蔥花與胡椒——一碗就能配整桌小菜。', tags: ['貢丸湯', 'meatball soup', '小吃', '鹹點'], img: 'assets/foods/salty/貢丸湯/main.png', emoji: '' },
  { id: '豬血糕', num: 'A15', name: '豬血糕', en: 'Pig Blood Cake', cat: 'salty', price: 'NT$ 35', desc: '糯米拌豬血蒸熟切塊，沾醬油裹滿花生粉與香菜——一支竹籤的台味驚喜。', tags: ['豬血糕', 'pig blood cake', '米血', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/豬血糕/main.png', emoji: '' },
  { id: '台式香腸', num: 'A16', name: '台式香腸', en: 'Taiwanese Sausage', cat: 'salty', price: 'NT$ 40', desc: '炭烤上色、甜中帶酒香，配大蒜片直接咬下——是廟口小吃的標配。', tags: ['台式香腸', '香腸', 'sausage', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/台式香腸/main.png', emoji: '' },
  { id: '大腸包小腸', num: 'A17', name: '大腸包小腸', en: 'Small Sausage in Large Sausage', cat: 'salty', price: 'NT$ 65', desc: '糯米腸夾烤香腸，配酸菜、香菜、甜辣醬——一手拿著走的台味漢堡。', tags: ['大腸包小腸', 'small sausage in large', '小吃', '鹹點', '夜市'], img: 'assets/foods/salty/大腸包小腸/main.png', emoji: '' },
  { id: '棺材板', num: 'A18', name: '棺材板', en: 'Coffin Bread', cat: 'salty', price: 'NT$ 90', desc: '炸厚片吐司挖空、填入海鮮濃湯——名字嚇人，內容療癒，台南必嘗。', tags: ['棺材板', 'coffin bread', '小吃', '鹹點', '台南'], img: 'assets/foods/salty/棺材板/main.png', emoji: '' },
  { id: '甜不辣', num: 'A19', name: '甜不辣', en: 'Tianbula', cat: 'salty', price: 'NT$ 55', desc: '魚漿炸物泡進甜醬汁，配蘿蔔、油豆腐——日式起源、台灣魂的家常滋味。', tags: ['甜不辣', 'tianbula', 'tempura', '小吃', '鹹點'], img: 'assets/foods/salty/甜不辣/main.png', emoji: '' },

  // 甜點 sweet
  { id: '豆花', num: 'B1', name: '豆花', en: 'Tofu Pudding', cat: 'sweet', price: 'NT$ 50', desc: '滑嫩豆花、紅豆、花生、粉圓——夏天加冰糖水、冬天淋薑汁，一年四季都有它的版本。', tags: ['豆花', '豆腐花', '甜點', '冰品'], img: 'assets/foods/sweet/豆花/main.png', emoji: '' },
  { id: '芒果冰', num: 'B2', name: '芒果冰', en: 'Mango Shaved Ice', cat: 'sweet', price: 'NT$ 180', desc: '愛文芒果、煉乳、芒果冰淇淋——盛夏 35 度的解鎖密碼。', tags: ['芒果冰', '芒果剉冰', '剉冰', '冰沙', '刨冰', 'mango ice', '甜點', '冰品'], img: 'assets/foods/sweet/芒果冰/splash.png', emoji: '' },
  { id: '芋圓地瓜圓', num: 'B3', name: '芋圓 · 地瓜圓', en: 'Taro & Sweet Potato Balls', cat: 'sweet', price: 'NT$ 75', desc: '手工搓成的芋圓地瓜圓，Q 彈帶嚼勁——熱的配紅豆湯、冷的配剉冰，九份的招牌。', tags: ['芋圓-地瓜圓', '芋圓', '地瓜圓', 'taro', '甜點', '冰品'], img: 'assets/foods/sweet/芋圓-地瓜圓/main.png', emoji: '' },
  { id: '車輪餅', num: 'B4', name: '車輪餅', en: 'Wheel Cake', cat: 'sweet', price: 'NT$ 15', desc: '圓鼓鼓的小餅，奶油、紅豆、芋頭、蘿蔔絲、肉鬆——口味多到要排隊也要挑很久。', tags: ['車輪餅', '紅豆餅', 'imagawayaki', '甜點', '糕點'], img: 'assets/foods/sweet/車輪餅/main.png', emoji: '' },
  { id: '鳳梨酥', num: 'B5', name: '鳳梨酥', en: 'Pineapple Cake', cat: 'sweet', price: 'NT$ 35', desc: '奶油酥皮裹著土鳳梨內餡，酸甜恰到好處——是台灣帶出國最受歡迎的伴手禮 No.1。', tags: ['鳳梨酥', 'pineapple cake', '甜點', '糕點', '伴手禮'], img: 'assets/foods/sweet/鳳梨酥/main.png', emoji: '' },
  { id: '糖葫蘆', num: 'B6', name: '糖葫蘆', en: 'Candied Fruit Skewer', cat: 'sweet', price: 'NT$ 50', desc: '山楂、番茄、草莓裹上閃亮糖衣，竹籤一插——是逛夜市時必拍一張的甜蜜信物。', tags: ['糖葫蘆', 'tang hulu', '甜點', '夜市'], img: 'assets/foods/sweet/糖葫蘆/main.png', emoji: '' },
  { id: '芝麻球', num: 'B7', name: '芝麻球', en: 'Sesame Ball', cat: 'sweet', price: 'NT$ 25', desc: '糯米皮裹滿黑芝麻油炸成空心球，咬下去外香脆、內 Q 彈——是早餐店與港式點心的雙棲明星。', tags: ['芝麻球', 'sesame ball', '甜點', '糕點'], img: 'assets/foods/sweet/芝麻球/main.png', emoji: '' },
  { id: '涼糕', num: 'B8', name: '涼糕', en: 'Liang Gao', cat: 'sweet', price: 'NT$ 40', desc: '冰鎮過的糯米糕，淋上黑糖蜜、撒滿黃豆粉——是夏天巷口阿婆攤上五十年不變的清涼。', tags: ['涼糕', 'liang gao', '甜點', '冰品'], img: 'assets/foods/sweet/涼糕/main.jpg', emoji: '' },

  // 飲品 drink（無插畫，用 emoji）
  { id: '珍珠奶茶', num: 'C1', name: '珍珠奶茶', en: 'Bubble Milk Tea', cat: 'drink', price: 'NT$ 65', desc: 'Q 彈黑珍珠、紅茶與鮮奶，1980 年代台中發明，現在是世界級流行語。', tags: ['珍珠奶茶', '珍奶', '波霸', 'bubble tea', 'milk tea', 'boba', '飲料', '飲品'], img: 'assets/drinks/珍珠奶茶.png', emoji: '🧋' },
  { id: '冬瓜茶', num: 'C2', name: '冬瓜茶', en: 'Winter Melon Tea', cat: 'drink', price: 'NT$ 35', desc: '古早味甘甜，慢火熬煮數小時，加檸檬就是夏天的救贖。', tags: ['冬瓜茶', '飲料', '飲品', '古早味'], img: '', emoji: '🥤' },
  { id: '青茶', num: 'C3', name: '青茶', en: 'Green Tea', cat: 'drink', price: 'NT$ 30', desc: '高山茶葉現泡，清香回甘，是台灣每條街都有的一張綠色名片。', tags: ['青茶', '綠茶', '茶', '飲料', '飲品'], img: 'assets/drinks/青茶.png', emoji: '🍵' },
  { id: '豆漿', num: 'C4', name: '豆漿', en: 'Soy Milk', cat: 'drink', price: 'NT$ 25', desc: '清晨 5 點現磨，熱的、冷的、加蛋的——是台灣人早餐的儀式感。', tags: ['豆漿', '早餐', '飲料', '飲品'], img: '', emoji: '🥛' },
  { id: '木瓜牛奶', num: 'C5', name: '木瓜牛奶', en: 'Papaya Milk', cat: 'drink', price: 'NT$ 70', desc: '熟成木瓜＋鮮奶＋一點點冰，士林夜市排了三十年的招牌。', tags: ['木瓜牛奶', 'papaya milk', '飲料', '飲品', '果汁'], img: 'assets/drinks/木瓜牛奶.png', emoji: '🥭' },
  { id: '檸檬愛玉', num: 'C6', name: '檸檬愛玉', en: 'Aiyu Jelly Lemon', cat: 'drink', price: 'NT$ 40', desc: '山上採的愛玉籽、現榨檸檬汁、一點黑糖——清涼但有個性。', tags: ['檸檬愛玉', '愛玉', '飲料', '飲品', '冰品'], img: '', emoji: '🍋' },
];

/* ---------- 假店家資料（模擬後端；換真 API 只需改這份來源） ---------- */
const RESTAURANTS = [
  { id: 'r01', name: '老王牛肉麵', city: '台北', district: '中正區', category: 'salty', dishes: ['牛肉麵', '滷肉飯'], rating: 4.7, price: '$$', hours: '11:00–21:00', note: '紅燒湯頭熬六小時，半筋半肉。' },
  { id: 'r02', name: '信義紅燒牛肉麵', city: '台北', district: '信義區', category: 'salty', dishes: ['牛肉麵', '貢丸湯'], rating: 4.5, price: '$$', hours: '11:30–20:30', note: '辦公商圈人氣午餐，清燉紅燒都有。' },
  { id: 'r03', name: '永康刀削牛肉麵', city: '台北', district: '大安區', category: 'salty', dishes: ['牛肉麵'], rating: 4.6, price: '$$', hours: '11:00–22:00', note: '手工刀削麵，麵體厚實有嚼勁。' },
  { id: 'r04', name: '阿宗蚵仔煎', city: '台北', district: '萬華區', category: 'salty', dishes: ['蚵仔煎', '大腸蚵仔麵線'], rating: 4.4, price: '$', hours: '12:00–23:00', note: '西門町夜市老攤，肥蚵現煎。' },
  { id: 'r05', name: '士林夜市蚵仔煎', city: '台北', district: '士林區', category: 'salty', dishes: ['蚵仔煎', '雞排', '鹽酥雞'], rating: 4.2, price: '$', hours: '16:00–24:00', note: '排隊名攤，甜辣醬給好給滿。' },
  { id: 'r06', name: '豪大大雞排（士林）', city: '台北', district: '士林區', category: 'salty', dishes: ['雞排', '鹽酥雞'], rating: 4.3, price: '$', hours: '15:00–24:00', note: '巴掌大雞排創始攤。' },
  { id: 'r07', name: '師大鹽酥雞', city: '台北', district: '大安區', category: 'salty', dishes: ['鹽酥雞', '雞排'], rating: 4.5, price: '$', hours: '17:00–01:00', note: '九層塔香氣四溢，深夜限定。' },
  { id: 'r08', name: '刈包の家', city: '台北', district: '中山區', category: 'salty', dishes: ['刈包', '滷肉飯'], rating: 4.6, price: '$', hours: '10:00–19:00', note: '虎咬豬：爌肉、酸菜、花生粉。' },
  { id: 'r09', name: '北投胡椒餅', city: '台北', district: '北投區', category: 'salty', dishes: ['胡椒餅', '蚵仔煎'], rating: 4.4, price: '$', hours: '14:00–20:00', note: '炭爐現烤，咬下噴汁。' },
  { id: 'r10', name: '艋舺滷肉飯', city: '台北', district: '萬華區', category: 'salty', dishes: ['滷肉飯', '貢丸湯', '大腸蚵仔麵線'], rating: 4.7, price: '$', hours: '06:00–14:00', note: '在地人早餐首選，肉燥透亮。' },
  { id: 'r11', name: '彰化肉圓本舖', city: '台中', district: '西區', category: 'salty', dishes: ['肉圓', '碗粿'], rating: 4.5, price: '$', hours: '10:00–18:00', note: 'Q彈外皮包筍丁肉餡。' },
  { id: 'r12', name: '台南棺材板', city: '台南', district: '中西區', category: 'salty', dishes: ['棺材板', '筒仔米糕'], rating: 4.3, price: '$$', hours: '11:00–21:00', note: '炸厚片吐司填海鮮濃湯。' },
  { id: 'r13', name: '板橋大腸包小腸', city: '新北', district: '板橋區', category: 'salty', dishes: ['大腸包小腸', '台式香腸'], rating: 4.2, price: '$', hours: '15:00–23:00', note: '糯米腸夾烤香腸，醬給得豪邁。' },
  { id: 'r14', name: '臭豆腐專門店', city: '台北', district: '大同區', category: 'salty', dishes: ['臭豆腐', '甜不辣'], rating: 4.4, price: '$', hours: '15:00–23:30', note: '外酥內嫩，台式泡菜爽口。' },
  { id: 'r15', name: '永康街芒果冰', city: '台北', district: '大安區', category: 'sweet', dishes: ['芒果冰', '豆花'], rating: 4.8, price: '$$', hours: '11:00–22:00', note: '愛文芒果＋煉乳，夏季排到爆。' },
  { id: 'r16', name: '騎樓豆花伯', city: '台北', district: '中正區', category: 'sweet', dishes: ['豆花', '芋圓-地瓜圓'], rating: 4.6, price: '$', hours: '12:00–23:00', note: '滑嫩豆花，冬薑汁夏冰糖。' },
  { id: 'r17', name: '九份芋圓', city: '新北', district: '瑞芳區', category: 'sweet', dishes: ['芋圓-地瓜圓', '豆花'], rating: 4.7, price: '$', hours: '09:00–19:00', note: '手工芋圓地瓜圓，山城招牌。' },
  { id: 'r18', name: '紅豆車輪餅攤', city: '台北', district: '中山區', category: 'sweet', dishes: ['車輪餅'], rating: 4.3, price: '$', hours: '14:00–21:00', note: '奶油、紅豆、芋頭口味任選。' },
  { id: 'r19', name: '微熱鳳梨酥', city: '台中', district: '西區', category: 'sweet', dishes: ['鳳梨酥'], rating: 4.6, price: '$$', hours: '09:00–20:00', note: '土鳳梨內餡，伴手禮首選。' },
  { id: 'r20', name: '夜市糖葫蘆', city: '台北', district: '士林區', category: 'sweet', dishes: ['糖葫蘆'], rating: 4.1, price: '$', hours: '17:00–24:00', note: '草莓番茄裹亮糖衣，拍照必備。' },
  { id: 'r21', name: '春水堂（創始店）', city: '台中', district: '西區', category: 'drink', dishes: ['珍珠奶茶', '青茶'], rating: 4.8, price: '$$', hours: '08:00–22:00', note: '珍珠奶茶發源地，現搖手作。' },
  { id: 'r22', name: '信義珍奶吧', city: '台北', district: '信義區', category: 'drink', dishes: ['珍珠奶茶', '冬瓜茶'], rating: 4.4, price: '$', hours: '10:00–22:00', note: 'Q彈黑珍珠，微糖少冰最對味。' },
  { id: 'r23', name: '古早味冬瓜茶', city: '台北', district: '大同區', category: 'drink', dishes: ['冬瓜茶', '青茶'], rating: 4.5, price: '$', hours: '09:00–21:00', note: '慢火熬煮，加檸檬解暑。' },
  { id: 'r24', name: '士林木瓜牛奶', city: '台北', district: '士林區', category: 'drink', dishes: ['木瓜牛奶', '珍珠奶茶'], rating: 4.6, price: '$', hours: '16:00–24:00', note: '熟成木瓜＋鮮奶，排三十年。' },
  { id: 'r25', name: '高雄鹽埕豆漿', city: '高雄', district: '鹽埕區', category: 'drink', dishes: ['豆漿', '檸檬愛玉'], rating: 4.3, price: '$', hours: '05:00–11:00', note: '清晨現磨，配燒餅油條。' },
];

/* ---------- 鹹點食材分層（檔名即食材標籤；甜不辣無分層故略過） ---------- */
const INGREDIENTS = {
  '刈包': ['爌肉', '花生粉', '辣椒', '酸菜', '香菜'],
  '台式香腸': ['竹籤', '蒜片', '香腸'],
  '大腸包小腸': ['甜辣醬', '竹韱', '糯米腸', '酸菜', '香腸', '香菜'],
  '大腸蚵仔麵線': ['大腸', '薑絲', '蚵仔', '辣椒', '香菜', '麵線'],
  '棺材板': ['白色濃湯內餡', '金黃土司'],
  '滷肉飯': ['小黃瓜', '滷肉', '白飯', '蔥花', '蛋', '酸黃瓜', '黃色醃蘿蔔片'],
  '烤玉米': ['炭火', '玉米', '竹韱'],
  '牛肉麵': ['牛肉', '蔥花', '蛋', '酸菜', '青江菜'],
  '碗粿': ['碗粿的配料', '蒜蓉醬油膏'],
  '筒仔米糕': ['甜辣醬', '甜辣醬_2'],
  '肉圓': ['甜辣醬', '肉圓內餡'],
  '胡椒餅': ['胡椒餅內餡', '芝麻'],
  '臭豆腐': ['泡菜', '醬汁碟', '香菜'],
  '蚵仔煎': ['蚵仔', '蚵仔煎底', '醬汁', '青菜'],
  '豬血糕': ['竹韱', '花生粉', '香菜'],
  '貢丸湯': ['貢丸', '香菜'],
  '雞排': ['紅辣椒', '黑胡椒'],
  '鹽酥雞': ['九層塔', '辣椒'],
};

/* ---------- 特別動畫：食材飛入聚攏 → 成品浮現（目前只有滷肉飯有完整分層） ----------
 * file：assets/foods/salty/{dish}/{file}.png；tx/ty 為起始散開位移、rot 起始旋轉、d 進場延遲(ms)。
 * 順序＝飛入順序（白飯先當底）。
 */
const ASSEMBLY = {
  '滷肉飯': {
    result: 'assets/foods/salty/滷肉飯/滷肉飯_all.png',
    pieces: [
      { file: '白飯',         tx: '-12%', ty: '-30%', rot: '-8deg',  d: 0 },
      { file: '滷肉',         tx: '38%',  ty: '-34%', rot: '12deg',  d: 130 },
      { file: '黃色醃蘿蔔片', tx: '62%',  ty: '24%',  rot: '20deg',  d: 250 },
      { file: '酸黃瓜',       tx: '-58%', ty: '28%',  rot: '-18deg', d: 360 },
      { file: '小黃瓜',       tx: '-48%', ty: '-36%', rot: '-12deg', d: 470 },
      { file: '蛋',           tx: '52%',  ty: '-8%',  rot: '14deg',  d: 580 },
      { file: '蔥花',         tx: '4%',   ty: '46%',  rot: '8deg',   d: 690 },
    ],
  },
};

/* ---------- 搜尋同義詞：口語也能命中正式菜名／分類 ---------- */
const SYNONYMS = {
  '珍奶': ['珍珠奶茶', '波霸'],
  '奶茶': ['珍珠奶茶'],
  '飲料': ['飲品', '茶', '奶茶', '豆漿'],
  '小吃': ['鹹點', '夜市'],
  '冰沙': ['芒果冰', '冰'],
  '冰': ['芒果冰', '豆花'],
  '剉冰': ['芒果冰'],
  '甜點': ['甜', '豆花', '芒果冰'],
  '麵線': ['大腸蚵仔麵線'],
  '蚵仔': ['蚵仔煎', '大腸蚵仔麵線'],
};

/* ---------- 共用工具 ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// 菜名正規化（去空白／間隔點／連字號）以比對店家 dishes
function normDish(s) { return String(s).replace(/[\s·・∙\-－]/g, ''); }

function findDish(id) {
  return DISHES.find(d => d.id === id) || null;
}

// 反查哪些店家有賣這道菜
function storesForDish(name) {
  const key = normDish(name);
  return RESTAURANTS.filter(r => r.dishes.some(d => {
    const nd = normDish(d);
    return nd === key || nd.includes(key) || key.includes(nd);
  }));
}

// 店家結果卡（搜尋結果與詳情頁「哪裡吃得到」共用）
function renderCard(r) {
  const stars = '★'.repeat(Math.round(r.rating)) + '☆'.repeat(5 - Math.round(r.rating));
  const tags = r.dishes.map(d => `<span class="rcard__tag">${escapeHtml(d)}</span>`).join('');
  return `
    <article class="rcard rcard--${r.category}">
      <div class="rcard__top">
        <h3 class="rcard__name">${escapeHtml(r.name)}</h3>
        <span class="rcard__price">${escapeHtml(r.price)}</span>
      </div>
      <p class="rcard__loc">📍 ${escapeHtml(r.city)} · ${escapeHtml(r.district)}<span class="rcard__cat">${escapeHtml(CAT_LABEL[r.category])}</span></p>
      <div class="rcard__tags">${tags}</div>
      <p class="rcard__note">${escapeHtml(r.note)}</p>
      <div class="rcard__meta">
        <span class="rcard__rating" title="評分 ${r.rating}">${stars} <b>${r.rating.toFixed(1)}</b></span>
        <span class="rcard__hours">🕒 ${escapeHtml(r.hours)}</span>
      </div>
    </article>`;
}

// 首頁菜卡（連結到 dish.html?d=id）
function dishCardHTML(d) {
  const media = d.img
    ? `<div class="dish__photo"><img src="${escapeHtml(d.img)}" alt="${escapeHtml(d.name)}" loading="lazy"/></div>`
    : `<div class="dish__photo dish__photo--emoji"><span aria-hidden="true">${escapeHtml(d.emoji)}</span></div>`;
  return `
    <a class="dish" href="dish.html?d=${encodeURIComponent(d.id)}" data-tags="${escapeHtml(d.tags.join(' '))}" aria-label="${escapeHtml(d.name)}——查看詳情">
      ${media}
      <div class="dish__num">${escapeHtml(d.num)}</div>
      <h3>${escapeHtml(d.name)}</h3>
      <p class="dish__sub">${escapeHtml(d.en)}</p>
      <p class="dish__desc">${escapeHtml(d.desc)}</p>
      <span class="dish__price">${escapeHtml(d.price)}</span>
    </a>`;
}

/* ---------- 美食護照集點（首頁護照／詳情頁／今天吃啥 共用一份 localStorage） ---------- */
const PASSPORT_KEY = 'taifood_passport';
const POINTS_PER = 10;                       // 每蓋一章 +10 點

function todayStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function loadPassport() {
  try { return JSON.parse(localStorage.getItem(PASSPORT_KEY)) || {}; } catch (e) { return {}; }
}
function savePassport(m) {
  try { localStorage.setItem(PASSPORT_KEY, JSON.stringify(m)); } catch (e) { /* 隱私模式：不持久 */ }
  // 廣播：護照頁／詳情頁／今天吃啥 任一處蓋章，其他 UI 同步刷新
  window.dispatchEvent(new CustomEvent('passport:change'));
}
function isEaten(id) { return !!loadPassport()[id]; }
function setEaten(id, on) {
  const m = loadPassport();
  if (on) { if (!m[id]) m[id] = todayStr(); } else { delete m[id]; }
  savePassport(m);
}
function toggleEaten(id) {
  const on = !isEaten(id);
  setEaten(id, on);
  return on;
}
function passportCount() { return Object.keys(loadPassport()).length; }
function passportPoints() { return passportCount() * POINTS_PER; }
