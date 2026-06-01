import os
import sys
import threading
import time
import json
import time
from datetime import datetime, timedelta
import docker
from config import (
    BASE_DIR,
    RESOURCE_DIR,
    NODE_LIST,
    BACKEND_HOST,
    SSHConnection,
)
import os, sys, time
import subprocess
import paramiko
from fastapi import BackgroundTasks

def read_data(file_path: str):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            # remove password field
            return json.load(file)
    return []

def nodeChecker():
    # ping all the node to check the connection is alive
    unalive_nodes = []
    for node in NODE_LIST:
        try:
            response = os.system("ping -c 1 " + node)
            if response != 0:
                unalive_nodes.append(node)
        except Exception as e:
            print(e)
            unalive_nodes.append(node)
    return unalive_nodes

def editStatusFile(courseName, task_id, device_id, new_status):
    # Path to the status file
    status_file = os.path.join(BASE_DIR, "class", courseName, str(task_id), "status.json")
    
    # Open the file to load the current status list
    with open(status_file, "r") as f:
        status_list = json.load(f)  # Use a different name for the loaded data to avoid overwriting
    
    # Update the status for the specific device
    status_list[device_id - 1] = new_status
    
    # Save the updated status list back to the file
    with open(status_file, "w") as f:
        json.dump(status_list, f)



"""

Define the resource model for each node to calcute the resource requirements

"""
class DeviceResource:
    def __init__(self, hostname="", ip="", cpu=0, mem=0, gpu=0):
        self.hostname = hostname
        self.ip = ip
        self.cpu = cpu
        self.mem = mem
        self.gpu = gpu
        
    def __str__(self):
        return f"Hostname: {self.hostname}, IP: {self.ip}, CPU: {self.cpu}, MEM: {self.mem}, GPU: {self.gpu}"
    
    def get_all_node_resources(self):
        # Read all resource.json files under all class folders
        all_resources = []
        # get all node resources from admin/resource.json\
        try:
            resource_data = self.read_data(RESOURCE_DIR)
            if resource_data:
                for resource in resource_data:
                    resource_model = DeviceResource.from_dict(resource)
                    all_resources.append(resource_model)
        except Exception as e:
            print(e)
        return all_resources
    def get_sum_node_resources(self):
        # Implement this method to get the sum of all node resources
        all_resources = self.get_all_node_resources()
        cpu_sum = 0
        mem_sum = 0
        gpu_sum = 0
        for resource in all_resources:
            cpu_sum += resource.cpu
            mem_sum += resource.mem
            gpu_sum += resource.gpu
        return cpu_sum, mem_sum, gpu_sum
    def get_specific_node_resources(self, hostname):
        # Implement this method to get the resource of a specific node
        all_resources = self.get_all_node_resources()
        for resource in all_resources:
            if resource.hostname == hostname:
                return resource
        return None
    def read_data(self, file_path): 
        # Implement this method to read the JSON data from a file
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            return data
        except Exception as e:
            pass
        
    @classmethod
    def from_dict(cls, data):
        hostname = data.get("hostname", "")
        ip = data.get("ip", "")
        cpu = data.get("cpu", 0)
        mem = data.get("mem", 0)
        gpu = data.get("gpu", 0)
        portList = data.get("portList", [])
        nodeList = data.get("nodeList", [])
        status = data.get("status", [])
        eachComment = data.get("eachComment", [])
        createTime = data.get("createTime", "")
        return cls(hostname=hostname, ip=ip, cpu=cpu, mem=mem, gpu=gpu)
    
    def print_all_node_resources(self):
        all_resources = self.get_all_node_resources()
        for resource in all_resources:
            print(f"Hostname: {resource.hostname}")
            print(f"IP: {resource.ip}")
            print(f"CPU: {resource.cpu}")
            print(f"MEM: {resource.mem}")
            print(f"GPU: {resource.gpu}")
            print("\n")

        

