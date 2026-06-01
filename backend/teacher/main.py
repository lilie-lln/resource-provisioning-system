from fastapi import (
    FastAPI,
    HTTPException,
    status,
    Request,
    File,
    UploadFile,
    Form,
)
from scheduler.main import TaskModel, DeviceResource 
import json
import random
import datetime
import os
from fastapi.responses import JSONResponse
from typing import List, Optional
from pydantic import BaseModel
import hashlib
import docker
import socket
app = FastAPI()
from config import (
    docker_client,
    BASE_DIR,
    IMAGE_INFO_FILE,
    ACCOUNT_DATA_FILE,
    COURSE_DATA_FILE,
    APPLICATION_DATA_FILE,
    NODE_LIST, 
    weekdays,
)

"""

define function to read data from file

"""

def read_data(file_path: str):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            # remove password field
            try:
                return json.load(file)
            except:
                return []
    return []

def write_data(file_path: str, data):
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
    
        
def get_avaliable_nodes(task, selectedSlots):
    # get all resources in each node in each time slot
    avaliableNode = []
    numberOfDevices = task.numberOfDevices
    current_weekday = weekdays[datetime.datetime.now().weekday()]
    # selectedSlots check each time slot for the available nodes' resources
    for i in range(len(selectedSlots)):
        # i e.g. '2024-10-31 morning'
        date = selectedSlots[i].split(" ")[0]
        time = selectedSlots[i].split(" ")[1]
        # map date to weekday
        weekday = weekdays[datetime.datetime.strptime(date, "%Y-%m-%d").weekday()]
        # get all resources in each node in each time slot
        all_resources = TaskModel().collect_all_resources_from_selected_time_slot(weekday, time)
        # summarize the tasks' resource utilization in each time slot
        total_cpu = 0
        total_mem = 0
        total_gpu = 0
        data = {
            "ip": "",
            "availableDevices": 0
        }
        dataList = []
        avalibleDeviceCount = 0
        for resource in all_resources:
            total_cpu += resource.resource['cpu']
            total_mem += resource.resource['mem']
            total_gpu += resource.resource['gpu']
            # get all reousrces in each node
            cpu_sum, mem_sum, gpu_sum = DeviceResource().get_sum_node_resources()
            if cpu_sum >= task.cpu and mem_sum >= task.mem and gpu_sum >= task.gpu:
                avaliableNode.append(resource.node)
            else:
                return JSONResponse(content={"message": "No available nodes"})
            
            print("Pass the first check")
            if gpu != 0:
                if node.cpu / cpu >= numberOfDevices and node.mem / mem >= numberOfDevices and node.gpu / gpu >= numberOfDevices:
                    avalibleDeviceCount += min(node.cpu / cpu, node.mem / mem, node.gpu / gpu, numberOfDevices)
                    dataList.append({
                        "ip": node.ip,
                        "availableDevices": int(min(node.cpu / cpu, node.mem / mem, node.gpu / gpu, numberOfDevices))
                    })
                    if avalibleDeviceCount >= numberOfDevices:
                        break
            else:
                if node.cpu / cpu >= numberOfDevices and node.mem / mem >= numberOfDevices and gpu == 0:
                    avalibleDeviceCount += min(node.cpu / cpu, node.mem / mem, numberOfDevices)
                    dataList.append({
                        "ip": node.ip,
                        "availableDevices": int(min(node.cpu / cpu, node.mem / mem, numberOfDevices))
                    })
                    if avalibleDeviceCount >= numberOfDevices:
                        break
            print("Pass the second check")
        if avalibleDeviceCount < numberOfDevices:
            return JSONResponse(content={"message": "No available nodes"})
        else:
            for data in dataList:
                avaliableNode.append

    return avaliableNode
        
def find_random_available_port(node, port_range, previously_used_nodes, previously_used_ports):
    all_used_ports = TaskModel().collect_all_node_with_port()
    used_ports_dict = {}
    for entry in all_used_ports:
        hostname = entry['hostname']
        port = entry['port']
        if hostname not in used_ports_dict:
            used_ports_dict[hostname] = set()
        used_ports_dict[hostname].add(port)
        
    while True:
        port = random.choice(port_range)
        # Check if the port is in the used ports list for this node
        if port in used_ports_dict.get(node, set()):
            continue  # Skip this port since it's already in use
        # Also check if the port is in the previously used list
        for i in range(len(previously_used_nodes)):
            if node == previously_used_nodes[i] and port == previously_used_ports[i]:
                continue
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(1)
            result = sock.connect_ex((node, port))
            if result != 0:  # Port is not in use
                return port
            

"""

Device Resource model

"""

class DeviceResourceModel(BaseModel):
    className: str
    cpu: int
    mem: int
    gpu: Optional[int]
    numberOfDevices: int
    selectedImage: str

"""

Create a new device task endpoint

"""
@app.post("/unschedule")
async def create_unscheduled_task(request: Request):
    data = await request.json()
    # resource moadel define
    resource = DeviceResourceModel(**data.get("resourceRequirements"))
    selectedSlots = data.get("selectedSlots")
    print(resource, selectedSlots)
    
    # assgin node to device
    avaliableNode = get_avaliable_nodes(resource, selectedSlots)
    if isinstance(avaliableNode, JSONResponse):
        return avaliableNode
    
    # assign ports to the devices
    ports = []
    for node in avaliableNode:
        port = find_random_available_port(node, range(10000, 50000), ports, avaliableNode)
        ports.append(port)
    
    # read device.json file
    device_file_path = os.path.join(BASE_DIR, "class", resource.className, "device.json")
    device_data = read_data(device_file_path)
    # write data to device.json file
    data = {
        "resource": resource.dict(),
        "selectedSlots": selectedSlots,
        "nodeList": avaliableNode,
        "portList": ports
    }
    device_data.append(data)
    #write_data(device_file_path, device_data)
    return JSONResponse(content={"message": "Device task created successfully."})


