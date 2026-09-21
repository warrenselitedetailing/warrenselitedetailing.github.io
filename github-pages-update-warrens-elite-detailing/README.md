# Warren's Elite Detailing Website

Static website for Warren's Elite Detailing, ready to publish with GitHub Pages.

## Files

- `index.html` - website content, booking section, and quote form
- `payment.html` - $20 Cash App booking deposit page
- `styles.css` - black and Carolina blue visual design
- `script.js` - quote form and payment setup behavior
- `assets/warrens-elite-logo.png` - local logo image

## Booking Setup

The booking buttons point to:

`https://calendar.app.google/R5X62DQGGWWicwbE6`

The deposit page is set up for a $20 Cash App booking deposit:

`https://cash.app/$WarrensDetailing/20`

## Quote Form Setup

The site is configured for Formspree so your email address is not visible in the public website code.

1. Go to https://formspree.io and create a free account using the email address where you want quote requests delivered.
2. Create a new form.
3. Copy the form endpoint, which looks like `https://formspree.io/f/abcxyz`.
4. Open `index.html`.
5. Replace `https://formspree.io/f/YOUR_FORM_ID` with your Formspree endpoint.
6. Publish the folder to GitHub Pages.

Do not use a plain `mailto:` link or a form action containing your email address if you want the email to stay private.

## GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder.
3. In the repository settings, enable Pages from the main branch.
4. Open the published GitHub Pages URL and submit one test quote request.
