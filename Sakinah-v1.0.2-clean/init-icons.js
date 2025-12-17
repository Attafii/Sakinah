// init-icons.js - Initialize Lucide icons after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
