from django.shortcuts import render,HttpResponse
from django.shortcuts import render, redirect
from django.http import JsonResponse, StreamingHttpResponse
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
import cv2 as cv
import time
import threading
from gtts import gTTS
import pygame
import io
from . import PoseModule as pm 
from . import pose_equal_check as pec 

detector = pm.PoseDetector()
poseEqualityDetector = pec.PoseSimilarity()
pygame.mixer.init()

pose_name = "hastapadasana"
last_check_time = time.time()
# Create your views here.
def index(request):
    return render(request,'index.html')

def about_view(request):
  return render(request, "about.html")

def contact_view(request):
  return render(request, "contact.html")

def service_view(request):
  return render(request, "service.html")

def signin_view(request):
  return render(request, "signin.html")

def signup_view(request):
  return render(request, "signup.html")

def userlog_view(request):
  return render(request, "userlog.html")

def yoga_try_view(request):
  return render(request, "yoga_try.html")

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/signin')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})


def yoga_try(request):
    return render(request, 'yoga_try.html')


def video_feed(request):
    global pose_name  # Use the global variable
    if request.method == 'POST':
        pose = request.POST.get('pose_name')
        if not pose:
            return redirect('yoga_try')  # Fallback if pose_name is missing
        pose_name = pose  # Update the global variable
        return render(request, 'video_feed.html', {'pose_name': pose_name})
    else:
        return redirect('yoga_try')

def generate_frames():
    global last_check_time, pose_name
    vid = cv.VideoCapture(0)

    while True:
        success, frame = vid.read()
        if not success:
            break

        frame = detector.findPose(frame)
        landmarks = detector.findPosition(frame)

        if landmarks:
            landmarks = poseEqualityDetector.normalize_landmarks(landmarks, reference_idx=0)
            current_time = time.time()

            if (current_time - last_check_time) > 5:
                last_check_time = current_time
                is_similar, correct_landmarks = poseEqualityDetector.isSimilar(pose_name, landmarks, 0.1)
                if is_similar:
                    wrong_joints = poseEqualityDetector.get_wrong_joints(pose_name, correct_landmarks, landmarks, 15)
                    if len(wrong_joints) == 0:
                        threading.Thread(target=text_to_speech, args=("You're doing it absolutely right.",)).start()
                    else:
                        for joint, change in wrong_joints.items():
                            threading.Thread(target=text_to_speech, args=(f"{change} angle at {joint}.",)).start()
                else:
                    threading.Thread(target=text_to_speech, args=("Please correct the posture.",)).start()

        _, buffer = cv.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    vid.release()

def video_feed_stream(request):
    print(pose_name)
    return StreamingHttpResponse(generate_frames(), content_type='multipart/x-mixed-replace; boundary=frame')

def text_to_speech(text):
    try:
        tts = gTTS(text=text, lang='en')
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        pygame.mixer.init()
        pygame.mixer.music.load(mp3_fp, 'mp3')
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
    except Exception as e:
        print(f"Error in text_to_speech: {e}")