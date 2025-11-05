# 自定义通知和对话框系统说明

## 📋 概述

替换了原有的系统级弹窗：
- `alert()` → 自定义通知系统
- `Window.confirm()` → 直接执行操作（移除确认步骤）
- `Window.prompt()` → 自定义选择菜单和输入对话框

---

## ✨ 通知系统特性

### 1. **多种关闭方式**
- ✅ 点击弹窗任意位置关闭
- ✅ 按回车键（Enter）关闭
- ✅ 按ESC键关闭
- ✅ 成功提示自动关闭（1.5秒）

### 2. **通知类型**

| 类型 | 图标 | 说明 | 自动关闭 |
|------|------|------|----------|
| **success** | ✓ | 成功提示（绿色） | 是（1.5秒） |
| **error** | ✕ | 错误提示（红色） | 否（需手动） |
| **warning** | ⚠ | 警告提示（黄色） | 否（需手动） |
| **info** | ℹ | 信息提示（蓝色） | 可选 |

### 3. **视觉效果**
- 大号图标（24pt）
- 清晰的消息文本
- 底部提示："点击任意处或按回车/ESC关闭"
- 居中显示

---

## 🔧 API 函数

### 核心函数

```javascript
showNotification(message, type, autoClose)
```

**参数：**
- `message` (string) - 消息内容，支持多行文本（使用 \n）
- `type` (string) - 类型：`"success"`, `"error"`, `"warning"`, `"info"`
- `autoClose` (number) - 自动关闭时间（毫秒），0 表示不自动关闭

**示例：**
```javascript
showNotification("操作成功！", "success", 1500);
showNotification("发生错误", "error", 0);
```

---

### 快捷函数

#### 1. showSuccess()
```javascript
showSuccess(message, autoClose)
```
- **默认自动关闭**: 1500ms（1.5秒）
- **用途**: 成功操作提示

**示例：**
```javascript
showSuccess("分类已创建");  // 1.5秒后自动关闭
showSuccess("文件已保存", 2000);  // 2秒后自动关闭
```

---

#### 2. showError()
```javascript
showError(message)
```
- **自动关闭**: 否（需手动关闭）
- **用途**: 错误提示

**示例：**
```javascript
showError("文件名不能为空");
showError("保存失败：权限不足");
```

---

#### 3. showWarning()
```javascript
showWarning(message)
```
- **自动关闭**: 否（需手动关闭）
- **用途**: 警告提示

**示例：**
```javascript
showWarning("此操作不可撤销");
showWarning("即将覆盖现有文件");
```

---

#### 4. showInfo()
```javascript
showInfo(message, autoClose)
```
- **默认自动关闭**: 否
- **用途**: 信息提示

**示例：**
```javascript
showInfo("正在加载数据...");
showInfo("提示：可使用快捷键", 3000);
```

---

## 📝 已替换的 alert 调用

### 成功提示 → showSuccess()
- ✅ "分类 '...' 已创建"
- ✅ "分类 '...' 已更新"
- ✅ "分类 '...' 已删除"
- ✅ "表达式 '...' 已创建并保存"
- ✅ "表达式 '...' 已重命名"
- ✅ "表达式 '...' 已保存"
- ✅ "已复制到剪贴板"
- ✅ "示例分类加载完成"

### 错误提示 → showError()
- ✅ "错误：分类名称已存在"
- ✅ "错误：表达式名称已存在"
- ✅ 其他错误提示（保持原有 alert 格式）

---

## 🎨 用户体验改进

### 优化前（原生 alert）
❌ 必须点击"确定"按钮
❌ 窗口较大，遮挡工作区
❌ 无法自动关闭
❌ 样式单调

### 优化后（自定义通知）
✅ 点击任意位置关闭
✅ 按回车/ESC关闭
✅ 成功提示自动关闭
✅ 精美的图标和提示
✅ 窗口紧凑，不遮挡主界面

---

## 💡 使用建议

### 1. 成功操作
使用 `showSuccess()` 并让其自动关闭：
```javascript
// 保存后
showSuccess("已保存");  // 1.5秒后自动关闭

// 创建后
showSuccess("创建成功", 1000);  // 1秒后关闭
```

### 2. 错误提示
使用 `showError()` 让用户确认已读：
```javascript
// 验证失败
showError("名称不能为空");

// 操作失败
showError("保存失败：文件已被占用");
```

### 3. 重要警告
使用 `showWarning()` 让用户注意：
```javascript
// 危险操作前
showWarning("此操作将删除所有数据");
```

### 4. 信息提示
使用 `showInfo()` 提供额外信息：
```javascript
// 加载提示
showInfo("正在加载...", 0);  // 手动关闭

// 功能说明
showInfo("提示：右键显示更多操作", 2000);
```

---

## 🔍 技术细节

### 实现原理
1. 使用 `Window("palette")` 创建浮动窗口
2. 设置 `closeButton: false` 去除标题栏按钮
3. 通过事件监听器捕获点击和键盘事件
4. 使用 `app.scheduleTask()` 实现定时关闭

### 自动关闭机制
```javascript
if (autoClose > 0) {
    $.global.notifyWinToClose = notifyWin;
    var closeTaskStr = "...";
    app.scheduleTask(closeTaskStr, autoClose, false);
}
```

### 键盘事件
```javascript
notifyWin.addEventListener("keydown", function(e) {
    if (e.keyName === "Enter" || e.keyName === "Escape") {
        notifyWin.close();
    }
});
```

---

## 📊 对比表

| 功能 | 原生 alert | 自定义通知 |
|------|-----------|------------|
| 点击任意处关闭 | ❌ | ✅ |
| 回车键关闭 | ✅ | ✅ |
| ESC键关闭 | ❌ | ✅ |
| 自动关闭 | ❌ | ✅ |
| 类型图标 | ❌ | ✅ |
| 自定义时间 | ❌ | ✅ |
| 多行支持 | ✅ | ✅ |

---

## 🐛 注意事项

### 1. 保留原生 alert 的场景
某些系统级错误仍使用 `alert()`：
- 插件初始化错误
- 致命错误（无法继续运行）
- 需要立即中断操作的情况

### 2. Window.confirm 不受影响
确认对话框仍使用 `Window.confirm()`：
```javascript
if (Window.confirm("确定删除吗？", false, "确认")) {
    // 执行删除
}
```

### 3. 兼容性
- ✅ After Effects CC 2015+
- ✅ Windows 和 macOS
- ✅ ExtendScript 引擎

---

## 📈 未来扩展

可以添加的功能：
1. **进度条** - 长时间操作显示进度
2. **操作按钮** - 提供"撤销"等操作
3. **通知队列** - 多个通知依次显示
4. **位置自定���** - 右下角、顶部等
5. **音效提示** - 成功/错误音效
6. **动画效果** - 淡入淡出动画

---

**创建日期**: 2025-11-05
**适用版本**: Expression Plugin 2.1+
**维护人**: Claude Code
