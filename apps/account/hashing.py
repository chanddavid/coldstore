import hashlib, uuid

def get_salt():
    salt = uuid.uuid4().hex
    return salt

def hash_string(salt, string):
    salt = salt.encode()
    string = string.encode()
    hashed_string = hashlib.md5(string + salt).hexdigest()
    return hashed_string