# UI 规范与参数配置

## UI 结构概览

```
┌─────────────────────────────────────────────────────┐
│  窗口 (Window/Panel)                                 │
│  ├─ 搜索面板 (Search Panel)                         │
│  └─ 主内容区 (Main Group)                           │
│      ├─ 左侧面板 (Left Panel)                       │
│      │   └─ 分类面板 (Category Panel)               │
│      └─ 右侧容器 (Right Container)                  │
│          ├─ 表达式列表面板 (Expression List Panel)  │
│          └─ 编辑面板 (Details Panel)                │
└─────────────────────────────────────────────────────┘
```

---

## 窗口主容器参数

### 面板模式 (isPanel = true)

```javascript
win.spacing = 6;
win.orientation = "column";
win.alignChildren = ["fill", "fill"];
win.alignment = ["fill", "fill"];
win.margins = [8, 8, 8, 8];
win.minimumSize = [550, 450];
```

| 参数 | 值 | 说明 |
|------|-----|------|
| spacing | 6 | 子元素间距（像素） |
| orientation | "column" | 垂直布局 |
| margins | [8, 8, 8, 8] | 边距 [left, top, right, bottom] |
| minimumSize | [550, 450] | 最小尺寸 [width, height] |

### 对话框模式 (isPanel = false)

```javascript
win.orientation = "column";
win.alignChildren = ["fill", "fill"];
win.spacing = 4;
win.margins = 12;
win.size = [275, 400];
```

---

## 搜索面板 (Search Panel)

### 容器参数

```javascript
var topContainer = win.add("panel");
topContainer.orientation = "row";
topContainer.alignChildren = ["fill", "center"];
topContainer.alignment = ["fill", "top"];
topContainer.margins = [8, 8, 8, 8];
```

| 组件 | 类型 | 参数 | 说明 |
|------|------|------|------|
| 容器 | panel | margins: [8, 8, 8, 8] | 面板边距 |
| 搜索图标 | statictext | text: "🔍", width: 20 | 图标宽度 |
| 搜索框 | edittext | characters: 25 | 字符数决定宽度 |
| 清除按钮 | button | text: "×", width: 25 | 按钮宽度 |

### 代码示例

```javascript
// 搜索图标
var searchLabel = topContainer.add("statictext", undefined, "🔍");
searchLabel.preferredSize.width = 20;
searchLabel.helpTip = "搜索表达式";

// 搜索输入框
var searchEt = topContainer.add("edittext", undefined, "");
searchEt.helpTip = "输入关键词搜索表达式\n支持搜索名称、内容";
searchEt.alignment = ["fill", "center"];
searchEt.characters = 25;

// 清除按钮
var clearBtn = topContainer.add("button", undefined, "×");
clearBtn.preferredSize.width = 25;
clearBtn.helpTip = "清除搜索";
```

---

## 主内容区 (Main Group)

```javascript
var mainGroup = win.add("group");
mainGroup.orientation = "row";
mainGroup.alignChildren = ["fill", "fill"];
mainGroup.alignment = ["fill", "fill"];
mainGroup.spacing = 6;
mainGroup.margins = [0, 0, 0, 0];
```

| 参数 | 值 | 说明 |
|------|-----|------|
| orientation | "row" | 水平布局 |
| spacing | 6 | 左右面板间距 |
| margins | [0, 0, 0, 0] | 无额外边距 |

---

## 左侧面板 (Left Panel)

### 分类容器

```javascript
var leftPanel = mainGroup.add("group");
leftPanel.orientation = "column";
leftPanel.alignChildren = ["fill", "fill"];
leftPanel.alignment = ["fill", "fill"];
leftPanel.spacing = 6;
leftPanel.preferredSize.width = 160;
leftPanel.minimumSize.width = 140;
```

| 参数 | 值 | 说明 |
|------|-----|------|
| preferredSize.width | 160 | 首选宽度 |
| minimumSize.width | 140 | 最小宽度 |
| spacing | 6 | 子元素间距 |

### 分类面板

```javascript
var categoryPanel = leftPanel.add("panel", undefined, "📁 分类");
categoryPanel.orientation = "column";
categoryPanel.alignChildren = ["fill", "fill"];
categoryPanel.alignment = ["fill", "fill"];
categoryPanel.margins = [8, 12, 8, 8];
```

| 参数 | 值 | 说明 |
|------|-----|------|
| text | "📁 分类" | 面板标题 |
| margins | [8, 12, 8, 8] | [left, top, right, bottom] |

### 分类列表

