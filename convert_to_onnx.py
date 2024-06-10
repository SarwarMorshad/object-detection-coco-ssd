import torch
from ultralytics import YOLO

print("Loading YOLOv8 model...")
model = YOLO('yolov8n.pt')  # Ensure you have the YOLOv8 model file in the same directory
print("Model loaded successfully.")

print("Exporting model to ONNX format...")
model.export(format='onnx')
print("Model exported successfully.")
