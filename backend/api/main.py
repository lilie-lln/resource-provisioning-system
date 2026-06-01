import json
import hashlib
import os
import aiofiles
from datetime import datetime
from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
    Request,
    BackgroundTasks
)
from typing import List, Optional
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
import concurrent.futures
from pydantic import BaseModel

from scheduler.main import DeviceResource, TaskModel

from config import (
    ACCOUNT_DATA_FILE,
    APPLICATION_DATA_FILE,
    ADMINISTRATOR_DATA_FILE,
    UPLOAD_DIRECTORY,
    COURSE_DATA_FILE,
    IMAGE_INFO_FILE,
    NODE_LIST,
    BASE_DIR,
    SSHConnection,
    ADMINISTRATOR_DIR,
)

app = FastAPI()


"""

Define the User and Application models

"""

class User(BaseModel):
    username: str
    password: str
    
class Application(BaseModel):
    id: int 
    applyname: str
    contact: str
    mail: str
    file_path: Optional[str]
    status: str
    results: str
    date: str


"""

define function to read data from file

"""

def read_data(file_path: str):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            # remove password field
            return json.load(file)
    return []

def write_data(file_path: str, data):
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

def update_device_status(class_path, taskID,  status_update, deviceID=None):
    """Update the status of a device in the status file."""
    status_file = os.path.join(class_path, str(taskID), 'status.json')
    try:
        with open(status_file, 'r', encoding='utf-8') as file:
            status = json.load(file)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Status file not found")
    
    if type(status_update) is not str:
        status = status_update
    else:
        if deviceID is not None:
            deviceID = int(deviceID) - 1
            status[deviceID] = status_update
        else:
            status = [status_update] * len(status)  # Update all devices if deviceID is not provided

    with open(status_file, 'w', encoding='utf-8') as file:
        json.dump(status, file, ensure_ascii=False, indent=4)

"""

API endpoint

"""


@app.post("/login")
async def login_user(user: User):
    username = user.username
    password = user.password

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    
    # get all users
    users = read_data(ACCOUNT_DATA_FILE)
    # administrators = read_data(ADMINISTRATOR_DATA_FILE)
    # all_users = users + administrators

    administrator_data = []
    DIRECTORY_PATH = ADMINISTRATOR_DIR
    
    if os.path.exists(DIRECTORY_PATH):
        for filename in os.listdir(DIRECTORY_PATH):
            if filename.endswith(".json"):
                file_path = os.path.join(DIRECTORY_PATH, filename)
                with open(file_path, 'r', encoding='utf-8') as file:
                    try:
                        data = json.load(file)
                        if isinstance(data, list):
                            administrator_data.extend(data)
                    except json.JSONDecodeError:
                        print(f"Error decoding JSON from file: {file_path}")
    
    all_users = users + administrator_data

    hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()

    stored_user = next((u for u in all_users if u.get('username') == username and u.get('password') == hashed_password), None)
    
    if stored_user is None:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    mail = stored_user.get('mail', '')
    permission = stored_user.get('permission', 0)
    return {"message": "Login successful", "permission": permission, "mail": mail}


"""

Get all applications endpoint

"""
@app.get("/applications", response_model=List[Application])
async def get_applications():
    return read_data(APPLICATION_DATA_FILE)


