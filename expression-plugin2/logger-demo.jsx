// ============================================
// 日志工具演示脚本
// ============================================

// 引入日志工具
#include "logger.jsx"

// 创建演示窗口
function createDemoUI() {
    var win = new Window("palette", "日志工具演示", undefined, {resizeable: true});
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 16;

    // 说明文本
    var infoGroup = win.add("group");
    infoGroup.orientation = "column";
    infoGroup.alignChildren = ["left", "top"];

    infoGroup.add("statictext", undefined, "日志工具可以记录所有信息到文件");
    infoGroup.add("statictext", undefined, "日志位置: expression-plugin2/logs/");

    // 日志路径显示
    var pathGroup = win.add("group");
    pathGroup.orientation = "row";
    pathGroup.alignChildren = ["left", "center"];
    pathGroup.add("statictext", undefined, "日志路径:");
    var pathText = pathGroup.add("statictext", undefined, Logger.getLogFolderPath());
    pathText.characters = 40;

    win.add("panel", undefined, undefined, {borderStyle: "white"});

    // 测试按钮区域
    var testGroup = win.add("group");
    testGroup.orientation = "column";
    testGroup.alignChildren = ["fill", "top"];
    testGroup.spacing = 8;

    // 测试不同级别的日志
    var infoBtn = testGroup.add("button", undefined, "测试 INFO 日志");
    infoBtn.onClick = function() {
        Logger.info("这是一条信息日志 - " + new Date().toLocaleTimeString());
        alert("INFO 日志已记录，请查看日志文件");
    };

    var warnBtn = testGroup.add("button", undefined, "测试 WARN 日志");
    warnBtn.onClick = function() {
        Logger.warn("这是一条警告日志 - " + new Date().toLocaleTimeString());
        alert("WARN 日志已记录，请查看日志文件");
    };

    var errorBtn = testGroup.add("button", undefined, "测试 ERROR 日志");
    errorBtn.onClick = function() {
        Logger.error("这是一条错误日志 - " + new Date().toLocaleTimeString());
        alert("ERROR 日志已记录，请查看日志文件");
    };

    var debugBtn = testGroup.add("button", undefined, "测试 DEBUG 日志");
    debugBtn.onClick = function() {
        Logger.debug("这是一条调试日志 - " + new Date().toLocaleTimeString());
        alert("DEBUG 日志已记录，请查看日志文件");
    };

    // Alert 和日志同时记录
    var alertBtn = testGroup.add("button", undefined, "测试 Alert + 日志");
    alertBtn.onClick = function() {
        Logger.alert("这条消息会同时显示 Alert 并记录到日志文件", "INFO");
    };

    win.add("panel", undefined, undefined, {borderStyle: "white"});

    // 高级功能区域
    var advGroup = win.add("group");
    advGroup.orientation = "column";
    advGroup.alignChildren = ["fill", "top"];
    advGroup.spacing = 8;

    // 模拟错误场景
    var simulateErrorBtn = advGroup.add("button", undefined, "模拟错误场景（带堆栈信息）");
    simulateErrorBtn.onClick = function() {
        try {
            Logger.info("开始执行危险操作...");

            // 模拟一个错误
            var obj = null;
            var result = obj.someProperty; // 这会抛出错误

        } catch (e) {
            var errorMsg = "错误: " + e.toString() +
                          "\n行号: " + e.line +
                          "\n文件: " + e.fileName;
            Logger.error(errorMsg);
            alert("发生错误！详细信息已记录到日志文件\n\n" + errorMsg);
        }
    };

    // 批量记录日志
    var batchBtn = advGroup.add("button", undefined, "批量记录日志（10条）");
    batchBtn.onClick = function() {
        Logger.info("=== 开始批量记录测试 ===");

        for (var i = 1; i <= 10; i++) {
            Logger.debug("批量测试消息 #" + i);
        }

        Logger.info("=== 批量记录测试完成 ===");
        alert("已记录10条日志，请查看日志文件");
    };

    // 记录系统信息
    var sysInfoBtn = advGroup.add("button", undefined, "记录系统信息");
    sysInfoBtn.onClick = function() {
        Logger.info("=== 系统信息 ===");
        Logger.info("AE 版本: " + app.version);
        Logger.info("项目名称: " + (app.project.file ? app.project.file.name : "未保存"));
        Logger.info("活动合成: " + (app.project.activeItem ? app.project.activeItem.name : "无"));

        if (app.project.activeItem && app.project.activeItem.selectedLayers) {
            Logger.info("选中图层数: " + app.project.activeItem.selectedLayers.length);
        }

        Logger.info("操作系统: " + $.os);
        Logger.info("===================");

        alert("系统信息已记录到日志文件");
    };

    win.add("panel", undefined, undefined, {borderStyle: "white"});

    // 文件管理区域
    var fileGroup = win.add("group");
    fileGroup.orientation = "column";
    fileGroup.alignChildren = ["fill", "top"];
    fileGroup.spacing = 8;

    // 打开日志文件夹
    var openBtn = fileGroup.add("button", undefined, "📁 打开日志文件夹");
    openBtn.onClick = function() {
        if (Logger.openLogFolder()) {
            Logger.info("用户打开了日志文件夹");
        }
    };

    // 清理旧日志
    var cleanGroup = fileGroup.add("group");
    cleanGroup.orientation = "row";
    cleanGroup.alignChildren = ["left", "center"];

    var cleanBtn = cleanGroup.add("button", undefined, "清理旧日志");
    cleanBtn.onClick = function() {
        var days = parseInt(daysInput.text) || 7;
        var removedCount = Logger.cleanOldLogs(days);
        alert("已删除 " + removedCount + " 个旧日志文件");
    };

    cleanGroup.add("statictext", undefined, "保留");
    var daysInput = cleanGroup.add("edittext", undefined, "7");
    daysInput.characters = 3;
    cleanGroup.add("statictext", undefined, "天内的日志");

    // 底部说明
    win.add("panel", undefined, undefined, {borderStyle: "white"});

    var noteGroup = win.add("group");
    noteGroup.orientation = "column";
    noteGroup.alignChildren = ["left", "top"];

    noteGroup.add("statictext", undefined, "💡 提示:");
    noteGroup.add("statictext", undefined, "• 日志文件按日期命名（如 ae-plugin-log-2025-01-15.txt）");
    noteGroup.add("statictext", undefined, "• 可以在任何脚本中使用 #include \"logger.jsx\"");
    noteGroup.add("statictext", undefined, "• 日志会同时输出到 ExtendScript Toolkit 控制台");

    win.center();
    win.show();
}

// 运行演示
createDemoUI();

// 记录脚本启动
Logger.info("日志工具演示脚本已启动");
