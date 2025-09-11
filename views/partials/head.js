export function Head({ title = 'NOVA App', description = '', keywords = '' } = {}) {
    return `
        <title>${title}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="${description}">
        <meta name="keywords" content="${keywords}">
        <link rel="icon" type="image/png" href="/assets/images/icon.png">
        <link rel="stylesheet" href="/assets/css/styles.css">
    `;
}

export function DynamicHead(props) {
    document.head.innerHTML = Head(props);
}
