/**
 * PM2 进程管理配置
 * 用法: pm2 start deploy/ecosystem.config.cjs
 */
const path = require("path");
module.exports = {
  apps: [
    {
      name: "career-kline",
      script: "server/server.js",
      cwd: path.join(__dirname, ".."),
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 4173,
      },
      env_file: ".env",
      max_memory_restart: "500M",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      merge_logs: true,
      autorestart: true,
      watch: false,
    },
  ],
};
