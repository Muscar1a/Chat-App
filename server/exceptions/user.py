class UserCreationError(Exception):
    """Custom exception for user creation errors."""

    def __init__(self, field, message):
        self.field = field
        self.message = message
        super().__init__(self.message)