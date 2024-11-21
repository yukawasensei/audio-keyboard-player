class AudioPlayer {
    constructor() {
        this.audioSlots = new Map(); // 存储每个按键的音频列表
        this.currentlyPlaying = null; // 当前正在播放的音频
        this.currentIndices = new Map(); // 每个按键当前播放的音频索引
        this.pressTimer = null; // 用于检测长按
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 设置文件输入监听器
        document.querySelectorAll('.audio-input').forEach(input => {
            input.addEventListener('change', (e) => this.handleFileSelect(e));
        });

        // 设置添加按钮监听器
        document.querySelectorAll('.add-audio').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.previousElementSibling;
                input.click();
            });
        });

        // 设置键盘事件监听器
        document.addEventListener('keydown', (e) => {
            if (this.pressTimer === null) {
                this.pressTimer = setTimeout(() => {
                    this.handleLongPress(e.key);
                }, 1000);
                this.handleKeyPress(e);
            }
        });

        document.addEventListener('keyup', () => {
            if (this.pressTimer !== null) {
                clearTimeout(this.pressTimer);
                this.pressTimer = null;
            }
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const slot = event.target.closest('.audio-slot');
        const key = slot.dataset.key;
        const audioList = slot.querySelector('.audio-list');

        // 检查是否已达到最大音频数量
        if (audioList.children.length >= 10) {
            alert('每个按键最多只能添加10个音频文件');
            return;
        }

        // 创建新的音频元素
        const audio = new Audio(URL.createObjectURL(file));
        
        // 创建音频项目元素
        const audioItem = document.createElement('div');
        audioItem.className = 'audio-item';
        audioItem.innerHTML = `
            <span class="audio-name">${file.name}</span>
            <button class="remove-audio" title="删除音频">×</button>
        `;

        // 添加删除按钮事件
        const removeButton = audioItem.querySelector('.remove-audio');
        removeButton.addEventListener('click', () => {
            if (this.currentlyPlaying === audio) {
                this.stopAudio();
            }
            URL.revokeObjectURL(audio.src);
            audioItem.remove();
            
            // 更新音频列表
            const audioItems = this.getSlotAudios(key);
            if (audioItems.length === 0) {
                this.audioSlots.delete(key);
                this.currentIndices.delete(key);
            }

            // 重新启用添加按钮
            const addButton = slot.querySelector('.add-audio');
            addButton.disabled = false;
        });

        // 将音频添加到列表
        audioList.appendChild(audioItem);

        // 更新音频映射
        if (!this.audioSlots.has(key)) {
            this.audioSlots.set(key, []);
            this.currentIndices.set(key, 0);
        }
        this.audioSlots.get(key).push({ audio, element: audioItem });

        // 如果达到最大数量，禁用添加按钮
        if (audioList.children.length >= 10) {
            const addButton = slot.querySelector('.add-audio');
            addButton.disabled = true;
        }

        // 清除文件输入
        event.target.value = '';
    }

    handleKeyPress(event) {
        const key = event.key;
        if (!/^[0-9]$/.test(key)) return;

        const slot = document.querySelector(`.audio-slot[data-key="${key}"]`);
        const audioItems = this.getSlotAudios(key);

        if (!audioItems || audioItems.length === 0) return;

        let currentIndex = this.currentIndices.get(key) || 0;
        const currentAudio = audioItems[currentIndex].audio;
        const currentElement = audioItems[currentIndex].element;

        if (this.currentlyPlaying === currentAudio) {
            // 如果按下的是当前正在播放的音频的按键，切换到下一个音频
            this.stopAudio();
            currentIndex = (currentIndex + 1) % audioItems.length;
            this.currentIndices.set(key, currentIndex);
            this.playAudio(key, currentIndex);
        } else {
            // 停止当前正在播放的音频（如果有）
            this.stopAudio();
            // 播放新的音频
            this.playAudio(key, currentIndex);
        }
    }

    handleLongPress(key) {
        if (!/^[0-9]$/.test(key)) return;
        this.stopAudio();
    }

    getSlotAudios(key) {
        return this.audioSlots.get(key) || [];
    }

    playAudio(key, index) {
        const audioItems = this.getSlotAudios(key);
        if (!audioItems || !audioItems[index]) return;

        const { audio, element } = audioItems[index];
        const slot = document.querySelector(`.audio-slot[data-key="${key}"]`);

        // 移除所有活动状态
        document.querySelectorAll('.audio-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.audio-slot').forEach(s => {
            s.classList.remove('playing');
        });

        // 添加活动状态
        element.classList.add('active');
        slot.classList.add('playing');

        // 播放音频
        audio.currentTime = 0;
        audio.play()
            .then(() => {
                this.currentlyPlaying = audio;
            })
            .catch(error => {
                console.error('播放失败:', error);
                this.stopAudio();
            });

        // 设置结束事件
        audio.onended = () => {
            this.stopAudio();
        };
    }

    stopAudio() {
        if (this.currentlyPlaying) {
            this.currentlyPlaying.pause();
            this.currentlyPlaying.currentTime = 0;
            this.currentlyPlaying = null;
            
            // 移除所有活动状态
            document.querySelectorAll('.audio-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelectorAll('.audio-slot').forEach(slot => {
                slot.classList.remove('playing');
            });
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});
