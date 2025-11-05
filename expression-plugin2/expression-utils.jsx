// Expression Plugin 2 - Utility Functions
// 工具函数集合

// ============================================
// ExtendScript 兼容性补丁
// ============================================

// String.prototype.trim polyfill
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

// JSON polyfill - ExtendScript 不支持 JSON 对象
if (typeof JSON === 'undefined') {
    JSON = {
        parse: function(text) {
            if (typeof text !== 'string') {
                throw new Error('JSON.parse: 输入必须是字符串');
            }
            text = text.replace(/^\s+|\s+$/g, '');
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

                if (value === null) return 'null';
                if (value === undefined) return undefined;

                switch (typeof value) {
                    case 'string':
                        return quote(value);
                    case 'number':
                        return isFinite(value) ? String(value) : 'null';
                    case 'boolean':
                        return String(value);
                    case 'object':
                        if (!value) return 'null';

                        var partial = [];
                        var i, k, v;

                        if (Object.prototype.toString.call(value) === '[object Array]') {
                            var len = value.length;
                            for (i = 0; i < len; i++) {
                                partial[i] = str(i, value, level + 1) || 'null';
                            }
                            if (partial.length === 0) return '[]';
                            if (indent) {
                                return '[' + newline + gap + indent +
                                    partial.join(',' + newline + gap + indent) +
                                    newline + gap + ']';
                            }
                            return '[' + partial.join(',') + ']';
                        }

                        for (k in value) {
                            if (value.hasOwnProperty(k)) {
                                v = str(k, value, level + 1);
                                if (v !== undefined) {
                                    partial.push(quote(k) + ':' + (indent ? ' ' : '') + v);
                                }
                            }
                        }

                        if (partial.length === 0) return '{}';
                        if (indent) {
                            return '{' + newline + gap + indent +
                                partial.join(',' + newline + gap + indent) +
                                newline + gap + '}';
                        }
                        return '{' + partial.join(',') + '}';
                }
            }

            function quote(string) {
                var escapable = /[\\\"\x00-\x1f\x7f-\x9f]/g;
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

// ========================================
// 编码/解码函数 - 用于文件名和内容的安全存储
// ========================================

// 编码函数：将文本转换为十六进制字符串（支持中文）
function encodeText(input) {
    if (!input) return "";
    var encoded = "";
    for (var i = 0; i < input.length; i++) {
        var hex = input.charCodeAt(i).toString(16);
        encoded += ("0000" + hex).slice(-4); // 确保长度为4的十六进制数
    }
    return encoded;
}

// 解码函数：将十六进制字符串转换回文本
function decodeText(encoded) {
    if (!encoded) return "";
    var decoded = "";
    for (var i = 0; i < encoded.length; i += 4) {
        var hex = encoded.substr(i, 4);
        decoded += String.fromCharCode(parseInt(hex, 16));
    }
    return decoded;
}

// ========================================
// JSON 数据结构处理
// ========================================

// 创建表达式对象
function createExpressionData(name, content, propertyPath, description, category) {
    return {
        name: name || "新表达式",
        content: content || "// 在此输入表达式代码",
        propertyPath: propertyPath || "",
        description: description || "",
        category: category || "未分类",
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
    };
}

// 从 JSON 文件读取表达式数据
function readExpressionJSON(filePath) {
    var file = new File(filePath);
    if (!file.exists) return null;

    file.encoding = "UTF-8";
    file.open("r");
    var content = file.read();
    file.close();

    try {
        var data = JSON.parse(content);
        return data;
    } catch (e) {
        alert("JSON 解析错误: " + filePath + "\n" + e.toString());
        return null;
    }
}

// 写入表达式数据到 JSON 文件
function writeExpressionJSON(filePath, data) {
    var file = new File(filePath);
    file.encoding = "UTF-8";
    file.open("w");

    try {
        // 更新修改时间
        data.updateTime = new Date().toISOString();
        var jsonString = JSON.stringify(data, null, 2);
        file.write(jsonString);
        file.close();
        return true;
    } catch (e) {
        alert("JSON 写入错误: " + filePath + "\n" + e.toString());
        file.close();
        return false;
    }
}

// ========================================
// 属性路径处理
// ========================================

// 递归获取属性的完整路径
function getPropertyPath(property) {
    if (!property) return "";

    var path = property.name;
    var parentProp = property.parentProperty;

    // 递归获取父级属性的路径
    while (parentProp && parentProp.parentProperty !== null) {
        path = parentProp.name + "." + path;
        parentProp = parentProp.parentProperty;
    }

    return path;
}

// 获取选中图层的属性路径（支持多个属性）
function getSelectedPropertyPaths() {
    var activeComp = app.project.activeItem;
    if (!activeComp || !(activeComp instanceof CompItem)) {
        alert("请确保已打开一个合成。");
        return "";
    }

    var selectedLayers = activeComp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("请选中至少一个图层。");
        return "";
    }

    var paths = [];

    // 遍历选中的图层
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];

        // 如果图层有选中的属性，获取这些属性的路径
        if (layer.selectedProperties.length > 0) {
            for (var j = 0; j < layer.selectedProperties.length; j++) {
                var property = layer.selectedProperties[j];
                if (property.canSetExpression) {
                    var propertyPath = getPropertyPath(property);
                    if (propertyPath && paths.indexOf(propertyPath) === -1) {
                        paths.push(propertyPath);
                    }
                }
            }
        }
    }

    if (paths.length === 0) {
        alert("请选中图层的至少一个可设置表达式的属性。");
        return "";
    }

    // 使用 && 连接多个路径
    return paths.join("&&");
}

// 根据属性路径应用表达式
function applyExpressionByPath(layer, propertyPath, expressionContent) {
    if (!layer || !propertyPath || !expressionContent) return false;

    var propertyNames = propertyPath.split(".");
    var targetProperty = layer;

    // 遍历路径找到目标属性
    for (var i = 0; i < propertyNames.length; i++) {
        targetProperty = targetProperty[propertyNames[i]];
        if (targetProperty === undefined) {
            return false;
        }
    }

    // 设置表达式
    if (targetProperty && targetProperty.canSetExpression) {
        try {
            targetProperty.expression = expressionContent;
            return true;
        } catch (e) {
            return false;
        }
    }

    return false;
}

// ========================================
// 批量应用表达式
// ========================================

// 批量应用表达式到选中的图层
function applyExpressionBatch(expressionContent, propertyPaths) {
    var activeComp = app.project.activeItem;
    if (!activeComp || !(activeComp instanceof CompItem)) {
        alert("请确保已打开一个合成。");
        return;
    }

    var selectedLayers = activeComp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("请选中至少一个图层。");
        return;
    }

    if (!expressionContent) {
        alert("没有可应用的表达式内容。");
        return;
    }

    app.beginUndoGroup("批量应用表达式");

    var successCount = 0;
    var failedItems = [];
    var pathList = propertyPaths ? propertyPaths.split("&&") : [];

    // 遍历选中的图层
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];

        // 如果图层有选中的属性，优先应用到选中的属性
        if (layer.selectedProperties.length > 0) {
            for (var j = 0; j < layer.selectedProperties.length; j++) {
                var property = layer.selectedProperties[j];
                if (property.canSetExpression) {
                    try {
                        property.expression = expressionContent;
                        successCount++;
                    } catch (e) {
                        failedItems.push(layer.name + " > " + property.name);
                    }
                } else {
                    failedItems.push(layer.name + " > " + property.name + " (不支持表达式)");
                }
            }
        }
        // 否则，根据属性路径应用
        else if (pathList.length > 0) {
            for (var k = 0; k < pathList.length; k++) {
                var path = pathList[k].trim();
                if (path) {
                    if (applyExpressionByPath(layer, path, expressionContent)) {
                        successCount++;
                    } else {
                        failedItems.push(layer.name + " > " + path + " (路径无效)");
                    }
                }
            }
        }
    }

    app.endUndoGroup();

    // 显示结果
    var message = "成功应用: " + successCount + " 个属性";
    if (failedItems.length > 0) {
        message += "\n\n失败的项目:\n" + failedItems.slice(0, 10).join("\n");
        if (failedItems.length > 10) {
            message += "\n... 还有 " + (failedItems.length - 10) + " 个";
        }
    }

    if (successCount > 0 || failedItems.length > 0) {
        alert(message);
    }
}

