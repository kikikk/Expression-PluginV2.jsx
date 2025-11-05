# Expression Plugin V2 项目规范文档

## 项目概述

这是一个 Adobe After Effects 表达式库管理插件，提供可视化的表达式管理面板，帮助用户快速应用和管理常用的 AE 表达式。

### 基本信息

- **项目名称**: Expression Plugin V2
- **当前版本**: v2.0.0
- **主脚本**: `Expression-Plugin2.jsx`
- **数据文件夹**: `expression-plugin2/`（与脚本同级目录）
- **语言**: ExtendScript (JSX) - Adobe JavaScript 扩展
- **UI框架**: ScriptUI
- **目标平台**: Adobe After Effects 2023 及以上版本

### 核心功能

1. **分类管理** - 创建、重命名、删除表达式分类
2. **表达式管理** - 新建、编辑、保存、删除表达式
3. **智能搜索** - 支持中文拼音首字母模糊匹配
4. **快速应用** - 一键应用表达式到选中属性
5. **搜索历史** - 自动保存最近10次搜索记录
6. **示例数据** - 内置20个分类、60+常用表达式

## 项目结构

```
ScriptUI Panels/
├── Expression-Plugin2.jsx           # 主脚本文件（必需）
└── expression-plugin2/               # 数据文件夹（自动创建）
    ├── category_map.json            # 分类映射文件
    ├── search_history.json          # 搜索历史记录
    ├── enc_01-常用动画/             # 分类文件夹
    │   ├── 抖动%20(Wiggle)%20-%20位置.txt
    │   └── 循环%20(Loop%20Out).txt
    ├── enc_02-弹跳动画/
    ├── enc_03-文本动画/
    └── ... (其他20个分类)
```

### 文件说明

#### 主脚本文件
- **Expression-Plugin2.jsx** - 插件主入口，包含所有UI和逻辑

#### 数据文件
- **category_map.json** - 存储分类名称到文件夹名称的映射
  ```json
  {
    "enc_01-常用动画": "01-常用动画",
    "enc_02-弹跳动画": "02-弹跳动画"
  }
  ```
- **search_history.json** - 最近的搜索历史（最多10条）
  ```json
  ["wiggle", "loop", "弹跳"]
  ```

#### 表达式文件
- 格式：`.txt` 文本文件
- 编码：UTF-8
- 命名：使用URL编码（如 `抖动.txt` → `抖动%20(Wiggle).txt`）
- 内容：纯文本的AE表达式代码

## 代码架构

### 1. 全局对象模式

```javascript
var ExpressionPluginGlobalAccess = {
    initialized: false,
    safeFolderName: null,
    init: function(globalObj) { ... },
    refreshUI: function() { ... },
    initializePlugin: null,
    refreshUILayout: null
};
```

**用途**：
- 避免全局命名空间污染
- 提供插件状态管理
- 支持外部脚本调用

### 2. ExtendScript兼容性补丁

由于ExtendScript基于ECMAScript 3，脚本开头包含必要的polyfills：

```javascript
// Object.keys polyfill
if (!Object.keys) { ... }

// String.prototype.trim polyfill
if (!String.prototype.trim) { ... }

// JSON polyfill
if (typeof JSON === 'undefined') { ... }
```

**关键点**：
- 必须在所有代码之前定义
- 确保在旧版本AE中的兼容性

### 3. UI组件结构

```
Window/Panel (win)
├── topContainer (搜索区)
│   ├── searchLabel (🔍)
│   └── searchEt (搜索输入框)
├── mainGroup (主内容)
│   ├── leftPanel (左侧)
│   │   └── categoryPanel (分类面板)
│   │       ├── categoryList (分类列表)
│   │       └── (右键菜单)
│   └── rightContainerGroup (右侧)
│       ├── expressionListGroup (表达式列表面板)
│       │   ├── expressionList (表达式列表)
│       │   └── (右键菜单)
│       └── detailsPanel (编辑面板)
│           ├── nameGroup
│           │   ├── nameLabel
│           │   └── expressionNameEt
│           ├── contentLabel
│           ├── expressionContentEt
│           └── btnGroup
│               ├── newBtn (新建)
│               ├── applyBtn (应用)
│               ├── copyBtn (复制)
│               ├── saveBtn (保存)
│               └── deleteBtn (删除)
```

### 4. 主要函数列表

