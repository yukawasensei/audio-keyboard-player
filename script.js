class AudioPlayer {
    constructor() {
        this.audioElements = new Map(); // 存储音频元素
        this.currentlyPlaying = null;   // 当前正在播放的音频
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 设置文件输入监听器
        document.querySelectorAll('.audio-input').forEach(input => {
            input.addEventListener('change', (e) => this.handleFileSelect(e));
        });

        // 设置键盘事件监听器
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const slot = event.target.closest('.audio-slot');
        const key = slot.dataset.key;
        const fileName = slot.querySelector('.file-name');

        // 更新文件名显示
        fileName.textContent = file.name;

        // 创建新的音频元素
        const audio = new Audio(URL.createObjectURL(file));
        audio.addEventListener('ended', () => {
            slot.classList.remove('playing');
        });

        // 存储音频元素
        if (this.audioElements.has(key)) {
            URL.revokeObjectURL(this.audioElements.get(key).src);
        }
        this.audioElements.set(key, audio);
    }

    handleKeyPress(event) {
        const key = event.key;
        if (!/^[0-9]$/.test(key)) return;

        const slot = document.querySelector(`.audio-slot[data-key="${key}"]`);
        const audio = this.audioElements.get(key);

        if (!audio) return;

        if (this.currentlyPlaying === audio) {
            // 如果按下的是当前正在播放的音频的按键，则停止播放
            audio.pause();
            audio.currentTime = 0;
            this.currentlyPlaying = null;
            slot.classList.remove('playing');
        } else {
            // 停止当前正在播放的音频（如果有）
            if (this.currentlyPlaying) {
                this.currentlyPlaying.pause();
                this.currentlyPlaying.currentTime = 0;
                document.querySelectorAll('.audio-slot').forEach(s => s.classList.remove('playing'));
            }

            // 播放新的音频
            audio.play()
                .then(() => {
                    this.currentlyPlaying = audio;
                    slot.classList.add('playing');
                })
                .catch(error => {
                    console.error('播放失败:', error);
                });
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});
