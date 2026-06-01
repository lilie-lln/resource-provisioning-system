from pathlib import Path
import paramiko
import os

BACKEND_DIR = Path(__file__).parent  # the path containing this file
BASE_DIR = os.environ.get("BASE_DIR", str(BACKEND_DIR.parent / "mnt" / "root"))
BACKEND_HOST = "120.126.17.189" # the IP address of the backend server

# When LOCAL_TEST=1 the backend never touches real classroom nodes:
# the scheduler thread is disabled and SSH/docker calls become safe no-ops.
LOCAL_TEST = os.environ.get("LOCAL_TEST", "0") == "1"

#DATA_FILE = BASE_DIR + 'admin/account.json'
ACCOUNT_DATA_FILE = os.path.join(BASE_DIR, 'admin/account.json')
APPLICATION_DATA_FILE = os.path.join(BASE_DIR, 'admin/application.json')
ADMINISTRATOR_DATA_FILE = os.path.join(BASE_DIR, 'admin/administrator.json') #
# ADMINISTRATOR_DATA_FILE = os.path.join(BASE_DIR, 'admin', 'administrator') #
UPLOAD_DIRECTORY = os.path.join(BASE_DIR, 'admin/uploads/')
COURSE_DATA_FILE = os.path.join(BASE_DIR, 'admin/course.json')
IMAGE_INFO_FILE = os.path.join(BASE_DIR, 'admin/image.json')
RESOURCE_DIR = os.path.join(BASE_DIR, 'admin/resource.json')
# Per-administrator JSON files live here (was a hardcoded /home/ccllab path).
ADMINISTRATOR_DIR = os.path.join(BASE_DIR, 'admin', 'administrator')
folder_structure = {
    "admin": {
        "account.json": {},
        "course.json": {},
        "schedule.json": {},
        "resource.json": {},
        "template": {},
        "image": {},
        "uploads": {},
        "administrator": {},
    },
    "class": {
        "init_class": {
            "device.json": {},
            "template": {},
            "image": {},
        }
    }  
}

time_slots = {
    "midnight": {"boot": "00:00", "off": "05:59"},
    "morning": {"boot": "06:00", "off": "11:59"},
    "noon": {"boot": "12:00", "off": "17:59"},
    "night": {"boot": "18:00", "off": "23:59"},
}
weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


NODE_LIST = ["120.126.17.188", "120.126.17.190"]


def SSHConnection(ip, cmd):
    # Local-test mode never reaches real classroom nodes; return empty output.
    if LOCAL_TEST:
        return (b"", b"")
    # check if the ip is in the node list
    if ip not in NODE_LIST:
        return None
    ssh = paramiko.SSHClient() 
    # using key to connect
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    # connect to the server  with key
    ssh.connect(ip, username="root", port=2222)
    stdin, stdout, stderr = ssh.exec_command(cmd)
    # get the result of the command
    result = stdout.read()
    err = stderr.read()
    ssh.close()
    return result, err

def create_path_if_not_exists(path, is_file=False):
    if not os.path.exists(path):
        if is_file:
            with open(path, 'w') as f:
                f.write("")  # create an empty file
            print(f"Created file: {path}")
        else:
            os.makedirs(path)
            print(f"Created directory: {path}")

def check_init_file():
    for folder, subfolders in folder_structure.items():
        folder_path = os.path.join(BASE_DIR, folder)
        create_path_if_not_exists(folder_path)
        
        for subfolder, files in subfolders.items():
            subfolder_path = os.path.join(folder_path, subfolder)
            is_file = subfolder.endswith(".json")
            create_path_if_not_exists(subfolder_path, is_file=is_file)
            
            if not is_file:  # create files in the subfolder #
                for file, content in files.items():
                    path = os.path.join(subfolder_path, file)
                    is_file = file.endswith(".json")
                    create_path_if_not_exists(path, is_file=is_file)


class _NoopDocker:
    """No-op Docker client used in LOCAL_TEST mode.

    Absorbs any attribute access / call and iterates as empty, so existing
    docker logic (images.load, containers.list, ...) runs without a daemon.
    """
    def __getattr__(self, _name):
        return self

    def __call__(self, *args, **kwargs):
        return self

    def __iter__(self):
        return iter(())


def docker_client(node):
    """Return a Docker client for *node*, or a no-op stub in LOCAL_TEST mode."""
    if LOCAL_TEST:
        return _NoopDocker()
    import docker
    return docker.DockerClient(base_url=f"tcp://{node}:2375")

                    