#### 数据管理
- `getPluginDataFolder()` - 获取数据文件夹
- `loadCategoryMap()` - 加载分类映射
- `saveCategoryMap()` - 保存分类映射
- `readFileContent(file)` - 读取文件内容
- `writeFileContent(file, content)` - 写入文件内容

#### UI刷新
- `populateCategoryList()` - 填充分类列表
- `populateExpressionList(categoryFolder)` - 填充表达式列表
- `displayExpressionDetails(expressionFile, categoryForExpression)` - 显示表达式详情
- `clearDetailsPanel(makeEditable)` - 清空详情面板
- `refreshUILayout()` - 刷新UI布局

#### 搜索功能
- `performSearch()` - 执行搜索
- `fuzzyMatch(searchTerm, targetText)` - 模糊匹配
- `getStringPinyin(str)` - 获取拼音首字母
- `loadSearchHistory()` - 加载搜索历史
- `saveSearchHistory()` - 保存搜索历史
- `addToSearchHistory(term)` - 添加搜索历史
- `showSearchHistoryMenu()` - 显示搜索历史菜单

#### 编辑操作
- `setEditMode(mode)` - 设置编辑模式
- `handleSaveCategory()` - 保存分类重命名
- `handleSaveExpression()` - 保存表达式
- `handleDeleteCategory()` - 删除分类
- `handleDeleteExpression()` - 删除表达式
- `handleNewCategoryCreation()` - 新建分类
- `handleNewExpressionCreation()` - 新建表达式
- `handleLoadExampleCategories()` - 加载示例分类

#### 自定义UI
- `showNotification(message, type, autoClose)` - 显示通知
- `showSuccess(message, autoClose)` - 成功提示
- `showError(message)` - 错误提示
- `showWarning(message)` - 警告提示
- `showInfo(message, autoClose)` - 信息提示
- `showMenu(title, options, defaultChoice)` - 显示菜单
- `showInputDialog(title, defaultValue, label)` - 输入对话框

#### 工具函数
- `_safeFolderName(displayName)` - 生成安全的文件夹名称
- `getPinyinInitial(ch)` - 获取单个字符的拼音首字母
- `getStringPinyin(str)` - 获取整个字符串的拼音首字母

## 编码规范

### ExtendScript特定规范

#### 1. 变量声明
```javascript
// ✅ 正确：使用 var
var myVariable = "value";
var count = 0;

// ❌ 错误：不支持 let/const
let myVariable = "value";  // ExtendScript不支持
const COUNT = 0;           // ExtendScript不支持
```

#### 2. 函数定义
```javascript
// ✅ 正确：传统函数声明
function myFunction(param) {
    return param;
}

// ❌ 错误：箭头函数
const myFunction = (param) => param;  // 不支持
```

#### 3. 循环语句
```javascript
// ✅ 正确：传统 for 循环
for (var i = 0; i < array.length; i++) {
    var item = array[i];
}

// ❌ 错误：现代数组方法
array.forEach(item => { });  // 不支持
array.map(item => item * 2); // 不支持
```

#### 4. 字符串操作
```javascript
// ✅ 正确：字符串拼接
var message = "Hello, " + name + "!";

// ❌ 错误：模板字符串
var message = `Hello, ${name}!`;  // 不支持
```

#### 5. 对象属性访问
```javascript
// ✅ 正确：检查属性存在
if (obj.hasOwnProperty("key")) { }

// 也可以：typeof 检查
if (typeof obj.key !== "undefined") { }

// ❌ 错误：可选链
var value = obj?.key?.subkey;  // 不支持
```

### 命名规范

#### 1. 变量和函数
```javascript
// 小驼峰命名
var myVariable;
var userName;
function getUserData() { }
function calculateTotalAmount() { }
```

#### 2. 全局对象
```javascript
// 大驼峰命名（PascalCase）
var ExpressionPluginGlobalAccess = { };
var CategoryManager = { };
```

#### 3. 常量
```javascript
// 全大写，下划线分隔
var SCRIPT_NAME = "表达式应用插件 v2.0";
var MAX_SEARCH_HISTORY = 10;
var FOLDER_ENCODING_PREFIX = "enc_";
```

#### 4. UI组件引用
```javascript
// 使用描述性后缀
var searchEt;          // EditText
var categoryList;      // ListBox
var detailsPanel;      // Panel
var saveBtn;           // Button
var mainGroup;         // Group
```

