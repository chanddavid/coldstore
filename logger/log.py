
import logging
from logging import config
from os import path


def get_logger(name=None):
    if name is None:
        log_file_path = path.join(path.dirname(path.abspath(__file__)), 'log.config')
        config.fileConfig(log_file_path)
        logger = logging.getLogger()
        return logger

    else:
        logger = logging.getLogger(name)
        # Replace the previous handlers with the new FileHandler
        for old_handler in logger.handlers:
            logger.removeHandler(old_handler)

        return logger
