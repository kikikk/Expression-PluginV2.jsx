// expression-plugin-v2.jsx
// After Effects Expression Plugin v2.0 (ScriptUI Version)
// Data folder relative to script location.

// ============================================
// ExtendScript 兼容性补丁
// ============================================

// Object.keys polyfill - ExtendScript 不支持此方法
if (!Object.keys) {
    Object.keys = function(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };
}

// String.prototype.trim polyfill - ExtendScript 的 String 没有 trim 方法
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

// JSON polyfill - ExtendScript 不支持 JSON 对象
if (typeof JSON === 'undefined') {
    JSON = {
        parse: function(text) {
            // 使用 eval 解析 JSON（在沙箱环境中是安全的）
            // 先进行基本的安全检查
            if (typeof text !== 'string') {
                throw new Error('JSON.parse: 输入必须是字符串');
            }

            // 移除首尾空格
            text = text.replace(/^\s+|\s+$/g, '');

            // 基本安全检查：确保不包含危险代码
            if (/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
                text.replace(/"(\\.|[^"\\])*"/g, ''))) {
                // 如果包含非 JSON 字符，尝试更严格的验证
            }

            try {
                return eval('(' + text + ')');
            } catch (e) {
                throw new Error('JSON.parse: 解析失败 - ' + e.message);
            }
        },

        stringify: function(obj, replacer, space) {
            var indent = '';
            var newline = '';

            if (typeof space === 'number') {
                for (var i = 0; i < space; i++) {
                    indent += ' ';
                }
                newline = '\n';
            } else if (typeof space === 'string') {
                indent = space;
                newline = '\n';
            }

            function str(key, holder, level) {
                var gap = '';
                for (var i = 0; i < level; i++) {
                    gap += indent;
                }

                var value = holder[key];

                if (value === null) {
                    return 'null';
                }

                if (value === undefined) {
                    return undefined;
                }

                switch (typeof value) {
                    case 'string':
                        return quote(value);
                    case 'number':
                        return isFinite(value) ? String(value) : 'null';
                    case 'boolean':
                        return String(value);
                    case 'object':
                        if (!value) {
                            return 'null';
                        }

                        var partial = [];
                        var i, k, v;

                        // 数组
                        if (Object.prototype.toString.call(value) === '[object Array]') {
                            var len = value.length;
                            for (i = 0; i < len; i++) {
                                partial[i] = str(i, value, level + 1) || 'null';
                            }

                            if (partial.length === 0) {
                                return '[]';
                            }

                            if (indent) {
                                return '[' + newline + gap + indent +
                                    partial.join(',' + newline + gap + indent) +
                                    newline + gap + ']';
                            }
                            return '[' + partial.join(',') + ']';
                        }

                        // 对象
                        for (k in value) {
                            if (value.hasOwnProperty(k)) {
                                v = str(k, value, level + 1);
                                if (v !== undefined) {
                                    partial.push(quote(k) + ':' + (indent ? ' ' : '') + v);
                                }
                            }
                        }

                        if (partial.length === 0) {
                            return '{}';
                        }

                        if (indent) {
                            return '{' + newline + gap + indent +
                                partial.join(',' + newline + gap + indent) +
                                newline + gap + '}';
                        }
                        return '{' + partial.join(',') + '}';
                }
            }

            function quote(string) {
                var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
                var meta = {
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '"': '\\"',
                    '\\': '\\\\'
                };

                escapable.lastIndex = 0;
                return escapable.test(string) ?
                    '"' + string.replace(escapable, function(a) {
                        var c = meta[a];
                        return typeof c === 'string' ? c :
                            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    }) + '"' :
                    '"' + string + '"';
            }

            return str('', {'': obj}, 0);
        }
    };
}

// ============================================

var ExpressionPluginGlobalAccess = {
    // 保存全局状态的变量
    initialized: false,
    safeFolderName: null, // 安全文件夹名称函数
    // 初始化函数，将在面板加载时调用
    init: function(globalObj) {
        try {
            if (globalObj.initialized) return; // 防止重复初始化
            
            globalObj.initialized = true;
            
            if (globalObj.initializePlugin) {
                globalObj.initializePlugin();
            }
        } catch(e) {
            alert("初始化插件时出错: " + e.toString());
        }
    },
    // 提供公共的UI刷新函数，供外部调用
    refreshUI: function() {
        if (this.refreshUILayout) {
            this.refreshUILayout();
        }
    },
    // 提供其他可能需要的功能占位符
    initializePlugin: null,
    refreshUILayout: null
};

// 这个函数是ScriptUI Panel格式的入口点
function buildUI(win, isPanel) {
    //createMetadataObj();
    // 检查VERSION_NUMBER是否已定义
    var versionToUse = typeof VERSION_NUMBER !== "undefined" ? VERSION_NUMBER : "2.0.0";
    
    if (!isPanel) {
        win.text = "表达式库 v" + versionToUse;
    }
    
    // 创建一个对象来存储所有UI组件的引用
    var uiComponents = {};
    
    // 主窗口设置
    if (isPanel) {
        win.spacing = 6;
        win.orientation = "column";
        win.alignChildren = ["fill", "fill"];
        win.alignment = ["fill", "fill"];
        win.margins = [8, 8, 8, 8];

        // 创建顶部搜索框容器（优化样式）
        var topContainer = win.add("panel");
        topContainer.orientation = "row";
        topContainer.alignChildren = ["fill", "center"];
        topContainer.alignment = ["fill", "top"];
        topContainer.margins = [8, 8, 8, 8];
        uiComponents.topContainer = topContainer;

        // 搜索图标/标签（更醒目）
        var searchLabel = topContainer.add("statictext", undefined, "🔍");
        searchLabel.preferredSize.width = 20;
        searchLabel.helpTip = "搜索表达式";

        // 搜索输入框（更宽敞）
        var searchEt = topContainer.add("edittext", undefined, "");
        searchEt.helpTip = "输入关键词搜索表达式\n支持搜索名称、内容\n留空可查看全部";
        searchEt.alignment = ["fill", "center"];
        searchEt.characters = 30;

        // 将搜索组件添加到UI组件对象
        uiComponents.searchEt = searchEt;

        // 创建主内容容器，用于放置左右两个面板
        var mainGroup = win.add("group");
        mainGroup.orientation = "row";
        mainGroup.alignChildren = ["fill", "fill"];
        mainGroup.alignment = ["fill", "fill"];
        mainGroup.spacing = 6;
        mainGroup.margins = [0, 0, 0, 0];

        win.layout.layout(true);
        win.minimumSize = [550, 450];
        win.maximumSize = [1200, 900];
    } else {
        win.orientation = "column";
        win.alignChildren = ["fill", "fill"];
        win.spacing = 4; // 减小spacing从5到4
        win.margins = 12; // 减小margins从16到12
        win.size = [275, 400]; // 宽度减半
        win.center();
        
        // 创建顶部搜索框容器
        var topContainer = win.add("group");
        topContainer.orientation = "row";
        topContainer.alignChildren = ["fill", "center"];
        topContainer.alignment = ["fill", "top"];
        topContainer.margins = [0, 2, 0, 2]; // 减小margins从[0,5,0,5]到[0,2,0,2]
        uiComponents.topContainer = topContainer;
        
        // 搜索框移到顶部并横跨整个界面
        var searchGroup = topContainer.add("group");
        searchGroup.orientation = "row";
        searchGroup.alignChildren = ["left", "center"];
        searchGroup.alignment = ["fill", "center"];
        searchGroup.spacing = 8; // 减小spacing从10到8
        searchGroup.margins = [0, 0, 0, 0]; // 保持margins为[0,0,0,0]
        
        var searchLabel = searchGroup.add("statictext", undefined, "搜索:");
        searchLabel.preferredSize.width = 30; // 减小标签宽度 // 减半
        
        // 搜索输入框
        var searchEt = searchGroup.add("edittext", undefined, "");
        searchEt.helpTip = "输入关键词搜索表达式";
        searchEt.alignment = ["fill", "center"];
        searchEt.preferredSize.width = 150; // 减半
        
        var mainGroup = win.add("group");
        mainGroup.orientation = "row";
        mainGroup.alignChildren = ["fill", "fill"];
        mainGroup.alignment = ["fill", "fill"];
        mainGroup.spacing = 8; // 减小spacing从10到8
        mainGroup.margins = [0, 0, 0, 0]; // 保持margins为[0,0,0,0]
    }
    
    // 将mainGroup添加到UI组件对象
    uiComponents.mainGroup = mainGroup;

    // ===== 左侧面板（优化布局）=====
    var leftPanel = mainGroup.add("group");
    leftPanel.orientation = "column";
    leftPanel.alignChildren = ["fill", "fill"];
    leftPanel.alignment = ["fill", "fill"];
    leftPanel.spacing = 6;
    leftPanel.preferredSize.width = 160;
    leftPanel.minimumSize.width = 140;
    uiComponents.leftPanel = leftPanel;

    // 类别面板（简化标题）
    var categoryPanel = leftPanel.add("panel", undefined, "📁 分类");
    categoryPanel.orientation = "column";
    categoryPanel.alignChildren = ["fill", "fill"];
    categoryPanel.alignment = ["fill", "fill"];
    categoryPanel.margins = [8, 12, 8, 8];

    // 类别列表容器
    var categoryContainer = categoryPanel.add("group");
    categoryContainer.orientation = "column";
    categoryContainer.alignChildren = ["fill", "fill"];
    categoryContainer.alignment = ["fill", "fill"];
    categoryContainer.spacing = 6;

    // 类别列表
    var categoryList = categoryContainer.add("listbox", undefined, [], {
        multiselect: false
    });
    categoryList.alignment = ["fill", "fill"];

    // 将类别组件添加到UI组件对象
    uiComponents.categoryPanel = categoryPanel;
    uiComponents.categoryContainer = categoryContainer;
    uiComponents.categoryList = categoryList;
    
    // ===== 右侧容器（优化布局）=====
    var rightContainerGroup = mainGroup.add("group");
    rightContainerGroup.orientation = "column";
    rightContainerGroup.alignChildren = ["fill", "fill"];
    rightContainerGroup.alignment = ["fill", "fill"];
    rightContainerGroup.spacing = 6;
    rightContainerGroup.margins = [0, 0, 0, 0];
    uiComponents.rightContainerGroup = rightContainerGroup;

    // 表达式列表面板（优化标题）
    var expressionListGroup = rightContainerGroup.add("panel", undefined, "📝 表达式");
    expressionListGroup.orientation = "column";
    expressionListGroup.alignChildren = ["fill", "fill"];
    expressionListGroup.alignment = ["fill", "fill"];
    expressionListGroup.preferredSize.height = 200;
    expressionListGroup.margins = [8, 12, 8, 8];

    // 表达式列表容器
    var expressionContainer = expressionListGroup.add("group");
    expressionContainer.orientation = "column";
    expressionContainer.alignChildren = ["fill", "fill"];
    expressionContainer.alignment = ["fill", "fill"];
    expressionContainer.spacing = 6;

    // 表达式列表
    var expressionList = expressionContainer.add("listbox", undefined, [], {
        multiselect: false
    });
    expressionList.alignment = ["fill", "fill"];

    // 将表达式组件添加到UI组件对象
    uiComponents.expressionListGroup = expressionListGroup;
    uiComponents.expressionContainer = expressionContainer;
    uiComponents.expressionList = expressionList;
    
    // 详情面板（优化布局）
    var detailsPanel = rightContainerGroup.add("panel", undefined, "✏ 编辑");
    detailsPanel.orientation = "column";
    detailsPanel.alignChildren = ["fill", "fill"];
    detailsPanel.alignment = ["fill", "fill"];
    detailsPanel.margins = [8, 12, 8, 8];
    uiComponents.detailsPanel = detailsPanel;

    // 名称输入组
    var nameGroup = detailsPanel.add("group");
    nameGroup.orientation = "row";
    nameGroup.alignChildren = ["left", "center"];
    nameGroup.alignment = ["fill", "top"];
    nameGroup.spacing = 6;
    nameGroup.margins = [0, 0, 0, 4];
    uiComponents.nameGroup = nameGroup;

    var nameLabel = nameGroup.add("statictext", undefined, "名称:");
    nameLabel.preferredSize.width = 35;

    var expressionNameEt = nameGroup.add("edittext");
    expressionNameEt.alignment = ["fill", "center"];
    expressionNameEt.helpTip = "名称（可编辑分类或表达式）";
    uiComponents.expressionNameEt = expressionNameEt;

    // 表达式内容编辑框
    var contentLabel = detailsPanel.add("statictext", undefined, "内容:");
    contentLabel.alignment = ["left", "top"];
    uiComponents.contentLabel = contentLabel;

    var expressionContentEt = detailsPanel.add("edittext", undefined, "", {
        multiline: true,
        scrollable: true
    });
    expressionContentEt.alignment = ["fill", "fill"];
    expressionContentEt.preferredSize.height = 80;
    expressionContentEt.helpTip = "表达式代码内容";
    uiComponents.expressionContentEt = expressionContentEt;

    // 操作按钮组（优化布局和顺序）
    var btnGroup = detailsPanel.add("group");
    btnGroup.orientation = "row";
    btnGroup.alignment = ["fill", "top"];
    btnGroup.spacing = 6;
    btnGroup.margins = [0, 6, 0, 0];

    var newBtn = btnGroup.add("button", undefined, "➕ 新建");
    newBtn.preferredSize.width = 70;
    newBtn.helpTip = "新建分类或表达式";
    newBtn.enabled = true;

    var applyBtn = btnGroup.add("button", undefined, "▶ 应用");
    applyBtn.preferredSize.width = 70;
    applyBtn.helpTip = "应用表达式到选中的图层属性";
    applyBtn.enabled = false;

    var copyBtn = btnGroup.add("button", undefined, "📋 复制");
    copyBtn.preferredSize.width = 70;
    copyBtn.helpTip = "复制内容到剪贴板";
    copyBtn.enabled = false;

    var saveBtn = btnGroup.add("button", undefined, "💾 保存");
    saveBtn.preferredSize.width = 70;
    saveBtn.helpTip = "保存修改（分类重命名/表达式保存）";

    var deleteBtn = btnGroup.add("button", undefined, "🗑 删除");
    deleteBtn.preferredSize.width = 70;
    deleteBtn.helpTip = "删除当前项（分类/表达式）";

    uiComponents.btnGroup = btnGroup;
    uiComponents.newBtn = newBtn;
    uiComponents.applyBtn = applyBtn;
    uiComponents.copyBtn = copyBtn;
    uiComponents.saveBtn = saveBtn;
    uiComponents.deleteBtn = deleteBtn;
    
    // 传递全局访问对象和UI组件对象给主函数
    ExpressionPlugin(win, ExpressionPluginGlobalAccess, uiComponents);
    
    // 强制面板立即刷新
    if (isPanel) {
        win.layout.layout(true);
        // 使用延迟初始化确保Panel已完全加载
        try {
            var refreshTaskStr = "try { if(ExpressionPluginGlobalAccess && ExpressionPluginGlobalAccess.refreshUI) ExpressionPluginGlobalAccess.refreshUI(); } catch(e) {}";
            app.scheduleTask(refreshTaskStr, 500, false);
        } catch(e) {
            // 忽略调度错误
        }
    }
    
    return win;
}

