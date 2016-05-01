(function ($) {
    $.fn.mPlayer = function (options) {
        var settings = $.extend({
            videoUrl: ''
        }, options);

        var $player = $(this);
        var $playerVideo = null;
        var $playerControls = $player.find('.player-controls');
        var $playerControlPlay = $playerControls.find('.player-control-play');
        var $playerControlPause = $playerControls.find('.player-control-pause');
        var $playerControlMute = $playerControls.find('.player-control-volume-mute');
        var $playerControlUnmute = $playerControls.find('.player-control-volume-unmute');
        var $playerSeekSlider = $playerControls.find('.player-control-seek-slider');
        var $playerSeekSliderPosition = $playerControls.find('.player-control-seek-position');
        var $playerSeekThumbnail = $playerControls.find('.player-control-seek-thumbnail');
        var $playerControlFullscreen = $playerControls.find('.player-control-fullscreen');

        function createYoutubePlayer() {
            $playerVideo = $('<iframe id="player" class="player-video" src="http://www.youtube.com/embed/' + matches[6] + '?enablejsapi=1&amp;autoplay=1&amp;rel=0&amp;controls=0&amp;showinfo=0&amp;disablekb=1&amp;modestbranding=0&amp;iv_load_policy=3" frameborder="0"></iframe>').prependTo($player);

            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";

            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = function () {
                var player = new YT.Player('player', {
                    events: {
                        'onStateChange': function (e) {
                            if (e.data == YT.PlayerState.PLAYING) {
                                $playerControlPlay.hide();
                                $playerControlPause.show();
                            } else if (e.data == YT.PlayerState.PAUSED) {
                                $playerControlPause.hide();
                                $playerControlPlay.show();
                            }
                        }
                    }
                });

                $playerVideo.play = function () {
                    player.playVideo();
                };

                $playerVideo.pause = function () {
                    player.pauseVideo()
                };

                $playerVideo.mute = function () {
                    player.mute();

                    $playerControlMute.hide();
                    $playerControlUnmute.show();
                };

                $playerVideo.unmute = function () {
                    player.unMute();

                    $playerControlUnmute.hide();
                    $playerControlMute.show();
                };
            };
        }

        function createPlayer() {
            $playerVideo = $('<video class="player-video" src="' + settings.videoUrl + '"></video>').prependTo($player);

            $playerVideo[0].addEventListener("play", function () {
                $playerControlPlay.hide();
                $playerControlPause.show();
            });

            $playerVideo[0].addEventListener("pause", function () {
                $playerControlPause.hide();
                $playerControlPlay.show();
            });

            $playerVideo[0].addEventListener("volumechange", function (e) {
                var muted = e.target.volume == 0;

                if (muted == true) {
                    $playerControlMute.hide();
                    $playerControlUnmute.show();
                } else {
                    $playerControlUnmute.hide();
                    $playerControlMute.show();
                }
            });

            $playerVideo[0].addEventListener("timeupdate", function (e) {
                var duration = $playerVideo[0].duration;
                var currentTime = $playerVideo[0].currentTime;
                var currentPercentage = 100 / (duration / currentTime);

                $playerSeekSliderPosition.css('width', currentPercentage + '%');
            });
        }

        var matches = settings.videoUrl.match(/(http(s)?:\/\/)?(www\.)?youtu(\.)?be(.+)?v=(.+)/i);
        if (matches != null) {
            createYoutubePlayer();
        } else {
            createPlayer();
        }

        var controlHideTimeout = null;
        $player.on('mousemove touchmove', function (e) {
            e.preventDefault();

            $playerControls.fadeIn('fast');
            $player.css('cursor', '');

            if (controlHideTimeout != null) {
                clearTimeout(controlHideTimeout);
            }

            controlHideTimeout = setTimeout(function () {
                $playerControls.fadeOut('fast', function () {
                    $playerVideo.focus();

                    $player.css('cursor', 'none');
                });
            }, 2000);
        });

        $playerControls.on('mousemove touchmove', function (e) {
            e.preventDefault();

            if (controlHideTimeout != null) {
                clearTimeout(controlHideTimeout);
            }
        });

        $playerControlPlay.click(function (e) {
            e.preventDefault();
            $playerVideo.play();
        });

        $playerControlPause.click(function (e) {
            e.preventDefault();
            $playerVideo.pause();
        });

        $playerControlMute.click(function (e) {
            e.preventDefault();
            $playerVideo.mute();
        });

        $playerControlUnmute.click(function (e) {
            e.preventDefault();
            $playerVideo.unmute();
        });

        $playerSeekSlider.mousedown(function () {
            var thumbnailPosition = 0;
            var absThumbnailPosition = 0;
            var pauseState = $playerVideo[0].paused;
            $playerVideo[0].pause();

            function playerSeekSliderMove(e) {
                e.preventDefault();

                thumbnailPosition = e.pageX - $playerSeekSlider.offset().left;
                absThumbnailPosition = e.pageX;
                if (thumbnailPosition < 0) {
                    thumbnailPosition = 0;
                    absThumbnailPosition = thumbnailPosition + $playerSeekSlider.offset().left;
                } else if (thumbnailPosition > $playerSeekSlider.outerWidth()) {
                    thumbnailPosition = $playerSeekSlider.outerWidth();
                    absThumbnailPosition = thumbnailPosition + $playerSeekSlider.offset().left;
                }

                $playerSeekThumbnail.css('left', absThumbnailPosition);

                var totalThumbnails = $playerVideo[0].duration;
                var requestedThumbnail = Math.floor(totalThumbnails / ($playerSeekSlider.outerWidth() / thumbnailPosition));
                var requestedThumbnailFile = Math.floor(requestedThumbnail / 80);
                var requestedThumbnailRow = Math.floor((requestedThumbnail - (requestedThumbnailFile * 80)) / 8);
                var requestedThumbnailColumn = requestedThumbnail - (requestedThumbnailRow * 8) - (requestedThumbnailFile * 80);
                var stripUrl = '/images/strips/' + requestedThumbnailFile + '.jpg';

                if ($playerSeekThumbnail.css('background-image') != 'url(\'' + stripUrl + '\')') {
                    $playerSeekThumbnail.css('background-image', 'url(\'' + stripUrl + '\')');
                }

                $playerSeekThumbnail.css('background-position', -(requestedThumbnailColumn * 125) + 'px' + ' ' + -(requestedThumbnailRow * 70) + 'px');
            }

            $playerControls.on('mousemove touchmove', playerSeekSliderMove).one('mouseup', function (e) {
                e.preventDefault();

                $playerControls.off('mousemove touchmove', playerSeekSliderMove);

                $playerVideo[0].currentTime = $playerVideo[0].duration / ($playerSeekSlider.outerWidth() / thumbnailPosition);

                if (pauseState == false) {
                    $playerVideo[0].play();
                    pauseState = false;
                }
            });
        });

        $playerControlFullscreen.click(function (e) {
            e.preventDefault();

            if (document.fullscreenElement || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
            else {
                if ($player[0].requestFullScreen) {
                    $player[0].requestFullScreen();
                } else if ($player[0].webkitRequestFullScreen) {
                    $player[0].webkitRequestFullScreen();
                } else if ($player[0].mozRequestFullScreen) {
                    $player[0].mozRequestFullScreen();
                } else if ($player[0].msRequestFullscreen) {
                    $player[0].msRequestFullscreen();
                }
            }
        });
    }
}(jQuery));