```javascript
var categoryList = categoryContainer.add("listbox", undefined, [], {
    multiselect: false
});
categoryList.alignment = ["fill", "fill"];
categoryList.preferredSize.height = 120;
```

| 参数 | 值 | 说明 |
|------|-----|------|
| multiselect | false | 单选模式 |
| preferredSize.height | 120 | 首选高度 |

### 分类操作按钮

```javascript
var categoryBtnGroup = categoryContainer.add("group");
categoryBtnGroup.orientation = "row";
categoryBtnGroup.alignment = ["center", "top"];
categoryBtnGroup.spacing = 4;

var addCategoryBtn = categoryBtnGroup.add("button", undefined, "+ 新建");
addCategoryBtn.preferredSize.width = 60;

var renameCategoryBtn = categoryBtnGroup.add("button", undefined, "✏");
renameCategoryBtn.preferredSize.width = 30;
```

| 按钮 | 文本 | 宽度 | 说明 |
|------|------|------|------|
| 新建分类 | "+ 新建" | 60 | 创建新分类 |
| 重命名 | "✏" | 30 | 重命名当前分类 |

---

## 右侧容器 (Right Container)

```javascript
var rightContainerGroup = mainGroup.add("group");
rightContainerGroup.orientation = "column";
rightContainerGroup.alignChildren = ["fill", "fill"];
rightContainerGroup.alignment = ["fill", "fill"];
rightContainerGroup.spacing = 6;
rightContainerGroup.margins = [0, 0, 0, 0];
```

| 参数 | 值 | 说明 |
|------|-----|------|
| orientation | "column" | 垂直布局 |
| spacing | 6 | 上下面板间距 |

---

## 表达式列表面板 (Expression List Panel)

### 面板容器

```javascript
var expressionListGroup = rightContainerGroup.add("panel", undefined, "📝 表达式");
expressionListGroup.orientation = "column";
expressionListGroup.alignChildren = ["fill", "fill"];
expressionListGroup.alignment = ["fill", "fill"];
expressionListGroup.preferredSize.height = 200;
expressionListGroup.margins = [8, 12, 8, 8];
```

| 参数 | 值 | 说明 |
|------|-----|------|
| text | "📝 表达式" | 面板标题（动态更新） |
| preferredSize.height | 200 | 首选高度 |
| margins | [8, 12, 8, 8] | 面板边距 |

### 表达式列表

```javascript
var expressionList = expressionContainer.add("listbox", undefined, [], {
    multiselect: false
});
expressionList.alignment = ["fill", "fill"];
```

| 参数 | 值 | 说明 |
|------|-----|------|
| multiselect | false | 单选模式 |
| alignment | ["fill", "fill"] | 填充父容器 |

### 表达式操作按钮

```javascript
var expressionBtnGroup = expressionContainer.add("group");
expressionBtnGroup.orientation = "row";
expressionBtnGroup.alignment = ["center", "top"];
expressionBtnGroup.spacing = 4;

var addExpressionBtn = expressionBtnGroup.add("button", undefined, "+ 新建表达式");
addExpressionBtn.preferredSize.width = 100;
```

| 按钮 | 文本 | 宽度 | 说明 |
|------|------|------|------|
| 新建表达式 | "+ 新建表达式" | 100 | 创建新表达式 |

---

## 编辑面板 (Details Panel)

### 面板容器

```javascript
var detailsPanel = rightContainerGroup.add("panel", undefined, "✏ 编辑");
detailsPanel.orientation = "column";
detailsPanel.alignChildren = ["fill", "fill"];
detailsPanel.alignment = ["fill", "fill"];
detailsPanel.margins = [8, 12, 8, 8];
```

| 参数 | 值 | 说明 |
|------|-----|------|
| text | "✏ 编辑" | 面板标题 |
| margins | [8, 12, 8, 8] | 面板边距 |

### 名称输入组

```javascript
var nameGroup = detailsPanel.add("group");
nameGroup.orientation = "row";
nameGroup.alignChildren = ["left", "center"];
nameGroup.alignment = ["fill", "top"];
nameGroup.spacing = 6;
nameGroup.margins = [0, 0, 0, 4];

var nameLabel = nameGroup.add("statictext", undefined, "名称:");
nameLabel.preferredSize.width = 35;

var expressionNameEt = nameGroup.add("edittext");
expressionNameEt.alignment = ["fill", "center"];
```

| 组件 | 类型 | 参数 | 说明 |
|------|------|------|------|
| 标签 | statictext | width: 35 | "名称:" 标签 |
| 输入框 | edittext | alignment: ["fill", "center"] | 填充剩余空间 |
| 组间距 | - | spacing: 6 | 标签和输入框间距 |
| 底边距 | - | margins: [0, 0, 0, 4] | 距离内容框的间距 |