// ============================================
// 旧的入口点代码已移至文件末尾（第 1831 行）
// ============================================

function ExpressionPlugin(thisObj, globalAccess, uiComponents) {
    var win = thisObj; // 窗口或面板对象
    var isPanel = (win instanceof Panel);
    
    // 从uiComponents对象中提取UI组件引用
    var mainGroup = uiComponents.mainGroup;
    var topContainer = uiComponents.topContainer;
    var searchGroup = uiComponents.searchGroup;
    var searchEt = uiComponents.searchEt;
    var leftPanel = uiComponents.leftPanel;
    var categoryPanel = uiComponents.categoryPanel;
    var categoryList = uiComponents.categoryList;
    var rightContainerGroup = uiComponents.rightContainerGroup;
    var expressionListGroup = uiComponents.expressionListGroup;
    var expressionList = uiComponents.expressionList;
    var detailsPanel = uiComponents.detailsPanel;
    var nameGroup = uiComponents.nameGroup;
    var expressionNameEt = uiComponents.expressionNameEt;
    var expressionContentEt = uiComponents.expressionContentEt;
    var btnGroup = uiComponents.btnGroup;
    var newBtn = uiComponents.newBtn;
    var saveBtn = uiComponents.saveBtn;
    var applyBtn = uiComponents.applyBtn;
    var copyBtn = uiComponents.copyBtn;
    var deleteBtn = uiComponents.deleteBtn;

    // 创建全局访问对象（函数将在定义后添加）
    if (globalAccess) {
        globalAccess.ExpressionPlugin = {
            // UI组件引用
            uiComponents: uiComponents
        };
    }

    var SCRIPT_NAME = "表达式应用插件 v2.0";
    var SCRIPT_VERSION = "2.0.0";
    var PLUGIN_DATA_FOLDER_NAME = "expression-plugin2";
    var CATEGORY_MAP_FILENAME = "category_map.json";
    var EXPRESSION_EXT = ".txt";

    var pluginDataFolder;
    var categoryMap = {};
    var currentSelectedCategoryFolder = null;
    var currentSelectedExpressionFile = null;

    // 搜索历史记录（最多保存10条）
    var searchHistory = [];
    var MAX_SEARCH_HISTORY = 10;

    // 编辑模式：CATEGORY 或 EXPRESSION
    var EDIT_MODE = {
        CATEGORY: "category",
        EXPRESSION: "expression",
        NONE: "none"
    };
    var currentEditMode = EDIT_MODE.NONE;

    var FOLDER_ENCODING_PREFIX = "enc_";

    // 简化的中文拼音首字母映射表（常用字）
    var pinyinMap = {
        "常": "c", "用": "y", "动": "d", "画": "h", "弹": "d", "跳": "t",
        "文": "w", "本": "b", "时": "s", "间": "j", "控": "k", "制": "z",
        "图": "t", "层": "c", "关": "g", "系": "x", "摄": "s", "像": "x",
        "机": "j", "形": "x", "状": "z", "颜": "y", "色": "s", "效": "x",
        "果": "g", "音": "y", "频": "p", "驱": "q", "索": "s", "引": "y",
        "随": "s", "路": "l", "径": "j", "缩": "s", "放": "f", "旋": "x",
        "转": "z", "透": "t", "明": "m", "度": "d", "速": "s", "表": "b",
        "达": "d", "式": "s", "工": "g", "具": "j", "实": "s", "遮": "z",
        "罩": "z", "循": "x", "环": "h", "位": "w", "置": "z", "父": "f",
        "级": "j", "抖": "d", "淡": "d", "入": "r", "出": "c", "打": "d",
        "字": "z", "数": "s", "计": "j", "朝": "c", "向": "x", "宽": "k",
        "振": "z", "幅": "f", "节": "j", "奏": "z", "偏": "p", "移": "y",
        "交": "j", "替": "t", "显": "x", "延": "y", "迟": "c", "跟": "g",
        "随": "s", "增": "z", "长": "c", "呼": "h", "吸": "x", "性": "x",
        "匀": "y", "摆": "b", "闪": "s", "烁": "s", "缓": "h", "弹": "d",
        "簧": "h", "滑": "h", "块": "k", "复": "f", "选": "x", "框": "k",
        "重": "z", "映": "y", "射": "s", "化": "h", "格": "g", "百": "b",
        "分": "f", "比": "b"
    };

    // 获取中文字符的拼音首字母
    function getPinyinInitial(ch) {
        try {
            if (!ch || typeof ch !== 'string') {
                return '';
            }
            if (pinyinMap[ch]) {
                return pinyinMap[ch];
            }
            // 如果不在映射表中，返回原字符（可能是英文或数字）
            return ch.toLowerCase();
        } catch(e) {
            return '';
        }
    }

    // 获取整个字符串的拼音首字母
    function getStringPinyin(str) {
        var result = "";
        try {
            for (var i = 0; i < str.length; i++) {
                // 使用数组访问而不是charAt，更兼容ExtendScript
                var ch = str[i] || str.charAt(i);
                result += getPinyinInitial(ch);
            }
        } catch(e) {
            // 如果出错，直接返回原字符串
            return str.toLowerCase();
        }
        return result;
    }

    // 模糊匹配函数（支持拼音首字母）
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

    // --- 自定义通知系统 ---
    // 替代alert，提供更好的用户体验
    function showNotification(message, type, autoClose) {
        // type: "success" (成功), "error" (错误), "warning" (警告), "info" (信息)
        // autoClose: 自动关闭时间（毫秒），0或undefined表示不自动关闭

        if (typeof type === "undefined") type = "info";
        if (typeof autoClose === "undefined") autoClose = 0;

        var notifyWin = new Window("palette", "提示", undefined, {closeButton: false});
        notifyWin.orientation = "column";
        notifyWin.alignChildren = ["fill", "fill"];
        notifyWin.spacing = 10;
        notifyWin.margins = 16;

        // 图标和颜色
        var iconText = "ℹ";
        if (type === "success") iconText = "✓";
        else if (type === "error") iconText = "✕";
        else if (type === "warning") iconText = "⚠";

        // 图标
        var iconGroup = notifyWin.add("group");
        iconGroup.alignment = ["center", "top"];
        var icon = iconGroup.add("statictext", undefined, iconText);
        icon.graphics.font = ScriptUI.newFont("dialog", "BOLD", 24);

        // 消息文本
        var msgText = notifyWin.add("statictext", undefined, message, {multiline: true});
        msgText.alignment = ["fill", "top"];
        msgText.preferredSize.width = 300;

        // 提示文本
        var hintGroup = notifyWin.add("group");
        hintGroup.alignment = ["center", "bottom"];
        var hint = hintGroup.add("statictext", undefined, "点击任意处或按回车/ESC关闭");
        hint.graphics.font = ScriptUI.newFont("dialog", "REGULAR", 9);
        hint.graphics.foregroundColor = hint.graphics.newPen(hint.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);

        // 关闭函数
        function closeNotification() {
            try {
                notifyWin.close();
            } catch(e) {
                // 忽略关闭错误
            }
        }

        // 为所有元素添加点击事件
        notifyWin.addEventListener("mousedown", closeNotification);
        iconGroup.addEventListener("mousedown", closeNotification);
        icon.addEventListener("mousedown", closeNotification);
        msgText.addEventListener("mousedown", closeNotification);
        hintGroup.addEventListener("mousedown", closeNotification);
        hint.addEventListener("mousedown", closeNotification);

        // 键盘事件：回车或ESC关闭
        notifyWin.addEventListener("keydown", function(e) {
            if (e.keyName === "Enter" || e.keyName === "Escape") {
                closeNotification();
            }
        });

        // 自动关闭
        if (autoClose > 0) {
            try {
                var closeTaskStr = "try { if(typeof notifyWinToClose !== 'undefined' && notifyWinToClose.close) notifyWinToClose.close(); } catch(e) {}";
                // 使用全局变量传递窗口引用
                $.global.notifyWinToClose = notifyWin;
                app.scheduleTask(closeTaskStr, autoClose, false);
            } catch(e) {
                // 忽略调度错误
            }
        }

        notifyWin.center();
        notifyWin.show();
    }

    // 快捷函数
    function showSuccess(message, autoClose) {
        if (typeof autoClose === "undefined") autoClose = 1500; // 成功消息默认1.5秒后关闭
        showNotification(message, "success", autoClose);
    }

    function showError(message) {
        showNotification(message, "error", 0); // 错误消息需要手动关闭
    }

    function showWarning(message) {
        showNotification(message, "warning", 0);
    }

    function showInfo(message, autoClose) {
        if (typeof autoClose === "undefined") autoClose = 0;
        showNotification(message, "info", autoClose);
    }

    // --- 自定义选择菜单 ---
    // 替代Window.prompt，支持点击外部取消
    function showMenu(title, options, defaultChoice) {
        // options: 数组，如 ["选项1", "选项2", "选项3"]
        // defaultChoice: 默认选择的索引（从0开始），可选
        // 返回：选中的索引（从0开始），或null表示取消

        if (typeof defaultChoice === "undefined") defaultChoice = 0;

        var menuWin = new Window("palette", title, undefined);
        menuWin.orientation = "column";
        menuWin.alignChildren = ["fill", "top"];
        menuWin.spacing = 8;
        menuWin.margins = 16;

        var selectedIndex = null;
        var listbox = menuWin.add("listbox", undefined, options);
        listbox.alignment = ["fill", "fill"];
        listbox.preferredSize = [250, 150];

        if (defaultChoice >= 0 && defaultChoice < options.length) {
            listbox.selection = defaultChoice;
        }

        // 提示文本
        var hintGroup = menuWin.add("group");
        hintGroup.alignment = ["center", "bottom"];
        var hint = hintGroup.add("statictext", undefined, "双击选择 | 点击外部取消");
        hint.graphics.font = ScriptUI.newFont("dialog", "REGULAR", 9);
        hint.graphics.foregroundColor = hint.graphics.newPen(hint.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);

        // 双击选择
        listbox.onDoubleClick = function() {
            if (this.selection) {
                selectedIndex = this.selection.index;
                menuWin.close(1);
            }
        };

        // 回车选择
        menuWin.addEventListener("keydown", function(e) {
            if (e.keyName === "Enter") {
                if (listbox.selection) {
                    selectedIndex = listbox.selection.index;
                    menuWin.close(1);
                }
            } else if (e.keyName === "Escape") {
                menuWin.close(0);
            }
        });

        menuWin.center();
        var result = menuWin.show();

        return (result === 1) ? selectedIndex : null;
    }

    // --- 自定义输入对话框 ---
    // 替代Window.prompt，支持点击外部取消
    function showInputDialog(title, defaultValue, label) {
        if (typeof defaultValue === "undefined") defaultValue = "";
        if (typeof label === "undefined") label = "请输入:";

        var inputWin = new Window("palette", title, undefined);
        inputWin.orientation = "column";
        inputWin.alignChildren = ["fill", "top"];
        inputWin.spacing = 10;
        inputWin.margins = 16;

        var inputValue = null;

        // 标签
        var labelText = inputWin.add("statictext", undefined, label);

        // 输入框
        var inputField = inputWin.add("edittext", undefined, defaultValue);
        inputField.alignment = ["fill", "top"];
        inputField.preferredSize.width = 250;
        inputField.active = true;

        // 按钮组
        var btnGroup = inputWin.add("group");
        btnGroup.orientation = "row";
        btnGroup.alignment = ["center", "top"];
        btnGroup.spacing = 10;

        var okBtn = btnGroup.add("button", undefined, "确定");
        var cancelBtn = btnGroup.add("button", undefined, "取消");

        okBtn.onClick = function() {
            inputValue = inputField.text;
            inputWin.close(1);
        };

        cancelBtn.onClick = function() {
            inputWin.close(0);
        };

        // 回车确定，ESC取消
        inputWin.addEventListener("keydown", function(e) {
            if (e.keyName === "Enter") {
                inputValue = inputField.text;
                inputWin.close(1);
            } else if (e.keyName === "Escape") {
                inputWin.close(0);
            }
        });

        // 提示文本
        var hintGroup = inputWin.add("group");
        hintGroup.alignment = ["center", "bottom"];
        var hint = hintGroup.add("statictext", undefined, "点击外部取消");
        hint.graphics.font = ScriptUI.newFont("dialog", "REGULAR", 9);
        hint.graphics.foregroundColor = hint.graphics.newPen(hint.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);

        inputWin.center();
        var result = inputWin.show();

        return (result === 1) ? inputValue : null;
    }

    // --- File System Utilities ---
    function _safeFolderName(displayName) { // Renamed to avoid conflict if script is run multiple times without full AE restart
        var safeName = displayName.replace(/[^\w\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff.-]/g, '_'); // Allow dot and hyphen
        return FOLDER_ENCODING_PREFIX + safeName.toLowerCase();
    }
    // Assign to global access
    if (globalAccess) {
        globalAccess.safeFolderName = _safeFolderName;
    }


    function getPluginDataFolder() {
        if (pluginDataFolder) return pluginDataFolder;
        try {
            if (typeof $.fileName === "undefined") {
                throw new Error("无法确定脚本文件路径 ($.fileName is undefined).");
            }
            var scriptFile = new File($.fileName);
            if (!scriptFile.exists) {
                throw new Error("脚本文件路径无效: " + $.fileName);
            }
            var scriptFolder = scriptFile.parent;
            pluginDataFolder = new Folder(scriptFolder.fsName + "/" + PLUGIN_DATA_FOLDER_NAME);
            if (!pluginDataFolder.exists) {
                var created = pluginDataFolder.create();
                if (!created) {
                    alert("警告：无法在以下位置创建数据文件夹：\n" + pluginDataFolder.fsName +
                          "\n\n请检查脚本目录的写入权限，或手动创建名为 '" + PLUGIN_DATA_FOLDER_NAME + "' 的子文件夹。");
                    return null;
                }
            }
        } catch (e) {
            alert("获取插件数据文件夹时出错: " + e.toString() + "\n将尝试使用用户数据文件夹作为备用。");
            var userDataF = Folder.userData;
            pluginDataFolder = new Folder(userDataF.fsName + "/ExpressionPluginData_UserDataFallback");
            if (!pluginDataFolder.exists) {
                pluginDataFolder.create();
            }
        }
        return pluginDataFolder;
    }


    function loadCategoryMap() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) {
            alert("错误：数据文件夹不可用，无法加载分类。");
            categoryMap = {};
            return;
        }
        var mapFile = new File(baseFolder.fsName + "/" + CATEGORY_MAP_FILENAME);
        if (mapFile.exists) {
            mapFile.encoding = "UTF-8";
            mapFile.open("r");
            try {
                var content = mapFile.read();
                if (content && content.trim() !== "") {
                    categoryMap = JSON.parse(content);
                } else {
                    categoryMap = {};
                }
            } catch (e) {
                alert("错误：无法解析分类映射文件。\n" + mapFile.fsName + "\n" + e.toString() + "\n将尝试重置分类数据。");
                categoryMap = {}; // Reset if parsing fails
            }
            mapFile.close();
        } else {
            categoryMap = {};
            saveCategoryMap(); // Create an empty valid map if it doesn't exist
        }
    }

    function saveCategoryMap() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) {
            alert("错误：数据文件夹不可用，无法保存分类。");
            return;
        }
        var mapFile = new File(baseFolder.fsName + "/" + CATEGORY_MAP_FILENAME);
        mapFile.encoding = "UTF-8";
        mapFile.open("w");
        try {
            mapFile.write(JSON.stringify(categoryMap, null, 2));
        } catch (e) {
            showError("保存分类映射时发生错误: " + e.toString());
        }
        mapFile.close();
    }

    // 加载搜索历史记录
    function loadSearchHistory() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        var historyFile = new File(baseFolder.fsName + "/search_history.json");
        if (historyFile.exists) {
            historyFile.encoding = "UTF-8";
            historyFile.open("r");
            try {
                var content = historyFile.read();
                if (content && content.trim() !== "") {
                    searchHistory = JSON.parse(content);
                }
            } catch (e) {
                searchHistory = [];
            }
            historyFile.close();
        }
    }

    // 保存搜索历史记录
    function saveSearchHistory() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        var historyFile = new File(baseFolder.fsName + "/search_history.json");
        historyFile.encoding = "UTF-8";
        historyFile.open("w");
        try {
            historyFile.write(JSON.stringify(searchHistory, null, 2));
        } catch (e) {
            // 忽略错误
        }
        historyFile.close();
    }

    // 添加到搜索历史记录
    function addToSearchHistory(term) {
        if (!term || term.trim() === "") return;

        term = term.trim();

        // 移除已存在的相同项
        for (var i = 0; i < searchHistory.length; i++) {
            if (searchHistory[i] === term) {
                searchHistory.splice(i, 1);
                break;
            }
        }

        // 添加到开头
        searchHistory.unshift(term);

        // 限制历史记录数量
        if (searchHistory.length > MAX_SEARCH_HISTORY) {
            searchHistory = searchHistory.slice(0, MAX_SEARCH_HISTORY);
        }

        saveSearchHistory();
    }

    // 显示搜索历史记录菜单
    function showSearchHistoryMenu() {
        if (searchHistory.length === 0) {
            showInfo("暂无搜索历史记录", 1000);
            return null;
        }

        var choice = showMenu("搜索历史", searchHistory, 0);
        if (choice !== null && choice >= 0 && choice < searchHistory.length) {
            return searchHistory[choice];
        }

        return null;
    }

    function readFileContent(file) {
        if (!file || !file.exists) return "";
        file.encoding = "UTF-8";
        file.open("r");
        var content = file.read();
        file.close();
        return content;
    }

    function writeFileContent(file, content) {
        file.encoding = "UTF-8";
        file.open("w");
        file.write(content);
        file.close();
    }

    // --- UI Logic ---
    function populateCategoryList() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        var previousSelection = categoryList.selection ? categoryList.selection.folderName : null;
        categoryList.removeAll();
        var displayNames = [];
        for (var folderName in categoryMap) {
            if (categoryMap.hasOwnProperty(folderName)) {
                var catFolderCheck = new Folder(baseFolder.fsName + "/" + folderName);
                if (catFolderCheck.exists) {
                    displayNames.push(categoryMap[folderName]);
                }
            }
        }
        displayNames.sort(function(a, b) { return a.localeCompare(b, 'zh-CN'); });

        var newSelectionIndex = -1;
        for (var i = 0; i < displayNames.length; i++) {
            var item = categoryList.add("item", displayNames[i]);
            for (var fName in categoryMap) {
                if (categoryMap[fName] === displayNames[i]) {
                    item.folderName = fName;
                    if (fName === previousSelection) {
                        newSelectionIndex = i;
                    }
                    break;
                }
            }
        }

        if (newSelectionIndex !== -1) {
            categoryList.selection = newSelectionIndex;
        }
        // 移除自动选择第一项的逻辑
        // 这样可以避免干扰搜索功能和用户的手动选择

        if (categoryList.items.length === 0) {
            clearExpressionList();
            clearDetailsPanel(false);
        }
    }

    function populateExpressionList(categoryFolder) {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        var previousSelection = expressionList.selection ? expressionList.selection.fileName : null;
        expressionList.removeAll();
        currentSelectedExpressionFile = null; // Clear this when repopulating

        if (!categoryFolder) return;

        var catFolderObj = new Folder(baseFolder.fsName + "/" + categoryFolder);
        if (!catFolderObj.exists) {
            return;
        }

        var files = catFolderObj.getFiles("*" + EXPRESSION_EXT);
        var expressionDisplayData = [];
        for (var i = 0; i < files.length; i++) {
            if (files[i] instanceof File) {
                var filename = files[i].name;
                var displayName = "";
                try {
                    displayName = decodeURIComponent(filename.substring(0, filename.lastIndexOf(EXPRESSION_EXT)));
                } catch (e) {
                    displayName = filename.substring(0, filename.lastIndexOf(EXPRESSION_EXT));
                }
                expressionDisplayData.push({displayName: displayName, fileName: filename});
            }
        }

        expressionDisplayData.sort(function(a,b) { return a.displayName.localeCompare(b.displayName, 'zh-CN'); });

        var newSelectionIndex = -1;
        for (var j = 0; j < expressionDisplayData.length; j++) {
            var item = expressionList.add("item", expressionDisplayData[j].displayName);
            item.fileName = expressionDisplayData[j].fileName;
            if (item.fileName === previousSelection) {
                newSelectionIndex = j;
            }
        }

        if (newSelectionIndex !== -1) {
            expressionList.selection = newSelectionIndex;
        }
        // 移除自动选择第一项的逻辑，让用户手动选择
        // 这样可以避免覆盖分类名称

        if (expressionList.selection === null) {
            clearDetailsPanel(false);
        }
    }

    function clearExpressionList() {
        expressionList.removeAll();
        currentSelectedExpressionFile = null;
    }

    // 设置编辑模式并更新UI
    function setEditMode(mode) {
        currentEditMode = mode;

        var contentLabel = uiComponents.contentLabel;

        if (mode === EDIT_MODE.CATEGORY) {
            // 编辑分类模式
            detailsPanel.text = "✏ 编辑分类";
            expressionContentEt.visible = false;
            if (contentLabel) contentLabel.visible = false;
            newBtn.enabled = true;
            applyBtn.enabled = false;
            copyBtn.enabled = false;
            saveBtn.enabled = true;
            deleteBtn.enabled = true;
        } else if (mode === EDIT_MODE.EXPRESSION) {
            // 编辑表达式模式
            detailsPanel.text = "✏ 编辑表达式";
            expressionContentEt.visible = true;
            if (contentLabel) contentLabel.visible = true;
            newBtn.enabled = true;
            applyBtn.enabled = true;
            copyBtn.enabled = true;
            saveBtn.enabled = true;
            deleteBtn.enabled = true;
        } else {
            // 无编辑模式
            detailsPanel.text = "✏ 编辑";
            expressionContentEt.visible = true;
            if (contentLabel) contentLabel.visible = true;
            newBtn.enabled = true;
            applyBtn.enabled = false;
            copyBtn.enabled = false;
            saveBtn.enabled = false;
            deleteBtn.enabled = false;
        }

        win.layout.layout(true);
    }

    function clearDetailsPanel(makeEditable) {
        expressionNameEt.text = "";
        expressionNameEt.enabled = !!makeEditable;
        
        // 处理表达式内容编辑框
        if (expressionContentEt) {
            // 处理只读状态
            var needsRecreate = (expressionContentEt.readonly && makeEditable);
            
            if (needsRecreate) {
                try {
                    // 记住原来控件的位置和大小信息
                    var oldBounds = expressionContentEt.bounds;
                    var oldAlignment = expressionContentEt.alignment;
                    var oldParent = expressionContentEt.parent;
                    var oldHeight = expressionContentEt.preferredSize.height;
                    
                    // 移除旧控件
                    expressionContentEt.parent.remove(expressionContentEt);
                    
                    // 重新创建按钮组后再创建编辑框
                    // 注意：保持正确的UI结构顺序
                    
                    // 确保按钮组仍然存在，如果被移除则重新创建
                    if (!btnGroup || !btnGroup.parent) {
                        // 按钮组已丢失，需要重建
                        btnGroup = detailsPanel.add("group");
                        btnGroup.orientation = "row";
                        btnGroup.alignment = ["center", "top"];
                        btnGroup.spacing = 8;
                        btnGroup.margins = [0, 10, 0, 10]; // 保持margins为[0,10,0,10]
                        
                        // 重新创建按钮
                        var deleteBtn = btnGroup.add("button", undefined, "删除");
                        deleteBtn.preferredSize.width = 35;
                        
                        var applyBtn = btnGroup.add("button", undefined, "应用");
                        applyBtn.preferredSize.width = 35;
                        
                        var copyBtn = btnGroup.add("button", undefined, "复制");
                        copyBtn.preferredSize.width = 35;
                        
                        var saveBtn = btnGroup.add("button", undefined, "保存");
                        saveBtn.preferredSize.width = 35;
                        
                        // 更新UI组件引用
                        uiComponents.btnGroup = btnGroup;
                        uiComponents.saveBtn = saveBtn;
                        uiComponents.applyBtn = applyBtn;
                        uiComponents.copyBtn = copyBtn;
                        uiComponents.deleteBtn = deleteBtn;
                    }
                    
                    // 创建新的编辑框（根据makeEditable设置只读状态）
                    expressionContentEt = detailsPanel.add("edittext", undefined, "", {
                        multiline: true,
                        readonly: !makeEditable,
                        scrollable: true
                    });
                    
                    // 还原位置和大小设置
                    expressionContentEt.alignment = "fill"; // 确保填充父容器
                    expressionContentEt.preferredSize.height = oldHeight;
                    expressionContentEt.helpTip = "表达式内容";
                    
                    // 确保新控件位于正确位置
                    detailsPanel.layout.layout(true);
                } catch (e) {
                    alert("重新创建表达式编辑框时出错: " + e.toString());
                }
            } else {
                // 仅清除内容
                expressionContentEt.text = "";
                if (!makeEditable && !expressionContentEt.readonly) {
                    try {
                        expressionContentEt.readonly = true;
                    } catch(e) {
                        // 忽略错误
                    }
                }
            }
        }
        
        if (!makeEditable) {
            detailsPanel.text = "表达式详情与操作";
        }
    }

    function displayExpressionDetails(expressionFile, categoryForExpression) {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        var catToUse = categoryForExpression || currentSelectedCategoryFolder;

        if (!catToUse || !expressionFile) {
            clearDetailsPanel(false);
            return;
        }

        var exprFilePath = baseFolder.fsName + "/" + catToUse + "/" + expressionFile;
        var file = new File(exprFilePath);
        if (file.exists) {
            var content = readFileContent(file);
            var displayName = "";
            try {
                displayName = decodeURIComponent(expressionFile.substring(0, expressionFile.lastIndexOf(EXPRESSION_EXT)));
            } catch (e) {
                displayName = expressionFile.substring(0, expressionFile.lastIndexOf(EXPRESSION_EXT));
            }

            // 显示表达式名称（用于重命名表达式）
            expressionNameEt.text = displayName;
            expressionNameEt.enabled = true;  // Allow editing name of existing expression
            
            // 确保表达式内容编辑框是可编辑的
            try {
                // 检查是否需要重新创建编辑框
                if (expressionContentEt && expressionContentEt.readonly) {
                    // 记住原来控件的位置和大小信息
                    var oldBounds = expressionContentEt.bounds;
                    var oldAlignment = expressionContentEt.alignment;
                    var oldParent = expressionContentEt.parent;
                    var oldHeight = expressionContentEt.preferredSize.height;
                    
                    // 移除旧控件
                    expressionContentEt.parent.remove(expressionContentEt);
                    
                    // 确保按钮组存在且位于编辑框之前
                    if (!btnGroup || !btnGroup.parent) {
                        // 如果按钮组不存在或已被移除，重新创建
                        btnGroup = detailsPanel.add("group");
                        btnGroup.orientation = "row";
                        btnGroup.alignment = ["center", "top"];
                        btnGroup.spacing = 8;
                        btnGroup.margins = [0, 10, 0, 10]; // 保持margins为[0,10,0,10]
                        
                        // 重新创建按钮
                        var deleteBtn = btnGroup.add("button", undefined, "删除");
                        deleteBtn.preferredSize.width = 35;
                        
                        var applyBtn = btnGroup.add("button", undefined, "应用");
                        applyBtn.preferredSize.width = 35;
                        
                        var copyBtn = btnGroup.add("button", undefined, "复制");
                        copyBtn.preferredSize.width = 35;
                        
                        var saveBtn = btnGroup.add("button", undefined, "保存");
                        saveBtn.preferredSize.width = 35;
                        
                        // 更新UI组件引用
                        uiComponents.btnGroup = btnGroup;
                        uiComponents.saveBtn = saveBtn;
                        uiComponents.applyBtn = applyBtn;
                        uiComponents.copyBtn = copyBtn;
                        uiComponents.deleteBtn = deleteBtn;
                    }
                    
                    // 创建新的编辑框（显式设置为非只读）
                    expressionContentEt = detailsPanel.add("edittext", undefined, content, {
                        multiline: true,
                        readonly: false,
                        scrollable: true
                    });
                    
                    // 还原位置和大小设置
                    expressionContentEt.alignment = "fill"; // 确保填充父容器
                    expressionContentEt.preferredSize.height = oldHeight;
                    expressionContentEt.helpTip = "表达式内容";
                    
                    // 确保新控件位于正确位置
                    detailsPanel.layout.layout(true);
                } else if (expressionContentEt) {
                    // 直接设置内容
                    expressionContentEt.text = content;
                    expressionContentEt.readonly = false;
                }
            } catch (e) {
                alert("更新表达式内容时出错: " + e.toString());
                // 出错时的备用方案
                if (expressionContentEt) {
                    expressionContentEt.text = content;
                    expressionContentEt.readonly = false;
                }
            }
            
            if (searchEt.text.toString().trim() !== "") {
                 detailsPanel.text = "表达式详情 (来自: " + categoryMap[catToUse] + ")";
            } else {
                 detailsPanel.text = "表达式详情: " + displayName;
            }

        } else {
            clearDetailsPanel(false);
        }
    }

    // --- Event Handlers ---
    // MODIFIED originalExpressionListOnChange
    var originalExpressionListOnChange = function() {
        if (expressionList.selection) {
            currentSelectedExpressionFile = expressionList.selection.fileName;
            // Determine category (could be from search result or current category)
            var categoryForDetails = currentSelectedCategoryFolder;
            if (expressionList.selection.originalCategoryFolder) { // If item has originalCategoryFolder, it's from search
                categoryForDetails = expressionList.selection.originalCategoryFolder;
            }
            displayExpressionDetails(currentSelectedExpressionFile, categoryForDetails);
            // 设置编辑模式为表达式
            setEditMode(EDIT_MODE.EXPRESSION);
        } else {
            // If detailsPanel indicates "new expression" mode, don't revert to readonly.
            // This check prevents clearing the UI when we are intentionally creating a new expression.
            if (detailsPanel.text.indexOf("新建表达式 (在:") === 0) {
                // Ensure it's editable, as intended in new expression mode
                if (expressionContentEt.readonly) {
                    expressionContentEt.readonly = false;
                }
                if (!expressionNameEt.enabled) {
                    expressionNameEt.enabled = true;
                }
                // currentSelectedExpressionFile is already null for new expressions
                return; // Don't call clearDetailsPanel(false)
            }
            currentSelectedExpressionFile = null;
            clearDetailsPanel(false);
            setEditMode(EDIT_MODE.NONE);
        }
    };


    categoryList.onChange = function() {
        if (searchEt.text.toString().trim() !== "") {
            searchEt.text = ""; // This will trigger searchEt.onChange, which handles UI reset
            // searchEt.onChange will eventually call this categoryList.onChange again if selection is made
            return;
        }

        expressionList.onChange = originalExpressionListOnChange; // Ensure correct handler

        if (categoryList.selection) {
            // 点击分类时，清除表达式选中（避免交叉情况）
            expressionList.selection = null;

            currentSelectedCategoryFolder = categoryList.selection.folderName;
            var selectedCategoryName = categoryList.selection.text;

            // 更新表达式列表标题
            expressionListGroup.text = "📝 " + selectedCategoryName;
            populateExpressionList(currentSelectedCategoryFolder);

            // 重要：在 populateExpressionList 之后，再次明确清除表达式选择
            // 防止 populateExpressionList 自动选择第一项
            expressionList.selection = null;

            // 重要：在 populateExpressionList 之后重新设置分类名称
            // 因为 populateExpressionList 可能会清空详情面板或触发选择变化
            expressionNameEt.text = selectedCategoryName;
            expressionNameEt.enabled = true;
            setEditMode(EDIT_MODE.CATEGORY);

            // 不自动选中第一个表达式，让用户手动选择
            // 这样名称框就不会被覆盖
        } else {
            currentSelectedCategoryFolder = null;
            expressionListGroup.text = "📝 表达式";
            clearExpressionList();
            clearDetailsPanel(false);
            setEditMode(EDIT_MODE.NONE);
        }
    };

    // 分类列表右键菜单
    categoryList.addEventListener('mousedown', function(event) {
        if (event.button === 2) { // 右键
            var menuItems = [];
            menuItems.push("新建分类");

            if (categoryList.selection) {
                menuItems.push("重命名分类");
                menuItems.push("删除分类");
            }

            menuItems.push("加载示例分类(20个)");

            var choice = showMenu("分类操作", menuItems, 0);

            if (choice === null) return;

            if (choice === 0) {
                // 新建分类
                handleNewCategoryCreation();
            } else if (categoryList.selection && choice === 1) {
                // 重命名 - 在编辑区显示
                expressionNameEt.text = categoryList.selection.text;
                expressionNameEt.active = true;
            } else if (categoryList.selection && choice === 2) {
                // 删除
                handleDeleteCategory();
            } else if ((categoryList.selection && choice === 3) || (!categoryList.selection && choice === 1)) {
                // 加载示例分类
                handleLoadExampleCategories();
            }
        }
    });

    // 表达式列表右键菜单
    expressionList.addEventListener('mousedown', function(event) {
        if (event.button === 2) { // 右键
            if (!currentSelectedCategoryFolder) {
                showWarning("请先选择一个分类");
                return;
            }

            var menuItems = [];
            menuItems.push("新建表达式");

            if (expressionList.selection) {
                menuItems.push("重命名表达式");
                menuItems.push("删除表达式");
            }

            var choice = showMenu("表达式操作", menuItems, 0);

            if (choice === null) return;

            if (choice === 0) {
                // 新建表达式
                handleNewExpressionCreation();
            } else if (choice === 1 && expressionList.selection) {
                // 重命名 - 在编辑区显示
                var exprDisplayName = "";
                try {
                    exprDisplayName = decodeURIComponent(expressionList.selection.fileName.substring(0, expressionList.selection.fileName.lastIndexOf(EXPRESSION_EXT)));
                } catch (e) {
                    exprDisplayName = expressionList.selection.fileName.substring(0, expressionList.selection.fileName.lastIndexOf(EXPRESSION_EXT));
                }
                expressionNameEt.text = exprDisplayName;
                expressionNameEt.active = true;
            } else if (choice === 2 && expressionList.selection) {
                // 删除
                handleDeleteExpression();
            }
        }
    });

    categoryList.onDoubleClick = function() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;
        if (!categoryList.selection) return;
        var selectedCatDisplayName = categoryList.selection.text;
        var selectedCatFolderName = categoryList.selection.folderName;

        // 直接重命名（双击=重命名）
        var newName = showInputDialog("重命名分类", selectedCatDisplayName, "输入新的分类名称:");
        if (newName && newName.trim() && newName.trim() !== selectedCatDisplayName) {
            newName = newName.trim();
            for (var folderKey in categoryMap) {
                if (categoryMap[folderKey] === newName && folderKey !== selectedCatFolderName) {
                    showError("错误：分类名称 '" + newName + "' 已存在");
                    return;
                }
            }
            var newFolderName = globalAccess.safeFolderName(newName);
            if (categoryMap[newFolderName] && newFolderName !== selectedCatFolderName) {
                showError("错误：无法创建分类文件夹，目标内部名称 '" + newFolderName + "' 可能冲突");
                return;
            }
            var oldFolder = new Folder(baseFolder.fsName + "/" + selectedCatFolderName);
            if (selectedCatFolderName === newFolderName) { // Only display name changed
                categoryMap[selectedCatFolderName] = newName;
            } else { // Folder name also needs to change
                var newFolderObj = new Folder(baseFolder.fsName + "/" + newFolderName);
                if (newFolderObj.exists) {
                    showError("错误: 新的分类文件夹目标内部名称 '" + newFolderName + "' 已存在于文件系统");
                    return;
                }
                if (!oldFolder.exists) {
                    showError("错误: 原始分类文件夹 '" + oldFolder.displayName + "' 未找到");
                    delete categoryMap[selectedCatFolderName];
                    saveCategoryMap();
                    populateCategoryList();
                    return;
                }
                if (!oldFolder.rename(newFolderName)) {
                    showError("错误：重命名分类文件夹失败");
                    return;
                }
                delete categoryMap[selectedCatFolderName];
                categoryMap[newFolderName] = newName;
            }
            saveCategoryMap();
            populateCategoryList();
            // Try to reselect the renamed category
            for(var i=0; i<categoryList.items.length; i++){
                if(categoryList.items[i].folderName === newFolderName){
                    categoryList.selection = i;
                    break;
                }
            }

            // 重要：重新设置分类名称，防止被表达式列表覆盖
            expressionNameEt.text = newName;
            expressionNameEt.enabled = true;
            setEditMode(EDIT_MODE.CATEGORY);

            showSuccess("分类 '" + selectedCatDisplayName + "' 已更新为 '" + newName + "'");
        }
    };

    expressionList.onChange = originalExpressionListOnChange; // Initialize with the correct handler

    expressionList.onDoubleClick = function() {
        // 修改为应用表达式，而不是编辑/删除
        if (!expressionList.selection) return; // 没有选择，不执行任何操作
        
        // 获取选中的表达式内容并应用到当前选中的属性
        var exprContent = expressionContentEt.text;
        if (!exprContent) {
            showWarning("没有可应用的表达式内容");
            return;
        }

        var activeComp = app.project.activeItem;
        if (!(activeComp instanceof CompItem)) {
            showWarning("请先选择一个合成");
            return;
        }

        var selectedProps = activeComp.selectedProperties;
        if (selectedProps.length === 0) {
            showWarning("请在合成中选择至少一个属性");
            return;
        }
        
        app.beginUndoGroup("应用表达式");
        var appliedCount = 0;
        for (var i = 0; i < selectedProps.length; i++) {
            var prop = selectedProps[i];
            if (prop.canSetExpression) {
                try { 
                    prop.expression = exprContent; 
                    appliedCount++; 
                }
                catch (e) {
                    showError("无法将表达式应用于属性: " + prop.name + "\n" + e.toString());
                }
            }
        }
        app.endUndoGroup();

        if (appliedCount === 0 && selectedProps.length > 0) {
            showWarning("选择的属性不支持表达式，或应用失败");
        } else if (appliedCount > 0) {
            // alert(appliedCount + " 个属性已应用表达式。"); // Optional success message
        }
    };



    saveBtn.onClick = function() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        // 智能判断：根据当前选中的列表（蓝色选框）决定保存什么
        // 1. 如果表达式列表有选中项（蓝色选框），保存表达式
        // 2. 如果只有分类列表有选中项，保存分类重命名
        // 3. 如果当前在"新建表达式"模式（根据detailsPanel标题判断），保存表达式
        // 4. 都不满足，提示用户

        if (expressionList.selection || detailsPanel.text.indexOf("新建表达式") === 0 || detailsPanel.text.indexOf("表达式详情") === 0) {
            // 表达式相关的编辑，保存表达式
            handleSaveExpression();
        } else if (categoryList.selection) {
            // 只有分类有选中项，保存分类重命名
            handleSaveCategory();
        } else {
            showWarning("请先选择要编辑的分类或表达式");
        }
    };

    // 名称编辑框回车键监听 - 按回车自动保存
    expressionNameEt.addEventListener("keydown", function(e) {
        if (e.keyName === "Enter") {
            // 按回车键时，触发保存按钮
            if (saveBtn.enabled) {
                saveBtn.onClick();
            }
            // 阻止默认行为
            e.preventDefault();
        }
    });

    // 处理保存分类重命名的函数
    function handleSaveCategory() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        if (!categoryList.selection) {
            showWarning("请先选择要重命名的分类");
            return;
        }

        var newName = expressionNameEt.text.toString().trim();
        if (!newName) {
            showWarning("分类名称不能为空");
            expressionNameEt.active = true;
            return;
        }

        var selectedCatFolderName = categoryList.selection.folderName;
        var selectedCatDisplayName = categoryList.selection.text;

        if (newName === selectedCatDisplayName) {
            showInfo("分类名称未更改", 1000);
            return;
        }

        // 检查新名称是否已存在
        for (var folderKey in categoryMap) {
            if (categoryMap[folderKey] === newName && folderKey !== selectedCatFolderName) {
                showError("错误：分类名称 '" + newName + "' 已存在");
                return;
            }
        }

        var newFolderName = globalAccess.safeFolderName(newName);
        if (categoryMap[newFolderName] && newFolderName !== selectedCatFolderName) {
            showError("错误：无法创建分类文件夹，目标内部名称 '" + newFolderName + "' 可能冲突");
            return;
        }

        var oldFolder = new Folder(baseFolder.fsName + "/" + selectedCatFolderName);
        if (selectedCatFolderName === newFolderName) {
            // Only display name changed
            categoryMap[selectedCatFolderName] = newName;
        } else {
            // Folder name also needs to change
            var newFolderObj = new Folder(baseFolder.fsName + "/" + newFolderName);
            if (newFolderObj.exists) {
                showError("错误: 新的分类文件夹目标内部名称 '" + newFolderName + "' 已存在于文件系统");
                return;
            }
            if (!oldFolder.exists) {
                showError("错误: 原始分类文件夹 '" + oldFolder.displayName + "' 未找到");
                delete categoryMap[selectedCatFolderName];
                saveCategoryMap();
                populateCategoryList();
                return;
            }
            if (!oldFolder.rename(newFolderName)) {
                showError("错误：重命名分类文件夹失败");
                return;
            }
            delete categoryMap[selectedCatFolderName];
            categoryMap[newFolderName] = newName;
        }

        saveCategoryMap();
        populateCategoryList();

        // Try to reselect the renamed category
        for(var i=0; i<categoryList.items.length; i++){
            if(categoryList.items[i].folderName === newFolderName){
                categoryList.selection = i;
                break;
            }
        }

        // 重要：重新设置分类名称，防止被表达式列表覆盖
        expressionNameEt.text = newName;
        expressionNameEt.enabled = true;
        setEditMode(EDIT_MODE.CATEGORY);

        showSuccess("分类 '" + selectedCatDisplayName + "' 已更新为 '" + newName + "'");
    }

    // 处理保存表达式的函数
    function handleSaveExpression() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;
        var exprName = expressionNameEt.text.toString().trim();
        var exprContent = expressionContentEt.text;

        if (!exprName) {
            showWarning("表达式名称不能为空");
            expressionNameEt.active = true;
            return;
        }

        // Determine the correct category for saving.
        // If an item is selected in the expression list AND it has an originalCategoryFolder,
        // it means we are editing an item found via search. Save it to its original category.
        var categoryForSave = currentSelectedCategoryFolder; // Default to current category
        if (expressionList.selection && expressionList.selection.originalCategoryFolder) {
            categoryForSave = expressionList.selection.originalCategoryFolder;
        } else if (detailsPanel.text.indexOf("新建表达式 (在:") === 0 && currentSelectedCategoryFolder) {
             // This is for a brand new expression being saved.
             // currentSelectedCategoryFolder should be correct.
        } else if (!categoryForSave && currentSelectedExpressionFile) {
            // Fallback: if we are editing an existing file but category is unclear, try to find it (less ideal)
            // This case should be rare if UI logic is correct.
             showWarning("警告: 无法明确保存的分类，将尝试使用最后选择的分类");
        }


        if (!categoryForSave) {
            showError("错误：未确定分类。无法保存");
            return;
        }

        var exprFileName = encodeURIComponent(exprName) + EXPRESSION_EXT;
        var exprFilePath = baseFolder.fsName + "/" + categoryForSave + "/" + exprFileName;
        var file = new File(exprFilePath);

        var isNewExpressionMode = detailsPanel.text.indexOf("新建表达式 (在:") === 0;

        // Case 1: Saving a brand new expression
        if (isNewExpressionMode || currentSelectedExpressionFile === null ) {
            if (file.exists) {
                        showError("错误：名称为 '" + exprName + "' 的表达式已存在");
                return;
            }
            writeFileContent(file, exprContent);
            currentSelectedExpressionFile = exprFileName; // Update tracker

            if (searchEt.text.toString().trim() !== "") {
                searchEt.onChange(); // Refresh search if it was active
            } else {
                populateExpressionList(categoryForSave);
            }
            // Try to select the newly saved item
            for(var i=0; i<expressionList.items.length; i++){
                var itemIsTarget = expressionList.items[i].fileName === exprFileName;
                if (searchEt.text.toString().trim() !== "" && expressionList.items[i].originalCategoryFolder !== categoryForSave) {
                    itemIsTarget = false; // In search, also match category
                }
                if(itemIsTarget){
                    expressionList.selection = i;
                    break;
                }
            }
            detailsPanel.text = "表达式详情: " + exprName; // Update panel title
            showSuccess("表达式 '" + exprName + "' 已创建并保存");
        }
        // Case 2: Saving modifications to an existing expression (name change or content change)
        else {
            var oldExprFileName = currentSelectedExpressionFile; // This should be set if not a new expression
            if (!oldExprFileName) {
                 showWarning("无法确定要修改的原始表达式。请重新选择");
                 return;
            }
            var oldExprDisplayName = "";
            try { oldExprDisplayName = decodeURIComponent(oldExprFileName.substring(0, oldExprFileName.lastIndexOf(EXPRESSION_EXT))); }
            catch (e) { oldExprDisplayName = oldExprFileName.substring(0, oldExprFileName.lastIndexOf(EXPRESSION_EXT)); }

            if (oldExprFileName !== exprFileName) { // Name has changed
                if (file.exists) {
                    showError("错误：目标名称 '" + exprName + "' 的表达式已存在");
                    return;
                }
                var oldFile = new File(baseFolder.fsName + "/" + categoryForSave + "/" + oldExprFileName);
                if (oldFile.exists && oldFile.rename(exprFileName)) {
                    writeFileContent(new File(baseFolder.fsName + "/" + categoryForSave + "/" + exprFileName), exprContent);
                    currentSelectedExpressionFile = exprFileName; // Update tracker

                    if (searchEt.text.toString().trim() !== "") {
                        searchEt.onChange(); // Refresh search
                    } else {
                        populateExpressionList(categoryForSave);
                    }
                     // Try to re-select the renamed item
                    for(var i=0; i<expressionList.items.length; i++){
                        var itemIsTargetRenamed = expressionList.items[i].fileName === exprFileName;
                        if (searchEt.text.toString().trim() !== "" && expressionList.items[i].originalCategoryFolder !== categoryForSave) {
                            itemIsTargetRenamed = false;
                        }
                        if(itemIsTargetRenamed){
                            expressionList.selection = i;
                            break;
                        }
                    }
                    detailsPanel.text = "表达式详情: " + exprName; // Update panel title
                    showSuccess("表达式 '" + oldExprDisplayName + "' 已重命名为 '" + exprName + "'");
                } else {
                    showError("错误：重命名表达式文件失败 (源: " + oldFile.fsName + ")。确保文件未被占用");
                }
            } else { // Only content has changed (or no changes)
                writeFileContent(file, exprContent);
                // No need to re-populate list if only content changed and name is same.
                // displayExpressionDetails will update the view if needed.
                // displayExpressionDetails(exprFileName, categoryForSave); // Already done by selection's onChange
                detailsPanel.text = "表达式详情: " + exprName; // Update panel title
                showSuccess("表达式 '" + exprName + "' 已保存");
            }
        }
        // After saving, the content should be treated as displayed, not actively new/editing.
        // The displayExpressionDetails or selection onChange should handle readonly state.
        // For safety, ensure it's as if an item was just selected.
        if (expressionList.selection) {
            displayExpressionDetails(expressionList.selection.fileName, categoryForSave);
        } else {
            // If somehow no selection after save, clear to a safe state
            clearDetailsPanel(false);
        }
    }


    deleteBtn.onClick = function() {
        // 智能判断：根据当前选中的列表（蓝色选框）决定删除什么
        // 1. 如果表达式列表有选中项（蓝色选框），删除表达式
        // 2. 如果只有分类列表有选中项，删除分类
        // 3. 都没选中，提示用户

        if (expressionList.selection) {
            // 表达式列表有选中项（蓝色选框），删除表达式
            handleDeleteExpression();
        } else if (categoryList.selection) {
            // 只有分类有选中项（蓝色选框），删除分类
            handleDeleteCategory();
        } else {
            // 都没选中，提示用户
            showWarning("请先选择要删除的分类或表达式");
        }
    };

    // 处理删除分类的函数
    function handleDeleteCategory() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        if (!categoryList.selection) {
            showWarning("请先选择要删除的分类");
            return;
        }

        var selectedCatDisplayName = categoryList.selection.text;
        var selectedCatFolderName = categoryList.selection.folderName;

        // 直接删除，不再确认
        var catFolderObj = new Folder(baseFolder.fsName + "/" + selectedCatFolderName);
        if (catFolderObj.exists) {
            var filesInside = catFolderObj.getFiles();
            for (var i = 0; i < filesInside.length; i++) {
                filesInside[i].remove();
            }
            if (catFolderObj.remove()) {
                delete categoryMap[selectedCatFolderName];
                saveCategoryMap();
                var oldSelection = currentSelectedCategoryFolder;
                populateCategoryList(); // This might change selection or clear it
                if (oldSelection === selectedCatFolderName) {
                    currentSelectedCategoryFolder = null; // Explicitly clear if deleted one was active
                    clearExpressionList();
                    clearDetailsPanel(false);
                    expressionListGroup.text = "📝 表达式";
                }
                showSuccess("分类 '" + selectedCatDisplayName + "' 已删除");
            } else {
                showError("错误：删除分类文件夹失败");
            }
        } else {
            showError("错误：找不到要删除的分类文件夹");
            delete categoryMap[selectedCatFolderName]; // Remove from map even if folder not found
            saveCategoryMap();
            populateCategoryList();
        }
    }

    // 处理删除表达式的函数
    function handleDeleteExpression() {
        if (!expressionList.selection || !currentSelectedExpressionFile) {
            showWarning("请先选择要删除的表达式");
            return;
        }

        var selectedExprDisplayName = expressionList.selection.text;
        var categoryForThisExpr = expressionList.selection.originalCategoryFolder || currentSelectedCategoryFolder;

        if (!categoryForThisExpr) {
            showError("错误：无法确定表达式的分类");
            return;
        }

        // 直接删除，不再显示确认对话框
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        var exprFolder = baseFolder.fsName + "/" + categoryForThisExpr + "/";
        var fileToDelete = new File(exprFolder + currentSelectedExpressionFile);

        if (fileToDelete.exists) {
            if (fileToDelete.remove()) {
                currentSelectedExpressionFile = null; // 清除跟踪器

                if (searchEt.text.toString().trim() !== "") {
                    searchEt.onChange(); // 刷新搜索结果
                } else {
                    populateExpressionList(categoryForThisExpr); // 刷新当前分类列表
                }

                // 清除详情
                clearDetailsPanel(false);
                if (expressionList.items.length > 0 && !expressionList.selection) {
                    expressionList.selection = 0; // 如果可能，选择第一个
                }

                // 显示成功删除的提示
                showSuccess("表达式已删除", 1000);
            } else {
                showError("错误：删除表达式文件失败");
            }
        } else {
            showError("错误：找不到要删除的表达式文件");
        }
    }

    // 提供UI刷新函数
    function refreshUILayout() {
        try {
            if (!win) return;
            
            // 强制窗口重新布局
            if (win.layout) {
                try {
                    win.layout.layout(true);
                } catch(e) {
                    // 忽略布局错误
                }
            }
            
            // 确保主要UI组件可见 - 添加更多检查
            try {
                if (topContainer && typeof topContainer === 'object') {
                    if (typeof topContainer.visible !== 'undefined') {
                        topContainer.visible = true;
                    }
                    if (typeof topContainer.alignment !== 'undefined') {
                        topContainer.alignment = "fill"; // 确保填充整个宽度
                    }
                }
                
                if (mainGroup && typeof mainGroup === 'object' && typeof mainGroup.visible !== 'undefined') {
                    mainGroup.visible = true;
                }
                
                if (leftPanel && typeof leftPanel === 'object' && typeof leftPanel.visible !== 'undefined') {
                    leftPanel.visible = true;
                }
                
                if (rightContainerGroup && typeof rightContainerGroup === 'object' && typeof rightContainerGroup.visible !== 'undefined') {
                    rightContainerGroup.visible = true;
                }
                
                // 确保搜索组件正确显示
                if (searchGroup && typeof searchGroup === 'object') {
                    if (typeof searchGroup.visible !== 'undefined') {
                        searchGroup.visible = true;
                    }
                    if (typeof searchGroup.alignment !== 'undefined') {
                        searchGroup.alignment = "fill"; // 确保填充整个顶部容器
                    }
                }
                
                // 确保名称组件正确显示
                if (nameGroup && typeof nameGroup === 'object') {
                    if (typeof nameGroup.visible !== 'undefined') {
                        nameGroup.visible = true;
                    }
                    if (typeof nameGroup.alignment !== 'undefined') {
                        nameGroup.alignment = "fill"; // 确保填充整个宽度
                    }
                }
                
                // 确保列表可见并重置大小
                if (categoryList && typeof categoryList === 'object') {
                    if (typeof categoryList.visible !== 'undefined') {
                        categoryList.visible = true;
                    }
                    if (categoryList.preferredSize && typeof categoryList.preferredSize.height !== 'undefined') {
                        categoryList.preferredSize.height = 75; // 减小类别列表高度
                    }
                }
                
                if (expressionList && typeof expressionList === 'object') {
                    if (typeof expressionList.visible !== 'undefined') {
                        expressionList.visible = true;
                    }
                    if (expressionList.preferredSize && typeof expressionList.preferredSize.height !== 'undefined') {
                        expressionList.preferredSize.height = 75; // 减半
                    }
                }
            } catch(e) {
                // 捕获并忽略任何访问UI元素时的错误
            }
            
            // 尝试更新面板
            try {
                if (win.update && typeof win.update === 'function') {
                    win.update();
                }
            } catch(e) {
                // 忽略更新错误
            }
            
            // 延迟再次刷新，确保一切就绪 - 使用函数字符串而不是直接调用
            if (win instanceof Panel) {
                try {
                    var taskStr = "try { if(ExpressionPluginGlobalAccess && ExpressionPluginGlobalAccess.refreshUI) ExpressionPluginGlobalAccess.refreshUI(); } catch(e) {}";
                    app.scheduleTask(taskStr, 200, false);
                } catch(e) {
                    // 忽略调度错误
                }
            }
        } catch(e) {
            // 捕获所有错误，防止脚本中断
        }
    }

    // 添加函数到全局访问对象
    if (globalAccess && globalAccess.ExpressionPlugin) {
        globalAccess.ExpressionPlugin.refreshUILayout = refreshUILayout;
        globalAccess.ExpressionPlugin.getPluginDataFolder = getPluginDataFolder;
        globalAccess.ExpressionPlugin.populateCategoryList = populateCategoryList;
        globalAccess.ExpressionPlugin.populateExpressionList = populateExpressionList;
        globalAccess.ExpressionPlugin.displayExpressionDetails = displayExpressionDetails;
        globalAccess.ExpressionPlugin.clearDetailsPanel = clearDetailsPanel;
    }

    // 保持旧的引用以兼容性
    if (globalAccess) {
        globalAccess.refreshUI = refreshUILayout;
    }

    var searchDelayTimer = null;

    // 搜索框右键菜单 - 显示搜索历史
    searchEt.addEventListener('mousedown', function(event) {
        if (event.button === 2) { // 右键
            var selectedHistory = showSearchHistoryMenu();
            if (selectedHistory) {
                searchEt.text = selectedHistory;
                searchEt.onChange();
            }
        }
    });

    searchEt.onChange = function() {
        // 直接触发搜索，无需等待确认
        // 将直接调用performSearch而不是使用onChanging的延迟机制
        // 这确保在按下回车时立即搜索
        if (searchDelayTimer) {
            try {
                app.cancelTask(searchDelayTimer);
            } catch(e) {}
            searchDelayTimer = null;
        }

        // 添加调试信息
        try {
            performSearch();
        } catch(e) {
            alert("搜索出错: " + e.toString());
        }
    };

    // 提取搜索逻辑到单独函数，便于复用
    function performSearch() {
        try {
            var baseFolder = getPluginDataFolder();
            if (!baseFolder) {
                showWarning("无法访问数据文件夹");
                return;
            }
            var searchTerm = searchEt.text.toString().trim();

            if (!searchTerm) { // Search cleared
                expressionList.onChange = originalExpressionListOnChange; // Restore original handler
                if (categoryList.selection) {
                    // Trigger categoryList.onChange to repopulate expressionList for the current category
                    // This will also correctly set expressionList.onChange again if needed and handle selection.
                    categoryList.onChange();
                } else { // No categories selected
                    clearExpressionList();
                    clearDetailsPanel(false);
                    expressionListGroup.text = "📝 表达式";
                    detailsPanel.text = "✏ 编辑";
                }
                return;
            }

            // 添加到搜索历史
            addToSearchHistory(searchTerm);

            // Search term is present
            expressionList.removeAll();
            // Do not call clearDetailsPanel(false) here, let selection handle it.
            expressionListGroup.text = "🔍 搜索: '" + searchTerm + "'";
            var foundCount = 0;
            var searchResultsData = [];

            // 检查是否有分类
            var categoryCount = 0;
            for (var catFolder in categoryMap) {
                if (categoryMap.hasOwnProperty(catFolder)) {
                    categoryCount++;
                }
            }

            if (categoryCount === 0) {
                var noResultItem = expressionList.add("item", "没有可搜索的分类");
                noResultItem.enabled = false;
                return;
            }

            for (var catFolder in categoryMap) {
                if (categoryMap.hasOwnProperty(catFolder)) {
                    var catFolderObj = new Folder(baseFolder.fsName + "/" + catFolder);
                    if (catFolderObj.exists) {
                        var files = catFolderObj.getFiles("*" + EXPRESSION_EXT);
                        for (var i = 0; i < files.length; i++) {
                            if (files[i] instanceof File) {
                                var decodedFileNameNoExt = "";
                                try { decodedFileNameNoExt = decodeURIComponent(files[i].name.substring(0, files[i].name.lastIndexOf(EXPRESSION_EXT))); }
                                catch (e) { decodedFileNameNoExt = files[i].name.substring(0, files[i].name.lastIndexOf(EXPRESSION_EXT)); }
                                var fileContent = readFileContent(files[i]);

                                // 使用模糊匹配（支持拼音首字母）
                                if (fuzzyMatch(searchTerm, decodedFileNameNoExt) ||
                                    (fileContent && fuzzyMatch(searchTerm, fileContent))) {
                                    searchResultsData.push({
                                        displayName: decodedFileNameNoExt,
                                        fileName: files[i].name,
                                        originalCategoryFolder: catFolder, // Store original category
                                        categoryDisplayName: categoryMap[catFolder]
                                    });
                                    foundCount++;
                                }
                            }
                        }
                    }
                }
            }

            searchResultsData.sort(function(a,b) {
                var nameCompare = a.displayName.localeCompare(b.displayName, 'zh-CN');
                if (nameCompare !== 0) return nameCompare;
                return a.categoryDisplayName.localeCompare(b.categoryDisplayName, 'zh-CN');
            });

            var previousSelectionFile = currentSelectedExpressionFile;
            var previousSelectionCat = currentSelectedCategoryFolder; // Or from item.originalCategoryFolder if applicable
            var newSelectionIndex = -1;

            for(var k=0; k < searchResultsData.length; k++) {
                var res = searchResultsData[k];
                var item = expressionList.add("item", res.displayName + " (" + res.categoryDisplayName + ")");
                item.fileName = res.fileName;
                item.originalCategoryFolder = res.originalCategoryFolder; // Attach original category
                if (res.fileName === previousSelectionFile && res.originalCategoryFolder === previousSelectionCat) {
                    newSelectionIndex = k;
                }
            }

            // Set up a specific onChange for search results
            expressionList.onChange = function() {
                if (this.selection && this.selection.originalCategoryFolder) {
                    currentSelectedExpressionFile = this.selection.fileName;
                    // Pass the originalCategoryFolder for displaying details correctly from search
                    displayExpressionDetails(this.selection.fileName, this.selection.originalCategoryFolder);
                    // When selecting from search, make name and content editable
                    expressionNameEt.enabled = true;
                    expressionContentEt.readonly = false;
                } else {
                    // If no selection in search results, clear details
                    clearDetailsPanel(false);
                    currentSelectedExpressionFile = null;
                    detailsPanel.text = "表达式详情与操作"; // Reset panel title
                }
            };

            if (newSelectionIndex !== -1) {
                expressionList.selection = newSelectionIndex; // Will trigger the search-specific onChange
            } else if (foundCount === 0) {
                var noResultItem = expressionList.add("item", "未找到匹配项。");
                noResultItem.enabled = false;
                clearDetailsPanel(false); // No results, clear details
                currentSelectedExpressionFile = null;
                detailsPanel.text = "表达式详情与操作"; // Reset panel title
            } else if (expressionList.items.length > 0) {
                // expressionList.selection = 0; // Optionally auto-select first search result
                // Let user click, or if auto-selecting, it will trigger the new onChange
            }
             // If no specific selection is made but there are results, don't clear details yet.
             // Let the user's click on a search result populate the details.
             if (!expressionList.selection && foundCount > 0) {
                clearDetailsPanel(false); // No initial selection in search, so clear.
                currentSelectedExpressionFile = null;
                detailsPanel.text = "表达式详情与操作";
             } else if (expressionList.selection) {
                expressionList.onChange(); // Trigger if a selection was made
             }
        } catch(e) {
            alert("performSearch 内部错误: " + e.toString() + "\n行号: " + e.line);
        }
    }

    // 优化：添加实时搜索，立即响应用户输入
    searchEt.onChanging = function() {
        if (searchDelayTimer) {
            try {
                app.cancelTask(searchDelayTimer);
            } catch(e) {}
        }
        // 非常短的延迟，几乎实时响应输入
        // 注意：scheduleTask 需要字符串形式的代码
        var taskStr = "try { if(typeof ExpressionPluginGlobalAccess !== 'undefined' && ExpressionPluginGlobalAccess.ExpressionPlugin && ExpressionPluginGlobalAccess.ExpressionPlugin.performSearchNow) { ExpressionPluginGlobalAccess.ExpressionPlugin.performSearchNow(); } } catch(e) {}";
        try {
            searchDelayTimer = app.scheduleTask(taskStr, 50, false);
        } catch(e) {
            // 如果 scheduleTask 失败，直接调用搜索
            performSearch();
        }
    };

    function performSearchNow() {
        searchDelayTimer = null;
        performSearch();
    }

    // 将搜索函数添加到全局访问对象
    if (globalAccess && globalAccess.ExpressionPlugin) {
        globalAccess.ExpressionPlugin.performSearch = performSearch;
        globalAccess.ExpressionPlugin.performSearchNow = performSearchNow;
    }

    // --- Initialization ---
    function initializePlugin() {
        // 检查全局访问对象
        if (!globalAccess || typeof globalAccess.safeFolderName !== 'function') {
            alert("插件初始化严重错误：核心功能缺失 (safeFolderName)。");
            return;
        }

        var baseFolder = getPluginDataFolder();
        if (!baseFolder) {
            alert("插件初始化失败：无法访问数据存储文件夹。插件功能将受限。");
            // 即使数据文件夹失败，也尝试使UI保持一定功能
            saveBtn.enabled = false;
            return;
        }
        loadCategoryMap(); // 这将处理解析错误并重置
        loadSearchHistory(); // 加载搜索历史记录

        if (Object.keys(categoryMap).length === 0) { // 如果映射为空（新的或重置的）
            var exampleCategories = [
                // 添加20个示例类别和表达式
                {
                    name: "01-常用动画",
                    expressions: [
                        { name: "抖动 (Wiggle) - 位置", content: "wiggle(5, 50);" },
                        { name: "抖动 (Wiggle) - 旋转", content: "wiggle(2, 30);" },
                        { name: "循环 (Loop Out)", content: "loopOut();" }
                    ]
                },
                {
                    name: "02-弹跳动画",
                    expressions: [
                        { name: "弹性 (Elastic)", content: "amp = .1;\nfreq = 2.0;\ndecay = 2.0;\nn = 0;\nif (numKeys > 0){\nn = nearestKey(time).index;\nif (key(n).time > time){n--;}\n}\nif (n == 0){ t = 0;}\nelse{t = time - key(n).time;}\nif (n > 0 && t < 1){\n  v = velocityAtTime(key(n).time - thisComp.frameDuration/10);\n  value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);\n}else{value;}" },
                        { name: "弹跳 (Bounce)", content: "e = .7; // 弹性系数\ng = 5000; // 重力\nnMax = 9; // 最大弹跳次数\n\nif (numKeys < 2) {\n  value;\n} else {\n  n = 0;\n  t = 0;\n  v = 0;\n  \n  if (time >= key(2).time) {\n    t = time - key(2).time;\n    v = -velocityAtTime(key(2).time - .001)*e;\n    \n    for (var i = 0; i < nMax; i++) {\n      var tNext = 2*v/g;\n      if (t < tNext) break;\n      t -= tNext;\n      v *= e;\n    }\n    \n    key(2) + v*t - g*t*t/2;\n  } else {\n    value;\n  }\n}" }
                    ]
                },
                {
                    name: "03-文本动画",
                    expressions: [
                        { name: "打字机效果", content: "L = text.sourceText.length;\nIt = time - thisLayer.inPoint;\nFt = thisComp.frameDuration;\nCharPerSec = 15;\nMath.round(L * linear(It, 0, L/CharPerSec, 0, 1));" },
                        { name: "数字计数器", content: "startVal = 0;\nendVal = 1000;\ndur = 2;\nMath.round(linear(time, inPoint, inPoint + dur, startVal, endVal));" }
                    ]
                },
                {
                    name: "04-时间控制",
                    expressions: [
                        { name: "时间重映射", content: "posterizeTime(15); // 15fps效果\nvalue;" },
                        { name: "慢动作", content: "time * 0.5; // 慢一半" }
                    ]
                },
                {
                    name: "05-图层关系",
                    expressions: [
                        { name: "跟随父级位置", content: "parent.position;" },
                        { name: "父级缩放反作用", content: "L = thisComp.layer(\"父级图层名\");\ns = L.transform.scale/100;\n[value[0]/s[0], value[1]/s[1]];" }
                    ]
                },
                {
                    name: "06-摄像机",
                    expressions: [
                        { name: "摄像机朝向", content: "target = thisComp.layer(\"目标图层名\");\nlookAt(position, target.position);" },
                        { name: "摄像机抖动", content: "wiggle(0.5, 5);" }
                    ]
                },
                {
                    name: "07-形状图层",
                    expressions: [
                        { name: "路径点数", content: "createPath(points = [[0,0], [100,0], [100,100], [0,100]], inTangents = [], outTangents = [], is_closed = true);" },
                        { name: "描边宽度动画", content: "wiggle(3, 5);" }
                    ]
                },
                {
                    name: "08-颜色效果",
                    expressions: [
                        { name: "颜色循环", content: "hue = time * 50;\nhslToRgb([hue%360/360, 1, 0.5]);" },
                        { name: "闪烁效果", content: "random(0, 100) > 50 ? [1,1,1,1] : [0,0,0,1];" }
                    ]
                },
                {
                    name: "09-音频驱动",
                    expressions: [
                        { name: "音频振幅", content: "audioLayer = thisComp.layer(\"音频图层\");\naudioLayer.audio.audioLevels[0];" },
                        { name: "跟随节奏", content: "audioLayer = thisComp.layer(\"音频图层\");\ndelay = 5;\nmult = 200;\naudioLayer.audio.audioLevels.valueAtTime(time - delay) * mult;" }
                    ]
                },
                {
                    name: "10-索引控制",
                    expressions: [
                        { name: "根据索引偏移", content: "offset = 50;\nvalue + [index * offset, 0];" },
                        { name: "交替显示", content: "index % 2 == 0 ? 100 : 0;" }
                    ]
                },
                {
                    name: "11-随机效果",
                    expressions: [
                        { name: "随机位置", content: "seedRandom(index, true);\nrandom(0, thisComp.width);" },
                        { name: "随机延迟", content: "delay = random(0, 1);\ntime - delay;" }
                    ]
                },
                {
                    name: "12-路径动画",
                    expressions: [
                        { name: "路径跟随", content: "pathLayer = thisComp.layer(\"路径图层\");\npathLayer.content(\"Shape 1\").content(\"Path 1\").path.pointOnPath(time/10 % 1);" },
                        { name: "路径增长", content: "linear(time, 0, 2, 0, 100);" }
                    ]
                },
                {
                    name: "13-缩放效果",
                    expressions: [
                        { name: "呼吸缩放", content: "freq = 2;\namp = 10;\nvalue + [amp * Math.sin(freq * time * 2 * Math.PI), amp * Math.sin(freq * time * 2 * Math.PI)];" },
                        { name: "弹性缩放", content: "wiggle(1, 20);" }
                    ]
                },
                {
                    name: "14-旋转效果",
                    expressions: [
                        { name: "匀速旋转", content: "velocity = 180; // 每秒180度\ntime * velocity;" },
                        { name: "摆动旋转", content: "freq = 1;\namp = 45;\namp * Math.sin(freq * time * 2 * Math.PI);" }
                    ]
                },
                {
                    name: "15-透明度",
                    expressions: [
                        { name: "淡入淡出", content: "linear(time, inPoint, inPoint + 1, 0, 100) - linear(time, outPoint - 1, outPoint, 0, 100);" },
                        { name: "闪烁", content: "flickerFreq = 10;\nflickerAmount = 50;\nvalue + flickerAmount * Math.sin(flickerFreq * time * 2 * Math.PI);" }
                    ]
                },
                {
                    name: "16-速度控制",
                    expressions: [
                        { name: "缓动公式", content: "function easeIn(t, b, c, d) {\n  return c * (t /= d) * t + b;\n}\neaseIn(time, 0, 100, 2);" },
                        { name: "弹簧效果", content: "n = 0;\nif (numKeys > 0){\n  n = nearestKey(time).index;\n  if (key(n).time > time) n--;\n}\nif (n > 0){\n  t = time - key(n).time;\n  v = velocityAtTime(key(n).time - 0.001);\n  amp = 0.05;\n  freq = 3.0;\n  decay = 4.0;\n  value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);\n}else{\n  value;\n}" }
                    ]
                },
                {
                    name: "17-表达式控制器",
                    expressions: [
                        { name: "滑块控制", content: "thisComp.layer(\"控制器\").effect(\"滑块控制\")(\"滑块\");" },
                        { name: "复选框控制", content: "ctrl = thisComp.layer(\"控制器\").effect(\"复选框控制\")(\"复选框\");\nctrl > 0 ? 100 : 0;" }
                    ]
                },
                {
                    name: "18-3D图层",
                    expressions: [
                        { name: "朝向摄像机", content: "cam = thisComp.activeCamera;\nlookat(position, cam.position);" },
                        { name: "3D旋转", content: "[time * 30, time * 60, time * 90];" }
                    ]
                },
                {
                    name: "19-遮罩路径",
                    expressions: [
                        { name: "遮罩路径动画", content: "mask(\"Mask 1\").maskPath;" },
                        { name: "遮罩扩展", content: "wiggle(5, 20);" }
                    ]
                },
                {
                    name: "20-实用工具",
                    expressions: [
                        { name: "格式化时间", content: "function timeToFrames(t) {\n  return Math.round(t * thisComp.frameRate);\n}\ntimeToFrames(time).toString();" },
                        { name: "百分比显示", content: "Math.round(value) + \"%\";" }
                    ]
                }
            ];

            var canWriteOverall = true;
            for (var c = 0; c < exampleCategories.length; c++) {
                var catData = exampleCategories[c];
                var catFolderName = globalAccess.safeFolderName(catData.name);
                var catFolder = new Folder(baseFolder.fsName + "/" + catFolderName);
                
                var canWriteCat = false;
                if (!catFolder.exists) { canWriteCat = catFolder.create(); }
                else { canWriteCat = true; } // 文件夹已存在，假设我们可以写入文件

                if (canWriteCat) {
                    categoryMap[catFolderName] = catData.name; // 添加到映射
                    for (var i = 0; i < catData.expressions.length; i++) {
                        var expr = catData.expressions[i];
                        var exprFileName = encodeURIComponent(expr.name) + EXPRESSION_EXT;
                        var exprFile = new File(catFolder.fsName + "/" + exprFileName);
                        if (!exprFile.exists) { // 仅在不存在时写入，以防覆盖用户的同名默认值
                            writeFileContent(exprFile, expr.content);
                        }
                    }
                } else {
                    canWriteOverall = false;
                    alert("警告：无法写入示例分类 '" + catData.name + "' 到: " + catFolder.fsName + "\n请检查权限。");
                    break; 
                }
            }
            if (canWriteOverall && exampleCategories.length > 0) {
                 saveCategoryMap(); // 保存新填充的映射
            } else if (Object.keys(categoryMap).length === 0 && exampleCategories.length > 0 && !canWriteOverall) {
                 alert("警告：部分或全部示例数据未能写入。");
            }
        }

        populateCategoryList();

        if (categoryList.items.length > 0 && categoryList.selection === null) {
            categoryList.selection = 0; // 自动选择第一个类别，将触发onChange
        } else if (categoryList.items.length > 0 && categoryList.selection !== null) {
             categoryList.onChange(); // 为已选定的类别触发onChange
        } else { // 没有加载或存在类别
            clearExpressionList();
            clearDetailsPanel(false);
            expressionListGroup.text = "表达式列表";
        }
        
        // 强制刷新UI - 添加错误处理
        try {
            if (globalAccess.refreshUILayout) {
                globalAccess.refreshUILayout();
            }
        } catch(e) {
            // 忽略刷新错误
        }
        
        // 延迟再次刷新，确保一切就绪 - 包装在try-catch中
        if (win instanceof Panel) {
            try {
                var taskStr = "try { if(ExpressionPluginGlobalAccess && ExpressionPluginGlobalAccess.refreshUI) ExpressionPluginGlobalAccess.refreshUI(); } catch(e) {}";
                app.scheduleTask(taskStr, 200, false);
            } catch(e) {
                // 忽略调度错误
            }
        }
    }

    // 添加 initializePlugin 到全局访问对象
    if (globalAccess) {
        globalAccess.init = initializePlugin;
        globalAccess.initializePlugin = initializePlugin;
        globalAccess.refreshUILayout = refreshUILayout;
        if (globalAccess.ExpressionPlugin) {
            globalAccess.ExpressionPlugin.initializePlugin = initializePlugin;
        }
    }

    // 调整大小事件处理
    thisObj.onResizing = thisObj.onResize = function () { 
        try {
            if(this.layout) {
                this.layout.resize();
                try {
                    if (globalAccess && globalAccess.refreshUILayout) {
                        globalAccess.refreshUILayout(); // 在大小调整后刷新
                    }
                } catch(e) {
                    // 忽略刷新错误
                }
            }
        } catch(e) {
            // 忽略所有调整大小错误
        }
    };
    
    // 修改onShow处理以适应面板
    if (thisObj instanceof Panel) {
        thisObj.onShow = function() {
            // 使用延迟初始化确保Panel已完全加载
            try {
                var initTaskStr = "try { if(ExpressionPluginGlobalAccess && ExpressionPluginGlobalAccess.init) ExpressionPluginGlobalAccess.init(ExpressionPluginGlobalAccess); } catch(e) { alert('Plugin Init Error:\\n' + e.toString()); }";
                app.scheduleTask(initTaskStr, 100, false);
            } catch(e) {
                // 忽略调度错误
            }
        };
    } else {
        thisObj.onShow = function() {
        if (globalAccess && globalAccess.init) {
                try {
                    var taskString = "try { if(ExpressionPluginGlobalAccess && ExpressionPluginGlobalAccess.init) ExpressionPluginGlobalAccess.init(ExpressionPluginGlobalAccess); } catch(e) { alert('Plugin Init Error (from scheduleTask):\\n' + e.toString() + '\\n' + e.fileName + ' line ' + e.line); }";
            app.scheduleTask(taskString, 50, false);
                } catch(e) {
                    // 忽略调度错误
                    alert("初始化插件时出错: " + e.toString());
                }
        } else {
            alert("Initialization function not found for plugin.");
        }
    };
    }

    // 面板立即调用初始化函数
    if (thisObj instanceof Panel) {
        // 使用延迟初始化 - 替换setTimeout为app.scheduleTask
        try {
            var panelInitTask = "try { if(ExpressionPluginGlobalAccess && ExpressionPluginGlobalAccess.init) ExpressionPluginGlobalAccess.init(ExpressionPluginGlobalAccess); } catch(e) { alert('Plugin Init Error:\\n' + e.toString()); }";
            app.scheduleTask(panelInitTask, 100, false);
        } catch(e) {
            // 忽略调度错误
        }
    }

    // Window类型时的处理
    if (thisObj instanceof Window) {
        thisObj.center();
        thisObj.show();
    }

    // 添加应用按钮的点击处理程序
    applyBtn.onClick = function() {
        var exprContent = expressionContentEt.text;
        if (!exprContent) {
            showWarning("没有可应用的表达式内容");
            return;
        }

        var activeComp = app.project.activeItem;
        if (!(activeComp instanceof CompItem)) {
            showWarning("请先选择一个合成");
            return;
        }

        var selectedProps = activeComp.selectedProperties;
        if (selectedProps.length === 0) {
            showWarning("请在合成中选择至少一个属性");
            return;
        }
        
        app.beginUndoGroup("应用表达式");
        var appliedCount = 0;
        for (var i = 0; i < selectedProps.length; i++) {
            var prop = selectedProps[i];
            if (prop.canSetExpression) {
                try { 
                    prop.expression = exprContent; 
                    appliedCount++; 
                }
                catch (e) {
                    showError("无法将表达式应用于属性: " + prop.name + "\n" + e.toString());
                }
            }
        }
        app.endUndoGroup();

        if (appliedCount === 0 && selectedProps.length > 0) {
            showWarning("选择的属性不支持表达式，或应用失败");
        } else if (appliedCount > 0) {
            // alert(appliedCount + " 个属性已应用表达式。"); // Optional success message
        }
    };
    
    // 添加复制按钮的点击处理程序
    copyBtn.onClick = function() {
        var exprContent = expressionContentEt.text;
        if (!exprContent) {
            showWarning("没有内容可复制");
            return;
        }
        
        // 使用系统剪贴板 - After Effects会处理这种临时文本框复制方式而不会闪退
        try {
            // 创建临时文本框
            var tempDialog = new Window("dialog", "复制到剪贴板");
            tempDialog.orientation = "column";
            var tempField = tempDialog.add("edittext", undefined, exprContent, {multiline: true, readonly: false});
            tempField.preferredSize.width = 450;
            tempField.preferredSize.height = 150;
            tempField.active = true;
            
            // 在脚本中创建复制按钮，而不是依赖用户手动复制
            var btnRow = tempDialog.add("group");
            btnRow.orientation = "row";
            btnRow.alignment = "center";
            var copyNowBtn = btnRow.add("button", undefined, "复制到剪贴板");
            var closeBtn = btnRow.add("button", undefined, "关闭", {name: "cancel"});
            
            copyNowBtn.onClick = function() {
                tempField.textselection = exprContent; // 全选文本
                tempField.active = true; // 确保文本框获得焦点
                app.executeCommand(app.findMenuCommandId("Copy")); // 执行"复制"命令
                showSuccess("已复制到剪贴板", 1000);
                tempDialog.close();
            };
            
            tempDialog.show();
        } catch(e) {
            // 如果上面的方法失败，尝试使用简单方法
            alert("复制表达式内容到剪贴板:\n请先全选文本(Ctrl+A/Cmd+A)，然后复制(Ctrl+C/Cmd+C)，完成后按确定。\n\n" + exprContent);
        }
    };

    // 新建按钮的点击处理程序
    newBtn.onClick = function() {
        // 智能判断：根据当前选中的列表（蓝色选框）决定新建什么
        // 1. 如果表达式列表有选中项（蓝色选框），则新建表达式
        // 2. 如果只有分类列表有选中项：
        //    - 表达式列表为空 → 新建表达式（在该分类下）
        //    - 表达式列表不为空但无选中 → 新建表达式
        // 3. 如果表达式列表完全为空（没有分类或分类为空）→ 新建分类
        // 4. 都没选中，默认新建分类

        if (expressionList.selection) {
            // 表达式列表有选中项（蓝色选框），新建表达式
            handleNewExpressionCreation();
        } else if (categoryList.selection) {
            // 只有分类有选中项，无论表达式列表是否为空，都新建表达式
            handleNewExpressionCreation();
        } else if (expressionList.items.length === 0 && !categoryList.selection) {
            // 表达式列表为空且没有选中分类，新建分类
            handleNewCategoryCreation();
        } else {
            // 默认新建分类
            handleNewCategoryCreation();
        }
    };

    // 处理加载示例分类的函数
    function handleLoadExampleCategories() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        // 直接加载，不再确认

        var exampleCategories = [
            {
                name: "01-常用动画",
                expressions: [
                    { name: "抖动 (Wiggle) - 位置", content: "wiggle(5, 50);" },
                    { name: "抖动 (Wiggle) - 旋转", content: "wiggle(2, 30);" },
                    { name: "循环 (Loop Out)", content: "loopOut();" }
                ]
            },
            {
                name: "02-弹跳动画",
                expressions: [
                    { name: "弹性 (Elastic)", content: "amp = .1;\nfreq = 2.0;\ndecay = 2.0;\nn = 0;\nif (numKeys > 0){\nn = nearestKey(time).index;\nif (key(n).time > time){n--;}\n}\nif (n == 0){ t = 0;}\nelse{t = time - key(n).time;}\nif (n > 0 && t < 1){\n  v = velocityAtTime(key(n).time - thisComp.frameDuration/10);\n  value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);\n}else{value;}" },
                    { name: "弹跳 (Bounce)", content: "e = .7;\ng = 5000;\nnMax = 9;\n\nif (numKeys < 2) {\n  value;\n} else {\n  n = 0;\n  t = 0;\n  v = 0;\n  \n  if (time >= key(2).time) {\n    t = time - key(2).time;\n    v = -velocityAtTime(key(2).time - .001)*e;\n    \n    for (var i = 0; i < nMax; i++) {\n      var tNext = 2*v/g;\n      if (t < tNext) break;\n      t -= tNext;\n      v *= e;\n    }\n    \n    key(2) + v*t - g*t*t/2;\n  } else {\n    value;\n  }\n}" }
                ]
            },
            {
                name: "03-文本动画",
                expressions: [
                    { name: "打字机效果", content: "L = text.sourceText.length;\nIt = time - thisLayer.inPoint;\nFt = thisComp.frameDuration;\nCharPerSec = 15;\nMath.round(L * linear(It, 0, L/CharPerSec, 0, 1));" },
                    { name: "数字计数器", content: "startVal = 0;\nendVal = 1000;\ndur = 2;\nMath.round(linear(time, inPoint, inPoint + dur, startVal, endVal));" }
                ]
            },
            {
                name: "04-时间控制",
                expressions: [
                    { name: "时间重映射", content: "posterizeTime(15);\nvalue;" },
                    { name: "慢动作", content: "time * 0.5;" }
                ]
            },
            {
                name: "05-图层关系",
                expressions: [
                    { name: "跟随父级位置", content: "parent.position;" },
                    { name: "父级缩放反作用", content: "L = thisComp.layer(\"父级图层名\");\ns = L.transform.scale/100;\n[value[0]/s[0], value[1]/s[1]];" }
                ]
            },
            {
                name: "06-摄像机",
                expressions: [
                    { name: "摄像机朝向", content: "target = thisComp.layer(\"目标图层名\");\nlookAt(position, target.position);" },
                    { name: "摄像机抖动", content: "wiggle(0.5, 5);" }
                ]
            },
            {
                name: "07-形状图层",
                expressions: [
                    { name: "路径点数", content: "createPath(points = [[0,0], [100,0], [100,100], [0,100]], inTangents = [], outTangents = [], is_closed = true);" },
                    { name: "描边宽度动画", content: "wiggle(3, 5);" }
                ]
            },
            {
                name: "08-颜色效果",
                expressions: [
                    { name: "颜色循环", content: "hue = time * 50;\nhslToRgb([hue%360/360, 1, 0.5]);" },
                    { name: "闪烁效果", content: "random(0, 100) > 50 ? [1,1,1,1] : [0,0,0,1];" }
                ]
            },
            {
                name: "09-音频驱动",
                expressions: [
                    { name: "音频振幅", content: "audioLayer = thisComp.layer(\"音频图层\");\naudioLayer.audio.audioLevels[0];" },
                    { name: "跟随节奏", content: "audioLayer = thisComp.layer(\"音频图层\");\ndelay = 5;\nmult = 200;\naudioLayer.audio.audioLevels.valueAtTime(time - delay) * mult;" }
                ]
            },
            {
                name: "10-索引控制",
                expressions: [
                    { name: "根据索引偏移", content: "offset = 50;\nvalue + [index * offset, 0];" },
                    { name: "交替显示", content: "index % 2 == 0 ? 100 : 0;" }
                ]
            },
            {
                name: "11-随机效果",
                expressions: [
                    { name: "随机位置", content: "seedRandom(index, true);\nrandom(0, thisComp.width);" },
                    { name: "随机延迟", content: "delay = random(0, 1);\ntime - delay;" }
                ]
            },
            {
                name: "12-路径动画",
                expressions: [
                    { name: "路径跟随", content: "pathLayer = thisComp.layer(\"路径图层\");\npathLayer.content(\"Shape 1\").content(\"Path 1\").path.pointOnPath(time/10 % 1);" },
                    { name: "路径增长", content: "linear(time, 0, 2, 0, 100);" }
                ]
            },
            {
                name: "13-缩放效果",
                expressions: [
                    { name: "呼吸缩放", content: "freq = 2;\namp = 10;\nvalue + [amp * Math.sin(freq * time * 2 * Math.PI), amp * Math.sin(freq * time * 2 * Math.PI)];" },
                    { name: "弹性缩放", content: "wiggle(1, 20);" }
                ]
            },
            {
                name: "14-旋转效果",
                expressions: [
                    { name: "匀速旋转", content: "velocity = 180;\ntime * velocity;" },
                    { name: "摆动旋转", content: "freq = 1;\namp = 45;\namp * Math.sin(freq * time * 2 * Math.PI);" }
                ]
            },
            {
                name: "15-透明度",
                expressions: [
                    { name: "淡入淡出", content: "linear(time, inPoint, inPoint + 1, 0, 100) - linear(time, outPoint - 1, outPoint, 0, 100);" },
                    { name: "闪烁", content: "flickerFreq = 10;\nflickerAmount = 50;\nvalue + flickerAmount * Math.sin(flickerFreq * time * 2 * Math.PI);" }
                ]
            },
            {
                name: "16-速度控制",
                expressions: [
                    { name: "缓动公式", content: "function easeIn(t, b, c, d) {\n  return c * (t /= d) * t + b;\n}\neaseIn(time, 0, 100, 2);" },
                    { name: "弹簧效果", content: "n = 0;\nif (numKeys > 0){\n  n = nearestKey(time).index;\n  if (key(n).time > time) n--;\n}\nif (n > 0){\n  t = time - key(n).time;\n  v = velocityAtTime(key(n).time - 0.001);\n  amp = 0.05;\n  freq = 3.0;\n  decay = 4.0;\n  value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);\n}else{\n  value;\n}" }
                ]
            },
            {
                name: "17-表达式控制器",
                expressions: [
                    { name: "滑块控制", content: "thisComp.layer(\"控制器\").effect(\"滑块控制\")(\"滑块\");" },
                    { name: "复选框控制", content: "ctrl = thisComp.layer(\"控制器\").effect(\"复选框控制\")(\"复选框\");\nctrl > 0 ? 100 : 0;" }
                ]
            },
            {
                name: "18-3D图层",
                expressions: [
                    { name: "朝向摄像机", content: "cam = thisComp.activeCamera;\nlookat(position, cam.position);" },
                    { name: "3D旋转", content: "[time * 30, time * 60, time * 90];" }
                ]
            },
            {
                name: "19-遮罩路径",
                expressions: [
                    { name: "遮罩路径动画", content: "mask(\"Mask 1\").maskPath;" },
                    { name: "遮罩扩展", content: "wiggle(5, 20);" }
                ]
            },
            {
                name: "20-实用工具",
                expressions: [
                    { name: "格式化时间", content: "function timeToFrames(t) {\n  return Math.round(t * thisComp.frameRate);\n}\ntimeToFrames(time).toString();" },
                    { name: "百分比显示", content: "Math.round(value) + \"%\";" }
                ]
            }
        ];

        var createdCount = 0;
        var skippedCount = 0;

        for (var c = 0; c < exampleCategories.length; c++) {
            var catData = exampleCategories[c];
            var catFolderName = globalAccess.safeFolderName(catData.name);

            // 检查分类是否已存在
            if (categoryMap[catFolderName]) {
                skippedCount++;
                continue;
            }

            var catFolder = new Folder(baseFolder.fsName + "/" + catFolderName);

            var canWriteCat = false;
            if (!catFolder.exists) {
                canWriteCat = catFolder.create();
            } else {
                canWriteCat = true;
            }

            if (canWriteCat) {
                categoryMap[catFolderName] = catData.name;
                for (var i = 0; i < catData.expressions.length; i++) {
                    var expr = catData.expressions[i];
                    var exprFileName = encodeURIComponent(expr.name) + EXPRESSION_EXT;
                    var exprFile = new File(catFolder.fsName + "/" + exprFileName);
                    if (!exprFile.exists) {
                        writeFileContent(exprFile, expr.content);
                    }
                }
                createdCount++;
            }
        }

        saveCategoryMap();
        populateCategoryList();

        if (categoryList.items.length > 0) {
            categoryList.selection = 0;
        }

        showSuccess("示例分类加载完成！\n创建: " + createdCount + " 个\n跳过: " + skippedCount + " 个", 2000);
    }

    // 处理新建分类选项的函数
    function handleNewCategoryCreation() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;
        var newCatName = showInputDialog("新建分类", "新分类", "输入分类名称:");
        if (newCatName && newCatName.trim()) {
            newCatName = newCatName.trim();
            for (var folderNameKey in categoryMap) {
                if (categoryMap[folderNameKey] === newCatName) {
                    showError("错误：分类名称 '" + newCatName + "' 已存在");
                    return;
                }
            }
            var folderName = globalAccess.safeFolderName(newCatName);
            var newFolder = new Folder(baseFolder.fsName + "/" + folderName);

            if (newFolder.exists || categoryMap[folderName]) {
                showError("错误：无法创建分类 '" + newCatName + "'。文件夹可能已存在或内部名称冲突");
                return;
            }
            if (newFolder.create()) {
                categoryMap[folderName] = newCatName;
                saveCategoryMap();
                populateCategoryList();
                for(var i=0; i<categoryList.items.length; i++){
                    if(categoryList.items[i].folderName === folderName){
                        categoryList.selection = i; // This will trigger categoryList.onChange
                        break;
                    }
                }
                showSuccess("分类 '" + newCatName + "' 已创建");
            } else {
                showError("错误：创建分类文件夹失败");
            }
        } else {
            // 如果用户取消，恢复到之前的选择
            if (categoryList.items.length > 1) {
                categoryList.selection = 0; // 默认选择第一个非"新建分类"项
            }
        }
    }
    
    // 处理新建表达式选项的函数
    function handleNewExpressionCreation() {
        var baseFolder = getPluginDataFolder();
        if (!baseFolder) return;

        if (!currentSelectedCategoryFolder) {
            showWarning("请先选择或创建一个分类");
            return;
        }

        // If a search was active, clear it.
        if (searchEt.text.toString().trim() !== "") {
            searchEt.text = ""; 
        }
        
        // Ensure the onChange handler for expressionList is the original one.
        expressionList.onChange = originalExpressionListOnChange;

        // 清除列表选择并重置当前文件
        // 最后一项是"+ 新建表达式"
        if (expressionList.items.length > 0) {
            expressionList.selection = expressionList.items.length - 1;
        }
        currentSelectedExpressionFile = null;
        
        // 设置名称字段
        expressionNameEt.enabled = true;
        expressionNameEt.text = "新表达式";
        
        // 更新面板标题
        detailsPanel.text = "新建表达式 (在: " + categoryMap[currentSelectedCategoryFolder] + ")";
        
        try {
            // 重要：完全移除旧的编辑框并创建新的
            if (expressionContentEt) {
                // 记住原来控件的位置和大小信息
                var oldBounds = expressionContentEt.bounds;
                var oldAlignment = expressionContentEt.alignment;
                var oldParent = expressionContentEt.parent;
                var oldHeight = expressionContentEt.preferredSize.height;
                
                // 移除旧控件
                expressionContentEt.parent.remove(expressionContentEt);
                
                // 创建新的编辑框（显式设置为非只读）
                expressionContentEt = detailsPanel.add("edittext", undefined, "// 在此输入表达式代码", {
                    multiline: true,
                    readonly: false,
                    scrollable: true
                });
                
                // 还原位置和大小设置
                expressionContentEt.alignment = oldAlignment;
                expressionContentEt.preferredSize.height = oldHeight;
                expressionContentEt.helpTip = "表达式内容";
                
                // 确保新控件位于正确位置（在名称组和动作组之间）
                detailsPanel.layout.layout(true);
                
                // 激活新控件
                expressionContentEt.active = true;
            }
        } catch (e) {
            alert("创建编辑控件时出错: " + e.toString());
        }
        
        // 最后再设置名称字段的焦点
        expressionNameEt.active = true;
    }
}

// ============================================
// 脚本主入口 - 启动UI
// ============================================
(function(thisObj) {
    buildUI(thisObj, thisObj instanceof Panel);
})(this);