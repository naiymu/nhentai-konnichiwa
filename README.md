<p align="center">
  <img src="assets/logo.png">
  <br>
  <a href="https://www.codefactor.io/repository/github/naiymu/k-nhentai/overview/main"><img src="https://www.codefactor.io/repository/github/naiymu/k-nhentai/badge/main" alt="CodeFactor" /></a>
</p>
<h1 align="center">K-NHentai</h1>
<p align="center">
  A simple usercript for downloading galleries from NHentai and mirrors
</p>

## Description
Userscript to download galleries from NHentai. It has features to be used with
[konnichiwa](https://github.com/naiymu/konnichiwa). NHentai started using
Cloudflare protection and now you can't reliably download hentai with the
download tab in konnichiwa. To make things easier for yourself if you use
konnichiwa, you could use this userscript.

If you don't use konnichiwa, you can still use this without losing any
functionality.

**Mirror sites can still break because of CloudFlare**

## Install
[Install](https://raw.githubusercontent.com/naiymu/k-nhentai/master/k-nhentai.user.js)

## Features
### Checkboxes at the top left corner of every gallery on any page

On the individual gallery page.

<p align="center">
  <img src="assets/gallery.png">
</p>

On the homepage, search and similar pages.

<p align="center">
  <img src="assets/home.png">
</p>

On the recommendations section.

<p align="center">
  <img src="assets/recommendations.png">
</p>

### Buttons at the bottom-left corner of the page

- **Download button**: Download all selected galleries. The Download button changes state depending on the stage of download.
    If the data is being `fetched`, it looks like this:
    <p align="center">
      <img src="assets/fetching.png">
    </p>
    If the data is being `downloaded`, it looks like this:
    <p align="center">
      <img src="assets/downloading.png">
    </p>

- **Config button**: Change configuration options.

- **Check-all checkbox**: Select all galleries on the page. Since there are
checkboxes on the recommendation ("More like this"), if you check this on a
gallery page, it's recommendations will get selected as well.
    <p align="center">
      <img src="assets/buttons.png">
    </p>

### Configuration options

<p align="center">
  <img src="assets/config.png">
</p>

- **Domain to Use**: Domain to be used for fetching images. There are three
available options:

    - *NET* (from nhentai.net) `default`
    - *COM* (from nhentai.com)

    nhentai.net image download is quite slow. Using nhentai.com makes quite a big
    difference in download time. The tradeoff is the extra `fetching` time. If
    you want the `fetching` time to be shorter and downloads to fail less
    often, use *NET*. If you want faster download speeds and can bear with failed
    downloads and longer fetching times, use *COM*.

    If an image/gallery does not exist on nhentai.com, nhentai.net is used as a
    fallback.

    On mirror sites, if the *NET* option is set, their own image links will be used
    instead of nhentai.net.

- **Download batch size**: Number of downloads to run simultaneously.

    - *Minimum*: 1
    - *Maximum*: 50

    Default is 10. If you make it too high, a lot of downloads will fail.

- **Title format**: The galleries are downloaded in their own separate
directories. This option is for specifying the name of those directories.
There are four available options:

    - *pretty* `default`
    - *english*
    - *japanese*
    - *id*

- **Filename to prepend**: The text that gets added before every filename. If no
value is specified, The default filename is `{page}.{ext}`.

- **Filename separator**: The character to put between given *filename* (if any)
and `{page}`. So, if this value is set to `Underscore` and the filename is
set to `myFileName`, the files will be saved as `myFileName_{page}.{ext}`.
There are three available options:

    - *Space* `default`
    - *Hyphen*
    - *Underscore*

- **Save JSON**: This is mainly for use with konnichiwa. This outputs a file in
the format specified
[here](https://github.com/naiymu/konnichiwa#with-the-refresh_db-script). There
are three available options:

    - *Don't save* `default`
    - *Save as JSON file*
    - *Copy to clipboard*

    *Save as JSON file* will save the content to a file named with the number of
    milliseconds since January 1, 1970. You can then run `refresh_db.php` from
    konnichiwa on this file to add all the downloaded galleries to your database.

- **Include groups in authors**: If the *Save JSON* option is set, the output
has a key `authors`. This decides if the Groups in NHentai will be added to
its value.

- **Button orientation**: The three buttons (download, config and check-all) are
by default aligned vertically. But if you want you can change this. There are
two available options:

    - Vertical `default`
    - Horizontal

- **Clear and stop downloads**: This probably needs a little explanation. The
downloads are stored in the extension storage. Sometimes, if you reload a tab
in between downloads, some files are not removed from the storage and the
script tries to download them everytime a new tab in compatible sites is
opened. You might need to click this if that happens. It's rare though.

## Suggestions
While there are measures to continue downloads even after page
switches/reloads, it is suggested to stay on the same page while a download
is ongoing.

## Supported sites
- nhentai.net
- nhentai.xxx
- nyahentai.red
- nhentai.to
- nhentai.website
