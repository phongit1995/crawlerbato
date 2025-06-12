const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const imageBase64s = [
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBgYgAANgAL6P3B9wAAAABJRU5ErkJggg==', // Ảnh đỏ 1x1
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgI6pX9mAAAAAElFTkSuQmCC', // Ảnh xanh 1x1
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAD/QJ+', // Ảnh vàng 1x1
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBgYgAANgAL6P3B9wAAAABJRU5ErkJggg=='  // Ảnh đỏ 1x1
];

(async () => {
    // Tải tất cả hình ảnh và lấy kích thước
    const images = await Promise.all(imageBase64s.map(async (base64) => {
        const img = await loadImage(base64);
        return { img, width: img.width, height: img.height };
    }));

    // Tính toán kích thước canvas
    // Giả sử các ảnh có kích thước tương tự (lấy ảnh đầu tiên làm tham chiếu)
    // Nếu các ảnh có kích thước khác nhau, có thể lấy max/min hoặc trung bình
    const refImage = images[0];
    const imgWidth = refImage.width;
    const imgHeight = refImage.height;

    // divWidth = 2 * imgWidth (vì width: 50% và 2 ảnh trên 1 hàng)
    // divHeight = 2 * imgHeight (vì flex-wrap tạo 2 hàng)
    const divWidth = imgWidth * 2;
    const divHeight = imgHeight * 2;

    // Tạo canvas với kích thước động
    const canvas = createCanvas(divWidth, divHeight);
    const ctx = canvas.getContext('2d');

    // Thiết lập nền (giả sử nền trắng)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, divWidth, divHeight);

    // Tái hiện flex-direction: row-reverse và flex-wrap: wrap
    const positions = [
        { x: imgWidth, y: 0 },        // Ảnh 1: góc trên phải
        { x: 0, y: 0 },               // Ảnh 2: góc trên trái
        { x: imgWidth, y: imgHeight }, // Ảnh 3: góc dưới phải
        { x: 0, y: imgHeight }         // Ảnh 4: góc dưới trái
    ];

    // Vẽ từng ảnh
    for (let i = 0; i < Math.min(images.length, 4); i++) {
        const { img } = images[i];
        const { x, y } = positions[i];
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
    }

    // Lưu canvas thành file PNG
    const out = fs.createWriteStream('output_div_dynamic.png');
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('Hình ảnh đã được lưu tại output_div_dynamic.png'));
})();