class Logger {
  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
    this.logLevel = process.env.REACT_APP_LOG_LEVEL || 'info';
    this.enableFile = process.env.REACT_APP_ENABLE_FILE_LOGGING === 'true';
    this.buffer = [];
    this.maxBuffer = 50;
    
    // Log levels hierarchy
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    this.currentLevel = this.levels[this.logLevel] || 2;
    
    if (this.enableFile) {
      this.initFileLogging();
    }
  }

  initFileLogging() {
    // Auto-flush every 10 seconds
    setInterval(() => this.flush(), 10000);
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  shouldLog(level) {
    return this.levels[level] <= this.currentLevel;
  }

  log(level, message, context = {}) {
    if (!this.shouldLog(level)) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      context: Object.keys(context).length > 0 ? JSON.stringify(context) : '',
      url: window.location.pathname
    };
    
    // Console output
    const consoleMsg = `[${timestamp}] [${logEntry.level}] ${logEntry.message}`;
    console[level](consoleMsg, context);
    
    // File output
    if (this.enableFile) {
      this.buffer.push(logEntry);
      if (this.buffer.length >= this.maxBuffer) {
        this.flush();
      }
    }
  }

  error(message, context) { this.log('error', message, context); }
  warn(message, context) { this.log('warn', message, context); }
  info(message, context) { this.log('info', message, context); }
  debug(message, context) { this.log('debug', message, context); }

  // API logging helper
  api(method, url, status, duration, error = null) {
    const level = status >= 400 || error ? 'error' : 'info';
    this.log(level, `API ${method} ${url}`, { status, duration: `${duration}ms`, error });
  }

  // User action helper
  action(action, details = {}) {
    this.info(`User: ${action}`, details);
  }

  async flush() {
    if (this.buffer.length === 0) return;
    
    try {
      const logs = [...this.buffer];
      this.buffer = [];
      
      const content = logs.map(entry => {
        const ctx = entry.context ? ` | ${entry.context}` : '';
        return `${entry.timestamp} [${entry.level}] ${entry.message}${ctx} | ${entry.url}`;
      }).join('\n') + '\n';
      
      await this.writeToFile(content);
    } catch (error) {
      console.error('Logger flush failed:', error);
    }
  }

  async writeToFile(content) {
    try {
      // Use OPFS (Origin Private File System) - works in modern browsers
      const opfsRoot = await navigator.storage.getDirectory();
      const fileHandle = await opfsRoot.getFileHandle('webui.log', { create: true });
      
      // Append to existing file
      const file = await fileHandle.getFile();
      const existingContent = await file.text();
      
      const writable = await fileHandle.createWritable();
      await writable.write(existingContent + content);
      await writable.close();
    } catch (error) {
      // Fallback: download file
      this.downloadFile(content);
    }
  }

  downloadFile(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ui-${new Date().toISOString().split('T')[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Utility methods
  async download() {
    await this.flush();
    try {
      const opfsRoot = await navigator.storage.getDirectory();
      const fileHandle = await opfsRoot.getFileHandle('ui.log');
      const file = await fileHandle.getFile();
      const content = await file.text();
      this.downloadFile(content);
    } catch (error) {
      console.warn('No log file found');
    }
  }

  clear() {
    this.buffer = [];
    try {
      navigator.storage.getDirectory().then(root => 
        root.removeEntry('ui.log').catch(() => {})
      );
    } catch {}
  }

  stats() {
    return {
      buffer: this.buffer.length,
      level: this.logLevel,
      fileEnabled: this.enableFile
    };
  }
}

// Export singleton
const logger = new Logger();
export default logger;