from fastapi import (
    FastAPI,
    HTTPException,
    status,
    Request,
)
from typing import List, Optional
import json
import os
import hashlib
import time
from pydantic import BaseModel

app = FastAPI()

from config import (
    ADMINISTRATOR_DATA_FILE,
    APPLICATION_DATA_FILE,
    COURSE_DATA_FILE,
    ACCOUNT_DATA_FILE,
    BASE_DIR,
    ADMINISTRATOR_DIR,
)

"""

define add course folder 

"""

courseStructure = {
    "device.json": {},
    "template": {},
    "image": {},
    "uploads": {},
}
    


"""

Define the Administrator model

"""

class Administrator(BaseModel):
    username: str
    mail: str
    password: Optional[str] = None 
    date: str
    permission: int 

class Account(BaseModel):
    username: str
    mail: str
    password: str
    date: str
    permission: int

DIRECTORY_PATH = ADMINISTRATOR_DIR
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

"""

Endpoint to create a new administrator

"""

# @app.post("/")
# async def create_administrator(administrator: Administrator):
#     hashed_password = hashlib.sha256(administrator.password.encode('utf-8')).hexdigest()
#     permission = administrator.permission if administrator.permission is not None else 1
    
#     administrator_data = read_data(ADMINISTRATOR_DATA_FILE)
#     new_administrator = {
#         "username": administrator.username,
#         "mail": administrator.mail,
#         "password": hashed_password,
#         "date": administrator.date,
#         "permission": permission 
#     }
    
#     # append new administrator to the list and write to file
#     administrator_data.append(new_administrator)
#     write_data(ADMINISTRATOR_DATA_FILE, administrator_data)
    
#     # json response status code 201
#     return {"message": "Administrator created successfully"}
#################
@app.post("/")
async def create_administrator(administrator: Administrator):
    hashed_password = hashlib.sha256(administrator.password.encode('utf-8')).hexdigest()
    permission = administrator.permission if administrator.permission is not None else 1

    # 將管理員數據轉換為字典格式
    new_administrator = {
        "username": administrator.username,
        "mail": administrator.mail,
        "password": hashed_password,
        "date": administrator.date,
        "permission": permission 
    }

    # 構建管理員文件路徑
    admin_file_path = os.path.join(DIRECTORY_PATH, f"{administrator.username}.json")
    
    # 檢查該管理員文件是否已存在
    if os.path.exists(admin_file_path):
        raise HTTPException(status_code=400, detail="Administrator already exists")
    
    # 將新的管理員數據寫入對應的 .json 文件
    with open(admin_file_path, 'w', encoding='utf-8') as file:
        json.dump([new_administrator], file, ensure_ascii=False, indent=4)
    
    return {"message": f"Administrator {administrator.username} created successfully."}


"""

GET all administrators endpoint

"""
# @app.get("/", response_model=List[Administrator])
# async def get_administrators():
#     data = read_data(ADMINISTRATOR_DATA_FILE)
#     # remove password field

#     return data

@app.get("/", response_model=List[Administrator])
async def get_administrators():
    administrator_data = []
    if not os.path.exists(DIRECTORY_PATH):
        raise HTTPException(status_code=404, detail=f"Directory not found: {DIRECTORY_PATH}")
    
    # 列出目录下所有的 .json 文件
    for filename in os.listdir(DIRECTORY_PATH):
        if filename.endswith(".json"):
            file_path = os.path.join(DIRECTORY_PATH, filename)
            
            # 读取每个 .json 文件的数据
            with open(file_path, 'r', encoding='utf-8') as file:
                try:
                    data = json.load(file)
                    
                    # 如果 JSON 文件是一个列表，提取每个管理员
                    if isinstance(data, list):
                        for admin in data:
                            # 可以选择移除密码字段
                            if 'password' in admin:
                                del admin['password']
                            administrator_data.append(admin)
                except json.JSONDecodeError:
                    print(f"Error decoding JSON from file: {file_path}")
    
    return administrator_data

"""

UPDATE administrator's username endpoint

"""
# @app.patch("/profile/{username}")
# async def update_administrator_username(username: str, request: Request):
#     data = read_data(ADMINISTRATOR_DATA_FILE)
#     body = await request.json()
#     userExists = False
#     for i in range(len(data)):
#         if data[i]['username'] == body.get('username'):
#             raise HTTPException(status_code=400, detail="Username already exists")
#     for i in range(len(data)):
        
