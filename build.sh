#!/bin/bash
if [[ $OSTYPE == 'darwin'* ]]; then
	zip -r chromium.zip manifest.json LICENSE monit.css monit.js images/logo*.png
	zip -r firefox.zip manifest.json LICENSE monit.css monit.js images/logo*.png
else
	tar.exe -a -c -f manifest.json LICENSE monit.css monit.js images/logo*.png
	tar.exe -a -c -f firefox.zip manifest.json LICENSE monit.css monit.js images/logo*.png
fi