### 内容编辑区

```javascript
var contentLabel = detailsPanel.add("statictext", undefined, "内容:");
contentLabel.alignment = ["left", "top"];

var expressionContentEt = detailsPanel.add("edittext", undefined, "", {
    multiline: true,
    scrollable: true
});
expressionContentEt.alignment = ["fill", "fill"];
expressionContentEt.preferredSize.height = 80;
```

| 参数 | 值 | 说明 |
|------|-----|------|
| multiline | true | 多行文本 |
| scrollable | true | 可滚动 |
| preferredSize.height | 80 | 首选高度 |
| alignment | ["fill", "fill"] | 填充父容器 |

### 操作按钮组

```javascript
var btnGroup = detailsPanel.add("group");
btnGroup.orientation = "row";
btnGroup.alignment = ["fill", "top"];
btnGroup.spacing = 6;
btnGroup.margins = [0, 6, 0, 0];

var applyBtn = btnGroup.add("button", undefined, "▶ 应用");
applyBtn.preferredSize.width = 70;

var copyBtn = btnGroup.add("button", undefined, "📋 复制");
copyBtn.preferredSize.width = 70;

var saveBtn = btnGroup.add("button", undefined, "💾 保存");
saveBtn.preferredSize.width = 70;

var deleteBtn = btnGroup.add("button", undefined, "🗑 删除");
deleteBtn.preferredSize.width = 70;
```

| 按钮 | 文本 | 宽度 | HelpTip |
|------|------|------|---------|
| 应用 | "▶ 应用" | 70 | "将表达式应用到选中的图层属性" |
| 复制 | "📋 复制" | 70 | "复制表达式内容到剪贴板" |
| 保存 | "💾 保存" | 70 | "保存表达式修改" |
| 删除 | "🗑 删除" | 70 | "删除当前表达式" |

**按钮组参数：**
| 参数 | 值 | 说明 |
|------|-----|------|
| spacing | 6 | 按钮间距 |
| margins | [0, 6, 0, 0] | 顶部间距6px |

---

## 间距和边距规范

### 全局间距标准

```javascript
// 窗口级别
win.spacing = 6;           // 主要区域间距
win.margins = [8, 8, 8, 8]; // 窗口边距

// 主容器级别
mainGroup.spacing = 6;      // 左右面板间距

// 面板级别
panel.margins = [8, 12, 8, 8]; // 面板内边距 [left, top, right, bottom]

// 组级别
group.spacing = 4-6;        // 组内元素间距

// 按钮级别
buttonGroup.spacing = 4-6;  // 按钮间距
```

### 间距层级

| 层级 | 间距值 | 使用场景 |
|------|--------|----------|
| 窗口边距 | 8px | win.margins |
| 主区域间距 | 6px | 顶级容器spacing |
| 面板边距 | 8-12px | 面板内margins |
| 组内间距 | 4-6px | 按钮、控件spacing |

---

## 尺寸规范汇总

### 宽度参数

| 组件 | 宽度 | 说明 |
|------|------|------|
| 窗口最小宽度 | 550 | minimumSize[0] |
| 左侧面板宽度 | 160 (min: 140) | preferredSize.width |
| 搜索图标 | 20 | preferredSize.width |
| 清除按钮 | 25 | preferredSize.width |
| 名称标签 | 35 | preferredSize.width |
| 新建分类按钮 | 60 | preferredSize.width |
| 重命名按钮 | 30 | preferredSize.width |
| 新建表达式按钮 | 100 | preferredSize.width |
| 操作按钮 | 70 | preferredSize.width (×4) |

### 高度参数

| 组件 | 高度 | 说明 |
|------|------|------|
| 窗口最小高度 | 450 | minimumSize[1] |
| 分类列表 | 120 | preferredSize.height |
| 表达式列表面板 | 200 | preferredSize.height |
| 内容编辑框 | 80 | preferredSize.height |

---

## 文本和图标规范

### 面板标题

| 面板 | 标题文本 | 图标 |
|------|----------|------|
| 搜索面板 | (无标题) | - |
| 分类面板 | "📁 分类" | 📁 |
| 表达式列表面板 | "📝 表达式" / "📝 {分类名}" | 📝 |
| 编辑面板 | "✏ 编辑" | ✏ |

### 按钮文本

