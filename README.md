# Codam's Monitoring System Progress for Intra
This extension replaces the Black Hole box on 42's Intranet with a display of one's current progress towards Codam's monitoring system.

<p align="center">
  <img src="https://raw.githubusercontent.com/FreekBes/codam_intra_monit_system_display/master/images/screenshot.png">
</p>


## Download
For Chromium browsers: download the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/codams-monitoring-system/ibbhfmdmdogpnhbnceifekblmddoniol). If you are using a Mac at Codam, you'll find that any extensions you install will get removed after logging out. I wrote a small script for this, which fixes this issue by forcefully installing the extension to your macOS profile. You can find this script [here](https://github.com/FreekBes/codam_auto_extension_installer).

For Firefox: Mozilla has let me know they do not wish to host an extension for such a small audience on their add-ons page. Thus, GitHub is the exclusive distributor for this extension on Firefox. You can find the latest version on the [Releases page](https://github.com/FreekBes/codam_intra_monit_system_display/releases). Download the XPI file listed in the _assets_ section of the latest version. The extension **should** still automatically update using GitHub releases.


## What the extension shows
On each profile, instead of showing the days until Black Hole consumption, the extension shows the percentage completed towards Codam's monitoring system. Keep in mind that it is currently impossible to get the actual time spent in the building at Codam from a user. This extension shows the progress towards the 24 hour requirement **based on Intra login time**. This means that it could be inaccurate, especially if you haven't been using a Mac in the cluster often.


## How the progress is calculated
The way the data is retrieved works as follows: the logtime from this week is either read from the logtime chart on a profile, or read from a JSON on Intra's servers (which is public, hence no API authorization is required). It is then summed up and compared to the minimum requirement (currently 24 hours). In the comparison, there are multiple outcomes:
- logtime < expected hours (see below): display a sad smiley and the percentage in red
- logtime < required hours but >= expected hours: display a "relaxed" smiley and the percentage in orange
- logtime > required hours: display a happy smiley and the percentage in green

There are also separate easter eggs for the 50- and 80-hour achievements on Intra. For 50 hours, you get an extra happy smiley, and for 80 hours, a surprised one!


## How the expected progress is calculated and what it means when the text is orange
In case the required hours haven't been made yet, the extension calculates the expected hours for today. It assumes the user goes to Codam every day up to and including Sunday, and divides the amount of hours required left over the remaining weekdays. Once those expected hours have been made for a day, the smiley will be relaxed and the text will be orange. If the user would spend the same amount of hours at Codam the next day as the current day, all the way up to and including Sunday, they will make the required hours. You could say that, once the smiley is relaxed, it's safe to go home as long as one goes to Codam every day after, for as long as the time it takes for the smiley to turn into its relaxed state, every day.