### 代码组织

#### 1. 文件结构
```javascript
// 1. ExtendScript兼容性补丁
if (!Object.keys) { ... }
if (!String.prototype.trim) { ... }
if (typeof JSON === 'undefined') { ... }

// 2. 全局对象定义
var ExpressionPluginGlobalAccess = { ... };

// 3. UI构建函数
function buildUI(win, isPanel) { ... }

// 4. 主功能函数
function ExpressionPlugin(thisObj, globalAccess, uiComponents) {
    // 所有变量声明
    // 工具函数定义
    // 事件处理器
    // 初始化代码
}

// 5. 入口点
(function(thisObj) {
    buildUI(thisObj, thisObj instanceof Panel);
})(this);
```

#### 2. 函数顺序
将相关功能的函数组织在一起：
```javascript
// 文件系统操作
function getPluginDataFolder() { }
function loadCategoryMap() { }
function saveCategoryMap() { }

// UI操作
function populateCategoryList() { }
function populateExpressionList() { }
function displayExpressionDetails() { }

// 搜索功能
function performSearch() { }
function fuzzyMatch() { }
function getStringPinyin() { }

// 事件处理
categoryList.onChange = function() { }
expressionList.onChange = function() { }
searchEt.onChange = function() { }
```

### 错误处理

#### 1. try-catch块
```javascript
// ✅ 正确：包裹可能出错的代码
try {
    var data = JSON.parse(content);
} catch (e) {
    alert("解析错误: " + e.toString());
    return;
}
```

#### 2. 防御性编程
```javascript
// ✅ 检查变量是否定义
if (typeof myVar !== "undefined" && myVar !== null) {
    // 使用 myVar
}

// ✅ 检查文件是否存在
var file = new File(path);
if (file.exists) {
    // 操作文件
}

// ✅ 检查数组长度
if (array.length > 0) {
    // 访问数组
}
```

#### 3. 错误信息
```javascript
// ✅ 提供详细的错误信息
alert("错误：无法保存文件\n" +
      "路径: " + file.fsName + "\n" +
      "原因: " + e.toString());

// ✅ 在开发时使用调试输出
$.writeln("Debug: " + variableName);
```

### UI开发规范

#### 1. 尺寸规范

**窗口尺寸**（Panel模式）：
```javascript
win.minimumSize = [550, 450];
win.maximumSize = [1200, 900];
```

**组件尺寸**：
```javascript
// 搜索相关
searchLabel.preferredSize.width = 20;
searchEt.characters = 30;

// 左侧面板
leftPanel.preferredSize.width = 160;
leftPanel.minimumSize.width = 140;

// 表达式列表
expressionListGroup.preferredSize.height = 200;

// 编辑框
expressionContentEt.preferredSize.height = 80;

// 按钮
newBtn.preferredSize.width = 70;
applyBtn.preferredSize.width = 70;
copyBtn.preferredSize.width = 70;
saveBtn.preferredSize.width = 70;
deleteBtn.preferredSize.width = 70;
```

**间距规范**：
```javascript
// 全局间距
win.spacing = 6;
win.margins = [8, 8, 8, 8];

// 面板间距
panel.margins = [8, 12, 8, 8];  // 左上右下

// 按钮组间距
btnGroup.spacing = 6;
btnGroup.margins = [0, 6, 0, 0];
```

#### 2. 布局原则

```javascript
// 容器设置
group.orientation = "row";  // 或 "column"
group.alignChildren = ["fill", "fill"];
group.alignment = ["fill", "fill"];

// 组件对齐
component.alignment = ["fill", "center"];

// 强制刷新布局
win.layout.layout(true);
```

#### 3. UI组件保存
```javascript
// 创建UI组件对象
var uiComponents = {};

// 保存组件引用
uiComponents.searchEt = searchEt;
uiComponents.categoryList = categoryList;
uiComponents.expressionList = expressionList;
// ... 其他组件

// 传递给主函数
ExpressionPlugin(win, ExpressionPluginGlobalAccess, uiComponents);
```

#### 4. 帮助提示
```javascript
// 为所有交互组件添加helpTip
searchEt.helpTip = "输入关键词搜索表达式\n支持搜索名称、内容\n留空可查看全部";
newBtn.helpTip = "新建分类或表达式";
applyBtn.helpTip = "应用表达式到选中的图层属性";
```

