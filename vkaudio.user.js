// ==UserScript==
// @name        vk music downloader
// @description This script adds download links to audios at vk.com. If links did not appear automatically press F9.
// @match       *://vk.com/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @require     https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.min.js
// @grant none
// 17.12.2017
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
                            'top: -1px; ' +
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
                alert('audioGetAsync: some problems');
                //alert(xmlHttp.response);
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
    
        function getRealLink(t) {
            if (~t.indexOf("audio_api_unavailable")) {
                var e = t.split("?extra=")[1].split("#"),
                    o = "" === e[1] ? "" : a(e[1]);
                if (e = a(e[0]), "string" != typeof o || !e)
                    return t;
                o = o ? o.split(String.fromCharCode(9)) : [];
                for (var s, r, n = o.length; n--;) {
                    if (r = o[n].split(String.fromCharCode(11)), s = r.splice(0, 1, e)[0], !l[s])
                        return t;
                    e = l[s].apply(null, r)
                }
                if (e && "http" === e.substr(0, 4))
                    return e
            }
            return t
        }
        function a(t) {
            if (!t || t.length % 4 == 1) return !1;
            for (var e, i, o = 0, a = 0, s = ""; i = t.charAt(a++);) i = r.indexOf(i), ~i && (e = o % 4 ? 64 * e + i : i, o++ % 4) && (s += String.fromCharCode(255 & e >> (-2 * o & 6)));
            return s
        }
        function s(t, e) {
            var i = t.length,
                o = [];
            if (i) {
                var a = i;
                for (e = Math.abs(e); a--;) e = (i * (a + 1) ^ e + a) % i, o[a] = e
            }
            return o
        }
        var r = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=",
            vk_id = -1,
            l = {
                v: function(t) {
                    return t.split("").reverse().join("")
                },
                r: function(t, e) {
                    t = t.split("");
                    for (var i, o = r + r, a = t.length; a--;) i = o.indexOf(t[a]), ~i && (t[a] = o.substr(i - e, 1));
                    return t.join("")
                },
                s: function(t, e) {
                    var i = t.length;
                    if (i) {
                        var o = s(t, e),
                            a = 0;
                        for (t = t.split(""); ++a < i;) t[a] = t.splice(o[i - 1 - a], 1, t[a])[0];
                        t = t.join("")
                    }
                    return t
                },
                i: function (t, e) {
                  return l.s(t, e ^ vk_id)
                },
                x: function(t, e) {
                    var i = [];
                    return e = e.charCodeAt(0), each(t.split(""), function(t, o) {
                        i.push(String.fromCharCode(o.charCodeAt(0) ^ e))
                    }), i.join("")
                }
            }
    
    function add_download_links() {
        $(audio_row_selector).each(function() {
            if ( $( this ).find( ".myAudioDownloadLink" ).length == 0 ) {
                var track_name_raw = $(this).find('.audio_row__inner').find('.audio_row__performer').text() +
                                    ' – ' +
                                    $(this).find('.audio_row__inner').find('.audio_row__title_inner').text();

                var track_name = track_name_raw.replace(/[/\\:*?<>|]/g, '');

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
                    
                    var obf_href = response.split("\"")[1];
                    var href = getRealLink(obf_href);
                        
                    if (~href.indexOf("audio_api_unavailable")) {
                        console.log("something wrong..");
                        console.log(href);
                    }
                    else
                    {
                        console.log("good");
                        console.log(href);
                        audioGetAsync(pressed_link.find('.myProgressBar'), href, pressed_link.attr('title'));
                    }
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
        
        vk_id = $("#l_aud").find("a").attr("href").split("/audios")[1];
        console.log(vk_id);
        
        add_download_links();

        $('body').keydown(function(e){
            if (e.which == 120) { // F9
                add_download_links();
            }
        });
    });
})();
