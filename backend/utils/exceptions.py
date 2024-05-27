"""Module with exceptions for the 'profiles' API."""

class ProfilesAPIError(Exception):
    """Base exception for the 'profiles' API project.

    Attributes:
        message: Error's description
    """

    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class CredentialTakenError(ProfilesAPIError):
    """Raised when the given credential is already taken."""