"""

upload file endpoint

"""
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    permission: str = Form(...),
    className: str = Form(...)
):  
    # Ensure the directory structure exists
    upload_dir = os.path.join(BASE_DIR, "class", className, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # Define the file path where the file will be saved
    file_path = os.path.join(upload_dir, file.filename)

    # Save the uploaded file
    with open(file_path, "wb") as out_file:
        content = await file.read()  # Read the file content
        out_file.write(content)  # Write the content to the file

    # You can now use the 'permission' variable as needed
    print(f"File saved with permission: {permission}")
    # write data to image.json file
    image_data = read_data(IMAGE_INFO_FILE)
    # type var if filename postfix is iso is template  and other is image
    fileType = "template" if file.filename.endswith("iso") else "image"
    data = {
        "type": fileType,
        "uploader": className,
        "name": file.filename.split(".")[0],
        "permission": permission
    }
    image_data.append(data)
    write_data(IMAGE_INFO_FILE, image_data)

    # if file name end with .tar then load image to docker
    print("Convert file to docker image")
    if file.filename.endswith(".tar"):
        # Load image to docker 
        for node in NODE_LIST:
            client = docker_client(node)
            client.images.load(open(file_path, 'rb'))
    return JSONResponse(content={"message": "File uploaded successfully."})

"""

UPDATE teacher's username endpoint

"""
@app.patch("/profile/{username}")
async def update_teacher_username(username: str, request: Request):
    data = read_data(ACCOUNT_DATA_FILE)
    body = await request.json()
    userExists = False

    for i in range(len(data)):
        if data[i]['username'] == body.get('username'):
            raise HTTPException(status_code=400, detail="Username already exists")
    
    for i in range(len(data)):  
        print(data[i]['username'])
        if data[i]['username'] == username:
            print(body.get('username'))
            data[i]['username'] = body.get('username')
            userExists = True
            break
    if not userExists:
        raise HTTPException(status_code=404, detail="Teacher not found")
    write_data(ACCOUNT_DATA_FILE, data)

    # configure the course.json file
    course_data = read_data(COURSE_DATA_FILE)
    for i in range(len(course_data)):
        if course_data[i]['id'] == username:
            course_data[i]['id'] = body.get('username')
            break
    write_data(COURSE_DATA_FILE, course_data)
    
    #rename the task's resource's class name in device.json file
    device_file_path = os.path.join(BASE_DIR, "class", username, "device.json")
    if os.path.exists(device_file_path):
        device_data = read_data(device_file_path)
        for i in range(len(device_data)):
            device_data[i]['resource']['className'] = body.get('username')
        write_data(device_file_path, device_data)
    
    #rename image uploader name in image.json file
    image_data = read_data(IMAGE_INFO_FILE)
    for i in range(len(image_data)):
        if image_data[i]['uploader'] == username:
            image_data[i]['uploader'] = body.get('username')
    write_data(IMAGE_INFO_FILE, image_data)
    
    # rename folder name
    os.rename(os.path.join(BASE_DIR, "class", username), os.path.join(BASE_DIR, "class", body.get('username')))
    
    # rename all docker container name
    device_file_path = os.path.join(BASE_DIR, "class", body.get('username'), "device.json")
    if os.path.exists(device_file_path):
        device_data = read_data(device_file_path)
        for i in range(len(device_data)):
            for j in range(len(device_data[i]['nodeList'])):
                client = docker_client(device_data[i]['nodeList'][j])
                container_name = f"{username}-{i+1}-{j+1}"
                new_container_name = f"{body.get('username')}-{i+1}-{j+1}"
                # if container exists then rename it
                if container_name in [container.name for container in client.containers.list()]:
                    container = client.containers.get(container_name)
                    print(f"Rename container {container_name} to {new_container_name}")
                    container.rename(new_container_name)

                
    
    return HTTPException(status_code=200, detail="Teacher username updated successfully")

"""

UPDATE teacher's email endpoint

"""
@app.patch("/email/{username}")
async def update_lecturer_email(username: str, request: Request):
    data = read_data(ACCOUNT_DATA_FILE)
    lenCount = 0
    for i in range(len(data)):
        if (data[i]['username'] == username) == True:
            body = await request.json()
            data[i]['mail'] = body.get('mail')
            break
        lenCount += 1
    if lenCount == len(data):
        raise HTTPException(status_code=404, detail="Teacher not found")
    write_data(ACCOUNT_DATA_FILE, data)

    return  HTTPException(status_code=200, detail="Teacher Email updated successfully")

"""

UPDATE lecture's password endpoint

"""
@app.patch("/password/{username}")
async def update_lectuer_password(username: str, request: Request):
    data = read_data(ACCOUNT_DATA_FILE)
    userExists = False

    for i in range(len(data)):
        if data[i]['username'] == username:
            body = await request.json()
            # Fixed typo: 'passowrd' -> 'password'
            if data[i]['password'] == hashlib.sha256(body.get('password').encode('utf-8')).hexdigest():
                data[i]['password'] = hashlib.sha256(body.get('newpassword').encode('utf-8')).hexdigest()
                userExists = True
                break
            else:
                raise HTTPException(status_code=400, detail="舊密碼輸入錯誤")
    if not userExists:
        raise HTTPException(status_code=404, detail="Teacher not found")
    write_data(ACCOUNT_DATA_FILE, data)
    return {"detail": "Administrator password updated successfully"}
