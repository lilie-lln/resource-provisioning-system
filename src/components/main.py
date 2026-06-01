from fastapi import FastAPI, HTTPException, File, Form, UploadFile, Request
import json
import os
import hashlib

from contextlib import asynccontextmanager

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

################################
import threading
import time

folder_path = "/mnt/my_folder"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        print(f"Folder created: {folder_path}")
    else:
        print(f"Folder already exists: {folder_path}")
    
    # Yield control to the application
    yield
    
    # Code to run on shutdown
    print("Application shutdown")

app = FastAPI(lifespan=lifespan)


def create_folders_periodically():
    while True:
        try:
            base_dir = '/mnt/root/class'
            courses = read_data(COURSE_DATA_FILE)

            for course in courses:
                dir_path = os.path.join(base_dir, course['id'])
                
                if not os.path.exists(dir_path):
                    os.makedirs(dir_path)
                    print(f"Created directory: {dir_path}")
                
                # Create info.json file in the newly created directory
                file_path = os.path.join(dir_path, 'device.json')
                info = {"course_id": course['id']}
                
                if not os.path.exists(file_path):
                    with open(file_path, 'w') as file:
                        json.dump(info, file, indent=4)
                    print(f"Created file: {file_path}")
                sub_dir1 = os.path.join(dir_path, 'template')
                sub_dir2 = os.path.join(dir_path, 'image')
                
                if not os.path.exists(sub_dir1):
                    os.makedirs(sub_dir1)
                    print(f"Created subdirectory: {sub_dir1}")
                
                if not os.path.exists(sub_dir2):
                    os.makedirs(sub_dir2)
                    print(f"Created subdirectory: {sub_dir2}")    

            print("Folders and files created or checked successfully.")
        except Exception as e:
            print(f"Error creating folders or files: {e}")
        
        time.sleep(600)

# @app.on_event("startup")
# async def startup_event():
#     threading.Thread(target=create_folders_periodically, daemon=True).start()

##########################################

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

DATA_FILE = '/mnt/root/admin/account.json'
APPLICATION_DATA_FILE = '/mnt/root/admin/application.json'
ADMINISTRATOR_DATA_FILE = '/mnt/root/admin/administrator/'
REGISTER_DATA_FILE = '/mnt/root/admin/application.json'
UPLOAD_DIRECTORY = '/mnt/root/admin/uploads/'
COURSE_DATA_FILE = '/mnt/root/admin/course.json'
IMAGE_INFO_FILE = '/mnt/root/admin/image.json'

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

def read_data(file_path: str):
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    return []

def write_data(file_path: str, data):
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

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

class Administrator(BaseModel):
    username: str
    mail: str
    password: str
    date: str
    permission: int 

@app.get("/api/applications", response_model=List[Application])
async def get_applications():
    return read_data(APPLICATION_DATA_FILE)

@app.get("/api/administrators", response_model=List[Administrator])
async def get_administrators():
    return read_data(ADMINISTRATOR_DATA_FILE)

@app.post("/api/administrators")
async def post_administrator(administrator: Administrator):
    hashed_password = hash_password(administrator.password)
    
    permission = administrator.permission if administrator.permission is not None else 1
    
    administrator_data = read_data(ADMINISTRATOR_DATA_FILE)
    new_administrator = {
        "username": administrator.username,
        "mail": administrator.mail,
        "password": hashed_password,
        "date": administrator.date,
        "permission": permission 
    }
    
    administrator_data.append(new_administrator)
    write_data(ADMINISTRATOR_DATA_FILE, administrator_data)
    
    return new_administrator

@app.put("/api/revise")
async def update_administrator(administrator: Administrator):
    hashed_password = hash_password(administrator.password) if administrator.password else None
    administrators = read_data(ADMINISTRATOR_DATA_FILE)
    
    for admin in administrators:
        if admin['username'] == administrator.username:
            if administrator.mail is not None:
                admin['mail'] = administrator.mail
            if hashed_password:
                admin['password'] = hashed_password
            break
    else:
        raise HTTPException(status_code=404, detail="Administrator not found")
    
    write_data(ADMINISTRATOR_DATA_FILE, administrators)
    return {"message": "Administrator updated successfully"}

@app.post("/api/application")
async def register_user(
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

    register_data = read_data(REGISTER_DATA_FILE)
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
    write_data(REGISTER_DATA_FILE, register_data)

    return {"message": "Registration successful"}

@app.post("/api/login")
async def login_user(user: User):
    username = user.username
    password = user.password

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    
    users = read_data(DATA_FILE)
    administrators = read_data(ADMINISTRATOR_DATA_FILE)
    all_users = users + administrators

    hashed_password = hash_password(password)
    stored_user = next((u for u in all_users if u.get('username') == username and u.get('password') == hashed_password), None)
    
    if stored_user is None:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    mail = stored_user.get('mail', '')
    permission = stored_user.get('permission', 0)
    
    return {"message": "Login successful", "permission": permission, "mail": mail}

@app.get("/api/images")
async def get_image_info():
    with open(IMAGE_INFO_FILE, 'r', encoding='utf-8') as file:
        return json.load(file)

@app.get("/api/courses", response_model=List[dict])
async def get_courses():
    """Retrieve all courses from course.json."""
    return read_data(COURSE_DATA_FILE)

@app.post("/api/update-application")
async def update_application(request: Request):
    body = await request.json()
    id = body.get('id')  
    applyname = body.get('applyname')
    contact = body.get('contact')
    mail = body.get('mail')
    status = body.get('status')
    results = body.get('results')
    date = body.get('date')
    course_id = body.get('courseId')
    file_path = body.get('file_path')   

    if not id or not status or not results or not date:
        raise HTTPException(status_code=400, detail="Missing required fields")

    applications = read_data(APPLICATION_DATA_FILE)
    for app in applications:
        if app['id'] == id:
            app['status'] = status
            app['results'] = results
            if file_path: 
                app['file_path'] = file_path
            break
    else:
        raise HTTPException(status_code=404, detail="Application not found")

    write_data(APPLICATION_DATA_FILE, applications)

    if status == '已審核' and course_id:
        courses = read_data(COURSE_DATA_FILE)
        new_course = {
            "id": course_id,
            "name": applyname
        }
        if not any(course['id'] == course_id for course in courses):
            courses.append(new_course)
            write_data(COURSE_DATA_FILE, courses)
            print(f"Added new course: {new_course}")
        else:
            print(f"Course with ID {course_id} already exists")

    return {"message": "Application updated successfully"}


def hash_password(password: str) -> str:
    """Create a SHA-256 hash of the password."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

@app.delete("/api/administrators/{username}")
async def delete_administrator(username: str):
    administrators = read_data(ADMINISTRATOR_DATA_FILE)

    # 寻找要删除的管理员
    for admin in administrators:
        if admin['username'] == username:
            administrators.remove(admin)  # 删除管理员
            write_data(ADMINISTRATOR_DATA_FILE, administrators)  # 更新文件
            return {"message": "Administrator deleted successfully"}

    # 如果没有找到，抛出404异常
    raise HTTPException(status_code=404, detail="Administrator not found")
