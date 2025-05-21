class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentTrack = 0;
        this.isPlaying = false;
        this.volume = 0.5;
        
        // 从 localStorage 恢复状态
        this.loadState();
        
        this.initializePlayer();
        this.setupEventListeners();
    }

    loadState() {
        const savedState = localStorage.getItem('musicPlayerState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.currentTrack = state.currentTrack || 0;
            this.isPlaying = state.isPlaying || false;
            this.volume = state.volume || 0.5;
            this.audio.volume = this.volume;
            
            // 设置音频源后恢复播放时间
            this.audio.addEventListener('loadedmetadata', () => {
                if (state.currentTime) {
                    this.audio.currentTime = state.currentTime;
                }
            }, { once: true });
        }
    }

    saveState() {
        const state = {
            currentTrack: this.currentTrack,
            isPlaying: this.isPlaying,
            volume: this.volume,
            currentTime: this.audio.currentTime
        };
        localStorage.setItem('musicPlayerState', JSON.stringify(state));
    }

    initializePlayer() {
        // 创建播放器DOM元素
        const player = document.createElement('div');
        player.className = 'music-player';
        player.innerHTML = `
            <div class="controls">
                <button class="prev-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L4 8L12 14V2Z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="play-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 2L12 8L4 14V2Z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="next-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 2L12 8L4 14V2Z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="playlist-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 4H14V6H2V4ZM2 7H14V9H2V7ZM2 10H14V12H2V10Z" fill="currentColor"/>
                    </svg>
                </button>
            </div>
            <div class="song-info">
                <div class="song-title">No song playing</div>
                <div class="song-artist">-</div>
            </div>
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
            <div class="volume-control">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2.5V13.5M8 2.5L4 6.5H1V9.5H4L8 13.5V2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="volume-slider">
                    <div class="volume-level"></div>
                </div>
            </div>
            <div class="playlist-dropdown">
                <div class="playlist-items"></div>
            </div>
        `;
        document.body.appendChild(player);

        // 保存DOM引用
        this.player = player;
        this.playBtn = player.querySelector('.play-btn');
        this.prevBtn = player.querySelector('.prev-btn');
        this.nextBtn = player.querySelector('.next-btn');
        this.playlistBtn = player.querySelector('.playlist-btn');
        this.playlistDropdown = player.querySelector('.playlist-dropdown');
        this.playlistItems = player.querySelector('.playlist-items');
        this.songTitle = player.querySelector('.song-title');
        this.songArtist = player.querySelector('.song-artist');
        this.progressBar = player.querySelector('.progress-bar');
        this.progress = player.querySelector('.progress');
        this.volumeSlider = player.querySelector('.volume-slider');
        this.volumeLevel = player.querySelector('.volume-level');

        // 设置初始音量
        this.audio.volume = this.volume;
        this.volumeLevel.style.width = `${this.volume * 100}%`;
    }

    setupEventListeners() {
        // 播放/暂停按钮事件
        this.playBtn.addEventListener('click', () => this.togglePlay());

        // 上一首/下一首按钮事件
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());

        // 进度条点击事件
        this.progressBar.addEventListener('click', (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = pos * this.audio.duration;
        });

        // 音量控制事件
        this.volumeSlider.addEventListener('click', (e) => {
            const rect = this.volumeSlider.getBoundingClientRect();
            this.volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            this.audio.volume = this.volume;
            this.volumeLevel.style.width = `${this.volume * 100}%`;
            this.saveState();
        });

        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.playNext());
        this.audio.addEventListener('loadedmetadata', () => {
            this.songTitle.textContent = this.playlist[this.currentTrack].title;
            this.songArtist.textContent = this.playlist[this.currentTrack].artist;
        });

        // 播放列表按钮事件
        this.playlistBtn.addEventListener('click', () => this.togglePlaylist());
        
        // 点击其他地方关闭播放列表
        document.addEventListener('click', (e) => {
            if (!this.player.contains(e.target)) {
                this.playlistDropdown.classList.remove('active');
            }
        });

        // 页面卸载前保存状态
        window.addEventListener('beforeunload', () => this.saveState());
    }

    setPlaylist(playlist) {
        this.playlist = playlist;
        if (playlist.length > 0) {
            this.loadTrack(this.currentTrack);
            // 更新播放列表下拉菜单
            this.updatePlaylistDropdown();
            // 如果之前是播放状态，则继续播放
            if (this.isPlaying) {
                this.audio.play();
                this.playBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2H8V14H6V2ZM10 2H12V14H10V2Z" fill="currentColor"/>
                    </svg>
                `;
            }
        }
    }

    updatePlaylistDropdown() {
        this.playlistItems.innerHTML = '';
        this.playlist.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            if (index === this.currentTrack) {
                item.classList.add('active');
            }
            item.innerHTML = `
                <div class="playlist-item-title">${track.title}</div>
                <div class="playlist-item-artist">${track.artist}</div>
            `;
            item.addEventListener('click', () => {
                this.loadTrack(index);
                if (this.isPlaying) {
                    this.audio.play();
                }
                this.playlistDropdown.classList.remove('active');
            });
            this.playlistItems.appendChild(item);
        });
    }

    togglePlaylist() {
        this.playlistDropdown.classList.toggle('active');
    }

    loadTrack(index) {
        this.currentTrack = index;
        const track = this.playlist[index];
        this.audio.src = track.url;
        this.songTitle.textContent = track.title;
        this.songArtist.textContent = track.artist;
        this.updatePlaylistDropdown();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            this.playBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 2L12 8L4 14V2Z" fill="currentColor"/>
                </svg>
            `;
        } else {
            this.audio.play();
            this.playBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2H8V14H6V2ZM10 2H12V14H10V2Z" fill="currentColor"/>
                </svg>
            `;
        }
        this.isPlaying = !this.isPlaying;
        this.saveState();
    }

    playNext() {
        this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.audio.play();
        }
        this.saveState();
    }

    playPrevious() {
        this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) {
            this.audio.play();
        }
        this.saveState();
    }

    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progress.style.width = `${percent}%`;
    }
}

// 初始化播放器
const player = new MusicPlayer();

// 示例播放列表
const playlist = [
    {
        title: "2:23 AM",
        artist: "しゃろう",
        url: "./assets/music/しゃろう - 2_23 AM.mp3"
    },
    {
        title: "Color Your Night",
        artist: "Atlus Sound Team",
        url: "./assets/music/Atlus Sound Team - Color Your Night.mp3"
    },
    {
        title: "Point the Star 2",
        artist: "G Sounds",
        url: "./assets/music/G Sounds - Point the Star 2.mp3"
    },
    {
        title: "Fly Me to the Moon",
        artist: "Frank Sinatra",
        url: "./assets/music/Frank Sinatra _ Count Basie - Fly Me To The Moon(In Other Words).mp3"
    }
];

player.setPlaylist(playlist); 