// ========================================
// 分类管理
// ========================================

// 加载分类映射（从 category_map.json）
function loadCategoryMapJSON(baseFolder) {
    var mapFile = new File(baseFolder.fsName + "/category_map.json");
    if (!mapFile.exists) {
        return {};
    }

    mapFile.encoding = "UTF-8";
    mapFile.open("r");
    try {
        var content = mapFile.read();
        mapFile.close();
        if (content && content.trim() !== "") {
            return JSON.parse(content);
        }
    } catch (e) {
        mapFile.close();
        alert("分类映射文件解析错误: " + e.toString());
    }
    return {};
}

// 保存分类映射
function saveCategoryMapJSON(baseFolder, categoryMap) {
    var mapFile = new File(baseFolder.fsName + "/category_map.json");
    mapFile.encoding = "UTF-8";
    mapFile.open("w");
    try {
        mapFile.write(JSON.stringify(categoryMap, null, 2));
        mapFile.close();
        return true;
    } catch (e) {
        mapFile.close();
        alert("保存分类映射时发生错误: " + e.toString());
        return false;
    }
}

// ========================================
// 文件系统操作
// ========================================

// 安全的文件夹名称（使用编码前缀）
function safeFolderName(displayName, prefix) {
    if (!prefix) prefix = "enc_";
    var safeName = displayName.replace(/[^\w\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff.-]/g, '_');
    return prefix + safeName.toLowerCase();
}

// 获取文件夹中的所有 JSON 文件
function getJSONFiles(folder) {
    if (!folder || !folder.exists) return [];

    var files = folder.getFiles("*.json");
    var jsonFiles = [];

    for (var i = 0; i < files.length; i++) {
        if (files[i] instanceof File && files[i].name !== "category_map.json") {
            jsonFiles.push(files[i]);
        }
    }

    return jsonFiles;
}

// ========================================
// 检查和验证
// ========================================

// 验证表达式数据完整性
function validateExpressionData(data) {
    if (!data || typeof data !== "object") return false;
    if (!data.name || typeof data.name !== "string") return false;
    if (!data.content || typeof data.content !== "string") return false;
    return true;
}

// 检查当前 AE 环境
function checkAEEnvironment() {
    if (typeof app === "undefined" || !(app instanceof Application)) {
        return false;
    }
    return true;
}
