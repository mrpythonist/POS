# Store Point of Sale
 Desktop Point of Sale app built with electron
 
  **Features:**

- Can be used by multiple PC's on a network with one central database.
- Receipt Printing.
- Search for product by barcode.
- Staff accounts and permissions. 
- Products and Categories.
- Basic Stock Management.
- Open Tabs (Orders).
- Customer Database. 
- Transaction History. 
- Filter Transactions by Till, Cashier or Status. 
- Filter Transactions by Date Range. 


**To Customize/Create your own installer**

- Clone this project.
- Open terminal and navigate into the cloned folder.
- Run "npm install" to install dependencies.
- Run "npm run electron". 

```
POS
├─ README.md
├─ api
│  ├─ categories.js
│  ├─ customers.js
│  ├─ inventory.js
│  ├─ settings.js
│  ├─ transactions.js
│  └─ users.js
├─ assets
│  ├─ css
│  │  ├─ bootstrap.min.css
│  │  ├─ components.css
│  │  ├─ core.css
│  │  ├─ icons.css
│  │  ├─ pages.css
│  │  └─ responsive.css
│  ├─ fonts
│  │  ├─ Material-Design-Iconic-Fontd41d.eot
│  │  ├─ Material-Design-Iconic-Fontf700.eot
│  │  ├─ Material-Design-Iconic-Fontf700.svg
│  │  ├─ Material-Design-Iconic-Fontf700.ttf
│  │  ├─ Material-Design-Iconic-Fontf700.woff
│  │  ├─ Simple-Line-Icons4c82.eot
│  │  ├─ Simple-Line-Icons4c82.svg
│  │  ├─ Simple-Line-Icons4c82.ttf
│  │  ├─ Simple-Line-Icons4c82.woff
│  │  ├─ Simple-Line-Icons4c82.woff2
│  │  ├─ Simple-Line-Iconsd41d.eot
│  │  ├─ fontawesome-webfont5b62.eot
│  │  ├─ fontawesome-webfont5b62.svg
│  │  ├─ fontawesome-webfont5b62.ttf
│  │  ├─ fontawesome-webfont5b62.woff
│  │  ├─ fontawesome-webfont5b62.woff2
│  │  ├─ fontawesome-webfontd41d.eot
│  │  ├─ glyphicons-halflings-regular.eot
│  │  ├─ glyphicons-halflings-regular.svg
│  │  ├─ glyphicons-halflings-regular.ttf
│  │  ├─ glyphicons-halflings-regular.woff
│  │  ├─ glyphicons-halflings-regular.woff2
│  │  ├─ glyphicons-halflings-regulard41d.eot
│  │  ├─ ioniconsaa26.eot
│  │  ├─ ioniconsaa26.svg
│  │  ├─ ioniconsaa26.ttf
│  │  ├─ ioniconsaa26.woff
│  │  ├─ themify9f24.eot
│  │  ├─ themify9f24.svg
│  │  ├─ themify9f24.ttf
│  │  ├─ themify9f24.woff
│  │  ├─ themifyd41d.eot
│  │  ├─ typicons.eot
│  │  ├─ typicons.svg
│  │  ├─ typicons.ttf
│  │  ├─ typicons.woff
│  │  ├─ typiconsd41d.eot
│  │  ├─ weathericons-regular-webfont.eot
│  │  ├─ weathericons-regular-webfont.svg
│  │  ├─ weathericons-regular-webfont.ttf
│  │  ├─ weathericons-regular-webfont.woff
│  │  ├─ weathericons-regular-webfont.woff2
│  │  └─ weathericons-regular-webfontd41d.eot
│  ├─ images
│  │  ├─ default.jpg
│  │  ├─ download.png
│  │  ├─ icon.ico
│  │  ├─ loading.gif
│  │  └─ multiple-arrow.png
│  ├─ js
│  │  ├─ jquery.min.js
│  │  ├─ pos.js
│  │  ├─ print.min.js
│  │  └─ product-filter.js
│  └─ plugins
│     ├─ bootstrap
│     │  ├─ bootstrap.min.css
│     │  └─ bootstrap.min.js
│     ├─ bootstrap-select
│     │  ├─ bootstrap-select.min.css
│     │  ├─ bootstrap-select.min.js
│     │  ├─ select2.min.css
│     │  └─ select2.min.js
│     ├─ chosen
│     │  ├─ LICENSE.md
│     │  ├─ chosen-sprite.png
│     │  ├─ chosen-sprite@2x.png
│     │  ├─ chosen.css
│     │  ├─ chosen.jquery.js
│     │  ├─ chosen.jquery.min.js
│     │  ├─ chosen.min.css
│     │  ├─ chosen.proto.js
│     │  ├─ chosen.proto.min.js
│     │  └─ composer.json
│     ├─ dataTables
│     │  ├─ buttons.html5.min.js
│     │  ├─ buttons.print.min.js
│     │  ├─ dataTables.bootstrap.min.css
│     │  ├─ dataTables.buttons.min.js
│     │  ├─ extensions
│     │  │  ├─ ColVis
│     │  │  │  └─ js
│     │  │  │     └─ dataTables.colVis.js
│     │  │  └─ TableTools
│     │  │     └─ js
│     │  │        └─ dataTables.tableTools.js
│     │  ├─ jquery.dataTables.bootstrap.js
│     │  ├─ jquery.dataTables.min.css
│     │  ├─ jquery.dataTables.min.js
│     │  ├─ pdfmake.min.js
│     │  └─ vfs_fonts.js
│     ├─ daterangepicker
│     │  ├─ daterangepicker.css
│     │  └─ daterangepicker.min.js
│     ├─ images
│     │  ├─ Sorting icons.psd
│     │  ├─ favicon.ico
│     │  ├─ sort_asc.png
│     │  ├─ sort_asc_disabled.png
│     │  ├─ sort_both.png
│     │  ├─ sort_desc.png
│     │  └─ sort_desc_disabled.png
│     ├─ jq-keyboard
│     │  ├─ jqkeyboard-min.js
│     │  └─ jqkeyboard.css
│     ├─ jquery-ui
│     │  ├─ AUTHORS.txt
│     │  ├─ LICENSE.txt
│     │  ├─ images
│     │  │  ├─ ui-icons_444444_256x240.png
│     │  │  ├─ ui-icons_555555_256x240.png
│     │  │  ├─ ui-icons_777620_256x240.png
│     │  │  ├─ ui-icons_777777_256x240.png
│     │  │  ├─ ui-icons_cc0000_256x240.png
│     │  │  └─ ui-icons_ffffff_256x240.png
│     │  ├─ index.html
│     │  ├─ jquery-ui.css
│     │  ├─ jquery-ui.js
│     │  ├─ jquery-ui.min.css
│     │  ├─ jquery-ui.min.js
│     │  ├─ jquery-ui.structure.css
│     │  ├─ jquery-ui.structure.min.css
│     │  ├─ jquery-ui.theme.css
│     │  ├─ jquery-ui.theme.min.css
│     │  ├─ jquery.form.min.js
│     │  └─ package.json
│     └─ onscreen-keyboard
│        ├─ jquery.caret.min.js
│        ├─ jquery.onscreenKeyboard.css
│        └─ jquery.onscreenKeyboard.js
├─ build.js
├─ db
│  ├─ db.js
│  └─ pos.sqlite
├─ index.html
├─ installers
│  └─ setupEvents.js
├─ package-lock.json
├─ package.json
├─ preload.js
├─ public
│  ├─ favicon.ico
│  ├─ index.html
│  ├─ logo_icon.png
│  ├─ manifest.json
│  ├─ robots.txt
│  └─ uploads
│     ├─ icon.ico
│     └─ product_image
│        └─ default.jpg
├─ renderer.js
├─ server.js
├─ start.js
└─ yarn.lock

```
```
POS
├─ README.md
├─ api
│  ├─ categories.js
│  ├─ customers.js
│  ├─ inventory.js
│  ├─ settings.js
│  ├─ transactions.js
│  └─ users.js
├─ assets
│  ├─ css
│  │  ├─ bootstrap.min.css
│  │  ├─ components.css
│  │  ├─ core.css
│  │  ├─ icons.css
│  │  ├─ pages.css
│  │  └─ responsive.css
│  ├─ fonts
│  │  ├─ Material-Design-Iconic-Fontd41d.eot
│  │  ├─ Material-Design-Iconic-Fontf700.eot
│  │  ├─ Material-Design-Iconic-Fontf700.svg
│  │  ├─ Material-Design-Iconic-Fontf700.ttf
│  │  ├─ Material-Design-Iconic-Fontf700.woff
│  │  ├─ Noto_Sans
│  │  │  ├─ NotoSans-Italic-VariableFont_wdth,wght.ttf
│  │  │  ├─ NotoSans-VariableFont_wdth,wght.ttf
│  │  │  ├─ OFL.txt
│  │  │  ├─ README.txt
│  │  │  └─ static
│  │  │     ├─ NotoSans-Black.ttf
│  │  │     ├─ NotoSans-BlackItalic.ttf
│  │  │     ├─ NotoSans-Bold.ttf
│  │  │     ├─ NotoSans-BoldItalic.ttf
│  │  │     ├─ NotoSans-ExtraBold.ttf
│  │  │     ├─ NotoSans-ExtraBoldItalic.ttf
│  │  │     ├─ NotoSans-ExtraLight.ttf
│  │  │     ├─ NotoSans-ExtraLightItalic.ttf
│  │  │     ├─ NotoSans-Italic.ttf
│  │  │     ├─ NotoSans-Light.ttf
│  │  │     ├─ NotoSans-LightItalic.ttf
│  │  │     ├─ NotoSans-Medium.ttf
│  │  │     ├─ NotoSans-MediumItalic.ttf
│  │  │     ├─ NotoSans-Regular.ttf
│  │  │     ├─ NotoSans-SemiBold.ttf
│  │  │     ├─ NotoSans-SemiBoldItalic.ttf
│  │  │     ├─ NotoSans-Thin.ttf
│  │  │     ├─ NotoSans-ThinItalic.ttf
│  │  │     ├─ NotoSans_Condensed-Black.ttf
│  │  │     ├─ NotoSans_Condensed-BlackItalic.ttf
│  │  │     ├─ NotoSans_Condensed-Bold.ttf
│  │  │     ├─ NotoSans_Condensed-BoldItalic.ttf
│  │  │     ├─ NotoSans_Condensed-ExtraBold.ttf
│  │  │     ├─ NotoSans_Condensed-ExtraBoldItalic.ttf
│  │  │     ├─ NotoSans_Condensed-ExtraLight.ttf
│  │  │     ├─ NotoSans_Condensed-ExtraLightItalic.ttf
│  │  │     ├─ NotoSans_Condensed-Italic.ttf
│  │  │     ├─ NotoSans_Condensed-Light.ttf
│  │  │     ├─ NotoSans_Condensed-LightItalic.ttf
│  │  │     ├─ NotoSans_Condensed-Medium.ttf
│  │  │     ├─ NotoSans_Condensed-MediumItalic.ttf
│  │  │     ├─ NotoSans_Condensed-Regular.ttf
│  │  │     ├─ NotoSans_Condensed-SemiBold.ttf
│  │  │     ├─ NotoSans_Condensed-SemiBoldItalic.ttf
│  │  │     ├─ NotoSans_Condensed-Thin.ttf
│  │  │     ├─ NotoSans_Condensed-ThinItalic.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-Black.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-BlackItalic.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-Bold.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-BoldItalic.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-ExtraBold.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-ExtraBoldItalic.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-ExtraLight.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-ExtraLightItalic.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-Italic.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-Light.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-LightItalic.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-Medium.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-MediumItalic.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-Regular.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-SemiBold.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-SemiBoldItalic.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-Thin.ttf
│  │  │     ├─ NotoSans_ExtraCondensed-ThinItalic.ttf
│  │  │     ├─ NotoSans_SemiCondensed-Black.ttf
│  │  │     ├─ NotoSans_SemiCondensed-BlackItalic.ttf
│  │  │     ├─ NotoSans_SemiCondensed-Bold.ttf
│  │  │     ├─ NotoSans_SemiCondensed-BoldItalic.ttf
│  │  │     ├─ NotoSans_SemiCondensed-ExtraBold.ttf
│  │  │     ├─ NotoSans_SemiCondensed-ExtraBoldItalic.ttf
│  │  │     ├─ NotoSans_SemiCondensed-ExtraLight.ttf
│  │  │     ├─ NotoSans_SemiCondensed-ExtraLightItalic.ttf
│  │  │     ├─ NotoSans_SemiCondensed-Italic.ttf
│  │  │     ├─ NotoSans_SemiCondensed-Light.ttf
│  │  │     ├─ NotoSans_SemiCondensed-LightItalic.ttf
│  │  │     ├─ NotoSans_SemiCondensed-Medium.ttf
│  │  │     ├─ NotoSans_SemiCondensed-MediumItalic.ttf
│  │  │     ├─ NotoSans_SemiCondensed-Regular.ttf
│  │  │     ├─ NotoSans_SemiCondensed-SemiBold.ttf
│  │  │     ├─ NotoSans_SemiCondensed-SemiBoldItalic.ttf
│  │  │     ├─ NotoSans_SemiCondensed-Thin.ttf
│  │  │     └─ NotoSans_SemiCondensed-ThinItalic.ttf
│  │  ├─ Simple-Line-Icons4c82.eot
│  │  ├─ Simple-Line-Icons4c82.svg
│  │  ├─ Simple-Line-Icons4c82.ttf
│  │  ├─ Simple-Line-Icons4c82.woff
│  │  ├─ Simple-Line-Icons4c82.woff2
│  │  ├─ Simple-Line-Iconsd41d.eot
│  │  ├─ fontawesome-webfont5b62.eot
│  │  ├─ fontawesome-webfont5b62.svg
│  │  ├─ fontawesome-webfont5b62.ttf
│  │  ├─ fontawesome-webfont5b62.woff
│  │  ├─ fontawesome-webfont5b62.woff2
│  │  ├─ fontawesome-webfontd41d.eot
│  │  ├─ glyphicons-halflings-regular.eot
│  │  ├─ glyphicons-halflings-regular.svg
│  │  ├─ glyphicons-halflings-regular.ttf
│  │  ├─ glyphicons-halflings-regular.woff
│  │  ├─ glyphicons-halflings-regular.woff2
│  │  ├─ glyphicons-halflings-regulard41d.eot
│  │  ├─ ioniconsaa26.eot
│  │  ├─ ioniconsaa26.svg
│  │  ├─ ioniconsaa26.ttf
│  │  ├─ ioniconsaa26.woff
│  │  ├─ themify9f24.eot
│  │  ├─ themify9f24.svg
│  │  ├─ themify9f24.ttf
│  │  ├─ themify9f24.woff
│  │  ├─ themifyd41d.eot
│  │  ├─ typicons.eot
│  │  ├─ typicons.svg
│  │  ├─ typicons.ttf
│  │  ├─ typicons.woff
│  │  ├─ typiconsd41d.eot
│  │  ├─ weathericons-regular-webfont.eot
│  │  ├─ weathericons-regular-webfont.svg
│  │  ├─ weathericons-regular-webfont.ttf
│  │  ├─ weathericons-regular-webfont.woff
│  │  ├─ weathericons-regular-webfont.woff2
│  │  └─ weathericons-regular-webfontd41d.eot
│  ├─ images
│  │  ├─ default.jpg
│  │  ├─ download.png
│  │  ├─ icon.ico
│  │  ├─ loading.gif
│  │  ├─ logo.png
│  │  └─ multiple-arrow.png
│  ├─ js
│  │  ├─ pos.js
│  │  └─ product-filter.js
│  └─ plugins
│     ├─ JsBarcode
│     │  └─ JsBarcode.all.min.js
│     ├─ bootstrap
│     │  ├─ bootstrap.min.css
│     │  └─ bootstrap.min.js
│     ├─ bootstrap-select
│     │  ├─ bootstrap-select.min.css
│     │  ├─ bootstrap-select.min.js
│     │  ├─ select2.min.css
│     │  └─ select2.min.js
│     ├─ chosen
│     │  ├─ LICENSE.md
│     │  ├─ chosen-sprite.png
│     │  ├─ chosen-sprite@2x.png
│     │  ├─ chosen.css
│     │  ├─ chosen.jquery.js
│     │  ├─ chosen.jquery.min.js
│     │  ├─ chosen.min.css
│     │  ├─ chosen.proto.js
│     │  ├─ chosen.proto.min.js
│     │  └─ composer.json
│     ├─ dataTables
│     │  ├─ buttons.html5.min.js
│     │  ├─ buttons.print.min.js
│     │  ├─ dataTables.bootstrap.min.css
│     │  ├─ dataTables.buttons.min.js
│     │  ├─ extensions
│     │  │  ├─ ColVis
│     │  │  │  └─ js
│     │  │  │     └─ dataTables.colVis.js
│     │  │  └─ TableTools
│     │  │     └─ js
│     │  │        └─ dataTables.tableTools.js
│     │  ├─ jquery.dataTables.bootstrap.js
│     │  ├─ jquery.dataTables.min.css
│     │  ├─ jquery.dataTables.min.js
│     │  ├─ pdfmake.min.js
│     │  └─ vfs_fonts.js
│     ├─ daterangepicker
│     │  ├─ daterangepicker.css
│     │  └─ daterangepicker.min.js
│     ├─ html2canvas
│     │  └─ html2canvas.min.js
│     ├─ images
│     │  ├─ Sorting icons.psd
│     │  ├─ favicon.ico
│     │  ├─ sort_asc.png
│     │  ├─ sort_asc_disabled.png
│     │  ├─ sort_both.png
│     │  ├─ sort_desc.png
│     │  └─ sort_desc_disabled.png
│     ├─ jq-keyboard
│     │  ├─ jqkeyboard-min.js
│     │  └─ jqkeyboard.css
│     ├─ jquery
│     │  └─ jquery.min.js
│     ├─ jquery-ui
│     │  ├─ AUTHORS.txt
│     │  ├─ LICENSE.txt
│     │  ├─ images
│     │  │  ├─ ui-icons_444444_256x240.png
│     │  │  ├─ ui-icons_555555_256x240.png
│     │  │  ├─ ui-icons_777620_256x240.png
│     │  │  ├─ ui-icons_777777_256x240.png
│     │  │  ├─ ui-icons_cc0000_256x240.png
│     │  │  └─ ui-icons_ffffff_256x240.png
│     │  ├─ index.html
│     │  ├─ jquery-ui.css
│     │  ├─ jquery-ui.js
│     │  ├─ jquery-ui.min.css
│     │  ├─ jquery-ui.min.js
│     │  ├─ jquery-ui.structure.css
│     │  ├─ jquery-ui.structure.min.css
│     │  ├─ jquery-ui.theme.css
│     │  ├─ jquery-ui.theme.min.css
│     │  ├─ jquery.form.min.js
│     │  └─ package.json
│     ├─ jspdf
│     │  └─ jspdf.umd.min.js
│     ├─ moment
│     │  └─ moment.min.js
│     ├─ onscreen-keyboard
│     │  ├─ jquery.caret.min.js
│     │  ├─ jquery.onscreenKeyboard.css
│     │  └─ jquery.onscreenKeyboard.js
│     ├─ print
│     │  └─ print.min.js
│     └─ sweetalert
│        └─ sweetalert2.all.min.js
├─ build.js
├─ db
│  ├─ db.js
│  └─ pos.sqlite
├─ index.html
├─ installers
│  └─ setupEvents.js
├─ package-lock.json
├─ package.json
├─ preload.js
├─ public
│  ├─ favicon.ico
│  ├─ index.html
│  ├─ logo_icon.png
│  ├─ manifest.json
│  └─ robots.txt
├─ server.js
├─ src
│  └─ renderer.js
├─ start.js
└─ vite.config.js

```