# vk.com audio downloader

This script adds download links to audios at vk.com.
If links do not appear automatically press F9.

### Info

Original script here: http://7c5.ru/files/vk-music-downloader-2.0.0.js

This one is modified for one-click download and also sets song name as default filename in "Save As" dialog.

Tested in **Firefox 49** with **Greasemonkey 3.9**.

### Some privacy

One may download "jquery.min.js" and "FileSaver.js" and include this locally.

For example:

replace
```
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @require     https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.min.js
```
by
```
// @require     file:///<path to>/jquery.min.js
// @require     file:///<path to>/FileSaver.min.js
```