| 功能 | 文本 | 图标 | 宽度 |
|------|------|------|------|
| 搜索图标 | "🔍" | 🔍 | 20 |
| 清除搜索 | "×" | × | 25 |
| 新建分类 | "+ 新建" | - | 60 |
| 重命名分类 | "✏" | ✏ | 30 |
| 新建表达式 | "+ 新建表达式" | - | 100 |
| 应用表达式 | "▶ 应用" | ▶ | 70 |
| 复制内容 | "📋 复制" | 📋 | 70 |
| 保存修改 | "💾 保存" | 💾 | 70 |
| 删除表达式 | "🗑 删除" | 🗑 | 70 |

### HelpTip规范

```javascript
// 搜索区域
searchEt.helpTip = "输入关键词搜索表达式\n支持搜索名称、内容";
clearBtn.helpTip = "清除搜索";

// 分类操作
addCategoryBtn.helpTip = "创建新分类";
renameCategoryBtn.helpTip = "重命名分类";

// 表达式操作
addExpressionBtn.helpTip = "创建新表达式";

// 编辑操作
expressionNameEt.helpTip = "表达式名称";
expressionContentEt.helpTip = "表达式代码内容";
applyBtn.helpTip = "将表达式应用到选中的图层属性";
copyBtn.helpTip = "复制表达式内容到剪贴板";
saveBtn.helpTip = "保存表达式修改";
deleteBtn.helpTip = "删除当前表达式";
```

---

## 对齐方式规范

### 常用对齐组合

```javascript
// 填充父容器（常用于面板和列表）
alignment: ["fill", "fill"]
alignChildren: ["fill", "fill"]

// 填充宽度，顶部对齐（常用于横向组）
alignment: ["fill", "top"]
alignChildren: ["fill", "center"]

// 水平居中（常用于按钮组）
alignment: ["center", "top"]

// 左对齐（常用于标签）
alignment: ["left", "center"]
```

### 组件对齐表

| 组件类型 | alignment | alignChildren | 说明 |
|----------|-----------|---------------|------|
| 主窗口 | ["fill", "fill"] | ["fill", "fill"] | 完全填充 |
| 搜索面板 | ["fill", "top"] | ["fill", "center"] | 填充宽度，内容居中 |
| 主内容区 | ["fill", "fill"] | ["fill", "fill"] | 完全填充 |
| 左侧面板 | ["fill", "fill"] | ["fill", "fill"] | 完全填充 |
| 右侧容器 | ["fill", "fill"] | ["fill", "fill"] | 完全填充 |
| 按钮组 | ["center", "top"] | - | 水平居中 |
| 列表 | ["fill", "fill"] | - | 完全填充 |

---

## 快速修改指南

### 调整窗口尺寸

```javascript
// 修改最小尺寸
win.minimumSize = [宽度, 高度];  // 当前: [550, 450]

// 修改对话框模式尺寸
win.size = [宽度, 高度];  // 当前: [275, 400]
```

### 调整左侧面板宽度

```javascript
leftPanel.preferredSize.width = 宽度;  // 当前: 160
leftPanel.minimumSize.width = 宽度;    // 当前: 140
```

### 调整列表高度

```javascript
// 分类列表
categoryList.preferredSize.height = 高度;  // 当前: 120

// 表达式列表面板
expressionListGroup.preferredSize.height = 高度;  // 当前: 200

// 内容编辑框
expressionContentEt.preferredSize.height = 高度;  // 当前: 80
```

### 调整间距

```javascript
// 全局间距
win.spacing = 值;              // 当前: 6
win.margins = [l,t,r,b];       // 当前: [8,8,8,8]

// 主容器间距
mainGroup.spacing = 值;         // 当前: 6

// 面板内边距
panel.margins = [l,t,r,b];      // 当前: [8,12,8,8]

// 按钮间距
btnGroup.spacing = 值;          // 当前: 6
```

### 调整按钮宽度

```javascript
// 单个按钮
button.preferredSize.width = 宽度;

// 当前宽度配置
addCategoryBtn: 60
renameCategoryBtn: 30
addExpressionBtn: 100
applyBtn/copyBtn/saveBtn/deleteBtn: 70
```

### 修改文本和图标

```javascript
// 面板标题
panel.text = "图标 文字";

// 当前配置
"📁 分类"
"📝 表达式"
"✏ 编辑"

// 按钮文本
button.text = "图标 文字";

// 当前配置
"🔍"  (搜索图标)
"×"   (清除)
"+ 新建"
"✏"   (重命名)
"+ 新建表达式"
"▶ 应用"
"📋 复制"
"💾 保存"
"🗑 删除"
```

---

## 完整示例代码