#### 5. 图标使用
```javascript
// 使用emoji增强视觉效果
var searchLabel = topContainer.add("statictext", undefined, "🔍");
var categoryPanel = leftPanel.add("panel", undefined, "📁 分类");
var expressionListGroup = rightContainerGroup.add("panel", undefined, "📝 表达式");
var detailsPanel = rightContainerGroup.add("panel", undefined, "✏ 编辑");

// 按钮图标
var newBtn = btnGroup.add("button", undefined, "➕ 新建");
var applyBtn = btnGroup.add("button", undefined, "▶ 应用");
var copyBtn = btnGroup.add("button", undefined, "📋 复制");
var saveBtn = btnGroup.add("button", undefined, "💾 保存");
var deleteBtn = btnGroup.add("button", undefined, "🗑 删除");
```

### 文件系统规范

#### 1. 路径处理
```javascript
// ✅ 正确：使用相对路径
var scriptFile = new File($.fileName);
var scriptFolder = scriptFile.parent;
var dataFolder = new Folder(scriptFolder.fsName + "/expression-plugin2");

// ❌ 错误：使用绝对路径
var dataFolder = new Folder("D:/AE/expression-plugin2");  // 不可移植
```

#### 2. 文件编码
```javascript
// 所有文件使用UTF-8编码
file.encoding = "UTF-8";
```

#### 3. 文件夹命名
```javascript
// 使用安全的文件夹名称
function _safeFolderName(displayName) {
    var safeName = displayName.replace(/[^\w\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff.-]/g, '_');
    return FOLDER_ENCODING_PREFIX + safeName.toLowerCase();
}

// 示例：
// "01-常用动画" → "enc_01-常用动画"
// "文本效果!" → "enc_文本效果_"
```

#### 4. 文件名编码
```javascript
// 表达式文件名使用URL编码
var fileName = encodeURIComponent(name) + ".txt";

// 解码文件名
var displayName = decodeURIComponent(fileName.substring(0, fileName.lastIndexOf(".txt")));
```

## 功能规范

### 1. 搜索功能

#### 搜索范围
- 表达式名称
- 表达式内容
- 支持中文拼音首字母匹配

#### 搜索实现
```javascript
function fuzzyMatch(searchTerm, targetText) {
    searchTerm = searchTerm.toLowerCase();
    targetText = targetText.toLowerCase();

    // 直接匹配
    if (targetText.indexOf(searchTerm) !== -1) {
        return true;
    }

    // 拼音首字母匹配
    var targetPinyin = getStringPinyin(targetText);
    if (targetPinyin.indexOf(searchTerm) !== -1) {
        return true;
    }

    return false;
}
```

#### 搜索历史
- 最多保存10条
- 右键点击搜索框显示历史
- 自动保存到 `search_history.json`

### 2. 编辑模式

#### 三种编辑模式
```javascript
var EDIT_MODE = {
    CATEGORY: "category",      // 编辑分类
    EXPRESSION: "expression",  // 编辑表达式
    NONE: "none"              // 无编辑
};
```

#### 模式切换
```javascript
function setEditMode(mode) {
    currentEditMode = mode;

    if (mode === EDIT_MODE.CATEGORY) {
        detailsPanel.text = "✏ 编辑分类";
        expressionContentEt.visible = false;
        // 启用保存和删除按钮
    } else if (mode === EDIT_MODE.EXPRESSION) {
        detailsPanel.text = "✏ 编辑表达式";
        expressionContentEt.visible = true;
        // 启用所有按钮
    } else {
        detailsPanel.text = "✏ 编辑";
        // 禁用大部分按钮
    }
}
```

### 3. 自定义通知系统

#### 通知类型
```javascript
showSuccess(message, autoClose);  // 成功（绿色✓）
showError(message);               // 错误（红色✕）
showWarning(message);             // 警告（黄色⚠）
showInfo(message, autoClose);     // 信息（蓝色ℹ）
```

#### 特点
- 自动关闭时间可配置
- 点击任意处或按ESC/Enter关闭
- 替代系统的alert弹窗，体验更好

### 4. 右键菜单

#### 分类列表右键菜单
- 新建分类
- 重命名分类（选中时）
- 删除分类（选中时）
- 加载示例分类（20个）

#### 表达式列表右键菜单
- 新建表达式
- 重命名表达式（选中时）
- 删除表达式（选中时）

