// Migration Tool: Convert TXT files to JSON format
// 迁移工具：将 TXT 文件转换为 JSON 格式

#include "expression-utils.jsx"

// 主转换函数
function migrateToJSON() {
    var scriptFile = new File($.fileName);
    var scriptFolder = scriptFile.parent;
    var dataFolder = new Folder(scriptFolder.fsName + "/expression-plugin2");

    if (!dataFolder.exists) {
        alert("未找到 expression-plugin2 文件夹");
        return;
    }

    var confirm = Window.confirm(
        "此工具将把所有 TXT 格式的表达式转换为 JSON 格式。\n\n" +
        "转换过程将：\n" +
        "1. 读取所有 enc_* 文件夹中的 .txt 文件\n" +
        "2. 为每个表达式创建 JSON 文件\n" +
        "3. 保留原始 TXT 文件（不会删除）\n\n" +
        "是否继续？",
        false,
        "转换确认"
    );

    if (!confirm) return;

    var categoryFolders = dataFolder.getFiles(function(file) {
        return file instanceof Folder && file.name.indexOf("enc_") === 0;
    });

    var totalConverted = 0;
    var errors = [];

    // 遍历所有分类文件夹
    for (var i = 0; i < categoryFolders.length; i++) {
        var folder = categoryFolders[i];
        var categoryName = folder.name.replace(/^enc_/, "");

        var txtFiles = folder.getFiles("*.txt");

        for (var j = 0; j < txtFiles.length; j++) {
            var txtFile = txtFiles[j];

            try {
                // 读取 TXT 文件内容
                txtFile.encoding = "UTF-8";
                txtFile.open("r");
                var content = txtFile.read();
                txtFile.close();

                // 从文件名获取表达式名称
                var expressionName = txtFile.name.replace(".txt", "");

                // 尝试解码文件名（如果是编码的）
                try {
                    expressionName = decodeURIComponent(expressionName);
                } catch (e) {
                    // 如果解码失败，保持原名
                }

                // 创建 JSON 数据
                var jsonData = createExpressionData(
                    expressionName,
                    content,
                    "", // 属性路径为空，用户可以后续添加
                    "从 TXT 文件迁移",
                    categoryName
                );

                // 生成 JSON 文件名（使用编码）
                var encodedName = encodeText(expressionName);
                var jsonFilePath = folder.fsName + "/" + encodedName + ".json";

                // 写入 JSON 文件
                if (writeExpressionJSON(jsonFilePath, jsonData)) {
                    totalConverted++;
                } else {
                    errors.push(txtFile.name + " (写入失败)");
                }

            } catch (e) {
                errors.push(txtFile.name + " (" + e.toString() + ")");
            }
        }
    }

    // 显示结果
    var message = "转换完成！\n\n";
    message += "成功转换: " + totalConverted + " 个表达式\n";

    if (errors.length > 0) {
        message += "\n失败的文件:\n" + errors.slice(0, 10).join("\n");
        if (errors.length > 10) {
            message += "\n... 还有 " + (errors.length - 10) + " 个";
        }
    }

    alert(message);
}

// 创建示例 JSON 文件
function createSampleJSON() {
    var scriptFile = new File($.fileName);
    var scriptFolder = scriptFile.parent;
    var dataFolder = new Folder(scriptFolder.fsName + "/expression-plugin2");

    if (!dataFolder.exists) {
        if (!dataFolder.create()) {
            alert("无法创建 expression-plugin2 文件夹");
            return;
        }
    }

    // 创建示例分类文件夹
    var sampleFolder = new Folder(dataFolder.fsName + "/enc_示例");
    if (!sampleFolder.exists) {
        sampleFolder.create();
    }

    // 示例表达式数据
    var samples = [
        {
            name: "抖动位置",
            content: "wiggle(5, 50);",
            propertyPath: "transform.position",
            description: "让图层位置产生抖动效果，频率5次/秒，幅度50像素"
        },
        {
            name: "循环动画",
            content: "loopOut(\"cycle\");",
            propertyPath: "",
            description: "循环播放关键帧动画"
        },
        {
            name: "时间重映射",
            content: "linear(time, inPoint, inPoint + 1, 0, 100) - linear(time, outPoint - 1, outPoint, 0, 100);",
            propertyPath: "transform.opacity",
            description: "淡入淡出效果"
        }
    ];

    var created = 0;
    for (var i = 0; i < samples.length; i++) {
        var sample = samples[i];
        var jsonData = createExpressionData(
            sample.name,
            sample.content,
            sample.propertyPath,
            sample.description,
            "示例"
        );

        var encodedName = encodeText(sample.name);
        var jsonFilePath = sampleFolder.fsName + "/" + encodedName + ".json";

        if (writeExpressionJSON(jsonFilePath, jsonData)) {
            created++;
        }
    }

    alert("创建了 " + created + " 个示例 JSON 文件");
}

// 执行转换
function showMigrationDialog() {
    var dialog = new Window("dialog", "迁移工具");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;

    // 标题
    var title = dialog.add("statictext", undefined, "表达式格式迁移工具");
    title.graphics.font = ScriptUI.newFont(title.graphics.font.name, "Bold", 14);

    // 说明文本
    var info = dialog.add("statictext", undefined,
        "此工具将帮助您将现有的 TXT 格式表达式\n转换为新的 JSON 格式。\n\n" +
        "JSON 格式的优势：\n" +
        "• 结构化存储\n" +
        "• 支持属性路径记录\n" +
        "• 支持描述和元数据\n" +
        "• 更易于管理和扩展",
        {multiline: true}
    );

    // 分隔线
    dialog.add("panel", undefined, "", {borderStyle: "gray"});

    // 按钮组
    var btnGroup = dialog.add("group");
    btnGroup.orientation = "row";
    btnGroup.alignChildren = ["center", "center"];
    btnGroup.spacing = 10;

    var migrateBtn = btnGroup.add("button", undefined, "转换现有文件");
    var sampleBtn = btnGroup.add("button", undefined, "创建示例文件");
    var cancelBtn = btnGroup.add("button", undefined, "取消", {name: "cancel"});

    // 事件处理
    migrateBtn.onClick = function() {
        dialog.close();
        migrateToJSON();
    };

    sampleBtn.onClick = function() {
        dialog.close();
        createSampleJSON();
    };

    dialog.show();
}

// 如果直接运行此脚本，显示对话框
if (typeof app !== "undefined") {
    showMigrationDialog();
}
