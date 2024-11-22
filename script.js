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
    if (files.length === 0) return;

    // 检查是否超过限制
    if (audioFiles[slotIndex].length + files.length > 10) {
        alert('每个按键最多只能添加10个音频文件');
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

    // 清空input，允许重复选择相同文件
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

    // 修正映射关系：1-9对应0-8，0对应9
    let slotIndex = key === '0' ? 9 : parseInt(key) - 1;
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
    // 先停止当前正在播放的音频
    stopAudio();

    if (audioFiles[slotIndex].length === 0) return;

    // 随机选择一个音频文件
    const randomIndex = Math.floor(Math.random() * audioFiles[slotIndex].length);
    const audioData = audioFiles[slotIndex][randomIndex].data;
    
    const audio = new Audio(audioData);
    // 保存当前播放的音频元素
    audioElements[slotIndex] = audio;
    
    // 移除所有卡片的高亮效果
    document.querySelectorAll('[id^="card"]').forEach(card => {
        card.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
    });
    
    // 移除所有音频项的高亮效果
    document.querySelectorAll('[id^="audioList"] > div').forEach(item => {
        item.classList.remove('bg-blue-100');
    });
    
    // 高亮当前卡片
    const card = document.getElementById(`card${slotIndex}`);
    card.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
    
    // 高亮当前播放的音频项
    const audioItems = document.querySelectorAll(`#audioList${slotIndex} > div`);
    audioItems[randomIndex].classList.add('bg-blue-100');
    
    audio.play();
    
    // 播放结束时清理高亮和引用
    audio.onended = () => {
        audioElements[slotIndex] = null;
        card.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
        audioItems[randomIndex].classList.remove('bg-blue-100');
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
            
            // 移除对应卡片的高亮效果
            const card = document.getElementById(`card${index}`);
            card.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
            
            // 移除对应音频项的高亮效果
            document.querySelectorAll(`#audioList${index} > div`).forEach(item => {
                item.classList.remove('bg-blue-100');
            });
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
function restoreAudioFiles() {
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