#### 搜索框右键菜单
- 显示搜索历史记录
- 选择历史项自动填充

### 5. 快捷操作

#### 键盘快捷键
- **名称框回车** - 保存（分类或表达式）
- **表达式列表双击** - 应用表达式
- **分类列表双击** - 重命名分类

## 数据规范

### 1. 分类映射文件 (category_map.json)

```json
{
  "enc_01-常用动画": "01-常用动画",
  "enc_02-弹跳动画": "02-弹跳动画",
  "enc_03-文本动画": "03-文本动画"
}
```

**字段说明**：
- 键：文件夹名称（带 `enc_` 前缀）
- 值：显示名称（用户看到的名称）

### 2. 搜索历史文件 (search_history.json)

```json
[
  "wiggle",
  "抖动",
  "loop",
  "淡入",
  "文本"
]
```

**规则**：
- 数组格式
- 最多10条
- 最新的在前面
- 去重（相同关键词只保留一次）

### 3. 表达式文件 (.txt)

**文件名格式**：
```
URL编码的名称.txt
```

**示例**：
```
抖动%20(Wiggle)%20-%20位置.txt
循环%20(Loop%20Out).txt
```

**文件内容**：
```javascript
// 纯文本AE表达式代码
wiggle(5, 50);
```

## 测试规范

### 1. 功能测试清单

#### 基本功能
- [ ] 插件加载成功
- [ ] UI显示正常
- [ ] 示例数据自动加载（首次运行）

#### 分类功能
- [ ] 新建分类成功
- [ ] 重命名分类成功
- [ ] 删除分类成功
- [ ] 分类列表排序正确
- [ ] 分类选择切换正常

#### 表达式功能
- [ ] 新建表达式成功
- [ ] 编辑表达式成功
- [ ] 保存表达式成功
- [ ] 删除表达式成功
- [ ] 应用表达式到属性成功
- [ ] 复制表达式到剪贴板成功

#### 搜索功能
- [ ] 关键词搜索正确
- [ ] 拼音首字母搜索正确
- [ ] 搜索结果显示正确
- [ ] 清空搜索恢复列表
- [ ] 搜索历史保存成功
- [ ] 右键显示搜索历史

#### 右键菜单
- [ ] 分类列表右键菜单显示
- [ ] 表达式列表右键菜单显示
- [ ] 搜索框右键菜单显示
- [ ] 菜单项功能正常

#### 快捷操作
- [ ] 名称框回车保存
- [ ] 表达式双击应用
- [ ] 分类双击重命名

### 2. 兼容性测试

#### After Effects版本
- [ ] AE 2023
- [ ] AE 2024
- [ ] AE 2025

#### 操作系统
- [ ] Windows 10/11
- [ ] macOS

#### 运行模式
- [ ] Panel模式（窗口 > 脚本名称）
- [ ] Window模式（文件 > 脚本 > 运行脚本）

### 3. 错误处理测试

- [ ] 数据文件夹不存在时自动创建
- [ ] JSON文件损坏时提示并重置
- [ ] 表达式文件不存在时提示
- [ ] 文件权限不足时提示
- [ ] 重名分类/表达式提示
- [ ] 空名称保存时提示

### 4. 性能测试

- [ ] 加载100+表达式时响应正常
- [ ] 搜索500+表达式时速度可接受
- [ ] UI操作流畅无卡顿
- [ ] 内存占用合理

## 开发工作流

### 1. 开发环境设置

#### 必需工具
- Adobe After Effects（用于测试）
- Visual Studio Code（推荐的代码编辑器）
- Adobe ExtendScript Toolkit（可选，用于调试）

#### VSCode推荐插件
- ExtendScript Debugger
- AE Script Editor

### 2. 调试技巧

#### 使用$.writeln()输出调试信息
```javascript
$.writeln("Debug: 变量值 = " + myVariable);
$.writeln("Debug: " + JSON.stringify(myObject, null, 2));
```

#### 临时alert
```javascript
// 在关键位置添加临时alert
alert("执行到这里了: " + variableName);
```

#### 错误捕获
```javascript
try {
    // 可能出错的代码
} catch(e) {
    alert("错误详情:\n" +
          "消息: " + e.toString() + "\n" +
          "行号: " + e.line);
}
```

### 3. 代码修改流程