#         print(data[i]['username'])
#         if data[i]['username'] == username:
#             print(body.get('username'))
#             data[i]['username'] = body.get('username')
#             userExists = True
#             break
#     if not userExists:
#         raise HTTPException(status_code=404, detail="Administrator not found")
#     write_data(ADMINISTRATOR_DATA_FILE, data)
#     return HTTPException(status_code=200, detail="Administrator Username updated successfully")

# """

# UPDATE administrator's email endpoint

# """
# @app.patch("/email/{username}")
# async def update_administrator_email(username: str, request: Request):
#     data = read_data(ADMINISTRATOR_DATA_FILE)
#     for i in range(len(data)):
#         if data[i]['username'] == username:
#             body = await request.json()
#             data[i]['mail'] = body.get('mail')
#             break
#         return HTTPException(status_code=404, detail="Administrator not found")
#     write_data(ADMINISTRATOR_DATA_FILE, data)
#     return  HTTPException(status_code=200, detail="Administrator Email updated successfully")

# """

# UPDATE administrator's password endpoint

# """
# @app.patch("/password/{username}")
# async def update_administrator_password(username: str, request: Request):
#     data = read_data(ADMINISTRATOR_DATA_FILE)
#     userExists = False

#     for i in range(len(data)):
#         if data[i]['username'] == username:
#             body = await request.json()
#             # Fixed typo: 'passowrd' -> 'password'
#             if data[i]['password'] == hashlib.sha256(body.get('password').encode('utf-8')).hexdigest():
#                 data[i]['password'] = hashlib.sha256(body.get('newpassword').encode('utf-8')).hexdigest()
#                 userExists = True
#                 break
#             else:
#                 raise HTTPException(status_code=400, detail="舊密碼輸入錯誤")
    
#     if not userExists:
#         raise HTTPException(status_code=404, detail="Administrator not found")
    
#     write_data(ADMINISTRATOR_DATA_FILE, data)
#     return {"detail": "Administrator password updated successfully"}
DIRECTORY_PATH = ADMINISTRATOR_DIR

