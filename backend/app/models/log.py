import enum

class LogSource(str, enum.Enum):
    BOT = "BOT"
    FRONTEND = "FRONTEND"
    SYSTEM = "SYSTEM"

class LogLevel(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