"""

Create a new application endpoint

"""
@app.post("/application")
async def register_application(
    applyname: str = Form(...),
    contact: str = Form(...),
    mail: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    if not applyname or not contact or not mail:
        raise HTTPException(status_code=400, detail="Course name, contact, and mail are required")

    file_path = None
    if file:
        file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

    register_data = read_data(APPLICATION_DATA_FILE)
    new_id = max([item['id'] for item in register_data], default=0) + 1
    register_data.append({
        "id": new_id,
        "applyname": applyname,
        "contact": contact,
        "mail": mail,
        "file_path": file_path,
        "status": "按此審核",
        "results": "",
        "date": datetime.now().isoformat()
    })
    write_data(APPLICATION_DATA_FILE, register_data)

    return {"message": "Registration successful"}


"""

Get all courses endpoint

"""
@app.get("/courses", response_model=List[dict])
async def get_courses():
    """Retrieve all courses from course.json."""
    return read_data(COURSE_DATA_FILE)

"""

Get all images endpoint
    
"""
@app.get("/images")
async def get_image_info():
    with open(IMAGE_INFO_FILE, 'r', encoding='utf-8') as file:
        return json.load(file)
    
"""

Get file to download endpoint

"""
@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/octet-stream', filename=filename)
    raise HTTPException(status_code=404, detail="File not found")
    
"""

GET image Endpoint
    
"""
@app.get("/image/{username}")
async def get_image(username: str):
    image_data = read_data(IMAGE_INFO_FILE)
    returnData = []
    for data in image_data:
        if data['permission'] == "public" or data['uploader'] == username:
            returnData.append(data)
    return JSONResponse(content=returnData)


"""

GEt all devices in the class endpoint

"""
@app.get("/class/{username}")
async def get_device_info(username: str):
    class_name = username
    if not class_name:
        raise HTTPException(status_code=400, detail="Class name is required")
    
    class_path = os.path.join(BASE_DIR, "class", class_name)
    if not os.path.exists(class_path):
        raise HTTPException(status_code=404, detail="Class not found")
    
    devices = []

    # get devices from devices.json
    devices_path = os.path.join(class_path, "device.json")
    if os.path.exists(devices_path):
        try:
            with open(devices_path, 'r', encoding='utf-8') as file:
                devices = json.load(file)
        except json.JSONDecodeError:
            print(f"Error decoding JSON from file: {devices_path}")
    # get status from status.json
    status = []
    for i in range(len(devices)):
        status_file = os.path.join(class_path, str(i+1), 'status.json')
        if os.path.exists(status_file):
            with open(status_file, 'r', encoding='utf-8') as file:
                status.append(json.load(file))
        else:
            status.append(['stopped' for i in range(devices[i]['resource']['numberOfDevices'])])
        
    download_status = []    
    # try to get download status
    for i in range(len(devices)):
        device_download_status = []  # List for each device's download status
        print(f"device {i}")
        for j in range(devices[i]['resource']['numberOfDevices']):
            print(f"{username}-{i+1}-{j+1}")
            download_status_file = os.path.join(class_path, f"{username}-{i+1}-{j+1}_download_status.json")
            if os.path.exists(download_status_file):
                print("exists")
                with open(download_status_file, 'r', encoding='utf-8') as file:
                    device_download_status.append(json.load(file).get("status", "None"))
            else:
                print(f"{username}-{i+1}-{j+1}_download_status.json not exists")
                device_download_status.append("None")
        download_status.append(device_download_status)  # Append this device's status list to the main list
    
    # response data with download status
    devices = [dict(devices[i], status=status[i], download_status=download_status[i]) for i in range(len(devices))]
    
    return JSONResponse(content=devices)


"""

Get all time slots remaining resources endpoint

"""

@app.get("/resource")
def calculate_remaining_resources_for_each_timeslot():
    # Define time slots and weekdays
    time_slots = {
        "midnight": {"boot": "00:00", "off": "05:59"},
        "morning": {"boot": "06:00", "off": "11:59"},
        "noon": {"boot": "12:00", "off": "17:59"},
        "night": {"boot": "18:00", "off": "23:59"},
    }
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    # Get all node resources
    nodeResource = DeviceResource()
    all_resources = nodeResource.get_all_node_resources()

    # Get all tasks
    taskModel = TaskModel()
    all_tasks = taskModel.get_all_tasks()

    # Initialize a dictionary to store remaining resources for each time slot
    remaining_resources = {}

    # Initialize the resources for each day and time slot
    for day in weekdays:
        remaining_resources[day] = {}
        for slot in time_slots:
            remaining_resources[day][slot] = {
                "availableCpu": sum([resource.cpu for resource in all_resources]),
                "availableMem": sum([resource.mem for resource in all_resources]),
                "availableGpu": sum([resource.gpu for resource in all_resources])
            }

    # Calculate remaining resources for each time slot
    for task in all_tasks:
        for slot in task.selectedSlots:
            try:
                taskDay, taskTime = slot.split("-")
            except ValueError:
                continue
            if taskDay in weekdays and taskTime in time_slots:
                remaining_resources[taskDay][taskTime]["availableCpu"] -= task.resource.get("cpu", 0) * task.resource.get("numberOfDevices", 0)
                remaining_resources[taskDay][taskTime]["availableMem"] -= task.resource.get("mem", 0) * task.resource.get("numberOfDevices", 0)
                remaining_resources[taskDay][taskTime]["availableGpu"] -= task.resource.get("gpu", 0) * task.resource.get("numberOfDevices", 0)

    # Convert the remaining resources to the specified format
    formatted_resources = []
    for day, slots in remaining_resources.items():
        day_detail = {"day": day, "detail": []}
        for slot, resources in slots.items():
            slot_detail = {
                "boot": time_slots[slot]["boot"],
                "off": time_slots[slot]["off"],
                "slots": slot,
                "availableCpu": resources["availableCpu"],
                "availableMem": resources["availableMem"],
                "availableGpu": resources["availableGpu"]
            }
            day_detail["detail"].append(slot_detail)
        formatted_resources.append(day_detail)

    return JSONResponse(content=formatted_resources)

@app.post("/class/comment")
async def add_comment(request: Request):
    data = await request.json()
    username = data.get('username', '')
    index = data.get('index', 0)
    portIndex = data.get('portIndex', 0)
    comment = data.get('comment', '')
    
    class_name = username
    if not class_name:
        raise HTTPException(status_code=400, detail="Class name is required")
    
    class_path = os.path.join(BASE_DIR, "class", class_name)
    if not os.path.exists(class_path):
        raise HTTPException(status_code=404, detail="Class not found")
    
    devices = []
    # get devices from devices.json
    devices_path = os.path.join(class_path, "device.json")
    if os.path.exists(devices_path):
        with open(devices_path, 'r', encoding='utf-8') as file:
            devices = json.load(file)
    
    if 'comment' not in devices[index]:
        # init a list with numberOfDevices length's comment
        devices[index]['comment'] = ['' for i in range(devices[index]['resource']['numberOfDevices'])]
    devices[index]['comment'][portIndex] = comment
    # write back to file
    with open(devices_path, 'w', encoding='utf-8') as file:
        json.dump(devices, file, ensure_ascii=False, indent=4)
        # if (data.success) {
    # return data.success
    return JSONResponse(content={"success": True})\
        
"""

Commit the class endpoint
    
"""

@app.post("/class/commit")
async def commit_class(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    username = data.get('username', '')
    taskID = data.get('taskID', 0)
    deviceID = data.get('deviceID', 0)
    commitALL = data.get('commitALL', False)
    class_name = username
    taskID = int(taskID)+1
    deviceID = int(deviceID)+1
    
    if not class_name:
        raise HTTPException(status_code=400, detail="Class name is required")
    
    class_path = os.path.join(BASE_DIR, "class", class_name)
    if not os.path.exists(class_path):
        raise HTTPException(status_code=404, detail="Class not found")
    
    devices = []
    # get devices from devices.json
    devices_path = os.path.join(class_path, "device.json")
    if os.path.exists(devices_path):
        with open(devices_path, 'r', encoding='utf-8') as file:
            devices = json.load(file)
    
    node = devices[taskID-1]['nodeList'][deviceID-1]    
    container_name = username + '-' + str(taskID) + '-' + str(deviceID)
    # docker commit the device to class_path/container_name.tar
    # invalid reference format: repository name must be lowercase
    repository_name = class_path.split('/')[-1].lower()
    if devices[taskID-1]['resource']['selectedImage'] != "windows":
        background_tasks.add_task(commit_and_save_container, node, container_name, repository_name, class_path)
    else:
        background_tasks.add_task(commit_and_save_vm, node, container_name, repository_name, class_path)
    # write back to file
    with open(devices_path, 'w', encoding='utf-8') as file:
        json.dump(devices, file, ensure_ascii=False, indent=4)

    return JSONResponse(content={"success": True})

def commit_and_save_vm(node, container_name, repository_name, class_path):
    try:
        # create a download status file
        with open(os.path.join(class_path, container_name + '_download_status.json'), 'w', encoding='utf-8') as file:
            # still commiting
            json.dump({"status": "commiting"}, file, ensure_ascii=False, indent=4)
        # Perform docker commit and save operations
        print(SSHConnection(node, f"vboxmanage controlvm {container_name} acpipowerbutton"))
        print(SSHConnection(node, f"vboxmanage snapshot {container_name} take {container_name}_snapshot"))
        print(SSHConnection(node, f"vboxmanage export {container_name} -o {class_path}/{container_name}.ova --options manifest"))
        # Update the download status file
        with open(os.path.join(class_path, container_name + '_download_status.json'), 'w', encoding='utf-8') as file:
            # commit success
            json.dump({"status": "success"}, file, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"An error occurred during commit and save: {str(e)}")
        raise

def commit_and_save_container(node, container_name, repository_name, class_path):
    try:
        # create a download status file
        with open(os.path.join(class_path, container_name + '_download_status.json'), 'w', encoding='utf-8') as file:
            # still commiting
            json.dump({"status": "commiting"}, file, ensure_ascii=False, indent=4)
        # Perform docker commit and save operations
        print(SSHConnection(node, f'docker commit {container_name} {repository_name}/{container_name}'))
        print(SSHConnection(node, f'docker save -o {class_path}/{container_name}.tar {repository_name}/{container_name}'))

        # Update the download status file
        with open(os.path.join(class_path, container_name + '_download_status.json'), 'w', encoding='utf-8') as file:
            # commit success
            json.dump({"status": "success"}, file, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"An error occurred during commit and save: {str(e)}")
        raise


# Endpoint to start devices
@app.post("/class/start")
async def start_class(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    username = data.get('username', '').strip()
    taskID = data.get('taskID')
    deviceID = data.get('deviceID')
    startALL = data.get('startALL', False)

    # Validate the class name
    if not username:
        raise HTTPException(status_code=400, detail="Class name is required")

    # Validate the class path
    class_path = os.path.join(BASE_DIR, "class", username)
    if not os.path.exists(class_path):
        raise HTTPException(status_code=404, detail="Class not found")

    # Load devices information
    devices_path = os.path.join(class_path, "device.json")
    if not os.path.exists(devices_path):
        raise HTTPException(status_code=404, detail="Devices file not found")
    with open(devices_path, 'r', encoding='utf-8') as file:
        devices = json.load(file)

    # Start all devices if requested
    if startALL:
        start_all_devices(devices, class_path, username)
    else:
        # Validate taskID and deviceID
        if taskID is None or deviceID is None:
            raise HTTPException(status_code=400, detail="Task ID and Device ID are required for specific start")
        taskID = int(taskID) + 1
        deviceID = int(deviceID) + 1

        # Validate task and device indices
        if taskID > len(devices) or deviceID > len(devices[taskID - 1]['nodeList']):
            raise HTTPException(status_code=400, detail="Invalid Task ID or Device ID")

        # Get the device node and container name
        node = devices[taskID - 1]['nodeList'][deviceID - 1]
        container_name = f"{username}-{taskID}-{deviceID}"

        # Start the device using the appropriate method
        if devices[taskID - 1]['resource']['selectedImage'] != "windows":
            SSHConnection(node, f'docker start {container_name}')
        else:
            print(SSHConnection(node, f"vboxmanage startvm {container_name} --type headless"))
            print(f"vboxmanage startvm {container_name} --type headless")

        # Update the status of the started device
        update_device_status(class_path, taskID, status_update='running_by_user', deviceID=deviceID)

    return JSONResponse(content={"success": True})

def start_all_devices(devices, class_path, username):
    # Iterate over all devices in the list
    for device_index, device in enumerate(devices):
        updated_status = []  # List to store the updated status of each device
        
        # Iterate over all nodes (containers or virtual machines) within the device
        for node_index, node in enumerate(device['nodeList']):
            # Generate a unique container name using username, device index, and node index
            container_name = f"{username}-{device_index + 1}-{node_index + 1}"
            
            # Start the service using SSH, depending on the type of image selected
            if device['resource']['selectedImage'] != "windows":
                # If the selected image is not Windows, start the Docker container
                SSHConnection(node, f'docker start {container_name}')
            else:
                # If the selected image is Windows, use VirtualBox to start the VM in headless mode
                SSHConnection(node, f"vboxmanage startvm {container_name} --type headless")
            
            # Append the updated status for the current node as 'running'
            updated_status.append('running_by_user')
        
        # Update the status file once after iterating all nodes in the current device
        update_device_status(class_path, device_index+1, updated_status)

    return True


# Endpoint to power off devices
@app.post("/class/poweroff")
async def poweroff_class(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    username = data.get('username', '').strip()
    taskID = data.get('taskID')
    deviceID = data.get('deviceID')
    poweroffALL = data.get('poweroffALL', False)

    # Validate the class name
    if not username:
        raise HTTPException(status_code=400, detail="Class name is required")

    # Validate the class path
    class_path = os.path.join(BASE_DIR, "class", username)
    if not os.path.exists(class_path):
        raise HTTPException(status_code=404, detail="Class not found")

    # Load devices information
    devices_path = os.path.join(class_path, "device.json")
    if not os.path.exists(devices_path):
        raise HTTPException(status_code=404, detail="Devices file not found")
    with open(devices_path, 'r', encoding='utf-8') as file:
        devices = json.load(file)

    # Power off all devices if requested
    if poweroffALL:
        stop_all_devices(devices, class_path, username)
    else:
        # Validate taskID and deviceID
        if taskID is None or deviceID is None:
            raise HTTPException(status_code=400, detail="Task ID and Device ID are required for specific power off")
        taskID = int(taskID) + 1
        deviceID = int(deviceID) + 1

        # Validate task and device indices
        if taskID > len(devices) or deviceID > len(devices[taskID - 1]['nodeList']):
            raise HTTPException(status_code=400, detail="Invalid Task ID or Device ID")

        # Get the device node and container name
        node = devices[taskID - 1]['nodeList'][deviceID - 1]
        container_name = f"{username}-{taskID}-{deviceID}"

        # Power off the device using the appropriate method
        if devices[taskID - 1]['resource']['selectedImage'] != "windows":
            background_tasks.add_task(SSHConnection, node, f'docker stop {container_name}')
        else:
            background_tasks.add_task(SSHConnection, node, f"vboxmanage controlvm {container_name} poweroff")

        # Update the status of the powered-off device
        update_device_status(class_path, taskID, status_update='stopped_by_user', deviceID=deviceID)

    return JSONResponse(content={"success": True})

# Function to stop all devices
def stop_all_devices(devices, class_path, username):
    # Iterate over all devices in the list
    for device_index, device in enumerate(devices):
        updated_status = []  # List to store the updated status of each device
        
        # Iterate over all nodes (containers or virtual machines) within the device
        for node_index, node in enumerate(device['nodeList']):
            # Generate a unique container name using username, device index, and node index
            container_name = f"{username}-{device_index + 1}-{node_index + 1}"
            
            # Stop the service using SSH, depending on the type of image selected
            if device['resource']['selectedImage'] != "windows":
                # If the selected image is not Windows, stop the Docker container
                SSHConnection(node, f'docker stop {container_name}')
            else:
                # If the selected image is Windows, use VirtualBox to power off the VM
                SSHConnection(node, f"vboxmanage controlvm {container_name} poweroff")
            
            # Append the updated status for the current node as 'stopped_by_user'
            updated_status.append('stopped_by_user')
        
        # Update the status file once after iterating all nodes in the current device
        update_device_status(class_path, device_index+1, updated_status)

    return True

    
@app.get("/get_all_schedule_tasks")
def get_all_schedule_tasks():
    taskModel = TaskModel()
    all_tasks = taskModel.get_all_schedule_tasks()
    for i in all_tasks:
        print(i)
    return all_tasks