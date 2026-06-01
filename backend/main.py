from fastapi import FastAPI
import time
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import threading
import time


from config import (
    check_init_file,
    LOCAL_TEST,
)

def print_hello_world():
    while True:
        task_model = TaskModel()
        task_model.execute_task()
        print("Current time: ", time.ctime())
        time.sleep(5)

from admin.main import app as admin_app
from api.main import app as api_app
from lecture.main import app as lecture_app
from teacher.main import app as teacher_app
from scheduler.main import TaskModel


"""

Initialize the FastAPI application with a lifespan event handler.

"""
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    check_init_file()
    
    # The scheduler polls real classroom nodes over SSH/docker; skip it in local-test mode.
    if not LOCAL_TEST:
        thread = threading.Thread(target=print_hello_world)
        thread.daemon = True  # This ensures the thread will exit when the main program exits
        thread.start()
    else:
        print("LOCAL_TEST mode: scheduler thread disabled (no remote node polling)")
    
    # Yield control to the application
    yield
    print("Application is shutting down...")

app = FastAPI(lifespan=lifespan)

"""

Add CORS middleware to the FastAPI application.

"""

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.mount("/admin", admin_app)
app.mount("/api", api_app)
app.mount("/lecture", lecture_app)
app.mount("/teacher", teacher_app)