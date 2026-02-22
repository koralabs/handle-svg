const test = require('node:test');
const assert = require('node:assert/strict');

const { getSocialIcon } = require('../lib/utils/getSocialIcon.js');

const check = (social, expectedClass) => {
    const svg = getSocialIcon({ social, scale: 1, x: 1, y: 2, fill: '#fff' });
    assert.equal(svg.includes(expectedClass), true);
};

test('getSocialIcon resolves known provider branches', () => {
    check('https://facebook.com/x', 'bi-facebook');
    check('https://twitter.com/x', 'bi-twitter');
    check('https://discord.gg/x', 'bi-discord');
    check('https://instagram.com/x', 'bi-instagram');
    check('https://tiktok.com/x', 'bi-tiktok');
    check('https://youtube.com/x', 'bi-youtube');
    check('https://twitch.tv/x', 'bi-twitch');
    check('https://linkedin.com/x', 'bi-linkedin');
    check('https://snapchat.com/x', 'bi-snapchat');
    check('https://t.me/x', 'bi-telegram');
    check('https://wa.me/x', 'bi-whatsapp');
    check('https://medium.com/x', 'bi-medium');
    check('https://github.com/x', 'bi-github');
    check('https://reddit.com/x', 'bi-reddit');
    check('https://pin.it/x', 'bi-pinterest');
    check('https://spotify.com/x', 'bi-spotify');
    check('https://soundcloud.com/x', 'bi-soundwave');
    check('https://paypal.me/x', 'bi-paypal');
    check('tel:+15555555555', 'bi-telephone');
    check('mailto:test@example.com', 'bi-envelope');
});

test('getSocialIcon falls back to website icon when no provider matches', () => {
    check('https://example.com', 'bi-globe2');
});
