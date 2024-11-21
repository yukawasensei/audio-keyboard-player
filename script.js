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
                const slot = e.target.closest('.audio-slot');
                const input = slot.querySelector('.audio-input');
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
        const slot = event.target.closest('.audio-slot');
        const files = Array.from(event.target.files);
        const currentCount = slot.querySelector('.audio-list').children.length;
        const remainingSlots = 10 - currentCount;

        if (files.length > remainingSlots) {
            alert(`每个按键最多只能添加10个音频文件。当前还可以添加${remainingSlots}个。`);
            return;
        }

        files.forEach(file => {
            if (!file.type.startsWith('audio/')) {
                alert(`文件 "${file.name}" 不是音频文件。`);
                return;
            }

            const audioItem = document.createElement('div');
            audioItem.className = 'audio-item flex items-center gap-2 p-2 bg-gray-50 rounded-md group hover:bg-gray-100 transition-colors h-12 w-full mb-2';
            
            const audioName = document.createElement('span');
            audioName.className = 'audio-name flex-1 truncate text-gray-700 text-sm px-2';
            audioName.textContent = file.name;
            
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-audio opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-1 transition-all flex-shrink-0';
            removeButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            `;
            removeButton.title = '删除音频';
            
            const audio = new Audio(URL.createObjectURL(file));
            audioItem.audio = audio;
            
            removeButton.addEventListener('click', () => {
                URL.revokeObjectURL(audio.src);
                audioItem.remove();
                this.updateSlotState(slot);
            });
            
            audioItem.appendChild(audioName);
            audioItem.appendChild(removeButton);
            slot.querySelector('.audio-list').appendChild(audioItem);
        });

        this.updateSlotState(slot);
        event.target.value = '';
    }

    handleKeyPress(event) {
        const key = event.key;
        if (!/^[0-9]$/.test(key)) return;

        const slot = document.querySelector(`.audio-slot[data-key="${key}"]`);
        const audioItems = Array.from(slot.querySelectorAll('.audio-item'));
        
        if (!audioItems || audioItems.length === 0) return;

        // 停止当前正在播放的音频
        this.stopAudio();

        // 随机选择一个音频
        const randomIndex = Math.floor(Math.random() * audioItems.length);
        const selectedItem = audioItems[randomIndex];
        const audio = selectedItem.audio;

        // 移除所有活动状态
        document.querySelectorAll('.audio-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.audio-slot').forEach(s => {
            s.classList.remove('playing');
        });

        // 添加活动状态
        selectedItem.classList.add('active');
        slot.classList.add('playing');

        // 播放音频
        if (audio) {
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

    updateSlotState(slot) {
        const audioList = slot.querySelector('.audio-list');
        const addButton = slot.querySelector('.add-audio');

        if (audioList.children.length >= 10) {
            addButton.disabled = true;
        } else {
            addButton.disabled = false;
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});
