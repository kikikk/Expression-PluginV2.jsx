// ============================================
// 日志工具 - Logger Utility
// ============================================
// 用于记录脚本运行时的信息、警告和错误
// 日志文件位置：脚本目录/expression-plugin2/logs/
// ============================================

// 全局日志对象
var Logger = (function() {
    // 获取日志文件夹路径
    function getLogFolder() {
        try {
            var scriptFile = File($.fileName);
            var scriptFolder = scriptFile.parent;

            // 如果脚本在 expression-plugin2 文件夹内
            if (scriptFolder.name === "expression-plugin2") {
                var logFolder = new Folder(scriptFolder.fsName + "/logs");
            } else {
                // 如果脚本在外层目录
                var logFolder = new Folder(scriptFolder.fsName + "/expression-plugin2/logs");
            }

            // 创建日志文件夹（如果不存在）
            if (!logFolder.exists) {
                logFolder.create();
            }

            return logFolder;
        } catch (e) {
            // 如果无法创建日志文件夹，使用桌面
            return Folder.desktop;
        }
    }

    // 获取当前时间字符串
    function getTimeString() {
        var now = new Date();
        var year = now.getFullYear();
        var month = padZero(now.getMonth() + 1);
        var day = padZero(now.getDate());
        var hour = padZero(now.getHours());
        var minute = padZero(now.getMinutes());
        var second = padZero(now.getSeconds());

        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    }

    // 补零函数
    function padZero(num) {
        return num < 10 ? "0" + num : num;
    }

    // 获取日志文件路径（按日期命名）
    function getLogFile() {
        var logFolder = getLogFolder();
        var now = new Date();
        var dateStr = now.getFullYear() + "-" +
                     padZero(now.getMonth() + 1) + "-" +
                     padZero(now.getDate());

        return new File(logFolder.fsName + "/ae-plugin-log-" + dateStr + ".txt");
    }

    // 写入日志
    function writeLog(level, message) {
        try {
            var logFile = getLogFile();
            var timeStr = getTimeString();
            var logEntry = "[" + timeStr + "] [" + level + "] " + message + "\n";

            // 同时输出到 ExtendScript Toolkit 控制台
            $.writeln(logEntry);

            // 写入文件
            logFile.open("a"); // 追加模式
            logFile.encoding = "UTF-8";
            logFile.write(logEntry);
            logFile.close();

            return true;
        } catch (e) {
            $.writeln("写入日志失败: " + e.toString());
            return false;
        }
    }

    // 公共接口
    return {
        // 信息日志
        info: function(message) {
            writeLog("INFO", message);
        },

        // 警告日志
        warn: function(message) {
            writeLog("WARN", message);
        },

        // 错误日志
        error: function(message) {
            writeLog("ERROR", message);
        },

        // 调试日志
        debug: function(message) {
            writeLog("DEBUG", message);
        },

        // 同时显示 alert 和记录日志
        alert: function(message, level) {
            var logLevel = level || "INFO";
            writeLog(logLevel, message);
            alert(message);
        },

        // 获取日志文件夹路径（用于打开）
        getLogFolderPath: function() {
            return getLogFolder().fsName;
        },

        // 打开日志文件夹
        openLogFolder: function() {
            var logFolder = getLogFolder();
            if (logFolder.exists) {
                logFolder.execute();
                return true;
            } else {
                alert("日志文件夹不存在: " + logFolder.fsName);
                return false;
            }
        },

        // 清空旧日志（保留最近 N 天）
        cleanOldLogs: function(daysToKeep) {
            try {
                var days = daysToKeep || 7; // 默认保留7天
                var logFolder = getLogFolder();
                var files = logFolder.getFiles("ae-plugin-log-*.txt");
                var now = new Date();
                var threshold = now.getTime() - (days * 24 * 60 * 60 * 1000);

                var removedCount = 0;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.modified.getTime() < threshold) {
                        file.remove();
                        removedCount++;
                    }
                }

                Logger.info("清理完成，删除了 " + removedCount + " 个旧日志文件");
                return removedCount;
            } catch (e) {
                Logger.error("清理旧日志失败: " + e.toString());
                return 0;
            }
        }
    };
})();

// ============================================
// 使用示例
// ============================================

/*

// 1. 记录信息
Logger.info("插件初始化成功");

// 2. 记录警告
Logger.warn("未找到表达式文件");

// 3. 记录错误
Logger.error("读取文件失败: " + e.toString());

// 4. 调试信息
Logger.debug("当前选中图层数量: " + selectedLayers.length);

// 5. 同时显示 alert 和记录日志
Logger.alert("操作完成！", "INFO");

// 6. 获取日志文件夹路径
var logPath = Logger.getLogFolderPath();
alert("日志保存在: " + logPath);

// 7. 打开日志文件夹
Logger.openLogFolder();

// 8. 清理7天前的旧日志
Logger.cleanOldLogs(7);

// 9. 在 try-catch 中使用
try {
    // 你的代码
    Logger.info("开始执行操作");
    // ...
} catch (e) {
    Logger.error("发生错误: " + e.toString() + "\n堆栈: " + e.line);
    alert("操作失败，请查看日志文件");
}

*/