1. **备份当前版本**
   ```bash
   cp Expression-Plugin2.jsx Expression-Plugin2.backup.jsx
   ```

2. **修改代码**
   - 使用VSCode或其他编辑器修改
   - 遵循本文档的编码规范

3. **重新加载脚本**
   - 在AE中关闭脚本面板
   - 重新打开脚本面板

4. **测试修改**
   - 测试新功能是否正常
   - 测试旧功能是否受影响

5. **提交代码**
   - 使用git提交更改
   - 编写清晰的commit信息

### 4. 添加新功能

#### 示例：添加新的UI组件

1. **在buildUI函数中创建组件**
```javascript
var myNewButton = btnGroup.add("button", undefined, "新功能");
myNewButton.preferredSize.width = 70;
myNewButton.helpTip = "这是新功能";
```

2. **保存组件引用**
```javascript
uiComponents.myNewButton = myNewButton;
```

3. **在ExpressionPlugin函数中获取引用**
```javascript
var myNewButton = uiComponents.myNewButton;
```

4. **添加事件处理**
```javascript
myNewButton.onClick = function() {
    alert("新功能被点击了！");
};
```

## 性能优化建议

### 1. UI刷新优化

```javascript
// ❌ 频繁刷新
for (var i = 0; i < items.length; i++) {
    list.add("item", items[i]);
    win.layout.layout(true);  // 每次都刷新
}

// ✅ 批量刷新
for (var i = 0; i < items.length; i++) {
    list.add("item", items[i]);
}
win.layout.layout(true);  // 只刷新一次
```

### 2. 文件读取优化

```javascript
// 缓存文件内容（如果需要多次读取）
var fileCache = {};

function readFileWithCache(filePath) {
    if (fileCache[filePath]) {
        return fileCache[filePath];
    }
    var content = readFileContent(new File(filePath));
    fileCache[filePath] = content;
    return content;
}
```

### 3. 搜索优化

```javascript
// 提前退出循环
for (var i = 0; i < files.length; i++) {
    if (foundCount >= maxResults) {
        break;  // 达到最大结果数，提前退出
    }
    // 搜索逻辑
}
```

## 常见问题

### Q: 插件加载后没有显示数据？
A: 首次运行时，插件会自动加载20个示例分类。如果没有显示，检查：
1. 数据文件夹是否创建成功
2. 是否有文件权限问题
3. 查看AE的错误信息

### Q: 搜索功能不工作？
A: 检查：
1. 是否有表达式数据
2. 搜索词是否正确
3. 查看控制台是否有错误信息

### Q: 如何备份表达式库？
A: 复制 `expression-plugin2/` 整个文件夹即可备份所有数据。

### Q: 如何在团队间共享表达式库？
A:
1. 将 `expression-plugin2/` 文件夹打包
2. 其他成员解压到脚本面板目录
3. 确保 `Expression-Plugin2.jsx` 和数据文件夹在同级目录

### Q: 插件支持哪些AE版本？
A: 支持 After Effects CC 2023 及以上版本。

### Q: 如何添加自定义表达式？
A:
1. 在插件中选择或新建分类
2. 点击"新建"按钮
3. 输入表达式名称和代码
4. 点击"保存"按钮

## 版本历史

### v2.0.0 (当前版本)
- ✨ 全新UI设计，使用emoji图标
- ✨ 智能搜索功能（支持拼音首字母）
- ✨ 搜索历史记录
- ✨ 自定义通知系统
- ✨ 右键菜单支持
- ✨ 内置20个分类、60+表达式
- 🐛 修复了多个UI刷新问题
- 🐛 修复了文件编码问题
- 🐛 修复了搜索功能错误

## 贡献指南

### 提交新表达式

1. Fork本项目
2. 创建新的表达式文件
3. 测试表达式可用性
4. 提交Pull Request

### 报告问题

请在GitHub Issues中报告问题，并提供：
- AE版本
- 操作系统
- 错误信息截图
- 复现步骤

### 建议新功能

欢迎在Issues中提出新功能建议。

## 参考资料

- [Adobe After Effects Scripting Guide](https://ae-scripting.docsforadobe.dev/)
- [ScriptUI for Dummies](https://github.com/joshbduncan/ScriptUI-for-Dummies)
- [Adobe ExtendScript Toolkit](https://www.adobe.com/devnet/scripting.html)

---

**最后更新**: 2025-01-15
**维护者**: Expression Plugin Team