### 创建搜索面板

```javascript
var topContainer = win.add("panel");
topContainer.orientation = "row";
topContainer.alignChildren = ["fill", "center"];
topContainer.alignment = ["fill", "top"];
topContainer.margins = [8, 8, 8, 8];

var searchLabel = topContainer.add("statictext", undefined, "🔍");
searchLabel.preferredSize.width = 20;
searchLabel.helpTip = "搜索表达式";

var searchEt = topContainer.add("edittext", undefined, "");
searchEt.helpTip = "输入关键词搜索表达式\n支持搜索名称、内容";
searchEt.alignment = ["fill", "center"];
searchEt.characters = 25;

var clearBtn = topContainer.add("button", undefined, "×");
clearBtn.preferredSize.width = 25;
clearBtn.helpTip = "清除搜索";
```

### 创建分类面板

```javascript
var leftPanel = mainGroup.add("group");
leftPanel.orientation = "column";
leftPanel.alignChildren = ["fill", "fill"];
leftPanel.alignment = ["fill", "fill"];
leftPanel.spacing = 6;
leftPanel.preferredSize.width = 160;
leftPanel.minimumSize.width = 140;

var categoryPanel = leftPanel.add("panel", undefined, "📁 分类");
categoryPanel.orientation = "column";
categoryPanel.alignChildren = ["fill", "fill"];
categoryPanel.alignment = ["fill", "fill"];
categoryPanel.margins = [8, 12, 8, 8];

var categoryContainer = categoryPanel.add("group");
categoryContainer.orientation = "column";
categoryContainer.alignChildren = ["fill", "fill"];
categoryContainer.alignment = ["fill", "fill"];
categoryContainer.spacing = 6;

var categoryList = categoryContainer.add("listbox", undefined, [], {
    multiselect: false
});
categoryList.alignment = ["fill", "fill"];
categoryList.preferredSize.height = 120;

var categoryBtnGroup = categoryContainer.add("group");
categoryBtnGroup.orientation = "row";
categoryBtnGroup.alignment = ["center", "top"];
categoryBtnGroup.spacing = 4;

var addCategoryBtn = categoryBtnGroup.add("button", undefined, "+ 新建");
addCategoryBtn.preferredSize.width = 60;
addCategoryBtn.helpTip = "创建新分类";

var renameCategoryBtn = categoryBtnGroup.add("button", undefined, "✏");
renameCategoryBtn.preferredSize.width = 30;
renameCategoryBtn.helpTip = "重命名分类";
```

### 创建操作按钮组

```javascript
var btnGroup = detailsPanel.add("group");
btnGroup.orientation = "row";
btnGroup.alignment = ["fill", "top"];
btnGroup.spacing = 6;
btnGroup.margins = [0, 6, 0, 0];

var applyBtn = btnGroup.add("button", undefined, "▶ 应用");
applyBtn.preferredSize.width = 70;
applyBtn.helpTip = "将表达式应用到选中的图层属性";

var copyBtn = btnGroup.add("button", undefined, "📋 复制");
copyBtn.preferredSize.width = 70;
copyBtn.helpTip = "复制表达式内容到剪贴板";

var saveBtn = btnGroup.add("button", undefined, "💾 保存");
saveBtn.preferredSize.width = 70;
saveBtn.helpTip = "保存表达式修改";

var deleteBtn = btnGroup.add("button", undefined, "🗑 删除");
deleteBtn.preferredSize.width = 70;
deleteBtn.helpTip = "删除当前表达式";
```

---

## 颜色和样式

> **注意**: ScriptUI 的颜色和样式支持有限，大部分样式由系统主题控制。

### 可自定义的属性

```javascript
// 文本颜色（有限支持）
statictext.graphics.foregroundColor = statictext.graphics.newPen(
    statictext.graphics.PenType.SOLID_COLOR,
    [1, 0, 0, 1], // RGBA
    1
);

// 背景颜色（有限支持）
group.graphics.backgroundColor = group.graphics.newBrush(
    group.graphics.BrushType.SOLID_COLOR,
    [0.2, 0.2, 0.2, 1] // RGBA
);

// 字体（有限支持）
statictext.graphics.font = ScriptUI.newFont("宋体", "Bold", 12);
```

---

## 修改历史

| 日期 | 版本 | 修改内容 |
|------|------|----------|
| 2025-11-05 | v2.1 | UI全面优化，添加图标，独立按钮 |
| 2025-11-05 | v2.0 | 初始版本 |

---

**最后更新**: 2025-11-05
**适用版本**: Expression Plugin 2.1+