"""

Define the task model for each course to execute open and close tasks

"""
class TaskModel:
    def __init__(self, resource=None, selectedSlots=None, courseName="", id=None
                 , portList=[], nodeList=[], status=[], eachComment=[], taskTime=None):
        self.resource = resource if resource is not None else []
        self.selectedSlots = selectedSlots if selectedSlots is not None else []
        self.courseName = courseName
        # id according to the task number
        self.id = id if id is not None else 0
        self.portList = portList if portList is not None else []
        self.nodeList = nodeList if nodeList is not None else []
        self.status = status if status is not None else []
        self.eachComment = eachComment if eachComment is not None else []
        self.createTime = taskTime if taskTime is not None else datetime.now()
    def __str__(self):
        return f"Resource: {self.resource}, SelectedSlots: {self.selectedSlots}, CourseName: {self.courseName}, ID: {self.id}, PortList: {self.portList}, NodeList: {self.nodeList}, Status: {self.status}, EachComment: {self.eachComment}, CreateTime: {self.createTime}"
    
    
    def time_checker(self, task):
        weekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        # check the time is current time and print the message
        current_time = datetime.now().time()
        
        # parse the self.selectedSlots for each tasks' time
        for slot in task.selectedSlots:
            if slot == "now":
                return True
            try:
                taskDay, taskTime = slot.split("-")
            except Exception as e:
                continue
            if taskTime == "morning":
                taskTime = "06:00"
            if taskTime == "noon":
                taskTime = "12:00"
            elif taskTime == "afternoon":
                taskTime = "12:00"
            elif taskTime == "evening":
                taskTime = "18:00"
            elif taskTime == "night":
                taskTime = "18:00"
            elif taskTime == "midnight":
                taskTime = "00:00"
            
            task_time_obj = datetime.strptime(taskTime, "%H:%M").time()
            time_difference = datetime.combine(datetime.today(), current_time) - datetime.combine(datetime.today(), task_time_obj)
            
            # check if current time in range(+12 hours) is equal to task time
            if timedelta(0) <= time_difference <= timedelta(hours=6) and weekday[datetime.today().weekday()] == taskDay:
                return True
        return False
    
    @classmethod
    def from_dict(cls, data):
        resource = data.get("resource", {})
        selectedSlots = data.get("selectedSlots", [])
        courseName = resource.get("className", "")
        return cls(resource=resource, selectedSlots=selectedSlots, courseName=courseName)

    def get_all_tasks(self):
        # Read all device.json files under all class folders
        all_tasks = []
        for root, dirs, files in os.walk(os.path.join(BASE_DIR, "class")):
            for dir in dirs:
                device_file_path = os.path.join(BASE_DIR, "class", dir, "device.json")
                id = 1
                try:
                    device_data = self.read_data(device_file_path)
                    if device_data:
                        for task in device_data:
                            task_model = TaskModel.from_dict(task)
                            task_model.id = id
                            task_model.portList = task.get("portList", [])
                            task_model.nodeList = task.get("nodeList", [])
                            all_tasks.append(task_model)
                            id += 1
                except Exception as e:
                    pass
        # init all the tasks' status file
        for task in all_tasks:
            courseName = task.courseName
            task_id = task.id
            # task path
            task_path = os.path.join(BASE_DIR, "class", courseName, str(task_id))
            if not os.path.exists(task_path):
                os.makedirs(task_path)
            # status file
            task_status_file = os.path.join(BASE_DIR, "class", courseName, str(task_id), "status.json")
            if not os.path.exists(task_status_file):
                with open(task_status_file, "w") as f:
                    # a list length of the number of devices
                    status = ["stopped"] * task.resource.get("numberOfDevices", 0)
                    json.dump(status, f)
        
        return all_tasks

    def get_all_schedule_tasks(self):
        # get all class permissions from /mnt/root/admin/account.json
        class_data = self.read_data(os.path.join(BASE_DIR, "admin", "account.json"))
        # yield all the tasks
        schedule_class = []
        for class_item in class_data:
            # username and permissions
            username = class_item.get("username", "")
            permission = class_item.get("permission", "")
            if permission == 2:
                schedule_class.append(username)
        task_data = []
        # get all tasks from the class' folders
        for item in schedule_class:
            task_file_path = os.path.join(BASE_DIR, "class", item, "device.json")
            try:
                task_data = self.read_data(task_file_path)
                if task_data:
                    for task in task_data:
                        task_model = TaskModel.from_dict(task)
                        yield task_model
            except Exception as e:
                pass
        
        # construct the weekly schedule resource utilization from task_data
        # define the weekly schedule structure with 4 slots each day
        weekly_schedule = {
            "Monday": {
                "midnight": [],
                "morning": [],
                "noon": [],
                "night": []
            },
            "Tuesday": {
                "midnight": [],
                "morning": [],
                "noon": [],
                "night": []
            },
            "Wednesday": {
                "midnight": [],
                "morning": [],
                "noon": [],
                "night": []
            },
            "Thursday": {
                "midnight": [],
                "morning": [],
                "noon": [],
                "night": []
            },
            "Friday": {
                "midnight": [],
                "morning": [],
                "noon": [],
                "night": []
            },
            "Saturday": {
                "midnight": [],
                "morning": [],
                "noon": [],
                "night": []
            },
            "Sunday": {
                "midnight": [],
                "morning": [],
                "noon": [],
                "night": []
            }
        }
        for task in task_data:
            try:
                for slot in task.selectedSlots:
                    day, time = slot.split("-")
                    weekly_schedule[day][time].append(task)
            except Exception as e:
                pass
        print(weekly_schedule)
        return weekly_schedule

    def read_data(self, file_path):
        # Implement this method to read the JSON data from a file
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            return data
        except Exception as e:
            pass
    def collect_all_resources_from_selected_time_slot(self, day, time):
        # Implement this method to collect all resources from the selected time slot
        all_tasks = self.get_all_tasks()
        selected_tasks = []
        for task in all_tasks:
            for slot in task.selectedSlots:
                if slot == "now":
                    selected_tasks.append(task)
                    continue
                try:
                    taskDay, taskTime = slot.split("-")
                    if taskDay == day and taskTime == time:
                        selected_tasks.append(task)
                except Exception as e:
                    try:
                        taskDay, taskTime = slot.split(" ")
                        if taskDay == day and taskTime == time:
                            selected_tasks.append(task)
                    except Exception as e:
                        pass                        
        return selected_tasks
    
    def collect_all_node_with_port(self):
        all_tasks = self.get_all_tasks()
        all_nodes_with_port = []
        for task in all_tasks:
            for i in range(len(task.nodeList)):
                try:
                    if task.portList[i] == "":
                        continue
                    all_nodes_with_port.append({
                        "hostname": task.nodeList[i],
                        "port": task.portList[i]
                    })
                except Exception as e:
                    pass

        
        return all_nodes_with_port
            
    def get_all_tasks_in_specific_timeslot(self, day, time):
        # Implement this method to get all the tasks in a specific time slot
        all_tasks = self.get_all_tasks()
        selected_tasks = []
        for task in all_tasks:
            for slot in task.selectedSlots:
                if slot == "now":
                    selected_tasks.append(task)
                    continue
                try:
                    taskDay, taskTime = slot.split("-")
                    if taskDay == day and taskTime == time:
                        selected_tasks.append(task)
                except Exception as e:
                    pass
        return selected_tasks

    def execute_task(self):
        
        # nodeChecker
        unalive_nodes = nodeChecker()
        if unalive_nodes:
            print(f"Unalive nodes: {unalive_nodes}")
        else:
            print("All nodes are alive.")
        
        # Implement this method to execute the ta
        
        all_tasks = self.get_all_tasks()
        background_tasks = BackgroundTasks()
        
        # time checker
        for task in all_tasks:
            if self.time_checker(task):
                # start exec task
                selectedImage = task.resource.get("selectedImage", "")
                if task.resource.get("numberOfDevices", 0) <= 0:
                    print(f"No devices available for {task.courseName}")
                    continue
                
                # define the container variables
                cpu = task.resource.get("cpu", 0)
                mem = str(task.resource.get("mem", 0)) + "GB"
                gpu = task.resource.get("gpu", 0)
                numberOfDevices = task.resource.get("numberOfDevices", 0)
                courseName = task.courseName
                task_id = task.id
                portList = task.portList
                NodeList = task.nodeList
                
                if selectedImage != "windows":
                    # start the container
                    for i in range(1, numberOfDevices+1):
                        
                        # get status from the status file
                        status_file = os.path.join(BASE_DIR, "class", courseName, str(task_id), "status.json")
                        try:
                            with open(status_file, "r") as f:
                                status_list = json.load(f)
                                if status_list[i-1] == "stopped_by_user":
                                    print(f"Device {i} is stopped by user.")
                                    continue
                        except Exception as e:
                            # write the status file with number of devices
                            with open(status_file, "w") as f:
                                status_list = ["stopped"] * numberOfDevices
                                json.dump(status_list, f)
                            print(e)
                            pass
                        
                        container_name = f"{courseName}-{task_id}-{i}"
                        # create the container directory
                        CONTAINER_DIR = os.path.join(BASE_DIR, "class", courseName, str(task_id), str(i))
                        
                        if not os.path.exists(CONTAINER_DIR):
                            print(f"Creating directory {CONTAINER_DIR}")
                            os.makedirs(CONTAINER_DIR)

                        try:
                            stdout, stderr = SSHConnection(NodeList[i-1], f"docker inspect -f '{{{{.State.Status}}}}' {container_name}")
                            container_status = stdout.decode('utf-8').strip()
                            if container_status == "exited":
                                print(f"Starting existing stopped container {container_name} for {courseName}")
                                SSHConnection(NodeList[i-1], f"docker start {container_name}")
                                # edit the status file
                                editStatusFile(courseName, task_id, i, "running")
                                    
                            elif container_status == "running":
                                print(f"Container {container_name} is already running.")
                                editStatusFile(courseName, task_id, i, "running")
                            else:
                                print(f"Creating and starting new container {container_name} for {courseName}")
                                resource_limits = {
                                    'nano_cpus': int(cpu * 1e9),  # Convert CPU to nanoseconds
                                    'mem_limit': mem
                                }
                                # GPU configuration (if required)
                                device_requests = None
                                if gpu:
                                    device_requests = [
                                        docker.types.DeviceRequest(
                                            count=gpu,
                                            capabilities=[['gpu']]
                                        )
                                    ]
                                container = SSHConnection(NodeList[i-1], f"docker run -it -d -p {portList[i-1]}:3000 --name {container_name} -v {CONTAINER_DIR}:/config --cpus {cpu} --memory {mem} --gpus {gpu} {selectedImage}")
                                print(f"context: {container}")
                                # edit the status file
                                editStatusFile(courseName, task_id, i, "running")
                        except Exception as e:
                            print(e)
                                
                else:
                    # run windows virtual box
                    print(f"Starting Windows VM for {courseName}")
                    for i in range(1, numberOfDevices+1):
                        # check status file
                        status_file = os.path.join(BASE_DIR, "class", courseName, str(task_id), "status.json")
                        try:
                            with open(status_file, "r") as f:
                                status_list = json.load(f)
                                if status_list[i-1] == "stopped_by_user":
                                    print(f"Device {i} is stopped by user.")
                                    continue
                        except Exception as e:
                            # write the status file with number of devices
                            with open(status_file, "w") as f:
                                status_list = ["stopped"] * numberOfDevices
                                json.dump(status_list, f)
                            print(e)
                            pass
                    
                        
                        VM_NAME = f"{courseName}-{task_id}-{i}"
                        # check if the VM is running
                        node = NodeList[i-1]
                        # check the node is backend hostserver or not
                        cmd = f"VBoxManage showvminfo {VM_NAME}"
                        # check if vm exists
                        # connect to the node and check the VM
                        result, err = SSHConnection(node, cmd)
                        # without result
                        if not result:
                            create_and_start_vm(VM_NAME, cpu, mem, portList[i-1], node, courseName, task_id)
                        else:
                            # get it status
                            cmd = f"VBoxManage startvm {VM_NAME} --type headless"
                            try:
                                result, err = SSHConnection(node, cmd)
                            except Exception as e:
                                print(e)      
                            editStatusFile(courseName, task_id, i, "running")
            else:
                # try to stop all the devices
                selectedImage = task.resource.get("selectedImage", "")
                cpu = task.resource.get("cpu", 0)
                mem = str(task.resource.get("mem", 0)) + "GB"
                gpu = task.resource.get("gpu", 0)
                numberOfDevices = task.resource.get("numberOfDevices", 0)
                courseName = task.courseName
                task_id = task.id
                portList = task.portList
                NodeList = task.nodeList

                try:
                    if selectedImage != "windows":
                        for i in range(1, task.resource.get("numberOfDevices", 0) + 1):
                            
                            # get the container status
                            container_name = f"{task.courseName}-{task.id}-{i}"
                            stdout, stderr = SSHConnection(NodeList[i-1], f"docker inspect -f '{{{{.State.Running}}}}' {container_name}")
                            container_status = stdout.decode('utf-8').strip()
                            
                            # get status from the status file
                            status_file = os.path.join(BASE_DIR, "class", courseName, str(task_id), "status.json")
                            with open(status_file, "r") as f:
                                status_list = json.load(f)
                                if status_list[i-1] == "running_by_user":
                                    print(f"Device {i} is running by user.")
                                    continue
                            # check if container is running
                            if container_status == "true":
                                print(f"Stopping container: {container_name}")
                                # container.stop()
                                SSHConnection(NodeList[i-1], f"docker stop {container_name}")
                            elif container_status == "false":
                                print(f"Container {container_name} is not running.")
                            else:
                                print(f"Container {container_name} does not exist.")
                            # edit the status file
                            editStatusFile(courseName, task_id, i, "stopped")
                    else:
                        for i in range(1, task.resource.get("numberOfDevices", 0) + 1):
                            VM_NAME = f"{task.courseName}-{task.id}-{i}"
                            node = task.nodeList[i-1]
                            # check status file
                            status_file = os.path.join(BASE_DIR, "class", courseName, str(task_id), "status.json")
                            with open(status_file, "r") as f:
                                status_list = json.load(f)
                                if status_list[i-1] == "running_by_user":
                                    print(f"Device {i} is running by user.")
                                    continue
                            
                            # check the node is backend hostserver or not
                            cmd = f"VBoxManage controlvm {VM_NAME} poweroff"
                            try:
                                result, err = SSHConnection(node, cmd)
                                print(f"Stop VM {VM_NAME}")
                            except Exception as e:
                                print(e)
                            # edit the status file
                            editStatusFile(courseName, task_id, i, "stopped")
                            
                except Exception as e:
                    print(e)
                    pass

def create_and_start_vm(VM_NAME: str, cpu: int, mem: str, port: int, node: str, courseName: str, task_id: int):
    # Command to create the VM from an OVA template
    createVMCMd = f"VBoxManage import /root/win11_template.ova --vsys 0 --vmname {VM_NAME} --cpus {cpu} --memory {int(mem.split('GB')[0]) * 1024}"
    SSHConnection(node, createVMCMd)
    # Remove the old network rule if it exists
    networkcmd = f"VBoxManage modifyvm {VM_NAME} --natpf1 delete 'Rule 1'"
    SSHConnection(node, networkcmd)
    
    # Add a new port forwarding rule
    newPortcmd = f"VBoxManage modifyvm {VM_NAME} --natpf1 'Rule 1,tcp,,{port},,3389'"
    SSHConnection(node, newPortcmd)
        
    # Start the VM in headless mode
    stratVMcmd = f"VBoxManage startvm {VM_NAME} --type headless"
    SSHConnection(node, stratVMcmd)
    editStatusFile(courseName, task_id, task_id, "running")
    print(f"Start VM {VM_NAME}")