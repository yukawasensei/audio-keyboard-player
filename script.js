// 音频数据存储
let audioFiles = Array.from({ length: 10 }, () => []);
let currentAudioIndex = Array(10).fill(0);
let audioElements = Array(10).fill(null);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 为每个输入框添加事件监听器
    for (let i = 0; i < 10; i++) {
        const input = document.getElementById(`audioInput${i}`);
        input.addEventListener('change', (e) => handleFileSelect(e, i));
    }

    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // 恢复保存的音频文件
    restoreAudioFiles();
});

// 处理文件选择
function handleFileSelect(event, slotIndex) {
        const files = Array.from(event.target.files);
        const currentCount = slot.querySelector('.audio-list').children.length;
        const remainingSlots = 10 - currentCount;

        if (files.length > remainingSlots) {
            alert(`每个按键最多只能添加10个音频文件。当前还可以添加${remainingSlots}个。`);
            return;
        }

    // 处理每个文件
        files.forEach(file => {
            if (!file.type.startsWith('audio/')) {
            alert('请只上传音频文件');
                return;
            }

        const reader = new FileReader();
        reader.onload = function(e) {
            const audioData = e.target.result;
            audioFiles[slotIndex].push({
                name: file.name,
                data: audioData
            });
            updateAudioList(slotIndex);
            saveAudioFiles();
        };
        reader.readAsDataURL(file);
        });

        this.updateSlotState(slot);
        event.target.value = '';
    }

// 更新音频列表显示
function updateAudioList(slotIndex) {
    const audioList = document.getElementById(`audioList${slotIndex}`);
    audioList.innerHTML = '';

    audioFiles[slotIndex].forEach((file, index) => {
        const audioItem = document.createElement('div');
        audioItem.className = 'flex justify-between items-center p-2 bg-gray-50 rounded-md';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-sm text-gray-600 truncate flex-1';
        nameSpan.textContent = file.name;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'ml-2 text-red-500 hover:text-red-700';
        deleteButton.innerHTML = '×';
        deleteButton.onclick = () => {
            audioFiles[slotIndex].splice(index, 1);
            updateAudioList(slotIndex);
            saveAudioFiles();
        };

        audioItem.appendChild(nameSpan);
        audioItem.appendChild(deleteButton);
        audioList.appendChild(audioItem);
    });
}

// 键盘按下事件处理
function handleKeyDown(event) {
        const key = event.key;
        if (!/^[0-9]$/.test(key)) return;

    const slotIndex = parseInt(key);
    if (slotIndex < 0 || slotIndex >= 10) return;

        // 停止当前正在播放的音频
    stopAudio();

        // 播放音频
    playAudio(slotIndex, currentAudioIndex[slotIndex]);
}

// 键盘弹起事件处理
function handleKeyUp(event) {
    // 无需处理
}

        // 播放音频
function playAudio(slotIndex, index) {
    if (index < 0 || index >= audioFiles[slotIndex].length) return;

    const audioData = audioFiles[slotIndex][index].data;
    const audio = new Audio();
    audio.src = audioData;
    audio.play();

    // 更新当前播放索引
    currentAudioIndex[slotIndex] = index;

    // 添加事件监听器
        audio.onended = () => {
        stopAudio();
        };
    }

// 停止音频播放
function stopAudio() {
    // 停止所有音频播放
    audioElements.forEach((element, index) => {
        if (element) {
            element.pause();
            element.currentTime = 0;
            audioElements[index] = null;
        }
    });
}

// 存储音频文件到localStorage
function saveAudioFiles() {
    const audioData = audioFiles.map(files => files.map(file => ({
        name: file.name,
        data: file.data
    })));
    localStorage.setItem('audioKeyboardData', JSON.stringify(audioData));
}

// 从localStorage恢复音频文件
async function restoreAudioFiles() {
    const savedData = localStorage.getItem('audioKeyboardData');
    if (!savedData) return;

    try {
        const audioData = JSON.parse(savedData);
        audioFiles = audioData.map(files => files.map(file => ({
            name: file.name,
            data: file.data
        })));
        audioFiles.forEach((files, index) => {
            updateAudioList(index);
        });
    } catch (error) {
        console.error('Error restoring audio files:', error);
    }
}
