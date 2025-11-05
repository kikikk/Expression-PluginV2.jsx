// Expression Plugin 2 - JSON Demo
// 演示如何使用 JSON 功能

#include "expression-plugin2/expression-utils.jsx"

function runDemo() {
    var dialog = new Window("palette", "JSON 功能演示", undefined, {resizeable: true});
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;
    dialog.preferredSize = [500, 600];

    // 标题
    var titleGroup = dialog.add("group");
    titleGroup.add("statictext", undefined, "✨ Expression Plugin 2 - JSON 功能演示");

    // Tab 面板
    var tabs = dialog.add("tabbedpanel");
    tabs.alignment = ["fill", "fill"];
    tabs.preferredSize = [480, 500];

    // Tab 1: 编码测试
    var tab1 = tabs.add("tab", undefined, "编码测试");
    tab1.orientation = "column";
    tab1.alignChildren = ["fill", "top"];
    tab1.spacing = 10;

    tab1.add("statictext", undefined, "测试中文编码和解码：");

    var inputGroup1 = tab1.add("group");
    inputGroup1.orientation = "row";
    inputGroup1.add("statictext", undefined, "输入文本:");
    var inputText1 = inputGroup1.add("edittext", undefined, "抖动效果");
    inputText1.preferredSize.width = 300;

    var encodeBtn = tab1.add("button", undefined, "编码");
    var encodedText = tab1.add("edittext", undefined, "", {multiline: true, readonly: true});
    encodedText.preferredSize.height = 60;

    var decodeBtn = tab1.add("button", undefined, "解码");
    var decodedText = tab1.add("edittext", undefined, "", {multiline: true, readonly: true});
    decodedText.preferredSize.height = 60;

    encodeBtn.onClick = function() {
        var text = inputText1.text;
        var encoded = encodeText(text);
        encodedText.text = "编码结果:\n" + encoded;
    };

    decodeBtn.onClick = function() {
        var encoded = encodedText.text.replace("编码结果:\n", "");
        var decoded = decodeText(encoded);
        decodedText.text = "解码结果:\n" + decoded;
    };

    // Tab 2: JSON 操作
    var tab2 = tabs.add("tab", undefined, "JSON 操作");
    tab2.orientation = "column";
    tab2.alignChildren = ["fill", "top"];
    tab2.spacing = 10;

    tab2.add("statictext", undefined, "创建和读取 JSON 表达式数据：");

    var nameGroup = tab2.add("group");
    nameGroup.orientation = "row";
    nameGroup.add("statictext", undefined, "名称:").preferredSize.width = 50;
    var nameInput = nameGroup.add("edittext", undefined, "测试表达式");
    nameInput.preferredSize.width = 300;

    tab2.add("statictext", undefined, "内容:");
    var contentInput = tab2.add("edittext", undefined, "wiggle(5, 50);", {multiline: true});
    contentInput.preferredSize.height = 80;

    var pathGroup = tab2.add("group");
    pathGroup.orientation = "row";
    pathGroup.add("statictext", undefined, "路径:").preferredSize.width = 50;
    var pathInput = pathGroup.add("edittext", undefined, "transform.position");
    pathInput.preferredSize.width = 300;

    var createJsonBtn = tab2.add("button", undefined, "创建 JSON 数据");
    var jsonOutput = tab2.add("edittext", undefined, "", {multiline: true, readonly: true});
    jsonOutput.preferredSize.height = 150;

    createJsonBtn.onClick = function() {
        var data = createExpressionData(
            nameInput.text,
            contentInput.text,
            pathInput.text,
            "这是一个测试表达式",
            "测试分类"
        );
        jsonOutput.text = JSON.stringify(data, null, 2);
    };

    // Tab 3: 属性路径
    var tab3 = tabs.add("tab", undefined, "属性路径");
    tab3.orientation = "column";
    tab3.alignChildren = ["fill", "top"];
    tab3.spacing = 10;

    tab3.add("statictext", undefined, "获取当前选中属性的路径：");

    var infoPanel = tab3.add("panel", undefined, "使用说明");
    infoPanel.orientation = "column";
    infoPanel.alignChildren = ["left", "top"];
    infoPanel.margins = 10;

    infoPanel.add("statictext", undefined, "1. 在 AE 中打开一个合成");
    infoPanel.add("statictext", undefined, "2. 选择一个或多个图层");
    infoPanel.add("statictext", undefined, "3. 展开图层属性并选中一个或多个属性");
    infoPanel.add("statictext", undefined, "4. 点击下方的「获取属性路径」按钮");

    var getPathBtn = tab3.add("button", undefined, "获取属性路径");
    getPathBtn.preferredSize.height = 40;

    tab3.add("statictext", undefined, "检测到的属性路径：");
    var pathOutput = tab3.add("edittext", undefined, "", {multiline: true, readonly: true});
    pathOutput.preferredSize.height = 150;

    tab3.add("statictext", undefined, "💡 提示：多个路径使用 && 分隔", {alignment: "center"});

    getPathBtn.onClick = function() {
        var paths = getSelectedPropertyPaths();
        if (paths) {
            pathOutput.text = paths;
            var pathList = paths.split("&&");
            alert("检测到 " + pathList.length + " 个属性路径");
        } else {
            pathOutput.text = "未检测到有效的属性路径";
        }
    };

    // Tab 4: 批量应用
    var tab4 = tabs.add("tab", undefined, "批量应用");
    tab4.orientation = "column";
    tab4.alignChildren = ["fill", "top"];
    tab4.spacing = 10;

    tab4.add("statictext", undefined, "批量应用表达式到多个图层：");

    tab4.add("statictext", undefined, "表达式内容:");
    var batchContent = tab4.add("edittext", undefined, "wiggle(2, 20);", {multiline: true});
    batchContent.preferredSize.height = 80;

    tab4.add("statictext", undefined, "属性路径（可选，多个用&&分隔）:");
    var batchPath = tab4.add("edittext", undefined, "transform.position");
    batchPath.preferredSize.width = 400;

    var applyInfoPanel = tab4.add("panel", undefined, "应用逻辑");
    applyInfoPanel.orientation = "column";
    applyInfoPanel.alignChildren = ["left", "top"];
    applyInfoPanel.margins = 10;

    applyInfoPanel.add("statictext", undefined, "• 如果图层有选中的属性，优先应用到这些属性");
    applyInfoPanel.add("statictext", undefined, "• 如果没有选中属性，根据属性路径应用");
    applyInfoPanel.add("statictext", undefined, "• 支持批量处理多个图层");

    var applyBtn = tab4.add("button", undefined, "批量应用表达式");
    applyBtn.preferredSize.height = 40;

    applyBtn.onClick = function() {
        var content = batchContent.text;
        var path = batchPath.text;

        if (!content) {
            alert("请输入表达式内容");
            return;
        }

        applyExpressionBatch(content, path);
    };

    // Tab 5: 工具
    var tab5 = tabs.add("tab", undefined, "工具");
    tab5.orientation = "column";
    tab5.alignChildren = ["fill", "top"];
    tab5.spacing = 10;

    tab5.add("statictext", undefined, "实用工具集合：");

    var migratePanel = tab5.add("panel", undefined, "迁移工具");
    migratePanel.orientation = "column";
    migratePanel.alignChildren = ["fill", "top"];
    migratePanel.margins = 10;
    migratePanel.spacing = 5;

    migratePanel.add("statictext", undefined, "将 TXT 格式表达式转换为 JSON 格式");
    var migrateBtn = migratePanel.add("button", undefined, "运行迁移工具");

    migrateBtn.onClick = function() {
        dialog.close();
        // 运行迁移工具脚本
        var scriptFolder = new File($.fileName).parent;
        var migrateScript = new File(scriptFolder.fsName + "/expression-plugin2/migrate-to-json.jsx");
        if (migrateScript.exists) {
            $.evalFile(migrateScript);
        } else {
            alert("未找到迁移工具脚本：\n" + migrateScript.fsName);
        }
    };

    var samplePanel = tab5.add("panel", undefined, "示例文件");
    samplePanel.orientation = "column";
    samplePanel.alignChildren = ["fill", "top"];
    samplePanel.margins = 10;
    samplePanel.spacing = 5;

    samplePanel.add("statictext", undefined, "创建示例 JSON 表达式文件");
    var sampleBtn = samplePanel.add("button", undefined, "创建示例文件");

    sampleBtn.onClick = function() {
        var scriptFolder = new File($.fileName).parent;
        var dataFolder = new Folder(scriptFolder.fsName + "/expression-plugin2");

        if (!dataFolder.exists) {
            dataFolder.create();
        }

        var sampleFolder = new Folder(dataFolder.fsName + "/enc_示例");
        if (!sampleFolder.exists) {
            sampleFolder.create();
        }

        var sample = createExpressionData(
            "演示抖动",
            "wiggle(5, 50);",
            "transform.position",
            "演示用的简单抖动效果",
            "示例"
        );

        var encodedName = encodeText("演示抖动");
        var jsonPath = sampleFolder.fsName + "/" + encodedName + ".json";

        if (writeExpressionJSON(jsonPath, sample)) {
            alert("示例文件已创建：\n" + jsonPath);
        } else {
            alert("创建示例文件失败");
        }
    };

    var envPanel = tab5.add("panel", undefined, "环境检查");
    envPanel.orientation = "column";
    envPanel.alignChildren = ["fill", "top"];
    envPanel.margins = 10;
    envPanel.spacing = 5;

    envPanel.add("statictext", undefined, "检查 AE 环境和版本信息");
    var checkBtn = envPanel.add("button", undefined, "检查环境");

    checkBtn.onClick = function() {
        var info = "After Effects 环境信息：\n\n";
        info += "版本: " + app.version + "\n";
        info += "语言: " + app.isoLanguage + "\n";
        info += "构建: " + app.buildName + "\n";
        info += "脚本路径: " + $.fileName + "\n\n";

        if (app.project.activeItem) {
            info += "当前合成: " + app.project.activeItem.name + "\n";
            if (app.project.activeItem.selectedLayers) {
                info += "选中图层数: " + app.project.activeItem.selectedLayers.length;
            }
        } else {
            info += "未打开合成";
        }

        alert(info);
    };

    // 底部按钮
    var bottomGroup = dialog.add("group");
    bottomGroup.orientation = "row";
    bottomGroup.alignChildren = ["center", "center"];

    var docsBtn = bottomGroup.add("button", undefined, "查看文档");
    var closeBtn = bottomGroup.add("button", undefined, "关闭", {name: "cancel"});

    docsBtn.onClick = function() {
        alert(
            "Expression Plugin 2 - JSON 功能\n\n" +
            "主要特性：\n" +
            "• JSON 格式存储表达式\n" +
            "• 属性路径记录和获取\n" +
            "• 批量应用到多个图层\n" +
            "• 实时读写操作\n" +
            "• 中文支持\n\n" +
            "详细文档请查看：\n" +
            "JSON-INTEGRATION-GUIDE.md"
        );
    };

    dialog.center();
    dialog.show();
}

// 运行演示
if (checkAEEnvironment()) {
    runDemo();
} else {
    alert("请在 After Effects 中运行此脚本");
}
