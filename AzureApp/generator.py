import numpy as np
import cv2 as cv
import mediapipe as mp
import numpy as np
import time
from . import PoseModule as pm 
# Initialize MediaPipe Pose Detection
detector = pm.PoseDetector()
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils
ctime =0
ptime = time.time()
poses_names=["pranamasana","hastauttanasana","hastapadasana","right_ashwa_sanchalanasana","dandasana","ashtanga_namaskara","bhujangasana","adho_mukha_svanasana","ashwa_sanchalanasana"]
asana_to_joint=detector.map_asana_joints()
class PoseSimilarity():
    # Function to calculate Euclidean distance between two points
    def euclidean_distance(self, point1, point2):
        return np.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    # Function to normalize key points based on a reference point
    def normalize_landmarks(self, landmarks, reference_idx):
        ref_point = landmarks[reference_idx]
        normalized_landmarks = [(point[0] - ref_point[0], point[1] - ref_point[1]) for point in landmarks]
        return normalized_landmarks
    
    # Function to compare two sets of pose landmarks
    def compare_poses(self, landmarks1, landmarks2):
        total_distance = 0
        for i in range(len(landmarks1)):
            total_distance += self.euclidean_distance(landmarks1[i], landmarks2[i])
        avg_distance = total_distance / len(landmarks1)
        return avg_distance
    
    def get_wrong_joints(self, asana,correct_landmarks, input_landmarks, thresh):
        correct_landmark_dict = detector.map_landmarks(correct_landmarks)
        correct_joints_dict = detector.map_joints(correct_landmark_dict)
        correct_joints_dict=detector.get_joints_for_asana(asana,asana_to_joint,correct_joints_dict)

        input_landmark_dict = detector.map_landmarks(input_landmarks)
        input_joints_dict = detector.map_joints(input_landmark_dict)
        input_joints_dict=detector.get_joints_for_asana(asana,asana_to_joint,input_joints_dict)

        wrong_joints = {}
        for i in correct_joints_dict:
            correct_angle = detector.calculate_angle(correct_joints_dict[i])
            input_angle = detector.calculate_angle(input_joints_dict[i])
            diff = correct_angle - input_angle
            if(abs(diff)>thresh):
                if(diff>0):
                    wrong_joints[i] =  (diff, correct_angle, input_angle, "increase")
                else:
                    wrong_joints[i] = (diff, correct_angle, input_angle, "decrease")
        return wrong_joints

def resize_image(image, max_width=800, max_height=600):
    height, width = image.shape[:2]
    if width > max_width or height > max_height:
        scaling_factor = min(max_width / width, max_height / height)
        new_size = (int(width * scaling_factor), int(height * scaling_factor))
        return cv.resize(image, new_size)
    return image




if __name__ == "__main__":
    # Example usage
    pose_sim = PoseSimilarity()
    