@app.patch("/profile/{username}")
async def update_administrator_username(username: str, request: Request):
    # 遍历 administrator 目录，找到匹配的管理员文件
    body = await request.json()
    new_username = body.get('username')
    if not new_username:
        raise HTTPException(status_code=400, detail="New username is required")

    # 检查是否存在相同的新用户名
    for filename in os.listdir(DIRECTORY_PATH):
        if filename.endswith(".json"):
            file_path = os.path.join(DIRECTORY_PATH, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                if data[0]['username'] == new_username:
                    raise HTTPException(status_code=400, detail="Username already exists")
    
    userExists = False
    # 更新用户名
    for filename in os.listdir(DIRECTORY_PATH):
        if filename.endswith(".json"):
            file_path = os.path.join(DIRECTORY_PATH, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                if data[0]['username'] == username:
                    data[0]['username'] = new_username
                    userExists = True
                    # 更新文件
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=4)
                    break

    if not userExists:
        raise HTTPException(status_code=404, detail="Administrator not found")

    return {"message": "Administrator Username updated successfully"}

# 更新管理员邮箱
@app.patch("/email/{username}")
async def update_administrator_email(username: str, request: Request):
    body = await request.json()
    new_email = body.get('mail')
    if not new_email:
        raise HTTPException(status_code=400, detail="New email is required")

    userExists = False
    # 遍历 administrator 目录
    for filename in os.listdir(DIRECTORY_PATH):
        if filename.endswith(".json"):
            file_path = os.path.join(DIRECTORY_PATH, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                if data[0]['username'] == username:
                    data[0]['mail'] = new_email
                    userExists = True
                    # 更新文件
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=4)
                    break
    
    if not userExists:
        raise HTTPException(status_code=404, detail="Administrator not found")
    
    return {"message": "Administrator Email updated successfully"}

# 更新管理员密码
@app.patch("/password/{username}")
async def update_administrator_password(username: str, request: Request):
    body = await request.json()
    old_password = body.get('password')
    new_password = body.get('newpassword')
    
    if not old_password or not new_password:
        raise HTTPException(status_code=400, detail="Old password and new password are required")

    userExists = False
    # 遍历 administrator 目录
    for filename in os.listdir(DIRECTORY_PATH):
        if filename.endswith(".json"):
            file_path = os.path.join(DIRECTORY_PATH, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
                if data[0]['username'] == username:
                    hashed_old_password = hashlib.sha256(old_password.encode('utf-8')).hexdigest()
                    if data[0]['password'] == hashed_old_password:
                        data[0]['password'] = hashlib.sha256(new_password.encode('utf-8')).hexdigest()
                        userExists = True
                        # 更新文件
                        with open(file_path, 'w', encoding='utf-8') as f:
                            json.dump(data, f, ensure_ascii=False, indent=4)
                    else:
                        raise HTTPException(status_code=400, detail="舊密碼輸入錯誤")
                    break

    if not userExists:
        raise HTTPException(status_code=404, detail="Administrator not found")

    return {"message": "Administrator password updated successfully"}


@app.post("/update-application")
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
    course_type = body.get('courseType')  # 接收前端传来的课程类型
    file_path = body.get('file_path') 

    # check if required fields are present
    if not id or not status or not results or not date:
        raise HTTPException(status_code=400, detail="Missing required fields")

    if status == '已審核' and course_id and course_type:  # 确保course_type已接收
        accounts = read_data(ACCOUNT_DATA_FILE)
        courses = read_data(COURSE_DATA_FILE)

        # 根据课程类型设置权限
        if course_type == '學期課程':
            permission = 2  
        elif course_type == '非學期課程':
            permission = 3 
        else:
            raise HTTPException(status_code=400, detail="Invalid course type")

        # add new course and account into the list
        new_course = {
            "id": course_id,
            "name": applyname
        }
        print(f"Added new course: {new_course}")
        new_account = {
            "username": course_id,
            "mail": mail,
            "password": hashlib.sha256(course_id.encode('utf-8')).hexdigest(),
            "date": date,
            "permission": permission  
        }
        print(f"Added new account: {new_account}")

        # validate course_id and course_username     
        if not any(course['id'] == course_id for course in courses):
            courses.append(new_course)
            write_data(COURSE_DATA_FILE, courses)
            print(f"Added new course: {new_course}")
        else:
            raise HTTPException(status_code=400, detail="Course already exists")
        if not any(account['username'] == course_id for account in accounts):
            accounts.append(new_account)
            write_data(ACCOUNT_DATA_FILE, accounts)
            print(f"Added new account: {new_account}")
        else:
            raise HTTPException(status_code=400, detail="Course account already exists")
        print(f"create course: {new_course}")

    # update application status and results
    applications = read_data(APPLICATION_DATA_FILE)
    appFlage = False
    for app in applications:
        if app['id'] == id:
            app['status'] = status
            app['results'] = results
            if file_path: 
                app['file_path'] = file_path
            appFlage = True
            break
    if not appFlage:
        raise HTTPException(status_code=404, detail="Application not found")
    write_data(APPLICATION_DATA_FILE, applications)

    # create course folder 
    try:
        if status == '已審核' and course_id:
            course_path = os.path.join(BASE_DIR, 'class', course_id)
            if not os.path.exists(course_path):
                os.makedirs(course_path)
                print(f"Created course folder: {course_path}")
                for folder, subfolders in courseStructure.items():
                    folder_path = os.path.join(course_path, folder)
                    is_file = folder.endswith(".json")
                    if not is_file:
                        os.makedirs(folder_path)
                        print(f"Created course folder: {folder_path}")
                    else:
                        with open(folder_path, 'w') as f:
                            f.write("")
    except Exception as e:
        print(f"Failed to create course folder: {e}")

    return HTTPException(status_code=200, detail="Application updated successfully")

# @app.delete("/administrators/{username}")
# async def delete_administrator(username: str):
#     administrators = read_data(ADMINISTRATOR_DATA_FILE)
    
#     for admin in administrators:
#         if admin['username'] == username:
#             administrators.remove(admin)
#             write_data(ADMINISTRATOR_DATA_FILE, administrators)
#             return {"message": "Administrator deleted successfully"}
    
#     raise HTTPException(status_code=404, detail="Administrator not found")
##########
@app.delete("/administrators/{username}")
async def delete_administrator(username: str):
    # 構建管理員文件的路徑
    admin_file_path = os.path.join(DIRECTORY_PATH, f"{username}.json")
    
    # 檢查該管理員的 .json 文件是否存在
    if os.path.exists(admin_file_path):
        # 刪除該 .json 文件
        os.remove(admin_file_path)
        return {"message": f"Administrator {username} deleted successfully"}
    
    # 如果文件不存在，返回404錯誤
    raise HTTPException(status_code=404, detail=f"Administrator {username} not found")
