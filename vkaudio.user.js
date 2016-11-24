// ==UserScript==
// @name        vk music downloader
// @description This script adds download links to audios at vk.com. If links did not appear automatically press F9.
// @match       *://vk.com/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @require     https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.min.js
// @grant none
// 09.11.2016
// ==/UserScript==
// allow pasting

(function() {
    var audio_row_selector = '.audio_row';
    var linkStyle = 'position: absolute; right: -8px; top: 9px; ' +
                    'color: white; z-index: 100; background: red; ' +
                    'border-radius: 3px 3px 3px 3px; ' +
                    'font-size: 16px; ' +
                    'opacity: 0.3; ';
    
    var progressFrameStyle = 'border: 1px solid black; ' +
                             'padding: 8px; ' +
                             'border-radius: 3px 3px 3px 3px; ';

    var progressBarStyle = 'position: absolute; ' +
                           'top: 0px; ' +
                           'left: 0px; ' +
                           'background-color: green; ' +
                           'width: 0%; ' +
                           'height: 100%; ' +
                           'border-radius: 3px 3px 3px 3px;';
    
    var progressTextStyle = 'position: absolute; ' +
                            'top: 2px; ' +
                            'left: 0px; ' +
                            'width: 100%; ' +
                            'height: 100%; ' +
                            'z-index: 10; ' +
                            'text-align: center; ';
    
    function audioGetAsync(progressBar, theUrl, audioName)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var blob = new Blob([xmlHttp.response], {type: "application/octet-stream"});
                saveAs(blob, audioName);
            }
            else if (xmlHttp.readyState == 4 && xmlHttp.status != 200) {
                alert('Some problems');
                alert(xmlHttp.response);
            }
        }
        xmlHttp.onprogress=function (progress) {
           if (progress.lengthComputable) {  
             var percentComplete = (progress.loaded / progress.total)*100;
             progressBar.css({'width': percentComplete + '%'});
           }
        }
        xmlHttp.responseType = 'arraybuffer';
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }
    
    function add_download_links() {
        $(audio_row_selector).each(function() {
            var track_name_raw = $(this).find('.audio_title_wrap').find('.audio_performer').text() +
                                 ' – ' +
                                 $(this).find('.audio_title_wrap').find('.audio_title_inner').text();
            
            var track_name = track_name_raw.replace(/[/\\:*?<>|]/g, '');

            if ( $( this ).find( ".myAudioDownloadLink" ).length == 0 ) {
                $(this).append('<a class="myAudioDownloadLink" ' + 
                           '   title="' + track_name + '.mp3" ' + 
                           '   target="_blank" ' +
                           '>' +
                           '  <div class="myProgressFrame">' +
                           '    <div class="myProgressText"> &#9835; </div>' +
                           '    <div class="myProgressBar"></div>' +
                           '  </div>' +
                           '</a>'
                );
            }
        });

        $('.myAudioDownloadLink').click(function(e) {
            e.stopPropagation();

            var pressed_link = $(this);
            
            var audio_id_raw = $(this).parents(audio_row_selector).data('audio');
            var audio_id = audio_id_raw[1] + '_' + audio_id_raw[0];

            $.ajax({
                url: 'https://vk.com/al_audio.php',
                method: 'post',
                data: {
                    act: 'reload_audio',
                    al: 1,
                    ids: audio_id
                },
                success: function(response) {
                    pressed_link
                        .css({'opacity': '0.5', 'background': 'white'});
                    pressed_link.attr('ready', '1');
                    var matches = response.match(/(https:\\\/\\\/.+\.mp3)/);
                    if (!matches) {
                        console.log('Link not found at server\'s response: ' + response);
                        alert('Link not found at server\'s response: ' + response);
                        return;
                    }
                    
                    var href = matches[0];
                    audioGetAsync(pressed_link.find('.myProgressBar'), href, pressed_link.attr('title'));
                    
                },
                error: function (ajaxContext) {
                    alert(ajaxContext.responseText)
                }
            });
        });
    }

    $(document).ready(function() {
        $('body').append('<style> div.myProgressBar {' + progressBarStyle + '} </style>');
        $('body').append('<style> div.myProgressFrame {' + progressFrameStyle + '} </style>');
        $('body').append('<style> div.myProgressText {' + progressTextStyle + '} </style>');
        $('body').append('<style> a.myAudioDownloadLink {' + linkStyle + '} </style>');
        
        add_download_links();

        $('body').keydown(function(e){
            if (e.which == 120) { // F9
                add_download_links();
            }
        });
    });
})();
