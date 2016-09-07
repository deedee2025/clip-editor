Below you will find instructions about how run this app. Note: For this app you need had install [Node.js](https://nodejs.org/en/) 4.4.7 or higher (LTS).

This application was made using `react-create-app` and `webpack`.

##Getting starter

1) Make sure that `react-create-app` did install, if not, just run `npm install -g create-react-app`.
2) Download this repository in a folder that you prefer.
3) Open a command line and go to the repository folder referred to above and run `npm i`.
4) In the same folder run `npm start`.
5) Use and try it!

##What's included?
This app includes all mandatory and optional features and somethings more.

####Mandatory Features
1) An HTML5 video player that utilizes media fragments 

2) A list of clips to be played in the video player 

3) The first item in the list should be the full video 

4) An interface to add new clips to the list by specifying a name , start time , and end time *(See note #2)* 

5) The ability to delete clips from the list ( excluding the full video item ) 

6) The ability to edit existing clips in the list 

7) The ability to play clips in the video player 

####Optional Features
1) The ability to automatically jump to the next clip after it finishes, with a 3 second waiting
period and appropriate loading animation. 

2) The ability to ‘save’ clips for persistent use. 

3) The ability to add arbitrary ‘tags’ to clips so that they can be filtered by the tag name. *(See note #3)* 

4) Hotkeys to jump between the current clip and next and previous clips (if there are any). *(See note #4)* 

5) Markers on the video player timeline that denote where a clip starts (full video only). 
Clicking the marker chooses that clip and plays it from that point. 

6) The ability to reuse the the player and playlist on another page without the editing
capabilities *(See note #6)* 

####Bonus Features
1) Backward and forward controls 

2) Video time line with drag controls 

3) Full design application 

4) Fullscreen control 

5) Sweet-alert popups integrated 

##Notes
1) Everything was tested in Google Chrome, Firefox, Safari, IE 11 and Edge, on Windows and OSX.

2) You can set the clip start and end position with the text input and with the drag controls.

3) You can write in the tag control and press `Enter` to add it to the clip; also you can use `backspace` or click in the close icon to delete the tag.

4) Hotkeys: `alt + up` (`ctrl + up` on OSX) for prev clip. `alt + down` (`ctrl + down` on OSX) for next clip.

5) All data are being saved on `LocalStorage` when any change is detect.

6) You can toggle the edit options just clicking on the first bottom in toolbar at top of the application, or just change manually the `editableOptions` property in the state of `src\layout\App.js` component.

For any question, you can ask me directly if you want to my Skype or by Email.

Thanks! :) &#10004;