echo on
setlocal
set path=D:\devel\node-v8.10.0-win-x64\;%path%

uglifyjs.cmd laytpl.js --comments -o 1\laytpl.js
uglifyjs.cmd extend.js --comments -o 1\extend.js
uglifyjs.cmd cxdate.js --comments -o 1\cxdate.js
uglifyjs.cmd appcan.xwin.js --comments -o 1\appcan.xwin.js
uglifyjs.cmd appcan.downloader.js --comments -o 1\appcan.downloader.js
